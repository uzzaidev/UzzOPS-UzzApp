# Restart Checklist (Session Handoff)

Use this checklist every time work restarts after a pause.

## 1) Environment

1. Confirm `.env.local` exists and Supabase keys are configured.
2. Run:
```bash
pnpm install
pnpm dev
```
3. Verify app opens at `http://localhost:3000`.

## 2) Context Load Order

Read in order:
1. `docs/AI_PROJECT_CONTEXT_MASTER.md`
2. `README.md`
3. `CODEBASE_MAP.md`
4. `DATABASE_SCHEMA.md`
5. `AI_CONTEXT.md`
6. Relevant feature/audit doc for the current task

## 3) Safety Checks

1. `git status --short`
2. Avoid touching unrelated modified files.
3. Confirm current migrations in `database/migrations/`.

## 4) Tenant-Security Checks (when API errors appear)

1. Check if user has multiple active memberships.
2. Confirm cookie `active_tenant_id` is set.
3. Confirm requests include `x-tenant-id` (via `tenantFetch`).
4. If missing context, expect `409 TENANT_CONTEXT_REQUIRED`.

## 5) Before Closing Work

1. Validate the exact user flow changed.
2. Run at least one technical check (`pnpm exec tsc --noEmit` or scoped equivalent).
3. Update docs if behavior/security/API changed.
4. Add evidence note (what was tested and result).
