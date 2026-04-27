import pytest
import json
from uploaditin_backend.utils import feedback_generator

class _FakeResponse:
    def __init__(self, text):
        self.text = text

def test_generate_feedback_success(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "dummy-key")
    
    mock_json_response = {
        "feedback": "Bagus sekali! Kamu sudah memahami konsep dasar.",
        "highlights": [
            {"quote": "konsep dasar", "category": "strong", "reason": "Menunjukkan pemahaman awal."}
        ]
    }
    
    class FakeModels:
        @staticmethod
        def generate_content(model, contents, config=None):
            return _FakeResponse(json.dumps(mock_json_response))
            
    class FakeClient:
        models = FakeModels()
        
    monkeypatch.setattr(feedback_generator, "_create_genai_client", lambda api_key: FakeClient())
    
    result = feedback_generator.generate_pedagogical_feedback(
        teacher_answer="Ekosistem adalah...",
        student_answer="Ekosistem itu...",
        score=70
    )
    
    assert isinstance(result, dict)
    assert result["feedback"] == mock_json_response["feedback"]
    assert result["highlights"] == mock_json_response["highlights"]

def test_generate_feedback_malformed_json(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "dummy-key")
    
    class FakeModels:
        @staticmethod
        def generate_content(model, contents):
            return _FakeResponse("This is not JSON")
            
    class FakeClient:
        models = FakeModels()
        
    monkeypatch.setattr(feedback_generator, "_create_genai_client", lambda api_key: FakeClient())
    
    result = feedback_generator.generate_pedagogical_feedback(
        teacher_answer="Ekosistem adalah...",
        student_answer="Ekosistem itu...",
        score=70
    )
    
    assert isinstance(result, dict)
    assert "feedback" in result
    assert result["highlights"] == []

def test_generate_feedback_missing_key(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    
    with pytest.raises(RuntimeError) as exc:
        feedback_generator.generate_pedagogical_feedback("a", "b", 50)
        
    assert "GEMINI_API_KEY" in str(exc.value)
