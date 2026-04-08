import { getAdminStats } from '@/app/actions/admin'
import { getAllOrders } from '@/app/actions/orders'
import { getProducts } from '@/app/actions/products'
import AdminDashboardContent from './AdminDashboardContent'

export default async function AdminDashboardPage() {
  const [stats, orders, products] = await Promise.all([
    getAdminStats().catch(() => null),
    getAllOrders().catch(() => []),
    getProducts({ featured: true }).catch(() => []),
  ])

  return <AdminDashboardContent stats={stats} recentOrders={orders.slice(0, 8)} featuredProducts={products.slice(0, 4)} />
}
