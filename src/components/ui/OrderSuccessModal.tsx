'use client'
import Link from 'next/link'
import { formatPrice } from '@/lib/tokens'

export interface OrderSuccessModalProps {
  name: string
  phone: string
  orderNumber: string
  paymentType: 'full' | 'partial'
  amountDue: number
  amountRemaining: number
}

export default function OrderSuccessModal({
  name, phone, orderNumber, paymentType, amountDue, amountRemaining,
}: OrderSuccessModalProps) {
  return (
    <div data-testid="success-modal" style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
      {/* Card */}
      <div style={{ position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--gold-primary)', maxWidth: 520, width: '100%', padding: '48px 40px', textAlign: 'center', animation: 'modalIn 0.3s ease' }}>
        <div style={{ fontSize: 52, marginBottom: 16, color: 'var(--gold-light)' }}>✦</div>
        <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40, marginBottom: 10 }}>
          Order <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Confirmed!</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          Thank you, {name}! Order <strong style={{ color: 'var(--gold-light)' }}>{orderNumber}</strong> has been received.
          Big Ed will review your payment and begin work within 24 hours. You&apos;ll be contacted on {phone}.
        </p>

        {/* Order details */}
        <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
          {([
            ['Order Number', orderNumber],
            ['Payment Type', paymentType === 'full' ? 'Full Payment' : '50% Deposit'],
            ['Amount Paid', formatPrice(amountDue)],
            ...(amountRemaining > 0 ? [['Remaining Balance', formatPrice(amountRemaining)]] : []),
          ] as [string, string][]).map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>{l}</span>
              <span style={{ color: l === 'Order Number' ? 'var(--gold-light)' : 'var(--text-primary)' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link href="/dashboard/orders" style={{ display: 'block', padding: '14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color: 'var(--text-on-gold)', textDecoration: 'none' }}>
            Go to Dashboard →
          </Link>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Link href="/store" style={{ display: 'block', padding: '12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Continue Shopping
            </Link>
            <Link href="/" style={{ display: 'block', padding: '12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>

      <style suppressHydrationWarning>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @media (max-width: 600px) {
          [data-testid="success-modal"] > div:last-child { padding: 32px 20px !important; }
        }
      `}</style>
    </div>
  )
}
