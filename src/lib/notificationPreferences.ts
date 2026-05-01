import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
export type { NotificationPreferences } from '@/lib/notificationPreferences.shared'
export { DEFAULT_PREFERENCES } from '@/lib/notificationPreferences.shared'
import type { NotificationPreferences } from '@/lib/notificationPreferences.shared'
import { DEFAULT_PREFERENCES } from '@/lib/notificationPreferences.shared'

/** Fetch preferences for the current session user. Returns defaults if none saved. */
export async function getPreferences(): Promise<NotificationPreferences> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ...DEFAULT_PREFERENCES }

  const { data } = await supabase
    .from('notification_preferences')
    .select('order_confirmation, payment_confirmation, payment_reminder, order_status_update, welcome')
    .eq('user_id', user.id)
    .single()

  return data ?? { ...DEFAULT_PREFERENCES }
}

/** Save preferences for the current session user (upsert). */
export async function savePreferences(prefs: NotificationPreferences): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('notification_preferences')
    .upsert({ user_id: user.id, ...prefs, updated_at: new Date().toISOString() })

  if (error) throw new Error(error.message)
}

/** Fetch preferences for any user by ID (server-side, admin client). */
export async function getPreferencesForUser(userId: string): Promise<NotificationPreferences> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('notification_preferences')
    .select('order_confirmation, payment_confirmation, payment_reminder, order_status_update, welcome')
    .eq('user_id', userId)
    .single()

  return data ?? { ...DEFAULT_PREFERENCES }
}
