# AI Project Context Master (UzzOPS / UzzApp)

Last update: 2026-02-12  
Status: Active development, multi-tenant hardening applied through migration `017`

## 1) Purpose

This document is the single source of truth for AI assistants and humans when restarting work on this repository.

Goals:
- reduce context loss between sessions,
- avoid repeated tenant/security mistakes,
- provide an executable restart flow.

## 2) Product Snapshot

UzzOPS is a project operations platform for software teams:
- project selection and workspace,
- features/bugs lifecycle,
- sprints, risks, retrospectives,
- planning poker,
- daily logs,
- metrics and health views.

Main routes:
- auth: `/login`, `/register`, `/pending`
- entry: `/projects`
- workspace: `/projects/[projectId]/*`

## 3) Stack and Runtime

- Next.js App Router + TypeScript
- Supabase (Postgres, Auth, Storage)
- React Query
- Tailwind + UI primitives

Run:
```bash
pnpm install
pnpm dev
```

Type/lint checks:
```bash
pnpm exec tsc --noEmit
pnpm lint
```

## 4) Database and Migrations

Key migrations for current security model:
- `database/migrations/013_profiles_company_members.sql`
- `database/migrations/014_fix_all_rls_policies.sql`
- `database/migrations/015_harden_permissions_and_tenant_context.sql`
- `database/migrations/016_features_bugs_knowledge_base.sql`
- `database/migrations/017_hardening_cleanup.sql`

Backup tooling:
- script: `backup-supabase.ps1`
- guide: `docs/SUPABASE_BACKUP.md`
- latest backup evidence folder: `backups/`

## 5) Multi-Tenant Model (Critical)

Tenant boundary:
- `tenants` (organization boundary)
- memberships: `company_members(user_id, tenant_id, role, status)`

Context behavior:
- API requires tenant context from header `x-tenant-id` or cookie `active_tenant_id`.
- User with multiple active memberships and no context receives:
  - `409 TENANT_CONTEXT_REQUIRED`.

This is expected security behavior, not an API bug.

## 6) Recent Hardening State

Audit and cleanup cycle:
- audit report: `docs/BACKUP_AUDIT_R01_20260212.md`
- corrective migration: `database/migrations/017_hardening_cleanup.sql`

Post-017 verified checks:
- permissive legacy policies removed,
- `self_insert_membership` removed,
- critical `anon` grants removed,
- deterministic tenant resolution function updated.

## 7) 409 Incident Runbook (Frontend)

If multiple pages return `409`:
1. Confirm user has >1 active membership.
2. Confirm cookie exists:
   - `active_tenant_id=<tenant_uuid>`
3. Confirm requests include `x-tenant-id`.

Current client-side enforcement:
- centralized fetch helper: `src/lib/api-client.ts`
- tenant sync component: `src/components/shared/tenant-context-sync.tsx`
- project layout sets active tenant context:
  - `src/app/projects/[projectId]/layout.tsx`

## 8) Canonical Technical Docs

Primary references:
- `README.md`
- `CODEBASE_MAP.md`
- `DATABASE_SCHEMA.md`
- `AI_CONTEXT.md`
- `docs/ARCHITECTURE.md`
- `docs/API_DOCUMENTATION.md`
- `docs/QA_CHECKLIST_MIGRATION_015.md`
- `docs/RELATORIO_FINAL_QA_MIGRATION_015.md`

Operational audit context:
- `docs/BACKUP_AUDIT_R01_20260212.md`

Legacy catalog:
- `docs/LEGACY_DOCS_CATALOG.md`

## 9) Known Risks / Open Items

- Existing TypeScript errors outside tenant-context scope still exist in some forms/components.
- Tenant onboarding (new company creation) is still SQL/admin-driven (no frontend flow yet).
- Historical docs in repository may be outdated; prefer canonical list above.

## 10) Restart Checklist for AI

Before coding:
1. Read this file (`docs/AI_PROJECT_CONTEXT_MASTER.md`).
2. Read `README.md`, `CODEBASE_MAP.md`, `DATABASE_SCHEMA.md`, `AI_CONTEXT.md`.
3. Check migration sequence in `database/migrations`.
4. Run quick repo status: `git status --short`.
5. Validate if issue is tenant-context/security related first.

Before finishing:
1. Validate impacted flow manually.
2. Run at least one static check (`pnpm exec tsc --noEmit` when possible).
3. Update docs for any behavior/security contract change.
4. Record evidence in a doc under `docs/` when change is structural.

## 11) Documentation Rule (Mandatory)

Any change that affects:
- security,
- tenant resolution,
- API contract,
- migration behavior,
- operational runbooks

must update this master context file plus at least one canonical reference document.
