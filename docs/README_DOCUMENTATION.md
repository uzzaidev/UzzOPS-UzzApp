# Documentation Index R02 - UzzOPS

This index reflects the current project state after multi-tenant hardening and backup-based audit.

## Read First (Mandatory)
1. `docs/AI_PROJECT_CONTEXT_MASTER.md` - single source of truth for AI/handoff context
2. `docs/RESTART_CHECKLIST.md` - restart runbook before implementation
3. `docs/PROJECT_OVERVIEW.md` - current product scope
4. `docs/ARCHITECTURE.md` - app/API/security architecture
5. `docs/API_DOCUMENTATION.md` - endpoint contracts
6. `docs/BACKUP_AUDIT_R01_20260212.md` - audit evidence and risk analysis

## Core Technical References
- `CODEBASE_MAP.md` - repository map and module responsibilities
- `DATABASE_SCHEMA.md` - audited schema model and constraints
- `AI_CONTEXT.md` - operational AI scope and priorities

## Security / Migration References
- `database/migrations/013_profiles_company_members.sql`
- `database/migrations/014_fix_all_rls_policies.sql`
- `database/migrations/015_harden_permissions_and_tenant_context.sql`
- `database/migrations/016_features_bugs_knowledge_base.sql`
- `database/migrations/017_hardening_cleanup.sql`

## QA / Evidence
- `docs/QA_CHECKLIST_MIGRATION_015.md`
- `docs/RELATORIO_FINAL_QA_MIGRATION_015.md`

## Authoritative Set (R02)
- `docs/AI_PROJECT_CONTEXT_MASTER.md`
- `docs/RESTART_CHECKLIST.md`
- `README.md`
- `CODEBASE_MAP.md`
- `DATABASE_SCHEMA.md`
- `AI_CONTEXT.md`
- `docs/ARCHITECTURE.md`
- `docs/API_DOCUMENTATION.md`
- `docs/BACKUP_AUDIT_R01_20260212.md`

## Notes
- Legacy roadmap/sprint docs can be kept for history, but they are not source of truth for runtime behavior.
- Legacy file catalog: `docs/LEGACY_DOCS_CATALOG.md`
- If any security/tenant/API behavior changes, update this index and the master context in the same change.

## Status
- Version: R02
- Last updated: 2026-02-12
