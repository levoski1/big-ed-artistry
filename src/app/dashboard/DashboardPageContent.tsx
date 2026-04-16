'use client'
import { formatPrice, formatDate } from '@/lib/tokens'
import { StatusBadge } from '@/components/ui'
import Link from 'next/link'
import type { Database } from '@/lib/types/database'

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items: Database['public']['Tables']['order_items']['Row'][]
}
type Profile = Database['public']['Tables']['profiles']['Row']

interface Props {
  user: Profile | null
  orders: Order[]
  pendingPayment: number
  completedCount: number
}

export default function DashboardPageContent({ user, orders, pendingPayment, completedCount }: Props) {
  const recentOrders = orders.slice(0, 4)
  const firstName = user?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div style={{ background: 'linear-gradient(180deg, #1F2937 0%, #111827 100%)', minHeight: '100vh', flex: 1 }}>
      <style>{`
        .user-stat-card:hover { background: linear-gradient(135deg, rgba(236,72,153,0.1), rgba(168,85,247,0.1)) !important; border-color: rgba(236,72,153,0.25) !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(236,72,153,0.15); }
        .order-row:hover { background: rgba(236,72,153,0.08) !important; }
        .action-item:hover { background: linear-gradient(135deg, rgba(236,72,153,0.1), rgba(168,85,247,0.05)) !important; border-color: rgba(236,72,153,0.3) !important; transform: translateY(-2px); }
        @media (max-width: 1024px) { .page-main { grid-template-columns: 1fr !important; } }
        @media (max-width: 720px) { .orders-head, .orders-row { display: none !important; } .orders-mobile { display: grid !important; } }
      `}</style>

      <div style={{ padding: '40px' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a1a1aa', fontWeight: 600, marginBottom: 12 }}>
                👋 Welcome back, {firstName}
              </div>
              <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40, fontWeight: 700, color: '#F5F5F5', marginBottom: 8, letterSpacing: '-0.02em' }}>
                Your Creative Portal
              </h1>
              <p style={{ fontSize: 15, color: '#a1a1aa', lineHeight: 1.6 }}>Track your commissions, manage payments, and explore new artwork</p>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              { icon: '📦', label: 'Total Orders', value: orders.length, color: '#EC4899' },
              { icon: '💳', label: 'Pending Payment', value: pendingPayment, color: '#F43F5E' },
              { icon: '✓', label: 'Completed', value: completedCount, color: '#10B981' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(236,72,153,0.1)', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 24 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 11, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: 32, alignItems: 'start' }} className="page-main">
          {/* Orders table */}
          <div style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.05), rgba(168,85,247,0.05))', border: '1px solid rgba(236,72,153,0.15)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, color: '#F5F5F5', marginBottom: 4 }}>Recent Orders</h2>
                <p style={{ fontSize: 12, color: '#a1a1aa' }}>Your latest commissions</p>
              </div>
              <Link href="/dashboard/orders" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#EC4899', fontWeight: 700, textDecoration: 'none' }}>View All →</Link>
            </div>

            {/* Desktop header */}
            <div className="orders-head" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: 12, padding: '14px 24px', borderBottom: '1px solid rgba(236,72,153,0.1)', background: 'rgba(236,72,153,0.03)' }}>
              {['Order #', 'Amount', 'Status', 'Payment'].map(h => (
                <div key={h} style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a1a1aa', fontWeight: 700 }}>{h}</div>
              ))}
            </div>

            {recentOrders.length === 0 ? (
              <div style={{ padding: '60px 24px', textAlign: 'center', color: '#a1a1aa' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>◇</div>
                <div style={{ fontSize: 14, marginBottom: 20 }}>No orders yet</div>
                <Link href="/custom-artwork" style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#EC4899', fontWeight: 700, textDecoration: 'none' }}>Place First Order →</Link>
              </div>
            ) : recentOrders.map(order => (
              <div key={order.id} className="orders-row" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: 12, padding: '14px 24px', borderBottom: '1px solid rgba(236,72,153,0.05)', alignItems: 'center', transition: 'all 0.2s' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F5' }}>{order.order_number}</div>
                  <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 4 }}>{formatDate(order.created_at)}</div>
                </div>
                <div style={{ fontSize: 14, color: '#EC4899', fontWeight: 600 }}>{formatPrice(order.total_amount)}</div>
                <StatusBadge status={order.status} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StatusBadge status={order.payment_status} />
                  {order.payment_status === 'NOT_PAID' && (
                    <Link href="/dashboard/payments" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#EC4899', fontWeight: 700, textDecoration: 'none' }}>Pay →</Link>
                  )}
                </div>
              </div>
            ))}

            {/* Mobile cards */}
            <div className="orders-mobile" style={{ display: 'none', padding: 12, gap: 10, gridTemplateColumns: '1fr' }}>
              {recentOrders.map(order => (
                <div key={`m-${order.id}`} style={{ border: '1px solid rgba(236,72,153,0.15)', background: 'rgba(236,72,153,0.03)', padding: 12, borderRadius: 8, display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F5' }}>{order.order_number}</div>
                    <div style={{ fontSize: 14, color: '#EC4899', fontWeight: 600 }}>{formatPrice(order.total_amount)}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#a1a1aa' }}>{formatDate(order.created_at)}</div>
                  <div style={{ display: 'flex', gap: 8 }}><StatusBadge status={order.status} /><StatusBadge status={order.payment_status} /></div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside style={{ display: 'grid', gap: 20 }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.05), rgba(168,85,247,0.05))', border: '1px solid rgba(236,72,153,0.15)', borderRadius: 12, padding: 24, display: 'grid', gap: 16 }}>
              <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, color: '#F5F5F5' }}>Payment Activity</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  { label: 'Pending payment', value: pendingPayment, color: '#F43F5E' },
                  { label: 'Completed', value: completedCount, color: '#10B981' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, paddingBottom: 12, borderBottom: '1px solid rgba(236,72,153,0.1)' }}>
                    <span style={{ color: '#a1a1aa' }}>{item.label}</span>
                    <strong style={{ color: item.color, fontSize: 16 }}>{item.value}</strong>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/payments" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#EC4899', fontWeight: 700, textDecoration: 'none' }}>Upload Payment Proof →</Link>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.05), rgba(236,72,153,0.05))', border: '1px solid rgba(168,85,247,0.15)', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, color: '#F5F5F5', marginBottom: 16 }}>Quick Actions</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  { icon: '✏️', title: 'Commission New Art', desc: 'Start a new portrait order.', href: '/custom-artwork' },
                  { icon: '💳', title: 'Upload Payment', desc: 'Submit payment proof.', href: '/dashboard/payments' },
                  { icon: '🖼️', title: 'Photo Enlargement', desc: 'Create a large-format print.', href: '/photo-enlarge' },
                ].map(action => (
                  <Link key={action.title} href={action.href} className="action-item" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.05), rgba(168,85,247,0.05))', border: '1px solid rgba(236,72,153,0.15)', borderRadius: 10, padding: 16, display: 'grid', gap: 6, transition: 'all 0.3s', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{action.icon}</span>
                      <strong style={{ fontSize: 13, color: '#F5F5F5' }}>{action.title}</strong>
                    </div>
                    <p style={{ fontSize: 12, color: '#a1a1aa', margin: 0 }}>{action.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
