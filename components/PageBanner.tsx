'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  image_url: string
}

// Picks a product from the live catalog to use as a decorative banner photo
// on content pages (About Us, Our Story, etc.) that otherwise have no
// imagery. `index` lets each page show a different product deterministically
// instead of everyone getting the same photo.
export default function PageBanner({ index, caption }: { index: number; caption?: string }) {
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then((products: Product[]) => {
        if (Array.isArray(products) && products.length > 0) {
          setProduct(products[index % products.length])
        }
      })
      .catch(() => {})
  }, [index])

  if (!product) return null

  return (
    <div
      className="relative w-full aspect-[21/9] sm:aspect-[3/1] mb-10 sm:mb-14 overflow-hidden"
      style={{ border: '1px solid var(--border)' }}
    >
      <Image
        src={product.image_url}
        alt={product.name}
        fill
        sizes="(max-width: 768px) 100vw, 768px"
        className="object-cover"
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)' }}
      />
      {caption && (
        <p
          className="absolute bottom-4 left-5 sm:bottom-6 sm:left-6 font-display text-white text-base sm:text-xl italic"
          style={{ fontWeight: 400 }}
        >
          {caption}
        </p>
      )}
    </div>
  )
}
