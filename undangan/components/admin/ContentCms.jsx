"use client"
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowDown, ArrowLeft, ArrowUp, Check, Eye, EyeOff, ImagePlus,
  Images, LayoutList, RefreshCw, Save, Trash2, Upload, X,
} from 'lucide-react'
import { defaultWeddingContent, mergeWeddingContent } from '@/lib/wedding-content'
import { supabase } from './supabaseClient'

const ASSET_BUCKET = 'wedding-assets'
const ASSET_PREFIX = 'cms'
const sectionNumbers = { hero: '01', couple: '02', story: '03', event: '04', gallery: '05', gift: '06', rsvp: '07', footer: '08' }

function fileExt(name) {
  const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : 'jpg'
  return ext || 'jpg'
}

function safeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '')
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return <label className="cms-field"><span>{label}</span><input type={type} className="input-field" value={value ?? ''} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>
}

function TextArea({ label, value, onChange, rows = 4 }) {
  return <label className="cms-field cms-field-wide"><span>{label}</span><textarea className="input-field cms-textarea" value={value ?? ''} rows={rows} onChange={(event) => onChange(event.target.value)} /></label>
}

function FontControl({ label, value, onChange, min = 12, max = 72 }) {
  return (
    <label className="cms-font-control"><span>{label}</span><div>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <input className="input-field" type="number" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} /><small>px</small>
    </div></label>
  )
}

function EmptyState({ children }) {
  return <div className="cms-empty"><Images size={28} /><p>{children}</p></div>
}

export default function ContentCms() {
  const [content, setContent] = useState(defaultWeddingContent)
  const [assets, setAssets] = useState([])
  const [activeSection, setActiveSection] = useState('hero')
  const [view, setView] = useState('sections')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null)
  const [picker, setPicker] = useState(null)

  const orderedSections = useMemo(() => [...content.sections].sort((a, b) => a.order - b.order), [content.sections])
  const section = orderedSections.find((item) => item.id === activeSection) || orderedSections[0]
  const imageAssets = useMemo(() => assets.filter((asset) => !asset.content_type || asset.content_type.startsWith('image/')), [assets])

  const update = (path, value) => {
    setContent((current) => {
      const next = structuredClone(current)
      let target = next
      path.slice(0, -1).forEach((key) => { target = target[key] })
      target[path[path.length - 1]] = value
      return next
    })
  }

  const updateArrayItem = (key, index, field, value) => {
    setContent((current) => {
      const next = structuredClone(current)
      next[key][index] = { ...next[key][index], [field]: value }
      return next
    })
  }

  const updateSection = (field, value) => {
    setContent((current) => ({ ...current, sections: current.sections.map((item) => item.id === activeSection ? { ...item, [field]: value } : item) }))
  }

  const moveSection = (direction) => {
    setContent((current) => {
      const sorted = [...current.sections].sort((a, b) => a.order - b.order)
      const from = sorted.findIndex((item) => item.id === activeSection)
      const to = from + direction
      if (from < 0 || to < 0 || to >= sorted.length) return current
      ;[sorted[from], sorted[to]] = [sorted[to], sorted[from]]
      return { ...current, sections: sorted.map((item, order) => ({ ...item, order })) }
    })
  }

  const loadAssets = useCallback(async () => {
    const { data, error } = await supabase.from('wedding_cms_assets').select('*').order('created_at', { ascending: false })
    if (error) throw error
    setAssets(data || [])
  }, [])

  const loadContent = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    try {
      const { data, error } = await supabase.from('wedding_cms_settings').select('content').eq('id', 'default').maybeSingle()
      if (error) throw error
      setContent(mergeWeddingContent(data?.content))
      await loadAssets()
    } catch (error) {
      console.error('CMS load failed:', error)
      setContent(defaultWeddingContent)
      setMessage({ type: 'error', text: 'CMS belum siap. Pastikan migration CMS sudah dijalankan di Supabase.' })
    } finally { setLoading(false) }
  }, [loadAssets])

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadContent() }, 0)
    return () => window.clearTimeout(timer)
  }, [loadContent])

  const saveContent = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const normalized = { ...content, sections: [...content.sections].sort((a, b) => a.order - b.order).map((item, order) => ({ ...item, order })) }
      const { error } = await supabase.from('wedding_cms_settings').upsert({ id: 'default', content: normalized, updated_at: new Date().toISOString(), updated_by: userData.user?.id || null })
      if (error) throw error
      setContent(normalized)
      setMessage({ type: 'success', text: 'Semua perubahan section berhasil disimpan.' })
    } catch (error) {
      console.error('CMS save failed:', error)
      setMessage({ type: 'error', text: `Gagal menyimpan CMS: ${error.message}` })
    } finally { setSaving(false) }
  }

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return []
    setUploading(true)
    setMessage(null)
    const uploaded = []
    try {
      const { data: userData } = await supabase.auth.getUser()
      for (const file of files) {
        const path = `${ASSET_PREFIX}/library/${Date.now()}-${crypto.randomUUID()}.${fileExt(safeName(file.name))}`
        const { error: uploadError } = await supabase.storage.from(ASSET_BUCKET).upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false })
        if (uploadError) throw uploadError
        const { data: publicData } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(path)
        const { data, error } = await supabase.from('wedding_cms_assets').insert({
          bucket_id: ASSET_BUCKET, storage_path: path, public_url: publicData.publicUrl, role: 'library',
          label: file.name.replace(/\.[^.]+$/, ''), alt_text: file.name.replace(/\.[^.]+$/, ''), file_name: file.name,
          content_type: file.type || 'image/jpeg', size_bytes: file.size, created_by: userData.user?.id || null,
        }).select().single()
        if (error) throw error
        uploaded.push(data)
      }
      setAssets((current) => [...uploaded.reverse(), ...current])
      setMessage({ type: 'success', text: `${files.length} foto berhasil masuk ke Galeri Media.` })
      return uploaded
    } catch (error) {
      console.error('Asset upload failed:', error)
      setMessage({ type: 'error', text: `Gagal upload foto: ${error.message}` })
      return []
    } finally { setUploading(false) }
  }

  const selectAsset = (asset) => {
    if (!picker) return
    if (picker.type === 'background') updateSection('background', asset.public_url)
    if (picker.type === 'person') update([picker.role, 'image'], asset.public_url)
    if (picker.type === 'story') updateArrayItem('stories', picker.index, 'image', asset.public_url)
    if (picker.type === 'image') update(['images', picker.field], asset.public_url)
    if (picker.type === 'gallery') {
      const exists = content.gallery.some((photo) => photo.src === asset.public_url)
      if (!exists) update(['gallery'], [...content.gallery, { src: asset.public_url, alt: asset.alt_text || asset.label || 'Foto galeri' }])
    }
    setPicker(null)
    setMessage({ type: 'success', text: 'Foto dipilih. Tekan Simpan untuk menerapkan ke undangan.' })
  }

  const addAssetToGallery = (asset) => {
    if (!content.gallery.some((photo) => photo.src === asset.public_url)) {
      update(['gallery'], [...content.gallery, { src: asset.public_url, alt: asset.alt_text || asset.label || 'Foto galeri' }])
    }
    setActiveSection('gallery')
    setView('sections')
    setMessage({ type: 'success', text: 'Foto ditambahkan ke section Galeri. Tekan Simpan untuk menerapkan.' })
  }

  const deleteAsset = async (asset) => {
    if (!window.confirm(`Hapus ${asset.label || asset.file_name} dari Galeri Media?`)) return
    try {
      const { error: storageError } = await supabase.storage.from(ASSET_BUCKET).remove([asset.storage_path])
      if (storageError) throw storageError
      const { error } = await supabase.from('wedding_cms_assets').delete().eq('id', asset.id)
      if (error) throw error
      setAssets((current) => current.filter((item) => item.id !== asset.id))
      setMessage({ type: 'success', text: 'Foto dihapus dari Galeri Media.' })
    } catch (error) { setMessage({ type: 'error', text: `Gagal menghapus foto: ${error.message}` }) }
  }

  const renderSpecificFields = () => {
    if (activeSection === 'hero') return <div className="cms-repeat-list">
      <div className="cms-fields-grid">
        <Field label="Nama singkat pasangan" value={content.shortNames} onChange={(value) => update(['shortNames'], value)} />
        <Field label="Tanggal acara" value={content.date} onChange={(value) => update(['date'], value)} placeholder="2026-09-26T08:00:00+07:00" />
        <Field label="Label tanggal" value={content.dateLabel} onChange={(value) => update(['dateLabel'], value)} />
        <Field label="Hashtag" value={content.hashtag} onChange={(value) => update(['hashtag'], value)} />
        <Field label="Google Maps" value={content.mapsUrl} onChange={(value) => update(['mapsUrl'], value)} />
      </div>
      <div className="cms-special-images">
        {[['cover', 'Cover buka undangan'], ['desktopSide', 'Foto panel desktop']].map(([field, label]) => <button key={field} type="button" onClick={() => setPicker({ type: 'image', field })}><img src={content.images[field]} alt="" /><span><ImagePlus size={15} /> {label}</span></button>)}
      </div>
    </div>

    if (activeSection === 'couple') return <div className="cms-repeat-list">{['bride', 'groom'].map((role) => <article className="cms-repeat-item" key={role}>
      <div className="cms-repeat-head"><strong>{role === 'bride' ? 'Mempelai Wanita' : 'Mempelai Pria'}</strong></div>
      <div className="cms-person-layout"><button className="cms-photo-button" type="button" onClick={() => setPicker({ type: 'person', role })}><img src={content[role].image} alt="" /><span><ImagePlus size={16} /> Ganti foto</span></button>
        <div className="cms-fields-grid"><Field label="Nama panggilan" value={content[role].shortName} onChange={(value) => update([role, 'shortName'], value)} /><Field label="Nama lengkap" value={content[role].fullName} onChange={(value) => update([role, 'fullName'], value)} /><TextArea label="Keterangan orang tua" value={content[role].parents} onChange={(value) => update([role, 'parents'], value)} /></div>
      </div></article>)}</div>

    if (activeSection === 'story') return <div className="cms-repeat-list">{content.stories.map((story, index) => <article className="cms-repeat-item" key={`story-${index}`}>
      <div className="cms-story-layout"><button className="cms-photo-button" type="button" onClick={() => setPicker({ type: 'story', index })}><img src={story.image} alt="" /><span><ImagePlus size={16} /> Ganti foto</span></button>
        <div className="cms-fields-grid"><Field label={`Judul slide ${index + 1}`} value={story.title} onChange={(value) => updateArrayItem('stories', index, 'title', value)} /><TextArea label="Isi cerita" value={story.body} onChange={(value) => updateArrayItem('stories', index, 'body', value)} rows={5} /></div>
      </div></article>)}</div>

    if (activeSection === 'event') return <div className="cms-repeat-list">{content.events.map((event, index) => <article className="cms-repeat-item" key={`event-${index}`}><div className="cms-fields-grid">
      <Field label="Jenis acara" value={event.type} onChange={(value) => updateArrayItem('events', index, 'type', value)} /><Field label="Waktu" value={event.time} onChange={(value) => updateArrayItem('events', index, 'time', value)} /><Field label="Tempat" value={event.venue} onChange={(value) => updateArrayItem('events', index, 'venue', value)} /><TextArea label="Alamat lengkap" value={event.address} onChange={(value) => updateArrayItem('events', index, 'address', value)} />
    </div></article>)}</div>

    if (activeSection === 'gallery') return <div><button className="btn-pearl-capsule cms-inline-button" type="button" onClick={() => setPicker({ type: 'gallery' })}><ImagePlus size={16} /> Tambah dari Galeri Media</button><div className="cms-selected-gallery">{content.gallery.map((photo, index) => <figure key={`${photo.src}-${index}`}><img src={photo.src} alt={photo.alt} /><button type="button" title="Hapus dari section galeri" onClick={() => update(['gallery'], content.gallery.filter((_, itemIndex) => itemIndex !== index))}><X size={15} /></button><input className="input-field" value={photo.alt} aria-label={`Alt foto ${index + 1}`} onChange={(event) => updateArrayItem('gallery', index, 'alt', event.target.value)} /></figure>)}</div></div>

    if (activeSection === 'gift') return <div><button className="btn-pearl-capsule cms-inline-button" type="button" onClick={() => update(['gifts'], [...content.gifts, { bank: 'Rekening', number: '', owner: '' }])}><ImagePlus size={16} /> Tambah rekening</button><div className="cms-repeat-list">{content.gifts.map((gift, index) => <article className="cms-repeat-item" key={`gift-${index}`}><div className="cms-fields-grid"><Field label="Bank / e-wallet" value={gift.bank} onChange={(value) => updateArrayItem('gifts', index, 'bank', value)} /><Field label="Nomor" value={gift.number} onChange={(value) => updateArrayItem('gifts', index, 'number', value)} /><Field label="Nama pemilik" value={gift.owner} onChange={(value) => updateArrayItem('gifts', index, 'owner', value)} /></div><button className="cms-text-danger" type="button" onClick={() => update(['gifts'], content.gifts.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={14} /> Hapus rekening</button></article>)}</div></div>

    return <p className="cms-muted">Section ini memakai judul, isi, ukuran font, dan background dari pengaturan di atas.</p>
  }

  const renderEditor = () => <section className="cms-editor-panel">
    <div className="cms-editor-heading"><div><span>SECTION {sectionNumbers[section.id]}</span><h2>{section.name}</h2></div><button className="cms-visibility" type="button" data-visible={section.visible} onClick={() => updateSection('visible', !section.visible)}>{section.visible ? <Eye size={16} /> : <EyeOff size={16} />}{section.visible ? 'Ditampilkan' : 'Disembunyikan'}</button></div>
    <div className="cms-block"><div className="cms-block-title"><h3>Identitas & urutan</h3><div className="cms-order-buttons"><button type="button" title="Naikkan section" onClick={() => moveSection(-1)}><ArrowUp size={16} /></button><button type="button" title="Turunkan section" onClick={() => moveSection(1)}><ArrowDown size={16} /></button></div></div><div className="cms-fields-grid"><Field label="Nama section di CMS" value={section.name} onChange={(value) => updateSection('name', value)} /></div></div>
    <div className="cms-block"><div className="cms-block-title"><h3>Konten utama</h3></div><div className="cms-fields-grid"><Field label="Judul section" value={section.title} onChange={(value) => updateSection('title', value)} placeholder="Kosongkan untuk judul bawaan" /><TextArea label="Isi / deskripsi" value={section.body} onChange={(value) => updateSection('body', value)} /><FontControl label="Ukuran judul" value={section.titleFontSize} onChange={(value) => updateSection('titleFontSize', value)} min={20} max={72} /><FontControl label="Ukuran isi" value={section.bodyFontSize} onChange={(value) => updateSection('bodyFontSize', value)} min={12} max={28} /></div></div>
    <div className="cms-block"><div className="cms-block-title"><h3>Background</h3></div><div className="cms-background-picker"><img src={section.background} alt="" /><div><strong>Foto aktif</strong><p>Dipilih langsung dari bucket wedding-assets.</p><button className="btn-pearl-capsule cms-inline-button" type="button" onClick={() => setPicker({ type: 'background' })}><Images size={16} /> Pilih background</button></div></div></div>
    <div className="cms-block"><div className="cms-block-title"><h3>Detail konten</h3></div>{renderSpecificFields()}</div>
  </section>

  const renderMedia = () => <section className="cms-media-panel"><div className="cms-media-heading"><div><span>SUPABASE STORAGE</span><h2>Galeri Media</h2><p>Semua foto berasal dari bucket wedding-assets.</p></div><label className="btn-primary cms-upload-button"><Upload size={16} />{uploading ? 'Mengunggah...' : 'Upload foto'}<input type="file" accept="image/*" multiple disabled={uploading} onChange={(event) => void uploadFiles(event.target.files)} /></label></div>
    {imageAssets.length === 0 ? <EmptyState>Belum ada foto. Upload foto pertama untuk mulai.</EmptyState> : <div className="cms-media-grid">{imageAssets.map((asset) => <article key={asset.id}><img src={asset.public_url} alt={asset.alt_text || asset.label || ''} /><div><strong>{asset.label || asset.file_name}</strong><span>{asset.file_name}</span></div><div className="cms-media-actions"><button type="button" onClick={() => addAssetToGallery(asset)}>Tambah ke galeri</button><button type="button" title="Hapus foto" onClick={() => void deleteAsset(asset)}><Trash2 size={15} /></button></div></article>)}</div>}
  </section>

  return <div className="admin-page cms-page">
    <nav className="cms-topbar"><span>Wedding Admin</span><Link href="/admin"><ArrowLeft size={15} /> Dashboard</Link></nav>
    <main className="cms-main"><header className="cms-page-header"><div><h1>Konten Undangan</h1><p>Atur section, tulisan, foto, dan urutan halaman dari satu tempat.</p></div><div className="cms-header-actions"><button type="button" onClick={() => void loadContent()} disabled={loading}><RefreshCw size={16} /> Muat ulang</button><button type="button" className="btn-primary" onClick={() => void saveContent()} disabled={saving || loading}><Save size={16} />{saving ? 'Menyimpan...' : 'Simpan perubahan'}</button></div></header>
      {message && <div className={`cms-message cms-message-${message.type}`}>{message.type === 'success' ? <Check size={17} /> : <X size={17} />}{message.text}</div>}
      <div className="cms-view-tabs"><button type="button" data-active={view === 'sections'} onClick={() => setView('sections')}><LayoutList size={17} /> Sections</button><button type="button" data-active={view === 'media'} onClick={() => setView('media')}><Images size={17} /> Galeri Media <span>{imageAssets.length}</span></button></div>
      {view === 'media' ? renderMedia() : <div className="cms-layout"><aside className="cms-section-list"><div className="cms-section-list-head"><strong>Urutan section</strong><span>{orderedSections.filter((item) => item.visible).length} aktif</span></div>{orderedSections.map((item, index) => <button type="button" key={item.id} data-active={item.id === activeSection} onClick={() => setActiveSection(item.id)}><span className="cms-section-number">{String(index + 1).padStart(2, '0')}</span><span className="cms-section-name"><strong>{item.name}</strong><small>{item.visible ? 'Ditampilkan' : 'Disembunyikan'}</small></span>{!item.visible && <EyeOff size={14} />}</button>)}</aside>{renderEditor()}</div>}
    </main>
    {picker && <div className="cms-modal-backdrop" role="dialog" aria-modal="true" aria-label="Pilih foto"><div className="cms-asset-modal"><header><div><span>WEDDING-ASSETS</span><h2>Pilih foto</h2></div><button type="button" aria-label="Tutup" onClick={() => setPicker(null)}><X size={20} /></button></header><div className="cms-modal-upload"><label className="btn-pearl-capsule cms-inline-button"><Upload size={16} />{uploading ? 'Mengunggah...' : 'Upload baru'}<input type="file" accept="image/*" multiple disabled={uploading} onChange={(event) => void uploadFiles(event.target.files)} /></label></div><div className="cms-picker-grid">{imageAssets.map((asset) => <article key={asset.id}><img src={asset.public_url} alt="" /><div><strong>{asset.label || asset.file_name}</strong><button type="button" onClick={() => selectAsset(asset)}>Pilih</button></div></article>)}</div></div></div>}
  </div>
}
