#app.py:

from flask import Flask, request, render_template, jsonify, redirect, url_for, session
from werkzeug.utils import secure_filename
import os
import datetime
import pandas as pd
import secrets
from dotenv import load_dotenv
import requests

from utils.pdf_reader import extract_text_from_pdf
from utils.preprocessing import preprocess
from utils.tfidf_manual import compute_tfidf_matrix
from utils.lsa_manual import perform_lsa_and_similarity
from utils.db import save_to_csv, simpan_ke_postgres, fetch_all_results


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
    
    if session.get('role') == 'Student':
        return render_template('dashboard-murid.html')
    elif session.get('role') == 'Teacher':
        return render_template('dashboard-guru.html')
    return render_template('homescreen.html')

@app.route('/grade', methods=['POST'])
def grade():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
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
            "grade": get_grade(sim),
            "user_id": session['user_id']
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
        print("User already logged in, redirecting to dashboard")
        return redirect(url_for('dashboard'))
    return render_template('login-register.html')

@app.route('/api/results', methods=['GET'])
def api_results():
    if 'user_id' not in session:
        return jsonify([]), 401
    results = fetch_all_results(session['user_id'])
    return jsonify(results)

@app.route('/set_session', methods=['POST'])
def set_session():
    data = request.json
    access_token = data.get('access_token')
    if not access_token:
        return jsonify({"error": "No token"}), 400

    # Verifikasi token ke Supabase
    headers = {"apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJleGt5bHF1cG9waXVzb3JnZG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NDAyNTAsImV4cCI6MjA2MzQxNjI1MH0.A0ha39mt_dkSSkBAQHehVXQwpzhb6JoxhymF2mxtczA", "Authorization": f"Bearer {access_token}"}
    resp = requests.get("https://rexkylqupopiusorgdni.supabase.co/auth/v1/user", headers=headers)
    if resp.status_code != 200:
        return jsonify({"error": "Invalid token"}), 401
    user = resp.json()
    session['user_id'] = user['id']
    session['username'] = user['user_metadata'].get('username', user['email'])
    session['role'] = user['user_metadata'].get('role', user['email'])
    return jsonify({"success": True})

@app.route('/logout', methods=['GET', 'POST'])
def logout():
    session.clear()
    return redirect(url_for('login_register'))

if __name__ == '__main__':
    app.run(debug=True)