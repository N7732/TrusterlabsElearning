from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.db import transaction

# pyrefly: ignore [missing-import]
from .models import (
    Training,
    TrainingCourses,
    TrainingParticipants,
    TrainingClasswork,
    TrainingClassworkSubmission,
    TrainingFinalExam,
    TrainingFinalExamSubmission,
    CustomTrainingRequest
)
# pyrefly: ignore [missing-import]
from .serializers import (
    TrainingSerializer,
    TrainingParticipantsSerializer,
    TrainingClassworkSerializer,
    TrainingClassworkSubmissionSerializer,
    TrainingFinalExamSerializer,
    TrainingFinalExamSubmissionSerializer,
    CustomTrainingRequestSerializer
)

class TrainingViewSet(viewsets.ModelViewSet):
    queryset = Training.objects.all().prefetch_related('courses', 'participants', 'classworks', 'final_exams')
    serializer_class = TrainingSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = Training.objects.all().prefetch_related('courses', 'participants', 'classworks', 'final_exams')
        
        if user.is_authenticated and user.user_type == 'instructor' and self.request.query_params.get('my_trainings') == 'true':
            return queryset.filter(instructor=user.instructor_profile)
            
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if user.user_type == 'instructor':
            serializer.save(instructor=user.instructor_profile)
        else:
            serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        if user.user_type == 'instructor':
            training = self.get_object()
            if training.instructor != user.instructor_profile:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You cannot update another instructor's training.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if user.user_type == 'instructor':
            if instance.instructor != user.instructor_profile:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You cannot delete another instructor's training.")
        instance.delete()

    @action(detail=True, methods=['post'], url_path='apply')
    @transaction.atomic
    def apply(self, request, pk=None):
        training = self.get_object()
        user = request.user
        
        from datetime import date
        today = date.today()
        
        if training.application_open_date and today < training.application_open_date:
            return Response({'detail': 'Applications for this training are not open yet.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if training.application_close_date and today > training.application_close_date:
            return Response({'detail': 'Applications for this training have closed.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already applied
        if TrainingParticipants.objects.filter(training=training, participant=user).exists():
            return Response({'detail': 'You have already applied for this training.'}, status=status.HTTP_400_BAD_REQUEST)
        
        full_name = request.data.get('application_full_name', '')
        phone = request.data.get('application_phone_number', '')
        email = request.data.get('application_email', '')
        
        # Create application within an atomic transaction
        participant = TrainingParticipants.objects.create(
            training=training,
            participant=user,
            application_full_name=full_name,
            application_phone_number=phone,
            application_email=email,
            admission_status='PENDING'
        )
        
        serializer = TrainingParticipantsSerializer(participant)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='add-course')
    @transaction.atomic
    def add_course(self, request, pk=None):
        training = self.get_object()
        course_id = request.data.get('course_id')
        if not course_id:
            return Response({'detail': 'course_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already added
        if TrainingCourses.objects.filter(training=training, course_id=course_id).exists():
            return Response({'detail': 'Course is already in this training.'}, status=status.HTTP_400_BAD_REQUEST)
        
        TrainingCourses.objects.create(training=training, course_id=course_id)
        # Reload training to get updated nested serializer
        training = self.get_object()
        serializer = self.get_serializer(training)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='remove-course')
    @transaction.atomic
    def remove_course(self, request, pk=None):
        training = self.get_object()
        course_id = request.data.get('course_id')
        if not course_id:
            return Response({'detail': 'course_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        deleted, _ = TrainingCourses.objects.filter(training=training, course_id=course_id).delete()
        if deleted == 0:
            return Response({'detail': 'Course not found in this training.'}, status=status.HTTP_404_NOT_FOUND)
            
        training = self.get_object()
        serializer = self.get_serializer(training)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='manage-participants')
    @transaction.atomic
    def manage_participants(self, request, pk=None):
        training = self.get_object()
        participant_ids = request.data.get('participant_ids', [])
        action_type = request.data.get('action') # 'ADMIT', 'REJECT', 'REMOVE'
        
        if not participant_ids or not action_type:
            return Response({'detail': 'participant_ids and action are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        participants = TrainingParticipants.objects.filter(training=training, id__in=participant_ids)
        
        if action_type == 'ADMIT':
            participants.update(admission_status='ADMITTED')
        elif action_type == 'REJECT':
            participants.update(admission_status='REJECTED')
        elif action_type == 'REMOVE':
            participants.delete()
        else:
            return Response({'detail': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({'detail': 'Participants updated successfully.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='grades')
    def grades(self, request, pk=None):
        if not request.user.is_staff and request.user.user_type not in ['admin', 'instructor']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to view training grades.")
            
        training = self.get_object()
        classworks = training.classworks.all()
        exams = training.final_exams.all()
        participants = training.participants.filter(admission_status='ADMITTED')
        
        from Course.models import QuizSubmission
        
        participant_data = []
        for p in participants:
            user = p.participant
            cw_scores = {}
            for cw in classworks:
                sub = cw.submissions.filter(participant=user).first()
                if sub and sub.score is not None:
                    cw_scores[cw.id] = float(sub.score)
                elif cw.linked_quiz and hasattr(user, 'learner_profile'):
                    quiz_sub = QuizSubmission.objects.filter(learner=user.learner_profile, quiz=cw.linked_quiz).first()
                    if quiz_sub:
                        cw_scores[cw.id] = quiz_sub.score
                else:
                    cw_scores[cw.id] = None
                    
            ex_scores = {}
            for ex in exams:
                sub = ex.submissions.filter(participant=user).first()
                if sub and sub.score is not None:
                    ex_scores[ex.id] = float(sub.score)
                elif ex.linked_exam and hasattr(user, 'learner_profile'):
                    quiz_sub = QuizSubmission.objects.filter(learner=user.learner_profile, quiz=ex.linked_exam).first()
                    if quiz_sub:
                        ex_scores[ex.id] = quiz_sub.score
                else:
                    ex_scores[ex.id] = None
                    
            all_scores = [s for s in list(cw_scores.values()) + list(ex_scores.values()) if s is not None]
            avg_score = sum(all_scores) / len(all_scores) if all_scores else None
            
            participant_data.append({
                'id': p.id,
                'user_id': user.id,
                'name': p.application_full_name or user.get_full_name(),
                'email': p.application_email or user.email,
                'classwork_scores': cw_scores,
                'exam_scores': ex_scores,
                'average': avg_score
            })
            
        # Overall Analysis
        all_averages = [p['average'] for p in participant_data if p['average'] is not None]
        analysis = {
            'average': round(sum(all_averages) / len(all_averages), 2) if all_averages else 0,
            'highest': round(max(all_averages), 2) if all_averages else 0,
            'lowest': round(min(all_averages), 2) if all_averages else 0,
            'graded_participants': len(all_averages),
            'total_participants': len(participant_data)
        }
        
        return Response({
            'classworks': [{'id': cw.id, 'title': cw.title} for cw in classworks],
            'exams': [{'id': ex.id, 'title': ex.title} for ex in exams],
            'participants': participant_data,
            'analysis': analysis
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='my-trainings')
    def my_trainings(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Get trainings where user is a participant
        trainings = Training.objects.filter(participants__participant=user).distinct()
        serializer = self.get_serializer(trainings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TrainingClassworkViewSet(viewsets.ModelViewSet):
    queryset = TrainingClasswork.objects.all()
    serializer_class = TrainingClassworkSerializer
    
    def get_permissions(self):
        if self.request.method in ['GET']:
            return [IsAuthenticated()]
        return [IsAdminUser()]

    @action(detail=True, methods=['post'], url_path='submit')
    @transaction.atomic
    def submit_classwork(self, request, pk=None):
        classwork = self.get_object()
        user = request.user
        
        # Verify the user is admitted to the training
        if not TrainingParticipants.objects.filter(training=classwork.training, participant=user, admission_status='ADMITTED').exists():
            return Response({'detail': 'You must be admitted to this training to submit classwork.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if already submitted
        if TrainingClassworkSubmission.objects.filter(classwork=classwork, participant=user).exists():
            return Response({'detail': 'You have already submitted this classwork.'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure file is provided
        submission_file = request.FILES.get('submission_file')
        if not submission_file:
            return Response({'detail': 'Submission file is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        submission = TrainingClassworkSubmission.objects.create(
            classwork=classwork,
            participant=user,
            submission_file=submission_file
        )
        
        serializer = TrainingClassworkSubmissionSerializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'], url_path='submissions')
    @transaction.atomic
    def manage_submissions(self, request, pk=None):
        classwork = self.get_object()
        
        if request.method == 'GET':
            submissions = TrainingClassworkSubmission.objects.filter(classwork=classwork)
            serializer = TrainingClassworkSubmissionSerializer(submissions, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        elif request.method == 'POST':
            # This is for grading
            submission_id = request.data.get('submission_id')
            score = request.data.get('score')
            
            if not submission_id or score is None:
                return Response({'detail': 'submission_id and score are required.'}, status=status.HTTP_400_BAD_REQUEST)
                
            try:
                submission = TrainingClassworkSubmission.objects.get(id=submission_id, classwork=classwork)
                submission.score = score
                submission.save()
                serializer = TrainingClassworkSubmissionSerializer(submission)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except TrainingClassworkSubmission.DoesNotExist:
                return Response({'detail': 'Submission not found.'}, status=status.HTTP_404_NOT_FOUND)

class TrainingFinalExamViewSet(viewsets.ModelViewSet):
    queryset = TrainingFinalExam.objects.all()
    serializer_class = TrainingFinalExamSerializer
    
    def get_permissions(self):
        if self.request.method in ['GET']:
            return [IsAuthenticated()]
        return [IsAdminUser()]

    @action(detail=True, methods=['post'], url_path='submit')
    @transaction.atomic
    def submit_exam(self, request, pk=None):
        exam = self.get_object()
        user = request.user
        
        # Verify the user is admitted to the training
        if not TrainingParticipants.objects.filter(training=exam.training, participant=user, admission_status='ADMITTED').exists():
            return Response({'detail': 'You must be admitted to this training to submit the final exam.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if already submitted
        if TrainingFinalExamSubmission.objects.filter(exam=exam, participant=user).exists():
            return Response({'detail': 'You have already submitted this exam.'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure file is provided
        submission_file = request.FILES.get('submission_file')
        if not submission_file:
            return Response({'detail': 'Submission file is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        submission = TrainingFinalExamSubmission.objects.create(
            exam=exam,
            participant=user,
            submission_file=submission_file
        )
        
        serializer = TrainingFinalExamSubmissionSerializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CustomTrainingRequestViewSet(viewsets.ModelViewSet):
    queryset = CustomTrainingRequest.objects.all().order_by('-created_at')
    serializer_class = CustomTrainingRequestSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]
