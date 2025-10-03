from django.db import models
from users.models import User

class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    file = models.FileField(upload_to='resumes/')
    original_filename = models.CharField(max_length=255)
    
    # Parsed fields
    parsed_text = models.TextField(blank=True)
    extracted_skills = models.TextField(blank=True)
    extracted_education = models.TextField(blank=True)
    extracted_experience = models.TextField(blank=True)
    embedding_vector = models.JSONField(null=True, blank=True)  # Store BERT embeddings
    
    is_parsed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.original_filename}"