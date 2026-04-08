// lib/tokens.ts — Design tokens matching Aurum Gold template
export const tokens = {
  colors: {
    goldPrimary: '#B8860B',
    goldLight: '#D4A84B',
    goldDark: '#8B6914',
    goldAccent: '#C9A227',
    bgDark: '#0F0E0C',
    bgCard: '#1A1815',
    bgCardHover: '#252119',
    textPrimary: '#F5F0E8',
    textSecondary: '#A69F94',
    textMuted: '#6B6560',
    borderColor: '#2A2622',
    success: '#4A7C59',
    danger: '#8B3A3A',
  },
  fonts: {
    display: "'Cormorant Garamond', serif",
    body: "'Libre Franklin', sans-serif",
  },
} as const

// Utility: format Nigerian Naira price
export function formatPrice(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`
}

// Utility: format date
export function formatDate(dateStr: string): string {
  const ymdMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)

  if (ymdMatch) {
    const year = Number(ymdMatch[1])
    const month = Number(ymdMatch[2])
    const day = Number(ymdMatch[3])

    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(year, month - 1, day)))
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(dateStr))
}

// Utility: get status color
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: '#C9A227',
    confirmed: '#D4A84B',
    in_progress: '#B8860B',
    review: '#A69F94',
    completed: '#4A7C59',
    cancelled: '#8B3A3A',
    // legacy
    unpaid: '#8B3A3A',
    pending_verification: '#C9A227',
    paid: '#4A7C59',
    // DB payment_status values
    NOT_PAID: '#8B3A3A',
    PARTIALLY_PAID: '#C9A227',
    FULLY_PAID: '#4A7C59',
    // receipt status
    verified: '#4A7C59',
    rejected: '#8B3A3A',
  }
  return map[status] ?? '#6B6560'
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    in_progress: 'In Progress',
    review: 'Under Review',
    completed: 'Completed',
    cancelled: 'Cancelled',
    // legacy
    unpaid: 'Unpaid',
    pending_verification: 'Verifying',
    paid: 'Paid',
    // DB payment_status values
    NOT_PAID: 'Not Paid',
    PARTIALLY_PAID: 'Partial',
    FULLY_PAID: 'Paid',
    // receipt status
    verified: 'Verified',
    rejected: 'Rejected',
  }
  return map[status] ?? status
}
