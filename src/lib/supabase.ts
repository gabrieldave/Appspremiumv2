import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
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
  created_at: string;
  updated_at: string;
  mt4_products?: MT4Product;
};

export type PremiumApp = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  video_url: string | null;
  download_url: string;
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