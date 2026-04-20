import logging
import os
import traceback
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
                            (nama_murid, similarity, nilai, user_id, kelas_id, assignment_id, file_path)
                        VALUES
                            (:name, :similarity, :grade, :user_id, :kelas_id, :assignment_id, :file_path)
                        ON CONFLICT (user_id, assignment_id)
                        DO UPDATE SET
                            nama_murid  = EXCLUDED.nama_murid,
                            similarity  = EXCLUDED.similarity,
                            nilai       = EXCLUDED.nilai,
                            file_path   = EXCLUDED.file_path,
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
                    },
                )
    except Exception:
        logger.exception("Gagal menyimpan ke PostgreSQL")
        traceback.print_exc()
        raise


def fetch_all_results(user_id):
    try:
        with get_engine().connect() as conn:
            result = conn.execute(
                text(
                    "SELECT * FROM public.hasil_penilaian WHERE user_id = :user_id ORDER BY nama_murid"
                ),
                {"user_id": user_id},
            )
            results = [dict(row) for row in result.mappings()]
            for r in results:
                r["similarity"] = float(r["similarity"])
            return results
    except Exception:
        logger.exception("Gagal fetch data dari PostgreSQL")
        return []


def fetch_results_by_kelas(kelas_id):
    try:
        with get_engine().connect() as conn:
            result = conn.execute(
                text(
                    "SELECT * FROM public.hasil_penilaian WHERE kelas_id = :kelas_id ORDER BY nama_murid"
                ),
                {"kelas_id": kelas_id},
            )
            results = [dict(row) for row in result.mappings()]
            for r in results:
                r["similarity"] = float(r["similarity"])
            return results
    except Exception:
        logger.exception("Gagal fetch data dari PostgreSQL (by kelas)")
        return []


def fetch_results_by_kode_kelas(kode_kelas, user_id):
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

            result = conn.execute(
                text("""
                    SELECT hp.*, a.judul AS judul_assignment
                    FROM public.hasil_penilaian hp
                    JOIN assignments a ON hp.assignment_id = a.id
                    WHERE hp.kelas_id = :kelas_id AND hp.user_id = :user_id
                    ORDER BY hp.nama_murid
                """),
                {"kelas_id": kelas_id, "user_id": user_id},
            )
            results = [dict(row) for row in result.mappings()]
            for r in results:
                r["similarity"] = float(r["similarity"])
            return results
    except Exception:
        logger.exception("Gagal fetch data dari PostgreSQL (by kode_kelas)")
        return []


def fetch_results_by_assignment_id(assignment_id):
    try:
        with get_engine().connect() as conn:
            result = conn.execute(
                text(
                    "SELECT id, nama_murid, similarity, nilai, created_at "
                    "FROM public.hasil_penilaian "
                    "WHERE assignment_id = :assignment_id "
                    "ORDER BY created_at DESC"
                ),
                {"assignment_id": assignment_id},
            )
            results = [dict(row) for row in result.mappings()]
            for r in results:
                r["similarity"] = float(r["similarity"])
            return results
    except Exception:
        logger.exception("Gagal fetch data dari PostgreSQL (by assignment_id)")
        return []
