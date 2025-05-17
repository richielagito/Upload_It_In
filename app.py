from flask import Flask, request, render_template, jsonify
from werkzeug.utils import secure_filename
import os
import datetime
import pandas as pd

from utils.pdf_reader import extract_text_from_pdf
from utils.preprocessing import preprocess
from utils.lsa_manual import perform_lsa_and_similarity
from utils.db import simpan_ke_postgres

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs("data", exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/grade', methods=['POST'])
def grade():
    files = request.files
    guru_file = files.get('guru')
    murid_files = files.getlist('murid')

    if not guru_file or len(murid_files) == 0:
        return jsonify({"error": "Pastikan file guru dan file murid sudah diupload!"}), 400

    # Uploads file guru untuk ekstrak teksnya
    guru_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(guru_file.filename))
    guru_file.save(guru_path)
    guru_text = extract_text_from_pdf(guru_path)

    # Uploads file murid untuk ekstrak teksnya
    murid_texts = []
    murid_names = []
    for f in murid_files:
        path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(f.filename))
        f.save(path)
        murid_texts.append(extract_text_from_pdf(path))
        murid_names.append(f.filename.replace(".pdf", ""))

    # Merge teks guru dan murid untuk dilakukan preprocessing
    all_texts = [guru_text] + murid_texts
    preprocessed = [preprocess(text) for text in all_texts]

    # LSA manual dan hitung cosine similarity
    sim_scores = perform_lsa_and_similarity(preprocessed)  # hasil list % similarity

    # Hasil nilai score similarity
    results = []
    for i, score in enumerate(sim_scores):
        # Mapping threshold kalau dibutuhkan
        nilai = 'A' if score >= 0.85 else 'B' if score >= 0.75 else 'C' if score >= 0.65 else 'D' if score >= 0.5 else 'E'
        results.append({
            "name": murid_names[i],
            "similarity": round(score, 4),
            "grade": nilai
        })

    # Simpan ke file CSV
    df = pd.DataFrame(results)
    csv_filename = f"data/hasil_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    df.to_csv(csv_filename, index=False)

    # Simpan ke DATABASE PostgreSQL
    simpan_ke_postgres(results)

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
