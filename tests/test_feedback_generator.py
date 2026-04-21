import pytest
from uploaditin_backend.utils import feedback_generator

class _FakeResponse:
    def __init__(self, text):
        self.text = text

def test_generate_feedback_success(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "dummy-key")
    
    mock_feedback_text = "Bagus sekali! Kamu sudah memahami konsep dasar."
    
    class FakeModels:
        @staticmethod
        def generate_content(model, contents):
            return _FakeResponse(mock_feedback_text)
            
    class FakeClient:
        models = FakeModels()
        
    monkeypatch.setattr(feedback_generator, "_create_genai_client", lambda api_key: FakeClient())
    
    feedback = feedback_generator.generate_pedagogical_feedback(
        teacher_answer="Ekosistem adalah...",
        student_answer="Ekosistem itu...",
        score=70
    )
    
    assert feedback == mock_feedback_text

def test_generate_feedback_missing_key(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    
    with pytest.raises(RuntimeError) as exc:
        feedback_generator.generate_pedagogical_feedback("a", "b", 50)
        
    assert "GEMINI_API_KEY" in str(exc.value)
