import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brlqdlnbebtmtmyodxgy.supabase.co'; 
const supabaseKey = 'sb_publishable_RnlwUsYBPa8mSp0-NKvkuQ_SeU18NNz'; 
const supabaseServiceRole = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Cliente con privilegios de administrador para impersonación (App)
export const supabaseAdmin = supabaseServiceRole 
  ? createClient(supabaseUrl, supabaseServiceRole, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  : null;