import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import AdminPaymentsContent from '@/app/admin/(protected)/payments/AdminPaymentsContent'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('@/lib/tokens', () => ({
  formatPrice: (n: number) => `₦${n.toLocaleString()}`,
  formatDate: (s: string) => s,
}))
jest.mock('@/components/ui', () => ({
  StatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}))
jest.mock('@/app/actions/payments', () => ({
  verifyPayment: jest.fn().mockResolvedValue({ id: 'pay-1', status: 'verified' }),
  rejectPayment: jest.fn().mockResolvedValue({ id: 'pay-1', status: 'rejected' }),
}))

type Payment = {
  id: string; order_id: string; user_id: string; amount: number
  payment_type: string; receipt_url: string; status: string
  verified_by: string | null; verified_at: string | null
  rejection_reason: string | null; created_at: string
  profiles?: { full_name: string; email: string } | null
  orders?: { order_number: string; total_amount: number; amount_paid: number; amount_remaining: number; payment_status: string } | null
}

const makePayment = (overrides: Partial<Payment> = {}): Payment => ({
  id: 'pay-1', order_id: 'order-1', user_id: 'user-1',
  amount: 25000, payment_type: 'partial', status: 'pending',
  receipt_url: 'https://example.com/receipt.jpg',
  verified_by: null, verified_at: null, rejection_reason: null,
  created_at: '2024-01-15',
  profiles: { full_name: 'Jane Doe', email: 'jane@test.com' },
  orders: { order_number: 'ORD-001', total_amount: 50000, amount_paid: 25000, amount_remaining: 25000, payment_status: 'PARTIALLY_PAID' },
  ...overrides,
})

describe('AdminPaymentsContent', () => {
  it('shows empty state when no payments', () => {
    render(<AdminPaymentsContent payments={[]} />)
    expect(screen.getByText('No payments found.')).toBeInTheDocument()
  })

  it('renders payment group with customer name', () => {
    render(<AdminPaymentsContent payments={[makePayment()]} />)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('shows order number in group row', () => {
    render(<AdminPaymentsContent payments={[makePayment()]} />)
    expect(screen.getByText('ORD-001')).toBeInTheDocument()
  })

  it('shows NEEDS REVIEW badge for pending payments', () => {
    render(<AdminPaymentsContent payments={[makePayment()]} />)
    expect(screen.getByText('NEEDS REVIEW')).toBeInTheDocument()
  })

  it('does not show NEEDS REVIEW for verified payments', () => {
    render(<AdminPaymentsContent payments={[makePayment({ status: 'verified' })]} />)
    expect(screen.queryByText('NEEDS REVIEW')).not.toBeInTheDocument()
  })

  it('opens detail panel on group click', () => {
    render(<AdminPaymentsContent payments={[makePayment()]} />)
    fireEvent.click(screen.getByText('Jane Doe'))
    expect(screen.getByText('Order Summary')).toBeInTheDocument()
  })

  it('closes detail panel on ✕ click', () => {
    render(<AdminPaymentsContent payments={[makePayment()]} />)
    fireEvent.click(screen.getByText('Jane Doe'))
    // First ✕ button is the panel close button
    fireEvent.click(screen.getAllByRole('button', { name: /✕/i })[0])
    expect(screen.queryByText('Order Summary')).not.toBeInTheDocument()
  })

  it('shows verify and reject buttons for pending payment in detail panel', () => {
    render(<AdminPaymentsContent payments={[makePayment()]} />)
    fireEvent.click(screen.getByText('Jane Doe'))
    expect(screen.getByRole('button', { name: /verify this payment/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reject this payment/i })).toBeInTheDocument()
  })

  it('filters payments by status', () => {
    const payments = [
      makePayment({ id: 'p1', status: 'pending' }),
      makePayment({ id: 'p2', order_id: 'order-2', status: 'verified',
        orders: { order_number: 'ORD-002', total_amount: 50000, amount_paid: 50000, amount_remaining: 0, payment_status: 'FULLY_PAID' } }),
    ]
    render(<AdminPaymentsContent payments={payments} />)
    fireEvent.click(screen.getByRole('button', { name: /^verified$/i }))
    expect(screen.getByText('ORD-002')).toBeInTheDocument()
    expect(screen.queryByText('NEEDS REVIEW')).not.toBeInTheDocument()
  })

  it('shows group count', () => {
    render(<AdminPaymentsContent payments={[makePayment()]} />)
    expect(screen.getByText('1 orders')).toBeInTheDocument()
  })
})

describe('AdminPaymentsContent — mobile responsiveness', () => {
  it('root element has admin-payments-page class', () => {
    const { container } = render(<AdminPaymentsContent payments={[]} />)
    expect(container.querySelector('.admin-payments-page')).toBeInTheDocument()
  })

  it('filter buttons row has payments-filters class', () => {
    const { container } = render(<AdminPaymentsContent payments={[]} />)
    expect(container.querySelector('.payments-filters')).toBeInTheDocument()
  })

  it('outer grid has payments-layout class', () => {
    const { container } = render(<AdminPaymentsContent payments={[]} />)
    expect(container.querySelector('.payments-layout')).toBeInTheDocument()
  })

  it('each payment group row has payment-group-row class', () => {
    const { container } = render(<AdminPaymentsContent payments={[makePayment()]} />)
    expect(container.querySelector('.payment-group-row')).toBeInTheDocument()
  })

  it('detail panel has payment-detail-panel class when selected', () => {
    const { container } = render(<AdminPaymentsContent payments={[makePayment()]} />)
    fireEvent.click(screen.getByText('Jane Doe'))
    expect(container.querySelector('.payment-detail-panel')).toBeInTheDocument()
  })

  it('style block contains mobile breakpoint', () => {
    const { container } = render(<AdminPaymentsContent payments={[]} />)
    const styles = Array.from(container.querySelectorAll('style')).map(s => s.textContent ?? '').join('')
    expect(styles).toMatch(/\.admin-payments-page/)
    expect(styles).toMatch(/max-width:\s*700px/)
  })

  it('style block makes detail panel non-sticky on mobile', () => {
    const { container } = render(<AdminPaymentsContent payments={[]} />)
    const styles = Array.from(container.querySelectorAll('style')).map(s => s.textContent ?? '').join('')
    expect(styles).toMatch(/\.payment-detail-panel/)
    expect(styles).toMatch(/position:\s*static/)
  })

  it('style block contains tablet breakpoint', () => {
    const { container } = render(<AdminPaymentsContent payments={[]} />)
    const styles = Array.from(container.querySelectorAll('style')).map(s => s.textContent ?? '').join('')
    expect(styles).toMatch(/min-width:\s*701px/)
    expect(styles).toMatch(/max-width:\s*1024px/)
  })

  it('style block stacks layout on mobile', () => {
    const { container } = render(<AdminPaymentsContent payments={[]} />)
    const styles = Array.from(container.querySelectorAll('style')).map(s => s.textContent ?? '').join('')
    expect(styles).toMatch(/\.payments-layout/)
    expect(styles).toMatch(/grid-template-columns:\s*1fr/)
  })
})
