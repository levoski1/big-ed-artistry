'use client'
import { useState } from 'react'
import { mockPayments } from '@/lib/mockData'
import { formatPrice, formatDate } from '@/lib/tokens'
import { StatusBadge, FormGroup, Input } from '@/components/ui'

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<'payments' | 'profile' | 'bank' | 'notifications'>('payments')
  const [payments, setPayments] = useState(mockPayments)

  const verify = (id: string) => setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'verified' as const } : p))
  const reject = (id: string) => setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' as const } : p))

  const tabs = [
    ['payments', '💳 Payment Verification'],
    ['bank', '🏦 Bank Details'],
    ['profile', '◈ Admin Profile'],
    ['notifications', '◉ Notifications'],
  ] as const

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 36, paddingBottom: 24, borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Admin Panel</div>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40 }}>Settings <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>& Verification</span></h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start' }}>
        {/* Tab nav */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          {tabs.map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '16px 20px', fontSize: 13, letterSpacing: '0.06em', background: tab === key ? 'rgba(184,134,11,0.08)' : 'transparent', borderLeft: tab === key ? '2px solid var(--gold-primary)' : '2px solid transparent', color: tab === key ? 'var(--gold-light)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif', transition: 'all 0.2s', borderBottom: '1px solid var(--border-color)' }}>{label}</button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {tab === 'payments' && (
            <div>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 32, marginBottom: 8 }}>Payment Verification</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32, lineHeight: 1.7 }}>Review and verify payment proofs submitted by customers before commencing artwork.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border-color)' }}>
                {payments.map(payment => (
                  <div key={payment.id} style={{ background: 'var(--bg-card)', padding: '28px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20 }}>{payment.customerName}</div>
                          <StatusBadge status={payment.status} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                          {[['Order', payment.orderNumber], ['Amount', formatPrice(payment.amount)], ['Submitted', formatDate(payment.submittedAt)]].map(([l, v]) => (
                            <div key={l}>
                              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>{l}</div>
                              <div style={{ fontSize: 13, color: l === 'Amount' ? 'var(--gold-light)' : 'var(--text-primary)', fontWeight: l === 'Amount' ? 500 : 400 }}>{v}</div>
                            </div>
                          ))}
                        </div>
                        {payment.verifiedAt && (
                          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--success)' }}>✓ Verified on {formatDate(payment.verifiedAt)}</div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                        {/* Proof image placeholder */}
                        <div style={{ width: 120, height: 90, background: 'var(--bg-dark)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'var(--text-muted)' }}>📎</div>
                        <button style={{ padding: '6px 12px', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif' }}>View Receipt</button>
                      </div>
                    </div>

                    {payment.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
                        <button onClick={() => verify(payment.id)} style={{ flex: 1, padding: '12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(74,124,89,0.15)', color: 'var(--success)', border: '1px solid rgba(74,124,89,0.3)', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif' }}>✓ Verify — Start Work</button>
                        <button onClick={() => reject(payment.id)} style={{ padding: '12px 24px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(139,58,58,0.1)', color: 'var(--danger)', border: '1px solid rgba(139,58,58,0.2)', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif' }}>Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'bank' && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: 48 }}>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 32, marginBottom: 8 }}>Bank Details</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>These details are shown to customers when they need to make a payment.</p>
              <div style={{ display: 'grid', gap: 20 }}>
                <FormGroup label="Bank Name"><Input defaultValue="First Bank Nigeria" /></FormGroup>
                <FormGroup label="Account Name"><Input defaultValue="Big Ed Artistry" /></FormGroup>
                <FormGroup label="Account Number"><Input defaultValue="1234567890" /></FormGroup>
                <FormGroup label="Sort Code / SWIFT (Optional)"><Input placeholder="For international payments" /></FormGroup>
                <button style={{ padding: '14px 32px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: 'var(--text-on-gold)', border: 'none', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif', alignSelf: 'flex-start' }}>Save Bank Details</button>
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: 48 }}>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 32, marginBottom: 32 }}>Admin Profile</h2>
              <div style={{ display: 'grid', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <FormGroup label="First Name"><Input defaultValue="Big" /></FormGroup>
                  <FormGroup label="Last Name"><Input defaultValue="Ed" /></FormGroup>
                </div>
                <FormGroup label="Admin Email"><Input type="email" defaultValue="admin@bigedartistry.com" /></FormGroup>
                <FormGroup label="Phone"><Input defaultValue="+234 800 000 0000" /></FormGroup>
                <button style={{ padding: '14px 32px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: 'var(--text-on-gold)', border: 'none', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif', alignSelf: 'flex-start' }}>Save Profile</button>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: 48 }}>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 32, marginBottom: 8 }}>Notification Settings</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>Configure how and when you receive notifications about orders and payments.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  ['New order placed', 'Receive an email when a customer submits a new commission request.', true],
                  ['Payment proof uploaded', 'Notify when a customer uploads payment proof for verification.', true],
                  ['Order milestone reached', 'Alert when an order moves to a new status stage.', false],
                  ['Weekly summary', 'Receive a weekly overview of orders, revenue, and customers.', true],
                ].map(([title, desc, defaultOn]) => (
                  <div key={title as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{title as string}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{desc as string}</div>
                    </div>
                    <div style={{ width: 44, height: 24, background: defaultOn ? 'var(--gold-primary)' : 'var(--border-color)', borderRadius: 12, position: 'relative', cursor: 'pointer', flexShrink: 0, marginLeft: 24 }}>
                      <div style={{ width: 18, height: 18, background: 'white', borderRadius: '50%', position: 'absolute', top: 3, left: defaultOn ? 23 : 3, transition: 'left 0.2s' }} />
                    </div>
                  </div>
                ))}
              </div>
              <button style={{ marginTop: 32, padding: '14px 32px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: 'var(--text-on-gold)', border: 'none', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif' }}>Save Preferences</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
