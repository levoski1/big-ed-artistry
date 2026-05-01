'use client'
import { useState } from 'react'
import { formatPrice, formatDate } from '@/lib/tokens'
import { StatusBadge } from '@/components/ui'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  orders: {
    id: string; user_id: string; order_number: string
    total_amount: number; amount_paid: number
    status: string; payment_status: string; created_at: string
  }[]
}

export default function AdminCustomersContent({ customers }: { customers: Profile[] }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Profile | null>(null)

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: 36, minHeight: '100vh' }} className="admin-customers-page">
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Admin Panel</div>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40 }}>Customer <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Directory</span></h1>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }} className="customers-filters">
        <input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '9px 14px', color: 'var(--text-primary)', fontFamily: '"Libre Franklin",sans-serif', fontSize: 12, outline: 'none' }} />
        <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>{filtered.length} customers</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 24, alignItems: 'start' }} className="customers-layout">
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid var(--border-color)' }} className="customers-table-head">
            {['Name', 'Email', 'Phone', 'Orders', 'Joined'].map(h => (
              <div key={h} style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</div>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>No customers yet.</div>
          ) : filtered.map(c => (
            <div key={c.id} onClick={() => setSelected(selected?.id === c.id ? null : c)} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', alignItems: 'center', cursor: 'pointer', background: selected?.id === c.id ? 'rgba(184,134,11,0.04)' : 'transparent', transition: 'background 0.2s' }} className="customer-row">
              <div style={{ fontSize: 13, fontWeight: 500 }}>{c.full_name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.email}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.phone ?? '—'}</div>
              <div style={{ fontSize: 13, color: 'var(--gold-light)' }}>{c.orders?.length ?? 0}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(c.created_at)}</div>
              {/* Mobile card meta — shown only on small screens via CSS */}
              <div className="customer-card-meta" style={{ display: 'none', gridColumn: '1 / -1', marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                {c.email} · <span style={{ color: 'var(--gold-light)' }}>{c.orders?.length ?? 0} orders</span>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', position: 'sticky', top: 24 }} className="customer-detail-panel">
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20 }}>{selected.full_name}</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 24 }}>
                {[
                  ['Email', selected.email],
                  ['Phone', selected.phone ?? '—'],
                  ['Member Since', formatDate(selected.created_at)],
                  ['Total Orders', String(selected.orders?.length ?? 0)],
                  ['Total Spent', formatPrice(selected.orders?.reduce((s, o) => s + o.amount_paid, 0) ?? 0)],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{l}</span><span>{v}</span>
                  </div>
                ))}
              </div>

              {selected.orders && selected.orders.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Order History</div>
                  {selected.orders.slice(0, 5).map(o => (
                    <div key={o.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{o.order_number}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(o.created_at)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: 'var(--gold-light)' }}>{formatPrice(o.total_amount)}</div>
                        <StatusBadge status={o.status} />
                      </div>
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
          .admin-customers-page { padding: 16px !important; }
          .customers-filters { flex-direction: column !important; }
          .customers-layout { grid-template-columns: 1fr !important; }
          .customers-table-head { display: none !important; }
          .customer-row { grid-template-columns: 1fr !important; padding: 14px 16px !important; }
          .customer-row > div:nth-child(2),
          .customer-row > div:nth-child(3),
          .customer-row > div:nth-child(4),
          .customer-row > div:nth-child(5) { display: none !important; }
          .customer-card-meta { display: block !important; }
          .customer-detail-panel { position: static !important; }
        }
        @media (min-width: 701px) and (max-width: 1024px) {
          .admin-customers-page { padding: 20px !important; }
          .customers-layout { grid-template-columns: 1fr !important; }
          .customer-detail-panel { position: static !important; }
          .customers-table-head,
          .customer-row { grid-template-columns: 1.5fr 1.5fr 1fr 1fr !important; }
          .customers-table-head > div:nth-child(3),
          .customer-row > div:nth-child(3) { display: none !important; }
        }
      `}</style>
    </div>
  )
}
