import os
from django.conf import settings
from SuperSetting.models import EmailTemplate

emails_dir = os.path.join(settings.BASE_DIR, 'templates', 'emails')
if not os.path.exists(emails_dir):
    print("emails directory not found.")
else:
    for filename in os.listdir(emails_dir):
        if filename.endswith('.html'):
            filepath = os.path.join(emails_dir, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            template_name = filename.replace('.html', '')
            subject = f"Notification: {template_name.replace('_', ' ').title()}"
            
            # Upsert
            template, created = EmailTemplate.objects.get_or_create(template_name=template_name)
            template.subject = subject
            template.html_content = content
            template.save()
            print(f"{'Created' if created else 'Updated'} {template_name}")

# Also check emails
resent_dir = os.path.join(settings.BASE_DIR, 'templates', 'emails')
if os.path.exists(resent_dir):
    for filename in os.listdir(resent_dir):
        if filename.endswith('.html'):
            filepath = os.path.join(resent_dir, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            template_name = filename.replace('.html', '')
            subject = f"Notification: {template_name.replace('_', ' ').title()}"
            
            template, created = EmailTemplate.objects.get_or_create(template_name=template_name)
            template.subject = subject
            template.html_content = content
            template.save()
            print(f"{'Created' if created else 'Updated'} {template_name}")

print("Seeding completed.")
