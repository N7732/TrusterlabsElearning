from django.db import models
from django.utils import timezone
from Auth.models import User

# Create your models here.

class Requrement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=12, blank=True, null=True)
    email = models.EmailField(max_length=100, blank=True, null=True)
    course = models.ForeignKey('Course.Course', on_delete=models.CASCADE, null=True, blank=True)
    status = models.CharField(max_length=20, default='pending', choices=[('pending', 'Pending'), ('enrolled', 'Enrolled')])
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Inquiry by {self.user.username} for {self.course.title if self.course else 'Unknown'}"
