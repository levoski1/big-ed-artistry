'use client'
import Link from 'next/link'
import { useCart, type StoreProduct } from '@/context/CartContext'
import StarRating from './StarRating'
import { formatPrice } from '@/lib/tokens'

interface ProductCardProps {
  product: StoreProduct
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addStoreItem, rateProduct, state } = useCart()
  const userRating = state.ratings[product.id]

  return (
    <div className="card-hover" style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'background 0.35s ease, border-color 0.35s ease',
    }}>
      {/* Image */}
      <Link href={`/product/${product.slug}`} style={{ display: 'block', aspectRatio: '4/3', position: 'relative', overflow: 'hidden', background: 'var(--bg-dark)', transition: 'background 0.35s ease' }}>
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 10, color: 'var(--text-muted)', fontSize: 12,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          position: 'relative',
        }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.15 }}>
            <circle cx="24" cy="16" r="10" stroke="#D4A84B" strokeWidth="1"/>
            <path d="M6 44c0-9.941 8.059-18 18-18s18 8.059 18 18" stroke="#D4A84B" strokeWidth="1"/>
          </svg>
          <span style={{ color: 'var(--text-muted)' }}>{product.name}</span>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(184,134,11,0.03) 28px,rgba(184,134,11,0.03) 29px)' }}/>
        </div>
        {product.badge && (
          <span style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', background: 'var(--gold-primary)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-on-gold)' }}>
            {product.badge}
          </span>
        )}
        {!product.inStock && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,14,12,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '6px 14px' }}>Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div style={{ padding: '20px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', transition: 'color 0.35s' }}>
          {product.category}
        </div>
        <Link href={`/product/${product.slug}`}>
          <div style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 20, fontWeight: 500, lineHeight: 1.2, color: 'var(--text-primary)', transition: 'color 0.35s' }}>
            {product.name}
          </div>
        </Link>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1, transition: 'color 0.35s' }}>
          {product.description}
        </p>

        <StarRating
          productId={product.id}
          initialRating={product.rating}
          userRating={userRating}
          onRate={rateProduct}
        />

        {/* Price + Cart */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <div>
            <span style={{ color: 'var(--gold-light)', fontSize: 18, fontWeight: 500, transition: 'color 0.35s' }}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <del style={{ color: 'var(--text-muted)', fontSize: 13, marginLeft: 8 }}>
                {formatPrice(product.originalPrice)}
              </del>
            )}
          </div>
          <button
            onClick={() => product.inStock && addStoreItem(product)}
            disabled={!product.inStock}
            style={{
              padding: '9px 18px', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              background: product.inStock
                ? 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))'
                : 'var(--bg-dark)',
              color: product.inStock ? 'var(--text-on-gold)' : 'var(--text-muted)',
              border: product.inStock ? 'none' : '1px solid var(--border-color)',
              cursor: product.inStock ? 'pointer' : 'not-allowed',
              fontFamily: '"Libre Franklin", sans-serif',
              transition: 'all 0.2s',
            }}
          >
            {product.inStock ? '+ Cart' : 'Sold Out'}
          </button>
        </div>
      </div>
    </div>
  )
}
