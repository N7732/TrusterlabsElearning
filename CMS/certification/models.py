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

    def save(self, *args, **kwargs):
        if not self.certificate_id:
            year = timezone.now().year
            while True:
                random_number = str(random.randint(100000, 999999))
                new_id = f"TL-{year}-{random_number}"
                if not Certificate.objects.filter(certificate_id=new_id).exists():
                    self.certificate_id = new_id
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        if self.course:
            return f"Certificate: {self.learner} - {self.course.title}"
        if self.training:
            return f"Certificate: {self.learner} - {self.training.title}"
        return f"Certificate: {self.learner} - {self.certificate_id or self.certificate_code}"
