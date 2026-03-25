'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { icon: '◈', label: 'Dashboard', href: '/admin/dashboard' },
  { icon: '◇', label: 'Orders', href: '/admin/orders' },
  { icon: '✦', label: 'Products', href: '/admin/products' },
  { icon: '◉', label: 'Customers', href: '/admin/customers' },
  { icon: '❋', label: 'Payments', href: '/admin/settings' },
  { icon: '⊕', label: 'Settings', href: '/admin/settings' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <>
      <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'none', position: 'fixed', top: 16, left: 16, zIndex: 999, background: 'var(--gold-primary)', border: 'none', color: 'var(--bg-dark)', width: 44, height: 44, borderRadius: 4, cursor: 'pointer', fontSize: 18, fontWeight: 'bold' }} className="mobile-menu-btn">☰</button>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ display: 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 98 }} className="mobile-overlay"/>}
      <aside style={{ width: 260, background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)', transition: 'background 0.35s ease, border-color 0.35s ease', minHeight: '100vh', padding: '32px 0', flexShrink: 0, position: 'relative' }}>
      <div style={{ padding: '0 24px 32px', borderBottom: '1px solid var(--border-color)', marginBottom: 16 }}>
        <Link href="/" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20, fontWeight: 600, color: 'var(--gold-light)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Big Ed <span style={{ color: 'var(--text-primary)', fontWeight: 400 }}>Artistry</span>
        </Link>
        <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-primary)', marginTop: 6 }}>Admin Panel</div>
      </div>
      <nav style={{ padding: '0 12px' }}>
        {navItems.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href + item.label} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', marginBottom: 2,
              background: active ? 'rgba(184,134,11,0.08)' : 'transparent', transition: 'all 0.3s ease',
              borderLeft: active ? '2px solid var(--gold-primary)' : '2px solid transparent',
              color: active ? 'var(--gold-light)' : 'var(--text-secondary)',
              fontSize: 13, letterSpacing: '0.08em',
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div style={{ position: 'absolute', bottom: 32, left: 0, width: 260, padding: '0 24px', borderTop: '1px solid var(--border-color)', paddingTop: 24 }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Big Ed</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>Administrator</div>
        <Link href="/login" style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--danger)' }}>Sign Out</Link>
      </div>
    </aside>
    <style>{`
      @media (max-width: 900px) {
        .mobile-menu-btn { display: block !important; }
        .mobile-overlay { display: block !important; }
        aside { position: fixed !important; left: 0; top: 0; height: 100vh; zIndex: 99; transform: translateX(-100%); transition: transform 0.3s ease; }
        aside.open { transform: translateX(0); }
      }
    `}</style>
    <style>{sidebarOpen ? `aside { transform: translateX(0) !important; }` : ''}</style>
    </>
  )
}
