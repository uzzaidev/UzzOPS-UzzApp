# UzzOps - Plataforma de Gestao de Aplicativos

UzzOps e uma plataforma interna para gestao de desenvolvimento de software, com foco em backlog, sprints, riscos, equipe e operacao de produto.

Status atual: base multi-tenant endurecida (migracoes 013-015) e QA concluido com evidencias.

## Contexto Mestre (retomada de trabalho)
- `docs/AI_PROJECT_CONTEXT_MASTER.md` (fonte unica de contexto para IA/handoff)
- `docs/RESTART_CHECKLIST.md` (checklist rapido para reinicio de sessao)

## Estado Atual (R01)
- Rotas de autenticacao: `/login`, `/register`, `/pending`
- Selecao de projeto: `/projects`
- Workspace: `/projects/[projectId]/*`
- API com contexto de tenant por `x-tenant-id` ou cookie `active_tenant_id`
- RLS por `company_members` para isolamento de dados por tenant
- Criacao de projeto disponivel via frontend

## Stack
- Next.js (App Router)
- React + TypeScript
- Supabase (Postgres + Auth)
- React Query
- Tailwind + componentes UI

## Como Rodar
1. Instalar dependencias:
```bash
pnpm install
```
2. Configurar `.env.local` a partir de `.env.local.example`
3. Aplicar migracoes no Supabase em ordem numerica de `database/migrations`
4. Rodar aplicacao:
```bash
pnpm dev
```

## Documentacao Oficial (R01)
Comece por aqui:
- `docs/README_DOCUMENTATION.md`

Referencias principais:
- `docs/AI_PROJECT_CONTEXT_MASTER.md`
- `docs/RESTART_CHECKLIST.md`
- `docs/PROJECT_OVERVIEW.md`
- `docs/ARCHITECTURE.md`
- `docs/API_DOCUMENTATION.md`
- `docs/R01_EXTENDED.md`
- `CODEBASE_MAP.md`
- `DATABASE_SCHEMA.md`
- `AI_CONTEXT.md`
- `docs/QA_CHECKLIST_MIGRATION_015.md`
- `docs/RELATORIO_FINAL_QA_MIGRATION_015.md`

## Banco e Seguranca
Migracoes-chave:
- `database/migrations/013_profiles_company_members.sql`
- `database/migrations/014_fix_all_rls_policies.sql`
- `database/migrations/015_harden_permissions_and_tenant_context.sql`

Pontos criticos:
- Membership canonica em `company_members`
- Contexto ambiguo de tenant retorna `409 TENANT_CONTEXT_REQUIRED`
- Acesso cruzado entre tenants bloqueado por API e RLS

## Comandos Uteis
```bash
pnpm dev
pnpm lint
pnpm test
pnpm exec tsc --noEmit
```

## Observacoes
- Onboarding de novo tenant (nova empresa) ainda e SQL/admin-driven.
- Fluxo principal atual esta focado em uma empresa com multiplos usuarios/projetos.
- Se aparecer `409`, valide contexto de tenant (`active_tenant_id` e header `x-tenant-id`) antes de diagnosticar outras camadas.
