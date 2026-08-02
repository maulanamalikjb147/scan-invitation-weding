import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import QRCode from 'qrcode'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { Buffer } from 'buffer'
import Icon from '../components/Icon'

function Admin() {
  const [guests, setGuests] = useState([])
  const [configTamuDari, setConfigTamuDari] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newGuest, setNewGuest] = useState({ nama_tamu: '', alamat_tamu: '', contact_number: '', tamu_from: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [generating, setGenerating] = useState(false)

  // Bulk add states
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [selectedBulkFrom, setSelectedBulkFrom] = useState('')
  const [bulkGuests, setBulkGuests] = useState([])
  const [loadingTemplate, setLoadingTemplate] = useState(false)
  const [uploadingBulk, setUploadingBulk] = useState(false)
  const [bulkError, setBulkError] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)

  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('isAdminLoggedIn') === 'true'
  })
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [loginError, setLoginError] = useState(null)

  const handleLogin = (e) => {
    e.preventDefault()
    const configUsername = window.env?.VITE_ADMIN_USERNAME || import.meta.env.VITE_ADMIN_USERNAME
    const configPassword = window.env?.VITE_ADMIN_PASSWORD || import.meta.env.VITE_ADMIN_PASSWORD

    if (usernameInput === configUsername && passwordInput === configPassword) {
      setIsLoggedIn(true)
      sessionStorage.setItem('isAdminLoggedIn', 'true')
      setLoginError(null)
    } else {
      setLoginError('Username atau password salah!')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    sessionStorage.removeItem('isAdminLoggedIn')
    setUsernameInput('')
    setPasswordInput('')
  }

  // Search and Pagination states
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 20

  // Filter guests based on search query
  const filteredGuests = guests.filter(guest => {
    const name = guest.nama_tamu?.toLowerCase() || ''
    const address = guest.alamat_tamu?.toLowerCase() || ''
    const contactNumber = guest.contact_number?.toLowerCase() || ''
    const from = guest.tamu_from?.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    return name.includes(query) || address.includes(query) || contactNumber.includes(query) || from.includes(query)
  })

  // Calculate pagination details
  const totalPages = Math.ceil(filteredGuests.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedGuests = filteredGuests.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Reset page to 1 when search query changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  // Initialize S3 client
  const s3Client = new S3Client({
    endpoint: window.env?.VITE_SUPABASE_STORAGE_ENDPOINT || import.meta.env.VITE_SUPABASE_STORAGE_ENDPOINT,
    region: window.env?.VITE_S3_REGION || import.meta.env.VITE_S3_REGION,
    credentials: {
      accessKeyId: window.env?.VITE_S3_ACCESS_KEY_ID || import.meta.env.VITE_S3_ACCESS_KEY_ID,
      secretAccessKey: window.env?.VITE_S3_SECRET_ACCESS_KEY || import.meta.env.VITE_S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true
  })

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

  const fetchConfigTamuDari = async () => {
    try {
      const { data, error } = await supabase
        .from('config_tamu_dari')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      console.log('config_tamu_dari data:', data)
      setConfigTamuDari(data || [])
    } catch (err) {
      console.error('Error fetching config_tamu_dari:', err)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGuests()
    fetchConfigTamuDari()
  }, [])

  const generateQRCode = async (guest) => {
    setGenerating(true)
    try {
      const qrData = JSON.stringify({
        id: guest.id,
        nama_tamu: guest.nama_tamu,
        alamat_tamu: guest.alamat_tamu
      })

      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 500,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')

      const fileName = `wedding-scan/${guest.id}.png`
      const command = new PutObjectCommand({
        Bucket: 'assets-devaq',
        Key: fileName,
        Body: buffer,
        ContentType: 'image/png',
        ACL: 'public-read'
      })

      await s3Client.send(command)

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
          contact_number: newGuest.contact_number || null,
          tamu_from: newGuest.tamu_from || null,
          hadir: null,
          is_generated: false,
          signed_by: null
        }])

      if (error) throw error

      setNewGuest({ nama_tamu: '', alamat_tamu: '', contact_number: '', tamu_from: '' })
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

  const updateManualCheckIn = async (guest, status) => {
    const nextCheckIn = status === 'hadir'
    const payload = {
      hadir: status === '' ? null : nextCheckIn,
      checkin: nextCheckIn ? new Date().toISOString() : null,
      signed_by: status === '' ? null : 'ADMIN'
    }

    const previousGuests = guests
    setGuests(currentGuests => currentGuests.map(item => (
      item.id === guest.id ? { ...item, ...payload } : item
    )))

    try {
      const { error: updateError } = await supabase
        .from('data_tamu')
        .update(payload)
        .eq('id', guest.id)

      if (updateError) throw updateError

      const statusLabel = status === 'hadir' ? 'Hadir' : status === 'tidak_hadir' ? 'Tidak hadir' : 'Belum ditentukan'
      setSuccess(`${guest.nama_tamu} diubah menjadi ${statusLabel}`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error updating manual check-in:', err)
      setGuests(previousGuests)
      setError('Gagal mengubah status check-in: ' + err.message)
      setTimeout(() => setError(null), 5000)
    }
  }

  const getAttendanceStatus = (guest) => {
    if (guest.hadir === true) {
      return { value: 'hadir', label: 'Hadir', badgeClass: 'badge-success' }
    }

    if (guest.hadir === false) {
      return { value: 'tidak_hadir', label: 'Tidak Hadir', badgeClass: 'badge-danger' }
    }

    return { value: '', label: 'Belum', badgeClass: 'badge-pending' }
  }

  const downloadTemplate = async () => {
    try {
      setLoadingTemplate(true)
      const selectedVal = selectedBulkFrom || ''
      const csvContent = `sep=;\nNama tamu;Alamat;Contact Number;Tamu dari\nJohn Doe;Jl. Kebon Jeruk No. 12;6281234567890;${selectedVal}\n`
      const buffer = Buffer.from(csvContent, 'utf-8')
      const fileName = 'wedding-scan/template/template.csv'

      const command = new PutObjectCommand({
        Bucket: 'assets-devaq',
        Key: fileName,
        Body: buffer,
        ContentType: 'text/csv',
        ACL: 'public-read'
      })

      await s3Client.send(command)

      // Trigger download
      const templateUrl = `https://nemuftsdmjzkzcygkjpg.supabase.co/storage/v1/object/public/assets-devaq/wedding-scan/template/template.csv?t=${Date.now()}`
      const link = document.createElement('a')
      link.href = templateUrl
      link.setAttribute('download', 'template.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setSuccess('Template berhasil diunduh!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error generating template:', err)
      setError('Gagal mengunduh template: ' + err.message)
      setTimeout(() => setError(null), 5000)
    } finally {
      setLoadingTemplate(false)
    }
  }

  const handleCsvUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadedFile(file)

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target.result
      try {
        const lines = text.split(/\r?\n/)
        const activeLines = lines.filter(line => line.trim() !== '')
        if (activeLines.length < 2) {
          setBulkError('File CSV kosong atau hanya berisi header.')
          return
        }

        // Detect delimiter and determine start index for parsing data
        let delimiter = '|'
        let startIndex = 1
        let firstLine = activeLines[0]

        if (firstLine.startsWith('sep=')) {
          delimiter = firstLine.substring(4).trim().charAt(0) || ';'
          startIndex = 2
          if (activeLines.length < 3) {
            setBulkError('File CSV kosong atau hanya berisi header.')
            return
          }
        } else {
          if (firstLine.includes('|')) {
            delimiter = '|'
          } else if (firstLine.includes(',')) {
            delimiter = ','
          } else if (firstLine.includes(';')) {
            delimiter = ';'
          }
        }

        const normalizeHeader = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '')
        const headerColumns = activeLines[startIndex - 1].split(delimiter).map(col => normalizeHeader(col.trim()))
        const indexOfHeader = (...names) => {
          const normalizedNames = names.map(normalizeHeader)
          return headerColumns.findIndex(header => normalizedNames.includes(header))
        }

        const nameIndex = indexOfHeader('Nama tamu', 'Nama Tamu', 'nama_tamu', 'Nama')
        const addressIndex = indexOfHeader('Alamat', 'alamat_tamu')
        const contactIndex = indexOfHeader('Contact Number', 'Nomor Kontak', 'No HP', 'No Handphone', 'Telepon', 'Phone')
        const fromIndex = indexOfHeader('Tamu dari', 'tamu_from', 'Dari')

        const parsedGuests = []
        for (let i = startIndex; i < activeLines.length; i++) {
          const columns = activeLines[i].split(delimiter).map(col => col.trim())
          const nama_tamu = columns[nameIndex >= 0 ? nameIndex : 0] || ''
          const alamat_tamu = columns[addressIndex >= 0 ? addressIndex : 1] || ''
          const contact_number = columns[contactIndex >= 0 ? contactIndex : 2] || ''
          let tamu_from = columns[fromIndex >= 0 ? fromIndex : 3] || ''

          if (!nama_tamu) continue

          if (!tamu_from && selectedBulkFrom) {
            tamu_from = selectedBulkFrom
          }

          parsedGuests.push({
            nama_tamu,
            alamat_tamu,
            contact_number: contact_number || null,
            tamu_from: tamu_from || null,
            hadir: null,
            is_generated: false,
            signed_by: null
          })
        }

        if (parsedGuests.length === 0) {
          setBulkError('Tidak ada tamu valid yang ditemukan di file CSV.')
        } else {
          setBulkGuests(parsedGuests)
          setBulkError(null)
        }
      } catch (err) {
        console.error('Error parsing CSV:', err)
        setBulkError('Gagal memproses file CSV: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  const saveBulkGuests = async () => {
    if (bulkGuests.length === 0) return
    setUploadingBulk(true)
    try {
      // Upload the bulk CSV file itself to S3 bucket
      if (uploadedFile) {
        const fileExtension = uploadedFile.name.split('.').pop() || 'csv'
        // Save to /assets-devaq/wedding-scan/template/data/bulk_[timestamp].[ext]
        const s3Key = `wedding-scan/template/data/bulk_${Date.now()}.${fileExtension}`
        const fileBuffer = await uploadedFile.arrayBuffer()

        const uploadCommand = new PutObjectCommand({
          Bucket: 'assets-devaq',
          Key: s3Key,
          Body: Buffer.from(fileBuffer),
          ContentType: uploadedFile.type || 'text/csv',
          ACL: 'public-read'
        })

        await s3Client.send(uploadCommand)
      }

      // Insert guests into database
      const { error: insertError } = await supabase
        .from('data_tamu')
        .insert(bulkGuests)

      if (insertError) throw insertError

      setSuccess(`Berhasil menambahkan ${bulkGuests.length} tamu secara bulk!`)
      setShowBulkModal(false)
      setBulkGuests([])
      setSelectedBulkFrom('')
      setUploadedFile(null)
      await fetchGuests()
      setTimeout(() => setSuccess(null), 4000)
    } catch (err) {
      console.error('Error bulk adding guests:', err)
      setBulkError('Gagal menyimpan data tamu bulk: ' + err.message)
    } finally {
      setUploadingBulk(false)
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
    return `https://nemuftsdmjzkzcygkjpg.supabase.co/storage/v1/object/public/assets-devaq/wedding-scan/${id}.png`
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
      <div className="product-tile-parchment" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-lg)',
        background: 'var(--color-canvas-parchment)'
      }}>
        <div style={{
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          {/* Logo */}
          <div style={{
            marginBottom: 'var(--spacing-lg)',
            color: 'var(--color-ink)'
          }}>
            <Icon name="lock" size={48} />
          </div>

          <h1 className="text-display-md" style={{
            color: 'var(--color-ink)',
            marginBottom: 'var(--spacing-xs)'
          }}>
            Admin
          </h1>

          <p className="text-body" style={{
            color: 'var(--color-ink-muted-48)',
            marginBottom: 'var(--spacing-xxl)'
          }}>
            Masuk untuk mengelola data tamu
          </p>

          {loginError && (
            <div className="toast toast-error" style={{
              marginBottom: 'var(--spacing-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)'
            }}>
              <Icon name="alertCircle" size={16} />
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <input
                type="text"
                className="input-field"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Username"
                required
              />
            </div>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <input
                type="password"
                className="input-field"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              Masuk
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-canvas-parchment)'
    }}>
      {/* Global Nav */}
      <nav style={{
        height: '44px',
        background: 'var(--color-surface-black)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--spacing-lg)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
          <span className="text-nav-link" style={{ color: 'var(--color-on-dark)', fontWeight: 600 }}>
            Wedding Admin
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <button
            className="btn-dark-utility"
            onClick={handleLogout}
            style={{
              fontSize: '12px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Icon name="logout" size={14} />
            Logout
          </button>
        </div>
      </nav>

      {/* Sub Nav */}
      <div style={{
        height: '52px',
        background: 'var(--color-canvas)',
        borderBottom: '1px solid var(--color-hairline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--spacing-lg)',
        position: 'sticky',
        top: '44px',
        zIndex: 99
      }}>
        <h2 className="text-tagline" style={{ color: 'var(--color-ink)' }}>
          Dashboard
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <button
            className="btn-pearl-capsule"
            onClick={fetchGuests}
            style={{
              fontSize: '12px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Icon name="refresh" size={14} />
            Refresh
          </button>
          <button
            className="btn-pearl-capsule"
            onClick={() => {
              setShowBulkModal(true)
              setSelectedBulkFrom('')
              setBulkGuests([])
              setUploadedFile(null)
              setBulkError(null)
            }}
            style={{
              fontSize: '12px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Icon name="upload" size={14} />
            Tambah Tamu Bulk
          </button>
          <button
            className="btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{
              fontSize: '12px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Icon name="plus" size={14} />
            Tambah Tamu
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--spacing-xl) var(--spacing-lg)'
      }}>
        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-xl)'
        }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--rounded-sm)',
              background: 'var(--color-canvas-parchment)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-ink-muted-80)'
            }}>
              <Icon name="users" size={22} />
            </div>
            <div>
              <p className="text-caption" style={{ color: 'var(--color-ink-muted-48)', marginBottom: 'var(--spacing-xxs)' }}>
                Total Tamu
              </p>
              <p className="text-display-md" style={{ color: 'var(--color-ink)', fontSize: '28px' }}>
                {guests.length}
              </p>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--rounded-sm)',
              background: '#d4edda',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#155724'
            }}>
              <Icon name="userCheck" size={22} />
            </div>
            <div>
              <p className="text-caption" style={{ color: 'var(--color-ink-muted-48)', marginBottom: 'var(--spacing-xxs)' }}>
                Hadir
              </p>
              <p className="text-display-md" style={{ color: '#155724', fontSize: '28px' }}>
                {guests.filter(g => g.hadir).length}
              </p>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--rounded-sm)',
              background: 'rgba(0, 102, 204, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}>
              <Icon name="qrCode" size={22} />
            </div>
            <div>
              <p className="text-caption" style={{ color: 'var(--color-ink-muted-48)', marginBottom: 'var(--spacing-xxs)' }}>
                QR Generated
              </p>
              <p className="text-display-md" style={{ color: 'var(--color-primary)', fontSize: '28px' }}>
                {guests.filter(g => g.is_generated).length}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Cari nama tamu, alamat, atau nomor kontak..."
                style={{ paddingLeft: '40px' }}
              />
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-ink-muted-48)',
                display: 'flex'
              }}>
                <Icon name="search" size={16} />
              </span>
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-ink-muted-48)',
                    cursor: 'pointer',
                    padding: 'var(--spacing-xxs)',
                    display: 'flex'
                  }}
                >
                  <Icon name="x" size={16} />
                </button>
              )}
            </div>
            <button
              className="btn-pearl-capsule"
              onClick={generateAllQRCodes}
              disabled={generating}
              style={{
                opacity: generating ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Icon name="qrCode" size={14} />
              {generating ? 'Generating...' : 'Generate Semua QR'}
            </button>
          </div>
        </div>

        {/* Toast Messages */}
        {success && (
          <div className="toast toast-success" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <Icon name="check" size={16} />
            {success}
          </div>
        )}
        {error && (
          <div className="toast toast-error" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <Icon name="alertCircle" size={16} />
            {error}
          </div>
        )}

        {/* Guest Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{
              padding: 'var(--spacing-xxl)',
              textAlign: 'center',
              color: 'var(--color-ink-muted-48)'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '2px solid var(--color-hairline)',
                borderTopColor: 'var(--color-primary)',
                borderRadius: 'var(--rounded-full)',
                animation: 'spin 1s linear infinite',
                margin: '0 auto var(--spacing-sm)'
              }}></div>
              Memuat data...
            </div>
          ) : guests.length === 0 ? (
            <div style={{
              padding: 'var(--spacing-xxl)',
              textAlign: 'center',
              color: 'var(--color-ink-muted-48)'
            }}>
              <div style={{ marginBottom: 'var(--spacing-sm)', display: 'flex', justifyContent: 'center' }}>
                <Icon name="users" size={40} />
              </div>
              Belum ada data tamu
            </div>
          ) : filteredGuests.length === 0 ? (
            <div style={{
              padding: 'var(--spacing-xxl)',
              textAlign: 'center',
              color: 'var(--color-ink-muted-48)'
            }}>
              <div style={{ marginBottom: 'var(--spacing-sm)', display: 'flex', justifyContent: 'center' }}>
                <Icon name="search" size={40} />
              </div>
              Tidak ada data yang cocok dengan "{searchQuery}"
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '48px' }}>No</th>
                    <th>Nama Tamu</th>
                    <th>Alamat</th>
                    <th style={{ width: '150px' }}>Contact Number</th>
                    <th style={{ width: '120px' }}>Tamu dari</th>
                    <th style={{ width: '128px' }}>Status</th>
                    <th style={{ width: '140px' }}>Check-in</th>
                    <th style={{ width: '80px' }}>QR</th>
                    <th style={{ width: '60px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedGuests.map((guest, index) => {
                    const attendance = getAttendanceStatus(guest)

                    return (
                      <tr key={guest.id}>
                        <td className="text-caption" style={{ color: 'var(--color-ink-muted-48)' }}>
                          {startIndex + index + 1}
                        </td>
                        <td>
                          <span className="text-body-strong">{guest.nama_tamu}</span>
                        </td>
                        <td className="text-caption">
                          {guest.alamat_tamu}
                        </td>
                        <td className="text-caption">
                          {guest.contact_number || '-'}
                        </td>
                        <td className="text-caption">
                          {guest.tamu_from || '-'}
                        </td>
                        <td>
                          <select
                            className={`status-select ${attendance.badgeClass}`}
                            value={attendance.value}
                            onChange={(e) => updateManualCheckIn(guest, e.target.value)}
                            aria-label={`Ubah status check-in ${guest.nama_tamu}`}
                          >
                            <option value="">-</option>
                            <option value="hadir">Hadir</option>
                            <option value="tidak_hadir">Tidak Hadir</option>
                          </select>
                        </td>
                        <td className="text-caption" style={{ color: 'var(--color-ink-muted-48)' }}>
                          {formatDate(guest.checkin)}
                          {guest.signed_by ? ` | ${guest.signed_by}` : ''}
                        </td>
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
                              className="btn-pearl-capsule"
                              onClick={() => generateQRCode(guest)}
                              disabled={generating}
                              style={{
                                fontSize: '12px',
                                padding: '4px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Icon name="qrCode" size={12} />
                              Generate
                            </button>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn-icon-circular"
                            onClick={() => deleteGuest(guest.id, guest.nama_tamu)}
                            style={{ width: '32px', height: '32px' }}
                            title="Hapus"
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--spacing-md) var(--spacing-lg)',
              borderTop: '1px solid var(--color-divider-soft)',
              flexWrap: 'wrap',
              gap: 'var(--spacing-sm)'
            }}>
              <button
                className="btn-pearl-capsule"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  opacity: currentPage === 1 ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Icon name="arrowLeft" size={14} />
                Sebelumnya
              </button>

              <span className="text-caption" style={{ color: 'var(--color-ink-muted-48)' }}>
                Halaman {currentPage} dari {totalPages}
              </span>

              <button
                className="btn-pearl-capsule"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  opacity: currentPage === totalPages ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Berikutnya
                <Icon name="arrowRight" size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-xs)' }}>
              <div>
                <h2 className="text-tagline" style={{ color: 'var(--color-ink)' }}>
                  Tambah Tamu Baru
                </h2>
                <p className="text-caption" style={{ color: 'var(--color-ink-muted-48)', marginTop: 'var(--spacing-xxs)' }}>
                  Isi data tamu undangan di bawah ini
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-ink-muted-48)',
                  cursor: 'pointer',
                  padding: 'var(--spacing-xxs)',
                  display: 'flex'
                }}
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            <form onSubmit={addGuest} style={{ marginTop: 'var(--spacing-lg)' }}>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="text-caption-strong" style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-xs)',
                  color: 'var(--color-ink)'
                }}>
                  Nama Tamu
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

              <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <label className="text-caption-strong" style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-xs)',
                  color: 'var(--color-ink)'
                }}>
                  Alamat
                </label>
                <textarea
                  className="textarea-field"
                  value={newGuest.alamat_tamu}
                  onChange={(e) => setNewGuest({ ...newGuest, alamat_tamu: e.target.value })}
                  placeholder="Masukkan alamat"
                  rows="3"
                  required
                />
              </div>

              <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <label className="text-caption-strong" style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-xs)',
                  color: 'var(--color-ink)'
                }}>
                  Contact Number
                </label>
                <input
                  type="tel"
                  className="input-field"
                  value={newGuest.contact_number}
                  onChange={(e) => setNewGuest({ ...newGuest, contact_number: e.target.value })}
                  placeholder="Contoh: 6281234567890"
                />
                <span className="text-fine-print" style={{ color: 'var(--color-ink-muted-48)', marginTop: '4px', display: 'block' }}>
                  Gunakan format 62, tanpa angka 0 di depan atau tanda +.
                </span>
              </div>

              <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <label className="text-caption-strong" style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-xs)',
                  color: 'var(--color-ink)'
                }}>
                  Tamu dari
                </label>
                <select
                  className="input-field"
                  value={newGuest.tamu_from}
                  onChange={(e) => setNewGuest({ ...newGuest, tamu_from: e.target.value })}
                  style={{
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a7a7a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 14px center',
                    paddingRight: '36px'
                  }}
                >
                  <option value="">Pilih opsi</option>
                  {configTamuDari.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
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

      {/* Bulk Add Guest Modal */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-xs)' }}>
              <div>
                <h2 className="text-tagline" style={{ color: 'var(--color-ink)' }}>
                  Tambah Tamu Bulk (CSV)
                </h2>
                <p className="text-caption" style={{ color: 'var(--color-ink-muted-48)', marginTop: 'var(--spacing-xxs)' }}>
                  Unggah file CSV dengan delimiter titik koma (;), koma (,), atau pipa (|)
                </p>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-ink-muted-48)',
                  cursor: 'pointer',
                  padding: 'var(--spacing-xxs)',
                  display: 'flex'
                }}
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              {/* Dropdown config_tamu_dari */}
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="text-caption-strong" style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-xs)',
                  color: 'var(--color-ink)'
                }}>
                  Tamu dari (Default Dropdown)
                </label>
                <select
                  className="input-field"
                  value={selectedBulkFrom}
                  onChange={(e) => setSelectedBulkFrom(e.target.value)}
                  style={{
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a7a7a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 14px center',
                    paddingRight: '36px'
                  }}
                >
                  <option value="">Pilih opsi default</option>
                  {configTamuDari.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <span className="text-fine-print" style={{ color: 'var(--color-ink-muted-48)', marginTop: '4px', display: 'block' }}>
                  Jika kolom "Tamu dari" di CSV kosong, nilai ini akan digunakan sebagai default.
                </span>
              </div>

              {/* Template Download / Action Group */}
              <div style={{
                display: 'flex',
                gap: 'var(--spacing-sm)',
                marginBottom: 'var(--spacing-lg)',
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--color-canvas-parchment)',
                borderRadius: 'var(--rounded-md)',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span className="text-caption-strong" style={{ display: 'block', color: 'var(--color-ink)' }}>
                    Template CSV
                  </span>
                  <span className="text-fine-print" style={{ color: 'var(--color-ink-muted-48)' }}>
                    Unduh file template CSV yang sudah terformat. Contact Number gunakan format 62.
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-pearl-capsule"
                  onClick={downloadTemplate}
                  disabled={loadingTemplate}
                  style={{
                    fontSize: '12px',
                    padding: '8px 14px',
                    backgroundColor: 'var(--color-canvas)',
                    border: '1px solid var(--color-hairline)'
                  }}
                >
                  <Icon name="download" size={14} style={{ marginRight: '6px' }} />
                  {loadingTemplate ? 'Memproses...' : 'Unduh Template'}
                </button>
              </div>

              {/* File Input */}
              <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <label className="text-caption-strong" style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-xs)',
                  color: 'var(--color-ink)'
                }}>
                  Pilih File CSV
                </label>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '80px',
                  border: '2px dashed var(--color-hairline)',
                  borderRadius: 'var(--rounded-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--color-surface-pearl)',
                  transition: 'border-color 0.2s'
                }}>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
                    <Icon name="upload" size={24} style={{ color: 'var(--color-primary)', marginBottom: '4px' }} />
                    <span className="text-caption" style={{ display: 'block', color: 'var(--color-ink-muted-80)' }}>
                      Klik untuk memilih file CSV
                    </span>
                  </div>
                </div>
              </div>

              {/* Bulk Error */}
              {bulkError && (
                <div className="toast toast-error" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-md)' }}>
                  <Icon name="alertCircle" size={16} />
                  {bulkError}
                </div>
              )}

              {/* Preview parsed guests */}
              {bulkGuests.length > 0 && (
                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                  <label className="text-caption-strong" style={{
                    display: 'block',
                    marginBottom: 'var(--spacing-xs)',
                    color: 'var(--color-ink)'
                  }}>
                    Preview Tamu ({bulkGuests.length} ditemukan)
                  </label>
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid var(--color-hairline)',
                    borderRadius: 'var(--rounded-md)',
                    backgroundColor: 'var(--color-surface-pearl)'
                  }}>
                    <table style={{ fontSize: '12px' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '6px 12px' }}>Nama</th>
                          <th style={{ padding: '6px 12px' }}>Alamat</th>
                          <th style={{ padding: '6px 12px' }}>Contact Number</th>
                          <th style={{ padding: '6px 12px' }}>Dari</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkGuests.map((bg, idx) => (
                          <tr key={idx}>
                            <td style={{ padding: '6px 12px', fontWeight: 600 }}>{bg.nama_tamu}</td>
                            <td style={{ padding: '6px 12px', color: 'var(--color-ink-muted-80)' }}>{bg.alamat_tamu}</td>
                            <td style={{ padding: '6px 12px', color: 'var(--color-ink-muted-80)' }}>{bg.contact_number || '-'}</td>
                            <td style={{ padding: '6px 12px' }}>
                              <span className="badge badge-success" style={{ fontSize: '10px', padding: '2px 8px' }}>
                                {bg.tamu_from || '-'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowBulkModal(false)}
                  style={{ flex: 1 }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={saveBulkGuests}
                  disabled={bulkGuests.length === 0 || uploadingBulk}
                  style={{ flex: 1 }}
                >
                  {uploadingBulk ? 'Menyimpan...' : `Simpan (${bulkGuests.length} Tamu)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Admin
