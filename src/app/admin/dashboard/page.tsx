'use client'
import { useState } from 'react'
import { mockOrders, mockProducts, mockDashboardStats } from '@/lib/mockData'
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '@/lib/tokens'
import { StatusBadge } from '@/components/ui'
import Link from 'next/link'

function StatCard({ icon, label, value, sub, alert, color }: { icon:string; label:string; value:string|number; sub:string; alert?:boolean; color?:string }) {
  return (
    <div style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))`, border: '1px solid rgba(184,134,11,0.15)', borderRadius: '8px', padding: '24px', transition: 'all 0.3s ease', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        {alert && <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gold-accent)', animation: 'pulse 2s infinite' }}/>}
      </div>
      <h3 style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>{label}</h3>
      <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40, fontWeight: 700, color: color || 'var(--gold-light)', lineHeight: 1, marginBottom: 10 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{sub}</div>
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

  // Simulate CSV export
  const exportCSV = () => {
    const rows = ['Order,Customer,Email,Service,Price,Status,Payment,Date', ...filtered.map(o => `${o.orderNumber},${o.customerName},${o.customerEmail},${o.service},${o.price},${o.status},${o.paymentStatus},${o.createdAt}`)]
    const blob = new Blob([rows.join('\n')], { type:'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'orders.csv'; a.click()
  }

  return (
    <div style={{ padding: '32px 40px', background: 'linear-gradient(135deg, rgba(184,134,11,0.02) 0%, rgba(184,134,11,0.01) 100%)' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .stat-card:hover {
          background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03)) !important;
          border-color: rgba(184,134,11,0.25) !important;
          transform: translateY(-2px);
        }
        .order-row:hover {
          background: rgba(184,134,11,0.04) !important;
        }
        .prod-card:hover {
          background: rgba(184,134,11,0.05) !important;
        }
        @media (max-width: 900px) {
          div[style*="padding: 32px 40px"] {
            padding: 20px 24px;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .prod-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .admin-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .admin-filters {
            flex-direction: column;
            width: 100%;
          }
          .admin-filters input,
          .admin-filters select,
          .admin-filters button {
            width: 100% !important;
          }
          .orders-table-wrapper {
            overflow-x: auto;
          }
          h1 {
            font-size: 28px !important;
          }
        }
        @media (max-width: 640px) {
          div[style*="padding: 32px 40px"] {
            padding: 12px 16px;
          }
          .stats-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          h1 {
            font-size: 20px !important;
          }
          h2 {
            font-size: 18px !important;
          }
          .admin-header {
            padding-bottom: 16px;
            gap: 8px;
          }
          .order-header-cols {
            grid-template-columns: 1.2fr 1fr 0.8fr !important;
            min-width: auto !important;
            font-size: 10px !important;
          }
          .order-row-cols {
            grid-template-columns: 1.2fr 1fr 0.8fr !important;
            min-width: auto !important;
            padding: 12px 12px !important;
            font-size: 11px !important;
          }
          .order-row-cols > div:nth-child(4),
          .order-row-cols > div:nth-child(5),
          .order-row-cols > div:nth-child(6) {
            display: none;
          }
          .order-header-cols > div:nth-child(4),
          .order-header-cols > div:nth-child(5),
          .order-header-cols > div:nth-child(6) {
            display: none;
          }
        }
      `}</style>
      
      {/* Header */}
      <div className="admin-header" style={{ marginBottom: 36, paddingBottom: 24, borderBottom: '1px solid rgba(184,134,11,0.1)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 6 }}>Admin Panel</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 36, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Dashboard Overview</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Monitor orders, payments, and business metrics</p>
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gold-light)', padding: '8px 16px', background: 'rgba(184,134,11,0.08)', borderRadius: '4px', border: '1px solid rgba(184,134,11,0.2)' }}>Big Ed Admin</div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 44 }} className="stats-grid">
        <StatCard icon="📦" label="Total Orders" value={stats.totalOrders} sub="All time" color="var(--gold-light)"/>
        <StatCard icon="⏳" label="Pending Orders" value={stats.pendingOrders} sub="Awaiting action" alert color="#FFB347"/>
        <StatCard icon="✓" label="Completed" value={stats.completedOrders} sub="Successfully delivered" color="#51CF66"/>
        <StatCard icon="₦" label="Total Revenue" value={formatPrice(stats.totalRevenue)} sub="Verified payments" color="var(--gold-light)"/>
        <StatCard icon="💳" label="Pending Payments" value={stats.pendingPayments} sub="Need verification" alert color="#FF6B6B"/>
        <StatCard icon="👥" label="Customers" value={stats.totalCustomers} sub="Total registered" color="#4ECDC4"/>
      </div>

      {/* Orders Table */}
      <div style={{ marginBottom: 44 }}>
        <div className="admin-filters" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 26, fontWeight: 600, marginBottom: 2 }}>All Orders</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Manage and track all customer orders</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input placeholder="Search orders…" value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(184,134,11,0.15)', padding: '10px 14px', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: '"Libre Franklin",sans-serif', fontSize: 12, outline: 'none', width: 240, transition: 'all 0.2s' }}/>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(184,134,11,0.15)', padding: '10px 12px', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: '"Libre Franklin",sans-serif', fontSize: 12, outline: 'none', appearance: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
              {['All','pending','confirmed','in_progress','review','completed','cancelled'].map(s=><option key={s} value={s}>{s==='All'?'All Statuses':s.replace('_',' ')}</option>)}
            </select>
            <button onClick={exportCSV} style={{ padding: '10px 18px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', border: '1px solid rgba(184,134,11,0.2)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif', borderRadius: '4px', transition: 'all 0.2s' }}>📥 Export CSV</button>
          </div>
        </div>
        <div className="orders-table-wrapper" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(184,134,11,0.15)', borderRadius: '8px', overflow: 'hidden' }}>
          <div className="order-header-cols" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 0.8fr 1fr 1fr 1fr', padding: '16px 24px', borderBottom: '1px solid rgba(184,134,11,0.1)', background: 'rgba(184,134,11,0.05)', minWidth: 800 }}>
            {['Order','Customer','Amount','Status','Payment','Delivery'].map(h=><div key={h} style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)' }}>{h}</div>)}
          </div>
          {filtered.map(order => (
            <div key={order.id} className="order-row order-row-cols" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 0.8fr 1fr 1fr 1fr', padding: '16px 24px', borderBottom: '1px solid rgba(184,134,11,0.08)', alignItems: 'center', minWidth: 800, transition: 'background 0.2s' }}>
              <div><div style={{ fontSize: 12, fontWeight: 600 }}>{order.orderNumber}</div><div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{formatDate(order.createdAt)}</div></div>
              <div><div style={{ fontSize: 12, fontWeight: 500 }}>{order.customerName}</div><div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{order.customerEmail}</div></div>
              <div style={{ fontSize: 13, color: 'var(--gold-light)', fontWeight: 600 }}>{formatPrice(order.price)}</div>
              <StatusBadge status={order.status}/>
              <StatusBadge status={order.paymentStatus}/>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(order.estimatedDelivery)}</div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No orders match your search criteria.</div>}
        </div>
      </div>

      {/* Products Quick View */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 26, fontWeight: 600, marginBottom: 2 }}>Featured Products</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Stock status and pricing overview</p>
          </div>
          <Link href="/admin/products" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-primary)', fontWeight: 600 }}>Manage All →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="prod-grid">
          {mockProducts.slice(0,6).map(p => (
            <div key={p.id} className="prod-card" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))', border: '1px solid rgba(184,134,11,0.15)', borderRadius: '8px', padding: '20px', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.3s ease' }}>
              <div style={{ width: 48, height: 48, background: 'rgba(184,134,11,0.1)', border: '1px solid rgba(184,134,11,0.2)', borderRadius: '6px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🖼️</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--gold-light)', fontWeight: 500 }}>{formatPrice(p.price)}</div>
              </div>
              <span style={{ fontSize: 10, padding: '4px 10px', background: p.inStock?'rgba(81,207,102,0.15)':'rgba(255,107,107,0.15)', color: p.inStock?'#51CF66':'#FF6B6B', border: `1px solid ${p.inStock?'rgba(81,207,102,0.3)':'rgba(255,107,107,0.3)'}`, borderRadius: '3px', flexShrink: 0, fontWeight: 600 }}>{p.inStock?'In Stock':'Out'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
