from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PartnerViewSet, ContactMessageViewSet, SystemLogViewSet, SiteSettingViewSet, NotificationViewSet, DashboardStatsViewSet, SystemAlertsViewSet, StaffMemberViewSet

router = DefaultRouter()
router.register(r'partners', PartnerViewSet, basename='partner')
router.register(r'contact-messages', ContactMessageViewSet, basename='contact-message')
router.register(r'system-logs', SystemLogViewSet, basename='system-log')
router.register(r'site-settings', SiteSettingViewSet, basename='site-setting')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'dashboard-stats', DashboardStatsViewSet, basename='dashboard-stats')
router.register(r'system-alerts', SystemAlertsViewSet, basename='system-alerts')
router.register(r'staff-members', StaffMemberViewSet, basename='staff-member')

urlpatterns = [
    path('', include(router.urls)),
]
