import PublicLayout from '@/components/layout/PublicLayout'
import { PageHero } from '@/components/ui'

export default function RefundPolicyPage() {
  return (
    <PublicLayout>
      <PageHero
        tag="Policies"
        title={<>Refund <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Policy</span></>}
        subtitle="Please read this policy carefully before making payment."
      />

      <section style={{ padding: '72px 0 110px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: 28, display: 'grid', gap: 18 }}>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 34 }}>No Refund After Payment</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              Payments are non-refundable once processing starts. The only exception is cancellation requested within 24 hours of payment and before artwork processing begins.
            </p>
            <div style={{ border: '1px solid var(--border-color)', background: 'var(--bg-dark)', padding: 16 }}>
              <p style={{ marginBottom: 8, color: 'var(--text-primary)' }}>Exception Requirements</p>
              <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.9, paddingLeft: 20, margin: 0, display: 'grid', gap: 8 }}>
                <li>Contact support within 24 hours of payment.</li>
                <li>Send cancellation request before sketching/processing begins.</li>
                <li>Provide order reference and payment receipt details for verification.</li>
              </ul>
            </div>
            <div style={{ border: '1px solid var(--border-color)', padding: 16 }}>
              <p style={{ marginBottom: 8, color: 'var(--text-primary)' }}>Contact Method</p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>Email support@bigedartistry.com or WhatsApp +234 800 000 0000 with your order ID and cancellation reason.</p>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.8, margin: 0 }}>
              Limitations: Once production has started, framing has begun, or dispatch processing has started, cancellation and refund requests are no longer eligible.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
