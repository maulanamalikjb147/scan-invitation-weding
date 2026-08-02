# Wedding Absen - QR Code Check-in System

Sistem absensi pernikahan modern dengan fitur generate dan scan QR code.

## 🎯 Fitur Utama

### 1. Admin Panel (`/admin`)
- **Login Admin**: Email/password melalui Supabase Auth
- **Generate QR Code**: Generate QR code untuk semua tamu atau per tamu
- **Send Invitation**: Kirim QR melalui session OpenWA sesuai `tamu_from`
- **Bulk Invitation**: Kirim maksimal 100 undangan per sender melalui background batch OpenWA dengan delay dan randomisasi
- **Manual Delivery**: Copy teks pesan, ubah status terkirim, dan catat waktu kirim dari dashboard
- **Manajemen Tamu**: Tambah, hapus, dan lihat daftar tamu
- **Dashboard**: Lihat status check-in, QR code, dan detail tamu

### 2. Scanner Page (`/`)
- **Scan QR Code**: Scan QR code tamu menggunakan kamera
- **Auto Check-in**: Otomatis update status hadir dan timestamp check-in
- **Welcome Message**: Tampilan sambutan untuk tamu yang check-in

## 🚀 Tech Stack

- **Frontend**: React + Vite
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage (S3)
- **QR Generation**: qrcode library
- **QR Scanning**: html5-qrcode library

Panduan konfigurasi OpenWA dan Supabase Edge Function tersedia di
[`OPENWA_SETUP.md`](./OPENWA_SETUP.md).

## 📦 Database Schema

**Table**: `data_tamu`

| Column | Type | Description |
|--------|------|-------------|
| id | Primary Key | Auto-generated ID |
| created_at | Timestamp | Waktu dibuat |
| nama_tamu | String | Nama tamu |
| alamat_tamu | String | Alamat tamu |
| hadir | Boolean | Status kehadiran |
| is_generated | Boolean | Status QR code sudah dibuat |
| checkin | Timestamptz | Waktu check-in |

## 🔧 Setup & Installation

### Prerequisites
- Node.js 20+
- Yarn package manager
- Supabase account

### Installation

1. **Install dependencies**:
```bash
cd /app/wedding-absen
yarn install
```

2. **Configure environment variables** (`.env`):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-publishable-key
VITE_SUPABASE_STORAGE_ENDPOINT=deprecated-use-supabase-storage-sdk
VITE_S3_ACCESS_KEY_ID=deprecated-do-not-use-in-browser
VITE_S3_SECRET_ACCESS_KEY=deprecated-do-not-use-in-browser
VITE_S3_REGION=deprecated
VITE_ADMIN_USERNAME=deprecated-use-supabase-auth
VITE_ADMIN_PASSWORD=deprecated-use-supabase-auth
```

3. **Run the app**:
```bash
yarn dev
```

App akan berjalan di `http://localhost:3000`

## 📱 Cara Penggunaan

### Admin Panel

1. **Login**: Buka `/admin` dan login dengan kredensial admin
2. **Tambah Tamu**: Klik "Tambah Tamu" untuk menambahkan tamu baru
3. **Generate QR Code**: 
   - Klik "Generate Semua QR Code" untuk generate semua sekaligus
   - Atau klik tombol "Generate" di setiap baris tamu
4. **Download QR Code**: Klik gambar QR code untuk melihat/download
5. **Hapus Tamu**: Klik ikon 🗑️ untuk menghapus tamu

### Scanner (Check-in)

1. **Buka halaman utama** (`/`)
2. **Klik "Mulai Scan QR Code"**
3. **Arahkan kamera ke QR code** tamu
4. **Sistem otomatis**:
   - Update status `hadir` menjadi `true`
   - Simpan timestamp check-in
   - Tampilkan welcome message dengan nama dan alamat tamu

## 🎨 Fitur UI

- **Modern & Minimalist**: Design Gen-Z style dengan gradient colorful
- **Responsive**: Tampilan optimal di mobile dan desktop
- **Smooth Animations**: Transisi dan animasi yang smooth
- **User Friendly**: Interface yang mudah digunakan

## 📂 Struktur Project

```
wedding-absen/
├── src/
│   ├── pages/
│   │   ├── Admin.jsx      # Admin panel
│   │   └── Scanner.jsx    # QR scanner page
│   ├── App.jsx            # Main app with routing
│   ├── App.css            # Global styles
│   ├── supabaseClient.js  # Supabase configuration
│   └── main.jsx           # Entry point
├── .env                   # Environment variables
├── package.json           # Dependencies
└── vite.config.js         # Vite configuration
```

## 🔐 Security

- Admin login dengan static credentials (bisa diubah di .env)
- QR code disimpan di Supabase storage dengan public access
- Database access menggunakan Supabase authentication

## 📝 Notes

- QR code disimpan di bucket: `devaq/wedding-scan/`
- Format nama file: `{guest_id}.png`
- QR code berisi JSON: `{ id, nama_tamu, alamat_tamu }`
- Scanner hanya menampilkan nama dan alamat, ID untuk update database

## 🐛 Troubleshooting

### Camera tidak bisa diakses
- Pastikan browser memiliki permission untuk camera
- Gunakan HTTPS atau localhost
- Coba browser lain (Chrome/Safari recommended)

### QR Code tidak ter-generate
- Check S3 credentials di .env
- Pastikan bucket `devaq` dan folder `wedding-scan` sudah ada
- Check logs di console

### Database connection error
- Verify Supabase credentials
- Check table `data_tamu` sudah ada
- Check network connection

## 📞 Support

Untuk bantuan lebih lanjut, hubungi admin system.

---

**Made with ❤️ for your special day**
