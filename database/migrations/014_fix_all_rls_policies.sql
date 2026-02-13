-- ============================================================
-- MIGRATION 014: FIX ALL RLS POLICIES — Multi-Tenancy Real
-- ============================================================
-- Descrição: Reescreve TODAS as RLS policies usando company_members
--            para isolamento real de dados por empresa.
--            Substitui: USING (true) e USING (current_setting...) quebrados.
-- Dependências: 013_profiles_company_members.sql
-- ============================================================
-- Padrão aplicado em todas as tabelas com tenant_id:
--   USING (tenant_id IN (
--     SELECT tenant_id FROM company_members
--     WHERE user_id = auth.uid() AND status = 'active'
--   ))
-- ============================================================

-- Helper para simplificar as policies (subquery reutilizável)
-- Já criada na 013, garantir que existe:
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id
  FROM public.company_members
  WHERE user_id = auth.uid()
    AND status = 'active'
  LIMIT 1;
$$;

-- ============================================================
-- FEATURES
-- ============================================================

ALTER TABLE features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tenant features" ON features;
DROP POLICY IF EXISTS "Users can manage own tenant features" ON features;
DROP POLICY IF EXISTS "Authenticated users can view features" ON features;
DROP POLICY IF EXISTS "Authenticated users can manage features" ON features;

CREATE POLICY "tenant_isolation_features_select" ON features
  FOR SELECT TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "tenant_isolation_features_insert" ON features
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "tenant_isolation_features_update" ON features
  FOR UPDATE TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ))
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY "tenant_isolation_features_delete" ON features
  FOR DELETE TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- ============================================================
-- SPRINTS
-- ============================================================

ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tenant sprints" ON sprints;
DROP POLICY IF EXISTS "Users can manage own tenant sprints" ON sprints;
DROP POLICY IF EXISTS "Authenticated users can view sprints" ON sprints;
DROP POLICY IF EXISTS "Authenticated users can manage sprints" ON sprints;

CREATE POLICY "tenant_isolation_sprints" ON sprints
  FOR ALL TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ))
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- ============================================================
-- RISKS (estava QUEBRADO — referenciava profiles inexistente)
-- ============================================================

ALTER TABLE risks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view risks from their tenant" ON risks;
DROP POLICY IF EXISTS "Users can create risks in their tenant" ON risks;
DROP POLICY IF EXISTS "Users can update risks from their tenant" ON risks;
DROP POLICY IF EXISTS "Users can delete risks from their tenant" ON risks;
DROP POLICY IF EXISTS "Authenticated users can manage risks" ON risks;

CREATE POLICY "tenant_isolation_risks" ON risks
  FOR ALL TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ))
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- ============================================================
-- TEAM_MEMBERS
-- ============================================================

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage team members" ON team_members;
DROP POLICY IF EXISTS "Users can view own tenant team members" ON team_members;

CREATE POLICY "tenant_isolation_team_members" ON team_members
  FOR ALL TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ))
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- ============================================================
-- SPRINT_FEATURES (join table — sem tenant_id direto,
-- protegida indiretamente via sprints RLS)
-- ============================================================

ALTER TABLE sprint_features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage sprint features" ON sprint_features;

CREATE POLICY "tenant_isolation_sprint_features" ON sprint_features
  FOR ALL TO authenticated
  USING (
    sprint_id IN (
      SELECT s.id FROM sprints s
      WHERE s.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  )
  WITH CHECK (
    sprint_id IN (
      SELECT s.id FROM sprints s
      WHERE s.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- ============================================================
-- SPRINT_SCOPE_CHANGES
-- ============================================================

ALTER TABLE sprint_scope_changes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage scope changes" ON sprint_scope_changes;

CREATE POLICY "tenant_isolation_scope_changes" ON sprint_scope_changes
  FOR ALL TO authenticated
  USING (
    sprint_id IN (
      SELECT s.id FROM sprints s
      WHERE s.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  )
  WITH CHECK (
    sprint_id IN (
      SELECT s.id FROM sprints s
      WHERE s.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- ============================================================
-- SPRINT_BURNDOWN_SNAPSHOTS
-- ============================================================

ALTER TABLE sprint_burndown_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tenant burndown" ON sprint_burndown_snapshots;
DROP POLICY IF EXISTS "Users can insert own tenant burndown" ON sprint_burndown_snapshots;
DROP POLICY IF EXISTS "Authenticated users can manage burndown" ON sprint_burndown_snapshots;

CREATE POLICY "tenant_isolation_burndown" ON sprint_burndown_snapshots
  FOR ALL TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ))
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- ============================================================
-- BASELINE_METRICS
-- ============================================================

ALTER TABLE baseline_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tenant baseline" ON baseline_metrics;
DROP POLICY IF EXISTS "Users can manage own tenant baseline" ON baseline_metrics;
DROP POLICY IF EXISTS "Authenticated users can manage baseline" ON baseline_metrics;

CREATE POLICY "tenant_isolation_baseline_metrics" ON baseline_metrics
  FOR ALL TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ))
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- ============================================================
-- RETROSPECTIVE_ACTIONS
-- ============================================================

ALTER TABLE retrospective_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tenant retro actions" ON retrospective_actions;
DROP POLICY IF EXISTS "Users can manage own tenant retro actions" ON retrospective_actions;
DROP POLICY IF EXISTS "Authenticated users can manage retro actions" ON retrospective_actions;

CREATE POLICY "tenant_isolation_retro_actions" ON retrospective_actions
  FOR ALL TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ))
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- ============================================================
-- PLANNING_POKER_SESSIONS
-- ============================================================

ALTER TABLE planning_poker_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tenant poker sessions" ON planning_poker_sessions;
DROP POLICY IF EXISTS "Users can manage own tenant poker sessions" ON planning_poker_sessions;
DROP POLICY IF EXISTS "Authenticated users can manage poker sessions" ON planning_poker_sessions;

CREATE POLICY "tenant_isolation_poker_sessions" ON planning_poker_sessions
  FOR ALL TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ))
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- ============================================================
-- PLANNING_POKER_VOTES (sem tenant_id — protegida via session)
-- ============================================================

ALTER TABLE planning_poker_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tenant poker votes" ON planning_poker_votes;
DROP POLICY IF EXISTS "Users can manage own tenant poker votes" ON planning_poker_votes;
DROP POLICY IF EXISTS "Authenticated users can manage poker votes" ON planning_poker_votes;

CREATE POLICY "tenant_isolation_poker_votes" ON planning_poker_votes
  FOR ALL TO authenticated
  USING (
    session_id IN (
      SELECT pps.id FROM planning_poker_sessions pps
      WHERE pps.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT pps.id FROM planning_poker_sessions pps
      WHERE pps.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- ============================================================
-- PLANNING_POKER_RESULTS
-- ============================================================

ALTER TABLE planning_poker_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tenant poker results" ON planning_poker_results;
DROP POLICY IF EXISTS "Users can manage own tenant poker results" ON planning_poker_results;
DROP POLICY IF EXISTS "Authenticated users can manage poker results" ON planning_poker_results;

CREATE POLICY "tenant_isolation_poker_results" ON planning_poker_results
  FOR ALL TO authenticated
  USING (
    session_id IN (
      SELECT pps.id FROM planning_poker_sessions pps
      WHERE pps.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT pps.id FROM planning_poker_sessions pps
      WHERE pps.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- ============================================================
-- FEATURE_CLUSTERS (sem tenant_id — protegida via project)
-- ============================================================

ALTER TABLE feature_clusters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view clusters of their projects" ON feature_clusters;
DROP POLICY IF EXISTS "Users can manage clusters of their projects" ON feature_clusters;

CREATE POLICY "tenant_isolation_feature_clusters" ON feature_clusters
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- ============================================================
-- FEATURE_CLUSTER_MEMBERS
-- ============================================================

ALTER TABLE feature_cluster_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view cluster members of their projects" ON feature_cluster_members;
DROP POLICY IF EXISTS "Users can manage cluster members of their projects" ON feature_cluster_members;

CREATE POLICY "tenant_isolation_cluster_members" ON feature_cluster_members
  FOR ALL TO authenticated
  USING (
    cluster_id IN (
      SELECT fc.id FROM feature_clusters fc
      WHERE fc.project_id IN (
        SELECT p.id FROM projects p
        WHERE p.tenant_id IN (
          SELECT tenant_id FROM company_members
          WHERE user_id = auth.uid() AND status = 'active'
        )
      )
    )
  )
  WITH CHECK (
    cluster_id IN (
      SELECT fc.id FROM feature_clusters fc
      WHERE fc.project_id IN (
        SELECT p.id FROM projects p
        WHERE p.tenant_id IN (
          SELECT tenant_id FROM company_members
          WHERE user_id = auth.uid() AND status = 'active'
        )
      )
    )
  );

-- ============================================================
-- FEATURE_DEPENDENCIES
-- ============================================================

ALTER TABLE feature_dependencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view dependencies of their projects" ON feature_dependencies;
DROP POLICY IF EXISTS "Users can manage dependencies of their projects" ON feature_dependencies;

CREATE POLICY "tenant_isolation_feature_deps" ON feature_dependencies
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- ============================================================
-- EPIC_DECOMPOSITION
-- ============================================================

ALTER TABLE epic_decomposition ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view decompositions of their projects" ON epic_decomposition;
DROP POLICY IF EXISTS "Users can manage decompositions of their projects" ON epic_decomposition;

CREATE POLICY "tenant_isolation_epic_decomp" ON epic_decomposition
  FOR ALL TO authenticated
  USING (
    epic_id IN (
      SELECT f.id FROM features f
      WHERE f.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  )
  WITH CHECK (
    epic_id IN (
      SELECT f.id FROM features f
      WHERE f.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- ============================================================
-- DOD_LEVELS
-- ============================================================

ALTER TABLE dod_levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view dod levels of their projects" ON dod_levels;
DROP POLICY IF EXISTS "Users can manage dod levels of their projects" ON dod_levels;

CREATE POLICY "tenant_isolation_dod_levels" ON dod_levels
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- ============================================================
-- DOD_HISTORY
-- ============================================================

ALTER TABLE dod_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view dod history of their projects" ON dod_history;
DROP POLICY IF EXISTS "Users can manage dod history of their projects" ON dod_history;

CREATE POLICY "tenant_isolation_dod_history" ON dod_history
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- ============================================================
-- DAILY_SCRUM_LOGS
-- ============================================================

ALTER TABLE daily_scrum_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage daily logs" ON daily_scrum_logs;

CREATE POLICY "tenant_isolation_daily_logs" ON daily_scrum_logs
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- ============================================================
-- DAILY_FEATURE_MENTIONS
-- ============================================================

ALTER TABLE daily_feature_mentions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage daily mentions" ON daily_feature_mentions;

CREATE POLICY "tenant_isolation_daily_mentions" ON daily_feature_mentions
  FOR ALL TO authenticated
  USING (
    daily_log_id IN (
      SELECT dsl.id FROM daily_scrum_logs dsl
      WHERE dsl.project_id IN (
        SELECT p.id FROM projects p
        WHERE p.tenant_id IN (
          SELECT tenant_id FROM company_members
          WHERE user_id = auth.uid() AND status = 'active'
        )
      )
    )
  )
  WITH CHECK (
    daily_log_id IN (
      SELECT dsl.id FROM daily_scrum_logs dsl
      WHERE dsl.project_id IN (
        SELECT p.id FROM projects p
        WHERE p.tenant_id IN (
          SELECT tenant_id FROM company_members
          WHERE user_id = auth.uid() AND status = 'active'
        )
      )
    )
  );

-- ============================================================
-- EXPORT_HISTORY
-- ============================================================

ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage export history" ON export_history;

CREATE POLICY "tenant_isolation_export_history" ON export_history
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      WHERE p.tenant_id IN (
        SELECT tenant_id FROM company_members
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- ============================================================
-- PROJECTS (garantir RLS)
-- ============================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can manage projects" ON projects;
DROP POLICY IF EXISTS "tenant_isolation_projects" ON projects;

CREATE POLICY "tenant_isolation_projects" ON projects
  FOR ALL TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ))
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM company_members
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- ============================================================
-- GRANTS para todas as tabelas
-- ============================================================

GRANT ALL ON features TO authenticated;
GRANT ALL ON sprints TO authenticated;
GRANT ALL ON risks TO authenticated;
GRANT ALL ON team_members TO authenticated;
GRANT ALL ON sprint_features TO authenticated;
GRANT ALL ON sprint_scope_changes TO authenticated;
GRANT ALL ON sprint_burndown_snapshots TO authenticated;
GRANT ALL ON baseline_metrics TO authenticated;
GRANT ALL ON retrospective_actions TO authenticated;
GRANT ALL ON planning_poker_sessions TO authenticated;
GRANT ALL ON planning_poker_votes TO authenticated;
GRANT ALL ON planning_poker_results TO authenticated;
GRANT ALL ON feature_clusters TO authenticated;
GRANT ALL ON feature_cluster_members TO authenticated;
GRANT ALL ON feature_dependencies TO authenticated;
GRANT ALL ON epic_decomposition TO authenticated;
GRANT ALL ON dod_levels TO authenticated;
GRANT ALL ON dod_history TO authenticated;
GRANT ALL ON daily_scrum_logs TO authenticated;
GRANT ALL ON daily_feature_mentions TO authenticated;
GRANT ALL ON export_history TO authenticated;
GRANT ALL ON projects TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON company_members TO authenticated;

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 014 completa!';
  RAISE NOTICE '   • RLS reescrita em 22 tabelas com isolamento real por tenant';
  RAISE NOTICE '   • Padrão: USING (tenant_id IN (SELECT FROM company_members WHERE user_id = auth.uid()))';
  RAISE NOTICE '   • risks: policy quebrada (profiles) corrigida';
  RAISE NOTICE '   • Tabelas sem tenant_id protegidas via FK para tabelas com tenant';
END $$;
