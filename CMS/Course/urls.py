from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, ModuleViewSet, LessonViewSet, QuizesViewSet, QuizQuestionViewSet,
    EnrollmentViewSet, CourseResourceViewSet, ReuseRequestViewSet,
    enroll_course, approve_enrollment, reject_enrollment
)

router = DefaultRouter()
router.register(r'api/courses', CourseViewSet)
router.register(r'api/modules', ModuleViewSet)
router.register(r'api/lessons', LessonViewSet)
router.register(r'api/quizes', QuizesViewSet)
router.register(r'api/quiz_questions', QuizQuestionViewSet)
router.register(r'api/enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'api/course-resources', CourseResourceViewSet, basename='courseresource')
router.register(r'api/reuse-requests', ReuseRequestViewSet, basename='reuserequest')

urlpatterns = [
    # API Views
    path('enroll/<int:course_id>/', enroll_course, name='enroll_course'),
    path('enrollment/<int:enrollment_id>/approve/', approve_enrollment, name='approve_enrollment'),
    path('enrollment/<int:enrollment_id>/reject/', reject_enrollment, name='reject_enrollment'),

    
    # API Views
    path('', include(router.urls)),
]