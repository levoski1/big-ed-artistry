'use client'
import { useState } from 'react'
import { mockProducts } from '@/lib/mockData'
import { formatPrice } from '@/lib/tokens'
import type { StoreProduct } from '@/context/CartContext'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<StoreProduct[]>(mockProducts)
  const [editing, setEditing] = useState<StoreProduct | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [draft, setDraft] = useState<Partial<StoreProduct>>({})
  const [search, setSearch] = useState('')

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))

  const openEdit = (p: StoreProduct) => { setEditing(p); setDraft(p); setShowAdd(false) }
  const openAdd = () => { setShowAdd(true); setEditing(null); setDraft({ inStock:true, rating:4, featured:false }) }
  const closeForms = () => { setEditing(null); setShowAdd(false); setDraft({}) }

  const saveEdit = () => {
    if (!editing) return
    setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, ...draft } as StoreProduct : p))
    closeForms()
  }

  const saveAdd = () => {
    if (!draft.name || !draft.price) return
    const newP: StoreProduct = {
      id: `prod-${Date.now()}`,
      name: draft.name || '',
      slug: (draft.name || '').toLowerCase().replace(/\s+/g,'-'),
      description: draft.description || '',
      price: Number(draft.price) || 0,
      originalPrice: draft.originalPrice ? Number(draft.originalPrice) : undefined,
      category: draft.category || 'print',
      badge: draft.badge,
      inStock: draft.inStock ?? true,
      featured: draft.featured ?? false,
      rating: 4,
    }
    setProducts(prev => [newP, ...prev])
    closeForms()
  }

  const toggleFeatured = (id: string) => setProducts(prev => prev.map(p => p.id === id ? { ...p, featured: !p.featured } : p))
  const toggleStock = (id: string) => setProducts(prev => prev.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p))
  const deleteProduct = (id: string) => { if (confirm('Delete this product?')) setProducts(prev => prev.filter(p => p.id !== id)) }

  const inputStyle = { width:'100%', background:'var(--bg-dark)', border:'1px solid var(--border-color)', padding:'10px 12px', color:'var(--text-primary)', fontFamily:'"Libre Franklin",sans-serif', fontSize:13, outline:'none' }
  const labelStyle: React.CSSProperties = { fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:6, display:'block' }

  return (
    <div style={{ padding:36, minHeight:'100vh' }}>
      <div style={{ marginBottom:28, paddingBottom:20, borderBottom:'1px solid var(--border-color)', display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <h1 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:40 }}>Product <span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>Management</span></h1>
        <button onClick={openAdd} style={{ padding:'10px 20px', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', background:'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color:'var(--text-on-gold)', border:'none', cursor:'pointer', fontFamily:'"Libre Franklin",sans-serif' }}>+ Add Product</button>
      </div>

      <div style={{ marginBottom:20 }}>
        <input placeholder="Search products…" value={search} onChange={e=>setSearch(e.target.value)} style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', padding:'9px 16px', color:'var(--text-primary)', fontFamily:'"Libre Franklin",sans-serif', fontSize:12, outline:'none', width:280 }}/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:(editing || showAdd) ? '1fr 360px' : '1fr', gap:20, alignItems:'start' }}>
        {/* Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }} className="prod-mgmt-grid">
          {filtered.map(p => (
            <div key={p.id} style={{ background:'var(--bg-card)', border:`1px solid ${editing?.id===p.id?'var(--gold-primary)':'var(--border-color)'}`, overflow:'hidden' }}>
              <div style={{ height:120, background:'var(--bg-dark)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                <svg width="36" height="36" viewBox="0 0 48 48" fill="none" style={{ opacity:0.1 }}><rect x="8" y="8" width="32" height="32" stroke="#D4A84B" strokeWidth="1"/></svg>
                <div style={{ position:'absolute', top:8, left:8, display:'flex', gap:4 }}>
                  {p.badge && <span style={{ fontSize:9, padding:'2px 7px', background:'var(--gold-primary)', color:'var(--text-on-gold)', fontWeight:700 }}>{p.badge}</span>}
                  {p.featured && <span style={{ fontSize:9, padding:'2px 7px', background:'rgba(184,134,11,0.2)', color:'var(--gold-light)', border:'1px solid var(--gold-dark)' }}>Featured</span>}
                </div>
                <span style={{ position:'absolute', top:8, right:8, fontSize:9, padding:'3px 8px', background:p.inStock?'rgba(74,124,89,0.2)':'rgba(139,58,58,0.2)', color:p.inStock?'var(--success)':'var(--danger)', border:`1px solid ${p.inStock?'rgba(74,124,89,0.3)':'rgba(139,58,58,0.3)'}` }}>{p.inStock?'In Stock':'Out'}</span>
              </div>
              <div style={{ padding:'14px 16px' }}>
                <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:4 }}>{p.category}</div>
                <div style={{ fontSize:14, fontWeight:500, marginBottom:4 }}>{p.name}</div>
                <div style={{ fontSize:13, color:'var(--gold-light)', marginBottom:12 }}>{formatPrice(p.price)}</div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => openEdit(p)} style={{ flex:1, padding:'7px', fontSize:10, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', background:'var(--bg-dark)', border:'1px solid var(--border-color)', color:'var(--text-secondary)', cursor:'pointer', fontFamily:'"Libre Franklin",sans-serif' }}>Edit</button>
                  <button onClick={() => toggleFeatured(p.id)} title={p.featured?'Remove from featured':'Add to featured'} style={{ padding:'7px 10px', background:'var(--bg-dark)', border:'1px solid var(--border-color)', color: p.featured?'var(--gold-light)':'var(--text-muted)', cursor:'pointer', fontSize:12 }}>★</button>
                  <button onClick={() => toggleStock(p.id)} style={{ padding:'7px 10px', background:'var(--bg-dark)', border:'1px solid var(--border-color)', color:'var(--text-muted)', cursor:'pointer', fontSize:11 }}>{p.inStock?'↓':'↑'}</button>
                  <button onClick={() => deleteProduct(p.id)} style={{ padding:'7px 10px', background:'var(--bg-dark)', border:'1px solid rgba(139,58,58,0.4)', color:'var(--danger)', cursor:'pointer', fontSize:11 }}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit / Add form */}
        {(editing || showAdd) && (
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--gold-dark)', padding:28, position:'sticky', top:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:22 }}>{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={closeForms} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:18 }}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[
                { k:'name', l:'Product Name *', ph:'Single Portrait Print' },
                { k:'description', l:'Description', ph:'Brief product description…', ta:true },
                { k:'price', l:'Price (₦) *', ph:'12000', type:'number' },
                { k:'originalPrice', l:'Original Price (₦)', ph:'15000', type:'number' },
                { k:'badge', l:'Badge', ph:'Sale / Popular / Bundle' },
              ].map(({ k,l,ph,ta,type }) => (
                <div key={k}>
                  <label style={labelStyle}>{l}</label>
                  {ta ? (
                    <textarea style={{ ...inputStyle, resize:'none', minHeight:70 }} placeholder={ph} value={(draft as Record<string,string>)[k] || ''} onChange={e => setDraft(d => ({ ...d, [k]: e.target.value }))}/>
                  ) : (
                    <input type={type||'text'} style={inputStyle} placeholder={ph} value={(draft as Record<string,string>)[k] || ''} onChange={e => setDraft(d => ({ ...d, [k]: e.target.value }))}/>
                  )}
                </div>
              ))}
              <div>
                <label style={labelStyle}>Category</label>
                <select style={{ ...inputStyle, appearance:'none', cursor:'pointer' }} value={draft.category||'print'} onChange={e => setDraft(d => ({ ...d, category:e.target.value }))}>
                  {['print','canvas','bundle','frame'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', gap:12 }}>
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'var(--text-secondary)' }}>
                  <input type="checkbox" checked={!!draft.inStock} onChange={e => setDraft(d => ({ ...d, inStock:e.target.checked }))} style={{ accentColor:'var(--gold-primary)', width:14, height:14 }}/>
                  In Stock
                </label>
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'var(--text-secondary)' }}>
                  <input type="checkbox" checked={!!draft.featured} onChange={e => setDraft(d => ({ ...d, featured:e.target.checked }))} style={{ accentColor:'var(--gold-primary)', width:14, height:14 }}/>
                  Featured on Homepage
                </label>
              </div>
              <button onClick={editing ? saveEdit : saveAdd} style={{ padding:'13px', fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', background:'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color:'var(--text-on-gold)', border:'none', cursor:'pointer', fontFamily:'"Libre Franklin",sans-serif' }}>
                {editing ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@media(max-width:900px){.prod-mgmt-grid{grid-template-columns:1fr 1fr!important;}}`}</style>
    </div>
  )
}
