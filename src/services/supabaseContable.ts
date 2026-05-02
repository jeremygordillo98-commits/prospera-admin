import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_CONTABLE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_CONTABLE_SUPABASE_ANON_KEY;
const supabaseServiceRole = import.meta.env.VITE_CONTABLE_SUPABASE_SERVICE_ROLE_KEY;

export const supabaseContable = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'prospera-pymes-admin-session', // Prefijo único para evitar conflictos con el Admin de Finance
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

// Cliente con privilegios de administrador para crear enlaces mágicos sin contraseña
export const supabaseContableAdmin = supabaseServiceRole 
  ? createClient(supabaseUrl, supabaseServiceRole, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  : null;

