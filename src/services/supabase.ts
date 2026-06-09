import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brlqdlnbebtmtmyodxgy.supabase.co'; 
const supabaseKey = 'sb_publishable_RnlwUsYBPa8mSp0-NKvkuQ_SeU18NNz'; 

export const supabase = createClient(supabaseUrl, supabaseKey);