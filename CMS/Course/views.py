from django.shortcuts import get_object_or_404, render, redirect
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from .models import Course, Module, Lesson, Quizes
from .serializer import CourseSerializer, ModuleSerializer, LessonSerializer, QuizesSerializer
from rest_framework import viewsets
from django.contrib.auth.decorators import login_required
from Auth.decorator import learner_required, instructor_required, user_is_authenticated, user_is_learner_or_instructor, is_admin

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.contrib import messages
from django.db import transaction
from .models import Course, Module, Lesson, Quizes, QuizQuestion, Enrollment, LessonProgress, CourseResource, QuizSubmission
from Auth.views import send_course_enrollment_email
import logging

logger = logging.getLogger(__name__)
from .serializer import (
    CourseSerializer, ModuleSerializer, LessonSerializer, QuizesSerializer, QuizQuestionSerializer,
    EnrollmentSerializer, CourseResourceSerializer
)
# from superadmin_dashboard.models import DirectMessage
# from superadmin_dashboard.forms import DirectMessageForm
from django.contrib.auth import get_user_model
from django.views.generic import ListView, CreateView, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from datetime import timedelta
from django.utils import timezone
from .form import CourseForm, ModuleForm, LessonForm, QuizesForm, QuizQuestionForm

User = get_user_model()

class CourseViewSet(viewsets.ModelViewSet):
    """
    API ViewSet for viewing, creating, updating, and deleting Course instances.
    Provides custom querysets based on user type (instructor, admin, learner) and 
    includes a bulk upload action for creating multiple courses at once.
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_authenticated and user.user_type == 'instructor' and self.request.query_params.get('my_courses') == 'true':
            return Course.objects.filter(instructor=user.instructor_profile)

        if user.is_authenticated and (user.user_type == 'admin' or user.is_superuser or user.user_type == 'instructor'):
            return Course.objects.all()
            
        from django.db.models import Q
        if user.is_authenticated and getattr(user, 'learner_profile', None):
            enrolled_course_ids = Enrollment.objects.filter(learner=user.learner_profile, status='active').values_list('course_id', flat=True)
            return Course.objects.filter(Q(course_status='published') | Q(id__in=enrolled_course_ids))
            
        return Course.objects.filter(course_status='published')
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['post'], url_path='bulk_upload')
    def bulk_upload(self, request):
        if 'file' not in request.FILES:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
            
        csv_file = request.FILES['file']
        if not csv_file.name.endswith('.csv'):
            return Response({'detail': 'File must be a CSV.'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        # Allow admins or instructors with permission
        if user.user_type == 'instructor' and not getattr(user.instructor_profile, 'can_create_courses', False):
            return Response({'detail': 'You do not have permission to create courses.'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            import csv
            import io
            from django.db import transaction
            
            decoded_file = csv_file.read().decode('utf-8')
            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string)
            
            created_count = 0
            
            with transaction.atomic():
                for row in reader:
                    title = row.get('title', '').strip()
                    if not title:
                        continue
                        
                    course = Course(
                        title=title,
                        description=row.get('description', '').strip(),
                        difficulty=row.get('difficulty', 'beginner').strip(),
                        course_status=row.get('course_status', 'draft').strip()
                    )
                    
                    price_str = row.get('price', '').strip()
                    if price_str and price_str.replace('.', '', 1).isdigit():
                        course.price = float(price_str)
                    
                    if user.user_type == 'instructor':
                        course.instructor = user.instructor_profile
                    
                    course.save()
                    created_count += 1
                    
            return Response({'detail': f'Bulk upload successful. Created {created_count} courses.'}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        user = self.request.user
        if user.user_type == 'instructor':
            if not getattr(user.instructor_profile, 'can_create_courses', False):
                raise PermissionDenied("You do not have permission to create courses.")
            serializer.save(instructor=user.instructor_profile)
        elif user.user_type == 'admin' or user.is_superuser:
            serializer.save()
        else:
            raise PermissionDenied("Only instructors or admins can create courses.")

    def perform_update(self, serializer):
        user = self.request.user
        if user.user_type == 'instructor':
            if not getattr(user.instructor_profile, 'can_update_courses', False):
                raise PermissionDenied("You do not have permission to update courses.")
            course = self.get_object()
            if course.instructor != user.instructor_profile:
                raise PermissionDenied("You cannot update another instructor's course.")
        elif user.user_type == 'admin' or user.is_superuser:
            pass
        else:
            raise PermissionDenied("Only instructors or admins can update courses.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if user.user_type == 'instructor':
            if not getattr(user.instructor_profile, 'can_delete_courses', False):
                raise PermissionDenied("You do not have permission to delete courses.")
            if instance.instructor != user.instructor_profile:
                raise PermissionDenied("You cannot delete another instructor's course.")
        elif user.user_type == 'admin' or user.is_superuser:
            pass
        else:
            raise PermissionDenied("Only instructors or admins can delete courses.")
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        user = request.user
        
        # Check if already enrolled
        learner = getattr(user, 'learner_profile', None)
        if not learner:
             return Response({'error': 'You must be registered as a student to enroll in courses. Instructors and Admins cannot enroll.'}, status=status.HTTP_400_BAD_REQUEST)

        if Enrollment.objects.filter(learner=learner, course=course).exists():
             return Response({'message': 'Already enrolled'}, status=status.HTTP_400_BAD_REQUEST)

        # Check prerequisites
        # Optimization: prefetch prerequisites
        prereqs = course.prerequisites.all()
        for prereq in prereqs:
            required_course = prereq.prerequisite_course
            min_score = prereq.minimum_marks
            
            # Check if user enrolled in required course
            try:
                enrollment = Enrollment.objects.get(learner=learner, course=required_course)
                if enrollment.score < min_score:
                    return Response({
                        'error': f'Prerequisite not met. You need {min_score} marks in {required_course.title}. Current score: {enrollment.score}'
                    }, status=status.HTTP_403_FORBIDDEN)
            except Enrollment.DoesNotExist:
                return Response({
                    'error': f'Prerequisite not met. You must complete {required_course.title} first.'
                }, status=status.HTTP_403_FORBIDDEN)
        
        # Enroll
        status_val = 'active' if course.is_free else 'pending'
        Enrollment.objects.create(learner=learner, course=course, status=status_val)
        
        if status_val == 'active':
            try:
                send_course_enrollment_email(learner, course)
            except Exception as e:
                logger.error(f"Failed to send enrollment email to {user.email}: {e}")
                
        return Response({'status': 'Enrolled successfully', 'enrollment_status': status_val}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def progress(self, request, pk=None):
        course = self.get_object()
        user = request.user
        learner = getattr(user, 'learner_profile', None)
        if not learner:
            return Response({'completed_lessons': []}, status=status.HTTP_200_OK)
        
        just_completed = check_and_update_course_completion(learner, course)
        
        enrollment = Enrollment.objects.filter(learner=learner, course=course).first()
        is_course_completed = (enrollment and enrollment.status == 'completed')

        completed_lessons = LessonProgress.objects.filter(
            learner=learner,
            lesson__module__course=course,
            is_completed=True
        ).values_list('lesson_id', flat=True)
        
        return Response({
            'completed_lessons': list(completed_lessons),
            'course_completed': is_course_completed,
            'just_completed': just_completed
        }, status=status.HTTP_200_OK)

def check_course_subentity_permission(user, course, action):
    """
    Validates whether a user has the appropriate permissions (e.g. instructor or admin)
    to perform a specific action (create, update, delete) on a course's sub-entities 
    (like modules, lessons, or quizzes).
    """
    if user.user_type == 'admin' or user.is_superuser:
        return
    if user.user_type == 'instructor':
        if not course or course.instructor != getattr(user, 'instructor_profile', None):
            raise PermissionDenied("You cannot modify content in another instructor's course.")
        
        if action == 'create' or action == 'update':
            if not getattr(user.instructor_profile, 'can_update_courses', False):
                raise PermissionDenied("You do not have permission to update courses.")
        elif action == 'delete':
            if not getattr(user.instructor_profile, 'can_delete_courses', False):
                raise PermissionDenied("You do not have permission to delete content from courses.")
    else:
        raise PermissionDenied("Only instructors or admins can modify course contents.")

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        course = serializer.validated_data.get('course')
        check_course_subentity_permission(self.request.user, course, 'create')
        serializer.save()

    def perform_update(self, serializer):
        module = self.get_object()
        check_course_subentity_permission(self.request.user, module.course, 'update')
        new_course = serializer.validated_data.get('course')
        if new_course and new_course != module.course:
            check_course_subentity_permission(self.request.user, new_course, 'update')
        serializer.save()

    def perform_destroy(self, instance):
        check_course_subentity_permission(self.request.user, instance.course, 'delete')
        instance.delete()

from django.db.models import Q

@transaction.atomic
def check_and_update_course_completion(learner, course):
    """
    Checks if a learner has completed all required lessons and passed all quizzes for a given course.
    If conditions are met, it updates the enrollment status to 'completed', issues a certificate (if applicable),
    and sends a completion email.
    """
    total_lessons = Lesson.objects.filter(module__course=course, is_published=True).count()
    completed_lessons = LessonProgress.objects.filter(
        learner=learner,
        lesson__module__course=course,
        is_completed=True
    ).count()

    # If there are lessons and not all are completed, course is not done yet
    if total_lessons > 0 and completed_lessons < total_lessons:
        return False

    # Check all published quizzes must be passed
    all_quizzes = Quizes.objects.filter(
        Q(course=course) | Q(module__course=course) | Q(lesson__module__course=course),
        is_published=True
    )
    
    for quiz in all_quizzes:
        submission = QuizSubmission.objects.filter(learner=learner, quiz=quiz).first()
        if not submission or not submission.passed:
            return False

    # All conditions met - mark enrollment complete immediately
    enrollment = Enrollment.objects.filter(learner=learner, course=course).first()
    if not enrollment:
        return False

    just_completed = False
    if enrollment.status != 'completed':
        enrollment.status = 'completed'
        enrollment.progress = 100
        enrollment.save()
        just_completed = True
    elif enrollment.progress < 100:
        enrollment.progress = 100
        enrollment.save()

    # Issue certificate immediately if course has one
    certificate = None
    certificate_created = False
    if course.has_certificate:
        from certification.models import Certificate
        certificate, certificate_created = Certificate.objects.get_or_create(
            learner=learner,
            course=course,
            defaults={'is_issued': True}  # Always issue immediately on completion
        )
        # If certificate existed but wasn't issued yet, issue it now
        if certificate and not certificate.is_issued:
            certificate.is_issued = True
            certificate.save()
        
    # Send email notification asynchronously (non-blocking)
    if just_completed or certificate_created:
        try:
            from Auth.views import certificate_email
            certificate_email(learner, course, certificate)
        except Exception as e:
            logger.error(f"Failed to send certificate email: {e}")
        
    return just_completed or certificate_created


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        module = serializer.validated_data.get('module')
        check_course_subentity_permission(self.request.user, module.course, 'create')
        serializer.save()

    def perform_update(self, serializer):
        lesson = self.get_object()
        check_course_subentity_permission(self.request.user, lesson.module.course, 'update')
        new_module = serializer.validated_data.get('module')
        if new_module and new_module != lesson.module:
            check_course_subentity_permission(self.request.user, new_module.course, 'update')
        serializer.save()

    def perform_destroy(self, instance):
        check_course_subentity_permission(self.request.user, instance.module.course, 'delete')
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def mark_complete(self, request, pk=None):
        lesson = self.get_object()
        user = request.user
        learner = getattr(user, 'learner_profile', None)
        if not learner:
            return Response({'detail': 'Only learners can track progress.'}, status=status.HTTP_403_FORBIDDEN)
            
        course = lesson.module.course
        enrollment = Enrollment.objects.filter(learner=learner, course=course).first()
        if not enrollment or enrollment.status not in ['active', 'completed']:
            return Response({'detail': 'You must be actively enrolled in this course to track progress.'}, status=status.HTTP_403_FORBIDDEN)
        
        LessonProgress.objects.update_or_create(
            learner=learner,
            lesson=lesson,
            defaults={'is_completed': True}
        )
        
        course = lesson.module.course
        course_completed = check_and_update_course_completion(learner, course)
                    
        return Response({'detail': 'Lesson marked as complete.', 'course_completed': course_completed}, status=status.HTTP_200_OK)

class QuizesViewSet(viewsets.ModelViewSet):
    queryset = Quizes.objects.all()
    serializer_class = QuizesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_course_for_quiz(self, quiz=None, validated_data=None):
        if validated_data:
            course = validated_data.get('course')
            module = validated_data.get('module')
            lesson = validated_data.get('lesson')
        else:
            course = quiz.course
            module = quiz.module
            lesson = quiz.lesson
            
        if course: return course
        if module: return module.course
        if lesson: return lesson.module.course
        return None

    def perform_create(self, serializer):
        course = self.get_course_for_quiz(validated_data=serializer.validated_data)
        if course:
            check_course_subentity_permission(self.request.user, course, 'create')
        serializer.save()

    def perform_update(self, serializer):
        quiz = self.get_object()
        course = self.get_course_for_quiz(quiz=quiz)
        if course:
            check_course_subentity_permission(self.request.user, course, 'update')
        
        new_course = self.get_course_for_quiz(validated_data=serializer.validated_data)
        if new_course and new_course != course:
            check_course_subentity_permission(self.request.user, new_course, 'update')
        serializer.save()

    def perform_destroy(self, instance):
        course = self.get_course_for_quiz(quiz=instance)
        if course:
            check_course_subentity_permission(self.request.user, course, 'delete')
        instance.delete()

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_submission(self, request, pk=None):
        quiz = self.get_object()
        learner = getattr(request.user, 'learner_profile', None)
        
        if not learner:
            return Response({"error": "Only registered learners can view submissions."}, status=status.HTTP_403_FORBIDDEN)
            
        submissions = QuizSubmission.objects.filter(learner=learner, quiz=quiz)
        attempts_count = submissions.count()
        submission = submissions.first()
        
        if submission:
            from .serializer import QuizSubmissionSerializer
            data = dict(QuizSubmissionSerializer(submission).data)
            data['attempts_count'] = attempts_count
            return Response(data)
            
        return Response({"message": "No submission found", "attempts_count": attempts_count}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def submit_quiz(self, request, pk=None):
        quiz = self.get_object()
        learner = getattr(request.user, 'learner_profile', None)
        
        if not learner:
            return Response({"error": "Only registered learners can submit quizzes."}, status=status.HTTP_403_FORBIDDEN)
            
        if quiz.is_locked:
            return Response({"error": "This quiz is locked and cannot be submitted."}, status=status.HTTP_403_FORBIDDEN)
            
        course = self.get_course_for_quiz(quiz=quiz)
        if course:
            enrollment = Enrollment.objects.filter(learner=learner, course=course).first()
            if not enrollment or enrollment.status not in ['active', 'completed']:
                return Response({'error': 'You must be actively enrolled in this course to submit a quiz.'}, status=status.HTTP_403_FORBIDDEN)
            
        if quiz.max_attempts and quiz.max_attempts > 0:
            attempts_count = QuizSubmission.objects.filter(learner=learner, quiz=quiz).count()
            if attempts_count >= quiz.max_attempts:
                return Response({'error': f'You have reached the maximum number of attempts ({quiz.max_attempts}) for this quiz.'}, status=status.HTTP_403_FORBIDDEN)
            
        submitted_answers = request.data.get('answers', {})
        total_score = 0
        total_possible = 0
        
        for question in quiz.questions.all():
            total_possible += question.marks
            submitted = submitted_answers.get(str(question.id))
            
            if getattr(question, 'question_type', 'MULTIPLE_CHOICE') == 'MATCHING':
                if submitted and isinstance(submitted, dict) and question.matching_pairs:
                    is_correct = True
                    # All-or-nothing grading: every pair must be perfectly matched
                    for pair in question.matching_pairs:
                        expected_left = str(pair.get('id', pair.get('left')))
                        expected_right = str(pair.get('right'))
                        actual_right = str(submitted.get(expected_left, ''))
                        if actual_right != expected_right:
                            is_correct = False
                            break
                    
                    # Also ensure they didn't submit extra mismatched pairs
                    if is_correct and len(submitted) == len(question.matching_pairs):
                        total_score += question.marks
            else:
                if submitted and question.correct_option and str(submitted).upper() == question.correct_option.upper():
                    total_score += question.marks
                
        percentage = (total_score / total_possible * 100) if total_possible > 0 else 0
        passed = percentage >= (quiz.pass_mark or 0)
        
        submission = QuizSubmission.objects.create(
            learner=learner,
            quiz=quiz,
            score=total_score,
            total_marks=total_possible,
            passed=passed,
            answers_data=submitted_answers
        )
        course = quiz.course or (quiz.module.course if quiz.module else (quiz.lesson.module.course if quiz.lesson else None))
        course_completed = False
        if course and passed:
            course_completed = check_and_update_course_completion(learner, course)

        return Response({
            "message": "Quiz submitted successfully!",
            "score": total_score,
            "total_marks": total_possible,
            "passed": passed,
            "percentage": percentage,
            "required_pass_mark": quiz.pass_mark,
            "course_completed": course_completed
        })

class QuizQuestionViewSet(viewsets.ModelViewSet):
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        quiz = serializer.validated_data.get('quiz')
        course = quiz.course or (quiz.module.course if quiz.module else (quiz.lesson.module.course if quiz.lesson else None))
        if course:
            check_course_subentity_permission(self.request.user, course, 'create')
        serializer.save()

    def perform_update(self, serializer):
        question = self.get_object()
        quiz = question.quiz
        course = quiz.course or (quiz.module.course if quiz.module else (quiz.lesson.module.course if quiz.lesson else None))
        if course:
            check_course_subentity_permission(self.request.user, course, 'update')
            
        new_quiz = serializer.validated_data.get('quiz')
        if new_quiz and new_quiz != quiz:
            new_course = new_quiz.course or (new_quiz.module.course if new_quiz.module else (new_quiz.lesson.module.course if new_quiz.lesson else None))
            if new_course:
                check_course_subentity_permission(self.request.user, new_course, 'update')
        serializer.save()

    def perform_destroy(self, instance):
        quiz = instance.quiz
        course = quiz.course or (quiz.module.course if quiz.module else (quiz.lesson.module.course if quiz.lesson else None))
        if course:
            check_course_subentity_permission(self.request.user, course, 'delete')
        instance.delete()


class CourseResourceViewSet(viewsets.ModelViewSet):
    queryset = CourseResource.objects.all()
    serializer_class = CourseResourceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        course = serializer.validated_data.get('course')
        check_course_subentity_permission(self.request.user, course, 'create')
        serializer.save()

    def perform_update(self, serializer):
        resource = self.get_object()
        check_course_subentity_permission(self.request.user, resource.course, 'update')
        new_course = serializer.validated_data.get('course')
        if new_course and new_course != resource.course:
            check_course_subentity_permission(self.request.user, new_course, 'update')
        serializer.save()

    def perform_destroy(self, instance):
        check_course_subentity_permission(self.request.user, instance.course, 'delete')
        instance.delete()

class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'instructor' and self.request.query_params.get('my_enrollments') == 'true':
            return Enrollment.objects.filter(course__instructor=user.instructor_profile)
            
        if user.user_type == 'admin' or user.is_superuser:
            return Enrollment.objects.all()
            
        learner = getattr(user, 'learner_profile', None)
        if learner:
            return Enrollment.objects.filter(learner=learner)
        return Enrollment.objects.none()

    @action(detail=True, methods=['post'])
    def issue_certificate(self, request, pk=None):
        enrollment = self.get_object()
        user = request.user
        
        # Check permissions
        if user.user_type == 'instructor' and enrollment.course.instructor != getattr(user, 'instructor_profile', None):
            return Response({'detail': 'You do not have permission to issue certificates for this course.'}, status=status.HTTP_403_FORBIDDEN)
            
        course = enrollment.course
        if not course.has_certificate:
            return Response({'detail': 'This course does not offer a certificate.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Update enrollment status
        enrollment.status = 'completed'
        enrollment.progress = 100
        enrollment.save()
        
        # Issue certificate
        from Certificate.models import Certificate
        certificate, created = Certificate.objects.get_or_create(
            learner=enrollment.learner,
            course=course,
            defaults={'is_issued': True}
        )
        
        if not created and not certificate.is_issued:
            certificate.is_issued = True
            certificate.save()
            
        # Send congratulation email since the course is now marked completed and certificate is issued
        try:
            from Auth.views import certificate_email
            certificate_email(enrollment.learner, course, certificate)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send certificate email after manual issue: {e}")
            
        return Response({'detail': 'Certificate issued successfully.'})

    @action(detail=False, methods=['post'], url_path='bulk_enroll')
    def bulk_enroll(self, request):
        user = request.user
        course_id = request.data.get('course_id')
        emails = request.data.get('emails', [])
        
        if not course_id or not emails:
            return Response({'detail': 'course_id and emails list are required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        course = get_object_or_404(Course, id=course_id)
        
        if user.user_type == 'instructor' and course.instructor != user.instructor_profile:
            return Response({'detail': 'You do not have permission to enroll students in this course.'}, status=status.HTTP_403_FORBIDDEN)
            
        from Auth.models import User
        from Auth.models import Learner
        
        enrolled_count = 0
        not_found = []
        
        for email in emails:
            email = email.strip()
            if not email: continue
            try:
                learner_user = User.objects.get(email=email, user_type='learner')
                if hasattr(learner_user, 'learner_profile'):
                    Enrollment.objects.get_or_create(learner=learner_user.learner_profile, course=course, defaults={'status': 'active'})
                    enrolled_count += 1
                else:
                    not_found.append(email)
            except User.DoesNotExist:
                not_found.append(email)
                
        return Response({
            'detail': f'Successfully enrolled {enrolled_count} students.',
            'not_found': not_found
        })



# Create your views here.

def home(request):
    courses = Course.objects.filter(course_status='published')[:6]
    return render(request, 'courses/home.html', {'courses': courses})

def course(request):
    return render(request, 'courses/course.html')

@login_required
@instructor_required
@user_is_authenticated
def create_course(request):
    if request.method == 'POST':
        course_title = request.POST.get('title')
        course_description = request.POST.get('description')
        is_free = request.POST.get('is_free') == 'on'
        raw_price = request.POST.get('price')
        price = raw_price if (not is_free and raw_price) else 0
        currency = request.POST.get('currency')

        # Get Instructor Profile
        instructor_profile = getattr(request.user, 'instructor_profile', None)
        if not instructor_profile:
             messages.error(request, "Instructor profile not found.")
             return redirect('home')

        if course_title and course_description:
            course = Course.objects.create(
                title=course_title,
                description=course_description,
                is_free=is_free,
                price=price,
                current=currency,
                instructor=instructor_profile
            )
            
            # Handle Thumbnail
            if 'thumbnail' in request.FILES:
                thumbnail = request.FILES['thumbnail']
                course.thumbnail = thumbnail
                course.save()

            # Handle Modules
            try:
                lesson_count = int(request.POST.get('lesson_count', 0))
                for i in range(1, lesson_count + 1):
                    module_title = request.POST.get(f'module_{i}_title')
                    module_description = request.POST.get(f'module_{i}_description')
                    # Only create if title is provided
                    if module_title:
                        Module.objects.create(
                            course=course,
                            title=module_title,
                            description=module_description,
                            order=i
                        )
            except ValueError:
                pass # Ignore if lesson_count is not a valid integer

            messages.success(request, "Course created successfully!")
            return redirect('course_detail', course_id=course.id)
        else:
            messages.error(request, "Title and description are required.")

    return render(request, 'courses/create_course.html')

def course_list(request):
    courses = Course.objects.filter(course_status='published')
    return render(request, 'courses/course_list.html', {'courses': courses})

@login_required
def course_detail(request, course_id):
    course = get_object_or_404(Course, id=course_id)

    enrollment_status = None
    if hasattr(request.user, 'learner_profile'):
        enrollment = Enrollment.objects.filter(learner=request.user.learner_profile, course=course).first()
        if enrollment:
            enrollment_status = enrollment.status

    return render(request, 'courses/course_detail.html', {
        'course': course,
        'enrollment_status': enrollment_status
    })

@login_required
def lesson_detail(request, lesson_id):
    lesson = get_object_or_404(Lesson, id=lesson_id)
    course = lesson.module.course
    
    # Safely get learner profile
    learner = None
    if hasattr(request.user, 'learner_profile'):
        learner = request.user.learner_profile

    # Access Control
    has_access = False
    
    if course.is_locked:
        messages.error(request, "This course content is currently locked by the administrator.")
        return redirect('course_detail', course_id=course.id)

    # 1. Instructor of the course
    if request.user.is_authenticated and request.user.user_type == 'instructor':
        if hasattr(request.user, 'instructor_profile') and course.instructor == request.user.instructor_profile:
            has_access = True
            
    # 2. Enrolled Learner with Active status
    if not has_access and learner:
        # Check active enrollment
        if Enrollment.objects.filter(learner=learner, course=course, status='active').exists():
            has_access = True
            
    if not has_access:
        messages.error(request, "You must be enrolled and approved to view this lesson.")
        return redirect('course_detail', course_id=course.id)

    # Handle "Mark as Complete" action
    if request.method == 'POST' and 'mark_complete' in request.POST:
        if learner:
            LessonProgress.objects.update_or_create(
                learner=learner,
                lesson=lesson,
                defaults={'is_completed': True}
            )
            
            # Check course completion
            check_and_update_course_completion(learner, course)
            
            # Find next lesson
            next_lesson = Lesson.objects.filter(
                module=lesson.module, 
                order__gt=lesson.order,
                is_published=True
            ).first()
            
            if not next_lesson:
                # Check next module
                next_module = Module.objects.filter(
                    course=course,
                    order__gt=lesson.module.order
                ).first()
                if next_module:
                    next_lesson = next_module.lessons.filter(is_published=True).first()
            
            if next_lesson:
                return redirect('lesson_detail', lesson_id=next_lesson.id)
            else:
                enrollment = Enrollment.objects.filter(learner=learner, course=course).first()
                if enrollment and enrollment.status == 'completed':
                    messages.success(request, "Course completed successfully!")
                else:
                    messages.success(request, "All lessons completed! Please ensure you have passed all quizzes to complete the course.")
                return redirect('course_detail', course_id=course.id)

    # Get Sidebar Data (Modules & Lessons with Progress)
    modules = course.modules.prefetch_related('lessons').all()
    
    completed_lesson_ids = []
    if learner:
        completed_lesson_ids = LessonProgress.objects.filter(
            learner=learner,
            lesson__module__course=course,
            is_completed=True
        ).values_list('lesson_id', flat=True)

    return render(request, 'courses/lesson_detail.html', {
        'lesson': lesson,
        'modules': modules,
        'completed_lesson_ids': completed_lesson_ids
    })

@login_required
@instructor_required
def add_lesson(request, module_id):
    module = get_object_or_404(Module, id=module_id)
    course = module.course
    
    # Check if user is the instructor of the course
    if request.user.user_type == 'instructor':
        if not course.instructor or course.instructor.user != request.user:
             messages.error(request, "You are not authorized to add lessons to this course.")
             # If accessible, redirect to course detail, else home
             return redirect('course_detail', course_id=course.id)

    if request.method == 'POST':
        form = LessonForm(request.POST, request.FILES)
        if form.is_valid():
            lesson = form.save(commit=False)
            lesson.module = module
            lesson.save()
            messages.success(request, "Lesson added successfully!")
            return redirect('course_detail', course_id=module.course.id)
    else:
        form = LessonForm(initial={'module': module})
    
    return render(request, 'courses/add_lesson.html', {'form': form, 'module': module})

@login_required
@instructor_required
def edit_lesson(request, lesson_id):
    lesson = get_object_or_404(Lesson, id=lesson_id)
    course = lesson.module.course
    
    # Check authorization
    if request.user.user_type == 'instructor':
        if not course.instructor or course.instructor.user != request.user:
             messages.error(request, "You are not authorized to edit this lesson.")
             return redirect('course_detail', course_id=course.id)

    if request.method == 'POST':
        form = LessonForm(request.POST, request.FILES, instance=lesson)
        if form.is_valid():
            form.save()
            messages.success(request, "Lesson updated successfully!")
            return redirect('lesson_detail', lesson_id=lesson.id)
    else:
        form = LessonForm(instance=lesson)
    
    return render(request, 'courses/edit_lesson.html', {'form': form, 'lesson': lesson})

@user_is_authenticated
@user_is_learner_or_instructor
def quiz_detail(request, quiz_id):
    quiz = get_object_or_404(Quizes, id=quiz_id)
    
    # Determine Course based on Quiz Type
    course = None
    if quiz.course:
        course = quiz.course
    elif quiz.module:
        course = quiz.module.course
    elif quiz.lesson:
        course = quiz.lesson.module.course
        
    if not course:
        messages.error(request, "Invalid quiz configuration: Course not found.")
        return redirect('home')

    # Check if quiz is locked
    if quiz.is_locked:
        messages.error(request, "This quiz/exam is currently locked by the instructor.")
        return redirect('course_detail', course_id=course.id)
        
    if course.is_locked:
        messages.error(request, "This course content is currently locked by the administrator.")
        return redirect('course_detail', course_id=course.id)
    
    # Access Control
    has_access = False
    
    # 1. Instructor of the course
    if request.user.user_type == 'instructor':
        if hasattr(request.user, 'instructor_profile') and course.instructor == request.user.instructor_profile:
            has_access = True
            
    # 2. Enrolled Learner with Active status
    if not has_access and hasattr(request.user, 'learner_profile'):
        learner = request.user.learner_profile
        if Enrollment.objects.filter(learner=learner, course=course, status='active').exists():
            has_access = True
            
    if not has_access:
        messages.error(request, "You must be enrolled and approved to take this quiz.")
        return redirect('course_detail', course_id=course.id)

    return render(request, 'courses/quiz_detail.html', {
        'quiz': quiz
    })


@login_required
@instructor_required
def instructor_dashboard(request):
    instructor = getattr(request.user, 'instructor_profile', None)
    if not instructor:
        messages.error(request, "Instructor profile not found.")
        return redirect('home')
    
    courses = Course.objects.filter(instructor=instructor)
    pending_enrollments = Enrollment.objects.filter(course__instructor=instructor, status='pending')
    
    return render(request, 'courses/instructor_dashboard.html', {
        'courses': courses,
        'pending_enrollments': pending_enrollments
    })

@login_required
def enroll_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)

    # Ensure user has a learner profile
    if not hasattr(request.user, 'learner_profile'):
        # If user is not a learner (e.g. instructor/admin), maybe allowing them to enroll as learner?
        # Ideally, create a learner profile or just error.
        # For now, let's auto-create if missing or redirect.
        # Given earlier signal, they 'should' handle it, but if they are instructor only...
        messages.error(request, "You need a learner profile to enroll.")
        return redirect('course_detail', course_id=course_id)

    learner = request.user.learner_profile
    
    # Check if already enrolled
    if Enrollment.objects.filter(learner=learner, course=course).exists():
        messages.info(request, "You are already enrolled in this course.")
        return redirect('course_detail', course_id=course_id)

    # Determine status
    # Logic: Free -> Active immediately. Paid -> Pending approval.
    status = 'active' if course.is_free else 'pending'
    
    Enrollment.objects.create(learner=learner, course=course, status=status)
    
    if status == 'active':
        try:
            send_course_enrollment_email(learner, course)
        except Exception as e:
            logger.error(f"Failed to send enrollment email to {request.user.email}: {e}")
        messages.success(request, "Enrolled successfully! You can start learning.")
    else:
        messages.info(request, "Enrollment requested. Please wait for instructor approval.")
        
    return redirect('course_detail', course_id=course_id)

@login_required
@instructor_required
def approve_enrollment(request, enrollment_id):
    enrollment = get_object_or_404(Enrollment, id=enrollment_id)
    course = enrollment.course
    
    # Verify instructor owns the course
    if course.instructor.user != request.user:
        messages.error(request, "Unauthorized action.")
        return redirect('instructor_dashboard')
        
    enrollment.status = 'active'
    enrollment.save()
    
    try:
        send_course_enrollment_email(enrollment.learner, course)
    except Exception as e:
        logger.error(f"Failed to send enrollment approval email to {enrollment.learner.user.email}: {e}")
        
    messages.success(request, f"Approved enrollment for {enrollment.learner.user.username}.")
    return redirect('instructor_dashboard')

@login_required
@instructor_required
def reject_enrollment(request, enrollment_id):
    enrollment = get_object_or_404(Enrollment, id=enrollment_id)
    course = enrollment.course
    
    # Verify instructor owns the course
    if course.instructor.user != request.user:
        messages.error(request, "Unauthorized action.")
        return redirect('instructor_dashboard')
        
    enrollment.status = 'dropped' # or delete? 'dropped' is safer history
    enrollment.save()
    messages.warning(request, f"Rejected enrollment for {enrollment.learner.user.username}.")
    return redirect('instructor_dashboard')

from .models import ReuseRequest
from .serializer import ReuseRequestSerializer

class ReuseRequestViewSet(viewsets.ModelViewSet):
    queryset = ReuseRequest.objects.all()
    serializer_class = ReuseRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.user_type == 'admin':
            return ReuseRequest.objects.all()
        if hasattr(user, 'instructor_profile'):
            from django.db.models import Q
            return ReuseRequest.objects.filter(Q(requester=user.instructor_profile) | Q(owner=user.instructor_profile))
        return ReuseRequest.objects.none()

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'instructor_profile'):
            serializer.save(requester=self.request.user.instructor_profile)
        else:
            raise PermissionDenied("Only instructors can make reuse requests.")

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        reuse_req = self.get_object()
        user = request.user
        
        if not (user.is_superuser or user.user_type == 'admin' or (hasattr(user, 'instructor_profile') and reuse_req.owner == user.instructor_profile)):
            raise PermissionDenied("You do not have permission to approve this request.")
            
        if reuse_req.status != 'PENDING':
            return Response({'error': 'Request is not pending.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            self._clone_content(reuse_req)
            reuse_req.status = 'APPROVED'
            reuse_req.save()
            
            # Send Notification
            from SuperSetting.models import Notification
            Notification.objects.create(
                title="Reuse Request Approved",
                message=f"Your request to reuse {reuse_req.content_type} {reuse_req.object_id} has been approved.",
                notification_type="system"
            )
            return Response({'status': 'approved and cloned'})
        except Exception as e:
            logger.error(f"Clone failed: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        reuse_req = self.get_object()
        user = request.user
        
        if not (user.is_superuser or user.user_type == 'admin' or (hasattr(user, 'instructor_profile') and reuse_req.owner == user.instructor_profile)):
            raise PermissionDenied("You do not have permission to reject this request.")
            
        reuse_req.status = 'REJECTED'
        reuse_req.save()
        return Response({'status': 'rejected'})

    def _clone_content(self, reuse_req):
        ctype = reuse_req.content_type
        obj_id = reuse_req.object_id
        dest_id = reuse_req.destination_id
        
        if ctype == 'module':
            original = get_object_or_404(Module, id=obj_id)
            dest_course = get_object_or_404(Course, id=dest_id)
            new_module = Module.objects.create(
                course=dest_course,
                title=f"{original.title} (Copy)",
                description=original.description,
                order=original.order,
                is_published=False
            )
            for lesson in original.lessons.all():
                Lesson.objects.create(
                    module=new_module,
                    title=lesson.title,
                    content=lesson.content,
                    video_url=lesson.video_url,
                    order=lesson.order,
                    is_published=False,
                    is_preview=lesson.is_preview
                )
        elif ctype == 'lesson':
            original = get_object_or_404(Lesson, id=obj_id)
            dest_module = get_object_or_404(Module, id=dest_id)
            Lesson.objects.create(
                module=dest_module,
                title=f"{original.title} (Copy)",
                content=original.content,
                video_url=original.video_url,
                order=original.order,
                is_published=False,
                is_preview=original.is_preview
            )
        elif ctype == 'course':
            original = get_object_or_404(Course, id=obj_id)
            new_course = Course.objects.create(
                title=f"{original.title} (Copy)",
                description=original.description,
                course_status='draft',
                difficulty=original.difficulty,
                is_free=original.is_free,
                price=original.price,
                current=original.current,
                instructor=reuse_req.requester
            )
            for mod in original.modules.all():
                new_mod = Module.objects.create(
                    course=new_course,
                    title=mod.title,
                    description=mod.description,
                    order=mod.order,
                    is_published=False
                )
                for lesson in mod.lessons.all():
                    Lesson.objects.create(
                        module=new_mod,
                        title=lesson.title,
                        content=lesson.content,
                        video_url=lesson.video_url,
                        order=lesson.order,
                        is_published=False,
                        is_preview=lesson.is_preview
                    )
        elif ctype == 'training':
            from training.models import Training, TrainingCourses, TrainingClasswork, TrainingFinalExam
            original = get_object_or_404(Training, id=obj_id)
            new_training = Training.objects.create(
                title=f"{original.title} (Copy)",
                description=original.description,
                starting_date=original.starting_date,
                ending_date=original.ending_date,
                instructor=reuse_req.requester
            )
            for tc in original.courses.all():
                TrainingCourses.objects.create(training=new_training, course=tc.course)
            for cw in original.classworks.all():
                TrainingClasswork.objects.create(
                    training=new_training,
                    title=cw.title,
                    description=cw.description,
                    due_date=cw.due_date,
                    linked_quiz=cw.linked_quiz
                )
            for exam in original.final_exams.all():
                TrainingFinalExam.objects.create(
                    training=new_training,
                    title=exam.title,
                    description=exam.description,
                    exam_date=exam.exam_date,
                    linked_exam=exam.linked_exam
                )
        elif ctype == 'classwork':
            from training.models import Training, TrainingClasswork
            original = get_object_or_404(TrainingClasswork, id=obj_id)
            dest_training = get_object_or_404(Training, id=dest_id)
            TrainingClasswork.objects.create(
                training=dest_training,
                title=f"{original.title} (Copy)",
                description=original.description,
                due_date=original.due_date,
                linked_quiz=original.linked_quiz
            )
        elif ctype == 'exam':
            from training.models import Training, TrainingFinalExam
            original = get_object_or_404(TrainingFinalExam, id=obj_id)
            dest_training = get_object_or_404(Training, id=dest_id)
            TrainingFinalExam.objects.create(
                training=dest_training,
                title=f"{original.title} (Copy)",
                description=original.description,
                exam_date=original.exam_date,
                linked_exam=original.linked_exam
            )





