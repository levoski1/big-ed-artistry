'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useTheme } from '@/context/ThemeContext'

const navLinks = [
  { label: 'About',   href: '/about'   },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Services',href: '/services'},
  { label: 'Store',   href: '/store'   },
  { label: 'Contact', href: '/contact' },
]

/* ── Cart icon ─────────────────────────────────────────────────────── */
function CartIcon({ count }: { count: number }) {
  return (
    <Link href="/cart" style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', width:40, height:40 }} aria-label={`Cart${count > 0 ? `, ${count} items` : ''}`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color:'var(--text-secondary)', transition:'color 0.3s' }}>
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      {count > 0 && (
        <span className="cart-badge">{count > 99 ? '99+' : count}</span>
      )}
    </Link>
  )
}

/* ── Sun icon ───────────────────────────────────────────────────────── */
function SunIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color:'var(--text-on-gold)' }}>
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1"  x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1"  y1="12" x2="3"  y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

/* ── Moon icon ──────────────────────────────────────────────────────── */
function MoonIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ color:'#FAF8F4' }}>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  )
}

/* ── Theme toggle pill ──────────────────────────────────────────────── */
function ThemeToggle() {
  const { isDark, toggleTheme, theme } = useTheme()
  const [iconKey, setIconKey] = useState(0)

  const handleToggle = () => {
    setIconKey(k => k + 1)
    toggleTheme()
  }

  return (
    <button
      onClick={handleToggle}
      className="theme-toggle"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="theme-toggle__thumb">
        <span className="theme-toggle__icon" key={iconKey}>
          {isDark ? <MoonIcon /> : <SunIcon />}
        </span>
      </span>
      {/* Screen-reader label */}
      <span style={{ position:'absolute', width:1, height:1, overflow:'hidden', clip:'rect(0,0,0,0)', whiteSpace:'nowrap' }}>
        {isDark ? 'Dark mode active' : 'Light mode active'}
      </span>
    </button>
  )
}

/* ── Main Navbar ─────────────────────────────────────────────────────── */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname  = usePathname()
  const { totalCount } = useCart()
  const { isDark } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  const navBg = scrolled
    ? 'var(--nav-bg-scrolled)'
    : 'transparent'

  const borderBottom = scrolled ? '1px solid var(--border-color)' : 'none'
  const mobileMenuTop = scrolled ? 72 : 84

  return (
    <>
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:1000,
        padding: scrolled ? '14px 0' : '20px 0',
        background: navBg,
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom,
        transition: 'all 0.4s ease',
      }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>

          {/* Logo */}
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:10, fontFamily:'"Cormorant Garamond",serif', fontSize:26, fontWeight:600, color:'var(--gold-light)', letterSpacing:'0.15em', textTransform:'uppercase', transition:'color 0.35s' }}>
            <span style={{ width:36, height:36, borderRadius:8, background:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
              <img src="/logo/biged_logo.png" alt="Big Ed logo" style={{ width:'130%', height:'130%', objectFit:'contain' }} />
            </span>
            <span className="brand-text">Big Ed <span style={{ color:'var(--text-primary)', fontWeight:400 }}>Artistry</span></span>
          </Link>

          {/* Desktop nav links */}
          <ul style={{ display:'flex', alignItems:'center', gap:36, listStyle:'none', margin:0 }} className="nav-links-desktop">
            {navLinks.map(link => (
              <li key={link.href}>
                <Link href={link.href} style={{
                  fontSize:12, fontWeight:400, letterSpacing:'0.12em', textTransform:'uppercase',
                  color: pathname === link.href ? 'var(--gold-light)' : 'var(--text-secondary)',
                  transition:'color 0.3s',
                }}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop right actions */}
          <div style={{ display:'flex', alignItems:'center', gap:14 }} className="nav-actions-desktop">
            <Link href="/login" style={{ fontSize:12, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-secondary)', padding:'10px 0', transition:'color 0.3s' }}>
              Login
            </Link>
            {/* Theme toggle */}
            <ThemeToggle />
            <CartIcon count={totalCount} />
            <Link href="/custom-artwork" style={{
              display:'inline-flex', alignItems:'center', gap:8,
              padding:'12px 24px', fontSize:12, fontWeight:600,
              letterSpacing:'0.12em', textTransform:'uppercase',
              background:'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))',
              color:'var(--text-on-gold)',
              transition:'opacity 0.3s, box-shadow 0.3s',
            }}>
              Order Artwork
            </Link>
          </div>

          {/* Mobile right: theme + cart + hamburger */}
          <div className="mobile-actions" style={{ display:'none', alignItems:'center', gap:10 }}>
            <ThemeToggle />
            <CartIcon count={totalCount} />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ display:'flex', flexDirection:'column', gap:5, background:'none', border:'none', cursor:'pointer', padding:8 }}
              aria-label="Toggle menu"
            >
              <span style={{ width:24, height:1, background:'var(--text-primary)', display:'block', transition:'all 0.3s', transform: menuOpen ? 'rotate(45deg) translate(4px,4px)' : 'none' }}/>
              <span style={{ width:24, height:1, background:'var(--text-primary)', display:'block', opacity: menuOpen ? 0 : 1, transition:'all 0.3s' }}/>
              <span style={{ width:24, height:1, background:'var(--text-primary)', display:'block', transition:'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translate(4px,-4px)' : 'none' }}/>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <div style={{
        position:'fixed', left:0, right:0, top:mobileMenuTop, bottom:0, zIndex:999,
        background:'var(--mobile-menu-bg)',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:32,
        opacity: menuOpen ? 1 : 0,
        pointerEvents: menuOpen ? 'all' : 'none',
        transition:'opacity 0.4s ease, background 0.35s ease',
      }}>
        {navLinks.map(link => (
          <Link key={link.href} href={link.href} style={{
            fontFamily:'"Cormorant Garamond",serif', fontSize:40, fontWeight:500,
            color: pathname === link.href ? 'var(--gold-light)' : 'var(--text-secondary)',
            transition:'color 0.3s',
          }}>
            {link.label}
          </Link>
        ))}
        <Link href="/custom-artwork" style={{
          marginTop:16, padding:'14px 32px', fontSize:13, fontWeight:600,
          letterSpacing:'0.12em', textTransform:'uppercase',
          background:'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))',
          color:'var(--text-on-gold)',
        }}>
          Order Artwork
        </Link>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop  { display: none !important; }
          .nav-actions-desktop{ display: none !important; }
          .mobile-actions     { display: flex !important; }
        }
        @media (max-width: 420px) {
          .brand-text { display: none !important; }
        }
      `}</style>
    </>
  )
}
