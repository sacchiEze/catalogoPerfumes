"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { WhatsAppButton } from "./whatsapp-button";

export interface Perfume {
  id: string;
  nombre: string;
  marca: string;
  precio: number;
  notasDescripcion: string;
  notasImagenUrl: string;
  productoImagenUrl: string;
  images?: string[];
  visible: boolean;
}

interface ProductCardProps {
  perfume: Perfume;
}

export function ProductCard({ perfume }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="group">
      <Link href={`/perfume/${perfume.id}`} className="block">
        <div className="aspect-[3/4] bg-secondary mb-4 overflow-hidden">
          {!imgError && perfume.productoImagenUrl ? (
            <Image
              src={perfume.productoImagenUrl}
              alt={`${perfume.nombre} de ${perfume.marca}`}
              width={400}
              height={533}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-muted">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">{perfume.marca}</span>
              <span className="font-serif text-lg leading-tight">{perfume.nombre}</span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          {perfume.marca}
        </p>
        <Link href={`/perfume/${perfume.id}`}>
          <h3 className="font-serif text-lg text-foreground leading-tight hover:text-foreground/70 transition-colors">
            {perfume.nombre}
          </h3>
        </Link>
        
        <div className="pt-1">
          <p className="text-xs text-muted-foreground mb-1">Notas</p>
          <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">
            {perfume.notasDescripcion}
          </p>
        </div>
        
        <p className="text-lg font-medium text-foreground pt-2">
          ${perfume.precio.toLocaleString("es-AR")}
        </p>
      </div>
      
      <div className="mt-3">
        <WhatsAppButton perfume={perfume} variant="compact" />
      </div>
    </article>
  );
}
