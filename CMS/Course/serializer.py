from rest_framework import serializers
from Course.models import Course, Lesson, Module, Quizes, QuizQuestion, Enrollment, CoursePrerequisite, CourseResource, QuizSubmission

class CoursePrerequisiteSerializer(serializers.ModelSerializer):
    prerequisite_course_title = serializers.CharField(source='prerequisite_course.title', read_only=True)
    class Meta:
        model = CoursePrerequisite
        fields = ['prerequisite_course', 'prerequisite_course_title', 'min_score']

class LessonSerializer(serializers.ModelSerializer):
    embed_url = serializers.ReadOnlyField()
    class Meta:
        model = Lesson
        fields = '__all__'

class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    quizzes = serializers.SerializerMethodField()
    
    class Meta:
        model = Module
        fields = '__all__'

    def get_quizzes(self, obj):
        request = self.context.get('request')
        user = request.user if request else None
        
        if user and user.is_authenticated and getattr(user, 'user_type', None) in ['admin', 'instructor'] or (user and user.is_superuser):
            quizzes = obj.quizzes.all()
        else:
            quizzes = obj.quizzes.filter(is_published=True)
            
        return QuizesSerializer(quizzes, many=True).data

class CourseResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseResource
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    resources = CourseResourceSerializer(many=True, read_only=True)
    prerequisites_details = CoursePrerequisiteSerializer(source='prerequisites', many=True, read_only=True)
    instructor_name = serializers.CharField(source='instructor.user.get_full_name', read_only=True)
    modules = ModuleSerializer(many=True, read_only=True)
    exams = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = '__all__'

    def get_exams(self, obj):
        request = self.context.get('request')
        user = request.user if request else None
        
        if user and user.is_authenticated and getattr(user, 'user_type', None) in ['admin', 'instructor'] or (user and user.is_superuser):
            exams = obj.Exams.all()
        else:
            exams = obj.Exams.filter(is_published=True)
            
        return QuizesSerializer(exams, many=True).data

class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = '__all__' 

class QuizesSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)
    class Meta:
        model = Quizes
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    course_details = CourseSerializer(source='course', read_only=True)
    class Meta:
        model = Enrollment
        fields = '__all__'

class QuizSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizSubmission
        fields = '__all__'