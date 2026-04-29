import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import AdminCustomersContent from '@/app/admin/(protected)/customers/AdminCustomersContent'
import type { Database } from '@/lib/types/database'

jest.mock('@/lib/tokens', () => ({
  formatPrice: (n: number) => `₦${n.toLocaleString()}`,
  formatDate: (s: string) => s,
}))
jest.mock('@/components/ui', () => ({
  StatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}))

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  orders: {
    id: string; user_id: string; order_number: string
    total_amount: number; amount_paid: number
    status: string; payment_status: string; created_at: string
  }[]
}

const makeCustomer = (overrides: Partial<Profile> = {}): Profile => ({
  id: 'u1', full_name: 'Jane Doe', email: 'jane@test.com',
  phone: '+234 800 000 0000', role: 'customer',
  created_at: '2024-01-01', updated_at: '2024-01-01',
  orders: [
    { id: 'o1', user_id: 'u1', order_number: 'ORD-001', total_amount: 50000, amount_paid: 25000, status: 'in_progress', payment_status: 'PARTIALLY_PAID', created_at: '2024-01-15' },
  ],
  ...overrides,
})

describe('AdminCustomersContent', () => {
  it('shows empty state when no customers', () => {
    render(<AdminCustomersContent customers={[]} />)
    expect(screen.getByText('No customers yet.')).toBeInTheDocument()
  })

  it('renders customer rows', () => {
    render(<AdminCustomersContent customers={[makeCustomer()]} />)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@test.com')).toBeInTheDocument()
    expect(screen.getByText('+234 800 000 0000')).toBeInTheDocument()
  })

  it('shows customer count', () => {
    render(<AdminCustomersContent customers={[makeCustomer()]} />)
    expect(screen.getByText('1 customers')).toBeInTheDocument()
  })

  it('filters by search term', () => {
    const customers = [
      makeCustomer({ id: 'u1', full_name: 'Jane Doe', email: 'jane@test.com' }),
      makeCustomer({ id: 'u2', full_name: 'John Smith', email: 'john@test.com', orders: [] }),
    ]
    render(<AdminCustomersContent customers={customers} />)
    fireEvent.change(screen.getByPlaceholderText(/search by name or email/i), { target: { value: 'jane' } })
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.queryByText('John Smith')).not.toBeInTheDocument()
  })

  it('opens detail panel on row click', () => {
    render(<AdminCustomersContent customers={[makeCustomer()]} />)
    fireEvent.click(screen.getByText('Jane Doe'))
    expect(screen.getByText('Order History')).toBeInTheDocument()
    expect(screen.getByText('ORD-001')).toBeInTheDocument()
  })

  it('shows total spent in detail panel', () => {
    render(<AdminCustomersContent customers={[makeCustomer()]} />)
    fireEvent.click(screen.getByText('Jane Doe'))
    expect(screen.getByText('₦25,000')).toBeInTheDocument()
  })

  it('closes detail panel on ✕ click', () => {
    render(<AdminCustomersContent customers={[makeCustomer()]} />)
    fireEvent.click(screen.getByText('Jane Doe'))
    fireEvent.click(screen.getByRole('button', { name: /✕/i }))
    expect(screen.queryByText('Order History')).not.toBeInTheDocument()
  })

  it('shows — for missing phone', () => {
    render(<AdminCustomersContent customers={[makeCustomer({ phone: null })]} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
