"""Tests for CORS configuration behaviour."""
import os
import pytest


# The app module is imported by conftest.py with no ALLOWED_ORIGINS set, so
# Flask-CORS defaults to ["http://localhost:3000"].
ALLOWED = "http://localhost:3000"
DISALLOWED = "https://evil.example.com"


@pytest.fixture
def _client(request):
    """Return a plain (unauthenticated) test client for CORS header checks."""
    import uploaditin_backend.app as app_module

    app_module.app.config.setdefault("TESTING", True)
    with app_module.app.test_client() as c:
        yield c


def _first_route(_client):
    """Return the path of the first registered non-static route."""
    import uploaditin_backend.app as app_module

    for rule in app_module.app.url_map.iter_rules():
        if rule.endpoint != "static":
            return rule.rule
    raise RuntimeError("No routes found")


# ---------------------------------------------------------------------------
# Allowed origin
# ---------------------------------------------------------------------------

def test_allowed_origin_receives_acao_header(_client):
    path = _first_route(_client)
    resp = _client.get(path, headers={"Origin": ALLOWED})
    assert resp.headers.get("Access-Control-Allow-Origin") == ALLOWED, (
        "An allowed origin must receive Access-Control-Allow-Origin"
    )


def test_disallowed_origin_has_no_acao_header(_client):
    path = _first_route(_client)
    resp = _client.get(path, headers={"Origin": DISALLOWED})
    assert resp.headers.get("Access-Control-Allow-Origin") is None, (
        "A disallowed origin must not receive Access-Control-Allow-Origin"
    )


# ---------------------------------------------------------------------------
# Preflight (OPTIONS)
# ---------------------------------------------------------------------------

def test_preflight_allowed_origin(_client):
    path = _first_route(_client)
    resp = _client.options(
        path,
        headers={
            "Origin": ALLOWED,
            "Access-Control-Request-Method": "GET",
        },
    )
    assert resp.headers.get("Access-Control-Allow-Origin") == ALLOWED, (
        "Preflight from allowed origin should receive Access-Control-Allow-Origin"
    )
    assert resp.headers.get("Access-Control-Allow-Methods") is not None, (
        "Preflight response should include Access-Control-Allow-Methods"
    )


def test_preflight_disallowed_origin(_client):
    path = _first_route(_client)
    resp = _client.options(
        path,
        headers={
            "Origin": DISALLOWED,
            "Access-Control-Request-Method": "GET",
        },
    )
    assert resp.headers.get("Access-Control-Allow-Origin") is None, (
        "Preflight from disallowed origin must not receive Access-Control-Allow-Origin"
    )


# ---------------------------------------------------------------------------
# Parsing edge-cases
# ---------------------------------------------------------------------------

def test_allowed_origins_empty_env_var_raises(monkeypatch):
    """ALLOWED_ORIGINS set to empty/whitespace-only string must raise RuntimeError."""
    monkeypatch.setenv("ALLOWED_ORIGINS", "  ,  ,  ")
    import sys

    # Remove cached module so it re-executes top-level code
    for mod in list(sys.modules.keys()):
        if "uploaditin_backend" in mod:
            del sys.modules[mod]

    with pytest.raises(RuntimeError, match="ALLOWED_ORIGINS is set but does not contain any valid origins"):
        import uploaditin_backend.app  # noqa: F401


def test_allowed_origins_unset_defaults_to_localhost(monkeypatch):
    """When ALLOWED_ORIGINS is not set the default must be http://localhost:3000."""
    monkeypatch.delenv("ALLOWED_ORIGINS", raising=False)
    import sys

    for mod in list(sys.modules.keys()):
        if "uploaditin_backend" in mod:
            del sys.modules[mod]

    import uploaditin_backend.app as fresh_app

    assert fresh_app.allowed_origins == ["http://localhost:3000"]


def test_allowed_origins_multi_value_parsed(monkeypatch):
    """Multiple comma-separated values should all be included and stripped."""
    monkeypatch.setenv("ALLOWED_ORIGINS", "http://localhost:3000 , https://example.com , ")
    import sys

    for mod in list(sys.modules.keys()):
        if "uploaditin_backend" in mod:
            del sys.modules[mod]

    import uploaditin_backend.app as fresh_app

    assert fresh_app.allowed_origins == ["http://localhost:3000", "https://example.com"]
