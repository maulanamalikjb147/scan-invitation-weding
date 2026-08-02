import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Icon from '../components/Icon'

const ACTIVE_BATCH_STATUSES = new Set(['creating', 'pending', 'processing'])

const formatDate = (value, includeSeconds = false) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' } : {})
  })
}

const batchStatusLabel = (status) => ({
  creating: 'Membuat batch',
  pending: 'Antrean',
  processing: 'Berjalan',
  completed: 'Selesai',
  failed: 'Gagal',
  cancelled: 'Dibatalkan'
}[status] || status || '-')

const itemStatusLabel = (status) => ({
  pending: 'Menunggu',
  processing: 'Diproses',
  sent: 'Terkirim',
  failed: 'Gagal',
  cancelled: 'Dibatalkan'
}[status] || status || '-')

const statusBadgeClass = (status) => {
  if (['sent', 'completed'].includes(status)) return 'badge-success'
  if (['failed', 'cancelled'].includes(status)) return 'badge-danger'
  return 'badge-pending'
}

const readFunctionError = async (invokeError) => {
  let message = invokeError.message
  try {
    const details = await invokeError.context?.json()
    message = details?.error || message
  } catch {
    // Keep the SDK error when the response body is not JSON.
  }
  return message
}

function BulkInvitations() {
  const [sessionChecked, setSessionChecked] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [senderConfigs, setSenderConfigs] = useState([])
  const [selectedSender, setSelectedSender] = useState('')
  const [delaySeconds, setDelaySeconds] = useState(20)
  const [randomizeDelay, setRandomizeDelay] = useState(true)
  const [eligibleGuests, setEligibleGuests] = useState([])
  const [batches, setBatches] = useState([])
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [batchItems, setBatchItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const syncingBatchIds = useRef(new Set())

  const selectedBatch = useMemo(
    () => batches.find(batch => batch.id === selectedBatchId) || null,
    [batches, selectedBatchId]
  )

  const activeBatchIds = useMemo(
    () => batches.filter(batch => ACTIVE_BATCH_STATUSES.has(batch.status)).map(batch => batch.id),
    [batches]
  )

  const fetchSenderConfigs = useCallback(async () => {
    const { data, error: configError } = await supabase
      .from('config_tamu_dari')
      .select('name, bulk_delay_seconds, bulk_randomize_delay')
      .order('name', { ascending: true })

    if (configError) throw configError
    setSenderConfigs(data || [])
  }, [])

  const fetchBatches = useCallback(async () => {
    const { data, error: batchesError } = await supabase
      .from('invitation_bulk_batches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (batchesError) throw batchesError
    const nextBatches = data || []
    setBatches(nextBatches)
    setSelectedBatchId(current => (
      current && nextBatches.some(batch => batch.id === current)
        ? current
        : nextBatches[0]?.id || ''
    ))
  }, [])

  const fetchBatchItems = useCallback(async (batchId) => {
    if (!batchId) {
      setBatchItems([])
      return
    }

    const { data, error: itemsError } = await supabase
      .from('invitation_bulk_batch_items')
      .select('*')
      .eq('batch_id', batchId)
      .order('position', { ascending: true })

    if (itemsError) throw itemsError
    setBatchItems(data || [])
  }, [])

  const fetchEligibleGuests = useCallback(async (tamuFrom) => {
    if (!tamuFrom) {
      setEligibleGuests([])
      return
    }

    const { data, error: guestsError } = await supabase
      .from('data_tamu')
      .select('id, nama_tamu, contact_number, invitation_status')
      .ilike('tamu_from', tamuFrom)
      .in('invitation_status', ['not_sent', 'failed'])
      .not('contact_number', 'is', null)
      .order('id', { ascending: true })

    if (guestsError) throw guestsError
    setEligibleGuests(data || [])
  }, [])

  const syncBatch = useCallback(async (batchId, showResult = false) => {
    if (!batchId || syncingBatchIds.current.has(batchId)) return
    syncingBatchIds.current.add(batchId)

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('send-invitations-bulk', {
        body: { action: 'status', batchId }
      })

      if (invokeError) throw new Error(await readFunctionError(invokeError))
      await Promise.all([fetchBatches(), fetchBatchItems(batchId)])

      if (showResult) {
        setSuccess(`Status diperbarui: ${data.progress.sent}/${data.progress.total} terkirim`)
        window.setTimeout(() => setSuccess(null), 4000)
      }
    } catch (syncError) {
      console.error(`Bulk batch ${batchId} sync failed:`, syncError)
      if (showResult) {
        setError('Gagal sinkronisasi batch: ' + syncError.message)
        window.setTimeout(() => setError(null), 7000)
      }
    } finally {
      syncingBatchIds.current.delete(batchId)
    }
  }, [fetchBatchItems, fetchBatches])

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setIsLoggedIn(Boolean(session))
      setSessionChecked(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setIsLoggedIn(Boolean(session))
      setSessionChecked(true)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return
    const loadTimer = window.setTimeout(async () => {
      setLoading(true)
      try {
        await Promise.all([fetchSenderConfigs(), fetchBatches()])
      } catch (loadError) {
        console.error('Bulk monitor load failed:', loadError)
        setError('Gagal memuat monitor bulk: ' + loadError.message)
      } finally {
        setLoading(false)
      }
    }, 0)

    return () => window.clearTimeout(loadTimer)
  }, [fetchBatches, fetchSenderConfigs, isLoggedIn])

  useEffect(() => {
    if (!selectedSender) return
    const guestsTimer = window.setTimeout(() => {
      fetchEligibleGuests(selectedSender).catch(guestsError => {
        console.error('Eligible guests load failed:', guestsError)
        setError('Gagal membaca tamu siap kirim: ' + guestsError.message)
      })
    }, 0)
    return () => window.clearTimeout(guestsTimer)
  }, [fetchEligibleGuests, selectedSender])

  useEffect(() => {
    if (!selectedBatchId) return
    const itemsTimer = window.setTimeout(() => {
      fetchBatchItems(selectedBatchId).catch(itemsError => {
        console.error('Batch items load failed:', itemsError)
        setError('Gagal membaca log batch: ' + itemsError.message)
      })
    }, 0)
    return () => window.clearTimeout(itemsTimer)
  }, [fetchBatchItems, selectedBatchId])

  useEffect(() => {
    if (!isLoggedIn) return

    const channel = supabase
      .channel('bulk-invitation-monitor')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invitation_bulk_batches' },
        () => { void fetchBatches() }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invitation_bulk_batch_items' },
        payload => {
          const batchId = payload.new?.batch_id || payload.old?.batch_id
          if (batchId && batchId === selectedBatchId) void fetchBatchItems(batchId)
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [fetchBatchItems, fetchBatches, isLoggedIn, selectedBatchId])

  useEffect(() => {
    if (!isLoggedIn || activeBatchIds.length === 0) return

    activeBatchIds.forEach(batchId => { void syncBatch(batchId) })
    const pollingTimer = window.setInterval(() => {
      activeBatchIds.forEach(batchId => { void syncBatch(batchId) })
    }, 2000)

    return () => window.clearInterval(pollingTimer)
  }, [activeBatchIds, isLoggedIn, syncBatch])

  const handleSenderChange = (event) => {
    const tamuFrom = event.target.value
    const config = senderConfigs.find(item => item.name === tamuFrom)
    setSelectedSender(tamuFrom)
    setDelaySeconds(config?.bulk_delay_seconds || 20)
    setRandomizeDelay(config?.bulk_randomize_delay ?? true)
    setEligibleGuests([])
  }

  const openConfirmation = () => {
    setError(null)
    if (!selectedSender) {
      setError('Pilih Tamu dari terlebih dahulu')
      return
    }
    if (eligibleGuests.length === 0) {
      setError(`Tidak ada tamu ${selectedSender} yang berstatus Belum/Gagal dan memiliki nomor`)
      return
    }
    setShowConfirmModal(true)
  }

  const confirmStartBatch = async () => {
    setStarting(true)
    setError(null)

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('send-invitations-bulk', {
        body: {
          action: 'start',
          tamuFrom: selectedSender,
          delaySeconds: Number(delaySeconds),
          randomizeDelay
        }
      })

      if (invokeError) throw new Error(await readFunctionError(invokeError))
      setShowConfirmModal(false)
      setSelectedBatchId(data.batchId)
      setSuccess(`Batch ${data.tamuFrom} dimulai untuk ${data.totalMessages} nomor`)
      window.setTimeout(() => setSuccess(null), 5000)
      await Promise.all([
        fetchBatches(),
        fetchBatchItems(data.batchId),
        fetchEligibleGuests(selectedSender)
      ])
      void syncBatch(data.batchId)
    } catch (startError) {
      console.error('Bulk invitation start failed:', startError)
      setError('Gagal memulai batch: ' + startError.message)
    } finally {
      setStarting(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const consoleLines = useMemo(() => {
    if (!selectedBatch) return []
    const lines = [
      `[${formatDate(selectedBatch.created_at, true)}] [BATCH] ${selectedBatch.tamu_from} dibuat · ${selectedBatch.total_messages} nomor · jeda ${selectedBatch.delay_seconds}s${selectedBatch.randomize_delay ? ' + acak 0–2s' : ''}`
    ]

    batchItems.forEach(item => {
      const timestamp = item.processed_at || item.updated_at || item.queued_at
      const status = item.status.toUpperCase().padEnd(10, ' ')
      const detail = item.error
        ? ` · ${item.error}`
        : item.message_id
          ? ` · messageId=${item.message_id}`
          : ''
      lines.push(`[${formatDate(timestamp, true)}] [${status}] ${item.guest_name} <${item.contact_number}>${detail}`)
    })

    if (selectedBatch.completed_at) {
      lines.push(`[${formatDate(selectedBatch.completed_at, true)}] [BATCH] ${batchStatusLabel(selectedBatch.status)} · ${selectedBatch.sent_count} terkirim · ${selectedBatch.failed_count} gagal`)
    }
    if (selectedBatch.error) lines.push(`[${formatDate(selectedBatch.last_checked_at, true)}] [ERROR] ${selectedBatch.error}`)
    return lines
  }, [batchItems, selectedBatch])

  if (!sessionChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <span className="text-body">Memeriksa sesi admin...</span>
      </div>
    )
  }

  if (!isLoggedIn) return <Navigate to="/admin" replace />

  return (
    <div className="admin-page" style={{ minHeight: '100vh', background: 'var(--color-canvas-parchment)' }}>
      <nav className="admin-global-nav">
        <span className="text-nav-link" style={{ color: 'var(--color-on-dark)', fontWeight: 600 }}>
          Wedding Admin
        </span>
        <button className="btn-dark-utility admin-nav-button" onClick={handleLogout}>
          <Icon name="logout" size={14} />
          Logout
        </button>
      </nav>

      <div className="admin-sub-nav">
        <div>
          <h2 className="text-tagline" style={{ color: 'var(--color-ink)' }}>Monitor Pengiriman Bulk</h2>
          <p className="text-fine-print" style={{ color: 'var(--color-ink-muted-48)', marginTop: '2px' }}>
            Status OpenWA diperiksa otomatis setiap 2 detik.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
          <Link to="/admin" className="btn-pearl-capsule admin-nav-link">
            <Icon name="arrowLeft" size={14} />
            Dashboard
          </Link>
          <button
            className="btn-pearl-capsule admin-nav-button"
            onClick={() => {
              void fetchBatches()
              activeBatchIds.forEach(batchId => { void syncBatch(batchId, true) })
            }}
          >
            <Icon name="refresh" size={14} />
            Sinkronkan
          </button>
        </div>
      </div>

      <main className="admin-main-content">
        {success && <div className="toast toast-success"><Icon name="check" size={16} /> {success}</div>}
        {error && <div className="toast toast-error"><Icon name="alertCircle" size={16} /> {error}</div>}

        <div className="bulk-monitor-grid">
          <section className="card">
            <h3 className="text-body-strong">Buat Batch Baru</h3>
            <p className="text-fine-print bulk-section-description">
              Pesan dikirim sebagai teks dari tabel invitation_message_templates. QR code tidak disertakan.
            </p>

            <div className="bulk-form-grid">
              <div>
                <label className="text-fine-print bulk-field-label">Tamu dari</label>
                <select className="input-field" value={selectedSender} onChange={handleSenderChange} disabled={starting}>
                  <option value="">Pilih Maulana / Ica</option>
                  {senderConfigs.map(config => (
                    <option key={config.name} value={config.name}>{config.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-fine-print bulk-field-label">Jeda per pesan</label>
                <div className="bulk-delay-field">
                  <input
                    type="number"
                    className="input-field"
                    min="5"
                    max="60"
                    value={delaySeconds}
                    onChange={event => setDelaySeconds(event.target.value)}
                    disabled={starting}
                  />
                  <span>detik</span>
                </div>
              </div>
            </div>

            <div className="bulk-form-actions">
              <label className="text-caption bulk-random-label">
                <input
                  type="checkbox"
                  checked={randomizeDelay}
                  onChange={event => setRandomizeDelay(event.target.checked)}
                  disabled={starting}
                />
                Acak +0–2 detik
              </label>
              <button
                className="btn-primary"
                onClick={openConfirmation}
                disabled={starting || !selectedSender || eligibleGuests.length === 0}
                style={{ opacity: starting || !selectedSender || eligibleGuests.length === 0 ? 0.5 : 1 }}
              >
                <Icon name="send" size={15} />
                Kirim Bulk ({eligibleGuests.length})
              </button>
            </div>
          </section>

          <section className="card bulk-batch-list-card">
            <div className="bulk-card-heading">
              <div>
                <h3 className="text-body-strong">Riwayat Batch</h3>
                <p className="text-fine-print bulk-section-description">Pilih batch untuk melihat log per nomor.</p>
              </div>
              {loading && <span className="badge badge-pending">Memuat...</span>}
            </div>

            <div className="bulk-batch-list">
              {batches.length === 0 && !loading ? (
                <p className="text-caption" style={{ color: 'var(--color-ink-muted-48)' }}>Belum ada batch.</p>
              ) : batches.map(batch => (
                <button
                  key={batch.id}
                  className={`bulk-batch-item ${selectedBatchId === batch.id ? 'is-selected' : ''}`}
                  onClick={() => setSelectedBatchId(batch.id)}
                >
                  <span>
                    <strong>{batch.tamu_from}</strong>
                    <small>{formatDate(batch.created_at)}</small>
                  </span>
                  <span className={`badge ${statusBadgeClass(batch.status)}`}>{batchStatusLabel(batch.status)}</span>
                  <span className="bulk-batch-count">{batch.sent_count}/{batch.total_messages}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {selectedBatch && (
          <>
            <section className="card bulk-progress-card">
              <div className="bulk-card-heading">
                <div>
                  <h3 className="text-body-strong">Batch {selectedBatch.tamu_from}</h3>
                  <p className="text-fine-print bulk-section-description">
                    ID: {selectedBatch.openwa_batch_id} · terakhir dicek {formatDate(selectedBatch.last_checked_at, true)}
                  </p>
                </div>
                <button className="btn-pearl-capsule" onClick={() => void syncBatch(selectedBatch.id, true)}>
                  <Icon name="refresh" size={14} />
                  Sync Sekarang
                </button>
              </div>

              <div className="bulk-progress-summary">
                <span><strong>{selectedBatch.total_messages}</strong><small>Total</small></span>
                <span><strong className="bulk-success-text">{selectedBatch.sent_count}</strong><small>Terkirim</small></span>
                <span><strong>{selectedBatch.pending_count}</strong><small>Menunggu</small></span>
                <span><strong className="bulk-danger-text">{selectedBatch.failed_count}</strong><small>Gagal</small></span>
              </div>

              <div className="bulk-progress-track">
                <div style={{
                  width: `${Math.min(100, ((selectedBatch.sent_count + selectedBatch.failed_count + selectedBatch.cancelled_count) / Math.max(1, selectedBatch.total_messages)) * 100)}%`
                }} />
              </div>

              <div className="bulk-items-table-wrap">
                <table className="bulk-items-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Tamu</th>
                      <th>Nomor</th>
                      <th>Status</th>
                      <th>Waktu</th>
                      <th>Output</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchItems.map(item => (
                      <tr key={item.id}>
                        <td>{item.position + 1}</td>
                        <td><strong>{item.guest_name}</strong></td>
                        <td>{item.contact_number}</td>
                        <td><span className={`badge ${statusBadgeClass(item.status)}`}>{itemStatusLabel(item.status)}</span></td>
                        <td>{formatDate(item.processed_at || item.updated_at, true)}</td>
                        <td className={item.error ? 'bulk-danger-text' : ''}>{item.error || item.message_id || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bulk-console-card">
              <div className="bulk-console-header">
                <span>Console Output · {selectedBatch.tamu_from}</span>
                <span className={`bulk-console-status ${ACTIVE_BATCH_STATUSES.has(selectedBatch.status) ? 'is-live' : ''}`}>
                  {ACTIVE_BATCH_STATUSES.has(selectedBatch.status) ? 'LIVE' : batchStatusLabel(selectedBatch.status).toUpperCase()}
                </span>
              </div>
              <pre>{consoleLines.join('\n')}</pre>
              <details>
                <summary>Raw output OpenWA</summary>
                <pre>{JSON.stringify(selectedBatch.raw_status || {}, null, 2)}</pre>
              </details>
            </section>
          </>
        )}
      </main>

      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => !starting && setShowConfirmModal(false)}>
          <div className="modal-content bulk-confirm-modal" onClick={event => event.stopPropagation()}>
            <div className="bulk-confirm-icon"><Icon name="send" size={24} /></div>
            <h2 className="text-tagline">Konfirmasi Pengiriman Bulk</h2>
            <p className="text-caption bulk-confirm-copy">
              Kirim <strong>{eligibleGuests.length} pesan teks</strong> menggunakan WhatsApp <strong>{selectedSender}</strong>?
            </p>

            <div className="bulk-confirm-summary">
              <span><small>Jeda</small><strong>{delaySeconds} detik</strong></span>
              <span><small>Randomisasi</small><strong>{randomizeDelay ? '+0–2 detik' : 'Tidak'}</strong></span>
              <span><small>Lampiran</small><strong>Tanpa QR</strong></span>
            </div>

            <p className="text-fine-print" style={{ color: 'var(--color-ink-muted-48)' }}>
              Hanya tamu berstatus Belum/Gagal dan memiliki nomor WhatsApp yang masuk antrean. Pesan diambil dari tabel template.
            </p>

            <div className="bulk-confirm-actions">
              <button className="btn-pearl-capsule" onClick={() => setShowConfirmModal(false)} disabled={starting}>
                Batal
              </button>
              <button className="btn-primary" onClick={confirmStartBatch} disabled={starting}>
                <Icon name="send" size={15} />
                {starting ? 'Membuat Batch...' : `Kirim ${eligibleGuests.length} Pesan`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BulkInvitations
