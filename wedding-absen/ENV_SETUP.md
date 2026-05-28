# 🔧 Environment Setup Guide

## Quick Setup

### 1. Copy .env.example ke .env
```bash
cp .env.example .env
```

### 2. File .env sudah berisi credentials yang benar
File `.env.example` sudah berisi semua credentials yang diperlukan. Anda tinggal copy saja!

---

## Environment Variables Explained

### Supabase Configuration
```env
VITE_SUPABASE_URL=https://nemuftsdmjzkzcygkjpg.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_GsJ39jiTlNvyBG69MNxrAQ_kJQu0Cmp
```
- **VITE_SUPABASE_URL**: URL Supabase project Anda
- **VITE_SUPABASE_PUBLISHABLE_KEY**: Public anon key untuk akses database

### Supabase Storage (S3)
```env
VITE_SUPABASE_STORAGE_ENDPOINT=https://nemuftsdmjzkzcygkjpg.storage.supabase.co/storage/v1/s3
VITE_S3_ACCESS_KEY_ID=010b30cde558f2e988cad663b4de2e93
VITE_S3_SECRET_ACCESS_KEY=ef9e4b8b6ad47b7a4d3388f5e6f898dc51cb98c2a20baaaddc7520d8f73194d7
VITE_S3_REGION=ap-northeast-1
```
- **VITE_SUPABASE_STORAGE_ENDPOINT**: Endpoint S3 untuk upload QR codes
- **VITE_S3_ACCESS_KEY_ID**: Access key untuk S3
- **VITE_S3_SECRET_ACCESS_KEY**: Secret key untuk S3
- **VITE_S3_REGION**: Region S3 (ap-northeast-1)

### Admin Credentials
```env
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=@R00tsys147
```
- **VITE_ADMIN_USERNAME**: Username untuk login admin panel
- **VITE_ADMIN_PASSWORD**: Password untuk login admin panel

---

## Database Access (Optional)

Jika Anda perlu akses database secara langsung via psql:

```bash
psql -h db.nemuftsdmjzkzcygkjpg.supabase.co -p 5432 -d postgres -U postgres
```

**Password**: `Y6J.#hFQ.hy5frP`

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
