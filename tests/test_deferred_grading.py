import io
import pytest
import datetime
from sqlalchemy import text
import uploaditin_backend.app as app_module

@pytest.fixture
def teacher_client(client):
    with client.session_transaction() as sess:
        sess['role'] = 'Teacher'
    return client

def test_upload_deferred_grading_before_deadline(client, tmp_file, make_fake_db, patch_upload_and_download, patch_extract_text_and_score, capture_simpan):
    # Future deadline
    future_deadline = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1)
    
    # DB mock results:
    # 1. assignment_info: (kelas_id, jawaban_path, judul, deadline)
    # 2. kelas_row: (nama_kelas,)
    # 3. max_version_row: (max_version,)
    make_fake_db([
        (1, 'https://supabase.test/storage/v1/object/public/uploads/answers/teacher/guru.pdf', 'Soal 1', future_deadline),
        ('Kelas A',),
        (0,)
    ])

    file_obj = io.BytesIO(b"dummy content")
    file_obj.name = 'student_submission.pdf'

    rv = client.post('/api/assignments/upload/123', data={
        'file': (file_obj, 'student_submission.pdf')
    }, content_type='multipart/form-data')

    assert rv.status_code == 200
    body = rv.get_json()
    assert body['success'] is True
    assert "Menunggu penilaian" in body['message']
    
    # Verify saved data in capture_simpan
    assert len(capture_simpan['args']) == 1
    saved = capture_simpan['args'][0][0]
    assert saved['status'] == 'pending'
    assert saved['grade'] == 0
    assert saved['similarity'] == 0
    assert saved['feedback'] == "Menunggu penilaian guru."
    assert saved['highlights'] == []
    assert saved['sub_criteria_scores'] == []

def test_upload_after_deadline_fails(client, tmp_file, make_fake_db, patch_upload_and_download):
    # Past deadline
    past_deadline = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)
    
    make_fake_db([
        (1, 'https://supabase.test/storage/v1/object/public/uploads/answers/teacher/guru.pdf', 'Soal 1', past_deadline),
    ])

    file_obj = io.BytesIO(b"dummy content")
    file_obj.name = 'student_submission.pdf'

    rv = client.post('/api/assignments/upload/123', data={
        'file': (file_obj, 'student_submission.pdf')
    }, content_type='multipart/form-data')

    assert rv.status_code == 400
    body = rv.get_json()
    assert "telah lewat" in body['error'].lower() or "deadline" in body['error'].lower()

def test_grade_individual_submission(teacher_client, make_fake_db, patch_upload_and_download, patch_extract_text_and_score, capture_simpan):
    # Prepare DB:
    # 1. Fetch submission info
    # 2. Fetch assignment info (for teacher key and deadline)
    future_deadline = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1)
    past_deadline = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)
    
    # CASE 1: Before deadline (should fail)
    # submission: (id, assignment_id, nama_murid, file_path, status, essay_text, user_id, kelas_id)
    make_fake_db([
        (1, 123, 'Student A', 'answers/student/file.pdf', 'pending', 'essay text', 42, 1), # submission
        (1, 'answers/teacher/guru.pdf', 'Soal 1', future_deadline), # assignment
    ])
    
    rv = teacher_client.post('/api/submissions/grade/1')
    assert rv.status_code == 400
    assert "deadline" in rv.get_json()['error'].lower()
    
    # CASE 2: After deadline (should succeed)
    make_fake_db([
        (1, 123, 'Student A', 'answers/student/file.pdf', 'pending', 'essay text', 42, 1), # submission
        (1, 'answers/teacher/guru.pdf', 'Soal 1', past_deadline), # assignment
        (0,), # max_version
    ])
    
    rv = teacher_client.post('/api/submissions/grade/1')
    assert rv.status_code == 200
    assert rv.get_json()['success'] is True
    
    # Verify saved data has grade/similarity
    saved = capture_simpan['args'][-1][0]
    assert saved['status'] == 'draft'
    assert saved['grade'] == 82
    assert saved['similarity'] == 0.823

def test_grade_bulk_submissions(teacher_client, make_fake_db, patch_upload_and_download, patch_extract_text_and_score, capture_simpan):
    past_deadline = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)
    
    # DB mock results:
    # 1. Fetch assignment info
    # 2. Fetch pending submissions for assignment
    # 3. For each submission (2 in this test):
    #    a. Fetch max version
    make_fake_db([
        (1, 'answers/teacher/guru.pdf', 'Soal 1', past_deadline), # assignment
        [
            (1, 123, 'Student A', 'answers/student/file1.pdf', 'pending', 'essay 1', 42, 1),
            (2, 123, 'Student B', 'answers/student/file2.pdf', 'pending', 'essay 2', 43, 1)
        ], # pending submissions
        (0,), # max version for student A
        (0,)  # max version for student B
    ])
    
    rv = teacher_client.post('/api/assignments/grade-bulk/123')
    assert rv.status_code == 200
    assert rv.get_json()['success'] is True
    assert rv.get_json()['processed_count'] == 2
    
    # Verify 2 submissions were saved
    assert len(capture_simpan['args']) >= 2
