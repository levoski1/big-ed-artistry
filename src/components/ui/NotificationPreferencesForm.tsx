'use client'
import { useState } from 'react'
import type { NotificationPreferences } from '@/lib/notificationPreferences.shared'

const PREF_LABELS: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  { key: 'order_confirmation', label: 'Order Confirmation', description: 'Receive an email when your order is placed.' },
  { key: 'payment_confirmation', label: 'Payment Confirmation', description: 'Receive an email when your payment is verified.' },
  { key: 'payment_reminder', label: 'Payment Reminders', description: 'Receive reminders for outstanding payments.' },
  { key: 'order_status_update', label: 'Order Status Updates', description: 'Receive emails when your order status changes.' },
  { key: 'welcome', label: 'Welcome Email', description: 'Receive a welcome email when you register.' },
]

interface Props {
  initial: NotificationPreferences
  onSave: (prefs: NotificationPreferences) => Promise<void>
}

export default function NotificationPreferencesForm({ initial, onSave }: Props) {
  const [prefs, setPrefs] = useState<NotificationPreferences>(initial)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const toggle = (key: keyof NotificationPreferences) =>
    setPrefs(p => ({ ...p, [key]: !p[key] }))

  const handleSave = async () => {
    setSaving(true)
    setMsg('')
    setError('')
    try {
      await onSave(prefs)
      setMsg('Preferences saved.')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, marginBottom: 32 }}>
        Email Notifications
      </h2>

      {msg && (
        <div style={{ padding: '14px 20px', background: 'rgba(74,124,89,0.1)', border: '1px solid rgba(74,124,89,0.3)', color: 'var(--success)', fontSize: 13, marginBottom: 28 }}>
          ✓ {msg}
        </div>
      )}
      {error && (
        <div style={{ padding: '14px 20px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', fontSize: 13, marginBottom: 28 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: 1, background: 'var(--border-color)', marginBottom: 32 }}>
        {PREF_LABELS.map(({ key, label, description }) => (
          <div
            key={key}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'var(--bg-card)', gap: 24 }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{description}</div>
            </div>
            <button
              role="switch"
              aria-checked={prefs[key]}
              aria-label={`Toggle ${label}`}
              onClick={() => toggle(key)}
              style={{
                flexShrink: 0,
                width: 44,
                height: 24,
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                background: prefs[key] ? 'var(--gold-primary)' : 'var(--border-color)',
                position: 'relative',
                transition: 'background 0.2s',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  left: prefs[key] ? 23 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'var(--text-primary)',
                  transition: 'left 0.2s',
                }}
              />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: '14px 32px',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          background: saving ? 'var(--bg-dark)' : 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))',
          color: saving ? 'var(--text-muted)' : 'var(--text-on-gold)',
          border: 'none',
          cursor: saving ? 'not-allowed' : 'pointer',
          fontFamily: '"Libre Franklin", sans-serif',
        }}
      >
        {saving ? 'Saving…' : 'Save Preferences'}
      </button>
    </div>
  )
}
