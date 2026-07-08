from rest_framework import serializers
from .models import ResearchPublication, Webinar, WebinarRegistration

class ResearchPublicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchPublication
        fields = '__all__'

class WebinarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Webinar
        fields = '__all__'

class WebinarRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebinarRegistration
        fields = '__all__'
