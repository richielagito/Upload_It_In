import traceback
import os
import csv
import datetime
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"
engine = create_engine(DATABASE_URL)

def simpan_ke_postgres(results):
    try:
        with engine.begin() as conn:
            for r in results:
                conn.execute(
                    text("INSERT INTO hasil_penilaian (nama_murid, similarity, nilai, user_id) VALUES (:name, :similarity, :grade, :user_id)"),
                    {"name": r["name"], "similarity": float(r["similarity"]), "grade": r["grade"], "user_id": r["user_id"]}
                )
    except Exception as e:
        print("Gagal menyimpan ke PostgreSQL:", e)
        traceback.print_exc()

def save_to_csv(results, folder='data'):
    if not os.path.exists(folder):
        os.makedirs(folder)
    filename = f"hasil_penilaian_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    filepath = os.path.join(folder, filename)
    with open(filepath, mode='w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['name', 'similarity', 'grade', 'user_id']  # tambahkan user_id di sini
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for r in results:
            writer.writerow(r)
    print(f"Results saved to {filepath}")

def fetch_all_results(user_id):
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT * FROM public.hasil_penilaian WHERE user_id = :user_id ORDER BY nama_murid"),
                {"user_id": user_id}
            )
            results = [dict(row) for row in result.mappings()]
            for r in results:
                r['similarity'] = float(r['similarity'])
            return results
    except Exception as e:
        print("Gagal fetch data dari PostgreSQL:", e)
        return []