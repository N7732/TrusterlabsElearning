from django.db.models.signals import post_save
from django.dispatch import receiver
# pyrefly: ignore [missing-import]
from .models import Notification, ContactMessage
from Enquiry.models import Requrement
from Course.models import Course

@receiver(post_save, sender=ContactMessage)
def contact_message_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            title="New Contact Message",
            message=f"You have received a new contact message from {instance.name} ({instance.email}). Subject: {instance.subject}",
            notification_type="contact",
            link="/admin/contact_messages"
        )

@receiver(post_save, sender=Requrement)
def enquiry_notification(sender, instance, created, **kwargs):
    if created:
        course_name = instance.course.title if instance.course else "General Inquiry"
        user_name = instance.user.get_full_name() or instance.user.username
        Notification.objects.create(
            title="New Student Enquiry",
            message=f"New enquiry from {user_name} regarding {course_name}.",
            notification_type="enquiry",
            link="/admin/student_enquiries"
        )

@receiver(post_save, sender=Course)
def course_notification(sender, instance, created, **kwargs):
    if created:
        instructor_name = instance.instructor.user.get_full_name() if instance.instructor else "Admin"
        Notification.objects.create(
            title="New Course Created",
            message=f"A new course '{instance.title}' was created by {instructor_name}.",
            notification_type="course",
            link="/admin/courses"
        )
