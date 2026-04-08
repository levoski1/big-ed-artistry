import { getProductBySlug, getProducts } from '@/app/actions/products'
import ProductDetailClient from './ProductDetailClient'
import { notFound } from 'next/navigation'

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, allProducts] = await Promise.all([
    getProductBySlug(params.slug).catch(() => null),
    getProducts().catch(() => []),
  ])

  if (!product) notFound()

  const related = allProducts
    .filter(p => p.id !== product.id)
    .sort((a, b) => (a.category === product.category ? -1 : 1))
    .slice(0, 3)

  return <ProductDetailClient product={product} related={related} />
}
