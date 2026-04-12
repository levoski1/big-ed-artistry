'use client'
import { useState, useTransition } from 'react'
import { SectionTag } from '@/components/ui'
import { submitReview, type Review } from '@/app/actions/reviews'

interface Props {
  initialReviews: Review[] | undefined
  isLoggedIn: boolean
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span
          key={s}
          style={{ fontSize: size, color: s <= rating ? '#D4A84B' : '#2A2622' }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

function InteractiveStars({
  value,
  onChange
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span
          key={s}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          style={{
            fontSize: 24,
            color: s <= (hovered || value) ? '#D4A84B' : '#2A2622',
            cursor: 'pointer',
            transition: 'color 0.15s'
          }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default function TestimonialsSection({
  initialReviews,
  isLoggedIn
}: Props) {
  // ✅ SAFE INITIAL STATE
  const [reviews, setReviews] = useState<Review[]>(initialReviews || [])

  const [message, setMessage] = useState('')
  const [rating, setRating] = useState(5)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!message.trim()) {
      setError('Please write a message.')
      return
    }

    setError('')

    startTransition(async () => {
      try {
        const review = await submitReview(message.trim(), rating)

        // ✅ SAFE UPDATE
        setReviews(prev => [review, ...(prev || [])])

        setMessage('')
        setRating(5)
        setSuccess(true)

        setTimeout(() => setSuccess(false), 3000)
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to submit review.'
        )
      }
    })
  }

  return (
    <section
      style={{
        padding: '100px 0',
        borderBottom: '1px solid var(--border-color)',
        position: 'relative',
        zIndex: 2 // ✅ prevents overlay issues
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <SectionTag center>Clients</SectionTag>
          <h2
            style={{
              fontFamily: '"Cormorant Garamond",serif',
              fontSize: 'clamp(32px,4vw,52px)'
            }}
          >
            What Clients{' '}
            <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>
              Say
            </span>
          </h2>
        </div>

        {/* ✅ ALWAYS RENDER (with fallback) */}
        {reviews && reviews.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: 1,
              background: 'var(--border-color)',
              marginBottom: 60
            }}
            className="t-grid"
          >
            {reviews.slice(0, 6).map(r => (
              <div
                key={r.id}
                style={{
                  background: 'var(--bg-dark)',
                  padding: '36px 28px'
                }}
              >
                <Stars rating={r.rating} />

                <p
                  style={{
                    fontFamily: '"Cormorant Garamond",serif',
                    fontSize: 18,
                    fontStyle: 'italic',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.7,
                    margin: '18px 0 22px'
                  }}
                >
                  &ldquo;{r.message}&rdquo;
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: '"Cormorant Garamond",serif',
                      fontSize: 17,
                      color: 'var(--gold-light)',
                      flexShrink: 0
                    }}
                  >
                    {/* ✅ SAFE NAME ACCESS */}
                    {r.user_name?.[0]?.toUpperCase() || 'A'}
                  </div>

                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {r.user_name || 'Anonymous'}
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)'
                      }}
                    >
                      {r.created_at
                        ? new Date(r.created_at).toLocaleDateString('en-GB', {
                            month: 'short',
                            year: 'numeric'
                          })
                        : ''}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // ✅ FALLBACK UI
          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              marginBottom: 60
            }}
          >
            No reviews yet. Be the first to share your experience.
          </p>
        )}

        {/* FORM */}
        <div
          style={{
            maxWidth: 560,
            margin: '0 auto',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            padding: '36px 32px'
          }}
        >
          <h3
            style={{
              fontFamily: '"Cormorant Garamond",serif',
              fontSize: 24,
              marginBottom: 20
            }}
          >
            Leave a{' '}
            <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>
              Review
            </span>
          </h3>

          {!isLoggedIn ? (
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Please log in to leave a review.
            </p>
          ) : success ? (
            <p style={{ fontSize: 14, color: 'var(--gold-light)' }}>
              ✓ Thank you for your review!
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
            >
              <InteractiveStars value={rating} onChange={setRating} />

              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder="Share your experience..."
                style={{
                  width: '100%',
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '12px 14px'
                }}
              />

              {error && (
                <p style={{ fontSize: 12, color: '#e05252' }}>{error}</p>
              )}

              <button type="submit" disabled={isPending}>
                {isPending ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @media(max-width:860px){
          .t-grid{
            grid-template-columns:1fr!important;
          }
        }
      `}</style>
    </section>
  )
}