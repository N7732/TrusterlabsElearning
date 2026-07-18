from django.shortcuts import render, redirect

from .models import Learner, Instructor, User
from .form import LearnerForm, InstructorForm, AccountProfileForm, LearnerRegistrationForm, LoginForm, InstructorRegistrationForm
from .serializer import LearnerSerializer, InstructorSerializer, AdminInstructorCreationSerializer
from rest_framework import viewsets, permissions
from django.contrib.auth import login, authenticate, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from Auth.decorator import learner_required, instructor_required, is_admin

from django.utils import timezone

class LearnerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Learner instances.
    """
    queryset = Learner.objects.all()
    serializer_class = LearnerSerializer
    permission_classes = [permissions.IsAdminUser]

class InstructorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Instructor instances.
    """
    queryset = Instructor.objects.all()
    serializer_class = InstructorSerializer
    permission_classes = [permissions.IsAdminUser]

def learn_registration(request):
    """
    Handles learner registration.

    Args:
        request (HttpRequest): The request object.

    Returns:
        HttpResponse: The rendered registration page or a redirect.
    """
    if request.method == 'POST':
        form = LearnerRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.user_type = 'learner'
            user.save()
            login(request, user)
            messages.success(request, "Registration successful. Welcome!")
            return redirect('home')
    else:
        form = LearnerRegistrationForm()
    
    return render(request, 'accounts/learner_register.html', {'form': form})

def instructor_register(request, token=None):
    """
    Handles instructor registration.
    """
    if request.method == 'POST':
        form = InstructorRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.user_type = 'instructor'
            user.save()
            
            # Create instructor profile
            Instructor.objects.create(
                user=user,
                phone_number=form.cleaned_data.get('phone_number', ''),
                bio=form.cleaned_data.get('bio', ''),
                specialization=form.cleaned_data.get('professional_title', '')
            )
            
            login(request, user)
            messages.success(request, "Instructor registration successful. Welcome!")
            return redirect('instructor_dashboard')
    else:
        form = InstructorRegistrationForm()
    
    return render(request, 'accounts/instructor_register.html', {'form': form})


from django.contrib.auth import get_user_model

def user_login(request):
    """
    Handles user login.

    Args:
        request (HttpRequest): The request object.

    Returns:
        HttpResponse: The rendered login page or a redirect.
    """
    if request.user.is_authenticated:
        if request.user.user_type == 'instructor':
            return redirect('instructor_dashboard')
        else:
            return redirect('home')
        
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data.get('email')
            password = form.cleaned_data.get('password')
            
            User = get_user_model()
            try:
                user_obj = User.objects.get(email=email)
                authenticated_user = authenticate(request, username=user_obj.username, password=password)
                if authenticated_user is not None:
                    login(request, authenticated_user)
                    if authenticated_user.is_superuser or authenticated_user.user_type == 'admin':
                         return redirect('admin:index')
                    elif authenticated_user.user_type == 'instructor':
                        return redirect('instructor_dashboard')
                    else:
                        return redirect('home')
                else:
                    messages.error(request, "Invalid email or password.")
            except User.DoesNotExist:
                messages.error(request, "User with this email does not exist.")
    else:
        form = LoginForm()
            
    return render(request, 'accounts/login.html', {'form': form})

def user_logout(request):
    """
    Handles user logout.

    Args:
        request (HttpRequest): The request object.

    Returns:
        HttpResponse: A redirect to the login page.
    """
    print("LOGOUT CALLED")
    logout(request)
    return redirect('Auth:login')

def profile(request):
    """
    Displays and processes the account profile form.

    Args:
        request (HttpRequest): The request object.

    Returns:
        HttpResponse: The rendered profile page or a redirect.
    """
    if not request.user.is_authenticated:
        return redirect('Auth:login')
    
    if request.method == 'POST':
        form = AccountProfileForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, "Profile updated successfully.")
            return redirect('Auth:profile')
    else:
        form = AccountProfileForm(instance=request.user)
    
    return render(request, 'accounts/profile.html', {'form': form})

#For Edithing Student Profile 
@login_required
@learner_required
def learner_edit_profile(request):
    """
    Allows a learner to edit their specific profile details.

    Args:
        request (HttpRequest): The request object.

    Returns:
        HttpResponse: The rendered edit profile page or a redirect.
    """
    if not request.user.is_authenticated or not hasattr(request.user, 'learner_profile'):
        return redirect('Auth:login')
    
    learner = request.user.learner_profile
    
    if request.method == 'POST':
        form = LearnerForm(request.POST, request.FILES, instance=learner)
        if form.is_valid():
            form.save()
            messages.success(request, "Profile updated successfully.")
            return redirect('Auth:profile')
    else:
        form = LearnerForm(instance=learner)
    
    return render(request, 'accounts/learner_edit_profile.html', {'form': form})

#For Editing Instructor Profile
@login_required
@instructor_required
def instructor_edit_profile(request):
    """
    Allows an instructor to edit their specific profile details.

    Args:
        request (HttpRequest): The request object.

    Returns:
        HttpResponse: The rendered edit profile page or a redirect.
    """
    if not request.user.is_authenticated or not hasattr(request.user, 'instructor_profile'):
        return redirect('Auth:login')
    
    instructor = request.user.instructor_profile
    
    if request.method == 'POST':
        form = InstructorForm(request.POST, request.FILES, instance=instructor)
        if form.is_valid():
            form.save()
            messages.success(request, "Profile updated successfully.")
            return redirect('Auth:profile')
    else:
        form = InstructorForm(instance=instructor)
    
    return render(request, 'accounts/instructor_edit_profile.html', {'form': form})

# For Static Pages
def about_as(request):
    """
    Renders the 'About Us' page.

    Args:
        request (HttpRequest): The request object.

    Returns:
        HttpResponse: The rendered about page.
    """
    return render(request, 'Auth/about.html')

def contact_as(request):
    """
    Renders the 'Contact Us' page.

    Args:
        request (HttpRequest): The request object.

    Returns:
        HttpResponse: The rendered contact page.
    """
    return render(request, 'Auth/contact.html')




# EMAIL DEALING ALL TEMPLATES AND VIEWS CAN BE ADDED HERE, SUCH AS PASSWORD RESET, ETC.
#=======================================================================================================================================


from django.contrib.auth import get_user_model
from django.contrib.auth.views import (
    PasswordResetView, PasswordResetDoneView, PasswordResetConfirmView, 
    PasswordResetCompleteView, PasswordChangeView, PasswordChangeDoneView
)
from django.urls import reverse_lazy
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


import threading

def send_email_async(email_message):
    try:
        print("Attempting to send email synchronously...")
        res = email_message.send()
        print("Email send result:", res)
    except Exception as e:
        print("CRITICAL EMAIL SEND ERROR:", e)
        logger.error(f"Failed to send email: {e}")
        raise e

class CustomPasswordResetView(PasswordResetView):

    subject = "Password Reset Requested"
    template_name = 'Resent_emali/password_reset_form.html'
    email_template_name = 'emails/password_reset_email.html'
    success_url = reverse_lazy('Auth:password_reset_done')

    def form_valid(self, form):
        
        email = form.cleaned_data.get('email')

        try:
            user = User.objects.get(email=email)
            token_generator = self.token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            reset_url = self.request.build_absolute_uri(
                reverse_lazy('Auth:password_reset_confirm', kwargs={'uidb64': uid, 'token': token_generator})
            )

            context = {
                'user': user,
                'reset_url': reset_url,
                'expiry_hours': 1,
                'settings': settings,
            }
            html_message = render_to_string(self.email_template_name, context)
            text_content = strip_tags(html_message)
            email_message = EmailMultiAlternatives(
                subject=self.subject,
                body=text_content,
                from_email=settings.EMAIL_HOST_USER,
                to = [user.email],
                )
            email_message.attach_alternative(html_message, "text/html")
            send_email_async(email_message)
        except User.DoesNotExist:
            pass # Do not reveal if email exists or not for security reasons

        messages.success(self.request, "Password reset email has been sent if the email exists in our system.")
        return super().form_valid(form)
    
class CustomPasswordResetDoneView(PasswordResetDoneView):
    template_name = 'Resent_emali/password_reset_done.html'

class CustomPasswordResetConfirmView(PasswordResetConfirmView):
    template_name = 'Resent_emali/password_reset_confirm.html'
    success_url = reverse_lazy('Auth:password_reset_complete')

    def form_valid(self, form):
        response = super().form_valid(form)
        user = self.request.user
        if user.is_authenticated:
            logger.info(f"Password reset successful for user: {user.email}")
        messages.success(self.request, "Your password has been reset successfully.")
        return response
    
class CustomPasswordResetCompleteView(PasswordResetCompleteView):
    template_name = 'Resent_emali/password_reset_complete.html'


class CustomPasswordChangeView(PasswordChangeView):
    template_name = 'Resent_emali/password_change_form.html'
    success_url = reverse_lazy('Auth:password_change_done')

    def form_valid(self, form):
        user = self.request.user
        logger.info(f"Password change successful for user: {user.email}")
        messages.success(self.request, "Your password has been changed successfully.")
        return super().form_valid(form)
    
class CustomPasswordChangeDoneView(PasswordChangeDoneView):

    template_name = 'Resent_emali/password_change_done.html'




def send_welcome_email(user):
    subject = "Welcome to Our E-Learning Platform!"
    context = {
        'user': user,
        'settings': settings,
    }
    html_message = render_to_string('emails/welcome_email.html', context)
    text_content = strip_tags(html_message)
    email_message = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.EMAIL_HOST_USER,
        to=[user.email],
    )
    email_message.attach_alternative(html_message, "text/html")
    send_email_async(email_message)


def send_course_enrollment_email(learner, course):
    subject = f"Enrollment Confirmation for {course.title}"
    context = {
        'learner': learner,
        'course': course,
        'settings': settings,
    }
    html_message = render_to_string('emails/enrolled.html', context)
    text_content = strip_tags(html_message)
    email_message = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.EMAIL_HOST_USER,
        to=[learner.user.email],
    )
    email_message.attach_alternative(html_message, "text/html")
    send_email_async(email_message)

def instructor_invitation_email(instructor, invitation):
    subject = "You're Invited to Join as an Instructor!"
    context = {
        'instructor': instructor,
        'invitation': invitation,
        'settings': settings,
    }
    html_message = render_to_string('Resent_emali/instructor_invitation_email.html', context)
    text_content = strip_tags(html_message)
    email_message = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.EMAIL_HOST_USER,
        to=[instructor.email],
    )
    email_message.attach_alternative(html_message, "text/html")
    send_email_async(email_message)

def instructor_welcome_email(user, temporary_password="Set by admin"):
    subject = "Welcome to the Faculty!"
    context = {
        'user': user,
        'temporary_password': temporary_password,
        'login_url': settings.LOGIN_URL,
        'settings': settings,
    }
    html_message = render_to_string('emails/welcomeinstructor.html', context)
    text_content = strip_tags(html_message)
    email_message = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.EMAIL_HOST_USER,
        to=[user.email],
    )
    email_message.attach_alternative(html_message, "text/html")
    send_email_async(email_message)

def send_membership_approved_email(membership):
    subject = "Your TrusterLab Membership is Approved!"
    context = {
        'user': {'first_name': membership.Fullname.split()[0] if membership.Fullname else 'Member'},
        'membership': {'membership_id': membership.MembershipID},
        'profile_url': settings.LOGIN_URL,
        'settings': settings,
    }
    html_message = render_to_string('emails/membership_approved.html', context)
    text_content = strip_tags(html_message)
    email_message = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.EMAIL_HOST_USER,
        to=[membership.email],
    )
    email_message.attach_alternative(html_message, "text/html")
    send_email_async(email_message)

def send_webinar_registration_email(registration):
    subject = f"Webinar Registration Confirmed: {registration.webinar.title}"
    context = {
        'user': {'first_name': registration.full_name.split()[0] if registration.full_name else 'Participant'},
        'registration': registration,
        'webinar': registration.webinar,
        'settings': settings,
    }
    html_message = render_to_string('emails/webinar_registration.html', context)
    text_content = strip_tags(html_message)
    email_message = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.EMAIL_HOST_USER,
        to=[registration.email],
    )
    email_message.attach_alternative(html_message, "text/html")
    send_email_async(email_message)


def certificate_email(learner, course, certificate):
    subject = f"Congratulations on Completing {course.title}!"
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://frontend-omega-five-21.vercel.app')
    context = {
        'learner': learner,
        'course': course,
        'certificate': certificate,
        'settings': settings,
        'frontend_url': frontend_url,
    }
    html_message = render_to_string('Resent_emali/certificate_email.html', context)
    text_content = strip_tags(html_message)
    email_message = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.EMAIL_HOST_USER,
        to=[learner.user.email],
    )
    email_message.attach_alternative(html_message, "text/html")
    send_email_async(email_message)

def update_email_to_student(course, request=None):
    """
    Sends a new course notification to all registered students and active subscribers.
    """
    instructor = course.instructor
    subject = f"New Course Alert: '{course.title}' is Now Live!"
    
    # Fetch all learners
    learner_emails = set(Learner.objects.all().values_list('user__email', flat=True))
    
    all_emails = list(learner_emails)
    
    if not all_emails:
        logger.info(f"No recipients found for course notification: {course.title}")
        return

    context = {
        'instructor': instructor,
        'course': course,
        'settings': settings,
        'request': request,
    }
    
    html_message = render_to_string('emails/newcourse_published.html', context)
    text_content = strip_tags(html_message)
    
    # Send in bulk using BCC to protect privacy
    email_message = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.EMAIL_HOST_USER,
        to=[settings.EMAIL_HOST_USER],
        bcc=all_emails,
        headers={
            'X-Email-Category': 'Promotion',
            'Precedence': 'bulk',
            'Auto-Submitted': 'auto-generated'
        }
    )
    email_message.attach_alternative(html_message, "text/html")
    
    try:
        send_email_async(email_message)
        logger.info(f"Successfully sent notification for '{course.title}' to {len(all_emails)} recipients.")
    except Exception as e:
        logger.error(f"Error sending course notification email: {str(e)}")

        context = {
        'instructor': instructor,
        'course': course,
        'settings': settings,
    }
        
    html_message = render_to_string('emails/newcourse_published.html', context)
    text_content = strip_tags(html_message)
    email_message = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.EMAIL_HOST_USER,
        to=[instructor.email],
    )
    email_message.attach_alternative(html_message, "text/html")
    send_email_async(email_message)

# API Views for React Integration
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializer import (
    LearnerRegistrationSerializer, InstructorRegistrationSerializer, 
    UserProfileSerializer, UserSerializer, CustomTokenObtainPairSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class LearnerRegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LearnerRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            try:
                send_welcome_email(user)
            except Exception as e:
                logger.error(f"Failed to send welcome email to {user.email}: {e}")
                
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Learner registered successfully",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InstructorRegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = InstructorRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Instructor registered successfully",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminInstructorCreationAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        if request.user.user_type != 'admin' and not request.user.is_superuser:
            return Response({"error": "Only admins can perform this action."}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = AdminInstructorCreationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            temp_password = request.data.get('password', 'Set by admin')
            try:
                instructor_welcome_email(user, temp_password)
            except Exception as e:
                logger.error(f"Failed to send instructor welcome email to {user.email}: {e}")
                
            return Response({
                "message": "Instructor created successfully by admin",
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode

class PasswordResetRequestAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # This matches the React route
            frontend_url = request.META.get('HTTP_ORIGIN', 'http://localhost:3000')
            reset_url = f"{frontend_url}/reset-password/{uid}/{token}"

            context = {
                'user': user,
                'reset_url': reset_url,
                'expiry_hours': 1,
                'settings': settings,
            }
            html_message = render_to_string('emails/password_reset_email.html', context)
            text_content = strip_tags(html_message)
            email_message = EmailMultiAlternatives(
                subject="Password Reset Requested",
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
            )
            email_message.attach_alternative(html_message, "text/html")
            try:
                send_email_async(email_message)
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Failed to send password reset email: {e}")
                return Response({'detail': 'Failed to send reset email due to server configuration. Please contact support.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except User.DoesNotExist:
            pass # Silently fail for security

        return Response({'message': 'If an account with that email exists, we sent you a reset link.'}, status=status.HTTP_200_OK)


class PasswordResetConfirmAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        re_new_password = request.data.get('re_new_password')

        if new_password != re_new_password:
            return Response({'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password has been reset successfully.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)

from Course.models import QuizSubmission
from Training.models import TrainingClassworkSubmission, TrainingFinalExamSubmission

class LearnerGradesAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        grades = []

        # 1. Quizzes (requires learner profile)
        if hasattr(user, 'learner_profile'):
            quiz_submissions = QuizSubmission.objects.filter(learner=user.learner_profile).select_related('quiz')
            for qs in quiz_submissions:
                grades.append({
                    'id': f"quiz_{qs.id}",
                    'title': qs.quiz.title,
                    'type': 'Course Quiz',
                    'score': qs.score,
                    'total_marks': qs.total_marks,
                    'status': 'Passed' if qs.passed else 'Failed',
                    'date': qs.submitted_at
                })

        # 2. Training Classworks
        classwork_submissions = TrainingClassworkSubmission.objects.filter(participant=user).select_related('classwork')
        for cs in classwork_submissions:
            grades.append({
                'id': f"cw_{cs.id}",
                'title': cs.classwork.title,
                'type': 'Training Classwork',
                'score': float(cs.score) if cs.score is not None else None,
                'total_marks': None,
                'status': 'Graded' if cs.score is not None else 'Pending Review',
                'date': cs.submission_date
            })

        # 3. Training Final Exams
        exam_submissions = TrainingFinalExamSubmission.objects.filter(participant=user).select_related('exam')
        for es in exam_submissions:
            grades.append({
                'id': f"exam_{es.id}",
                'title': es.exam.title,
                'type': 'Training Final Exam',
                'score': float(es.score) if es.score is not None else None,
                'total_marks': None,
                'status': 'Graded' if es.score is not None else 'Pending Review',
                'date': es.submission_date
            })

        # Sort by date descending
        grades.sort(key=lambda x: x['date'], reverse=True)
        return Response(grades, status=status.HTTP_200_OK)