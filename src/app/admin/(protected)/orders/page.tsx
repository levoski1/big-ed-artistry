import { getAllOrders } from '@/app/actions/orders'
import AdminOrdersContent from './AdminOrdersContent'
import type { Database } from '@/lib/types/database'

type Order = Database['public']['Tables']['orders']['Row'] & {
  profiles?: { id: string; full_name: string; email: string; phone: string | null } | null
  order_items?: Database['public']['Tables']['order_items']['Row'][]
}

export default async function AdminOrdersPage() {
  const orders = await getAllOrders().catch(() => [] as Order[])
  return <AdminOrdersContent orders={orders as Order[]} />
}
