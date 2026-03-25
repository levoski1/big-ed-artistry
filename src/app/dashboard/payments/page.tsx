'use client'
import { useState } from 'react'
import { mockOrders } from '@/lib/mockData'
import { formatPrice, formatDate } from '@/lib/tokens'
import { StatusBadge, FormGroup, Select } from '@/components/ui'

export default function PaymentsPage() {
  const [selectedOrder, setSelectedOrder] = useState('')
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const unpaidOrders = mockOrders.filter(o => o.paymentStatus !== 'paid')

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0].name)
  }

  const handleSubmit = () => {
    if (!selectedOrder || !file) return
    setSubmitted(true)
  }

  return (
    <div style={{ padding: 40 }}>
      <div style={{ marginBottom: 40, paddingBottom: 28, borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Customer Portal</div>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40 }}>Upload <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Payment Proof</span></h1>
      </div>

      {submitted ? (
        <div style={{ maxWidth: 560, textAlign: 'center', margin: '80px auto', padding: '0 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>✦</div>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, marginBottom: 16 }}>Payment Submitted</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 32 }}>Your payment proof has been received. Big Ed will verify it within 24 hours. You'll receive a notification once confirmed and work begins.</p>
          <button onClick={() => setSubmitted(false)} style={{ padding: '12px 28px', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: '"Libre Franklin", sans-serif' }}>Upload Another</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'start' }}>

          {/* Upload form */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: 48 }}>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, marginBottom: 8 }}>Submit Your Payment</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 36, lineHeight: 1.7 }}>After making your bank transfer, upload a screenshot or photo of the transaction receipt below.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <FormGroup label="Select Order">
                <Select value={selectedOrder} onChange={e => setSelectedOrder(e.target.value)}>
                  <option value="" disabled>Choose an order to pay for</option>
                  {unpaidOrders.map(o => (
                    <option key={o.id} value={o.id}>{o.orderNumber} — {formatPrice(o.price)}</option>
                  ))}
                </Select>
              </FormGroup>

              {/* Bank details */}
              <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: 24 }}>
                <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>Bank Transfer Details</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Available payment banks</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  {[
                    { id: 'uba', label: 'UBA', accountNumber: '2269928796' },
                    { id: 'opay', label: 'Opay', accountNumber: '6112656157' },
                    { id: 'keystone', label: 'Keystone', accountNumber: '6047068634' },
                    { id: 'fairmoney', label: 'Fairmoney', accountNumber: '8155487017' },
                  ].map(bank => (
                    <div key={bank.id} style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', fontSize: 12 }}>
                      <div style={{ color: 'var(--gold-light)', fontWeight: 600, marginBottom: 4 }}>{bank.label}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{bank.accountNumber}</div>
                    </div>
                  ))}
                </div>
                {[
                  ['Account Name', 'Dikibo Eric Tamunonenqiyeofori'],
                  ['Reference', selectedOrder ? mockOrders.find(o => o.id === selectedOrder)?.orderNumber ?? '' : 'Use your Order #'],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
                {selectedOrder && (
                  <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(184,134,11,0.06)', border: '1px solid rgba(184,134,11,0.2)', fontSize: 13, color: 'var(--gold-light)' }}>
                    ✦ Amount Due: {formatPrice(mockOrders.find(o => o.id === selectedOrder)?.price ?? 0)}
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
                  onDrop={e => { e.preventDefault(); setDragging(false); setFile(e.dataTransfer.files[0]?.name ?? null) }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
                    padding: '48px 24px', background: dragging ? 'rgba(184,134,11,0.06)' : 'var(--bg-dark)',
                    border: dragging ? '1px dashed var(--gold-primary)' : file ? '1px solid var(--success)' : '1px dashed var(--border-color)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <input id="proof-upload" type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFile} />
                  {file ? (
                    <>
                      <div style={{ fontSize: 28, color: 'var(--success)' }}>✓</div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{file}</div>
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

              <button onClick={handleSubmit} disabled={!selectedOrder || !file} style={{
                padding: '14px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
                background: selectedOrder && file ? 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))' : 'var(--bg-dark)',
                color: selectedOrder && file ? 'var(--text-on-gold)' : 'var(--text-muted)',
                border: selectedOrder && file ? 'none' : '1px solid var(--border-color)',
                cursor: selectedOrder && file ? 'pointer' : 'not-allowed',
                fontFamily: '"Libre Franklin", sans-serif',
              }}>Submit Payment Proof →</button>
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border-color)' }}>
            {/* Pending orders */}
            <div style={{ background: 'var(--bg-card)', padding: 28 }}>
              <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>Orders Awaiting Payment</div>
              {unpaidOrders.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>All orders have been paid. ✓</p>
              ) : unpaidOrders.map(order => (
                <div key={order.id} style={{ padding: '16px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{order.orderNumber}</span>
                    <span style={{ fontSize: 13, color: 'var(--gold-light)' }}>{formatPrice(order.price)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <StatusBadge status={order.paymentStatus} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
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
          </div>
        </div>
      )}
    </div>
  )
}
