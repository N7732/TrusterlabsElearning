from django.db import models


class Research(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    starting_date = models.DateField()
    ending_date = models.DateField()

    def __str__(self):
        return self.title
    
class ResearchParticipants(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ADMITTED', 'Admitted'),
        ('REJECTED', 'Rejected'),
    )
    research = models.ForeignKey(Research, on_delete=models.CASCADE, related_name='participants')
    participant = models.ForeignKey('Auth.User', on_delete=models.CASCADE)
    admission_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    date_applied = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.participant.get_full_name()} - {self.admission_status}"

class ResearchPublication(models.Model):
    title = models.CharField(max_length=255)
    authors = models.CharField(max_length=255, help_text="Comma separated names")
    abstract = models.TextField()
    content = models.TextField(blank=True, null=True)
    document = models.FileField(upload_to='research_publications/', blank=True, null=True)
    image = models.ImageField(upload_to='research_images/', blank=True, null=True)
    publication_date = models.DateField()
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Webinar(models.Model):
    STATUS_CHOICES = (
        ('UPCOMING', 'Upcoming'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    date_time = models.DateTimeField()
    meeting_link = models.URLField(blank=True, null=True)
    thumbnail = models.ImageField(upload_to='webinar_thumbnails/', blank=True, null=True, help_text="Upload a photo thumbnail")
    thumbnail_url = models.URLField(blank=True, null=True, help_text="Or paste a link to an image")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='UPCOMING')
    decisions_summary = models.TextField(blank=True, null=True, help_text="Summary or decisions made after the webinar")
    requires_membership_id = models.BooleanField(default=False, help_text="Require users to provide a valid Membership ID to register")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class WebinarRegistration(models.Model):
    webinar = models.ForeignKey(Webinar, on_delete=models.CASCADE, related_name='registrations')
    # Use CharFields for generic registration so non-logged-in users can register
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    membership_id = models.CharField(max_length=100, blank=True, null=True, help_text="Membership ID used for registration")
    # Optional FK to User if they are logged in
    user = models.ForeignKey('Auth.User', on_delete=models.SET_NULL, blank=True, null=True)
    attended = models.BooleanField(default=False)
    registration_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} - {self.webinar.title}"
