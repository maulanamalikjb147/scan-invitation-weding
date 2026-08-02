# 🔧 Environment Setup Guide

## Quick Setup

### 1. Copy .env.example ke .env
```bash
cp .env.example .env
```

### 2. Isi konfigurasi publik
Isi URL Supabase dan publishable key. Secret OpenWA dan service-role hanya boleh
disimpan sebagai Supabase Edge Function secrets; lihat `OPENWA_SETUP.md`.

---

## Environment Variables Explained

### Supabase Configuration
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-publishable-key
```
- **VITE_SUPABASE_URL**: URL Supabase project Anda
- **VITE_SUPABASE_PUBLISHABLE_KEY**: Public anon key untuk akses database

### Storage dan login admin
Upload QR memakai Supabase Storage SDK dengan session user terautentikasi. Login
admin memakai Supabase Auth. Jangan menambahkan S3 key atau password admin ke
variabel `VITE_*` karena nilainya akan terlihat di browser.

---

## Database Access (Optional)

Jika Anda perlu akses database secara langsung via psql:

```bash
psql -h db.nemuftsdmjzkzcygkjpg.supabase.co -p 5432 -d postgres -U postgres
```

**Password**: gunakan password database dari Supabase Dashboard.

### Useful SQL Queries

**Check table structure:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'data_tamu';
```

**View all guests:**
```sql
SELECT * FROM data_tamu ORDER BY created_at DESC;
```

**Insert test data:**
```sql
INSERT INTO data_tamu (nama_tamu, alamat_tamu, hadir, is_generated)
VALUES ('Test Guest', 'Test Address', false, false);
```

---

## Storage Bucket Setup

### Bucket Name: `devaq`
### Directory: `wedding-scan/`

QR codes akan disimpan dengan format:
```
devaq/wedding-scan/{guest_id}.png
```

Public URL format:
```
https://nemuftsdmjzkzcygkjpg.supabase.co/storage/v1/object/public/devaq/wedding-scan/{guest_id}.png
```

---

## Troubleshooting

### Error: "supabaseUrl is required"
**Solusi**: 
1. Pastikan file `.env` ada di root folder project
2. Pastikan semua environment variables ada
3. Restart development server: `yarn dev`

### Error: "Cannot upload to S3"
**Solusi**:
1. Check S3 credentials di `.env`
2. Pastikan bucket `devaq` exists
3. Pastikan folder `wedding-scan/` exists di bucket
4. Check bucket permissions (public read)

### QR Code tidak muncul
**Solusi**:
1. Generate QR code dulu di admin panel
2. Check browser console untuk errors
3. Verify storage URL accessible

---

## Security Notes

⚠️ **IMPORTANT**: 
- **JANGAN** push file `.env` ke Git repository
- File `.env` sudah ada di `.gitignore`
- Untuk share dengan team, gunakan `.env.example`
- Untuk production, gunakan environment variables di hosting platform

---

## Local Development

1. **Install dependencies**:
   ```bash
   yarn install
   # atau
   bun install
   ```

2. **Copy .env**:
   ```bash
   cp .env.example .env
   ```

3. **Run development server**:
   ```bash
   yarn dev
   # atau
   bun run dev
   ```

4. **Open browser**:
   - Scanner: http://localhost:3000/
   - Admin: http://localhost:3000/admin

---

## Environment Variables Checklist

Sebelum menjalankan aplikasi, pastikan semua variable ini ada di `.env`:

- [ ] VITE_SUPABASE_URL
- [ ] VITE_SUPABASE_PUBLISHABLE_KEY
- [ ] VITE_SUPABASE_STORAGE_ENDPOINT
- [ ] VITE_S3_ACCESS_KEY_ID
- [ ] VITE_S3_SECRET_ACCESS_KEY
- [ ] VITE_S3_REGION
- [ ] VITE_ADMIN_USERNAME
- [ ] VITE_ADMIN_PASSWORD

---

## Need Help?

Check dokumentasi lengkap di:
- `README.md` - Full project documentation
- `QUICK_START.md` - Quick setup guide
- `TESTING.md` - Testing scenarios

---

**Happy Coding! 🎉**
