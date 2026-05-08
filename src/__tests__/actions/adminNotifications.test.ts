/**
 * @jest-environment node
 */

import { updateOrderStatus } from '@/app/actions/orders'
import { verifyPayment } from '@/app/actions/payments'
import type { Database } from '@/lib/types/database'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import * as emailService from '@/lib/emailService'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/emailService')

const mockAdminClient = {
  from: jest.fn(),
  auth: { getUser: jest.fn() },
}

const mockClient = {
  from: jest.fn(),
  auth: { getUser: jest.fn() },
}

describe('Admin Confirmation Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(createAdminClient as jest.Mock).mockReturnValue(mockAdminClient)
    ;(createClient as jest.Mock).mockResolvedValue(mockClient)
  })

  describe('updateOrderStatus', () => {
    it('should send email notification when order status is updated', async () => {
      const mockOrder = {
        id: 'order-1',
        order_number: 'BEA-2024-001',
        user_id: 'user-1',
        status: 'confirmed',
        total_amount: 45000,
      }

      const mockProfile = {
        id: 'user-1',
        email: 'customer@example.com',
        full_name: 'John Doe',
      }

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
          }
        }
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }
        }
        return {}
      })

      const sendOrderStatusUpdateMock = jest.fn().mockResolvedValue({ success: true })
      ;(emailService.sendOrderStatusUpdate as jest.Mock) = sendOrderStatusUpdateMock

      await updateOrderStatus('order-1', 'in_progress')

      expect(sendOrderStatusUpdateMock).toHaveBeenCalledWith('customer@example.com', {
        name: 'John Doe',
        orderNumber: 'BEA-2024-001',
        status: 'in_progress',
      })
    })

    it('should handle email failure gracefully without throwing', async () => {
      const mockOrder = {
        id: 'order-1',
        order_number: 'BEA-2024-001',
        user_id: 'user-1',
        status: 'in_progress',
      }

      const mockProfile = {
        id: 'user-1',
        email: 'customer@example.com',
        full_name: 'Jane Smith',
      }

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
          }
        }
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }
        }
        return {}
      })

      const sendOrderStatusUpdateMock = jest.fn().mockRejectedValue(new Error('Email service down'))
      ;(emailService.sendOrderStatusUpdate as jest.Mock) = sendOrderStatusUpdateMock

      const result = await updateOrderStatus('order-1', 'in_progress')

      expect(result).toEqual(mockOrder)
      expect(sendOrderStatusUpdateMock).toHaveBeenCalled()
    })

    it('should not send email if profile has no email', async () => {
      const mockOrder = {
        id: 'order-1',
        order_number: 'BEA-2024-001',
        user_id: 'user-1',
        status: 'completed',
      }

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
          }
        }
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return {}
      })

      const sendOrderStatusUpdateMock = jest.fn()
      ;(emailService.sendOrderStatusUpdate as jest.Mock) = sendOrderStatusUpdateMock

      await updateOrderStatus('order-1', 'completed')

      expect(sendOrderStatusUpdateMock).not.toHaveBeenCalled()
    })

    it('should send notification for all status transitions', async () => {
      const statuses = ['pending', 'in_progress', 'completed', 'canceled']
      const sendOrderStatusUpdateMock = jest.fn().mockResolvedValue({ success: true })
      ;(emailService.sendOrderStatusUpdate as jest.Mock) = sendOrderStatusUpdateMock

      for (const status of statuses) {
        const mockOrder = {
          id: 'order-1',
          order_number: 'BEA-2024-001',
          user_id: 'user-1',
          status,
        }

        const mockProfile = {
          id: 'user-1',
          email: 'customer@example.com',
          full_name: 'Test User',
        }

        mockAdminClient.from.mockImplementation((table: string) => {
          if (table === 'orders') {
            return {
              update: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
            }
          }
          if (table === 'profiles') {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
            }
          }
          return {}
        })

        await updateOrderStatus('order-1', status as Database['public']['Tables']['orders']['Update']['status'])

        expect(sendOrderStatusUpdateMock).toHaveBeenCalledWith('customer@example.com', {
          name: 'Test User',
          orderNumber: 'BEA-2024-001',
          status,
        })

        sendOrderStatusUpdateMock.mockClear()
      }
    })
  })

  describe('verifyPayment', () => {
    beforeEach(() => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'admin@example.com' } },
        error: null,
      })
    })

    it('should send email notifications when payment is verified (full payment)', async () => {
      const mockPayment = {
        id: 'payment-1',
        order_id: 'order-1',
        user_id: 'user-1',
        amount: 45000,
        status: 'verified',
        verified_by: 'admin-1',
        verified_at: new Date().toISOString(),
      }

      const mockOrder = {
        id: 'order-1',
        order_number: 'BEA-2024-001',
        total_amount: 45000,
        amount_paid: 0,
      }

      const mockProfile = {
        id: 'user-1',
        email: 'customer@example.com',
        full_name: 'John Doe',
      }

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'payments') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockPayment, error: null }),
            update: jest.fn().mockReturnThis(),
          }
        }
        if (table === 'orders') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
            update: jest.fn().mockReturnThis(),
          }
        }
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }
        }
        return {}
      })

      const sendPaymentConfirmationMock = jest.fn().mockResolvedValue({ success: true })
      const sendAdminPaymentReceivedMock = jest.fn().mockResolvedValue({ success: true })
      ;(emailService.sendPaymentConfirmation as jest.Mock) = sendPaymentConfirmationMock
      ;(emailService.sendAdminPaymentReceived as jest.Mock) = sendAdminPaymentReceivedMock

      await verifyPayment('payment-1')

      expect(sendPaymentConfirmationMock).toHaveBeenCalledWith('customer@example.com', {
        name: 'John Doe',
        orderNumber: 'BEA-2024-001',
        amountPaid: 45000,
        total: 45000,
        isPartial: false,
        balanceDue: undefined,
      })

      expect(sendAdminPaymentReceivedMock).toHaveBeenCalledWith({
        customerName: 'John Doe',
        orderNumber: 'BEA-2024-001',
        amount: 45000,
        isPartial: false,
      })
    })

    it('should send email notifications for partial payment', async () => {
      const mockPayment = {
        id: 'payment-1',
        order_id: 'order-1',
        user_id: 'user-1',
        amount: 20000,
        status: 'verified',
      }

      const mockOrder = {
        id: 'order-1',
        order_number: 'BEA-2024-002',
        total_amount: 80000,
        amount_paid: 30000,
      }

      const mockProfile = {
        id: 'user-1',
        email: 'customer@example.com',
        full_name: 'Jane Smith',
      }

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'payments') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockPayment, error: null }),
            update: jest.fn().mockReturnThis(),
          }
        }
        if (table === 'orders') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
            update: jest.fn().mockReturnThis(),
          }
        }
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }
        }
        return {}
      })

      const sendPaymentConfirmationMock = jest.fn().mockResolvedValue({ success: true })
      const sendAdminPaymentReceivedMock = jest.fn().mockResolvedValue({ success: true })
      ;(emailService.sendPaymentConfirmation as jest.Mock) = sendPaymentConfirmationMock
      ;(emailService.sendAdminPaymentReceived as jest.Mock) = sendAdminPaymentReceivedMock

      await verifyPayment('payment-1')

      expect(sendPaymentConfirmationMock).toHaveBeenCalledWith('customer@example.com', {
        name: 'Jane Smith',
        orderNumber: 'BEA-2024-002',
        amountPaid: 20000,
        total: 80000,
        isPartial: true,
        balanceDue: 30000,
      })

      expect(sendAdminPaymentReceivedMock).toHaveBeenCalledWith({
        customerName: 'Jane Smith',
        orderNumber: 'BEA-2024-002',
        amount: 20000,
        isPartial: true,
      })
    })

    it('should not send email if profile is not found', async () => {
      const mockPayment = {
        id: 'payment-1',
        order_id: 'order-1',
        user_id: 'user-1',
        amount: 45000,
        status: 'verified',
      }

      const mockOrder = {
        id: 'order-1',
        order_number: 'BEA-2024-001',
        total_amount: 45000,
        amount_paid: 0,
      }

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'payments') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockPayment, error: null }),
            update: jest.fn().mockReturnThis(),
          }
        }
        if (table === 'orders') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
            update: jest.fn().mockReturnThis(),
          }
        }
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return {}
      })

      const sendPaymentConfirmationMock = jest.fn()
      const sendAdminPaymentReceivedMock = jest.fn()
      ;(emailService.sendPaymentConfirmation as jest.Mock) = sendPaymentConfirmationMock
      ;(emailService.sendAdminPaymentReceived as jest.Mock) = sendAdminPaymentReceivedMock

      await verifyPayment('payment-1')

      expect(sendPaymentConfirmationMock).not.toHaveBeenCalled()
      expect(sendAdminPaymentReceivedMock).not.toHaveBeenCalled()
    })
  })

  describe('Integration: Email content validation', () => {
    it('should include correct user details in order status notification', async () => {
      const mockOrder = {
        id: 'order-1',
        order_number: 'BEA-2024-001',
        user_id: 'user-1',
        status: 'confirmed',
      }

      const mockProfile = {
        id: 'user-1',
        email: 'test@example.com',
        full_name: 'Test Customer',
      }

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
          }
        }
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }
        }
        return {}
      })

      const sendOrderStatusUpdateMock = jest.fn().mockResolvedValue({ success: true })
      ;(emailService.sendOrderStatusUpdate as jest.Mock) = sendOrderStatusUpdateMock

      await updateOrderStatus('order-1', 'in_progress')

      const callArgs = sendOrderStatusUpdateMock.mock.calls[0]
      expect(callArgs[0]).toBe('test@example.com')
      expect(callArgs[1]).toMatchObject({
        name: 'Test Customer',
        orderNumber: 'BEA-2024-001',
        status: 'in_progress',
      })
    })

    it('should use email as fallback name if full_name is missing', async () => {
      const mockOrder = {
        id: 'order-1',
        order_number: 'BEA-2024-001',
        user_id: 'user-1',
        status: 'confirmed',
      }

      const mockProfile = {
        id: 'user-1',
        email: 'test@example.com',
        full_name: null,
      }

      mockAdminClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
          }
        }
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }
        }
        return {}
      })

      const sendOrderStatusUpdateMock = jest.fn().mockResolvedValue({ success: true })
      ;(emailService.sendOrderStatusUpdate as jest.Mock) = sendOrderStatusUpdateMock

      await updateOrderStatus('order-1', 'completed')

      const callArgs = sendOrderStatusUpdateMock.mock.calls[0]
      expect(callArgs[1].name).toBe('test@example.com')
    })
  })
})
