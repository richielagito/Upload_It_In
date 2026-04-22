import logging
import os
import traceback
import json
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_USER = os.getenv("DB_USER")
_PASSWORD = os.getenv("DB_PASSWORD")
_HOST = os.getenv("DB_HOST")
_PORT = os.getenv("DB_PORT")
_DBNAME = os.getenv("DB_NAME")

_DATABASE_URL = (
    f"postgresql+psycopg2://{_USER}:{_PASSWORD}@{_HOST}:{_PORT}/{_DBNAME}?sslmode=require"
)

# Singleton engine — dibuat sekali saat startup, bukan setiap pemanggilan
_engine = None


def get_engine():
    global _engine
    if _engine is None:
        if not all([_USER, _PASSWORD, _HOST, _PORT, _DBNAME]):
            raise ValueError(
                "Missing DB configuration. Pastikan DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME ada di .env"
            )
        _engine = create_engine(
            _DATABASE_URL,
            pool_size=5,
            max_overflow=2,
            pool_pre_ping=True,  # Cek koneksi sebelum dipakai (menghindari stale connections)
        )
        logger.info("SQLAlchemy engine created (singleton)")
    return _engine


def simpan_ke_postgres(results):
    """Simpan atau update hasil penilaian menggunakan ON CONFLICT (atomic upsert)."""
    try:
        with get_engine().begin() as conn:
            for r in results:
                conn.execute(
                    text("""
                        INSERT INTO hasil_penilaian
                            (nama_murid, similarity, nilai, user_id, kelas_id, assignment_id, file_path, status, feedback, sub_criteria_scores)
                        VALUES
                            (:name, :similarity, :grade, :user_id, :kelas_id, :assignment_id, :file_path, :status, :feedback, :sub_criteria_scores)
                        ON CONFLICT (user_id, assignment_id)
                        DO UPDATE SET
                            nama_murid  = EXCLUDED.nama_murid,
                            similarity  = EXCLUDED.similarity,
                            nilai       = EXCLUDED.nilai,
                            file_path   = EXCLUDED.file_path,
                            status      = EXCLUDED.status,
                            feedback    = EXCLUDED.feedback,
                            sub_criteria_scores = EXCLUDED.sub_criteria_scores,
                            updated_at  = NOW()
                    """),
                    {
                        "name": r["name"],
                        "similarity": float(r["similarity"]),
                        "grade": r["grade"],
                        "user_id": r["user_id"],
                        "kelas_id": r["kelas_id"],
                        "assignment_id": r.get("assignment_id"),
                        "file_path": r["file_path"],
                        "status": r.get("status", "draft"),
                        "feedback": r.get("feedback"),
                        "sub_criteria_scores": json.dumps(r.get("sub_criteria_scores")) if r.get("sub_criteria_scores") else None,
                    },
                )
    except Exception:
        logger.exception("Gagal menyimpan ke PostgreSQL")
        traceback.print_exc()
        raise


def fetch_all_results(user_id, status=None):
    try:
        with get_engine().connect() as conn:
            query = "SELECT * FROM public.hasil_penilaian WHERE user_id = :user_id"
            params = {"user_id": user_id}
            if status:
                query += " AND status = :status"
                params["status"] = status
            query += " ORDER BY nama_murid"
            result = conn.execute(text(query), params)
            results = [dict(row) for row in result.mappings()]
            for r in results:
                r["similarity"] = float(r["similarity"])
            return results
    except Exception:
        logger.exception("Gagal fetch data dari PostgreSQL")
        return []


def fetch_results_by_kelas(kelas_id, status=None):
    try:
        with get_engine().connect() as conn:
            query = "SELECT * FROM public.hasil_penilaian WHERE kelas_id = :kelas_id"
            params = {"kelas_id": kelas_id}
            if status:
                query += " AND status = :status"
                params["status"] = status
            query += " ORDER BY nama_murid"
            result = conn.execute(text(query), params)
            results = [dict(row) for row in result.mappings()]
            for r in results:
                r["similarity"] = float(r["similarity"])
            return results
    except Exception:
        logger.exception("Gagal fetch data dari PostgreSQL (by kelas)")
        return []


def fetch_results_by_kode_kelas(kode_kelas, user_id, status=None):
    try:
        with get_engine().connect() as conn:
            kelas_result = conn.execute(
                text(
                    "SELECT c.id FROM classes c "
                    "JOIN murid_kelas mk ON c.id = mk.kelas_id "
                    "WHERE c.kode_kelas = :kode_kelas AND mk.user_id = :user_id"
                ),
                {"kode_kelas": kode_kelas, "user_id": user_id},
            )
            kelas_row = kelas_result.fetchone()
            if not kelas_row:
                return []
            kelas_id = kelas_row[0]

            query = """
                SELECT hp.*, a.judul AS judul_assignment
                FROM public.hasil_penilaian hp
                JOIN assignments a ON hp.assignment_id = a.id
                WHERE hp.kelas_id = :kelas_id AND hp.user_id = :user_id
            """
            params = {"kelas_id": kelas_id, "user_id": user_id}
            if status:
                query += " AND hp.status = :status"
                params["status"] = status
            query += " ORDER BY hp.nama_murid"

            result = conn.execute(text(query), params)
            results = [dict(row) for row in result.mappings()]
            for r in results:
                r["similarity"] = float(r["similarity"])
            return results
    except Exception:
        logger.exception("Gagal fetch data dari PostgreSQL (by kode_kelas)")
        return []


def fetch_results_by_assignment_id(assignment_id, status=None):
    try:
        with get_engine().connect() as conn:
            query = """
                SELECT id, nama_murid, similarity, nilai, status, feedback, sub_criteria_scores, created_at
                FROM public.hasil_penilaian
                WHERE assignment_id = :assignment_id
            """
            params = {"assignment_id": assignment_id}
            if status:
                query += " AND status = :status"
                params["status"] = status
            query += " ORDER BY created_at DESC"

            result = conn.execute(text(query), params)
            results = [dict(row) for row in result.mappings()]
            for r in results:
                r["similarity"] = float(r["similarity"])
                if r.get("sub_criteria_scores") and isinstance(r["sub_criteria_scores"], str):
                    try:
                        r["sub_criteria_scores"] = json.loads(r["sub_criteria_scores"])
                    except Exception:
                        pass
            return results
    except Exception:
        logger.exception("Gagal fetch data dari PostgreSQL (by assignment_id)")
        return []
