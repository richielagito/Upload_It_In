import fitz  # PyMuPDF untuk PDF
from docx import Document  # python-docx untuk DOCX
import os
import re

def extract_text_from_pdf(path):
    try:
        doc = fitz.open(path)
        return " ".join(page.get_text() for page in doc)
    except Exception as e:
        print(f"Error membaca PDF {path}: {e}")
        return ""

def extract_text_from_docx(path):
    try:
        doc = Document(path)
        return " ".join([para.text for para in doc.paragraphs])
    except Exception as e:
        print(f"Error membaca DOCX {path}: {e}")
        return ""

def extract_text_from_txt(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"Error membaca TXT {path}: {e}")
        return ""

def extract_text_from_any(path):
    ext = os.path.splitext(path)[-1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(path)
    elif ext == ".docx":
        return extract_text_from_docx(path)
    elif ext == ".txt":
        return extract_text_from_txt(path)
    else:
        print(f"Format tidak didukung: {ext}")
        return ""
    
def extract_answers(text):
    pattern = r"jawaban\s*(\d+)\s*=\s*((?:.|\n)?)(?=jawaban\s\d+\s*=|\Z)"
    matches = re.findall(pattern, text, flags=re.IGNORECASE)
    return {num.strip(): ans.strip() for num,ans in matches}
