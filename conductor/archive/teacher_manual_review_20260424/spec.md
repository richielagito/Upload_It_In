# Specification: Teacher Manual Review Text Highlighting

## Overview
Menambahkan fitur *Essay Text Highlighting* pada tampilan ulasan guru (Teacher's view), mengadaptasi fitur serupa yang sebelumnya diterapkan pada *Student view*. Sebuah halaman atau komponen baru `ManualReview` akan dibuat berdasarkan *mockup* HTML yang disediakan, dengan panel esai di sisi kiri dan *sidebar* ulasan (skor, aspek, summary, override, komentar) di sisi kanan.

## Functional Requirements
1. **New ManualReview Component/Page**: Membuat komponen/halaman baru (misalnya `ManualReview.js` atau integrasi di struktur *routing* guru yang sudah ada) yang mengimplementasikan *layout split-view* dari mockup.
2. **Data Integration**: Mengambil data *highlights*, *feedback*, *score*, dan teks esai asli dari backend/database dan melewatinya ke komponen `ManualReview`.
3. **View Toggle (React State)**: Menambahkan *toggle button* untuk beralih antara "Tampilan highlight" dan "Tampilan biasa". Pergantian tampilan ini akan diatur menggunakan *React state*, me-*render* komponen yang sesuai berdasarkan state aktif.
4. **Highlight Rendering**: Menampilkan teks esai dengan elemen *highlight* (berbasis data `start`, `end`, `category`, dan `reason`) pada mode "Tampilan highlight", meniru logika rendering dari *Student view*.
5. **Styling (Mixed)**: Menggunakan Tailwind CSS untuk *layout* utama dan *styling* umum komponen, serta mempertahankan *custom CSS* (global CSS atau CSS modules) spesifik untuk elemen *highlight* dan *tooltip* agar sesuai dengan desain *mockup*.
6. **Tooltip**: Menampilkan *tooltip* berisikan alasan (*reason*) saat *highlight* di-hover oleh guru.

## Non-Functional Requirements
1. **Consistency**: *User Experience* dan *User Interface* harus konsisten dengan *mockup* dan integrasi desain *student view* sebelumnya.
2. **Reusability**: Sedapat mungkin menggunakan kembali logika pemisahan *span* (highlight rendering logic) yang sudah ada di *frontend* jika memungkinkan.

## Acceptance Criteria
- [ ] Terdapat halaman/komponen baru untuk "Manual Review" guru yang dapat diakses.
- [ ] *Layout* halaman memiliki panel kiri (esai) dan panel kanan (*sidebar* evaluasi) sesuai *mockup*.
- [ ] Tombol *toggle* "Tampilan highlight" dan "Tampilan biasa" berfungsi dengan baik dan mengubah *rendering* teks esai.
- [ ] Teks esai di-*render* dengan *highlight* yang benar (warna sesuai kategori) saat "Tampilan highlight" aktif.
- [ ] *Tooltip* berisikan alasan tampil dengan benar saat *highlight* di-*hover*.
- [ ] Tampilan biasa menampilkan teks polos (atau HTML dasar) tanpa *highlight*.

## Out of Scope
- Fitur untuk mengubah, menambahkan, atau menghapus *highlight* secara manual oleh guru di *frontend*. (Saat ini hanya untuk membaca *AI-generated highlights*).
- Perubahan pada *backend span matching* atau ekstrak *highlight* (sudah diselesaikan pada *track* sebelumnya).
