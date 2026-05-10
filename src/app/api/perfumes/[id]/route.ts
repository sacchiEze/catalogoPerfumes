import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const mapPerfume = (p: any) => ({
  id: p.id,
  nombre: p.nombre,
  marca: p.marca,
  precio: p.precio,
  notasDescripcion: p.notas_descripcion,
  notasImagenUrl: p.notas_imagen_url,
  productoImagenUrl: p.producto_imagen_url,
  inspiracion: p.inspiracion,
  inspiracionImagenUrl: p.inspiracion_imagen_url,
  genero: p.genero,
  images: p.images || [],
  visible: p.visible,
  createdAt: p.created_at,
  updatedAt: p.updated_at
});

// Helper to upload base64 image to Supabase Storage
async function uploadToSupabase(base64Data: string, subfolder: string) {
  if (!base64Data || !base64Data.startsWith('data:image')) return base64Data;
  
  try {
    const contentType = base64Data.split(';')[0].split(':')[1];
    const format = contentType.split('/')[1];
    const base64Image = base64Data.split(';base64,').pop();
    if (!base64Image) return base64Data;

    // Convert base64 to Buffer/ArrayBuffer
    const buffer = Buffer.from(base64Image, 'base64');
    const fileName = `${subfolder}/${uuidv4()}.${format}`;
    
    // Upload to 'perfumes' bucket
    const { data, error } = await supabase.storage
      .from('perfumes')
      .upload(fileName, buffer, {
        contentType,
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('perfumes')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image to Supabase:', error);
    return base64Data;
  }
}

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

    // Upload new images to Supabase Storage if they are base64
    const savedImages = await Promise.all(
      (body.images || []).map((img: string) => uploadToSupabase(img, 'products'))
    );
    
    const savedNotesImage = body.notasImagenUrl 
      ? await uploadToSupabase(body.notasImagenUrl, 'notes')
      : '';

    const savedInspirationImage = body.inspiracionImagenUrl
      ? await uploadToSupabase(body.inspiracionImagenUrl, 'inspirations')
      : '';

    const { data, error } = await supabase
      .from('perfumes_catalogo')
      .update({
        nombre: body.nombre,
        marca: body.marca,
        precio: body.precio,
        notas_descripcion: body.notasDescripcion,
        notas_imagen_url: savedNotesImage,
        producto_imagen_url: savedImages[0] || '',
        inspiracion: body.inspiracion,
        inspiracion_imagen_url: savedInspirationImage,
        genero: body.genero,
        images: savedImages,
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
