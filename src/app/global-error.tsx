'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0f0e0d', color: '#e8e0d4', fontFamily: '"Libre Franklin", sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ maxWidth: 400, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16, color: '#D4A84B' }}>⚠</div>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, marginBottom: 12 }}>Something Went Wrong</h1>
            <p style={{ color: '#a0988c', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
              We encountered an unexpected error. Please try again or contact support if the issue persists.
            </p>
            <button onClick={reset} style={{ padding: '14px 32px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg, #D4A84B, #B8922E)', color: '#0f0e0d', border: 'none', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif' }}>
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
