"use client"

import { ProductCard, type Perfume } from "./product-card"

interface ProductGridProps {
  perfumes: Perfume[]
}

export function ProductGrid({ perfumes }: ProductGridProps) {
  if (perfumes.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">No fragrances found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14 py-10">
      {perfumes.map((perfume) => (
        <ProductCard key={perfume.id} perfume={perfume} />
      ))}
    </div>
  )
}
