import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(data?.map(mapPerfume) || []);
  } catch (error: any) {
    console.error('Error fetching perfumes:', error);
    return NextResponse.json({ error: 'Error al obtener perfumes', details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('perfumes_catalogo')
      .insert([
        {
          nombre: body.nombre,
          marca: body.marca,
          precio: body.precio ?? 0,
          notas_descripcion: body.notasDescripcion ?? '',
          notas_imagen_url: body.notasImagenUrl ?? '',
          producto_imagen_url: body.productoImagenUrl ?? '',
          images: body.images ?? [],
          visible: body.visible ?? true,
        }
      ])
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(mapPerfume(data), { status: 201 });
  } catch (error: any) {
    console.error('Error creating perfume:', error);
    return NextResponse.json({ error: 'Error al crear perfume', details: error.message }, { status: 500 });
  }
}
