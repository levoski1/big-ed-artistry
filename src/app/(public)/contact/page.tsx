'use client'
import { useState } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import { SectionTag } from '@/components/ui'
import { FaFacebookF, FaWhatsapp } from 'react-icons/fa'
import { SiTiktok } from 'react-icons/si'

export default function ContactPage() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', service:'', message:'' })
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<Record<string,string>>({})

  const inputStyle = { width:'100%', background:'var(--bg-dark)', border:'1px solid var(--border-color)', padding:'13px 16px', color:'var(--text-primary)', fontFamily:'"Libre Franklin",sans-serif', fontSize:14, outline:'none', transition:'border-color 0.2s' }
  const labelStyle: React.CSSProperties = { fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:8, display:'block' }

  const validate = () => {
    const e: Record<string,string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    if (!form.message.trim()) e.message = 'Message is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (validate()) setSent(true)
  }

  if (sent) return (
    <PublicLayout>
      <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center', maxWidth:480, padding:'0 24px' }}>
          <div style={{ fontSize:52, marginBottom:20 }}>✦</div>
          <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:48, marginBottom:14 }}>Message <span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>Sent</span></h2>
          <p style={{ color:'var(--text-secondary)', lineHeight:1.85, marginBottom:10 }}>Thank you, {form.name}! Big Ed will respond to your message within 24 hours.</p>
          <p style={{ color:'var(--text-secondary)', lineHeight:1.85, marginBottom:32, fontSize:14 }}>Check your inbox at <strong style={{ color:'var(--text-primary)' }}>{form.email}</strong>.</p>
          <button onClick={() => { setSent(false); setForm({ name:'', email:'', phone:'', service:'', message:'' }) }} style={{ padding:'14px 28px', fontSize:12, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', background:'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color:'var(--text-on-gold)', border:'none', cursor:'pointer', fontFamily:'"Libre Franklin",sans-serif' }}>Send Another Message</button>
        </div>
      </div>
    </PublicLayout>
  )

  return (
    <PublicLayout>
      {/* Hero */}
      <section style={{ paddingTop:140, paddingBottom:60, borderBottom:'1px solid var(--border-color)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'var(--section-gradient)' }}/>
        <div style={{ textAlign:'center', maxWidth:600, margin:'0 auto', padding:'0 24px', position:'relative' }}>
          <SectionTag center>Get in Touch</SectionTag>
          <h1 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(48px,6vw,72px)', marginBottom:20 }}>
            Let's Create <span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>Together</span>
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:16, lineHeight:1.9 }}>
            Have a portrait in mind? Ready to place an order? Big Ed responds to every message within 24 hours.
          </p>
        </div>
      </section>

      <section style={{ padding:'80px 0 120px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'start' }} className="contact-grid">

            {/* Form */}
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', padding:'40px 36px' }}>
              <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:32, marginBottom:28 }}>Send a Message</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input style={{ ...inputStyle, borderColor: errors.name ? 'var(--danger)' : 'var(--border-color)' }} placeholder="Your name" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}/>
                    {errors.name && <div style={{ fontSize:11, color:'var(--danger)', marginTop:4 }}>{errors.name}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address *</label>
                    <input style={{ ...inputStyle, borderColor: errors.email ? 'var(--danger)' : 'var(--border-color)' }} type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))}/>
                    {errors.email && <div style={{ fontSize:11, color:'var(--danger)', marginTop:4 }}>{errors.email}</div>}
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div>
                    <label style={labelStyle}>Phone / WhatsApp</label>
                    <input style={inputStyle} placeholder="+234 800 000 0000" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))}/>
                  </div>
                  <div>
                    <label style={labelStyle}>I'm Interested In</label>
                    <select style={{ ...inputStyle, appearance:'none', cursor:'pointer' }} value={form.service} onChange={e => setForm(f=>({...f,service:e.target.value}))}>
                      <option value="">Select a service</option>
                      <option value="custom">Custom Artwork</option>
                      <option value="enlarge">Photo Enlargement</option>
                      <option value="store">Store / Products</option>
                      <option value="other">General Enquiry</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Message *</label>
                  <textarea style={{ ...inputStyle, resize:'none', minHeight:140, borderColor: errors.message ? 'var(--danger)' : 'var(--border-color)' }} placeholder="Describe your vision — occasion, subject, size, timeline, anything that would help Big Ed understand your request…" value={form.message} onChange={e => setForm(f=>({...f,message:e.target.value}))}/>
                  {errors.message && <div style={{ fontSize:11, color:'var(--danger)', marginTop:4 }}>{errors.message}</div>}
                </div>
                <button onClick={handleSubmit} style={{ padding:'15px', fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', background:'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color:'var(--text-on-gold)', border:'none', cursor:'pointer', fontFamily:'"Libre Franklin",sans-serif' }}>
                  Send Message →
                </button>
              </div>
            </div>

            {/* Info */}
            <div>
              <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:32, marginBottom:28 }}>Contact Details</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:1, background:'var(--border-color)', marginBottom:32 }}>
                {[
                  { icon:'📍', label:'Location', value:'Port Harcourt, Rivers State, Nigeria' },
                  { icon:'📱', label:'WhatsApp', value:'+234 800 000 0000 (placeholder)' },
                  { icon:'📧', label:'Email', value:'hello@bigedartistry.com (placeholder)' },
                  { icon:'⏱', label:'Response Time', value:'Within 24 hours of your message' },
                ].map(item => (
                  <div key={item.label} style={{ background:'var(--bg-card)', padding:'20px 24px', display:'flex', gap:16, alignItems:'flex-start' }}>
                    <span style={{ fontSize:20, flexShrink:0 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:3 }}>{item.label}</div>
                      <div style={{ fontSize:14, color:'var(--text-primary)' }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Media */}
              <div style={{ marginBottom:32 }}>
                <h3 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:24, marginBottom:16 }}>Follow Big Ed</h3>
                <div style={{ display:'flex', gap:12 }}>
                  {[
                    { icon: <SiTiktok />, href: 'https://www.tiktok.com/@big_ed_001?_r=1&_t=ZS-94yuIxdKHOG', label: 'TikTok' },
                    { icon: <FaFacebookF />, href: 'https://www.facebook.com/share/17CbeP583L/', label: 'Facebook' },
                    { icon: <FaWhatsapp />, href: 'https://wa.link/7o6g5r', label: 'WhatsApp' }
                  ].map(({ icon, href, label }, index) => (
                    <a key={index} href={href} target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--gold-light)', transition: 'all 0.3s', textDecoration: 'none' }} title={label}>
                      {icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* FAQ */}
              <div>
                <h3 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:24, marginBottom:16 }}>Common Questions</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:1, background:'var(--border-color)' }}>
                  {[
                    ['How long does a portrait take?', '2–3 weeks for Custom Artwork; 1–2 weeks for Photo Enlargements.'],
                    ['Can I request a specific size?', 'Yes — sizes range from 12×16" to 36×48". Larger custom sizes can be discussed.'],
                    ['Is a 50% deposit required?', 'Yes, work begins after payment confirmation. Balance is due on delivery.'],
                    ['Do you ship internationally?', 'Yes — deliveries outside Rivers State have an additional shipping fee.'],
                  ].map(([q,a]) => (
                    <div key={q} style={{ background:'var(--bg-dark)', padding:'18px 22px' }}>
                      <div style={{ fontSize:13, fontWeight:500, marginBottom:6, color:'var(--text-primary)' }}>{q}</div>
                      <div style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.7 }}>{a}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <style>{`@media(max-width:900px){.contact-grid{grid-template-columns:1fr!important;}}`}</style>
    </PublicLayout>
  )
}
