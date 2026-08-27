"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { loadCmsContent, saveCmsContent, loadCmsGallery, saveCmsGallery, uploadCmsImage, getDefaultContent, getDefaultGallery, type CmsContent, type CmsGalleryItem } from "@/lib/cms";
import Icon from "./Icon";

type Tab = "umum" | "mempelai" | "acara" | "cerita" | "gift" | "galeri";

function Field({ label, value, onChange, placeholder, type="text" }: any) {
  return (
    <label style={{ display:"block", marginBottom:14 }}>
      <span className="text-caption-strong" style={{ display:"block", marginBottom:6, color:"var(--color-ink)" }}>{label}</span>
      <input className="input-field" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type} />
    </label>
  );
}
function TextArea({ label, value, onChange, placeholder }: any) {
  return (
    <label style={{ display:"block", marginBottom:14 }}>
      <span className="text-caption-strong" style={{ display:"block", marginBottom:6, color:"var(--color-ink)" }}>{label}</span>
      <textarea className="input-field" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ resize:"vertical" }} />
    </label>
  );
}

export default function CmsAdmin() {
  const [tab, setTab] = useState<Tab>("umum");
  const [content, setContent] = useState<CmsContent>(() => getDefaultContent());
  const [gallery, setGallery] = useState<CmsGalleryItem[]>(() => getDefaultGallery());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);
  const [uploading, setUploading] = useState<string|null>(null);

  useEffect(()=>{
    setContent(loadCmsContent());
    setGallery(loadCmsGallery());
  },[]);

  const save = (nextContent = content, nextGallery = gallery) => {
    setSaving(true);
    saveCmsContent(nextContent);
    saveCmsGallery(nextGallery);
    window.dispatchEvent(new Event("cms-update"));
    setMsg("Tersimpan — buka preview undangan untuk lihat perubahan");
    setTimeout(()=>setMsg(null), 3000);
    setSaving(false);
  };

  const handleImageUpload = async (file: File, onUrl: (url:string)=>void, key: string) => {
    if (!file.type.startsWith("image/")) { setMsg("File harus gambar"); return; }
    if (file.size > 6*1024*1024) { setMsg("Maks 6MB"); return; }
    setUploading(key);
    try {
      const url = await uploadCmsImage(file);
      onUrl(url);
      setMsg("Foto berhasil diupload");
      setTimeout(()=>setMsg(null), 2000);
    } catch (e:any) { setMsg(e.message||"Gagal upload"); }
    finally { setUploading(null); }
  };

  const updateGalleryItem = (id:string, patch: Partial<CmsGalleryItem>) => {
    const next = gallery.map(g=> g.id===id ? { ...g, ...patch } : g);
    setGallery(next);
  };
  const addGallery = async (file: File) => {
    setUploading("gallery-add");
    const url = await uploadCmsImage(file);
    const next = [...gallery, { id: Date.now().toString(36), src: url, alt: `Momen ${gallery.length+1}`, active: true }];
    setGallery(next);
    setUploading(null);
  };
  const removeGallery = (id:string) => setGallery(gallery.filter(g=>g.id!==id));
  const moveGallery = (idx:number, dir:number) => {
    const next = [...gallery];
    const j = idx+dir;
    if (j<0 || j>=next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setGallery(next);
  };

  const tabs: {id:Tab;label:string}[] = [
    {id:"umum",label:"Umum & Hero"},
    {id:"mempelai",label:"Mempelai"},
    {id:"acara",label:"Acara"},
    {id:"cerita",label:"Cerita & Quote"},
    {id:"gift",label:"Hadiah"},
    {id:"galeri",label:"Galeri Foto"},
  ];

  return (
    <div style={{ minHeight:"100vh", background:"var(--color-canvas-parchment)" }}>
      <nav style={{ height:44, background:"var(--color-surface-black)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <Link href="/admin" className="btn-dark-utility" style={{ textDecoration:"none", fontSize:12, padding:"6px 12px", display:"flex", gap:6, alignItems:"center" }}><Icon name="arrowLeft" size={14}/> Dashboard</Link>
          <span style={{ color:"var(--color-on-dark)", fontWeight:600, fontSize:14 }}>CMS — Konten Undangan</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Link href="/preview" target="_blank" className="btn-pearl-capsule" style={{ textDecoration:"none", fontSize:12, padding:"6px 12px", display:"flex", gap:6, alignItems:"center" }}><Icon name="eye" size={14}/> Preview</Link>
          <button className="btn-primary" onClick={()=>save()} disabled={saving} style={{ fontSize:12, padding:"6px 14px" }}>{saving?"Menyimpan...":"Simpan Semua"}</button>
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:20 }}>
        {msg && <div className="toast" style={{ background:"#1b1c18", color:"#e9c176", padding:"10px 14px", borderRadius:8, marginBottom:16, display:"flex", gap:8, alignItems:"center" }}><Icon name="checkCircle" size={16}/> {msg}</div>}

        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:18 }}>
          {tabs.map(t=> (
            <button key={t.id} onClick={()=>setTab(t.id)} className={tab===t.id ? "btn-primary" : "btn-pearl-capsule"} style={{ fontSize:12, padding:"8px 14px" }}>{t.label}</button>
          ))}
          <button className="btn-pearl-capsule" style={{ fontSize:12, padding:"8px 14px", marginLeft:"auto" }} onClick={()=>{
            if(!confirm("Reset ke default?")) return;
            const d = getDefaultContent(); const g = getDefaultGallery(); setContent(d); setGallery(g); save(d,g);
          }}>Reset Default</button>
        </div>

        <div className="card" style={{ padding:20, borderRadius:12 }}>
          {tab==="umum" && (
            <div>
              <h3 className="text-tagline" style={{ marginBottom:16 }}>Umum & Hero</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <Field label="Nama Singkat (header)" value={content.shortNames} onChange={(v:string)=>setContent({...content, shortNames:v})} placeholder="Anisa & Maulana" />
                <Field label="Tanggal ISO (untuk countdown)" value={content.date} onChange={(v:string)=>setContent({...content, date:v})} placeholder="2026-09-26T08:00:00+07:00" />
              </div>
              <Field label="Label Tanggal (tampilan)" value={content.dateLabel} onChange={(v:string)=>setContent({...content, dateLabel:v})} placeholder="Sabtu, 26 September 2026" />
              <Field label="Judul Hero" value={content.heroTitle} onChange={(v:string)=>setContent({...content, heroTitle:v})} />
              <Field label="Hashtag" value={content.heroHashtag} onChange={(v:string)=>setContent({...content, heroHashtag:v})} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div>
                  <span className="text-caption-strong" style={{ display:"block", marginBottom:6 }}>Foto Hero / Cover</span>
                  <div style={{ border:"1px solid var(--color-hairline)", borderRadius:8, overflow:"hidden", height:180, background:"#eee", marginBottom:8 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={content.heroImage} alt="hero" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  </div>
                  <label className="btn-pearl-capsule" style={{ cursor:"pointer", fontSize:12, padding:"6px 12px", display:"inline-flex", gap:6, alignItems:"center" }}>
                    <Icon name="upload" size={14}/> {uploading==="hero"?"Uploading...":"Ganti Foto"}
                    <input type="file" accept="image/*" hidden onChange={e=>{ const f=e.target.files?.[0]; if(f) handleImageUpload(f, url=>setContent(c=>({...c, heroImage:url, coverImage:url})), "hero"); }} />
                  </label>
                  <input className="input-field" value={content.heroImage} onChange={e=>setContent({...content, heroImage:e.target.value, coverImage:e.target.value})} placeholder="URL gambar" style={{ marginTop:8 }} />
                </div>
                <div>
                  <Field label="URL Musik (mp3)" value={content.musicUrl} onChange={(v:string)=>setContent({...content, musicUrl:v})} />
                  <span className="text-fine-print" style={{ color:"var(--color-ink-muted-48)" }}>Kosongkan untuk pakai /music.mp3 default. File mp3 bisa diupload ke Supabase Storage.</span>
                </div>
              </div>
            </div>
          )}

          {tab==="mempelai" && (
            <div>
              <h3 className="text-tagline" style={{ marginBottom:16 }}>Mempelai</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                {(["bride","groom"] as const).map(role=> (
                  <div key={role} style={{ border:"1px solid var(--color-hairline)", borderRadius:12, padding:16 }}>
                    <h4 className="text-caption-strong" style={{ marginBottom:12, textTransform:"capitalize" }}>{role==="bride"?"Mempelai Wanita":"Mempelai Pria"}</h4>
                    <div style={{ height:200, borderRadius:8, overflow:"hidden", background:"#eee", marginBottom:10 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={content[role].image} alt={role} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    </div>
                    <label className="btn-pearl-capsule" style={{ cursor:"pointer", fontSize:12, padding:"6px 12px", display:"inline-flex", gap:6, alignItems:"center", marginBottom:10 }}>
                      <Icon name="upload" size={14}/> {uploading===role?"Uploading...":"Ganti Foto"}
                      <input type="file" accept="image/*" hidden onChange={e=>{ const f=e.target.files?.[0]; if(f) handleImageUpload(f, url=>setContent(c=>({...c, [role]:{...c[role], image:url}})), role); }} />
                    </label>
                    <Field label="Nama panggilan" value={content[role].shortName} onChange={(v:string)=>setContent(c=>({...c, [role]:{...c[role], shortName:v}}))} />
                    <Field label="Nama lengkap + gelar" value={content[role].fullName} onChange={(v:string)=>setContent(c=>({...c, [role]:{...c[role], fullName:v}}))} />
                    <TextArea label="Putra/Putri dari" value={content[role].parents} onChange={(v:string)=>setContent(c=>({...c, [role]:{...c[role], parents:v}}))} />
                    <Field label="URL Foto" value={content[role].image} onChange={(v:string)=>setContent(c=>({...c, [role]:{...c[role], image:v}}))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==="acara" && (
            <div>
              <h3 className="text-tagline" style={{ marginBottom:16 }}>Acara</h3>
              {content.events.map((ev,i)=> (
                <div key={i} style={{ border:"1px solid var(--color-hairline)", borderRadius:12, padding:16, marginBottom:12 }}>
                  <Field label="Jenis Acara" value={ev.type} onChange={(v:string)=>{ const n=[...content.events]; n[i]={...n[i], type:v}; setContent({...content, events:n}); }} />
                  <Field label="Waktu" value={ev.time} onChange={(v:string)=>{ const n=[...content.events]; n[i]={...n[i], time:v}; setContent({...content, events:n}); }} />
                  <Field label="Venue" value={ev.venue} onChange={(v:string)=>{ const n=[...content.events]; n[i]={...n[i], venue:v}; setContent({...content, events:n}); }} />
                  <Field label="Alamat" value={ev.address} onChange={(v:string)=>{ const n=[...content.events]; n[i]={...n[i], address:v}; setContent({...content, events:n}); }} />
                </div>
              ))}
              <Field label="Link Google Maps" value={content.mapsUrl} onChange={(v:string)=>setContent({...content, mapsUrl:v})} />
            </div>
          )}

          {tab==="cerita" && (
            <div>
              <h3 className="text-tagline" style={{ marginBottom:16 }}>Quote & Cerita</h3>
              <TextArea label="Ayat Arab" value={content.quoteAr} onChange={(v:string)=>setContent({...content, quoteAr:v})} />
              <TextArea label="Terjemahan" value={content.quoteTranslation} onChange={(v:string)=>setContent({...content, quoteTranslation:v})} />
              <Field label="Sumber" value={content.quoteSource} onChange={(v:string)=>setContent({...content, quoteSource:v})} />
              <hr style={{ margin:"18px 0", border:"none", borderTop:"1px solid var(--color-hairline)" }} />
              {content.stories.map((s,idx)=> (
                <div key={idx} style={{ border:"1px solid var(--color-hairline)", borderRadius:12, padding:16, marginBottom:12 }}>
                  <Field label={`Judul ${idx+1}`} value={s.title} onChange={(v:string)=>{ const n=[...content.stories]; n[idx]={...n[idx], title:v}; setContent({...content, stories:n}); }} />
                  <TextArea label="Isi" value={s.body} onChange={(v:string)=>{ const n=[...content.stories]; n[idx]={...n[idx], body:v}; setContent({...content, stories:n}); }} />
                </div>
              ))}
              <Field label="Judul Footer" value={content.footerTitle} onChange={(v:string)=>setContent({...content, footerTitle:v})} />
              <TextArea label="Pesan Footer" value={content.footerMessage} onChange={(v:string)=>setContent({...content, footerMessage:v})} />
            </div>
          )}

          {tab==="gift" && (
            <div>
              <h3 className="text-tagline" style={{ marginBottom:16 }}>Hadiah / Rekening</h3>
              {content.gifts.map((g,idx)=> (
                <div key={idx} style={{ border:"1px solid var(--color-hairline)", borderRadius:12, padding:16, marginBottom:12, display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:12, alignItems:"end" }}>
                  <Field label="Bank / Label" value={g.bank} onChange={(v:string)=>{ const n=[...content.gifts]; n[idx]={...n[idx], bank:v}; setContent({...content, gifts:n}); }} />
                  <Field label="Nomor" value={g.number} onChange={(v:string)=>{ const n=[...content.gifts]; n[idx]={...n[idx], number:v}; setContent({...content, gifts:n}); }} />
                  <Field label="Atas Nama" value={g.owner} onChange={(v:string)=>{ const n=[...content.gifts]; n[idx]={...n[idx], owner:v}; setContent({...content, gifts:n}); }} />
                  <button className="btn-pearl-capsule" style={{ height:36 }} onClick={()=>{ const n=content.gifts.filter((_,i)=>i!==idx); setContent({...content, gifts:n.length? n : [{bank:"Rekening", number:"", owner:""}]}); }}><Icon name="trash" size={14}/></button>
                </div>
              ))}
              <button className="btn-pearl-capsule" onClick={()=>setContent({...content, gifts:[...content.gifts, {bank:"Rekening", number:"", owner:""}]})} style={{ fontSize:12 }}><Icon name="plus" size={14}/> Tambah Rekening</button>
            </div>
          )}

          {tab==="galeri" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <h3 className="text-tagline">Galeri Foto — {gallery.length} foto</h3>
                <label className="btn-primary" style={{ cursor:"pointer", fontSize:12, padding:"8px 14px", display:"inline-flex", gap:6, alignItems:"center" }}>
                  <Icon name="upload" size={14}/> {uploading==="gallery-add"?"Uploading...":"Tambah Foto"}
                  <input type="file" accept="image/*" multiple hidden onChange={async e=>{
                    const files = Array.from(e.target.files||[]);
                    for (const f of files) await addGallery(f);
                    (e.target as HTMLInputElement).value="";
                  }} />
                </label>
              </div>
              <span className="text-fine-print" style={{ color:"var(--color-ink-muted-48)", display:"block", marginBottom:12 }}>Urutkan dengan panah. Foto non-aktif tidak tampil di undangan. Upload otomatis coba ke Supabase bucket <code>wedding-assets</code>, fallback ke base64 bila belum ada bucket.</span>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px,1fr))", gap:12 }}>
                {gallery.map((item, idx)=> (
                  <div key={item.id} style={{ border:"1px solid var(--color-hairline)", borderRadius:12, overflow:"hidden", background:"white", opacity: item.active?1:0.55 }}>
                    <div style={{ height:160, background:"#eee", position:"relative", overflow:"hidden" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.src} alt={item.alt} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      {!item.active && <span style={{ position:"absolute", top:6, left:6, background:"#111", color:"#fff", fontSize:10, padding:"2px 6px", borderRadius:99 }}>NONAKTIF</span>}
                    </div>
                    <div style={{ padding:10 }}>
                      <input className="input-field" value={item.alt} onChange={e=>updateGalleryItem(item.id, { alt: e.target.value })} placeholder="Alt text" style={{ fontSize:12, padding:"6px 8px", marginBottom:6 }} />
                      <input className="input-field" value={item.src} onChange={e=>updateGalleryItem(item.id, { src: e.target.value })} placeholder="URL src" style={{ fontSize:11, padding:"6px 8px", marginBottom:8 }} />
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        <button className="btn-pearl-capsule" style={{ fontSize:11, padding:"4px 8px" }} onClick={()=>moveGallery(idx,-1)} disabled={idx===0}>↑</button>
                        <button className="btn-pearl-capsule" style={{ fontSize:11, padding:"4px 8px" }} onClick={()=>moveGallery(idx,1)} disabled={idx===gallery.length-1}>↓</button>
                        <label className="btn-pearl-capsule" style={{ fontSize:11, padding:"4px 8px", cursor:"pointer" }}>
                          Ganti
                          <input type="file" accept="image/*" hidden onChange={e=>{ const f=e.target.files?.[0]; if(f) handleImageUpload(f, url=>updateGalleryItem(item.id,{src:url}), `g-${item.id}`); }} />
                        </label>
                        <button className={item.active?"btn-pearl-capsule":"btn-primary"} style={{ fontSize:11, padding:"4px 8px", marginLeft:"auto" }} onClick={()=>updateGalleryItem(item.id,{active:!item.active})}>{item.active?"Sembunyikan":"Aktifkan"}</button>
                        <button className="btn-pearl-capsule" style={{ fontSize:11, padding:"4px 8px", color:"crimson" }} onClick={()=> { if(confirm("Hapus foto ini?")) removeGallery(item.id); }}><Icon name="trash" size={12}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop:20, display:"flex", gap:10, justifyContent:"flex-end", borderTop:"1px solid var(--color-hairline)", paddingTop:16 }}>
            <button className="btn-primary" onClick={()=>save()} style={{ padding:"10px 18px" }}>Simpan Perubahan</button>
          </div>
        </div>

        <div className="card" style={{ marginTop:16, padding:14, background:"#fffbeb", border:"1px solid #fcd34d" }}>
          <p className="text-caption-strong" style={{ color:"#92400e" }}>Cara kerja:</p>
          <ul style={{ margin:"6px 0 0 18px", color:"#78350f", fontSize:13, lineHeight:1.6 }}>
            <li>Semua perubahan disimpan di <code>localStorage</code> browser — langsung terlihat di preview tanpa deploy.</li>
            <li>Jika env <code>NEXT_PUBLIC_SUPABASE_URL</code> ada, otomatis sync ke tabel <code>site_content (id=1, data jsonb)</code> & <code>gallery_images</code> dan bucket <code>wedding-assets</code>.</li>
            <li>SQL ada di <code>supabase/cms-schema.sql</code> — jalankan sekali di Supabase SQL Editor.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
