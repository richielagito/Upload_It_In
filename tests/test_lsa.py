import os
from uploaditin_backend.utils.LSA import extract_text_from_txt

def test_extract_text_from_txt_non_existent():
    # Pass a non-existent file path
    result = extract_text_from_txt("non_existent_file_12345.txt")
    # Assert that an empty string is returned
    assert result == ""

def test_extract_text_from_txt_success(tmp_path):
    # Create a temporary txt file
    test_file = tmp_path / "test_file.txt"
    test_content = "This is a test content."
    test_file.write_text(test_content, encoding="utf-8")

    # Call the function
    result = extract_text_from_txt(str(test_file))

    # Assert that the content matches
    assert result == test_content
