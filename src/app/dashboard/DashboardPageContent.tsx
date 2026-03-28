'use client'
import { formatPrice, formatDate } from '@/lib/tokens'
import { StatusBadge } from '@/components/ui'
import Link from 'next/link'
import type { ReactNode } from 'react'

interface Order {
  id: string
  orderNumber: string
  service: string
  size: string
  medium: string
  price: number
  status: string
  paymentStatus: string
  createdAt: string
}

interface Props {
  recentOrders: Order[]
  allOrders: Order[]
  pendingPayment: number
  inProgress: number
  completedCount: number
}

interface StatCardProps {
  icon: string
  label: string
  value: number | string
  sub: string
  color?: string
}

function UserStatCard({ icon, label, value, sub, color = '#EC4899' }: StatCardProps) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05), rgba(168, 85, 247, 0.05))',
      border: '1px solid rgba(236, 72, 153, 0.15)',
      borderRadius: '12px',
      padding: '24px',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 100% 0%, ${color}08 0%, transparent 70%)`, pointerEvents: 'none' }} />
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, position: 'relative', zIndex: 1 }}>
        <div style={{ width: 48, height: 48, background: `${color}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
          {icon}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#A1A1AA', fontWeight: 600, marginBottom: 8 }}>
          {label}
        </div>
        <div style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 36,
          fontWeight: 700,
          color: color,
          marginBottom: 8,
          letterSpacing: '-0.02em',
        }}>
          {value}
        </div>
        <div style={{ fontSize: 13, color: '#71717A' }}>{sub}</div>
      </div>
    </div>
  )
}

export default function DashboardPageContent({
  recentOrders,
  allOrders,
  pendingPayment,
  inProgress,
  completedCount,
}: Props) {
  return (
    <div style={{ background: 'linear-gradient(180deg, #1F2937 0%, #111827 100%)', minHeight: '100vh', flex: 1 }}>
      <style>{`
        .user-stat-card:hover {
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1)) !important;
          border-color: rgba(236, 72, 153, 0.25) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(236, 72, 153, 0.15);
        }
        .order-row:hover {
          background: rgba(236, 72, 153, 0.08) !important;
        }
        .action-item:hover {
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.05)) !important;
          border-color: rgba(236, 72, 153, 0.3) !important;
          transform: translateY(-2px);
        }
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .page-main {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 720px) {
          .dash-header {
            flex-direction: column;
            align-items: flex-start;
            padding: 24px;
          }
          .dash-cta {
            width: 100%;
            justify-content: center;
          }
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .orders-head,
          .orders-row {
            display: none;
          }
          .orders-mobile {
            display: grid;
          }
        }
      `}</style>

      <div style={{ padding: '40px' }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a1a1aa', fontWeight: 600, marginBottom: 12 }}>
                👋 Welcome back
              </div>
              <h1 style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 40,
                fontWeight: 700,
                color: '#F5F5F5',
                marginBottom: 8,
                letterSpacing: '-0.02em',
              }}>
                Your Creative Portal
              </h1>
              <p style={{ fontSize: 15, color: '#a1a1aa', lineHeight: 1.6 }}>
                Track your commissions, manage payments, and explore new artwork
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              background: 'rgba(236, 72, 153, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(236, 72, 153, 0.2)',
            }}>
              <span style={{ fontSize: 18 }}>✨</span>
              <div>
                <div style={{ fontSize: 11, color: '#EC4899', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Active Member
                </div>
                <div style={{ fontSize: 12, color: '#EC4899' }}>Premium status</div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(236, 72, 153, 0.1)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{ fontSize: 24 }}>📦</div>
              <div>
                <div style={{ fontSize: 11, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  Total Orders
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#EC4899' }}>
                  {allOrders.length}
                </div>
              </div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(236, 72, 153, 0.1)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{ fontSize: 24 }}>⏳</div>
              <div>
                <div style={{ fontSize: 11, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  In Progress
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#F59E0B' }}>
                  {inProgress}
                </div>
              </div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(236, 72, 153, 0.1)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{ fontSize: 24 }}>💳</div>
              <div>
                <div style={{ fontSize: 11, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  Pending Payment
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#F43F5E' }}>
                  {pendingPayment}
                </div>
              </div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(236, 72, 153, 0.1)',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{ fontSize: 24 }}>✓</div>
              <div>
                <div style={{ fontSize: 11, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  Completed
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#10B981' }}>
                  {completedCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 48 }} className="stats-grid">
          <div className="user-stat-card">
            <UserStatCard
              icon="📋"
              label="Total Orders"
              value={allOrders.length}
              sub="All time commissions"
              color="#EC4899"
            />
          </div>
          <div className="user-stat-card">
            <UserStatCard
              icon="🎨"
              label="In Progress"
              value={inProgress}
              sub="Active artwork"
              color="#A78BFA"
            />
          </div>
          <div className="user-stat-card">
            <UserStatCard
              icon="⏱️"
              label="Pending Payment"
              value={pendingPayment}
              sub="Awaiting verification"
              color="#F59E0B"
            />
          </div>
          <div className="user-stat-card">
            <UserStatCard
              icon="🎁"
              label="Completed"
              value={completedCount}
              sub="Ready for delivery"
              color="#10B981"
            />
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: 32, alignItems: 'start' }} className="page-main">
          {/* Orders Section */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05), rgba(168, 85, 247, 0.05))',
            border: '1px solid rgba(236, 72, 153, 0.15)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(236, 72, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, color: '#F5F5F5', marginBottom: 4 }}>Recent Orders</h2>
                <p style={{ fontSize: 12, color: '#a1a1aa' }}>Your latest commissions and updates</p>
              </div>
              <Link href="/dashboard/orders" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#EC4899', fontWeight: 700, textDecoration: 'none' }}>View All →</Link>
            </div>

            {/* Desktop Table */}
            <div className="orders-head" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.5fr 0.9fr 1fr 1.1fr', gap: 12, padding: '14px 24px', borderBottom: '1px solid rgba(236, 72, 153, 0.1)', background: 'rgba(236, 72, 153, 0.03)' }}>
              {['Order #', 'Service', 'Amount', 'Status', 'Payment'].map(head => (
                <div key={head} style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a1a1aa', fontWeight: 700 }}>{head}</div>
              ))}
            </div>

            {recentOrders.map(order => (
              <div key={order.id} className="orders-row" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.5fr 0.9fr 1fr 1.1fr', gap: 12, padding: '14px 24px', borderBottom: '1px solid rgba(236, 72, 153, 0.05)', alignItems: 'center', transition: 'all 0.2s' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F5' }}>{order.orderNumber}</div>
                  <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 4 }}>{formatDate(order.createdAt)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, textTransform: 'capitalize', color: '#F5F5F5' }}>{order.service}</div>
                  <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 2 }}>{order.size} · {order.medium}</div>
                </div>
                <div style={{ fontSize: 14, color: '#EC4899', fontWeight: 600 }}>{formatPrice(order.price)}</div>
                <StatusBadge status={order.status} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <StatusBadge status={order.paymentStatus} />
                  {order.paymentStatus === 'unpaid' && (
                    <Link href="/dashboard/payments" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#EC4899', fontWeight: 700, textDecoration: 'none' }}>Pay →</Link>
                  )}
                </div>
              </div>
            ))}

            {/* Mobile Cards */}
            <div className="orders-mobile" style={{ display: 'none', padding: '12px', gap: 10, gridTemplateColumns: '1fr' }}>
              {recentOrders.map(order => (
                <div key={`mobile-${order.id}`} style={{ border: '1px solid rgba(236, 72, 153, 0.15)', background: 'rgba(236, 72, 153, 0.03)', padding: '12px', display: 'grid', gap: 10, borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F5' }}>{order.orderNumber}</div>
                      <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 4 }}>{formatDate(order.createdAt)}</div>
                    </div>
                    <div style={{ fontSize: 14, color: '#EC4899', fontWeight: 600 }}>{formatPrice(order.price)}</div>
                  </div>
                  <div style={{ fontSize: 12, textTransform: 'capitalize', color: '#F5F5F5' }}>{order.service}</div>
                  <div style={{ fontSize: 11, color: '#a1a1aa' }}>{order.size} · {order.medium}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontSize: 11, color: '#a1a1aa' }}>Status</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#a1a1aa' }}>Payment</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StatusBadge status={order.paymentStatus} />
                      {order.paymentStatus === 'unpaid' && (
                        <Link href="/dashboard/payments" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#EC4899', fontWeight: 700, textDecoration: 'none' }}>Pay</Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside style={{ display: 'grid', gap: 20 }}>
            {/* Payment Activity */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05), rgba(168, 85, 247, 0.05))',
              border: '1px solid rgba(236, 72, 153, 0.15)',
              borderRadius: '12px',
              padding: '24px',
              display: 'grid',
              gap: 16,
            }}>
              <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, color: '#F5F5F5' }}>Payment Activity</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, paddingBottom: 12, borderBottom: '1px solid rgba(236, 72, 153, 0.1)' }}>
                  <span style={{ color: '#a1a1aa' }}>Pending verification</span>
                  <strong style={{ color: '#F43F5E', fontSize: 16 }}>{pendingPayment}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, paddingBottom: 12, borderBottom: '1px solid rgba(236, 72, 153, 0.1)' }}>
                  <span style={{ color: '#a1a1aa' }}>In progress</span>
                  <strong style={{ color: '#A78BFA', fontSize: 16 }}>{inProgress}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#a1a1aa' }}>Completed</span>
                  <strong style={{ color: '#10B981', fontSize: 16 }}>{completedCount}</strong>
                </div>
              </div>
              <Link href="/dashboard/payments" style={{ marginTop: 8, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#EC4899', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>Upload Payment Proof →</Link>
            </div>

            {/* Quick Actions */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(236, 72, 153, 0.05))',
              border: '1px solid rgba(168, 85, 247, 0.15)',
              borderRadius: '12px',
              padding: '24px',
            }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, color: '#F5F5F5', marginBottom: 4 }}>Quick Actions</h3>
                <p style={{ fontSize: 12, color: '#a1a1aa' }}>Access common tasks</p>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  { icon: '✏️', title: 'Commission New Art', desc: 'Start a new portrait order.', href: '/custom-artwork', cta: 'Order Now' },
                  { icon: '💳', title: 'Upload Payment', desc: 'Submit payment proof.', href: '/dashboard/payments', cta: 'Upload' },
                  { icon: '🖼️', title: 'Photo Enlargement', desc: 'Create a large-format print.', href: '/photo-enlarge', cta: 'Order' },
                ].map(action => (
                  <Link key={action.title} href={action.href} style={{
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05), rgba(168, 85, 247, 0.05))',
                    border: '1px solid rgba(236, 72, 153, 0.15)',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'grid',
                    gap: 8,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    color: 'inherit',
                  }} className="action-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{action.icon}</span>
                      <strong style={{ fontSize: 13, color: '#F5F5F5' }}>{action.title}</strong>
                    </div>
                    <p style={{ fontSize: 12, color: '#a1a1aa', margin: 0 }}>{action.desc}</p>
                    <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#EC4899', fontWeight: 700 }}>{action.cta} →</span>
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
