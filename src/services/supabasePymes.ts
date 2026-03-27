import { createClient } from '@supabase/supabase-js';

// Cliente para el proyecto Prospera Pymes (nfwsrupfckrskovhpgbf)
const supabasePymesUrl = 'https://nfwsrupfckrskovhpgbf.supabase.co';
const supabasePymesKey = 'sb_publishable__OmEgpMRr6zsqcliDTio6A_7XoFPgwI'; // Mismo Anon Key de su .env

export const supabasePymes = createClient(supabasePymesUrl, supabasePymesKey);
