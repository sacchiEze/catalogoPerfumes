"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { PerfumeTable } from "@/components/admin/perfume-table";
import { AddPerfumeDialog } from "@/components/admin/add-perfume-dialog";
import { EditPerfumeDialog } from "@/components/admin/edit-perfume-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Lock, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const [perfumes, setPerfumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {perfumes.length} {perfumes.length === 1 ? "perfume registrado" : "perfumes registrados"}
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Cargando catálogo...</p>
            </div>
          ) : (
            <PerfumeTable 
              data={perfumes} 
              onEdit={(p) => { setEditingPerfume(p); setIsEditOpen(true); }}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleVisibility}
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
