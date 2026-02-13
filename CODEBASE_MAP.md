# CODEBASE MAP R02 - UzzOPS / UzzApp

Estado atual mapeado com base no backup de 2026-02-12 e auditoria R01.

## 1) Estrutura principal

```text
src/
  app/
    (auth)/
      login/
      register/
      pending/
    api/
      clusters/[id]
      daily-logs/
      features/
      metrics/
      planning-poker/sessions/
      projects/
      retrospectives/
      risks/
      sprints/
      team-members/[id]
    projects/
      page.tsx
      [projectId]/
        layout.tsx
        dashboard/
        features/
        sprints/
        risks/
        metrics/
        mvp-board/
        planning-poker/
        backlog-map/
        dod/
        daily/
        team/
  components/
  hooks/
  lib/
  types/
database/
  migrations/
docs/
```

## 2) Rotas de navegação

- `/login`, `/register`, `/pending`
- `/` redireciona para `/projects`
- `/projects` (seletor e criacao de projeto)
- `/projects/[projectId]/*` (workspace)

## 3) API principal

- Projects: `POST /api/projects`, `GET /api/projects/[id]/overview|health|backlog-map|clusters|daily-logs|dod|team|export`
- Features: `GET/POST /api/features`, `GET/PATCH/DELETE /api/features/[id]`, `POST /api/features/[id]/decompose|move-to-cluster|suggest-decomposition`, `GET/POST/DELETE /api/features/[id]/dependencies`
- Sprints: `GET/POST /api/sprints`, `GET/PATCH/DELETE /api/sprints/[id]`, `GET/POST/DELETE /api/sprints/[id]/features`, `GET /api/sprints/[id]/burndown|spikes`
- Risks: `GET/POST /api/risks`, `PATCH/DELETE /api/risks/[id]`
- Retrospectives: `GET/POST /api/retrospectives`, `PATCH/DELETE /api/retrospectives/[id]`
- Planning poker: `GET/POST /api/planning-poker/sessions`, `GET/PATCH /api/planning-poker/sessions/[id]`, `POST /api/planning-poker/sessions/[id]/vote|finalize`
- Daily: `POST /api/daily-logs`, `GET /api/daily-logs/my-latest`
- Team admin: `PATCH/DELETE /api/team-members/[id]`

## 4) Arquivos de seguranca/contexto

- `src/lib/tenant.ts`: `requireAuth`, `requireTenant`, `requireAdmin`
- `src/lib/tenant-context.ts`: resolucao de tenant e erro `TENANT_CONTEXT_REQUIRED`
- `src/lib/team-member.ts`: resolucao/provisionamento seguro para daily
- `src/middleware.ts`: sessao, redirects, fluxo pending

## 5) Riscos mapeados na auditoria

- Ainda existiam policies legadas permissivas no banco de producao no snapshot de 2026-02-12.
- Ainda existiam grants `ALL` para `anon` em tabelas criticas no snapshot de 2026-02-12.
- `409` em multi-membership sem contexto e comportamento esperado de seguranca.

## 6) Plano imediato (em andamento)

- Migration corretiva criada: `database/migrations/017_hardening_cleanup.sql`.
- Objetivo da 017:
  - remover policies permissivas legadas,
  - remover `self_insert_membership`,
  - minimizar grants de `anon`,
  - estabilizar funcoes de contexto/signup.

## 7) Observacoes operacionais

- Criacao de tenant ainda e SQL/admin-driven.
- Frontend precisa sempre enviar/propagar tenant ativo para evitar `409` em usuarios multi-membership.
