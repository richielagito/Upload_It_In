import pytest
from uploaditin_backend.utils.highlight_helper import extract_highlights

def test_extract_highlights_basic():
    text = "The quick brown fox jumps over the lazy dog."
    raw_highlights = [
        {"quote": "quick brown fox", "category": "strong", "reason": "Good description"},
        {"quote": "lazy dog", "category": "weak", "reason": "Too lazy"}
    ]
    
    highlights = extract_highlights(text, raw_highlights)
    
    assert len(highlights) == 2
    assert highlights[0]["start"] == 4
    assert highlights[0]["end"] == 19
    assert highlights[1]["start"] == 35
    assert highlights[1]["end"] == 43

def test_extract_highlights_fuzzy_whitespace():
    text = "The  quick   brown fox jumps."
    raw_highlights = [
        {"quote": "quick brown fox", "category": "strong", "reason": "Fuzzy matching needed"}
    ]
    
    highlights = extract_highlights(text, raw_highlights)
    
    assert len(highlights) == 1
    assert highlights[0]["start"] == 5
    assert highlights[0]["end"] == 22

def test_extract_highlights_overlap():
    text = "The quick brown fox jumps."
    raw_highlights = [
        {"quote": "quick brown", "category": "strong", "reason": "First part"},
        {"quote": "brown fox", "category": "strong", "reason": "Second part"}
    ]
    
    # Logic should keep the first one or the longest one. 
    # For simplicity, let's say it keeps the one that comes first in text.
    highlights = extract_highlights(text, raw_highlights)
    
    assert len(highlights) == 1
    assert highlights[0]["quote"] == "quick brown"

def test_extract_highlights_not_found():
    text = "The quick brown fox jumps."
    raw_highlights = [
        {"quote": "nonexistent text", "category": "strong", "reason": "Should be ignored"}
    ]
    
    highlights = extract_highlights(text, raw_highlights)
    
    assert len(highlights) == 0
