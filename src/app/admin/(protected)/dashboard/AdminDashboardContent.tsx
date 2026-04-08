'use client'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/tokens'
import { StatusBadge } from '@/components/ui'
import type { Database } from '@/lib/types/database'

type Order = Database['public']['Tables']['orders']['Row'] & {
  profiles?: { full_name: string; email: string; phone: string | null } | null
  order_items?: Database['public']['Tables']['order_items']['Row'][]
}
type Product = Database['public']['Tables']['products']['Row']

interface Stats {
  totalOrders: number; totalRevenue: number; totalCustomers: number
  pendingOrders: number; inProgressOrders: number; completedOrders: number
  pendingPayments: number; totalProducts: number; inStockProducts: number
}

interface Props {
  stats: Stats | null
  recentOrders: Order[]
  featuredProducts: Product[]
}

function StatCard({ icon, label, value, sub, color = '#3B82F6' }: { icon: string; label: string; value: string | number; sub: string; color?: string }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(6,182,212,0.05))', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 12, padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 100% 0%, ${color}08 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ width: 48, height: 48, background: `${color}15`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20 }}>{icon}</div>
      <div style={{ fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color, marginBottom: 6, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 13, color: '#64748B' }}>{sub}</div>
    </div>
  )
}

export default function AdminDashboardContent({ stats, recentOrders, featuredProducts }: Props) {
  const s = stats

  return (
    <div style={{ padding: 36, minHeight: '100vh' }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#64748B', marginBottom: 8 }}>Admin Panel</div>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40, color: '#F1F5F9' }}>
          Dashboard <span style={{ color: '#3B82F6', fontStyle: 'italic' }}>Overview</span>
        </h1>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 36 }}>
        <StatCard icon="📦" label="Total Orders" value={s?.totalOrders ?? 0} sub="All time" color="#3B82F6" />
        <StatCard icon="💰" label="Total Revenue" value={formatPrice(s?.totalRevenue ?? 0)} sub="Amount collected" color="#10B981" />
        <StatCard icon="👥" label="Customers" value={s?.totalCustomers ?? 0} sub="Registered users" color="#8B5CF6" />
        <StatCard icon="⏳" label="Pending" value={s?.pendingOrders ?? 0} sub="Awaiting confirmation" color="#F59E0B" />
        <StatCard icon="🎨" label="In Progress" value={s?.inProgressOrders ?? 0} sub="Active artwork" color="#06B6D4" />
        <StatCard icon="💳" label="Pending Payments" value={s?.pendingPayments ?? 0} sub="Awaiting verification" color="#F43F5E" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 24, alignItems: 'start' }}>
        {/* Recent orders */}
        <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26, color: '#F1F5F9' }}>Recent Orders</h2>
            <Link href="/admin/orders" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3B82F6', fontWeight: 700, textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr', padding: '12px 24px', borderBottom: '1px solid rgba(59,130,246,0.08)', background: 'rgba(59,130,246,0.03)' }}>
            {['Order', 'Customer', 'Total', 'Status', 'Payment'].map(h => (
              <div key={h} style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748B', fontWeight: 700 }}>{h}</div>
            ))}
          </div>
          {recentOrders.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748B' }}>No orders yet.</div>
          ) : recentOrders.map(order => (
            <div key={order.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr', padding: '14px 24px', borderBottom: '1px solid rgba(59,130,246,0.05)', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>{order.order_number}</div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{formatDate(order.created_at)}</div>
              </div>
              <div style={{ fontSize: 12, color: '#CBD5E1' }}>{order.profiles?.full_name ?? '—'}</div>
              <div style={{ fontSize: 13, color: '#10B981', fontWeight: 600 }}>{formatPrice(order.total_amount)}</div>
              <StatusBadge status={order.status} />
              <StatusBadge status={order.payment_status} />
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            { href: '/admin/orders', icon: '📦', label: 'Manage Orders', sub: `${s?.pendingOrders ?? 0} pending`, color: '#3B82F6' },
            { href: '/admin/payments', icon: '💳', label: 'Verify Payments', sub: `${s?.pendingPayments ?? 0} awaiting`, color: '#F59E0B' },
            { href: '/admin/products', icon: '🛍️', label: 'Manage Products', sub: `${s?.totalProducts ?? 0} products`, color: '#8B5CF6' },
            { href: '/admin/gallery', icon: '🖼️', label: 'Manage Gallery', sub: 'Upload artwork', color: '#06B6D4' },
            { href: '/admin/customers', icon: '👥', label: 'View Customers', sub: `${s?.totalCustomers ?? 0} registered`, color: '#EC4899' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ background: 'rgba(15,23,42,0.8)', border: `1px solid ${item.color}22`, borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', transition: 'all 0.2s' }}>
              <div style={{ width: 40, height: 40, background: `${item.color}15`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>{item.label}</div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{item.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
