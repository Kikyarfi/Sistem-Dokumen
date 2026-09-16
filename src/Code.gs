// ============================================================
// SISTEM DOKUMEN - PORTFOLIO / DEMO EDITION
// Backend Google Apps Script generik.
// Tidak menyimpan Spreadsheet ID, deployment URL, akun, atau secret produksi.
// ============================================================

const APP_NAME = 'Sistem Dokumen';
const SESSION_SECONDS = 20 * 60;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

const SHEET_USERS = 'USERS';
const SHEET_BERKAS = 'BERKAS';
const SHEET_HISTORY = 'HISTORY';

const BERKAS_HEADERS = [
  'ID_Berkas', 'ID_Bidang', 'Nama_Bidang', 'ID_Kategori', 'Nama_Kategori',
  'ID_Subkategori', 'Nama_Subkategori', 'Nomor_Berkas', 'Tanggal_Berkas',
  'Judul_Berkas', 'Keterangan', 'Nama_File', 'File_ID', 'Sumber',
  'Uploader_ID', 'Uploader_Nama', 'Unit_Kerja', 'Created_At'
];

const HISTORY_HEADERS = [
  'ID_History', 'Waktu', 'Aksi', 'Role', 'Sumber', 'User_ID', 'Nama', 'Email',
  'Unit_Kerja', 'ID_Berkas', 'Judul_Berkas', 'Nama_File', 'Keterangan'
];

const USER_HEADERS = ['ID_User', 'NIP', 'Nama', 'Email', 'Password', 'Role', 'Status'];

function doGet() {
  return HtmlService
    .createTemplateFromFile('index')
    .evaluate()
    .setTitle(APP_NAME);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ============================================================
// DEMO SETUP
// ============================================================

function setupDemoDatabase() {
  const props = PropertiesService.getScriptProperties();
  let spreadsheetId = props.getProperty('SPREADSHEET_ID');
  let ss;

  if (!spreadsheetId) {
    ss = SpreadsheetApp.create('Sistem Dokumen - Demo Database');
    spreadsheetId = ss.getId();
    props.setProperty('SPREADSHEET_ID', spreadsheetId);
  } else {
    ss = SpreadsheetApp.openById(spreadsheetId);
  }

  ensureSheet_(ss, SHEET_USERS, USER_HEADERS);
  ensureSheet_(ss, SHEET_BERKAS, BERKAS_HEADERS);
  ensureSheet_(ss, SHEET_HISTORY, HISTORY_HEADERS);
  setupDemoMasterData();

  let rootFolderId = props.getProperty('ROOT_FOLDER_ID');
  if (!rootFolderId) {
    const folder = DriveApp.createFolder('SISTEM DOKUMEN - DEMO');
    rootFolderId = folder.getId();
    props.setProperty('ROOT_FOLDER_ID', rootFolderId);
  }

  getAppSecret_();

  return {
    success: true,
    spreadsheetId: spreadsheetId,
    rootFolderId: rootFolderId,
    note: 'ID hanya dikembalikan kepada pemilik script saat setup. Jangan commit nilainya ke GitHub.'
  };
}

function setDemoUserPassword(userId, plainPassword) {
  if (!plainPassword || String(plainPassword).length < 8) {
    throw new Error('Password minimal 8 karakter.');
  }

  const ss = getDatabase_();
  const sheet = ensureSheet_(ss, SHEET_USERS, USER_HEADERS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);
  const nipIndex = headers.indexOf('NIP');
  const emailIndex = headers.indexOf('Email');
  const passwordIndex = headers.indexOf('Password');

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][nipIndex] || '').trim() === String(userId || '').trim()) {
      const email = String(values[i][emailIndex] || '').trim().toLowerCase();
      sheet.getRange(i + 1, passwordIndex + 1).setValue('HASH:' + hashPassword_(email, plainPassword));
      return { success: true };
    }
  }
  throw new Error('ID Pengguna tidak ditemukan.');
}

// ============================================================
// DATABASE / CONFIG
// ============================================================

function getDatabase_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID belum dikonfigurasi. Jalankan setupDemoDatabase().');
  return SpreadsheetApp.openById(id);
}

function getRootFolder_() {
  const id = PropertiesService.getScriptProperties().getProperty('ROOT_FOLDER_ID');
  if (!id) throw new Error('ROOT_FOLDER_ID belum dikonfigurasi. Jalankan setupDemoDatabase().');
  return DriveApp.getFolderById(id);
}

function getAppSecret_() {
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty('APP_SECRET');
  if (!secret) {
    secret = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty('APP_SECRET', secret);
  }
  return secret;
}

function sheetObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (!values.length) return [];
  const headers = values[0].map(x => String(x || '').trim());
  return values.slice(1)
    .filter(row => row.some(cell => String(cell || '').trim() !== ''))
    .map(row => headers.reduce((obj, key, i) => {
      obj[key] = normalizeCell_(row[i]);
      return obj;
    }, {}));
}

function normalizeCell_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, Session.getScriptTimeZone() || 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
  return value === null || value === undefined ? '' : value;
}

function now_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
}

function safeText_(value, maxLength) {
  const text = String(value === null || value === undefined ? '' : value).trim();
  return maxLength ? text.slice(0, maxLength) : text;
}

// ============================================================
// AUTHENTICATION
// ============================================================

function loginUser(userId, password) {
  userId = safeText_(userId, 50);
  password = String(password || '');
  if (!userId || !password) throw new Error('ID Pengguna dan password wajib diisi.');

  checkLoginRate_(userId);
  const user = findUserById_(userId);
  if (!user || !isActive_(user.Status)) {
    recordLoginFailure_(userId);
    throw new Error('ID Pengguna atau password tidak sesuai.');
  }

  const stored = String(user.Password || '');
  const expected = 'HASH:' + hashPassword_(String(user.Email || '').toLowerCase(), password);
  if (!stored || stored !== expected) {
    recordLoginFailure_(userId);
    throw new Error('ID Pengguna atau password tidak sesuai.');
  }

  clearLoginFailures_(userId);
  const session = {
    nip: String(user.NIP || ''),
    nama: String(user.Nama || ''),
    email: String(user.Email || ''),
    role: normalizeRole_(user.Role)
  };
  const token = Utilities.getUuid() + Utilities.getUuid();
  CacheService.getScriptCache().put('SESSION:' + token, JSON.stringify(session), SESSION_SECONDS);

  writeHistory_({
    action: 'LOGIN', role: session.role, source: 'INTERNAL', userId: session.nip,
    nama: session.nama, email: session.email, note: 'Login berhasil.'
  });

  return { success: true, token: token, user: session };
}

function getSessionUser(token) {
  return requireLogin_(token);
}

function logoutUser(token) {
  if (token) CacheService.getScriptCache().remove('SESSION:' + token);
  return { success: true };
}

function requireLogin_(token) {
  token = String(token || '').trim();
  if (!token) throw new Error('Sesi tidak valid. Silakan login kembali.');

  const cache = CacheService.getScriptCache();
  const raw = cache.get('SESSION:' + token);
  if (!raw) throw new Error('Sesi telah berakhir. Silakan login kembali.');

  const session = JSON.parse(raw);
  const current = findUserById_(session.nip);
  if (!current || !isActive_(current.Status)) {
    cache.remove('SESSION:' + token);
    throw new Error('Akun tidak aktif atau tidak ditemukan.');
  }

  session.nama = String(current.Nama || '');
  session.email = String(current.Email || '');
  session.role = normalizeRole_(current.Role);
  cache.put('SESSION:' + token, JSON.stringify(session), SESSION_SECONDS);
  return session;
}

function requireAdmin_(token) {
  const user = requireLogin_(token);
  if (user.role !== 'ADMIN') throw new Error('Fitur ini hanya tersedia untuk ADMIN.');
  return user;
}

function findUserById_(userId) {
  const sheet = getDatabase_().getSheetByName(SHEET_USERS);
  if (!sheet) return null;
  const users = sheetObjects_(sheet);
  const needle = String(userId || '').trim();
  return users.find(user => String(user.NIP || '').trim() === needle) || null;
}

function isActive_(value) {
  const status = String(value || '').trim().toUpperCase();
  return status === 'AKTIF' || status === 'ACTIVE';
}

function normalizeRole_(value) {
  return String(value || '').trim().toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';
}

function hashPassword_(email, password) {
  const input = String(email || '').toLowerCase() + '|' + String(password || '') + '|' + getAppSecret_();
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8);
  return digest.map(b => ('0' + ((b + 256) % 256).toString(16)).slice(-2)).join('');
}

function checkLoginRate_(userId) {
  const cache = CacheService.getScriptCache();
  const raw = cache.get('LOGIN_FAIL:' + userId);
  if (!raw) return;
  const data = JSON.parse(raw);
  if (Number(data.count || 0) >= 5) throw new Error('Terlalu banyak percobaan login. Coba kembali beberapa menit lagi.');
}

function recordLoginFailure_(userId) {
  const cache = CacheService.getScriptCache();
  const key = 'LOGIN_FAIL:' + userId;
  const data = JSON.parse(cache.get(key) || '{"count":0}');
  data.count = Number(data.count || 0) + 1;
  cache.put(key, JSON.stringify(data), 10 * 60);
}

function clearLoginFailures_(userId) {
  CacheService.getScriptCache().remove('LOGIN_FAIL:' + userId);
}

// ============================================================
// OTP PASSWORD RESET - DEMO
// ============================================================

function requestPasswordResetOtp(userId) {
  userId = safeText_(userId, 50);
  const user = findUserById_(userId);
  if (!user) throw new Error('ID Pengguna tidak terdaftar.');
  if (!isActive_(user.Status)) throw new Error('Akun tidak aktif.');
  const email = safeText_(user.Email, 320);
  if (!email) throw new Error('Email akun belum tersedia.');

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const key = 'OTP:' + userId;
  const payload = {
    hash: hashOtp_(userId, otp),
    attempts: 0,
    expires: Date.now() + 5 * 60 * 1000
  };
  CacheService.getScriptCache().put(key, JSON.stringify(payload), 5 * 60);

  MailApp.sendEmail({
    to: email,
    subject: 'Kode OTP - Sistem Dokumen',
    htmlBody: '<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">' +
      '<h2>Sistem Dokumen</h2><p>Kode OTP untuk reset password:</p>' +
      '<div style="font-size:30px;font-weight:bold;letter-spacing:8px;padding:18px;background:#f3f5fb;border-radius:12px;text-align:center">' + otp + '</div>' +
      '<p style="color:#666">Kode berlaku selama 5 menit. Abaikan email ini jika Anda tidak meminta reset password.</p>' +
      '<p style="font-size:12px;color:#888">Portfolio / Demo Edition · @kikyarfi</p></div>'
  });

  return { success: true, message: 'OTP telah dikirim ke email akun.' };
}

function resetPasswordWithOtp(userId, otp, newPassword) {
  userId = safeText_(userId, 50);
  otp = safeText_(otp, 6);
  newPassword = String(newPassword || '');
  if (!/^\d{6}$/.test(otp)) throw new Error('OTP harus terdiri dari 6 digit.');
  if (newPassword.length < 8) throw new Error('Password baru minimal 8 karakter.');

  const cache = CacheService.getScriptCache();
  const key = 'OTP:' + userId;
  const raw = cache.get(key);
  if (!raw) throw new Error('OTP tidak tersedia atau sudah kedaluwarsa.');
  const payload = JSON.parse(raw);
  if (Date.now() > Number(payload.expires || 0)) {
    cache.remove(key);
    throw new Error('OTP sudah kedaluwarsa.');
  }
  if (Number(payload.attempts || 0) >= 5) {
    cache.remove(key);
    throw new Error('Batas percobaan OTP telah tercapai.');
  }
  if (payload.hash !== hashOtp_(userId, otp)) {
    payload.attempts = Number(payload.attempts || 0) + 1;
    cache.put(key, JSON.stringify(payload), 5 * 60);
    throw new Error('OTP tidak sesuai.');
  }

  const ss = getDatabase_();
  const sheet = ss.getSheetByName(SHEET_USERS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);
  const nipIndex = headers.indexOf('NIP');
  const emailIndex = headers.indexOf('Email');
  const passwordIndex = headers.indexOf('Password');

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][nipIndex] || '').trim() === userId) {
      const email = String(values[i][emailIndex] || '').trim().toLowerCase();
      sheet.getRange(i + 1, passwordIndex + 1).setValue('HASH:' + hashPassword_(email, newPassword));
      cache.remove(key);
      return { success: true, message: 'Password berhasil diperbarui.' };
    }
  }
  throw new Error('Akun tidak ditemukan.');
}

function hashOtp_(userId, otp) {
  const input = String(userId) + '|' + String(otp) + '|' + getAppSecret_();
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8);
  return Utilities.base64Encode(digest);
}

// ============================================================
// MASTER / BERKAS
// ============================================================

function getMasterData(token) {
  requireLogin_(token);
  return getMasterDataPublic();
}

function getBerkas(token) {
  requireLogin_(token);
  const sheet = getDatabase_().getSheetByName(SHEET_BERKAS);
  return sheet ? sheetObjects_(sheet) : [];
}

function getDashboardData(token, year) {
  requireLogin_(token);
  year = safeText_(year, 4);
  const all = getBerkas(token);
  const data = year ? all.filter(row => String(row.Tanggal_Berkas || '').slice(0, 4) === year) : all;

  const bidang = {};
  BIDANG_MASTER.forEach(item => bidang[item.ID_Bidang] = 0);
  const kategori = {};
  const monthly = {};
  for (let month = 1; month <= 12; month++) monthly[month] = {};

  data.forEach(row => {
    const b = String(row.ID_Bidang || '');
    const k = String(row.ID_Kategori || '');
    bidang[b] = (bidang[b] || 0) + 1;
    kategori[k] = (kategori[k] || 0) + 1;
    const date = String(row.Tanggal_Berkas || '');
    const month = Number(date.slice(5, 7));
    if (month >= 1 && month <= 12) monthly[month][b] = (monthly[month][b] || 0) + 1;
  });

  const years = Array.from(new Set(all.map(row => String(row.Tanggal_Berkas || '').slice(0, 4)).filter(x => /^\d{4}$/.test(x)))).sort().reverse();
  const recent = data.slice().sort((a, b) => String(b.Created_At || '').localeCompare(String(a.Created_At || ''))).slice(0, 8);

  return { total: data.length, bidang, kategori, monthly, years, recent, master: getMasterDataPublic() };
}

function getDashboardStorageSummary(token) {
  requireLogin_(token);
  const rows = getBerkas(token);
  const seen = {};
  let totalBytes = 0;
  let totalFiles = 0;
  let unavailableFiles = 0;

  rows.forEach(row => {
    const id = String(row.File_ID || '').trim();
    if (!id || seen[id]) return;
    seen[id] = true;
    try {
      totalBytes += DriveApp.getFileById(id).getSize();
      totalFiles++;
    } catch (err) {
      unavailableFiles++;
    }
  });

  return { totalBytes, totalFiles, unavailableFiles, totalRows: rows.length };
}

// ============================================================
// UPLOAD / EDIT / DELETE
// ============================================================

function uploadBerkas(token, payload) {
  const user = requireAdmin_(token);
  return withWriteLock_(() => saveBerkas_(payload, {
    source: 'INTERNAL', userId: user.nip, nama: user.nama, email: user.email, role: user.role, unitKerja: ''
  }));
}

function uploadBerkasPublic(payload) {
  const uploader = {
    source: 'PUBLIC',
    userId: safeText_(payload && payload.uploaderId, 50),
    nama: safeText_(payload && payload.uploaderNama, 100),
    email: '',
    role: 'PUBLIC',
    unitKerja: safeText_(payload && payload.unitKerja, 100)
  };
  if (!uploader.userId || !uploader.nama || !uploader.unitKerja) throw new Error('Identitas pengunggah wajib diisi.');
  return withWriteLock_(() => saveBerkas_(payload, uploader));
}

function saveBerkas_(payload, actor) {
  payload = payload || {};
  const master = getMasterDataPublic();
  const bidang = master.bidang.find(x => x.ID_Bidang === safeText_(payload.idBidang, 30));
  const kategori = master.kategori.find(x => x.ID_Kategori === safeText_(payload.idKategori, 30));
  const subkategori = master.subkategori.find(x => x.ID_Subkategori === safeText_(payload.idSubkategori, 30));
  if (!bidang || !kategori || kategori.ID_Bidang !== bidang.ID_Bidang) throw new Error('Bidang atau kategori tidak valid.');

  const nomor = safeText_(payload.nomor, 150);
  const tanggal = safeText_(payload.tanggal, 10);
  const judul = safeText_(payload.judul, 250);
  if (!nomor || !/^\d{4}-\d{2}-\d{2}$/.test(tanggal) || !judul) throw new Error('Nomor, tanggal, dan judul berkas wajib diisi.');

  const file = validateFilePayload_(payload.file);
  const folder = getOrCreateFolderPath_(bidang.Nama_Bidang, kategori.Nama_Kategori, subkategori ? subkategori.Nama_Subkategori : '');
  if (folder.getFilesByName(file.fileName).hasNext()) throw new Error('Nama file yang sama sudah tersedia pada folder tujuan.');

  const blob = Utilities.newBlob(file.bytes, file.mimeType, file.fileName);
  const driveFile = folder.createFile(blob);
  const idBerkas = 'DOC-' + Date.now() + '-' + Utilities.getUuid().slice(0, 8);

  const row = [
    idBerkas, bidang.ID_Bidang, bidang.Nama_Bidang, kategori.ID_Kategori, kategori.Nama_Kategori,
    subkategori ? subkategori.ID_Subkategori : '', subkategori ? subkategori.Nama_Subkategori : '',
    nomor, tanggal, judul, safeText_(payload.keterangan, 1000), file.fileName, driveFile.getId(),
    actor.source, actor.userId, actor.nama, actor.unitKerja, now_()
  ];

  const sheet = ensureSheet_(getDatabase_(), SHEET_BERKAS, BERKAS_HEADERS);
  sheet.appendRow(row);
  writeHistory_({
    action: 'UPLOAD', role: actor.role, source: actor.source, userId: actor.userId,
    nama: actor.nama, email: actor.email, unitKerja: actor.unitKerja,
    idBerkas, judul, fileName: file.fileName, note: 'Upload dokumen.'
  });

  return { success: true, idBerkas, fileName: file.fileName };
}

function deleteBerkas(token, idBerkas) {
  const user = requireAdmin_(token);
  return withWriteLock_(() => {
    const sheet = getDatabase_().getSheetByName(SHEET_BERKAS);
    const values = sheet.getDataRange().getValues();
    const headers = values[0].map(String);
    const idIndex = headers.indexOf('ID_Berkas');
    const fileIdIndex = headers.indexOf('File_ID');
    const titleIndex = headers.indexOf('Judul_Berkas');
    const fileNameIndex = headers.indexOf('Nama_File');

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][idIndex] || '') === String(idBerkas || '')) {
        const fileId = String(values[i][fileIdIndex] || '');
        try { if (fileId) DriveApp.getFileById(fileId).setTrashed(true); } catch (e) {}
        const title = String(values[i][titleIndex] || '');
        const fileName = String(values[i][fileNameIndex] || '');
        sheet.deleteRow(i + 1);
        writeHistory_({ action: 'HAPUS', role: user.role, source: 'INTERNAL', userId: user.nip, nama: user.nama, email: user.email, idBerkas, judul: title, fileName, note: 'Dokumen dihapus.' });
        return { success: true };
      }
    }
    throw new Error('Berkas tidak ditemukan.');
  });
}

function getFilePayload(token, fileId) {
  requireLogin_(token);
  return filePayloadById_(fileId);
}

function filePayloadById_(fileId) {
  const file = DriveApp.getFileById(String(fileId || ''));
  const blob = file.getBlob();
  return {
    name: file.getName(),
    mimeType: blob.getContentType(),
    base64: Utilities.base64Encode(blob.getBytes())
  };
}

function validateFilePayload_(filePayload) {
  if (!filePayload || !filePayload.name || !filePayload.base64) throw new Error('File tidak valid.');
  const fileName = safeText_(filePayload.name, 240);
  if (!fileName || fileName.indexOf('/') >= 0 || fileName.indexOf('\\') >= 0) throw new Error('Nama file tidak valid.');
  const extension = fileName.split('.').pop().toLowerCase();
  if (ALLOWED_FILE_EXTENSIONS.indexOf(extension) < 0) throw new Error('Format file tidak didukung.');
  const bytes = Utilities.base64Decode(filePayload.base64);
  if (bytes.length > MAX_FILE_BYTES) throw new Error('Ukuran file maksimal 10 MB.');
  return { fileName, extension, bytes, mimeType: safeText_(filePayload.mimeType, 120) || 'application/octet-stream' };
}

function getOrCreateFolderPath_(bidang, kategori, subkategori) {
  let folder = getRootFolder_();
  [bidang, kategori, subkategori].filter(Boolean).forEach(name => {
    const found = folder.getFoldersByName(name);
    folder = found.hasNext() ? found.next() : folder.createFolder(name);
  });
  return folder;
}

function withWriteLock_(callback) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Sistem sedang memproses perubahan lain. Silakan coba kembali.');
  try { return callback(); } finally { lock.releaseLock(); }
}

// ============================================================
// HISTORY
// ============================================================

function getHistory(token) {
  requireAdmin_(token);
  const sheet = getDatabase_().getSheetByName(SHEET_HISTORY);
  return sheet ? sheetObjects_(sheet).reverse() : [];
}

function writeHistory_(data) {
  try {
    const sheet = ensureSheet_(getDatabase_(), SHEET_HISTORY, HISTORY_HEADERS);
    sheet.appendRow([
      'HIS-' + Date.now() + '-' + Utilities.getUuid().slice(0, 6), now_(),
      safeText_(data.action, 30), safeText_(data.role, 20), safeText_(data.source, 20),
      safeText_(data.userId, 50), safeText_(data.nama, 100), safeText_(data.email, 320),
      safeText_(data.unitKerja, 100), safeText_(data.idBerkas, 80), safeText_(data.judul, 250),
      safeText_(data.fileName, 240), safeText_(data.note, 500)
    ]);
  } catch (err) {
    console.warn('History tidak dapat ditulis:', err && err.message ? err.message : err);
  }
}
