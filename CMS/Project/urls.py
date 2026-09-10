from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserProjectViewSet, ConsultationMeetingViewSet

router = DefaultRouter()
router.register(r'projects', UserProjectViewSet, basename='project')
router.register(r'meetings', ConsultationMeetingViewSet, basename='meeting')

urlpatterns = [
    path('', include(router.urls)),
]
