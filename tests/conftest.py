import io
import itertools
import os
import pytest

os.environ.setdefault('DB_USER', 'test_user')
os.environ.setdefault('DB_PASSWORD', 'test_password')
os.environ.setdefault('DB_HOST', 'localhost')
os.environ.setdefault('DB_PORT', '5432')
os.environ.setdefault('DB_NAME', 'test_db')
os.environ.setdefault('FLASK_SECRET_KEY', 'test-secret-key-for-tests')

import uploaditin_backend.app as app_module


class FakeCursor:
    def __init__(self, fetchone_results):
        # list of values to return on successive fetchone() calls
        self._results = list(fetchone_results)
        # initialize for type checkers: may be set by execute()
        self._last_query = None

    def execute(self, *args, **kwargs):
        # no-op for tests
        self._last_query = args[0] if args else None

    def fetchone(self):
        if not self._results:
            return None
        return self._results.pop(0)

    def close(self):
        return


class FakeConn:
    def __init__(self, fetchone_results):
        self._cursor = FakeCursor(fetchone_results)

    def cursor(self):
        return self._cursor

    def close(self):
        return


@pytest.fixture
def client():
    app_module.app.config.setdefault('TESTING', True)
    with app_module.app.test_client() as client:
        # set authenticated session for tests
        with client.session_transaction() as sess:
            sess['user_id'] = 42
            sess['username'] = 'test_user'
            sess['role'] = 'Student'
        yield client


@pytest.fixture
def tmp_file():
    """Return a small in-memory file-like and a filename for upload payloads."""
    return (io.BytesIO(b"dummy file content"), "student_submission.pdf")


@pytest.fixture
def make_fake_db(monkeypatch):
    """Provide helper to inject a fake DB connection that returns supplied fetchone values."""

    def _make(fetchone_results):
        conn = FakeConn(fetchone_results)

        def _get_conn():
            return conn

        monkeypatch.setattr(app_module, 'get_postgres_conn', _get_conn)
        return conn

    return _make


@pytest.fixture(autouse=True)
def patch_tempfile_and_remove(monkeypatch):
    """Avoid real disk IO: patch tempfile.NamedTemporaryFile used in app to return in-memory file-like objects,
    and patch os.remove to a no-op that records calls."""
    import types

    counter = itertools.count()


    class FakeTempFile:
        def __init__(self, delete=False, suffix=None):
            self._buf = io.BytesIO()
            self._id = next(counter)
            self.name = f"/tmp/fake_temp_{self._id}{suffix or ''}"

        def write(self, b):
            return self._buf.write(b)

        def flush(self):
            return None

        def read(self):
            self._buf.seek(0)
            return self._buf.read()

        def close(self):
            return None

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

    def fake_named_tempfile(delete=False, suffix=None):
        return FakeTempFile(delete=delete, suffix=suffix)

    import tempfile
    monkeypatch.setattr(tempfile, 'NamedTemporaryFile', fake_named_tempfile)

    removed = []

    def fake_remove(path):
        removed.append(path)

    import os
    monkeypatch.setattr(os, 'remove', fake_remove)

    yield {'removed': removed}


@pytest.fixture
def capture_simpan(monkeypatch):
    """Capture calls to simpan_ke_postgres and allow forcing an exception via attribute."""
    calls = {'args': []}

    def fake_simpan(results):
        calls['args'].append(results)
        if calls.get('raise'):
            raise Exception('DB save failed')

    monkeypatch.setattr(app_module, 'simpan_ke_postgres', fake_simpan)
    return calls


@pytest.fixture
def patch_upload_and_download(monkeypatch):
    """Patch upload_file and download_file in the app module to deterministic behaviors."""

    def upload_file(file_bytes, dest_path, client=None):
        # return a predictable public URL that includes dest_path
        return f"https://supabase.test/storage/v1/object/public/uploads/{dest_path}"

    def download_file(public_url_or_path, client=None, bucket='uploads'):
        # return deterministic bytes content
        if 'guru' in public_url_or_path:
            return b"guru pdf bytes"
        return b"murid pdf bytes"

    monkeypatch.setattr(app_module, 'upload_file', upload_file)
    monkeypatch.setattr(app_module, 'download_file', download_file)
    # ensure _get_supabase does not attempt to create real client during tests
    monkeypatch.setattr(app_module, '_get_supabase', lambda: object())
    return {'upload': upload_file, 'download': download_file}


@pytest.fixture
def patch_extract_text_and_score(monkeypatch):
    """Patch text extraction and scorer to deterministic results; tests override as needed."""
    calls = {'extract_calls': []}

    def fake_extract(path):
        calls['extract_calls'].append(path)
        # return simple text depending on filename
        if 'guru' in path:
            return 'guru reference text'
        return 'murid student text'

    def fake_score(ref, stu):
        return (0.823, 82)

    monkeypatch.setattr(app_module, 'extract_text_from_any', fake_extract)
    monkeypatch.setattr(app_module, 'lsa_similarity', fake_score)
    return calls
