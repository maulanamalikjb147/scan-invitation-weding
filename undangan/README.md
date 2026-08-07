# Undangan Maulana & Anisa

Undangan pernikahan digital satu halaman dengan tema **Aurelian Noir**: minimal, editorial, mobile-first, dan menggunakan seluruh foto di folder `assets`.

## Mengganti detail acara

Semua konten utama—tanggal, nama lengkap, keluarga, tempat, Google Maps, dan rekening—berada di `lib/wedding-config.ts`.

## RSVP

RSVP menggunakan Supabase agar dapat berjalan di Netlify:

1. Jalankan `supabase/schema.sql` di SQL Editor Supabase.
2. Salin `.env.example` menjadi `.env.local`.
3. Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Tambahkan kedua variabel tersebut juga pada Environment Variables di Netlify.

## Netlify

- Base directory: kosong
- Build command: `npm run build`
- Publish directory: `.next`
- Functions directory: kosong

## Struktur

- `app/` — halaman utama dan endpoint RSVP
- `app/admin/` — dashboard, scanner QR, dan monitor pengiriman bulk dalam deployment yang sama
- `components/invitation/` — komponen setiap section undangan
- `components/admin/` — komponen pengelolaan tamu dan check-in
- `hooks/` — musik ambient interaktif
- `lib/` — konfigurasi acara dan klien RSVP
- `db/` + `drizzle/` — penyimpanan RSVP bawaan
- `supabase/` — setup alternatif Supabase
- `public/images/` — foto web yang sudah dioptimalkan
