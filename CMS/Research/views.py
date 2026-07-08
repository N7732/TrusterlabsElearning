from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from .models import ResearchPublication, Webinar, WebinarRegistration
from .serializers import ResearchPublicationSerializer, WebinarSerializer, WebinarRegistrationSerializer
from Membership.models import Membership
from Auth.views import send_webinar_registration_email
import logging

logger = logging.getLogger(__name__)

class ResearchPublicationViewSet(viewsets.ModelViewSet):
    queryset = ResearchPublication.objects.all().order_by('-publication_date')
    serializer_class = ResearchPublicationSerializer

    def get_permissions(self):
        if self.request.method in ['GET']:
            return [AllowAny()]
        return [IsAdminUser()]

class WebinarViewSet(viewsets.ModelViewSet):
    queryset = Webinar.objects.all().order_by('date_time')
    serializer_class = WebinarSerializer

    def get_permissions(self):
        if self.request.method in ['GET']:
            return [AllowAny()]
        return [IsAdminUser()]

class WebinarRegistrationViewSet(viewsets.ModelViewSet):
    queryset = WebinarRegistration.objects.all().order_by('-registration_date')
    serializer_class = WebinarRegistrationSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [AllowAny()]
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        webinar_id = request.data.get('webinar')
        if not webinar_id:
            return Response({'detail': 'Webinar ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            webinar = Webinar.objects.get(id=webinar_id)
        except Webinar.DoesNotExist:
            return Response({'detail': 'Webinar not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        if webinar.requires_membership_id:
            membership_id = request.data.get('membership_id')
            if not membership_id:
                return Response({'detail': 'This webinar requires a valid Membership ID.'}, status=status.HTTP_400_BAD_REQUEST)
                
            # Verify the membership ID exists
            if not Membership.objects.filter(MembershipID=membership_id).exists():
                return Response({'detail': 'Invalid Membership ID.'}, status=status.HTTP_400_BAD_REQUEST)
                
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        registration = serializer.save()
        try:
            send_webinar_registration_email(registration)
        except Exception as e:
            logger.error(f"Failed to send webinar registration email to {registration.email}: {e}")
