import json
import pytest
from uploaditin_backend.app import app

def test_override_unauthorized(client):
    # Student role set in conftest.py client fixture
    rv = client.post('/api/results/override', json={'id': 1, 'grade': 90})
    assert rv.status_code == 401

def test_override_teacher_happy_path(client, make_fake_db, monkeypatch):
    # Set role to Teacher
    with client.session_transaction() as sess:
        sess['role'] = 'Teacher'
    
    # Mock DB update
    db = make_fake_db([]) # No fetch results needed for UPDATE
    
    override_data = {
        'id': 123,
        'grade': 95,
        'feedback': 'Excellent work!',
        'sub_criteria_scores': [{'question': 1, 'grade': 95}],
        'status': 'published'
    }
    
    rv = client.post('/api/results/override', json=override_data)
    assert rv.status_code == 200
    assert rv.get_json()['success'] is True

def test_override_missing_id(client):
    with client.session_transaction() as sess:
        sess['role'] = 'Teacher'
    
    rv = client.post('/api/results/override', json={'grade': 90})
    assert rv.status_code == 400
    assert 'Missing result ID' in rv.get_json()['error']
