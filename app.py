from flask import Flask, request, render_template, jsonify
from werkzeug.utils import secure_filename
import os
import datetime
import pandas as pd

from utils.pdf_reader import extract_text_from_pdf
from utils.preprocessing import preprocess
from utils.tfidf_manual import get_tfidf_matrix
from utils.lsa_manual import compute_lsa_similarity
from utils.db import save_to_csv, simpan_ke_postgres

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['CSV_FOLDER'] = 'data'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['CSV_FOLDER'], exist_ok=True)

def get_grade(sim):
    if sim >= 1:
        return 'A'
    elif sim >= 0.8:
        return 'B'
    elif sim >= 0.7:
        return 'C'
    elif sim >= 0.6:
        return 'D'
    else:
        return 'E'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/grade', methods=['POST'])
def grade():
    files = request.files
    guru_file = files.get('guru')
    murid_files = request.files.getlist('murid')

    guru_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(guru_file.filename))
    guru_file.save(guru_path)
    guru_text = extract_text_from_pdf(guru_path)

    murid_texts = []
    murid_names = []
    for f in murid_files:
        murid_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(f.filename))
        f.save(murid_path)
        murid_texts.append(extract_text_from_pdf(murid_path))
        murid_names.append(f.filename.replace(".pdf", ""))

    all_texts = [guru_text] + murid_texts
    all_preprocessed = [preprocess(text) for text in all_texts]

    X = get_tfidf_matrix(all_preprocessed)
    similarities = compute_lsa_similarity(X)

    results = []
    for i, sim in enumerate(similarities):
        results.append({
            "name": murid_names[i],
            "similarity": round(sim, 4),
            "grade": get_grade(sim)
        })

    save_to_csv(results, app.config['CSV_FOLDER'])

    try:
        simpan_ke_postgres(results)
    except Exception as e:
        print(f"Error uploading results to PostgreSQL: {e}")

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
