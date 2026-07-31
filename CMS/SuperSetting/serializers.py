from rest_framework import serializers
from .models import Partner, ContactMessage, SystemLog, SiteSetting, Notification, StaffMember, EmailTemplate, SiteVisitor

class PartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partner
        fields = '__all__'

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'
        read_only_fields = ['is_read', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class SystemLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemLog
        fields = ['id', 'user', 'user_name', 'action', 'details', 'ip_address', 'created_at']
        read_only_fields = ['user', 'user_name', 'action', 'details', 'ip_address', 'created_at']

    def get_user_name(self, obj):
        if obj.user:
            return obj.user.get_full_name()
        return "System"

class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = '__all__'

class StaffMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffMember
        fields = '__all__'

class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = '__all__'

class SiteVisitorSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteVisitor
        fields = '__all__'

from .models import SystemHealthSnapshot, ErrorLog

class SystemHealthSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemHealthSnapshot
        fields = '__all__'

class ErrorLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ErrorLog
        fields = '__all__'
