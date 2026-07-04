const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nfwsrupfckrskovhpgbf.supabase.co';
const supabaseAnonKey = 'sb_publishable__OmEgpMRr6zsqcliDTio6A_7XoFPgwI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase
    .from('plan_maestro')
    .select('*')
    .limit(3);

  if (error) {
    console.error('Error fetching plan_maestro:', error);
  } else {
    console.log('Sample rows from plan_maestro:', data);
  }
}

run();
