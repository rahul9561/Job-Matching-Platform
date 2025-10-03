from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Job

User = get_user_model()

class JobAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.recruiter = User.objects.create_user(
            username='recruiter1',
            email='recruiter@test.com',
            password='testpass123',
            user_type='recruiter'
        )
        self.client.force_authenticate(user=self.recruiter)
        
    def test_create_job(self):
        data = {
            'title': 'Software Engineer',
            'description': 'Great opportunity',
            'requirements': 'Python, Django',
            'skills_required': 'Python, Django, REST',
            'experience_level': 'mid',
            'job_type': 'full-time',
            'location': 'Remote',
        }
        response = self.client.post('/api/jobs/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Job.objects.count(), 1)
        self.assertEqual(Job.objects.get().title, 'Software Engineer')
        
    def test_list_jobs(self):
        Job.objects.create(
            recruiter=self.recruiter,
            title='Test Job',
            description='Test',
            requirements='Test',
            skills_required='Test',
            experience_level='entry',
            job_type='full-time',
            location='Test'
        )
        response = self.client.get('/api/jobs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)