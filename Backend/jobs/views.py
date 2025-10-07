from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import PermissionDenied
from .models import Job
from .serializers import JobSerializer

class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [AllowAny]  # Anyone can view jobs
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['experience_level', 'job_type', 'location']
    search_fields = ['title', 'description', 'skills_required']
    ordering_fields = ['created_at', 'salary_min', 'salary_max']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and getattr(user, 'user_type', None) == 'recruiter':
            # Recruiters see only their own jobs
            return Job.objects.filter(recruiter=user)
        # Normal users or anonymous see only active jobs
        return Job.objects.filter(is_active=True)

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated or getattr(user, 'user_type', None) != 'recruiter':
            raise PermissionDenied("Only authenticated recruiters can create jobs.")
        serializer.save(recruiter=user)

    def perform_update(self, serializer):
        job = self.get_object()
        user = self.request.user
        if not user.is_authenticated or job.recruiter != user:
            raise PermissionDenied("You do not have permission to update this job.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if not user.is_authenticated or instance.recruiter != user:
            raise PermissionDenied("You do not have permission to delete this job.")
        instance.delete()
