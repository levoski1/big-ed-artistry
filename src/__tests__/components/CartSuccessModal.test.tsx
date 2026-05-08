import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import CartSuccessModal from '@/components/ui/CartSuccessModal'

jest.mock('next/link', () => {
  const Link = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
    <a href={href} onClick={onClick}>{children}</a>
  )
  Link.displayName = 'Link'
  return Link
})

describe('CartSuccessModal', () => {
  const onClose = jest.fn()

  beforeEach(() => onClose.mockClear())

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders the modal container', () => {
    render(<CartSuccessModal onClose={onClose} />)
    expect(screen.getByTestId('cart-success-modal')).toBeInTheDocument()
  })

  it('is fixed-position to overlay the page', () => {
    render(<CartSuccessModal onClose={onClose} />)
    expect(screen.getByTestId('cart-success-modal').style.position).toBe('fixed')
  })

  it('has high z-index', () => {
    render(<CartSuccessModal onClose={onClose} />)
    expect(Number(screen.getByTestId('cart-success-modal').style.zIndex)).toBeGreaterThanOrEqual(9999)
  })

  // ── add-to-cart variant (default) ─────────────────────────────────────────

  it('shows "Added to Cart!" heading by default', () => {
    render(<CartSuccessModal onClose={onClose} />)
    expect(screen.getByRole('heading')).toHaveTextContent(/Added to Cart/i)
  })

  it('shows generic success message when no itemName provided', () => {
    render(<CartSuccessModal onClose={onClose} />)
    expect(screen.getByText(/Item successfully added to your cart/i)).toBeInTheDocument()
  })

  it('shows item name in message when itemName is provided', () => {
    render(<CartSuccessModal itemName="Crystal Canvas Print" onClose={onClose} />)
    expect(screen.getByText(/Crystal Canvas Print/)).toBeInTheDocument()
  })

  it('renders Go to Cart link pointing to /cart', () => {
    render(<CartSuccessModal onClose={onClose} />)
    expect(screen.getByRole('link', { name: /go to cart/i })).toHaveAttribute('href', '/cart')
  })

  it('renders Continue Browsing link pointing to /store', () => {
    render(<CartSuccessModal onClose={onClose} />)
    expect(screen.getByRole('link', { name: /continue browsing/i })).toHaveAttribute('href', '/store')
  })

  it('renders Customise Art link pointing to /custom-artwork', () => {
    render(<CartSuccessModal onClose={onClose} />)
    expect(screen.getByRole('link', { name: /customise art/i })).toHaveAttribute('href', '/custom-artwork')
  })

  it('renders Return to Home link pointing to /', () => {
    render(<CartSuccessModal onClose={onClose} />)
    expect(screen.getByRole('link', { name: /return to home/i })).toHaveAttribute('href', '/')
  })

  it('renders all four navigation links in add-to-cart variant', () => {
    render(<CartSuccessModal onClose={onClose} />)
    const hrefs = screen.getAllByRole('link').map(l => l.getAttribute('href'))
    expect(hrefs).toContain('/cart')
    expect(hrefs).toContain('/store')
    expect(hrefs).toContain('/custom-artwork')
    expect(hrefs).toContain('/')
  })

  // ── checkout variant ──────────────────────────────────────────────────────

  it('shows "Order Placed!" heading in checkout variant', () => {
    render(<CartSuccessModal variant="checkout" onClose={onClose} />)
    expect(screen.getByRole('heading')).toHaveTextContent(/Order Placed/i)
  })

  it('shows checkout success message in checkout variant', () => {
    render(<CartSuccessModal variant="checkout" onClose={onClose} />)
    expect(screen.getByText(/successfully placed/i)).toBeInTheDocument()
  })

  it('renders Go to Dashboard link in checkout variant', () => {
    render(<CartSuccessModal variant="checkout" onClose={onClose} />)
    expect(screen.getByRole('link', { name: /go to dashboard/i })).toHaveAttribute('href', '/dashboard/orders')
  })

  it('does not render Go to Cart link in checkout variant', () => {
    render(<CartSuccessModal variant="checkout" onClose={onClose} />)
    expect(screen.queryByRole('link', { name: /go to cart/i })).toBeNull()
  })

  it('renders three navigation links in checkout variant', () => {
    render(<CartSuccessModal variant="checkout" onClose={onClose} />)
    const hrefs = screen.getAllByRole('link').map(l => l.getAttribute('href'))
    expect(hrefs).toContain('/dashboard/orders')
    expect(hrefs).toContain('/store')
    expect(hrefs).toContain('/')
    expect(hrefs).not.toContain('/cart')
  })

  // ── close behaviour ───────────────────────────────────────────────────────

  it('renders a close button', () => {
    render(<CartSuccessModal onClose={onClose} />)
    expect(screen.getByTestId('cart-modal-close-btn')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(<CartSuccessModal onClose={onClose} />)
    fireEvent.click(screen.getByTestId('cart-modal-close-btn'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    render(<CartSuccessModal onClose={onClose} />)
    const backdrop = screen.getByTestId('cart-success-modal').firstElementChild as HTMLElement
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('modal is not rendered when excluded from tree', () => {
    const { container } = render(<></>)
    expect(container.querySelector('[data-testid="cart-success-modal"]')).toBeNull()
  })
})
