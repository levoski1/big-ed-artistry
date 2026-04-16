'use client'
import { useState } from 'react'
import { formatPrice, formatDate } from '@/lib/tokens'
import { StatusBadge, FormGroup, Select } from '@/components/ui'
import { uploadPaymentReceipt } from '@/app/actions/uploads'
import { submitPayment } from '@/app/actions/payments'
import type { Database } from '@/lib/types/database'

type Order = Database['public']['Tables']['orders']['Row']
type Upload = Database['public']['Tables']['uploads']['Row']

interface Props {
  orders: Order[]
  paymentUploads: Upload[]
  artworkUploads: Upload[]
}

export default function PaymentsPageContent({ orders, paymentUploads, artworkUploads }: Props) {
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full')
  const [amount, setAmount] = useState('')
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const unpaidOrders = orders.filter(o => o.payment_status !== 'FULLY_PAID')
  const selectedOrder = orders.find(o => o.id === selectedOrderId)

  const handleFile = (f: File) => setFile(f)

  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId)
    const order = orders.find(o => o.id === orderId)
    if (order) {
      setAmount(paymentType === 'partial'
        ? String(Math.ceil(order.amount_remaining * 0.5))
        : String(order.amount_remaining)
      )
    }
  }

  const handlePaymentTypeChange = (type: 'full' | 'partial') => {
    setPaymentType(type)
    if (selectedOrder) {
      setAmount(type === 'partial'
        ? String(Math.ceil(selectedOrder.amount_remaining * 0.5))
        : String(selectedOrder.amount_remaining)
      )
    }
  }

  const handleSubmit = async () => {
    if (!selectedOrderId || !file) { setError('Please select an order and upload a receipt.'); return }
    const parsedAmount = Number(amount)
    if (!parsedAmount || parsedAmount <= 0) { setError('Please enter a valid amount.'); return }

    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const upload = await uploadPaymentReceipt(formData)
      await submitPayment({
        order_id: selectedOrderId,
        amount: parsedAmount,
        payment_type: paymentType,
        receipt_url: upload.file_url,
      })
      setSubmitted(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submission failed.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ padding: 40 }}>
        <div style={{ maxWidth: 560, textAlign: 'center', margin: '80px auto' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>✦</div>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, marginBottom: 16 }}>Payment Submitted</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 32 }}>Your payment proof has been received. Big Ed will verify it within 24 hours.</p>
          <button onClick={() => { setSubmitted(false); setFile(null); setSelectedOrderId(''); setAmount('') }} style={{ padding: '12px 28px', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif' }}>Upload Another</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 40, paddingBottom: 28, borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Customer Portal</div>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40 }}>Upload <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Payment Proof</span></h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'start' }}>
        {/* Form */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: 48 }}>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, marginBottom: 8 }}>Submit Your Payment</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 36, lineHeight: 1.7 }}>After making your bank transfer, upload a screenshot or photo of the transaction receipt below.</p>

          {error && (
            <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', fontSize: 13 }}>{error}</div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <FormGroup label="Select Order">
              <Select value={selectedOrderId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleOrderChange(e.target.value)}>
                <option value="" disabled>Choose an order to pay for</option>
                {unpaidOrders.map(o => (
                  <option key={o.id} value={o.id}>{o.order_number} — {formatPrice(o.total_amount)} (remaining: {formatPrice(o.amount_remaining)})</option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup label="Payment Type">
              <Select value={paymentType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handlePaymentTypeChange(e.target.value as 'full' | 'partial')}>
                <option value="full">Full Payment</option>
                <option value="partial">Partial Payment</option>
              </Select>
            </FormGroup>

            <FormGroup label="Amount Paid (₦) — auto-filled">
              <input
                type="number"
                readOnly
                value={amount}
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(184,134,11,0.06)', border: '1px solid rgba(184,134,11,0.3)', color: 'var(--gold-light)', fontSize: 14, fontFamily: '"Libre Franklin", sans-serif', outline: 'none', boxSizing: 'border-box', cursor: 'default', fontWeight: 600 }}
              />
              {selectedOrder && amount && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  {paymentType === 'partial' ? `50% of remaining balance (${formatPrice(selectedOrder.amount_remaining)})` : `Full remaining balance`}
                </div>
              )}
            </FormGroup>

            {/* Bank details */}
            <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: 24 }}>
              <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>Bank Transfer Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[
                  { label: 'Keystone', account: '6047068634' },
                  { label: 'Fairmoney', account: '8155487017' },
                ].map(bank => (
                  <div key={bank.label} style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', fontSize: 12 }}>
                    <div style={{ color: 'var(--gold-light)', fontWeight: 600, marginBottom: 4 }}>{bank.label}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{bank.account}</div>
                  </div>
                ))}
              </div>
              {[
                ['Account Name', 'Dikibo Eric Tamunonenqiyeofori'],
                ['Reference', selectedOrder?.order_number ?? 'Use your Order #'],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              {selectedOrder && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(184,134,11,0.06)', border: '1px solid rgba(184,134,11,0.2)', fontSize: 13, color: 'var(--gold-light)' }}>
                  ✦ Remaining: {formatPrice(selectedOrder.amount_remaining)}
                </div>
              )}
            </div>

            {/* File upload */}
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Upload Receipt / Screenshot</div>
              <label
                htmlFor="proof-upload"
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '48px 24px', background: dragging ? 'rgba(184,134,11,0.06)' : 'var(--bg-dark)', border: dragging ? '1px dashed var(--gold-primary)' : file ? '1px solid var(--success)' : '1px dashed var(--border-color)', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <input id="proof-upload" type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
                {file ? (
                  <>
                    <div style={{ fontSize: 28, color: 'var(--success)' }}>✓</div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{file.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click to change file</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 32, opacity: 0.4 }}>📎</div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Drag & drop or click to upload</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>JPG, PNG, PDF — max 10MB</div>
                  </>
                )}
              </label>
            </div>

            <button onClick={handleSubmit} disabled={loading || !selectedOrderId || !file} style={{ padding: '14px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: selectedOrderId && file && !loading ? 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))' : 'var(--bg-dark)', color: selectedOrderId && file && !loading ? 'var(--text-on-gold)' : 'var(--text-muted)', border: selectedOrderId && file ? 'none' : '1px solid var(--border-color)', cursor: selectedOrderId && file && !loading ? 'pointer' : 'not-allowed', fontFamily: '"Libre Franklin", sans-serif' }}>
              {loading ? 'Submitting…' : 'Submit Payment Proof →'}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border-color)' }}>
          <div style={{ background: 'var(--bg-card)', padding: 28 }}>
            <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>Orders Awaiting Payment</div>
            {unpaidOrders.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>All orders have been paid. ✓</p>
            ) : unpaidOrders.map(order => (
              <div key={order.id} style={{ padding: '16px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{order.order_number}</span>
                  <span style={{ fontSize: 13, color: 'var(--gold-light)' }}>{formatPrice(order.amount_remaining)}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <StatusBadge status={order.payment_status} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(order.created_at)}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--bg-card)', padding: 28 }}>
            <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>Tips for Faster Verification</div>
            {[
              'Use your order number as the transfer reference',
              'Screenshot must show sender name, amount, date, and reference',
              'Bank debit alerts or e-receipts are accepted',
              'Verification takes up to 24 hours on business days',
            ].map(tip => (
              <div key={tip} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13, color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--gold-primary)', flexShrink: 0 }}>—</span> {tip}
              </div>
            ))}
          </div>

          {/* Payment receipts uploaded */}
          {paymentUploads.length > 0 && (
            <div style={{ background: 'var(--bg-card)', padding: 28 }}>
              <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>Your Payment Receipts</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {paymentUploads.map((u, i) => (
                  <div key={u.id} style={{ border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <a href={u.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                      <img src={u.file_url} alt={`Receipt ${i + 1}`} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} style={{ width: '100%', maxHeight: 140, objectFit: 'cover', display: 'block', background: 'var(--bg-dark)' }} />
                      <div style={{ padding: '8px 12px', background: 'var(--bg-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(u.created_at)}</span>
                        <span style={{ fontSize: 11, color: 'var(--gold-light)' }}>View →</span>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Artwork references uploaded */}
          {artworkUploads.length > 0 && (
            <div style={{ background: 'var(--bg-card)', padding: 28 }}>
              <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>Your Artwork References</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {artworkUploads.map((u, i) => (
                  <div key={u.id} style={{ border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <a href={u.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                      <img src={u.file_url} alt={`Artwork ref ${i + 1}`} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} style={{ width: '100%', maxHeight: 140, objectFit: 'cover', display: 'block', background: 'var(--bg-dark)' }} />
                      <div style={{ padding: '8px 12px', background: 'var(--bg-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.file_name}</span>
                        <span style={{ fontSize: 11, color: 'var(--gold-light)' }}>View →</span>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
