#app.py:

from flask import Flask, request, render_template, jsonify, redirect, url_for, session
from werkzeug.utils import secure_filename
from utils.db import register_user, login_user
import os
import datetime
import pandas as pd
import secrets
from dotenv import load_dotenv

from utils.pdf_reader import extract_text_from_pdf
from utils.preprocessing import preprocess
from utils.tfidf_manual import compute_tfidf_matrix
from utils.lsa_manual import perform_lsa_and_similarity
from utils.db import save_to_csv, simpan_ke_postgres, fetch_all_results
from psycopg2.extras import RealDictCursor
from utils.db import get_pg_conn


load_dotenv()

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['CSV_FOLDER'] = 'data'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['CSV_FOLDER'], exist_ok=True)

def get_grade(sim):
    if sim >= 0.9:
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
def homescreen():
    return render_template('homescreen.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login_register'))
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

    similarities = perform_lsa_and_similarity(all_preprocessed)

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

@app.route('/login-register')
def login_register():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('login-register.html')

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    if not email or not username or not password:
        return jsonify({'success': False, 'message': 'Lengkapi semua field!'}), 400
    success, msg = register_user(email, username, password)
    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': msg}), 400

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    success, user_or_msg = login_user(email, password)
    if success:
        session['user_id'] = user_or_msg['id']
        session['username'] = user_or_msg['username']
        return jsonify({
            'success': True,
            'redirect_url': url_for('dashboard')
        })
    else:
        return jsonify({'success': False, 'message': user_or_msg}), 401

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('homescreen'))

@app.route('/api/results', methods=['GET'])
def api_results():
    results = fetch_all_results()
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)