'use client'
import { useState } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'
import { SectionTag, GoldLine } from '@/components/ui'
import { sizeOptions, canvasOptions, frameOptions, glassOptions } from '@/lib/customArtwork'

type ServiceTab = 'Sizes' | 'Canvas' | 'Frames' | 'Glass'
const SERVICE_TABS: ServiceTab[] = ['Sizes','Canvas','Frames','Glass']

const canvasPreviewMap: Record<string, string> = {
  normal: '/canvas/normal_canvas.jpeg',
  smooth: '/canvas/smooth_canvas.jpeg',
  crystal: '/canvas/crystal_canvas.jpeg',
}

const framePreviewMap: Record<string, string> = {
  small: '/Frame/small_frame.jpeg',
  medium: '/Frame/medium_frame.jpeg',
  large: '/Frame/large_frame.jpeg',
  frameless: '/Frame/frameless_canvas1.jpeg',
  premium: '/Frame/premium_frame.jpeg',
}

const glassPreviewMap: Record<string, string> = {
  '2mm': '/Glass/mm2.jpeg',
  '3mm': '/Glass/mm3.jpeg',
}

export default function ServicesPage() {
  const [artTab, setArtTab] = useState<ServiceTab>('Sizes')
  const [mockPhoto, setMockPhoto] = useState(false)

  return (
    <PublicLayout>
      {/* Page intro */}
      <section style={{ paddingTop:140, paddingBottom:80, borderBottom:'1px solid var(--border-color)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'var(--section-gradient)' }}/>
        <div style={{ maxWidth:860, margin:'0 auto', padding:'0 24px', textAlign:'center', position:'relative' }}>
          <SectionTag center>What We Offer</SectionTag>
          <h1 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(48px,6vw,80px)', marginBottom:20 }}>
            Our <span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>Services</span>
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:16, lineHeight:1.9 }}>
            Bringing your memories and ideas to life through handcrafted charcoal art and premium finishing. Every piece is drawn by Big Ed himself — no prints of prints, no digital shortcuts.
          </p>
        </div>
      </section>

      {/* ── SERVICE 1: CUSTOM ARTWORK ── */}
      <section style={{ padding:'100px 0', borderBottom:'1px solid var(--border-color)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'start' }} className="svc1-grid">
            {/* Text */}
            <div>
              <SectionTag>Service 01</SectionTag>
              <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(36px,4vw,56px)', marginBottom:20 }}>
                Custom <span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>Artwork</span>
              </h2>
              <p style={{ color:'var(--text-secondary)', lineHeight:1.9, marginBottom:24, fontSize:15 }}>
                Each artwork is hand-sketched in charcoal or pencil directly from your photo. There are no digital filters — every line, shadow, and highlight is drawn by hand. Artworks are measured in inches, and pricing is based on the area of the piece.
              </p>
              <div style={{ marginBottom:28 }}>
                <div style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:12 }}>You Can Customise</div>
                {[['Canvas','Normal, Smooth, or Crystal finish'],['Frame','Small, Medium, Large, Frameless, or Premium'],['Glass','2mm or 3mm protective glass'],['Write-up','Add a personal message or occasion tag']].map(([l,d])=>(
                  <div key={l} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border-color)' }}>
                    <span style={{ color:'var(--gold-primary)', fontSize:13, flexShrink:0 }}>—</span>
                    <div><span style={{ fontSize:13, fontWeight:500 }}>{l}</span><span style={{ fontSize:13, color:'var(--text-secondary)' }}> · {d}</span></div>
                  </div>
                ))}
              </div>
              <Link href="/custom-artwork" style={{ display:'inline-flex', padding:'14px 28px', fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', background:'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color:'var(--text-on-gold)' }}>
                Start Customising →
              </Link>
            </div>

            {/* Interactive tabs */}
            <div>
              <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border-color)', marginBottom:24 }}>
                {SERVICE_TABS.map(tab => (
                  <button key={tab} onClick={() => setArtTab(tab)} style={{ padding:'11px 20px', fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', background:'none', border:'none', borderBottom:artTab===tab?'2px solid var(--gold-primary)':'2px solid transparent', color:artTab===tab?'var(--gold-light)':'var(--text-secondary)', cursor:'pointer', fontFamily:'"Libre Franklin",sans-serif', marginBottom:'-1px', transition:'all 0.2s' }}>
                    {tab}
                  </button>
                ))}
              </div>

              {artTab === 'Sizes' && (
                <div>
                  <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:16, lineHeight:1.7 }}>Sizes are measured in inches (width × height). Pricing is based on area — larger canvases cost more per unit.</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {sizeOptions.map(s => (
                      <div key={s.label} style={{ background:'var(--bg-dark)', border:'1px solid var(--border-color)', padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:20 }}>{s.label}</span>
                        <span style={{ fontSize:11, color:'var(--text-muted)' }}>Area: {s.width*s.height} in²</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {artTab === 'Canvas' && (
                <div>
                  <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:16, lineHeight:1.7 }}>The canvas affects texture and finish. Crystal gives the most polished look; Normal is traditional.</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {canvasOptions.map(c => (
                      <div key={c.id} style={{ overflow:'hidden', border:'1px solid var(--border-color)' }}>
                        <div style={{ height:80, background:c.preview, backgroundSize:'cover', position:'relative' }}>
                          {canvasPreviewMap[c.id] && (
                            <img src={canvasPreviewMap[c.id]} alt={`${c.name} canvas`} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                          )}
                        </div>
                        <div style={{ padding:'10px 12px', background:'var(--bg-dark)' }}>
                          <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{c.name}</div>
                          <div style={{ fontSize:11, color:'var(--text-muted)' }}>{c.id==='none'?'No canvas':'Rate: ×'+c.rate+'/in²'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {artTab === 'Frames' && (
                <div>
                  <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:16, lineHeight:1.7 }}>Frame size affects the border width and material. Note: Large and Premium frames are not available for small sizes (12×16, 16×20).</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {frameOptions.map(f => (
                      <div key={f.id} style={{ overflow:'hidden', border:'1px solid var(--border-color)' }}>
                        <div style={{ height:70, background:f.preview, backgroundSize:'cover', position:'relative' }}>
                          {framePreviewMap[f.id] && (
                            <img src={framePreviewMap[f.id]} alt={`${f.name} frame`} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                          )}
                        </div>
                        <div style={{ padding:'10px 12px', background:'var(--bg-dark)' }}>
                          <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{f.name}</div>
                          <div style={{ fontSize:11, color:'var(--text-muted)' }}>{f.id==='none'?'No frame':'Rate: ×'+f.rate+'/in²'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {artTab === 'Glass' && (
                <div>
                  <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:16, lineHeight:1.7 }}>Glass protects your artwork from dust and moisture. 3mm offers stronger protection; 2mm is standard.</p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                    {glassOptions.map(g => (
                      <div key={g.id} style={{ overflow:'hidden', border:'1px solid var(--border-color)' }}>
                        <div style={{ height:80, background:g.preview, backgroundSize:'cover', position:'relative' }}>
                          {glassPreviewMap[g.id] && (
                            <img src={glassPreviewMap[g.id]} alt={`${g.name} glass`} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                          )}
                        </div>
                        <div style={{ padding:'10px 12px', background:'var(--bg-dark)' }}>
                          <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{g.name}</div>
                          <div style={{ fontSize:11, color:'var(--text-muted)' }}>{g.id==='none'?'No glass':'Rate: ×'+g.rate+'/in²'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <style>{`@media(max-width:900px){.svc1-grid{grid-template-columns:1fr!important;}}`}</style>
      </section>

      {/* ── SERVICE 2: PHOTO ENLARGEMENT ── */}
      <section style={{ padding:'100px 0', borderBottom:'1px solid var(--border-color)', background:'var(--bg-card)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }} className="svc2-grid">
            {/* Interactive upload mock */}
            <div>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:10 }}>Preview Transformation</div>
                <div style={{ display:'flex', gap:10, marginBottom:16 }}>
                  {(['Before','After'] as const).map(label => (
                    <button key={label} onClick={() => setMockPhoto(label==='After')} style={{ flex:1, padding:'10px', fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', background:((label==='After')===mockPhoto)?'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))':'var(--bg-dark)', color:((label==='After')===mockPhoto)?'var(--text-on-gold)':'var(--text-secondary)', border:((label==='After')===mockPhoto)?'none':'1px solid var(--border-color)', cursor:'pointer', fontFamily:'"Libre Franklin",sans-serif' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ height:320, background:mockPhoto?'var(--bg-card)':'var(--bg-dark)', border:`1px solid ${mockPhoto?'var(--gold-dark)':'var(--border-color)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12, position:'relative', overflow:'hidden', transition:'all 0.4s' }}>
                {mockPhoto ? (
                  <>
                    <img src="/Home/workdone1.jpeg" alt="After enlargement" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                    <div style={{ position:'absolute', left:12, bottom:12, background:'rgba(0,0,0,0.55)', border:'1px solid var(--gold-dark)', padding:'8px 10px' }}>
                      <span style={{ fontSize:11, color:'var(--gold-light)', letterSpacing:'0.1em', textTransform:'uppercase' }}>After</span>
                    </div>
                  </>
                ) : (
                  <>
                    <img src="/Home/workdone2.jpeg" alt="Before enlargement" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                    <div style={{ position:'absolute', left:12, bottom:12, background:'rgba(0,0,0,0.55)', border:'1px solid var(--border-color)', padding:'8px 10px' }}>
                      <span style={{ fontSize:11, color:'var(--text-secondary)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Before</span>
                    </div>
                  </>
                )}
              </div>
              <div style={{ marginTop:12, textAlign:'center', fontSize:11, color:'var(--text-muted)' }}>Toggle to see the transformation</div>
            </div>

            {/* Text */}
            <div>
              <SectionTag>Service 02</SectionTag>
              <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(36px,4vw,56px)', marginBottom:20 }}>
                Photo <span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>Enlargements</span>
              </h2>
              <p style={{ color:'var(--text-secondary)', lineHeight:1.9, marginBottom:24, fontSize:15 }}>
                Upload your favourite photo and we recreate it as a large-format artwork. The same customisation options as Custom Artwork apply — canvas, frame, and glass — but the starting point is your photograph.
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:28 }}>
                {[['📸 Upload-First','Start with your photo, then configure finish options'],['⚡ Faster Turnaround','1–2 weeks vs the standard 2–3 weeks'],['🖼️ Same Options','Canvas, Frame, and Glass apply identically'],['📦 Delivered','Physical artwork shipped to your door']].map(([t,d])=>(
                  <div key={t} style={{ background:'var(--bg-dark)', border:'1px solid var(--border-color)', padding:'14px 16px' }}>
                    <div style={{ fontSize:12, fontWeight:600, marginBottom:4 }}>{t}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>{d}</div>
                  </div>
                ))}
              </div>
              <Link href="/photo-enlarge" style={{ display:'inline-flex', padding:'14px 28px', fontSize:12, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', border:'1px solid var(--border-color)', color:'var(--text-secondary)', transition:'all 0.3s' }}>
                Upload Your Photo →
              </Link>
            </div>
          </div>
        </div>
        <style>{`@media(max-width:900px){.svc2-grid{grid-template-columns:1fr!important;}}`}</style>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding:'100px 0', borderBottom:'1px solid var(--border-color)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <SectionTag center>Process</SectionTag>
            <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(36px,4vw,56px)' }}>
              How It <span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>Works</span>
            </h2>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:1, background:'var(--border-color)' }}>
            {[
              { n:'01', icon:'🎨', t:'Choose Your Service', d:'Select Custom Artwork (hand-drawn from scratch) or Photo Enlargement (based on your uploaded photo).' },
              { n:'02', icon:'📐', t:'Configure Your Options', d:'Pick your artwork size in inches. Then choose canvas type (Normal, Smooth, or Crystal), frame style, and glass thickness.' },
              { n:'03', icon:'📸', t:'Upload Your Image', d:'For Photo Enlargement, upload a clear high-resolution photo. For Custom Artwork, provide a reference image for Big Ed to work from.' },
              { n:'04', icon:'✏️', t:'Add Write-up (Optional)', d:'Include a personal message, caption, or select an occasion (Birthday, Wedding, Memorial, etc.) for the artwork.' },
              { n:'05', icon:'💳', t:'Review Price & Pay', d:'View your full price breakdown — base, canvas, frame, glass, and delivery. Choose full payment or a 50% deposit.' },
              { n:'06', icon:'🚚', t:'Enter Delivery Details', d:'Provide your address and nearest bus stop. Delivery fees: Port Harcourt ₦2,000 · Rivers State ₦5,000 · Outside Rivers ₦10,000.' },
              { n:'07', icon:'📦', t:'Artwork Created & Delivered', d:'Big Ed begins work after payment confirmation. You receive progress updates. Delivery within 1–3 weeks depending on service.' },
            ].map(step => (
              <div key={step.n} style={{ background:'var(--bg-dark)', padding:'28px 32px', display:'grid', gridTemplateColumns:'auto 1fr', gap:24, alignItems:'center' }} className="step-row">
                <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                  <div style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:48, fontWeight:700, color:'var(--border-color)', lineHeight:1, userSelect:'none', minWidth:56, textAlign:'center' }}>{step.n}</div>
                  <span style={{ fontSize:28 }}>{step.icon}</span>
                </div>
                <div>
                  <div style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:22, marginBottom:6 }}>{step.t}</div>
                  <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.8 }}>{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:640px){.step-row{grid-template-columns:1fr!important;gap:12px!important;}}`}</style>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:'120px 0', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'var(--section-gradient)' }}/>
        <div style={{ maxWidth:560, margin:'0 auto', padding:'0 24px', position:'relative' }}>
          <GoldLine/>
          <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(40px,5vw,64px)', marginBottom:20, marginTop:28 }}>
            Start Your<br/><span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>Custom Artwork</span>
          </h2>
          <p style={{ color:'var(--text-secondary)', marginBottom:40, lineHeight:1.9, fontSize:16 }}>Commission a hand-drawn charcoal or pencil portrait that tells your story.</p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/custom-artwork" style={{ padding:'16px 32px', fontSize:13, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', background:'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color:'var(--text-on-gold)' }}>Order Custom Artwork</Link>
            <Link href="/photo-enlarge" style={{ padding:'16px 24px', fontSize:13, letterSpacing:'0.12em', textTransform:'uppercase', border:'1px solid var(--border-color)', color:'var(--text-secondary)' }}>Photo Enlargement</Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
