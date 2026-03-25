'use client'
import { useState } from 'react'
import Link from 'next/link'
import { FormGroup, Input, GoldLine } from '@/components/ui'

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    setLoading(true)
    setTimeout(() => { window.location.href = '/admin/dashboard' }, 1200)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(184,134,11,0.06) 0%, transparent 70%)' }} />
      <svg width="100%" height="100%" viewBox="0 0 1400 900" style={{ position: 'absolute', inset: 0, opacity: 0.04 }} preserveAspectRatio="xMidYMid slice">
        <circle cx="700" cy="450" r="350" fill="none" stroke="#D4A84B" strokeWidth="1" />
        <circle cx="700" cy="450" r="250" fill="none" stroke="#D4A84B" strokeWidth="0.5" strokeDasharray="8 8" />
      </svg>

      <div style={{ width: 460, padding: 60, background: 'var(--bg-card)', border: '1px solid var(--border-color)', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Link href="/" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26, fontWeight: 600, color: 'var(--gold-light)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Big Ed <span style={{ color: 'var(--text-primary)', fontWeight: 400 }}>Artistry</span>
          </Link>
          <GoldLine />
          <div style={{ marginTop: 16, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold-primary)' }}>Admin Panel</div>
        </div>

        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, textAlign: 'center', marginBottom: 8 }}>Admin Sign In</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 36 }}>Restricted access. Authorised personnel only.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <FormGroup label="Admin Email"><Input type="email" placeholder="admin@bigedartistry.com" /></FormGroup>
          <FormGroup label="Password"><Input type="password" placeholder="Admin password" /></FormGroup>
          <button onClick={handleSubmit} disabled={loading} style={{ padding: '14px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: loading ? 'var(--bg-dark)' : 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: loading ? 'var(--text-muted)' : 'var(--text-on-gold)', border: loading ? '1px solid var(--border-color)' : 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: '"Libre Franklin", sans-serif', transition: 'all 0.3s', marginTop: 8 }}>
            {loading ? 'Signing in…' : 'Enter Admin Panel →'}
          </button>
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>← Back to main site</Link>
        </div>
      </div>
    </div>
  )
}
