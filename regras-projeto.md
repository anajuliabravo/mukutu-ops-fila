# Diretrizes do Projeto: Fila de Operações Mukutu

Estas regras devem ser rigorosamente seguidas pela IA (Antigravity) e equipe durante o ciclo de vida deste projeto para garantir qualidade, segurança e conformidade arquitetural.

## 1. Segurança em Primeiro Lugar
- **Credenciais Blindadas:** Nunca versie ou exponha senhas, chaves do Supabase, URLs master no *Frontend* (`public/`) e nem os inclua nos commits do GitHub. 
- **Isolamento via Serverless:** Todas as integrações com os serviços sensíveis do banco devem transitar obrigatoriamente pela camada *Backend* usando Serverless Functions (`api/`) e ler parâmetros usando `process.env`.
- Verifique constantemente o estado do `.gitignore` garantindo que `.env` esteja barrado e que *commits* não exalem dados indevidos.

## 2. Alinhamento Constante (Em Caso de Dúvida, Pergunte!)
- Não tome decisões não triviais arquiteturais sem perguntar.
- Em caso de ambiguidade nas instruções, pare a execução imediatamente e espere confirmação do usuário. **É preferível pausar e alinhar do que codar premissas erradas.**

## 3. Logs de Atualização e Aprendizado Obrigatórios
- **Registro no Histórico:** Cada sessão de trabalho, etapa concluída, fix ou correção deverá gerar uma entrada obrigatória no arquivo `projects-updates/log.md`.
- **Registro de Aprendizados:** Qualquer novo padrão descoberto, peculiaridades do SheetJS ou ajustes de integração da Vercel API que tomamos ciência durante a execução devem ser documentados neste log.

## 4. Convenções e Código Simples (Low Maintenance)
- Mantenha a dependência de pacotes *npm* ao mínimo absoluto. Se puder ser feito nativamente e elegantemente com Vanilla JS, priorize.
- Comentar de forma clara o código pensando que ele será mantido e lido por *"gestores não-técnicos"*. Nomes de funções e variáveis devem ser auto-explicativos.
- Fidelidade Visual: Siga as proporções, lista densa e paleta de cores primárias estipuladas do Google Stitch `#1a73e8`.

## 5. Estrutura Canônica OBRIGATÓRIA (WAT)
Não desvie do formato de trabalho abaixo:
- `.env` → Arquivo não-commitado
- `public/` → Apenas CSS, JS e HTML do cliente (Hospedado via Vercel estático).
- `api/` → Scripts rodando Serverless na Vercel atuando como ponte Backend.
- `supabase/` → Agrupa scripts SQL.
- `tools/`, `workflows/` → Metadados WAT.
- `projects-updates/` → Os logs e histórico do projeto.
- `.tmp/` → Temporários (Ignorados).
