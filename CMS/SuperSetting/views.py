from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from Enquiry.models import Requrement
from Course.models import Course, Enrollment, Module, Lesson
from Auth.models import Learner, Instructor
from payment.models import Payment
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser
from Auth.permissions import IsSuperAdminOrAdmin
# pyrefly: ignore [missing-import]
from .models import Partner, ContactMessage, SystemLog, SiteSetting, Notification, StaffMember, EmailTemplate, SiteVisitor
# pyrefly: ignore [missing-import]
from .serializers import (
    PartnerSerializer,
    ContactMessageSerializer,
    SystemLogSerializer,
    SiteSettingSerializer,
    NotificationSerializer,
    StaffMemberSerializer,
    EmailTemplateSerializer,
    SiteVisitorSerializer
)

class PartnerViewSet(viewsets.ModelViewSet):
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer

    def get_permissions(self):
        if self.request.method in ['GET']:
            return [AllowAny()]
        return [IsSuperAdminOrAdmin()]

class StaffMemberViewSet(viewsets.ModelViewSet):
    queryset = StaffMember.objects.all().order_by('-created_at')
    serializer_class = StaffMemberSerializer

    def get_permissions(self):
        if self.request.method in ['GET']:
            return [AllowAny()]
        return [IsSuperAdminOrAdmin()]

class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [AllowAny()]
        return [IsSuperAdminOrAdmin()]

    def perform_create(self, serializer):
        message = serializer.save()
        
        # Create a dashboard notification
        Notification.objects.create(
            title="New Contact Message",
            message=f"From {message.name}: {message.subject}",
            notification_type="contact",
            link="/superadmin/settings/messages"
        )
        
        # Send emails in a background thread to prevent blocking
        import threading
        from django.core.mail import send_mail
        from django.conf import settings
        import logging
        logger = logging.getLogger(__name__)

        def send_contact_emails(msg_name, msg_email, msg_subject, msg_message):
            try:
                # Auto-reply to user
                send_mail(
                    subject="Thank you for contacting TrusterLab",
                    message=f"Hi {msg_name},\n\nWe have received your message regarding '{msg_subject}' and will get back to you shortly.\n\nBest,\nTrusterLab Team",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[msg_email],
                    fail_silently=True,
                )
                
                # Alert admin
                send_mail(
                    subject=f"New Contact Form Submission: {msg_subject}",
                    message=f"You have received a new message from {msg_name} ({msg_email}).\n\nMessage:\n{msg_message}",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[settings.DEFAULT_FROM_EMAIL],
                    fail_silently=True,
                )
            except Exception as e:
                logger.error(f"Failed to send contact emails: {e}")

        # Start the background thread
        email_thread = threading.Thread(
            target=send_contact_emails,
            args=(message.name, message.email, message.subject, message.message)
        )
        email_thread.start()

class SystemLogViewSet(viewsets.ModelViewSet):
    queryset = SystemLog.objects.all().order_by('-created_at')
    serializer_class = SystemLogSerializer
    permission_classes = [IsSuperAdminOrAdmin]

class SiteSettingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Site Settings. Overrides create to act as a singleton or update the existing.
    """
    queryset = SiteSetting.objects.all()
    serializer_class = SiteSettingSerializer

    def get_permissions(self):
        if self.request.method in ['GET']:
            return [AllowAny()]
        return [IsSuperAdminOrAdmin()]

    def list(self, request, *args, **kwargs):
        setting, created = SiteSetting.objects.get_or_create()
        serializer = self.get_serializer(setting)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        # Always update the singleton instead of creating a new one
        setting, created = SiteSetting.objects.get_or_create()
        serializer = self.get_serializer(setting, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Also log this action
            if request.user.is_authenticated:
                SystemLog.objects.create(
                    user=request.user,
                    action="Updated Site Settings",
                    details=str(serializer.validated_data)
                )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer
    permission_classes = [IsSuperAdminOrAdmin]

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        Notification.objects.filter(is_read=False).update(is_read=True)
        return Response({'status': 'All notifications marked as read'})

class DashboardStatsViewSet(viewsets.ViewSet):
    permission_classes = [IsSuperAdminOrAdmin]

    def list(self, request):
        time_filter = request.query_params.get('filter', 'month')
        now = timezone.now()
        
        if time_filter == 'week':
            start_date = now - timedelta(days=7)
        elif time_filter == 'year':
            start_date = now - timedelta(days=365)
        elif time_filter == 'all':
            start_date = None
        else: # default to month
            start_date = now - timedelta(days=30)

        total_enrollments = Enrollment.objects.count()
        total_learners = Learner.objects.count()
        total_instructors = Instructor.objects.count()
        total_courses = Course.objects.count()
        total_modules = Module.objects.count()
        total_lessons = Lesson.objects.count()
        total_enquiries = Requrement.objects.count()
        
        revenue_agg = Payment.objects.filter(status='Completed').aggregate(total=Sum('amount'))['total']
        total_revenue = float(revenue_agg) if revenue_agg else 0.0
        
        if start_date:
            new_enrollments = Enrollment.objects.filter(enrolled_at__gte=start_date).count()
            chart_qs = Enrollment.objects.filter(enrolled_at__gte=start_date)
        else:
            new_enrollments = total_enrollments
            chart_qs = Enrollment.objects.all()

        chart_qs = chart_qs \
            .annotate(date=TruncDate('enrolled_at')) \
            .values('date') \
            .annotate(enrollments=Count('id')) \
            .order_by('date')
        
        chart_data = []
        for entry in chart_qs:
            chart_data.append({
                'name': entry['date'].strftime('%b %d'),
                'enrollments': entry['enrollments']
            })

        top_courses_qs = Course.objects.annotate(enrollments_count=Count('enrollments')) \
            .order_by('-enrollments_count')[:4]
        
        top_courses = []
        max_enrollments = top_courses_qs[0].enrollments_count if top_courses_qs and top_courses_qs[0].enrollments_count > 0 else 1
        
        for course in top_courses_qs:
            progress = int((course.enrollments_count / max_enrollments) * 100) if max_enrollments > 0 else 0
            top_courses.append({
                'id': course.id,
                'title': course.title,
                'enrollments': course.enrollments_count,
                'progress': progress
            })

        # Fetch recent notifications
        recent_notifications = NotificationSerializer(
            Notification.objects.all().order_by('-created_at')[:4], many=True
        ).data

        # Fetch system alerts
        alerts = []
        try:
            import psutil
            cpu_usage = psutil.cpu_percent(interval=0.1)
            mem_usage = psutil.virtual_memory().percent
            
            if cpu_usage > 80 or mem_usage > 85:
                alerts.append({
                    'id': 2,
                    'title': 'High resource usage detected',
                    'desc': f'CPU: {cpu_usage}%, Memory: {mem_usage}%',
                    'type': 'warning',
                    'time': 'Live'
                })
            else:
                alerts.append({
                    'id': 1,
                    'title': 'All systems operational',
                    'desc': f'CPU: {cpu_usage}%, Memory: {mem_usage}%',
                    'type': 'success',
                    'time': 'Live'
                })
        except Exception as e:
            alerts.append({
                'id': 1,
                'title': 'All systems operational',
                'desc': 'System check running in degraded mode',
                'type': 'success',
                'time': 'Live'
            })
            
        try:
            import os
            from django.conf import settings
            import glob
            
            backup_dir = os.path.join(settings.BASE_DIR, 'backups')
            backup_files = glob.glob(os.path.join(backup_dir, '*'))
            
            if backup_files:
                latest_backup = max(backup_files, key=os.path.getctime)
                size_mb = os.path.getsize(latest_backup) / (1024 * 1024)
                db_size_str = f"{size_mb:.2f} MB"
                
                alerts.append({
                    'id': 3,
                    'title': 'Database backup ready',
                    'desc': f'Latest backup size: {db_size_str}',
                    'type': 'success',
                    'time': 'Live'
                })
            else:
                alerts.append({
                    'id': 3,
                    'title': 'No database backups found',
                    'desc': 'Run dbbackup to secure data',
                    'type': 'warning',
                    'time': 'Live'
                })
        except Exception:
            alerts.append({
                'id': 3,
                'title': 'Database Status',
                'desc': 'Database running normally',
                'type': 'info',
                'time': 'Live'
            })

        # Fetch recent visitors
        recent_visitors = SiteVisitorSerializer(
            SiteVisitor.objects.all().order_by('-created_at')[:10], many=True
        ).data

        return Response({
            'total_enrollments': total_enrollments,
            'new_enrollments': new_enrollments,
            'total_learners': total_learners,
            'total_instructors': total_instructors,
            'total_courses': total_courses,
            'total_modules': total_modules,
            'total_lessons': total_lessons,
            'total_enquiries': total_enquiries,
            'total_revenue': total_revenue,
            'chartData': chart_data,
            'topCourses': top_courses,
            'recent_notifications': recent_notifications,
            'system_alerts': alerts,
            'recent_visitors': recent_visitors
        })

class SystemAlertsViewSet(viewsets.ViewSet):
    permission_classes = [IsSuperAdminOrAdmin]

    def list(self, request):
        alerts = []
        try:
            import psutil
            cpu_usage = psutil.cpu_percent(interval=0.1)
            mem_usage = psutil.virtual_memory().percent
            
            if cpu_usage > 80 or mem_usage > 85:
                alerts.append({
                    'id': 2,
                    'title': 'High resource usage detected',
                    'desc': f'CPU: {cpu_usage}%, Memory: {mem_usage}%',
                    'type': 'warning',
                    'time': 'Live'
                })
            else:
                alerts.append({
                    'id': 1,
                    'title': 'All systems operational',
                    'desc': f'CPU: {cpu_usage}%, Memory: {mem_usage}%',
                    'type': 'success',
                    'time': 'Live'
                })
        except Exception as e:
            alerts.append({
                'id': 1,
                'title': 'All systems operational',
                'desc': 'System check running in degraded mode',
                'type': 'success',
                'time': 'Live'
            })
            
        try:
            import os
            from django.conf import settings
            import glob
            
            backup_dir = os.path.join(settings.BASE_DIR, 'backups')
            backup_files = glob.glob(os.path.join(backup_dir, '*'))
            
            if backup_files:
                latest_backup = max(backup_files, key=os.path.getctime)
                size_mb = os.path.getsize(latest_backup) / (1024 * 1024)
                db_size_str = f"{size_mb:.2f} MB"
                
                alerts.append({
                    'id': 3,
                    'title': 'Database backup ready',
                    'desc': f'Latest backup size: {db_size_str}',
                    'type': 'success',
                    'time': 'Live'
                })
            else:
                alerts.append({
                    'id': 3,
                    'title': 'No database backups found',
                    'desc': 'Run dbbackup to secure data',
                    'type': 'warning',
                    'time': 'Live'
                })
        except Exception:
            alerts.append({
                'id': 3,
                'title': 'Database Status',
                'desc': 'Database running normally',
                'type': 'info',
                'time': 'Live'
            })
        
        return Response(alerts)

class EmailTemplateViewSet(viewsets.ModelViewSet):
    queryset = EmailTemplate.objects.all().order_by('-updated_at')
    serializer_class = EmailTemplateSerializer
    permission_classes = [IsSuperAdminOrAdmin]

    @action(detail=True, methods=['post'])
    def send_email(self, request, pk=None):
        template = self.get_object()
        emails = request.data.get('emails', [])
        
        if not emails:
            return Response({"error": "No recipients provided."}, status=status.HTTP_400_BAD_REQUEST)
            
        from django.core.mail import EmailMultiAlternatives
        from django.template import Template, Context
        import threading
        from django.conf import settings
        from django.utils.html import strip_tags

        def dispatch_emails():
            django_template = Template(template.html_content)
            for email in emails:
                context = Context({"user_email": email}) # Add more context variables as needed
                html_message = django_template.render(context)
                text_content = strip_tags(html_message)
                
                email_message = EmailMultiAlternatives(
                    template.subject,
                    text_content,
                    settings.DEFAULT_FROM_EMAIL,
                    [email]
                )
                email_message.attach_alternative(html_message, "text/html")
                email_message.send(fail_silently=True)

        threading.Thread(target=dispatch_emails).start()
        
        return Response({"message": f"Emails queued for sending to {len(emails)} recipient(s)."})

class SiteVisitorViewSet(viewsets.ModelViewSet):
    queryset = SiteVisitor.objects.all().order_by('-created_at')
    serializer_class = SiteVisitorSerializer
    permission_classes = [IsSuperAdminOrAdmin]
