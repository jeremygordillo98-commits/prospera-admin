import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_CONTABLE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_CONTABLE_SUPABASE_ANON_KEY;

export const supabaseContable = createClient(supabaseUrl, supabaseAnonKey);
