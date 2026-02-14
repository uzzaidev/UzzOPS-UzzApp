# Contexto Atual do Projeto - MD Feeder + CRM Clientes

Data de referencia: 13 de fevereiro de 2026
Status geral: Em producao de desenvolvimento, com fluxo real de importacao em uso.

## 1) Onde paramos hoje
- O fluxo de importacao via MD Feeder esta funcional para cenarios reais de clientes.
- Ja existem registros reais sendo importados e visualizados no frontend.
- A frente de CRM de clientes esta ativa com:
  - listagem de clientes
  - pagina de detalhe por cliente
  - historico de contatos (atas)
  - leitura estrategica de fechamento/perda

## 2) Entregas concluidas (resumo executivo)
- Fundacao de Marketing concluida (migrations 020 e 021).
- Fundacao MD Feeder concluida (migration 022).
- CRM de clientes e contatos comerciais concluido (migration 023).
- Hotfix de item_type para `contato_cliente` concluido (migration 024).
- Parser MD Feeder robustecido para:
  - frontmatter padrao (`template: uzzops-feeder`)
  - modo legado de `type: contato-cliente`
  - normalizacao de item_type
  - validacao por tipo com preview de acoes
- Executor MD Feeder expandido para salvar dados estrategicos em `client_contacts`:
  - `dashboard_exec`
  - `bant_scores`
  - `fit_scores`
  - `dores_json`
  - `objecoes_json`
  - `proximos_passos_json`
  - `riscos_json`
  - `quality_checklist`
- Frontend de detalhe de cliente atualizado para exibir leitura gerencial (alem de `summary_md`).
- Lista de clientes com acoes:
  - atualizar status
  - churn (soft)
  - excluir (hard delete com confirmacao)

## 3) Arquivos-chave (referencia rapida)
- Migrations:
  - `database/migrations/020_marketing_foundation.sql`
  - `database/migrations/021_marketing_assets_storage.sql`
  - `database/migrations/022_md_feeder_foundation.sql`
  - `database/migrations/023_clients_crm_contacts.sql`
  - `database/migrations/024_md_item_type_check_hotfix.sql`
- MD Feeder backend:
  - `src/lib/md-feeder/parser.ts`
  - `src/lib/md-feeder/phase1-executor.ts`
  - `src/app/api/import/md/upload/route.ts`
  - `src/app/api/import/md/[import_id]/confirm/route.ts`
  - `src/app/api/import/templates/[name]/route.ts`
- CRM clientes frontend/backend:
  - `src/components/clients/clients-page-content.tsx`
  - `src/components/clients/client-details-content.tsx`
  - `src/hooks/useClients.ts`
  - `src/app/api/projects/[id]/clients/route.ts`
  - `src/app/api/projects/[id]/clients/contacts/route.ts`
  - `src/app/api/uzzapp-clients/[id]/route.ts`
  - `src/app/api/client-contacts/[id]/route.ts`

## 4) Casos reais e arquivos de teste (import_test_md)
- Casos existentes (entre outros):
  - `import_test_md/11_cristian_ata_real_feeder.md`
  - `import_test_md/12_urbanizadoravitoria_real_feeder.md`
  - `import_test_md/13_umana_riobranco_real_feeder.md`
  - `import_test_md/template_cliente.md`
- Uso atual:
  - os arquivos estao em formato pronto para upload no modal MD Feeder
  - combinam bloco `uzzapp_client` + bloco `contato_cliente`
  - incluem JSON estruturado para analise estrategica

## 5) Decisoes tecnicas importantes ja tomadas
- Manter `summary_md` completo para contexto humano e auditoria.
- Em paralelo, salvar estrutura analitica em JSON para leitura de gestao.
- Aceitar formatos reais com `%` e `R$` no parsing/normalizacao.
- Implementar fallback defensivo no insert de contato para ambientes com cache/schema legado.
- Separar semantica de status cliente:
  - churn = soft state
  - excluir = hard delete explicito

## 6) Problemas enfrentados e status
- `item_type_check` sem `contato_cliente`: resolvido (migration/hotfix).
- parse indevido de headings dentro de `summary_md`: resolvido no parser.
- erro de coluna legado em insert de contato: mitigado com retry/fallback.
- necessidade de hard delete de cliente: resolvido no endpoint + UI.

## 7) Pendencias estrategicas (proximos passos recomendados)
- Criar painel de inteligencia comercial (ganho/perda por motivo, por fase do funil).
- Endurecer governanca de dados (opcional):
  - constraints/validacao para chaves criticas de `dashboard_exec`
  - indices para consultas analiticas frequentes
- Evoluir visualizacao de contatos:
  - timeline de mudanca de decisao
  - comparativo BANT/Fit por interacao
- Produzir documentacao de uso final para equipe comercial/operacional.

## 8) Como retomar rapidamente em nova sessao IA
1. Ler este arquivo primeiro.
2. Revisar `src/lib/md-feeder/parser.ts` e `src/lib/md-feeder/phase1-executor.ts`.
3. Revisar UI em `src/components/clients/client-details-content.tsx`.
4. Testar import com um arquivo real em `import_test_md/`.
5. Validar no frontend: cliente > detalhe > historico > leitura gerencial.

## 9) Nota de continuidade
- Este documento nao substitui os planos originais.
- Serve como snapshot operacional para continuidade rapida por qualquer IA/engenheiro.
- Nao remover arquivos anteriores: todos continuam sendo referencia historica valida.
