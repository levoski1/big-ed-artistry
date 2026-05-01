import { Resend } from 'resend'
import {
  welcomeTemplate,
  orderConfirmationTemplate,
  paymentConfirmationTemplate,
  paymentReminderTemplate,
  orderStatusUpdateTemplate,
  adminNewOrderTemplate,
  adminPaymentReceivedTemplate,
  type WelcomeData,
  type OrderConfirmationData,
  type PaymentConfirmationData,
  type PaymentReminderData,
  type OrderStatusUpdateData,
  type AdminNewOrderData,
  type AdminPaymentReceivedData,
} from './emailTemplates'

export interface EmailPayload {
  to: string
  subject: string
  html: string
  text?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// ─── Client (singleton) ───────────────────────────────────────────────────

let _client: Resend | null = null

function getClient(): Resend {
  if (_client) return _client
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured.')
  _client = new Resend(apiKey)
  return _client
}

// ─── Core send with retry ─────────────────────────────────────────────────

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const from = `${process.env.EMAIL_FROM_NAME ?? 'Big Ed Artistry'} <${process.env.EMAIL_FROM_ADDRESS ?? 'noreply@bigEdartistry.com'}>`

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data, error } = await getClient().emails.send({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      })

      if (error) throw new Error(error.message)
      return { success: true, messageId: data?.id }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      console.error(`[emailService] attempt ${attempt}/${MAX_RETRIES} failed:`, lastError.message)
      if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS * attempt)
    }
  }

  return { success: false, error: lastError?.message ?? 'Unknown error' }
}

// ─── Admin helper ─────────────────────────────────────────────────────────

export async function sendToAdmin(subject: string, html: string): Promise<EmailResult> {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    console.error('[emailService] ADMIN_EMAIL not set')
    return { success: false, error: 'ADMIN_EMAIL not configured' }
  }
  return sendEmail({ to: adminEmail, subject, html })
}

// ─── Notification helpers ─────────────────────────────────────────────────

export async function sendWelcomeEmail(
  userEmail: string,
  data: WelcomeData
): Promise<EmailResult> {
  return sendEmail({
    to: userEmail,
    subject: 'Welcome to Big Ed Artistry',
    html: welcomeTemplate(data),
  })
}

export async function sendOrderConfirmation(
  userEmail: string,
  data: OrderConfirmationData
): Promise<EmailResult> {
  return sendEmail({
    to: userEmail,
    subject: `Order Confirmed — ${data.orderNumber}`,
    html: orderConfirmationTemplate(data),
    text: `Order ${data.orderNumber} confirmed. Total: ₦${data.total.toLocaleString()}.`,
  })
}

export async function sendPaymentConfirmation(
  userEmail: string,
  data: PaymentConfirmationData
): Promise<EmailResult> {
  const subject = data.isPartial
    ? `Partial Payment Received — ${data.orderNumber}`
    : `Payment Confirmed — ${data.orderNumber}`
  return sendEmail({ to: userEmail, subject, html: paymentConfirmationTemplate(data) })
}

export async function sendPaymentReminder(
  userEmail: string,
  data: PaymentReminderData
): Promise<EmailResult> {
  return sendEmail({
    to: userEmail,
    subject: `Payment Reminder — ${data.orderNumber}`,
    html: paymentReminderTemplate(data),
  })
}

export async function sendOrderStatusUpdate(
  userEmail: string,
  data: OrderStatusUpdateData
): Promise<EmailResult> {
  return sendEmail({
    to: userEmail,
    subject: `Order Update — ${data.orderNumber}`,
    html: orderStatusUpdateTemplate(data),
    text: `Order ${data.orderNumber} is now: ${data.status}.`,
  })
}

export async function sendAdminNewOrder(data: AdminNewOrderData): Promise<EmailResult> {
  return sendToAdmin(`New Order — ${data.orderNumber}`, adminNewOrderTemplate(data))
}

export async function sendAdminPaymentReceived(data: AdminPaymentReceivedData): Promise<EmailResult> {
  return sendToAdmin(`Payment Received — ${data.orderNumber}`, adminPaymentReceivedTemplate(data))
}

// Reset client (used in tests)
export function _resetClient() {
  _client = null
}
