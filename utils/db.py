import psycopg2
import traceback
import os
import csv
import datetime

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
