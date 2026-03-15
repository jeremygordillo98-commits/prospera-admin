// src/supabase.ts
import { createClient } from '@supabase/supabase-js';

// URL con la 'n' corregida: brlqdln...
const supabaseUrl = 'https://brlqdlnbebtmtmyodxgy.supabase.co'; 

// Tu clave pública
const supabaseKey = 'sb_publishable_RnlwUsYBPa8mSp0-NKvkuQ_SeU18NNz'; 

export const supabase = createClient(supabaseUrl, supabaseKey);