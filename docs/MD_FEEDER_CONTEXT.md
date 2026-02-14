# MD Feeder Contexto Tecnico

## Objetivo
O MD Feeder permite importar um arquivo `.md` estruturado para criar/atualizar entidades do projeto de forma controlada, com preview e confirmação explícita.

## Fluxo de ponta a ponta
1. UI envia arquivo para `POST /api/import/md/upload`.
2. Backend faz parse de frontmatter e blocos `## tipo`.
3. Backend valida regras, resolve dedupe e salva preview em:
   - `md_feeder_imports`
   - `md_feeder_import_items`
4. UI mostra preview e permite overrides de ação por item.
5. UI confirma via `POST /api/import/md/[import_id]/confirm`.
6. Backend executa ações item a item no banco.
7. Backend atualiza métricas finais do import e dispara webhook (se configurado).

## Contrato de frontmatter
Campos esperados:
- `template: uzzops-feeder` (obrigatório)
- `template_version` (recomendado; fallback em `version`)
- `project`, `sprint`, `date`, `author`, `source` (contextuais)

## Tipos suportados por fase
- Fase 1: `feature`, `bug`, `bug_resolution`
- Fase 2: `epic`, `spike`, `spike_result`, `sprint`, `sprint_update`, `task`, `user_story`, `daily`, `daily_member`, `feature_dependency`
- Fase 3: `risk`, `retrospective`, `planning_result`, `baseline_metric`, `marketing_campaign`, `marketing_post`
- Fase 4: `team_member`, `uzzapp_client`

## Comunicação com o banco
### Tabelas de controle do import
- `md_feeder_imports`: cabeçalho do lote (status, contadores, conteúdo original)
- `md_feeder_import_items`: itens parseados, validação, ação, vínculo com entidade final

### Tabelas de domínio tocadas
- Produto/engenharia: `features`, `work_item_status_history`, `sprints`, `tasks`, `user_stories`, `feature_dependencies`, `epic_decomposition`, `daily_scrum_logs`, `daily_feature_mentions`
- Risco/qualidade: `risks`, `retrospective_actions`, `baseline_metrics`
- Marketing: `marketing_campaigns`, `marketing_content_pieces`, `marketing_publications`
- Pessoas/clientes: `team_members`, `uzzapp_clients`

### Dedupe
- `feature`/`bug`: por `code`
- `bug_resolution`/`spike_result`/`planning_result`: update por `code` existente
- `sprint_update`: por `sprint_code`/`sprint_id`; aceita também sprint criado no mesmo arquivo
- `team_member`: por `email` ou `name` (tenant)
- `uzzapp_client`: por `phone` ou `email` (tenant)

## APIs principais
- `POST /api/import/md/upload`
- `POST /api/import/md/[import_id]/confirm`
- `GET /api/import/md/[import_id]`
- `GET /api/import/history`
- `GET /api/import/templates/[name]`
- `POST /api/import/md/generate` (geração inicial de markdown via transcrição)
- `GET /api/projects/[id]/repo-context?format=json|text|llm`

## Webhook de conclusão
- Trigger: após `confirm` concluído
- Configuração: variável de ambiente `MD_FEEDER_WEBHOOK_URL`
- Evento: header `X-MD-Feeder-Event: import.completed`

## Pontos de atenção para manutenção
1. Não executar ações sem passar por preview.
2. Evitar regressão de dedupe em validação vs execução.
3. Preservar isolamento multi-tenant nas queries.
4. Ao adicionar novos tipos:
   - incluir no parser (validação + ação)
   - incluir no executor (persistência)
   - atualizar templates
   - adicionar cenário de teste em `import_test_md/`

## Arquivos-chave no código
- Parser: `src/lib/md-feeder/parser.ts`
- Executor: `src/lib/md-feeder/phase1-executor.ts`
- Upload API: `src/app/api/import/md/upload/route.ts`
- Confirm API: `src/app/api/import/md/[import_id]/confirm/route.ts`
- History API: `src/app/api/import/history/route.ts`
- Repo context: `src/app/api/projects/[id]/repo-context/route.ts`
- Webhook: `src/lib/md-feeder/webhook.ts`
- UI modal: `src/components/import/md-feeder-button.tsx`

