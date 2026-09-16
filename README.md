# 📁 Sistem Dokumen

<p align="center">
  <img src="./docs/images/cover-dashboard.png" alt="Sistem Dokumen Cover" width="100%" />
</p>

<p align="center">
  <b>Web-based Document Management System</b><br>
  A portfolio/demo project for managing internal documents, file archiving, public upload, role-based access, and PDF preview.
</p>

<p align="center">
  <a href="https://github.com/Kikyarfi/Sistem-Dokumen"><img src="https://img.shields.io/badge/repository-public-blue?style=for-the-badge&logo=github" alt="Repository"></a>
  <img src="https://img.shields.io/badge/platform-Google%20Apps%20Script-orange?style=for-the-badge&logo=google" alt="Platform">
  <img src="https://img.shields.io/badge/status-portfolio%20demo-success?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/license-personal-lightgrey?style=for-the-badge" alt="License">
</p>

---

## ✨ About This Project

**Sistem Dokumen** is a web-based document management and correspondence system designed to simplify internal file administration workflows.

This project was developed as a **portfolio/demo edition**, adapted from a real workflow use case and sanitized for public release.  
All organization-specific names, internal configurations, and sensitive data have been removed or replaced with generic placeholders.

### 🎯 Main Goals
- Manage document archive in a structured way
- Support **public file upload** without requiring login
- Provide **role-based access** for Admin and User
- Display document statistics through a simple dashboard
- Enable secure **PDF preview**
- Support **password reset flow with OTP verification**

---

## 🛡️ Portfolio / Demo Notice

> This repository is a **demonstration version** for portfolio purposes.  
> It does **not** contain real internal data, confidential files, employee identities, official organization branding, or production configuration.

Safe for public showcase:
- ✅ source code structure
- ✅ UI/UX implementation
- ✅ role-based logic
- ✅ dashboard, upload, preview, and authentication flow
- ✅ dummy data / demo setup

Removed or sanitized:
- ❌ internal organization identity
- ❌ real employee data / NIP
- ❌ real document files
- ❌ internal emails / access configuration
- ❌ production deployment secrets

---

## 🚀 Key Features

### 1. 🔐 Authentication & Role Management
- Login using **NIP**
- Role-based access:
  - **Admin** → full access
  - **User** → dashboard + document viewing only
- Forgot password with:
  - NIP validation
  - OTP verification
  - reset password link via email

### 2. 📤 Public Upload
- Visitors can upload files without login
- Public uploader fills identity form:
  - NIP
  - Name
  - Unit Kerja
- Upload history is still traceable by admin

### 3. 📂 Document Management
- Upload, manage, and organize documents
- Structured by:
  - **Bidang**
  - **Kategori**
  - **Subkategori**
- Document detail modal
- Download support
- Safer PDF preview flow

### 4. 📊 Dashboard
- Total document statistics
- Summary by bidang
- Monthly trends
- Distribution charts
- Recent activity
- Real-time day/date/time
- Total storage usage

### 5. 📄 PDF Preview
- PDF preview inside the system
- Zoom in / zoom out
- Safer preview approach for better control
- Cleaner viewing experience for users

### 6. 🧾 History & Activity Tracking
- Activity log for uploads and system actions
- Track uploader information
- Role, NIP, Unit Kerja, and activity details
- Useful for admin monitoring

---

## 🖼️ Screenshots

> Save your screenshots inside: `docs/images/`

### Dashboard
<p align="center">
  <img src="./docs/images/dashboard-overview.png" alt="Dashboard Overview" width="90%" />
</p>

### Login Page
<p align="center">
  <img src="./docs/images/login-page.png" alt="Login Page" width="85%" />
</p>

### Public Upload
<p align="center">
  <img src="./docs/images/public-upload.png" alt="Public Upload" width="85%" />
</p>

### Bank Data / Document List
<p align="center">
  <img src="./docs/images/bank-data.png" alt="Bank Data" width="90%" />
</p>

### PDF Preview
<p align="center">
  <img src="./docs/images/pdf-preview.png" alt="PDF Preview" width="90%" />
</p>

### History / Activity Log
<p align="center">
  <img src="./docs/images/history-page.png" alt="History Page" width="90%" />
</p>

---

## 🧱 Project Structure

```bash
Sistem-Dokumen/
├── src/
│   ├── Code.gs
│   ├── Bidang.gs
│   ├── index.html
│   ├── Styles.html
│   ├── Scripts.html
│   ├── Dashboard.html
│   ├── BankData.html
│   ├── PublicUpload.html
│   ├── AdminUpload.html
│   ├── History.html
│   └── Modals.html
├── demo-data/
│   ├── sample-users.csv
│   ├── sample-documents.csv
│   └── sample-history.csv
├── docs/
│   └── images/
│       ├── cover-dashboard.png
│       ├── dashboard-overview.png
│       ├── login-page.png
│       ├── public-upload.png
│       ├── bank-data.png
│       ├── pdf-preview.png
│       └── history-page.png
├── README.md
├── SECURITY.md
├── PORTFOLIO_NOTICE.md
└── GITHUB_PUSH_CHECKLIST.md
