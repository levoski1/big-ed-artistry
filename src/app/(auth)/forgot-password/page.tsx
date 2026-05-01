'use client'
import { useState } from 'react'
import Link from 'next/link'
import { FormGroup, Input, GoldLine } from '@/components/ui'
import { forgotPassword } from '@/app/actions/auth'
import { ERR } from '@/lib/errorMessages'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email) { setError('Please enter your email address.'); return }
    setLoading(true)
    setError('')
    try {
      await forgotPassword(email)
      setDone(true)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ERR.GENERIC
      // Rate limit is the only error we surface; everything else silently succeeds
      if (msg === ERR.RATE_LIMITED) {
        setError(msg)
      } else {
        setDone(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-dark)' }}>
      {/* Left decorative panel */}
      <div style={{ flex: 1, background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, position: 'relative', overflow: 'hidden' }} className="login-panel">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(184,134,11,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <Link href="/" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, fontWeight: 600, color: 'var(--gold-light)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Big Ed <span style={{ color: 'var(--text-primary)', fontWeight: 400 }}>Artistry</span>
          </Link>
          <GoldLine />
          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20, fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: 24, lineHeight: 1.7, maxWidth: 320 }}>
            "Every great artwork begins with a single, courageous step."
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ width: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40, marginBottom: 8 }}>Forgot Password</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 40 }}>
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {done ? (
            <div data-testid="reset-sent-message" style={{ padding: '16px 20px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderLeft: '3px solid #22c55e', color: '#86efac', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              ✓ {ERR.RESET_LINK_SENT}
            </div>
          ) : (
            <>
              {error && (
                <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', borderLeft: '3px solid #ef4444', color: '#f87171', fontSize: 13, display: 'flex', gap: 10, lineHeight: 1.5 }}>
                  <span>⚠</span><span>{error}</span>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <FormGroup label="Email Address">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSubmit()}
                    autoFocus
                  />
                </FormGroup>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ padding: '14px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: loading ? 'var(--bg-card)' : 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: loading ? 'var(--text-muted)' : 'var(--text-on-gold)', border: loading ? '1px solid var(--border-color)' : 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: '"Libre Franklin", sans-serif', transition: 'all 0.3s' }}
                >
                  {loading ? 'Sending…' : 'Send Reset Link →'}
                </button>
              </div>
            </>
          )}

          <div style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
            <Link href="/login" style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>← Back to Login</Link>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 900px) { .login-panel { display: none !important; } }`}</style>
    </div>
  )
}
