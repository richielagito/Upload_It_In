import psycopg2
import traceback

def simpan_ke_postgres(results):
    try:
        conn = psycopg2.connect(
            host="localhost",
            port=8000,  # <- GANTI PORT MASING-MASING
            database="penilaian_essai",
            user="postgres",
            password="m171807074"  # <- GANTI PASSWORD PGADMIN4 MASING2
        )
        cursor = conn.cursor()
        for r in results:
            # Log yang disimpan buat ngecek masuk atau tidak (OPSIONAL)
            print(f"Menyimpan ke DB: {r['name']} | {r['similarity']} | {r['grade']}")
            cursor.execute('''
                INSERT INTO hasil_penilaian (nama_murid, similarity, nilai)
                VALUES (%s, %s, %s)
            ''', (r["name"], r["similarity"], r["grade"]))
            print(f"Inserted row for {r['name']}")
        conn.commit()
        print("Transaction committed successfully.")
        cursor.close()
        conn.close()
        print("Connection closed.")
    except Exception as e:
        print("Gagal menyimpan ke PostgreSQL:", e)
        traceback.print_exc()
