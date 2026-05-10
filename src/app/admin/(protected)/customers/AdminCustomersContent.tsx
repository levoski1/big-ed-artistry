'use client'
import { useState, useTransition } from 'react'
import { formatPrice, formatDate } from '@/lib/tokens'
import { StatusBadge } from '@/components/ui'
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal'
import ToastNotification from '@/components/ui/ToastNotification'
import { deleteUser } from '@/app/actions/admin'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  orders: {
    id: string; user_id: string; order_number: string
    total_amount: number; amount_paid: number
    status: string; payment_status: string; created_at: string
  }[]
}

export default function AdminCustomersContent({ customers: initial }: { customers: Profile[] }) {
  const [customers, setCustomers] = useState(initial)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Profile | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = (deletionType: 'user_only' | 'full') => {
    if (!deleteTarget) return
    setDeleteError('')
    startTransition(async () => {
      try {
        const result = await deleteUser(deleteTarget.id, deletionType)
        if ('error' in result) {
          setDeleteError(result.error)
          return
        }
        setCustomers(prev => prev.filter(c => c.id !== deleteTarget.id))
        if (selected?.id === deleteTarget.id) setSelected(null)
        setDeleteTarget(null)
        const msg = deletionType === 'full'
          ? 'User and all associated records deleted successfully.'
          : 'User deleted successfully.'
        setToast({ message: msg, variant: 'success' })
      } catch {
        setDeleteError('Failed to delete user. Please try again.')
      }
    })
  }

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
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr 60px', padding: '12px 20px', borderBottom: '1px solid var(--border-color)' }} className="customers-table-head">
            {['Name', 'Email', 'Phone', 'Orders', 'Joined', ''].map(h => (
              <div key={h} style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</div>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>No customers yet.</div>
          ) : filtered.map(c => (
            <div key={c.id} className="customer-row" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr 60px', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', alignItems: 'center', background: selected?.id === c.id ? 'rgba(184,134,11,0.04)' : 'transparent', transition: 'background 0.2s' }}>
              <div style={{ fontSize: 13, fontWeight: 500, cursor: 'pointer' }} onClick={() => setSelected(selected?.id === c.id ? null : c)}>{c.full_name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setSelected(selected?.id === c.id ? null : c)}>{c.email}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setSelected(selected?.id === c.id ? null : c)}>{c.phone ?? '—'}</div>
              <div style={{ fontSize: 13, color: 'var(--gold-light)', cursor: 'pointer' }} onClick={() => setSelected(selected?.id === c.id ? null : c)}>{c.orders?.length ?? 0}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setSelected(selected?.id === c.id ? null : c)}>{formatDate(c.created_at)}</div>
              <button
                onClick={() => setDeleteTarget(c)}
                title="Delete user"
                aria-label={`Delete user ${c.full_name}`}
                data-testid={`delete-user-${c.id}`}
                style={{ padding: '4px 8px', fontSize: 11, background: 'transparent', border: '1px solid rgba(220,38,38,0.3)', color: 'var(--danger)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}
              >
                Del
              </button>
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
                <div style={{ marginBottom: 24 }}>
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

              <button
                onClick={() => setDeleteTarget(selected)}
                data-testid="delete-user-panel"
                style={{ width: '100%', padding: '12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}
              >
                Delete User
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Delete User"
          message="This action may permanently remove the user and optionally all related activities including orders, deposits, uploads, and transaction history."
          detailLines={[
            { label: 'Name', value: deleteTarget.full_name },
            { label: 'Email', value: deleteTarget.email },
            { label: 'Orders', value: String(deleteTarget.orders?.length ?? 0) },
            { label: 'Total Spent', value: formatPrice(deleteTarget.orders?.reduce((s, o) => s + o.amount_paid, 0) ?? 0) },
          ]}
          confirmLabel="Delete User"
          onConfirm={handleDelete}
          onCancel={() => { setDeleteTarget(null); setDeleteError('') }}
          loading={isPending}
          error={deleteError}
          showDeletionType
        />
      )}

      {toast && (
        <ToastNotification
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}

      <style suppressHydrationWarning>{`
        @media (max-width: 700px) {
          .admin-customers-page { padding: 16px !important; }
          .customers-filters { flex-direction: column !important; }
          .customers-layout { grid-template-columns: 1fr !important; }
          .customers-table-head { display: none !important; }
          .customer-row { grid-template-columns: 1fr 60px !important; padding: 14px 16px !important; }
          .customer-row > div:nth-child(1) { grid-column: 1 !important; }
          .customer-row > div:nth-child(2),
          .customer-row > div:nth-child(3),
          .customer-row > div:nth-child(4),
          .customer-row > div:nth-child(5) { display: none !important; }
          .customer-row > button { grid-column: 2 !important; grid-row: 1 !important; align-self: center !important; }
          .customer-card-meta { display: block !important; }
          .customer-detail-panel { position: static !important; }
        }
        @media (min-width: 701px) and (max-width: 1024px) {
          .admin-customers-page { padding: 20px !important; }
          .customers-layout { grid-template-columns: 1fr !important; }
          .customer-detail-panel { position: static !important; }
          .customers-table-head,
          .customer-row { grid-template-columns: 1.5fr 1.5fr 1fr 1fr 60px !important; }
          .customers-table-head > div:nth-child(3),
          .customer-row > div:nth-child(3) { display: none !important; }
        }
      `}</style>
    </div>
  )
}
