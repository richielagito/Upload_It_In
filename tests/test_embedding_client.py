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


def test_get_embeddings_success_preserves_order(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "dummy-key")
    monkeypatch.setenv("EMBEDDING_NORMALIZE", "false")
    embedding_client._client_cache.clear()

    class FakeModels:
        @staticmethod
        def embed_content(model, contents):
            # Deterministic vector per input, preserving content order.
            embs = []
            for text in contents:
                base = float(len(text))
                embs.append(_FakeEmbedding([base, base + 1.0, base + 2.0]))
            return _FakeResponse(embs)

    class FakeClient:
        models = FakeModels()

    monkeypatch.setattr(embedding_client, "_create_genai_client", lambda api_key: FakeClient())

    texts = ["a", "abcd", "xy"]
    vectors = embedding_client.get_embeddings(texts, batch_size=2)

    assert len(vectors) == 3
    assert vectors[0] == [1.0, 2.0, 3.0]
    assert vectors[1] == [4.0, 5.0, 6.0]
    assert vectors[2] == [2.0, 3.0, 4.0]


def test_get_embeddings_retries_transient_429_then_succeeds(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "dummy-key")
    monkeypatch.setattr(embedding_client, "DEFAULT_MAX_ATTEMPTS", 3)
    monkeypatch.setattr(embedding_client, "DEFAULT_BACKOFF_SECONDS", 0.01)
    embedding_client._client_cache.clear()

    calls = {"count": 0}
    sleeps = []

    class FakeModels:
        @staticmethod
        def embed_content(model, contents):
            calls["count"] += 1
            if calls["count"] == 1:
                raise _StatusError("rate limited", status_code=429)
            return _FakeResponse([_FakeEmbedding([0.1, 0.2]) for _ in contents])

    class FakeClient:
        models = FakeModels()

    monkeypatch.setattr(embedding_client, "_create_genai_client", lambda api_key: FakeClient())
    monkeypatch.setattr(embedding_client.time, "sleep", lambda s: sleeps.append(s))

    vectors = embedding_client.get_embeddings(["one", "two"], batch_size=16)

    assert calls["count"] == 2
    assert len(sleeps) == 1
    assert sleeps[0] > 0
    assert vectors == [[0.1, 0.2], [0.1, 0.2]]


def test_get_embeddings_missing_key_fails_fast(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)

    with pytest.raises(RuntimeError) as exc:
        embedding_client.get_embeddings(["hello"])

    assert "GEMINI_API_KEY" in str(exc.value)


def test_is_auth_or_config_error_status_codes():
    # True cases
    for code in (400, 401, 403):
        exc = _StatusError("some random message", status_code=code)
        assert embedding_client._is_auth_or_config_error(exc) is True

    # False cases
    for code in (500, 404, 200, 429):
        exc = _StatusError("some random message", status_code=code)
        assert embedding_client._is_auth_or_config_error(exc) is False


def test_is_auth_or_config_error_messages():
    # True cases
    tokens = [
        "api key",
        "invalid key",
        "authentication",
        "unauthorized",
        "permission denied",
        "forbidden",
    ]
    for token in tokens:
        # Test exact match
        exc = Exception(token)
        assert embedding_client._is_auth_or_config_error(exc) is True

        # Test case insensitivity and substrings
        exc = Exception(f"Some Error: {token.upper()} provided")
        assert embedding_client._is_auth_or_config_error(exc) is True

    # False cases
    exc = Exception("generic server error 500")
    assert embedding_client._is_auth_or_config_error(exc) is False

    exc = Exception("Connection timeout")
    assert embedding_client._is_auth_or_config_error(exc) is False


def test_normalize_vector_standard():
    vector = [3.0, 4.0]
    normalized = embedding_client._normalize_vector(vector)
    assert normalized == pytest.approx([0.6, 0.8])


def test_normalize_vector_zero():
    vector = [0.0, 0.0, 0.0]
    normalized = embedding_client._normalize_vector(vector)
    assert normalized == [0.0, 0.0, 0.0]
    # Ensure the zero-vector path returns a distinct list object.
    assert normalized is not vector


def test_normalize_vector_negative():
    vector = [-3.0, 4.0]
    normalized = embedding_client._normalize_vector(vector)
    assert normalized == pytest.approx([-0.6, 0.8])


def test_normalize_vector_single_element():
    assert embedding_client._normalize_vector([5.0]) == pytest.approx([1.0])
    assert embedding_client._normalize_vector([-5.0]) == pytest.approx([-1.0])
