# Database Migrations Source of Truth

Este diretório (`database/migrations`) é a fonte oficial das migrations SQL do projeto.

## Ordem de execução

Execute em ordem numérica crescente:

1. `003_sprint_essentials.sql`
2. `004_sprint_scope_audit.sql`
3. `005_fix_sprint_features_priority.sql`
4. `006_fix_missing_columns.sql`
5. `007_add_risks.sql`
6. `008_sprint_3_metrics.sql`
7. `009_sprint_4_quality.sql`
8. `009_sprint_5_backlog.sql`
9. `010_sprint_6_operational.sql`
10. `010_fix_rls_policies.sql`
11. `011_add_user_id_to_team_members.sql`
12. `011_ai_assistant.sql`
13. `012_team_auth.sql`
14. `013_profiles_company_members.sql`
15. `014_fix_all_rls_policies.sql`
16. `015_harden_permissions_and_tenant_context.sql`

## Convenções

- Nunca edite migration já aplicada em ambiente compartilhado.
- Sempre crie uma nova migration incremental para ajustes.
- Toda mudança estrutural de banco deve ser acompanhada de:
  - atualização de tipos em `src/types/database.ts`
  - ajuste de políticas RLS (se aplicável)
  - teste de regressão de autorização

## Observação

`supabase/migrations/001_init.sql` deve ser tratado como bootstrap histórico.
Novas evoluções devem continuar exclusivamente em `database/migrations`.
