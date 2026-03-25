'use client'
import { useState } from 'react'
import { FormGroup, Input } from '@/components/ui'

export default function ProfilePage() {
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'profile' | 'password'>('profile')

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 40, paddingBottom: 28, borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Customer Portal</div>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40 }}>My <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Profile</span></h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 40, alignItems: 'start' }}>
        {/* Avatar & nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border-color)' }}>
          <div style={{ background: 'var(--bg-card)', padding: '40px 28px', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Cormorant Garamond", serif', fontSize: 36, color: 'var(--gold-light)', margin: '0 auto 16px' }}>A</div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Adaeze Okafor</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>adaeze@example.com</div>
            <div style={{ marginTop: 12, display: 'inline-flex', padding: '4px 12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'rgba(74,124,89,0.15)', color: 'var(--success)', border: '1px solid rgba(74,124,89,0.2)' }}>Active Customer</div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '16px 0' }}>
            {[['profile', '◈ Profile Details'], ['password', '◇ Change Password']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key as typeof tab)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 28px', fontSize: 13, letterSpacing: '0.06em', background: tab === key ? 'rgba(184,134,11,0.08)' : 'transparent', borderLeft: tab === key ? '2px solid var(--gold-primary)' : '2px solid transparent', color: tab === key ? 'var(--gold-light)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif', transition: 'all 0.2s' }}>{label}</button>
            ))}
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '24px 28px' }}>
            <div style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Account Summary</div>
            {[['Member Since', 'Nov 2024'], ['Total Orders', '3'], ['Completed', '1']].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: 48 }}>
          {tab === 'profile' && (
            <>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, marginBottom: 32 }}>Profile Details</h2>
              {saved && (
                <div style={{ padding: '14px 20px', background: 'rgba(74,124,89,0.1)', border: '1px solid rgba(74,124,89,0.3)', color: 'var(--success)', fontSize: 13, marginBottom: 28 }}>
                  ✓ Profile updated successfully
                </div>
              )}
              <div style={{ display: 'grid', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <FormGroup label="First Name"><Input defaultValue="Adaeze" /></FormGroup>
                  <FormGroup label="Last Name"><Input defaultValue="Okafor" /></FormGroup>
                </div>
                <FormGroup label="Email Address"><Input type="email" defaultValue="adaeze@example.com" /></FormGroup>
                <FormGroup label="Phone / WhatsApp"><Input type="tel" defaultValue="+234 801 234 5678" /></FormGroup>
                <FormGroup label="Country"><Input defaultValue="Nigeria" /></FormGroup>
                <FormGroup label="Shipping Address"><Input defaultValue="14 Victoria Island, Lagos" /></FormGroup>
                <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                  <button onClick={() => setSaved(true)} style={{ padding: '14px 32px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: 'var(--text-on-gold)', border: 'none', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif' }}>Save Changes</button>
                  <button onClick={() => setSaved(false)} style={{ padding: '14px 24px', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif' }}>Cancel</button>
                </div>
              </div>
            </>
          )}

          {tab === 'password' && (
            <>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, marginBottom: 32 }}>Change Password</h2>
              <div style={{ display: 'grid', gap: 24 }}>
                <FormGroup label="Current Password"><Input type="password" placeholder="Enter current password" /></FormGroup>
                <FormGroup label="New Password"><Input type="password" placeholder="Choose new password (min. 8 chars)" /></FormGroup>
                <FormGroup label="Confirm New Password"><Input type="password" placeholder="Repeat new password" /></FormGroup>
                <button style={{ padding: '14px 32px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: 'var(--text-on-gold)', border: 'none', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif', alignSelf: 'flex-start' }}>Update Password</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
