'use client'
import { useState } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import { PageHero } from '@/components/ui'
import { formatPrice } from '@/lib/tokens'
import { useCart } from '@/context/CartContext'
import type { Database } from '@/lib/types/database'

type Product = Database['public']['Tables']['products']['Row']

const categories = ['All', 'print', 'canvas', 'bundle', 'frame']

export default function StorePageContent({ products }: { products: Product[] }) {
  const [active, setActive] = useState('All')
  const { addStoreItem } = useCart()
  const filtered = active === 'All' ? products : products.filter(p => p.category === active)

  return (
    <PublicLayout>
      <PageHero tag="Store" title={<>Art Products <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>&amp; Prints</span></>} subtitle="Browse portrait prints, canvas wraps, frames, and bundles — each with ratings and direct cart ordering." />
      <div style={{ padding: '36px 0', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActive(cat)} style={{ padding: '9px 20px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', background: active === cat ? 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))' : 'transparent', color: active === cat ? 'var(--text-on-gold)' : 'var(--text-secondary)', border: active === cat ? 'none' : '1px solid var(--border-color)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif', fontWeight: active === cat ? 600 : 400, transition: 'all 0.2s' }}>
                {cat === 'All' ? 'All Products' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} products</div>
        </div>
      </div>
      <section style={{ padding: '60px 0 100px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>◇</div>
              <div>No products in this category yet.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }} className="store-grid">
              {filtered.map(p => (
                <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: 200, background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.1 }}><rect x="8" y="8" width="32" height="32" stroke="#D4A84B" strokeWidth="1" /></svg>
                    {p.badge && <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color: 'var(--text-on-gold)' }}>{p.badge}</div>}
                    {!p.in_stock && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Out of Stock</div>}
                  </div>
                  <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{p.category}</div>
                    <div style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 20, color: 'var(--text-primary)' }}>{p.name}</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1 }}>{p.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      <div>
                        <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 22, color: 'var(--gold-light)' }}>{formatPrice(p.price)}</span>
                        {p.original_price && <span style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: 8 }}>{formatPrice(p.original_price)}</span>}
                      </div>
                    </div>
                    <button
                      disabled={!p.in_stock}
                      onClick={() => addStoreItem({ id: p.id, name: p.name, slug: p.slug, description: p.description ?? '', price: p.price, originalPrice: p.original_price ?? undefined, category: p.category, badge: p.badge ?? undefined, inStock: p.in_stock, featured: p.featured, rating: p.rating })}
                      style={{ marginTop: 8, padding: '12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: p.in_stock ? 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))' : 'var(--bg-dark)', color: p.in_stock ? 'var(--text-on-gold)' : 'var(--text-muted)', border: p.in_stock ? 'none' : '1px solid var(--border-color)', cursor: p.in_stock ? 'pointer' : 'not-allowed', fontFamily: '"Libre Franklin",sans-serif' }}
                    >
                      {p.in_stock ? '+ Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <style>{`@media(max-width:900px){.store-grid{grid-template-columns:repeat(2,1fr)!important;}}@media(max-width:540px){.store-grid{grid-template-columns:1fr!important;}}`}</style>
    </PublicLayout>
  )
}
