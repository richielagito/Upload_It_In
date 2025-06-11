#app.py:

from flask import Flask, request, render_template, jsonify, redirect, url_for, session
from werkzeug.utils import secure_filename
import os
import datetime
import pandas as pd
import secrets
from dotenv import load_dotenv
import requests
import random
import string
import datetime

from utils.db import get_postgres_conn
from utils.file_reader import extract_text_from_any
from utils.preprocessing import preprocess
from utils.tfidf_manual import compute_tfidf_matrix
from utils.lsa_manual import perform_lsa_and_similarity
from utils.db import save_to_csv, simpan_ke_postgres, fetch_all_results, fetch_results_by_kelas, fetch_results_by_kode_kelas


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
    
def generate_unique_class_code(length=6):
    conn = get_postgres_conn()
    cur = conn.cursor()
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
        cur.execute("SELECT 1 FROM classes WHERE kode_kelas = %s", (code,))
        if not cur.fetchone():
            break
    cur.close()
    conn.close()
    return code

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

@app.route('/create-class', methods=['POST'])
def create_class():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    nama_kelas = request.form.get('class_name')
    user_id = session['user_id']
    kode_kelas = generate_unique_class_code()
    created_at = datetime.datetime.now()
    conn = get_postgres_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO classes (nama_kelas, kode_kelas, user_id, created_at) VALUES (%s, %s, %s, %s) RETURNING id",
        (nama_kelas, kode_kelas, user_id, created_at)
    )
    kelas_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"class_code": kode_kelas, "kelas_id": kelas_id})

from flask import jsonify

@app.route('/api/classes', methods=['GET'])
def api_classes():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    user_id = session['user_id']
    conn = get_postgres_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, nama_kelas, kode_kelas, created_at FROM classes WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    kelas = [
        {
            "id": row[0],
            "nama_kelas": row[1],
            "kode_kelas": row[2],
            "created_at": row[3].strftime("%Y-%m-%d %H:%M")
        }
        for row in rows
    ]
    return jsonify(kelas)

@app.route('/grade', methods=['POST'])
def grade():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    files = request.files
    guru_file = files.get('guru')
    murid_files = request.files.getlist('murid')

    # Ambil kelas_id dari form
    kelas_id = request.form.get('kelas_id')
    if not kelas_id:
        return jsonify({"error": "Kelas harus dipilih"}), 400

    guru_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(guru_file.filename))
    guru_file.save(guru_path)
    guru_text = extract_text_from_any(guru_path)

    murid_texts = []
    murid_names = []
    for f in murid_files:
        original_name = secure_filename(f.filename)
        name, ext = os.path.splitext(original_name)
        short_name = (name[:50] + ext) if len(name) > 50 else original_name
        murid_path = os.path.join(app.config['UPLOAD_FOLDER'], short_name)
        f.save(murid_path)
        murid_texts.append(extract_text_from_any(murid_path))
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
            "user_id": session['user_id'],
            "kelas_id": int(kelas_id)
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

@app.route('/api/results/kelas/<int:kelas_id>', methods=['GET'])
def api_results_by_kelas(kelas_id):
    if 'user_id' not in session:
        return jsonify([]), 401
    results = fetch_results_by_kelas(kelas_id)
    return jsonify(results)

@app.route('/api/results/kelas-kode/<kode_kelas>', methods=['GET'])
def api_results_by_kode_kelas(kode_kelas):
    if 'user_id' not in session:
        return jsonify([]), 401
    results = fetch_results_by_kode_kelas(kode_kelas, session['user_id'])
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

@app.route('/kelas/<kode_kelas>')
def kelas_details_page(kode_kelas):
    if 'user_id' not in session or session.get('role') != 'Teacher':
        return redirect(url_for('login_register'))
    # Cek apakah kelas dengan kode_kelas ini milik user
    conn = get_postgres_conn()
    cur = conn.cursor()
    cur.execute("SELECT id FROM classes WHERE kode_kelas = %s AND user_id = %s", (kode_kelas, session['user_id']))
    kelas = cur.fetchone()
    cur.close()
    conn.close()
    if not kelas:
        return "Class not found or not owned by you", 404
    return render_template('kelas-details.html')

@app.route('/api/class/update', methods=['POST'])
def api_update_class():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json()
    kode_kelas = data.get('kode_kelas')
    nama_kelas = data.get('nama_kelas')
    if not kode_kelas or not nama_kelas:
        return jsonify({'error': 'Invalid data'}), 400
    conn = get_postgres_conn()
    cur = conn.cursor()
    cur.execute("UPDATE classes SET nama_kelas = %s WHERE kode_kelas = %s AND user_id = %s", (nama_kelas, kode_kelas, session['user_id']))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/class/delete', methods=['POST'])
def api_delete_class():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json()
    kode_kelas = data.get('kode_kelas')
    if not kode_kelas:
        return jsonify({'error': 'Invalid data'}), 400
    conn = get_postgres_conn()
    cur = conn.cursor()
    # Dapatkan id kelas
    cur.execute("SELECT id FROM classes WHERE kode_kelas = %s AND user_id = %s", (kode_kelas, session['user_id']))
    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        return jsonify({'error': 'Class not found'}), 404
    kelas_id = row[0]
    # Hapus semua upload di kelas ini
    cur.execute("DELETE FROM hasil_penilaian WHERE kelas_id = %s", (kelas_id,))
    # Hapus kelas
    cur.execute("DELETE FROM classes WHERE id = %s", (kelas_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/upload/delete', methods=['POST'])
def api_delete_upload():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json()
    upload_id = data.get('id')
    if not upload_id:
        return jsonify({'error': 'Invalid data'}), 400
    conn = get_postgres_conn()
    cur = conn.cursor()
    # Pastikan upload milik user
    cur.execute("SELECT id FROM hasil_penilaian WHERE id = %s AND user_id = %s", (upload_id, session['user_id']))
    if not cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({'error': 'Not found'}), 404
    cur.execute("DELETE FROM hasil_penilaian WHERE id = %s", (upload_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/join-class', methods=['POST'])
def join_class():
    if 'user_id' not in session or session.get('role') != 'Student':
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json()
    kode_kelas = data.get('kode_kelas')
    if not kode_kelas:
        return jsonify({'error': 'Kode kelas harus diisi'}), 400

    conn = get_postgres_conn()
    cur = conn.cursor()
    # Cari kelas berdasarkan kode_kelas
    cur.execute("SELECT id, nama_kelas FROM classes WHERE kode_kelas = %s", (kode_kelas,))
    kelas = cur.fetchone()
    if not kelas:
        cur.close()
        conn.close()
        return jsonify({'error': 'Kode kelas tidak ditemukan'}), 404
    kelas_id, nama_kelas = kelas

    # Cek apakah murid sudah join kelas ini
    cur.execute("SELECT 1 FROM murid_kelas WHERE user_id = %s AND kelas_id = %s", (session['user_id'], kelas_id))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({'error': 'Kamu sudah join kelas ini'}), 400

    # Simpan relasi murid-kelas
    cur.execute("INSERT INTO murid_kelas (user_id, kelas_id) VALUES (%s, %s)", (session['user_id'], kelas_id))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'success': True, 'nama_kelas': nama_kelas, 'kode_kelas': kode_kelas})

@app.route('/api/joined-classes', methods=['GET'])
def api_joined_classes():
    if 'user_id' not in session or session.get('role') != 'Student':
        return jsonify({'error': 'Unauthorized'}), 401
    conn = get_postgres_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT c.nama_kelas, c.kode_kelas
        FROM murid_kelas mk
        JOIN classes c ON mk.kelas_id = c.id
        WHERE mk.user_id = %s
        ORDER BY mk.joined_at DESC
    """, (session['user_id'],))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    kelas = [{"nama_kelas": row[0], "kode_kelas": row[1]} for row in rows]
    return jsonify(kelas)

if __name__ == '__main__':
    app.run(debug=True)