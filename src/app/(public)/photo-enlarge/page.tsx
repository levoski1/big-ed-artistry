'use client'
import { useEffect, useMemo, useState, type DragEvent } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'
import { formatPrice } from '@/lib/tokens'
import { useCart } from '@/context/CartContext'
import { calculateTotal, canvasOptions, frameOptions, glassOptions, sizeOptions } from '@/lib/customArtwork'

const canvasPreviewMap: Record<string, string> = { normal:'/canvas/normal_canvas.jpeg', smooth:'/canvas/smooth_canvas.jpeg', crystal:'/canvas/crystal_canvas.jpeg' }
const framePreviewMap: Record<string, string> = { small:'/Frame/small_frame.jpeg', medium:'/Frame/medium_frame.jpeg', large:'/Frame/large_frame.jpeg', frameless:'/Frame/frameless_canvas1.jpeg', premium:'/Frame/premium_frame.jpeg' }
const glassPreviewMap: Record<string, string> = { '2mm':'/Glass/mm2.jpeg', '3mm':'/Glass/mm3.jpeg' }

const fieldStyle = { width:'100%', background:'var(--bg-dark)', border:'1px solid var(--border-color)', padding:'12px 14px', color:'var(--text-primary)', fontFamily:'"Libre Franklin",sans-serif', fontSize:14, outline:'none' }

function OptionCard({ name, preview, selected, disabled, onSelect, imageUrl }: { name:string; preview:string; selected:boolean; disabled?:boolean; onSelect:()=>void; imageUrl?:string }) {
  return (
    <div onClick={() => !disabled && onSelect()} className={disabled ? '' : 'card-hover'} style={{ cursor:disabled?'not-allowed':'pointer', background:selected?'rgba(184,134,11,0.08)':'var(--bg-dark)', border:selected?'1px solid var(--gold-primary)':'1px solid var(--border-color)', opacity:disabled?0.35:1, transition:'all 0.2s', overflow:'hidden' }}>
      <div className="option-media" style={{ height:130, background:imageUrl?'var(--bg-card)':preview, backgroundSize:'cover', backgroundPosition:'center', padding:imageUrl?8:0 }}>
        {imageUrl && <img src={imageUrl} alt={name} style={{ width:'100%', height:'100%', objectFit:'contain' }} onError={e => { (e.target as HTMLImageElement).style.display='none' }}/>}
      </div>
      <div style={{ padding:'8px 10px', fontSize:12, fontWeight:selected?600:400, color:selected?'var(--gold-light)':'var(--text-secondary)', textAlign:'center' }}>{name}</div>
    </div>
  )
}

export default function PhotoEnlargePage() {
  const { addArtwork } = useCart()
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [draggingPhoto, setDraggingPhoto] = useState(false)
  const [selectedSize, setSelectedSize] = useState<(typeof sizeOptions)[number] | null>(null)
  const [area, setArea] = useState(0)
  const [canvasId, setCanvasId] = useState('none')
  const [frameId, setFrameId] = useState('none')
  const [glassId, setGlassId] = useState('none')
  const [writeUpType, setWriteUpType] = useState<'yes'|'no'>('no')
  const [customMessage, setCustomMessage] = useState('')
  const [occasion, setOccasion] = useState('Birthday')
  const [addedToCart, setAddedToCart] = useState(false)

  const canvas = canvasOptions.find(o => o.id === canvasId) ?? canvasOptions[canvasOptions.length - 1]
  const frame = frameOptions.find(o => o.id === frameId) ?? frameOptions[0]
  const glass = glassOptions.find(o => o.id === glassId) ?? glassOptions[0]

  const isCompactSize = selectedSize ? ['8 × 10','10 × 12','12 × 16','16 × 20'].includes(selectedSize.label) : false
  const isLargeSize = selectedSize ? (selectedSize.width > 15 && selectedSize.height > 20) || (selectedSize.width > 20 && selectedSize.height > 15) : false
  const frameDisabledMap = useMemo(() => {
    const d = { small:false, large:false, premium:false }
    if (isCompactSize) { d.large=true; d.premium=true }
    if (isLargeSize) d.small=true
    return d
  }, [isCompactSize, isLargeSize])

  const { basePrice, canvasPrice, framePrice, glassPrice, totalPrice } = calculateTotal(area, canvas.rate, frame.rate, glass.rate, 0)

  useEffect(() => {
    if (!photo) { setPhotoPreview(''); return }
    const url = URL.createObjectURL(photo)
    setPhotoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  useEffect(() => {
    if (frameId === 'small' && frameDisabledMap.small) setFrameId('none')
    if ((frameId === 'large' || frameId === 'premium') && (frameDisabledMap.large || frameDisabledMap.premium)) setFrameId('none')
  }, [frameDisabledMap, frameId])

  const sectionHead = (n: string, t: string) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--gold-primary)', marginBottom:6 }}>{n}</div>
      <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:28 }}>{t}</h2>
    </div>
  )

  const canAdd = Boolean(photo && selectedSize)

  const handleAddToCart = () => {
    if (!canAdd || !photo || !selectedSize) return
    addArtwork({ id:`ENL-${Date.now()}`, artworkType:'enlargement', sizeLabel:selectedSize.label, width:selectedSize.width, height:selectedSize.height, area, canvasId, canvasName:canvas.name, frameId, frameName:frame.name, glassId, glassName:glass.name, writeUpType, customMessage, occasion, imageName:photo.name, receiptName:'', address:'', phoneNumber:'', busStop:'', location:'none', paymentType:'full', basePrice, canvasPrice, framePrice, glassPrice, deliveryFee:0, totalPrice, createdAt:new Date().toISOString() })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 3000)
  }

  return (
    <PublicLayout>
      {/* HERO */}
      <section style={{ paddingTop:100, paddingBottom:60, borderBottom:'1px solid var(--border-color)', background:'var(--bg-card)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'var(--section-gradient)' }}/>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', position:'relative' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }} className="enl-hero">
            <div>
              <div style={{ fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--gold-primary)', marginBottom:12 }}>Service 02</div>
              <h1 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'clamp(40px,5vw,68px)', marginBottom:20 }}>Your Story, <span style={{ color:'var(--gold-light)', fontStyle:'italic' }}>Beautifully Brought to Life</span></h1>
              <p style={{ color:'var(--text-secondary)', lineHeight:1.9, marginBottom:32, fontSize:15 }}>Upload your favourite photo and we enlarge it into a premium wall art piece. Same canvas, frame, and glass options as Custom Artwork — but with a faster 1–2 week turnaround.</p>
              <div style={{ display:'flex', gap:32, paddingTop:20, borderTop:'1px solid var(--border-color)' }}>
                {[['📸','Upload First','Start with your photo'],['⚡','1–2 Weeks','Faster turnaround'],['🖼️','Full Custom','Canvas · Frame · Glass']].map(([icon,t,s])=>(
                  <div key={t}><span style={{ fontSize:22, display:'block', marginBottom:6 }}>{icon}</span><div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{t}</div><div style={{ fontSize:11, color:'var(--text-muted)' }}>{s}</div></div>
                ))}
              </div>
            </div>
            {/* Before / After */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:2, position:'relative', height:320 }}>
              <div style={{ background:'var(--bg-dark)', border:'1px solid var(--border-color)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8 }}>
                {photoPreview ? <img src={photoPreview} alt="Your photo" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <><span style={{ fontSize:32 }}>📸</span><span style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)' }}>Your Photo</span></>}
              </div>
              <div style={{ background:'var(--bg-card)', border:'1px solid var(--gold-dark)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8, position:'relative', overflow:'hidden' }}>
                {photoPreview ? <>
                  <img src={photoPreview} alt="Artwork preview" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'sepia(60%) contrast(1.2) brightness(0.85)' }}/>
                  <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(-45deg,rgba(184,134,11,0.08) 0,rgba(184,134,11,0.08) 1px,transparent 1px,transparent 10px)' }}/>
                  <span style={{ position:'absolute', bottom:8, right:8, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold-light)', background:'rgba(0,0,0,0.6)', padding:'3px 7px' }}>Artwork</span>
                </> : <>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ opacity:0.3 }}><circle cx="24" cy="16" r="10" stroke="#D4A84B" strokeWidth="1.5"/><path d="M6 44c0-9.941 8.059-18 18-18s18 8.059 18 18" stroke="#D4A84B" strokeWidth="1.5"/></svg>
                  <span style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold-light)' }}>Artwork Preview</span>
                  <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(-45deg,rgba(184,134,11,0.04) 0,rgba(184,134,11,0.04) 1px,transparent 1px,transparent 12px)' }}/>
                </>}
              </div>
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:30, height:30, background:'var(--gold-primary)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'var(--text-on-gold)', fontWeight:700, zIndex:2 }}>→</div>
            </div>
          </div>
        </div>
        <style>{`@media(max-width:860px){.enl-hero{grid-template-columns:1fr!important;}}`}</style>
      </section>

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'60px 24px 100px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:32, alignItems:'start' }} className="enl-layout">
          <div style={{ display:'flex', flexDirection:'column', gap:1, background:'var(--border-color)' }}>

            {/* Step 1: Upload */}
            <div style={{ background:'var(--bg-card)', padding:'36px 32px' }}>
              <div style={{ fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--gold-primary)', marginBottom:6 }}>Step 01</div>
              <h2 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:28, marginBottom:16 }}>Upload Your Photo</h2>
              <label
                onDragOver={e => { e.preventDefault(); setDraggingPhoto(true) }}
                onDragLeave={() => setDraggingPhoto(false)}
                onDrop={(e: DragEvent<HTMLLabelElement>) => { e.preventDefault(); setDraggingPhoto(false); const f=e.dataTransfer.files?.[0]; if(f) setPhoto(f) }}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, padding:'64px 24px', background:draggingPhoto?'rgba(184,134,11,0.06)':'var(--bg-dark)', border:draggingPhoto?'1px dashed var(--gold-primary)':photo?'1px solid var(--success)':'1px dashed var(--border-color)', cursor:'pointer', transition:'all 0.2s' }}>
                <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => { const f=e.target.files?.[0]; if(f) setPhoto(f) }}/>
                {photoPreview ? (
                  <><img src={photoPreview} alt="Preview" style={{ maxHeight:180, maxWidth:'100%', objectFit:'contain' }}/><div style={{ fontSize:13, color:'var(--success)' }}>✓ {photo?.name}</div><div style={{ fontSize:11, color:'var(--text-muted)' }}>Click to change</div></>
                ) : (
                  <><div style={{ fontSize:40 }}>📸</div><div style={{ fontSize:15, color:'var(--text-secondary)', fontWeight:500 }}>Drop your photo here to begin</div><div style={{ fontSize:12, color:'var(--text-muted)' }}>JPG, PNG, WEBP — any high-resolution photo</div></>
                )}
              </label>
            </div>

            {/* Step 2: Size */}
            <div style={{ background:'var(--bg-card)', padding:'36px 32px' }}>
              {sectionHead('Step 02', 'Select Size')}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }} className="size-grid">
                {sizeOptions.map(size => (
                  <div key={size.label} onClick={() => { setSelectedSize(size); setArea(size.width*size.height) }} className="card-hover" style={{ cursor:'pointer', padding:'18px 10px', textAlign:'center', background:selectedSize?.label===size.label?'rgba(184,134,11,0.08)':'var(--bg-dark)', border:selectedSize?.label===size.label?'1px solid var(--gold-primary)':'1px solid var(--border-color)', transition:'all 0.2s' }}>
                    <div style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:22, color:selectedSize?.label===size.label?'var(--gold-light)':'var(--text-primary)', marginBottom:4 }}>{size.label}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{size.width}×{size.height} in</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Canvas */}
            <div style={{ background:'var(--bg-card)', padding:'36px 32px' }}>
              {sectionHead('Step 03', 'Choose Canvas')}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }} className="option-grid canvas-grid">
                {canvasOptions.map(opt => <OptionCard key={opt.id} name={opt.name} preview={opt.preview} selected={canvasId===opt.id} onSelect={() => setCanvasId(opt.id)} imageUrl={canvasPreviewMap[opt.id]}/>)}
              </div>
            </div>

            {/* Step 4: Frame */}
            <div style={{ background:'var(--bg-card)', padding:'36px 32px' }}>
              {sectionHead('Step 04', 'Choose Frame')}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }} className="option-grid frame-grid">
                {frameOptions.map(opt => <OptionCard key={opt.id} name={opt.name} preview={opt.preview} selected={frameId===opt.id} disabled={(opt.id==='large'||opt.id==='premium')?(frameDisabledMap.large||frameDisabledMap.premium):opt.id==='small'?frameDisabledMap.small:false} onSelect={() => setFrameId(opt.id)} imageUrl={framePreviewMap[opt.id]}/>)}
              </div>
              {(isCompactSize || isLargeSize) && <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:12, fontStyle:'italic' }}>Some frames are unavailable for {isCompactSize ? 'small' : 'large'} sizes.</p>}
            </div>

            {/* Step 5: Glass */}
            <div style={{ background:'var(--bg-card)', padding:'36px 32px' }}>
              {sectionHead('Step 05', 'Choose Glass')}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }} className="option-grid glass-grid">
                {glassOptions.map(opt => <OptionCard key={opt.id} name={opt.name} preview={opt.preview} selected={glassId===opt.id} onSelect={() => setGlassId(opt.id)} imageUrl={glassPreviewMap[opt.id]}/>)}
              </div>
            </div>

            {/* Step 6: Write-up */}
            <div style={{ background:'var(--bg-card)', padding:'36px 32px' }}>
              {sectionHead('Step 06', 'Write-up / Caption')}
              <div style={{ display:'flex', gap:10, marginBottom:18 }}>
                {(['yes','no'] as const).map(v => (
                  <button key={v} onClick={() => setWriteUpType(v)} style={{ flex:1, padding:'11px', fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', background:writeUpType===v?'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))':'var(--bg-dark)', color:writeUpType===v?'var(--text-on-gold)':'var(--text-secondary)', border:writeUpType===v?'none':'1px solid var(--border-color)', cursor:'pointer', fontFamily:'"Libre Franklin",sans-serif' }}>
                    {v==='yes'?'Yes — Add Text':'No — Skip'}
                  </button>
                ))}
              </div>
              {writeUpType === 'yes'
                ? <textarea style={{ ...fieldStyle, resize:'none', minHeight:90 }} placeholder="Your custom caption…" value={customMessage} onChange={e => setCustomMessage(e.target.value)}/>
                : <select style={{ ...fieldStyle, appearance:'none' }} value={occasion} onChange={e => setOccasion(e.target.value)}>
                    {['Birthday','Wedding','Anniversary','Memorial','Graduation','Christmas',"Mother's Day",'Other'].map(o=><option key={o}>{o}</option>)}
                  </select>
              }
            </div>

            {/* CTA */}
            <div style={{ background:'var(--bg-card)', padding:'24px 32px', display:'flex', gap:14, flexWrap:'wrap', alignItems:'center' }}>
              <button onClick={handleAddToCart} disabled={!canAdd} style={{ flex:1, padding:'15px', fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', background:canAdd?(addedToCart?'var(--success)':'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))'):' var(--bg-dark)', color:canAdd?'var(--text-on-gold)':'var(--text-muted)', border:canAdd?'none':'1px solid var(--border-color)', cursor:canAdd?'pointer':'not-allowed', fontFamily:'"Libre Franklin",sans-serif', transition:'all 0.3s' }}>
                {addedToCart?'✓ Added to Cart!':canAdd?'+ Add to Cart':'Upload photo & select size first'}
              </button>
              {addedToCart && <Link href="/cart" style={{ padding:'15px 22px', fontSize:12, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', border:'1px solid var(--gold-primary)', color:'var(--gold-light)' }}>View Cart →</Link>}
            </div>
          </div>

          {/* Right summary */}
          <div className="sticky-summary">
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', padding:24 }}>
              <h3 style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:20, marginBottom:18 }}>Live Summary</h3>
              {photoPreview && <div style={{ marginBottom:14, border:'1px solid var(--border-color)', overflow:'hidden' }}><img src={photoPreview} alt="Preview" style={{ width:'100%', aspectRatio:'4/3', objectFit:'cover', filter:'sepia(40%) contrast(1.1)' }}/><div style={{ padding:'8px 10px', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold-light)', background:'var(--bg-dark)', textAlign:'center' }}>Canvas: {canvas.name} · Frame: {frame.name}</div></div>}
              {[['Size', selectedSize?selectedSize.label:'—'],['Canvas',canvas.name],['Frame',frame.name],['Glass',glass.name]].map(([l,v])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--border-color)', fontSize:12 }}>
                  <span style={{ color:'var(--text-muted)' }}>{l}</span><span>{v}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0 0', marginTop:4 }}>
                <span style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:18 }}>Subtotal</span>
                <span style={{ fontFamily:'"Cormorant Garamond",serif', fontSize:24, color:'var(--gold-light)' }}>{selectedSize?formatPrice(totalPrice):'—'}</span>
              </div>
            </div>
            <div style={{ marginTop:10, background:'var(--bg-card)', border:'1px solid var(--border-color)', padding:20 }}>
              <div style={{ fontSize:13, fontWeight:500, marginBottom:10 }}>Photo Enlargement Benefits</div>
              {['Upload any clear photo','Faster than custom artwork (1–2 weeks)','Same premium canvas & frame options','Physical + digital delivery'].map(f=>(
                <div key={f} style={{ fontSize:12, color:'var(--text-secondary)', padding:'5px 0', borderBottom:'1px solid var(--border-color)', display:'flex', gap:8 }}>
                  <span style={{ color:'var(--gold-primary)' }}>—</span>{f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:900px){
          .enl-layout{grid-template-columns:1fr!important;}
          .size-grid{grid-template-columns:repeat(3,1fr)!important;}
          .option-grid{grid-template-columns:repeat(2,1fr)!important;}
        }
        @media(max-width:640px){
          .size-grid{grid-template-columns:repeat(2,1fr)!important;}
          .option-grid{grid-template-columns:repeat(2,1fr)!important;gap:12px!important;}
          .option-media{height:140px!important;}
        }
      `}</style>
    </PublicLayout>
  )
}
