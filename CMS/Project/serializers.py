from rest_framework import serializers
from .models import UserProject, ConsultationMeeting
from Membership.serializers import MembershipSerializer

class ConsultationMeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationMeeting
        fields = '__all__'

class UserProjectSerializer(serializers.ModelSerializer):
    meetings = ConsultationMeetingSerializer(many=True, read_only=True)
    membership_details = MembershipSerializer(source='membership', read_only=True)
    owner_name = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = UserProject
        fields = '__all__'
        read_only_fields = ['project_id', 'owner', 'created_at', 'updated_at']
