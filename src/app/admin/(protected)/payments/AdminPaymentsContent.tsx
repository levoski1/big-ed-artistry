'use client'
import { useState, useTransition } from 'react'
import { formatPrice, formatDate } from '@/lib/tokens'
import { StatusBadge } from '@/components/ui'
import { verifyPayment, rejectPayment } from '@/app/actions/payments'

type Payment = {
  id: string; order_id: string; user_id: string; amount: number
  payment_type: string; receipt_url: string; status: string
  verified_by: string | null; verified_at: string | null
  rejection_reason: string | null; created_at: string
  profiles?: { full_name: string; email: string } | null
  orders?: { order_number: string } | null
}

export default function AdminPaymentsContent({ payments: initial }: { payments: Payment[] }) {
  const [payments, setPayments] = useState(initial)
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<Payment | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const filtered = filter === 'All' ? payments : payments.filter(p => p.status === filter)

  const handleVerify = (id: string) => {
    setError('')
    startTransition(async () => {
      try {
        const updated = await verifyPayment(id)
        setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p))
        if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: 'verified' } : null)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Verification failed.')
      }
    })
  }

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) { setError('Please enter a rejection reason.'); return }
    setError('')
    startTransition(async () => {
      try {
        const updated = await rejectPayment(id, rejectReason)
        setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p))
        if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: 'rejected' } : null)
        setRejectReason('')
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Rejection failed.')
      }
    })
  }

  return (
    <div style={{ padding: 36, minHeight: '100vh' }}>
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Admin Panel</div>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40 }}>Payment <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Verification</span></h1>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['All', 'pending', 'verified', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 18px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: filter === f ? 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))' : 'transparent', color: filter === f ? 'var(--text-on-gold)' : 'var(--text-secondary)', border: filter === f ? 'none' : '1px solid var(--border-color)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>
            {f === 'All' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>{filtered.length} payments</div>
      </div>

      {error && <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', fontSize: 13 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border-color)' }}>
          {filtered.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>No payments found.</div>
          ) : filtered.map(payment => (
            <div key={payment.id} onClick={() => setSelected(selected?.id === payment.id ? null : payment)} style={{ background: 'var(--bg-card)', padding: '24px 28px', cursor: 'pointer', borderLeft: selected?.id === payment.id ? '3px solid var(--gold-primary)' : '3px solid transparent', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 18 }}>{payment.profiles?.full_name ?? 'Unknown'}</div>
                    <StatusBadge status={payment.status} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{payment.profiles?.email}</div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span>Order: <strong style={{ color: 'var(--gold-light)' }}>{payment.orders?.order_number ?? '—'}</strong></span>
                    <span>Amount: <strong style={{ color: 'var(--gold-light)' }}>{formatPrice(payment.amount)}</strong></span>
                    <span>Type: {payment.payment_type}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{formatDate(payment.created_at)}</div>
                </div>
                {payment.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={e => { e.stopPropagation(); handleVerify(payment.id) }} disabled={isPending} style={{ padding: '8px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(74,124,89,0.15)', color: 'var(--success)', border: '1px solid rgba(74,124,89,0.3)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>
                      Verify
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', position: 'sticky', top: 24 }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20 }}>Payment Details</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              {[
                ['Customer', selected.profiles?.full_name ?? '—'],
                ['Email', selected.profiles?.email ?? '—'],
                ['Order', selected.orders?.order_number ?? '—'],
                ['Amount', formatPrice(selected.amount)],
                ['Type', selected.payment_type],
                ['Status', selected.status],
                ['Submitted', formatDate(selected.created_at)],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{l}</span><span style={{ textTransform: 'capitalize' }}>{v}</span>
                </div>
              ))}

              {/* Receipt preview */}
              <div style={{ marginTop: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Receipt</div>
                <a href={selected.receipt_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '10px 14px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', fontSize: 12, color: 'var(--gold-light)', textDecoration: 'none' }}>
                  View Receipt →
                </a>
              </div>

              {selected.status === 'pending' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button onClick={() => handleVerify(selected.id)} disabled={isPending} style={{ padding: '12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'rgba(74,124,89,0.15)', color: 'var(--success)', border: '1px solid rgba(74,124,89,0.3)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>
                    ✓ Verify Payment
                  </button>
                  <div>
                    <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Rejection reason (required)…" style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '10px 12px', color: 'var(--text-primary)', fontFamily: '"Libre Franklin",sans-serif', fontSize: 13, outline: 'none', resize: 'none', minHeight: 70, boxSizing: 'border-box' }} />
                    <button onClick={() => handleReject(selected.id)} disabled={isPending || !rejectReason.trim()} style={{ width: '100%', marginTop: 8, padding: '12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'rgba(139,58,58,0.15)', color: 'var(--danger)', border: '1px solid rgba(139,58,58,0.3)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>
                      ✕ Reject Payment
                    </button>
                  </div>
                </div>
              )}
              {selected.rejection_reason && (
                <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(139,58,58,0.1)', border: '1px solid rgba(139,58,58,0.2)', fontSize: 12, color: 'var(--danger)' }}>
                  Rejection reason: {selected.rejection_reason}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
