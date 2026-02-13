# Auditoria Técnica e Plano de Otimização (R01)

Data: 2026-02-12  
Escopo: revisão cruzada de `CODEBASE_MAP.md`, `DATABASE_SCHEMA.md`, `AI_CONTEXT.md` + backup real (`schema/data/roles`).

## 1) Resumo Executivo

O projeto está funcional e avançou bem em multi-tenant, mas o backup mostra divergências importantes entre o que a documentação afirma e o estado real do banco. O principal ponto: existem políticas e grants legados que mantêm superfície de risco maior que o desejado.

Também há uma causa estrutural para os `409 TENANT_CONTEXT_REQUIRED`: usuários com múltiplas memberships ativas sem contexto explícito.

Conclusão de gestão:
- Base está boa para evoluir produto.
- Precisa de uma rodada curta de hardening para estabilizar segurança/comportamento.
- Depois disso, vale acelerar UX de "Features/Bugs + Knowledge Base" com fluxo mais forte para squads.

## 2) Evidências Objetivas (backup)

### 2.1 Políticas legadas permissivas ainda presentes

No schema há policies com `USING (true)` / `WITH CHECK (true)` em tabelas relevantes:
- `backups/schema_20260212_171957.sql:7470`
- `backups/schema_20260212_171957.sql:7477`
- `backups/schema_20260212_171957.sql:7484`
- `backups/schema_20260212_171957.sql:7491`
- `backups/schema_20260212_171957.sql:7498`
- `backups/schema_20260212_171957.sql:7505`
- `backups/schema_20260212_171957.sql:7512`
- `backups/schema_20260212_171957.sql:7519`
- `backups/schema_20260212_171957.sql:7526`

### 2.2 `company_members` com política estrita + política permissiva coexistindo

- Policy estrita (esperada): `Admins can insert memberships in own tenant` em `backups/schema_20260212_171957.sql:7461`
- Policy permissiva ainda ativa: `self_insert_membership` em `backups/schema_20260212_171957.sql:7695`

Isso contradiz o objetivo de hardening e permite auto-inserção fora de fluxo admin.

### 2.3 Grants amplos para `anon`

Exemplos:
- `GRANT ALL ON TABLE public.features TO anon;` em `backups/schema_20260212_171957.sql:9370`
- `GRANT ALL ON TABLE public.company_members TO anon;` em `backups/schema_20260212_171957.sql:9388`
- `GRANT ALL ON TABLE public.projects TO anon;` em `backups/schema_20260212_171957.sql:9415`
- `GRANT ALL ON TABLE public.team_members TO anon;` em `backups/schema_20260212_171957.sql:9433`
- `GRANT ALL ON TABLE public.profiles TO anon;` em `backups/schema_20260212_171957.sql:9559`

Mesmo com RLS ativa, esse padrão não é o ideal de postura mínima.

### 2.4 Funções de contexto com comportamento ambíguo

- `get_user_tenant_id()` retorna o primeiro tenant ativo com `LIMIT 1` (sem ordem determinística): `backups/schema_20260212_171957.sql:1108`
- `handle_new_auth_user()` associa novo usuário ao "primeiro tenant criado": `backups/schema_20260212_171957.sql:1148`

Esse comportamento tende a causar vínculo indevido de tenant e inconsistências de contexto.

### 2.5 Dado real confirma cenário multi-membership (origem dos 409)

No dump de dados, os usuários principais aparecem ativos em dois tenants:
- `backups/data_20260212_171957.sql:323`
- `backups/data_20260212_171957.sql:324`
- `backups/data_20260212_171957.sql:325`
- `backups/data_20260212_171957.sql:326`

Com isso, `409 TENANT_CONTEXT_REQUIRED` é comportamento esperado quando falta `x-tenant-id`/cookie.

### 2.6 Arquivo de roles contém credenciais hash (sensível)

`backups/roles_20260212_171957.sql` inclui hashes de senha e grants de roles internas. Não deve ser versionado/publicado.

## 3) Inconsistências com os 3 documentos R01

## `DATABASE_SCHEMA.md`
- Afirma remoção de política permissiva legada em `company_members`, mas no backup ela existe (`self_insert_membership`).
- Passa ideia de hardening consolidado; na prática ainda há policies `USING (true)` em módulos críticos.

## `AI_CONTEXT.md`
- QA e segurança aparecem como consolidadas; no estado real ainda existem pendências de hardening e ambiguidade de contexto.

## `CODEBASE_MAP.md`
- Mapeamento está útil, mas não explicita os pontos de risco atual (políticas legadas + bootstrap de tenant no signup).

## 4) Causa-raiz dos erros 409 (e por que estão corretos)

1. Usuário com mais de uma membership ativa.
2. Requisição sem `x-tenant-id` e sem cookie `active_tenant_id` válido.
3. API retorna `TENANT_CONTEXT_REQUIRED (409)` para evitar escrita/leitura no tenant errado.

Não é bug por si só; é proteção de segurança. O problema atual é UX e padronização de contexto no frontend.

## 5) Plano de Ação Recomendado (prático)

## P0 - Segurança e consistência (fazer agora)
1. Remover policies permissivas legadas (`USING true` / `WITH CHECK true`).
2. Remover `self_insert_membership` se o fluxo oficial for somente admin/invite.
3. Revisar grants de `anon` para postura mínima.
4. Ajustar `handle_new_auth_user()` para não inferir tenant por "primeiro tenant".

## P1 - Confiabilidade de tenant context
1. Garantir que frontend sempre envie `x-tenant-id` em chamadas protegidas.
2. Salvar tenant ativo no login e manter cookie sincronizado.
3. Exibir seletor de tenant somente quando houver múltiplas memberships ativas.
4. Criar teste automatizado para `409/403/200` em cenários de contexto.

## P2 - Evolução de produto (Features/Bugs + Knowledge Base)
1. Manter uma tabela única (`features`) com `work_item_type` (boa decisão para backlog unificado).
2. Melhorar UX com duas visões: "Features" e "Bugs" (filtro salvo, não tabela separada).
3. Na criação:
   - Definir responsável obrigatório.
   - Definir DoD no momento de criação.
   - Permitir DoD padrão + itens personalizados dinâmicos.
4. Detalhe do item com aba "Solução/Runbook" + anexos `.md/.txt/.pdf` com preview/download.

## 6) Visão de gestão (otimização real do app)

Se o objetivo é escalar para mais clientes sem virar caos operacional, o caminho é:
1. Primeiro previsibilidade (segurança multi-tenant e contexto sem ambiguidades).
2. Depois velocidade (fluxo de bug/feature e conhecimento reutilizável).
3. Por fim inteligência (priorização automática, insights de risco, copiloto de triagem).

Em termos de impacto:
- Segurança: reduz risco de vazamento e inconsistência entre tenants.
- Operação: menos erro manual e menos retrabalho de suporte.
- Produto: backlog mais útil para gestores e devs, com contexto técnico anexado.

## 7) 30-60-90 dias (enxuto)

## 0-30 dias
- Fechar hardening SQL/RLS.
- Fechar padrão de tenant context no frontend.
- Auditoria de grants/policies com checklist automatizado.

## 31-60 dias
- Consolidar módulo Features/Bugs com detalhe rico.
- Responsável + DoD customizável na criação.
- Upload e leitura de anexos de solução no detalhe do item.

## 61-90 dias
- Métricas de eficiência (lead time por tipo, taxa de bug reaberto, throughput por responsável).
- Assistente de priorização e sugestão de solução baseado no histórico.

## 8) Próximo passo sugerido

Executar uma migration de hardening corretiva (`017_hardening_cleanup.sql`) com foco em:
- Remoção de policies legadas permissivas.
- Revisão de grants de `anon`.
- Ajuste de bootstrap de usuário/tenant.

Depois disso, atualizar os 3 docs R01 com "estado real" (não estado ideal).
