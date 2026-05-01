import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import AdminOrdersContent from '@/app/admin/(protected)/orders/AdminOrdersContent'
import type { Database } from '@/lib/types/database'

jest.mock('@/lib/tokens', () => ({
  formatPrice: (n: number) => `₦${n.toLocaleString()}`,
  formatDate: (s: string) => s,
}))
jest.mock('@/components/ui', () => ({
  StatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}))
jest.mock('@/app/actions/orders', () => ({
  updateOrderStatus: jest.fn().mockResolvedValue({ id: 'o1', status: 'confirmed', payment_status: 'NOT_PAID' }),
}))
jest.mock('@/app/actions/uploads', () => ({
  getAdminUploadsForOrder: jest.fn().mockResolvedValue({ artworkRefs: [], paymentReceipts: [] }),
}))

type Order = Database['public']['Tables']['orders']['Row'] & {
  profiles?: { id: string; full_name: string; email: string; phone: string | null } | null
  order_items?: Database['public']['Tables']['order_items']['Row'][]
}

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'o1', order_number: 'ORD-001', user_id: 'u1',
  total_amount: 50000, status: 'pending', payment_status: 'NOT_PAID',
  delivery_location: 'port_harcourt', delivery_address: '5 Main St',
  delivery_bus_stop: '', delivery_fee: 2000, subtotal: 48000,
  amount_paid: 0, amount_remaining: 50000, notes: null,
  created_at: '2024-01-15', updated_at: '2024-01-15',
  profiles: { id: 'u1', full_name: 'Jane Doe', email: 'jane@test.com', phone: null },
  order_items: [],
  ...overrides,
})

describe('AdminOrdersContent', () => {
  it('shows empty state when no orders', () => {
    render(<AdminOrdersContent orders={[]} />)
    expect(screen.getByText('No orders found.')).toBeInTheDocument()
  })

  it('renders order rows', () => {
    render(<AdminOrdersContent orders={[makeOrder()]} />)
    expect(screen.getByText('ORD-001')).toBeInTheDocument()
    expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0)
    expect(screen.getAllByText('₦50,000').length).toBeGreaterThan(0)
  })

  it('shows order count', () => {
    render(<AdminOrdersContent orders={[makeOrder(), makeOrder({ id: 'o2', order_number: 'ORD-002' })]} />)
    expect(screen.getByText('2 orders')).toBeInTheDocument()
  })

  it('filters by search term', () => {
    const orders = [
      makeOrder({ id: 'o1', order_number: 'ORD-001', profiles: { id: 'u1', full_name: 'Jane Doe', email: 'jane@test.com', phone: null } }),
      makeOrder({ id: 'o2', order_number: 'ORD-002', profiles: { id: 'u2', full_name: 'John Smith', email: 'john@test.com', phone: null } }),
    ]
    render(<AdminOrdersContent orders={orders} />)
    fireEvent.change(screen.getByPlaceholderText(/search by name or order/i), { target: { value: 'jane' } })
    expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0)
    expect(screen.queryByText('John Smith')).not.toBeInTheDocument()
  })

  it('opens detail panel on row click', () => {
    render(<AdminOrdersContent orders={[makeOrder()]} />)
    fireEvent.click(screen.getByText('ORD-001'))
    expect(screen.getAllByText('Update Status').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Customer').length).toBeGreaterThan(1)
  })

  it('closes detail panel on ✕ click', () => {
    render(<AdminOrdersContent orders={[makeOrder()]} />)
    fireEvent.click(screen.getByText('ORD-001'))
    fireEvent.click(screen.getByRole('button', { name: /✕/i }))
    expect(screen.queryByText('Update Status')).not.toBeInTheDocument()
  })

  it('renders Export CSV button', () => {
    render(<AdminOrdersContent orders={[]} />)
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument()
  })
})

describe('AdminOrdersContent — mobile responsiveness', () => {
  it('root element has admin-orders-page class', () => {
    const { container } = render(<AdminOrdersContent orders={[makeOrder()]} />)
    expect(container.querySelector('.admin-orders-page')).toBeInTheDocument()
  })

  it('filters row has orders-filters class', () => {
    const { container } = render(<AdminOrdersContent orders={[]} />)
    expect(container.querySelector('.orders-filters')).toBeInTheDocument()
  })

  it('outer grid has orders-layout class', () => {
    const { container } = render(<AdminOrdersContent orders={[]} />)
    expect(container.querySelector('.orders-layout')).toBeInTheDocument()
  })

  it('table header row has orders-table-head class', () => {
    const { container } = render(<AdminOrdersContent orders={[]} />)
    expect(container.querySelector('.orders-table-head')).toBeInTheDocument()
  })

  it('each order row has order-row class', () => {
    const { container } = render(<AdminOrdersContent orders={[makeOrder(), makeOrder({ id: 'o2', order_number: 'ORD-002' })]} />)
    expect(container.querySelectorAll('.order-row')).toHaveLength(2)
  })

  it('each order row contains an order-card-meta element for mobile card layout', () => {
    const { container } = render(<AdminOrdersContent orders={[makeOrder()]} />)
    expect(container.querySelector('.order-card-meta')).toBeInTheDocument()
  })

  it('order-card-meta contains customer name and total for mobile display', () => {
    const { container } = render(<AdminOrdersContent orders={[makeOrder()]} />)
    const meta = container.querySelector('.order-card-meta') as HTMLElement
    expect(meta.textContent).toContain('Jane Doe')
    expect(meta.textContent).toContain('₦50,000')
  })

  it('detail panel has order-detail-panel class when an order is selected', () => {
    const { container } = render(<AdminOrdersContent orders={[makeOrder()]} />)
    fireEvent.click(screen.getByText('ORD-001'))
    expect(container.querySelector('.order-detail-panel')).toBeInTheDocument()
  })

  it('injected style block contains mobile breakpoint for admin-orders-page', () => {
    const { container } = render(<AdminOrdersContent orders={[]} />)
    const styles = Array.from(container.querySelectorAll('style')).map(s => s.textContent ?? '').join('')
    expect(styles).toMatch(/\.admin-orders-page/)
    expect(styles).toMatch(/max-width:\s*700px/)
  })

  it('injected style block contains tablet breakpoint', () => {
    const { container } = render(<AdminOrdersContent orders={[]} />)
    const styles = Array.from(container.querySelectorAll('style')).map(s => s.textContent ?? '').join('')
    expect(styles).toMatch(/min-width:\s*701px/)
    expect(styles).toMatch(/max-width:\s*1024px/)
  })

  it('injected style block hides table header on mobile', () => {
    const { container } = render(<AdminOrdersContent orders={[]} />)
    const styles = Array.from(container.querySelectorAll('style')).map(s => s.textContent ?? '').join('')
    expect(styles).toMatch(/\.orders-table-head/)
    expect(styles).toMatch(/display:\s*none/)
  })

  it('injected style block makes detail panel non-sticky on mobile', () => {
    const { container } = render(<AdminOrdersContent orders={[]} />)
    const styles = Array.from(container.querySelectorAll('style')).map(s => s.textContent ?? '').join('')
    expect(styles).toMatch(/\.order-detail-panel/)
    expect(styles).toMatch(/position:\s*static/)
  })

  it('injected style block stacks filters column on mobile', () => {
    const { container } = render(<AdminOrdersContent orders={[]} />)
    const styles = Array.from(container.querySelectorAll('style')).map(s => s.textContent ?? '').join('')
    expect(styles).toMatch(/\.orders-filters/)
    expect(styles).toMatch(/flex-direction:\s*column/)
  })
})
