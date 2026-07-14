import os
import django
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "CMS.settings")
django.setup()

from Auth.serializer import AdminInstructorCreationSerializer
from Auth.models import User

# First, clean up
User.objects.filter(email='test_script_instructor@test.com').delete()

data = {
    'username': 'test_script_instructor@test.com',
    'email': 'test_script_instructor@test.com',
    'password': 'password123',
    'first_name': 'Test',
    'last_name': 'Inst',
    'can_create_courses': True,
    'can_update_courses': True,
    'can_delete_courses': True,
    'can_create_trainings': True,
    'can_update_trainings': True,
    'can_delete_trainings': True,
    'can_view_students': True,
    'can_create_certificates': True,
    'can_update_certificates': True,
    'can_delete_certificates': True
}

serializer = AdminInstructorCreationSerializer(data=data)
if serializer.is_valid():
    try:
        user = serializer.save()
        print("Success! User created with ID:", user.id)
    except Exception as e:
        print("Exception during save:", str(e))
else:
    print("Validation failed:")
    print(serializer.errors)
