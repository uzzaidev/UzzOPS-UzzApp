# DATABASE SCHEMA R02 - Audited State (2026-02-12)

Estado real baseado em backup (`schema_20260212_171957.sql` + `data_20260212_171957.sql`) e nao apenas no estado esperado das migrations.

## 1) Modelo de tenancy

- Nivel unico de tenancy: `tenants`
- `projects` pertence a um tenant (`projects.tenant_id`)
- Membership canonica: `company_members (user_id, tenant_id, role, status)`
- Pessoas operacionais: `team_members` (tenant-scoped)

Nao existe camada de sub-tenant no schema.

## 2) Tabelas de identidade

## `profiles`
- Perfil pessoal (1:1 com `auth.users`)
- Chave: `user_id UNIQUE`

## `company_members`
- Membership por usuario e tenant
- Chave: `UNIQUE(user_id, tenant_id)`
- Roles: `admin | member | viewer`
- Status: `active | pending | inactive`

## `team_members`
- Registro operacional
- Campos relevantes: `user_id`, `permission_level`, `status`, `is_active`

## 3) Tabelas de dominio

- `projects`, `features`, `sprints`, `risks`
- `sprint_features`, `sprint_scope_changes`
- `sprint_burndown_snapshots`, `baseline_metrics`
- `retrospective_actions`
- `planning_poker_sessions`, `planning_poker_votes`, `planning_poker_results`
- `feature_clusters`, `feature_cluster_members`, `feature_dependencies`, `epic_decomposition`
- `dod_levels`, `dod_history`
- `daily_scrum_logs`, `daily_feature_mentions`
- `export_history`
- `feature_attachments` (migration 016)

## 4) Achados de seguranca (snapshot)

No snapshot auditado ainda havia:
- Policies legadas permissivas (`USING true` / `WITH CHECK true`) em tabelas de burndown/baseline/poker/retrospective.
- Policy permissiva `self_insert_membership` coexistindo com policy admin em `company_members`.
- Grants `ALL` para `anon` em tabelas criticas (`features`, `projects`, `company_members`, `team_members`, `profiles`).

Esses pontos sao divergencias do estado endurecido esperado.

## 5) Contexto de tenant e signup (snapshot)

- `get_user_tenant_id()` usava `LIMIT 1` sem ordenacao forte.
- `handle_new_auth_user()` vinculava novos usuarios ao primeiro tenant criado quando nao havia pre-cadastro.

Isso explica parte de inconsistencias de contexto e risco de vinculo indevido.

## 6) Dados que explicam os 409

No backup de dados, usuarios principais estavam ativos em mais de um tenant. Por isso:
- sem `x-tenant-id`/cookie valido -> `409 TENANT_CONTEXT_REQUIRED` (comportamento esperado).

## 7) Correcao proposta

Migration criada para cleanup:
- `database/migrations/017_hardening_cleanup.sql`

A 017 faz:
- remove policies permissivas legadas,
- remove `self_insert_membership`,
- revoga grants de `anon` em tabelas criticas,
- ajusta funcoes `get_user_tenant_id` e `handle_new_auth_user`.

## 8) SQL de auditoria continua

## Policies por tabela
```sql
select tablename, policyname, cmd
from pg_policies
where schemaname='public'
order by tablename, policyname;
```

## Grants em tabelas criticas
```sql
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema='public'
  and table_name in ('projects','features','company_members','team_members','profiles')
order by table_name, grantee, privilege_type;
```

## Memberships ativas por usuario
```sql
select user_id, count(*) as active_memberships
from public.company_members
where status='active'
group by user_id
having count(*) > 1;
```
