import { createClient } from '@supabase/supabase-js';
// Script de utilidad para revisar esquema

// Para este script de utilidad, usaremos valores directamente si no hay .env cargado
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://brlqdlnbebtmtmyodxgy.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_RnlwUsYBPa8mSp0-NKvkuQ_SeU18NNz';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.from('perfiles').select('*').limit(1)
  if (error) console.error(error)
  else console.log(JSON.stringify(data[0], null, 2))
}

checkSchema()
