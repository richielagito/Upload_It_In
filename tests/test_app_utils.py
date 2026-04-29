import pytest
from unittest.mock import MagicMock, patch
from uploaditin_backend.app import get_clean_ext, generate_unique_class_code

def test_get_clean_ext_valid_extensions():
    assert get_clean_ext("http://example.com/file.pdf") == ".pdf"
    assert get_clean_ext("https://example.com/doc.docx") == ".docx"
    assert get_clean_ext("ftp://example.com/notes.txt") == ".txt"

def test_get_clean_ext_with_query_params():
    assert get_clean_ext("http://example.com/file.pdf?user=123&token=abc") == ".pdf"
    assert get_clean_ext("https://example.com/doc.docx?signature=xyz") == ".docx"

def test_get_clean_ext_mixed_case():
    assert get_clean_ext("http://example.com/file.PDF") == ".PDF"
    assert get_clean_ext("http://example.com/file.DocX") == ".DocX"
    assert get_clean_ext("http://example.com/file.Txt") == ".Txt"

def test_get_clean_ext_invalid_extensions():
    assert get_clean_ext("http://example.com/file.jpg") == ".pdf"
    assert get_clean_ext("http://example.com/file.exe") == ".pdf"
    assert get_clean_ext("http://example.com/file.tar.gz") == ".pdf"

def test_get_clean_ext_no_extension():
    assert get_clean_ext("http://example.com/file") == ".pdf"
    assert get_clean_ext("http://example.com/path/to/folder/") == ".pdf"

def test_get_clean_ext_empty_url():
    assert get_clean_ext("") == ".pdf"

def test_get_clean_ext_path_only():
    assert get_clean_ext("/local/path/to/file.pdf") == ".pdf"
    assert get_clean_ext("file.docx") == ".docx"
    assert get_clean_ext("../relative/file.txt") == ".txt"
    assert get_clean_ext("/path/with/no/ext") == ".pdf"

def test_get_clean_ext_fragment():
    assert get_clean_ext("http://example.com/file.pdf#page=5") == ".pdf"


@patch('uploaditin_backend.app.get_db')
def test_generate_unique_class_code_first_try(mock_get_db):
    mock_conn = MagicMock()
    mock_get_db.return_value = mock_conn
    mock_execute = MagicMock()
    mock_conn.execute.return_value = mock_execute

    # Simulate fetchone() returning None, meaning the code is unique
    mock_execute.fetchone.return_value = None

    code = generate_unique_class_code(6)

    assert len(code) == 6
    assert mock_conn.execute.call_count == 1
    # Check that code consists of uppercase letters and digits
    assert all(c.isupper() or c.isdigit() for c in code)

@patch('uploaditin_backend.app.get_db')
def test_generate_unique_class_code_collision(mock_get_db):
    mock_conn = MagicMock()
    mock_get_db.return_value = mock_conn
    mock_execute = MagicMock()
    mock_conn.execute.return_value = mock_execute

    # Simulate first fetchone() returning a row (collision),
    # second fetchone() returning None (unique)
    mock_execute.fetchone.side_effect = [(1,), None]

    code = generate_unique_class_code(6)

    assert len(code) == 6
    assert mock_conn.execute.call_count == 2
    assert all(c.isupper() or c.isdigit() for c in code)

@patch('uploaditin_backend.app.get_db')
def test_generate_unique_class_code_custom_length(mock_get_db):
    mock_conn = MagicMock()
    mock_get_db.return_value = mock_conn
    mock_execute = MagicMock()
    mock_conn.execute.return_value = mock_execute

    mock_execute.fetchone.return_value = None

    code = generate_unique_class_code(10)

    assert len(code) == 10
    assert mock_conn.execute.call_count == 1
