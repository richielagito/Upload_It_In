import traceback
import os
import logging
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import psycopg2

load_dotenv()

logger = logging.getLogger(__name__)

USER = os.getenv("DB_USER")
PASSWORD = os.getenv("DB_PASSWORD")
HOST = os.getenv("DB_HOST")
PORT = os.getenv("DB_PORT")
DBNAME = os.getenv("DB_NAME")

DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"

_engine = None


def get_engine():
    global _engine
    if _engine is None:
        if not all([USER, PASSWORD, HOST, PORT, DBNAME]):
            raise ValueError("Missing DB configuration for SQLAlchemy engine")
        _engine = create_engine(DATABASE_URL)
    return _engine

def simpan_ke_postgres(results):
    try:
        with get_engine().begin() as conn:
            for r in results:
                assignment_id = r.get("assignment_id")
                user_id = r.get("user_id")
                # Cek apakah sudah ada hasil untuk user & assignment ini
                existing = conn.execute(
                    text("SELECT id FROM hasil_penilaian WHERE user_id = :user_id AND assignment_id = :assignment_id"),
                    {"user_id": user_id, "assignment_id": assignment_id}
                ).fetchone()
                if existing:
                    # Update hasil lama
                    conn.execute(
                        text("UPDATE hasil_penilaian SET nama_murid=:name, similarity=:similarity, nilai=:grade, file_path=:file_path, updated_at=NOW() WHERE id=:id"),
                        {
                            "name": r["name"],
                            "similarity": float(r["similarity"]),
                            "grade": r["grade"],
                            "file_path": r["file_path"],
                            "id": existing[0]
                        }
                    )
                else:
                    # Insert baru
                    conn.execute(
                        text("INSERT INTO hasil_penilaian (nama_murid, similarity, nilai, user_id, kelas_id, assignment_id, file_path) VALUES (:name, :similarity, :grade, :user_id, :kelas_id, :assignment_id, :file_path)"),
                        {
                            "name": r["name"],
                            "similarity": float(r["similarity"]),
                            "grade": r["grade"],
                            "user_id": r["user_id"],
                            "kelas_id": r["kelas_id"],
                            "assignment_id": assignment_id,
                            "file_path": r["file_path"]
                        }
                    )
    except Exception as e:
        logger.error("Gagal menyimpan ke PostgreSQL: %s", e)
        traceback.print_exc()
        raise

def fetch_all_results(user_id):
    try:
        with get_engine().connect() as conn:
            result = conn.execute(
                text("SELECT * FROM public.hasil_penilaian WHERE user_id = :user_id ORDER BY nama_murid"),
                {"user_id": user_id}
            )
            results = [dict(row) for row in result.mappings()]
            for r in results:
                r['similarity'] = float(r['similarity'])
            return results
    except Exception as e:
        logger.error("Gagal fetch data dari PostgreSQL: %s", e)
        return []
    
def get_postgres_conn():
    return psycopg2.connect(
        dbname=DBNAME,
        user=USER,
        password=PASSWORD,
        host=HOST,
        port=PORT,
        sslmode="require"
    )

def fetch_results_by_kelas(kelas_id):
    try:
        with get_engine().connect() as conn:
            result = conn.execute(
                text("SELECT * FROM public.hasil_penilaian WHERE kelas_id = :kelas_id ORDER BY nama_murid"),
                {"kelas_id": kelas_id}
            )
            results = [dict(row) for row in result.mappings()]
            for r in results:
                r['similarity'] = float(r['similarity'])
            return results
    except Exception as e:
        logger.error("Gagal fetch data dari PostgreSQL (by kelas): %s", e)
        return []

def fetch_results_by_kode_kelas(kode_kelas, user_id):
    try:
        with get_engine().connect() as conn:
            # Dapatkan kelas_id dari kode_kelas. Untuk siswa, kita perlu memeriksa tabel murid_kelas.
            kelas_result = conn.execute(
                text("SELECT c.id FROM classes c JOIN murid_kelas mk ON c.id = mk.kelas_id WHERE c.kode_kelas = :kode_kelas AND mk.user_id = :user_id"),
                {"kode_kelas": kode_kelas, "user_id": user_id}
            )
            kelas_row = kelas_result.fetchone()
            if not kelas_row:
                return []
            kelas_id = kelas_row[0]
            
            # Ambil hasil penilaian + judul assignment
            result = conn.execute(
                text("""
                    SELECT hp.*, a.judul AS judul_assignment
                    FROM public.hasil_penilaian hp
                    JOIN assignments a ON hp.assignment_id = a.id
                    WHERE hp.kelas_id = :kelas_id AND hp.user_id = :user_id
                    ORDER BY hp.nama_murid
                """),
                {"kelas_id": kelas_id, "user_id": user_id}
            )
            results = [dict(row) for row in result.mappings()]
            for r in results:
                r['similarity'] = float(r['similarity'])
            return results
    except Exception as e:
        logger.error("Gagal fetch data dari PostgreSQL (by kode_kelas): %s", e)
        return []

def fetch_results_by_assignment_id(assignment_id):
    try:
        with get_engine().connect() as conn:
            result = conn.execute(
                text("SELECT id, nama_murid, similarity, nilai, created_at FROM public.hasil_penilaian WHERE assignment_id = :assignment_id ORDER BY created_at DESC"),
                {"assignment_id": assignment_id}
            )
            results = [dict(row) for row in result.mappings()]
            for r in results:
                r['similarity'] = float(r['similarity'])
            return results
    except Exception as e:
        logger.error("Gagal fetch data dari PostgreSQL (by assignment_id): %s", e)
        return []
