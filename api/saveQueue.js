const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
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

    if (req.method === 'POST') {
      const rows = req.body;
      
      if (!Array.isArray(rows)) {
         return res.status(400).json({ error: 'O formato dos dados importados deve ser uma Array.' });
      }

      // 1. Limpa a fila antes de subir a planilha novamente
      const { error: delError } = await supabase
        .from('projetos')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (delError) throw delError;

      // 2. Insere os novos dados
      if (rows.length > 0) {
          const { data, error: insertError } = await supabase
            .from('projetos')
            .insert(rows)
            .select();

          if (insertError) throw insertError;
          return res.status(200).json({ message: 'Nova planilha importada com sucesso no Supabase.', data });
      } else {
          return res.status(200).json({ message: 'Planilha contendo 0 registros submetida. Fila limpa.', data: [] });
      }
    }
    
    return res.status(405).json({ message: 'Método não permitido.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
