# Wedding Absen - Testing Guide

## Test Scenarios

### 1. Admin Login Test
**URL**: http://localhost:3000/admin

**Test Steps**:
1. Navigate to /admin
2. Enter username: `admin`
3. Enter password: `@R00tsys147`
4. Click "Login" button

**Expected Result**: Should redirect to admin dashboard

**Test Invalid Login**:
1. Enter wrong username/password
2. Should show error message: "Username atau password salah!"

---

### 2. Add Guest Test
**Prerequisite**: Logged in as admin

**Test Steps**:
1. Click "Tambah Tamu" button
2. Enter Nama Tamu: "John Doe"
3. Enter Alamat: "Jl. Test No. 123, Jakarta"
4. Click "Simpan"

**Expected Result**: 
- Guest should be added to database
- Success message: "Tamu berhasil ditambahkan!"
- Guest appears in table
- is_generated = false

---

### 3. Generate QR Code Test (Individual)
**Prerequisite**: Guest exists with is_generated = false

**Test Steps**:
1. Find guest in table without QR code
2. Click "Generate" button in QR Code column
3. Wait for generation to complete

**Expected Result**:
- QR code generated and uploaded to Supabase storage
- is_generated updated to true
- QR image appears in table
- Success message shown
- QR accessible at: https://nemuftsdmjzkzcygkjpg.supabase.co/storage/v1/object/public/devaq/wedding-scan/{id}.png

---

### 4. Generate All QR Codes Test
**Prerequisite**: Multiple guests with is_generated = false

**Test Steps**:
1. Click "Generate Semua QR Code" button
2. Wait for all QR codes to generate

**Expected Result**:
- All ungenerated guests get QR codes
- Success message shows count: "Berhasil generate X QR code"
- All QR images appear in table

---

### 5. Delete Guest Test
**Prerequisite**: Guest exists

**Test Steps**:
1. Click delete button (🗑️) next to guest name
2. Confirm deletion in popup
3. Check table

**Expected Result**:
- Guest removed from database
- Success message: "Tamu berhasil dihapus!"
- Guest no longer appears in table

---

### 6. QR Scanner Test
**URL**: http://localhost:3000/

**Test Steps**:
1. Navigate to home page (/)
2. Click "Mulai Scan QR Code"
3. Allow camera access
4. Point camera at generated QR code

**Expected Result**:
- Camera activates
- QR code scanned successfully
- Welcome popup appears with:
  - Guest name
  - Guest address
  - "Enjoy with our wedding! 💕"
- Database updated:
  - hadir = true
  - checkin = current timestamp

---

### 7. Refresh Data Test
**Prerequisite**: Logged in as admin

**Test Steps**:
1. Click "Refresh Data" button

**Expected Result**:
- Guest list refreshes from database
- Latest data displayed

---

### 8. Responsive Design Test

**Test Steps**:
1. Open app on mobile device or resize browser
2. Test all features on different screen sizes

**Expected Result**:
- UI adapts to screen size
- All buttons and forms accessible
- Table scrollable on mobile

---

## Manual Database Verification

### Check Guest Added:
```sql
SELECT * FROM data_tamu ORDER BY created_at DESC LIMIT 5;
```

### Check QR Generated:
```sql
SELECT id, nama_tamu, is_generated FROM data_tamu WHERE is_generated = true;
```

### Check Check-in Status:
```sql
SELECT nama_tamu, hadir, checkin FROM data_tamu WHERE hadir = true;
```

### Reset Test Data:
```sql
-- Reset all guests
UPDATE data_tamu SET hadir = false, checkin = NULL, is_generated = false;

-- Or delete all test data
DELETE FROM data_tamu WHERE nama_tamu LIKE 'Test%';
```

---

## Known Limitations & Notes

1. **Camera Permission**: Scanner requires HTTPS or localhost for camera access
2. **Browser Compatibility**: Best works on Chrome/Safari for QR scanning
3. **QR Code Format**: Must be valid JSON with id, nama_tamu, alamat_tamu
4. **Static Admin Credentials**: Change in .env for production use
5. **S3 Bucket**: Must have `devaq` bucket with `wedding-scan` folder

---

## Troubleshooting

### Issue: Camera not working
**Solution**: 
- Check browser permissions
- Use HTTPS or localhost
- Try different browser

### Issue: QR not generating
**Solution**:
- Check S3 credentials in .env
- Verify bucket exists
- Check console for errors

### Issue: Database not updating
**Solution**:
- Verify Supabase credentials
- Check table exists
- Check network tab for API errors

### Issue: Scanner not detecting QR
**Solution**:
- Ensure good lighting
- Hold QR code steady
- Try printing QR in larger size

---

## Performance Benchmarks

- **QR Generation**: ~500ms per code
- **QR Scan**: ~1-2 seconds
- **Database Query**: <500ms
- **Page Load**: <2 seconds

---

## Security Checklist

- [ ] Admin credentials stored in .env
- [ ] Supabase RLS policies configured
- [ ] QR codes accessible only via public URL
- [ ] No sensitive data in QR code (only ID, name, address)
- [ ] HTTPS in production

---

**Test Status**: Ready for testing
**Last Updated**: 2025
