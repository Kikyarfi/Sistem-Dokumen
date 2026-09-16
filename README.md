# Sistem Dokumen

![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-Web%20App-4285F4?logo=googleappsscript&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-Database-34A853?logo=googlesheets&logoColor=white)
![Google Drive](https://img.shields.io/badge/Google%20Drive-Storage-4285F4?logo=googledrive&logoColor=white)
![Security](https://img.shields.io/badge/Security-OWASP%20ZAP-success)

**Sistem Dokumen** adalah web-based document management system berbasis Google Apps Script, Google Sheets, dan Google Drive. Project ini menampilkan alur pengelolaan dokumen, autentikasi, role-based access control, dashboard, upload/download, audit history, OTP reset password, dan preview PDF.

> **Portfolio / Demo Edition**  
> Repository ini merupakan versi demonstrasi yang telah disanitasi. Tidak ada data, dokumen, kredensial, konfigurasi, struktur organisasi, atau identitas internal dari organisasi tempat project awal dikembangkan.

## Fitur

- Login menggunakan ID Pengguna dan password
- Role `ADMIN` dan `USER`
- Session dengan idle timeout
- Reset password dengan OTP melalui email
- Dashboard statistik dan kapasitas dokumen
- Bank Data dengan filter dan pencarian
- Upload dokumen PDF, Word, Excel, dan PowerPoint
- Preview PDF dengan PDF.js yang telah diperbarui
- Download dokumen dengan nama file asli
- History / audit trail
- Public upload flow
- Light/Dark mode
- Validasi file dan pembatasan ukuran
- Lock dan idempotency untuk operasi tulis

## Teknologi

- Google Apps Script
- Google Sheets
- Google Drive
- HTML, CSS, JavaScript
- Bootstrap Icons / Mazer UI
- PDF.js
- OWASP ZAP untuk passive security testing

## Struktur Demo

```text
src/
├── Code.gs
├── Bidang.gs
├── Dashboard.html
├── BankData.html
├── AdminUpload.html
├── PublicUpload.html
├── History.html
├── Modals.html
└── Scripts.html

demo-data/
├── USERS.example.csv
├── BIDANG.example.csv
├── KATEGORI.example.csv
└── SUBKATEGORI.example.csv
```

## Data Demo

Master data telah diganti menjadi konteks generik:

- Administrasi
- Keuangan
- Operasional

Semua contoh akun menggunakan identitas dummy. Jangan memasukkan database atau dokumen organisasi asli ke repository publik.

## Konfigurasi Rahasia

Project produksi menyimpan konfigurasi melalui **Apps Script Script Properties**. Jangan menulis nilai rahasia langsung pada source code.

Contoh property yang dibutuhkan:

```text
SPREADSHEET_ID=<YOUR_DEMO_SPREADSHEET_ID>
APP_SECRET=<GENERATED_SECRET>
```

Jangan commit nilai aktual tersebut.

## Security

Passive security testing dilakukan menggunakan OWASP ZAP. Salah satu temuan High pada PDF.js versi lama telah ditangani dengan upgrade library dan hardening `isEvalSupported: false`.

> Hasil scan pada hosting Google Apps Script juga dapat menampilkan alert yang berasal dari layer Google/Google Fonts/CSP dan tidak selalu berada dalam kontrol source aplikasi.

## Catatan Portfolio

Project ini dikembangkan sebagai pengalaman pengembangan aplikasi administrasi dokumen selama program magang, kemudian dibuat ulang sebagai **portfolio/demo version** dengan identitas dan data generik.

Tidak ada:

- data pegawai asli
- ID/NIP asli
- email internal
- password asli
- dokumen organisasi
- nomor surat/dokumen asli
- tanda tangan
- API key / token
- Spreadsheet ID produksi
- deployment URL produksi
- logo atau identitas organisasi

## Author

**Kiky**  
GitHub: [@kikyarfi](https://github.com/kikyarfi)

---

> Sistem Dokumen — Portfolio / Demo Edition
