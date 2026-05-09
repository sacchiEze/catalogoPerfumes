"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { PerfumeDetail } from "@/components/perfume-detail"
import type { Perfume } from "@/components/product-card"
import { Loader2, ArrowLeft } from "lucide-react"

export default function PerfumePage() {
  const params = useParams()
  const router = useRouter()
  const [perfume, setPerfume] = useState<Perfume | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadPerfume() {
      try {
        const id = params?.id as string
        if (!id) return
        const res = await fetch(`/api/perfumes/${id}`)
        if (!res.ok) throw new Error("No encontrado")
        const data = await res.json()
        setPerfume(data)
      } catch (err) {
        console.error("Error loading perfume:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadPerfume()
  }, [params?.id])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Volver al catálogo
        </button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Cargando fragancia...</p>
          </div>
        ) : perfume ? (
          <PerfumeDetail perfume={perfume} />
        ) : (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">
              Fragancia no encontrada.
            </p>
          </div>
        )}
      </main>
      
      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-serif text-lg text-foreground">Parfums de Mayo</p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Todos los derechos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
