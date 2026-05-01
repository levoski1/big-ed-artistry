'use client'
import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { FormGroup, Input, GoldLine } from '@/components/ui'
import { login, resendConfirmation } from '@/app/actions/auth'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'

  const confirmed = searchParams.get('confirmed') === '1'
  const errorParam = searchParams.get('error')
  const isExpired = errorParam === 'link_expired'
  const isInvalid = errorParam === 'invalid_token'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [unverified, setUnverified] = useState(false)
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  // Auto-redirect if already authenticated
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace(next)
    })
  }, [router, next])

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    setError('')
    setUnverified(false)
    try {
      await login(email, password)
      router.push(next)
      router.refresh()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Login failed.'
      if (msg.includes('not been verified') || msg.includes('not confirmed')) {
        setUnverified(true)
        setError('')
      } else {
        setError(msg)
      }
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) { setError('Enter your email address above, then click resend.'); return }
    setResendStatus('sending')
    try {
      await resendConfirmation(email)
      setResendStatus('sent')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to resend.')
      setResendStatus('idle')
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 44, marginBottom: 8 }}>Sign In</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 40 }}>Access your orders and commissions.</p>

      {confirmed && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderLeft: '3px solid #22c55e', color: '#86efac', fontSize: 13, lineHeight: 1.5 }}>
          ✓ Email confirmed! You can now sign in.
        </div>
      )}

      {unverified && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)', borderLeft: '3px solid #eab308', color: '#fde047', fontSize: 13, lineHeight: 1.6 }}>
          ⚠ Your email address has not been verified yet. Please check your inbox and click the verification link to activate your account.
          {' '}<button onClick={handleResend} disabled={resendStatus !== 'idle'} style={{ background: 'none', border: 'none', color: 'var(--gold-light)', cursor: resendStatus !== 'idle' ? 'default' : 'pointer', fontSize: 13, padding: 0, textDecoration: 'underline' }}>
            {resendStatus === 'sending' ? 'Sending…' : resendStatus === 'sent' ? 'Sent ✓' : 'Resend verification email'}
          </button>
        </div>
      )}

      {(isExpired || isInvalid) && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)', borderLeft: '3px solid #eab308', color: '#fde047', fontSize: 13, lineHeight: 1.6 }}>
          {isExpired
            ? '⏱ Your confirmation link has expired.'
            : '⚠ This confirmation link is invalid.'}
          {' '}Enter your email below and click{' '}
          <button onClick={handleResend} disabled={resendStatus !== 'idle'} style={{ background: 'none', border: 'none', color: 'var(--gold-light)', cursor: 'pointer', fontSize: 13, padding: 0, textDecoration: 'underline' }}>
            {resendStatus === 'sending' ? 'Sending…' : resendStatus === 'sent' ? 'Sent ✓' : 'resend confirmation email'}
          </button>.
        </div>
      )}

      {resendStatus === 'sent' && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderLeft: '3px solid #22c55e', color: '#86efac', fontSize: 13 }}>
          ✓ A new verification email has been sent. Please check your inbox.
        </div>
      )}

      {error && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', borderLeft: '3px solid #ef4444', color: '#f87171', fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.5 }}>
          <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <FormGroup label="Email Address">
          <Input type="email" placeholder="your@email.com" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
        </FormGroup>
        <div>
          <FormGroup label="Password">
            <Input type="password" placeholder="Your password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSubmit()} />
          </FormGroup>
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <Link href="/forgot-password" style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>Forgot password?</Link>
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
  )
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-dark)' }}>
      {/* Left panel */}
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

      {/* Right panel */}
      <div style={{ width: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
        <Suspense fallback={<div style={{ color: 'var(--text-muted)' }}>Loading…</div>}>
          <LoginForm />
        </Suspense>
      </div>

      <style>{`@media (max-width: 900px) { .login-panel { display: none !important; } }`}</style>
    </div>
  )
}
