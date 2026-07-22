from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Requrement
from .serializer import RequirementSerializer
from Course.models import Enrollment, Course
from django.db import transaction

class RequirementViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    queryset = Requrement.objects.all()
    serializer_class = RequirementSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Requrement.objects.all().order_by('-created_at')
        if not user.is_authenticated:
            return Requrement.objects.none()
            
        if user.user_type == 'admin' or user.is_superuser:
            return queryset
            
        if user.user_type == 'instructor' and self.request.query_params.get('my_enquiries') == 'true':
            return queryset.filter(course__instructor=user.instructor_profile)
            
        return queryset.filter(user=user)

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        inquiry = serializer.save(user=user)
        
        # Send Email Notification
        course = inquiry.course
        if course:
            from django.core.mail import send_mail
            from django.conf import settings
            from Auth.models import User
            
            recipient_email = None
            if course.instructor and course.instructor.user and course.instructor.user.email:
                recipient_email = course.instructor.user.email
            else:
                # Send to superadmin if course has no instructor (e.g. offered by superadmin)
                superadmin = User.objects.filter(is_superuser=True).first()
                if superadmin and superadmin.email:
                    recipient_email = superadmin.email

            if recipient_email:
                if inquiry.user:
                    student_name = f"{inquiry.user.first_name} {inquiry.user.last_name}".strip() or inquiry.user.username
                else:
                    student_name = inquiry.name or "Guest User"
                
                student_email = inquiry.email or (inquiry.user.email if inquiry.user else 'No email')
                student_phone = inquiry.phone_number or (getattr(inquiry.user, 'phone_number', 'Not provided') if inquiry.user else 'Not provided')
                
                subject = f"New Enrollment Inquiry for {course.title}"
                message = f"Hello,\n\nA new student has submitted an inquiry to enroll in your course: {course.title}.\n\n" \
                          f"Details:\n" \
                          f"Name: {student_name}\n" \
                          f"Email: {student_email}\n" \
                          f"Phone: {student_phone}\n\n" \
                          f"Please check your dashboard to review and enroll the student.\n\n" \
                          f"Regards,\nTrusterLab Team"
                
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [recipient_email],
                    fail_silently=True,
                )


    @action(detail=True, methods=['post'])
    @transaction.atomic
    def enroll_student(self, request, pk=None):
        inquiry = self.get_object()
        
        if inquiry.status == 'enrolled':
            return Response({'error': 'Student already enrolled from this inquiry'}, status=status.HTTP_400_BAD_REQUEST)
            
        if not inquiry.course:
            return Response({'error': 'This inquiry is not linked to a course'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Instructor Authorization Check
        if request.user.user_type == 'instructor' and inquiry.course.instructor != getattr(request.user, 'instructor_profile', None):
            return Response({'error': 'You do not have permission to enroll students in this course.'}, status=status.HTTP_403_FORBIDDEN)
        elif request.user.user_type == 'learner':
            return Response({'error': 'Learners cannot enroll students.'}, status=status.HTTP_403_FORBIDDEN)
            
        from Auth.models import User, Learner
        
        user_to_enroll = inquiry.user
        password_created = False
        temp_password = ""
        
        if not user_to_enroll:
            if not inquiry.email:
                return Response({'error': 'No email provided in inquiry'}, status=status.HTTP_400_BAD_REQUEST)
                
            user_to_enroll = User.objects.filter(email=inquiry.email).first()
            
            if not user_to_enroll:
                import string
                import random
                from django.contrib.auth.hashers import make_password
                
                temp_password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
                
                name_parts = (inquiry.name or "").split(" ")
                first_name = name_parts[0] if name_parts else ""
                last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
                
                username = inquiry.email.split('@')[0]
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                
                user_to_enroll = User.objects.create(
                    username=username,
                    email=inquiry.email,
                    first_name=first_name,
                    last_name=last_name,
                    user_type='learner',
                    password=make_password(temp_password)
                )
                password_created = True
                
        learner = getattr(user_to_enroll, 'learner_profile', None)
        if not learner:
            learner = Learner.objects.create(user=user_to_enroll)
            
        Enrollment.objects.get_or_create(
            learner=learner, 
            course=inquiry.course, 
            defaults={'status': 'active'}
        )
        
        inquiry.status = 'enrolled'
        if not inquiry.user:
            inquiry.user = user_to_enroll
        inquiry.save()
        
        try:
            from django.core.mail import EmailMultiAlternatives
            from django.template.loader import render_to_string
            from django.utils.html import strip_tags
            from django.conf import settings
            from Auth.views import send_email_async, render_email_template
            
            context = {
                'user': user_to_enroll,
                'course': inquiry.course,
                'settings': settings,
                'password_created': password_created,
                'temp_password': temp_password,
                'frontend_url': getattr(settings, 'FRONTEND_URL', 'https://frontend-omega-five-21.vercel.app')
            }
            html_message, dynamic_subject = render_email_template('emails/enquiry_enrolled.html', context)
            text_content = strip_tags(html_message)
            email_message = EmailMultiAlternatives(
                subject=dynamic_subject or f"You have been enrolled in {inquiry.course.title}!",
                body=text_content,
                from_email=settings.EMAIL_HOST_USER,
                to=[user_to_enroll.email],
            )
            email_message.attach_alternative(html_message, "text/html")
            send_email_async(email_message)
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to send enrollment email from inquiry: {e}")
        
        return Response({'message': 'Student successfully enrolled!'}, status=status.HTTP_200_OK)

