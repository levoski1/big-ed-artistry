'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import PublicLayout from '@/components/layout/PublicLayout'
import { SectionTag } from '@/components/ui'
import { useCart } from '@/context/CartContext'
import StarRating from '@/components/ui/StarRating'
import type { GalleryItem } from '@/app/actions/gallery'

const CATEGORIES = ['All', 'Portrait', 'Couple', 'Family', 'Wedding', 'Memorial', 'Other']

export default function GalleryPageContent({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState('All')
  const [viewer, setViewer] = useState<GalleryItem | null>(null)
  const [viewerIdx, setViewerIdx] = useState(0)
  const { state, rateProduct } = useCart()

  const filtered = active === 'All' ? items : items.filter(a => a.category === active.toLowerCase())

  const open = (item: GalleryItem, idx: number) => { setViewer(item); setViewerIdx(idx) }
  const prev = () => { const i = (viewerIdx - 1 + filtered.length) % filtered.length; setViewer(filtered[i]); setViewerIdx(i) }
  const next = () => { const i = (viewerIdx + 1) % filtered.length; setViewer(filtered[i]); setViewerIdx(i) }

  return (
    <PublicLayout>
      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 60, borderBottom: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--section-gradient)' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', position: 'relative', textAlign: 'center' }}>
          <SectionTag center>Portfolio</SectionTag>
          <h1 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(48px,6vw,80px)', marginBottom: 20 }}>
            The <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Collection</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.85 }}>
            Hand-drawn charcoal and pencil portraits — each one a unique story, preserved forever in art.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActive(cat)} style={{ padding: '9px 22px', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', background: active === cat ? 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))' : 'transparent', color: active === cat ? 'var(--text-on-gold)' : 'var(--text-secondary)', border: active === cat ? 'none' : '1px solid var(--border-color)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif', fontWeight: active === cat ? 700 : 400, transition: 'all 0.2s' }}>{cat}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery grid */}
      <section style={{ padding: '60px 0 100px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🎨</div>
              <p>No artworks in this category yet.</p>
            </div>
          ) : (
            <div style={{ columns: '3 280px', columnGap: 16 }} className="gallery-columns">
              {filtered.map((item, idx) => (
                <div key={item.id} className="card-hover" onClick={() => open(item, idx)} style={{ breakInside: 'avoid', marginBottom: 16, background: 'var(--bg-card)', border: '1px solid var(--border-color)', overflow: 'hidden', cursor: 'pointer', display: 'inline-block', width: '100%' }}>
                  <div style={{ position: 'relative', overflow: 'hidden', minHeight: 180 }}>
                    <Image src={item.image_url} alt={item.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:768px) 100vw, 33vw" />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(15,14,12,0.85) 0%,transparent 60%)', opacity: 0, transition: 'opacity 0.35s' }} className="gallery-overlay" />
                    <div style={{ position: 'absolute', bottom: 12, left: 14, opacity: 0, transition: 'opacity 0.35s', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-primary)' }} className="gallery-info">View Artwork</div>
                  </div>
                  <div style={{ padding: '16px 18px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                      <div style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 18, fontWeight: 500 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{item.year}</div>
                    </div>
                    <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-primary)', marginBottom: 6 }}>{item.medium}{item.size ? ` · ${item.size}` : ''}</div>
                    {item.description && <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>{item.description}</p>}
                    <StarRating productId={`gallery-${item.id}`} initialRating={4} userRating={state.ratings[`gallery-${item.id}`]} onRate={rateProduct} size={13} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <div style={{ borderTop: '1px solid var(--border-color)', padding: '80px 0', textAlign: 'center', background: 'var(--bg-card)' }}>
        <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 44, marginBottom: 16 }}>Love What You See?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Commission your own hand-drawn portrait today.</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/custom-artwork" style={{ padding: '14px 32px', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color: 'var(--text-on-gold)' }}>Order Custom Artwork</Link>
          <Link href="/photo-enlarge" style={{ padding: '14px 24px', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Photo Enlargement</Link>
        </div>
      </div>

      {/* Lightbox */}
      {viewer && (
        <div onClick={() => setViewer(null)} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 680, width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
              <Image src={viewer.image_url} alt={viewer.title} fill style={{ objectFit: 'cover' }} sizes="680px" />
              <button onClick={() => setViewer(null)} style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ padding: 28 }}>
              <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 28, marginBottom: 6 }}>{viewer.title}</h2>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-primary)', marginBottom: 10 }}>{viewer.medium}{viewer.size ? ` · ${viewer.size}` : ''} · {viewer.year}</div>
              {viewer.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20 }}>{viewer.description}</p>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <StarRating productId={`gallery-${viewer.id}`} initialRating={4} userRating={state.ratings[`gallery-${viewer.id}`]} onRate={rateProduct} size={14} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={prev} style={{ width: 36, height: 36, background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
                  <button onClick={next} style={{ width: 36, height: 36, background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`.card-hover:hover .gallery-overlay,.card-hover:hover .gallery-info{opacity:1!important;}`}</style>
    </PublicLayout>
  )
}
