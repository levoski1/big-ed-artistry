'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/tokens'

export default function CartPage() {
  const { state, artworkTotal, storeTotal, grandTotal, totalCount, removeArtwork, removeStoreItem, setStoreQuantity } = useCart()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null
  const isEmpty = state.artworkOrders.length === 0 && state.storeItems.length === 0

  return (
    <PublicLayout>
      <div style={{ paddingTop: 100, minHeight: '80vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 100px' }}>
          <div style={{ marginBottom: 40, paddingBottom: 28, borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 44 }}>Cart <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Review</span></h1>
            {totalCount > 0 && <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{totalCount} item{totalCount > 1 ? 's' : ''}</div>}
          </div>

          {isEmpty ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>🛒</div>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, marginBottom: 16 }}>Your cart is empty</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 36 }}>Browse our store or commission a custom artwork to get started.</p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/custom-artwork" style={{ padding: '14px 28px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color: 'var(--text-on-gold)' }}>Order Custom Art</Link>
                <Link href="/store" style={{ padding: '14px 24px', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Browse Store</Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }} className="cart-layout">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border-color)' }}>
                {state.artworkOrders.map(order => (
                  <div key={order.id} style={{ background: 'var(--bg-card)', padding: '24px' }}>
                    <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                      <div style={{ width: 84, height: 84, background: 'var(--bg-dark)', border: '1px solid var(--border-color)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="28" height="28" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.15 }}><circle cx="24" cy="16" r="10" stroke="#D4A84B" strokeWidth="1"/><path d="M6 44c0-9.941 8.059-18 18-18s18 8.059 18 18" stroke="#D4A84B" strokeWidth="1"/></svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500 }}>{order.artworkType === 'enlargement' ? 'Photo Enlargement' : 'Custom Artwork'}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{order.sizeLabel} inches</div>
                          </div>
                          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20, color: 'var(--gold-light)' }}>{formatPrice(order.totalPrice)}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 10 }}>
                          {[['Canvas', order.canvasName], ['Frame', order.frameName], ['Glass', order.glassName]].map(([l, v]) => (
                            <div key={l} style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '7px 10px' }}>
                              <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>{l}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>Base ₦{order.basePrice.toLocaleString()} · Canvas ₦{order.canvasPrice.toLocaleString()} · Frame ₦{order.framePrice.toLocaleString()} · Glass ₦{order.glassPrice.toLocaleString()}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>Configuration cannot be edited from cart.</span>
                          <button onClick={() => removeArtwork(order.id)} style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '5px 12px', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>Remove</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {state.storeItems.map(item => (
                  <div key={item.product.id} style={{ background: 'var(--bg-card)', padding: '24px' }}>
                    <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                      <div style={{ width: 84, height: 84, background: 'var(--bg-dark)', border: '1px solid var(--border-color)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="28" height="28" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.15 }}><rect x="8" y="8" width="32" height="32" stroke="#D4A84B" strokeWidth="1"/></svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 500 }}>{item.product.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.product.category}</div>
                          </div>
                          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20, color: 'var(--gold-light)' }}>{formatPrice(item.product.price * item.quantity)}</div>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>{item.product.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button onClick={() => setStoreQuantity(item.product.id, item.quantity - 1)} style={{ width: 26, height: 26, background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                            <span style={{ fontSize: 14, minWidth: 18, textAlign: 'center' }}>{item.quantity}</span>
                            <button onClick={() => setStoreQuantity(item.product.id, item.quantity + 1)} style={{ width: 26, height: 26, background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatPrice(item.product.price)} each</span>
                          </div>
                          <button onClick={() => removeStoreItem(item.product.id)} style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '5px 12px', cursor: 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}>Remove</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="sticky-summary">
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: 28 }}>
                  <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, marginBottom: 20 }}>Order Summary</h3>
                  {artworkTotal > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}><span style={{ color: 'var(--text-muted)' }}>Artwork ({state.artworkOrders.length})</span><span>{formatPrice(artworkTotal)}</span></div>}
                  {storeTotal > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}><span style={{ color: 'var(--text-muted)' }}>Store Items</span><span>{formatPrice(storeTotal)}</span></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border-color)', marginBottom: 20 }}>
                    <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 18 }}>Subtotal</span>
                    <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, color: 'var(--gold-light)' }}>{formatPrice(grandTotal)}</span>
                  </div>
                  <Link href="/checkout" style={{ display: 'flex', justifyContent: 'center', padding: '15px', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color: 'var(--text-on-gold)' }}>Proceed to Checkout →</Link>
                  <div style={{ marginTop: 12, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>50% deposit accepted · Secure bank transfer</div>
                </div>
                <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <Link href="/custom-artwork" style={{ textAlign: 'center', padding: '10px', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', display: 'block' }}>+ Artwork</Link>
                  <Link href="/store" style={{ textAlign: 'center', padding: '10px', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', display: 'block' }}>+ Products</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@media(max-width:900px){.cart-layout{grid-template-columns:1fr!important;}}`}</style>
    </PublicLayout>
  )
}
