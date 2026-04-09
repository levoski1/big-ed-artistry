import { getAdminStats } from '@/app/actions/admin'
import { getAllOrders } from '@/app/actions/orders'
import { getProducts } from '@/app/actions/products'
import AdminDashboardContent from './AdminDashboardContent'
import type { Database } from '@/lib/types/database'

type Order = Database['public']['Tables']['orders']['Row'] & {
  profiles?: { id: string; full_name: string; email: string; phone: string | null } | null
  order_items?: Database['public']['Tables']['order_items']['Row'][]
}

export default async function AdminDashboardPage() {
  const [stats, orders, products] = await Promise.all([
    getAdminStats().catch(() => null),
    getAllOrders().catch(() => [] as Order[]),
    getProducts({ featured: true }).catch(() => []),
  ])

  return <AdminDashboardContent stats={stats} recentOrders={(orders as Order[]).slice(0, 8)} featuredProducts={products.slice(0, 4)} />
}
