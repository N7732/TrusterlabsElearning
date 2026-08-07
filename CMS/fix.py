from Training.models import TrainingParticipants
from Course.models import Enrollment

participants = TrainingParticipants.objects.filter(admission_status='ADMITTED')
count = 0
for p in participants:
    learner = getattr(p.participant, 'learner_profile', None)
    if learner:
        for tc in p.training.courses.all():
            e, created = Enrollment.objects.get_or_create(
                learner=learner, 
                course=tc.course, 
                defaults={'status': 'active'}
            )
            if created:
                count += 1

print(f"Created {count} missing enrollments")
