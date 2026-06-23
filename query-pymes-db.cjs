const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nfwsrupfckrskovhpgbf.supabase.co';
const supabaseKey = 'sb_publishable__OmEgpMRr6zsqcliDTio6A_7XoFPgwI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    console.log("Fetching empresas_gestionadas...");
    const { data: companies, error: errComp } = await supabase
      .from('empresas_gestionadas')
      .select('*');
      
    if (errComp) {
      console.error("Error fetching companies:", errComp);
      return;
    }
    
    console.log("Companies found:", companies.length);
    companies.forEach(c => {
      console.log(`ID: ${c.id}, Nombre: ${c.nombre_empresa}, RUC: ${c.ruc_empresa}, id_usuario (Owner): ${c.id_usuario}`);
    });
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

run();
