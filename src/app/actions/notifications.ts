'use server'

import { savePreferences } from '@/lib/notificationPreferences'
import type { NotificationPreferences } from '@/lib/notificationPreferences'

export async function saveNotificationPreferences(prefs: NotificationPreferences): Promise<void> {
  await savePreferences(prefs)
}
