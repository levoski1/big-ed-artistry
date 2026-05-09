'use server'

import { savePreferences } from '@/lib/notificationPreferences'
import type { NotificationPreferences } from '@/lib/notificationPreferences'

export async function saveNotificationPreferences(prefs: NotificationPreferences): Promise<{ error: string } | { success: true }> {
  try {
    return await savePreferences(prefs)
  } catch (e) {
    console.error('[saveNotificationPreferences]', e)
    return { error: 'Failed to save preferences.' }
  }
}
