'use client'
import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'
import StarRating from '@/components/ui/StarRating'
import { formatPrice } from '@/lib/tokens'
import { useCart } from '@/context/CartContext'
import type { Database } from '@/lib/types/database'

type Product = Database['public']['Tables']['products']['Row']

interface Props {
  product: Product
  related: Product[]
}

export default function ProductDetailClient({ product, related }: Props) {
  const { addStoreItem, rateProduct, state } = useCart()
  const userRating = state.ratings[product.id]

  const handleAdd = () => {
    if (!product.in_stock) return
    addStoreItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description ?? '',
      price: product.price,
      originalPrice: product.original_price ?? undefined,
      category: product.category,
      badge: product.badge ?? undefined,
      inStock: product.in_stock,
      featured: product.featured,
      rating: product.rating,
    })
  }

  return (
    <PublicLayout>
      <div style={{ paddingTop: 100 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', paddingBottom: 32 }}>
            <Link href="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
            <span>›</span>
            <Link href="/store" style={{ color: 'var(--text-muted)' }}>Store</Link>
            <span>›</span>
            <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
          </div>
        </div>
      </div>

      <section style={{ paddingBottom: 100 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }} className="pd-grid">
            {/* Image placeholder */}
            <div>
              <div style={{ aspectRatio: '4/5', background: 'var(--bg-card)', border: '1px solid var(--border-color)', marginBottom: 10, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="64" height="64" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.1 }}>
                  <circle cx="24" cy="16" r="10" stroke="#D4A84B" strokeWidth="1" />
                  <path d="M6 44c0-9.941 8.059-18 18-18s18 8.059 18 18" stroke="#D4A84B" strokeWidth="1" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(184,134,11,0.02) 28px,rgba(184,134,11,0.02) 29px)' }} />
                {product.badge && <span style={{ position: 'absolute', top: 16, left: 16, padding: '5px 12px', background: 'var(--gold-primary)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-on-gold)' }}>{product.badge}</span>}
                {!product.in_stock && <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,14,12,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '10px 20px' }}>Out of Stock</span></div>}
              </div>
            </div>

            {/* Info */}
            <div style={{ paddingTop: 8 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>{product.category}</div>
              <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(36px,4vw,52px)', fontWeight: 500, lineHeight: 1.1, marginBottom: 16 }}>{product.name}</h1>

              <div style={{ marginBottom: 18 }}>
                <StarRating productId={product.id} initialRating={product.rating} userRating={userRating} onRate={rateProduct} size={16} />
              </div>

              <div style={{ marginBottom: product.original_price ? 4 : 28 }}>
                <span style={{ color: 'var(--gold-light)', fontSize: 36, fontFamily: '"Cormorant Garamond", serif', fontWeight: 500 }}>{formatPrice(product.price)}</span>
                {product.original_price && <del style={{ color: 'var(--text-muted)', fontSize: 20, marginLeft: 12 }}>{formatPrice(product.original_price)}</del>}
              </div>
              {product.original_price && (
                <div style={{ fontSize: 12, color: 'var(--success)', letterSpacing: '0.08em', marginBottom: 28 }}>
                  You save {formatPrice(product.original_price - product.price)}
                </div>
              )}

              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.9, marginBottom: 32 }}>{product.description}</p>

              <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '20px 0', marginBottom: 28 }}>
                {[
                  ['Availability', product.in_stock ? '✓ In Stock' : '✗ Out of Stock', product.in_stock ? 'var(--success)' : 'var(--danger)'],
                  ['Category', product.category.charAt(0).toUpperCase() + product.category.slice(1), 'var(--text-primary)'],
                  ['Delivery', 'Physical artwork + digital scan', 'var(--text-primary)'],
                  ['Payment', 'Full or 50% deposit accepted', 'var(--text-primary)'],
                ].map(([l, v, c]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                    <span style={{ color: c }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <button onClick={handleAdd} disabled={!product.in_stock} style={{ flex: 1, minWidth: 160, padding: '16px', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: !product.in_stock ? 'var(--bg-dark)' : 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color: product.in_stock ? 'var(--text-on-gold)' : 'var(--text-muted)', border: product.in_stock ? 'none' : '1px solid var(--border-color)', cursor: product.in_stock ? 'pointer' : 'not-allowed', fontFamily: '"Libre Franklin", sans-serif', transition: 'all 0.3s' }}>
                  {product.in_stock ? '+ Add to Cart' : 'Out of Stock'}
                </button>
                <Link href="/custom-artwork" style={{ padding: '16px 20px', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>Custom →</Link>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>All orders confirmed within 24 hours. Payment via bank transfer — proof required to begin.</p>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40, marginBottom: 36 }}>You Might Also <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Like</span></h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="related-grid">
              {related.map(p => (
                <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: 160, background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.1 }}><circle cx="24" cy="16" r="10" stroke="#D4A84B" strokeWidth="1" /><path d="M6 44c0-9.941 8.059-18 18-18s18 8.059 18 18" stroke="#D4A84B" strokeWidth="1" /></svg>
                  </div>
                  <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{p.category}</div>
                    <Link href={`/product/${p.slug}`} style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 18, color: 'var(--text-primary)' }}>{p.name}</Link>
                    <div style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 20, color: 'var(--gold-light)', marginTop: 'auto', paddingTop: 8 }}>{formatPrice(p.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <style>{`@media(max-width:900px){.pd-grid,.related-grid{grid-template-columns:1fr!important;}}`}</style>
    </PublicLayout>
  )
}
