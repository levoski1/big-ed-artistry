import React from 'react'
import { render, screen } from '@testing-library/react'
import DashboardPageContent from '@/app/dashboard/DashboardPageContent'
import type { Database } from '@/lib/types/database'

jest.mock('next/link', () => ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>)
jest.mock('@/components/ui', () => ({
  StatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}))
jest.mock('@/lib/tokens', () => ({
  formatPrice: (n: number) => `₦${n.toLocaleString()}`,
  formatDate: (s: string) => s,
}))

type Profile = Database['public']['Tables']['profiles']['Row']
type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items: Database['public']['Tables']['order_items']['Row'][]
}

const mockProfile: Profile = {
  id: 'u1', full_name: 'Jane Doe', email: 'jane@test.com',
  phone: null, role: 'customer',
  created_at: '2024-01-01', updated_at: '2024-01-01',
}

const mockOrder: Order = {
  id: 'o1', order_number: 'ORD-001', user_id: 'u1',
  total_amount: 50000, status: 'pending', payment_status: 'NOT_PAID',
  delivery_location: 'port_harcourt', delivery_address: '', delivery_bus_stop: '',
  delivery_fee: 0, subtotal: 50000, amount_paid: 0, amount_remaining: 50000,
  idempotency_key: null, notes: null, created_at: '2024-01-15', updated_at: '2024-01-15',
  order_items: [],
}

describe('DashboardPageContent', () => {
  it('greets the user by first name', () => {
    render(<DashboardPageContent user={mockProfile} orders={[]} pendingPayment={0} completedCount={0} />)
    expect(screen.getByText(/welcome back, jane/i)).toBeInTheDocument()
  })

  it('shows correct total orders count', () => {
    render(<DashboardPageContent user={mockProfile} orders={[mockOrder]} pendingPayment={1} completedCount={0} />)
    expect(screen.getAllByText('1').length).toBeGreaterThan(0)
  })

  it('shows empty state when no orders', () => {
    render(<DashboardPageContent user={mockProfile} orders={[]} pendingPayment={0} completedCount={0} />)
    expect(screen.getByText('No orders yet')).toBeInTheDocument()
  })

  it('renders recent order number and amount', () => {
    render(<DashboardPageContent user={mockProfile} orders={[mockOrder]} pendingPayment={1} completedCount={0} />)
    expect(screen.getAllByText('ORD-001').length).toBeGreaterThan(0)
    expect(screen.getAllByText('₦50,000').length).toBeGreaterThan(0)
  })

  it('shows Pay link for unpaid orders', () => {
    render(<DashboardPageContent user={mockProfile} orders={[mockOrder]} pendingPayment={1} completedCount={0} />)
    expect(screen.getAllByRole('link', { name: /pay/i })[0]).toHaveAttribute('href', '/dashboard/payments')
  })

  it('shows quick action links', () => {
    render(<DashboardPageContent user={mockProfile} orders={[]} pendingPayment={0} completedCount={0} />)
    expect(screen.getByRole('link', { name: /commission new art/i })).toHaveAttribute('href', '/custom-artwork')
    expect(screen.getAllByRole('link', { name: /upload payment/i })[0]).toHaveAttribute('href', '/dashboard/payments')
  })

  it('handles null user gracefully', () => {
    render(<DashboardPageContent user={null} orders={[]} pendingPayment={0} completedCount={0} />)
    expect(screen.getByText(/welcome back, there/i)).toBeInTheDocument()
  })
})
