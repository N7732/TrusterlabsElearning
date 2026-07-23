from django.db import models
from django.core.exceptions import ValidationError
from Auth.models import User

class Partner(models.Model):
    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='partners/', null=True, blank=True)
    website_url = models.URLField(max_length=500, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ContactMessage(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name} - {self.subject}"

class SystemLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=255)
    details = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} by {self.user if self.user else 'System'}"

class SiteSetting(models.Model):
    """
    Singleton model to hold global site settings like contact info, location, etc.
    """
    company_name = models.CharField(max_length=255, default='TrusterLab')
    contact_email = models.EmailField(default='info@trusterlab.com')
    contact_phone = models.CharField(max_length=50, default='+1234567890')
    location_address = models.TextField(default='123 Security Avenue')
    facebook_url = models.URLField(max_length=500, null=True, blank=True)
    twitter_url = models.URLField(max_length=500, null=True, blank=True)
    linkedin_url = models.URLField(max_length=500, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.pk and SiteSetting.objects.exists():
            # if trying to create a new one but one already exists
            raise ValidationError('There can be only one SiteSetting instance.')
        return super(SiteSetting, self).save(*args, **kwargs)

    def __str__(self):
        return "Global Site Settings"

class Notification(models.Model):
    """
    Global notification model to store platform events for admins.
    """
    TYPE_CHOICES = [
        ('course', 'Course'),
        ('enquiry', 'Enquiry'),
        ('contact', 'Contact'),
        ('system', 'System'),
    ]
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.notification_type}"

class StaffMember(models.Model):
    name = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    photo = models.ImageField(upload_to='staff_photos/', null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.position}"

class EmailTemplate(models.Model):
    """
    Stores HTML email templates dynamically so they can be edited from the admin UI.
    """
    template_name = models.CharField(max_length=255, unique=True, help_text="e.g., 'welcome_email', 'password_reset_email'")
    subject = models.CharField(max_length=255, default="Notification from TrusterLab")
    html_content = models.TextField(help_text="HTML content of the email.")
    text_content = models.TextField(null=True, blank=True, help_text="Plain text fallback (optional).")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.template_name

class SiteVisitor(models.Model):
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    path = models.CharField(max_length=500, null=True, blank=True)
    visited_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.ip_address} - {self.path} - {self.visited_date}"
