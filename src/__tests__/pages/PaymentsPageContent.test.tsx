import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import PaymentsPageContent from '@/app/dashboard/payments/PaymentsPageContent'
import type { Database } from '@/lib/types/database'

jest.mock('@/lib/tokens', () => ({
  formatPrice: (n: number) => `₦${n.toLocaleString()}`,
  formatDate: (s: string) => s,
}))
jest.mock('@/components/ui', () => ({
  StatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
  FormGroup: ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div><label>{label}</label>{children}</div>
  ),
  Select: ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
    <select {...props}>{children}</select>
  ),
}))
jest.mock('@/app/actions/uploads', () => ({ uploadPaymentReceipt: jest.fn() }))
jest.mock('@/app/actions/payments', () => ({ submitPayment: jest.fn() }))

type Order = Database['public']['Tables']['orders']['Row']
type Upload = Database['public']['Tables']['uploads']['Row']

const makeOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'o1', order_number: 'ORD-001', user_id: 'u1',
  total_amount: 50000, status: 'pending', payment_status: 'NOT_PAID',
  delivery_location: 'port_harcourt', delivery_address: '', delivery_bus_stop: '',
  delivery_fee: 2000, subtotal: 48000, amount_paid: 0, amount_remaining: 50000,
  notes: null, created_at: '2024-01-15', updated_at: '2024-01-15',
  ...overrides,
})

const makeUpload = (overrides: Partial<Upload> = {}): Upload => ({
  id: 'up1', user_id: 'u1', order_item_id: 'o1',
  file_url: 'https://example.com/receipt.jpg',
  file_name: 'receipt.jpg', storage_path: '/uploads/receipt.jpg',
  file_type: 'payment_receipt' as const, file_size: 1024,
  created_at: '2024-01-15',
  ...overrides,
})

describe('PaymentsPageContent', () => {
  it('renders page heading', () => {
    render(<PaymentsPageContent orders={[]} paymentUploads={[]} artworkUploads={[]} />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Payment Proof')).toBeInTheDocument()
  })

  it('shows all orders paid message when no unpaid orders', () => {
    const paidOrder = makeOrder({ payment_status: 'FULLY_PAID' })
    render(<PaymentsPageContent orders={[paidOrder]} paymentUploads={[]} artworkUploads={[]} />)
    expect(screen.getByText(/all orders have been paid/i)).toBeInTheDocument()
  })

  it('lists unpaid orders in sidebar', () => {
    render(<PaymentsPageContent orders={[makeOrder()]} paymentUploads={[]} artworkUploads={[]} />)
    expect(screen.getByText('ORD-001')).toBeInTheDocument()
  })

  it('submit button is disabled when no order or file selected', () => {
    render(<PaymentsPageContent orders={[makeOrder()]} paymentUploads={[]} artworkUploads={[]} />)
    expect(screen.getByRole('button', { name: /submit payment proof/i })).toBeDisabled()
  })

  it('renders bank transfer details', () => {
    render(<PaymentsPageContent orders={[]} paymentUploads={[]} artworkUploads={[]} />)
    expect(screen.getByText('Keystone')).toBeInTheDocument()
    expect(screen.getByText('Fairmoney')).toBeInTheDocument()
    expect(screen.getByText('Dikibo Eric Tamunonenqiyeofori')).toBeInTheDocument()
  })

  it('renders payment receipts when provided', () => {
    render(<PaymentsPageContent orders={[]} paymentUploads={[makeUpload()]} artworkUploads={[]} />)
    expect(screen.getByText('Your Payment Receipts')).toBeInTheDocument()
  })

  it('renders artwork references when provided', () => {
    const artUpload = makeUpload({ id: 'up2', file_type: 'artwork_reference', file_name: 'ref.jpg' })
    render(<PaymentsPageContent orders={[]} paymentUploads={[]} artworkUploads={[artUpload]} />)
    expect(screen.getByText('Your Artwork References')).toBeInTheDocument()
  })

  it('shows tips section', () => {
    render(<PaymentsPageContent orders={[]} paymentUploads={[]} artworkUploads={[]} />)
    expect(screen.getByText(/tips for faster verification/i)).toBeInTheDocument()
  })
})
