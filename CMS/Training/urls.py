from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrainingViewSet, TrainingClassworkViewSet, TrainingFinalExamViewSet

router = DefaultRouter()
router.register(r'trainings', TrainingViewSet, basename='training')
router.register(r'classwork', TrainingClassworkViewSet, basename='training-classwork')
router.register(r'exams', TrainingFinalExamViewSet, basename='training-exam')

urlpatterns = [
    path('', include(router.urls)),
]