# 📱 Portal Laporan E-Kinerja Mandiri

Aplikasi pengisian aktivitas kinerja harian mandiri yang cepat, modern, dan sepenuhnya dioptimalkan untuk perangkat mobile (smartphone-first). Terintegrasi langsung dengan **Google Sheets** dan **Google Drive** menggunakan **Google Apps Script** secara aman tanpa memerlukan server backend tambahan (Serverless Client-State).

---

## 🚀 Fitur Unggulan

- **Smartphone-First Interface**: Tampilan menyerupai aplikasi native Android/iOS dengan animasi transisi yang mulus ditenagai `motion`.
- **Google Sheets Integration**: Otomatis menyimpan tanggal, waktu, uraian kinerja, tautan dokumen, dan foto pendukung ke spreadsheet pribadi Anda.
- **Upload Gambar Aman & Efisien (Maks. 5 MB)**: Mengompresi dan mengirimkan foto bukti kegiatan dalam format Base64 secara instan ke Google Drive, lalu otomatis menyematkan link publiknya di Google Sheet Anda.
- **Draf Lokal Otomatis**: Menyimpan entri data terakhir secara lokal jika koneksi terputus (anti-hilang).
- **Panduan Terintegrasi**: Dilengkapi salinan kode Apps Script siap pakai dan petunjuk konfigurasi step-by-step di dalam aplikasi.

---

## 🛠️ Cara Integrasi dengan Google Sheets

Untuk menghubungkan formulir ini ke Google Sheet pribadi Anda, ikuti 8 langkah mudah berikut:

1. **Buat Google Spreadsheet Baru** di Google Drive Anda. Beri nama file (cth: `Laporan E-Kinerja Pegawai`) dan beri nama tab lembar pertama dengan `Sheet1`.
2. **Atur Judul Kolom di Baris 1** sebagai berikut:
   - **Kolom A**: `Tanggal`
   - **Kolom B**: `Waktu`
   - **Kolom C**: `Uraian`
   - **Kolom D**: `Foto`
   - **Kolom E**: `Link`
3. Bukat spreadsheet Anda lalu klik menu **Ekstensi (Extensions)** > **Apps Script** di bagian atas.
4. Salin kode Apps Script yang disediakan di tab **Integrasi** pada aplikasi ini, hapus kode bawaan di dalam editor `Code.gs`, lalu tempelkan. Klik ikon disket untuk menyimpan.
5. Klik tombol biru **Terapkan (Deploy)** di kanan atas > Pilih **Terapkan baru (New deployment)**.
6. Pada jendela konfigurasi yang muncul:
   - Klik ikon roda gigi > pilih jenis **Aplikasi web (Web app)**.
   - Jalankan sebagai (Execute as): **Saya (Email Anda / Me)**.
   - Siapa yang memiliki akses (Who has access): **Siapa saja (Anyone)**.
7. Klik **Terapkan**. Jika diminta persetujuan keamanan, klik **Berikan Akses (Authorize Access)**, pilih akun Google Anda, klik **Lanjutan (Advanced)** di kiri bawah, pilih **Buka Laporan (Tidak Aman)**, lalu klik **Izinkan (Allow)**.
8. Salin URL Aplikasi Web Apps Script yang dihasilkan (berakhiran `/exec`) dan tempelkan ke kolom **Google Apps Script Web App URL** di pengaturan aplikasi Anda!

---

## ⚙️ Cara Memperbaiki Masalah Koneksi dan Deploy (GitHub & Vercel)

Jika Anda mendapatkan error saat melakukan push ke GitHub atau deploy ke Vercel, berikut adalah solusi untuk memperbaikinya:

### 1. Masalah: `"Failed to push commit to GitHub. Please try again."`
Error ini biasanya terjadi karena sesi otorisasi antara Google AI Studio dan akun GitHub Anda telah kedaluwarsa atau tidak memiliki izin tulis (write access) yang cukup pada repositori tersebut.
- **Solusi**: 
  1. Buka menu **Settings** (Pengaturan) di Google AI Studio.
  2. Cari tab **Integrations** atau **GitHub**.
  3. Klik **Disconnect** (Putuskan Koneksi) untuk menghapus sesi lama.
  4. Klik **Connect** (Hubungkan Kembali) lalu lakukan otorisasi ulang. Pastikan memberikan semua izin penulisan kode (repositori publik/privat) yang diminta oleh AI Studio.
  5. Pastikan repositori GitHub tujuan Anda tidak dilindungi oleh aturan cabang (Branch Protection Rules) yang melarang push langsung ke cabang utama (`main`/`master`) tanpa Pull Request.

### 2. Masalah: `"The provided GitHub repository does not contain the requested branch or commit reference. Please ensure the repository is not empty."` di Vercel
Error ini terjadi karena Vercel mencoba membangun aplikasi dari repositori GitHub yang masih **kosong** (0 commits, 0 branches) karena kegagalan push di langkah pertama.
- **Solusi**:
  1. Pastikan Anda telah berhasil melakukan ekspor/push pertama dari Google AI Studio ke repositori GitHub setelah melakukan instalasi ulang koneksi GitHub (Langkah 1).
  2. Buka halaman repositori Anda di GitHub. Bila repositori terdeteksi kosong, buat satu file secara manual di web GitHub (misal membuat file `README.md` atau `.gitignore` dengan mengeklik tombol *"Create a new file"* di halaman utama repositori Anda). Hal ini akan otomatis membuat komit awal dan membentuk cabang default bernama `main`.
  3. Setelah cabang `main` terbentuk, lakukan **Redeploy** (Deploy Ulang) di panel kontrol Vercel Anda, atau hubungkan kembali repositori tersebut. Vercel akan otomatis mendeteksi kode dan melakukan kompilasi dengan lancar.

---

## 💻 Tech Stack & Development

Aplikasi ini dibangun menggunakan teknologi mutakhir tipe Single Page Application (SPA):

- **React 19** & **TypeScript** — Struktur kode terstruktur, modular, aman, dan berkinerja tinggi.
- **Tailwind CSS v4** — Desain modern dengan skema warna indigo-slate yang profesional dan responsive.
- **Vite 6** — Tool build kilat untuk performa render frontend yang optimal.
- **Lucide React** — Set ikon minimalis beresolusi tinggi.
- **Motion (Framer Motion)** — Transisi dan micro-interactions modern berstandar premium.

### Cara Menjalankan Secara Lokal

```bash
# Clone repositori
git clone <url-repositori-github-anda>

# Masuk ke direktori
cd laporan-ekinerja

# Pasang dependensi
npm install

# Jalankan secara lokal (Development mode)
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

---
*Dikembangkan dengan penuh dedikasi sebagai solusi manajemen kinerja pegawai mandiri yang modern.*
