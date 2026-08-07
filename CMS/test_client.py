import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'CMS.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth import get_user_model
from Course.views import EnrollmentViewSet
import json

User = get_user_model()
user = User.objects.filter(learner_profile__isnull=False).last()

if user:
    print(f"Testing API for user: {user.email}")
    factory = APIRequestFactory()
    request = factory.get('/api/enrollments/')
    force_authenticate(request, user=user)
    
    view = EnrollmentViewSet.as_view({'get': 'list'})
    try:
        response = view(request)
        response.render()
        print("Status code:", response.status_code)
        if response.status_code == 200:
            print("Successfully rendered JSON!")
            data = json.loads(response.content)
            print(f"Returned {len(data)} items")
            if isinstance(data, dict) and 'results' in data:
                print("PAGINATION DETECTED")
        else:
            print("Response:", response.content)
    except Exception as e:
        import traceback
        traceback.print_exc()
else:
    print("No learner found")
