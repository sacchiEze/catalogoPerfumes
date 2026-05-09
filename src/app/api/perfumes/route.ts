import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
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

// Helper to save base64 image
async function saveBase64Image(base64Data: string, subfolder: string) {
  if (!base64Data || !base64Data.startsWith('data:image')) return base64Data;
  
  try {
    const format = base64Data.split(';')[0].split('/')[1];
    const base64Image = base64Data.split(';base64,').pop();
    if (!base64Image) return base64Data;

    const fileName = `${uuidv4()}.${format}`;
    const relativePath = `/uploads/${subfolder}/${fileName}`;
    const absolutePath = path.join(process.cwd(), 'public', relativePath);
    
    fs.writeFileSync(absolutePath, base64Image, { encoding: 'base64' });
    return relativePath;
  } catch (error) {
    console.error('Error saving image:', error);
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

    // Save images to local storage
    const savedImages = await Promise.all(
      (body.images || []).map((img: string) => saveBase64Image(img, 'products'))
    );
    
    const savedNotesImage = body.notasImagenUrl 
      ? await saveBase64Image(body.notasImagenUrl, 'notes')
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
