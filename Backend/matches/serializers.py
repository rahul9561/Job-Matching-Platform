from rest_framework import serializers
from .models import Match
from jobs.serializers import JobSerializer
from resumes.serializers import ResumeSerializer
from users.serializers import UserSerializer , RecruiterProfileSerializer

class MatchSerializer(serializers.ModelSerializer):
    candidate_details = UserSerializer(source='candidate', read_only=True)
    job_details = JobSerializer(source='job', read_only=True)
    resume_details = ResumeSerializer(source='resume', read_only=True)
    
    class Meta:
        model = Match
        fields = '__all__'