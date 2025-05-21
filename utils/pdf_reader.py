import fitz  # fitznya PyMuPDF

def extract_text_from_pdf(path):
    try:
        doc = fitz.open(path)
        return " ".join(page.get_text() for page in doc)
    except Exception as e:
        print(f"Error membaca PDF {path}: {e}")
        return ""