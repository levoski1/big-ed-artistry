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

export default function DashboardPageContent({
  recentOrders,
  allOrders,
  pendingPayment,
  inProgress,
  completedCount,
}: Props) {
  return (
    <div style={{ padding: '28px 34px' }}>
      <style>{`
        .dash-shell {
          max-width: 1220px;
          margin: 0 auto;
          display: grid;
          gap: 20px;
        }
        .dash-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
        }
        .dash-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          padding: 22px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .stat-card {
          padding: 18px;
          display: grid;
          gap: 10px;
        }
        .page-main {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr);
          gap: 16px;
          align-items: start;
        }
        .orders-table {
          overflow: hidden;
        }
        .orders-head,
        .orders-row {
          display: grid;
          grid-template-columns: 1.1fr 1.5fr 0.9fr 1fr 1.1fr;
          gap: 12px;
          align-items: center;
          padding: 14px 18px;
        }
        .orders-head {
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-dark);
        }
        .orders-row {
          border-bottom: 1px solid var(--border-color);
        }
        .orders-row:last-child {
          border-bottom: none;
        }
        .orders-mobile {
          display: none;
          padding: 12px;
          gap: 10px;
        }
        .order-mobile-card {
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          padding: 12px;
          display: grid;
          gap: 10px;
        }
        .mobile-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .side-grid {
          display: grid;
          gap: 12px;
        }
        .quick-actions-grid {
          display: grid;
          gap: 10px;
        }
        .action-item {
          display: grid;
          gap: 8px;
          padding: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-dark);
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .page-main {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .dash-header {
            flex-direction: column;
            align-items: flex-start;
            padding: 16px;
          }
          .dash-cta {
            width: 100%;
            justify-content: center;
          }
          .stats-grid {
            grid-template-columns: 1fr;
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
      <div className="dash-shell">
        <section className="dash-card dash-header">
          <div style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Welcome back</span>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 34, lineHeight: 1.1 }}>Your Dashboard</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Track your orders, payments and ongoing artwork activity.</p>
          </div>
          <Link
            href="/custom-artwork"
            className="dash-cta"
            style={{
              padding: '12px 22px',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))',
              color: 'var(--text-on-gold)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            + New Order
          </Link>
        </section>

        <section className="stats-grid">
          {[
            { icon: '◈', label: 'Total Orders', value: allOrders.length, sub: 'All time' },
            { icon: '✦', label: 'In Progress', value: inProgress, sub: 'Active commissions' },
            { icon: '◇', label: 'Pending Payment', value: pendingPayment, sub: 'Awaiting verification' },
            { icon: '❋', label: 'Completed', value: completedCount, sub: 'Successfully delivered' },
          ].map(stat => (
            <article key={stat.label} className="dash-card stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 18, color: 'var(--gold-primary)' }}>{stat.icon}</span>
                {stat.label === 'Pending Payment' && pendingPayment > 0 && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold-accent)', display: 'inline-block' }} />
                )}
              </div>
              <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 34, color: 'var(--gold-light)', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{stat.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stat.sub}</div>
            </article>
          ))}
        </section>

        <section className="page-main">
          <article className="dash-card orders-table">
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26 }}>Recent Orders</h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Latest order updates and payment status.</p>
              </div>
              <Link href="/dashboard/orders" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-primary)' }}>View All →</Link>
            </div>

            <div className="orders-head">
              {['Order #', 'Service', 'Amount', 'Status', 'Payment'].map(head => (
                <div key={head} style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{head}</div>
              ))}
            </div>

            {recentOrders.map(order => (
              <div key={order.id} className="orders-row">
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{order.orderNumber}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, textTransform: 'capitalize' }}>{order.service}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{order.size} · {order.medium}</div>
                </div>
                <div style={{ fontSize: 14, color: 'var(--gold-light)', fontWeight: 600 }}>{formatPrice(order.price)}</div>
                <StatusBadge status={order.status} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <StatusBadge status={order.paymentStatus} />
                  {order.paymentStatus === 'unpaid' && (
                    <Link href="/dashboard/payments" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold-primary)' }}>Pay →</Link>
                  )}
                </div>
              </div>
            ))}

            <div className="orders-mobile">
              {recentOrders.map(order => (
                <div key={`mobile-${order.id}`} className="order-mobile-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{order.orderNumber}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</div>
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--gold-light)', fontWeight: 600 }}>{formatPrice(order.price)}</div>
                  </div>
                  <div style={{ fontSize: 12, textTransform: 'capitalize' }}>{order.service}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{order.size} · {order.medium}</div>
                  <div className="mobile-line">
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Order Status</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="mobile-line">
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Payment</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StatusBadge status={order.paymentStatus} />
                      {order.paymentStatus === 'unpaid' && (
                        <Link href="/dashboard/payments" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold-primary)' }}>Pay</Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <aside className="side-grid">
            <section className="dash-card" style={{ padding: 16, display: 'grid', gap: 10 }}>
              <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24 }}>Payment Activity</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Pending verification</span>
                  <strong style={{ color: 'var(--gold-light)' }}>{pendingPayment}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Orders in progress</span>
                  <strong style={{ color: 'var(--gold-light)' }}>{inProgress}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Completed deliveries</span>
                  <strong style={{ color: 'var(--gold-light)' }}>{completedCount}</strong>
                </div>
              </div>
              <Link href="/dashboard/payments" style={{ marginTop: 4, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-primary)' }}>Upload Payment Proof →</Link>
            </section>

            <section className="dash-card" style={{ padding: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24 }}>Quick Actions</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Common tasks in one place.</p>
              </div>
              <div className="quick-actions-grid">
                {[
                  { icon: '✏️', title: 'Commission New Art', desc: 'Start a new custom portrait order.', href: '/custom-artwork', cta: 'Order Now' },
                  { icon: '💳', title: 'Upload Payment', desc: 'Submit proof for pending orders.', href: '/dashboard/payments', cta: 'Upload Proof' },
                  { icon: '🖼️', title: 'Photo Enlargement', desc: 'Create a large-format print order.', href: '/photo-enlarge', cta: 'Order Print' },
                ].map(action => (
                  <article key={action.title} className="action-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{action.icon}</span>
                      <strong style={{ fontSize: 13 }}>{action.title}</strong>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{action.desc}</p>
                    <Link href={action.href} style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-primary)' }}>{action.cta} →</Link>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </div>
  )
}
