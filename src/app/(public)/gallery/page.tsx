'use client'
import { useState } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import StarRating from '@/components/ui/StarRating'
import { SectionTag } from '@/components/ui'
import { mockArtworks } from '@/lib/mockData'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'

const categories = ['All','Portrait','Couple','Family','Wedding','Memorial']

export default function GalleryPage() {
  const [active, setActive] = useState('All')
  const [viewer, setViewer] = useState<typeof mockArtworks[0] | null>(null)
  const [viewerIdx, setViewerIdx] = useState(0)
  const { state, rateProduct } = useCart()

  const filtered = active === 'All' ? mockArtworks : mockArtworks.filter(a => a.category === active.toLowerCase())

  const open = (art: typeof mockArtworks[0], idx: number) => { setViewer(art); setViewerIdx(idx) }
  const prev = () => { const i = (viewerIdx - 1 + filtered.length) % filtered.length; setViewer(filtered[i]); setViewerIdx(i) }
  const next = () => { const i = (viewerIdx + 1) % filtered.length; setViewer(filtered[i]); setViewerIdx(i) }

  return (
    <PublicLayout>
      {/* Hero */}
      <section style={{ paddingTop:140, paddingBottom:60, borderBottom:'1px solid var(--border-color)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'var(--section-gradient)' }}/>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', position:'relative', textAlign:'center' }}>
          <SectionTag center>Portfolio</SectionTag>
          <h1 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(48px,6vw,80px)', marginBottom:20 }}>
            The <span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>Collection</span>
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:16, maxWidth:540, margin:'0 auto 40px', lineHeight:1.85 }}>
            Hand-drawn charcoal and pencil portraits — each one a unique story, preserved forever in art.
          </p>
          <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActive(cat)} style={{ padding:'9px 22px', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', background:active===cat?'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))':'transparent', color:active===cat?'var(--text-on-gold)':'var(--text-secondary)', border:active===cat?'none':'1px solid var(--border-color)', cursor:'pointer', fontFamily:'"Libre Franklin",sans-serif', fontWeight:active===cat?700:400, transition:'all 0.2s' }}>{cat}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Masonry-style grid */}
      <section style={{ padding:'60px 0 100px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ columns:'3 280px', columnGap:16, rowGap:16 }} className="gallery-columns">
            {filtered.map((art, idx) => (
              <div
                key={art.id}
                className="card-hover"
                onClick={() => open(art, idx)}
                style={{ breakInside:'avoid', marginBottom:16, background:'var(--bg-card)', border:'1px solid var(--border-color)', overflow:'hidden', cursor:'pointer', display:'inline-block', width:'100%' }}
              >
                {/* Art placeholder — alternating heights for masonry feel */}
                <div style={{ background:'var(--bg-dark)', height: idx % 3 === 0 ? 280 : idx % 3 === 1 ? 200 : 240, position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ opacity:0.1 }}>
                    <circle cx="24" cy="16" r="10" stroke="#D4A84B" strokeWidth="1"/>
                    <path d="M6 44c0-9.941 8.059-18 18-18s18 8.059 18 18" stroke="#D4A84B" strokeWidth="1"/>
                  </svg>
                  <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(184,134,11,0.02) 28px,rgba(184,134,11,0.02) 29px)' }}/>
                  {/* Hover overlay */}
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(15,14,12,0.92) 0%,transparent 60%)', opacity:0, transition:'opacity 0.35s' }} className="gallery-overlay"/>
                  <div style={{ position:'absolute', bottom:16, left:16, opacity:0, transition:'opacity 0.35s', transform:'translateY(8px)' }} className="gallery-info">
                    <div style={{ fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gold-primary)', marginBottom:4 }}>View Artwork</div>
                  </div>
                  <style>{`.card-hover:hover .gallery-overlay,.card-hover:hover .gallery-info{opacity:1!important;transform:translateY(0)!important;}`}</style>
                </div>
                <div style={{ padding:'18px 18px 14px' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:6 }}>
                    <div>
                      <div style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:19, fontWeight:500, marginBottom:2 }}>{art.title}</div>
                      <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold-primary)' }}>{art.medium} · {art.size}</div>
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', flexShrink:0 }}>{art.year}</div>
                  </div>
                  {art.description && <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.7, marginBottom:10 }}>{art.description}</p>}
                  <StarRating productId={`gallery-${art.id}`} initialRating={4} userRating={state.ratings[`gallery-${art.id}`]} onRate={rateProduct} size={13}/>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:'80px 0', color:'var(--text-muted)' }}>
              <div style={{ fontSize:40, marginBottom:16 }}>🎨</div>
              <p>No artworks in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <div style={{ borderTop:'1px solid var(--border-color)', padding:'80px 0', textAlign:'center', background:'var(--bg-card)' }}>
        <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:44, marginBottom:16 }}>Love What You See?</h2>
        <p style={{ color:'var(--text-secondary)', marginBottom:32 }}>Commission your own hand-drawn portrait today.</p>
        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/custom-artwork" style={{ padding:'14px 32px', fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', background:'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color:'var(--text-on-gold)' }}>Order Custom Artwork</Link>
          <Link href="/photo-enlarge" style={{ padding:'14px 24px', fontSize:12, letterSpacing:'0.12em', textTransform:'uppercase', border:'1px solid var(--border-color)', color:'var(--text-secondary)' }}>Photo Enlargement</Link>
        </div>
      </div>

      {/* Lightbox viewer */}
      {viewer && (
        <div onClick={() => setViewer(null)} style={{ position:'fixed', inset:0, zIndex:2000, background:'var(--overlay-bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth:640, width:'100%', background:'var(--bg-card)', border:'1px solid var(--border-color)' }}>
            <div style={{ height:380, background:'var(--bg-dark)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              <svg width="64" height="64" viewBox="0 0 48 48" fill="none" style={{ opacity:0.1 }}><circle cx="24" cy="16" r="10" stroke="#D4A84B" strokeWidth="1"/><path d="M6 44c0-9.941 8.059-18 18-18s18 8.059 18 18" stroke="#D4A84B" strokeWidth="1"/></svg>
              <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(-45deg,rgba(184,134,11,0.04) 0,rgba(184,134,11,0.04) 1px,transparent 1px,transparent 14px)' }}/>
              <button onClick={() => setViewer(null)} style={{ position:'absolute', top:16, right:16, width:36, height:36, background:'var(--bg-card)', border:'1px solid var(--border-color)', color:'var(--text-secondary)', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
            <div style={{ padding:28 }}>
              <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:28, marginBottom:6 }}>{viewer.title}</h2>
              <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold-primary)', marginBottom:10 }}>{viewer.medium} · {viewer.size} · {viewer.year}</div>
              {viewer.description && <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.8, marginBottom:20 }}>{viewer.description}</p>}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <StarRating productId={`gallery-${viewer.id}`} initialRating={4} userRating={state.ratings[`gallery-${viewer.id}`]} onRate={rateProduct} size={14}/>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={prev} style={{ width:36, height:36, background:'var(--bg-dark)', border:'1px solid var(--border-color)', color:'var(--text-secondary)', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
                  <button onClick={next} style={{ width:36, height:36, background:'var(--bg-dark)', border:'1px solid var(--border-color)', color:'var(--text-secondary)', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>→</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  )
}
