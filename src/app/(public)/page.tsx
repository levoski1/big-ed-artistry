'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'
import ProductCard from '@/components/ui/ProductCard'
import StarRating from '@/components/ui/StarRating'
import { mockArtworks, mockProducts, mockTestimonials } from '@/lib/mockData'
import { SectionTag, GoldLine } from '@/components/ui'

function HeroVideo() {
  return (
    <div style={{ width:'100%', maxWidth:440, minHeight:200, border:'1px solid var(--border-color)', background:'var(--bg-card)', overflow:'hidden', margin:'0 auto' }}>
      <video
        src="/video/eric.mp4"
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        style={{ width:'100%', height:'100%', minHeight:200, objectFit:'cover', display:'block' }}
      />
    </div>
  )
}

export default function HomePage() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')), {threshold:0.1})
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <PublicLayout>
      {/* HERO */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', overflow:'hidden', paddingTop:80 }}>
        <div style={{ position:'absolute', inset:0, background:'var(--hero-gradient)' }}/>
        <div style={{ position:'absolute', right:0, top:0, width:'55%', height:'100%', opacity:0.04, backgroundImage:'repeating-linear-gradient(-45deg,var(--gold-light) 0px,var(--gold-light) 1px,transparent 1px,transparent 28px)', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', width:'100%', position:'relative', zIndex:2 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center', padding:'60px 0' }} className="hero-grid">
            <div>
              <div className="animate-fade-up" style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'8px 18px', background:'var(--bg-card)', border:'1px solid var(--border-color)', marginBottom:32 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--gold-accent)', display:'inline-block' }}/>
                <span style={{ fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-muted)' }}>Hand-Drawn · Charcoal Artist · Ships Worldwide</span>
              </div>
              <h1 className="animate-fade-up delay-100" style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(44px,5.5vw,84px)', fontWeight:500, lineHeight:1.08, marginBottom:24 }}>
                Custom Art<br/>That <span className="gold-shimmer">Tells Your</span><br/><em style={{ fontStyle:'italic', color:'var(--text-secondary)' }}>Story</em>
              </h1>
              <p className="animate-fade-up delay-200" style={{ fontSize:16, color:'var(--text-secondary)', maxWidth:460, marginBottom:40, lineHeight:1.85 }}>
                Handcrafted charcoal and pencil portraits from your photos. Every stroke drawn by Big Ed — from commission to doorstep delivery.
              </p>
              <div className="animate-fade-up delay-300" style={{ display:'flex', gap:14, marginBottom:52, flexWrap:'wrap' }}>
                <Link href="/custom-artwork" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'14px 30px', fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', background:'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color:'var(--text-on-gold)' }}>✏️ Order Custom Artwork</Link>
                <Link href="/photo-enlarge" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'14px 22px', fontSize:12, letterSpacing:'0.12em', textTransform:'uppercase', border:'1px solid var(--border-color)', color:'var(--text-secondary)' }}>📸 Photo Enlargement</Link>
              </div>
              <div className="animate-fade-up delay-400" style={{ display:'flex', gap:44, paddingTop:32, borderTop:'1px solid var(--border-color)', flexWrap:'wrap' }}>
                {[['500+','Artworks Done'],['98%','Satisfied Clients'],['7+','Years Mastery']].map(([n,l])=>(
                  <div key={l}><span style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:38, fontWeight:600, color:'var(--gold-light)', display:'block', lineHeight:1 }}>{n}</span><span style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)' }}>{l}</span></div>
                ))}
              </div>
            </div>
            <div className="animate-fade-up delay-200"><HeroVideo /></div>
          </div>
        </div>
        <style>{`@media(max-width:860px){.hero-grid{grid-template-columns:1fr!important;gap:40px!important;}}`}</style>
      </section>

      {/* TRUST BAR */}
      <div style={{ padding:'32px 0', borderTop:'1px solid var(--border-color)', borderBottom:'1px solid var(--border-color)', background:'var(--bg-card)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, flexWrap:'wrap' }}>
          {[['✏️','Charcoal & Pencil','Handcrafted Art'],['📐','Size-Based Pricing','Measured in Inches'],['🖼️','Canvas Options','Normal · Smooth · Crystal'],['🚚','2–3 Week Delivery','Nigeria & Worldwide']].map(([icon,bold,sub])=>(
            <div key={bold} style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:20 }}>{icon}</span>
              <div><div style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>{bold}</div><div style={{ fontSize:11, color:'var(--text-muted)' }}>{sub}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED ARTWORKS */}
      <section className="reveal" style={{ padding:'100px 0' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:48, flexWrap:'wrap', gap:16 }}>
            <div><SectionTag>Portfolio</SectionTag><h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(32px,4vw,52px)' }}>Featured <span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>Artworks</span></h2></div>
            <Link href="/Home/workdone1.jpeg" style={{ padding:'12px 24px', fontSize:12, letterSpacing:'0.12em', textTransform:'uppercase', border:'1px solid var(--border-color)', color:'var(--text-secondary)' }}>Full Gallery →</Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2 }} className="art-grid">
            {mockArtworks.filter(a=>a.featured).slice(0,5).map((art,i)=>(
              <Link key={art.id} href="/gallery" style={{ gridRow:i===0?'span 2':undefined, display:'block' }}>
                <div className="card-hover" style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', height:i===0?'100%':undefined, minHeight:i===0?460:200, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
                  <img src={i % 2 === 0 ? '/Home/workdone1.jpeg' : '/Home/workdone2.jpeg'} alt={art.title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(to top,rgba(15,14,12,0.95) 0%,transparent 70%)', padding:'20px 18px 18px' }}>
                    <div style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:i===0?22:17, fontWeight:500 }}>{art.title}</div>
                    <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold-light)', marginTop:3 }}>{art.medium} · {art.size}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:860px){.art-grid{grid-template-columns:1fr 1fr!important;}}`}</style>
      </section>

      {/* CUSTOM ARTWORK PREVIEW */}
      <section className="reveal" style={{ padding:'80px 0', background:'var(--bg-card)', borderTop:'1px solid var(--border-color)', borderBottom:'1px solid var(--border-color)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }} className="svc-grid">
            <div>
              <SectionTag>Service 01</SectionTag>
              <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(32px,4vw,52px)', marginBottom:20 }}>Custom <span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>Artwork</span></h2>
              <p style={{ color:'var(--text-secondary)', lineHeight:1.9, marginBottom:28, fontSize:15 }}>Hand-sketched in charcoal or pencil from your photos. Choose the size (in inches), canvas type, frame style, and glass finish.</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:32 }}>
                {[['📐 Sizes','12×16 to 36×48"'],['🎨 Canvas','Normal, Smooth, Crystal'],['🖼️ Frames','Small → Premium'],['🧊 Glass','2mm or 3mm']].map(([l,v])=>(
                  <div key={l} style={{ background:'var(--bg-dark)', border:'1px solid var(--border-color)', padding:'12px 14px' }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)', marginBottom:3 }}>{l}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{v}</div>
                  </div>
                ))}
              </div>
              <Link href="/custom-artwork" style={{ display:'inline-flex', padding:'14px 28px', fontSize:12, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', background:'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color:'var(--text-on-gold)' }}>Start Customising →</Link>
            </div>
            <div style={{ height:380, background:'var(--bg-dark)', border:'1px solid var(--border-color)', overflow:'hidden' }}>
              <img src="/Home/workdone1.jpeg" alt="Custom artwork sample" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
            </div>
          </div>
        </div>
        <style>{`@media(max-width:860px){.svc-grid{grid-template-columns:1fr!important;}}`}</style>
      </section>

      {/* PHOTO ENLARGEMENT PREVIEW */}
      <section className="reveal" style={{ padding:'80px 0', borderBottom:'1px solid var(--border-color)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }} className="enl-grid">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:2, position:'relative', height:300 }}>
              <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8, color:'var(--text-muted)', fontSize:11, position:'relative', overflow:'hidden' }}>
                <img src="/Home/workdone2.jpeg" alt="Before enlargement" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                <span style={{ position:'absolute', left:10, bottom:10, background:'rgba(0,0,0,0.55)', border:'1px solid var(--border-color)', padding:'6px 10px', letterSpacing:'0.1em', textTransform:'uppercase' }}>Before</span>
              </div>
              <div style={{ background:'var(--bg-card)', border:'1px solid var(--gold-dark)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8, overflow:'hidden', position:'relative' }}>
                <img src="/Home/workdone1.jpeg" alt="After enlargement" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                <span style={{ position:'absolute', left:10, bottom:10, background:'rgba(0,0,0,0.55)', border:'1px solid var(--gold-dark)', padding:'6px 10px', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold-light)' }}>After</span>
              </div>
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:28, height:28, background:'var(--gold-primary)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'var(--text-on-gold)', fontWeight:700, zIndex:2 }}>→</div>
            </div>
            <div>
              <SectionTag>Service 02</SectionTag>
              <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(32px,4vw,52px)', marginBottom:20 }}>Photo <span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>Enlargements</span></h2>
              <p style={{ color:'var(--text-secondary)', lineHeight:1.9, marginBottom:28, fontSize:15 }}>Upload any photo and we transform it into a large-format artwork. Same canvas, frame, and glass options. 1–2 week turnaround.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:32 }}>
                {['Upload your photo to begin','Select size, canvas, frame & glass','Receive your large-format artwork','1–2 week delivery turnaround'].map((s,i)=>(
                  <div key={s} style={{ display:'flex', alignItems:'center', gap:12, fontSize:14, color:'var(--text-secondary)' }}>
                    <span style={{ width:22, height:22, borderRadius:'50%', background:'rgba(184,134,11,0.15)', border:'1px solid var(--gold-dark)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'var(--gold-light)', flexShrink:0 }}>{i+1}</span>{s}
                  </div>
                ))}
              </div>
              <Link href="/photo-enlarge" style={{ display:'inline-flex', padding:'14px 28px', fontSize:12, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', border:'1px solid var(--border-color)', color:'var(--text-secondary)' }}>Upload Your Photo →</Link>
            </div>
          </div>
        </div>
        <style>{`@media(max-width:860px){.enl-grid{grid-template-columns:1fr!important;}}`}</style>
      </section>

      {/* STORE */}
      <section className="reveal" style={{ padding:'100px 0', borderBottom:'1px solid var(--border-color)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:48, flexWrap:'wrap', gap:16 }}>
            <div><SectionTag>Store</SectionTag><h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(32px,4vw,52px)' }}>Art Products <span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>&amp; Prints</span></h2></div>
            <Link href="/store" style={{ padding:'12px 24px', fontSize:12, letterSpacing:'0.12em', textTransform:'uppercase', border:'1px solid var(--border-color)', color:'var(--text-secondary)' }}>Shop All →</Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }} className="products-grid">
            {mockProducts.filter(p=>p.featured).slice(0,4).map(p=><ProductCard key={p.id} product={p}/>)}
          </div>
        </div>
        <style>{`@media(max-width:1024px){.products-grid{grid-template-columns:repeat(2,1fr)!important;}}@media(max-width:540px){.products-grid{grid-template-columns:1fr!important;}}`}</style>
      </section>

      {/* HOW IT WORKS */}
      <section className="reveal" style={{ padding:'100px 0', background:'var(--bg-card)', borderBottom:'1px solid var(--border-color)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}><SectionTag center>Process</SectionTag><h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(32px,4vw,52px)' }}>How Ordering <span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>Works</span></h2></div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, background:'var(--border-color)' }} className="steps-grid">
            {[{n:'01',icon:'📐',t:'Choose Size & Options',d:'Select size in inches, canvas type, frame, and glass finish.'},{n:'02',icon:'📸',t:'Upload Your Photo',d:'Send a clear, high-resolution photo of your subject.'},{n:'03',icon:'✏️',t:'Art Gets Created',d:'Big Ed draws your portrait by hand with progress updates.'},{n:'04',icon:'📦',t:'Delivered to You',d:'Carefully packaged and shipped. Physical or digital delivery.'}].map(s=>(
              <div key={s.n} style={{ background:'var(--bg-card)', padding:'36px 24px', position:'relative' }}>
                <div style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:64, fontWeight:700, color:'var(--border-color)', lineHeight:1, position:'absolute', top:16, right:16, userSelect:'none' }}>{s.n}</div>
                <span style={{ fontSize:26, display:'block', marginBottom:14 }}>{s.icon}</span>
                <div style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:19, marginBottom:8 }}>{s.t}</div>
                <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.8 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:860px){.steps-grid{grid-template-columns:1fr 1fr!important;}}@media(max-width:540px){.steps-grid{grid-template-columns:1fr!important;}}`}</style>
      </section>

      {/* TESTIMONIALS */}
      <section className="reveal" style={{ padding:'100px 0', borderBottom:'1px solid var(--border-color)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}><SectionTag center>Clients</SectionTag><h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(32px,4vw,52px)' }}>What Clients <span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>Say</span></h2></div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'var(--border-color)' }} className="t-grid">
            {mockTestimonials.slice(0,3).map(t=>(
              <div key={t.id} style={{ background:'var(--bg-dark)', padding:'36px 28px' }}>
                <StarRating productId={`t-${t.id}`} initialRating={t.rating} readonly size={14}/>
                <p style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:18, fontStyle:'italic', color:'var(--text-secondary)', lineHeight:1.7, margin:'18px 0 22px' }}>"{t.text}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:38, height:38, borderRadius:'50%', background:'var(--bg-card)', border:'1px solid var(--border-color)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'"Cormorant Garamond",serif', fontSize:17, color:'var(--gold-light)', flexShrink:0 }}>{t.name[0]}</div>
                  <div><div style={{ fontSize:13, fontWeight:500 }}>{t.name}</div><div style={{ fontSize:11, color:'var(--text-muted)' }}>{t.location}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:860px){.t-grid{grid-template-columns:1fr!important;}}`}</style>
      </section>

      {/* CTA */}
      <section className="reveal" style={{ padding:'140px 0', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'var(--section-gradient)' }}/>
        <div style={{ maxWidth:560, margin:'0 auto', padding:'0 24px', position:'relative' }}>
          <GoldLine/>
          <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(40px,6vw,68px)', marginBottom:20, marginTop:24 }}>Ready to Create<br/>Something <em style={{ color:'var(--gold-light)' }}>Timeless?</em></h2>
          <p style={{ color:'var(--text-secondary)', marginBottom:40, lineHeight:1.85, fontSize:16 }}>Commission a hand-drawn portrait and preserve your most cherished moments forever.</p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/custom-artwork" style={{ padding:'16px 32px', fontSize:13, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', background:'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color:'var(--text-on-gold)' }}>Order Custom Artwork</Link>
            <Link href="/store" style={{ padding:'16px 24px', fontSize:13, letterSpacing:'0.12em', textTransform:'uppercase', border:'1px solid var(--border-color)', color:'var(--text-secondary)' }}>Browse Store</Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
