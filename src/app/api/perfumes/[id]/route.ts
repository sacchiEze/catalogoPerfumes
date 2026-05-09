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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('perfumes_catalogo')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Perfume no encontrado' }, { status: 404 });
    
    return NextResponse.json(mapPerfume(data));
  } catch (error: any) {
    console.error('Error fetching perfume:', error);
    return NextResponse.json({ error: 'Error al obtener perfume', details: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('perfumes_catalogo')
      .update({
        nombre: body.nombre,
        marca: body.marca,
        precio: body.precio,
        notas_descripcion: body.notasDescripcion,
        notas_imagen_url: body.notasImagenUrl,
        producto_imagen_url: body.productoImagenUrl,
        images: body.images || [],
        visible: body.visible,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(mapPerfume(data));
  } catch (error: any) {
    console.error('Error updating perfume:', error);
    return NextResponse.json({ error: 'Error al actualizar perfume', details: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('perfumes_catalogo')
      .update({ visible: body.visible, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(mapPerfume(data));
  } catch (error: any) {
    console.error('Error toggling visibility:', error);
    return NextResponse.json({ error: 'Error al cambiar visibilidad' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('perfumes_catalogo')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting perfume:', error);
    return NextResponse.json({ error: 'Error al eliminar perfume', details: error.message }, { status: 500 });
  }
}
