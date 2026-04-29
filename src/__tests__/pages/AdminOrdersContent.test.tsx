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
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('₦50,000')).toBeInTheDocument()
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
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
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
