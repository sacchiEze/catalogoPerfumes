"use client"

import { useState } from "react"
import type { Perfume } from "./product-card"
import { ImageCarousel } from "./image-carousel"
import { WhatsAppButton } from "./whatsapp-button"

interface PerfumeDetailProps {
  perfume: Perfume
}

export function PerfumeDetail({ perfume }: PerfumeDetailProps) {
  const [selectedTamano, setSelectedTamano] = useState(
    perfume.tamanos && perfume.tamanos.length > 0 ? perfume.tamanos[0] : null
  );

  // Build images array from the available URLs in the DB
  const validImages = perfume.images && perfume.images.length > 0 ? perfume.images : [];
  if (validImages.length === 0 && perfume.productoImagenUrl) {
    validImages.push(perfume.productoImagenUrl);
  }
  
  const carouselImages = [...validImages];
  
  if (perfume.notasImagenUrl && !carouselImages.includes(perfume.notasImagenUrl)) {
    carouselImages.push(perfume.notasImagenUrl)
  }

  if (perfume.inspiracionImagenUrl && !carouselImages.includes(perfume.inspiracionImagenUrl)) {
    carouselImages.push(perfume.inspiracionImagenUrl)
  }

  // Filter out any empty strings or nulls
  const finalImages = carouselImages.filter(Boolean);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      <div className="w-full">
        {finalImages.length > 0 ? (
          <ImageCarousel 
            images={finalImages} 
            alt={perfume.nombre}
            inspirationImage={perfume.inspiracionImagenUrl}
          />
        ) : (
          <div className="aspect-[3/4] bg-muted rounded-xl flex items-center justify-center border-2 border-dashed">
            <p className="text-muted-foreground text-sm">Sin imagen disponible</p>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-widest">
              {perfume.marca}
            </p>
            {perfume.genero && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                perfume.genero === "Masculino" ? "bg-blue-50 text-blue-600 border-blue-100" :
                perfume.genero === "Femenino" ? "bg-pink-50 text-pink-600 border-pink-100" :
                "bg-slate-50 text-slate-600 border-slate-100"
              }`}>
                {perfume.genero}
              </span>
            )}
          </div>
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
            ${(selectedTamano ? selectedTamano.precio : perfume.precio).toLocaleString("es-AR")}
          </p>
          
          {perfume.tamanos && perfume.tamanos.length > 0 && (
            <div className="pt-4 space-y-3">
              <span className="text-sm font-medium text-muted-foreground">Tamaño:</span>
              <div className="flex flex-wrap gap-2">
                {perfume.tamanos.map((t) => (
                  <button
                    key={t.volumen}
                    onClick={() => setSelectedTamano(t)}
                    className={`px-4 py-2 text-sm font-medium rounded-md border transition-all ${
                      selectedTamano?.volumen === t.volumen
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary/50"
                    }`}
                  >
                    {t.volumen}
                  </button>
                ))}
              </div>
            </div>
          )}
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
          <WhatsAppButton 
            perfume={perfume} 
            selectedSize={selectedTamano?.volumen}
            selectedPrice={selectedTamano?.precio}
          />
          <p className="mt-3 text-xs text-muted-foreground text-center sm:text-left">
            Consulta gratuita. Hacemos envíos.
          </p>
        </div>
      </div>
    </div>
  )
}
