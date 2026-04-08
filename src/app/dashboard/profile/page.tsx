import { getCurrentUser } from '@/app/actions/auth'
import { getMyOrders } from '@/app/actions/orders'
import ProfilePageContent from './ProfilePageContent'

export default async function ProfilePage() {
  const [user, orders] = await Promise.all([getCurrentUser(), getMyOrders().catch(() => [])])
  const completedCount = orders.filter(o => o.status === 'completed').length
  return <ProfilePageContent user={user} totalOrders={orders.length} completedCount={completedCount} />
}
