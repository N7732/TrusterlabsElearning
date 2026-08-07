import os
import django
import json
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'CMS.settings')
django.setup()

from Course.models import Enrollment
from Auth.models import User
from Course.serializer import EnrollmentSerializer

# Get the last user who has an enrollment
last_enrollment = Enrollment.objects.order_by('-id').first()
if last_enrollment:
    print(f"Testing for user: {last_enrollment.learner.user.email}")
    qs = Enrollment.objects.filter(learner=last_enrollment.learner)
    serializer = EnrollmentSerializer(qs, many=True)
    print(json.dumps(serializer.data, indent=2))
else:
    print("No enrollments found in database.")
