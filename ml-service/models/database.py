import psycopg2
from decouple import config

def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        dbname=config('DB_NAME', default='resume_matcher_db'),
        user=config('DB_USER', default='postgres'),
        password=config('DB_PASSWORD', default='root'),
        host=config('DB_HOST', default='localhost'),
        port=config('DB_PORT', default='5432')
    )