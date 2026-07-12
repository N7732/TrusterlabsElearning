from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LearnerViewSet,
    InstructorViewSet,
    about_as,
    contact_as,
    instructor_edit_profile,
    learner_edit_profile,
    learn_registration,
    instructor_register,
    user_login,
    user_logout,
    profile,
    CustomPasswordResetView, CustomPasswordResetDoneView, 
    CustomPasswordResetConfirmView, CustomPasswordResetCompleteView,
    CustomPasswordChangeView, CustomPasswordChangeDoneView,
    LearnerRegisterAPIView, InstructorRegisterAPIView, UserProfileAPIView,
    AdminInstructorCreationAPIView,
    CustomTokenObtainPairView,
    PasswordResetRequestAPIView,
    PasswordResetConfirmAPIView,
    LearnerGradesAPIView
)
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

# API Router
router = DefaultRouter()
router.register(r'learners', LearnerViewSet, basename='learner')
router.register(r'instructors', InstructorViewSet, basename='instructor')

app_name = 'Auth'

urlpatterns = [
    # API endpoints
    path('api/', include(router.urls)),
    path('api/auth/register/learner/', LearnerRegisterAPIView.as_view(), name='api_register_learner'),
    path('api/auth/register/instructor/', InstructorRegisterAPIView.as_view(), name='api_register_instructor'),
    path('api/auth/admin/instructors/create/', AdminInstructorCreationAPIView.as_view(), name='api_admin_create_instructor'),
    path('api/auth/profile/', UserProfileAPIView.as_view(), name='api_profile'),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/password/reset/', PasswordResetRequestAPIView.as_view(), name='api_password_reset'),
    path('api/auth/password/reset/confirm/', PasswordResetConfirmAPIView.as_view(), name='api_password_reset_confirm'),
    path('api/my-grades/', LearnerGradesAPIView.as_view(), name='api_my_grades'),
    
    # Authentication
    path('login/', user_login, name='login'),
    path('logout/', user_logout, name='logout'),
    
    # Registration
    path('register/learner/', learn_registration, name='learner_register'),
    path('register/learner/<uuid:token>/', learn_registration, name='learner_register_invite'),
    path('register/instructor/', instructor_register, name='instructor_register'), # Keep this for named reverse matching if needed, but it checks for token internally? No, I should make it require token in path.
    path('register/instructor/<uuid:token>/', instructor_register, name='instructor_register_invite'),
    
    # Profile
    path('profile/', profile, name='profile'),

    # Static Pages
    path('about/', about_as, name='about'),
    path('contact/', contact_as, name='contact'),

    #profile update
    path('profile/edit/', learner_edit_profile, name='edit_profile'),
    path('profile/edit/instructor/', instructor_edit_profile, name='edit_profile_instructor'),

    # Password Reset
    path('password-reset/', CustomPasswordResetView.as_view(), name='password_reset'),
    path('password-reset/done/', CustomPasswordResetDoneView.as_view(), name='password_reset_done'),
    path('password-reset/confirm/<uidb64>/<token>/', CustomPasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('password-reset/complete/', CustomPasswordResetCompleteView.as_view(), name='password_reset_complete'),

    # Password Change
    path('password-change/', CustomPasswordChangeView.as_view(), name='password_change'),
    path('password-change/done/', CustomPasswordChangeDoneView.as_view(), name='password_change_done'),
]
