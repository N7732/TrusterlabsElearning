from django.contrib import admin

# pyrefly: ignore [missing-import]
from .models import Partner, ContactMessage, SystemLog, SiteSetting

@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ('name', 'website_url', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name',)

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('name', 'email', 'subject')
    readonly_fields = ('created_at',)

@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'user', 'ip_address', 'created_at')
    list_filter = ('action', 'created_at')
    search_fields = ('action', 'user__username', 'details')
    readonly_fields = ('user', 'action', 'details', 'ip_address', 'created_at')

    def has_add_permission(self, request):
        return False
        
    def has_change_permission(self, request, obj=None):
        return False

@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'contact_email', 'contact_phone', 'updated_at')

    def has_add_permission(self, request):
        # Allow adding if no settings exist, otherwise block to maintain singleton pattern
        return not SiteSetting.objects.exists()
