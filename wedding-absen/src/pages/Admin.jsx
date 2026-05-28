import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import QRCode from 'qrcode'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { Buffer } from 'buffer'

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [guests, setGuests] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newGuest, setNewGuest] = useState({ nama_tamu: '', alamat_tamu: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [generating, setGenerating] = useState(false)

  // Initialize S3 client
  const s3Client = new S3Client({
    endpoint: import.meta.env.VITE_SUPABASE_STORAGE_ENDPOINT,
    region: import.meta.env.VITE_S3_REGION,
    credentials: {
      accessKeyId: import.meta.env.VITE_S3_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true
  })

  useEffect(() => {
    if (isLoggedIn) {
      fetchGuests()
    }
  }, [isLoggedIn])

  const handleLogin = (e) => {
    e.preventDefault()
    const adminUsername = import.meta.env.VITE_ADMIN_USERNAME
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD

    if (username === adminUsername && password === adminPassword) {
      setIsLoggedIn(true)
      setError(null)
    } else {
      setError('Username atau password salah!')
    }
  }

  const fetchGuests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('data_tamu')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGuests(data || [])
    } catch (err) {
      console.error('Error fetching guests:', err)
      setError('Gagal memuat data tamu')
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async (guest) => {
    setGenerating(true)
    try {
      // Create QR code data
      const qrData = JSON.stringify({
        id: guest.id,
        nama_tamu: guest.nama_tamu,
        alamat_tamu: guest.alamat_tamu
      })

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 500,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      // Convert data URL to buffer
      const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')

      // Upload to Supabase S3 bucket
      const fileName = `wedding-scan/${guest.id}.png`
      const command = new PutObjectCommand({
        Bucket: 'devaq',
        Key: fileName,
        Body: buffer,
        ContentType: 'image/png',
        ACL: 'public-read'
      })

      await s3Client.send(command)

      // Update database
      const { error: updateError } = await supabase
        .from('data_tamu')
        .update({ is_generated: true })
        .eq('id', guest.id)

      if (updateError) throw updateError

      setSuccess(`QR code berhasil dibuat untuk ${guest.nama_tamu}`)
      await fetchGuests()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error generating QR code:', err)
      setError('Gagal generate QR code: ' + err.message)
      setTimeout(() => setError(null), 5000)
    } finally {
      setGenerating(false)
    }
  }

  const generateAllQRCodes = async () => {
    const ungeneratedGuests = guests.filter(g => !g.is_generated)
    if (ungeneratedGuests.length === 0) {
      setError('Semua tamu sudah memiliki QR code')
      setTimeout(() => setError(null), 3000)
      return
    }

    setGenerating(true)
    let successCount = 0
    
    for (const guest of ungeneratedGuests) {
      try {
        await generateQRCode(guest)
        successCount++
      } catch (err) {
        console.error(`Failed to generate QR for guest ${guest.id}:`, err)
      }
    }

    setGenerating(false)
    setSuccess(`Berhasil generate ${successCount} QR code`)
    setTimeout(() => setSuccess(null), 3000)
  }

  const addGuest = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase
        .from('data_tamu')
        .insert([{
          nama_tamu: newGuest.nama_tamu,
          alamat_tamu: newGuest.alamat_tamu,
          hadir: false,
          is_generated: false
        }])

      if (error) throw error

      setNewGuest({ nama_tamu: '', alamat_tamu: '' })
      setShowAddModal(false)
      setSuccess('Tamu berhasil ditambahkan!')
      await fetchGuests()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error adding guest:', err)
      setError('Gagal menambahkan tamu: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteGuest = async (id, nama) => {
    if (!window.confirm(`Hapus tamu ${nama}?`)) return

    try {
      const { error } = await supabase
        .from('data_tamu')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSuccess('Tamu berhasil dihapus!')
      await fetchGuests()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error deleting guest:', err)
      setError('Gagal menghapus tamu')
    }
  }

  const getQRCodeUrl = (id, isGenerated) => {
    if (!isGenerated) return null
    return `https://nemuftsdmjzkzcygkjpg.supabase.co/storage/v1/object/public/devaq/wedding-scan/${id}.png`
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isLoggedIn) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
        <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '2rem' }}>
            🔐 Admin Login
          </h1>
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>Username</label>
              <input
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                required
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>Password</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
              />
            </div>

            {error && (
              <div style={{ background: '#ffe5e5', color: '#ff4757', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }}>
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container" style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', margin: 0 }}>
            👥 Admin Dashboard
          </h1>
          <button 
            className="btn-secondary" 
            onClick={() => setIsLoggedIn(false)}
            style={{ background: 'white' }}
          >
            Logout
          </button>
        </div>

        {/* Action Buttons */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              className="btn-primary" 
              onClick={() => setShowAddModal(true)}
              style={{ flex: '1', minWidth: '200px' }}
            >
              ➕ Tambah Tamu
            </button>
            <button 
              className="btn-primary" 
              onClick={generateAllQRCodes}
              disabled={generating}
              style={{ flex: '1', minWidth: '200px', opacity: generating ? 0.6 : 1 }}
            >
              {generating ? '⏳ Generating...' : '🎫 Generate Semua QR Code'}
            </button>
            <button 
              className="btn-secondary" 
              onClick={fetchGuests}
              style={{ flex: '1', minWidth: '200px' }}
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div style={{ background: '#d4edda', color: '#155724', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', fontWeight: '500' }}>
            ✅ {success}
          </div>
        )}
        {error && (
          <div style={{ background: '#ffe5e5', color: '#ff4757', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', fontWeight: '500' }}>
            ❌ {error}
          </div>
        )}

        {/* Guest Table */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                Loading...
              </div>
            ) : guests.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                Belum ada data tamu
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Tamu</th>
                    <th>Alamat</th>
                    <th>Status</th>
                    <th>Check-in</th>
                    <th>QR Code</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest, index) => (
                    <tr key={guest.id}>
                      <td>{index + 1}</td>
                      <td style={{ fontWeight: '600' }}>{guest.nama_tamu}</td>
                      <td>{guest.alamat_tamu}</td>
                      <td>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '12px', 
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          background: guest.hadir ? '#d4edda' : '#fff3cd',
                          color: guest.hadir ? '#155724' : '#856404'
                        }}>
                          {guest.hadir ? '✅ Hadir' : '⏳ Belum'}
                        </span>
                      </td>
                      <td>{formatDate(guest.checkin)}</td>
                      <td>
                        {guest.is_generated ? (
                          <a 
                            href={getQRCodeUrl(guest.id, guest.is_generated)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <img 
                              src={getQRCodeUrl(guest.id, guest.is_generated)} 
                              alt="QR Code" 
                              className="qr-image"
                            />
                          </a>
                        ) : (
                          <button 
                            className="btn-secondary" 
                            onClick={() => generateQRCode(guest)}
                            disabled={generating}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                          >
                            Generate
                          </button>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn-danger" 
                          onClick={() => deleteGuest(guest.id, guest.nama_tamu)}
                          style={{ padding: '0.5rem 0.75rem' }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem', color: '#333' }}>
              ➕ Tambah Tamu Baru
            </h2>
            
            <form onSubmit={addGuest}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                  Nama Tamu *
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={newGuest.nama_tamu}
                  onChange={(e) => setNewGuest({ ...newGuest, nama_tamu: e.target.value })}
                  placeholder="Masukkan nama tamu"
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
                  Alamat *
                </label>
                <textarea
                  className="input-field"
                  value={newGuest.alamat_tamu}
                  onChange={(e) => setNewGuest({ ...newGuest, alamat_tamu: e.target.value })}
                  placeholder="Masukkan alamat"
                  rows="3"
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1 }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
