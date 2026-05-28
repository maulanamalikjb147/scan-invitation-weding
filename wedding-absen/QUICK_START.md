# 🚀 Quick Start Guide - Wedding Absen

## Akses Aplikasi

### 🌐 URLs
- **Scanner (Check-in)**: http://localhost:3000/
- **Admin Panel**: http://localhost:3000/admin

---

## 🔐 Login Admin

**URL**: http://localhost:3000/admin

**Credentials**:
- Username: `admin`
- Password: `@R00tsys147`

---

## 📋 Cara Pakai - Admin

### 1. Tambah Tamu
1. Login ke admin panel
2. Klik tombol **"➕ Tambah Tamu"**
3. Isi form:
   - Nama Tamu
   - Alamat
4. Klik **"Simpan"**

### 2. Generate QR Code

**Option A: Generate Satu Per Satu**
1. Cari tamu di table
2. Di kolom "QR Code", klik tombol **"Generate"**
3. Tunggu sampai QR muncul
4. Klik gambar QR untuk download/view

**Option B: Generate Semua Sekaligus**
1. Klik tombol **"🎫 Generate Semua QR Code"**
2. Tunggu proses selesai
3. Semua QR akan muncul di table

### 3. Download QR Code
1. Klik pada gambar QR code di table
2. Klik kanan → "Save Image As"
3. Atau screenshot langsung
4. Share QR ke tamu via WA/Email

### 4. Hapus Tamu
1. Klik tombol **🗑️** di kolom "Actions"
2. Konfirmasi penghapusan
3. Tamu akan dihapus dari database

### 5. Refresh Data
1. Klik tombol **"🔄 Refresh Data"**
2. Data akan dimuat ulang dari database

---

## 📱 Cara Pakai - Tamu (Check-in)

### 1. Buka Scanner
1. Buka URL: http://localhost:3000/
2. Klik tombol **"🎥 Mulai Scan QR Code"**
3. Izinkan akses kamera

### 2. Scan QR Code
1. Arahkan kamera ke QR code
2. Tahan QR code dalam frame
3. Sistem akan otomatis detect dan scan

### 3. Check-in Berhasil
1. Pop-up welcome akan muncul
2. Menampilkan:
   - 🎉 Welcome!
   - Nama tamu
   - 📍 Alamat
   - "Enjoy with our wedding! 💕"
3. Database otomatis update:
   - Status hadir = ✅ Hadir
   - Waktu check-in tercatat

---

## 🎯 Tips & Trik

### Untuk Admin
- Generate QR code sekaligus untuk efisiensi
- Print QR dalam ukuran yang cukup besar (min 5x5 cm)
- Test scan QR sebelum distribute ke tamu
- Backup database secara berkala

### Untuk Tamu
- Pastikan QR code dalam kondisi bagus (tidak rusak/blur)
- Gunakan di tempat dengan pencahayaan cukup
- Jika gagal scan, coba:
  - Jauhkan/dekatkan kamera
  - Pastikan QR code rata (tidak bengkok)
  - Gunakan browser Chrome/Safari

### QR Code Best Practices
- **Format**: PNG, hitam-putih, contrast tinggi
- **Ukuran Print**: Minimal 5x5 cm
- **Ukuran File**: ~10-20 KB per QR
- **Sharing**: Via WhatsApp, Email, atau Print

---

## 📊 Monitoring

### Check Status Tamu
Di admin panel, lihat kolom "Status":
- **✅ Hadir**: Sudah check-in
- **⏳ Belum**: Belum check-in

### Check Waktu Check-in
Lihat kolom "Check-in" untuk timestamp check-in

### Statistik
- Total tamu di table
- Berapa yang sudah generate QR
- Berapa yang sudah check-in

---

## 🛠 Commands

### Start Application
```bash
sudo supervisorctl start wedding-app
```

### Stop Application
```bash
sudo supervisorctl stop wedding-app
```

### Restart Application
```bash
sudo supervisorctl restart wedding-app
```

### Check Status
```bash
sudo supervisorctl status wedding-app
```

### View Logs
```bash
# Output logs
tail -f /var/log/supervisor/wedding-app.out.log

# Error logs
tail -f /var/log/supervisor/wedding-app.err.log
```

---

## ⚠️ Troubleshooting

### Masalah: Camera tidak bisa diakses
**Solusi**:
- Pastikan browser support camera (Chrome/Safari)
- Izinkan camera permission di browser
- Gunakan HTTPS atau localhost
- Coba refresh page atau restart browser

### Masalah: QR tidak ter-generate
**Solusi**:
- Check internet connection
- Verify S3 credentials di .env
- Check browser console untuk error
- Coba restart application

### Masalah: QR tidak bisa di-scan
**Solusi**:
- Pastikan QR code jelas dan tidak blur
- Gunakan pencahayaan yang cukup
- Jangan terlalu dekat/jauh
- Pastikan QR dalam format yang benar

### Masalah: Database tidak update
**Solusi**:
- Check Supabase credentials
- Verify table `data_tamu` exists
- Check network tab di browser
- Verify Supabase service status

---

## 📞 Need Help?

### Log Locations
- Application: `/var/log/supervisor/wedding-app.*.log`
- Browser Console: F12 → Console tab

### Check Service
```bash
sudo supervisorctl status wedding-app
```

### Restart Service
```bash
sudo supervisorctl restart wedding-app
```

---

## ✅ Checklist Sebelum Event

- [ ] Test admin login
- [ ] Add beberapa tamu test
- [ ] Generate QR codes
- [ ] Test scan dengan QR code
- [ ] Verify database updates
- [ ] Print QR codes untuk tamu
- [ ] Test di lokasi event (internet, pencahayaan)
- [ ] Backup database
- [ ] Siapkan device untuk scanning
- [ ] Brief team tentang cara pakai

---

## 🎊 Selamat!

Aplikasi sudah siap digunakan untuk event pernikahan Anda!

**Semoga lancar dan sukses! 💕**

---

**Quick Access**:
- Admin: http://localhost:3000/admin
- Scanner: http://localhost:3000/
- Username: admin
- Password: @R00tsys147
