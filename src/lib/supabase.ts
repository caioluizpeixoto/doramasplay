import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key'
  );
};

// If valid credentials are provided, use real client; otherwise fallback to safe dummy client
export const supabase = createClient(
  isSupabaseConfigured() ? (supabaseUrl as string) : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? (supabaseAnonKey as string) : 'placeholder-key'
);
