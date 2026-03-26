-- supabase/schema.sql
-- Modelo de Dados MVP Fila de Operações

CREATE TABLE public.projetos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente TEXT NOT NULL,
  projeto TEXT NOT NULL,
  etapa TEXT,
  responsavel TEXT,
  data_inicio TEXT,
  data_prazo TEXT,
  status_etapa TEXT,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativando politicas de segurança base a título de preparacao RLS.
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;

-- Política inicial abrangente (Necessária para Serverless na Vercel atuando como admin/anon central)
CREATE POLICY "Permitir acesso da anon_key" ON public.projetos
FOR ALL USING (true) WITH CHECK (true);
