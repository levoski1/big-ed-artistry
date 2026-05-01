// ─── Design tokens (email-safe, no CSS variables) ────────────────────────
const T = {
  bgDark: '#0F0E0C',
  bgCard: '#1A1815',
  gold: '#B8860B',
  goldLight: '#D4A84B',
  textPrimary: '#F5F0E8',
  textSecondary: '#A69F94',
  border: '#2A2622',
}

// ─── Base layout ──────────────────────────────────────────────────────────

function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Big Ed Artistry</title>
</head>
<body style="margin:0;padding:0;background:${T.bgDark};font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${T.bgDark};padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${T.bgCard};border:1px solid ${T.border};border-radius:8px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:${T.bgDark};padding:24px 32px;border-bottom:2px solid ${T.gold};text-align:center;">
            <span style="font-size:22px;font-weight:700;color:${T.goldLight};letter-spacing:2px;">BIG ED ARTISTRY</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;color:${T.textPrimary};font-size:15px;line-height:1.7;">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:${T.bgDark};padding:20px 32px;border-top:1px solid ${T.border};text-align:center;">
            <p style="margin:0;font-size:12px;color:${T.textSecondary};">
              © ${new Date().getFullYear()} Big Ed Artistry · Hand-drawn portraits crafted with care
            </p>
            <p style="margin:6px 0 0;font-size:12px;color:${T.textSecondary};">
              Questions? Reply to this email or visit <a href="https://bigEdartistry.com/contact" style="color:${T.goldLight};text-decoration:none;">bigEdartistry.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── Shared components ────────────────────────────────────────────────────

function heading(text: string): string {
  return `<h2 style="margin:0 0 16px;font-size:20px;color:${T.goldLight};">${text}</h2>`
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;color:${T.textPrimary};">${text}</p>`
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid ${T.border};margin:20px 0;" />`
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;color:${T.textSecondary};font-size:13px;width:40%;">${label}</td>
    <td style="padding:6px 0;color:${T.textPrimary};font-size:13px;font-weight:600;">${value}</td>
  </tr>`
}

function infoTable(rows: [string, string][]): string {
  return `<table cellpadding="0" cellspacing="0" style="width:100%;margin:16px 0;">
    ${rows.map(([l, v]) => infoRow(l, v)).join('')}
  </table>`
}

function ctaButton(label: string, href: string): string {
  return `<div style="text-align:center;margin:24px 0;">
    <a href="${href}" style="display:inline-block;padding:12px 28px;background:${T.gold};color:#0F0E0C;font-weight:700;font-size:14px;text-decoration:none;border-radius:4px;letter-spacing:1px;">${label}</a>
  </div>`
}

// ─── Template types ───────────────────────────────────────────────────────

export interface ConfirmationData {
  name: string
  confirmUrl: string
}

export interface WelcomeData {
  name: string
}

export interface OrderConfirmationData {
  name: string
  orderNumber: string
  service: string
  size: string
  medium: string
  total: number
  estimatedDelivery: string
}

export interface PaymentConfirmationData {
  name: string
  orderNumber: string
  amountPaid: number
  total: number
  isPartial: boolean
  balanceDue?: number
}

export interface PaymentReminderData {
  name: string
  orderNumber: string
  balanceDue: number
  dueDate?: string
}

export interface OrderStatusUpdateData {
  name: string
  orderNumber: string
  status: string
}

export interface AdminNewOrderData {
  customerName: string
  customerEmail: string
  orderNumber: string
  service: string
  total: number
}

export interface AdminPaymentReceivedData {
  customerName: string
  orderNumber: string
  amount: number
  isPartial: boolean
}

// ─── Templates ────────────────────────────────────────────────────────────

export function confirmationTemplate(data: ConfirmationData): string {
  return layout(`
    ${heading('Confirm Your Email')}
    ${paragraph(`Hi <strong>${data.name}</strong>, thanks for creating your Big Ed Artistry account.`)}
    ${paragraph('Click the button below to verify your email address and activate your account.')}
    ${ctaButton('Confirm Email Address', data.confirmUrl)}
    ${divider()}
    ${paragraph(`<span style="color:${T.textSecondary};font-size:13px;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</span>`)}
  `)
}

export function welcomeTemplate(data: WelcomeData): string {
  return layout(`
    ${heading('Welcome to Big Ed Artistry')}
    ${paragraph(`Hi <strong>${data.name}</strong>,`)}
    ${paragraph('Your account has been created. You can now place commissions, track your orders, and upload payment proof — all from your dashboard.')}
    ${ctaButton('Go to Dashboard', 'https://bigEdartistry.com/dashboard')}
    ${divider()}
    ${paragraph(`<span style="color:${T.textSecondary};font-size:13px;">If you didn't create this account, you can safely ignore this email.</span>`)}
  `)
}

export function orderConfirmationTemplate(data: OrderConfirmationData): string {
  return layout(`
    ${heading('Order Confirmed')}
    ${paragraph(`Hi <strong>${data.name}</strong>, your order has been received and is being reviewed.`)}
    ${infoTable([
      ['Order Number', data.orderNumber],
      ['Service', data.service],
      ['Size', data.size],
      ['Medium', data.medium],
      ['Total', `₦${data.total.toLocaleString()}`],
      ['Est. Delivery', data.estimatedDelivery],
    ])}
    ${paragraph("We'll send you an update once work begins. You can track your order anytime from your dashboard.")}
    ${ctaButton('Track Order', `https://bigEdartistry.com/dashboard/orders`)}
  `)
}

export function paymentConfirmationTemplate(data: PaymentConfirmationData): string {
  const rows: [string, string][] = [
    ['Order Number', data.orderNumber],
    ['Amount Paid', `₦${data.amountPaid.toLocaleString()}`],
    ['Order Total', `₦${data.total.toLocaleString()}`],
  ]
  if (data.isPartial && data.balanceDue != null) {
    rows.push(['Balance Due', `₦${data.balanceDue.toLocaleString()}`])
  }

  const statusNote = data.isPartial
    ? `<p style="margin:0 0 14px;padding:12px 16px;background:#1f1c18;border-left:3px solid ${T.gold};color:${T.textSecondary};font-size:13px;">
        Your partial payment has been received. Please settle the remaining balance before your artwork is dispatched.
       </p>`
    : `<p style="margin:0 0 14px;padding:12px 16px;background:#1f1c18;border-left:3px solid #4caf50;color:${T.textSecondary};font-size:13px;">
        Your payment is complete. Your order is now fully paid.
       </p>`

  return layout(`
    ${heading(data.isPartial ? 'Partial Payment Received' : 'Payment Confirmed')}
    ${paragraph(`Hi <strong>${data.name}</strong>, we've received your payment.`)}
    ${infoTable(rows)}
    ${statusNote}
    ${ctaButton('View Order', `https://bigEdartistry.com/dashboard/orders`)}
  `)
}

export function paymentReminderTemplate(data: PaymentReminderData): string {
  const dueLine = data.dueDate
    ? paragraph(`Please complete your payment by <strong>${data.dueDate}</strong> to avoid delays.`)
    : paragraph('Please complete your payment at your earliest convenience to keep your order on schedule.')

  return layout(`
    ${heading('Payment Reminder')}
    ${paragraph(`Hi <strong>${data.name}</strong>, this is a friendly reminder about your outstanding balance.`)}
    ${infoTable([
      ['Order Number', data.orderNumber],
      ['Balance Due', `₦${data.balanceDue.toLocaleString()}`],
    ])}
    ${dueLine}
    ${ctaButton('Upload Payment Proof', `https://bigEdartistry.com/dashboard/payments`)}
  `)
}

export function orderStatusUpdateTemplate(data: OrderStatusUpdateData): string {
  const statusLabels: Record<string, string> = {
    confirmed: 'Confirmed',
    in_progress: 'In Progress',
    review: 'Ready for Review',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
  const label = statusLabels[data.status] ?? data.status

  return layout(`
    ${heading('Order Status Update')}
    ${paragraph(`Hi <strong>${data.name}</strong>, your order status has been updated.`)}
    ${infoTable([
      ['Order Number', data.orderNumber],
      ['New Status', label],
    ])}
    ${ctaButton('View Order', `https://bigEdartistry.com/dashboard/orders`)}
  `)
}

export function adminNewOrderTemplate(data: AdminNewOrderData): string {
  return layout(`
    ${heading('New Order Received')}
    ${paragraph('A new commission has been placed.')}
    ${infoTable([
      ['Order Number', data.orderNumber],
      ['Customer', data.customerName],
      ['Email', data.customerEmail],
      ['Service', data.service],
      ['Total', `₦${data.total.toLocaleString()}`],
    ])}
    ${ctaButton('View in Admin', `https://bigEdartistry.com/admin/orders`)}
  `)
}

export function adminPaymentReceivedTemplate(data: AdminPaymentReceivedData): string {
  return layout(`
    ${heading('Payment Received')}
    ${paragraph(`A ${data.isPartial ? 'partial' : 'full'} payment has been submitted and is awaiting verification.`)}
    ${infoTable([
      ['Order Number', data.orderNumber],
      ['Customer', data.customerName],
      ['Amount', `₦${data.amount.toLocaleString()}`],
      ['Type', data.isPartial ? 'Partial' : 'Full'],
    ])}
    ${ctaButton('Verify Payment', `https://bigEdartistry.com/admin/payments`)}
  `)
}
