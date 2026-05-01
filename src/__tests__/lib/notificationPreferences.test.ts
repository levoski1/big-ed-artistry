/**
 * @jest-environment node
 */

import {
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendPaymentConfirmation,
  sendPaymentReminder,
  sendOrderStatusUpdate,
  _resetClient,
} from '@/lib/emailService'
import { Resend } from 'resend'

jest.mock('resend')

// Mock the notificationPreferences module (used via dynamic import inside emailService)
const mockGetPreferencesForUser = jest.fn()
jest.mock('@/lib/notificationPreferences', () => ({
  getPreferencesForUser: (...args: unknown[]) => mockGetPreferencesForUser(...args),
  DEFAULT_PREFERENCES: {
    order_confirmation: true,
    payment_confirmation: true,
    payment_reminder: true,
    order_status_update: true,
    welcome: true,
  },
}))

const ALL_ON = {
  order_confirmation: true,
  payment_confirmation: true,
  payment_reminder: true,
  order_status_update: true,
  welcome: true,
}

describe('Notification Preference Gating', () => {
  let mockSend: jest.Mock

  beforeEach(() => {
    _resetClient()
    mockSend = jest.fn().mockResolvedValue({ data: { id: 'msg-1' }, error: null })
    ;(Resend as jest.MockedClass<typeof Resend>).mockImplementation(
      () => ({ emails: { send: mockSend } } as any)
    )
    process.env.RESEND_API_KEY = 'test-key'
    process.env.EMAIL_FROM_ADDRESS = 'test@example.com'
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  describe('sendWelcomeEmail', () => {
    const data = { name: 'Alice' }

    it('sends when welcome is enabled', async () => {
      mockGetPreferencesForUser.mockResolvedValue({ ...ALL_ON })
      const result = await sendWelcomeEmail('alice@example.com', data as any, 'user-1')
      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(result.success).toBe(true)
    })

    it('skips when welcome is disabled', async () => {
      mockGetPreferencesForUser.mockResolvedValue({ ...ALL_ON, welcome: false })
      const result = await sendWelcomeEmail('alice@example.com', data as any, 'user-1')
      expect(mockSend).not.toHaveBeenCalled()
      expect(result.success).toBe(true)
      expect(result.messageId).toBe('skipped:opted-out')
    })

    it('sends without checking prefs when no userId provided', async () => {
      const result = await sendWelcomeEmail('alice@example.com', data as any)
      expect(mockGetPreferencesForUser).not.toHaveBeenCalled()
      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(result.success).toBe(true)
    })
  })

  describe('sendOrderConfirmation', () => {
    const data = { orderNumber: 'ORD-001', total: 50000, items: [], customerName: 'Bob' }

    it('sends when order_confirmation is enabled', async () => {
      mockGetPreferencesForUser.mockResolvedValue({ ...ALL_ON })
      const result = await sendOrderConfirmation('bob@example.com', data as any, 'user-2')
      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(result.success).toBe(true)
    })

    it('skips when order_confirmation is disabled', async () => {
      mockGetPreferencesForUser.mockResolvedValue({ ...ALL_ON, order_confirmation: false })
      const result = await sendOrderConfirmation('bob@example.com', data as any, 'user-2')
      expect(mockSend).not.toHaveBeenCalled()
      expect(result.messageId).toBe('skipped:opted-out')
    })

    it('re-enables: sends after preference toggled back on', async () => {
      mockGetPreferencesForUser.mockResolvedValueOnce({ ...ALL_ON, order_confirmation: false })
      const skipped = await sendOrderConfirmation('bob@example.com', data as any, 'user-2')
      expect(skipped.messageId).toBe('skipped:opted-out')

      mockGetPreferencesForUser.mockResolvedValueOnce({ ...ALL_ON, order_confirmation: true })
      const sent = await sendOrderConfirmation('bob@example.com', data as any, 'user-2')
      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(sent.success).toBe(true)
    })
  })

  describe('sendPaymentConfirmation', () => {
    const data = { orderNumber: 'ORD-002', amountPaid: 25000, total: 25000, isPartial: false, customerName: 'Carol' }

    it('sends when payment_confirmation is enabled', async () => {
      mockGetPreferencesForUser.mockResolvedValue({ ...ALL_ON })
      const result = await sendPaymentConfirmation('carol@example.com', data as any, 'user-3')
      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(result.success).toBe(true)
    })

    it('skips when payment_confirmation is disabled', async () => {
      mockGetPreferencesForUser.mockResolvedValue({ ...ALL_ON, payment_confirmation: false })
      const result = await sendPaymentConfirmation('carol@example.com', data as any, 'user-3')
      expect(mockSend).not.toHaveBeenCalled()
      expect(result.messageId).toBe('skipped:opted-out')
    })
  })

  describe('sendPaymentReminder', () => {
    const data = { orderNumber: 'ORD-003', balanceDue: 10000, dueDate: '2026-06-01', customerName: 'Dave' }

    it('sends when payment_reminder is enabled', async () => {
      mockGetPreferencesForUser.mockResolvedValue({ ...ALL_ON })
      const result = await sendPaymentReminder('dave@example.com', data as any, 'user-4')
      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(result.success).toBe(true)
    })

    it('skips when payment_reminder is disabled', async () => {
      mockGetPreferencesForUser.mockResolvedValue({ ...ALL_ON, payment_reminder: false })
      const result = await sendPaymentReminder('dave@example.com', data as any, 'user-4')
      expect(mockSend).not.toHaveBeenCalled()
      expect(result.messageId).toBe('skipped:opted-out')
    })
  })

  describe('sendOrderStatusUpdate', () => {
    const data = { orderNumber: 'ORD-004', status: 'in_progress', customerName: 'Eve' }

    it('sends when order_status_update is enabled', async () => {
      mockGetPreferencesForUser.mockResolvedValue({ ...ALL_ON })
      const result = await sendOrderStatusUpdate('eve@example.com', data as any, 'user-5')
      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(result.success).toBe(true)
    })

    it('skips when order_status_update is disabled', async () => {
      mockGetPreferencesForUser.mockResolvedValue({ ...ALL_ON, order_status_update: false })
      const result = await sendOrderStatusUpdate('eve@example.com', data as any, 'user-5')
      expect(mockSend).not.toHaveBeenCalled()
      expect(result.messageId).toBe('skipped:opted-out')
    })
  })

  describe('userId handling', () => {
    it('calls getPreferencesForUser with the correct userId', async () => {
      mockGetPreferencesForUser.mockResolvedValue({ ...ALL_ON })
      await sendOrderConfirmation(
        'x@example.com',
        { orderNumber: 'X', total: 0, items: [], customerName: 'X' } as any,
        'specific-user-id'
      )
      expect(mockGetPreferencesForUser).toHaveBeenCalledWith('specific-user-id')
    })

    it('does not call getPreferencesForUser when userId is omitted', async () => {
      await sendOrderConfirmation(
        'x@example.com',
        { orderNumber: 'X', total: 0, items: [], customerName: 'X' } as any
      )
      expect(mockGetPreferencesForUser).not.toHaveBeenCalled()
    })
  })
})
