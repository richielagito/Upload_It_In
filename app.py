#app.py:

from flask import Flask, request, render_template, jsonify, redirect, url_for, session
from werkzeug.utils import secure_filename
import os
import datetime
import secrets
from dotenv import load_dotenv
import requests
import random
import string
import datetime
import json
import re
from supabase import create_client, Client
from urllib.parse import urlparse
import csv
from io import StringIO, BytesIO
from flask import send_file, jsonify, session

from utils.db import get_postgres_conn
from utils.LSA import (
    extract_text_from_any,
    lsa_similarity,
)
from utils.db import simpan_ke_postgres, fetch_all_results, fetch_results_by_kelas, fetch_results_by_kode_kelas, fetch_results_by_assignment_id

load_dotenv()

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['CSV_FOLDER'] = 'data'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['CSV_FOLDER'], exist_ok=True)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
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

def clean_part(s):
    return re.sub(r'[\\/*?:"<>| ]', "", s)

@app.route('/')
def homescreen():
    conn = get_postgres_conn()
    cur = conn.cursor()
    cur.execute("SELECT section_name, content FROM landing_page_content")
    data = {row[0]: row[1] for row in cur.fetchall()}
    cur.close()
    conn.close()

    # Parse testimonials JSON string to list
    testimonials_parsed = []
    try:
        testimonials_raw = data.get('testimonials', '[]')
        print("Raw testimonials from DB:", testimonials_raw)  # Debug log
        
        # Handle both string and dict cases
        if isinstance(testimonials_raw, str):
            # If it's a JSON string, parse it directly
            testimonials_parsed = json.loads(testimonials_raw)
        elif isinstance(testimonials_raw, dict):
            # If it's already a dict, check if it has testimonials key
            if "testimonials" in testimonials_raw:
                testimonials_parsed = testimonials_raw["testimonials"]
            else:
                testimonials_parsed = testimonials_raw
        elif isinstance(testimonials_raw, list):
            # If it's already a list, use it directly
            testimonials_parsed = testimonials_raw
        else:
            testimonials_parsed = []
            
        print("Parsed testimonials:", testimonials_parsed)  # Debug log
    except Exception as e:
        print("Error parsing testimonials JSON:", e)
        testimonials_parsed = []

    data['testimonials_parsed'] = testimonials_parsed

    return render_template('homescreen.html', content=data)

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login_register'))

    role = session.get('role')

    if role == 'Student':
        return render_template('dashboard-murid.html')
    elif role == 'Teacher':
        return render_template('dashboard-guru.html')
    elif role == 'Admin':
        return redirect(url_for('admin_dashboard'))  

    return render_template('homescreen.html')  

@app.route('/admin')
def admin_dashboard():
    if 'user_id' not in session or session.get('role') != 'Admin':
        return redirect(url_for('login_register'))
    return render_template('admin-dashboard.html') 

@app.route('/api/admin/summary')
def admin_summary():
    if 'user_id' not in session or session.get('role') != 'Admin':
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_postgres_conn()
    cur = conn.cursor()

    try:
        cur.execute("SELECT COUNT(*) FROM auth.users")
        total_users = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM classes")
        total_classes = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM hasil_penilaian")
        total_uploads = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM admins WHERE is_active = TRUE")
        active_admins = cur.fetchone()[0]

    except Exception as e:
        print("Error fetching admin stats:", e)
        return jsonify({"error": "Failed to fetch summary"}), 500
    finally:
        cur.close()
        conn.close()

    return jsonify({
        "total_users": total_users,
        "total_classes": total_classes,
        "total_uploads": total_uploads,
        "active_admins": active_admins
    })

@app.route('/api/admin/users')
def admin_get_users():
    if 'user_id' not in session or session.get('role') != 'Admin':
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_postgres_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            u.id,
            u.email,
            u.created_at,
            CASE WHEN a.id IS NOT NULL AND a.is_active THEN true ELSE false END as is_admin
        FROM auth.users u
        LEFT JOIN admins a ON u.id = a.user_id
        ORDER BY u.created_at DESC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    result = [
        {
            "id": r[0],  
            "email": r[1],
            "created_at": r[2].strftime("%Y-%m-%d %H:%M"),
            "is_admin": r[3]
        }
        for r in rows
    ]
    return jsonify(result)

@app.route('/api/admin/landing', methods=['GET', 'POST'])
def api_admin_landing():
    if 'user_id' not in session or session.get('role') != 'Admin':
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_postgres_conn()
    cur = conn.cursor()

    if request.method == 'GET':
        cur.execute("SELECT section_name, content FROM landing_page_content")
        rows = cur.fetchall()
        result = {}
        
        for section_name, content in rows:
            try:
                # Try to parse as JSON first
                if isinstance(content, str):
                    parsed_content = json.loads(content)
                    result[section_name] = parsed_content
                else:
                    result[section_name] = content
            except json.JSONDecodeError:
                # If JSON parsing fails, store as string
                result[section_name] = content
        
        # Ensure we have default empty structures if sections don't exist
        if 'hero' not in result:
            result['hero'] = {"title": "", "subtitle": "", "description": ""}
        if 'statistics' not in result:
            result['statistics'] = {"essays_graded": "1000+", "active_users": "500+", "satisfaction": "98%"}
        if 'testimonials' not in result:
            result['testimonials'] = []
        if 'contact' not in result:
            result['contact'] = {"email": "", "phone": "", "address": ""}
        
        cur.close()
        conn.close()
        return jsonify(result)

    elif request.method == 'POST':
        data = request.get_json()
        print("Received data for saving:", data)  # Debug log

        try:
            for section in ['hero', 'statistics', 'testimonials', 'contact']:
                if section in data:
                    # Convert data to JSON string for storage
                    content_to_store = json.dumps(data[section])
                    
                    print(f"Storing {section}: {content_to_store}")  # Debug log
                    
                    # First try to update
                    cur.execute("""
                        UPDATE landing_page_content
                        SET content = %s, updated_at = NOW(), updated_by = %s
                        WHERE section_name = %s
                    """, (content_to_store, session['user_id'], section))
                    
                    # Check if the update affected any rows
                    if cur.rowcount == 0:
                        # If no rows were updated, insert a new row
                        cur.execute("""
                            INSERT INTO landing_page_content (section_name, content, updated_by, created_at, updated_at)
                            VALUES (%s, %s, %s, NOW(), NOW())
                        """, (section, content_to_store, session['user_id']))
            
            conn.commit()
            print("Changes committed successfully")  # Debug log
            
        except Exception as e:
            print(f"Error saving landing page data: {e}")  # Debug log
            conn.rollback()
            cur.close()
            conn.close()
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
            conn.close()
        
        return jsonify({"success": True})
    
@app.route('/admin/users')
def admin_users():
    if 'user_id' not in session or session.get('role') != 'Admin':
        return redirect(url_for('login_register'))
    return render_template('admin-users.html')

@app.route('/admin/landing-page')
def admin_landing():
    if 'user_id' not in session or session.get('role') != 'Admin':
        return redirect(url_for('login_register'))
    return render_template('admin-landing.html')

@app.route('/api/admin/promote', methods=['POST'])
def promote_user():
    if 'user_id' not in session or session.get('role') != 'Admin':
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    target_user_id = data.get('user_id')
    if not target_user_id:
        return jsonify({"error": "No user_id provided"}), 400

    conn = get_postgres_conn()
    cur = conn.cursor()

    try:
        cur.execute("SELECT id FROM admins WHERE user_id = %s", (target_user_id,))
        row = cur.fetchone()

        if row:
            # User already exists in admins table, just activate
            cur.execute("UPDATE admins SET is_active = TRUE WHERE user_id = %s", (target_user_id,))
        else:
            # Insert new admin record
            cur.execute("""
                INSERT INTO admins (user_id, admin_level, is_active, created_by)
                VALUES (%s, %s, %s, %s)
            """, (target_user_id, 2, True, session['user_id']))

        conn.commit()
    except Exception as e:
        print(f"Error promoting user: {e}")
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()
    
    return jsonify({"success": True})

@app.route('/api/admin/deactivate', methods=['POST'])
def deactivate_user():
    if 'user_id' not in session or session.get('role') != 'Admin':
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    target_user_id = data.get('user_id')
    if not target_user_id:
        return jsonify({"error": "No user_id provided"}), 400

    conn = get_postgres_conn()
    cur = conn.cursor()

    try:
        cur.execute("UPDATE admins SET is_active = false WHERE user_id = %s", (target_user_id,))
        conn.commit()
    except Exception as e:
        print(f"Error deactivating user: {e}")
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

    return jsonify({"success": True})

@app.route('/api/admin/classes', methods=['GET'])
def api_admin_get_classes():
    if 'user_id' not in session or session.get('role') != 'Admin':
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_postgres_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, nama_kelas, kode_kelas, created_at FROM classes
        ORDER BY created_at DESC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify([{
        "id": r[0],
        "nama_kelas": r[1],
        "kode_kelas": r[2],
        "created_at": r[3].strftime("%Y-%m-%d %H:%M")
    } for r in rows])

@app.route('/api/admin/delete-user', methods=['POST'])
def admin_delete_user():
    if 'user_id' not in session or session.get('role') != 'Admin':
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    target_user_id = data.get('user_id')
    if not target_user_id:
        return jsonify({"error": "No user_id provided"}), 400

    conn = get_postgres_conn()
    cur = conn.cursor()
    try:
        # Hapus user dari semua relasi terlebih dahulu
        cur.execute("DELETE FROM murid_kelas WHERE user_id = %s", (target_user_id,))
        cur.execute("DELETE FROM admins WHERE user_id = %s", (target_user_id,))
        cur.execute("DELETE FROM auth.users WHERE id = %s", (target_user_id,))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

    return jsonify({"success": True})

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
        
    try:
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
        
    except Exception as e:
        print(f"Error getting classes: {e}")
        return jsonify({"error": "Terjadi kesalahan saat mengambil daftar kelas"}), 500

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

    headers = {"apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJleGt5bHF1cG9waXVzb3JnZG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NDAyNTAsImV4cCI6MjA2MzQxNjI1MH0.A0ha39mt_dkSSkBAQHehVXQwpzhb6JoxhymF2mxtczA", "Authorization": f"Bearer {access_token}"}
    resp = requests.get("https://rexkylqupopiusorgdni.supabase.co/auth/v1/user", headers=headers)
    if resp.status_code != 200:
        return jsonify({"error": "Invalid token"}), 401
    user = resp.json()

    session['user_id'] = user['id']
    session['username'] = user['user_metadata'].get('username', user['email'])

    session['role'] = user['user_metadata'].get('role', 'Student')  # fallback ke Student

    try:
        conn = get_postgres_conn()
        cur = conn.cursor()
        cur.execute("SELECT admin_level FROM admins WHERE user_id = %s AND is_active = true", (user['id'],))
        admin_row = cur.fetchone()
        if admin_row:
            session['role'] = 'Admin'
            session['admin_level'] = admin_row[0]
        cur.close()
        conn.close()
    except Exception as e:
        print("Error checking admin role:", e)

    print("LOGIN ROLE:", session['role'])

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

@app.route('/kelas-murid/<kode_kelas>')
def kelas_murid_details_page(kode_kelas):
    if 'user_id' not in session or session.get('role') != 'Student':
        return redirect(url_for('login_register'))

    conn = get_postgres_conn()
    cur = conn.cursor()
    try:
        # Periksa apakah kelas ada dan murid telah bergabung
        cur.execute(
            "SELECT c.id, c.nama_kelas FROM classes c JOIN murid_kelas mk ON c.id = mk.kelas_id WHERE c.kode_kelas = %s AND mk.user_id = %s",
            (kode_kelas, session['user_id'])
        )
        kelas_info = cur.fetchone()
        if not kelas_info:
            return "Class not found or you have not joined this class", 404
        kelas_id, nama_kelas = kelas_info # Extract id and nama_kelas
        return render_template('kelas-murid.html', kode_kelas=kode_kelas, nama_kelas=nama_kelas)
    except Exception as e:
        print(f"Error fetching student class details: {e}")
        return "An error occurred", 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/class/update', methods=['POST'])
def api_update_class():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    role = session.get('role')
    data = request.get_json()
    kode_kelas = data.get('kode_kelas')
    nama_kelas = data.get('nama_kelas')

    if not kode_kelas or not nama_kelas:
        return jsonify({'error': 'Invalid data'}), 400

    conn = get_postgres_conn()
    cur = conn.cursor()

    try:
        if role == 'Admin':
            cur.execute("UPDATE classes SET nama_kelas = %s WHERE kode_kelas = %s", (nama_kelas, kode_kelas))
        else:
            cur.execute("UPDATE classes SET nama_kelas = %s WHERE kode_kelas = %s AND user_id = %s", (nama_kelas, kode_kelas, session['user_id']))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

    return jsonify({'success': True})

@app.route('/admin/classes')
def admin_classes():
    if 'user_id' not in session or session.get('role') != 'Admin':
        return redirect(url_for('login_register'))
    return render_template('admin-classes.html')

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

    # Hapus semua hasil_penilaian di kelas ini
    cur.execute("DELETE FROM hasil_penilaian WHERE kelas_id = %s", (kelas_id,))
    # Hapus semua assignments di kelas ini
    cur.execute("DELETE FROM assignments WHERE kelas_id = %s", (kelas_id,))
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
    print(f"Deleting upload with ID: {upload_id}")
    if not upload_id:
        return jsonify({'error': 'Invalid data'}), 400
    conn = get_postgres_conn()
    cur = conn.cursor()
    # Pastikan upload milik user
    cur.execute("SELECT id FROM hasil_penilaian WHERE id = %s", (upload_id,))
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

@app.route('/api/assignments', methods=['POST'])
def api_add_assignment():
    if 'user_id' not in session or session.get('role') != 'Teacher':
        return jsonify({"error": "Unauthorized"}), 401

    try:
        judul = request.form.get('judulAssignment')
        deskripsi = request.form.get('deskripsiAssignment')
        deadline = request.form.get('deadlineAssignment')
        kelas_id = request.form.get('kelas_id')
        file_assignment = request.files.get('fileAssignment')
        file_jawaban = request.files.get('jawabanGuru')

        # Format nama file
        assignment_ext = os.path.splitext(file_assignment.filename)[-1]
        jawaban_ext = os.path.splitext(file_jawaban.filename)[-1]
        assignment_filename = f"assignments/{kelas_id}_{judul}_assignment{assignment_ext}".replace(" ", "_")
        jawaban_filename = f"answers/teacher/{kelas_id}_{judul}_jawaban{jawaban_ext}".replace(" ", "_")

        # Upload ke Supabase Storage
        assignment_url = upload_to_supabase_storage(file_assignment, assignment_filename)
        jawaban_url = upload_to_supabase_storage(file_jawaban, jawaban_filename)

        # Simpan ke database
        conn = get_postgres_conn()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO assignments (judul, deskripsi, deadline, file_path, jawaban_path, kelas_id, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (judul, deskripsi, deadline, assignment_url, jawaban_url, kelas_id, datetime.datetime.now())
        )
        assignment_id_from_db = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Assignment berhasil ditambahkan",
            "assignment_id": assignment_id_from_db
        })

    except Exception as e:
        print(f"Error adding assignment: {e}")
        return jsonify({"error": "Terjadi kesalahan saat menambahkan assignment"}), 500

@app.route('/api/assignments/<kode_kelas>', methods=['GET'])
def api_get_assignments_by_kode_kelas(kode_kelas):
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
        
    try:
        conn = get_postgres_conn()
        cur = conn.cursor()
        
        # Dapatkan kelas_id dari kode_kelas
        cur.execute("SELECT id FROM classes WHERE kode_kelas = %s", (kode_kelas,))
        kelas_info = cur.fetchone()
        if not kelas_info:
            cur.close()
            conn.close()
            return jsonify({"error": "Class not found"}), 404
        
        kelas_id = kelas_info[0]
        user_id = session['user_id'] # Dapatkan user_id dari sesi
        
        cur.execute(
            """
            SELECT
                a.id,
                a.judul,
                a.deskripsi,
                a.deadline,
                a.file_path,
                a.jawaban_path,
                a.created_at,
                EXISTS(SELECT 1 FROM hasil_penilaian hp WHERE hp.assignment_id = a.id AND hp.user_id = %s) as is_submitted
            FROM assignments a
            WHERE a.kelas_id = %s
            ORDER BY a.created_at DESC
            """,
            (user_id, kelas_id,) # Pass user_id sebagai parameter untuk EXISTS
        )
        assignments = cur.fetchall()
        cur.close()
        conn.close()
        
        return jsonify([{
            "id": a[0],
            "judul": a[1],
            "deskripsi": a[2],
            "deadline": a[3].strftime("%Y-%m-%d %H:%M") if a[3] else None,
            "file_path": a[4],
            "jawaban_path": a[5],
            "created_at": a[6].strftime("%Y-%m-%d %H:%M"),
            "is_submitted": a[7] # Tambahkan is_submitted ke respons JSON
        } for a in assignments])
        
    except Exception as e:
        print(f"Error fetching assignments: {e}")
        return jsonify({"error": "Terjadi kesalahan saat mengambil data assignment"}), 500

@app.route('/api/assignments/<int:assignment_id>', methods=['DELETE'])
def api_delete_assignment(assignment_id):
    if 'user_id' not in session or session.get('role') != 'Teacher':
        return jsonify({"error": "Unauthorized"}), 401
        
    try:
        conn = get_postgres_conn()
        cur = conn.cursor()
        
        # Ambil file_path sebelum menghapus
        cur.execute("SELECT file_path, jawaban_path FROM assignments WHERE id = %s", (assignment_id,))
        result = cur.fetchone()
        if not result:
            return jsonify({"error": "Assignment tidak ditemukan"}), 404
            
        file_path, jawaban_path = result
        
        # Hapus dari database
        cur.execute("DELETE FROM assignments WHERE id = %s", (assignment_id,))
        conn.commit()
        cur.close()
        conn.close()
        
        # Hapus file fisik jika ada
        if os.path.exists(file_path):
            os.remove(file_path)
        if os.path.exists(jawaban_path):
            os.remove(jawaban_path)
            
        return jsonify({"success": True, "message": "Assignment berhasil dihapus"})
        
    except Exception as e:
        print(f"Error deleting assignment: {e}")
        return jsonify({"error": "Terjadi kesalahan saat menghapus assignment"}), 500

@app.route('/api/results/assignment/<int:assignment_id>', methods=['GET'])
def api_results_by_assignment(assignment_id):
    if 'user_id' not in session:
        return jsonify([]), 401
        
    try:
        results = fetch_results_by_assignment_id(assignment_id)
        return jsonify(results)
    except Exception as e:
        print(f"Error fetching results by assignment ID: {e}")
        return jsonify({"error": "Terjadi kesalahan saat mengambil hasil upload"}), 500

@app.route('/api/assignments/upload/<int:assignment_id>', methods=['POST'])
def api_upload_student_answer(assignment_id):
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    if 'file' not in request.files:
        return jsonify({"error": "Tidak ada file yang diunggah."}), 400

    student_file = request.files['file']
    if student_file.filename == '':
        return jsonify({"error": "File tidak dipilih."}), 400

    conn = get_postgres_conn()
    cur = conn.cursor()
    guru_jawaban_path = None
    kelas_id = None
    nama_kelas = None
    judul_assignment = None
    try:
        cur.execute("SELECT kelas_id, jawaban_path, judul FROM assignments WHERE id = %s", (assignment_id,))
        assignment_info = cur.fetchone()
        if not assignment_info:
            return jsonify({"error": "Assignment tidak ditemukan."}), 404
        kelas_id, guru_jawaban_url, judul_assignment = assignment_info

        cur.execute("SELECT nama_kelas FROM classes WHERE id = %s", (kelas_id,))
        kelas_row = cur.fetchone()
        nama_kelas = kelas_row[0] if kelas_row else "kelas"
    finally:
        cur.close()
        conn.close()

    nama_user = session.get('username', 'user')
    ext = os.path.splitext(student_file.filename)[-1]
    student_filename = f"answers/student/{kelas_id}_{assignment_id}_{nama_user}_jawaban{ext}".replace(" ", "_")

    # Upload file murid ke Supabase Storage
    murid_url = upload_to_supabase_storage(student_file, student_filename)

    # Download file guru dan murid ke lokal sementara untuk LSA
    import requests as pyrequests
    import tempfile

    guru_ext = get_clean_ext(guru_jawaban_url)
    murid_ext = get_clean_ext(murid_url)

    # Ambil path file dari URL public
    def get_path_from_public_url(public_url):
        parsed = urlparse(public_url)
        parts = parsed.path.split('/object/public/uploads/')
        if len(parts) > 1:
            return parts[1]
        return ""

    guru_path = get_path_from_public_url(guru_jawaban_url)
    murid_path = get_path_from_public_url(murid_url)

    with tempfile.NamedTemporaryFile(delete=False, suffix=guru_ext) as tmp_guru, \
         tempfile.NamedTemporaryFile(delete=False, suffix=murid_ext) as tmp_murid:
        # Download file guru dari Supabase Storage
        guru_bytes = supabase.storage.from_('uploads').download(guru_path)
        tmp_guru.write(guru_bytes)
        tmp_guru.flush()
        # Download file murid dari Supabase Storage
        murid_bytes = supabase.storage.from_('uploads').download(murid_path)
        tmp_murid.write(murid_bytes)
        tmp_murid.flush()

        print("Guru temp file:", tmp_guru.name)
        print("Murid temp file:", tmp_murid.name)

        # Proses LSA di dalam blok with!
        guru_text = extract_text_from_any(tmp_guru.name)
        murid_text = extract_text_from_any(tmp_murid.name)

        if not guru_text or not murid_text:
            print("Format tidak didukung atau file kosong")
            return jsonify({"error": "Format tidak didukung atau file kosong"}), 400

        avg_similarity, grade = lsa_similarity(guru_text, murid_text)
        similarity = avg_similarity

    result_to_save = {
        "name": nama_user,
        "similarity": similarity,
        "grade": grade,
        "user_id": session['user_id'],
        "kelas_id": kelas_id,
        "assignment_id": assignment_id,
        "file_path": murid_url
    }

    try:
        simpan_ke_postgres([result_to_save])
        print(f"Student submission saved to hasil_penilaian: {result_to_save}")
    except Exception as e:
        print(f"Error saving student submission to PostgreSQL: {e}")
        return jsonify({"error": "Gagal menyimpan hasil unggahan siswa."}), 500
    
    try:
        os.remove(tmp_guru.name)
    except Exception as e:
        print(f"Gagal hapus file temp guru: {e}")
    try:
        os.remove(tmp_murid.name)
    except Exception as e:
        print(f"Gagal hapus file temp murid: {e}")

    return jsonify({
        "success": True,
        "message": "Unggahan berhasil diproses!",
        "grade": grade,
        "similarity": similarity
    })

def upload_to_supabase_storage(file_storage, dest_path):
    file_bytes = file_storage.read()
    file_storage.seek(0)
    # Gunakan .update untuk overwrite, .upload untuk baru
    try:
        res = supabase.storage.from_('uploads').upload(dest_path, file_bytes)
    except Exception as e:
        # Jika file sudah ada, overwrite dengan update
        if "already exists" in str(e):
            res = supabase.storage.from_('uploads').update(dest_path, file_bytes)
        else:
            raise
    public_url = supabase.storage.from_('uploads').get_public_url(dest_path)
    return public_url

def get_clean_ext(url):
    path = urlparse(url).path  # hanya path, tanpa query string
    ext = os.path.splitext(path)[-1]
    # fallback ke .pdf jika tidak ada ekstensi
    if ext.lower() not in [".pdf", ".docx", ".txt"]:
        return ".pdf"
    return ext

@app.route('/api/assignments/<int:assignment_id>/download-csv', methods=['GET'])
def download_assignment_csv(assignment_id):
    if 'user_id' not in session or session.get('role') != 'Teacher':
        return jsonify({"error": "Unauthorized"}), 401

    results = fetch_results_by_assignment_id(assignment_id)
    if not results:
        return jsonify({"error": "No results found"}), 404

    # Buat CSV di memory
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['Student Name', 'Grade', 'Similarity', 'Upload Time'])
    for row in results:
        writer.writerow([
            row.get('nama_murid', '-'),
            row.get('nilai', row.get('grade', '-')),
            row.get('similarity', '-'),
            row.get('created_at', '-')
        ])
    # Encode ke bytes
    mem = BytesIO()
    mem.write(output.getvalue().encode('utf-8'))
    mem.seek(0)

    filename = f"assignment_{assignment_id}_results.csv"
    return send_file(
        mem,
        mimetype='text/csv',
        as_attachment=True,
        download_name=filename
    )

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000)) # Railway akan menyediakan 'PORT'
    app.run(host='0.0.0.0', port=port)