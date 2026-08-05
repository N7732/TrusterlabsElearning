from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.db import transaction
from SuperSetting.caching import CachedModelViewSetMixin

# pyrefly: ignore [missing-import]
from .models import (
    Training,
    TrainingCourses,
    TrainingParticipants, TrainingClasswork, TrainingClassworkSubmission, TrainingFinalExam, TrainingFinalExamSubmission, CustomTrainingRequest, TrainingMessage
)
# pyrefly: ignore [missing-import]
from .serializers import (
    TrainingSerializer, TrainingCoursesSerializer, TrainingParticipantsSerializer, TrainingClassworkSerializer,
    TrainingClassworkSubmissionSerializer, TrainingFinalExamSerializer, TrainingFinalExamSubmissionSerializer, CustomTrainingRequestSerializer, TrainingMessageSerializer
)
from django.utils import timezone
from Auth.views import render_email_template, send_email_async
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils.html import strip_tags

def is_training_course_completed(course, learner):
    from Course.models import Lesson, LessonProgress, Quizes, QuizSubmission
    from django.db.models import Q
    total_lessons = Lesson.objects.filter(module__course=course, is_published=True).count()
    completed_lessons = LessonProgress.objects.filter(
        learner=learner,
        lesson__module__course=course,
        is_completed=True
    ).count()

    if total_lessons > 0 and completed_lessons < total_lessons:
        return False

    all_quizzes = Quizes.objects.filter(
        Q(course=course) | Q(module__course=course) | Q(lesson__module__course=course),
        is_published=True
    )
    
    for quiz in all_quizzes:
        submission = QuizSubmission.objects.filter(learner=learner, quiz=quiz, training_classwork__isnull=True, training_exam__isnull=True).first()
        if not submission or not submission.passed:
            return False
            
    return True

def get_training_course_score(course, learner):
    from Course.models import Quizes, QuizSubmission
    from django.db.models import Q
    all_quizzes = Quizes.objects.filter(
        Q(course=course) | Q(module__course=course) | Q(lesson__module__course=course),
        is_published=True
    )
    
    if not all_quizzes.exists():
        return 100.0
        
    scores = []
    for quiz in all_quizzes:
        submission = QuizSubmission.objects.filter(learner=learner, quiz=quiz, training_classwork__isnull=True, training_exam__isnull=True).first()
        if submission and submission.score is not None:
            scores.append(float(submission.score))
        else:
            return None
            
    return sum(scores) / len(scores)

def check_and_issue_certificate(training, user):
    """
    Check if a specific user has passed all requirements for a training and issue certificate if auto_issue is True.
    """
    if not training.has_certificate:
        return
    
    from Auth.models import Learner
    learner, _ = Learner.objects.get_or_create(user=user)
    
    from certification.models import Certificate
    from Course.models import QuizSubmission
    from .models import TrainingParticipants
    
    classworks = training.classworks.all()
    exams = training.final_exams.all()
    courses = training.courses.all()
    
    all_scores = []
    
    for cw in classworks:
        sub = cw.submissions.filter(participant=user).first()
        if sub and sub.score is not None:
            all_scores.append(float(sub.score))
        elif cw.linked_quiz:
            quiz_sub = QuizSubmission.objects.filter(learner=learner, quiz=cw.linked_quiz, training_classwork_id=cw.id).first()
            if quiz_sub:
                all_scores.append(float(quiz_sub.score))
                
    for ex in exams:
        sub = ex.submissions.filter(participant=user).first()
        if sub and sub.score is not None:
            all_scores.append(float(sub.score))
        elif ex.linked_exam:
            quiz_sub = QuizSubmission.objects.filter(learner=learner, quiz=ex.linked_exam, training_exam_id=ex.id).first()
            if quiz_sub:
                all_scores.append(float(quiz_sub.score))
                
    for tc in courses:
        if not is_training_course_completed(tc.course, learner):
            continue
        score = get_training_course_score(tc.course, learner)
        if score is not None:
            all_scores.append(score)
            
    avg_score = sum(all_scores) / len(all_scores) if all_scores else 0.0
    
    total_assignments = classworks.count() + exams.count() + courses.count()
    if total_assignments > 0 and len(all_scores) < total_assignments:
        return
        
    # Strictly enforce that a Training MUST have Final Exams to be completed
    if exams.count() == 0:
        return
        
    if total_assignments > 0:
        # Check if already completed to prevent duplicate emails
        participant_record = TrainingParticipants.objects.filter(training=training, participant=user).first()
        if participant_record and participant_record.admission_status != 'COMPLETED':
            TrainingParticipants.objects.filter(training=training, participant=user).update(admission_status='COMPLETED')
            
            # Send completion email
            email = participant_record.application_email or user.email
            name = participant_record.application_full_name or user.get_full_name()
            if email:
                context = {
                    'name': name,
                    'training_title': training.title,
                    'average_score': round(avg_score, 2),
                }
                html_message, dynamic_subject = render_email_template('emails/training_completed.html', context)
                text_content = strip_tags(html_message)
                
                email_message = EmailMultiAlternatives(
                    subject=dynamic_subject or f"Completed: {training.title}",
                    body=text_content,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[email],
                )
                email_message.attach_alternative(html_message, "text/html")
                send_email_async(email_message)
        
    if not training.has_certificate:
        return
        
    if avg_score >= float(training.passing_score_percentage):
        Certificate.objects.get_or_create(
            learner=learner,
            training=training,
            defaults={'is_issued': training.auto_issue_certificate}
        )

class TrainingViewSet(CachedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = Training.objects.select_related('instructor__user').prefetch_related('courses__course', 'participants__participant', 'classworks', 'final_exams')
    serializer_class = TrainingSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = Training.objects.select_related('instructor__user').prefetch_related('courses__course', 'participants__participant', 'classworks', 'final_exams')
        
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
            
            # Send admission emails
            for p in participants:
                user = p.participant
                email = p.application_email or user.email
                name = p.application_full_name or user.get_full_name()
                if not email: continue
                
                context = {
                    'name': name,
                    'training_title': training.title,
                    'start_date': training.starting_date.strftime('%B %d, %Y') if training.starting_date else 'TBD',
                    'end_date': training.ending_date.strftime('%B %d, %Y') if training.ending_date else 'TBD',
                    'frontend_url': settings.FRONTEND_URL.rstrip('/'),
                    'training_id': training.id
                }
                html_message, dynamic_subject = render_email_template('emails/training_admitted.html', context)
                text_content = strip_tags(html_message)
                
                email_message = EmailMultiAlternatives(
                    subject=dynamic_subject or f"Admitted: {training.title}",
                    body=text_content,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[email],
                )
                email_message.attach_alternative(html_message, "text/html")
                send_email_async(email_message)

        elif action_type == 'REJECT':
            participants.update(admission_status='REJECTED')
        elif action_type == 'REMOVE':
            participants.delete()
        elif action_type == 'COMPLETE':
            participants.update(admission_status='COMPLETED')
            if training.has_certificate:
                from certification.models import Certificate
                from Course.models import QuizSubmission
                
                classworks = training.classworks.all()
                exams = training.final_exams.all()
                
                for p in participants:
                    user = p.participant
                    from Auth.models import Learner
                    learner, _ = Learner.objects.get_or_create(user=user)
                        
                    all_scores = []
                    for cw in classworks:
                        sub = cw.submissions.filter(participant=user).first()
                        if sub and sub.score is not None:
                            all_scores.append(float(sub.score))
                        elif cw.linked_quiz:
                            quiz_sub = QuizSubmission.objects.filter(learner=learner, quiz=cw.linked_quiz, training_classwork_id=cw.id).first()
                            if quiz_sub:
                                all_scores.append(float(quiz_sub.score))
                                
                    for ex in exams:
                        sub = ex.submissions.filter(participant=user).first()
                        if sub and sub.score is not None:
                            all_scores.append(float(sub.score))
                        elif ex.linked_exam:
                            quiz_sub = QuizSubmission.objects.filter(learner=learner, quiz=ex.linked_exam, training_exam_id=ex.id).first()
                            if quiz_sub:
                                all_scores.append(float(quiz_sub.score))
                                
                    avg_score = sum(all_scores) / len(all_scores) if all_scores else 0.0
                    
                    if avg_score >= float(training.passing_score_percentage):
                        Certificate.objects.get_or_create(
                            learner=learner,
                            training=training,
                            defaults={'is_issued': training.auto_issue_certificate}
                        )
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
        courses = training.courses.all()
        
        participants = TrainingParticipants.objects.filter(
            training=training, 
            admission_status__in=['ADMITTED', 'COMPLETED']
        )
        
        from Course.models import QuizSubmission
        
        participant_data = []
        for p in participants:
            user = p.participant
            learner = getattr(user, 'learner_profile', None)
            
            cw_scores = {}
            for cw in classworks:
                sub = cw.submissions.filter(participant=user).first()
                if sub and sub.score is not None:
                    cw_scores[cw.id] = float(sub.score)
                elif cw.linked_quiz and learner:
                    quiz_sub = QuizSubmission.objects.filter(learner=learner, quiz=cw.linked_quiz, training_classwork_id=cw.id).first()
                    cw_scores[cw.id] = float(quiz_sub.score) if quiz_sub else None
                else:
                    cw_scores[cw.id] = None
                    
            ex_scores = {}
            for ex in exams:
                sub = ex.submissions.filter(participant=user).first()
                if sub and sub.score is not None:
                    ex_scores[ex.id] = float(sub.score)
                elif ex.linked_exam and learner:
                    quiz_sub = QuizSubmission.objects.filter(learner=learner, quiz=ex.linked_exam, training_exam_id=ex.id).first()
                    ex_scores[ex.id] = float(quiz_sub.score) if quiz_sub else None
                else:
                    ex_scores[ex.id] = None
                    
            tc_scores = {}
            if learner:
                for tc in courses:
                    if is_training_course_completed(tc.course, learner):
                        score = get_training_course_score(tc.course, learner)
                        tc_scores[tc.course.id] = float(score) if score is not None else None
                    else:
                        tc_scores[tc.course.id] = None
            else:
                for tc in courses:
                    tc_scores[tc.course.id] = None
                    
            all_scores = [s for s in list(cw_scores.values()) + list(ex_scores.values()) + list(tc_scores.values()) if s is not None]
            avg_score = sum(all_scores) / len(all_scores) if all_scores else None
            
            participant_data.append({
                'id': p.id,
                'user_id': user.id,
                'name': p.application_full_name or user.get_full_name(),
                'email': p.application_email or user.email,
                'classwork_scores': cw_scores,
                'exam_scores': ex_scores,
                'course_scores': tc_scores,
                'average': avg_score,
                'status': p.admission_status
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
            'courses': [{'id': tc.course.id, 'title': tc.course.title} for tc in courses],
            'participants': participant_data,
            'analysis': analysis
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='my-trainings')
    def my_trainings(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Get trainings where user is a participant and prefetch related items to avoid N+1 queries
        trainings = Training.objects.filter(participants__participant=user).distinct().prefetch_related('courses__course', 'participants__participant', 'classworks', 'final_exams')
        serializer = self.get_serializer(trainings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get', 'post'], url_path='messages')
    def messages(self, request, pk=None):
        training = self.get_object()
        
        if request.method == 'GET':
            # Admitted/Completed learners, instructors, and admins can view messages
            if request.user.user_type not in ['instructor', 'admin'] and not request.user.is_superuser:
                participant = TrainingParticipants.objects.filter(training=training, participant=request.user).first()
                if not participant or participant.admission_status not in ['ADMITTED', 'COMPLETED']:
                    return Response({"detail": "You do not have access to these messages."}, status=status.HTTP_403_FORBIDDEN)
            
            messages = training.messages.all().order_by('-date_sent')
            serializer = TrainingMessageSerializer(messages, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        elif request.method == 'POST':
            # Only Instructors and Admins can post messages
            if request.user.user_type not in ['instructor', 'admin'] and not request.user.is_superuser:
                return Response({"detail": "Only instructors and admins can send messages."}, status=status.HTTP_403_FORBIDDEN)
                
            serializer = TrainingMessageSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(training=training, sender=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TrainingClassworkViewSet(viewsets.ModelViewSet):
    queryset = TrainingClasswork.objects.select_related('training', 'linked_quiz')
    serializer_class = TrainingClassworkSerializer
    
    def get_permissions(self):
        if self.request.method in ['GET']:
            return [IsAuthenticated()]
        if self.action == 'submit_classwork':
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
        submission_file = request.FILES.get('submission_file') or request.FILES.get('file')
        if not submission_file:
            # Fallback to taking the first uploaded file regardless of key
            if request.FILES:
                submission_file = list(request.FILES.values())[0]
            else:
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
            submissions = TrainingClassworkSubmission.objects.filter(classwork=classwork).select_related('participant', 'classwork')
            serializer = TrainingClassworkSubmissionSerializer(submissions, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        elif request.method == 'POST':
            # This is for grading
            participant_id = request.data.get('participant_id')
            submission_id = request.data.get('submission_id')
            score = request.data.get('score')
            
            if score is None:
                return Response({'detail': 'score is required.'}, status=status.HTTP_400_BAD_REQUEST)
                
            if submission_id:
                try:
                    submission = TrainingClassworkSubmission.objects.get(id=submission_id, classwork=classwork)
                    submission.score = score
                    submission.save()
                    participant_user = submission.participant
                except TrainingClassworkSubmission.DoesNotExist:
                    return Response({'detail': 'Submission not found.'}, status=status.HTTP_404_NOT_FOUND)
            elif participant_id:
                from Auth.models import User
                try:
                    participant_user = User.objects.get(id=participant_id)
                except User.DoesNotExist:
                    return Response({'detail': 'Participant not found.'}, status=status.HTTP_404_NOT_FOUND)

                submission, created = TrainingClassworkSubmission.objects.get_or_create(
                    classwork=classwork,
                    participant=participant_user,
                    defaults={'score': score}
                )
                if not created:
                    submission.score = score
                    submission.save()
            else:
                return Response({'detail': 'Either submission_id or participant_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
                
            check_and_issue_certificate(classwork.training, participant_user)

            serializer = TrainingClassworkSubmissionSerializer(submission)
            return Response(serializer.data, status=status.HTTP_200_OK)

class TrainingFinalExamViewSet(viewsets.ModelViewSet):
    queryset = TrainingFinalExam.objects.select_related('training', 'linked_exam')
    serializer_class = TrainingFinalExamSerializer
    
    def get_permissions(self):
        if self.request.method in ['GET']:
            return [IsAuthenticated()]
        if self.action == 'submit_exam':
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
        submission_file = request.FILES.get('submission_file') or request.FILES.get('file')
        if not submission_file:
            if request.FILES:
                submission_file = list(request.FILES.values())[0]
            else:
                return Response({'detail': 'Submission file is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        submission = TrainingFinalExamSubmission.objects.create(
            exam=exam,
            participant=user,
            submission_file=submission_file
        )
        
        serializer = TrainingFinalExamSubmissionSerializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


    @action(detail=True, methods=['get', 'post'], url_path='submissions')
    @transaction.atomic
    def manage_submissions(self, request, pk=None):
        exam = self.get_object()
        
        if request.method == 'GET':
            submissions = TrainingFinalExamSubmission.objects.filter(exam=exam)
            serializer = TrainingFinalExamSubmissionSerializer(submissions, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        elif request.method == 'POST':
            # This is for grading
            participant_id = request.data.get('participant_id')
            submission_id = request.data.get('submission_id')
            score = request.data.get('score')
            
            if score is None:
                return Response({'detail': 'score is required.'}, status=status.HTTP_400_BAD_REQUEST)
                
            if submission_id:
                try:
                    submission = TrainingFinalExamSubmission.objects.get(id=submission_id, exam=exam)
                    submission.score = score
                    submission.save()
                    participant_user = submission.participant
                except TrainingFinalExamSubmission.DoesNotExist:
                    return Response({'detail': 'Submission not found.'}, status=status.HTTP_404_NOT_FOUND)
            elif participant_id:
                from Auth.models import User
                try:
                    participant_user = User.objects.get(id=participant_id)
                except User.DoesNotExist:
                    return Response({'detail': 'Participant not found.'}, status=status.HTTP_404_NOT_FOUND)

                submission, created = TrainingFinalExamSubmission.objects.get_or_create(
                    exam=exam,
                    participant=participant_user,
                    defaults={'score': score}
                )
                if not created:
                    submission.score = score
                    submission.save()
            else:
                return Response({'detail': 'Either submission_id or participant_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
                
            check_and_issue_certificate(exam.training, participant_user)
                
            serializer = TrainingFinalExamSubmissionSerializer(submission)
            return Response(serializer.data, status=status.HTTP_200_OK)

class CustomTrainingRequestViewSet(viewsets.ModelViewSet):
    queryset = CustomTrainingRequest.objects.all().order_by('-created_at')
    serializer_class = CustomTrainingRequestSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]
