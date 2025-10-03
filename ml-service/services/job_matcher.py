import json
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from models.database import get_db_connection

class JobMatcher:
    def __init__(self):
        # Load embedding model once
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

    def find_matches(self, resume_id: int, top_k: int = 10):
        """Find top matching jobs for a resume"""
        conn = get_db_connection()
        cursor = conn.cursor()

        # ---------------- Get resume data ----------------
        cursor.execute("""
            SELECT embedding_vector, extracted_skills, user_id 
            FROM resumes_resume 
            WHERE id = %s AND is_parsed = TRUE
        """, (resume_id,))
        resume_data = cursor.fetchone()
        if not resume_data:
            cursor.close()
            conn.close()
            return []

        # Safe embedding loading
        try:
            resume_embedding = np.array(json.loads(resume_data[0]))
        except Exception:
            # Fallback if embedding is missing or corrupted
            resume_embedding = np.zeros((384,), dtype=float)

        resume_skills = set(s.strip().lower() for s in (resume_data[1] or '').split(',') if s)
        user_id = resume_data[2]

        # ---------------- Get active jobs ----------------
        cursor.execute("""
            SELECT id, title, description, skills_required, requirements
            FROM jobs_job
            WHERE is_active = TRUE
        """)
        jobs = cursor.fetchall()
        matches = []

        for job in jobs:
            job_id, title, description, skills_required, requirements = job

            # Combine job fields into text
            job_text = f"{title} {description or ''} {skills_required or ''} {requirements or ''}"
            job_embedding = self.embedding_model.encode(job_text)

            # Compute cosine similarity safely
            try:
                similarity = cosine_similarity(
                    resume_embedding.reshape(1, -1),
                    job_embedding.reshape(1, -1)
                )[0][0]
            except Exception as e:
                print(f"[Warning] Similarity error for job {job_id}: {e}")
                similarity = 0.0

            # Skill matching
            job_skills = set(s.strip().lower() for s in (skills_required or '').split(',') if s)
            matching_skills = resume_skills.intersection(job_skills)
            skill_gaps = job_skills - resume_skills
            skill_match_score = len(matching_skills) / len(job_skills) if job_skills else 0

            # Combined score: 70% embedding + 30% skills
            final_score = (similarity * 0.7 + skill_match_score * 0.3) * 100

            matches.append({
                'job_id': job_id,
                'title': title,
                'match_score': float(round(final_score, 2)),  # ✅ convert to native float
                'matching_skills': ', '.join(sorted(matching_skills)),
                'skill_gaps': ', '.join(sorted(skill_gaps)),
                'recommendation': self._generate_recommendation(final_score, matching_skills, skill_gaps)
            })

        # Sort by final score and take top_k
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        top_matches = matches[:top_k]

        # Save matches to database safely
        try:
            self._save_matches(cursor, conn, resume_id, user_id, top_matches)
        except Exception as e:
            print(f"[Error] Saving matches to DB failed: {e}")

        cursor.close()
        conn.close()
        return top_matches

    # ---------------- Helper methods ----------------
    def _generate_recommendation(self, score, matching_skills, skill_gaps):
        """Generate AI recommendation text"""
        if score >= 80:
            return f"Excellent match! You have {len(matching_skills)} matching skills."
        elif score >= 60:
            gap_text = f"Consider improving: {', '.join(list(skill_gaps)[:3])}" if skill_gaps else ""
            return f"Good match with room for improvement. {gap_text}"
        else:
            return "Moderate match. Significant skill development needed."

    def _save_matches(self, cursor, conn, resume_id, user_id, matches):
        """Save matches to database with upsert"""
        for match in matches:
            cursor.execute("""
                INSERT INTO matches_match 
                (candidate_id, job_id, resume_id, match_score, matching_skills, 
                 skill_gaps, recommendation, status, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, 'pending', NOW(), NOW())
                ON CONFLICT (candidate_id, job_id, resume_id) 
                DO UPDATE SET 
                    match_score = EXCLUDED.match_score,
                    matching_skills = EXCLUDED.matching_skills,
                    skill_gaps = EXCLUDED.skill_gaps,
                    recommendation = EXCLUDED.recommendation,
                    updated_at = NOW()
            """, (
                user_id,
                match['job_id'],
                resume_id,
                float(match['match_score']),  # ✅ ensure native float
                match['matching_skills'],
                match['skill_gaps'],
                match['recommendation']
            ))
        conn.commit()
