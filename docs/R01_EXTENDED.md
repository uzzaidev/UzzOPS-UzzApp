# R01 EXTENDED - Estado Tecnico Detalhado

Documento tecnico consolidado do estado atual do projeto, com foco em arquitetura, seguranca, fluxo operacional e limites conhecidos.

## 1. Objetivo do Produto
UzzOps suporta a gestao do ciclo de desenvolvimento de aplicativos:
- planejamento e priorizacao de backlog
- execucao de sprint
- riscos e qualidade
- governanca de equipe
- rastreabilidade operacional

A camada de IA existe como direcao futura e nao como dependencia critica do fluxo principal atual.

## 2. Modelo de Tenancy
Nivel de isolamento:
- 1 nivel de tenant (`tenants`)
- `projects` pertencem a um tenant (`projects.tenant_id`)
- usuarios entram em tenant por `company_members`

Nao ha sub-tenant.

## 3. Identidade e Membership
Entidades chave:
- `auth.users`: credenciais/sessao
- `profiles`: perfil da pessoa
- `company_members`: membership canonica (`user_id`, `tenant_id`, `role`, `status`)
- `team_members`: registro operacional de membro para modulos internos

Semantica de status em `company_members`:
- `active`: pode operar no tenant
- `pending`: aguardando aprovacao
- `inactive`: bloqueado

## 4. Resolucao de Contexto de Tenant
A API resolve tenant por ordem:
1. header `x-tenant-id` (aceita alias legado `x-active-tenant-id`)
2. cookie `active_tenant_id` (aceita alias legado `tenant_id`)

Se usuario tiver mais de uma membership ativa e nao enviar contexto:
- `409 TENANT_CONTEXT_REQUIRED`

Se enviar tenant nao permitido:
- `403 Forbidden: tenant not allowed for this user`

## 5. Arquitetura de Rotas
Navegacao principal:
- `/projects` para listar/criar projeto
- `/projects/[projectId]/*` para modulos

Modulos ativos:
- dashboard/overview
- features
- sprints
- risks
- metrics
- backlog map
- planning poker
- daily
- team

## 6. Arquitetura de API
Pilares:
- handlers em `src/app/api/*`
- validacao de payload com zod nas rotas criticas
- guardas de seguranca em `src/lib/tenant.ts`

Guardas:
- `requireAuth`
- `requireTenant`
- `requireAdmin`

## 7. Banco e RLS
Migracoes-chave:
- `013_profiles_company_members.sql`
- `014_fix_all_rls_policies.sql`
- `015_harden_permissions_and_tenant_context.sql`

Posicao atual:
- policies tenant-aware em tabelas core
- policy permissiva antiga removida de `company_members`
- insercao de membership protegida por admin do tenant
- grants DML para `authenticated` nas tabelas alvo

## 8. Ajustes Recentes Relevantes
- correcao de redirecionamento pos-login para fluxo baseado em projeto
- criacao de projeto habilitada no frontend
- hardening de daily logs com resolucao segura de team member
- sincronizacao `team_members` x `company_members` em operacoes administrativas

## 9. QA Executado
Coberturas validadas:
- isolamento entre tenants
- controle por role (admin/member)
- contexto de tenant (`409` sem contexto ambiguo, `403` invalido)
- validacao de payload (`400 + details`) em endpoints core
- auditoria de policies/grants pos-015

Registro final:
- `docs/RELATORIO_FINAL_QA_MIGRATION_015.md`

## 10. Limites Atuais
- criacao de tenant (nova empresa) ainda sem fluxo frontend
- onboarding de tenant segue processo admin/SQL
- suporte multi-tenant existe, mas operacao diaria atual concentra-se em tenant unico com varios usuarios

## 11. Recomendacoes Tecnicas
1. adicionar onboarding de tenant por UI (owner + convite inicial)
2. adicionar seletor de tenant explicito para multi-membership
3. criar testes automatizados de regressao de seguranca (tenant + role)
4. manter politica de payload validation em 100% dos POST/PATCH

## 12. Fonte da Verdade (R01)
- `docs/README_DOCUMENTATION.md`
- `docs/PROJECT_OVERVIEW.md`
- `docs/ARCHITECTURE.md`
- `docs/API_DOCUMENTATION.md`
- `CODEBASE_MAP.md`
- `DATABASE_SCHEMA.md`
- `AI_CONTEXT.md`

Status:
- Version: R01-EXTENDED
- Last updated: 2026-02-12
