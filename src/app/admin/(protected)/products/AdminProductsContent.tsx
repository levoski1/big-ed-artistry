'use client'
import { useState, useTransition } from 'react'
import Image from 'next/image'
import { formatPrice } from '@/lib/tokens'
import { createProduct, updateProduct, deleteProduct, uploadProductImage } from '@/app/actions/products'
import type { Database } from '@/lib/types/database'

type Product = Database['public']['Tables']['products']['Row']
type Category = Database['public']['Enums']['product_category']

const CATEGORIES: Category[] = ['print', 'canvas', 'bundle', 'frame']
const inputStyle = { width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '10px 12px', color: 'var(--text-primary)', fontFamily: '"Libre Franklin",sans-serif', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }
const labelStyle: React.CSSProperties = { fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6, display: 'block' }

export default function AdminProductsContent({ products: initial }: { products: Product[] }) {
  const [products, setProducts] = useState(initial)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [draft, setDraft] = useState<Partial<Product>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setEditing(null)
    setDraft({ in_stock: true, featured: false, rating: 4, category: 'print' })
    setImageFile(null); setImagePreview('')
    setShowForm(true); setError('')
  }

  const openEdit = (p: Product) => {
    setEditing(p); setDraft(p)
    setImageFile(null); setImagePreview(p.image_url ?? '')
    setShowForm(true); setError('')
  }

  const closeForm = () => { setShowForm(false); setEditing(null); setDraft({}); setImageFile(null); setImagePreview(''); setError('') }

  const handleImageFile = (f: File) => {
    setImageFile(f)
    setImagePreview(URL.createObjectURL(f))
  }

  const handleSave = () => {
    if (!draft.name || !draft.price || !draft.category) { setError('Name, price and category are required.'); return }
    setError('')
    startTransition(async () => {
      try {
        let imageUrl = draft.image_url ?? null
        if (imageFile) {
          const fd = new FormData()
          fd.append('file', imageFile)
          imageUrl = await uploadProductImage(fd)
        }

        const slug = draft.slug ?? draft.name!.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const payload = {
          name: draft.name!,
          slug,
          description: draft.description ?? null,
          price: Number(draft.price),
          original_price: draft.original_price ? Number(draft.original_price) : null,
          category: draft.category as Category,
          badge: draft.badge ?? null,
          in_stock: draft.in_stock ?? true,
          featured: draft.featured ?? false,
          image_url: imageUrl,
        }

        if (editing) {
          const updated = await updateProduct(editing.id, payload)
          setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))
        } else {
          const created = await createProduct(payload)
          setProducts(prev => [created, ...prev])
        }
        closeForm()
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Save failed.')
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this product?')) return
    startTransition(async () => {
      try {
        await deleteProduct(id)
        setProducts(prev => prev.filter(p => p.id !== id))
        if (editing?.id === id) closeForm()
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Delete failed.')
      }
    })
  }

  const handleToggle = (id: string, field: 'in_stock' | 'featured') => {
    const product = products.find(p => p.id === id)
    if (!product) return
    startTransition(async () => {
      try {
        const updated = await updateProduct(id, { [field]: !product[field] })
        setProducts(prev => prev.map(p => p.id === id ? updated : p))
      } catch { /* ignore */ }
    })
  }

  return (
    <div style={{ padding: 36, minHeight: '100vh' }} className="admin-products-page">
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Admin Panel</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40 }}>Product <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Management</span></h1>
        </div>
        <button onClick={openAdd} style={{ padding: '12px 24px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: 'var(--text-on-gold)', border: 'none', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>+ Add Product</button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }} className="products-filters">
        <input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
        <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>{filtered.length} products</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showForm ? '1fr 400px' : '1fr', gap: 24, alignItems: 'start' }} className="products-layout">
        {/* Product table */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px 2fr 1fr 1fr 80px 80px 100px', padding: '12px 20px', borderBottom: '1px solid var(--border-color)' }} className="products-table-head">
            {['', 'Product', 'Price', 'Category', 'Stock', 'Featured', 'Actions'].map(h => (
              <div key={h} style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</div>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>No products yet. Add your first product.</div>
          ) : filtered.map(p => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '60px 2fr 1fr 1fr 80px 80px 100px', padding: '12px 20px', borderBottom: '1px solid var(--border-color)', alignItems: 'center', background: editing?.id === p.id ? 'rgba(184,134,11,0.04)' : 'transparent' }} className="product-row">
              {/* Thumbnail */}
              <div style={{ width: 48, height: 48, background: 'var(--bg-dark)', border: '1px solid var(--border-color)', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                {p.image_url ? (
                  <Image src={p.image_url} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="48px" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, opacity: 0.3 }}>🖼️</div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                {p.badge && <span style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(184,134,11,0.15)', color: 'var(--gold-light)', letterSpacing: '0.08em' }}>{p.badge}</span>}
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--gold-light)' }}>{formatPrice(p.price)}</div>
                {p.original_price && <div style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{formatPrice(p.original_price)}</div>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{p.category}</div>
              <button onClick={() => handleToggle(p.id, 'in_stock')} style={{ fontSize: 11, padding: '4px 10px', background: p.in_stock ? 'rgba(74,124,89,0.15)' : 'rgba(139,58,58,0.15)', color: p.in_stock ? 'var(--success)' : 'var(--danger)', border: `1px solid ${p.in_stock ? 'rgba(74,124,89,0.3)' : 'rgba(139,58,58,0.3)'}`, cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>
                {p.in_stock ? 'In Stock' : 'Out'}
              </button>
              <button onClick={() => handleToggle(p.id, 'featured')} style={{ fontSize: 11, padding: '4px 10px', background: p.featured ? 'rgba(184,134,11,0.15)' : 'transparent', color: p.featured ? 'var(--gold-light)' : 'var(--text-muted)', border: '1px solid var(--border-color)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>
                {p.featured ? '★ Yes' : '☆ No'}
              </button>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => openEdit(p)} style={{ fontSize: 11, padding: '5px 10px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>Edit</button>
                <button onClick={() => handleDelete(p.id)} style={{ fontSize: 11, padding: '5px 10px', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>Del</button>
              </div>
              <div className="product-row-meta" style={{ display: 'none', gridColumn: '1 / -1', marginTop: 6, gap: 8, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>{p.category}</span>
                <span style={{ color: 'var(--gold-light)' }}>{formatPrice(p.price)}</span>
                <span style={{ color: p.in_stock ? 'var(--success)' : 'var(--danger)' }}>{p.in_stock ? 'In Stock' : 'Out of Stock'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit form */}
        {showForm && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: 28, position: 'sticky', top: 24, maxHeight: '90vh', overflowY: 'auto' }} className="product-form-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24 }}>{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={closeForm} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', fontSize: 12 }}>{error}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Image upload */}
              <div>
                <label style={labelStyle}>Product Image</label>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: imagePreview ? 0 : '24px 16px', background: 'var(--bg-dark)', border: imageFile ? '1px solid var(--success)' : '1px dashed var(--border-color)', cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s' }}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleImageFile(e.target.files[0]) }} />
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} />
                      <div style={{ padding: '6px 12px', fontSize: 11, color: 'var(--text-muted)' }}>Click to change image</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 28 }}>🖼️</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Click to upload product image</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>JPG, PNG, WebP</div>
                    </>
                  )}
                </label>
              </div>

              <div><label style={labelStyle}>Name *</label><input style={inputStyle} value={draft.name ?? ''} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="Product name" /></div>
              <div><label style={labelStyle}>Slug (auto-generated if empty)</label><input style={inputStyle} value={draft.slug ?? ''} onChange={e => setDraft(d => ({ ...d, slug: e.target.value }))} placeholder="product-slug" /></div>
              <div><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, resize: 'none', minHeight: 80 }} value={draft.description ?? ''} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} placeholder="Product description" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>Price (₦) *</label><input type="number" style={inputStyle} value={draft.price ?? ''} onChange={e => setDraft(d => ({ ...d, price: Number(e.target.value) }))} placeholder="25000" /></div>
                <div><label style={labelStyle}>Original Price (₦)</label><input type="number" style={inputStyle} value={draft.original_price ?? ''} onChange={e => setDraft(d => ({ ...d, original_price: e.target.value ? Number(e.target.value) : null }))} placeholder="30000" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} value={draft.category ?? 'print'} onChange={e => setDraft(d => ({ ...d, category: e.target.value as Category }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Badge</label><input style={inputStyle} value={draft.badge ?? ''} onChange={e => setDraft(d => ({ ...d, badge: e.target.value || null }))} placeholder="Sale, Popular…" /></div>
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={draft.in_stock ?? true} onChange={e => setDraft(d => ({ ...d, in_stock: e.target.checked }))} style={{ accentColor: 'var(--gold-primary)' }} />
                  In Stock
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={draft.featured ?? false} onChange={e => setDraft(d => ({ ...d, featured: e.target.checked }))} style={{ accentColor: 'var(--gold-primary)' }} />
                  Featured on Homepage
                </label>
              </div>
              <button onClick={handleSave} disabled={isPending} style={{ padding: '12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: isPending ? 'var(--bg-dark)' : 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: isPending ? 'var(--text-muted)' : 'var(--text-on-gold)', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>
                {isPending ? 'Saving…' : editing ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style suppressHydrationWarning>{`
        @media (max-width: 700px) {
          .admin-products-page { padding: 16px !important; }
          .products-filters { flex-direction: column !important; }
          .products-filters input { width: 100% !important; }
          .products-layout { grid-template-columns: 1fr !important; }
          .products-table-head { display: none !important; }
          .product-row {
            grid-template-columns: 1fr 1fr !important;
            padding: 14px 16px !important;
            gap: 6px 12px;
          }
          .product-row > div:nth-child(1) { grid-row: 1 / 2; }
          .product-row > div:nth-child(2) { grid-column: 2 / -1; }
          .product-row > div:nth-child(3),
          .product-row > div:nth-child(4),
          .product-row > div:nth-child(5),
          .product-row > div:nth-child(6) { display: none !important; }
          .product-row-meta { display: flex !important; }
          .product-form-panel { position: static !important; max-height: none !important; }
        }
        @media (min-width: 701px) and (max-width: 1024px) {
          .admin-products-page { padding: 20px !important; }
          .products-layout { grid-template-columns: 1fr !important; }
          .product-form-panel { position: static !important; max-height: none !important; }
          .product-row { grid-template-columns: 60px 2fr 1fr 1fr 80px 80px !important; }
          .product-row > div:nth-child(7) { display: none !important; }
        }
      `}</style>
    </div>
  )
}
