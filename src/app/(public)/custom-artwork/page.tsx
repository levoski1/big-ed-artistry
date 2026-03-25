'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState, type DragEvent } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import { formatPrice } from '@/lib/tokens'
import { useCart } from '@/context/CartContext'
import {
  calculateTotal, canvasOptions, frameOptions, glassOptions, sizeOptions,
} from '@/lib/customArtwork'

const canvasPreviewMap: Record<string, string> = {
  normal: '/canvas/normal_canvas.jpeg', smooth: '/canvas/smooth_canvas.jpeg',
  crystal: '/canvas/crystal_canvas.jpeg',
}
const framePreviewMap: Record<string, string> = {
  small: '/Frame/small_frame.jpeg',
  medium: '/Frame/medium_frame.jpeg', large: '/Frame/large_frame.jpeg',
  frameless: '/Frame/frameless_canvas1.jpeg', premium: '/Frame/premium_frame.jpeg',
}
const glassPreviewMap: Record<string, string> = {
  '2mm': '/Glass/mm2.jpeg', '3mm': '/Glass/mm3.jpeg',
}

const fieldStyle = { width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '12px 14px', color: 'var(--text-primary)', fontFamily: '"Libre Franklin",sans-serif', fontSize: 14, outline: 'none' }
const labelStyle: React.CSSProperties = { fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, display: 'block' }

export default function CustomArtworkPage() {
  const { addArtwork } = useCart()
  const [selectedSize, setSelectedSize] = useState<(typeof sizeOptions)[number] | null>(null)
  const [area, setArea] = useState(0)
  const [canvasId, setCanvasId] = useState('none')
  const [frameId, setFrameId] = useState('none')
  const [glassId, setGlassId] = useState('none')
  const [writeUpType, setWriteUpType] = useState<'yes' | 'no'>('no')
  const [customMessage, setCustomMessage] = useState('')
  const [occasion, setOccasion] = useState('Birthday')
  const [artImage, setArtImage] = useState<File | null>(null)
  const [artImagePreview, setArtImagePreview] = useState('')
  const [addedToCart, setAddedToCart] = useState(false)

  const canvas = canvasOptions.find(o => o.id === canvasId) ?? canvasOptions[canvasOptions.length - 1]
  const frame = frameOptions.find(o => o.id === frameId) ?? frameOptions[0]
  const glass = glassOptions.find(o => o.id === glassId) ?? glassOptions[0]

  const isCompactSize = selectedSize ? ['8 × 10', '10 × 12', '12 × 16', '16 × 20'].includes(selectedSize.label) : false
  const isLargeSize = selectedSize ? (selectedSize.width > 15 && selectedSize.height > 20) || (selectedSize.width > 20 && selectedSize.height > 15) : false

  const frameDisabledMap = useMemo(() => {
    const disabled = { small: false, large: false, premium: false }
    if (isCompactSize) { disabled.large = true; disabled.premium = true }
    if (isLargeSize) { disabled.small = true }
    return disabled
  }, [isCompactSize, isLargeSize])

  const { basePrice, canvasPrice, framePrice, glassPrice, totalPrice } = calculateTotal(area, canvas.rate, frame.rate, glass.rate, 0)

  useEffect(() => {
    if (!artImage) { setArtImagePreview(''); return }
    const url = URL.createObjectURL(artImage)
    setArtImagePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [artImage])

  useEffect(() => {
    if (frameId === 'small' && frameDisabledMap.small) setFrameId('none')
    if ((frameId === 'large' || frameId === 'premium') && (frameDisabledMap.large || frameDisabledMap.premium)) setFrameId('none')
  }, [frameDisabledMap, frameId])

  const canAdd = Boolean(selectedSize && artImage)

  const handleAddToCart = () => {
    if (!canAdd || !selectedSize || !artImage) return
    addArtwork({
      id: `ART-${Date.now()}`,
      artworkType: 'Custom Artwork',
      sizeLabel: selectedSize.label,
      width: selectedSize.width, height: selectedSize.height, area,
      canvasId, canvasName: canvas.name,
      frameId, frameName: frame.name,
      glassId, glassName: glass.name,
      writeUpType, customMessage, occasion,
      imageName: artImage.name,
      receiptName: '', address: '', phoneNumber: '', busStop: '',
      location: 'none', paymentType: 'full',
      basePrice, canvasPrice, framePrice, glassPrice,
      deliveryFee: 0, totalPrice,
      createdAt: new Date().toISOString(),
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 3000)
  }

  function OptionCard({ id, name, preview, selected, disabled, onSelect, imageUrl }: { id: string; name: string; preview: string; selected: boolean; disabled?: boolean; onSelect: () => void; imageUrl?: string }) {
    return (
      <div onClick={() => !disabled && onSelect()} title={disabled ? 'Not available for this size' : undefined} className={disabled ? '' : 'card-hover'} style={{ cursor: disabled ? 'not-allowed' : 'pointer', background: selected ? 'rgba(184,134,11,0.08)' : 'var(--bg-dark)', border: selected ? '1px solid var(--gold-primary)' : '1px solid var(--border-color)', opacity: disabled ? 0.35 : 1, transition: 'all 0.2s', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 130, background: imageUrl ? 'var(--bg-card)' : preview, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflow: 'hidden', flexShrink: 0, padding: imageUrl ? 8 : 0 }}>
          {imageUrl ? <img src={imageUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}/> : null}
        </div>
        <div style={{ padding: '10px 12px', fontSize: 12, fontWeight: selected ? 600 : 400, color: selected ? 'var(--gold-light)' : 'var(--text-secondary)', textAlign: 'center' }}>{name}</div>
      </div>
    )
  }

  const sectionHead = (n: string, t: string) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold-primary)', marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28 }}>{t}</h2>
    </div>
  )

  return (
    <PublicLayout>
      {/* Banner */}
      <div style={{ width: '100%', height: 320, background: 'linear-gradient(135deg,var(--bg-dark) 0%,var(--bg-card) 50%,var(--bg-dark) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', marginBottom: 0 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(-45deg,rgba(184,134,11,0.04) 0,rgba(184,134,11,0.04) 1px,transparent 1px,transparent 20px)' }}/>
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold-primary)', marginBottom: 12 }}>Commission</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(40px,5vw,72px)', fontWeight: 500, marginBottom: 16 }}>Custom <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Artwork</span></h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 480 }}>Hand-sketched in charcoal or pencil. Sizes measured in inches. Fully customisable.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 24px 100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 40, alignItems: 'start' }} className="art-builder-layout">
          {/* Left: builder */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border-color)' }}>

            {/* Size */}
            <div style={{ background: 'var(--bg-card)', padding: '36px 32px' }}>
              {sectionHead('Step 01', 'Select Art Size')}
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.7 }}>Artwork beautifully crafted, hand sketch, authentically modified with charcoal. Sizes vary and are measured in inches.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }} className="size-grid">
                {sizeOptions.map(size => (
                  <div key={size.label} onClick={() => { setSelectedSize(size); setArea(size.width * size.height) }} className="card-hover" style={{ cursor: 'pointer', padding: '18px 10px', textAlign: 'center', background: selectedSize?.label === size.label ? 'rgba(184,134,11,0.08)' : 'var(--bg-dark)', border: selectedSize?.label === size.label ? '1px solid var(--gold-primary)' : '1px solid var(--border-color)', transition: 'all 0.2s' }}>
                    <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20, color: selectedSize?.label === size.label ? 'var(--gold-light)' : 'var(--text-primary)', marginBottom: 4 }}>{size.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{size.width}×{size.height} in</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Canvas */}
            <div style={{ background: 'var(--bg-card)', padding: '36px 32px' }}>
              {sectionHead('Step 02', 'Choose Canvas')}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }} className="option-grid canvas-grid">
                {canvasOptions.map(opt => (
                  <OptionCard key={opt.id} id={opt.id} name={opt.name} preview={opt.preview} selected={canvasId === opt.id} onSelect={() => setCanvasId(opt.id)} imageUrl={canvasPreviewMap[opt.id]}/>
                ))}
              </div>
            </div>

            {/* Frame */}
            <div style={{ background: 'var(--bg-card)', padding: '36px 32px' }}>
              {sectionHead('Step 03', 'Choose Frame')}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }} className="option-grid frame-grid">
                {frameOptions.map(opt => (
                  <OptionCard key={opt.id} id={opt.id} name={opt.name} preview={opt.preview} selected={frameId === opt.id} disabled={(opt.id === 'large' || opt.id === 'premium') ? (frameDisabledMap.large || frameDisabledMap.premium) : opt.id === 'small' ? frameDisabledMap.small : false} onSelect={() => setFrameId(opt.id)} imageUrl={framePreviewMap[opt.id]}/>
                ))}
              </div>
              {(isCompactSize || isLargeSize) && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, fontStyle: 'italic' }}>Some frames are unavailable for {isCompactSize ? 'small' : 'large'} sizes.</p>}
            </div>

            {/* Glass */}
            <div style={{ background: 'var(--bg-card)', padding: '36px 32px' }}>
              {sectionHead('Step 04', 'Choose Glass')}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }} className="option-grid glass-grid">
                {glassOptions.map(opt => (
                  <OptionCard key={opt.id} id={opt.id} name={opt.name} preview={opt.preview} selected={glassId === opt.id} onSelect={() => setGlassId(opt.id)} imageUrl={glassPreviewMap[opt.id]}/>
                ))}
              </div>
            </div>

            {/* Write-up */}
            <div style={{ background: 'var(--bg-card)', padding: '36px 32px' }}>
              {sectionHead('Step 05', 'Write-up / Caption')}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {(['yes', 'no'] as const).map(v => (
                  <button key={v} onClick={() => setWriteUpType(v)} style={{ flex: 1, padding: '12px', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: writeUpType === v ? 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))' : 'var(--bg-dark)', color: writeUpType === v ? 'var(--text-on-gold)' : 'var(--text-secondary)', border: writeUpType === v ? 'none' : '1px solid var(--border-color)', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>
                    {v === 'yes' ? 'Yes — Add Text' : 'No — Skip'}
                  </button>
                ))}
              </div>
              {writeUpType === 'yes' ? (
                <textarea style={{ ...fieldStyle, resize: 'none', minHeight: 100 }} placeholder="Enter your custom message or caption…" value={customMessage} onChange={e => setCustomMessage(e.target.value)}/>
              ) : (
                <div>
                  <label style={labelStyle}>Select Occasion</label>
                  <select style={{ ...fieldStyle, appearance: 'none' }} value={occasion} onChange={e => setOccasion(e.target.value)}>
                    {['Birthday', 'Wedding', 'Anniversary', 'Memorial', 'Graduation', 'Christmas', 'Mother\'s Day', 'Other'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Upload */}
            <div style={{ background: 'var(--bg-card)', padding: '36px 32px' }}>
              {sectionHead('Step 06', 'Upload Reference Photo')}
              <label
                onDragOver={e => e.preventDefault()}
                onDrop={(e: DragEvent<HTMLLabelElement>) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f && ['image/jpeg','image/png'].includes(f.type)) setArtImage(f) }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '48px 24px', background: 'var(--bg-dark)', border: artImage ? '1px solid var(--success)' : '1px dashed var(--border-color)', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
                <input type="file" accept="image/jpeg,image/png" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setArtImage(f) }}/>
                {artImagePreview ? (
                  <><img src={artImagePreview} alt="Preview" style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain' }}/><div style={{ fontSize: 12, color: 'var(--success)' }}>✓ {artImage?.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click to change</div></>
                ) : (
                  <><div style={{ fontSize: 36 }}>📸</div><div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Drag & drop or click to upload</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>JPG or PNG · High-resolution recommended</div></>
                )}
              </label>
            </div>

            {/* CTA */}
            <div style={{ background: 'var(--bg-card)', padding: '28px 32px', display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={handleAddToCart} disabled={!canAdd} style={{ flex: 1, padding: '16px', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: canAdd ? (addedToCart ? 'var(--success)' : 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))') : 'var(--bg-dark)', color: canAdd ? 'var(--text-on-gold)' : 'var(--text-muted)', border: canAdd ? 'none' : '1px solid var(--border-color)', cursor: canAdd ? 'pointer' : 'not-allowed', fontFamily: '"Libre Franklin",sans-serif', transition: 'all 0.3s', minWidth: 160 }}>
                {addedToCart ? '✓ Added to Cart!' : canAdd ? '+ Add to Cart' : 'Select size & upload photo'}
              </button>
              {addedToCart && <Link href="/cart" style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--gold-primary)', color: 'var(--gold-light)' }}>View Cart →</Link>}
              {!canAdd && <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Select a size and upload your photo to proceed.</span>}
            </div>
          </div>

          {/* Right: price summary */}
          <div className="sticky-summary">
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: 28 }}>
              <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, marginBottom: 20 }}>Price Summary</h3>
              {[['Base Price', basePrice], ['Canvas', canvasPrice], ['Frame', framePrice], ['Glass', glassPrice]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                  <span style={{ color: (v as number) > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{(v as number) > 0 ? formatPrice(v as number) : '—'}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 16px' }}>
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20 }}>Subtotal</span>
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, color: 'var(--gold-light)' }}>{selectedSize ? formatPrice(totalPrice) : '—'}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
                Delivery fee calculated at checkout based on your location.
              </div>
            </div>

            {/* Selected config summary */}
            {selectedSize && (
              <div style={{ marginTop: 10, background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>Your Selection</div>
                {[['Size', selectedSize.label], ['Canvas', canvas.name], ['Frame', frame.name], ['Glass', glass.name]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 10, background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Why Big Ed?</div>
              {['100% hand-drawn by the artist', 'Progress updates throughout', 'Canvas, frame, glass all included', 'Physical delivery or digital copy'].map(f => (
                <div key={f} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '5px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--gold-primary)' }}>—</span>{f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:900px){
          .art-builder-layout{grid-template-columns:1fr!important;}
          .size-grid{grid-template-columns:repeat(3,1fr)!important;}
          .option-grid{grid-template-columns:repeat(2,1fr)!important;}
        }
        @media(max-width:640px){
          .size-grid{grid-template-columns:repeat(2,1fr)!important;}
          .option-grid{grid-template-columns:repeat(2,1fr)!important;gap:12px!important;}
          .option-grid > div > div:first-child{height:140px!important;}
        }
      `}</style>
    </PublicLayout>
  )
}
