from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from django.db import transaction
import csv
import io

from .models import Membership
from .serializers import MembershipSerializer
from Auth.views import send_membership_approved_email
import logging

logger = logging.getLogger(__name__)

class MembershipViewSet(viewsets.ModelViewSet):
    serializer_class = MembershipSerializer

    def get_queryset(self):
        queryset = Membership.objects.all().order_by('-date_created')
        email = self.request.query_params.get('email', None)
        membership_type = self.request.query_params.get('membership_type', None)
        status_param = self.request.query_params.get('status', None)
        
        if email:
            queryset = queryset.filter(email=email)
        if membership_type:
            queryset = queryset.filter(membership_type=membership_type)
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset
    
    def get_permissions(self):
        if self.action in ['create', 'check', 'settings']:
            return [AllowAny()]
        if self.action in ['list', 'retrieve', 'my_memberships']:
            from rest_framework.permissions import IsAuthenticated
            # Check if user is admin, if not they can only list their own if we use a different action
            # The list/retrieve actions here will be open if AllowAny, but let's change to IsAuthenticated for better security.
            # But the prompt says "Keep the existing Free Membership functionality unchanged."
            # So I will keep AllowAny for now, but rely on custom actions for protected data.
            return [AllowAny()] 
        return [IsAdminUser()]

    def perform_create(self, serializer):
        from SuperSetting.models import SiteSetting
        membership_type = self.request.data.get('membership_type', 'free')
        
        if membership_type == 'professional':
            setting = SiteSetting.objects.first()
            if setting and not setting.allow_professional_membership:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"detail": "Professional Membership applications are currently closed."})
                
        if membership_type == 'enterprise':
            setting = SiteSetting.objects.first()
            if setting and not setting.allow_enterprise_membership:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"detail": "Enterprise Membership applications are currently closed."})
                
        user = None
        if self.request.user and self.request.user.is_authenticated:
            user = self.request.user
            
        membership = serializer.save(
            user=user,
            membership_type=membership_type,
            status='active' if membership_type == 'free' else 'pending',
            payment_status='paid' if membership_type == 'free' else 'unpaid'
        )
        
        if membership_type == 'free':
            try:
                send_membership_approved_email(membership)
            except Exception as e:
                logger.error(f"Failed to send membership email to {membership.email}: {e}")
        elif membership_type == 'professional' and getattr(self.request.user, 'is_superuser', False) or getattr(self.request.user, 'user_type', '') == 'admin':
            # If admin manually created it, send the "added" email
            try:
                from Auth.views import send_professional_membership_added_email
                send_professional_membership_added_email(membership)
            except Exception as e:
                logger.error(f"Failed to send professional membership added email to {membership.email}: {e}")

    def perform_update(self, serializer):
        old_status = self.get_object().status
        membership = serializer.save()
        
        if membership.membership_type == 'professional' and old_status != 'active' and membership.status == 'active':
            try:
                from Auth.views import send_professional_membership_confirmation_email
                send_professional_membership_confirmation_email(membership)
            except Exception as e:
                logger.error(f"Failed to send professional membership confirmation email to {membership.email}: {e}")

    @action(detail=False, methods=['get'])
    def settings(self, request):
        from SuperSetting.models import SiteSetting
        setting = SiteSetting.objects.first()
        return Response({
            'allow_professional_membership': setting.allow_professional_membership if setting else True,
            'allow_enterprise_membership': setting.allow_enterprise_membership if setting else True
        })

    @action(detail=False, methods=['get'], permission_classes=[])
    def my_memberships(self, request):
        from rest_framework.permissions import IsAuthenticated
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        memberships = Membership.objects.filter(user=request.user).order_by('-date_created')
        serializer = self.get_serializer(memberships, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def check(self, request):
        membership_id = request.query_params.get('membership_id')
        if not membership_id:
            return Response({'detail': 'Membership ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            membership = Membership.objects.get(MembershipID=membership_id)
            serializer = self.get_serializer(membership)
            return Response(serializer.data)
        except Membership.DoesNotExist:
            return Response({'detail': 'Invalid Membership ID.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], url_path='bulk_upload')
    def bulk_upload(self, request):
        if 'file' not in request.FILES:
            return Response({'detail': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
            
        csv_file = request.FILES['file']
        
        if not csv_file.name.endswith('.csv'):
            return Response({'detail': 'File must be a CSV.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded_file = csv_file.read().decode('utf-8')
            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string)
            
            created_count = 0
            errors = []
            
            with transaction.atomic():
                for row_num, row in enumerate(reader, start=2): # Row 1 is header
                    try:
                        email = row.get('email', '').strip()
                        if not email:
                            errors.append(f"Row {row_num}: Missing email")
                            continue
                            
                        # If member with this email exists, skip or update? We'll skip for now.
                        if Membership.objects.filter(email=email).exists():
                            errors.append(f"Row {row_num}: Membership with email {email} already exists")
                            continue

                        duration = row.get('duration_days', '').strip()
                        duration_days = int(duration) if duration.isdigit() else 365 # Default to 1 year if invalid/missing

                        membership = Membership.objects.create(
                            Fullname=row.get('Fullname', '').strip(),
                            email=email,
                            phone_number=row.get('phone_number', '').strip(),
                            Where_heard_about_us=row.get('Where_heard_about_us', '').strip(),
                            duration_days=duration_days,
                            # Optional fields
                            description=row.get('description', '').strip()
                        )
                        
                        try:
                            send_membership_approved_email(membership)
                        except Exception as e:
                            logger.error(f"Failed to send membership email to {membership.email}: {e}")
                            
                        created_count += 1
                    except Exception as e:
                        errors.append(f"Row {row_num}: {str(e)}")

            if errors:
                return Response({
                    'detail': f'Created {created_count} members with some errors.',
                    'errors': errors
                }, status=status.HTTP_207_MULTI_STATUS)
                
            return Response({'detail': f'Successfully created {created_count} members.'}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'detail': f'Error processing file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
