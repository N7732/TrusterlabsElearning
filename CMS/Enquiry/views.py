from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Requrement
from .serializer import RequirementSerializer
from Course.models import Enrollment, Course

class RequirementViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
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
        inquiry = serializer.save(user=self.request.user)
        
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
                student_name = f"{inquiry.user.first_name} {inquiry.user.last_name}".strip() or inquiry.user.username
                student_email = inquiry.email or inquiry.user.email
                student_phone = inquiry.phone_number or getattr(inquiry.user, 'phone_number', 'Not provided')
                
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
    def enroll_student(self, request, pk=None):
        inquiry = self.get_object()
        
        if inquiry.status == 'enrolled':
            return Response({'error': 'Student already enrolled from this inquiry'}, status=status.HTTP_400_BAD_REQUEST)
            
        if not inquiry.course:
            return Response({'error': 'This inquiry is not linked to a course'}, status=status.HTTP_400_BAD_REQUEST)
            
        learner = getattr(inquiry.user, 'learner_profile', None)
        if not learner:
            return Response({'error': 'User is not a learner'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Create enrollment
        Enrollment.objects.get_or_create(
            learner=learner, 
            course=inquiry.course, 
            defaults={'status': 'active'}
        )
        
        # Update inquiry status
        inquiry.status = 'enrolled'
        inquiry.save()
        
        return Response({'message': 'Student successfully enrolled!'}, status=status.HTTP_200_OK)

