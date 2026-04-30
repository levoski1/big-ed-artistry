'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

const HERO_IMAGES = [
  { src: '/Home/sliders/slide.jpeg', alt: 'Artwork by Big Ed' },
  { src: '/Home/sliders/slide1.jpeg', alt: 'Artwork by Big Ed' },
  { src: '/Home/sliders/slide2.jpeg', alt: 'Artwork by Big Ed' },
  { src: '/Home/sliders/slide3.jpeg', alt: 'Artwork by Big Ed' },
  { src: '/Home/sliders/slide4.jpeg', alt: 'Artwork by Big Ed' },
  { src: '/Home/sliders/slide5.jpeg', alt: 'Artwork by Big Ed' },
  { src: '/Home/sliders/slide6.jpeg', alt: 'Artwork by Big Ed' },
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  const goTo = useCallback((idx: number) => {
    setFading(true)
    setTimeout(() => {
      setCurrent(idx)
      setFading(false)
    }, 400)
  }, [])

  const next = useCallback(() => goTo((current + 1) % HERO_IMAGES.length), [current, goTo])

  useEffect(() => {
    const t = setInterval(next, 4500)
    return () => clearInterval(t)
  }, [next])

  const item = HERO_IMAGES[current]
  const isVideo = item.src.endsWith('.mp4') || item.src.endsWith('.webm')

  return (
    <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', position: 'relative' }}>
      <div style={{ position: 'relative', height: 480, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        {isVideo ? (
          <video
            key={item.src}
            src={item.src}
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              opacity: fading ? 0 : 1,
              transition: 'opacity 0.4s ease',
            }}
          />
        ) : (
          <Image
            src={item.src}
            alt={item.alt}
            fill
            priority
            style={{
              objectFit: 'cover',
              opacity: fading ? 0 : 1,
              transform: fading ? 'scale(1.04)' : 'scale(1)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          />
        )}
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,14,12,0.5) 0%, transparent 50%)' }} />

        {/* Nav arrows */}
        <button onClick={() => goTo((current - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)} aria-label="Previous" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, background: 'rgba(15,14,12,0.65)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>←</button>
        <button onClick={() => goTo((current + 1) % HERO_IMAGES.length)} aria-label="Next" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, background: 'rgba(15,14,12,0.65)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>→</button>
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
        {HERO_IMAGES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} style={{ width: i === current ? 20 : 6, height: 6, borderRadius: 3, background: i === current ? 'var(--gold-primary)' : 'var(--border-color)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
        ))}
      </div>
    </div>
  )
}