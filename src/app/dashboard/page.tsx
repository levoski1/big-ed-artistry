import { getCurrentUser } from '@/app/actions/auth'
import { getMyOrders } from '@/app/actions/orders'
import DashboardPageContent from './DashboardPageContent'

export default async function DashboardPage() {
  const [user, orders] = await Promise.all([getCurrentUser(), getMyOrders().catch(() => [])])

  const pendingPayment = orders.filter(o => o.payment_status === 'NOT_PAID').length
  const inProgress = orders.filter(o => o.status === 'in_progress').length
  const completedCount = orders.filter(o => o.status === 'completed').length

  return (
    <DashboardPageContent
      user={user}
      orders={orders}
      pendingPayment={pendingPayment}
      inProgress={inProgress}
      completedCount={completedCount}
    />
  )
}
