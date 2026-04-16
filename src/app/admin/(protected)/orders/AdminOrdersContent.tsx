'use client'
import { useState, useTransition } from 'react'
import { formatPrice, formatDate } from '@/lib/tokens'
import { StatusBadge } from '@/components/ui'
import { updateOrderStatus } from '@/app/actions/orders'
import { getAdminUploadsForOrder } from '@/app/actions/uploads'
import type { Database } from '@/lib/types/database'

type Order = Database['public']['Tables']['orders']['Row'] & {
  profiles?: { id: string; full_name: string; email: string; phone: string | null } | null
  order_items?: Database['public']['Tables']['order_items']['Row'][]
}

const ORDER_STATUSES = ['pending', 'confirmed', 'in_progress', 'review', 'completed', 'cancelled'] as const
const FILTER_STATUSES = ['All', ...ORDER_STATUSES]
const PAYMENT_FILTERS = ['All', 'NOT_PAID', 'PARTIALLY_PAID', 'FULLY_PAID']

type UploadData = {
  artworkRefs: Database['public']['Tables']['uploads']['Row'][]
  paymentReceipts: { receipt_url: string; payment_type: string; amount: number; status: string; created_at: string }[]
}

export default function AdminOrdersContent({ orders: initial }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initial)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [payFilter, setPayFilter] = useState('All')
  const [selected, setSelected] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [orderUploads, setOrderUploads] = useState<UploadData | null>(null)

  const filtered = orders.filter(o => {
    const name = o.profiles?.full_name?.toLowerCase() ?? ''
    const ms = name.includes(search.toLowerCase()) || o.order_number.toLowerCase().includes(search.toLowerCase())
    const ss = statusFilter === 'All' || o.status === statusFilter
    const ps = payFilter === 'All' || o.payment_status === payFilter
    return ms && ss && ps
  })

  const handleSelectOrder = (order: Order) => {
    if (selected?.id === order.id) { setSelected(null); setOrderUploads(null); return }
    setSelected(order)
    setOrderUploads(null)
    startTransition(async () => {
      try {
        const uploads = await getAdminUploadsForOrder(order.id)
        setOrderUploads(uploads)
      } catch { /* ignore */ }
    })
  }

  const handleStatusUpdate = () => {
    if (!selected || !newStatus) return
    setError('')
    startTransition(async () => {
      try {
        const updated = await updateOrderStatus(selected.id, newStatus as Order['status'])
        setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o))
        setSelected(prev => prev ? { ...prev, status: updated.status } : null)
        setNewStatus('')
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Update failed')
      }
    })
  }

  const exportCSV = () => {
    const rows = ['Order,Customer,Email,Total,Paid,Status,Payment,Date',
      ...filtered.map(o => `${o.order_number},${o.profiles?.full_name ?? ''},${o.profiles?.email ?? ''},${o.total_amount},${o.amount_paid},${o.status},${o.payment_status},${o.created_at}`)
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'orders.csv'; a.click()
  }

  const inputStyle = { background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '9px 14px', color: 'var(--text-primary)', fontFamily: '"Libre Franklin",sans-serif', fontSize: 12, outline: 'none', appearance: 'none' as const }

  return (
    <div style={{ padding: 36, minHeight: '100vh' }}>
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Admin Panel</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40 }}>Order <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Management</span></h1>
        </div>
        <button onClick={exportCSV} style={{ padding: '10px 20px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>Export CSV</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <input placeholder="Search by name or order #…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 200 }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={inputStyle}>
          {FILTER_STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.replace('_', ' ')}</option>)}
        </select>
        <select value={payFilter} onChange={e => setPayFilter(e.target.value)} style={inputStyle}>
          {PAYMENT_FILTERS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Payments' : s.replace('_', ' ')}</option>)}
        </select>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>{filtered.length} orders</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid var(--border-color)' }}>
            {['Order', 'Customer', 'Total', 'Paid', 'Status', 'Payment'].map(h => (
              <div key={h} style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</div>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>No orders found.</div>
          ) : filtered.map(order => (
            <div key={order.id} onClick={() => handleSelectOrder(order)} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 1fr', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', alignItems: 'center', cursor: 'pointer', background: selected?.id === order.id ? 'rgba(184,134,11,0.04)' : 'transparent', transition: 'background 0.2s' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{order.order_number}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(order.created_at)}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{order.profiles?.full_name ?? '—'}</div>
              <div style={{ fontSize: 13, color: 'var(--gold-light)', fontWeight: 500 }}>{formatPrice(order.total_amount)}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatPrice(order.amount_paid)}</div>
              <StatusBadge status={order.status} />
              <StatusBadge status={order.payment_status} />
            </div>
          ))}
        </div>

        {selected && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', position: 'sticky', top: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20 }}>{selected.order_number}</div>
              <button onClick={() => { setSelected(null); setOrderUploads(null) }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', fontSize: 12 }}>{error}</div>}

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Customer</div>
                {[['Name', selected.profiles?.full_name ?? '—'], ['Email', selected.profiles?.email ?? '—'], ['Phone', selected.profiles?.phone ?? '—']].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{l}</span><span>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Order Details</div>
                {[['Total', formatPrice(selected.total_amount)], ['Paid', formatPrice(selected.amount_paid)], ['Remaining', formatPrice(selected.amount_remaining)], ['Delivery', selected.delivery_location.replace(/_/g, ' ')], ['Address', selected.delivery_address]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{l}</span><span style={{ textAlign: 'right', maxWidth: 180 }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Update Status</div>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '10px 12px', color: 'var(--text-primary)', fontFamily: '"Libre Franklin",sans-serif', fontSize: 13, outline: 'none', marginBottom: 10, appearance: 'none' }}>
                  <option value="">Select new status…</option>
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
                <button onClick={handleStatusUpdate} disabled={!newStatus || isPending} style={{ width: '100%', padding: '12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: newStatus && !isPending ? 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))' : 'var(--bg-dark)', color: newStatus && !isPending ? 'var(--text-on-gold)' : 'var(--text-muted)', border: 'none', cursor: newStatus && !isPending ? 'pointer' : 'not-allowed', fontFamily: '"Libre Franklin",sans-serif' }}>
                  {isPending ? 'Updating…' : 'Update Status'}
                </button>
              </div>

              {orderUploads && orderUploads.paymentReceipts.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20, marginBottom: 20 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Payment Receipts</div>
                  {orderUploads.paymentReceipts.map((p, i) => (
                    <div key={i} style={{ marginBottom: 12, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                      <a href={p.receipt_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                        <img src={p.receipt_url} alt={`Receipt ${i + 1}`} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} style={{ width: '100%', maxHeight: 140, objectFit: 'cover', display: 'block', background: 'var(--bg-dark)' }} />
                        <div style={{ padding: '8px 12px', background: 'var(--bg-dark)', display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                          <span style={{ color: 'var(--text-muted)' }}>{i === 0 ? (p.payment_type === 'partial' ? '1st · 50% Deposit' : '1st · Full') : '2nd · Balance'} · {formatPrice(p.amount)}</span>
                          <StatusBadge status={p.status} />
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {orderUploads && orderUploads.artworkRefs.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Artwork References</div>
                  {orderUploads.artworkRefs.map((u, i) => (
                    <div key={u.id} style={{ marginBottom: 12, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                      <a href={u.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                        <img src={u.file_url} alt={`Artwork ref ${i + 1}`} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} style={{ width: '100%', maxHeight: 140, objectFit: 'cover', display: 'block', background: 'var(--bg-dark)' }} />
                        <div style={{ padding: '8px 12px', background: 'var(--bg-dark)', fontSize: 11, color: 'var(--text-muted)' }}>{u.file_name}</div>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
