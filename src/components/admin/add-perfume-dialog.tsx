"use client";

import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, X, Loader2, ChevronUp, ChevronDown, Crop } from "lucide-react";
import { ImageCropDialog } from "./image-crop-dialog";

interface AddPerfumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (perfume: any) => Promise<void>;
}

export function AddPerfumeDialog({ open, onOpenChange, onAdd }: AddPerfumeDialogProps) {
  const [nombre, setNombre] = useState("");
  const [marca, setMarca] = useState("");
  const [precio, setPrecio] = useState("");
  const [notasDescripcion, setNotasDescripcion] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [notasImagenUrl, setNotasImagenUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cropping state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<"product" | "notes" | number>("product");

  const productInputRef = useRef<HTMLInputElement>(null);
  const notesInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File, target: "product" | "notes" | number) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageToCrop(e.target?.result as string);
      setCropTarget(target);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = (croppedImage: string) => {
    if (cropTarget === "product") {
      setImages([...images, croppedImage]);
    } else if (cropTarget === "notes") {
      setNotasImagenUrl(croppedImage);
    } else if (typeof cropTarget === "number") {
      const newImages = [...images];
      newImages[cropTarget] = croppedImage;
      setImages(newImages);
    }
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    if (direction === "up" && index > 0) {
      [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
    } else if (direction === "down" && index < images.length - 1) {
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    }
    setImages(newImages);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setNombre("");
    setMarca("");
    setPrecio("");
    setNotasDescripcion("");
    setImages([]);
    setNotasImagenUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !marca || !precio) return;
    setIsSubmitting(true);

    try {
      await onAdd({
        nombre,
        marca,
        precio: parseFloat(precio),
        notasDescripcion,
        // Since the backend only has one producto_imagen_url, we use the first image from the carousel
        productoImagenUrl: images[0] || "",
        notasImagenUrl: notasImagenUrl || "",
        // We can pass the full images array, the backend will need to handle it (e.g. as a JSON string in a new column)
        images: images,
        visible: true,
      });
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Perfume</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input id="marca" value={marca} onChange={(e) => setMarca(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio">Precio (ARS)</Label>
              <Input id="precio" type="number" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Descripción de Notas</Label>
              <Textarea id="notas" value={notasDescripcion} onChange={(e) => setNotasDescripcion(e.target.value)} rows={3} />
            </div>

            {/* Carousel Organization */}
            <div className="space-y-4">
              <Label>Imágenes del Producto (Carrusel)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group aspect-[3/4] border rounded-lg overflow-hidden bg-muted">
                    <img src={img} alt={`Producto ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button type="button" size="icon" variant="secondary" className="h-8 w-8" onClick={() => moveImage(index, "up")} disabled={index === 0}>
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="icon" variant="secondary" className="h-8 w-8" onClick={() => moveImage(index, "down")} disabled={index === images.length - 1}>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="icon" variant="destructive" className="h-8 w-8" onClick={() => removeImage(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="icon" variant="secondary" className="h-8 w-8" onClick={() => { setImageToCrop(img); setCropTarget(index); setCropDialogOpen(true); }}>
                        <Crop className="h-4 w-4" />
                      </Button>
                    </div>
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full">
                        Portada
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => productInputRef.current?.click()}
                  className="aspect-[3/4] border-2 border-dashed rounded-lg flex flex-col items-center justify-center hover:bg-muted/50 transition-colors"
                >
                  <ImageIcon className="w-8 h-8 text-muted-foreground mb-1" />
                  <span className="text-[10px] text-muted-foreground">Agregar Foto</span>
                </button>
              </div>
              <input ref={productInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileChange(f, "product"); }} />
            </div>

            <div className="space-y-2">
              <Label>Imagen Pirámide (Fragrantica)</Label>
              <div 
                className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px] cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => notesInputRef.current?.click()}
              >
                {notasImagenUrl ? (
                  <div className="relative w-full h-32">
                    <img src={notasImagenUrl} alt="Notas" className="w-full h-full object-contain" />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button type="button" size="icon" variant="secondary" className="h-8 w-8 shadow-md" onClick={(e) => { e.stopPropagation(); setImageToCrop(notasImagenUrl); setCropTarget("notes"); setCropDialogOpen(true); }}>
                        <Crop className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="icon" variant="destructive" className="h-8 w-8 shadow-md" onClick={(e) => { e.stopPropagation(); setNotasImagenUrl(null); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground text-center">Subir pirámide olfativa</span>
                  </>
                )}
                <input ref={notesInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileChange(f, "notes"); }} />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Agregar Perfume
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ImageCropDialog
        image={imageToCrop}
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        onCropComplete={onCropComplete}
        aspect={cropTarget === "notes" ? undefined : 3/4}
      />
    </>
  );
}
