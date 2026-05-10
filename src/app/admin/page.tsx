"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { PerfumeTable } from "@/components/admin/perfume-table";
import { AddPerfumeDialog } from "@/components/admin/add-perfume-dialog";
import { EditPerfumeDialog } from "@/components/admin/edit-perfume-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Lock, ArrowLeft, Search, ArrowUpDown, Eye, EyeOff, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const [perfumes, setPerfumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: "asc" | "desc" }>({ key: "nombre", direction: "asc" });
  const [filterMarcas, setFilterMarcas] = useState<string[]>([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPerfume, setEditingPerfume] = useState<any | null>(null);

  // Check session storage on mount
  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
      fetchPerfumes();
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await fetch("/api/auth/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      
      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem("admin_auth", "true");
        fetchPerfumes();
      } else {
        setError("Contraseña incorrecta");
      }
    } catch (err) {
      setError("Error de conexión");
    }
  };

  const fetchPerfumes = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch("/api/perfumes");
      const data = await res.json();
      setPerfumes(data);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleAdd = async (newPerfume: any) => {
    const res = await fetch("/api/perfumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPerfume),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.details || errorData.error || "Error al crear el perfume");
    }
    
    fetchPerfumes();
  };

  const handleSaveEdit = async (updated: any) => {
    // Optimistic update
    const previousPerfumes = [...perfumes];
    setPerfumes(perfumes.map(p => p.id === updated.id ? { ...p, ...updated } : p));
    
    const res = await fetch(`/api/perfumes/${updated.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    
    if (res.ok) {
      fetchPerfumes(true);
    } else {
      setPerfumes(previousPerfumes);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este perfume?")) return;
    
    // Optimistic update
    const previousPerfumes = [...perfumes];
    setPerfumes(perfumes.filter(p => p.id !== id));
    
    const res = await fetch(`/api/perfumes/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchPerfumes(true);
    } else {
      setPerfumes(previousPerfumes);
    }
  };

  const handleToggleVisibility = async (id: string, current: boolean) => {
    // Optimistic update
    const nextVisible = !current;
    setPerfumes(perfumes.map(p => p.id === id ? { ...p, visible: nextVisible } : p));
    
    const res = await fetch(`/api/perfumes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: nextVisible }),
    });
    
    if (!res.ok) {
      // Revert if error
      setPerfumes(perfumes.map(p => p.id === id ? { ...p, visible: current } : p));
    } else {
      fetchPerfumes(true);
    }
  };

  const handleBulkVisibility = async (visible: boolean) => {
    const itemsToUpdate = filteredPerfumes;
    if (itemsToUpdate.length === 0) return;

    if (!confirm(`¿Estás seguro de ${visible ? 'mostrar' : 'ocultar'} todos los (${itemsToUpdate.length}) perfumes filtrados?`)) return;

    // Optimistic update
    const idsToUpdate = itemsToUpdate.map(p => p.id);
    setPerfumes(perfumes.map(p => idsToUpdate.includes(p.id) ? { ...p, visible } : p));

    try {
      // We'll update them one by one for now since there might not be a bulk API
      // If there's a bulk API, we should use it.
      await Promise.all(idsToUpdate.map(id => 
        fetch(`/api/perfumes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visible }),
        })
      ));
      fetchPerfumes(true);
    } catch (err) {
      console.error("Bulk update failed:", err);
      fetchPerfumes();
    }
  };

  const marcas = Array.from(new Set(perfumes.map(p => p.marca))).sort();

  const filteredPerfumes = perfumes
    .filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (p.inspiracion && p.inspiracion.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesMarca = filterMarcas.length === 0 || filterMarcas.includes(p.marca);
      return matchesSearch && matchesMarca;
    })
    .sort((a, b) => {
      const { key, direction } = sortConfig;
      const factor = direction === "asc" ? 1 : -1;

      if (key === "precio") {
        return (a.precio - b.precio) * factor;
      }
      if (key === "visible") {
        return (a.visible === b.visible ? 0 : a.visible ? -1 : 1) * factor;
      }
      
      const aVal = String(a[key] || "").toLowerCase();
      const bVal = String(b[key] || "").toLowerCase();
      return aVal.localeCompare(bVal) * factor;
    });

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const toggleMarcaFilter = (marca: string) => {
    setFilterMarcas(current => 
      current.includes(marca) 
        ? current.filter(m => m !== marca)
        : [...current, marca]
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-8 bg-card p-8 rounded-xl border shadow-lg">
          <div className="text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-serif">Panel Admin</h1>
            <p className="text-muted-foreground text-sm mt-1">Ingresa la contraseña para continuar</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input 
                type="password" 
                placeholder="Contraseña" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              {error && <p className="text-destructive text-xs">{error}</p>}
            </div>
            <Button type="submit" className="w-full">Entrar</Button>
            <Link href="/" className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground pt-2">
              <ArrowLeft className="w-3 h-3" /> Volver al catálogo
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-muted rounded-full transition-colors" title="Volver al catálogo">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-serif text-xl">Gestión de Catálogo</h1>
          </div>
          <Button onClick={() => setIsAddOpen(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Nuevo Perfume
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4 relative">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Nombre, marca o inspiración..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Filtrar por Marca</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between font-normal">
                    {filterMarcas.length === 0 
                      ? "Todas las marcas" 
                      : filterMarcas.length === 1 
                        ? filterMarcas[0] 
                        : `${filterMarcas.length} marcas seleccionadas`}
                    <Filter className="w-4 h-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
                  <DropdownMenuLabel>Marcas</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {marcas.map(m => (
                      <DropdownMenuCheckboxItem
                        key={m}
                        checked={filterMarcas.includes(m)}
                        onCheckedChange={() => toggleMarcaFilter(m)}
                        onSelect={(e) => e.preventDefault()} // Keeps the dropdown open on click
                      >
                        {m}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                  {filterMarcas.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={false}
                        onCheckedChange={() => setFilterMarcas([])}
                        onSelect={(e) => e.preventDefault()}
                        className="text-primary font-medium"
                      >
                        Limpiar filtros
                      </DropdownMenuCheckboxItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="md:col-span-4 flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="flex-1 text-slate-600 border-slate-200 hover:bg-slate-50"
                onClick={() => handleBulkVisibility(false)}
                title="Ocultar filtrados"
              >
                <EyeOff className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => handleBulkVisibility(true)}
                title="Mostrar filtrados"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredPerfumes.length} de {perfumes.length} perfumes
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Cargando catálogo...</p>
            </div>
          ) : (
            <PerfumeTable 
              data={filteredPerfumes} 
              onEdit={(p) => { setEditingPerfume(p); setIsEditOpen(true); }}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleVisibility}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          )}
        </div>
      </main>

      <AddPerfumeDialog 
        open={isAddOpen} 
        onOpenChange={setIsAddOpen} 
        onAdd={handleAdd} 
      />
      
      <EditPerfumeDialog 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        onSave={handleSaveEdit}
        perfume={editingPerfume}
      />
    </div>
  );
}
