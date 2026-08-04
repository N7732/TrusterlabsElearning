import uuid
import random
from django.utils import timezone
from django.db import models

class Certificate(models.Model):
    learner = models.ForeignKey('Auth.Learner', on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey('Course.Course', on_delete=models.SET_NULL, null=True, blank=True, related_name='certificates')
    training = models.ForeignKey('Training.Training', on_delete=models.SET_NULL, null=True, blank=True, related_name='certificates')
    
    certificate_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    certificate_code = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    is_issued = models.BooleanField(default=False)
    issued_at = models.DateTimeField(null=True, blank=True)
    file = models.FileField(upload_to='certificates/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_is_issued = self.is_issued

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        became_issued = (is_new and self.is_issued) or (not is_new and self.is_issued and not getattr(self, '_original_is_issued', False))

        if not self.certificate_id:
            year = timezone.now().year
            while True:
                random_number = str(random.randint(100000, 999999))
                new_id = f"TL-{year}-{random_number}"
                if not Certificate.objects.filter(certificate_id=new_id).exists():
                    self.certificate_id = new_id
                    break
        super().save(*args, **kwargs)

        if became_issued:
            try:
                from Auth.views import render_email_template, send_email_async
                from django.core.mail import EmailMultiAlternatives
                from django.conf import settings
                from django.utils.html import strip_tags
                import os
                
                learner_name = self.learner.user.get_full_name() or self.learner.user.username
                program_title = self.course.title if self.course else (self.training.title if self.training else 'Program')
                
                frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173').rstrip('/')
                
                context = {
                    'learner': self.learner,
                    'name': learner_name,
                    'program_title': program_title,
                    'certificate': self,
                    'frontend_url': frontend_url
                }
                
                html_message, dynamic_subject = render_email_template('emails/certificate_email.html', context)
                text_content = strip_tags(html_message)
                
                email_message = EmailMultiAlternatives(
                    subject=dynamic_subject or f"Your Certificate for {program_title}",
                    body=text_content,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[self.learner.user.email],
                )
                email_message.attach_alternative(html_message, "text/html")
                send_email_async(email_message)
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Failed to send certificate email: {e}")

        self._original_is_issued = self.is_issued

    def __str__(self):
        if self.course:
            return f"Certificate: {self.learner} - {self.course.title}"
        if self.training:
            return f"Certificate: {self.learner} - {self.training.title}"
        return f"Certificate: {self.learner} - {self.certificate_id or self.certificate_code}"
