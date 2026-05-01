'use client'
import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FormGroup, Input, GoldLine } from '@/components/ui'
import { resetPassword } from '@/app/actions/auth'
import { ERR } from '@/lib/errorMessages'
import { createClient } from '@/lib/supabase/client'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasError = searchParams.get('error') === '1'

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [sessionReady, setSessionReady] = useState<boolean | null>(null)

  // Verify a recovery session is actually present
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionReady(!!session)
    })
  }, [])

  const handleSubmit = async () => {
    if (!password || !confirm) { setError('Please fill in both fields.'); return }
    if (password !== confirm) { setError(ERR.PASSWORDS_MISMATCH); return }
    if (password.length < 8) { setError(ERR.WEAK_PASSWORD); return }
    setLoading(true)
    setError('')
    try {
      await resetPassword(password, confirm)
      setDone(true)
      // Sign out so the user logs in fresh with the new password
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : ERR.RESET_FAILED)
    } finally {
      setLoading(false)
    }
  }

  // Invalid/expired token — came here without a valid session
  if (hasError || sessionReady === false) {
    return (
      <div style={{ width: '100%', maxWidth: 400 }}>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40, marginBottom: 8 }}>Link Expired</h1>
        <div data-testid="token-invalid-message" style={{ padding: '16px 20px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', borderLeft: '3px solid #ef4444', color: '#f87171', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          {ERR.RESET_TOKEN_INVALID}
        </div>
        <Link href="/forgot-password" style={{ display: 'block', padding: '14px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: 'var(--text-on-gold)', textDecoration: 'none', textAlign: 'center', fontFamily: '"Libre Franklin", sans-serif' }}>
          Request New Link →
        </Link>
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link href="/login" style={{ fontSize: 13, color: 'var(--text-muted)' }}>← Back to Login</Link>
        </div>
      </div>
    )
  }

  // Loading session check
  if (sessionReady === null) {
    return <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Verifying link…</div>
  }

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40, marginBottom: 8 }}>New Password</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 40 }}>
        Choose a strong password for your account.
      </p>

      {done ? (
        <div data-testid="reset-success-message" style={{ padding: '16px 20px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderLeft: '3px solid #22c55e', color: '#86efac', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          ✓ Your password has been successfully reset. You can now log in with your new password.
        </div>
      ) : (
        <>
          {error && (
            <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', borderLeft: '3px solid #ef4444', color: '#f87171', fontSize: 13, display: 'flex', gap: 10, lineHeight: 1.5 }}>
              <span>⚠</span><span>{error}</span>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <FormGroup label="New Password">
              <Input
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                autoFocus
              />
            </FormGroup>
            <FormGroup label="Confirm Password">
              <Input
                type="password"
                placeholder="Repeat your new password"
                value={confirm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSubmit()}
              />
            </FormGroup>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ padding: '14px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: loading ? 'var(--bg-card)' : 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: loading ? 'var(--text-muted)' : 'var(--text-on-gold)', border: loading ? '1px solid var(--border-color)' : 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: '"Libre Franklin", sans-serif', transition: 'all 0.3s' }}
            >
              {loading ? 'Saving…' : 'Set New Password →'}
            </button>
          </div>
        </>
      )}

      {done && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button
            onClick={() => router.push('/login')}
            style={{ fontSize: 13, color: 'var(--gold-light)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Go to Login →
          </button>
        </div>
      )}

      {!done && (
        <div style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <Link href="/login" style={{ fontSize: 13, color: 'var(--text-muted)' }}>← Back to Login</Link>
        </div>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
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
            "Security and artistry — both demand precision."
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ width: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
        <Suspense fallback={<div style={{ color: 'var(--text-muted)' }}>Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>

      <style>{`@media (max-width: 900px) { .login-panel { display: none !important; } }`}</style>
    </div>
  )
}
