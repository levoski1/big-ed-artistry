'use client'
import { useState } from 'react'

interface StarRatingProps {
  productId: string
  initialRating?: number
  userRating?: number
  onRate?: (productId: string, rating: number) => void
  readonly?: boolean
  size?: number
}

export default function StarRating({ productId, initialRating = 4, userRating, onRate, readonly = false, size = 16 }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || userRating || initialRating

  return (
    <div style={{ display:'flex', alignItems:'center', gap:2 }} role={readonly ? undefined : 'group'} aria-label={`Rating: ${display} of 5 stars`}>
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          className={readonly ? '' : 'star'}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => !readonly && onRate?.(productId, star)}
          style={{ fontSize: size, color: star <= display ? '#D4A84B' : '#2A2622', cursor: readonly ? 'default' : 'pointer', transition:'color 0.15s' }}
          title={readonly ? undefined : `Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </span>
      ))}
      {!readonly && <span style={{ fontSize:11, color:'var(--text-muted)', marginLeft:4 }}>({userRating ? 'your rating' : 'rate'})</span>}
    </div>
  )
}
