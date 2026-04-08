'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const navItems = [
  { icon: '📊', label: 'Dashboard', href: '/admin/dashboard', color: '#3B82F6' },
  { icon: '📦', label: 'Orders', href: '/admin/orders', color: '#06B6D4' },
  { icon: '🛍️', label: 'Products', href: '/admin/products', color: '#8B5CF6' },
  { icon: '🖼️', label: 'Gallery', href: '/admin/gallery', color: '#F59E0B' },
  { icon: '💳', label: 'Payments', href: '/admin/payments', color: '#10B981' },
  { icon: '👥', label: 'Customers', href: '/admin/customers', color: '#EC4899' },
  { icon: '⚙️', label: 'Settings', href: '/admin/settings', color: '#6B7280' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return (
    <>
      <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'none', position: 'fixed', top: 20, left: 20, zIndex: 999, background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', border: 'none', color: 'white', width: 48, height: 48, borderRadius: 8, cursor: 'pointer', fontSize: 20, fontWeight: 'bold', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }} className="mobile-menu-btn">☰</button>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ display: 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 98 }} className="mobile-overlay"/>}
      <aside style={{ width: 280, background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)', borderRight: '1px solid rgba(59, 130, 246, 0.1)', minHeight: '100vh', padding: '28px 0', flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Brand */}
        <div style={{ padding: '0 24px 32px', borderBottom: '1px solid rgba(59, 130, 246, 0.1)', marginBottom: 24 }}>
          <Link href="/" style={{ fontSize: 20, fontWeight: 700, background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
            Big Ed
          </Link>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#64748B', marginTop: 8, fontWeight: 600 }}>Admin Control</div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '0 12px', flex: 1 }}>
          {navItems.map(item => {
            const active = pathname?.startsWith(item.href.split('/').slice(0, 3).join('/'))
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', marginBottom: 8,
                background: active ? 'rgba(59, 130, 246, 0.15)' : 'transparent', 
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                borderLeft: active ? '3px solid #3B82F6' : '3px solid transparent',
                color: active ? '#E0E7FF' : '#94A3B8',
                fontSize: 14, 
                fontWeight: active ? 600 : 500,
              }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span>{item.label}</span>
                {active && <div style={{ marginLeft: 'auto', width: 6, height: 6, background: '#3B82F6', borderRadius: '50%' }} />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(59, 130, 246, 0.1)', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #3B82F6, #06B6D4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👨‍💼</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>Admin</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>System Manager</div>
            </div>
          </div>
          <Link href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#F87171', padding: '8px 12px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '6px', border: '1px solid rgba(244, 63, 94, 0.2)', textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer' }}>
            🚪 Sign Out
          </Link>
        </div>
      </aside>

      <style>{`
        @media (max-width: 900px) {
          .mobile-menu-btn { display: flex !important; align-items: center; justify-content: center; }
          .mobile-overlay { display: block !important; }
          aside { position: fixed !important; left: 0; top: 0; height: 100vh; z-index: 99; transform: translateX(-100%); transition: transform 0.3s ease; }
          aside.open { transform: translateX(0); }
        }
      `}</style>
      <style>{sidebarOpen ? `aside { transform: translateX(0) !important; }` : ''}</style>
    </>
  )
}
