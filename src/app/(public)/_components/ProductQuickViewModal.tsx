'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { formatPrice } from '@/lib/tokens'
import type { Database } from '@/lib/types/database'

type Product = Database['public']['Tables']['products']['Row']

interface ProductQuickViewModalProps {
  product: Product
  quantity: number
  onAddToCart: () => void
  onQuantityChange: (qty: number) => void
  onClose: () => void
}

export default function ProductQuickViewModal({
  product,
  quantity,
  onAddToCart,
  onQuantityChange,
  onClose,
}: ProductQuickViewModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.name}`}
      data-testid="product-quick-view-modal"
      style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={onClose}
        data-testid="modal-backdrop"
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', cursor: 'pointer' }}
      />

      <div
        data-testid="modal-content"
        style={{
          position: 'relative',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          maxWidth: 720,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          animation: 'quickViewIn 0.25s ease',
        }}
        className="quick-view-modal"
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close modal"
          data-testid="modal-close-btn"
          style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, borderRadius: '50%' }}
        >
          ✕
        </button>

        <div style={{ background: 'var(--bg-dark)', minHeight: 320, position: 'relative', overflow: 'hidden' }} data-testid="modal-image">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill style={{ objectFit: 'cover' }} sizes="360px" />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.15 }}><rect x="8" y="8" width="32" height="32" stroke="#D4A84B" strokeWidth="1" /></svg>
            </div>
          )}
          {product.badge && (
            <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color: 'var(--text-on-gold)' }}>
              {product.badge}
            </div>
          )}
          {!product.in_stock && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Out of Stock
            </div>
          )}
        </div>

        <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 12 }} data-testid="modal-details">
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }} data-testid="modal-category">
            {product.category}
          </div>

          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, color: 'var(--text-primary)', margin: 0 }} data-testid="modal-name">
            {product.name}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, color: 'var(--gold-light)' }} data-testid="modal-price">
              {formatPrice(product.price)}
            </span>
            {product.original_price && (
              <span style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          {product.description && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }} data-testid="modal-description">
              {product.description}
            </p>
          )}

          <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--text-muted)' }}>Availability:</span>
            {product.in_stock ? (
              <span style={{ color: 'var(--success)' }}>In Stock</span>
            ) : (
              <span style={{ color: 'var(--danger)' }}>Out of Stock</span>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, marginTop: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
            {product.in_stock && quantity > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }} data-testid="modal-quantity-controls">
                <button
                  onClick={() => onQuantityChange(quantity - 1)}
                  aria-label="Decrease quantity"
                  data-testid="modal-qty-minus"
                  style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 16, fontFamily: '"Libre Franklin",sans-serif' }}
                >
                  −
                </button>
                <div
                  data-testid="modal-qty-value"
                  style={{ width: 48, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', fontSize: 14, fontFamily: '"Libre Franklin",sans-serif', color: 'var(--text-primary)' }}
                >
                  {quantity}
                </div>
                <button
                  onClick={() => onQuantityChange(quantity + 1)}
                  aria-label="Increase quantity"
                  data-testid="modal-qty-plus"
                  style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 16, fontFamily: '"Libre Franklin",sans-serif' }}
                >
                  +
                </button>
              </div>
            ) : null}

            {product.in_stock ? (
              quantity === 0 ? (
                <button
                  onClick={onAddToCart}
                  data-testid="modal-add-to-cart"
                  style={{ flex: 1, padding: '12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color: 'var(--text-on-gold)', border: 'none', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}
                >
                  Add to Cart
                </button>
              ) : (
                <button
                  onClick={onAddToCart}
                  data-testid="modal-add-to-cart"
                  style={{ flex: 1, padding: '12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color: 'var(--text-on-gold)', border: 'none', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}
                >
                  Add Another
                </button>
              )
            ) : (
              <button
                disabled
                style={{ flex: 1, padding: '12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'var(--bg-dark)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', cursor: 'not-allowed', fontFamily: '"Libre Franklin",sans-serif' }}
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>

      <style suppressHydrationWarning>{`
        @keyframes quickViewIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @media (max-width: 700px) {
          .quick-view-modal { grid-template-columns: 1fr !important; max-height: 85vh !important; }
          .quick-view-modal > div:first-child { min-height: 200px !important; }
        }
      `}</style>
    </div>
  )
}
