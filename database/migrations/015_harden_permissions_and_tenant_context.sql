-- ============================================================
-- MIGRATION 015: HARDEN PERMISSIONS + TENANT CONTEXT
-- ============================================================
-- Objetivo:
-- 1) Remover GRANT ALL amplo e limitar a privilégios DML.
-- 2) Corrigir policy de INSERT em company_members (não usar WITH CHECK true).
-- 3) Atualizar RLS das tabelas de IA para modelo via company_members.
-- Dependência: 014_fix_all_rls_policies.sql
-- ============================================================

-- ------------------------------------------------------------
-- 1) HARDEN GRANTS
-- ------------------------------------------------------------

REVOKE ALL ON TABLE features FROM authenticated;
REVOKE ALL ON TABLE sprints FROM authenticated;
REVOKE ALL ON TABLE risks FROM authenticated;
REVOKE ALL ON TABLE team_members FROM authenticated;
REVOKE ALL ON TABLE sprint_features FROM authenticated;
REVOKE ALL ON TABLE sprint_scope_changes FROM authenticated;
REVOKE ALL ON TABLE sprint_burndown_snapshots FROM authenticated;
REVOKE ALL ON TABLE baseline_metrics FROM authenticated;
REVOKE ALL ON TABLE retrospective_actions FROM authenticated;
REVOKE ALL ON TABLE planning_poker_sessions FROM authenticated;
REVOKE ALL ON TABLE planning_poker_votes FROM authenticated;
REVOKE ALL ON TABLE planning_poker_results FROM authenticated;
REVOKE ALL ON TABLE feature_clusters FROM authenticated;
REVOKE ALL ON TABLE feature_cluster_members FROM authenticated;
REVOKE ALL ON TABLE feature_dependencies FROM authenticated;
REVOKE ALL ON TABLE epic_decomposition FROM authenticated;
REVOKE ALL ON TABLE dod_levels FROM authenticated;
REVOKE ALL ON TABLE dod_history FROM authenticated;
REVOKE ALL ON TABLE daily_scrum_logs FROM authenticated;
REVOKE ALL ON TABLE daily_feature_mentions FROM authenticated;
REVOKE ALL ON TABLE export_history FROM authenticated;
REVOKE ALL ON TABLE projects FROM authenticated;
REVOKE ALL ON TABLE profiles FROM authenticated;
REVOKE ALL ON TABLE company_members FROM authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE features TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE sprints TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE risks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE team_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE sprint_features TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE sprint_scope_changes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE sprint_burndown_snapshots TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE baseline_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE retrospective_actions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE planning_poker_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE planning_poker_votes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE planning_poker_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE feature_clusters TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE feature_cluster_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE feature_dependencies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE epic_decomposition TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE dod_levels TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE dod_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE daily_scrum_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE daily_feature_mentions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE export_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE company_members TO authenticated;

-- ------------------------------------------------------------
-- 2) COMPANY_MEMBERS INSERT POLICY
-- ------------------------------------------------------------
-- Substitui policy permissiva WITH CHECK (true).

DROP POLICY IF EXISTS "Service role can insert memberships" ON company_members;
DROP POLICY IF EXISTS "Admins can insert memberships in own tenant" ON company_members;

CREATE POLICY "Admins can insert memberships in own tenant" ON company_members
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT cm2.tenant_id
      FROM company_members cm2
      WHERE cm2.user_id = auth.uid()
        AND cm2.status = 'active'
        AND cm2.role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- 3) RLS AI TABLES (alinhar com company_members)
--    Bloco opcional: só executa se cada tabela existir.
-- ------------------------------------------------------------

DO $$
BEGIN
  IF to_regclass('public.ai_transcriptions') IS NOT NULL THEN
    ALTER TABLE ai_transcriptions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view transcriptions from their projects" ON ai_transcriptions;
    DROP POLICY IF EXISTS "Users can create transcriptions in their projects" ON ai_transcriptions;
    DROP POLICY IF EXISTS "tenant_isolation_ai_transcriptions_select" ON ai_transcriptions;
    DROP POLICY IF EXISTS "tenant_isolation_ai_transcriptions_insert" ON ai_transcriptions;
    CREATE POLICY "tenant_isolation_ai_transcriptions_select" ON ai_transcriptions
      FOR SELECT TO authenticated
      USING (
        project_id IN (
          SELECT p.id
          FROM projects p
          WHERE p.tenant_id IN (
            SELECT tenant_id
            FROM company_members
            WHERE user_id = auth.uid()
              AND status = 'active'
          )
        )
      );
    CREATE POLICY "tenant_isolation_ai_transcriptions_insert" ON ai_transcriptions
      FOR INSERT TO authenticated
      WITH CHECK (
        project_id IN (
          SELECT p.id
          FROM projects p
          WHERE p.tenant_id IN (
            SELECT tenant_id
            FROM company_members
            WHERE user_id = auth.uid()
              AND status = 'active'
          )
        )
      );
  END IF;

  IF to_regclass('public.ai_extractions') IS NOT NULL THEN
    ALTER TABLE ai_extractions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view extractions from their projects" ON ai_extractions;
    DROP POLICY IF EXISTS "Users can create and update extractions in their projects" ON ai_extractions;
    DROP POLICY IF EXISTS "tenant_isolation_ai_extractions" ON ai_extractions;
    CREATE POLICY "tenant_isolation_ai_extractions" ON ai_extractions
      FOR ALL TO authenticated
      USING (
        project_id IN (
          SELECT p.id
          FROM projects p
          WHERE p.tenant_id IN (
            SELECT tenant_id
            FROM company_members
            WHERE user_id = auth.uid()
              AND status = 'active'
          )
        )
      )
      WITH CHECK (
        project_id IN (
          SELECT p.id
          FROM projects p
          WHERE p.tenant_id IN (
            SELECT tenant_id
            FROM company_members
            WHERE user_id = auth.uid()
              AND status = 'active'
          )
        )
      );
  END IF;

  IF to_regclass('public.ai_suggestions') IS NOT NULL THEN
    ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view their own suggestions" ON ai_suggestions;
    DROP POLICY IF EXISTS "Users can create suggestions in their projects" ON ai_suggestions;
    DROP POLICY IF EXISTS "tenant_isolation_ai_suggestions_select" ON ai_suggestions;
    DROP POLICY IF EXISTS "tenant_isolation_ai_suggestions_insert" ON ai_suggestions;
    DROP POLICY IF EXISTS "tenant_isolation_ai_suggestions_update" ON ai_suggestions;
    CREATE POLICY "tenant_isolation_ai_suggestions_select" ON ai_suggestions
      FOR SELECT TO authenticated
      USING (
        user_id = auth.uid()
        AND project_id IN (
          SELECT p.id
          FROM projects p
          WHERE p.tenant_id IN (
            SELECT tenant_id
            FROM company_members
            WHERE user_id = auth.uid()
              AND status = 'active'
          )
        )
      );
    CREATE POLICY "tenant_isolation_ai_suggestions_insert" ON ai_suggestions
      FOR INSERT TO authenticated
      WITH CHECK (
        user_id = auth.uid()
        AND project_id IN (
          SELECT p.id
          FROM projects p
          WHERE p.tenant_id IN (
            SELECT tenant_id
            FROM company_members
            WHERE user_id = auth.uid()
              AND status = 'active'
          )
        )
      );
    CREATE POLICY "tenant_isolation_ai_suggestions_update" ON ai_suggestions
      FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF to_regclass('public.project_embeddings') IS NOT NULL THEN
    ALTER TABLE project_embeddings ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view embeddings from their projects" ON project_embeddings;
    DROP POLICY IF EXISTS "tenant_isolation_project_embeddings_select" ON project_embeddings;
    CREATE POLICY "tenant_isolation_project_embeddings_select" ON project_embeddings
      FOR SELECT TO authenticated
      USING (
        project_id IN (
          SELECT p.id
          FROM projects p
          WHERE p.tenant_id IN (
            SELECT tenant_id
            FROM company_members
            WHERE user_id = auth.uid()
              AND status = 'active'
          )
        )
      );
  END IF;

  IF to_regclass('public.ai_usage_analytics') IS NOT NULL THEN
    ALTER TABLE ai_usage_analytics ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view their own AI usage" ON ai_usage_analytics;
    DROP POLICY IF EXISTS "System can insert usage analytics" ON ai_usage_analytics;
    DROP POLICY IF EXISTS "tenant_isolation_ai_usage_select" ON ai_usage_analytics;
    DROP POLICY IF EXISTS "tenant_isolation_ai_usage_insert" ON ai_usage_analytics;
    CREATE POLICY "tenant_isolation_ai_usage_select" ON ai_usage_analytics
      FOR SELECT TO authenticated
      USING (
        user_id = auth.uid()
        AND project_id IN (
          SELECT p.id
          FROM projects p
          WHERE p.tenant_id IN (
            SELECT tenant_id
            FROM company_members
            WHERE user_id = auth.uid()
              AND status = 'active'
          )
        )
      );
    CREATE POLICY "tenant_isolation_ai_usage_insert" ON ai_usage_analytics
      FOR INSERT TO authenticated
      WITH CHECK (
        user_id = auth.uid()
        AND project_id IN (
          SELECT p.id
          FROM projects p
          WHERE p.tenant_id IN (
            SELECT tenant_id
            FROM company_members
            WHERE user_id = auth.uid()
              AND status = 'active'
          )
        )
      );
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 015 completa!';
  RAISE NOTICE '   • Permissões endurecidas (REVOKE ALL + GRANT DML)';
  RAISE NOTICE '   • company_members INSERT restrito a admins do tenant';
  RAISE NOTICE '   • RLS AI alinhada ao modelo company_members';
END $$;
