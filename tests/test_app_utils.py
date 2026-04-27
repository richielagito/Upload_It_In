import pytest
from uploaditin_backend.app import get_clean_ext

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
