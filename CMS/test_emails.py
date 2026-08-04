import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'CMS.settings')
django.setup()

from Training.models import TrainingParticipants
from certification.models import Certificate
from Auth.views import render_email_template, send_email_async
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils.html import strip_tags

print("--- Sending Admitted Emails ---")
participants = TrainingParticipants.objects.filter(admission_status='ADMITTED')
print(f"Found {participants.count()} admitted participants.")

for p in participants:
    training = p.training
    user = p.participant
    email = p.application_email or user.email
    name = p.application_full_name or user.get_full_name()
    if not email: continue
    
    context = {
        'name': name,
        'training_title': training.title,
        'start_date': training.starting_date.strftime('%B %d, %Y') if training.starting_date else 'TBD',
        'end_date': training.ending_date.strftime('%B %d, %Y') if training.ending_date else 'TBD',
        'frontend_url': os.getenv('FRONTEND_URL', 'http://localhost:5173').rstrip('/'),
        'training_id': training.id
    }
    
    try:
        html_message, dynamic_subject = render_email_template('emails/training_admitted.html', context)
        text_content = strip_tags(html_message)
        
        email_message = EmailMultiAlternatives(
            subject=dynamic_subject or f"Admitted: {training.title}",
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )
        email_message.attach_alternative(html_message, "text/html")
        send_email_async(email_message)
        print(f"Sent admitted email to {email}")
    except Exception as e:
        print(f"Failed to send to {email}: {e}")


print("\n--- Sending Certificate Emails ---")
certs = Certificate.objects.filter(is_issued=True)
print(f"Found {certs.count()} issued certificates.")

for cert in certs:
    learner_name = cert.learner.user.get_full_name() or cert.learner.user.username
    program_title = cert.course.title if cert.course else (cert.training.title if cert.training else 'Program')
    
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    verify_url = f"{frontend_url}/verify/{cert.certificate_code}"
    
    context = {
        'learner': cert.learner,
        'name': learner_name,
        'program_title': program_title,
        'certificate': cert,
        'frontend_url': frontend_url
    }
    
    try:
        html_message, dynamic_subject = render_email_template('emails/certificate_email.html', context)
        text_content = strip_tags(html_message)
        
        email_message = EmailMultiAlternatives(
            subject=dynamic_subject or f"Your Certificate for {program_title}",
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[cert.learner.user.email],
        )
        email_message.attach_alternative(html_message, "text/html")
        send_email_async(email_message)
        print(f"Sent certificate email to {cert.learner.user.email}")
    except Exception as e:
        print(f"Failed to send to {cert.learner.user.email}: {e}")

print("Done.")
