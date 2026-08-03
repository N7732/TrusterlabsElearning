from rest_framework import serializers
from .models import (
    Training,
    TrainingCourses,
    TrainingParticipants,
    TrainingClasswork,
    TrainingClassworkSubmission,
    TrainingFinalExam,
    TrainingFinalExamSubmission,
    CustomTrainingRequest
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
    my_submission = serializers.SerializerMethodField()

    class Meta:
        model = TrainingClasswork
        fields = '__all__'

    def get_my_submission(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Check for direct classwork submission
            submission = obj.submissions.filter(participant=request.user).first()
            if submission:
                return TrainingClassworkSubmissionSerializer(submission).data
            
            # If no classwork submission, check if there's a linked quiz submission
            if obj.linked_quiz and hasattr(request.user, 'learner_profile'):
                from Course.models import QuizSubmission
                quiz_sub = QuizSubmission.objects.filter(learner=request.user.learner_profile, quiz=obj.linked_quiz, training_classwork_id=obj.id).first()
                if quiz_sub:
                    return {
                        'is_quiz': True,
                        'score': quiz_sub.score,
                        'total_marks': quiz_sub.total_marks,
                        'passed': quiz_sub.passed,
                        'submission_date': quiz_sub.submitted_at
                    }
        return None

class TrainingClassworkSubmissionSerializer(serializers.ModelSerializer):
    participant_name = serializers.CharField(source='participant.get_full_name', read_only=True)

    class Meta:
        model = TrainingClassworkSubmission
        fields = ['id', 'classwork', 'participant', 'submission_file', 'submission_date', 'participant_name', 'score']
        read_only_fields = ['participant']

class TrainingFinalExamSerializer(serializers.ModelSerializer):
    my_submission = serializers.SerializerMethodField()

    class Meta:
        model = TrainingFinalExam
        fields = '__all__'

    def get_my_submission(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            submission = obj.submissions.filter(participant=request.user).first()
            if submission:
                return TrainingFinalExamSubmissionSerializer(submission).data
            
            if obj.linked_exam and hasattr(request.user, 'learner_profile'):
                from Course.models import QuizSubmission
                quiz_sub = QuizSubmission.objects.filter(learner=request.user.learner_profile, quiz=obj.linked_exam, training_exam_id=obj.id).first()
                if quiz_sub:
                    return {
                        'is_quiz': True,
                        'score': quiz_sub.score,
                        'total_marks': quiz_sub.total_marks,
                        'passed': quiz_sub.passed,
                        'submission_date': quiz_sub.submitted_at
                    }
        return None

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
            'classworks', 'final_exams', 'has_certificate', 'auto_issue_certificate',
            'certificate_duration', 'certificate_type_text', 
            'certificate_program_title', 'certificate_description'
        ]

class CustomTrainingRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomTrainingRequest
        fields = '__all__'
