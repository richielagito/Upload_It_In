import math
import time

import pytest

from uploaditin_backend.utils import embedding_client


class _FakeEmbedding:
    def __init__(self, values):
        self.values = values


class _FakeResponse:
    def __init__(self, embeddings):
        self.embeddings = embeddings


class _StatusError(Exception):
    def __init__(self, message: str, status_code: int):
        super().__init__(message)
        self.status_code = status_code


def _l2_norm(vec):
    return math.sqrt(sum(v * v for v in vec))


def test_normalization_applies_unit_length_and_preserves_order(monkeypatch):
    # Env and client setup
    monkeypatch.setenv("GEMINI_API_KEY", "dummy-key")
    monkeypatch.setenv("EMBEDDING_NORMALIZE", "true")
    embedding_client._client_cache.clear()

    # Create a fake models.embed_content that returns non-normalized vectors
    class FakeModels:
        @staticmethod
        def embed_content(model, contents):
            embs = []
            for text in contents:
                # produce vector with magnitude depending on text length
                base = float(len(text) + 1)
                embs.append(_FakeEmbedding([base * 3.0, base * 4.0]))
            return _FakeResponse(embs)

    class FakeClient:
        models = FakeModels()

    monkeypatch.setattr(embedding_client, "_create_genai_client", lambda api_key: FakeClient())

    texts = ["a", "abcd", "xyz"]
    vectors = embedding_client.get_embeddings(texts, batch_size=2)

    # All returned vectors should be unit length (within tolerance) and order preserved
    assert len(vectors) == 3
    for i, vec in enumerate(vectors):
        norm = _l2_norm(vec)
        assert abs(norm - 1.0) <= 1e-6


def test_batch_splitting_preserves_order_across_batches(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "dummy-key")
    monkeypatch.setenv("EMBEDDING_NORMALIZE", "false")
    embedding_client._client_cache.clear()

    calls = {"batches": []}

    class FakeModels:
        @staticmethod
        def embed_content(model, contents):
            # record the batch contents and return a simple vector based on index
            calls["batches"].append(list(contents))
            embs = []
            for text in contents:
                # vector encodes the text so we can assert ordering
                embs.append(_FakeEmbedding([float(len(text)), float(len(text) + 1)]))
            return _FakeResponse(embs)

    class FakeClient:
        models = FakeModels()

    monkeypatch.setattr(embedding_client, "_create_genai_client", lambda api_key: FakeClient())

    texts = ["t0", "t11", "t222", "t3333", "t44444"]
    vectors = embedding_client.get_embeddings(texts, batch_size=2)

    # Expect 3 batches: 2,2,1
    assert len(calls["batches"]) == 3
    assert calls["batches"][0] == texts[0:2]
    assert calls["batches"][1] == texts[2:4]
    assert calls["batches"][2] == texts[4:5]

    # Ensure ordering preserved in returned vectors
    assert [v[0] for v in vectors] == [float(len(t)) for t in texts]


def test_retry_backoff_bounded_then_succeeds(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "dummy-key")
    # Make max attempts 4 and small backoff for test speed
    monkeypatch.setattr(embedding_client, "DEFAULT_MAX_ATTEMPTS", 4)
    monkeypatch.setattr(embedding_client, "DEFAULT_BACKOFF_SECONDS", 0.001)
    embedding_client._client_cache.clear()

    calls = {"count": 0}
    sleeps = []

    class FakeModels:
        @staticmethod
        def embed_content(model, contents):
            calls["count"] += 1
            # first two calls fail with transient 502, then succeed
            if calls["count"] in (1, 2):
                raise _StatusError("server error", status_code=502)
            return _FakeResponse([_FakeEmbedding([1.0, 0.0]) for _ in contents])

    class FakeClient:
        models = FakeModels()

    monkeypatch.setattr(embedding_client, "_create_genai_client", lambda api_key: FakeClient())
    monkeypatch.setattr(embedding_client.time, "sleep", lambda s: sleeps.append(s))

    vectors = embedding_client.get_embeddings(["a", "b"], batch_size=2)

    # Should have attempted 3 times (2 failures then success)
    assert calls["count"] == 3
    # sleep should be called for each retry (attempts - 1)
    assert len(sleeps) == 2
    # confirm attempts did not exceed DEFAULT_MAX_ATTEMPTS
    assert calls["count"] <= embedding_client.DEFAULT_MAX_ATTEMPTS
    assert vectors == [[1.0, 0.0], [1.0, 0.0]]


def test_auth_config_errors_fail_fast_no_retries(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "dummy-key")
    monkeypatch.setenv("EMBEDDING_NORMALIZE", "false")
    # Ensure small attempts config to detect incorrect retrying
    monkeypatch.setattr(embedding_client, "DEFAULT_MAX_ATTEMPTS", 5)
    embedding_client._client_cache.clear()

    calls = {"count": 0}
    sleeps = []

    class FakeModels:
        @staticmethod
        def embed_content(model, contents):
            calls["count"] += 1
            # auth error on first call
            raise _StatusError("unauthorized", status_code=401)

    class FakeClient:
        models = FakeModels()

    monkeypatch.setattr(embedding_client, "_create_genai_client", lambda api_key: FakeClient())
    monkeypatch.setattr(embedding_client.time, "sleep", lambda s: sleeps.append(s))

    with pytest.raises(RuntimeError):
        embedding_client.get_embeddings(["x"])

    # Should have only called once and not slept
    assert calls["count"] == 1
    assert sleeps == []
