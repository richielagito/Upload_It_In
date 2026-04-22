import os
from uploaditin_backend.utils.LSA import lsa_similarity


def test_score_submission_interface_exists():
    assert callable(lsa_similarity)


def test_legacy_lsa_returns_similarity_and_grade():
    os.environ.pop('SCORING_ENGINE', None)
    ref = "jawaban 1 = ini adalah jawaban guru\n"
    stu = "jawaban 1 = ini adalah jawaban murid\n"
    avg_similarity, grade, per_question = lsa_similarity(ref, stu)
    assert isinstance(avg_similarity, float)
    assert isinstance(grade, int)
    assert isinstance(per_question, list)
