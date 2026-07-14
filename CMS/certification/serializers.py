from rest_framework import serializers
from .models import Certificate
from Course.serializer import CourseSerializer
from Training.serializers import TrainingSerializer

class CertificateSerializer(serializers.ModelSerializer):
    course_details = CourseSerializer(source='course', read_only=True)
    training_details = TrainingSerializer(source='training', read_only=True)
    learner_name = serializers.CharField(source='learner.user.get_full_name', read_only=True)
    program_title = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = ['id', 'learner', 'learner_name', 'course', 'course_details', 'training', 'training_details', 'program_title', 'certificate_code', 'is_issued', 'issued_at', 'file', 'created_at']

    def get_program_title(self, obj):
        if obj.course:
            return obj.course.title
        elif obj.training:
            return obj.training.title
        return "Unknown Program"
