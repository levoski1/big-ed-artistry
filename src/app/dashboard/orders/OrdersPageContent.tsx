'use client'
import { useState } from 'react'
import { formatPrice, formatDate } from '@/lib/tokens'
import { StatusBadge } from '@/components/ui'
import Link from 'next/link'
import type { Database } from '@/lib/types/database'

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items: Database['public']['Tables']['order_items']['Row'][]
}

export default function OrdersPageContent({ orders, paymentMap }: { orders: Order[]; paymentMap: Record<string, { status: string; totalSubmitted: number }> }) {
  const [selected, setSelected] = useState<Order | null>(null)

  const getPaymentDisplay = (order: Order) => {
    if (order.payment_status !== ('NOT_PAID' as string)) return order.payment_status
    const p = paymentMap[order.id]
    if (!p) return order.payment_status
    if (p.status === 'pending') return 'pending_verification'
    if (p.status === 'rejected') return 'rejected'
    return order.payment_status
  }

  // Show submitted amount if admin hasn't verified yet
  const getDisplayAmountPaid = (order: Order) => {
    if (order.amount_paid > 0) return order.amount_paid
    return paymentMap[order.id]?.totalSubmitted ?? 0
  }

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 40, paddingBottom: 28, borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Customer Portal</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40 }}>My <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Orders</span></h1>
        </div>
        <Link href="/custom-artwork" style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: 'var(--text-on-gold)', textDecoration: 'none' }}>+ New Order</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 80px', padding: '14px 24px', borderBottom: '1px solid var(--border-color)' }}>
            {['Order', 'Total', 'Paid', 'Status', 'Payment', ''].map(h => (
              <div key={h} style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</div>
            ))}
          </div>

          {orders.length === 0 ? (
            <div style={{ padding: 80, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>◇</div>
              <div style={{ fontSize: 14 }}>No orders yet.</div>
              <Link href="/custom-artwork" style={{ display: 'inline-flex', marginTop: 20, padding: '12px 24px', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: 'var(--text-on-gold)', textDecoration: 'none' }}>Place First Order</Link>
            </div>
          ) : orders.map(order => (
            <div key={order.id} onClick={() => setSelected(selected?.id === order.id ? null : order)} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 80px', padding: '20px 24px', borderBottom: '1px solid var(--border-color)', alignItems: 'center', cursor: 'pointer', background: selected?.id === order.id ? 'rgba(184,134,11,0.04)' : 'transparent', transition: 'background 0.2s' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{order.order_number}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(order.created_at)}</div>
              </div>
              <div style={{ fontSize: 14, color: 'var(--gold-light)', fontWeight: 500 }}>{formatPrice(order.total_amount)}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatPrice(order.amount_paid)}</div>
              <StatusBadge status={order.status} />
              <StatusBadge status={getPaymentDisplay(order)} />
              <button style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '6px 12px', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif' }}>View</button>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', position: 'sticky', top: 24 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20 }}>{selected.order_number}</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              {/* Timeline */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>Order Timeline</div>
                {[
                  { label: 'Order Placed', done: true, date: formatDate(selected.created_at) },
                  { label: 'Payment Verified', done: selected.payment_status !== 'NOT_PAID' },
                  { label: 'In Progress', done: ['in_progress', 'completed'].includes(selected.status) },
                  { label: 'Completed', done: selected.status === 'completed' },
                ].map(step => (
                  <div key={step.label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: step.done ? 'var(--gold-primary)' : 'var(--bg-dark)', border: step.done ? 'none' : '1px solid var(--border-color)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text-on-gold)', marginTop: 2 }}>{step.done ? '✓' : ''}</div>
                    <div>
                      <div style={{ fontSize: 13, color: step.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>{step.label}</div>
                      {'date' in step && step.date && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{step.date}</div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Details */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>Order Details</div>
                {[
                  ['Total Amount', formatPrice(selected.total_amount)],
                  ['Amount Paid', formatPrice(getDisplayAmountPaid(selected))],
                  ['Remaining', formatPrice(Math.max(0, selected.total_amount - getDisplayAmountPaid(selected)))],
                  ['Delivery', selected.delivery_location.replace(/_/g, ' ')],
                  ['Items', String(selected.order_items?.length ?? 0)],
                  ['Placed', formatDate(selected.created_at)],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                    <span style={{ textTransform: 'capitalize' }}>{v}</span>
                  </div>
                ))}
              </div>

              {selected.notes && (
                <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(184,134,11,0.06)', border: '1px solid rgba(184,134,11,0.2)', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Notes</div>
                  {selected.notes}
                </div>
              )}

              {selected.payment_status === ('NOT_PAID' as string) && !paymentMap[selected.id] && (
                <Link href="/dashboard/payments" style={{ display: 'flex', justifyContent: 'center', marginTop: 24, padding: '12px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: 'var(--text-on-gold)', textDecoration: 'none' }}>Upload Payment Proof →</Link>
              )}
              {paymentMap[selected.id]?.status === 'pending' && (
                <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.3)', fontSize: 13, color: 'var(--gold-light)' }}>
                  ⏳ Your payment receipt is awaiting admin verification.
                </div>
              )}
              {paymentMap[selected.id]?.status === 'rejected' && (
                <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(139,58,58,0.1)', border: '1px solid rgba(139,58,58,0.3)', fontSize: 13, color: 'var(--danger)' }}>
                  ✕ Your payment was rejected. Please upload a new receipt.
                  <Link href="/dashboard/payments" style={{ display: 'block', marginTop: 10, textAlign: 'center', padding: '10px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: 'var(--text-on-gold)', textDecoration: 'none' }}>Re-upload Receipt →</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
