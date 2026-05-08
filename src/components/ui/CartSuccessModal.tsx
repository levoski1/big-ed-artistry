'use client'
import Link from 'next/link'

export interface CartSuccessModalProps {
  /** Name of the item just added */
  itemName?: string
  /** 'add-to-cart' shows cart/browse/customise/home; 'checkout' shows dashboard/browse/home */
  variant?: 'add-to-cart' | 'checkout'
  onClose: () => void
}

export default function CartSuccessModal({ itemName, variant = 'add-to-cart', onClose }: CartSuccessModalProps) {
  const isCheckout = variant === 'checkout'

  return (
    <div
      data-testid="cart-success-modal"
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', cursor: 'pointer' }}
      />

      {/* Card */}
      <div style={{ position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--gold-primary)', maxWidth: 480, width: '100%', padding: '48px 40px', textAlign: 'center', animation: 'cartModalIn 0.3s ease' }}>

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          data-testid="cart-modal-close-btn"
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}
        >
          ✕
        </button>

        {/* Icon */}
        <div style={{ fontSize: 52, marginBottom: 16, color: 'var(--gold-light)' }}>✦</div>

        {/* Heading */}
        <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, marginBottom: 10, color: 'var(--text-primary)' }}>
          {isCheckout ? (
            <>Order <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Placed!</span></>
          ) : (
            <>Added to <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Cart!</span></>
          )}
        </h2>

        {/* Message */}
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8, marginBottom: 28 }}>
          {isCheckout
            ? 'Your order has been successfully placed. Track it from your dashboard.'
            : itemName
              ? <><strong style={{ color: 'var(--gold-light)' }}>{itemName}</strong> has been successfully added to your cart.</>
              : 'Item successfully added to your cart.'}
        </p>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isCheckout ? (
            <>
              <Link
                href="/dashboard/orders"
                onClick={onClose}
                style={primaryLinkStyle}
              >
                Go to Dashboard →
              </Link>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Link href="/store" onClick={onClose} style={secondaryLinkStyle}>Continue Browsing</Link>
                <Link href="/" onClick={onClose} style={secondaryLinkStyle}>Return to Home</Link>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/cart"
                onClick={onClose}
                style={primaryLinkStyle}
              >
                Go to Cart →
              </Link>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Link href="/store" onClick={onClose} style={secondaryLinkStyle}>Continue Browsing</Link>
                <Link href="/custom-artwork" onClick={onClose} style={secondaryLinkStyle}>Customise Art</Link>
              </div>
              <Link href="/" onClick={onClose} style={{ ...secondaryLinkStyle, display: 'block' }}>Return to Home</Link>
            </>
          )}
        </div>
      </div>

      <style suppressHydrationWarning>{`
        @keyframes cartModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @media (max-width: 600px) {
          [data-testid="cart-success-modal"] > div:last-child { padding: 32px 20px !important; }
        }
      `}</style>
    </div>
  )
}

const primaryLinkStyle: React.CSSProperties = {
  display: 'block',
  padding: '14px',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  background: 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))',
  color: 'var(--text-on-gold)',
  textDecoration: 'none',
  fontFamily: '"Libre Franklin", sans-serif',
}

const secondaryLinkStyle: React.CSSProperties = {
  display: 'block',
  padding: '12px',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  border: '1px solid var(--border-color)',
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  fontFamily: '"Libre Franklin", sans-serif',
}
