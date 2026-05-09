import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Utility to map Supabase snake_case to Frontend camelCase
const mapPerfume = (p: any) => ({
  id: p.id,
  nombre: p.nombre,
  marca: p.marca,
  precio: p.precio,
  notasDescripcion: p.notas_descripcion,
  notasImagenUrl: p.notas_imagen_url,
  productoImagenUrl: p.producto_imagen_url,
  images: p.images || [],
  visible: p.visible,
  createdAt: p.created_at,
  updatedAt: p.updated_at
});

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('perfumes_catalogo')
      .select('*')
      .eq('visible', true)
      .order('nombre', { ascending: true });

    if (error) throw error;
    
    return NextResponse.json(data?.map(mapPerfume) || []);
  } catch (error: any) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json({ error: 'Error al obtener catálogo', details: error.message }, { status: 500 });
  }
}
