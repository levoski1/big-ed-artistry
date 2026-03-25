import ProductDetailClient from './ProductDetailClient'

// Server component — receives params, passes to client child
export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  return <ProductDetailClient slug={params.slug} />
}
