from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from .models import Resume
from .serializers import ResumeSerializer
import requests, threading, os
from django.conf import settings

class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        resume = serializer.save(
            user=self.request.user,
            original_filename=self.request.FILES['file'].name
        )

        # Trigger ML parsing in background
        threading.Thread(target=self._call_ml_service_parse, args=(resume,)).start()
        return resume

    def create(self, request, *args, **kwargs):
        """Override create to return serialized resume with ID"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        resume = self.perform_create(serializer)

        # Always return ID + fields
        return Response(self.get_serializer(resume).data, status=status.HTTP_201_CREATED)

    def _call_ml_service_parse(self, resume):
        """Send file to ML service for parsing"""
        try:
            ml_service_url = 'http://localhost:8001/parse-resume/'
            file_path = os.path.join(settings.MEDIA_ROOT, resume.file.name)

            with open(file_path, 'rb') as f:
                response = requests.post(
                    ml_service_url,
                    files={'file': f},
                    data={'resume_id': str(resume.id)}  # still form-data
                )

            print("ML Service parse response:", response.status_code, response.text)

        except Exception as e:
            print(f"Error calling ML service: {e}")

    @action(detail=True, methods=['post'])
    def find_matches(self, request, pk=None):
        resume = self.get_object()
        try:
            ml_service_url = 'http://localhost:8001/find-matches/'
            top_k = int(request.data.get('top_k', 10))
            payload = {'resume_id': resume.id, 'top_k': top_k}

            response = requests.post(ml_service_url, json=payload)

            if response.status_code != 200:
                return Response(
                    {"error": f"ML service failed with status {response.status_code}", "details": response.text},
                    status=status.HTTP_502_BAD_GATEWAY
                )

            try:
                json_data = response.json()
            except ValueError:
                return Response(
                    {"error": "Invalid JSON from ML service", "raw": response.text},
                    status=status.HTTP_502_BAD_GATEWAY
                )

            return Response(json_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
