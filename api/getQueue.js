const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Aviso: Chaves do Supabase não configuradas no ambiente.");
}

const supabase = createClient(supabaseUrl || 'https://fake-url.supabase.co', supabaseKey || 'fake-key');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('projetos')
      .select('*')
      .order('created_at', { ascending: true }); // Ordenação temporal inicial
      
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.status(200).json(data);
  }
  
  return res.status(405).json({ message: 'Método não permitido.' });
}
