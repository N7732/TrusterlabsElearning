from rest_framework import serializers
from .models import Learner, Instructor, User
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get('username')
        # If the provided username looks like an email, lookup the actual username
        if username and '@' in username:
            try:
                user = User.objects.get(email=username)
                attrs['username'] = user.username
            except User.DoesNotExist:
                pass
        return super().validate(attrs)
class LearnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Learner
        fields = '__all__'

class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instructor
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type']

class LearnerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']
        
    def create(self, validated_data):
        validated_data['user_type'] = 'learner'
        validated_data['password'] = make_password(validated_data['password'])
        user = User.objects.create(**validated_data)
        Learner.objects.create(user=user, email=user.email)
        return user

class InstructorRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    bio = serializers.CharField(write_only=True, required=False)
    specialization = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'bio', 'specialization']
        
    def create(self, validated_data):
        bio = validated_data.pop('bio', '')
        specialization = validated_data.pop('specialization', '')
        validated_data['user_type'] = 'instructor'
        validated_data['password'] = make_password(validated_data['password'])
        user = User.objects.create(**validated_data)
        Instructor.objects.create(user=user, bio=bio, specialization=specialization)
        return user

class AdminInstructorCreationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    can_create_courses = serializers.BooleanField(write_only=True, required=False, default=True)
    can_update_courses = serializers.BooleanField(write_only=True, required=False, default=True)
    can_delete_courses = serializers.BooleanField(write_only=True, required=False, default=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'can_create_courses', 'can_update_courses', 'can_delete_courses']
        
    def create(self, validated_data):
        can_create = validated_data.pop('can_create_courses', True)
        can_update = validated_data.pop('can_update_courses', True)
        can_delete = validated_data.pop('can_delete_courses', True)
        
        validated_data['user_type'] = 'instructor'
        validated_data['password'] = make_password(validated_data['password'])
        user = User.objects.create(**validated_data)
        
        Instructor.objects.create(
            user=user, 
            is_approved=True, 
            can_create_courses=can_create,
            can_update_courses=can_update,
            can_delete_courses=can_delete
        )
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    learner_profile = LearnerSerializer(read_only=True)
    instructor_profile = InstructorSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type', 'is_superuser', 'learner_profile', 'instructor_profile']
