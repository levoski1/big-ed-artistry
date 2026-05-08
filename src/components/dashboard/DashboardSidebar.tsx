'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { logout } from '@/app/actions/auth'
import { useTheme } from '@/context/ThemeContext'

const navItems = [
  { icon: '◈', label: 'Dashboard', href: '/dashboard' },
  { icon: '◇', label: 'My Orders', href: '/dashboard/orders' },
  { icon: '✦', label: 'Upload Payment', href: '/dashboard/payments' },
  { icon: '◉', label: 'My Profile', href: '/dashboard/profile' },
  { icon: '🛍️', label: 'Store', href: '/store' },
  { icon: '✏️', label: 'Custom Artwork', href: '/custom-artwork' },
  { icon: '🖼️', label: 'Photo Enlargement', href: '/photo-enlarge' },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { isDark, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const handleNavClick = () => setSidebarOpen(false)

  return (
    <>
      <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'none', position: 'fixed', top: 16, left: 16, zIndex: 999, background: 'var(--gold-primary)', border: 'none', color: 'var(--bg-dark)', width: 44, height: 44, borderRadius: 4, cursor: 'pointer', fontSize: 18, fontWeight: 'bold' }} className="dashboard-mobile-btn" aria-label="Toggle navigation menu" aria-expanded={sidebarOpen}>☰</button>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ display: 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 98 }} className="dashboard-mobile-overlay" />}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ width: 260, background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)', transition: 'background 0.35s ease, border-color 0.35s ease', minHeight: '100vh', padding: '32px 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 24px 32px', borderBottom: '1px solid var(--border-color)', marginBottom: 16 }}>
          <Link href="/" onClick={handleNavClick} style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20, fontWeight: 600, color: 'var(--gold-light)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Big Ed <span style={{ color: 'var(--text-primary)', fontWeight: 400 }}>Artistry</span>
          </Link>
          <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 6 }}>Customer Portal</div>
        </div>
        <nav style={{ padding: '0 12px', flex: 1 }}>
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', marginBottom: 2, background: active ? 'rgba(184,134,11,0.08)' : 'transparent', borderLeft: active ? '2px solid var(--gold-primary)' : '2px solid transparent', color: active ? 'var(--gold-light)' : 'var(--text-secondary)', fontSize: 13, letterSpacing: '0.08em', transition: 'all 0.2s' }} onClick={handleNavClick}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', background: 'none', border: '1px solid var(--border-color)', padding: '8px 12px', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif', transition: 'all 0.2s' }}>
            <span>{isDark ? '☀️' : '🌙'}</span>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <Link href="/" onClick={handleNavClick} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            ← Back to Site
          </Link>
          <form action={logout}>
            <button type="submit" style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif', padding: 0 }}>
              Sign Out
            </button>
          </form>
        </div>
      </aside>
      <style>{`
        @media (max-width: 900px) {
          .dashboard-mobile-btn { display: block !important; }
          .dashboard-mobile-overlay { display: block !important; }
          .dashboard-sidebar { position: fixed !important; left: 0; top: 0; height: 100vh; z-index: 99; transform: translateX(-100%); transition: transform 0.3s ease; }
          .dashboard-sidebar.open { transform: translateX(0); }
          .dashboard-content { padding-top: 64px !important; }
        }
      `}</style>
    </>
  )
}
