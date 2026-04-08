import { getProducts } from '@/app/actions/products'
import StorePageContent from './StorePageContent'

export default async function StorePage() {
  const products = await getProducts().catch(() => [])
  return <StorePageContent products={products} />
}
