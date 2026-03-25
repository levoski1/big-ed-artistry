'use client'
import { useState } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'
import ProductCard from '@/components/ui/ProductCard'
import StarRating from '@/components/ui/StarRating'
import { mockProducts } from '@/lib/mockData'
import { formatPrice } from '@/lib/tokens'
import { useCart } from '@/context/CartContext'

export default function ProductDetailClient({ slug }: { slug: string }) {
  const product = mockProducts.find(p => p.slug === slug) ?? mockProducts[0]
  const related = [
    ...mockProducts.filter(p => p.id !== product.id && p.category === product.category),
    ...mockProducts.filter(p => p.id !== product.id && p.category !== product.category),
  ].slice(0, 3)

  const { addStoreItem, rateProduct, state } = useCart()
  const [added, setAdded] = useState(false)
  const userRating = state.ratings[product.id]

  const handleAdd = () => {
    if (!product.inStock) return
    addStoreItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 3000)
  }

  return (
    <PublicLayout>
      {/* Breadcrumb */}
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

      {/* Main */}
      <section style={{ paddingBottom: 100 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }} className="pd-grid">
            {/* Image */}
            <div>
              <div style={{ aspectRatio: '4/5', background: 'var(--bg-card)', border: '1px solid var(--border-color)', marginBottom: 10, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="64" height="64" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.1 }}>
                  <circle cx="24" cy="16" r="10" stroke="#D4A84B" strokeWidth="1" />
                  <path d="M6 44c0-9.941 8.059-18 18-18s18 8.059 18 18" stroke="#D4A84B" strokeWidth="1" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(184,134,11,0.02) 28px,rgba(184,134,11,0.02) 29px)' }} />
                {product.badge && (
                  <span style={{ position: 'absolute', top: 16, left: 16, padding: '5px 12px', background: 'var(--gold-primary)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-on-gold)' }}>
                    {product.badge}
                  </span>
                )}
                {!product.inStock && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,14,12,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '10px 20px' }}>Out of Stock</span>
                  </div>
                )}
              </div>
              {/* Thumbnails */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ aspectRatio: '1', background: 'var(--bg-card)', border: i === 1 ? '1px solid var(--gold-dark)' : '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: i === 1 ? 1 : 0.4 }}>
                    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.2 }}>
                      <circle cx="24" cy="16" r="10" stroke="#D4A84B" strokeWidth="1" />
                      <path d="M6 44c0-9.941 8.059-18 18-18s18 8.059 18 18" stroke="#D4A84B" strokeWidth="1" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <div style={{ paddingTop: 8 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
                {product.category}
              </div>
              <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(36px,4vw,52px)', fontWeight: 500, lineHeight: 1.1, marginBottom: 16 }}>
                {product.name}
              </h1>

              {/* Stars */}
              <div style={{ marginBottom: 18 }}>
                <StarRating
                  productId={product.id}
                  initialRating={product.rating}
                  userRating={userRating}
                  onRate={rateProduct}
                  size={16}
                />
              </div>

              {/* Price */}
              <div style={{ marginBottom: product.originalPrice ? 4 : 28 }}>
                <span style={{ color: 'var(--gold-light)', fontSize: 36, fontFamily: '"Cormorant Garamond", serif', fontWeight: 500 }}>
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <del style={{ color: 'var(--text-muted)', fontSize: 20, marginLeft: 12 }}>
                    {formatPrice(product.originalPrice)}
                  </del>
                )}
              </div>
              {product.originalPrice && (
                <div style={{ fontSize: 12, color: 'var(--success)', letterSpacing: '0.08em', marginBottom: 28 }}>
                  You save {formatPrice(product.originalPrice - product.price)}
                </div>
              )}

              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.9, marginBottom: 32 }}>
                {product.description}
              </p>

              {/* Details table */}
              <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '20px 0', marginBottom: 28 }}>
                {[
                  ['Availability', product.inStock ? '✓ In Stock — Ready to Order' : '✗ Currently Out of Stock', product.inStock ? 'var(--success)' : 'var(--danger)'],
                  ['Category', product.category.charAt(0).toUpperCase() + product.category.slice(1), 'var(--text-primary)'],
                  ['Delivery', 'Physical artwork + digital scan', 'var(--text-primary)'],
                  ['Shipping', 'Nigeria & Worldwide available', 'var(--text-primary)'],
                  ['Payment', 'Full or 50% deposit accepted', 'var(--text-primary)'],
                ].map(([l, v, c]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                    <span style={{ color: c }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <button
                  onClick={handleAdd}
                  disabled={!product.inStock}
                  style={{
                    flex: 1, minWidth: 160, padding: '16px',
                    fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                    background: !product.inStock ? 'var(--bg-dark)' : added ? 'var(--success)' : 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))',
                    color: product.inStock ? 'var(--text-on-gold)' : 'var(--text-muted)',
                    border: product.inStock ? 'none' : '1px solid var(--border-color)',
                    cursor: product.inStock ? 'pointer' : 'not-allowed',
                    fontFamily: '"Libre Franklin", sans-serif',
                    transition: 'all 0.3s',
                  }}
                >
                  {added ? '✓ Added to Cart!' : product.inStock ? '+ Add to Cart' : 'Out of Stock'}
                </button>
                {added ? (
                  <Link href="/cart" style={{ padding: '16px 20px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid var(--gold-primary)', color: 'var(--gold-light)', display: 'flex', alignItems: 'center' }}>
                    View Cart →
                  </Link>
                ) : (
                  <Link href="/custom-artwork" style={{ padding: '16px 20px', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                    Custom →
                  </Link>
                )}
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                All orders confirmed within 24 hours. Payment via bank transfer — proof of payment required to begin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40, marginBottom: 36 }}>
            You Might Also <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Like</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }} className="related-grid">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>
      <style>{`@media(max-width:900px){.pd-grid,.related-grid{grid-template-columns:1fr!important;}}`}</style>
    </PublicLayout>
  )
}
