from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Certificate

# @receiver(post_save, sender=Certificate)
# def send_certificate_congratulations_email(sender, instance, created, **kwargs):
#     if created and instance.learner and instance.learner.user and instance.learner.user.email:
#         learner_name = instance.learner.user.first_name or 'Student'
#         course_or_training = instance.course.title if instance.course else (instance.training.title if instance.training else "your program")
#         
#         subject = f"Congratulations on Completing {course_or_training}!"
#         message = f"Hello {learner_name},\n\nCongratulations on successfully completing {course_or_training} and earning your certificate!\nWe are proud of your achievement.\n\nBest regards,\nTrusterLab Team"
#         from_email = settings.DEFAULT_FROM_EMAIL
#         recipient_list = [instance.learner.user.email]
#         
#         try:
#             send_mail(subject, message, from_email, recipient_list, fail_silently=True)
#         except Exception as e:
#             print(f"Error sending email: {e}")
