'use client'
import { useState } from 'react'
import { mockOrders } from '@/lib/mockData'
import { formatPrice, formatDate } from '@/lib/tokens'
import { StatusBadge } from '@/components/ui'

interface Customer {
  id: string; name: string; email: string; phone: string
  location: string; totalOrders: number; totalSpent: number
  paymentStatus: 'paid' | 'partial' | 'unpaid'; joinedAt: string
  orders: typeof mockOrders
}

// Derive customers from mock orders
const deriveCustomers = (): Customer[] => {
  const map: Record<string, Customer> = {}
  mockOrders.forEach(order => {
    if (!map[order.userId]) {
      map[order.userId] = {
        id: order.userId,
        name: order.customerName,
        email: order.customerEmail,
        phone: '+234 800 000 000' + order.userId.replace('u',''),
        location: ['Port Harcourt','Lagos','Abuja','Accra, Ghana','London, UK'][parseInt(order.userId.replace('u','')) - 1] || 'Nigeria',
        totalOrders: 0,
        totalSpent: 0,
        paymentStatus: 'unpaid',
        joinedAt: order.createdAt,
        orders: [],
      }
    }
    map[order.userId].totalOrders++
    map[order.userId].totalSpent += order.price
    map[order.userId].orders.push(order)
    if (order.paymentStatus === 'paid') map[order.userId].paymentStatus = 'paid'
    else if (map[order.userId].paymentStatus !== 'paid') map[order.userId].paymentStatus = 'partial'
  })
  return Object.values(map)
}

const customers = deriveCustomers()

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('')
  const [payFilter, setPayFilter] = useState('All')
  const [selected, setSelected] = useState<Customer | null>(null)

  const filtered = customers.filter(c => {
    const ms = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
    const ps = payFilter === 'All' || c.paymentStatus === payFilter
    return ms && ps
  })

  const payBadge = (status: string) => {
    const map: Record<string,{bg:string,color:string}> = {
      paid: { bg:'rgba(74,124,89,0.15)', color:'#4A7C59' },
      partial: { bg:'rgba(201,162,39,0.15)', color:'#C9A227' },
      unpaid: { bg:'rgba(139,58,58,0.15)', color:'#8B3A3A' },
    }
    const s = map[status] || map.unpaid
    return <span style={{ fontSize:10, padding:'3px 9px', background:s.bg, color:s.color, border:`1px solid ${s.color}30`, letterSpacing:'0.08em', textTransform:'uppercase' }}>{status}</span>
  }

  return (
    <div style={{ padding:36, minHeight:'100vh' }}>
      <div style={{ marginBottom:28, paddingBottom:20, borderBottom:'1px solid var(--border-color)', display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <h1 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:40 }}>Customer <span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>Directory</span></h1>
        <span style={{ fontSize:13, color:'var(--text-muted)' }}>{filtered.length} customers</span>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:24, flexWrap:'wrap' }}>
        <input placeholder="Search by name or email…" value={search} onChange={e=>setSearch(e.target.value)} style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', padding:'9px 16px', color:'var(--text-primary)', fontFamily:'"Libre Franklin",sans-serif', fontSize:12, outline:'none', flex:1, minWidth:200 }}/>
        <select value={payFilter} onChange={e=>setPayFilter(e.target.value)} style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', padding:'9px 14px', color:'var(--text-primary)', fontFamily:'"Libre Franklin",sans-serif', fontSize:12, outline:'none', appearance:'none', cursor:'pointer' }}>
          {['All','paid','partial','unpaid'].map(s=><option key={s} value={s}>{s==='All'?'All Payment Statuses':s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
      </div>

      <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap:20, alignItems:'start' }}>
        {/* Table */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', overflowX:'auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1.4fr 0.8fr 0.8fr 1fr 0.7fr', padding:'12px 18px', borderBottom:'1px solid var(--border-color)', minWidth:680 }}>
            {['Customer','Email','Location','Orders','Spent','Payment'].map(h=><div key={h} style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)' }}>{h}</div>)}
          </div>
          {filtered.map(c => (
            <div key={c.id} onClick={() => setSelected(c)} style={{ display:'grid', gridTemplateColumns:'1.4fr 1.4fr 0.8fr 0.8fr 1fr 0.7fr', padding:'15px 18px', borderBottom:'1px solid var(--border-color)', alignItems:'center', minWidth:680, cursor:'pointer', background:selected?.id===c.id?'rgba(184,134,11,0.05)':'transparent', transition:'background 0.2s' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--bg-dark)', border:'1px solid var(--border-color)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'"Cormorant Garamond",serif', fontSize:15, color:'var(--gold-light)', flexShrink:0 }}>{c.name[0]}</div>
                <div style={{ fontSize:12, fontWeight:500 }}>{c.name}</div>
              </div>
              <div style={{ fontSize:12, color:'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.email}</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)' }}>{c.location.split(',')[0]}</div>
              <div style={{ fontSize:13, color:'var(--gold-light)' }}>{c.totalOrders}</div>
              <div style={{ fontSize:13, color:'var(--gold-light)' }}>{formatPrice(c.totalSpent)}</div>
              {payBadge(c.paymentStatus)}
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding:'48px 18px', textAlign:'center', color:'var(--text-muted)', fontSize:14 }}>No customers match your search.</div>}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', padding:28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
              <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--bg-dark)', border:'1px solid var(--gold-dark)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'"Cormorant Garamond",serif', fontSize:22, color:'var(--gold-light)' }}>{selected.name[0]}</div>
                <div>
                  <div style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:22 }}>{selected.name}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{selected.email}</div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:18 }}>✕</button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20 }}>
              {[['Total Orders',selected.totalOrders],['Total Spent',formatPrice(selected.totalSpent)],['Location',selected.location],['Joined',formatDate(selected.joinedAt)]].map(([l,v])=>(
                <div key={l} style={{ background:'var(--bg-dark)', border:'1px solid var(--border-color)', padding:'12px 14px' }}>
                  <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:4 }}>{l}</div>
                  <div style={{ fontSize:14, color:'var(--gold-light)' }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom:6, fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)' }}>Order History</div>
            <div style={{ display:'flex', flexDirection:'column', gap:1, background:'var(--border-color)' }}>
              {selected.orders.map(o => (
                <div key={o.id} style={{ background:'var(--bg-dark)', padding:'12px 14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                    <span style={{ fontSize:12, fontWeight:500 }}>{o.orderNumber}</span>
                    <span style={{ fontSize:13, color:'var(--gold-light)' }}>{formatPrice(o.price)}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', gap:8 }}>
                      <StatusBadge status={o.status}/>
                      <StatusBadge status={o.paymentStatus}/>
                    </div>
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>{formatDate(o.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Admin notes textarea */}
            <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid var(--border-color)' }}>
              <div style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:8 }}>Admin Notes</div>
              <textarea placeholder="Add notes about this customer…" style={{ width:'100%', background:'var(--bg-dark)', border:'1px solid var(--border-color)', padding:'10px 12px', color:'var(--text-primary)', fontFamily:'"Libre Franklin",sans-serif', fontSize:12, outline:'none', resize:'none', minHeight:70 }}/>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
