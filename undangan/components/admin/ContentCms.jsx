"use client"
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { defaultWeddingContent, mergeWeddingContent } from '@/lib/wedding-content'
import { supabase } from './supabaseClient'
import Icon from './Icon'

const ASSET_BUCKET = 'wedding-assets'
const ASSET_PREFIX = 'cms'

const sections = [
  { id: 'main', label: 'Utama', icon: 'grid' },
  { id: 'couple', label: 'Mempelai', icon: 'users' },
  { id: 'event', label: 'Acara', icon: 'calendar' },
  { id: 'gift', label: 'Gift', icon: 'copy' },
  { id: 'photos', label: 'Foto Page', icon: 'camera' },
  { id: 'gallery', label: 'Galeri', icon: 'upload' },
  { id: 'assets', label: 'Assets', icon: 'download' },
]

const imageFields = [
  ['cover', 'Cover Buka Undangan'],
  ['desktopSide', 'Foto Desktop Kiri'],
  ['hero', 'Hero Undangan'],
  ['coupleBackdrop', 'Background Mempelai'],
  ['eventBackdrop', 'Background Acara'],
  ['galleryBackdrop', 'Background Galeri'],
  ['giftBackdrop', 'Background Gift'],
  ['footer', 'Footer'],
]

const inputStyle = { minHeight: 42 }
const gridStyle = { display: 'grid', gap: 'var(--spacing-md)', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }

function fileExt(name) {
  const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : 'jpg'
  return ext || 'jpg'
}

function safeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '')
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <label style={{ display: 'grid', gap: '6px' }}>
      <span className="text-caption" style={{ color: 'var(--color-ink-muted-64)' }}>{label}</span>
      <input
        type={type}
        className="input-field"
        value={value || ''}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        style={inputStyle}
      />
    </label>
  )
}

function TextArea({ label, value, onChange, rows = 3 }) {
  return (
    <label style={{ display: 'grid', gap: '6px' }}>
      <span className="text-caption" style={{ color: 'var(--color-ink-muted-64)' }}>{label}</span>
      <textarea
        className="input-field"
        value={value || ''}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        style={{ minHeight: rows * 26, resize: 'vertical' }}
      />
    </label>
  )
}

function SectionCard({ title, children, action }) {
  return (
    <section className="card" style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-md)', alignItems: 'center', flexWrap: 'wrap' }}>
        <h2 className="text-tagline" style={{ color: 'var(--color-ink)' }}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export default function ContentCms() {
  const [content, setContent] = useState(defaultWeddingContent)
  const [assets, setAssets] = useState([])
  const [activeSection, setActiveSection] = useState('main')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingKey, setUploadingKey] = useState('')
  const [message, setMessage] = useState(null)

  const selectedSection = useMemo(
    () => sections.find(section => section.id === activeSection) || sections[0],
    [activeSection]
  )

  const update = (path, value) => {
    setContent(current => {
      const next = structuredClone(current)
      let target = next
      path.slice(0, -1).forEach(key => { target = target[key] })
      target[path[path.length - 1]] = value
      return next
    })
  }

  const updateArrayItem = (key, index, field, value) => {
    setContent(current => {
      const next = structuredClone(current)
      next[key][index] = { ...next[key][index], [field]: value }
      return next
    })
  }

  const addArrayItem = (key, item) => {
    setContent(current => ({ ...current, [key]: [...current[key], item] }))
  }

  const removeArrayItem = (key, index) => {
    setContent(current => ({ ...current, [key]: current[key].filter((_, itemIndex) => itemIndex !== index) }))
  }

  const loadAssets = async () => {
    const { data, error } = await supabase
      .from('wedding_cms_assets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    setAssets(data || [])
  }

  const loadContent = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const { data, error } = await supabase
        .from('wedding_cms_settings')
        .select('content')
        .eq('id', 'default')
        .maybeSingle()

      if (error) throw error
      setContent(mergeWeddingContent(data?.content))
      await loadAssets()
    } catch (err) {
      console.error('CMS load failed:', err)
      setContent(defaultWeddingContent)
      setMessage({ type: 'error', text: 'CMS belum siap. Jalankan migration wedding_cms di Supabase, lalu refresh.' })
    } finally {
      setLoading(false)
    }
  }

  const saveContent = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('wedding_cms_settings')
        .upsert({
          id: 'default',
          content,
          updated_at: new Date().toISOString(),
          updated_by: userData.user?.id || null,
        })

      if (error) throw error
      setMessage({ type: 'success', text: 'Konten undangan berhasil disimpan.' })
    } catch (err) {
      console.error('CMS save failed:', err)
      setMessage({ type: 'error', text: 'Gagal menyimpan CMS: ' + err.message })
    } finally {
      setSaving(false)
    }
  }

  const insertAssetRecord = async ({ path, file, publicUrl, role, label }) => {
    const { data: userData } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('wedding_cms_assets')
      .insert({
        bucket_id: ASSET_BUCKET,
        storage_path: path,
        public_url: publicUrl,
        role,
        label,
        alt_text: label,
        file_name: file.name,
        content_type: file.type || 'image/jpeg',
        size_bytes: file.size,
        created_by: userData.user?.id || null,
      })
      .select()
      .single()

    if (error) throw error
    setAssets(current => [data, ...current])
    return data
  }

  const uploadImage = async (file, key, label) => {
    if (!file) return
    setUploadingKey(key)
    setMessage(null)
    try {
      const path = `${ASSET_PREFIX}/${key}/${Date.now()}-${crypto.randomUUID()}.${fileExt(safeName(file.name))}`
      const { error } = await supabase.storage
        .from(ASSET_BUCKET)
        .upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false })

      if (error) throw error
      const { data } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(path)
      const asset = await insertAssetRecord({
        path,
        file,
        publicUrl: data.publicUrl,
        role: key,
        label,
      })

      if (key === 'gallery') {
        addArrayItem('gallery', { src: asset.public_url, alt: asset.alt_text || `Momen prewedding ${content.shortNames}` })
      } else {
        update(['images', key], asset.public_url)
      }
      setMessage({ type: 'success', text: 'Asset berhasil diupload. Klik Simpan CMS untuk menerapkan ke undangan.' })
    } catch (err) {
      console.error('CMS upload failed:', err)
      setMessage({ type: 'error', text: 'Gagal upload asset: ' + err.message })
    } finally {
      setUploadingKey('')
    }
  }

  const useAssetForImage = (asset, key) => {
    if (key === 'gallery') {
      addArrayItem('gallery', { src: asset.public_url, alt: asset.alt_text || asset.label || `Momen prewedding ${content.shortNames}` })
      setActiveSection('gallery')
    } else {
      update(['images', key], asset.public_url)
      setActiveSection('photos')
    }
    setMessage({ type: 'success', text: 'Asset dipilih. Klik Simpan CMS untuk menerapkan.' })
  }

  useEffect(() => {
    void loadContent()
  }, [])

  const renderSection = () => {
    if (activeSection === 'main') {
      return (
        <SectionCard title="Konten Utama">
          <div style={gridStyle}>
            <Field label="Nama Singkat" value={content.shortNames} onChange={(value) => update(['shortNames'], value)} />
            <Field label="Tanggal ISO" value={content.date} onChange={(value) => update(['date'], value)} placeholder="2026-09-26T08:00:00+07:00" />
            <Field label="Label Tanggal" value={content.dateLabel} onChange={(value) => update(['dateLabel'], value)} />
            <Field label="Hashtag" value={content.hashtag} onChange={(value) => update(['hashtag'], value)} />
            <Field label="Google Maps URL" value={content.mapsUrl} onChange={(value) => update(['mapsUrl'], value)} />
          </div>
        </SectionCard>
      )
    }

    if (activeSection === 'couple') {
      return (
        <SectionCard title="Mempelai">
          <div style={gridStyle}>
            {['bride', 'groom'].map(role => (
              <div key={role} className="card-parchment" style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
                <p className="text-body-strong" style={{ color: 'var(--color-ink)' }}>{role === 'bride' ? 'Mempelai Wanita' : 'Mempelai Pria'}</p>
                <Field label="Nama Panggilan" value={content[role].shortName} onChange={(value) => update([role, 'shortName'], value)} />
                <Field label="Nama Lengkap" value={content[role].fullName} onChange={(value) => update([role, 'fullName'], value)} />
                <TextArea label="Orang Tua" value={content[role].parents} onChange={(value) => update([role, 'parents'], value)} />
                {content[role].image && <img src={content[role].image} alt="" style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: 6, border: '1px solid var(--color-hairline)' }} />}
                <Field label="URL Foto" value={content[role].image} onChange={(value) => update([role, 'image'], value)} />
              </div>
            ))}
          </div>
        </SectionCard>
      )
    }

    if (activeSection === 'event') {
      return (
        <SectionCard title="Acara">
          {(content.events || []).map((event, index) => (
            <div key={`event-${index}`} style={gridStyle}>
              <Field label="Jenis Acara" value={event.type} onChange={(value) => updateArrayItem('events', index, 'type', value)} />
              <Field label="Waktu" value={event.time} onChange={(value) => updateArrayItem('events', index, 'time', value)} />
              <Field label="Venue" value={event.venue} onChange={(value) => updateArrayItem('events', index, 'venue', value)} />
              <TextArea label="Alamat" value={event.address} onChange={(value) => updateArrayItem('events', index, 'address', value)} />
            </div>
          ))}
        </SectionCard>
      )
    }

    if (activeSection === 'gift') {
      return (
        <SectionCard
          title="Gift / Rekening"
          action={<button className="btn-pearl-capsule" onClick={() => addArrayItem('gifts', { bank: 'Rekening', number: '', owner: '' })}>Tambah Rekening</button>}
        >
          <div style={gridStyle}>
            {content.gifts.map((gift, index) => (
              <div key={`gift-${index}`} className="card-parchment" style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
                <Field label="Label" value={gift.bank} onChange={(value) => updateArrayItem('gifts', index, 'bank', value)} />
                <Field label="Nomor" value={gift.number} onChange={(value) => updateArrayItem('gifts', index, 'number', value)} />
                <Field label="Pemilik" value={gift.owner} onChange={(value) => updateArrayItem('gifts', index, 'owner', value)} />
                <button className="btn-pearl-capsule" onClick={() => removeArrayItem('gifts', index)} style={{ justifySelf: 'start' }}>Hapus</button>
              </div>
            ))}
          </div>
        </SectionCard>
      )
    }

    if (activeSection === 'photos') {
      return (
        <SectionCard title="Foto Per Page">
          <div style={gridStyle}>
            {imageFields.map(([key, label]) => (
              <div key={key} className="card-parchment" style={{ display: 'grid', gap: '8px' }}>
                <span className="text-body-strong" style={{ color: 'var(--color-ink)' }}>{label}</span>
                {content.images[key] && <img src={content.images[key]} alt="" style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', borderRadius: 6, border: '1px solid var(--color-hairline)' }} />}
                <Field label="URL Aktif" value={content.images[key]} onChange={(value) => update(['images', key], value)} />
                <input type="file" accept="image/*" onChange={(event) => uploadImage(event.target.files?.[0], key, label)} disabled={Boolean(uploadingKey)} />
                {uploadingKey === key && <span className="text-caption">Uploading...</span>}
              </div>
            ))}
          </div>
        </SectionCard>
      )
    }

    if (activeSection === 'gallery') {
      return (
        <SectionCard
          title="Galeri"
          action={<input type="file" accept="image/*" multiple onChange={(event) => Array.from(event.target.files || []).forEach(file => uploadImage(file, 'gallery', `Galeri ${file.name}`))} disabled={Boolean(uploadingKey)} />}
        >
          <div style={gridStyle}>
            {content.gallery.map((photo, index) => (
              <div key={`${photo.src}-${index}`} className="card-parchment" style={{ display: 'grid', gap: '8px' }}>
                <img src={photo.src} alt="" style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: 6, border: '1px solid var(--color-hairline)' }} />
                <Field label="URL Foto" value={photo.src} onChange={(value) => updateArrayItem('gallery', index, 'src', value)} />
                <Field label="Alt Text" value={photo.alt} onChange={(value) => updateArrayItem('gallery', index, 'alt', value)} />
                <button className="btn-pearl-capsule" onClick={() => removeArrayItem('gallery', index)} style={{ justifySelf: 'start' }}>Hapus Foto</button>
              </div>
            ))}
          </div>
        </SectionCard>
      )
    }

    return (
      <SectionCard
        title="Asset Library"
        action={<button className="btn-pearl-capsule" onClick={loadAssets} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="refresh" size={14} /> Refresh Assets</button>}
      >
        <div style={gridStyle}>
          {assets.length === 0 ? (
            <p className="text-body" style={{ color: 'var(--color-ink-muted-48)' }}>Belum ada asset di database.</p>
          ) : assets.map(asset => (
            <div key={asset.id} className="card-parchment" style={{ display: 'grid', gap: '8px' }}>
              <img src={asset.public_url} alt="" style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', borderRadius: 6, border: '1px solid var(--color-hairline)' }} />
              <p className="text-body-strong" style={{ color: 'var(--color-ink)' }}>{asset.label || asset.file_name}</p>
              <p className="text-caption" style={{ color: 'var(--color-ink-muted-48)', overflowWrap: 'anywhere' }}>{asset.storage_path}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {imageFields.map(([key, label]) => (
                  <button key={key} className="btn-pearl-capsule" onClick={() => useAssetForImage(asset, key)} style={{ fontSize: 11, padding: '5px 8px' }}>{label}</button>
                ))}
                <button className="btn-pearl-capsule" onClick={() => useAssetForImage(asset, 'gallery')} style={{ fontSize: 11, padding: '5px 8px' }}>Tambah ke Galeri</button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    )
  }

  return (
    <div className="admin-page" style={{ minHeight: '100vh', background: 'var(--color-canvas-parchment)' }}>
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
        <span className="text-nav-link" style={{ color: 'var(--color-on-dark)', fontWeight: 600 }}>
          Wedding Admin
        </span>
        <Link href="/admin" className="btn-dark-utility" style={{ fontSize: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <Icon name="arrowLeft" size={14} /> Dashboard
        </Link>
      </nav>

      <div className="admin-main-content" style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          <div>
            <h1 className="text-display-md" style={{ color: 'var(--color-ink)', marginBottom: 'var(--spacing-xxs)' }}>Konten Undangan</h1>
            <p className="text-body" style={{ color: 'var(--color-ink-muted-48)' }}>Kelola konten per halaman dan asset dari satu tempat.</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
            <button className="btn-pearl-capsule" onClick={loadContent} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="refresh" size={14} /> Refresh
            </button>
            <button className="btn-primary" onClick={saveContent} disabled={saving || loading} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="check" size={14} /> {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`toast ${message.type === 'success' ? 'toast-success' : 'toast-error'}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <Icon name={message.type === 'success' ? 'check' : 'alertCircle'} size={16} />
            {message.text}
          </div>
        )}

        <div className="admin-cms-layout">
          <aside className="card admin-cms-menu">
            {sections.map(section => (
              <button
                key={section.id}
                className={section.id === selectedSection.id ? 'btn-primary' : 'btn-pearl-capsule'}
                onClick={() => setActiveSection(section.id)}
                style={{ justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, minHeight: 40 }}
              >
                <Icon name={section.icon} size={14} /> {section.label}
              </button>
            ))}
          </aside>
          <div>
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  )
}
