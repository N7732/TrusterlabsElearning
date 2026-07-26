from django.shortcuts import render, redirect

from .models import Learner, Instructor, User
from .form import LearnerForm, InstructorForm, AccountProfileForm, LearnerRegistrationForm, LoginForm, InstructorRegistrationForm
from .serializer import LearnerSerializer, InstructorSerializer, AdminInstructorCreationSerializer
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
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

    @action(detail=False, methods=['post'], url_path='bulk_upload')
    def bulk_upload(self, request):
        if 'file' not in request.FILES:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
            
        csv_file = request.FILES['file']
        if not csv_file.name.endswith('.csv'):
            return Response({'detail': 'File must be a CSV.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            import csv
            import io
            from django.db import transaction
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            decoded_file = csv_file.read().decode('utf-8')
            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string)
            
            created_count = 0
            
            with transaction.atomic():
                for row_num, row in enumerate(reader, start=2):
                    email = row.get('email', '').strip()
                    if not email or User.objects.filter(email=email).exists():
                        continue

                    # Create Django User
                    user = User.objects.create_user(
                        username=email.split('@')[0] + str(row_num),
                        email=email,
                        password='ChangeMe123!',
                        first_name=row.get('first_name', '').strip() or row.get('full_name', '').strip().split(' ')[0],
                        last_name=row.get('last_name', '').strip() or ' '.join(row.get('full_name', '').strip().split(' ')[1:]),
                        user_type='learner'
                    )
                    
                    # Create Learner Profile
                    Learner.objects.create(
                        user=user,
                        email=email,
                        phone_number=row.get('phone_number', '').strip()
                    )
                    created_count += 1
                    
            return Response({'detail': f'Bulk upload successful. Created {created_count} learners.'}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class InstructorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Instructor instances.
    """
    queryset = Instructor.objects.all()
    serializer_class = InstructorSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['post'], url_path='bulk_upload')
    def bulk_upload(self, request):
        if 'file' not in request.FILES:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
            
        csv_file = request.FILES['file']
        if not csv_file.name.endswith('.csv'):
            return Response({'detail': 'File must be a CSV.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            import csv
            import io
            from django.db import transaction
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            decoded_file = csv_file.read().decode('utf-8')
            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string)
            
            created_count = 0
            
            with transaction.atomic():
                for row_num, row in enumerate(reader, start=2):
                    email = row.get('email', '').strip()
                    if not email or User.objects.filter(email=email).exists():
                        continue

                    # Create Django User
                    user = User.objects.create_user(
                        username=email.split('@')[0] + str(row_num),
                        email=email,
                        password='ChangeMe123!',
                        first_name=row.get('first_name', '').strip() or row.get('full_name', '').strip().split(' ')[0],
                        last_name=row.get('last_name', '').strip() or ' '.join(row.get('full_name', '').strip().split(' ')[1:]),
                        user_type='instructor'
                    )
                    
                    # Create Instructor Profile
                    Instructor.objects.create(
                        user=user,
                        phone_number=row.get('phone_number', '').strip(),
                        specialization=row.get('specialization', '').strip()
                    )
                    created_count += 1
                    
            return Response({'detail': f'Bulk upload successful. Created {created_count} instructors.'}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

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

from django.template import Template, Context
from SuperSetting.models import EmailTemplate

def render_email_template(template_name, context_dict, request=None):
    from django.template.loader import render_to_string
    basename = template_name.replace('emails/', '').replace('Resent_emali/', '').replace('.html', '')
    try:
        email_template = EmailTemplate.objects.get(template_name=basename)
        return Template(email_template.html_content).render(Context(context_dict)), email_template.subject
    except EmailTemplate.DoesNotExist:
        return render_to_string(template_name, context_dict, request=request), None

import threading

def send_email_async(email_message):
    def send_it():
        try:
            email_message.send()
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
    threading.Thread(target=send_it).start()

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
            context = {
                'email': user.email,
                'domain': 'trusterlab.com',
                'site_name': 'TrusterLab Platform',
                'uid': uid,
                'user': user,
                'token': token_generator,
                'protocol': 'https',
            }
            
            html_message, dynamic_subject = render_email_template(self.email_template_name, context, request=self.request)
            text_content = strip_tags(html_message)
            
            email_message = EmailMultiAlternatives(
                subject=dynamic_subject or self.subject,
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
    html_message, dynamic_subject = render_email_template('emails/welcome_email.html', context)
    text_content = strip_tags(html_message)
    email_message = EmailMultiAlternatives(
        subject=dynamic_subject or subject,
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
    html_message, dynamic_subject = render_email_template('emails/enrolled.html', context)
    text_content = strip_tags(html_message)
    email_message = EmailMultiAlternatives(
        subject=dynamic_subject or subject,
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
    html_message, dynamic_subject = render_email_template('Resent_emali/instructor_invitation_email.html', context)
    text_content = strip_tags(html_message)
    email_message = EmailMultiAlternatives(
        subject=dynamic_subject or subject,
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
    html_message, dynamic_subject = render_email_template('emails/welcomeinstructor.html', context)
    text_content = strip_tags(html_message)
    email_message = EmailMultiAlternatives(
        subject=dynamic_subject or subject,
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
    html_message, dynamic_subject = render_email_template('emails/membership_approved.html', context)
    text_content = strip_tags(html_message)
    email_message = EmailMultiAlternatives(
        subject=dynamic_subject or subject,
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
    html_message, dynamic_subject = render_email_template('emails/webinar_registration.html', context)
    text_content = strip_tags(html_message)
    email_message = EmailMultiAlternatives(
        subject=dynamic_subject or subject,
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
    html_message, dynamic_subject = render_email_template('Resent_emali/certificate_email.html', context)
    text_content = strip_tags(html_message)
    email_message = EmailMultiAlternatives(
        subject=dynamic_subject or subject,
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
    
    html_message, dynamic_subject = render_email_template('emails/newcourse_published.html', context)
    text_content = strip_tags(html_message)
    
    # Send in bulk using BCC to protect privacy
    email_message = EmailMultiAlternatives(
        subject=dynamic_subject or subject,
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
        
    html_message, dynamic_subject = render_email_template('emails/newcourse_published.html', context)
    text_content = strip_tags(html_message)
    email_message = EmailMultiAlternatives(
        subject=dynamic_subject or subject,
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
        
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'detail': 'No account found with this email address.'}, status=status.HTTP_404_NOT_FOUND)

        try:
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
            html_message, dynamic_subject = render_email_template('emails/password_reset_email.html', context)
            text_content = strip_tags(html_message)
            email_message = EmailMultiAlternatives(
                subject=dynamic_subject or "Password Reset Requested",
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
        except Exception as e:
            return Response({'detail': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'We have sent a password reset link to your email.'}, status=status.HTTP_200_OK)


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
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
from .models import Learner, Instructor

class GoogleLoginAPIView(APIView):
    """
    API endpoint for Google Authentication.
    Accepts `credential` (Google ID token) and `user_type` ('learner' or 'instructor').
    """
    permission_classes = []

    def post(self, request):
        token = request.data.get('credential')
        user_type = request.data.get('user_type', 'learner')  # Default to learner

        if not token:
            return Response({'error': 'No credential provided.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                settings.GOOGLE_CLIENT_ID
            )

            # Get user info from token
            email = idinfo.get('email')
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')

            # Check if user exists
            user, created = User.objects.get_or_create(email=email, defaults={
                'username': email,
                'first_name': first_name,
                'last_name': last_name,
                'user_type': user_type
            })

            # If user was created via Google, we must create their respective profile
            if created:
                user.set_unusable_password()  # Users created via Google don't have a password
                user.save()

                if user_type == 'learner':
                    Learner.objects.create(user=user, email=email, email_verified=True)
                elif user_type == 'instructor':
                    Instructor.objects.create(user=user, profile_picture_url=idinfo.get('picture', ''))
                
                # Create extended profile
                from .models import AccountProfile
                AccountProfile.objects.create(
                    user=user, 
                    profile_picture=idinfo.get('picture', '')  # Fallback if you change ImageField to URLField or just leave blank for ImageField
                )

            # Generate tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'user_type': user.user_type
                },
                'is_new_user': created
            }, status=status.HTTP_200_OK)

        except ValueError as e:
            # Invalid token
            return Response({'error': 'Invalid Google token.', 'details': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
