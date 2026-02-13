# PROJECT OVERVIEW R02 - UzzOPS

Primary context reference: `docs/AI_PROJECT_CONTEXT_MASTER.md`

## Current Status

- Practical operation: one main company (`UzzAI`) with multiple users/projects.
- Capability: multi-tenant by membership (`company_members`).
- Security baseline hardened through migrations `013` to `017`.
- Backup-based audit executed and documented:
  - `docs/BACKUP_AUDIT_R01_20260212.md`

## Product Goal

Platform for Scrum/Agile delivery operations:
- features/bugs backlog
- sprint planning/execution
- risks and quality controls
- planning poker
- daily logs
- metrics and exports

## Main User Flow

1. Auth: `/login` or `/register`
2. Pending users: `/pending`
3. Project selection: `/projects`
4. Workspace: `/projects/[projectId]/*`

## Delivered Modules

- Dashboard
- Features/Bugs
- Sprints
- Risks
- Metrics
- MVP board
- Planning poker
- Backlog map
- DoD
- Daily
- Team
- Export

## Access Model

- Tenant isolation: API guards + Postgres RLS.
- Membership model:
  - table `company_members`
  - roles: `admin`, `member`, `viewer`
  - statuses: `active`, `pending`, `inactive`

Tenant context accepted by API:
- header `x-tenant-id` (or `x-active-tenant-id`)
- cookie `active_tenant_id`

When user has multiple active memberships and no context:
- `409 TENANT_CONTEXT_REQUIRED` (expected behavior).

## Recent Critical Decisions

- Keep `/projects` always visible (no forced auto-enter).
- Project creation enabled in frontend (`POST /api/projects`).
- Daily/team flows aligned to secure tenant resolution.
- Hardening cleanup migration `017` removes permissive legacy policies/grants.
- Frontend now centralizes tenant header propagation using client helper.

## Operational Constraints

- Tenant onboarding (new company) is still SQL/admin-driven.
- Legacy docs exist for history; canonical truth is the R02 authoritative set.

## Next Priorities

1. Keep tenant context stable across all authenticated screens.
2. Continue Features/Bugs + Knowledge Base UX evolution.
3. Reduce remaining TypeScript debt outside tenant-context scope.
4. Add regression tests for security/context contracts.
