'use client'
import { useState } from 'react'
import Link from 'next/link'
import { SectionTag } from '@/components/ui'
import { useCart } from '@/context/CartContext'
import HomeProductCard from './HomeProductCard'
import ProductQuickViewModal from './ProductQuickViewModal'
import type { Database } from '@/lib/types/database'

type Product = Database['public']['Tables']['products']['Row']

export default function HomeProductSection({ products }: { products: Product[] }) {
  const [modalProduct, setModalProduct] = useState<Product | null>(null)
  const { addStoreItem, removeStoreItem, setStoreQuantity, state } = useCart()

  const getQuantity = (id: string) =>
    state.storeItems.find(i => i.product.id === id)?.quantity ?? 0

  const handleAddToCart = (p: Product) => {
    addStoreItem({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description ?? '',
      price: p.price,
      originalPrice: p.original_price ?? undefined,
      category: p.category,
      badge: p.badge ?? undefined,
      inStock: p.in_stock,
      featured: p.featured,
      rating: p.rating,
    })
  }

  const handleQuantityChange = (p: Product, qty: number) => {
    if (qty < 1) {
      removeStoreItem(p.id)
    } else {
      setStoreQuantity(p.id, qty)
    }
  }

  return (
    <section style={{ padding: '100px 0', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <SectionTag>Store</SectionTag>
            <h2 style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: 'clamp(32px,4vw,52px)' }}>
              Art Products <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>&amp; Prints</span>
            </h2>
          </div>
          <Link href="/store" style={{ padding: '12px 24px', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            View All Products →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }} className="products-grid">
          {products.map(p => (
            <HomeProductCard
              key={p.id}
              product={p}
              quantity={getQuantity(p.id)}
              onAddToCart={() => handleAddToCart(p)}
              onQuantityChange={(qty) => handleQuantityChange(p, qty)}
              onOpenModal={() => setModalProduct(p)}
            />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link href="/store" style={{ display: 'inline-flex', padding: '14px 32px', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            Browse All Products in Store →
          </Link>
        </div>
      </div>

      {modalProduct && (
        <ProductQuickViewModal
          product={modalProduct}
          quantity={getQuantity(modalProduct.id)}
          onAddToCart={() => handleAddToCart(modalProduct)}
          onQuantityChange={(qty) => handleQuantityChange(modalProduct, qty)}
          onClose={() => setModalProduct(null)}
        />
      )}

      <style suppressHydrationWarning>{`
        .home-product-card:hover { border-color: var(--gold-dark) !important; box-shadow: 0 0 0 1px var(--gold-dark) !important; }
        .home-product-card:hover .product-card-image { transform: scale(1.04) !important; }
        @media (max-width: 1024px) { .products-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 540px) { .products-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
