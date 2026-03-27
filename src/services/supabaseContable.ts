import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_CONTABLE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_CONTABLE_SUPABASE_ANON_KEY;

export const supabaseContable = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'prospera-pymes-admin-session', // Prefijo único para evitar conflictos con el Admin de Finance
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});
