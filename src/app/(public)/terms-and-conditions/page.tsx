import PublicLayout from '@/components/layout/PublicLayout'
import { PageHero } from '@/components/ui'

export default function TermsAndConditionsPage() {
  return (
    <PublicLayout>
      <PageHero
        tag="Policies"
        title={<>Terms & <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Conditions</span></>}
        subtitle="Please review these terms before placing a custom artwork order."
      />

      <section style={{ padding: '72px 0 110px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: 28, display: 'grid', gap: 18 }}>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 34 }}>Order Terms</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>By placing an order, you agree to the following terms that govern production, delivery, and discounts.</p>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.9, paddingLeft: 20, margin: 0, display: 'grid', gap: 10 }}>
              <li>Minimum transaction deposit is 50% of total cost price.</li>
              <li>Delivery period is 2–3 weeks after confirmed payment and artwork approval stage.</li>
              <li>Discounts of 10% / 20% apply only to multiple orders added before checkout.</li>
              <li>Delivery fees depend on selected location and are included in your final invoice.</li>
              <li>Frame and add-on availability is dependent on selected artwork size restrictions.</li>
            </ul>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
