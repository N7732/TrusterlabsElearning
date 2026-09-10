import os
import django
import sys
from datetime import date, time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'CMS.settings')
django.setup()

from Auth.views import (
    send_professional_membership_confirmation_email,
    send_professional_membership_added_email,
    send_project_consultation_scheduled_email,
    send_project_status_update_email
)
from Auth.models import User
from Membership.models import Membership
from Project.models import UserProject, ConsultationMeeting

print("--- Testing New Email Templates ---")

# Ensure a test user exists
user, created = User.objects.get_or_create(email="testadmin@example.com", defaults={
    'username': 'testadmin',
    'first_name': 'Test',
    'last_name': 'Admin',
    'password': 'testpassword'
})

# Test Professional Membership Confirmation
membership = Membership.objects.create(
    user=user,
    Fullname="Test Admin",
    email="testadmin@example.com",
    membership_type="professional",
    status="active",
    start_date=date.today(),
    expiry_date=date.today(),
    duration_days=365
)

print("Sending Confirmation Email...")
try:
    send_professional_membership_confirmation_email(membership)
    print("Success: send_professional_membership_confirmation_email")
except Exception as e:
    print(f"Error sending confirmation email: {e}")

# Test Professional Membership Added
print("Sending Added Email...")
try:
    send_professional_membership_added_email(membership)
    print("Success: send_professional_membership_added_email")
except Exception as e:
    print(f"Error sending added email: {e}")

# Test Project Consultation Scheduled
project = UserProject.objects.create(
    owner=user,
    name="Test Project",
    language="Python",
    framework="Django",
    description="A test project",
    problem_solved="Testing emails",
    objectives="Testing emails",
    status="under_consultation",
    project_type="user_submitted"
)

meeting = ConsultationMeeting.objects.create(
    project=project,
    meeting_date=date.today(),
    meeting_time=time(14, 30),
    duration_minutes=30,
    meeting_link="https://meet.google.com/test-link"
)

print("Sending Consultation Scheduled Email...")
try:
    send_project_consultation_scheduled_email(meeting)
    print("Success: send_project_consultation_scheduled_email")
except Exception as e:
    print(f"Error sending consultation email: {e}")

# Test Project Status Update
print("Sending Project Status Update Email...")
try:
    send_project_status_update_email(project, old_status="submitted", new_status="under_consultation")
    print("Success: send_project_status_update_email")
except Exception as e:
    print(f"Error sending status update email: {e}")

print("Done testing new emails.")

# Cleanup
meeting.delete()
project.delete()
membership.delete()
