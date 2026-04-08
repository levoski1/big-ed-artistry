'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/tokens'
import { deliveryFees, type DeliveryLocation } from '@/lib/customArtwork'
import { calcPaymentSplit } from '@/lib/services/pricing'
import { createOrder } from '@/app/actions/orders'
import { uploadPaymentReceipt } from '@/app/actions/uploads'
import { submitPayment } from '@/app/actions/payments'
import type { Database } from '@/lib/types/database'

type DbDeliveryLocation = Database['public']['Tables']['orders']['Insert']['delivery_location']

const locationMap: Record<DeliveryLocation, DbDeliveryLocation | null> = {
  none: null,
  ph: 'port_harcourt',
  rivers: 'rivers_state',
  outside: 'outside_rivers',
}

const BANKS = {
  full:    [{ id: 'uba',       label: 'UBA',       account: '2269928796' }, { id: 'opay',      label: 'Opay',      account: '6112656157' }],
  partial: [{ id: 'keystone',  label: 'Keystone',  account: '6047068634' }, { id: 'fairmoney', label: 'Fairmoney', account: '8155487017' }],
}

export default function CheckoutPage() {
  const { state, grandTotal, removeArtwork, removeStoreItem } = useCart()
  const [mounted, setMounted] = useState(false)

  const [name, setName]         = useState('')
  const [phone, setPhone]       = useState('')
  const [address, setAddress]   = useState('')
  const [busStop, setBusStop]   = useState('')
  const [location, setLocation] = useState<DeliveryLocation>('none')
  const [terms, setTerms]       = useState({ deposit: false, timeline: false, discounts: false })
  const [paymentType, setPaymentType] = useState<'full' | 'partial' | ''>('')
  const [selectedBank, setSelectedBank] = useState('')
  const [receipt, setReceipt]   = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState('')
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setSelectedBank('') }, [paymentType])

  const deliveryFee = deliveryFees[location]
  const finalTotal  = grandTotal + deliveryFee
  const { amountDue, amountRemaining } = paymentType
    ? calcPaymentSplit(finalTotal, paymentType as 'full' | 'partial')
    : { amountDue: finalTotal, amountRemaining: 0 }

  const bankOptions     = paymentType ? BANKS[paymentType as 'full' | 'partial'] : []
  const selectedBankObj = bankOptions.find(b => b.id === selectedBank) ?? null
  const allTerms        = terms.deposit && terms.timeline && terms.discounts
  const canSubmit       = Boolean(name && phone && address && busStop && location !== 'none' && allTerms && paymentType && selectedBank && receipt)
  const isEmpty         = state.artworkOrders.length === 0 && state.storeItems.length === 0

  const handleFile = (file: File) => {
    setReceipt(file)
    setReceiptPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!canSubmit || !receipt || !paymentType) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const dbLocation = locationMap[location]!

      const items = [
        ...state.artworkOrders.map(o => ({
          item_type: 'artwork' as const,
          artwork_type: (o.artworkType === 'enlargement' ? 'photo_enlargement' : 'custom_artwork') as 'custom_artwork' | 'photo_enlargement',
          size_label: o.sizeLabel,
          width_inches: o.width,
          height_inches: o.height,
          area_sqin: o.area,
          canvas_option: o.canvasId !== 'none' ? o.canvasName : null,
          frame_option: o.frameId !== 'none' ? o.frameName : null,
          glass_option: o.glassId !== 'none' ? o.glassName : null,
          write_up_type: o.writeUpType === 'yes' ? ('custom_message' as const) : null,
          write_up_content: o.writeUpType === 'yes' ? o.customMessage : null,
          base_price: o.basePrice,
          canvas_price: o.canvasPrice,
          frame_price: o.framePrice,
          glass_price: o.glassPrice,
          item_subtotal: o.totalPrice,
          quantity: 1,
        })),
        ...state.storeItems.map(i => ({
          item_type: 'store_product' as const,
          product_id: i.product.id,
          quantity: i.quantity,
          base_price: i.product.price,
          canvas_price: 0,
          frame_price: 0,
          glass_price: 0,
          item_subtotal: i.product.price * i.quantity,
        })),
      ]

      const order = await createOrder({
        delivery_location: dbLocation,
        delivery_address: address,
        delivery_bus_stop: busStop,
        delivery_fee: deliveryFee,
        subtotal: grandTotal,
        total_amount: finalTotal,
        amount_paid: amountDue,
        notes: `Customer: ${name}, Phone: ${phone}`,
      }, items)

      const receiptFormData = new FormData()
      receiptFormData.append('file', receipt)
      const upload = await uploadPaymentReceipt(receiptFormData)
      await submitPayment({
        order_id: order.id,
        amount: amountDue,
        payment_type: paymentType as 'full' | 'partial',
        receipt_url: upload.file_url,
      })

      // Clear cart
      state.artworkOrders.forEach(o => removeArtwork(o.id))
      state.storeItems.forEach(i => removeStoreItem(i.product.id))

      setOrderNumber(order.order_number)
      setSubmitted(true)
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Order failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted) return null

  if (isEmpty) return (
    <PublicLayout>
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
        <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36 }}>Your cart is empty</h2>
        <Link href="/store" style={{ padding: '14px 28px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color: 'var(--text-on-gold)' }}>Browse Store</Link>
      </div>
    </PublicLayout>
  )

  if (submitted) return (
    <PublicLayout>
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 520, padding: '0 24px' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>✦</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 48, marginBottom: 16 }}>Order <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Confirmed</span></h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 28 }}>
            Thank you, {name}! Your order <strong style={{ color: 'var(--gold-light)' }}>{orderNumber}</strong> has been received. Big Ed will review your payment and begin work within 24 hours. You will be contacted on {phone}.
          </p>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: 28, marginBottom: 28, textAlign: 'left' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>Order Details</div>
            {[
              ['Order Number', orderNumber],
              ['Delivery', location === 'ph' ? 'Port Harcourt' : location === 'rivers' ? 'Rivers State' : 'Outside Rivers'],
              ['Payment Type', paymentType === 'full' ? 'Full Payment' : '50% Deposit'],
              ['Amount Paid', formatPrice(amountDue)],
              ['Remaining Balance', amountRemaining > 0 ? formatPrice(amountRemaining) : '—'],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>{l}</span><span>{v}</span>
              </div>
            ))}
          </div>
          <Link href="/dashboard/orders" style={{ padding: '14px 28px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))', color: 'var(--text-on-gold)', display: 'inline-block' }}>Track My Order →</Link>
        </div>
      </div>
    </PublicLayout>
  )

  const inputStyle = { width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '13px 16px', color: 'var(--text-primary)', fontFamily: '"Libre Franklin",sans-serif', fontSize: 14, outline: 'none', display: 'block' as const }
  const labelStyle = { fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }

  return (
    <PublicLayout>
      <div style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ marginBottom: 40, paddingBottom: 24, borderBottom: '1px solid var(--border-color)' }}>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 44 }}>Checkout <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>&amp; Delivery</span></h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }} className="checkout-layout">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border-color)' }}>

              {/* 1. Delivery */}
              <div style={{ background: 'var(--bg-card)', padding: '36px 32px' }}>
                <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26, marginBottom: 24 }}>1. Delivery Details</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="delivery-grid">
                  <div><label style={labelStyle}>Full Name *</label><input style={inputStyle} placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} /></div>
                  <div><label style={labelStyle}>Phone / WhatsApp *</label><input style={inputStyle} placeholder="+234 800 000 0000" value={phone} onChange={e => setPhone(e.target.value)} /></div>
                </div>
                <div style={{ marginBottom: 16 }}><label style={labelStyle}>Delivery Address *</label><input style={inputStyle} placeholder="Street address" value={address} onChange={e => setAddress(e.target.value)} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="delivery-grid">
                  <div><label style={labelStyle}>Nearest Bus Stop *</label><input style={inputStyle} placeholder="Nearest bus stop" value={busStop} onChange={e => setBusStop(e.target.value)} /></div>
                  <div>
                    <label style={labelStyle}>Delivery Location *</label>
                    <select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} value={location} onChange={e => setLocation(e.target.value as DeliveryLocation)}>
                      <option value="none" disabled>Select location</option>
                      <option value="ph">Port Harcourt — ₦2,000</option>
                      <option value="rivers">Rivers State — ₦5,000</option>
                      <option value="outside">Outside Rivers — ₦10,000</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Terms */}
              <div style={{ background: 'var(--bg-card)', padding: '36px 32px' }}>
                <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26, marginBottom: 20 }}>2. Terms &amp; Conditions</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
                  Please review our <Link href="/terms-and-conditions" style={{ color: 'var(--gold-light)', textDecoration: 'underline' }}>Terms &amp; Conditions</Link> and <Link href="/refund-policy" style={{ color: 'var(--gold-light)', textDecoration: 'underline' }}>Refund Policy</Link> before proceeding.
                </p>
                {([
                  ['deposit',   '✔ Minimum 50% deposit required before work begins; paid in full before delivery'],
                  ['timeline',  '✔ Delivery takes 2–3 weeks from payment confirmation'],
                  ['discounts', '✔ Discounts apply only to multiple orders in a single transaction'],
                ] as [keyof typeof terms, string][]).map(([key, text]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14, cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={terms[key]} onChange={e => setTerms(t => ({ ...t, [key]: e.target.checked }))} style={{ marginTop: 2, accentColor: 'var(--gold-primary)', width: 16, height: 16, flexShrink: 0 }} />
                    {text}
                  </label>
                ))}
              </div>

              {/* 3. Payment */}
              <div style={{ background: 'var(--bg-card)', padding: '36px 32px' }}>
                <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26, marginBottom: 20 }}>3. Payment Method</h2>

                {/* Payment type selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  {([
                    ['full',    'Full Payment',  `Pay ${formatPrice(finalTotal)} now`, `No remaining balance`],
                    ['partial', '50% Deposit',   `Pay ${formatPrice(Math.ceil(finalTotal * 0.5))} now`, `${formatPrice(Math.ceil(finalTotal * 0.5))} due on delivery`],
                  ] as [string, string, string, string][]).map(([val, label, sub, note]) => (
                    <button key={val} onClick={() => setPaymentType(val as 'full' | 'partial')} style={{ padding: '20px', textAlign: 'left', cursor: 'pointer', background: paymentType === val ? 'rgba(184,134,11,0.08)' : 'var(--bg-dark)', border: paymentType === val ? '1px solid var(--gold-primary)' : '1px solid var(--border-color)', transition: 'all 0.2s', fontFamily: '"Libre Franklin",sans-serif' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: paymentType === val ? 'var(--gold-light)' : 'var(--text-primary)', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13, color: paymentType === val ? 'var(--gold-primary)' : 'var(--text-muted)', marginBottom: 2 }}>{sub}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{note}</div>
                    </button>
                  ))}
                </div>

                {/* Payment breakdown */}
                {paymentType && (
                  <div style={{ background: 'rgba(184,134,11,0.06)', border: '1px solid rgba(184,134,11,0.2)', padding: '16px 20px', marginBottom: 20, display: 'grid', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Order Total</span>
                      <span>{formatPrice(finalTotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600 }}>
                      <span style={{ color: 'var(--gold-light)' }}>Pay Now</span>
                      <span style={{ color: 'var(--gold-light)' }}>{formatPrice(amountDue)}</span>
                    </div>
                    {amountRemaining > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Remaining (on delivery)</span>
                        <span>{formatPrice(amountRemaining)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Bank selection */}
                {paymentType && (
                  <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: 20 }}>
                    <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>Bank Transfer Details</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>Select preferred bank</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                      {bankOptions.map(bank => (
                        <button key={bank.id} onClick={() => setSelectedBank(bank.id)} style={{ padding: '12px 14px', textAlign: 'left', cursor: 'pointer', background: selectedBank === bank.id ? 'rgba(184,134,11,0.08)' : 'var(--bg-card)', border: selectedBank === bank.id ? '1px solid var(--gold-primary)' : '1px solid var(--border-color)', color: selectedBank === bank.id ? 'var(--gold-light)' : 'var(--text-secondary)', fontSize: 12, fontFamily: '"Libre Franklin",sans-serif' }}>
                          {bank.label}
                        </button>
                      ))}
                    </div>
                    {selectedBankObj ? (
                      [
                        ['Bank', selectedBankObj.label],
                        ['Account Number', selectedBankObj.account],
                        ['Account Name', 'Dikibo Eric Tamunonenqiyeofori'],
                        ['Amount to Transfer', formatPrice(amountDue)],
                      ].map(([l, v]) => (
                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                          <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                          <span style={{ color: l === 'Amount to Transfer' ? 'var(--gold-light)' : 'var(--text-primary)', fontWeight: l === 'Amount to Transfer' ? 600 : 400 }}>{v}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Select a bank to see account details.</div>
                    )}
                  </div>
                )}
              </div>

              {/* 4. Receipt */}
              <div style={{ background: 'var(--bg-card)', padding: '36px 32px' }}>
                <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26, marginBottom: 16 }}>4. Upload Payment Receipt *</h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.7 }}>Upload a screenshot or photo of your bank transfer confirmation.</p>
                <label
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '48px 24px', background: dragging ? 'rgba(184,134,11,0.06)' : 'var(--bg-dark)', border: dragging ? '1px dashed var(--gold-primary)' : receipt ? '1px solid var(--success)' : '1px dashed var(--border-color)', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  {receipt ? (
                    <>{receiptPreview && <img src={receiptPreview} alt="Receipt" style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'contain' }} />}<div style={{ fontSize: 13, color: 'var(--success)' }}>✓ {receipt.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click to change</div></>
                  ) : (
                    <><div style={{ fontSize: 32 }}>📎</div><div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Drag &amp; drop or click to upload</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>JPG, PNG, PDF — max 10MB</div></>
                  )}
                </label>
              </div>
            </div>

            {/* Order summary sidebar */}
            <div className="sticky-summary">
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: 28 }}>
                <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, marginBottom: 20 }}>Order Summary</h3>

                {[
                  ...state.artworkOrders.map(o => ({ name: o.artworkType === 'enlargement' ? 'Photo Enlargement' : 'Custom Artwork', sub: `${o.sizeLabel}" · ${o.canvasName}`, price: o.totalPrice })),
                  ...state.storeItems.map(i => ({ name: i.product.name, sub: `Qty: ${i.quantity}`, price: i.product.price * i.quantity })),
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                    <div><div style={{ color: 'var(--text-primary)', marginBottom: 2 }}>{item.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.sub}</div></div>
                    <span style={{ color: 'var(--gold-light)', flexShrink: 0, marginLeft: 12 }}>{formatPrice(item.price)}</span>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span><span>{formatPrice(grandTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Delivery</span><span>{location !== 'none' ? formatPrice(deliveryFee) : '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', marginBottom: 6 }}>
                  <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20 }}>Total</span>
                  <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26, color: 'var(--gold-light)' }}>{formatPrice(finalTotal)}</span>
                </div>

                {paymentType && (
                  <div style={{ padding: '12px 14px', background: 'rgba(184,134,11,0.08)', border: '1px solid rgba(184,134,11,0.2)', fontSize: 13, marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Pay now</span>
                      <span style={{ color: 'var(--gold-light)', fontWeight: 600 }}>{formatPrice(amountDue)}</span>
                    </div>
                    {amountRemaining > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>On delivery</span>
                        <span>{formatPrice(amountRemaining)}</span>
                      </div>
                    )}
                  </div>
                )}

                <button onClick={handleSubmit} disabled={!canSubmit || submitting} style={{ width: '100%', padding: '15px', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: canSubmit && !submitting ? 'linear-gradient(135deg,var(--gold-primary),var(--gold-accent))' : 'var(--bg-dark)', color: canSubmit && !submitting ? 'var(--text-on-gold)' : 'var(--text-muted)', border: canSubmit ? 'none' : '1px solid var(--border-color)', cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed', fontFamily: '"Libre Franklin",sans-serif' }}>
                  {submitting ? 'Placing Order…' : canSubmit ? 'Confirm Order ✦' : 'Complete all fields'}
                </button>
                {!canSubmit && !submitting && <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>All fields, terms, and receipt required.</div>}
                {submitError && <div style={{ marginTop: 10, fontSize: 12, color: '#f87171', textAlign: 'center' }}>{submitError}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media(max-width:900px){.checkout-layout{grid-template-columns:1fr!important;}}
        @media(max-width:700px){.delivery-grid{grid-template-columns:1fr!important;}}
      `}</style>
    </PublicLayout>
  )
}
