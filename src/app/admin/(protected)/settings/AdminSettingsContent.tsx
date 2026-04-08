'use client'
import { useState, useTransition } from 'react'
import { FormGroup, Input } from '@/components/ui'
import { updateProfile, logout } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

const BANK_DETAILS = [
  { label: 'Keystone Bank', account: '6047068634' },
  { label: 'Fairmoney', account: '8155487017' },
  { label: 'UBA', account: '2269928796' },
  { label: 'Opay', account: '6112656157' },
]

export default function AdminSettingsContent({ user }: { user: Profile | null }) {
  const [tab, setTab] = useState<'profile' | 'password' | 'bank'>('profile')
  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [saveMsg, setSaveMsg] = useState('')
  const [saveError, setSaveError] = useState('')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwError, setPwError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSaveProfile = () => {
    setSaveMsg(''); setSaveError('')
    startTransition(async () => {
      try {
        await updateProfile({ full_name: fullName, phone: phone || undefined })
        setSaveMsg('Profile updated.')
      } catch (e: unknown) {
        setSaveError(e instanceof Error ? e.message : 'Failed.')
      }
    })
  }

  const handleChangePw = () => {
    if (!currentPw || !newPw || !confirmPw) { setPwError('Fill in all fields.'); return }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return }
    if (newPw.length < 8) { setPwError('Min 8 characters.'); return }
    setPwMsg(''); setPwError('')
    startTransition(async () => {
      try {
        const supabase = createClient()
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: user?.email ?? '', password: currentPw })
        if (signInError) throw new Error('Current password is incorrect.')
        const { error } = await supabase.auth.updateUser({ password: newPw })
        if (error) throw new Error(error.message)
        setPwMsg('Password updated.')
        setCurrentPw(''); setNewPw(''); setConfirmPw('')
      } catch (e: unknown) {
        setPwError(e instanceof Error ? e.message : 'Failed.')
      }
    })
  }

  const tabs = [['profile', '◈ Admin Profile'], ['password', '◇ Change Password'], ['bank', '🏦 Bank Details']] as const

  return (
    <div style={{ padding: 36, minHeight: '100vh' }}>
      <div style={{ marginBottom: 36, paddingBottom: 24, borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Admin Panel</div>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40 }}>Settings <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>&amp; Profile</span></h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          {tabs.map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '16px 20px', fontSize: 13, letterSpacing: '0.06em', background: tab === key ? 'rgba(184,134,11,0.08)' : 'transparent', borderLeft: tab === key ? '2px solid var(--gold-primary)' : '2px solid transparent', color: tab === key ? 'var(--gold-light)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif', transition: 'all 0.2s', borderBottom: '1px solid var(--border-color)' }}>{label}</button>
          ))}
          <div style={{ padding: '16px 20px' }}>
            <form action={logout}>
              <button type="submit" style={{ fontSize: 12, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif', letterSpacing: '0.06em' }}>Sign Out</button>
            </form>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: 40 }}>
          {tab === 'profile' && (
            <>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, marginBottom: 28 }}>Admin Profile</h2>
              {saveMsg && <div style={{ padding: '12px 16px', background: 'rgba(74,124,89,0.1)', border: '1px solid rgba(74,124,89,0.3)', color: 'var(--success)', fontSize: 13, marginBottom: 24 }}>✓ {saveMsg}</div>}
              {saveError && <div style={{ padding: '12px 16px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', fontSize: 13, marginBottom: 24 }}>{saveError}</div>}
              <div style={{ display: 'grid', gap: 20 }}>
                <FormGroup label="Full Name"><Input value={fullName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)} /></FormGroup>
                <FormGroup label="Email"><Input value={user?.email ?? ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} /></FormGroup>
                <FormGroup label="Phone"><Input value={phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)} placeholder="+234 800 000 0000" /></FormGroup>
                <button onClick={handleSaveProfile} disabled={isPending} style={{ alignSelf: 'flex-start', padding: '12px 28px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: isPending ? 'var(--bg-dark)' : 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: isPending ? 'var(--text-muted)' : 'var(--text-on-gold)', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>
                  {isPending ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </>
          )}

          {tab === 'password' && (
            <>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, marginBottom: 28 }}>Change Password</h2>
              {pwMsg && <div style={{ padding: '12px 16px', background: 'rgba(74,124,89,0.1)', border: '1px solid rgba(74,124,89,0.3)', color: 'var(--success)', fontSize: 13, marginBottom: 24 }}>✓ {pwMsg}</div>}
              {pwError && <div style={{ padding: '12px 16px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', fontSize: 13, marginBottom: 24 }}>{pwError}</div>}
              <div style={{ display: 'grid', gap: 20 }}>
                <FormGroup label="Current Password"><Input type="password" value={currentPw} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPw(e.target.value)} /></FormGroup>
                <FormGroup label="New Password"><Input type="password" value={newPw} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPw(e.target.value)} /></FormGroup>
                <FormGroup label="Confirm New Password"><Input type="password" value={confirmPw} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPw(e.target.value)} /></FormGroup>
                <button onClick={handleChangePw} disabled={isPending} style={{ alignSelf: 'flex-start', padding: '12px 28px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: isPending ? 'var(--bg-dark)' : 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: isPending ? 'var(--text-muted)' : 'var(--text-on-gold)', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>
                  {isPending ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </>
          )}

          {tab === 'bank' && (
            <>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, marginBottom: 8 }}>Bank Details</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.7 }}>These are the bank accounts customers transfer payments to.</p>
              <div style={{ display: 'grid', gap: 1, background: 'var(--border-color)' }}>
                {BANK_DETAILS.map(bank => (
                  <div key={bank.label} style={{ background: 'var(--bg-dark)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{bank.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Dikibo Eric Tamunonenqiyeofori</div>
                    </div>
                    <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, color: 'var(--gold-light)' }}>{bank.account}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
