# ARCHITECTURE R02 - UzzOPS

Primary context reference: `docs/AI_PROJECT_CONTEXT_MASTER.md`

## 1) High-Level Runtime

```text
Browser
  -> Next.js App Router (pages + route handlers)
  -> Middleware (session + pending guards)
  -> Supabase (Auth + Postgres + Storage)
```

Core layers:
- UI: React + Tailwind + UI primitives
- State: React Query hooks
- API: Next route handlers in `src/app/api/*`
- Persistence/Auth: Supabase

## 2) Route Model

- Auth/public:
  - `/login`
  - `/register`
  - `/pending`
- Project entry:
  - `/projects`
- Workspace:
  - `/projects/[projectId]/*`

## 3) Tenant/Role Security Model

Server-side guards:
- `requireAuth()`
- `requireTenant()`
- `requireAdmin()`

Tenant context resolution priority:
1. header `x-tenant-id` / `x-active-tenant-id`
2. cookie `active_tenant_id` / `tenant_id`

Expected responses:
- `401` unauthenticated
- `403` no membership / forbidden tenant / role mismatch
- `409 TENANT_CONTEXT_REQUIRED` when multiple active memberships and missing context

## 4) Database Security Posture

RLS scope:
- tenant-scoped policies aligned to active `company_members`.

Hardening progression:
- `013`: membership model foundation
- `014`: broader RLS corrections
- `015`: tenant context hardening
- `016`: features/bugs knowledge-base schema additions
- `017`: permissive policy/grant cleanup from audit findings

## 5) Client API Pattern (Post-409 Fix)

Client-side requests should use centralized helper:
- `src/lib/api-client.ts`
  - `tenantFetch()`: injects `x-tenant-id` from active tenant context
  - `setActiveTenantContext()`
  - `getActiveTenantId()`

Tenant context sync on project workspace:
- `src/components/shared/tenant-context-sync.tsx`
- mounted from `src/app/projects/[projectId]/layout.tsx`

This reduces `409` incidents caused by missing tenant context in UI requests.

## 6) Data Domains (Architectural View)

Identity/membership:
- `auth.users`
- `profiles`
- `company_members`
- `team_members`

Core domain:
- `projects`, `features`, `sprints`, `risks`
- `retrospective_actions`
- `planning_poker_*`
- `feature_clusters`, `feature_dependencies`, `epic_decomposition`
- `dod_levels`, `dod_history`
- `daily_scrum_logs`, `daily_feature_mentions`
- `export_history`
- `feature_attachments`

## 7) Known Constraints

- Tenant onboarding remains admin/SQL-driven.
- Some TypeScript issues still exist in unrelated forms/components.
- Historical docs may conflict with runtime behavior; use R02 authoritative docs.
