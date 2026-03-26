# Log de Atualizações - Fila de Operações Mukutu

Este arquivo registra o histórico de ações da IA e do desenvolvimento estrutural do projeto, garantindo uma fonte de verdade para continuidade.

## [2026-03-26] Setup Inicial do Projeto
- **[ACT] CREATE:** Estabelecido as regras globais da IA no arquivo `regras-projeto.md` focando em Segurança Serverless, UX e comunicação constante.
- **[ACT] SETUP:** Configurada a infraestrutura de pastas WAT (api, public, supabase, tools, workflows, .tmp) via Powershell.
- **[ACT] SETUP:** Repositório Git local inicializado e blindado através do `.gitignore` para a Vercel.
- **[ACT] CREATE:** Arquivo oficial de Log criado na estrutura para manter cronometria transparente de iterações de código.

## [2026-03-26] Desenvolvimento Backend e Frontend Core
- **[ACT] CREATE:** Tabela `projetos` modelada no `supabase/schema.sql`. Setup inicial do proxy `.env`.
- **[ACT] CREATE:** `getQueue` e `saveQueue` isolando logicamente as chaves sob o domínio da pasta `api/` da Vercel.
- **[LEARNING]:** Supabase JS client necessita workaround para "Upsert destrutivo em massa". Foi utilizado `delete().neq('id', '00000000-0000-0000-0000-000000000000')` para forçar limpeza completa do banco da fila antes de reinjetar o XLSX. 
- **[ACT] BUILD:** Interface responsiva `.html` montada. `TailwindCSS` embutido configurando paleta `#1a73e8` primária.
- **[ACT] CODING:** Scripts do SheetJS e lógicas do UI (Lista Densa) configuradas em `public/app.js`. Forçado encoding UTF-8 BOM `\uFEFF` na exportação de Template (`.csv`) visando máxima estabilidade para Gestores operando Microsoft Excel nativo.
- **[ACT] FIX:** Adicionada e mapeada iterativamente a função `renderFilters()` dinamicamente em `app.js` para preencher os botões de triagem pelo `status_etapa`, concluindo todos os requisitos visuais do MVP.
