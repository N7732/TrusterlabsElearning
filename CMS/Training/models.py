from django.db import models
from Course.models import Course, Quizes
from Auth.models import User


class Training(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    starting_date = models.DateField()
    ending_date = models.DateField()
    application_open_date = models.DateField(null=True, blank=True)
    application_close_date = models.DateField(null=True, blank=True)
    instructor = models.ForeignKey('Auth.Instructor', on_delete=models.CASCADE, related_name='trainings', null=True, blank=True)

    # Certification Settings
    has_certificate = models.BooleanField(default=False, help_text="If true, participants will receive a certificate upon completion of the training.")
    auto_issue_certificate = models.BooleanField(default=False, help_text="If true, certificates are issued automatically upon completion. Otherwise, wait for Admin/Instructor to issue manually.")
    passing_score_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=70.0, help_text="Percentage required to automatically pass and receive the certificate (0-100).")
    certificate_duration = models.CharField(max_length=50, blank=True, null=True, help_text="e.g., '1.5-Hour'")
    certificate_type_text = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., 'Online Cybersecurity Workshop'")
    certificate_program_title = models.CharField(max_length=200, blank=True, null=True, help_text="e.g., 'SSL/TLS: Securing Communication on the Internet'")
    certificate_description = models.TextField(blank=True, null=True, help_text="e.g., 'This workshop covered SSL/TLS fundamentals...'")

    def __str__(self):
        return self.title



class TrainingCourses(models.Model):
    training = models.ForeignKey(Training, on_delete=models.CASCADE, related_name='courses')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)

    def __str__(self):
        return self.course.title


class TrainingParticipants(models.Model):


    STATUS_CHOICES = (

        ('PENDING', 'Pending'),
        ('ADMITTED', 'Admitted'),
        ('COMPLETED', 'Completed'),
        ('REJECTED', 'Rejected'),
    )
    training = models.ForeignKey(Training, on_delete=models.CASCADE, related_name='participants')
    participant = models.ForeignKey(User, on_delete=models.CASCADE)
    application_full_name = models.CharField(max_length=255, blank=True, null=True)
    application_phone_number = models.CharField(max_length=50, blank=True, null=True)
    application_email = models.EmailField(blank=True, null=True)
    admission_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    date_applied = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        name = self.application_full_name or self.participant.get_full_name()
        return f"{name} - {self.admission_status}"


class TrainingClasswork(models.Model):
    training = models.ForeignKey(Training, on_delete=models.CASCADE, related_name='classworks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateField()
    classwork_file = models.FileField(upload_to='classwork_files/', null=True, blank=True)
    linked_quiz = models.ForeignKey(Quizes, on_delete=models.SET_NULL, null=True, blank=True, related_name='linked_training_classworks')

    def __str__(self):
        return self.title


class TrainingClassworkSubmission(models.Model):
    classwork = models.ForeignKey(TrainingClasswork, on_delete=models.CASCADE, related_name='submissions')
    participant = models.ForeignKey(User, on_delete=models.CASCADE)
    submission_file = models.FileField(upload_to='classwork_submissions/', null=True, blank=True)
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    submission_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.participant.get_full_name()} - {self.classwork.title}"


class TrainingFinalExam(models.Model):
    training = models.ForeignKey(Training, on_delete=models.CASCADE, related_name='final_exams')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    exam_date = models.DateField()
    exam_file = models.FileField(upload_to='exam_files/', null=True, blank=True)
    linked_exam = models.ForeignKey(Quizes, on_delete=models.SET_NULL, null=True, blank=True, related_name='linked_training_exams')

    def __str__(self):
        return self.title


class TrainingFinalExamSubmission(models.Model):
    exam = models.ForeignKey(TrainingFinalExam, on_delete=models.CASCADE, related_name='submissions')
    participant = models.ForeignKey(User, on_delete=models.CASCADE)
    submission_file = models.FileField(upload_to='exam_submissions/')
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    submission_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.participant.get_full_name()} - {self.exam.title}"



class CustomTrainingRequest(models.Model):

    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('REVIEWED', 'Reviewed'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),

    )

    TRAINING_TYPE_CHOICES = (
        ('Professional Training', 'Professional Training'),
        ('Academic Internship', 'Academic Internship'),
        ('Other', 'Other'),
    )

    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    training_type = models.CharField(max_length=50, choices=TRAINING_TYPE_CHOICES)
    college = models.CharField(max_length=255, null=True, blank=True)
    learning_fields = models.TextField(null=True, blank=True)
    additional_info = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):

        return f"{self.full_name} - {self.training_type} ({self.status})"





















































