import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import OrdersPageContent from '@/app/dashboard/orders/OrdersPageContent'
import type { Database } from '@/lib/types/database'

jest.mock('next/link', () => ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>)
jest.mock('@/lib/tokens', () => ({
  formatPrice: (n: number) => `₦${n.toLocaleString()}`,
  formatDate: (s: string) => s,
}))
jest.mock('@/components/ui', () => ({
  StatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}))

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items: Database['public']['Tables']['order_items']['Row'][]
}

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'o1', order_number: 'ORD-001', user_id: 'u1',
  total_amount: 50000, status: 'pending', payment_status: 'NOT_PAID',
  delivery_location: 'port_harcourt', delivery_address: '5 Main St',
  delivery_bus_stop: '', delivery_fee: 2000, subtotal: 48000,
  amount_paid: 0, amount_remaining: 50000, notes: null,
  created_at: '2024-01-15', updated_at: '2024-01-15',
  order_items: [],
  ...overrides,
})

describe('OrdersPageContent', () => {
  it('shows empty state when no orders', () => {
    render(<OrdersPageContent orders={[]} />)
    expect(screen.getByText('No orders yet.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /place first order/i })).toHaveAttribute('href', '/custom-artwork')
  })

  it('renders order rows', () => {
    render(<OrdersPageContent orders={[makeOrder()]} />)
    expect(screen.getByText('ORD-001')).toBeInTheDocument()
    expect(screen.getByText('₦50,000')).toBeInTheDocument()
  })

  it('opens detail panel on row click', () => {
    render(<OrdersPageContent orders={[makeOrder()]} />)
    fireEvent.click(screen.getByText('ORD-001'))
    // Detail panel shows order number in header
    expect(screen.getAllByText('ORD-001').length).toBeGreaterThan(1)
    expect(screen.getByText('Order Timeline')).toBeInTheDocument()
  })

  it('closes detail panel on ✕ click', () => {
    render(<OrdersPageContent orders={[makeOrder()]} />)
    fireEvent.click(screen.getByText('ORD-001'))
    fireEvent.click(screen.getByRole('button', { name: /✕/i }))
    expect(screen.queryByText('Order Timeline')).not.toBeInTheDocument()
  })

  it('shows Upload Payment link for unpaid orders in detail panel', () => {
    render(<OrdersPageContent orders={[makeOrder()]} />)
    fireEvent.click(screen.getByText('ORD-001'))
    expect(screen.getByRole('link', { name: /upload payment proof/i })).toHaveAttribute('href', '/dashboard/payments')
  })

  it('does not show payment link for fully paid orders', () => {
    render(<OrdersPageContent orders={[makeOrder({ payment_status: 'FULLY_PAID' })]} />)
    fireEvent.click(screen.getByText('ORD-001'))
    expect(screen.queryByRole('link', { name: /upload payment proof/i })).not.toBeInTheDocument()
  })

  it('shows notes when present', () => {
    render(<OrdersPageContent orders={[makeOrder({ notes: 'Please rush this order' })]} />)
    fireEvent.click(screen.getByText('ORD-001'))
    expect(screen.getByText('Please rush this order')).toBeInTheDocument()
  })

  it('renders New Order link', () => {
    render(<OrdersPageContent orders={[]} />)
    expect(screen.getByRole('link', { name: /\+ new order/i })).toHaveAttribute('href', '/custom-artwork')
  })
})
