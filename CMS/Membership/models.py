from django.db import models
import uuid

# Create your models here.
class Membership(models.Model):
    Fullname = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    Where_heard_about_us = models.CharField(max_length=255, blank=True, null=True)
    MembershipID = models.CharField(max_length=100, unique=True, blank=True)
    duration_days = models.PositiveIntegerField(help_text="Duration of the membership in days")
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.MembershipID:
            # Generate a unique membership ID if not provided (e.g., TL-MEM-123456)
            self.MembershipID = f"TL-MEM-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.Fullname