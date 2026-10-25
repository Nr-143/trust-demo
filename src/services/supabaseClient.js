/**
 * Supabase Client Initializer
 *
 * Provides a resilient, type-safe connection to the Supabase backend.
 * Reads environment variables configured in Vercel or local .env.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  '';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
  '';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    supabaseAnonKey.length > 20
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'mmg_trust_admin_auth',
      },
    })
  : null;

if (!isSupabaseConfigured()) {
  console.warn(
    '[Supabase] Environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not configured. Working in local demonstration fallback mode.'
  );
}

export default supabase;

