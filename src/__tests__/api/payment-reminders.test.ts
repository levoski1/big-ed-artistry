/**
 * @jest-environment node
 */

import { GET } from '@/app/api/cron/payment-reminders/route'
import { createAdminClient } from '@/lib/supabase/server'
import * as emailService from '@/lib/emailService'

jest.mock('@/lib/supabase/server')
jest.mock('@/lib/emailService')

const mockAdminClient = {
  from: jest.fn(),
}

describe('Payment Reminder Cron Job', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(createAdminClient as jest.Mock).mockReturnValue(mockAdminClient)
    process.env.CRON_SECRET = 'test-secret'
  })

  afterEach(() => {
    delete process.env.CRON_SECRET
  })

  describe('Authorization', () => {
    it('should reject requests without authorization header', async () => {
      const request = new Request('http://localhost:3000/api/cron/payment-reminders')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should reject requests with invalid token', async () => {
      const request = new Request('http://localhost:3000/api/cron/payment-reminders', {
        headers: { authorization: 'Bearer wrong-token' },
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should accept requests with valid token', async () => {
      mockAdminClient.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({ data: [], error: null }),
      }))

      const request = new Request('http://localhost:3000/api/cron/payment-reminders', {
        headers: { authorization: 'Bearer test-secret' },
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
    })
  })

  describe('Date Calculation', () => {
    it('should query orders with updated_at 7+ days ago', async () => {
      const selectMock = jest.fn().mockReturnThis()
      const eqMock = jest.fn().mockReturnThis()
      const lteMock = jest.fn().mockResolvedValue({ data: [], error: null })

      mockAdminClient.from.mockImplementation(() => ({
        select: selectMock,
        eq: eqMock,
        lte: lteMock,
      }))

      const request = new Request('http://localhost:3000/api/cron/payment-reminders', {
        headers: { authorization: 'Bearer test-secret' },
      })

      await GET(request)

      expect(mockAdminClient.from).toHaveBeenCalledWith('orders')
      expect(eqMock).toHaveBeenCalledWith('payment_status', 'PARTIALLY_PAID')
      
      // Check that lte was called with a date 7 days ago
      const lteCall = lteMock.mock.calls[0]
      expect(lteCall[0]).toBe('updated_at')
      
      const queryDate = new Date(lteCall[1])
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      // Allow 1 minute tolerance for test execution time
      const timeDiff = Math.abs(queryDate.getTime() - sevenDaysAgo.getTime())
      expect(timeDiff).toBeLessThan(60000)
    })
  })

  describe('No Reminders Needed', () => {
    it('should return count 0 when no orders found', async () => {
      mockAdminClient.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({ data: [], error: null }),
      }))

      const request = new Request('http://localhost:3000/api/cron/payment-reminders', {
        headers: { authorization: 'Bearer test-secret' },
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.count).toBe(0)
      expect(data.message).toBe('No reminders to send')
    })

    it('should return count 0 when no payments are old enough', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          order_number: 'BEA-2024-001',
          user_id: 'user-1',
          total_amount: 80000,
          amount_paid: 40000,
          amount_remaining: 40000,
          updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      const mockPayments = [
        {
          order_id: 'order-1',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          verified_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            lte: jest.fn().mockResolvedValue({ data: mockOrders, error: null }),
          }
        }
        if (table === 'payments') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockPayments, error: null }),
          }
        }
        return {}
      })

      const request = new Request('http://localhost:3000/api/cron/payment-reminders', {
        headers: { authorization: 'Bearer test-secret' },
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.count).toBe(0)
    })
  })

  describe('Sending Reminders', () => {
    it('should send reminders to user and admin for orders with 7+ day old payments', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          order_number: 'BEA-2024-001',
          user_id: 'user-1',
          total_amount: 80000,
          amount_paid: 40000,
          amount_remaining: 40000,
          updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      const mockPayments = [
        {
          order_id: 'order-1',
          created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          verified_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      const mockProfiles = [
        {
          id: 'user-1',
          email: 'customer@example.com',
          full_name: 'John Doe',
        },
      ]

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            lte: jest.fn().mockResolvedValue({ data: mockOrders, error: null }),
          }
        }
        if (table === 'payments') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockPayments, error: null }),
          }
        }
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({ data: mockProfiles, error: null }),
          }
        }
        return {}
      })

      const sendPaymentReminderMock = jest.fn().mockResolvedValue({ success: true })
      const sendToAdminMock = jest.fn().mockResolvedValue({ success: true })
      ;(emailService.sendPaymentReminder as jest.Mock) = sendPaymentReminderMock
      ;(emailService.sendToAdmin as jest.Mock) = sendToAdminMock

      const request = new Request('http://localhost:3000/api/cron/payment-reminders', {
        headers: { authorization: 'Bearer test-secret' },
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.total).toBe(1)
      expect(data.successful).toBe(1)
      expect(data.failed).toBe(0)

      expect(sendPaymentReminderMock).toHaveBeenCalledWith('customer@example.com', {
        name: 'John Doe',
        orderNumber: 'BEA-2024-001',
        balanceDue: 40000,
      })

      expect(sendToAdminMock).toHaveBeenCalledWith(
        'Payment Reminder Sent — BEA-2024-001',
        expect.stringContaining('John Doe')
      )
      expect(sendToAdminMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('₦40,000')
      )
    })

    it('should handle multiple orders', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          order_number: 'BEA-2024-001',
          user_id: 'user-1',
          total_amount: 80000,
          amount_paid: 40000,
          amount_remaining: 40000,
          updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'order-2',
          order_number: 'BEA-2024-002',
          user_id: 'user-2',
          total_amount: 100000,
          amount_paid: 50000,
          amount_remaining: 50000,
          updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      const mockPayments = [
        {
          order_id: 'order-1',
          created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          verified_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          order_id: 'order-2',
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          verified_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      const mockProfiles = [
        { id: 'user-1', email: 'user1@example.com', full_name: 'User One' },
        { id: 'user-2', email: 'user2@example.com', full_name: 'User Two' },
      ]

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            lte: jest.fn().mockResolvedValue({ data: mockOrders, error: null }),
          }
        }
        if (table === 'payments') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockPayments, error: null }),
          }
        }
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({ data: mockProfiles, error: null }),
          }
        }
        return {}
      })

      const sendPaymentReminderMock = jest.fn().mockResolvedValue({ success: true })
      const sendToAdminMock = jest.fn().mockResolvedValue({ success: true })
      ;(emailService.sendPaymentReminder as jest.Mock) = sendPaymentReminderMock
      ;(emailService.sendToAdmin as jest.Mock) = sendToAdminMock

      const request = new Request('http://localhost:3000/api/cron/payment-reminders', {
        headers: { authorization: 'Bearer test-secret' },
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.total).toBe(2)
      expect(data.successful).toBe(2)
      expect(sendPaymentReminderMock).toHaveBeenCalledTimes(2)
      expect(sendToAdminMock).toHaveBeenCalledTimes(2)
    })

    it('should skip orders without user email', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          order_number: 'BEA-2024-001',
          user_id: 'user-1',
          total_amount: 80000,
          amount_paid: 40000,
          amount_remaining: 40000,
          updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      const mockPayments = [
        {
          order_id: 'order-1',
          created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          verified_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            lte: jest.fn().mockResolvedValue({ data: mockOrders, error: null }),
          }
        }
        if (table === 'payments') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockPayments, error: null }),
          }
        }
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({ data: [], error: null }),
          }
        }
        return {}
      })

      const sendPaymentReminderMock = jest.fn()
      const sendToAdminMock = jest.fn()
      ;(emailService.sendPaymentReminder as jest.Mock) = sendPaymentReminderMock
      ;(emailService.sendToAdmin as jest.Mock) = sendToAdminMock

      const request = new Request('http://localhost:3000/api/cron/payment-reminders', {
        headers: { authorization: 'Bearer test-secret' },
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.total).toBe(1)
      expect(data.failed).toBe(1)
      expect(sendPaymentReminderMock).not.toHaveBeenCalled()
      expect(sendToAdminMock).not.toHaveBeenCalled()
    })

    it('should handle partial email failures gracefully', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          order_number: 'BEA-2024-001',
          user_id: 'user-1',
          total_amount: 80000,
          amount_paid: 40000,
          amount_remaining: 40000,
          updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      const mockPayments = [
        {
          order_id: 'order-1',
          created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          verified_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      const mockProfiles = [
        { id: 'user-1', email: 'customer@example.com', full_name: 'John Doe' },
      ]

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            lte: jest.fn().mockResolvedValue({ data: mockOrders, error: null }),
          }
        }
        if (table === 'payments') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockPayments, error: null }),
          }
        }
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({ data: mockProfiles, error: null }),
          }
        }
        return {}
      })

      const sendPaymentReminderMock = jest.fn().mockResolvedValue({ success: true })
      const sendToAdminMock = jest.fn().mockResolvedValue({ success: false, error: 'Admin email failed' })
      ;(emailService.sendPaymentReminder as jest.Mock) = sendPaymentReminderMock
      ;(emailService.sendToAdmin as jest.Mock) = sendToAdminMock

      const request = new Request('http://localhost:3000/api/cron/payment-reminders', {
        headers: { authorization: 'Bearer test-secret' },
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.total).toBe(1)
      expect(data.failed).toBe(1)
      expect(data.successful).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('should use email as fallback when full_name is missing', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          order_number: 'BEA-2024-001',
          user_id: 'user-1',
          total_amount: 80000,
          amount_paid: 40000,
          amount_remaining: 40000,
          updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      const mockPayments = [
        {
          order_id: 'order-1',
          created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          verified_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      const mockProfiles = [
        { id: 'user-1', email: 'customer@example.com', full_name: null },
      ]

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            lte: jest.fn().mockResolvedValue({ data: mockOrders, error: null }),
          }
        }
        if (table === 'payments') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockPayments, error: null }),
          }
        }
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({ data: mockProfiles, error: null }),
          }
        }
        return {}
      })

      const sendPaymentReminderMock = jest.fn().mockResolvedValue({ success: true })
      const sendToAdminMock = jest.fn().mockResolvedValue({ success: true })
      ;(emailService.sendPaymentReminder as jest.Mock) = sendPaymentReminderMock
      ;(emailService.sendToAdmin as jest.Mock) = sendToAdminMock

      const request = new Request('http://localhost:3000/api/cron/payment-reminders', {
        headers: { authorization: 'Bearer test-secret' },
      })
      await GET(request)

      expect(sendPaymentReminderMock).toHaveBeenCalledWith('customer@example.com', {
        name: 'customer@example.com',
        orderNumber: 'BEA-2024-001',
        balanceDue: 40000,
      })
    })

    it('should handle database errors gracefully', async () => {
      mockAdminClient.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
      }))

      const request = new Request('http://localhost:3000/api/cron/payment-reminders', {
        headers: { authorization: 'Bearer test-secret' },
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Database error')
    })
  })
})
