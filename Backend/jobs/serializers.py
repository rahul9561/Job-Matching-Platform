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
        if request and hasattr(request, 'user'):
            validated_data['recruiter'] = request.user
        else:
            raise serializers.ValidationError({"recruiter": "Authenticated user is required to create a job."})
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        if not request or not hasattr(request, 'user') or instance.recruiter != request.user:
            raise serializers.ValidationError({"recruiter": "You do not have permission to update this job."})

        # Ensure recruiter cannot be changed
        validated_data.pop('recruiter', None)
        return super().update(instance, validated_data)
