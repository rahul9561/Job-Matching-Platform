import PyPDF2
import docx
import spacy
from sentence_transformers import SentenceTransformer
import json
import re
import os

class ResumeParser:
    def __init__(self):
        # Load NLP model
        self.nlp = spacy.load("en_core_web_sm")
        # Embedding model
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Skill regex patterns
        self.skill_patterns = [
            r'\b(python|java|javascript|react|angular|vue|django|flask|fastapi|'
            r'sql|postgresql|mysql|mongodb|docker|kubernetes|aws|azure|gcp|'
            r'machine learning|deep learning|nlp|computer vision|tensorflow|pytorch|'
            r'git|agile|scrum|rest api|graphql|html|css|node\.js|typescript)\b'
        ]
    
    def parse(self, file_path):
        """Main parsing function"""
        # Extract text safely
        text = self._extract_text(file_path)
        
        if not text.strip():
            text = "Text extraction failed or empty file"
        
        # Process with spaCy
        doc = self.nlp(text)
        
        # Extract information
        skills = self._extract_skills(text)
        education = self._extract_education(doc)
        experience = self._extract_experience(text)
        
        # Generate embedding safely
        try:
            embedding = self.embedding_model.encode(text).tolist()
        except Exception as e:
            print(f"Warning: embedding generation failed: {e}")
            embedding = []

        return {
            'text': text,
            'skills': ', '.join(skills),
            'education': education,
            'experience': experience,
            'embedding': json.dumps(embedding)
        }
    
    def _extract_text(self, file_path):
        """Extract text from PDF, DOCX, or TXT safely"""
        try:
            if file_path.lower().endswith('.pdf'):
                return self._extract_from_pdf(file_path)
            elif file_path.lower().endswith('.docx'):
                return self._extract_from_docx(file_path)
            else:
                # Fallback for txt or unknown files
                with open(file_path, 'rb') as f:
                    raw = f.read()
                return raw.decode('utf-8', errors='ignore')
        except Exception as e:
            print(f"Warning: failed to extract text from {file_path}: {e}")
            return ""
    
    def _extract_from_pdf(self, file_path):
        """Extract text from PDF safely"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            print(f"Warning: PDF extraction failed for {file_path}: {e}")
        return text
    
    def _extract_from_docx(self, file_path):
        """Extract text from DOCX safely"""
        text = ""
        try:
            doc = docx.Document(file_path)
            text = '\n'.join([para.text for para in doc.paragraphs if para.text.strip()])
        except Exception as e:
            print(f"Warning: DOCX extraction failed for {file_path}: {e}")
        return text
    
    def _extract_skills(self, text):
        """Extract skills using regex patterns"""
        text_lower = text.lower()
        skills = set()
        for pattern in self.skill_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            skills.update(matches)
        return list(skills)
    
    def _extract_education(self, doc):
        """Extract education info from text using NLP"""
        education_keywords = ['university', 'college', 'bachelor', 'master', 
                              'phd', 'degree', 'diploma']
        education_info = []
        for sent in doc.sents:
            if any(keyword in sent.text.lower() for keyword in education_keywords):
                education_info.append(sent.text.strip())
        return ' | '.join(education_info[:3])  # return top 3
    
    def _extract_experience(self, text):
        """Extract work experience info"""
        # Looks for date ranges like 2018-2020 or 2019 – present
        experience_pattern = r'(\d{4}\s*[-–]\s*(?:\d{4}|present))'
        matches = re.findall(experience_pattern, text, re.IGNORECASE)
        if matches:
            return f"Found {len(matches)} work experiences"
        return "Experience details not clearly identified"
