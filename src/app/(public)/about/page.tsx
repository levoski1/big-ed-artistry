'use client'
import PublicLayout from '@/components/layout/PublicLayout'
import { SectionTag, GoldLine } from '@/components/ui'
import { mockTestimonials } from '@/lib/mockData'
import Link from 'next/link'
import Image from 'next/image'
import StarRating from '@/components/ui/StarRating'
import { useTheme } from '@/context/ThemeContext'

export default function AboutPage() {
  const { isDark } = useTheme()

  return (
    <PublicLayout>
      {/* Hero */}
      <section style={{ padding:'160px 0 100px', position:'relative', overflow:'hidden', borderBottom:'1px solid var(--border-color)' }}>
        <div style={{ position:'absolute', inset:0, background:'var(--section-gradient)' }}/>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }} className="about-hero-grid">
          <div style={{ position:'relative', zIndex:1 }}>
            <SectionTag>The Artist</SectionTag>
            <h1 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(48px,6vw,76px)', fontWeight:500, lineHeight:1.1, marginBottom:28 }}>
              Passion Born in<br/><span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>Every Stroke</span>
            </h1>
            <blockquote style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:21, fontStyle:'italic', color:'var(--text-secondary)', lineHeight:1.65, borderLeft:'2px solid var(--gold-primary)', paddingLeft:24, marginBottom:32 }}>
              "Art is how I translate emotion into something you can hold and treasure forever."
            </blockquote>
            <p style={{ color:'var(--text-secondary)', lineHeight:1.9, fontSize:15 }}>
              Big Ed is a Nigerian charcoal and pencil artist based in Port Harcourt, Rivers State. Over 7 years of dedicated practice have shaped a distinctive style — detailed, emotive, and handcrafted without exception.
            </p>
          </div>
          <div style={{ position:'relative' }}>
            <div style={{ background:isDark ? '#FFFFFF' : 'var(--bg-card)', border:'1px solid var(--border-color)', aspectRatio:'3/4', position:'relative', overflow:'hidden', padding:'24px' }}>
              <Image src="/logo/biged_logo.png" alt="Big Ed logo" fill style={{ objectFit:'contain' }} />
            </div>
            <div style={{ position:'absolute', bottom:-20, left:-20, background:'var(--bg-card)', border:'1px solid var(--gold-primary)', padding:'18px 22px' }}>
              <div style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:32, color:'var(--gold-light)' }}>500+</div>
              <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)' }}>Artworks Completed</div>
            </div>
          </div>
        </div>
        <style>{`@media(max-width:900px){.about-hero-grid{grid-template-columns:1fr!important;}}`}</style>
      </section>

      {/* Story */}
      <section style={{ padding:'100px 0', borderBottom:'1px solid var(--border-color)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:64, alignItems:'start' }} className="story-grid">
            <div>
              <SectionTag>His Story</SectionTag>
              <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(32px,4vw,48px)' }}>
                7 Years,<br/><span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>One Craft</span>
              </h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }} className="story-content">
              {[
                { year:'2017', title:'First Commission', desc:'Big Ed drew his first commissioned portrait — a pencil sketch for a family in Port Harcourt. The response changed everything. Word spread quickly, and the commissions began to grow.' },
                { year:'2019', title:'Mastering Charcoal', desc:'After two years of pencil work, Big Ed invested deeply in charcoal — a demanding medium that rewards precision and patience. Charcoal gave his portraits their trademark depth.' },
                { year:'2021', title:'Photo Enlargements', desc:'Clients began asking for their photographs to be transformed into wall art. Big Ed developed a process for recreating photos as large-format artworks with full canvas and frame options.' },
                { year:'2024', title:'500+ Artworks', desc:'Over 500 completed commissions delivered across Nigeria, the UK, the USA, and Ghana. Each one hand-drawn, individually packaged, and delivered with care.' },
              ].map(item => (
                <div key={item.year} style={{ padding:'24px', background:'var(--bg-card)', border:'1px solid var(--border-color)' }}>
                  <div style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:36, color:'var(--gold-primary)', lineHeight:1, marginBottom:8 }}>{item.year}</div>
                  <div style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:20, marginBottom:10 }}>{item.title}</div>
                  <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.8 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <style>{`@media(max-width:900px){.story-grid{grid-template-columns:1fr!important;}.story-content{grid-template-columns:1fr!important;}}`}</style>
      </section>

      {/* Philosophy */}
      <section style={{ padding:'100px 0', borderBottom:'1px solid var(--border-color)', background:'var(--bg-card)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <SectionTag center>Approach</SectionTag>
            <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(36px,4vw,52px)' }}>The Philosophy</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'var(--border-color)' }} className="phil-grid">
            {[
              { icon:'✏️', t:'Everything by Hand', d:'No digital shortcuts. Every portrait is drawn line-by-line in charcoal or pencil. What you receive is genuinely handcrafted art.' },
              { icon:'🔍', t:'Reference Matters', d:'The better the reference photo, the richer the detail. Big Ed works closely with clients to ensure the source material captures the subject at their best.' },
              { icon:'📦', t:'Presentation Counts', d:'Artwork is carefully rolled or frame-mounted and packed to survive shipping. Delivery is treated as part of the artwork experience.' },
            ].map(p => (
              <div key={p.t} style={{ background:'var(--bg-dark)', padding:'44px 32px' }}>
                <span style={{ fontSize:28, display:'block', marginBottom:20 }}>{p.icon}</span>
                <div style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:24, marginBottom:12 }}>{p.t}</div>
                <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.9 }}>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:860px){.phil-grid{grid-template-columns:1fr!important;}}`}</style>
      </section>

      {/* Testimonials */}
      <section style={{ padding:'100px 0', borderBottom:'1px solid var(--border-color)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <SectionTag center>Reviews</SectionTag>
            <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(36px,4vw,52px)' }}>
              Client <span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>Voices</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'var(--border-color)' }} className="test-grid">
            {mockTestimonials.map(t => (
              <div key={t.id} style={{ background:'var(--bg-dark)', padding:'36px 28px' }}>
                <StarRating productId={`about-${t.id}`} initialRating={t.rating} readonly size={14}/>
                <p style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:18, fontStyle:'italic', color:'var(--text-secondary)', lineHeight:1.7, margin:'18px 0 22px' }}>"{t.text}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:38, height:38, borderRadius:'50%', background:'var(--bg-card)', border:'1px solid var(--border-color)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'"Cormorant Garamond",serif', fontSize:17, color:'var(--gold-light)', flexShrink:0 }}>{t.name[0]}</div>
                  <div><div style={{ fontSize:13, fontWeight:500 }}>{t.name}</div><div style={{ fontSize:11, color:'var(--text-muted)' }}>{t.location}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:860px){.test-grid{grid-template-columns:1fr!important;}}`}</style>
      </section>

      {/* CTA */}
      <section style={{ padding:'120px 0', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'var(--section-gradient)' }}/>
        <div style={{ maxWidth:520, margin:'0 auto', padding:'0 24px', position:'relative' }}>
          <GoldLine/>
          <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(40px,5vw,60px)', marginBottom:20, marginTop:28 }}>Commission<br/><em style={{ color:'var(--gold-light)' }}>Your Portrait</em></h2>
          <p style={{ color:'var(--text-secondary)', marginBottom:36, lineHeight:1.85, fontSize:16 }}>Work directly with Big Ed to create something that will last a lifetime.</p>
          <Link href="/custom-artwork" style={{ padding:'16px 36px', fontSize:13, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', background:'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color:'var(--text-on-gold)', display:'inline-block' }}>Get Started →</Link>
        </div>
      </section>
    </PublicLayout>
  )
}
