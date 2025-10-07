from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import CandidateProfile, RecruiterProfile

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'user_type', 'phone', 'profile_picture']
        read_only_fields = ['id']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 
                  'last_name', 'user_type', 'phone']
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        
        # Create profile based on user type
        if user.user_type == 'candidate':
            CandidateProfile.objects.create(user=user)
        elif user.user_type == 'recruiter':
            RecruiterProfile.objects.create(user=user, company_name='')
        
        return user

class CandidateProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = CandidateProfile
        fields = '__all__'



class RecruiterProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = RecruiterProfile
        fields = '__all__'
        read_only_fields = ['user']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        else:
            raise serializers.ValidationError({"user": "Authenticated user is required to create a profile."})
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        if not request or not hasattr(request, 'user') or instance.user != request.user:
            raise serializers.ValidationError({"user": "You do not have permission to update this profile."})

        # Ensure the user cannot be changed
        validated_data.pop('user', None)
        return super().update(instance, validated_data)
