'use client'
import { useState } from 'react'
import Link from 'next/link'
import { FormGroup, Input, GoldLine } from '@/components/ui'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); setDone(true) }, 1200)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-dark)' }}>
      {/* Left decorative */}
      <div style={{ flex: 1, background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, position: 'relative', overflow: 'hidden' }} className="register-panel">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(184,134,11,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <Link href="/" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, fontWeight: 600, color: 'var(--gold-light)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Big Ed <span style={{ color: 'var(--text-primary)', fontWeight: 400 }}>Artistry</span>
          </Link>
          <GoldLine />
          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: 24, lineHeight: 1.7, maxWidth: 360 }}>
            "Every portrait starts with a conversation. Yours begins here."
          </p>
          <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 380 }}>
            {[['500+', 'Artworks Created'], ['98%', 'Client Satisfaction'], ['7+', 'Years Experience'], ['20+', 'Countries Served']].map(([n, l]) => (
              <div key={l} style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 32, color: 'var(--gold-light)' }}>{n}</div>
                <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{ width: 540, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, overflowY: 'auto' }}>
        {done ? (
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>✦</div>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, marginBottom: 16 }}>Account Created</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.8 }}>Welcome to Big Ed Artistry. Your account is ready. You can now track orders, upload payments, and commission artwork.</p>
            <Link href="/dashboard" style={{ display: 'inline-flex', padding: '14px 32px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: 'var(--text-on-gold)' }}>Go to Dashboard →</Link>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: 420 }}>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 44, marginBottom: 8 }}>Create Account</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 36 }}>Join to track orders, upload payments, and more.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FormGroup label="First Name"><Input placeholder="First name" /></FormGroup>
                <FormGroup label="Last Name"><Input placeholder="Last name" /></FormGroup>
              </div>
              <FormGroup label="Email Address"><Input type="email" placeholder="your@email.com" /></FormGroup>
              <FormGroup label="Phone / WhatsApp"><Input type="tel" placeholder="+234 800 000 0000" /></FormGroup>
              <FormGroup label="Password"><Input type="password" placeholder="Choose a password (min. 8 chars)" /></FormGroup>
              <FormGroup label="Confirm Password"><Input type="password" placeholder="Repeat your password" /></FormGroup>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 0' }}>
                <input type="checkbox" id="terms" style={{ marginTop: 3, accentColor: 'var(--gold-primary)', flexShrink: 0 }} />
                <label htmlFor="terms" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  I agree to the{' '}
                  <Link href="#" style={{ color: 'var(--gold-light)' }}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="#" style={{ color: 'var(--gold-light)' }}>Privacy Policy</Link>
                </label>
              </div>

              <button onClick={handleSubmit} disabled={loading} style={{ padding: '14px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: loading ? 'var(--bg-card)' : 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: loading ? 'var(--text-muted)' : 'var(--text-on-gold)', border: loading ? '1px solid var(--border-color)' : 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: '"Libre Franklin", sans-serif' }}>
                {loading ? 'Creating Account…' : 'Create Account →'}
              </button>
            </div>

            <div style={{ marginTop: 28, paddingTop: 28, borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: 'var(--gold-light)', fontWeight: 500 }}>Sign in</Link>
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`@media (max-width: 900px) { .register-panel { display: none !important; } }`}</style>
    </div>
  )
}
