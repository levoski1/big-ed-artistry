/**
 * Tests for verifyPayment — confirms correct notification emails are sent
 * for both full and partial payments.
 */

import { verifyPayment } from '@/app/actions/payments'
import * as emailService from '@/lib/emailService'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

// ─── Fixtures ─────────────────────────────────────────────────────────────

const PAYMENT_ID = 'pay-uuid-1'

const mockPayment = {
  id: PAYMENT_ID,
  user_id: 'user-uuid-1',
  order_id: 'order-uuid-1',
  amount: 25000,
  status: 'pending',
}

const mockOrder = {
  order_number: 'BEA-2024-001',
  total_amount: 50000,
  amount_paid: 0,
}

const mockProfile = {
  email: 'customer@example.com',
  full_name: 'Adaeze Obi',
}

const mockVerifiedPayment = { ...mockPayment, status: 'verified' }

// ─── Supabase mock ────────────────────────────────────────────────────────

const mockAdminFrom = jest.fn()
const mockGetUser = jest.fn(() => Promise.resolve({ data: { user: { id: 'admin-uuid' } } }))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve({ auth: { getUser: mockGetUser } })),
  createAdminClient: jest.fn(() => ({ from: mockAdminFrom })),
}))

// ─── Email service mock ───────────────────────────────────────────────────

jest.mock('@/lib/emailService', () => ({
  sendPaymentConfirmation: jest.fn(() => Promise.resolve({ success: true })),
  sendAdminPaymentReceived: jest.fn(() => Promise.resolve({ success: true })),
}))

// ─── Helpers ──────────────────────────────────────────────────────────────

function setupAdminFrom(amountPaid = 0) {
  mockAdminFrom.mockImplementation((table: string) => {
    if (table === 'payments') {
      return {
        select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockPayment, error: null })) })) })),
        update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockVerifiedPayment, error: null })) })) })) })),
      }
    }
    if (table === 'orders') {
      return {
        select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: { ...mockOrder, amount_paid: amountPaid }, error: null })) })) })),
        update: jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ error: null })) })),
      }
    }
    if (table === 'profiles') {
      return {
        select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockProfile, error: null })) })) })),
      }
    }
    return {}
  })
}

// ─── Tests ────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
})

describe('verifyPayment — full payment', () => {
  beforeEach(() => setupAdminFrom(0)) // 0 paid before → 25000 paid = still partial... use 25000 already paid

  it('sends full payment confirmation to user when balance is cleared', async () => {
    // amount_paid already 25000, payment.amount 25000 → total 50000 = FULLY_PAID
    setupAdminFrom(25000)
    await verifyPayment(PAYMENT_ID)

    expect(emailService.sendPaymentConfirmation).toHaveBeenCalledWith(
      'customer@example.com',
      expect.objectContaining({
        name: 'Adaeze Obi',
        orderNumber: 'BEA-2024-001',
        amountPaid: 25000,
        total: 50000,
        isPartial: false,
      })
    )
  })

  it('sends admin notification for full payment', async () => {
    setupAdminFrom(25000)
    await verifyPayment(PAYMENT_ID)

    expect(emailService.sendAdminPaymentReceived).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: 'Adaeze Obi',
        orderNumber: 'BEA-2024-001',
        amount: 25000,
        isPartial: false,
      })
    )
  })
})

describe('verifyPayment — partial payment', () => {
  beforeEach(() => setupAdminFrom(0)) // 0 paid before → 25000 paid of 50000 = PARTIALLY_PAID

  it('sends partial payment confirmation to user with balance due', async () => {
    await verifyPayment(PAYMENT_ID)

    expect(emailService.sendPaymentConfirmation).toHaveBeenCalledWith(
      'customer@example.com',
      expect.objectContaining({
        name: 'Adaeze Obi',
        orderNumber: 'BEA-2024-001',
        amountPaid: 25000,
        total: 50000,
        isPartial: true,
        balanceDue: 25000,
      })
    )
  })

  it('sends admin notification for partial payment', async () => {
    await verifyPayment(PAYMENT_ID)

    expect(emailService.sendAdminPaymentReceived).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: 'Adaeze Obi',
        orderNumber: 'BEA-2024-001',
        amount: 25000,
        isPartial: true,
      })
    )
  })
})

describe('verifyPayment — resilience', () => {
  it('still returns verified payment even if emails fail', async () => {
    setupAdminFrom(0)
    jest.mocked(emailService.sendPaymentConfirmation).mockResolvedValueOnce({ success: false, error: 'SMTP error' })
    jest.mocked(emailService.sendAdminPaymentReceived).mockResolvedValueOnce({ success: false, error: 'SMTP error' })

    const result = await verifyPayment(PAYMENT_ID)
    expect(result.status).toBe('verified')
  })

  it('sends no emails when profile is not found', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'payments') {
        return {
          select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockPayment, error: null })) })) })),
          update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockVerifiedPayment, error: null })) })) })) })),
        }
      }
      if (table === 'orders') {
        return {
          select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockOrder, error: null })) })) })),
          update: jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ error: null })) })),
        }
      }
      if (table === 'profiles') {
        return {
          select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: null, error: null })) })) })),
        }
      }
      return {}
    })

    await verifyPayment(PAYMENT_ID)
    expect(emailService.sendPaymentConfirmation).not.toHaveBeenCalled()
    expect(emailService.sendAdminPaymentReceived).not.toHaveBeenCalled()
  })
})

describe('verifyPayment — amount_remaining written to DB (Bug 1 fix)', () => {
  it('writes amount_remaining = total - newAmountPaid after partial payment', async () => {
    setupAdminFrom(0) // 0 paid before, payment.amount = 25000 → remaining = 25000
    let capturedUpdate: Record<string, unknown> = {}
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'payments') {
        return {
          select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockPayment, error: null })) })) })),
          update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockVerifiedPayment, error: null })) })) })) })),
        }
      }
      if (table === 'orders') {
        const updateFn = jest.fn((payload: Record<string, unknown>) => {
          capturedUpdate = payload
          return { eq: jest.fn(() => Promise.resolve({ error: null })) }
        })
        return {
          select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: { ...mockOrder, amount_paid: 0 }, error: null })) })) })),
          update: updateFn,
        }
      }
      if (table === 'profiles') {
        return { select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockProfile, error: null })) })) })) }
      }
      return {}
    })

    await verifyPayment(PAYMENT_ID)

    // amount_paid = 0 + 25000 = 25000; amount_remaining = 50000 - 25000 = 25000
    expect(capturedUpdate).toMatchObject({
      amount_paid: 25000,
      amount_remaining: 25000,
      payment_status: 'PARTIALLY_PAID',
    })
  })

  it('writes amount_remaining = 0 after full payment clears balance', async () => {
    let capturedUpdate: Record<string, unknown> = {}
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'payments') {
        return {
          select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockPayment, error: null })) })) })),
          update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockVerifiedPayment, error: null })) })) })) })),
        }
      }
      if (table === 'orders') {
        const updateFn = jest.fn((payload: Record<string, unknown>) => {
          capturedUpdate = payload
          return { eq: jest.fn(() => Promise.resolve({ error: null })) }
        })
        return {
          // 25000 already paid; payment.amount = 25000 → total = 50000 = FULLY_PAID
          select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: { ...mockOrder, amount_paid: 25000 }, error: null })) })) })),
          update: updateFn,
        }
      }
      if (table === 'profiles') {
        return { select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: mockProfile, error: null })) })) })) }
      }
      return {}
    })

    await verifyPayment(PAYMENT_ID)

    // amount_paid = 25000 + 25000 = 50000; amount_remaining = 50000 - 50000 = 0
    expect(capturedUpdate).toMatchObject({
      amount_paid: 50000,
      amount_remaining: 0,
      payment_status: 'FULLY_PAID',
    })
  })
})