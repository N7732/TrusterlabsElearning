from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """

    STUDENT = 'learner'
    INSTRUCTOR = 'instructor'
    ADMIN = 'admin'

    USER_TYPE_CHOICES = (
        ('learner', 'Learner'),
        ('instructor', 'Instructor'),
        ('admin', 'Admin'),
    )
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    email = models.EmailField(unique=True)

    @property
    def is_learner(self):
        return self.user_type == 'learner'

    @property
    def is_instructor(self):
        return self.user_type == 'instructor'
    
    @property
    def is_admin_user(self):
        return self.user_type == 'admin' or self.is_superuser

class Learner(models.Model):
    """
    Learner/Student profile linked to Django User
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='learner_profile')
    phone_number = models.CharField(max_length=15, blank=True)
    email=models.EmailField(blank=True, unique=True)
    email_verified = models.BooleanField(default=False)
    enrolled_courses = models.ManyToManyField('Course.Course', related_name='learners', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} (Student)"
    
    class Meta:
        verbose_name = "Learner"
        verbose_name_plural = "Learners"
        ordering = ['-created_at']
    
    
class Instructor(models.Model):
    """
    Instructor profile linked to Django User
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='instructor_profile')
    phone_number = models.CharField(max_length=15, blank=True)
    bio = models.TextField(blank=True)
    specialization = models.CharField(max_length=200, blank=True, help_text="Area of expertise")
    is_approved = models.BooleanField(default=False, help_text="Approved by partner admin")
    can_create_courses = models.BooleanField(default=True)
    can_update_courses = models.BooleanField(default=True)
    can_delete_courses = models.BooleanField(default=True)
    can_create_trainings = models.BooleanField(default=True)
    can_update_trainings = models.BooleanField(default=True)
    can_delete_trainings = models.BooleanField(default=True)
    can_view_students = models.BooleanField(default=True)
    can_create_certificates = models.BooleanField(default=True)
    can_update_certificates = models.BooleanField(default=True)
    can_delete_certificates = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_students(self):
        """Calculate total unique students across all courses taught by this instructor"""
        from Course.models import Enrollment
        return Enrollment.objects.filter(
            course__instructor=self
        ).values('learner').distinct().count()

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} (Instructor)"
    
    class Meta:
        verbose_name = "Instructor"
        verbose_name_plural = "Instructors"
        ordering = ['-created_at']

class AccountProfile(models.Model):
    """
    Extended profile information for any user
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='extended_profile')
    bio = models.TextField(blank=True, max_length=50)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username}"
    
    class Meta:
        verbose_name = "Account Profile"
        verbose_name_plural = "Account Profiles"