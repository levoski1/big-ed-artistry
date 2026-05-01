/**
 * Centralized user-facing error messages.
 * All user-visible strings live here — never expose raw DB/system errors.
 */

export const ERR = {
  // Network
  NETWORK: 'Unable to connect. Please check your internet connection and try again.',
  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  EMAIL_NOT_CONFIRMED: 'Your email address has not been verified yet. Please check your inbox and click the verification link to activate your account.',
  EMAIL_EXISTS: 'An account with this email already exists. Please log in instead.',
  WEAK_PASSWORD: 'Password must be at least 8 characters.',
  INVALID_EMAIL: 'Invalid email address.',
  INVALID_NAME: 'Please enter a valid name.',
  NOT_AUTHENTICATED: 'Please sign in to continue.',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  // Rate limiting
  RATE_LIMITED: 'Too many attempts. Please wait a moment and try again.',
  // Orders
  ORDER_DUPLICATE: 'It looks like this order was already submitted. Please check your orders page.',
  ORDER_FAILED: 'Failed to place your order. Please try again.',
  // Payments
  PAYMENT_FAILED: 'Payment submission failed. Please try again.',
  // Uploads
  UPLOAD_FAILED: 'File upload failed. Please try a smaller image (JPG/PNG under 5MB).',
  UPLOAD_NO_FILE: 'No file provided.',
  UPLOAD_URL_FAILED: 'Failed to process the uploaded file. Please try again.',
  // Profile
  PROFILE_UPDATE_FAILED: 'Failed to update profile. Please try again.',
  // Generic
  GENERIC: 'Something went wrong. Please try again.',
  PERMISSION_DENIED: 'Permission denied. Please sign in and try again.',
  CONFIRM_LINK_FAILED: 'Failed to generate confirmation link. Please try again.',
  CONFIRM_EMAIL_FAILED: 'Account created but confirmation email failed to send. Contact support.',
  // Password reset
  RESET_LINK_SENT: 'If an account with this email exists, a password reset link has been sent.',
  RESET_TOKEN_INVALID: 'This password reset link is invalid or has expired. Please request a new one.',
  RESET_FAILED: 'Failed to reset password. Please try again.',
  PASSWORDS_MISMATCH: 'Passwords do not match.',
} as const

/** Pattern → user message mappings, checked in order */
const PATTERNS: [RegExp, string][] = [
  [/fetch failed|Connect Timeout|ECONNREFUSED|UND_ERR|network/i, ERR.NETWORK],
  [/Invalid login credentials/i,                                  ERR.INVALID_CREDENTIALS],
  [/Email not confirmed/i,                                        ERR.EMAIL_NOT_CONFIRMED],
  [/User already registered/i,                                    ERR.EMAIL_EXISTS],
  [/Password should be/i,                                         ERR.WEAK_PASSWORD],
  [/rate limit|too many/i,                                        ERR.RATE_LIMITED],
  [/SESSION_EXPIRED|Not authenticated|JWT|not authenticated/i,    ERR.SESSION_EXPIRED],
  [/foreign key|user_id_fkey|violates foreign key/i,              ERR.SESSION_EXPIRED],
  [/duplicate|unique constraint/i,                                ERR.ORDER_DUPLICATE],
  [/storage|upload|bucket/i,                                      ERR.UPLOAD_FAILED],
  [/row-level security|permission denied|policy/i,                ERR.PERMISSION_DENIED],
]

/**
 * Convert any thrown value into a safe, user-friendly message.
 * Raw DB/system details are never returned.
 */
export function toUserMessage(e: unknown, fallback: string = ERR.GENERIC): string {
  const raw = e instanceof Error ? e.message : String(e)

  // Pass through messages that are already one of our safe ERR values
  const safeValues = Object.values(ERR) as string[]
  if (safeValues.includes(raw)) return raw

  for (const [pattern, msg] of PATTERNS) {
    if (pattern.test(raw)) return msg
  }

  return fallback
}
