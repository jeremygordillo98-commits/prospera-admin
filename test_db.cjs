const { createClient } = require('@supabase/supabase-js');

// Use supabaseContable credentials to test (admin-level access)
const supabaseUrl = 'https://nfwsrupfckrskovhpgbf.supabase.co';
const supabaseKey = 'sb_publishable__OmEgpMRr6zsqcliDTio6A_7XoFPgwI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchemas() {
  console.log('\n=== Testing colaboradores_empresa structure ===');
  
  // Check columns by inserting with wrong name (it will show error)
  const { data, error } = await supabase
    .from('colaboradores_empresa')
    .select('*')
    .limit(3);
  
  if (error) {
    console.error('Error:', error.message);
  } else if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
    console.log('Sample:', JSON.stringify(data[0], null, 2));
  } else {
    console.log('No rows returned (RLS blocking or empty table)');
  }

  console.log('\n=== Testing plan_maestro structure ===');
  const { data: pm, error: pmErr } = await supabase
    .from('plan_maestro')
    .select('*')
    .limit(3);
  
  if (pmErr) {
    console.error('plan_maestro Error:', pmErr.message);
  } else if (pm && pm.length > 0) {
    console.log('Columns:', Object.keys(pm[0]));
    console.log('Sample:', JSON.stringify(pm.slice(0,2), null, 2));
  } else {
    console.log('No rows from plan_maestro (RLS blocking or empty)');
  }
}

inspectSchemas();
