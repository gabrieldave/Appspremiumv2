import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Diagnóstico de configuración (siempre)
console.log('🔍 Diagnóstico de Supabase:');
console.log('URL:', supabaseUrl ? `✅ Configurada (${supabaseUrl.substring(0, 30)}...)` : '❌ Faltante');
console.log('Anon Key:', supabaseAnonKey ? `✅ Configurada (${supabaseAnonKey.substring(0, 20)}...)` : '❌ Faltante');

if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
  console.warn('⚠️ La URL de Supabase parece incorrecta:', supabaseUrl);
}

if (supabaseUrl && supabaseAnonKey) {
  console.log('✅ Supabase configurado correctamente');
} else {
  console.error('❌ Supabase NO está configurado correctamente');
}

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [];
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');
  
  throw new Error(
    `Faltan variables de entorno de Supabase: ${missing.join(', ')}\n` +
    'Por favor configura estas variables en tu archivo .env o en Vercel.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

export type Profile = {
  id: string;
  email: string;
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'trialing';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_end_date: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type MT4Product = {
  id: string;
  name: string;
  code: string;
  description: string;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
};

export type MT4Download = {
  id: string;
  product_id: string;
  version_name: string;
  version_number: string;
  file_url: string;
  file_size: string;
  release_date: string;
  release_notes: string;
  is_active: boolean;
  download_limit: number;
  created_at: string;
  updated_at: string;
  mt4_products?: MT4Product;
};

export type MT4DownloadLink = {
  id: string;
  download_id: string;
  file_url: string;
  label: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type UserDownload = {
  id: string;
  user_id: string;
  download_id: string;
  download_link_id: string | null;
  downloaded_at: string;
  ip_address: string | null;
  user_agent: string | null;
};

export type PremiumApp = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  video_url: string | null;
  download_url: string;
  web_app_url: string | null;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type SupportLink = {
  id: string;
  platform: string;
  url: string;
  icon_name: string;
  is_featured: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type Promotion = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  video_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SocialMediaLink = {
  id: string;
  platform: string;
  url: string;
  icon_name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};