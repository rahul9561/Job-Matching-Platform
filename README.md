# 🚀 AI-Powered Job Matching Platform  

An intelligent recruitment platform that connects **candidates** and **recruiters** using **AI-driven resume parsing and job matching**.  
The system combines a **React.js frontend**, a **Django REST Framework backend**, and a **FastAPI microservice for AI models** (BERT, spaCy, Sentence-BERT).  

---

## 📌 Architecture Overview  

                          ┌────────────────────────┐
                          │        Frontend        │
                          │     React.js App       │
                          │ (Candidate/Recruiter   │
                          │   Dashboards, Uploads) │
                          └───────────▲────────────┘
                                      │
                                      │ REST/GraphQL API calls
                                      │
             ┌────────────────────────┴─────────────────────────┐
             │                    Backend                      │
             │─────────────────────────────────────────────────│
             │                                                 │
   ┌─────────┴───────────┐                          ┌─────────┴─────────┐
   │   Django + DRF      │                          │     FastAPI ML     │
   │ (User Auth, Jobs,   │◄───────Async Requests────►│  Resume Parsing,   │
   │ Resume Upload, ORM, │                          │  Deep Learning      │
   │ Admin, APIs)        │                          │  Matching Service   │
   └─────────▲───────────┘                          └─────────▲─────────┘
             │                                               │
             │  Database ORM (PostgreSQL/MySQL)              │
             │                                               │
   ┌─────────┴───────────┐                          ┌────────┴─────────┐
   │  PostgreSQL/MySQL   │                          │ HuggingFace BERT │
   │  (Users, Jobs,      │                          │ Sentence-BERT     │
   │  Resumes, Matches)  │                          │ spaCy (NER)       │
   └─────────────────────┘                          └───────────────────┘



---

## ⚙️ Tech Stack  

### **Frontend**
- React.js (Candidate & Recruiter Dashboards)  
- Axios (API calls)  
- File Uploads for Resumes (PDF/DOCX)  

### **Backend (Django + DRF)**
- Django REST Framework (APIs)  
- JWT Authentication  
- User Management (Candidates/Recruiters)  
- Job Postings & Resume Storage  
- Admin Panel for management  

### **ML Service (FastAPI)**
- Resume Parsing (spaCy NER)  
- Job–Resume Matching (Sentence-BERT / HuggingFace Transformers)  
- Asynchronous Communication with Django  

### **Database**
- PostgreSQL / MySQL (production)  
- SQLite (local development)  

---

## 🔑 Features  

- 👤 **User Roles**: Candidate & Recruiter dashboards  
- 📄 **Resume Upload & Parsing** (extracts skills, experience, education)  
- 🧠 **AI-Powered Matching** (finds best job–resume fit)  
- 🔍 **Job Search & Recommendations**  
- 📊 **Recruiter Dashboard** (manage postings, view matched candidates)  
- 🔐 **JWT Authentication**  
- ⚡ **Async Requests** between Django ↔ FastAPI  

---

## 📂 Project Structure  




---

## 🚀 Setup & Installation  

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/rahul9561/job-matching-platform.git
cd job-matching-platform
```

2️⃣ Backend Setup (Django + DRF)
```bash
cd backend
python -m venv venv
source venv/bin/activate   # (Windows: venv\Scripts\activate)
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # Optional: Create admin user
python manage.py runserver
```


3️⃣ ML Service Setup (FastAPI)
```bash
cd ml-service
python -m venv venv
source venv/bin/activate   # (Windows: venv\Scripts\activate)
pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```

4️⃣ Frontend Setup (React.js)
```bash
cd frontend
npm install
npm start
```

