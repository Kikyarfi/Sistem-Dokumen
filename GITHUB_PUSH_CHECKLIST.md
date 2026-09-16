# GitHub Public Push Checklist

Sebelum push:

- [ ] Tidak ada logo/nama instansi
- [ ] Tidak ada nama unit kerja internal
- [ ] Tidak ada data pegawai asli
- [ ] Tidak ada email internal
- [ ] Tidak ada dokumen organisasi
- [ ] Tidak ada password / API key / token / secret
- [ ] Tidak ada nilai `SPREADSHEET_ID` produksi
- [ ] Tidak ada deployment URL produksi (`script.google.com/macros/s/...`)
- [ ] Screenshot menggunakan data dummy
- [ ] Jalankan secret/identity scan lokal

Contoh scan:

```bash
grep -RniE "<ORGANIZATION_NAME>|<UNIT_NAME>|AKfy|@[A-Za-z0-9.-]+\.go\.id" .
```

Kemudian cek secret generik:

```bash
grep -RniE "(api[_-]?key|secret|password|token|spreadsheet[_-]?id)[[:space:]]*[:=][[:space:]]*['\"][^<]" .
```
