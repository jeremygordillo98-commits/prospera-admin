const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nfwsrupfckrskovhpgbf.supabase.co';
const supabaseKey = 'sb_publishable__OmEgpMRr6zsqcliDTio6A_7XoFPgwI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    console.log("Fetching profiles from Pymes DB...");
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .limit(10);
      
    if (error) {
      console.error("Error fetching profiles:", error);
      return;
    }
    
    console.log("Profiles found:", data.length);
    data.forEach(p => {
      console.log(`ID: ${p.id}, id_usuario: ${p.id_usuario}, Nombre: ${p.nombre_completo}, Email: ${p.email}, Rol: ${p.rol}, es_admin: ${p.es_admin}`);
    });
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

run();
