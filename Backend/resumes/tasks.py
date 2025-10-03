from celery import shared_task
import requests
from .models import Resume

@shared_task
def parse_resume_async(resume_id):
    """Asynchronously parse resume using ML service"""
    try:
        resume = Resume.objects.get(id=resume_id)
        
        # Call ML service
        ml_service_url = 'http://localhost:8001/parse-resume/'
        response = requests.post(
            ml_service_url,
            json={'resume_id': resume_id},
            timeout=60
        )
        
        if response.status_code == 200:
            return {'status': 'success', 'resume_id': resume_id}
        else:
            return {'status': 'error', 'message': response.text}
            
    except Resume.DoesNotExist:
        return {'status': 'error', 'message': 'Resume not found'}
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

# @shared_taskexport default Register;