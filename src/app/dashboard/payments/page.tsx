import { getMyOrders } from '@/app/actions/orders'
import PaymentsPageContent from './PaymentsPageContent'

export default async function PaymentsPage() {
  const orders = await getMyOrders().catch(() => [])
  return <PaymentsPageContent orders={orders} />
}
