'use client'
import { useState, useTransition } from 'react'
import { formatPrice, formatDate } from '@/lib/tokens'
import { StatusBadge } from '@/components/ui'
import { updateOrderStatus } from '@/app/actions/orders'
import { getAdminUploadsForOrder, type AdminOrderUploads } from '@/app/actions/uploads'
import type { Database } from '@/lib/types/database'

type Order = Database['public']['Tables']['orders']['Row'] & {
  profiles?: { id: string; full_name: string; email: string; phone: string | null } | null
  order_items?: Database['public']['Tables']['order_items']['Row'][]
}

const ORDER_STATUSES = ['pending', 'in_progress', 'completed', 'canceled'] as const
const FILTER_STATUSES = ['All', ...ORDER_STATUSES]
const PAYMENT_FILTERS = ['All', 'NOT_PAID', 'PARTIALLY_PAID', 'FULLY_PAID']

function ImagePreview({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState(false)
  const [open, setOpen] = useState(false)
  if (broken) {
    return (
      <div style={{ width: '100%', aspectRatio: '4/3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'var(--text-muted)', fontSize: 11, gap: 4, minHeight: 80 }}>
        <span style={{ fontSize: 20, opacity: 0.4 }}>🖼</span>
        <span>Image unavailable</span>
      </div>
    )
  }
  return (
    <>
      <div onClick={() => setOpen(true)} style={{ cursor: 'pointer', position: 'relative' }}>
        <img
          src={src}
          alt={alt}
          onError={() => setBroken(true)}
          style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block', background: 'var(--bg-dark)' }}
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', background: 'rgba(0,0,0,0.4)', fontSize: 24 }} className="img-hover-preview">🔍</div>
      </div>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 40 }}>
          <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer', zIndex: 10 }}>✕</button>
          <img src={src} alt={alt} style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 4 }} />
        </div>
      )}
      <style>{`.img-hover-preview:hover { opacity: 1 !important; }`}</style>
    </>
  )
}

function ItemServiceLabel(item: Database['public']['Tables']['order_items']['Row']): string {
  if (item.item_type === 'store_product') return item.product_id ?? 'Store Product'
  if (item.artwork_type === 'photo_enlargement') return 'Photo Enlargement'
  return 'Custom Artwork'
}

function ItemSizeLabel(item: Database['public']['Tables']['order_items']['Row']): string {
  const parts: string[] = []
  if (item.size_label) parts.push(item.size_label)
  if (item.canvas_option) parts.push(`Canvas: ${item.canvas_option}`)
  if (item.frame_option) parts.push(`Frame: ${item.frame_option}`)
  if (item.glass_option) parts.push(`Glass: ${item.glass_option}`)
  return parts.join(' · ') || '—'
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
  const [orderUploads, setOrderUploads] = useState<AdminOrderUploads | null>(null)

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
    <div style={{ padding: 36, minHeight: '100vh' }} className="admin-orders-page">
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Admin Panel</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40 }}>Order <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Management</span></h1>
        </div>
        <button onClick={exportCSV} style={{ padding: '10px 20px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>Export CSV</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }} className="orders-filters">
        <input placeholder="Search by name or order #…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 200 }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={inputStyle}>
          {FILTER_STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.replace('_', ' ')}</option>)}
        </select>
        <select value={payFilter} onChange={e => setPayFilter(e.target.value)} style={inputStyle}>
          {PAYMENT_FILTERS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Payments' : s.replace('_', ' ')}</option>)}
        </select>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>{filtered.length} orders</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: 24, alignItems: 'start' }} className="orders-layout">
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid var(--border-color)' }} className="orders-table-head">
            {['Order', 'Customer', 'Total', 'Paid', 'Status', 'Payment'].map(h => (
              <div key={h} style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</div>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>No orders found.</div>
          ) : filtered.map(order => (
            <div key={order.id} onClick={() => handleSelectOrder(order)} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 1fr', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', alignItems: 'center', cursor: 'pointer', background: selected?.id === order.id ? 'rgba(184,134,11,0.04)' : 'transparent', transition: 'background 0.2s' }} className="order-row">
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{order.order_number}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(order.created_at)}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{order.profiles?.full_name ?? '—'}</div>
              <div style={{ fontSize: 13, color: 'var(--gold-light)', fontWeight: 500 }}>{formatPrice(order.total_amount)}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatPrice(order.amount_paid)}</div>
              <StatusBadge status={order.status} />
              <StatusBadge status={order.payment_status} />
              <div className="order-card-meta" style={{ display: 'none', gridColumn: '1 / -1', marginTop: 8, gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{order.profiles?.full_name ?? '—'}</span>
                <span style={{ fontSize: 12, color: 'var(--gold-light)', fontWeight: 500, marginLeft: 'auto' }}>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', position: 'sticky', top: 24, maxHeight: '90vh', overflowY: 'auto' }} className="order-detail-panel">
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

              {/* Order Items with Uploaded Images */}
              {orderUploads && orderUploads.items.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20, marginBottom: 20 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Order Items ({orderUploads.items.length})</div>
                  {orderUploads.items.map((item, idx) => (
                    <div key={item.id} style={{ marginBottom: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                      <div style={{ padding: '10px 14px', background: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>#{idx + 1} — {ItemServiceLabel(item)}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{ItemSizeLabel(item)}</div>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--gold-light)' }}>{formatPrice(item.item_subtotal)}</div>
                      </div>

                      {item.uploads.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border-color)' }}>
                          {item.uploads.map((u) => (
                            <div key={u.id} style={{ background: 'var(--bg-card)' }}>
                              <a href={u.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
                                <ImagePreview src={u.file_url} alt={u.file_name} />
                              </a>
                              <div style={{ padding: '6px 10px', fontSize: 10, color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.file_name}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: '24px 14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                          No reference images uploaded for this item.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {orderUploads && orderUploads.items.length === 0 && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20, marginBottom: 20 }}>
                  <div style={{ padding: '24px 14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                    This order has no items.
                  </div>
                </div>
              )}

              {orderUploads && orderUploads.paymentReceipts.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20, marginBottom: 20 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Payment Receipts</div>
                  {orderUploads.paymentReceipts.map((p, i) => (
                    <div key={p.id} style={{ marginBottom: 12, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                      <a href={p.receipt_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                        <ImagePreview src={p.receipt_url} alt={`Receipt ${i + 1}`} />
                        <div style={{ padding: '8px 12px', background: 'var(--bg-dark)', display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                          <span style={{ color: 'var(--text-muted)' }}>{i === 0 ? (p.payment_type === 'partial' ? '1st · 50% Deposit' : '1st · Full') : '2nd · Balance'} · {formatPrice(p.amount)}</span>
                          <StatusBadge status={p.status} />
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style suppressHydrationWarning>{`
        @media (max-width: 700px) {
          .admin-orders-page { padding: 16px !important; }
          .orders-filters { flex-direction: column !important; }
          .orders-filters input,
          .orders-filters select { width: 100% !important; }
          .orders-layout { grid-template-columns: 1fr !important; }
          .orders-table-head { display: none !important; }
          .order-row {
            grid-template-columns: 1fr 1fr !important;
            padding: 14px 16px !important;
            gap: 6px 12px;
          }
          .order-row > div:nth-child(2),
          .order-row > div:nth-child(3),
          .order-row > div:nth-child(4) { display: none !important; }
          .order-card-meta { display: flex !important; }
          .order-detail-panel { position: static !important; max-height: none !important; }
        }
        @media (min-width: 701px) and (max-width: 1024px) {
          .admin-orders-page { padding: 20px !important; }
          .orders-layout { grid-template-columns: 1fr !important; }
          .order-detail-panel { position: static !important; max-height: none !important; }
          .orders-table-head,
          .order-row { grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr !important; }
          .orders-table-head > div:nth-child(4),
          .order-row > div:nth-child(4) { display: none !important; }
        }
      `}</style>
    </div>
  )
}