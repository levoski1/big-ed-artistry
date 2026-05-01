/** Shared types and constants — safe to import in both client and server code */

export type NotificationPreferences = {
  order_confirmation: boolean
  payment_confirmation: boolean
  payment_reminder: boolean
  order_status_update: boolean
  welcome: boolean
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  order_confirmation: true,
  payment_confirmation: true,
  payment_reminder: true,
  order_status_update: true,
  welcome: true,
}
