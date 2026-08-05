import json
from .models import SystemLog

class AuditLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Attempt to get user from JWT if standard request.user is Anonymous
        user = getattr(request, 'user', None)
        if not (user and user.is_authenticated):
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                try:
                    from .authentication import CachedJWTAuthentication
                    jwt_auth = CachedJWTAuthentication()
                    validated_token = jwt_auth.get_validated_token(auth_header.split(' ')[1])
                    user = jwt_auth.get_user(validated_token)
                except Exception:
                    pass
        
        # We only log modifying actions for authenticated users in the API
        if user and user.is_authenticated and request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            # Avoid logging login/token endpoints to prevent noisy logs
            if 'token' in request.path.lower() or 'login' in request.path.lower():
                return response

            method = request.method
            path = request.path
            
            # Action naming logic based on method
            action_name = "Action"
            if method == 'POST':
                action_name = f"Created new record via {path}"
            elif method in ['PUT', 'PATCH']:
                action_name = f"Updated record via {path}"
            elif method == 'DELETE':
                action_name = f"Deleted record via {path}"
            
            # Get IP
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')

            try:
                # Only log successful or client error operations, skip 500s 
                if response.status_code < 500:
                    SystemLog.objects.create(
                        user=user,
                        action=action_name,
                        details=f"Method: {method}, Path: {path}, Status: {response.status_code}",
                        ip_address=ip
                    )
            except Exception as e:
                pass

        # Periodically clean up logs older than 7 days in the background
        from django.core.cache import cache
        if cache.add('system_log_cleanup_lock', 'true', 60 * 60 * 12):  # Lock for 12 hours
            import threading
            def clean_old_logs():
                try:
                    from django.utils import timezone
                    from datetime import timedelta
                    one_week_ago = timezone.now() - timedelta(days=7)
                    SystemLog.objects.filter(created_at__lt=one_week_ago).delete()
                except Exception:
                    pass
            threading.Thread(target=clean_old_logs).start()
                
        return response

class VisitorTrackingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Only track GET requests that are likely API views or page loads
        if request.method == 'GET' and not request.path.startswith(('/static/', '/media/', '/admin/')):
            from .models import SiteVisitor
            from django.utils import timezone
            
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')
                
            user_agent = request.META.get('HTTP_USER_AGENT', '')[:1000]
            today = timezone.now().date()
            
            if ip:
                try:
                    # Redis/Memcached gating: check cache before performing database query on every GET hit
                    from django.core.cache import cache
                    cache_key = f"visitor_track_{ip}_{request.path}_{today}"
                    if not cache.get(cache_key):
                        SiteVisitor.objects.get_or_create(
                            ip_address=ip,
                            visited_date=today,
                            path=request.path,
                            defaults={'user_agent': user_agent}
                        )
                        # Cache for 24 hours (86400 seconds) to prevent repetitive database lookups today!
                        cache.set(cache_key, '1', timeout=86400)
                except Exception:
                    pass

        return response

import traceback

class ExceptionLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        from .models import ErrorLog
        tb = traceback.format_exc()
        try:
            ErrorLog.objects.create(
                level='CRITICAL',
                message=str(exception),
                path=request.path,
                traceback=tb,
                user=request.user if hasattr(request, 'user') and request.user.is_authenticated else None
            )
        except Exception:
            pass
        return None
