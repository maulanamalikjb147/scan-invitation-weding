-- Wedding Absen Database Setup & Test Queries
-- Run these queries in Supabase SQL Editor

-- 0. Add manual/QR check-in source column if it does not exist yet
ALTER TABLE data_tamu
ADD COLUMN IF NOT EXISTS signed_by TEXT CHECK (signed_by IN ('USER', 'ADMIN'));

ALTER TABLE data_tamu
ADD COLUMN IF NOT EXISTS contact_number TEXT;

-- 1. Verify table exists and check structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'data_tamu'
ORDER BY ordinal_position;

-- 2. Check current data
SELECT id, nama_tamu, alamat_tamu, contact_number, hadir, signed_by, is_generated, checkin, created_at
FROM data_tamu
ORDER BY created_at DESC;

-- 3. Count guests by status
SELECT 
  COUNT(*) as total_tamu,
  COUNT(CASE WHEN is_generated = true THEN 1 END) as qr_generated,
  COUNT(CASE WHEN hadir = true THEN 1 END) as sudah_checkin,
  COUNT(CASE WHEN hadir = false THEN 1 END) as tidak_hadir,
  COUNT(CASE WHEN hadir IS NULL THEN 1 END) as belum_ditentukan
FROM data_tamu;

-- 4. Insert sample test data (optional)
INSERT INTO data_tamu (nama_tamu, alamat_tamu, hadir, is_generated)
VALUES 
  ('Budi Santoso', 'Jl. Merdeka No. 45, Jakarta Pusat', false, false),
  ('Siti Nurhaliza', 'Jl. Sudirman No. 123, Jakarta Selatan', false, false),
  ('Ahmad Wijaya', 'Jl. Gatot Subroto No. 78, Jakarta Barat', false, false);

-- 5. Check guests without QR code
SELECT id, nama_tamu, alamat_tamu
FROM data_tamu
WHERE is_generated = false OR is_generated IS NULL;

-- 6. Check checked-in guests
SELECT nama_tamu, alamat_tamu, checkin, signed_by
FROM data_tamu
WHERE hadir = true
ORDER BY checkin DESC;

-- 7. Reset test data (use carefully!)
-- UPDATE data_tamu SET hadir = NULL, checkin = NULL, signed_by = NULL, is_generated = false;

-- 8. Delete specific test guest
-- DELETE FROM data_tamu WHERE nama_tamu = 'Test Guest';

-- 9. View recent check-ins (last 24 hours)
SELECT nama_tamu, alamat_tamu, checkin, signed_by
FROM data_tamu
WHERE checkin >= NOW() - INTERVAL '24 hours'
ORDER BY checkin DESC;

-- 10. Statistics query
SELECT 
  DATE(checkin) as tanggal,
  COUNT(*) as jumlah_checkin
FROM data_tamu
WHERE hadir = true
GROUP BY DATE(checkin)
ORDER BY tanggal DESC;
