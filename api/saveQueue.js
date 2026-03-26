const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl || 'https://fake-url.supabase.co', supabaseKey || 'fake-key');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const rows = req.body;
      
      if (!Array.isArray(rows)) {
         return res.status(400).json({ error: 'O formato dos dados importados deve ser uma Array' });
      }

      // 1. Limpa a fila antes de subir a planilha novamente
      const { error: delError } = await supabase
        .from('projetos')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Hack simples para forçar exclusão em massa suportada via Supabase JS

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

    } catch (error) {
       return res.status(500).json({ error: error.message });
    }
  }
  
  return res.status(405).json({ message: 'Método não permitido.' });
}
