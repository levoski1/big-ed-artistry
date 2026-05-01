/**
 * @jest-environment node
 */

import { sendEmail, sendToAdmin, _resetClient } from '@/lib/emailService'
import { Resend } from 'resend'

jest.mock('resend')

describe('Email Failure Handling & Logging', () => {
  let mockSend: jest.Mock
  let consoleLogSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    _resetClient()
    mockSend = jest.fn()
    ;(Resend as jest.MockedClass<typeof Resend>).mockImplementation(() => ({
      emails: { send: mockSend },
    } as any))

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    process.env.RESEND_API_KEY = 'test-key'
    process.env.EMAIL_FROM_NAME = 'Test App'
    process.env.EMAIL_FROM_ADDRESS = 'test@example.com'
    process.env.ADMIN_EMAIL = 'admin@example.com'
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    jest.clearAllMocks()
  })

  describe('Retry Logic', () => {
    it('should retry failed emails up to 3 times', async () => {
      mockSend
        .mockResolvedValueOnce({ data: null, error: { message: 'Network error' } })
        .mockResolvedValueOnce({ data: null, error: { message: 'Network error' } })
        .mockResolvedValueOnce({ data: { id: 'msg-123' }, error: null })

      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(mockSend).toHaveBeenCalledTimes(3)
      expect(result.success).toBe(true)
      expect(result.messageId).toBe('msg-123')
    })

    it('should return failure after 3 failed attempts', async () => {
      mockSend.mockResolvedValue({ data: null, error: { message: 'SMTP error' } })

      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(mockSend).toHaveBeenCalledTimes(4) // 3 retries + 1 admin alert
      expect(result.success).toBe(false)
      expect(result.error).toBe('SMTP error')
    })

    it('should increase delay between retries', async () => {
      const startTime = Date.now()
      mockSend.mockResolvedValue({ data: null, error: { message: 'Timeout' } })

      await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      const elapsed = Date.now() - startTime
      // Should have delays: 1000ms + 2000ms = 3000ms minimum
      expect(elapsed).toBeGreaterThanOrEqual(3000)
    })

    it('should succeed on first attempt if no error', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-456' }, error: null })

      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(result.success).toBe(true)
      expect(result.messageId).toBe('msg-456')
    })
  })

  describe('Structured Logging', () => {
    it('should log success with all details', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-789' }, error: null })

      await sendEmail({
        to: 'user@example.com',
        subject: 'Order Confirmation',
        html: '<p>Your order is confirmed</p>',
      })

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[emailService]',
        expect.stringContaining('"success":true')
      )

      const logCall = consoleLogSpy.mock.calls[0][1]
      const logData = JSON.parse(logCall)

      expect(logData).toMatchObject({
        level: 'info',
        recipient: 'user@example.com',
        subject: 'Order Confirmation',
        attempt: 1,
        success: true,
        messageId: 'msg-789',
      })
      expect(logData.timestamp).toBeDefined()
    })

    it('should log each failure attempt with details', async () => {
      mockSend.mockResolvedValue({ data: null, error: { message: 'Connection refused' } })

      await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      // Should have 3 error logs (one per attempt)
      const errorLogs = consoleErrorSpy.mock.calls.filter(
        call => call[0] === '[emailService]' && call[1].includes('"success":false')
      )
      expect(errorLogs).toHaveLength(3)

      // Check first failure log
      const firstLog = JSON.parse(errorLogs[0][1])
      expect(firstLog).toMatchObject({
        level: 'error',
        recipient: 'user@example.com',
        subject: 'Test',
        attempt: 1,
        success: false,
        error: 'Connection refused',
      })

      // Check last failure log
      const lastLog = JSON.parse(errorLogs[2][1])
      expect(lastLog.attempt).toBe(3)
    })

    it('should include timestamp in ISO format', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })

      await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      const logCall = consoleLogSpy.mock.calls[0][1]
      const logData = JSON.parse(logCall)

      expect(logData.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      expect(new Date(logData.timestamp).toISOString()).toBe(logData.timestamp)
    })

    it('should log error message for exceptions', async () => {
      mockSend.mockRejectedValue(new Error('Network timeout'))

      await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      const errorLogs = consoleErrorSpy.mock.calls.filter(
        call => call[0] === '[emailService]' && call[1].includes('"success":false')
      )

      const firstLog = JSON.parse(errorLogs[0][1])
      expect(firstLog.error).toBe('Network timeout')
    })
  })

  describe('Admin Failure Alerts', () => {
    it('should send alert to admin after all retries fail', async () => {
      mockSend.mockResolvedValue({ data: null, error: { message: 'Service unavailable' } })

      await sendEmail({
        to: 'user@example.com',
        subject: 'Payment Confirmation',
        html: '<p>Payment received</p>',
      })

      // Last call should be the admin alert
      const lastCall = mockSend.mock.calls[mockSend.mock.calls.length - 1][0]
      expect(lastCall.to).toBe('admin@example.com')
      expect(lastCall.subject).toBe('⚠️ Email Delivery Failure Alert')
      expect(lastCall.html).toContain('Email Delivery Failure')
      expect(lastCall.html).toContain('user@example.com')
      expect(lastCall.html).toContain('Payment Confirmation')
      expect(lastCall.html).toContain('Service unavailable')
      expect(lastCall.html).toContain('3 attempts')
    })

    it('should not send alert if ADMIN_EMAIL is not configured', async () => {
      delete process.env.ADMIN_EMAIL
      mockSend.mockResolvedValue({ data: null, error: { message: 'Error' } })

      await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      // Should only have 3 calls (the failed attempts), no admin alert
      expect(mockSend).toHaveBeenCalledTimes(3)
    })

    it('should not send alert when admin email itself fails (prevent infinite loop)', async () => {
      mockSend.mockResolvedValue({ data: null, error: { message: 'Error' } })

      await sendEmail({
        to: 'admin@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      // Should only have 3 calls (the failed attempts), no alert to admin about admin email
      expect(mockSend).toHaveBeenCalledTimes(3)
    })

    it('should handle alert sending failure gracefully', async () => {
      mockSend
        .mockResolvedValueOnce({ data: null, error: { message: 'User email failed' } })
        .mockResolvedValueOnce({ data: null, error: { message: 'User email failed' } })
        .mockResolvedValueOnce({ data: null, error: { message: 'User email failed' } })
        .mockRejectedValueOnce(new Error('Admin alert failed'))

      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      // Should not throw, should return failure result
      expect(result.success).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[emailService] Failed to send admin alert:',
        expect.any(Error)
      )
    })

    it('should include timestamp in admin alert', async () => {
      mockSend.mockResolvedValue({ data: null, error: { message: 'Error' } })

      await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      const alertCall = mockSend.mock.calls[mockSend.mock.calls.length - 1][0]
      expect(alertCall.html).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('System Stability', () => {
    it('should not crash on email failure', async () => {
      mockSend.mockRejectedValue(new Error('Critical error'))

      await expect(
        sendEmail({
          to: 'user@example.com',
          subject: 'Test',
          html: '<p>Test</p>',
        })
      ).resolves.toMatchObject({
        success: false,
        error: 'Critical error',
      })
    })

    it('should handle non-Error exceptions', async () => {
      mockSend.mockRejectedValue('String error')

      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('String error')
    })

    it('should handle undefined error messages', async () => {
      mockSend.mockResolvedValue({ data: null, error: {} as any })

      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('sendToAdmin helper', () => {
    it('should return error if ADMIN_EMAIL not configured', async () => {
      delete process.env.ADMIN_EMAIL

      const result = await sendToAdmin('Test Subject', '<p>Test</p>')

      expect(result.success).toBe(false)
      expect(result.error).toBe('ADMIN_EMAIL not configured')
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('should send email to admin if configured', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-admin' }, error: null })

      const result = await sendToAdmin('New Order Alert', '<p>Order details</p>')

      expect(result.success).toBe(true)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'admin@example.com',
          subject: 'New Order Alert',
          html: '<p>Order details</p>',
        })
      )
    })
  })

  describe('Integration with retry and logging', () => {
    it('should log all retry attempts and final success', async () => {
      mockSend
        .mockResolvedValueOnce({ data: null, error: { message: 'Retry 1' } })
        .mockResolvedValueOnce({ data: null, error: { message: 'Retry 2' } })
        .mockResolvedValueOnce({ data: { id: 'success' }, error: null })

      await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      // Should have 2 error logs + 1 success log
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2)
      expect(consoleLogSpy).toHaveBeenCalledTimes(1)

      const successLog = JSON.parse(consoleLogSpy.mock.calls[0][1])
      expect(successLog.attempt).toBe(3)
      expect(successLog.success).toBe(true)
    })

    it('should log all failures and send admin alert', async () => {
      mockSend.mockResolvedValue({ data: null, error: { message: 'Persistent error' } })

      await sendEmail({
        to: 'user@example.com',
        subject: 'Important Email',
        html: '<p>Content</p>',
      })

      // Should have 3 error logs for attempts
      const errorLogs = consoleErrorSpy.mock.calls.filter(
        call => call[0] === '[emailService]' && call[1].includes('"success":false')
      )
      expect(errorLogs).toHaveLength(3)

      // Should have sent admin alert
      const alertCall = mockSend.mock.calls[3][0]
      expect(alertCall.to).toBe('admin@example.com')
      expect(alertCall.html).toContain('Important Email')
    })
  })
})
