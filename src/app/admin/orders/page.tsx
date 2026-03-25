'use client'
import { useState } from 'react'
import { mockOrders } from '@/lib/mockData'
import { formatPrice, formatDate } from '@/lib/tokens'
import { StatusBadge } from '@/components/ui'
import type { Order } from '@/types'

const STATUSES = ['All','pending','confirmed','in_progress','review','completed','cancelled']
const PAYMENT_STATUSES = ['All','pending_verification','paid','refunded']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [payFilter, setPayFilter] = useState('All')
  const [selected, setSelected] = useState<Order | null>(null)
  const [statusUpdate, setStatusUpdate] = useState('')

  const filtered = orders.filter(o => {
    const ms = o.customerName.toLowerCase().includes(search.toLowerCase()) || o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customerEmail.toLowerCase().includes(search.toLowerCase())
    const ss = statusFilter === 'All' || o.status === statusFilter
    const ps = payFilter === 'All' || o.paymentStatus === payFilter
    return ms && ss && ps
  })

  const updateStatus = () => {
    if (!selected || !statusUpdate) return
    setOrders(prev => prev.map(o => o.id === selected.id ? { ...o, status: statusUpdate as Order['status'] } : o))
    setSelected(prev => prev ? { ...prev, status: statusUpdate as Order['status'] } : null)
    setStatusUpdate('')
  }

  const exportCSV = () => {
    const rows = ['Order,Customer,Email,Service,Price,Status,Payment,Date',...filtered.map(o=>`${o.orderNumber},${o.customerName},${o.customerEmail},${o.service},${o.price},${o.status},${o.paymentStatus},${o.createdAt}`)]
    const blob = new Blob([rows.join('\n')], { type:'text/csv' })
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='orders.csv'; a.click()
  }

  return (
    <div style={{ padding:36, minHeight:'100vh' }}>
      <div style={{ marginBottom:28, paddingBottom:20, borderBottom:'1px solid var(--border-color)', display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <h1 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:40 }}>Order <span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>Management</span></h1>
        <span style={{ fontSize:13, color:'var(--text-muted)' }}>{filtered.length} orders</span>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:24, flexWrap:'wrap' }}>
        <input placeholder="Search by name, order, email…" value={search} onChange={e=>setSearch(e.target.value)} style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', padding:'9px 16px', color:'var(--text-primary)', fontFamily:'"Libre Franklin",sans-serif', fontSize:12, outline:'none', flex:1, minWidth:200 }}/>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', padding:'9px 14px', color:'var(--text-primary)', fontFamily:'"Libre Franklin",sans-serif', fontSize:12, outline:'none', appearance:'none', cursor:'pointer' }}>
          {STATUSES.map(s=><option key={s}>{s==='All'?'All Statuses':s.replace('_',' ')}</option>)}
        </select>
        <select value={payFilter} onChange={e=>setPayFilter(e.target.value)} style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', padding:'9px 14px', color:'var(--text-primary)', fontFamily:'"Libre Franklin",sans-serif', fontSize:12, outline:'none', appearance:'none', cursor:'pointer' }}>
          {PAYMENT_STATUSES.map(s=><option key={s} value={s}>{s==='All'?'All Payments':s.replace('_',' ')}</option>)}
        </select>
        <button onClick={exportCSV} style={{ padding:'9px 18px', fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', background:'transparent', border:'1px solid var(--border-color)', color:'var(--text-secondary)', cursor:'pointer', fontFamily:'"Libre Franklin",sans-serif' }}>Export CSV</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap:20, alignItems:'start' }}>
        {/* Table */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', overflowX:'auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1.6fr 0.9fr 1fr 1fr 0.8fr', padding:'12px 18px', borderBottom:'1px solid var(--border-color)', minWidth:720 }}>
            {['Order','Customer','Amount','Status','Payment','Date'].map(h=><div key={h} style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)' }}>{h}</div>)}
          </div>
          {filtered.map(order => (
            <div key={order.id} onClick={() => setSelected(order)} style={{ display:'grid', gridTemplateColumns:'1.2fr 1.6fr 0.9fr 1fr 1fr 0.8fr', padding:'15px 18px', borderBottom:'1px solid var(--border-color)', alignItems:'center', minWidth:720, cursor:'pointer', background:selected?.id===order.id?'rgba(184,134,11,0.05)':'transparent', transition:'background 0.2s' }}>
              <div><div style={{ fontSize:12, fontWeight:500 }}>{order.orderNumber}</div><div style={{ fontSize:11, color:'var(--text-muted)' }}>{order.service}</div></div>
              <div><div style={{ fontSize:12 }}>{order.customerName}</div><div style={{ fontSize:11, color:'var(--text-muted)' }}>{order.customerEmail}</div></div>
              <div style={{ fontSize:13, color:'var(--gold-light)' }}>{formatPrice(order.price)}</div>
              <StatusBadge status={order.status}/>
              <StatusBadge status={order.paymentStatus}/>
              <div style={{ fontSize:11, color:'var(--text-muted)' }}>{formatDate(order.createdAt)}</div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding:'48px 18px', textAlign:'center', color:'var(--text-muted)', fontSize:14 }}>No orders match your filters.</div>}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', padding:28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:22 }}>{selected.orderNumber}</h3>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:18 }}>✕</button>
            </div>
            {[
              ['Customer', selected.customerName],
              ['Email', selected.customerEmail],
              ['Service', selected.service],
              ['Size', selected.size],
              ['Medium', selected.medium],
              ['Subjects', selected.subjects.toString()],
              ['Price', formatPrice(selected.price)],
              ['Status', selected.status.replace('_',' ')],
              ['Payment', selected.paymentStatus.replace('_',' ')],
              ['Est. Delivery', formatDate(selected.estimatedDelivery)],
              ['Created', formatDate(selected.createdAt)],
            ].map(([l,v])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border-color)', fontSize:13 }}>
                <span style={{ color:'var(--text-muted)' }}>{l}</span>
                <span style={{ textTransform:'capitalize' }}>{v}</span>
              </div>
            ))}
            {selected.notes && <div style={{ marginTop:12, padding:'12px 14px', background:'var(--bg-dark)', border:'1px solid var(--border-color)', fontSize:12, color:'var(--text-secondary)', lineHeight:1.7 }}><span style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', display:'block', marginBottom:6 }}>Notes</span>{selected.notes}</div>}

            {/* Status update */}
            <div style={{ marginTop:20, paddingTop:16, borderTop:'1px solid var(--border-color)' }}>
              <div style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:10 }}>Update Status</div>
              <div style={{ display:'flex', gap:8 }}>
                <select value={statusUpdate} onChange={e=>setStatusUpdate(e.target.value)} style={{ flex:1, background:'var(--bg-dark)', border:'1px solid var(--border-color)', padding:'9px 12px', color:'var(--text-primary)', fontFamily:'"Libre Franklin",sans-serif', fontSize:12, outline:'none', appearance:'none' }}>
                  <option value="">Select status…</option>
                  {['pending','confirmed','in_progress','review','completed','cancelled'].map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>
                <button onClick={updateStatus} disabled={!statusUpdate} style={{ padding:'9px 16px', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', background:statusUpdate?'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))':'var(--bg-dark)', color:statusUpdate?'var(--text-on-gold)':'var(--text-muted)', border:statusUpdate?'none':'1px solid var(--border-color)', cursor:statusUpdate?'pointer':'not-allowed', fontFamily:'"Libre Franklin",sans-serif' }}>Update</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
