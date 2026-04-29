import {
  formatPrice, formatDate, getStatusColor, getStatusLabel, tokens,
} from '@/lib/tokens'

describe('formatPrice', () => {
  it('formats zero', () => expect(formatPrice(0)).toBe('₦0'))
  it('formats thousands', () => expect(formatPrice(50000)).toBe('₦50,000'))
  it('formats large amounts', () => expect(formatPrice(1500000)).toBe('₦1,500,000'))
})

describe('formatDate', () => {
  it('formats ISO date string', () => {
    expect(formatDate('2024-01-15')).toBe('15 January 2024')
  })
  it('formats datetime string', () => {
    const result = formatDate('2024-06-01T00:00:00Z')
    expect(result).toMatch(/June/)
    expect(result).toMatch(/2024/)
  })
})

describe('getStatusColor', () => {
  it('returns gold for pending', () => expect(getStatusColor('pending')).toBe('#C9A227'))
  it('returns green for completed', () => expect(getStatusColor('completed')).toBe('#4A7C59'))
  it('returns red for cancelled', () => expect(getStatusColor('cancelled')).toBe('#8B3A3A'))
  it('returns red for NOT_PAID', () => expect(getStatusColor('NOT_PAID')).toBe('#8B3A3A'))
  it('returns gold for PARTIALLY_PAID', () => expect(getStatusColor('PARTIALLY_PAID')).toBe('#C9A227'))
  it('returns green for FULLY_PAID', () => expect(getStatusColor('FULLY_PAID')).toBe('#4A7C59'))
  it('returns muted for unknown status', () => expect(getStatusColor('unknown')).toBe('#6B6560'))
})

describe('getStatusLabel', () => {
  it('returns "In Progress" for in_progress', () => expect(getStatusLabel('in_progress')).toBe('In Progress'))
  it('returns "Not Paid" for NOT_PAID', () => expect(getStatusLabel('NOT_PAID')).toBe('Not Paid'))
  it('returns "Partial" for PARTIALLY_PAID', () => expect(getStatusLabel('PARTIALLY_PAID')).toBe('Partial'))
  it('returns "Paid" for FULLY_PAID', () => expect(getStatusLabel('FULLY_PAID')).toBe('Paid'))
  it('returns raw value for unknown status', () => expect(getStatusLabel('custom_status')).toBe('custom_status'))
})

describe('tokens', () => {
  it('exports goldPrimary color', () => expect(tokens.colors.goldPrimary).toBe('#B8860B'))
  it('exports display font', () => expect(tokens.fonts.display).toContain('Cormorant Garamond'))
})
