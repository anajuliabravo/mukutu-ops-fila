const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  // Diagnóstico de variáveis
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ 
      error: 'Variáveis de ambiente não encontradas.',
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey
    });
  }

  try {
    const supabase = createClient(supabaseUrl.trim(), supabaseKey.trim());

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (error) {
        return res.status(500).json({ 
          error: error.message,
          hint: error.hint || null,
          code: error.code || null
        });
      }
      
      return res.status(200).json(data);
    }
    
    return res.status(405).json({ message: 'Método não permitido.' });
  } catch (e) {
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
};
