# Sistem Dokumen

![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-Web%20App-4285F4?logo=googleappsscript&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-Database-34A853?logo=googlesheets&logoColor=white)
![Google Drive](https://img.shields.io/badge/Google%20Drive-Storage-4285F4?logo=googledrive&logoColor=white)
![Security](https://img.shields.io/badge/Security-OWASP%20ZAP-success)

**Sistem Dokumen** adalah web-based document management system berbasis Google Apps Script, Google Sheets, dan Google Drive. Project ini menampilkan alur pengelolaan dokumen, autentikasi, role-based access control, dashboard, upload/download, audit history, reset password berbasis OTP, dan preview PDF.

> **Portfolio / Demo Edition**  
> Repository ini adalah versi publik yang dibuat ulang dengan identitas, master data, akun, dan konfigurasi generik. Repository ini **bukan mirror atau backup sistem internal organisasi**.

## Fitur

- Login menggunakan ID Pengguna dan password
- Role `ADMIN` dan `USER`
- Session dengan idle timeout 20 menit
- Rate limiting percobaan login
- Reset password menggunakan OTP melalui email
- Dashboard statistik dokumen dan kapasitas file
- Bank Data dengan filter dan pencarian
- Upload dokumen PDF, Word, Excel, dan PowerPoint
- Public upload flow
- Preview PDF menggunakan PDF.js
- Download dokumen dengan nama file asli
- History / audit trail
- Light/Dark mode
- Validasi format dan ukuran file maksimal 10 MB
- `LockService` untuk operasi tulis
- Konfigurasi rahasia menggunakan Apps Script Script Properties

## Teknologi

- Google Apps Script
- Google Sheets
- Google Drive
- HTML, CSS, JavaScript
- Bootstrap Icons
- PDF.js `4.10.38` legacy build
- OWASP ZAP untuk passive security testing

## Struktur Project

```text
src/
├── Code.gs
├── Bidang.gs
├── index.html
├── Styles.html
├── Landing.html
├── PublicUpload.html
├── Login.html
├── AppShellStart.html
├── Dashboard.html
├── BankData.html
├── AdminUpload.html
├── History.html
├── AppShellEnd.html
├── Modals.html
└── Scripts.html

demo-data/
├── USERS.example.csv
├── BIDANG.example.csv
├── KATEGORI.example.csv
└── SUBKATEGORI.example.csv
```

## Master Data Demo

Konteks internal telah diganti menjadi master data generik:

- Administrasi
- Keuangan
- Operasional

Contoh akun menggunakan domain `example.com` dan identifier dummy.

## Menjalankan Demo di Google Apps Script

1. Buat project Google Apps Script baru.
2. Buat file dengan nama yang sama seperti pada folder `src/` dan salin source masing-masing file.
3. Pastikan `Code.gs` dan `Bidang.gs` disimpan sebagai file script, sedangkan file lainnya sebagai HTML.
4. Jalankan fungsi `setupDemoDatabase()` satu kali dari editor Apps Script. Fungsi ini membuat database Google Sheets demo, folder Google Drive demo, dan Script Properties yang diperlukan.
5. Tambahkan akun dummy pada sheet `USERS`. Struktur contoh tersedia di `demo-data/USERS.example.csv`.
6. Atur password akun menggunakan fungsi `setDemoUserPassword('ID_PENGGUNA', 'password-baru')`.
7. Deploy sebagai Web App sesuai kebijakan akun Google yang digunakan.

> Jangan menyalin nilai `SPREADSHEET_ID`, `ROOT_FOLDER_ID`, `APP_SECRET`, deployment URL, atau data dari environment lain ke repository publik.

## Security

Passive security testing dilakukan menggunakan OWASP ZAP. Pada pengembangan awal, PDF.js versi lama terdeteksi memiliki kerentanan. Versi demo ini menggunakan PDF.js `4.10.38` legacy build dan memuat dokumen dengan `isEvalSupported: false`.

Alert tertentu pada deployment Google Apps Script dapat berasal dari layer Google Apps Script, Google Fonts, atau Google CSP dan tidak selalu berada dalam kontrol source aplikasi.

Lihat juga [`SECURITY.md`](SECURITY.md) dan [`SANITIZATION_REPORT.txt`](SANITIZATION_REPORT.txt).

## Privasi Repository

Repository publik ini tidak memuat:

- nama atau logo instansi
- struktur unit internal organisasi
- data pegawai asli
- ID/NIP asli
- email internal
- password asli
- dokumen organisasi
- nomor dokumen asli
- tanda tangan
- API key / token
- Spreadsheet ID produksi
- folder ID produksi
- deployment URL produksi

## Author

**Kiky**  
GitHub: [@kikyarfi](https://github.com/kikyarfi)

Identitas pembuat juga ditampilkan pada sidebar aplikasi, tepat di atas badge role `ADMIN` / `USER`, serta pada footer aplikasi.

---

> **Sistem Dokumen — Portfolio / Demo Edition**
