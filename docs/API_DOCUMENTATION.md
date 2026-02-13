# API Documentation R02 - UzzOPS

Primary context reference: `docs/AI_PROJECT_CONTEXT_MASTER.md`  
Base path: `/api`

## 1) Auth and Tenant Context

Auth:
- Supabase session cookie

Tenant context accepted by protected routes:
- header `x-tenant-id` (or `x-active-tenant-id`)
- cookie `active_tenant_id` (or `tenant_id`)

Contract:
- if user has multiple active memberships and no tenant context:
  - `409 TENANT_CONTEXT_REQUIRED`

## 2) Standard Response Contracts

Status codes:
- `200/201` success
- `400` invalid payload/query
- `401` unauthorized
- `403` forbidden
- `404` not found
- `409` tenant context required

Common error bodies:
- `{ "error": "Payload inválido", "details": {...} }`
- `{ "error": "Tenant context required", "code": "TENANT_CONTEXT_REQUIRED" }`
- `{ "error": "Forbidden: tenant not allowed for this user" }`

## 3) Security Notes

- Protected routes require active membership in `company_members`.
- Cross-tenant reads/writes are blocked by API checks and RLS.
- Admin routes require `admin` role in active tenant.

## 4) Endpoint Catalog

## Projects
- `POST /api/projects`
- `GET /api/projects/[id]/overview`
- `GET /api/projects/[id]/health`
- `GET /api/projects/[id]/backlog-map`
- `GET /api/projects/[id]/clusters`
- `POST /api/projects/[id]/clusters`
- `GET /api/projects/[id]/daily-logs`
- `GET /api/projects/[id]/dod`
- `PATCH /api/projects/[id]/dod`
- `POST /api/projects/[id]/dod/upgrade`
- `GET /api/projects/[id]/team`
- `GET /api/projects/[id]/export`

## Features
- `GET /api/features`
- `POST /api/features`
- `GET /api/features/[id]`
- `PATCH /api/features/[id]`
- `DELETE /api/features/[id]`
- `POST /api/features/[id]/decompose`
- `GET /api/features/[id]/dependencies`
- `POST /api/features/[id]/dependencies`
- `DELETE /api/features/[id]/dependencies`
- `POST /api/features/[id]/move-to-cluster`
- `POST /api/features/[id]/suggest-decomposition`
- `GET /api/features/[id]/attachments`
- `POST /api/features/[id]/attachments`
- `DELETE /api/features/[id]/attachments`

## Sprints
- `GET /api/sprints`
- `POST /api/sprints`
- `GET /api/sprints/[id]`
- `PATCH /api/sprints/[id]`
- `DELETE /api/sprints/[id]`
- `GET /api/sprints/[id]/features`
- `POST /api/sprints/[id]/features`
- `DELETE /api/sprints/[id]/features`
- `GET /api/sprints/[id]/burndown`
- `POST /api/sprints/[id]/burndown`
- `GET /api/sprints/[id]/spikes`

## Risks
- `GET /api/risks`
- `POST /api/risks`
- `PATCH /api/risks/[id]`
- `DELETE /api/risks/[id]`

## Retrospectives
- `GET /api/retrospectives`
- `POST /api/retrospectives`
- `PATCH /api/retrospectives/[id]`
- `DELETE /api/retrospectives/[id]`

## Planning Poker
- `GET /api/planning-poker/sessions`
- `POST /api/planning-poker/sessions`
- `GET /api/planning-poker/sessions/[id]`
- `PATCH /api/planning-poker/sessions/[id]`
- `POST /api/planning-poker/sessions/[id]/vote`
- `POST /api/planning-poker/sessions/[id]/finalize`

## Metrics
- `GET /api/metrics/velocity`

## Daily
- `POST /api/daily-logs`
- `GET /api/daily-logs/my-latest`

## Team Admin
- `PATCH /api/team-members/[id]`
- `DELETE /api/team-members/[id]`

## 5) Validation Coverage (Known)

Confirmed `400 + details` payload validation for:
- `/api/features`
- `/api/sprints`
- `/api/risks`
- `/api/retrospectives`
- `/api/planning-poker/sessions`

## 6) Incident Notes (`409`)

If many endpoints return `409` at once, check tenant context propagation first:
1. user has multiple active memberships,
2. `active_tenant_id` cookie missing or stale,
3. request header `x-tenant-id` not being sent.

Current frontend strategy:
- centralized `tenantFetch()` for API calls
- tenant sync in project layout

## Status
- Version: R02
- Last updated: 2026-02-12
