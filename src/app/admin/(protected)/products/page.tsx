import { getProducts } from '@/app/actions/products'
import AdminProductsContent from './AdminProductsContent'

export default async function AdminProductsPage() {
  const products = await getProducts().catch(() => [])
  return <AdminProductsContent products={products} />
}
