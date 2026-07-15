import os
import django
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'CMS.settings')
django.setup()

def send_html_samples():
    recipient = settings.EMAIL_HOST_USER
    print(f"Sending HTML sample emails to {recipient}...")

    # 1. Welcome Email Sample
    try:
        # Create a mock user object dictionary for the template
        class MockUser:
            first_name = "Test"
            last_name = "User"
            email = recipient

        context = {
            'user': MockUser(),
            'settings': settings,
        }
        
        html_message = render_to_string('emails/welcome_email.html', context)
        text_content = strip_tags(html_message)
        email = EmailMultiAlternatives(
            subject="Sample: Welcome to Our E-Learning Platform!",
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient],
        )
        email.attach_alternative(html_message, "text/html")
        email.send()
        print("SUCCESS: Welcome Email HTML sent successfully!")
    except Exception as e:
        print(f"FAILED: Failed to send Welcome Email: {e}")


    # 2. Password Reset Sample
    try:
        class MockUser2:
            first_name = "Test"
            email = recipient
            
        context = {
            'user': MockUser2(),
            'reset_url': 'https://frontend-omega-five-21.vercel.app/reset-password/sample/token',
            'expiry_hours': 1,
            'settings': settings,
        }
        
        html_message = render_to_string('emails/password_reset_email.html', context)
        text_content = strip_tags(html_message)
        email = EmailMultiAlternatives(
            subject="Sample: Password Reset Requested",
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient],
        )
        email.attach_alternative(html_message, "text/html")
        email.send()
        print("SUCCESS: Password Reset HTML sent successfully!")
    except Exception as e:
        print(f"FAILED: Failed to send Password Reset Email: {e}")

if __name__ == '__main__':
    send_html_samples()
