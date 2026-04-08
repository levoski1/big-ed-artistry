import { getAllOrders } from '@/app/actions/orders'
import AdminOrdersContent from './AdminOrdersContent'

export default async function AdminOrdersPage() {
  const orders = await getAllOrders().catch(() => [])
  return <AdminOrdersContent orders={orders} />
}
