# Konfigurasi CORS Edge Function

Frontend yang diizinkan:

- `http://localhost:3000`
- `http://localhost:5173`
- `https://adminweding.maulanamalik.my.id`

Jalankan command berikut dari folder `wedding-absen`:

```bash
supabase secrets set \
  ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://adminweding.maulanamalik.my.id \
  --project-ref nemuftsdmjzkzcygkjpg
```

Domain pada `ALLOWED_ORIGINS` tidak memakai `/` di belakang.

Perubahan secret diterapkan ke Edge Function tanpa perlu mengubah source code.
Jika ingin memastikan kedua fungsi tetap memakai source terbaru, jalankan:

```bash
supabase functions deploy send-invitation \
  --project-ref nemuftsdmjzkzcygkjpg

supabase functions deploy send-invitations-bulk \
  --project-ref nemuftsdmjzkzcygkjpg
```

Tes preflight CORS:

```bash
curl -i -X OPTIONS \
  'https://nemuftsdmjzkzcygkjpg.supabase.co/functions/v1/send-invitation' \
  -H 'Origin: https://adminweding.maulanamalik.my.id' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: authorization,apikey,content-type,x-client-info'
```

Hasil yang benar adalah HTTP `200` dan header:

```text
Access-Control-Allow-Origin: https://adminweding.maulanamalik.my.id
```
