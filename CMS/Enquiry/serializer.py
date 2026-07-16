from rest_framework import serializers
from .models import Requrement

class RequirementSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    user_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Requrement
        fields = "__all__"
        read_only_fields = ['user']

    def get_user_name(self, obj):
        if obj.user:
            return obj.user.username
        return obj.name