"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, X, Loader2, ChevronUp, ChevronDown, Crop, Plus } from "lucide-react";
import { ImageCropDialog } from "./image-crop-dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

interface EditPerfumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (perfume: any) => Promise<void>;
  perfume: any | null;
}

export function EditPerfumeDialog({ open, onOpenChange, onSave, perfume }: EditPerfumeDialogProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    marca: "",
    genero: "Unisex",
    notasDescripcion: "",
    inspiracion: "",
    visible: true
  });
  const [tamanos, setTamanos] = useState([{ volumen: "100ml", precio: "" }]);
  const [inspiracionImagenUrl, setInspiracionImagenUrl] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [notasImagenUrl, setNotasImagenUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cropping state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<"product" | "notes" | "inspiration" | number>("product");

  const productInputRef = useRef<HTMLInputElement>(null);
  const notesInputRef = useRef<HTMLInputElement>(null);
  const inspirationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (perfume) {
      setFormData({
        nombre: perfume.nombre,
        marca: perfume.marca,
        genero: perfume.genero || "Unisex",
        notasDescripcion: perfume.notasDescripcion || "",
        inspiracion: perfume.inspiracion || "",
        visible: perfume.visible
      });
      
      if (perfume.tamanos && perfume.tamanos.length > 0) {
        setTamanos(perfume.tamanos.map((t: any) => ({ volumen: t.volumen, precio: t.precio.toString() })));
      } else {
        setTamanos([{ volumen: "100ml", precio: perfume.precio ? perfume.precio.toString() : "" }]);
      }
      // Handle images array if it exists, fallback to single image
      setImages(perfume.images || (perfume.productoImagenUrl ? [perfume.productoImagenUrl] : []));
      setNotasImagenUrl(perfume.notasImagenUrl || null);
      setInspiracionImagenUrl(perfume.inspiracionImagenUrl || null);
    }
  }, [perfume, open]);

  const handleFileChange = (file: File, target: "product" | "notes" | "inspiration" | number) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageToCrop(e.target?.result as string);
      setCropTarget(target);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleFiles = (files: FileList | null, target: "product" | "notes" | "inspiration" | number) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen");
      return;
    }
    handleFileChange(file, target);
  };

  // Paste from clipboard support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!open) return;
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [open]);

  const handlePasteButtonClick = async (target: "product" | "notes" | "inspiration" | number) => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const file = new File([blob], "pasted-image.png", { type });
            handleFileChange(file, target);
            return;
          }
        }
      }
      toast.error("No hay imágenes en el portapapeles");
    } catch (err) {
      toast.error("No se pudo acceder al portapapeles. Asegúrate de dar permisos.");
    }
  };

  const onCropComplete = (croppedImage: string) => {
    if (cropTarget === "product") {
      setImages([...images, croppedImage]);
    } else if (cropTarget === "notes") {
      setNotasImagenUrl(croppedImage);
    } else if (cropTarget === "inspiration") {
      setInspiracionImagenUrl(croppedImage);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.marca || !perfume) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    const validTamanos = tamanos.filter(t => t.volumen && t.precio);
    if (validTamanos.length === 0) {
      toast.error("Agrega al menos un tamaño con precio válido");
      return;
    }

    setIsSubmitting(true);

    const basePrice = Math.min(...validTamanos.map(t => parseFloat(t.precio)));

    try {
      await onSave({
        ...perfume,
        ...formData,
        precio: basePrice,
        tamanos: validTamanos.map(t => ({ volumen: t.volumen, precio: parseFloat(t.precio) })),
        productoImagenUrl: images[0] || "",
        notasImagenUrl: notasImagenUrl || "",
        inspiracionImagenUrl: inspiracionImagenUrl || "",
        images: images,
      });
      toast.success("Perfume actualizado correctamente");
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast.error("Error al actualizar: " + (error.message || "Error desconocido"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Perfume</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input id="edit-nombre" value={formData.nombre} onChange={(e) => handleChange("nombre", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-marca">Marca</Label>
                <Input id="edit-marca" value={formData.marca} onChange={(e) => handleChange("marca", e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Género</Label>
                <Select value={formData.genero} onValueChange={(v) => handleChange("genero", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 border p-4 rounded-lg bg-muted/20">
              <div className="flex items-center justify-between">
                <Label className="text-base">Tamaños y Precios</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setTamanos([...tamanos, { volumen: "", precio: "" }])}
                >
                  <Plus className="w-4 h-4 mr-1" /> Agregar Tamaño
                </Button>
              </div>
              
              <div className="space-y-3">
                {tamanos.map((tamano, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Tamaño (ej. 100ml)</Label>
                      <Input 
                        value={tamano.volumen} 
                        onChange={(e) => {
                          const newTamanos = [...tamanos];
                          newTamanos[index].volumen = e.target.value;
                          setTamanos(newTamanos);
                        }} 
                        placeholder="100ml"
                        required
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Precio (ARS)</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        value={tamano.precio} 
                        onChange={(e) => {
                          const newTamanos = [...tamanos];
                          newTamanos[index].precio = e.target.value;
                          setTamanos(newTamanos);
                        }} 
                        required
                      />
                    </div>
                    {tamanos.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="mt-5 text-destructive"
                        onClick={() => {
                          const newTamanos = [...tamanos];
                          newTamanos.splice(index, 1);
                          setTamanos(newTamanos);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notas">Descripción de Notas</Label>
              <Textarea id="edit-notas" value={formData.notasDescripcion} onChange={(e) => handleChange("notasDescripcion", e.target.value)} rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-inspiracion">Inspiración de: (Opcional)</Label>
              <Input id="edit-inspiracion" value={formData.inspiracion} onChange={(e) => handleChange("inspiracion", e.target.value)} placeholder="Ej: Invictus de Paco Rabanne" />
            </div>

            <div className="space-y-2">
              <Label>Foto del Perfume Original (Referencia)</Label>
              <div 
                className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center min-h-[140px] hover:bg-muted/50 hover:border-primary/50 transition-all group/insp relative"
                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFiles(e.dataTransfer.files, "inspiration");
                }}
              >
                {inspiracionImagenUrl ? (
                  <div className="relative w-full h-32">
                    <img src={inspiracionImagenUrl} alt="Inspiración" className="w-full h-full object-contain" />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button type="button" size="icon" variant="secondary" className="h-8 w-8 shadow-md" onClick={(e) => { e.stopPropagation(); setImageToCrop(inspiracionImagenUrl); setCropTarget("inspiration"); setCropDialogOpen(true); }}>
                        <Crop className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="icon" variant="destructive" className="h-8 w-8 shadow-md" onClick={(e) => { e.stopPropagation(); setInspiracionImagenUrl(null); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground mb-2 group/insp:text-primary transition-colors" />
                    <span className="text-[10px] text-muted-foreground group/insp:text-primary transition-colors mb-2 text-center">Subir foto del perfume original</span>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant="outline" className="h-7 text-[9px] px-2" onClick={() => inspirationInputRef.current?.click()}>Subir</Button>
                      <Button type="button" size="sm" variant="outline" className="h-7 text-[9px] px-2" onClick={() => handlePasteButtonClick("inspiration")}>Pegar</Button>
                    </div>
                  </div>
                )}
                <input ref={inspirationInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileChange(f, "inspiration"); }} />
              </div>
            </div>

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
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-medium">
                        Portada
                      </div>
                    )}
                  </div>
                ))}
                
                <div
                  onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFiles(e.dataTransfer.files, "product");
                  }}
                  className="aspect-[3/4] border-2 border-dashed rounded-lg flex flex-col items-center justify-center hover:bg-muted/50 hover:border-primary/50 transition-all group/add relative"
                >
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground mb-2 group-hover/add:text-primary transition-colors" />
                    <span className="text-[10px] text-muted-foreground group-hover/add:text-primary transition-colors mb-2">Arrastrá o hacé click</span>
                    <div className="flex gap-1">
                      <Button type="button" size="sm" variant="outline" className="h-7 text-[9px] px-2" onClick={() => productInputRef.current?.click()}>Subir</Button>
                      <Button type="button" size="sm" variant="outline" className="h-7 text-[9px] px-2" onClick={() => handlePasteButtonClick("product")}>Pegar</Button>
                    </div>
                  </div>
                </div>
              </div>
              <input ref={productInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileChange(f, "product"); }} />
            </div>

            <div className="space-y-2">
              <Label>Imagen Pirámide (Fragrantica)</Label>
              <div 
                className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center min-h-[140px] hover:bg-muted/50 hover:border-primary/50 transition-all group/notes relative"
                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFiles(e.dataTransfer.files, "notes");
                }}
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
                  <div className="flex flex-col items-center justify-center text-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground mb-2 group/notes:text-primary transition-colors" />
                    <span className="text-[10px] text-muted-foreground group/notes:text-primary transition-colors mb-2 text-center">Subir pirámide olfativa</span>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant="outline" className="h-7 text-[9px] px-2" onClick={() => notesInputRef.current?.click()}>Subir</Button>
                      <Button type="button" size="sm" variant="outline" className="h-7 text-[9px] px-2" onClick={() => handlePasteButtonClick("notes")}>Pegar</Button>
                    </div>
                  </div>
                )}
                <input ref={notesInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileChange(f, "notes"); }} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="edit-visible" 
                checked={formData.visible} 
                onChange={(e) => handleChange("visible", e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="edit-visible">Visible en el catálogo</Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Guardar Cambios
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
