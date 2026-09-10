from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import UserProject, ConsultationMeeting
from .serializers import UserProjectSerializer, ConsultationMeetingSerializer
from Membership.models import Membership
from Auth.decorator import is_admin
import logging

logger = logging.getLogger(__name__)

class UserProjectViewSet(viewsets.ModelViewSet):
    serializer_class = UserProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'admin' or user.is_superuser:
            # Superadmin can see all projects and filter by type
            project_type = self.request.query_params.get('project_type', None)
            if project_type:
                return UserProject.objects.filter(project_type=project_type).order_by('-created_at')
            return UserProject.objects.all().order_by('-created_at')
        else:
            # Normal users see only their own projects
            return UserProject.objects.filter(owner=user).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        if user.user_type == 'admin' or user.is_superuser:
            # Admin creating TrusterLabs project
            project_type = self.request.data.get('project_type', 'trusterlabs')
            serializer.save(owner=user, project_type=project_type)
        else:
            # Normal user creating project
            # Check if they have an active professional membership
            membership = Membership.objects.filter(
                user=user, 
                membership_type='professional', 
                status='active', 
                payment_status='paid'
            ).first()
            
            if not membership:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"detail": "You must have an active Professional Membership to submit a project."})
                
            serializer.save(owner=user, membership=membership, project_type='user_submitted', status='submitted')

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def update_status(self, request, pk=None):
        project = self.get_object()
        new_status = request.data.get('status')
        if not new_status:
            return Response({"detail": "Status is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        old_status = project.status
        project.status = new_status
        project.save()
        
        if old_status != new_status:
            try:
                from Auth.views import send_project_status_update_email
                send_project_status_update_email(project, old_status, new_status)
            except Exception as e:
                logger.error(f"Failed to send project status update email: {e}")
                
        return Response(self.get_serializer(project).data)

class ConsultationMeetingViewSet(viewsets.ModelViewSet):
    serializer_class = ConsultationMeetingSerializer
    permission_classes = [IsAdminUser] # Only admins create/update meetings

    def get_queryset(self):
        return ConsultationMeeting.objects.all().order_by('-meeting_date', '-meeting_time')

    def perform_create(self, serializer):
        meeting = serializer.save()
        # Update project status to under_consultation automatically
        project = meeting.project
        if project.status == 'submitted':
            project.status = 'under_consultation'
            project.save()
            
        # Try sending email
        try:
            from Auth.views import send_project_consultation_scheduled_email
            send_project_consultation_scheduled_email(meeting)
        except Exception as e:
            logger.error(f"Failed to send consultation email: {e}")
