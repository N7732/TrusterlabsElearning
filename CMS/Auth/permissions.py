from rest_framework.permissions import BasePermission

class IsSuperAdminOrAdmin(BasePermission):
    """
    Allows access to users who are superusers, have user_type 'admin', or are staff.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_superuser or getattr(request.user, 'user_type', '') == 'admin' or request.user.is_staff)
        )
