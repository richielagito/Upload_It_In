#app.py:

from flask import Flask, request, render_template, jsonify, redirect, url_for, session
from flask_cors import CORS
import os
import datetime
import logging
import tempfile
import traceback
from dotenv import load_dotenv
import requests
import random
import string
import json
import re
from urllib.parse import urlparse
import csv
from io import StringIO, BytesIO
from flask import send_file

from uploaditin_backend.utils.db import get_postgres_conn
from uploaditin_backend.utils.supabase_helpers import (
    get_server_supabase_client,
    upload_file,
    download_file,
    get_public_path,
    SupabaseStorageError,
    SupabaseDownloadError,
)
from uploaditin_backend.utils.LSA import (
    extract_text_from_any,
    lsa_similarity,
)
from uploaditin_backend.utils.embedding_scorer import embedding_score_submission
from uploaditin_backend.utils.db import (
    simpan_ke_postgres,
    fetch_all_results,
    fetch_results_by_kelas,
    fetch_results_by_kode_kelas,
    fetch_results_by_assignment_id,
)

load_dotenv()

app = Flask(__name__)
CORS(app)

_secret_key = os.getenv("FLASK_SECRET_KEY")
if not _secret_key:
    raise RuntimeError("FLASK_SECRET_KEY environment variable is not set.")
app.secret_key = _secret_key

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['CSV_FOLDER'] = 'data'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['CSV_FOLDER'], exist_ok=True)

supabase = None


def _get_supabase():
    global supabase
    if supabase is None:
        supabase = get_server_supabase_client()
    return supabase
    
def generate_unique_class_code(length: int = 6):
    conn = get_postgres_conn()
    cur = conn.cursor()
    try:
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
            cur.execute("SELECT 1 FROM classes WHERE kode_kelas = %s", (code,))
            if not cur.fetchone():
                break
        return code
    finally:
        cur.close()
        conn.close()

def clean_part(s: str) -> str:
    return re.sub(r'[\\/*?:"<>| ]', "", s)



  

@app.route('/login_register')
def login_register():
    return jsonify({"error": "Unauthorized / Please login"}), 401

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
        row = cur.fetchone()
        total_users = row[0] if row and row[0] is not None else 0

        cur.execute("SELECT COUNT(*) FROM classes")
        row = cur.fetchone()
        total_classes = row[0] if row and row[0] is not None else 0

        cur.execute("SELECT COUNT(*) FROM hasil_penilaian")
        row = cur.fetchone()
        total_uploads = row[0] if row and row[0] is not None else 0

        cur.execute("SELECT COUNT(*) FROM admins WHERE is_active = TRUE")
        row = cur.fetchone()
        active_admins = row[0] if row and row[0] is not None else 0

    except Exception as e:
        logger.error("Error fetching admin stats: %s", e)
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

    try:
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
    except Exception as e:
        logger.error("Error fetching admin users: %s", e)
        return jsonify({"error": "Failed to fetch users"}), 500
    finally:
        cur.close()
        conn.close()

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
        logger.info("Received data for saving: %s", data)

        try:
            for section in ['hero', 'statistics', 'testimonials', 'contact']:
                if section in data:
                    # Convert data to JSON string for storage
                    content_to_store = json.dumps(data[section])
                    
                    logger.info("Storing %s: %s", section, content_to_store)
                    
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
            logger.info("Changes committed successfully")
            
        except Exception as e:
            logger.error("Error saving landing page data: %s", e)
            conn.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
            conn.close()
        
        return jsonify({"success": True})

    return jsonify({"error": "Method not allowed"}), 405
    
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

    data = request.get_json() or {}
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
        logger.error("Error promoting user: %s", e)
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
        logger.error("Error deactivating user: %s", e)
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
    try:
        cur.execute("""
            SELECT id, nama_kelas, kode_kelas, created_at FROM classes
            ORDER BY created_at DESC
        """)
        rows = cur.fetchall()
        return jsonify([{
            "id": r[0],
            "nama_kelas": r[1],
            "kode_kelas": r[2],
            "created_at": r[3].strftime("%Y-%m-%d %H:%M")
        } for r in rows])
    except Exception as e:
        logger.error("Error fetching admin classes: %s", e)
        return jsonify({"error": "Failed to fetch classes"}), 500
    finally:
        cur.close()
        conn.close()

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
    if not nama_kelas or not nama_kelas.strip():
        return jsonify({"error": "Class name is required"}), 400
    user_id = session['user_id']
    kode_kelas = generate_unique_class_code()
    created_at = datetime.datetime.now()
    conn = get_postgres_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO classes (nama_kelas, kode_kelas, user_id, created_at) VALUES (%s, %s, %s, %s) RETURNING id",
            (nama_kelas.strip(), kode_kelas, user_id, created_at)
        )
        row = cur.fetchone()
        kelas_id = row[0] if row and len(row) > 0 else None
        conn.commit()
        return jsonify({"class_code": kode_kelas, "kelas_id": kelas_id})
    except Exception as e:
        conn.rollback()
        logger.error("Error creating class: %s", e)
        return jsonify({"error": "Failed to create class"}), 500
    finally:
        cur.close()
        conn.close()

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
        logger.error("Error getting classes: %s", e)
        return jsonify({"error": "Terjadi kesalahan saat mengambil daftar kelas"}), 500



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
    # Use get_json to ensure we always have a dict (avoid None)
    data = request.get_json() or {}
    access_token = data.get('access_token')
    if not access_token:
        return jsonify({"error": "No token"}), 400

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_secret_key = os.getenv("SUPABASE_SECRET_KEY")
    if not supabase_url or not supabase_secret_key:
        return jsonify({"error": "Server configuration error: missing SUPABASE_URL or SUPABASE_SECRET_KEY"}), 500

    headers = {
        "apikey": supabase_secret_key,
        "Authorization": f"Bearer {access_token}",
    }
    resp = requests.get(f"{supabase_url}/auth/v1/user", headers=headers, timeout=10)
    if resp.status_code != 200:
        return jsonify({"error": "Invalid token"}), 401
    user = resp.json() if hasattr(resp, 'json') else {}

    # Defensive access for responses from external auth service
    session['user_id'] = user.get('id')
    user_metadata = user.get('user_metadata') or {}
    session['username'] = user_metadata.get('username') or user.get('email') or 'user'
    session['role'] = user_metadata.get('role') or 'Student'

    try:
        conn = get_postgres_conn()
        cur = conn.cursor()
        cur.execute("SELECT admin_level FROM admins WHERE user_id = %s AND is_active = true", (session.get('user_id'),))
        admin_row = cur.fetchone()
        if admin_row:
            session['role'] = 'Admin'
            # guard admin_row indexing
            session['admin_level'] = admin_row[0] if len(admin_row) > 0 else None
        cur.close()
        conn.close()
    except Exception as e:
        print("Error checking admin role:", e)

    logger.info("LOGIN ROLE: %s", session['role'])

    return jsonify({"success": True})

@app.route('/logout', methods=['GET', 'POST'])
def logout():
    session.clear()
    return jsonify({"success": True})





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
    try:
        # Dapatkan id kelas
        cur.execute("SELECT id FROM classes WHERE kode_kelas = %s AND user_id = %s", (kode_kelas, session['user_id']))
        row = cur.fetchone()
        if not row:
            return jsonify({'error': 'Class not found'}), 404
        kelas_id = row[0]

        # Hapus semua hasil_penilaian di kelas ini
        cur.execute("DELETE FROM hasil_penilaian WHERE kelas_id = %s", (kelas_id,))
        # Hapus semua assignments di kelas ini
        cur.execute("DELETE FROM assignments WHERE kelas_id = %s", (kelas_id,))
        # Hapus kelas
        cur.execute("DELETE FROM classes WHERE id = %s", (kelas_id,))
        conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        logger.error("Error deleting class: %s", e)
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/upload/delete', methods=['POST'])
def api_delete_upload():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.get_json()
    upload_id = data.get('id')
    logger.info("Deleting upload with ID: %s", upload_id)
    if not upload_id:
        return jsonify({'error': 'Invalid data'}), 400
    conn = get_postgres_conn()
    cur = conn.cursor()
    try:
        # Pastikan upload milik user
        cur.execute("SELECT id FROM hasil_penilaian WHERE id = %s AND user_id = %s", (upload_id, session['user_id']))
        if not cur.fetchone():
            return jsonify({'error': 'Not found'}), 404
        cur.execute("DELETE FROM hasil_penilaian WHERE id = %s AND user_id = %s", (upload_id, session['user_id']))
        conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        logger.error("Error deleting upload: %s", e)
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

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

        # Validate uploaded files before using filename
        if file_assignment is None or not getattr(file_assignment, 'filename', None):
            return jsonify({"error": "No assignment file provided"}), 400
        if file_jawaban is None or not getattr(file_jawaban, 'filename', None):
            return jsonify({"error": "No teacher answer file provided"}), 400

        # Format nama file
        assignment_ext = os.path.splitext(file_assignment.filename or "")[ -1]
        jawaban_ext = os.path.splitext(file_jawaban.filename or "")[ -1]
        assignment_filename = f"assignments/{kelas_id}_{clean_part(judul or '')}_assignment{assignment_ext}".replace(" ", "_")
        jawaban_filename = f"answers/teacher/{kelas_id}_{clean_part(judul or '')}_jawaban{jawaban_ext}".replace(" ", "_")

        # Upload ke Supabase Storage
        assignment_url = upload_file(file_assignment.read(), assignment_filename)
        jawaban_url = upload_file(file_jawaban.read(), jawaban_filename)

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
        row = cur.fetchone()
        assignment_id_from_db = row[0] if row and len(row) > 0 else None
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Assignment berhasil ditambahkan",
            "assignment_id": assignment_id_from_db
        })

    except Exception as e:
        logger.error("Error adding assignment: %s", e)
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
        logger.error("Error fetching assignments: %s", e)
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
        logger.error("Error deleting assignment: %s", e)
        return jsonify({"error": "Terjadi kesalahan saat menghapus assignment"}), 500

@app.route('/api/results/assignment/<int:assignment_id>', methods=['GET'])
def api_results_by_assignment(assignment_id):
    if 'user_id' not in session:
        return jsonify([]), 401
        
    try:
        results = fetch_results_by_assignment_id(assignment_id)
        return jsonify(results)
    except Exception as e:
        logger.error("Error fetching results by assignment ID: %s", e)
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
        nama_kelas = kelas_row[0] if kelas_row and len(kelas_row) > 0 and kelas_row[0] is not None else "kelas"
    finally:
        cur.close()
        conn.close()

    nama_user = session.get('username', 'user')
    # student_file.filename should be present by earlier checks
    ext = os.path.splitext(student_file.filename or "")[ -1]
    student_filename = f"answers/student/{kelas_id}_{assignment_id}_{clean_part(nama_user)}_jawaban{ext}".replace(" ", "_")

    # Upload file murid ke Supabase Storage
    murid_url = upload_file(student_file.read(), student_filename)

    # Guard external URLs before deriving extensions / paths
    if not guru_jawaban_url:
        return jsonify({"error": "Guru jawaban url tidak tersedia"}), 500
    if not murid_url:
        return jsonify({"error": "murid url tidak tersedia"}), 500

    guru_ext = get_clean_ext(guru_jawaban_url)
    murid_ext = get_clean_ext(murid_url)

    # Ambil path file dari URL public
    _ = get_public_path(guru_jawaban_url)
    _ = get_public_path(murid_url)

    tmp_guru_path = None
    tmp_murid_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=guru_ext) as tmp_guru, \
             tempfile.NamedTemporaryFile(delete=False, suffix=murid_ext) as tmp_murid:
            tmp_guru_path = tmp_guru.name
            tmp_murid_path = tmp_murid.name
            # Download file guru dari Supabase Storage via helper
            try:
                guru_bytes = download_file(guru_jawaban_url, client=_get_supabase())
            except SupabaseDownloadError as e:
                logger.error("Failed to download guru file: %s", e)
                return jsonify({"error": "Gagal mendownload file guru dari storage"}), 500
            tmp_guru.write(guru_bytes)
            tmp_guru.flush()
            # Download file murid dari Supabase Storage via helper
            try:
                murid_bytes = download_file(murid_url, client=_get_supabase())
            except SupabaseDownloadError as e:
                logger.error("Failed to download murid file: %s", e)
                return jsonify({"error": "Gagal mendownload file murid dari storage"}), 500
            tmp_murid.write(murid_bytes)
            tmp_murid.flush()

            logger.info("Guru temp file: %s", tmp_guru.name)
            logger.info("Murid temp file: %s", tmp_murid.name)

            # Proses scoring via scorer interface
            guru_text = extract_text_from_any(tmp_guru.name)
            murid_text = extract_text_from_any(tmp_murid.name)

            if not guru_text or not murid_text:
                logger.warning("Format tidak didukung atau file kosong")
                return jsonify({"error": "Format tidak didukung atau file kosong"}), 400

            scoring_engine = os.getenv("SCORING_ENGINE", "legacy").lower()
            if scoring_engine == "embeddings":
                try:
                    score_res = embedding_score_submission(guru_text, murid_text)
                    avg_similarity = score_res["avg_similarity"]
                    grade = score_res["grade"]
                except Exception as e:
                    logger.error("Embedding scoring failed: %s", e)
                    return jsonify({"error": "Gagal memproses penilaian dengan AI. Silakan coba lagi nanti atau hubungi admin."}), 502
            else:
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
            logger.info("Student submission saved to hasil_penilaian: %s", result_to_save)
        except Exception as e:
            logger.error("Error saving student submission to PostgreSQL: %s", e)
            return jsonify({"error": "Gagal menyimpan hasil unggahan siswa."}), 500

        return jsonify({
            "success": True,
            "message": "Unggahan berhasil diproses!",
            "grade": grade,
            "similarity": similarity
        })
    finally:
        for path in [tmp_guru_path, tmp_murid_path]:
            if path:
                try:
                    os.remove(path)
                except Exception as e:
                    logger.warning("Gagal hapus file temp: %s", e)

def upload_to_supabase_storage(file_storage, dest_path: str) -> str:
    file_bytes = file_storage.read()
    file_storage.seek(0)
    try:
        public_url = upload_file(file_bytes, dest_path, client=_get_supabase())
        return public_url
    except SupabaseStorageError as e:
        logger.error("Supabase upload error for %s: %s", dest_path, e)
        raise

def get_clean_ext(url: str) -> str:
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
