from rest_framework import serializers
from Course.models import Course, Lesson, Module, Quizes, QuizQuestion, Enrollment, CoursePrerequisite, CourseResource

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
    class Meta:
        model = Module
        fields = '__all__'

class CourseResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseResource
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    resources = CourseResourceSerializer(many=True, read_only=True)
    prerequisites_details = CoursePrerequisiteSerializer(source='prerequisites', many=True, read_only=True)
    instructor_name = serializers.CharField(source='instructor.user.get_full_name', read_only=True)
    modules = ModuleSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = '__all__'

class QuizesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quizes
        fields = '__all__'

class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = '__all__' 

class EnrollmentSerializer(serializers.ModelSerializer):
    course_details = CourseSerializer(source='course', read_only=True)
    class Meta:
        model = Enrollment
        fields = '__all__'