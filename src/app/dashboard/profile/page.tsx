import { getCurrentUser } from '@/app/actions/auth'
import { getMyOrders } from '@/app/actions/orders'
import { getPreferences } from '@/lib/notificationPreferences'
import ProfilePageContent from './ProfilePageContent'

export default async function ProfilePage() {
  const [user, orders, notifPrefs] = await Promise.all([
    getCurrentUser(),
    getMyOrders().catch(() => []),
    getPreferences().catch(() => null),
  ])
  const completedCount = orders.filter(o => o.status === 'completed').length
  return (
    <ProfilePageContent
      user={user}
      totalOrders={orders.length}
      completedCount={completedCount}
      notifPrefs={notifPrefs}
    />
  )
}
