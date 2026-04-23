# Specification: Essay Text Highlighting

## Overview
Menambahkan fitur *Essay Text Highlighting* pada platform SCOVA. Fitur ini akan mengekstrak kutipan penting dari esai siswa menggunakan model Gemini 3.1 Flash-Lite dan menyoroti kutipan tersebut (highlight) di halaman detail tugas (frontend) dengan warna dan *tooltip* berisi alasan, berdasarkan kategori (misalnya argumen kuat atau lemah). Proses ini akan digabungkan dengan endpoint feedback yang sudah ada untuk menghemat pemanggilan API.

## Functional Requirements
1. **Prompt Model Update**: Prompt Gemini 3.1 Flash-Lite yang sudah ada diubah agar mengembalikan *feedback* umum, aspek, dan sebuah *array of highlights* dalam format terstruktur (JSON). Setiap *highlight* berisi `quote` (kutipan persis), `category` ("strong" atau "weak"), dan `reason` (alasan).
2. **Span Matching Backend**: Backend mencari posisi teks `quote` di dalam teks asli esai (dengan pencarian regex untuk mengatasi sedikit perbedaan *whitespace*) untuk menentukan `start` dan `end` index kutipan. Hasil akan diurutkan dan membuang span yang *overlap*.
3. **Database Persistence**: Hasil ekstraksi *highlight* (berupa array of object yang berisi start, end, category, dan reason) akan disimpan ke database Supabase (bisa ditambahkan ke field JSON yang menyimpan feedback).
4. **"Missing" Category Handling**: Kategori "missing" (hal yang kurang dari esai namun tanpa kutipan fisik di dalam teks) akan diintegrasikan sebagai bagian dari *feedback* umum.
5. **Frontend Rendering**: Frontend akan memisahkan teks asli berdasarkan span `start` dan `end`, lalu menyisipkan elemen ber-highlight (seperti tag `<mark>`) untuk merender esai di UI.
6. **Frontend Styling & Tooltip**: Frontend akan menggunakan kombinasi *Tailwind CSS* dan *Custom CSS* untuk mewarnai highlight sesuai kategorinya dan menampilkan *tooltip* (*hover*) yang berisi `reason`.

## Non-Functional Requirements
1. **Performance**: Algoritma *span matching* di backend harus efisien (kompleksitas rendah) agar latensi proses penilaian tidak terlalu bertambah.
2. **Reliability**: Jika LLM berhalusinasi dan mengembalikan kutipan yang tidak ditemukan dalam teks asli, backend harus mengabaikan *quote* tersebut tanpa menyebabkan *error*.
3. **Extensibility**: Logic *matching* dipisahkan dari API routing untuk memudahkan pengujian (TDD).

## Acceptance Criteria
- [ ] Endpoint backend untuk proses *feedback* sukses mengembalikan *field* `highlights` tambahan bersama data *feedback* dan nilai.
- [ ] *String matching* pada backend dapat secara akurat menentukan `start` dan `end` index dari kutipan yang valid.
- [ ] Data *highlight* sukses tersimpan secara persisten di database Supabase.
- [ ] Frontend berhasil menampilkan teks esai dengan *highlight* (warna bervariasi bergantung pada kategori *strong*/*weak*).
- [ ] *Tooltip* berisikan alasan (*reason*) tampil dengan benar saat *highlight* di-hover di frontend.
- [ ] Poin-poin "missing" tergabung di dalam *feedback* umum dan tidak menyebabkan malfungsi rendering.

## Out of Scope
- Fitur untuk mengubah, menambahkan, atau menghapus *highlight* secara manual oleh guru di frontend. (Saat ini hanya untuk membaca *AI-generated highlights*).
- Highlight visual secara langsung pada file *native* seperti PDF atau DOCX. Highlight hanya diterapkan pada hasil ekstraksi teks (raw text) esai siswa.