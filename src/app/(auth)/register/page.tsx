'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FormGroup, Input, GoldLine } from '@/components/ui'
import { register } from '@/app/actions/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email || !password || !confirm) { setError('Please fill in all required fields.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (!agreed) { setError('Please agree to the terms.'); return }
    setLoading(true)
    setError('')
    try {
      await register({ email, password, full_name: `${firstName} ${lastName}`.trim(), phone: phone || undefined })
      setDone(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed.')
      setLoading(false)
    }
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
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, marginBottom: 16 }}>Check Your Email</h2>
            <div style={{ marginBottom: 24, padding: '14px 18px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderLeft: '3px solid #22c55e', color: '#86efac', fontSize: 13, lineHeight: 1.7, textAlign: 'left' }}>
              ✓ Account created successfully. A verification link has been sent to <strong style={{ color: 'var(--gold-light)' }}>{email}</strong>. Please check your inbox to activate your account.
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.8, fontSize: 14 }}>
              Once you click the link in your email, you can sign in to your account.
            </p>
            <Link href="/login" style={{ display: 'inline-flex', padding: '14px 32px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: 'var(--text-on-gold)' }}>Go to Sign In →</Link>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: 420 }}>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 44, marginBottom: 8 }}>Create Account</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 36 }}>Join to track orders, upload payments, and more.</p>

            {error && (
              <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', borderLeft: '3px solid #ef4444', color: '#f87171', fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.5 }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FormGroup label="First Name"><Input placeholder="First name" value={firstName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)} /></FormGroup>
                <FormGroup label="Last Name"><Input placeholder="Last name" value={lastName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)} /></FormGroup>
              </div>
              <FormGroup label="Email Address"><Input type="email" placeholder="your@email.com" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} /></FormGroup>
              <FormGroup label="Phone / WhatsApp (optional)"><Input type="tel" placeholder="+234 800 000 0000" value={phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)} /></FormGroup>
              <FormGroup label="Password"><Input type="password" placeholder="Min. 8 characters" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} /></FormGroup>
              <FormGroup label="Confirm Password"><Input type="password" placeholder="Repeat your password" value={confirm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)} /></FormGroup>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 0' }}>
                <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 3, accentColor: 'var(--gold-primary)', flexShrink: 0 }} />
                <label htmlFor="terms" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  I agree to the{' '}
                  <Link href="/terms-and-conditions" style={{ color: 'var(--gold-light)' }}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/refund-policy" style={{ color: 'var(--gold-light)' }}>Privacy Policy</Link>
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
