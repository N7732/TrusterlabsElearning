from django.db import models
from Auth.models import User
from Membership.models import Membership
import uuid

class UserProject(models.Model):
    STATUS_CHOICES = (
        ('submitted', 'Submitted'),
        ('under_consultation', 'Under Consultation'),
        ('developing', 'Still Developing'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected')
    )
    
    PROJECT_TYPE = (
        ('user_submitted', 'User Submitted'),
        ('trusterlabs', 'TrusterLabs Developed')
    )

    project_id = models.CharField(max_length=100, unique=True, blank=True)
    membership = models.ForeignKey(Membership, on_delete=models.SET_NULL, null=True, blank=True, related_name='projects')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_projects')
    
    name = models.CharField(max_length=255)
    language = models.CharField(max_length=100)
    framework = models.CharField(max_length=100)
    description = models.TextField()
    problem_solved = models.TextField()
    objectives = models.TextField()
    
    project_url = models.URLField(blank=True, null=True)
    deployment_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    additional_notes = models.TextField(blank=True, null=True)
    
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='submitted')
    project_type = models.CharField(max_length=50, choices=PROJECT_TYPE, default='user_submitted')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.project_id:
            import datetime
            year = datetime.datetime.now().year
            self.project_id = f"PROJ-{year}-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.project_id} - {self.name}"

class ConsultationMeeting(models.Model):
    project = models.ForeignKey(UserProject, on_delete=models.CASCADE, related_name='meetings')
    meeting_date = models.DateField()
    meeting_time = models.TimeField()
    duration_minutes = models.IntegerField(default=30)
    meeting_link = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Meeting for {self.project.name} on {self.meeting_date}"
