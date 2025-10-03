from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Job
from .serializers import JobSerializer

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.filter(is_active=True)
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['experience_level', 'job_type', 'location']
    search_fields = ['title', 'description', 'skills_required']
    ordering_fields = ['created_at', 'salary_min', 'salary_max']
    
    def get_queryset(self):
        if self.request.user.user_type == 'recruiter':
            return Job.objects.filter(recruiter=self.request.user)
        return Job.objects.filter(is_active=True)