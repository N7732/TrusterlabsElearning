import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "CMS.settings")
django.setup()

from Course.serializer import CourseSerializer
from Course.models import Course

course = Course.objects.first()
if not course:
    print("No course found.")
    exit()

data = {
    'title': 'Python Basics',
    'description': 'Desc',
    'current': 'USD',
    'is_free': 'true',
    'price': '0',
    'difficulty': 'Beginner',
    'course_status': 'draft',
    'is_locked': 'false',
    'has_certificate': 'false',
    'auto_issue_certificate': 'false'
}

serializer = CourseSerializer(instance=course, data=data, partial=True)
if not serializer.is_valid():
    print(serializer.errors)
else:
    print("Valid!")
    serializer.save()
