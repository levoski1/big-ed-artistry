/**
 * Tests verifying that mutating server actions call revalidatePath with the
 * correct paths so both user and admin dashboards stay in sync.
 *
 * Covered actions:
 *   orders.ts    — createOrder, updateOrderStatus
 *   payments.ts  — submitPayment, verifyPayment, rejectPayment
 *   admin.ts     — updateOrderPaymentStatus
 */

// ─── Mock next/cache ──────────────────────────────────────────────────────

const mockRevalidatePath = jest.fn()
jest.mock('next/cache', () => ({ revalidatePath: mockRevalidatePath }))

// ─── Shared Supabase fixtures ─────────────────────────────────────────────

const mockOrder = {
  id: 'order-1', order_number: 'BEA-001', user_id: 'user-1',
  total_amount: 50000, amount_paid: 0, amount_remaining: 50000,
  status: 'pending', payment_status: 'NOT_PAID',
  delivery_location: 'port_harcourt', delivery_address: '1 Test St',
  delivery_bus_stop: 'Stop', delivery_fee: 2000, subtotal: 48000,
  notes: null, created_at: '2024-01-01', updated_at: '2024-01-01',
}

const mockPayment = {
  id: 'pay-1', user_id: 'user-1', order_id: 'order-1',
  amount: 25000, payment_type: 'partial', status: 'pending',
  receipt_url: 'https://example.com/r.jpg',
  verified_by: null, verified_at: null, rejection_reason: null,
  created_at: '2024-01-01',
}

const mockProfile = { email: 'user@test.com', full_name: 'Test User' }

// ─── orders.ts mocks ──────────────────────────────────────────────────────

const mockOrderSingle = jest.fn()
const mockOrderInsert = jest.fn(() => ({ select: jest.fn(() => ({ single: mockOrderSingle })) }))
const mockItemsOrder = jest.fn(() => Promise.resolve({ data: [], error: null }))
const mockItemsEq = jest.fn(() => ({ order: mockItemsOrder }))
const mockItemsSelect = jest.fn(() => ({ eq: mockItemsEq }))
const mockItemsInsert = jest.fn(() => Promise.resolve({ error: null }))
const mockRpc = jest.fn(() => Promise.resolve({ data: 'BEA-001', error: null }))
const mockGetUser = jest.fn(() => Promise.resolve({ data: { user: { id: 'user-1', email: 'user@test.com', user_metadata: { full_name: 'Test User' } } } }))
const mockUpsert = jest.fn(() => Promise.resolve({ error: null }))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({
    auth: { getUser: mockGetUser },
    from: jest.fn((table: string) => {
      if (table === 'orders') return { insert: mockOrderInsert }
      if (table === 'order_items') return { insert: mockItemsInsert, select: mockItemsSelect }
      if (table === 'payments') return {
        insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockPayment, error: null })) })) })),
      }
      return {}
    }),
    rpc: mockRpc,
  })),
  createAdminClient: jest.fn(() => ({
    from: mockAdminFrom,
    auth: { admin: {} },
  })),
}))

jest.mock('@/lib/emailService', () => ({
  sendOrderConfirmation: jest.fn(() => Promise.resolve({ success: true })),
  sendAdminNewOrder: jest.fn(() => Promise.resolve({ success: true })),
  sendPaymentConfirmation: jest.fn(() => Promise.resolve({ success: true })),
  sendAdminPaymentReceived: jest.fn(() => Promise.resolve({ success: true })),
  sendOrderStatusUpdate: jest.fn(() => Promise.resolve({ success: true })),
}))

// ─── Admin client mock (shared, configured per describe) ──────────────────

const mockAdminFrom = jest.fn()

function setupAdminFromForOrders() {
  mockAdminFrom.mockImplementation((table: string) => {
    if (table === 'profiles') {
      return {
        upsert: mockUpsert,
        select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockProfile, error: null })) })) })),
      }
    }
    if (table === 'orders') {
      return {
        update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockOrder, error: null })) })) })) })),
      }
    }
    return {}
  })
}

function setupAdminFromForPayments(amountPaid = 0) {
  mockAdminFrom.mockImplementation((table: string) => {
    if (table === 'payments') {
      return {
        select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockPayment, error: null })) })) })),
        update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: { ...mockPayment, status: 'verified' }, error: null })) })) })) })),
        insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockPayment, error: null })) })) })),
      }
    }
    if (table === 'orders') {
      return {
        select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: { ...mockOrder, amount_paid: amountPaid }, error: null })) })) })),
        update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ error: null })) })) })) })),
      }
    }
    if (table === 'profiles') {
      return { select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockProfile, error: null })) })) })) }
    }
    return {}
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const revalidatedPaths = () => mockRevalidatePath.mock.calls.map(c => c[0] as string)

// ─── Setup ────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
  mockOrderSingle.mockResolvedValue({ data: mockOrder, error: null })
})

// ═══════════════════════════════════════════════════════════════════════════
// orders.ts
// ═══════════════════════════════════════════════════════════════════════════

describe('createOrder — revalidatePath', () => {
  const orderPayload = {
    delivery_location: 'port_harcourt' as const,
    delivery_address: '1 Test St', delivery_bus_stop: 'Stop',
    delivery_fee: 2000, subtotal: 48000, total_amount: 50000,
  }
  const itemsPayload = [{
    item_type: 'artwork' as const, artwork_type: 'custom_artwork' as const,
    size_label: 'A3', item_subtotal: 48000, quantity: 1,
    base_price: 48000, canvas_price: 0, frame_price: 0, glass_price: 0,
  }]

  beforeEach(() => setupAdminFromForOrders())

  it('revalidates /dashboard after order creation', async () => {
    const { createOrder } = await import('@/app/actions/orders')
    await createOrder(orderPayload, itemsPayload)
    expect(revalidatedPaths()).toContain('/dashboard')
  })

  it('revalidates /dashboard/orders after order creation', async () => {
    const { createOrder } = await import('@/app/actions/orders')
    await createOrder(orderPayload, itemsPayload)
    expect(revalidatedPaths()).toContain('/dashboard/orders')
  })

  it('revalidates /dashboard/payments after order creation', async () => {
    const { createOrder } = await import('@/app/actions/orders')
    await createOrder(orderPayload, itemsPayload)
    expect(revalidatedPaths()).toContain('/dashboard/payments')
  })

  it('revalidates /admin/dashboard after order creation', async () => {
    const { createOrder } = await import('@/app/actions/orders')
    await createOrder(orderPayload, itemsPayload)
    expect(revalidatedPaths()).toContain('/admin/dashboard')
  })

  it('revalidates /admin/orders after order creation', async () => {
    const { createOrder } = await import('@/app/actions/orders')
    await createOrder(orderPayload, itemsPayload)
    expect(revalidatedPaths()).toContain('/admin/orders')
  })
})

describe('updateOrderStatus — revalidatePath', () => {
  beforeEach(() => setupAdminFromForOrders())

  it('revalidates /dashboard after status update', async () => {
    const { updateOrderStatus } = await import('@/app/actions/orders')
    await updateOrderStatus('order-1', 'in_progress')
    expect(revalidatedPaths()).toContain('/dashboard')
  })

  it('revalidates /dashboard/orders after status update', async () => {
    const { updateOrderStatus } = await import('@/app/actions/orders')
    await updateOrderStatus('order-1', 'in_progress')
    expect(revalidatedPaths()).toContain('/dashboard/orders')
  })

  it('revalidates /admin/orders after status update', async () => {
    const { updateOrderStatus } = await import('@/app/actions/orders')
    await updateOrderStatus('order-1', 'in_progress')
    expect(revalidatedPaths()).toContain('/admin/orders')
  })

  it('revalidates /admin/dashboard after status update', async () => {
    const { updateOrderStatus } = await import('@/app/actions/orders')
    await updateOrderStatus('order-1', 'in_progress')
    expect(revalidatedPaths()).toContain('/admin/dashboard')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// payments.ts
// ═══════════════════════════════════════════════════════════════════════════

describe('submitPayment — revalidatePath', () => {
  beforeEach(() => setupAdminFromForPayments())

  it('revalidates /dashboard after payment submission', async () => {
    const { submitPayment } = await import('@/app/actions/payments')
    await submitPayment({ order_id: 'order-1', amount: 25000, payment_type: 'partial', receipt_url: 'https://x.com/r.jpg' })
    expect(revalidatedPaths()).toContain('/dashboard')
  })

  it('revalidates /dashboard/payments after payment submission', async () => {
    const { submitPayment } = await import('@/app/actions/payments')
    await submitPayment({ order_id: 'order-1', amount: 25000, payment_type: 'partial', receipt_url: 'https://x.com/r.jpg' })
    expect(revalidatedPaths()).toContain('/dashboard/payments')
  })

  it('revalidates /dashboard/orders after payment submission', async () => {
    const { submitPayment } = await import('@/app/actions/payments')
    await submitPayment({ order_id: 'order-1', amount: 25000, payment_type: 'partial', receipt_url: 'https://x.com/r.jpg' })
    expect(revalidatedPaths()).toContain('/dashboard/orders')
  })

  it('revalidates /admin/payments after payment submission', async () => {
    const { submitPayment } = await import('@/app/actions/payments')
    await submitPayment({ order_id: 'order-1', amount: 25000, payment_type: 'partial', receipt_url: 'https://x.com/r.jpg' })
    expect(revalidatedPaths()).toContain('/admin/payments')
  })
})

describe('verifyPayment — revalidatePath', () => {
  beforeEach(() => setupAdminFromForPayments(0))

  it('revalidates /dashboard after verification', async () => {
    const { verifyPayment } = await import('@/app/actions/payments')
    await verifyPayment('pay-1')
    expect(revalidatedPaths()).toContain('/dashboard')
  })

  it('revalidates /dashboard/orders after verification', async () => {
    const { verifyPayment } = await import('@/app/actions/payments')
    await verifyPayment('pay-1')
    expect(revalidatedPaths()).toContain('/dashboard/orders')
  })

  it('revalidates /dashboard/payments after verification', async () => {
    const { verifyPayment } = await import('@/app/actions/payments')
    await verifyPayment('pay-1')
    expect(revalidatedPaths()).toContain('/dashboard/payments')
  })

  it('revalidates /admin/payments after verification', async () => {
    const { verifyPayment } = await import('@/app/actions/payments')
    await verifyPayment('pay-1')
    expect(revalidatedPaths()).toContain('/admin/payments')
  })

  it('revalidates /admin/orders after verification', async () => {
    const { verifyPayment } = await import('@/app/actions/payments')
    await verifyPayment('pay-1')
    expect(revalidatedPaths()).toContain('/admin/orders')
  })

  it('revalidates /admin/dashboard after verification', async () => {
    const { verifyPayment } = await import('@/app/actions/payments')
    await verifyPayment('pay-1')
    expect(revalidatedPaths()).toContain('/admin/dashboard')
  })
})

describe('rejectPayment — revalidatePath', () => {
  beforeEach(() => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'payments') {
        return {
          update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: { ...mockPayment, status: 'rejected' }, error: null })) })) })) })),
        }
      }
      return {}
    })
  })

  it('revalidates /dashboard/payments after rejection', async () => {
    const { rejectPayment } = await import('@/app/actions/payments')
    await rejectPayment('pay-1', 'Blurry image')
    expect(revalidatedPaths()).toContain('/dashboard/payments')
  })

  it('revalidates /admin/payments after rejection', async () => {
    const { rejectPayment } = await import('@/app/actions/payments')
    await rejectPayment('pay-1', 'Blurry image')
    expect(revalidatedPaths()).toContain('/admin/payments')
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// admin.ts
// ═══════════════════════════════════════════════════════════════════════════

describe('updateOrderPaymentStatus — revalidatePath', () => {
  beforeEach(() => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        return {
          update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockOrder, error: null })) })) })) })),
        }
      }
      return {}
    })
  })

  it('revalidates /dashboard after payment status update', async () => {
    const { updateOrderPaymentStatus } = await import('@/app/actions/admin')
    await updateOrderPaymentStatus('order-1', 'FULLY_PAID', 50000)
    expect(revalidatedPaths()).toContain('/dashboard')
  })

  it('revalidates /dashboard/orders after payment status update', async () => {
    const { updateOrderPaymentStatus } = await import('@/app/actions/admin')
    await updateOrderPaymentStatus('order-1', 'FULLY_PAID', 50000)
    expect(revalidatedPaths()).toContain('/dashboard/orders')
  })

  it('revalidates /dashboard/payments after payment status update', async () => {
    const { updateOrderPaymentStatus } = await import('@/app/actions/admin')
    await updateOrderPaymentStatus('order-1', 'FULLY_PAID', 50000)
    expect(revalidatedPaths()).toContain('/dashboard/payments')
  })

  it('revalidates /admin/orders after payment status update', async () => {
    const { updateOrderPaymentStatus } = await import('@/app/actions/admin')
    await updateOrderPaymentStatus('order-1', 'FULLY_PAID', 50000)
    expect(revalidatedPaths()).toContain('/admin/orders')
  })

  it('revalidates /admin/payments after payment status update', async () => {
    const { updateOrderPaymentStatus } = await import('@/app/actions/admin')
    await updateOrderPaymentStatus('order-1', 'FULLY_PAID', 50000)
    expect(revalidatedPaths()).toContain('/admin/payments')
  })

  it('revalidates /admin/dashboard after payment status update', async () => {
    const { updateOrderPaymentStatus } = await import('@/app/actions/admin')
    await updateOrderPaymentStatus('order-1', 'FULLY_PAID', 50000)
    expect(revalidatedPaths()).toContain('/admin/dashboard')
  })
})
