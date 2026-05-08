'use client'
import Link from 'next/link'

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', padding: 24 }}>
      <div style={{ maxWidth: 400, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16, color: 'var(--gold-primary)' }}>⚠</div>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, marginBottom: 12 }}>Something Went Wrong</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
          We encountered an unexpected error. Please try again or contact support if the issue persists.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <button onClick={reset} style={{ padding: '14px 32px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: 'var(--text-on-gold)', border: 'none', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif' }}>
            Try Again
          </button>
          <Link href="/login" style={{ fontSize: 13, color: 'var(--gold-light)', textDecoration: 'underline' }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
