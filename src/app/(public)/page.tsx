import Link from 'next/link'
import Image from 'next/image'
import PublicLayout from '@/components/layout/PublicLayout'
import TestimonialsSection from '@/components/ui/TestimonialsSection'
import HeroCarousel from '@/components/ui/HeroCarousel'
import { SectionTag, GoldLine } from '@/components/ui'
import { getGalleryItems } from '@/app/actions/gallery'
import { getProducts } from '@/app/actions/products'
import { getReviews } from '@/app/actions/reviews'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/tokens'
import type { Database } from '@/lib/types/database'

type Product = Database['public']['Tables']['products']['Row']

export default async function HomePage() {
  const [galleryItems, products, reviews, supabase] = await Promise.all([
    getGalleryItems({ limit: 8 }).catch((): Awaited<ReturnType<typeof getGalleryItems>> => []),
    getProducts({ limit: 8 }).catch((): Product[] => []),
    getReviews().catch(() => []),
    createClient(),
  ])

  const { data: { session } } = await supabase.auth.getSession()
  const isLoggedIn = !!session

  const featuredArtworks = galleryItems.slice(0, 8)
  const featuredProducts = products.slice(0, 8)

  return (
    <PublicLayout>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: 80 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--hero-gradient)' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, width: '55%', height: '100%', opacity: 0.04, backgroundImage: 'repeating-linear-gradient(-45deg,var(--gold-light) 0px,var(--gold-light) 1px,transparent 1px,transparent 28px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', width: '100%', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', padding: '60px 0' }} className="hero-grid">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', marginBottom: 32 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold-accent)', display: 'inline-block' }} />
                <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Hand-Drawn · Charcoal Artist · Ships Worldwide</span>
              </div>
              <h1 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(44px,5.5vw,84px)', fontWeight: 500, lineHeight: 1.08, marginBottom: 24 }}>
                Transform Your<br />Memories Into <span className="gold-shimmer">Timeless Art</span>
              </h1>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 460, marginBottom: 40, lineHeight: 1.85 }}>
                Handcrafted charcoal and pencil portraits from your photos. Every stroke drawn by Big Ed — from commission to doorstep delivery.
              </p>
              <div style={{ display: 'flex', gap: 14, marginBottom: 52, flexWrap: 'wrap' }}>
                <Link href="/custom-artwork" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 30px', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color: 'var(--text-on-gold)' }}>✏️ Order Custom Artwork</Link>
                <Link href="/photo-enlarge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 22px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', border: '2px solid var(--gold-primary)', color: 'var(--gold-light)' }}>📸 Photo Enlargement</Link>
              </div>
              <div style={{ display: 'flex', gap: 44, paddingTop: 32, borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                {[['500+', 'Artworks Done'], ['98%', 'Satisfied Clients'], ['14+', 'Years Mastery']].map(([n, l]) => (
                  <div key={l}><span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 38, fontWeight: 600, color: 'var(--gold-light)', display: 'block', lineHeight: 1 }}>{n}</span><span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{l}</span></div>
                ))}
              </div>
            </div>
            {/* Hero carousel — static images from /public/Home */}
            <HeroCarousel />
          </div>
        </div>
        <style>{`@media(max-width:860px){.hero-grid{grid-template-columns:1fr!important;gap:40px!important;}}`}</style>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────── */}
      <div style={{ padding: '32px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          {[['✏️', 'Charcoal & Pencil', 'Handcrafted Art'], ['📐', 'Size-Based Pricing', 'Measured in Inches'], ['🖼️', 'Canvas Options', 'Normal · Smooth · Crystal'], ['🚚', '2–3 Week Delivery', 'Nigeria & Worldwide']].map(([icon, bold, sub]) => (
            <div key={bold} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <div><div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{bold}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURED ARTWORKS — only if admin has uploaded ───── */}
      {featuredArtworks.length > 0 && (
        <section style={{ padding: '100px 0' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
              <div><SectionTag>Portfolio</SectionTag><h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(32px,4vw,52px)' }}>Featured <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Artworks</span></h2></div>
              <Link href="/gallery" style={{ padding: '12px 24px', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>View All Gallery →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }} className="art-grid">
              {featuredArtworks.map(art => (
                <Link key={art.id} href="/gallery" style={{ display: 'block', textDecoration: 'none' }}>
                  <div className="card-hover" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
                      <Image src={art.image_url} alt={art.title} fill style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }} sizes="(max-width:540px) 100vw, (max-width:1024px) 50vw, 25vw" />
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 17, fontWeight: 500, marginBottom: 4, color: 'var(--text-primary)' }}>{art.title}</div>
                      <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-primary)' }}>{art.medium}{art.size ? ` · ${art.size}` : ''} · {art.year}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <Link href="/gallery" style={{ display: 'inline-flex', padding: '14px 32px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Browse Full Gallery →</Link>
            </div>
          </div>
          <style>{`@media(max-width:1024px){.art-grid{grid-template-columns:repeat(2,1fr)!important;}}@media(max-width:540px){.art-grid{grid-template-columns:1fr!important;}}`}</style>
        </section>
      )}

      {/* ── CUSTOM ARTWORK SERVICE ────────────────────────────── */}
      <section style={{ padding: '80px 0', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="svc-grid">
            <div>
              <SectionTag>Service 01</SectionTag>
              <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(32px,4vw,52px)', marginBottom: 20 }}>Custom <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Artwork</span></h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, marginBottom: 28, fontSize: 15 }}>Hand-sketched in charcoal or pencil from your photos. Choose the size (in inches), canvas type, frame style, and glass finish.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 32 }}>
                {[['📐 Sizes', '12×16 to 36×48"'], ['🎨 Canvas', 'Normal, Smooth, Crystal'], ['🖼️ Frames', 'Small → Premium'], ['🧊 Glass', '2mm or 3mm']].map(([l, v]) => (
                  <div key={l} style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '12px 14px' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{l}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v}</div>
                  </div>
                ))}
              </div>
              <Link href="/custom-artwork" style={{ display: 'inline-flex', padding: '14px 28px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color: 'var(--text-on-gold)' }}>Start Customising →</Link>
            </div>
            <div
              style={{
                height: 600,
                background: 'var(--bg-dark)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Image
                src="/Home/sliders/artwork.jpeg"
                alt="Custom artwork sample"
                fill
                style={{ objectFit: 'cover', objectPosition: 'top' }}
                sizes="(max-width:860px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
        <style>{`@media(max-width:860px){.svc-grid{grid-template-columns:1fr!important;}}`}</style>
      </section>


      {/* ── PHOTO ENLARGEMENT SERVICE ─────────────────────────── */}
      <section style={{ padding: '80px 0', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="enl-grid">

            <div>
              <SectionTag>Service 02</SectionTag>
              <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(32px,4vw,52px)', marginBottom: 20 }}>Photo <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Enlargements</span></h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, marginBottom: 28, fontSize: 15 }}>Upload any photo and we transform it into a large-format artwork. Same canvas, frame, and glass options. 1–2 week turnaround.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                {['Upload your photo to begin', 'Select size, canvas, frame & glass', 'Receive your large-format artwork', '1–2 week delivery turnaround'].map((s, i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(184,134,11,0.15)', border: '1px solid var(--gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--gold-light)', flexShrink: 0 }}>{i + 1}</span>{s}
                  </div>
                ))}
              </div>
              <Link href="/photo-enlarge" style={{ display: 'inline-flex', padding: '14px 28px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Upload Your Photo →</Link>
            </div>
            <div style={{ height: 300, border: '1px solid var(--gold-dark)', overflow: 'hidden', position: 'relative' }}>
              <Image src="/Home/sliders/photo_edit.jpeg" alt="Photo Enlargement Sample" fill style={{ objectFit: 'cover' }} sizes="(max-width:860px) 100vw, 50vw" />
            </div>
          </div>
        </div>
        <style>{`@media(max-width:860px){.enl-grid{grid-template-columns:1fr!important;}}`}</style>
      </section>

      {/* ── STORE — dynamic, only if admin has added products ─── */}
      {featuredProducts.length > 0 && (
        <section style={{ padding: '100px 0', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
              <div><SectionTag>Store</SectionTag><h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(32px,4vw,52px)' }}>Art Products <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>&amp; Prints</span></h2></div>
              <Link href="/store" style={{ padding: '12px 24px', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>View All Products →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }} className="products-grid">
              {featuredProducts.map(p => (
                <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: 200, background: 'var(--bg-dark)', overflow: 'hidden', position: 'relative' }}>
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="(max-width:540px) 100vw, (max-width:1024px) 50vw, 25vw" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="40" height="40" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.1 }}><rect x="8" y="8" width="32" height="32" stroke="#D4A84B" strokeWidth="1" /></svg>
                      </div>
                    )}
                    {p.badge && <div style={{ position: 'absolute', top: 10, left: 10, padding: '3px 8px', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color: 'var(--text-on-gold)' }}>{p.badge}</div>}
                  </div>
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{p.category}</div>
                    <div style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 17, color: 'var(--text-primary)', lineHeight: 1.2 }}>{p.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
                      <span style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 18, color: 'var(--gold-light)' }}>{formatPrice(p.price)}</span>
                      {p.original_price && <span style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{formatPrice(p.original_price)}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <Link href="/store" style={{ display: 'inline-flex', padding: '14px 32px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Browse All Products in Store →</Link>
            </div>
          </div>
          <style>{`@media(max-width:1024px){.products-grid{grid-template-columns:repeat(2,1fr)!important;}}@media(max-width:540px){.products-grid{grid-template-columns:1fr!important;}}`}</style>
        </section>
      )}

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section style={{ padding: '100px 0', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}><SectionTag center>Process</SectionTag><h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(32px,4vw,52px)' }}>How Ordering <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Works</span></h2></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'var(--border-color)' }} className="steps-grid">
            {[{ n: '01', icon: '📐', t: 'Choose Size & Options', d: 'Select size in inches, canvas type, frame, and glass finish.' }, { n: '02', icon: '📸', t: 'Upload Your Photo', d: 'Send a clear, high-resolution photo of your subject.' }, { n: '03', icon: '✏️', t: 'Art Gets Created', d: 'Big Ed draws your portrait by hand with progress updates.' }, { n: '04', icon: '📦', t: 'Delivered to You', d: 'Carefully packaged and shipped. Physical or digital delivery.' }].map(s => (
              <div key={s.n} style={{ background: 'var(--bg-card)', padding: '36px 24px', position: 'relative' }}>
                <div style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 64, fontWeight: 700, color: 'var(--border-color)', lineHeight: 1, position: 'absolute', top: 16, right: 16, userSelect: 'none' }}>{s.n}</div>
                <span style={{ fontSize: 26, display: 'block', marginBottom: 14 }}>{s.icon}</span>
                <div style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 19, marginBottom: 8 }}>{s.t}</div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:860px){.steps-grid{grid-template-columns:1fr 1fr!important;}}@media(max-width:540px){.steps-grid{grid-template-columns:1fr!important;}}`}</style>
      </section>

      {/* ── VIDEO SECTION (relocated from hero) ──────────────── */}
      <section style={{ padding: '80px 0', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-dark)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }} className="video-grid">
            <div>
              <SectionTag>Behind the Art</SectionTag>
              <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(32px,4vw,52px)', marginBottom: 20 }}>Watch Big Ed <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>at Work</span></h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, marginBottom: 28, fontSize: 15 }}>Every portrait is drawn entirely by hand — no digital shortcuts. Watch the process from blank canvas to finished masterpiece.</p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Link href="/custom-artwork" style={{ display: 'inline-flex', padding: '14px 28px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color: 'var(--text-on-gold)' }}>Commission Yours →</Link>
                <Link href="/gallery" style={{ display: 'inline-flex', padding: '14px 22px', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>View Gallery</Link>
              </div>
            </div>
            <div style={{ border: '1px solid var(--border-color)', overflow: 'hidden', background: 'var(--bg-card)' }}>
              <video
                src="/video/eric.mp4"
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: '100%',
                  display: 'block',
                  maxHeight: 420,
                  objectFit: 'contain',
                  objectPosition: 'top',
                  background: '#000',
                }}
              /> </div>
          </div>
        </div>
        <style>{`@media(max-width:860px){.video-grid{grid-template-columns:1fr!important;}}`}</style>
      </section>

      {/* ── TESTIMONIALS — real user reviews only ────────────── */}
      <TestimonialsSection initialReviews={reviews} isLoggedIn={isLoggedIn} />

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={{ padding: '140px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--section-gradient)' }} />
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <GoldLine />
          <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(40px,6vw,68px)', marginBottom: 20, marginTop: 24 }}>Ready to Create<br />Something <em style={{ color: 'var(--gold-light)' }}>Timeless?</em></h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.85, fontSize: 16 }}>Commission a hand-drawn portrait and preserve your most cherished moments forever.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/custom-artwork" style={{ padding: '16px 32px', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color: 'var(--text-on-gold)' }}>Order Custom Artwork</Link>
            <Link href="/store" style={{ padding: '16px 24px', fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Browse Store</Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
