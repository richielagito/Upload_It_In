import os
import subprocess
import sys
import tempfile
from pathlib import Path

import pytest


SCRIPTS_DIR = Path(__file__).resolve().parents[1] / 'scripts'


def run_script(script: Path, env=None):
    env_vars = os.environ.copy()
    if env:
        env_vars.update(env)
    proc = subprocess.run([sys.executable, str(script)], env=env_vars, capture_output=True, text=True)
    return proc.returncode, proc.stdout, proc.stderr


def test_check_env_contract_success(monkeypatch):
    # Set required vars
    monkeypatch.setenv('SUPABASE_URL', 'https://example.supabase.co')
    monkeypatch.setenv('SUPABASE_PUBLISHABLE_KEY', 'pubkey')
    monkeypatch.setenv('SUPABASE_SECRET_KEY', 'secret')
    monkeypatch.delenv('SCORING_ENGINE', raising=False)
    code, out, err = run_script(SCRIPTS_DIR / 'check_env_contract.py')
    assert code == 0
    assert 'All required environment variables present' in out


def test_check_env_contract_missing(monkeypatch):
    monkeypatch.delenv('SUPABASE_URL', raising=False)
    monkeypatch.delenv('SUPABASE_PUBLISHABLE_KEY', raising=False)
    monkeypatch.delenv('SUPABASE_SECRET_KEY', raising=False)
    monkeypatch.delenv('GEMINI_API_KEY', raising=False)
    # SCORING_ENGINE=embeddings requires GEMINI_API_KEY
    monkeypatch.setenv('SCORING_ENGINE', 'embeddings')
    code, out, err = run_script(SCRIPTS_DIR / 'check_env_contract.py')
    assert code != 0
    assert 'GEMINI_API_KEY' in err


def test_check_secrets_detects_fake_key(tmp_path):
    # Create a temp file with a fake JWT-like token
    repo_root = Path(__file__).resolve().parents[1]
    temp_file = tmp_path / 'leaky.py'
    # Construct token from smaller parts so the repository source does not contain a single
    # contiguous jwt-like literal that the secret scanner would flag.
    token_parts = ['ey', 'JhbGci', 'OiJIUzI1NiIsInR5cCI6IkpXVCJ9', '.fakepayload']
    temp_file.write_text('TOKEN = "' + ''.join(token_parts) + '"\n')
    # Run the script pointing to the tmp dir
    code, out, err = run_script(SCRIPTS_DIR / 'check_secrets.py', env={'PYTHONIOENCODING': 'utf-8'})
    # Running against repo; since our temp file is outside, script should pass; we instead run scan directly
    # Use the module functions by invoking script with path param
    proc = subprocess.run([sys.executable, str(SCRIPTS_DIR / 'check_secrets.py'), str(tmp_path)], capture_output=True, text=True)
    assert proc.returncode != 0
    assert 'jwt_like' in proc.stdout or 'Found' in proc.stderr


def test_check_secrets_no_finds(tmp_path):
    # Empty clean file should pass
    temp_file = tmp_path / 'clean.py'
    temp_file.write_text('# safe file\n')
    proc = subprocess.run([sys.executable, str(SCRIPTS_DIR / 'check_secrets.py'), str(tmp_path)], capture_output=True, text=True)
    assert proc.returncode == 0
    assert 'No secret-like literals found' in proc.stdout
