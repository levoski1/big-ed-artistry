'use client'
import { useState } from 'react'
import { mockOrders, mockProducts, mockDashboardStats } from '@/lib/mockData'
import { formatPrice, formatDate } from '@/lib/tokens'
import { StatusBadge } from '@/components/ui'
import Link from 'next/link'

interface StatCardProps {
  icon: string
  label: string
  value: string | number
  sub: string
  trend?: { value: number; positive: boolean }
  color?: string
}

function StatCard({ icon, label, value, sub, trend, color = '#3B82F6' }: StatCardProps) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(6, 182, 212, 0.05))',
      border: '1px solid rgba(59, 130, 246, 0.15)',
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
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: trend.positive ? '#10B981' : '#EF4444' }}>
            {trend.positive ? '↑' : '↓'} {trend.value}%
          </div>
        )}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 600, marginBottom: 8 }}>
          {label}
        </div>
        <div style={{
          fontFamily: '"Inter", sans-serif',
          fontSize: 32,
          fontWeight: 700,
          color: color,
          marginBottom: 8,
          letterSpacing: '-0.02em',
        }}>
          {value}
        </div>
        <div style={{ fontSize: 13, color: '#64748B' }}>{sub}</div>
      </div>
    </div>
  )
}

function MetricBox({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(59, 130, 246, 0.1)',
      borderRadius: '10px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      transition: 'all 0.2s',
    }}>
      <div style={{ fontSize: 24 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          {label}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: color }}>
          {value}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const stats = mockDashboardStats
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = mockOrders.filter(o => {
    const matchSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) || o.orderNumber.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const exportCSV = () => {
    const rows = ['Order,Customer,Email,Service,Price,Status,Payment,Date', ...filtered.map(o => `${o.orderNumber},${o.customerName},${o.customerEmail},${o.service},${o.price},${o.status},${o.paymentStatus},${o.createdAt}`)]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'orders.csv'
    a.click()
  }

  return (
    <div style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1A2847 100%)', minHeight: '100vh', flex: 1 }}>
      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .stat-card-hover {
          transition: all 0.3s ease;
        }
        .stat-card-hover:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1)) !important;
          border-color: rgba(59, 130, 246, 0.25) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
        }
        .order-row {
          transition: all 0.2s;
        }
        .order-row:hover {
          background: rgba(59, 130, 246, 0.08) !important;
        }
        @media (max-width: 900px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .prod-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .admin-filters {
            flex-direction: column;
          }
          .admin-filters input, .admin-filters select, .admin-filters button {
            width: 100% !important;
          }
        }
      `}</style>

      {/* Main Content */}
      <div style={{ padding: '40px' }}>
        {/* Header Section */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748B', fontWeight: 600, marginBottom: 12 }}>
                📊 Dashboard
              </div>
              <h1 style={{
                fontSize: 40,
                fontWeight: 700,
                color: '#E2E8F0',
                marginBottom: 8,
                letterSpacing: '-0.02em',
              }}>
                Business Control Center
              </h1>
              <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.6 }}>
                Real-time overview of orders, revenue, and customer activity
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}>
              <span style={{ fontSize: 18 }}>🟢</span>
              <div>
                <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  System Status
                </div>
                <div style={{ fontSize: 12, color: '#10B981' }}>All systems operational</div>
              </div>
            </div>
          </div>

          {/* KPI Bars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <MetricBox label="Orders Pending" value={stats.pendingOrders} icon="⏳" color="#F59E0B" />
            <MetricBox label="Active Customers" value={stats.totalCustomers} icon="👥" color="#06B6D4" />
            <MetricBox label="Pending Payments" value={stats.pendingPayments} icon="💳" color="#F59E0B" />
            <MetricBox label="Completed Orders" value={stats.completedOrders} icon="✓" color="#10B981" />
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 48 }} className="stats-grid">
          <div className="stat-card-hover">
            <StatCard
              icon="📦"
              label="Total Orders"
              value={stats.totalOrders}
              sub="Lifetime"
              trend={{ value: 12, positive: true }}
              color="#3B82F6"
            />
          </div>
          <div className="stat-card-hover">
            <StatCard
              icon="⏳"
              label="Pending Orders"
              value={stats.pendingOrders}
              sub="Need attention"
              trend={{ value: 5, positive: false }}
              color="#F59E0B"
            />
          </div>
          <div className="stat-card-hover">
            <StatCard
              icon="✓"
              label="Completed"
              value={stats.completedOrders}
              sub="Successfully delivered"
              trend={{ value: 8, positive: true }}
              color="#10B981"
            />
          </div>
          <div className="stat-card-hover">
            <StatCard
              icon="₦"
              label="Total Revenue"
              value={formatPrice(stats.totalRevenue)}
              sub="Verified payments"
              trend={{ value: 18, positive: true }}
              color="#3B82F6"
            />
          </div>
          <div className="stat-card-hover">
            <StatCard
              icon="💳"
              label="Pending Payments"
              value={stats.pendingPayments}
              sub="Awaiting verification"
              trend={{ value: 3, positive: false }}
              color="#F59E0B"
            />
          </div>
          <div className="stat-card-hover">
            <StatCard
              icon="👥"
              label="Total Customers"
              value={stats.totalCustomers}
              sub="Registered users"
              trend={{ value: 15, positive: true }}
              color="#06B6D4"
            />
          </div>
        </div>

        {/* Orders Section */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#E2E8F0',
              marginBottom: 8,
            }}>
              Order Management
            </h2>
            <p style={{ fontSize: 14, color: '#94A3B8' }}>
              Monitor and manage all customer orders in real-time
            </p>
          </div>

          {/* Filters */}
          <div className="admin-filters" style={{
            display: 'flex',
            gap: 12,
            marginBottom: 24,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            <input
              placeholder="Search by order ID or customer name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                padding: '12px 16px',
                borderRadius: '8px',
                color: '#E2E8F0',
                fontFamily: '"Inter", sans-serif',
                fontSize: 13,
                outline: 'none',
                flex: 1,
                minWidth: 280,
                transition: 'all 0.2s',
              }}
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                padding: '12px 16px',
                borderRadius: '8px',
                color: '#E2E8F0',
                fontFamily: '"Inter", sans-serif',
                fontSize: 13,
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {['All', 'pending', 'confirmed', 'in_progress', 'review', 'completed', 'cancelled'].map(s => (
                <option key={s} value={s} style={{ background: '#1E293B' }}>
                  {s === 'All' ? 'All Statuses' : s.replace('_', ' ')}
                </option>
              ))}
            </select>
            <button
              onClick={exportCSV}
              style={{
                padding: '12px 20px',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2))',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#3B82F6',
                cursor: 'pointer',
                fontFamily: '"Inter", sans-serif',
                borderRadius: '8px',
                transition: 'all 0.2s',
              }}
            >
              📥 Export
            </button>
          </div>

          {/* Orders Table */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1.4fr 1fr 1fr 1fr 1.2fr',
              gap: 16,
              padding: '16px 24px',
              borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
              background: 'liner-gradient(90deg, rgba(59, 130, 246, 0.05), rgba(6, 182, 212, 0.05))',
            }}>
              {['Order ID', 'Customer', 'Amount', 'Status', 'Payment', 'Est. Delivery'].map(h => (
                <div key={h} style={{
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: '#64748B',
                }}>
                  {h}
                </div>
              ))}
            </div>

            {filtered.map(order => (
              <div
                key={order.id}
                className="order-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1.4fr 1fr 1fr 1fr 1.2fr',
                  gap: 16,
                  padding: '16px 24px',
                  borderBottom: '1px solid rgba(59, 130, 246, 0.05)',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{order.orderNumber}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{formatDate(order.createdAt)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#E2E8F0' }}>{order.customerName}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{order.customerEmail}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#3B82F6' }}>{formatPrice(order.price)}</div>
                <StatusBadge status={order.status} />
                <StatusBadge status={order.paymentStatus} />
                <div style={{ fontSize: 12, color: '#94A3B8' }}>{formatDate(order.estimatedDelivery)}</div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{ padding: '60px 24px', textAlign: 'center', color: '#64748B', fontSize: 14 }}>
                No orders match your search criteria.
              </div>
            )}
          </div>
        </div>

        {/* Products Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#E2E8F0',
                marginBottom: 8,
              }}>
                Featured Products
              </h2>
              <p style={{ fontSize: 14, color: '#94A3B8' }}>Top selling items and inventory status</p>
            </div>
            <Link href="/admin/products" style={{
              fontSize: 12,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#3B82F6',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              View All Products →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }} className="prod-grid">
            {mockProducts.slice(0, 6).map(p => (
              <div
                key={p.id}
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(6, 182, 212, 0.05))',
                  border: '1px solid rgba(59, 130, 246, 0.15)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 56,
                  height: 56,
                  background: `linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2))`,
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '10px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}>
                  🖼️
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#E2E8F0', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 13, color: '#3B82F6', fontWeight: 600 }}>{formatPrice(p.price)}</div>
                </div>
                <div style={{
                  fontSize: 11,
                  padding: '6px 12px',
                  background: p.inStock ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: p.inStock ? '#10B981' : '#EF4444',
                  border: `1px solid ${p.inStock ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  borderRadius: '6px',
                  flexShrink: 0,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {p.inStock ? 'In Stock' : 'Out'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
