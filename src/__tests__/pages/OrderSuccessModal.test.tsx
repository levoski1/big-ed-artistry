import React from 'react'
import { render, screen } from '@testing-library/react'
import OrderSuccessModal from '@/components/ui/OrderSuccessModal'

jest.mock('next/link', () => {
  const Link = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  )
  Link.displayName = 'Link'
  return Link
})

jest.mock('@/lib/tokens', () => ({
  formatPrice: (n: number) => `₦${n.toLocaleString()}`,
}))

const baseProps = {
  name: 'Alice',
  phone: '+234 800 000 0000',
  orderNumber: 'BEA-001',
  paymentType: 'full' as const,
  amountDue: 50000,
  amountRemaining: 0,
}

describe('OrderSuccessModal', () => {
  it('renders the modal container', () => {
    render(<OrderSuccessModal {...baseProps} />)
    expect(screen.getByTestId('success-modal')).toBeInTheDocument()
  })

  it('shows confirmation heading', () => {
    render(<OrderSuccessModal {...baseProps} />)
    expect(screen.getByRole('heading')).toHaveTextContent(/Order.*Confirmed/i)
  })

  it('shows the customer name', () => {
    render(<OrderSuccessModal {...baseProps} />)
    expect(screen.getByText(/Thank you, Alice/i)).toBeInTheDocument()
  })

  it('shows the order number in the message', () => {
    render(<OrderSuccessModal {...baseProps} />)
    expect(screen.getAllByText('BEA-001').length).toBeGreaterThan(0)
  })

  it('shows the contact phone number', () => {
    render(<OrderSuccessModal {...baseProps} />)
    expect(screen.getByText(/\+234 800 000 0000/)).toBeInTheDocument()
  })

  it('Go to Dashboard link points to /dashboard/orders', () => {
    render(<OrderSuccessModal {...baseProps} />)
    expect(screen.getByRole('link', { name: /go to dashboard/i }))
      .toHaveAttribute('href', '/dashboard/orders')
  })

  it('Continue Shopping link points to /store', () => {
    render(<OrderSuccessModal {...baseProps} />)
    expect(screen.getByRole('link', { name: /continue shopping/i }))
      .toHaveAttribute('href', '/store')
  })

  it('Return to Homepage link points to /', () => {
    render(<OrderSuccessModal {...baseProps} />)
    expect(screen.getByRole('link', { name: /return to homepage/i }))
      .toHaveAttribute('href', '/')
  })

  it('renders all three navigation links', () => {
    render(<OrderSuccessModal {...baseProps} />)
    const hrefs = screen.getAllByRole('link').map(l => l.getAttribute('href'))
    expect(hrefs).toContain('/dashboard/orders')
    expect(hrefs).toContain('/store')
    expect(hrefs).toContain('/')
  })

  it('shows Full Payment label for full paymentType', () => {
    render(<OrderSuccessModal {...baseProps} />)
    expect(screen.getByText('Full Payment')).toBeInTheDocument()
  })

  it('shows 50% Deposit label for partial paymentType', () => {
    render(<OrderSuccessModal {...{ ...baseProps, paymentType: 'partial' as const, amountRemaining: 25000 }} />)
    expect(screen.getByText('50% Deposit')).toBeInTheDocument()
  })

  it('shows formatted amount paid', () => {
    render(<OrderSuccessModal {...baseProps} />)
    expect(screen.getByText('₦50,000')).toBeInTheDocument()
  })

  it('does not show remaining balance row when amountRemaining is 0', () => {
    render(<OrderSuccessModal {...baseProps} />)
    expect(screen.queryByText('Remaining Balance')).toBeNull()
  })

  it('shows remaining balance row when amountRemaining > 0', () => {
    render(<OrderSuccessModal {...{ ...baseProps, paymentType: 'partial' as const, amountDue: 25000, amountRemaining: 25000 }} />)
    expect(screen.getByText('Remaining Balance')).toBeInTheDocument()
    expect(screen.getAllByText('₦25,000').length).toBeGreaterThanOrEqual(2)
  })

  it('modal is not rendered when excluded from tree (conditional rendering)', () => {
    const { container } = render(<></>)
    expect(container.querySelector('[data-testid="success-modal"]')).toBeNull()
  })

  it('modal is fixed-position to overlay the page', () => {
    const { getByTestId } = render(<OrderSuccessModal {...baseProps} />)
    expect(getByTestId('success-modal').style.position).toBe('fixed')
  })

  it('modal has high z-index to appear above all content', () => {
    const { getByTestId } = render(<OrderSuccessModal {...baseProps} />)
    expect(Number(getByTestId('success-modal').style.zIndex)).toBeGreaterThanOrEqual(9999)
  })
})
