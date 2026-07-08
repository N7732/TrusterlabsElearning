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
    TrainingFinalExamSubmission
)
# pyrefly: ignore [missing-import]
from .serializers import (
    TrainingSerializer,
    TrainingParticipantsSerializer,
    TrainingClassworkSerializer,
    TrainingClassworkSubmissionSerializer,
    TrainingFinalExamSerializer,
    TrainingFinalExamSubmissionSerializer
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
        
        # Check if already applied
        if TrainingParticipants.objects.filter(training=training, participant=user).exists():
            return Response({'detail': 'You have already applied for this training.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create application within an atomic transaction
        participant = TrainingParticipants.objects.create(
            training=training,
            participant=user,
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
