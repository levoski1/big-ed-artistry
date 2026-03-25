import { mockOrders } from '@/lib/mockData'
import DashboardPageContent from './DashboardPageContent'

export default function DashboardPage() {
  const recentOrders = mockOrders.slice(0, 4)
  const pendingPayment = mockOrders.filter(o => o.paymentStatus === 'pending_verification').length
  const inProgress = mockOrders.filter(o => o.status === 'in_progress').length
  const completedCount = mockOrders.filter(o => o.status === 'completed').length

  return (
    <DashboardPageContent
      recentOrders={recentOrders}
      allOrders={mockOrders}
      pendingPayment={pendingPayment}
      inProgress={inProgress}
      completedCount={completedCount}
    />
  )
}
