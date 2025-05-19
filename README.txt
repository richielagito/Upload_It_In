essay_grader/
├── app.py                        # Flask app utama
├── requirements.txt              # Semua dependensi
├── templates/
│   └── index.html                # Form upload PDF
├── uploads/                      # Tempat simpan file PDF upload
├── data/                         # Tempat simpan hasil penilaian CSV
├── utils/
│   ├── pdf_reader.py             # Ekstrak teks dari PDF
│   ├── preprocessing.py          # Preprocessing teks Bahasa Indonesia
│   ├── tfidf_manual.py           # Perhitungan TF-IDF manual
│   ├── lsa_manual.py             # SVD manual dan cosine similarity
│   └── db.py                     # Simpan hasil ke PostgreSQL


HARUS BUKA FILE db.py UNTUK CONNECT KE PG ADMIN, ROUTE DAN PASSWORD GANTI SESUAI YANG UDAH DI SETTING YA.

pip install -r requirements.txt (UNTUK INSTALL LIBRARY DI requirements.txt)