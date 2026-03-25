'use client'
import { useState } from 'react'
import Link from 'next/link'
import { FormGroup, Input, GoldLine } from '@/components/ui'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); setDone(true) }, 1200)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-dark)' }}>
      {/* Left panel – decorative */}
      <div style={{ flex: 1, background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, position: 'relative', overflow: 'hidden' }} className="login-panel">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(184,134,11,0.08) 0%, transparent 70%)' }} />
        <svg width="100%" height="100%" viewBox="0 0 600 800" style={{ position: 'absolute', inset: 0, opacity: 0.06 }} preserveAspectRatio="xMidYMid slice">
          <circle cx="300" cy="400" r="280" fill="none" stroke="#D4A84B" strokeWidth="1" />
          <circle cx="300" cy="400" r="200" fill="none" stroke="#D4A84B" strokeWidth="0.5" strokeDasharray="6 6" />
          <circle cx="300" cy="400" r="120" fill="none" stroke="#D4A84B" strokeWidth="0.5" />
          <line x1="0" y1="400" x2="600" y2="400" stroke="#D4A84B" strokeWidth="0.5" />
          <line x1="300" y1="0" x2="300" y2="800" stroke="#D4A84B" strokeWidth="0.5" />
        </svg>
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <Link href="/" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, fontWeight: 600, color: 'var(--gold-light)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Big Ed <span style={{ color: 'var(--text-primary)', fontWeight: 400 }}>Artistry</span>
          </Link>
          <GoldLine />
          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: 24, lineHeight: 1.7, maxWidth: 360 }}>
            "Art is how I translate emotion into something you can hold and treasure forever."
          </p>
          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start', maxWidth: 320 }}>
            {['Track your order in real-time', 'Upload payment proof securely', 'Receive progress updates', 'Manage your commissions'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--gold-primary)', flexShrink: 0 }}>—</span> {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div style={{ width: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>✦</div>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, marginBottom: 16 }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Redirecting to your dashboard…</p>
            <Link href="/dashboard" style={{ display: 'inline-flex', padding: '14px 32px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: 'var(--text-on-gold)' }}>Go to Dashboard →</Link>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: 400 }}>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 44, marginBottom: 8 }}>Sign In</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 40 }}>Access your orders and commissions.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <FormGroup label="Email Address"><Input type="email" placeholder="your@email.com" /></FormGroup>
              <div>
                <FormGroup label="Password"><Input type="password" placeholder="Your password" /></FormGroup>
                <div style={{ textAlign: 'right', marginTop: 8 }}>
                  <Link href="#" style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Forgot password?</Link>
                </div>
              </div>
              <button onClick={handleSubmit} disabled={loading} style={{ padding: '14px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: loading ? 'var(--bg-card)' : 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: loading ? 'var(--text-muted)' : 'var(--text-on-gold)', border: loading ? '1px solid var(--border-color)' : 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: '"Libre Franklin", sans-serif', transition: 'all 0.3s' }}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </div>

            <div style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                Don't have an account?{' '}
                <Link href="/register" style={{ color: 'var(--gold-light)', fontWeight: 500 }}>Register here</Link>
              </p>
            </div>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Link href="/" style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>← Back to site</Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) { .login-panel { display: none !important; } }
      `}</style>
    </div>
  )
}
