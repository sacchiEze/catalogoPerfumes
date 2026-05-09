import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validar si las credenciales están configuradas y no son los valores por defecto
const isConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'tu_supabase_url' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'tu_supabase_anon_key';

if (!isConfigured) {
  console.error('CRÍTICO: Credenciales de Supabase no configuradas en .env.local');
}

// Exportamos el cliente solo si está configurado, o un proxy que avise del error
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null as any;
