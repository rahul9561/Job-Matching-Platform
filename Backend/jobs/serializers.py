from rest_framework import serializers
from .models import Job
from users.serializers import UserSerializer, RecruiterProfileSerializer

class JobSerializer(serializers.ModelSerializer):
    recruiter_details = UserSerializer(source='recruiter', read_only=True)
    recruiter_profile = RecruiterProfileSerializer(source='recruiter.recruiter_profile', read_only=True)

    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ['recruiter', 'created_at', 'updated_at']

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['recruiter'] = request.user
        return super().create(validated_data)
