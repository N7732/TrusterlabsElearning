from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.apps import apps
from .models import User, Learner, Instructor, AccountProfile
from django.core.mail import send_mail
from django.conf import settings

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    # Always ensure AccountProfile exists
    AccountProfile.objects.get_or_create(user=instance)
    if instance.user_type == 'instructor':
        configure_instructor_permissions(instance)
def configure_instructor_permissions(user):
    """
    Grants instructor permissions by:
    1. Setting is_staff=True for admin access
    2. Adding user to 'Instructors' group with Course permissions
    """
    # 1. Enable Admin Access
    if not user.is_staff:
        # Use update to avoid triggering signals recursively
        User.objects.filter(pk=user.pk).update(is_staff=True)
        # Update local instance to match
        user.is_staff = True

    # 2. Setup Instructors Group
    group, group_created = Group.objects.get_or_create(name='Instructors')
    
    if group_created or not group.permissions.exists():
        course_models = ['Course', 'Module', 'Lesson', 'Quizes', 'QuizQuestion', 'CoursePrerequisite']
        permissions_to_add = []
        
        for model_name in course_models:
            try:
                model = apps.get_model('courses', model_name)
                content_type = ContentType.objects.get_for_model(model)
                # Get all permissions for this model (add, change, delete, view)
                perms = Permission.objects.filter(content_type=content_type)
                permissions_to_add.extend(perms)
            except LookupError:
                continue
        
        if permissions_to_add:
            group.permissions.add(*permissions_to_add)

    # 3. Add user to group
    if not user.groups.filter(name='Instructors').exists():
        user.groups.add(group)

# @receiver(post_save, sender=Instructor)
# def send_instructor_welcome_email(sender, instance, created, **kwargs):
#     if created and instance.user and instance.user.email:
#         subject = "Welcome to TrusterLab Instructor Team"
#         message = f"Hello {instance.user.first_name or 'Instructor'},\n\nWelcome to TrusterLab! We are thrilled to have you as part of our instructor team. Your account has been successfully created.\n\nBest regards,\nTrusterLab Team"
#         from_email = settings.DEFAULT_FROM_EMAIL
#         recipient_list = [instance.user.email]
#         try:
#             send_mail(subject, message, from_email, recipient_list, fail_silently=True)
#         except Exception as e:
#             print(f"Error sending email: {e}")
