from rest_framework import serializers
from .models import Certificate
from Course.serializer import CourseSerializer
from Training.serializers import TrainingSerializer

class CertificateSerializer(serializers.ModelSerializer):
    course_details = CourseSerializer(source='course', read_only=True)
    training_details = TrainingSerializer(source='training', read_only=True)
    learner_name = serializers.CharField(source='learner.user.get_full_name', read_only=True)
    learner_email = serializers.EmailField(source='learner.email', read_only=True)
    learner_phone = serializers.CharField(source='learner.phone_number', read_only=True)
    completed_at = serializers.DateTimeField(source='issued_at', read_only=True)
    enrolled_at = serializers.SerializerMethodField()
    program_title = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = ['id', 'learner', 'learner_name', 'learner_email', 'learner_phone', 'course', 'course_details', 'training', 'training_details', 'program_title', 'certificate_id', 'certificate_code', 'is_issued', 'issued_at', 'completed_at', 'enrolled_at', 'file', 'created_at']

    def get_program_title(self, obj):
        if obj.training:
            return obj.training.title
        elif obj.course:
            return obj.course.title
        return "Unknown Program"
        
    def get_enrolled_at(self, obj):
        if obj.training:
            from Training.models import TrainingParticipants
            participant = TrainingParticipants.objects.filter(participant=obj.learner.user, training=obj.training).first()
            return participant.date_applied if participant else None
        elif obj.course:
            from Course.models import Enrollment
            enrollment = Enrollment.objects.filter(learner=obj.learner, course=obj.course).first()
            return enrollment.enrolled_at if enrollment else None
        return None
