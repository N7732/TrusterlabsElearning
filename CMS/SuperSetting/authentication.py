import logging
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.settings import api_settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

class CachedJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication Backend that caches the authenticated User instance in Redis/Memcached.
    Eliminates the repetitive 'User.objects.get(pk=user_id)' database SELECT query on every single authenticated request.
    """
    def get_user(self, validated_token):
        try:
            claim_name = getattr(self, 'user_id_claim', None) or getattr(api_settings, 'USER_ID_CLAIM', 'user_id')
            user_id = validated_token[claim_name]
        except (KeyError, AttributeError, Exception):
            return super().get_user(validated_token)

        cache_key = f"jwt_user_obj_{user_id}"
        user = None
        try:
            user = cache.get(cache_key)
        except Exception:
            pass
        
        if user is None or not hasattr(user, 'is_authenticated') or not hasattr(user, 'pk'):
            # Cache miss: fetch user from PostgreSQL/SQLite database and store in Redis/Memcached for 10 minutes (600s)
            user = super().get_user(validated_token)
            if user and getattr(user, 'is_active', True):
                try:
                    cache.set(cache_key, user, timeout=600)
                except Exception:
                    pass
        
        return user
