import uuid
from django.db import models

class Certificate(models.Model):
    learner = models.ForeignKey('Auth.Learner', on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey('Course.Course', on_delete=models.SET_NULL, null=True, blank=True, related_name='certificates')
    training = models.ForeignKey('Training.Training', on_delete=models.SET_NULL, null=True, blank=True, related_name='certificates')
    
    certificate_code = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    is_issued = models.BooleanField(default=False)
    issued_at = models.DateTimeField(null=True, blank=True)
    file = models.FileField(upload_to='certificates/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        if self.course:
            return f"Certificate: {self.learner} - {self.course.title}"
        if self.training:
            return f"Certificate: {self.learner} - {self.training.title}"
        return f"Certificate: {self.learner} - {self.certificate_code}"
