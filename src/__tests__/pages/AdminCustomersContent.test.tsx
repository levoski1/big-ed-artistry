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
jest.mock('@/app/actions/admin', () => ({
  deleteUser: jest.fn(),
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

const mockDeleteUser = jest.mocked(require('@/app/actions/admin').deleteUser)

describe('AdminCustomersContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

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

  // ── Delete functionality ────────────────────────────────────────────

  it('shows Del button for each customer row', () => {
    render(<AdminCustomersContent customers={[makeCustomer()]} />)
    expect(screen.getByTestId('delete-user-u1')).toBeInTheDocument()
  })

  it('shows Delete User button in detail panel', () => {
    render(<AdminCustomersContent customers={[makeCustomer()]} />)
    fireEvent.click(screen.getByText('Jane Doe'))
    expect(screen.getByTestId('delete-user-panel')).toBeInTheDocument()
  })

  it('opens confirmation modal when Del button is clicked', () => {
    render(<AdminCustomersContent customers={[makeCustomer()]} />)
    fireEvent.click(screen.getByTestId('delete-user-u1'))
    expect(screen.getByTestId('confirm-delete-modal')).toBeInTheDocument()
  })

  it('opens confirmation modal from detail panel Delete User button', () => {
    render(<AdminCustomersContent customers={[makeCustomer()]} />)
    fireEvent.click(screen.getByText('Jane Doe'))
    fireEvent.click(screen.getByTestId('delete-user-panel'))
    expect(screen.getByTestId('confirm-delete-modal')).toBeInTheDocument()
  })

  it('confirmation modal shows customer name and email', () => {
    render(<AdminCustomersContent customers={[makeCustomer()]} />)
    fireEvent.click(screen.getByTestId('delete-user-u1'))
    const nameMatches = screen.getAllByText('Jane Doe')
    expect(nameMatches.length).toBeGreaterThan(0)
    const emailMatches = screen.getAllByText('jane@test.com')
    expect(emailMatches.length).toBeGreaterThan(0)
  })

  it('confirmation modal shows warning message', () => {
    render(<AdminCustomersContent customers={[makeCustomer()]} />)
    fireEvent.click(screen.getByTestId('delete-user-u1'))
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument()
  })

  it('closes confirmation modal on cancel', () => {
    render(<AdminCustomersContent customers={[makeCustomer()]} />)
    fireEvent.click(screen.getByTestId('delete-user-u1'))
    expect(screen.getByTestId('confirm-delete-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('confirm-delete-cancel'))
    expect(screen.queryByTestId('confirm-delete-modal')).not.toBeInTheDocument()
  })

  it('calls deleteUser on confirm and removes customer from list', async () => {
    mockDeleteUser.mockResolvedValue({ success: true })
    render(<AdminCustomersContent customers={[makeCustomer()]} />)
    fireEvent.click(screen.getByTestId('delete-user-u1'))
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    expect(mockDeleteUser).toHaveBeenCalledWith('u1')
    // Wait for the state update
    await screen.findByText('No customers yet.')
    expect(screen.getByText('No customers yet.')).toBeInTheDocument()
  })

  it('calls deleteUser on confirm and shows success toast', async () => {
    mockDeleteUser.mockResolvedValue({ success: true })
    render(<AdminCustomersContent customers={[makeCustomer()]} />)
    fireEvent.click(screen.getByTestId('delete-user-u1'))
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    expect(await screen.findByTestId('toast-notification')).toBeInTheDocument()
    expect(screen.getByText('User deleted successfully.')).toBeInTheDocument()
  })

  it('shows error in modal when deleteUser fails', async () => {
    mockDeleteUser.mockResolvedValue({ error: 'Failed to delete user.' })
    render(<AdminCustomersContent customers={[makeCustomer()]} />)
    fireEvent.click(screen.getByTestId('delete-user-u1'))
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    expect(await screen.findByTestId('confirm-delete-error')).toHaveTextContent('Failed to delete user.')
  })

  it('removes customer from list after successful delete', async () => {
    mockDeleteUser.mockResolvedValue({ success: true })
    const customers = [
      makeCustomer({ id: 'u1', full_name: 'Jane Doe' }),
      makeCustomer({ id: 'u2', full_name: 'John Smith', orders: [] }),
    ]
    render(<AdminCustomersContent customers={customers} />)
    expect(screen.getByText('2 customers')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('delete-user-u1'))
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    expect(await screen.findByText('John Smith')).toBeInTheDocument()
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument()
    expect(screen.getByText('1 customers')).toBeInTheDocument()
  })

  it('closes detail panel when deleted customer was selected', async () => {
    mockDeleteUser.mockResolvedValue({ success: true })
    render(<AdminCustomersContent customers={[makeCustomer()]} />)
    fireEvent.click(screen.getByText('Jane Doe'))
    expect(screen.getByText('Order History')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('delete-user-panel'))
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    await screen.findByText('No customers yet.')
    expect(screen.queryByText('Order History')).not.toBeInTheDocument()
  })
})

describe('AdminCustomersContent — mobile responsiveness', () => {
  it('root element has admin-customers-page class', () => {
    const { container } = render(<AdminCustomersContent customers={[makeCustomer()]} />)
    expect(container.querySelector('.admin-customers-page')).toBeInTheDocument()
  })

  it('filters row has customers-filters class', () => {
    const { container } = render(<AdminCustomersContent customers={[]} />)
    expect(container.querySelector('.customers-filters')).toBeInTheDocument()
  })

  it('outer grid has customers-layout class', () => {
    const { container } = render(<AdminCustomersContent customers={[]} />)
    expect(container.querySelector('.customers-layout')).toBeInTheDocument()
  })

  it('table header has customers-table-head class', () => {
    const { container } = render(<AdminCustomersContent customers={[]} />)
    expect(container.querySelector('.customers-table-head')).toBeInTheDocument()
  })

  it('each customer row has customer-row class', () => {
    const customers = [makeCustomer(), makeCustomer({ id: 'u2', full_name: 'Bob', email: 'bob@test.com', orders: [] })]
    const { container } = render(<AdminCustomersContent customers={customers} />)
    expect(container.querySelectorAll('.customer-row')).toHaveLength(2)
  })

  it('each row contains customer-card-meta for mobile display', () => {
    const { container } = render(<AdminCustomersContent customers={[makeCustomer()]} />)
    expect(container.querySelector('.customer-card-meta')).toBeInTheDocument()
  })

  it('customer-card-meta contains email and order count', () => {
    const { container } = render(<AdminCustomersContent customers={[makeCustomer()]} />)
    const meta = container.querySelector('.customer-card-meta') as HTMLElement
    expect(meta.textContent).toContain('jane@test.com')
    expect(meta.textContent).toContain('1 orders')
  })

  it('detail panel has customer-detail-panel class when selected', () => {
    const { container } = render(<AdminCustomersContent customers={[makeCustomer()]} />)
    fireEvent.click(screen.getByText('Jane Doe'))
    expect(container.querySelector('.customer-detail-panel')).toBeInTheDocument()
  })

  it('style block contains mobile breakpoint', () => {
    const { container } = render(<AdminCustomersContent customers={[]} />)
    const styles = Array.from(container.querySelectorAll('style')).map(s => s.textContent ?? '').join('')
    expect(styles).toMatch(/\.admin-customers-page/)
    expect(styles).toMatch(/max-width:\s*700px/)
  })

  it('style block hides table header on mobile', () => {
    const { container } = render(<AdminCustomersContent customers={[]} />)
    const styles = Array.from(container.querySelectorAll('style')).map(s => s.textContent ?? '').join('')
    expect(styles).toMatch(/\.customers-table-head/)
    expect(styles).toMatch(/display:\s*none/)
  })

  it('style block makes detail panel non-sticky on mobile', () => {
    const { container } = render(<AdminCustomersContent customers={[]} />)
    const styles = Array.from(container.querySelectorAll('style')).map(s => s.textContent ?? '').join('')
    expect(styles).toMatch(/\.customer-detail-panel/)
    expect(styles).toMatch(/position:\s*static/)
  })

  it('style block contains tablet breakpoint', () => {
    const { container } = render(<AdminCustomersContent customers={[]} />)
    const styles = Array.from(container.querySelectorAll('style')).map(s => s.textContent ?? '').join('')
    expect(styles).toMatch(/min-width:\s*701px/)
    expect(styles).toMatch(/max-width:\s*1024px/)
  })
})
