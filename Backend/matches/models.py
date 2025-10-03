from django.db import models
from users.models import User
from jobs.models import Job
from resumes.models import Resume

class Match(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
        ('interviewed', 'Interviewed'),
    )
    
    candidate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matches')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='matches')
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='matches')
    
    match_score = models.FloatField()  # 0-100 similarity score
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # AI-generated insights
    matching_skills = models.TextField(blank=True)
    skill_gaps = models.TextField(blank=True)
    recommendation = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-match_score', '-created_at']
        unique_together = ['candidate', 'job', 'resume']
    
    def __str__(self):
        return f"{self.candidate.username} - {self.job.title} ({self.match_score}%)"