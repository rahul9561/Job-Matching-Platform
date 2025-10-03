from django.urls import path
from .views import RegisterView, UserProfileView, CandidateProfileView, RecruiterProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('candidate-profile/', CandidateProfileView.as_view(), name='candidate-profile'),
    path('recruiter-profile/', RecruiterProfileView.as_view(), name='recruiter-profile'),
]