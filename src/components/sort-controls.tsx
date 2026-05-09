"use client";

import { ChevronDown } from "lucide-react";

export type SortOption = "price-asc" | "price-desc" | "name-asc" | "name-desc";

interface SortControlsProps {
  currentSort: SortOption;
  onSortChange: (value: SortOption) => void;
  resultCount: number;
}

export function SortControls({ currentSort, onSortChange, resultCount }: SortControlsProps) {
  return (
    <div className="flex items-center justify-between py-6 border-b border-border w-full">
      <p className="text-sm text-muted-foreground">
        {resultCount} {resultCount === 1 ? 'fragancia' : 'fragancias'}
      </p>
      
      <div className="relative">
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="appearance-none bg-transparent text-sm text-foreground pr-8 py-2 cursor-pointer focus:outline-none"
        >
          <option value="name-asc">Nombre: A–Z</option>
          <option value="name-desc">Nombre: Z–A</option>
          <option value="price-asc">Precio: Menor a Mayor</option>
          <option value="price-desc">Precio: Mayor a Menor</option>
        </select>
        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}
