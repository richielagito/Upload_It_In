import os
import time
from typing import List


DEFAULT_MODEL = "gemini-embedding-2-preview"
DEFAULT_BATCH_SIZE = 16
DEFAULT_MAX_ATTEMPTS = int(os.getenv("EMBEDDING_RETRY_ATTEMPTS", "3"))
DEFAULT_BACKOFF_SECONDS = float(os.getenv("EMBEDDING_RETRY_BASE_SECONDS", "0.5"))


def _normalize_vector(values: List[float]) -> List[float]:
    """Deterministically L2-normalize a vector.

    Why this normalization:
      - It keeps cosine similarity stable across magnitude differences.
      - The operation is deterministic for the same input values.
      - Zero vectors are returned unchanged to avoid division-by-zero.

    Note:
      - `gemini-embedding-2-preview` dimensionality may evolve over time.
      - This utility does not hardcode dimension checks; it expects each
        embedding to be a non-empty list of floats from the API.
    """
    norm_sq = sum(v * v for v in values)
    if norm_sq <= 0.0:
        return list(values)
    norm = norm_sq ** 0.5
    return [v / norm for v in values]


def _extract_status_code(exc: Exception):
    for attr in ("status_code", "code", "http_status"):
        value = getattr(exc, attr, None)
        if isinstance(value, int):
            return value
    return None


def _is_transient_error(exc: Exception) -> bool:
    code = _extract_status_code(exc)
    if code == 429:
        return True
    if isinstance(code, int) and 500 <= code < 600:
        return True

    msg = str(exc).lower()
    if "429" in msg:
        return True
    if any(token in msg for token in ("500", "502", "503", "504", "timeout", "temporar")):
        return True
    return False


def _is_auth_or_config_error(exc: Exception) -> bool:
    code = _extract_status_code(exc)
    if code in (400, 401, 403):
        return True

    msg = str(exc).lower()
    return any(
        token in msg
        for token in (
            "api key",
            "invalid key",
            "authentication",
            "unauthorized",
            "permission denied",
            "forbidden",
        )
    )


def _create_genai_client(api_key: str):
    from google import genai

    return genai.Client(api_key=api_key)


def _extract_embedding_values(embedding_obj) -> List[float]:
    values = getattr(embedding_obj, "values", None)
    if values is None:
        raise ValueError("Embedding response missing `values` field.")
    if not isinstance(values, list):
        raise ValueError("Embedding `values` must be a list of floats.")

    parsed = [float(v) for v in values]
    if not parsed:
        raise ValueError("Embedding vector is empty.")
    return parsed


def _embed_batch(client, texts: List[str], model: str, normalize: bool) -> List[List[float]]:
    response = client.models.embed_content(model=model, contents=texts)
    embeddings = getattr(response, "embeddings", None)
    if embeddings is None:
        raise ValueError("Embedding response missing `embeddings` field.")
    if len(embeddings) != len(texts):
        raise ValueError("Embedding response size mismatch with input batch size.")

    vectors: List[List[float]] = []
    for emb in embeddings:
        vec = _extract_embedding_values(emb)
        vectors.append(_normalize_vector(vec) if normalize else vec)
    return vectors


def get_embeddings(
    texts: List[str],
    *,
    model: str = DEFAULT_MODEL,
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> List[List[float]]:
    """Generate embeddings for input texts using google-genai.

    - Fails fast when GEMINI_API_KEY is not present.
    - Preserves input order while processing in batches.
    - Retries only transient 429/5xx failures with exponential backoff.
    - Auth/config failures fail deterministically without retries.

    Normalization toggle:
      Set EMBEDDING_NORMALIZE=true to apply deterministic L2 normalization
      before returning vectors. Default behavior returns raw vectors.
    """
    if not isinstance(texts, list):
        raise TypeError("texts must be a list of strings")
    if any(not isinstance(t, str) for t in texts):
        raise TypeError("all items in texts must be strings")
    if batch_size <= 0:
        raise ValueError("batch_size must be greater than 0")
    if not texts:
        return []

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. Add it to your environment before calling get_embeddings()."
        )

    normalize = os.getenv("EMBEDDING_NORMALIZE", "false").strip().lower() in ("1", "true", "yes", "on")
    max_attempts = max(1, DEFAULT_MAX_ATTEMPTS)
    client = _create_genai_client(api_key)

    ordered_vectors: List[List[float]] = []
    for start in range(0, len(texts), batch_size):
        batch = texts[start:start + batch_size]
        attempt = 0

        while True:
            try:
                ordered_vectors.extend(_embed_batch(client, batch, model=model, normalize=normalize))
                break
            except Exception as exc:
                attempt += 1

                if _is_auth_or_config_error(exc):
                    raise RuntimeError(f"Embedding request failed due to auth/config error: {exc}") from exc

                if _is_transient_error(exc) and attempt < max_attempts:
                    sleep_seconds = DEFAULT_BACKOFF_SECONDS * (2 ** (attempt - 1))
                    time.sleep(sleep_seconds)
                    continue

                raise RuntimeError(
                    f"Embedding request failed after {attempt} attempt(s): {exc}"
                ) from exc

    return ordered_vectors
