/** Input validation and sanitization helpers */

/** Strip leading/trailing whitespace and collapse internal whitespace */
export function sanitizeString(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/\s+/g, ' ')
}

/** Validate and normalize an email address */
export function validateEmail(value: unknown): string | null {
  const s = sanitizeString(value).toLowerCase()
  // RFC-5321 practical limit + basic format check
  if (s.length > 254) return null
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRe.test(s) ? s : null
}

/** Validate a password meets minimum requirements */
export function validatePassword(value: unknown): string | null {
  if (typeof value !== 'string') return null
  if (value.length < 8 || value.length > 128) return null
  return value
}

/** Validate a display name (no HTML/script injection) */
export function validateName(value: unknown): string | null {
  const s = sanitizeString(value)
  if (s.length < 1 || s.length > 100) return null
  // Reject anything that looks like HTML tags or script injection
  if (/<[^>]*>/.test(s)) return null
  return s
}

/** Validate an email subject line */
export function validateSubject(value: unknown): string | null {
  const s = sanitizeString(value)
  if (s.length < 1 || s.length > 200) return null
  if (/<[^>]*>/.test(s)) return null
  return s
}

/** Validate HTML email body — just enforce a size limit */
export function validateHtml(value: unknown): string | null {
  if (typeof value !== 'string') return null
  if (value.length > 100_000) return null
  return value
}
