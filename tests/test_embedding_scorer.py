import sys
import pathlib
import pytest

# Ensure project root is on sys.path for test discovery environments
sys.path.append(str(pathlib.Path(__file__).resolve().parents[1]))

from uploaditin_backend.utils.embedding_scorer import embedding_score_submission


class DummyEmbeddingClient:
    """Simple mock replacement for embedding_client.get_embeddings.

    We'll monkeypatch uploaditin_backend.utils.embedding_client.get_embeddings
    to point to this function during tests.
    """


def fake_get_embeddings_texts(texts):
    # Return deterministic vectors: vector = [len(text), 0.0, 0.0]
    vecs = []
    for t in texts:
        vecs.append([float(len(t)), 0.0, 0.0])
    return vecs


def test_embedding_score_basic(monkeypatch):
    monkeypatch.setattr("uploaditin_backend.utils.embedding_client.get_embeddings", fake_get_embeddings_texts)

    teacher = "jawaban 1 = The cat sat on the mat\njawaban 2 = Water is wet"
    student = "jawaban 1 = The cat sat on mat\njawaban 2 = Water is wet indeed"

    res = embedding_score_submission(teacher, student)

    # With our fake vectors, similarity is 1.0 when lengths equal, otherwise ratio of lengths
    assert "avg_similarity" in res and "grade" in res and "per_question" in res
    assert isinstance(res["avg_similarity"], float)
    assert isinstance(res["grade"], int)
    assert len(res["per_question"]) == 2

    # Check rounding: similarities are rounded to 3 decimals
    for pq in res["per_question"]:
        assert round(pq["similarity"], 3) == pq["similarity"]


def test_missing_student_answer(monkeypatch):
    monkeypatch.setattr("uploaditin_backend.utils.embedding_client.get_embeddings", fake_get_embeddings_texts)

    teacher = "jawaban 1 = Answer one\njawaban 2 = Answer two"
    student = "jawaban 1 = "  # student missing answer 2

    res = embedding_score_submission(teacher, student)
    assert res["per_question"][0]["similarity"] >= 0.0
    assert res["per_question"][1]["similarity"] == 0.0


def test_no_questions_parsed(monkeypatch):
    monkeypatch.setattr("uploaditin_backend.utils.embedding_client.get_embeddings", fake_get_embeddings_texts)

    teacher = "this has no answers"  # extract_answers will return {}
    student = "some text"
    res = embedding_score_submission(teacher, student)
    assert res["avg_similarity"] == 0.0
    assert res["grade"] == 0
    assert res["per_question"] == []
