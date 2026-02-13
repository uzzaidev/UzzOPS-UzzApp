# Supabase Backup (pg_dump)

## Context
For full database snapshot/debugging (including 409 issues), use PostgreSQL tools directly.

## 1) Install tools (PowerShell as Administrator)
```powershell
choco install postgresql -y --force
```

## 2) Backup commands (manual)
Use PostgreSQL 18 binaries directly:
```powershell
& "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" --dbname="[SUA_CONNECTION_STRING]" --schema-only --file="backups/schema.sql"
& "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" --dbname="[SUA_CONNECTION_STRING]" --data-only --file="backups/data.sql"
& "C:\Program Files\PostgreSQL\18\bin\pg_dumpall.exe" --dbname="[SUA_CONNECTION_STRING]" --roles-only --file="backups/roles.sql"
```

Replace `[SUA_CONNECTION_STRING]` with your pooler connection string (from `.env.local`).

## 3) Scripted backup (recommended)
This repo has `backup-supabase.ps1`.

### Using env vars or `.env.local`
```powershell
.\backup-supabase.ps1
```

### Passing connection string directly
```powershell
.\backup-supabase.ps1 -ConnectionString "postgresql://..."
```

## Output
Files are generated in `backups/`:
- `schema_YYYYMMDD_HHMMSS.sql`
- `data_YYYYMMDD_HHMMSS.sql`
- `roles_YYYYMMDD_HHMMSS.sql` (if permissions allow)

## Notes
- `roles` dump may fail depending on Supabase permissions. This is expected in some setups.
- Use this snapshot as reference for schema, policies, grants, and data state when diagnosing multi-tenant/RLS conflicts.
