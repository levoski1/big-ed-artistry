'use client'
import Image from 'next/image'
import { formatPrice } from '@/lib/tokens'
import type { Database } from '@/lib/types/database'

type Product = Database['public']['Tables']['products']['Row']

interface HomeProductCardProps {
  product: Product
  quantity: number
  onAddToCart: () => void
  onQuantityChange: (qty: number) => void
  onOpenModal: () => void
}

export default function HomeProductCard({
  product,
  quantity,
  onAddToCart,
  onQuantityChange,
  onOpenModal,
}: HomeProductCardProps) {
  const inCart = quantity > 0

  return (
    <div
      onClick={onOpenModal}
      data-testid={`product-card-${product.id}`}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s', position: 'relative' }}
      className="home-product-card"
    >
      <div style={{ height: 200, background: 'var(--bg-dark)', overflow: 'hidden', position: 'relative' }}>
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }} sizes="(max-width:540px) 100vw, (max-width:1024px) 50vw, 25vw" className="product-card-image" />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.1 }}><rect x="8" y="8" width="32" height="32" stroke="#D4A84B" strokeWidth="1" /></svg>
          </div>
        )}
        {product.badge && (
          <div style={{ position: 'absolute', top: 10, left: 10, padding: '3px 8px', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color: 'var(--text-on-gold)' }}>
            {product.badge}
          </div>
        )}
        {!product.in_stock && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Out of Stock
          </div>
        )}
      </div>

      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{product.category}</div>
        <div style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 17, color: 'var(--text-primary)', lineHeight: 1.2 }}>{product.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
          <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 18, color: 'var(--gold-light)' }} data-testid={`price-${product.id}`}>
            {formatPrice(product.price)}
          </span>
          {product.original_price && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{formatPrice(product.original_price)}</span>
          )}
        </div>

        <div style={{ minHeight: 40, display: 'flex', alignItems: 'center' }}>
          {product.in_stock ? (
            inCart ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%' }} data-testid={`qty-controls-${product.id}`}>
                <button
                  onClick={(e) => { e.stopPropagation(); onQuantityChange(quantity - 1) }}
                  aria-label="Decrease quantity"
                  data-testid={`qty-minus-${product.id}`}
                  style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 14, fontFamily: '"Libre Franklin",sans-serif' }}
                >
                  −
                </button>
                <div
                  data-testid={`qty-value-${product.id}`}
                  style={{ flex: 1, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', fontSize: 13, fontFamily: '"Libre Franklin",sans-serif', color: 'var(--text-primary)' }}
                >
                  {quantity}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onQuantityChange(quantity + 1) }}
                  aria-label="Increase quantity"
                  data-testid={`qty-plus-${product.id}`}
                  style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 14, fontFamily: '"Libre Franklin",sans-serif' }}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onAddToCart() }}
                data-testid={`add-to-cart-${product.id}`}
                style={{ width: '100%', padding: '10px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color: 'var(--text-on-gold)', border: 'none', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif', transition: 'opacity 0.2s' }}
              >
                + Add to Cart
              </button>
            )
          ) : (
            <div style={{ width: '100%', padding: '10px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'var(--bg-dark)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', textAlign: 'center', fontFamily: '"Libre Franklin",sans-serif' }}>
              Out of Stock
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
