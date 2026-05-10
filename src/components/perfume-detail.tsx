"use client"

import type { Perfume } from "./product-card"
import { ImageCarousel } from "./image-carousel"
import { WhatsAppButton } from "./whatsapp-button"

interface PerfumeDetailProps {
  perfume: Perfume
}

export function PerfumeDetail({ perfume }: PerfumeDetailProps) {
  // Build images array from the available URLs in the DB
  const carouselImages = [...(perfume.images && perfume.images.length > 0 
    ? perfume.images 
    : [perfume.productoImagenUrl])];
  
  if (perfume.notasImagenUrl && !carouselImages.includes(perfume.notasImagenUrl)) {
    carouselImages.push(perfume.notasImagenUrl)
  }

  if (perfume.inspiracionImagenUrl && !carouselImages.includes(perfume.inspiracionImagenUrl)) {
    carouselImages.push(perfume.inspiracionImagenUrl)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      <div className="w-full">
        <ImageCarousel 
          images={carouselImages.filter(Boolean)} 
          alt={perfume.nombre}
          inspirationImage={perfume.inspiracionImagenUrl}
        />
      </div>

      <div className="flex flex-col">
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-widest">
            {perfume.marca}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground leading-tight text-balance">
            {perfume.nombre}
          </h1>

          {perfume.inspiracion && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Inspiración de:</span>
              <span className="text-sm font-serif italic text-foreground/80">{perfume.inspiracion}</span>
            </div>
          )}
          
          <p className="text-2xl sm:text-3xl font-medium text-foreground pt-2">
            ${perfume.precio.toLocaleString("es-AR")}
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <h2 className="text-xs sm:text-sm text-muted-foreground uppercase tracking-widest mb-4">
            Notas de la Fragancia
          </h2>
          <p className="text-foreground/80 leading-relaxed text-pretty whitespace-pre-wrap">
            {perfume.notasDescripcion}
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <WhatsAppButton perfume={perfume} />
          <p className="mt-3 text-xs text-muted-foreground text-center sm:text-left">
            Consulta gratuita. Hacemos envíos.
          </p>
        </div>
      </div>
    </div>
  )
}
