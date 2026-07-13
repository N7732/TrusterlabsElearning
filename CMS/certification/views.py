from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import Certificate
from .serializers import CertificateSerializer

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
            cert = Certificate.objects.get(certificate_code=code, is_issued=True)
            serializer = self.get_serializer(cert)
            return Response(serializer.data)
        except Certificate.DoesNotExist:
            return Response({"detail": "Invalid or unissued certificate."}, status=status.HTTP_404_NOT_FOUND)
