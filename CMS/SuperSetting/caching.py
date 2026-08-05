import logging
from django.core.cache import cache
from rest_framework.response import Response

logger = logging.getLogger(__name__)

def cached_queryset_result(cache_key, timeout, query_fn):
    """
    Executes a database query function only on a cache miss, storing the computed result 
    in Redis/Memcached for 'timeout' seconds.
    """
    data = cache.get(cache_key)
    if data is None:
        data = query_fn()
        cache.set(cache_key, data, timeout=timeout)
    return data

def invalidate_view_cache(viewset_class_name):
    """
    Invalidates all Redis/Memcached cached responses associated with a specific DRF ViewSet.
    """
    index_key = f"cache_index_{viewset_class_name}"
    cached_keys = cache.get(index_key) or []
    if cached_keys:
        cache.delete_many(cached_keys)
        cache.delete(index_key)
    logger.info(f"Invalidated cache for viewset: {viewset_class_name}")

class CachedModelViewSetMixin:
    """
    A powerful caching mixin for Django REST Framework ViewSets.
    Automatically intercepts .list() and .retrieve() actions to serve pre-serialized data 
    directly from Redis/Memcached with ZERO database queries.
    Automatically invalidates stale cache keys upon create, update, partial_update, or destroy actions.
    """
    cache_timeout = 60 * 30  # Default 30 minutes cache TTL in Redis/Memcached

    def _get_cache_key(self, request, action):
        query_string = request.META.get('QUERY_STRING', '')
        user_part = 'anon' if not (request.user and request.user.is_authenticated) else f"user_{request.user.pk}_{getattr(request.user, 'user_type', '')}"
        return f"viewcache_{self.__class__.__name__}_{action}_{request.path}_{query_string}_{user_part}"

    def _track_cache_key(self, cache_key):
        index_key = f"cache_index_{self.__class__.__name__}"
        cached_keys = cache.get(index_key) or []
        if cache_key not in cached_keys:
            cached_keys.append(cache_key)
            cache.set(index_key, cached_keys, timeout=86400)

    def list(self, request, *args, **kwargs):
        # Allow force revalidation if explicitly asked
        if request.query_params.get('no_cache') == 'true':
            return super().list(request, *args, **kwargs)

        cache_key = self._get_cache_key(request, 'list')
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        if response.status_code == 200:
            cache.set(cache_key, response.data, timeout=getattr(self, 'cache_timeout', 1800))
            self._track_cache_key(cache_key)
        return response

    def retrieve(self, request, *args, **kwargs):
        if request.query_params.get('no_cache') == 'true':
            return super().retrieve(request, *args, **kwargs)

        cache_key = self._get_cache_key(request, 'retrieve')
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data)

        response = super().retrieve(request, *args, **kwargs)
        if response.status_code == 200:
            cache.set(cache_key, response.data, timeout=getattr(self, 'cache_timeout', 1800))
            self._track_cache_key(cache_key)
        return response

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if response.status_code in [200, 201]:
            invalidate_view_cache(self.__class__.__name__)
        return response

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        if response.status_code == 200:
            invalidate_view_cache(self.__class__.__name__)
        return response

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        if response.status_code == 200:
            invalidate_view_cache(self.__class__.__name__)
        return response

    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, *args, **kwargs)
        if response.status_code in [200, 204]:
            invalidate_view_cache(self.__class__.__name__)
        return response
