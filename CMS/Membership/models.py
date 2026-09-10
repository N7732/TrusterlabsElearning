from django.db import models
from Auth.models import User
import uuid

# Create your models here.
class Membership(models.Model):
    MEMBERSHIP_TYPES = (
        ('free', 'Free'),
        ('professional', 'Professional'),
        ('enterprise', 'Enterprise')
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled')
    )

    PAYMENT_STATUS = (
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('failed', 'Failed')
    )

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='memberships')
    membership_type = models.CharField(max_length=20, choices=MEMBERSHIP_TYPES, default='free')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='unpaid')
    
    Fullname = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    Where_heard_about_us = models.CharField(max_length=255, blank=True, null=True)
    MembershipID = models.CharField(max_length=100, unique=True, blank=True)
    duration_days = models.PositiveIntegerField(help_text="Duration of the membership in days")
    
    start_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.MembershipID:
            if self.membership_type in ['professional', 'enterprise']:
                # Generate a unique membership ID for PRO/ENTERPRISE (e.g., TL-MEP-123456)
                self.MembershipID = f"TL-MEP-{uuid.uuid4().hex[:8].upper()}"
            else:
                # Generate a unique membership ID for free (e.g., TL-MEM-123456)
                self.MembershipID = f"TL-MEM-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.Fullname