from rest_framework import serializers
from .models import Requrement

class RequirementSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Requrement
        fields = "__all__"