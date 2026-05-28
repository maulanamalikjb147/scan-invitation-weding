# Test Credentials for Wedding Absen System

## Admin Login
- **Username**: admin
- **Password**: @R00tsys147
- **URL**: /admin

## Database Connection
- **Host**: db.nemuftsdmjzkzcygkjpg.supabase.co
- **Port**: 5432
- **Database**: postgres
- **User**: postgres
- **Password**: Y6J.#hFQ.hy5frP

## Supabase Configuration
- **URL**: https://nemuftsdmjzkzcygkjpg.supabase.co
- **Publishable Key**: sb_publishable_GsJ39jiTlNvyBG69MNxrAQ_kJQu0Cmp

## S3 Storage (Supabase)
- **Endpoint**: https://nemuftsdmjzkzcygkjpg.storage.supabase.co/storage/v1/s3
- **Bucket**: devaq
- **Directory**: wedding-scan
- **Access Key ID**: 010b30cde558f2e988cad663b4de2e93
- **Secret Access Key**: ef9e4b8b6ad47b7a4d3388f5e6f898dc51cb98c2a20baaaddc7520d8f73194d7
- **Region**: ap-northeast-1

## Test Guests (to be added via admin panel)
You can add test guests using the admin panel:
1. Login to /admin
2. Click "Tambah Tamu"
3. Add guest details

## QR Code Access
QR codes are stored at:
`https://nemuftsdmjzkzcygkjpg.supabase.co/storage/v1/object/public/devaq/wedding-scan/{guest_id}.png`

## Notes
- Table `data_tamu` already exists in database
- QR scanner page accessible at root URL `/`
- Admin panel accessible at `/admin`
