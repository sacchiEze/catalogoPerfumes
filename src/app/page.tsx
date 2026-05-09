"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/header";
import { ProductGrid } from "@/components/product-grid";
import { SortControls, type SortOption } from "@/components/sort-controls";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [perfumes, setPerfumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch("/api/catalogo");
        if (!res.ok) {
          throw new Error(`Error del servidor: ${res.status}`);
        }
        const data = await res.json();
        setPerfumes(data);
      } catch (err) {
        console.error("Error loading catalog:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const filteredAndSortedPerfumes = useMemo(() => {
    let result = perfumes.filter(
      (perfume) =>
        perfume.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        perfume.marca.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.precio - b.precio);
        break;
      case "price-desc":
        result.sort((a, b) => b.precio - a.precio);
        break;
      case "name-asc":
        result.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case "name-desc":
        result.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
    }

    return result;
  }, [perfumes, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Header onSearchChange={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground">
              Nuestra Colección
            </h2>
            <p className="text-muted-foreground mt-2">
              Fragancias disponibles
            </p>
          </div>
        </div>


        <SortControls
          currentSort={sortBy}
          onSortChange={setSortBy}
          resultCount={filteredAndSortedPerfumes.length}
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Abriendo el catálogo...</p>
          </div>
        ) : filteredAndSortedPerfumes.length > 0 ? (
          <ProductGrid perfumes={filteredAndSortedPerfumes} />
        ) : (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">
              No se encontraron perfumes que coincidan con tu búsqueda.
            </p>
          </div>
        )}
      </main>

      <footer className="border-t py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="font-serif text-xl mb-4">Parfums de Mayo</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Dedicados a traer las fragancias más sofisticadas y exclusivas del mundo directamente a tu puerta.
          </p>
          <div className="mt-8 text-[10px] uppercase tracking-widest text-muted-foreground">
            © {new Date().getFullYear()} Parfums de Mayo · Todos los derechos reservados
          </div>
        </div>
      </footer>
    </div>
  );
}
