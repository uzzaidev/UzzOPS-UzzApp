# AI CONTEXT R02 - Operational Reality + Next Steps

Este contexto representa o estado real auditado em 2026-02-12.

## 1) Posicionamento do produto

UzzOPS e uma plataforma de operacao de produto/scrum para:
- features e bugs,
- sprints e controle de escopo,
- riscos e qualidade,
- planning poker,
- daily logs,
- metricas e exportacao.

Uso atual: uma empresa principal (`UzzAI`) com multiplos usuarios.  
Capacidade: multi-tenant por membership.

## 2) Stack

- Next.js App Router
- Supabase Postgres + Auth + Storage
- React Query
- Tailwind + Radix/shadcn

## 3) Seguranca e contexto de tenant

App-layer:
- `requireTenant()` e `requireAdmin()`
- contexto vindo de `x-tenant-id` / `x-active-tenant-id` ou cookie `active_tenant_id`

Comportamento esperado:
- usuario com multiplas memberships ativas sem contexto -> `409 TENANT_CONTEXT_REQUIRED`

Importante:
- No snapshot auditado ainda existiam politicas/grants legados no banco.
- Foi criada a migration `017_hardening_cleanup.sql` para fechar essas lacunas.

## 4) Modelo de identidade/membership

- `auth.users`: credenciais/sessao
- `profiles`: perfil pessoal
- `company_members`: membership canonica (`role`, `status`)
- `team_members`: registro operacional por tenant

Status:
- `active`: opera no tenant
- `pending`: aguardando aprovacao
- `inactive`: bloqueado

## 5) Situacao atual dos 409

`409` nao indica falha de codigo por si so. Indica ambiguidade de tenant para usuarios com memberships ativas em mais de um tenant.

Diretriz de produto:
- sempre carregar contexto de tenant no frontend,
- ter seletor de tenant quando multi-membership.

## 6) Estado de QA (realista)

Validacoes ja realizadas cobrem bem rotas e payloads, mas o audit de backup mostrou ajuste pendente em hardening SQL/RLS.

Status correto: QA funcional bom, hardening final em andamento.

## 7) Prioridades de execucao

1. Aplicar migration 017 e revalidar policies/grants.
2. Fechar propagacao de tenant-context em 100% das chamadas protegidas.
3. Evoluir UX de Features/Bugs + Knowledge Base:
   - responsavel obrigatorio,
   - DoD padrao + itens customizados,
   - anexos `.md/.txt/.pdf` no detalhe do item.

## 8) Definicao de pronto (curto prazo)

- Nenhuma policy permissiva legada ativa.
- Nenhum grant `ALL` para `anon` em tabelas criticas.
- Fluxo multi-membership consistente sem 409 "inesperado".
- Criacao/edicao de feature/bug com responsavel + DoD customizavel + base de solucao.
