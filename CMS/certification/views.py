from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import Certificate
from .serializers import CertificateSerializer
from Course.models import Enrollment
from Training.models import TrainingParticipants, TrainingFinalExamSubmission
from SuperSetting.models import Notification

class CertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    
    def get_permissions(self):
        if self.action in ['verify_certificate']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.user_type == 'admin':
            return Certificate.objects.all()
        if hasattr(user, 'learner_profile'):
            return Certificate.objects.filter(learner=user.learner_profile, is_issued=True)
        if user.user_type == 'instructor':
            # Instructors can see certificates for their courses or trainings
            return Certificate.objects.filter(
                Q(course__instructor=user.instructor_profile) | 
                Q(training__instructor=user.instructor_profile)
            )
        return Certificate.objects.none()

    @action(detail=False, methods=['get'])
    def my_certificates(self, request):
        if not hasattr(request.user, 'learner_profile'):
            return Response({"detail": "Not a learner"}, status=status.HTTP_403_FORBIDDEN)
        certs = Certificate.objects.filter(learner=request.user.learner_profile, is_issued=True)
        serializer = self.get_serializer(certs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending_certificates(self, request):
        user = request.user
        if user.user_type == 'instructor':
            certs = Certificate.objects.filter(
                is_issued=False
            ).filter(
                Q(course__instructor=user.instructor_profile) | 
                Q(training__instructor=user.instructor_profile)
            )
        elif user.is_superuser or user.user_type == 'admin':
            certs = Certificate.objects.filter(is_issued=False)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        serializer = self.get_serializer(certs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def issue_certificate(self, request, pk=None):
        cert = self.get_object()
        user = request.user
        
        # Check permissions
        if user.user_type == 'instructor':
            is_course_instructor = cert.course and cert.course.instructor == user.instructor_profile
            is_training_instructor = cert.training and cert.training.instructor == user.instructor_profile
            if not (is_course_instructor or is_training_instructor):
                return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
        elif not (user.is_superuser or user.user_type == 'admin'):
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        if cert.is_issued:
            return Response({"detail": "Certificate is already issued."}, status=status.HTTP_400_BAD_REQUEST)
            
        cert.is_issued = True
        cert.issued_at = timezone.now()
        
        # Here you would generate the actual PDF/Image and save to cert.file
        # generate_certificate_file(cert)
        
        cert.save()
        
        # Send email notification
        from django.core.mail import EmailMultiAlternatives
        from Auth.views import render_email_template
        from django.conf import settings
        import os
        
        learner_name = cert.learner.user.get_full_name() or cert.learner.user.username
        # Handle dynamic program title gracefully
        if cert.course and cert.course.certificate_program_title:
            program_title = cert.course.certificate_program_title
        elif cert.training and getattr(cert.training, 'certificate_program_title', None):
            program_title = cert.training.certificate_program_title
        else:
            program_title = cert.program_title or (cert.course.title if cert.course else (cert.training.title if cert.training else 'Program'))
            
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        verify_url = f"{frontend_url}/verify/{cert.certificate_code}"
        
        context = {
            'learner_name': learner_name,
            'program_title': program_title,
            'certificate_id': cert.certificate_code,
            'verify_url': verify_url
        }
        
        html_content, dynamic_subject = render_email_template('emails/certificate_issued.html', context)
        subject = dynamic_subject or f"Your Certificate for {program_title} is Ready!"
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@trusterlabs.com')
        to_email = cert.learner.user.email
        
        if to_email:
            try:
                msg = EmailMultiAlternatives(subject, f"Congratulations! View and download your certificate at: {verify_url}", from_email, [to_email])
                msg.attach_alternative(html_content, "text/html")
                msg.send(fail_silently=True)
            except Exception as e:
                print(f"Failed to send certificate email: {e}")

        serializer = self.get_serializer(cert)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def render_html(self, request, pk=None):
        cert = self.get_object()
        course_name = cert.course.title if cert.course else (cert.training.title if cert.training else 'Unknown Program')
        learner_name = cert.learner.user.get_full_name()
        
        from django.template.loader import render_to_string
        from django.http import HttpResponse
        
        context = {
            'learner_name': learner_name,
            'course_name': course_name
        }
        
        # Render the template they provided
        html = render_to_string('CERTIFICATE-trusterlabs.html', context)
        return HttpResponse(html)

    @action(detail=False, methods=['get'], url_path='verify/(?P<code>[^/.]+)')
    def verify_certificate(self, request, code=None):
        try:
            import uuid
            try:
                uuid_obj = uuid.UUID(code, version=4)
                cert = Certificate.objects.get(certificate_code=uuid_obj, is_issued=True)
            except ValueError:
                cert = Certificate.objects.get(certificate_id=code, is_issued=True)
                
            serializer = self.get_serializer(cert)
            return Response(serializer.data)
        except Certificate.DoesNotExist:
            return Response({"detail": "Invalid or unissued certificate."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def eligible_learners(self, request):
        user = request.user
        if not (user.is_superuser or user.user_type in ['admin', 'instructor']):
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        # Get completed course enrollments
        enrollments = Enrollment.objects.filter(status='completed').select_related('learner__user', 'course')
        # Get completed training participants
        training_participants = TrainingParticipants.objects.filter(admission_status='COMPLETED').select_related('participant', 'training')

        results = []
        for e in enrollments:
            results.append({
                'id': f"course_{e.id}",
                'learner_id': e.learner.id,
                'learner_name': e.learner.user.get_full_name() or e.learner.user.username,
                'program_type': 'course',
                'program_id': e.course.id,
                'program_title': e.course.title,
                'score': float(e.score) if e.score else 0.0,
                'date_completed': e.enrolled_at, # fallback if completed_at not available
            })

        for p in training_participants:
            # try to find their final exam score
            final_exam = TrainingFinalExamSubmission.objects.filter(participant=p.participant, exam__training=p.training).order_by('-score').first()
            score = float(final_exam.score) if (final_exam and final_exam.score) else 0.0
            results.append({
                'id': f"training_{p.id}",
                'learner_id': p.participant.id, # We'll need a way to link to Learner profile when issuing, but learner profile has user_id
                'learner_name': p.application_full_name or p.participant.get_full_name() or p.participant.username,
                'program_type': 'training',
                'program_id': p.training.id,
                'program_title': p.training.title,
                'score': score,
                'date_completed': p.date_applied,
            })

        return Response(results)

    @action(detail=False, methods=['post'])
    def notify_learner(self, request):
        user = request.user
        if not (user.is_superuser or user.user_type in ['admin', 'instructor']):
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        learner_name = request.data.get('learner_name', 'Student')
        message = request.data.get('message', 'You did not meet the required marks.')
        
        # In a real app we'd email them. For now log it as a system notification
        Notification.objects.create(
            title=f"Notification sent to {learner_name}",
            message=message,
            notification_type='system'
        )
        return Response({"detail": "Notification sent successfully."})
