from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.resume_parser import ResumeParser
from services.job_matcher import JobMatcher
from models.database import get_db_connection
import shutil, os, json

app = FastAPI(title="Resume ML Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

resume_parser = ResumeParser()
job_matcher = JobMatcher()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ----------------- PARSE RESUME -----------------
@app.post("/parse-resume/")
async def parse_resume(file: UploadFile = File(None), resume_id: int = Form(...)):
    try:
        if file:
            file_path = os.path.join(UPLOAD_DIR, f"{resume_id}_{file.filename}")
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        else:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT file FROM resumes_resume WHERE id = %s", (resume_id,))
            result = cursor.fetchone()
            cursor.close()
            conn.close()
            if not result:
                raise HTTPException(status_code=404, detail="Resume not found")
            file_path = result[0]

        parsed_data = resume_parser.parse(file_path)

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE resumes_resume 
            SET parsed_text=%s,
                extracted_skills=%s,
                extracted_education=%s,
                extracted_experience=%s,
                embedding_vector=%s,
                is_parsed=TRUE
            WHERE id=%s
        """, (
            parsed_data['text'],
            parsed_data['skills'],
            parsed_data['education'],
            parsed_data['experience'],
            parsed_data['embedding'],
            resume_id
        ))
        conn.commit()
        cursor.close()
        conn.close()

        return {"status": "success", "resume_id": resume_id, "parsed_data": parsed_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ----------------- FIND MATCHES -----------------
class MatchRequest(BaseModel):
    resume_id: int
    top_k: int = 10

@app.post("/find-matches/")
async def find_matches(request: MatchRequest):
    try:
        top_k = min(max(request.top_k, 1), 50)
        matches = job_matcher.find_matches(resume_id=request.resume_id, top_k=top_k)
        if not matches:
            return {
                "status": "success",
                "resume_id": request.resume_id,
                "matches": [],
                "message": "No matches found or resume not parsed yet"
            }
        return {"status": "success", "resume_id": request.resume_id, "matches": matches}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ----------------- HEALTH CHECK -----------------
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
