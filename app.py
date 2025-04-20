from flask import Flask, request, render_template, jsonify
import os
import fitz  # PyMuPDF
import re
import pandas as pd
import datetime

from werkzeug.utils import secure_filename
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Sastrawi tools
stemmer = StemmerFactory().create_stemmer()
stopwords = set(StopWordRemoverFactory().get_stop_words())

def extract_text_from_pdf(path):
    doc = fitz.open(path)
    return " ".join(page.get_text() for page in doc)

def preprocess(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    words = text.split()
    words = [word for word in words if word not in stopwords]
    return " ".join([stemmer.stem(word) for word in words])

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

    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(all_preprocessed)
    n_components = min(2, X.shape[1] - 1)
    svd = TruncatedSVD(n_components=n_components, random_state=42)
    X_lsa = svd.fit_transform(X)

    results = []
    for i, vec in enumerate(X_lsa[1:]):
        sim = cosine_similarity([X_lsa[0]], [vec])[0][0]
        results.append({
            "name": murid_names[i],
            "similarity": round(sim, 4),
            "grade": get_grade(sim)
        })

    # === Simpan ke CSV ===
    df = pd.DataFrame(results)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_filename = f"hasil_penilaian_{timestamp}.csv"
    df.to_csv(csv_filename, index=False)

    return jsonify(results)

    

if __name__ == '__main__':
    app.run(debug=True)
