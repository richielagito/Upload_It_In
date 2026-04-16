from uploaditin_backend.utils.embedding_scorer import embedding_score_submission


def test_embedding_score_submission_contract():
    ref = "jawaban 1 = ini adalah jawaban guru\n"
    stu = "jawaban 1 = ini adalah jawaban murid\n"

    def _fake_embeddings(texts, *, model="google-embedding-2-preview", batch_size=16):
        return [[1.0, 0.0] for _ in texts]

    import uploaditin_backend.utils.embedding_client as client
    original = client.get_embeddings
    client.get_embeddings = _fake_embeddings
    try:
        out = embedding_score_submission(ref, stu)
    finally:
        client.get_embeddings = original

    assert isinstance(out, dict)
    assert "avg_similarity" in out
    assert "grade" in out
    assert "per_question" in out
