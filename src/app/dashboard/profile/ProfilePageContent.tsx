'use client'
import { useState } from 'react'
import { FormGroup, Input } from '@/components/ui'
import NotificationPreferencesForm from '@/components/ui/NotificationPreferencesForm'
import { updateProfile, logout } from '@/app/actions/auth'
import { saveNotificationPreferences } from '@/app/actions/notifications'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/tokens'
import type { Database } from '@/lib/types/database'
import type { NotificationPreferences } from '@/lib/notificationPreferences.shared'
import { DEFAULT_PREFERENCES } from '@/lib/notificationPreferences.shared'

type Profile = Database['public']['Tables']['profiles']['Row']

interface Props {
  user: Profile | null
  totalOrders: number
  completedCount: number
  notifPrefs?: NotificationPreferences | null
}

export default function ProfilePageContent({ user, totalOrders, completedCount, notifPrefs }: Props) {
  const [tab, setTab] = useState<'profile' | 'password' | 'notifications'>('profile')

  // Profile form state
  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [saveError, setSaveError] = useState('')

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const [pwError, setPwError] = useState('')

  const initials = (user?.full_name ?? 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaveMsg('')
    setSaveError('')
    try {
      await updateProfile({ full_name: fullName, phone: phone || undefined })
      setSaveMsg('Profile updated successfully.')
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { setPwError('Please fill in all fields.'); return }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return }
    if (newPassword.length < 8) { setPwError('Password must be at least 8 characters.'); return }
    setPwLoading(true)
    setPwMsg('')
    setPwError('')
    try {
      const supabase = createClient()
      // Re-authenticate then update
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: user?.email ?? '', password: currentPassword })
      if (signInError) throw new Error('Current password is incorrect.')
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw new Error(error.message)
      setPwMsg('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e: unknown) {
      setPwError(e instanceof Error ? e.message : 'Failed to update password.')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 40, paddingBottom: 28, borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Customer Portal</div>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40 }}>My <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Profile</span></h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 40, alignItems: 'start' }}>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border-color)' }}>
          <div style={{ background: 'var(--bg-card)', padding: '40px 28px', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Cormorant Garamond", serif', fontSize: 36, color: 'var(--gold-light)', margin: '0 auto 16px' }}>{initials}</div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>{user?.full_name ?? 'User'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.email}</div>
            <div style={{ marginTop: 12, display: 'inline-flex', padding: '4px 12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'rgba(74,124,89,0.15)', color: 'var(--success)', border: '1px solid rgba(74,124,89,0.2)' }}>Active Customer</div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '16px 0' }}>
            {[['profile', '◈ Profile Details'], ['password', '◇ Change Password'], ['notifications', '◉ Notifications']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key as typeof tab)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 28px', fontSize: 13, letterSpacing: '0.06em', background: tab === key ? 'rgba(184,134,11,0.08)' : 'transparent', borderLeft: tab === key ? '2px solid var(--gold-primary)' : '2px solid transparent', color: tab === key ? 'var(--gold-light)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif', transition: 'all 0.2s' }}>{label}</button>
            ))}
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '24px 28px' }}>
            <div style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Account Summary</div>
            {[
              ['Member Since', user?.created_at ? formatDate(user.created_at) : '—'],
              ['Total Orders', String(totalOrders)],
              ['Completed', String(completedCount)],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '16px 28px' }}>
            <form action={logout}>
              <button type="submit" style={{ fontSize: 13, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif', letterSpacing: '0.06em' }}>Sign Out</button>
            </form>
          </div>
        </div>

        {/* Main form */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: 48 }}>
          {tab === 'profile' && (
            <>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, marginBottom: 32 }}>Profile Details</h2>
              {saveMsg && <div style={{ padding: '14px 20px', background: 'rgba(74,124,89,0.1)', border: '1px solid rgba(74,124,89,0.3)', color: 'var(--success)', fontSize: 13, marginBottom: 28 }}>✓ {saveMsg}</div>}
              {saveError && <div style={{ padding: '14px 20px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', fontSize: 13, marginBottom: 28 }}>{saveError}</div>}
              <div style={{ display: 'grid', gap: 24 }}>
                <FormGroup label="Full Name">
                  <Input value={fullName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)} />
                </FormGroup>
                <FormGroup label="Email Address">
                  <Input type="email" value={user?.email ?? ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </FormGroup>
                <FormGroup label="Phone / WhatsApp">
                  <Input type="tel" placeholder="+234 800 000 0000" value={phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)} />
                </FormGroup>
                <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                  <button onClick={handleSaveProfile} disabled={saving} style={{ padding: '14px 32px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: saving ? 'var(--bg-dark)' : 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: saving ? 'var(--text-muted)' : 'var(--text-on-gold)', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: '"Libre Franklin", sans-serif' }}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === 'password' && (
            <>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, marginBottom: 32 }}>Change Password</h2>
              {pwMsg && <div style={{ padding: '14px 20px', background: 'rgba(74,124,89,0.1)', border: '1px solid rgba(74,124,89,0.3)', color: 'var(--success)', fontSize: 13, marginBottom: 28 }}>✓ {pwMsg}</div>}
              {pwError && <div style={{ padding: '14px 20px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', fontSize: 13, marginBottom: 28 }}>{pwError}</div>}
              <div style={{ display: 'grid', gap: 24 }}>
                <FormGroup label="Current Password"><Input type="password" placeholder="Enter current password" value={currentPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)} /></FormGroup>
                <FormGroup label="New Password"><Input type="password" placeholder="Min. 8 characters" value={newPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)} /></FormGroup>
                <FormGroup label="Confirm New Password"><Input type="password" placeholder="Repeat new password" value={confirmPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)} /></FormGroup>
                <button onClick={handleChangePassword} disabled={pwLoading} style={{ padding: '14px 32px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: pwLoading ? 'var(--bg-dark)' : 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: pwLoading ? 'var(--text-muted)' : 'var(--text-on-gold)', border: 'none', cursor: pwLoading ? 'not-allowed' : 'pointer', fontFamily: '"Libre Franklin", sans-serif', alignSelf: 'flex-start' }}>
                  {pwLoading ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </>
          )}
          {tab === 'notifications' && (
            <NotificationPreferencesForm
              initial={notifPrefs ?? DEFAULT_PREFERENCES}
              onSave={saveNotificationPreferences}
            />
          )}
        </div>
      </div>
    </div>
  )
}
