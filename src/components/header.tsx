"use client";

import { Search, Settings } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  onSearchChange: (value: string) => void;
}

export function Header({ onSearchChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-24">
          <div className="flex flex-col">
            <h1 className="font-serif text-2xl md:text-3xl tracking-tight text-foreground">
              Parfums de Mayo
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-40 sm:w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar fragancias..."
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
              />
            </div>
            
          </div>
        </div>
      </div>
    </header>
  );
}
