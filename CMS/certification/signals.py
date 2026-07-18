from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Certificate

@receiver(post_save, sender=Certificate)
def send_certificate_congratulations_email(sender, instance, created, **kwargs):
    if created and instance.learner and instance.learner.user and instance.learner.user.email:
        course_title = instance.course.title if instance.course else "a course"
        learner_name = instance.learner.user.first_name or 'Student'
        
        subject = f"Congratulations on your Certificate for {course_title}!"
        message = f"Hello {learner_name},\n\nCongratulations! You have successfully completed '{course_title}' and won a certificate.\nYou can view or download your certificate from your dashboard.\n\nBest regards,\nTrusterLab Team"
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [instance.learner.user.email]
        
        try:
            send_mail(subject, message, from_email, recipient_list, fail_silently=True)
        except Exception as e:
            print(f"Error sending email: {e}")
