import psycopg2
import traceback
import os
import csv
import datetime
from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash, check_password_hash

def get_pg_conn():
    return psycopg2.connect(
        host="localhost",
        port=8000,  # Ganti sesuai setting
        database="penilaian_essai",
        user="postgres",
        password="m171807074"
    )

def register_user(email, username, password):
    try:
        conn = get_pg_conn()
        cur = conn.cursor()
        hashed_pw = generate_password_hash(password)
        cur.execute(
            "INSERT INTO users (email, username, password) VALUES (%s, %s, %s)",
            (email, username, hashed_pw)
        )
        conn.commit()
        cur.close()
        conn.close()
        return True, None
    except psycopg2.errors.UniqueViolation:
        return False, "Email/Username sudah terdaftar!"
    except Exception as e:
        return False, str(e)

def login_user(email, password):
    try:
        conn = get_pg_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        cur.close()
        conn.close()
        if user and check_password_hash(user['password'], password):
            return True, user
        else:
            return False, "Email atau password salah!"
    except Exception as e:
        return False, str(e)

def simpan_ke_postgres(results):
    try:
        conn = get_pg_conn()
        cursor = conn.cursor()
        for r in results:
            # Log yang disimpan buat ngecek masuk atau tidak (OPSIONAL)
            print(f"Menyimpan ke DB: {r['name']} | {r['similarity']} | {r['grade']}")
            cursor.execute('''
                INSERT INTO hasil_penilaian (nama_murid, similarity, nilai)
                VALUES (%s, %s, %s)
            ''', (r["name"], float(r["similarity"]), r["grade"]))
            print(f"Inserted row for {r['name']}")
        conn.commit()
        print("Transaction committed successfully.")
        cursor.close()
        conn.close()
        print("Connection closed.")
    except Exception as e:
        print("Gagal menyimpan ke PostgreSQL:", e)
        traceback.print_exc()

def save_to_csv(results, folder='data'):
    if not os.path.exists(folder):
        os.makedirs(folder)
    filename = f"hasil_penilaian_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    filepath = os.path.join(folder, filename)
    with open(filepath, mode='w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['name', 'similarity', 'grade']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for r in results:
            writer.writerow(r)
    print(f"Results saved to {filepath}")

def fetch_all_results():
    try:
        conn = get_pg_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM public.hasil_penilaian ORDER BY nama_murid")
        results = cur.fetchall()
        cur.close()
        conn.close()
        # Pastikan similarity bertipe float standar
        for r in results:
            r['similarity'] = float(r['similarity'])
        return results
    except Exception as e:
        print("Gagal fetch data dari PostgreSQL:", e)
        return []