from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Requrement
from .serializer import RequirementSerializer
from Course.models import Enrollment, Course

class RequirementViewSet(viewsets.ModelViewSet):
    queryset = Requrement.objects.all()
    serializer_class = RequirementSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Requrement.objects.all().order_by('-created_at')
        if not user.is_authenticated:
            return Requrement.objects.none()
            
        if user.user_type == 'admin' or user.is_superuser:
            return queryset
            
        if user.user_type == 'instructor' and self.request.query_params.get('my_enquiries') == 'true':
            return queryset.filter(course__instructor=user.instructor_profile)
            
        return queryset.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


    @action(detail=True, methods=['post'])
    def enroll_student(self, request, pk=None):
        inquiry = self.get_object()
        
        if inquiry.status == 'enrolled':
            return Response({'error': 'Student already enrolled from this inquiry'}, status=status.HTTP_400_BAD_REQUEST)
            
        if not inquiry.course:
            return Response({'error': 'This inquiry is not linked to a course'}, status=status.HTTP_400_BAD_REQUEST)
            
        learner = getattr(inquiry.user, 'learner_profile', None)
        if not learner:
            return Response({'error': 'User is not a learner'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Create enrollment
        Enrollment.objects.get_or_create(
            learner=learner, 
            course=inquiry.course, 
            defaults={'status': 'active'}
        )
        
        # Update inquiry status
        inquiry.status = 'enrolled'
        inquiry.save()
        
        return Response({'message': 'Student successfully enrolled!'}, status=status.HTTP_200_OK)

