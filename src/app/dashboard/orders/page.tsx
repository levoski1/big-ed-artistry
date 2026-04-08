import { getMyOrders } from '@/app/actions/orders'
import OrdersPageContent from './OrdersPageContent'

export default async function MyOrdersPage() {
  const orders = await getMyOrders().catch(() => [])
  return <OrdersPageContent orders={orders} />
}
