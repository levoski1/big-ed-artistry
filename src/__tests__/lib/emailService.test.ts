import {
  sendEmail,
  sendToAdmin,
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendPaymentConfirmation,
  sendPaymentReminder,
  sendOrderStatusUpdate,
  sendAdminNewOrder,
  sendAdminPaymentReceived,
  _resetClient,
} from '@/lib/emailService'

import {
  welcomeTemplate,
  orderConfirmationTemplate,
  paymentConfirmationTemplate,
  paymentReminderTemplate,
  orderStatusUpdateTemplate,
  adminNewOrderTemplate,
  adminPaymentReceivedTemplate,
} from '@/lib/emailTemplates'

// ─── Mock Resend ──────────────────────────────────────────────────────────

const mockSend = jest.fn()

jest.mock('resend', () => ({
  Resend: jest.fn(() => ({ emails: { send: mockSend } })),
}))

// ─── Helpers ──────────────────────────────────────────────────────────────

function setEnv(overrides: Record<string, string | undefined> = {}) {
  process.env.RESEND_API_KEY = overrides.RESEND_API_KEY ?? 're_test_key'
  process.env.EMAIL_FROM_NAME = overrides.EMAIL_FROM_NAME ?? 'Test Sender'
  process.env.EMAIL_FROM_ADDRESS = overrides.EMAIL_FROM_ADDRESS ?? 'noreply@example.com'
  process.env.ADMIN_EMAIL = overrides.ADMIN_EMAIL ?? 'admin@example.com'
}

beforeEach(() => {
  jest.clearAllMocks()
  _resetClient()
  setEnv()
})

// ─── sendEmail ────────────────────────────────────────────────────────────

describe('sendEmail', () => {
  it('sends an email and returns success with messageId', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'msg-123' }, error: null })

    const result = await sendEmail({ to: 'user@example.com', subject: 'Hello', html: '<p>Hi</p>' })

    expect(result.success).toBe(true)
    expect(result.messageId).toBe('msg-123')
    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@example.com', subject: 'Hello', html: '<p>Hi</p>' })
    )
  })

  it('retries on failure and succeeds on second attempt', async () => {
    mockSend
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: { id: 'msg-retry' }, error: null })

    const result = await sendEmail({ to: 'user@example.com', subject: 'Retry', html: '<p>r</p>' })

    expect(result.success).toBe(true)
    expect(result.messageId).toBe('msg-retry')
    expect(mockSend).toHaveBeenCalledTimes(2)
  })

  it('returns failure after all retries are exhausted', async () => {
    mockSend.mockRejectedValue(new Error('Auth failed'))

    const result = await sendEmail({ to: 'user@example.com', subject: 'Fail', html: '<p>f</p>' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Auth failed')
    expect(mockSend).toHaveBeenCalledTimes(4) // 3 retries + 1 admin alert
  })

  it('returns failure when Resend returns an error object', async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: 'Invalid API key' } })

    const result = await sendEmail({ to: 'user@example.com', subject: 'S', html: '<p>h</p>' })

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/Invalid API key/i)
  })

  it('returns failure when RESEND_API_KEY is missing', async () => {
    _resetClient()
    delete process.env.RESEND_API_KEY

    const result = await sendEmail({ to: 'user@example.com', subject: 'S', html: '<p>h</p>' })

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/RESEND_API_KEY/i)
  })

  it('uses EMAIL_FROM_NAME and EMAIL_FROM_ADDRESS in the from field', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'x' }, error: null })
    process.env.EMAIL_FROM_NAME = 'Big Ed Artistry'
    process.env.EMAIL_FROM_ADDRESS = 'noreply@bigEdartistry.com'

    await sendEmail({ to: 'x@x.com', subject: 'S', html: '<p>H</p>' })

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'Big Ed Artistry <noreply@bigEdartistry.com>' })
    )
  })
})

// ─── sendToAdmin ──────────────────────────────────────────────────────────

describe('sendToAdmin', () => {
  it('sends to ADMIN_EMAIL', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'admin-msg' }, error: null })

    const result = await sendToAdmin('New Order', '<p>details</p>')

    expect(result.success).toBe(true)
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ to: 'admin@example.com' }))
  })

  it('returns error when ADMIN_EMAIL is not set', async () => {
    delete process.env.ADMIN_EMAIL

    const result = await sendToAdmin('Subject', '<p>body</p>')

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/ADMIN_EMAIL not configured/i)
    expect(mockSend).not.toHaveBeenCalled()
  })
})

// ─── sendWelcomeEmail ─────────────────────────────────────────────────────

describe('sendWelcomeEmail', () => {
  it('sends welcome email with correct subject and user name in html', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'w1' }, error: null })

    const result = await sendWelcomeEmail('new@example.com', { name: 'Adaeze' })

    expect(result.success).toBe(true)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'new@example.com',
        subject: 'Welcome to Big Ed Artistry',
        html: expect.stringContaining('Adaeze'),
      })
    )
  })
})

// ─── sendOrderConfirmation ────────────────────────────────────────────────

describe('sendOrderConfirmation', () => {
  const data = {
    name: 'Kofi',
    orderNumber: 'BEA-2024-001',
    service: 'Portrait',
    size: 'A3',
    medium: 'Charcoal',
    total: 45000,
    amountPaid: 45000,
    isPartial: false,
    estimatedDelivery: '2024-12-01',
  }

  it('sends confirmation with order number and total', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'c1' }, error: null })

    const result = await sendOrderConfirmation('buyer@example.com', data)

    expect(result.success).toBe(true)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'buyer@example.com',
        subject: 'Order Confirmed — BEA-2024-001',
        html: expect.stringContaining('BEA-2024-001'),
      })
    )
  })

  it('includes total and estimated delivery in html', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'c2' }, error: null })
    await sendOrderConfirmation('buyer@example.com', data)

    const html: string = mockSend.mock.calls[0][0].html
    expect(html).toContain('45,000')
    expect(html).toContain('2024-12-01')
  })
})

// ─── sendPaymentConfirmation ──────────────────────────────────────────────

describe('sendPaymentConfirmation', () => {
  it('sends full payment confirmation with correct subject', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'p1' }, error: null })

    const result = await sendPaymentConfirmation('buyer@example.com', {
      name: 'Sarah',
      orderNumber: 'BEA-2024-002',
      amountPaid: 25000,
      total: 25000,
      isPartial: false,
    })

    expect(result.success).toBe(true)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ subject: 'Payment Confirmed — BEA-2024-002' })
    )
  })

  it('sends partial payment confirmation with correct subject and balance', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'p2' }, error: null })

    await sendPaymentConfirmation('buyer@example.com', {
      name: 'Emeka',
      orderNumber: 'BEA-2024-003',
      amountPaid: 10000,
      total: 25000,
      isPartial: true,
      balanceDue: 15000,
    })

    const call = mockSend.mock.calls[0][0]
    expect(call.subject).toBe('Partial Payment Received — BEA-2024-003')
    expect(call.html).toContain('15,000')
  })
})

// ─── sendPaymentReminder ──────────────────────────────────────────────────

describe('sendPaymentReminder', () => {
  it('sends reminder with balance due', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'r1' }, error: null })

    const result = await sendPaymentReminder('buyer@example.com', {
      name: 'Chioma',
      orderNumber: 'BEA-2024-004',
      balanceDue: 20000,
    })

    expect(result.success).toBe(true)
    const call = mockSend.mock.calls[0][0]
    expect(call.subject).toBe('Payment Reminder — BEA-2024-004')
    expect(call.html).toContain('20,000')
  })

  it('includes due date when provided', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'r2' }, error: null })

    await sendPaymentReminder('buyer@example.com', {
      name: 'Chioma',
      orderNumber: 'BEA-2024-004',
      balanceDue: 20000,
      dueDate: '2024-12-15',
    })

    expect(mockSend.mock.calls[0][0].html).toContain('2024-12-15')
  })
})

// ─── sendOrderStatusUpdate ────────────────────────────────────────────────

describe('sendOrderStatusUpdate', () => {
  it('sends status update email', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 's1' }, error: null })

    const result = await sendOrderStatusUpdate('buyer@example.com', {
      name: 'Kofi',
      orderNumber: 'BEA-2024-002',
      status: 'in_progress',
    })

    expect(result.success).toBe(true)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Order Update — BEA-2024-002',
        html: expect.stringContaining('In Progress'),
      })
    )
  })
})

// ─── sendAdminNewOrder ────────────────────────────────────────────────────

describe('sendAdminNewOrder', () => {
  it('sends new order alert to admin', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'a1' }, error: null })

    const result = await sendAdminNewOrder({
      customerName: 'Adaeze',
      customerEmail: 'adaeze@example.com',
      orderNumber: 'BEA-2024-005',
      service: 'Portrait',
      total: 45000,
    })

    expect(result.success).toBe(true)
    const call = mockSend.mock.calls[0][0]
    expect(call.to).toBe('admin@example.com')
    expect(call.subject).toBe('New Order — BEA-2024-005')
    expect(call.html).toContain('Adaeze')
    expect(call.html).toContain('45,000')
  })
})

// ─── sendAdminPaymentReceived ─────────────────────────────────────────────

describe('sendAdminPaymentReceived', () => {
  it('sends payment received alert to admin', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'a2' }, error: null })

    const result = await sendAdminPaymentReceived({
      customerName: 'Kofi',
      orderNumber: 'BEA-2024-002',
      amount: 80000,
      isPartial: false,
    })

    expect(result.success).toBe(true)
    const call = mockSend.mock.calls[0][0]
    expect(call.to).toBe('admin@example.com')
    expect(call.subject).toBe('Payment Received — BEA-2024-002')
    expect(call.html).toContain('80,000')
    expect(call.html).toContain('Full')
  })

  it('marks partial payment correctly', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'a3' }, error: null })

    await sendAdminPaymentReceived({
      customerName: 'Sarah',
      orderNumber: 'BEA-2024-003',
      amount: 10000,
      isPartial: true,
    })

    expect(mockSend.mock.calls[0][0].html).toContain('Partial')
  })
})

// ─── Template unit tests ──────────────────────────────────────────────────

describe('emailTemplates', () => {
  it('welcomeTemplate renders name and dashboard link', () => {
    const html = welcomeTemplate({ name: 'Adaeze' })
    expect(html).toContain('Adaeze')
    expect(html).toContain('/dashboard')
    expect(html).toContain('BIG ED ARTISTRY')
  })

  it('orderConfirmationTemplate renders all order fields', () => {
    const html = orderConfirmationTemplate({
      name: 'Kofi',
      orderNumber: 'BEA-001',
      service: 'Portrait',
      size: 'A3',
      medium: 'Charcoal',
      total: 45000,
      amountPaid: 45000,
      isPartial: false,
      estimatedDelivery: '2024-12-01',
    })
    expect(html).toContain('BEA-001')
    expect(html).toContain('Portrait')
    expect(html).toContain('Charcoal')
    expect(html).toContain('45,000')
    expect(html).toContain('2024-12-01')
  })

  it('paymentConfirmationTemplate shows balance for partial payment', () => {
    const html = paymentConfirmationTemplate({
      name: 'Sarah',
      orderNumber: 'BEA-002',
      amountPaid: 10000,
      total: 25000,
      isPartial: true,
      balanceDue: 15000,
    })
    expect(html).toContain('15,000')
    expect(html).toContain('Partial')
  })

  it('paymentConfirmationTemplate shows full payment note', () => {
    const html = paymentConfirmationTemplate({
      name: 'Sarah',
      orderNumber: 'BEA-002',
      amountPaid: 25000,
      total: 25000,
      isPartial: false,
    })
    expect(html).toContain('full payment has been confirmed')
  })

  it('paymentReminderTemplate renders balance and order number', () => {
    const html = paymentReminderTemplate({
      name: 'Emeka',
      orderNumber: 'BEA-003',
      balanceDue: 20000,
    })
    expect(html).toContain('BEA-003')
    expect(html).toContain('20,000')
  })

  it('orderStatusUpdateTemplate maps status keys to labels', () => {
    const html = orderStatusUpdateTemplate({
      name: 'Chioma',
      orderNumber: 'BEA-004',
      status: 'in_progress',
    })
    expect(html).toContain('In Progress')
  })

  it('orderStatusUpdateTemplate falls back to raw status for unknown keys', () => {
    const html = orderStatusUpdateTemplate({
      name: 'Chioma',
      orderNumber: 'BEA-004',
      status: 'custom_status',
    })
    expect(html).toContain('custom_status')
  })

  it('adminNewOrderTemplate renders customer and total', () => {
    const html = adminNewOrderTemplate({
      customerName: 'Adaeze',
      customerEmail: 'adaeze@example.com',
      orderNumber: 'BEA-005',
      service: 'Portrait',
      total: 45000,
    })
    expect(html).toContain('Adaeze')
    expect(html).toContain('adaeze@example.com')
    expect(html).toContain('45,000')
  })

  it('adminPaymentReceivedTemplate renders amount and type', () => {
    const html = adminPaymentReceivedTemplate({
      customerName: 'Kofi',
      orderNumber: 'BEA-006',
      amount: 80000,
      isPartial: false,
    })
    expect(html).toContain('80,000')
    expect(html).toContain('Full')
  })

  it('all templates include the layout wrapper (BIG ED ARTISTRY header)', () => {
    const templates = [
      welcomeTemplate({ name: 'X' }),
      orderConfirmationTemplate({ name: 'X', orderNumber: 'O', service: 'S', size: 'A3', medium: 'P', total: 1000, amountPaid: 1000, isPartial: false, estimatedDelivery: '2024-01-01' }),
      paymentConfirmationTemplate({ name: 'X', orderNumber: 'O', amountPaid: 500, total: 1000, isPartial: false }),
      paymentReminderTemplate({ name: 'X', orderNumber: 'O', balanceDue: 500 }),
      orderStatusUpdateTemplate({ name: 'X', orderNumber: 'O', status: 'confirmed' }),
      adminNewOrderTemplate({ customerName: 'X', customerEmail: 'x@x.com', orderNumber: 'O', service: 'S', total: 1000 }),
      adminPaymentReceivedTemplate({ customerName: 'X', orderNumber: 'O', amount: 1000, isPartial: false }),
    ]
    for (const html of templates) {
      expect(html).toContain('BIG ED ARTISTRY')
      expect(html).toContain('<!DOCTYPE html>')
    }
  })
})
