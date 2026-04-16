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
  orders?: { order_number: string; total_amount: number; amount_paid: number; amount_remaining: number; payment_status: string } | null
}

function groupByOrder(payments: Payment[]) {
  const map = new Map<string, Payment[]>()
  for (const p of [...payments].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())) {
    if (!map.has(p.order_id)) map.set(p.order_id, [])
    map.get(p.order_id)!.push(p)
  }
  return Array.from(map.values()).sort((a, b) =>
    new Date(b[0].created_at).getTime() - new Date(a[0].created_at).getTime()
  )
}

function PaymentBadge({ type, index }: { type: string; index: number }) {
  const label = index === 0 ? (type === 'partial' ? '1st · 50% Deposit' : '1st · Full Payment') : '2nd · Balance'
  const color = index === 0 && type === 'partial' ? '#F59E0B' : '#10B981'
  return <span style={{ fontSize: 10, padding: '3px 8px', background: `${color}18`, color, border: `1px solid ${color}44`, letterSpacing: '0.08em', fontWeight: 600 }}>{label}</span>
}

function ReceiptPreview({ url, label }: { url: string; label: string }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
        <img src={url} alt="Receipt" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} style={{ width: '100%', maxHeight: 180, objectFit: 'contain', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', display: 'block' }} />
        <div style={{ fontSize: 11, color: 'var(--gold-light)', marginTop: 4 }}>Open full size →</div>
      </a>
    </div>
  )
}

export default function AdminPaymentsContent({ payments: initial }: { payments: Payment[] }) {
  const [payments, setPayments] = useState(initial)
  const [filter, setFilter] = useState('All')
  const [selectedGroup, setSelectedGroup] = useState<Payment[] | null>(null)
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const filtered = filter === 'All' ? payments : payments.filter(p => p.status === filter)
  const groups = groupByOrder(filtered)

  const handleVerify = (id: string) => {
    setError('')
    startTransition(async () => {
      try {
        const updated = await verifyPayment(id)
        setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p))
        setSelectedGroup(prev => prev ? prev.map(p => p.id === id ? { ...p, status: 'verified' } : p) : null)
      } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed.') }
    })
  }

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) { setError('Enter a rejection reason.'); return }
    setError('')
    startTransition(async () => {
      try {
        const updated = await rejectPayment(id, rejectReason)
        setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p))
        setSelectedGroup(prev => prev ? prev.map(p => p.id === id ? { ...p, status: 'rejected', rejection_reason: rejectReason } : p) : null)
        setRejectTarget(null); setRejectReason('')
      } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed.') }
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
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 18px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: filter === f ? 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))' : 'transparent', color: filter === f ? 'var(--text-on-gold)' : 'var(--text-secondary)', border: filter === f ? 'none' : '1px solid var(--border-color)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>
            {f === 'All' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>{groups.length} orders</div>
      </div>

      {error && <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', fontSize: 13 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: selectedGroup ? '1fr 420px' : '1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border-color)' }}>
          {groups.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>No payments found.</div>
          ) : groups.map(group => {
            const first = group[0]
            const second = group[1] ?? null
            const hasPending = group.some(p => p.status === 'pending')
            const isSelected = selectedGroup?.[0]?.order_id === first.order_id
            const orderStatus = first.orders?.payment_status

            return (
              <div key={first.order_id} onClick={() => setSelectedGroup(isSelected ? null : group)} style={{ background: 'var(--bg-card)', padding: '20px 24px', cursor: 'pointer', borderLeft: isSelected ? '3px solid var(--gold-primary)' : '3px solid transparent', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 18 }}>{first.profiles?.full_name ?? 'Unknown'}</div>
                      {orderStatus && <StatusBadge status={orderStatus} />}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{first.profiles?.email}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Order: <strong style={{ color: 'var(--gold-light)' }}>{first.orders?.order_number ?? '—'}</strong>
                      {first.orders && <span style={{ marginLeft: 10 }}>Total: <strong style={{ color: 'var(--gold-light)' }}>{formatPrice(first.orders.total_amount)}</strong> · Paid: <strong style={{ color: '#10B981' }}>{formatPrice(first.orders.amount_paid)}</strong>{first.orders.amount_remaining > 0 && <span> · Due: <strong style={{ color: '#F59E0B' }}>{formatPrice(first.orders.amount_remaining)}</strong></span>}</span>}
                    </div>
                  </div>
                  {hasPending && <span style={{ fontSize: 10, padding: '4px 10px', background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)', letterSpacing: '0.08em', fontWeight: 600, flexShrink: 0 }}>NEEDS REVIEW</span>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {group.map((p, i) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', fontSize: 12 }}>
                      <PaymentBadge type={p.payment_type} index={i} />
                      <span style={{ color: 'var(--gold-light)' }}>{formatPrice(p.amount)}</span>
                      <StatusBadge status={p.status} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {selectedGroup && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', position: 'sticky', top: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
              <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20 }}>{selectedGroup[0].orders?.order_number ?? 'Details'}</div>
              <button onClick={() => setSelectedGroup(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              {selectedGroup[0].orders && (
                <div style={{ marginBottom: 24, padding: 16, background: 'rgba(184,134,11,0.06)', border: '1px solid rgba(184,134,11,0.2)' }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Order Summary</div>
                  {[
                    ['Customer', selectedGroup[0].profiles?.full_name ?? '—'],
                    ['Order #', selectedGroup[0].orders.order_number],
                    ['Total', formatPrice(selectedGroup[0].orders.total_amount)],
                    ['Paid', formatPrice(selectedGroup[0].orders.amount_paid)],
                    ['Remaining', formatPrice(selectedGroup[0].orders.amount_remaining)],
                    ['Status', selectedGroup[0].orders.payment_status.replace(/_/g, ' ')],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(184,134,11,0.1)', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{l}</span><span style={{ textTransform: 'capitalize' }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedGroup.map((payment, idx) => (
                <div key={payment.id} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: idx < selectedGroup.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <PaymentBadge type={payment.payment_type} index={idx} />
                    <StatusBadge status={payment.status} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{formatDate(payment.created_at)}</span>
                  </div>
                  {[
                    ['Amount', formatPrice(payment.amount)],
                    ['Type', payment.payment_type],
                    ...(payment.verified_at ? [['Verified', formatDate(payment.verified_at)]] : []),
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{l}</span><span style={{ textTransform: 'capitalize' }}>{v}</span>
                    </div>
                  ))}
                  <ReceiptPreview url={payment.receipt_url} label={`Payment Proof ${idx + 1}`} />
                  {payment.status === 'pending' && (
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <button onClick={() => handleVerify(payment.id)} disabled={isPending} style={{ padding: '10px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(74,124,89,0.15)', color: 'var(--success)', border: '1px solid rgba(74,124,89,0.3)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>✓ Verify This Payment</button>
                      {rejectTarget === payment.id ? (
                        <div>
                          <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Rejection reason…" style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '10px 12px', color: 'var(--text-primary)', fontFamily: '"Libre Franklin",sans-serif', fontSize: 13, outline: 'none', resize: 'none', minHeight: 60, boxSizing: 'border-box' }} />
                          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                            <button onClick={() => handleReject(payment.id)} disabled={isPending} style={{ flex: 1, padding: '9px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(139,58,58,0.15)', color: 'var(--danger)', border: '1px solid rgba(139,58,58,0.3)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>Confirm Reject</button>
                            <button onClick={() => { setRejectTarget(null); setRejectReason('') }} style={{ padding: '9px 14px', fontSize: 11, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setRejectTarget(payment.id)} style={{ padding: '10px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(139,58,58,0.15)', color: 'var(--danger)', border: '1px solid rgba(139,58,58,0.3)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>✕ Reject This Payment</button>
                      )}
                    </div>
                  )}
                  {payment.rejection_reason && (
                    <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(139,58,58,0.1)', border: '1px solid rgba(139,58,58,0.2)', fontSize: 12, color: 'var(--danger)' }}>Rejected: {payment.rejection_reason}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
