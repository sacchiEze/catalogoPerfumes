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

    // Upload images to Supabase Storage
    const savedImages = await Promise.all(
      (body.images || []).map((img: string) => uploadToSupabase(img, 'products'))
    );
    
    const savedNotesImage = body.notasImagenUrl 
      ? await uploadToSupabase(body.notasImagenUrl, 'notes')
      : '';

    const { data, error } = await supabase
      .from('perfumes_catalogo')
      .insert([
        {
          nombre: body.nombre,
          marca: body.marca,
          precio: body.precio ?? 0,
          notas_descripcion: body.notasDescripcion ?? '',
          notas_imagen_url: savedNotesImage,
          producto_imagen_url: savedImages[0] || '',
          images: savedImages,
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
