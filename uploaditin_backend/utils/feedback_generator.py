import os
import logging
from google import genai

logger = logging.getLogger(__name__)

DEFAULT_MODEL = "gemini-flash-latest"

def _create_genai_client(api_key: str):
    return genai.Client(api_key=api_key)

def generate_pedagogical_feedback(teacher_answer: str, student_answer: str, score: int) -> str:
    """Generate pedagogical feedback using Gemini.
    
    Args:
        teacher_answer: The reference answer from the teacher.
        student_answer: The student's submitted answer.
        score: The calculated similarity score (0-100).
        
    Returns:
        A string containing the feedback in Indonesian.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set.")
    
    client = _create_genai_client(api_key)
    
    prompt = f"""
    You are an expert pedagogical assistant. Your task is to provide constructive, encouraging, and detailed feedback to a student based on their essay answer compared to a teacher's reference answer.
    
    Teacher's Reference Answer:
    {teacher_answer}
    
    Student's Answer:
    {student_answer}
    
    Calculated Similarity Score: {score}/100
    
    Instructions:
    1. Start with a positive opening that acknowledges the student's effort.
    2. Identify specific strengths in the student's answer (what they got right or expressed well).
    3. Identify specific areas for improvement, referring to the teacher's reference answer for missing key points or concepts.
    4. Provide actionable advice on how the student can improve their writing or understanding.
    5. Maintain a supportive, pedagogical tone. Use "you" to address the student directly.
    6. Keep the feedback concise but meaningful (around 100-150 words).
    7. Language: Indonesian.
    
    Feedback:
    """
    
    try:
        response = client.models.generate_content(
            model=DEFAULT_MODEL,
            contents=prompt
        )
        return response.text
    except Exception as e:
        logger.error(f"Error generating feedback: {e}")
        return "Maaf, terjadi kesalahan saat menghasilkan feedback otomatis."
