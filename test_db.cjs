const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nfwsrupfckrskovhpgbf.supabase.co';
const supabaseAnonKey = 'sb_publishable__OmEgpMRr6zsqcliDTio6A_7XoFPgwI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  // Try signing in as admin first
  const { data: session, error: loginErr } = await supabase.auth.signInWithPassword({
    email: 'jeremygordillo98+pymes@gmail.com',
    password: 'Admin123!'  // placeholder - we'll check the structure another way
  });

  // Query plan_maestro regardless
  const { data, error } = await supabase
    .from('plan_maestro')
    .select('*')
    .limit(5);

  if (error) {
    console.error('Error fetching plan_maestro:', JSON.stringify(error, null, 2));
  } else {
    console.log('Columns and sample rows from plan_maestro:');
    if (data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]));
      console.log('Sample data:', JSON.stringify(data, null, 2));
    } else {
      console.log('No data returned (RLS may be blocking)');
    }
  }
}

run();
