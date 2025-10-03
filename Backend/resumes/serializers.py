from rest_framework import serializers
from .models import Resume

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = '__all__'
        read_only_fields = ['user', 'parsed_text', 'extracted_skills', 
                           'extracted_education', 'extracted_experience', 
                           'embedding_vector', 'is_parsed']