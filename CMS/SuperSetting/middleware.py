import json
from .models import SystemLog

class AuditLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # We only log modifying actions for authenticated users in the API
        if hasattr(request, 'user') and request.user.is_authenticated and request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
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
                        user=request.user,
                        action=action_name,
                        details=f"Method: {method}, Path: {path}, Status: {response.status_code}",
                        ip_address=ip
                    )
            except Exception as e:
                pass
                
        return response
