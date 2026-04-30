'use client'
import { useState, useTransition } from 'react'
import Image from 'next/image'
import { createGalleryItem, updateGalleryItem, deleteGalleryItem, type GalleryItem } from '@/app/actions/gallery'

const CATEGORIES = ['portrait', 'couple', 'family', 'wedding', 'memorial', 'other']
const inputStyle = { width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '10px 12px', color: 'var(--text-primary)', fontFamily: '"Libre Franklin",sans-serif', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }
const labelStyle: React.CSSProperties = { fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6, display: 'block' }

export default function AdminGalleryContent({ items: initial }: { items: GalleryItem[] }) {
  const [items, setItems] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<GalleryItem | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [draft, setDraft] = useState<Partial<GalleryItem>>({})
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const openAdd = () => {
    setEditing(null)
    setDraft({ category: 'portrait', year: new Date().getFullYear(), featured: false, medium: 'Pencil on Paper' })
    setFile(null); setPreview(''); setShowForm(true); setError('')
  }

  const openEdit = (item: GalleryItem) => {
    setEditing(item); setDraft(item); setFile(null); setPreview(item.image_url); setShowForm(true); setError('')
  }

  const closeForm = () => { setShowForm(false); setEditing(null); setDraft({}); setFile(null); setPreview(''); setError('') }

  const handleFile = (f: File) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSave = () => {
    if (!draft.title || !draft.category) { setError('Title and category are required.'); return }
    if (!editing && !file) { setError('Please upload an image.'); return }
    setError('')
    startTransition(async () => {
      try {
        if (editing) {
          const updated = await updateGalleryItem(editing.id, {
            title: draft.title,
            medium: draft.medium ?? 'Pencil on Paper',
            size: draft.size ?? null,
            year: draft.year ?? new Date().getFullYear(),
            category: draft.category!,
            description: draft.description ?? null,
            featured: draft.featured ?? false,
          })
          setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
        } else {
          const formData = new FormData()
          formData.append('file', file!)
          const created = await createGalleryItem(formData, {
            title: draft.title!,
            medium: draft.medium ?? 'Pencil on Paper',
            size: draft.size ?? undefined,
            year: draft.year ?? new Date().getFullYear(),
            category: draft.category!,
            description: draft.description ?? undefined,
            featured: draft.featured ?? false,
          })
          setItems(prev => [created, ...prev])
        }
        closeForm()
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Save failed.')
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this gallery item?')) return
    startTransition(async () => {
      try {
        await deleteGalleryItem(id)
        setItems(prev => prev.filter(i => i.id !== id))
        if (editing?.id === id) closeForm()
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Delete failed.')
      }
    })
  }

  const handleToggleFeatured = (id: string, current: boolean) => {
    startTransition(async () => {
      try {
        const updated = await updateGalleryItem(id, { featured: !current })
        setItems(prev => prev.map(i => i.id === id ? updated : i))
      } catch { /* ignore */ }
    })
  }

  return (
    <div style={{ padding: 36, minHeight: '100vh' }}>
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Admin Panel</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40 }}>Gallery <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Management</span></h1>
        </div>
        <button onClick={openAdd} style={{ padding: '12px 24px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: 'var(--text-on-gold)', border: 'none', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>+ Upload Artwork</button>
      </div>

      {error && <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', fontSize: 13 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: showForm ? '1fr 400px' : '1fr', gap: 24, alignItems: 'start' }}>
        {/* Gallery grid */}
        <div>
          {items.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🖼️</div>
              <div style={{ marginBottom: 20 }}>No gallery items yet. Upload your first artwork.</div>
              <button onClick={openAdd} style={{ padding: '12px 24px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: 'var(--text-on-gold)', border: 'none', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>Upload Artwork</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {items.map(item => (
                <div key={item.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                  <div style={{ height: 200, position: 'relative', overflow: 'hidden', background: 'var(--bg-dark)' }}>
                    <Image src={item.image_url} alt={item.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 33vw" />
                    {item.featured && <div style={{ position: 'absolute', top: 8, left: 8, padding: '3px 8px', background: 'var(--gold-primary)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-on-gold)' }}>Featured</div>}
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>{item.medium} · {item.year} · {item.category}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleToggleFeatured(item.id, item.featured)} style={{ flex: 1, padding: '6px', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', background: item.featured ? 'rgba(184,134,11,0.15)' : 'transparent', color: item.featured ? 'var(--gold-light)' : 'var(--text-muted)', border: '1px solid var(--border-color)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>
                        {item.featured ? '★ Featured' : '☆ Feature'}
                      </button>
                      <button onClick={() => openEdit(item)} style={{ padding: '6px 12px', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>Edit</button>
                      <button onClick={() => handleDelete(item.id)} style={{ padding: '6px 12px', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>Del</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload/Edit form */}
        {showForm && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: 28, position: 'sticky', top: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24 }}>{editing ? 'Edit Artwork' : 'Upload Artwork'}</h3>
              <button onClick={closeForm} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', fontSize: 12 }}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Image upload */}
              {!editing && (
                <div>
                  <label style={labelStyle}>Artwork Image *</label>
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '32px 16px', background: 'var(--bg-dark)', border: file ? '1px solid var(--success)' : '1px dashed var(--border-color)', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
                    {preview ? (
                      <img src={preview} alt="Preview" style={{ maxHeight: 160, maxWidth: '100%', objectFit: 'contain' }} />
                    ) : (
                      <><div style={{ fontSize: 28 }}>🖼️</div><div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Click to upload image</div></>
                    )}
                  </label>
                </div>
              )}
              {editing && preview && (
                <div style={{ height: 140, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img src={preview} alt="Current" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div><label style={labelStyle}>Title *</label><input style={inputStyle} value={draft.title ?? ''} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} placeholder="Portrait of…" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>Medium</label><input style={inputStyle} value={draft.medium ?? ''} onChange={e => setDraft(d => ({ ...d, medium: e.target.value }))} placeholder="Pencil on Paper" /></div>
                <div><label style={labelStyle}>Year</label><input type="number" style={inputStyle} value={draft.year ?? ''} onChange={e => setDraft(d => ({ ...d, year: Number(e.target.value) }))} placeholder="2024" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} value={draft.category ?? 'portrait'} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Size</label><input style={inputStyle} value={draft.size ?? ''} onChange={e => setDraft(d => ({ ...d, size: e.target.value || null }))} placeholder="16×20 in" /></div>
              </div>
              <div><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, resize: 'none', minHeight: 70 }} value={draft.description ?? ''} onChange={e => setDraft(d => ({ ...d, description: e.target.value || null }))} placeholder="Brief description…" /></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={draft.featured ?? false} onChange={e => setDraft(d => ({ ...d, featured: e.target.checked }))} style={{ accentColor: 'var(--gold-primary)' }} />
                Feature on homepage
              </label>
              <button onClick={handleSave} disabled={isPending} style={{ padding: '12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: isPending ? 'var(--bg-dark)' : 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: isPending ? 'var(--text-muted)' : 'var(--text-on-gold)', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>
                {isPending ? 'Saving…' : editing ? 'Save Changes' : 'Upload Artwork'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
