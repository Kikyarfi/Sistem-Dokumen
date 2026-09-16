// ============================================================
// SISTEM DOKUMEN - PORTFOLIO / DEMO EDITION
// Master data generik. Tidak memuat struktur organisasi asli.
// ============================================================

const BIDANG_MASTER = [
  { ID_Bidang: 'BID001', Nama_Bidang: 'Administrasi' },
  { ID_Bidang: 'BID002', Nama_Bidang: 'Keuangan' },
  { ID_Bidang: 'BID003', Nama_Bidang: 'Operasional' }
];

const KATEGORI_MASTER = [
  ['KATADM001', 'Dokumen Masuk', 'BID001'],
  ['KATADM002', 'Dokumen Keluar', 'BID001'],
  ['KATADM003', 'Surat Tugas', 'BID001'],
  ['KATADM004', 'Undangan', 'BID001'],
  ['KATADM005', 'Dokumen Pendukung', 'BID001'],

  ['KATKEU001', 'Dokumen Anggaran', 'BID002'],
  ['KATKEU002', 'Laporan Keuangan', 'BID002'],
  ['KATKEU003', 'Dokumen Transaksi', 'BID002'],
  ['KATKEU004', 'Dokumen Pembayaran', 'BID002'],
  ['KATKEU005', 'Dokumen Pendukung', 'BID002'],

  ['KATOPS001', 'Pengajuan', 'BID003'],
  ['KATOPS002', 'Laporan Operasional', 'BID003'],
  ['KATOPS003', 'Dokumen Kegiatan', 'BID003'],
  ['KATOPS004', 'Notulen', 'BID003'],
  ['KATOPS005', 'Dokumen Pendukung', 'BID003']
];

const SUBKATEGORI_MASTER = [
  ['SUBOPS001', 'KATOPS001', 'Pengajuan Internal'],
  ['SUBOPS002', 'KATOPS001', 'Pengajuan Eksternal'],
  ['SUBOPS003', 'KATOPS003', 'Kegiatan Rutin'],
  ['SUBOPS004', 'KATOPS003', 'Kegiatan Khusus']
];

const UNIT_KERJA_PUBLIC = [
  'Administrasi',
  'Keuangan',
  'Operasional',
  'Sumber Daya Manusia',
  'Teknologi Informasi',
  'Manajemen',
  'Layanan Umum'
];

function setupDemoMasterData() {
  const ss = getDatabase_();

  const bidang = ensureSheet_(ss, 'BIDANG', ['ID_Bidang', 'Nama_Bidang']);
  const kategori = ensureSheet_(ss, 'KATEGORI', ['ID_Kategori', 'Nama_Kategori', 'ID_Bidang']);
  const subkategori = ensureSheet_(ss, 'SUBKATEGORI', ['ID_Subkategori', 'ID_Kategori', 'Nama_Subkategori']);

  replaceDataRows_(bidang, BIDANG_MASTER.map(x => [x.ID_Bidang, x.Nama_Bidang]));
  replaceDataRows_(kategori, KATEGORI_MASTER);
  replaceDataRows_(subkategori, SUBKATEGORI_MASTER);

  return {
    success: true,
    message: 'Master data demo berhasil dibuat.',
    bidang: BIDANG_MASTER.length,
    kategori: KATEGORI_MASTER.length,
    subkategori: SUBKATEGORI_MASTER.length
  };
}

function getMasterDataPublic() {
  const bidang = BIDANG_MASTER.map(x => ({ ...x }));
  const kategori = KATEGORI_MASTER.map(row => ({
    ID_Kategori: row[0],
    Nama_Kategori: row[1],
    ID_Bidang: row[2]
  }));
  const subkategori = SUBKATEGORI_MASTER.map(row => ({
    ID_Subkategori: row[0],
    ID_Kategori: row[1],
    Nama_Subkategori: row[2]
  }));

  return {
    bidang,
    kategori,
    subkategori,
    unitKerja: UNIT_KERJA_PUBLIC.slice()
  };
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    const current = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0];
    headers.forEach((header, index) => {
      if (String(current[index] || '').trim() !== header) {
        sheet.getRange(1, index + 1).setValue(header);
      }
    });
  }
  return sheet;
}

function replaceDataRows_(sheet, rows) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  if (rows.length) sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}
