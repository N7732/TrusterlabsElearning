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
        if email:
            queryset = queryset.filter(email=email)
        return queryset
    
    def get_permissions(self):
        if self.action in ['create', 'check']:
            return [AllowAny()]
        if self.action in ['list', 'retrieve']:
            return [AllowAny()] # Or IsAuthenticated if we prefer
        return [IsAdminUser()]

    def perform_create(self, serializer):
        membership = serializer.save()
        try:
            send_membership_approved_email(membership)
        except Exception as e:
            logger.error(f"Failed to send membership email to {membership.email}: {e}")

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
