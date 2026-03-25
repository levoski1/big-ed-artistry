import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ padding: '80px 0 40px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-dark)', transition: 'background 0.35s ease, border-color 0.35s ease' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 60, marginBottom: 60 }} className="footer-grid">
          <div>
            <Link href="/" style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontWeight: 600, color: 'var(--gold-light)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>
              Big Ed <span style={{ color: 'var(--text-primary)', fontWeight: 400 }}>Artistry</span>
            </Link>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 24 }}>
              Hand-drawn portraits that tell the stories of people you love. Traditional artistry for the modern world.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {['ig', 'wa', '𝕏', 'fb'].map(s => (
                <a key={s} href="#" style={{ width: 36, height: 36, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--text-muted)', transition: 'all 0.3s' }}>{s}</a>
              ))}
            </div>
          </div>

          {[
            { heading: 'Services', links: [['Custom Portraits', '/services'], ['Photo Enlargements', '/photo-enlarge'], ['Family Portraits', '/services'], ['Wedding Art', '/custom-artwork'], ['Custom Packages', '/custom-artwork']] },
            { heading: 'Explore', links: [['Gallery', '/gallery'], ['Product Store', '/store'], ['Pricing', '/services#pricing'], ['About Big Ed', '/about'], ['Contact', '/contact']] },
            { heading: 'Account', links: [['Login', '/login'], ['Register', '/register'], ['My Orders', '/dashboard/orders'], ['Upload Payment', '/dashboard/payments'], ['My Profile', '/dashboard/profile']] },
          ].map(col => (
            <div key={col.heading}>
              <div style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 24 }}>{col.heading}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map(([label, href]) => (
                  <li key={label}><Link href={href} style={{ fontSize: 14, color: 'var(--text-muted)' }}>{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 32, borderTop: '1px solid var(--border-color)' }} className="footer-bottom">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>© 2025 Big Ed Artistry. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 24 }}>
            {[['Privacy Policy', '#'], ['Terms of Service', '#'], ['Refund Policy', '#']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) { .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 40px !important; } }
        @media (max-width: 640px) { .footer-grid { grid-template-columns: 1fr !important; } .footer-bottom { flex-direction: column; gap: 16px; text-align: center; } }
      `}</style>
    </footer>
  )
}
