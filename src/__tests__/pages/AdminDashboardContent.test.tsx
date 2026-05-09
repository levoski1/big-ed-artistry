import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import AdminDashboardContent from '@/app/admin/(protected)/dashboard/AdminDashboardContent'
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
  profiles?: { id: string; full_name: string; email: string; phone: string | null } | null
  order_items?: Database['public']['Tables']['order_items']['Row'][]
}

const mockStats = {
  totalOrders: 12, totalRevenue: 500000, totalCustomers: 8,
  pendingOrders: 3, inProgressOrders: 2, completedOrders: 5,
  pendingPayments: 4, totalProducts: 10, inStockProducts: 8,
}

const makeOrder = (): Order => ({
  id: 'o1', order_number: 'ORD-001', user_id: 'u1',
  total_amount: 50000, status: 'pending', payment_status: 'NOT_PAID',
  delivery_location: 'port_harcourt', delivery_address: '', delivery_bus_stop: '',
  delivery_fee: 2000, subtotal: 48000, amount_paid: 0, amount_remaining: 50000,
  idempotency_key: null, notes: null, created_at: '2024-01-15', updated_at: '2024-01-15',
  profiles: { id: 'u1', full_name: 'Jane Doe', email: 'jane@test.com', phone: null },
  order_items: [],
})

describe('AdminDashboardContent', () => {
  it('renders stat cards with values', () => {
    render(<AdminDashboardContent stats={mockStats} recentOrders={[]} featuredProducts={[]} />)
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('₦500,000')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('shows zero stats when stats is null', () => {
    render(<AdminDashboardContent stats={null} recentOrders={[]} featuredProducts={[]} />)
    expect(screen.getAllByText('0').length).toBeGreaterThan(0)
  })

  it('shows empty state when no recent orders', () => {
    render(<AdminDashboardContent stats={mockStats} recentOrders={[]} featuredProducts={[]} />)
    expect(screen.getByText('No orders yet.')).toBeInTheDocument()
  })

  it('renders recent order rows', () => {
    render(<AdminDashboardContent stats={mockStats} recentOrders={[makeOrder()]} featuredProducts={[]} />)
    expect(screen.getByText('ORD-001')).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('₦50,000')).toBeInTheDocument()
  })

  it('renders quick action links', () => {
    render(<AdminDashboardContent stats={mockStats} recentOrders={[]} featuredProducts={[]} />)
    expect(screen.getByRole('link', { name: /manage orders/i })).toHaveAttribute('href', '/admin/orders')
    expect(screen.getByRole('link', { name: /verify payments/i })).toHaveAttribute('href', '/admin/payments')
    expect(screen.getByRole('link', { name: /view customers/i })).toHaveAttribute('href', '/admin/customers')
  })

  it('renders View All orders link', () => {
    render(<AdminDashboardContent stats={mockStats} recentOrders={[]} featuredProducts={[]} />)
    expect(screen.getByRole('link', { name: /view all/i })).toHaveAttribute('href', '/admin/orders')
  })
})
