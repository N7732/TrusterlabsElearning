from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResearchPublicationViewSet, WebinarViewSet, WebinarRegistrationViewSet

router = DefaultRouter()
router.register(r'publications', ResearchPublicationViewSet, basename='research-publication')
router.register(r'webinars', WebinarViewSet, basename='webinar')
router.register(r'registrations', WebinarRegistrationViewSet, basename='webinar-registration')

urlpatterns = [
    path('', include(router.urls)),
]
