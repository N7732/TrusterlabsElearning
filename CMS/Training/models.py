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
    instructor = models.ForeignKey('Auth.Instructor', on_delete=models.CASCADE, related_name='trainings', null=True, blank=True)


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
        ('REJECTED', 'Rejected'),
    )
    training = models.ForeignKey(Training, on_delete=models.CASCADE, related_name='participants')
    participant = models.ForeignKey(User, on_delete=models.CASCADE)
    admission_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    date_applied = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.participant.get_full_name()} - {self.admission_status}"
    

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
    submission_file = models.FileField(upload_to='classwork_submissions/')
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
