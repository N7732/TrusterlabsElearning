from rest_framework import serializers
from .models import (
    Training,
    TrainingCourses,
    TrainingParticipants,
    TrainingClasswork,
    TrainingClassworkSubmission,
    TrainingFinalExam,
    TrainingFinalExamSubmission
)
from Auth.serializer import UserSerializer
from Course.serializer import CourseSerializer

class TrainingCoursesSerializer(serializers.ModelSerializer):
    course_detail = CourseSerializer(source='course', read_only=True)

    class Meta:
        model = TrainingCourses
        fields = ['id', 'training', 'course', 'course_detail']

class TrainingParticipantsSerializer(serializers.ModelSerializer):
    participant_detail = UserSerializer(source='participant', read_only=True)

    class Meta:
        model = TrainingParticipants
        fields = [
            'id', 'training', 'participant', 'admission_status', 'date_applied',
            'participant_detail', 'application_full_name', 'application_phone_number',
            'application_email'
        ]
        read_only_fields = ['admission_status', 'date_applied']

class TrainingClassworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingClasswork
        fields = '__all__'

class TrainingClassworkSubmissionSerializer(serializers.ModelSerializer):
    participant_name = serializers.CharField(source='participant.get_full_name', read_only=True)

    class Meta:
        model = TrainingClassworkSubmission
        fields = ['id', 'classwork', 'participant', 'submission_file', 'submission_date', 'participant_name', 'score']
        read_only_fields = ['participant']

class TrainingFinalExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingFinalExam
        fields = '__all__'

class TrainingFinalExamSubmissionSerializer(serializers.ModelSerializer):
    participant_name = serializers.CharField(source='participant.get_full_name', read_only=True)

    class Meta:
        model = TrainingFinalExamSubmission
        fields = ['id', 'exam', 'participant', 'submission_file', 'score', 'submission_date', 'participant_name']
        read_only_fields = ['participant', 'score']

class TrainingSerializer(serializers.ModelSerializer):
    courses = TrainingCoursesSerializer(many=True, read_only=True)
    participants = TrainingParticipantsSerializer(many=True, read_only=True)
    classworks = TrainingClassworkSerializer(many=True, read_only=True)
    final_exams = TrainingFinalExamSerializer(many=True, read_only=True)

    class Meta:
        model = Training
        fields = [
            'id', 'title', 'description', 'starting_date', 'ending_date',
            'application_open_date', 'application_close_date',
            'date_created', 'date_updated', 'courses', 'participants',
            'classworks', 'final_exams'
        ]
