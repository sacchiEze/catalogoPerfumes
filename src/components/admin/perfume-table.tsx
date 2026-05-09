"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";

interface PerfumeTableProps {
  data: any[];
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, current: boolean) => void;
}

export function PerfumeTable({ data, onEdit, onDelete, onToggleVisibility }: PerfumeTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                No hay perfumes registrados.
              </TableCell>
            </TableRow>
          ) : (
            data.map((perfume) => (
              <TableRow key={perfume.id} className={perfume.visible ? "" : "opacity-60 bg-muted/30"}>
                <TableCell>
                  <div className="w-12 h-16 bg-muted rounded overflow-hidden">
                    {perfume.productoImagenUrl ? (
                      <img src={perfume.productoImagenUrl} alt={perfume.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground text-center px-1">
                        Sin foto
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {perfume.nombre}
                </TableCell>
                <TableCell>{perfume.marca}</TableCell>
                <TableCell className="text-right font-mono">
                  ${perfume.precio.toLocaleString("es-AR")}
                </TableCell>
                <TableCell className="text-center">
                  {perfume.visible ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">Visible</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-500/10 text-slate-600 border-slate-200">Oculto</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onToggleVisibility(perfume.id, !!perfume.visible)}
                      title={perfume.visible ? "Ocultar" : "Mostrar"}
                    >
                      {perfume.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEdit(perfume)}
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(perfume.id)}
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
