/**
 * Integration tests for createOrder — verifies that user confirmation and
 * admin alert emails are sent with correct data after a successful order.
 */

import { createOrder } from '@/app/actions/orders'
import * as emailService from '@/lib/emailService'

// ─── Mock Supabase ────────────────────────────────────────────────────────

const mockOrder = {
  id: 'order-uuid-1',
  user_id: 'user-uuid-1',
  order_number: 'BEA-2024-001',
  status: 'pending',
  payment_status: 'NOT_PAID',
  delivery_location: 'port_harcourt',
  delivery_address: '12 Test Street',
  delivery_bus_stop: 'Test Stop',
  delivery_fee: 2000,
  subtotal: 45000,
  total_amount: 47000,
  amount_paid: 0,
  amount_remaining: 47000,
  notes: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockUser = {
  id: 'user-uuid-1',
  email: 'customer@example.com',
  user_metadata: { full_name: 'Adaeze Obi' },
}

// Supabase client mock — all chained calls resolve successfully
const mockSingle = jest.fn()
const mockSelect = jest.fn(() => ({ single: mockSingle }))
const mockInsertOrder = jest.fn(() => ({ select: mockSelect }))
const mockInsertItems = jest.fn(() => Promise.resolve({ error: null }))
const mockRpc = jest.fn(() => Promise.resolve({ data: 'BEA-2024-001', error: null }))
const mockGetUser = jest.fn(() => Promise.resolve({ data: { user: mockUser } }))

// Admin client mock
const mockUpsert = jest.fn(() => Promise.resolve({ error: null }))
const mockAdminFrom = jest.fn(() => ({ upsert: mockUpsert }))
const mockGenerateLink = jest.fn(() =>
  Promise.resolve({ data: { properties: { action_link: 'https://example.com/confirm' } }, error: null })
)

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: jest.fn((table: string) => {
        if (table === 'orders') return { insert: mockInsertOrder }
        if (table === 'order_items') return { insert: mockInsertItems }
        return {}
      }),
      rpc: mockRpc,
    })
  ),
  createAdminClient: jest.fn(() => ({
    from: mockAdminFrom,
    auth: { admin: { generateLink: mockGenerateLink } },
  })),
}))

// ─── Mock email service ───────────────────────────────────────────────────

jest.mock('@/lib/emailService', () => ({
  sendOrderConfirmation: jest.fn(() => Promise.resolve({ success: true, messageId: 'msg-user' })),
  sendAdminNewOrder: jest.fn(() => Promise.resolve({ success: true, messageId: 'msg-admin' })),
}))

// ─── Test data ────────────────────────────────────────────────────────────

const orderPayload = {
  delivery_location: 'port_harcourt' as const,
  delivery_address: '12 Test Street',
  delivery_bus_stop: 'Test Stop',
  delivery_fee: 2000,
  subtotal: 45000,
  total_amount: 47000,
}

const itemsPayload = [
  {
    item_type: 'artwork' as const,
    artwork_type: 'custom_artwork' as const,
    size_label: 'A3',
    canvas_option: 'Charcoal',
    item_subtotal: 45000,
    quantity: 1,
    base_price: 45000,
    canvas_price: 0,
    frame_price: 0,
    glass_price: 0,
  },
]

// ─── Setup ────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
  mockSingle.mockResolvedValue({ data: mockOrder, error: null })
  mockInsertItems.mockResolvedValue({ error: null })
})

// ─── Tests ────────────────────────────────────────────────────────────────

describe('createOrder — email notifications', () => {
  it('sends user confirmation email with correct order data', async () => {
    await createOrder(orderPayload, itemsPayload)

    expect(emailService.sendOrderConfirmation).toHaveBeenCalledTimes(1)
    expect(emailService.sendOrderConfirmation).toHaveBeenCalledWith(
      'customer@example.com',
      expect.objectContaining({
        name: 'Adaeze Obi',
        orderNumber: 'BEA-2024-001',
        service: 'Custom Artwork',
        size: 'A3',
        medium: 'Charcoal',
        total: 47000,
      })
    )
  })

  it('sends admin alert email with correct order data', async () => {
    await createOrder(orderPayload, itemsPayload)

    expect(emailService.sendAdminNewOrder).toHaveBeenCalledTimes(1)
    expect(emailService.sendAdminNewOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: 'Adaeze Obi',
        customerEmail: 'customer@example.com',
        orderNumber: 'BEA-2024-001',
        service: 'Custom Artwork',
        total: 47000,
      })
    )
  })

  it('sends both emails on the same order creation', async () => {
    await createOrder(orderPayload, itemsPayload)

    expect(emailService.sendOrderConfirmation).toHaveBeenCalledTimes(1)
    expect(emailService.sendAdminNewOrder).toHaveBeenCalledTimes(1)
  })

  it('still returns the order even if emails fail', async () => {
    jest.mocked(emailService.sendOrderConfirmation).mockResolvedValueOnce({ success: false, error: 'SMTP error' })
    jest.mocked(emailService.sendAdminNewOrder).mockResolvedValueOnce({ success: false, error: 'SMTP error' })

    const result = await createOrder(orderPayload, itemsPayload)

    expect(result.order_number).toBe('BEA-2024-001')
  })

  it('labels photo enlargement service correctly', async () => {
    const enlargementItems = [{ ...itemsPayload[0], artwork_type: 'photo_enlargement' as const }]

    await createOrder(orderPayload, enlargementItems)

    expect(emailService.sendOrderConfirmation).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ service: 'Photo Enlargement' })
    )
  })

  it('labels store product service correctly', async () => {
    const storeItems = [{ ...itemsPayload[0], item_type: 'store_product' as const, artwork_type: null }]

    await createOrder(orderPayload, storeItems)

    expect(emailService.sendOrderConfirmation).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ service: 'Store Product' })
    )
  })

  it('uses fallback values when item fields are missing', async () => {
    const minimalItems = [{ item_type: 'artwork' as const, item_subtotal: 45000, quantity: 1, base_price: 45000, canvas_price: 0, frame_price: 0, glass_price: 0 }]

    await createOrder(orderPayload, minimalItems)

    expect(emailService.sendOrderConfirmation).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ size: '—', medium: '—' })
    )
  })
})
