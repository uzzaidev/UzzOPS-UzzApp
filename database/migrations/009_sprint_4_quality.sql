-- ============================================================
-- MIGRATION 009: SPRINT 4 - PRIORIZAÇÃO E QUALIDADE
-- ============================================================
-- Versão: 1.0
-- Data: 2026-02-11
-- Descrição: Planning Poker, MVP Flag, Retrospective Tracker, INVEST
-- Dependências: 008_sprint_3_metrics.sql
-- ============================================================

BEGIN;

-- ============================================================
-- US-4.2: MVP FLAG
-- ============================================================

ALTER TABLE features ADD COLUMN IF NOT EXISTS is_mvp BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_features_mvp ON features(is_mvp) WHERE is_mvp = TRUE;

-- Coluna acceptance_criteria (usada também pelo INVEST)
ALTER TABLE features ADD COLUMN IF NOT EXISTS acceptance_criteria TEXT;

-- View de progresso MVP por projeto
CREATE OR REPLACE VIEW mvp_progress AS
SELECT
  project_id,
  COUNT(*) FILTER (WHERE is_mvp = TRUE) as mvp_total,
  COUNT(*) FILTER (WHERE is_mvp = TRUE AND status = 'done') as mvp_done,
  ROUND(
    (
      COUNT(*) FILTER (WHERE is_mvp = TRUE AND status = 'done')::numeric /
      NULLIF(COUNT(*) FILTER (WHERE is_mvp = TRUE), 0)::numeric * 100
    )::numeric,
    2
  ) as mvp_progress_percentage
FROM features
GROUP BY project_id;

GRANT SELECT ON mvp_progress TO authenticated;

-- ============================================================
-- US-4.4: INVEST VALIDATION
-- ============================================================

-- Armazena checklist INVEST por feature
ALTER TABLE features ADD COLUMN IF NOT EXISTS invest_checklist JSONB DEFAULT '{
  "independent": null,
  "negotiable": null,
  "valuable": null,
  "estimable": null,
  "small": null,
  "testable": null
}'::jsonb;

-- ============================================================
-- US-4.3: RETROSPECTIVE ACTIONS TRACKER
-- ============================================================

CREATE TABLE IF NOT EXISTS retrospective_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  category TEXT NOT NULL CHECK (category IN ('worked_well', 'needs_improvement', 'experiment')),
  action_text TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'done', 'abandoned')),

  owner_id UUID REFERENCES team_members(id),
  due_date DATE,

  success_criteria TEXT,
  outcome TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_retro_sprint ON retrospective_actions(sprint_id);
CREATE INDEX IF NOT EXISTS idx_retro_project ON retrospective_actions(project_id);
CREATE INDEX IF NOT EXISTS idx_retro_status ON retrospective_actions(status);
CREATE INDEX IF NOT EXISTS idx_retro_tenant ON retrospective_actions(tenant_id);

ALTER TABLE retrospective_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant retro actions" ON retrospective_actions
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY "Users can manage own tenant retro actions" ON retrospective_actions
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE TRIGGER set_retro_updated_at
BEFORE UPDATE ON retrospective_actions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- US-4.1: PLANNING POKER
-- ============================================================

CREATE TABLE IF NOT EXISTS planning_poker_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('business_value', 'work_effort')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'cancelled')),

  feature_ids UUID[] NOT NULL,
  current_feature_index INT NOT NULL DEFAULT 0,
  facilitator_id UUID REFERENCES team_members(id),
  revealed BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_poker_project ON planning_poker_sessions(project_id, status);
CREATE INDEX IF NOT EXISTS idx_poker_tenant ON planning_poker_sessions(tenant_id);

ALTER TABLE planning_poker_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant poker sessions" ON planning_poker_sessions
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY "Users can manage own tenant poker sessions" ON planning_poker_sessions
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- Votos individuais por feature/votante
CREATE TABLE IF NOT EXISTS planning_poker_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES planning_poker_sessions(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  voter_name TEXT NOT NULL,

  vote_value TEXT NOT NULL,
  vote_numeric INT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(session_id, feature_id, voter_name)
);

CREATE INDEX IF NOT EXISTS idx_poker_votes_session ON planning_poker_votes(session_id, feature_id);

ALTER TABLE planning_poker_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant poker votes" ON planning_poker_votes
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM planning_poker_sessions
      WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid
    )
  );

CREATE POLICY "Users can manage own tenant poker votes" ON planning_poker_votes
  FOR ALL USING (
    session_id IN (
      SELECT id FROM planning_poker_sessions
      WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid
    )
  );

-- Resultados finalizados por feature
CREATE TABLE IF NOT EXISTS planning_poker_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES planning_poker_sessions(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,

  final_value INT NOT NULL,
  consensus_level TEXT CHECK (consensus_level IN ('unanimous', 'majority', 'forced')),

  votes_summary JSONB,
  discussion_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(session_id, feature_id)
);

CREATE INDEX IF NOT EXISTS idx_poker_results_session ON planning_poker_results(session_id);

ALTER TABLE planning_poker_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant poker results" ON planning_poker_results
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM planning_poker_sessions
      WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid
    )
  );

CREATE POLICY "Users can manage own tenant poker results" ON planning_poker_results
  FOR ALL USING (
    session_id IN (
      SELECT id FROM planning_poker_sessions
      WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid
    )
  );

GRANT ALL ON planning_poker_sessions TO authenticated;
GRANT ALL ON planning_poker_votes TO authenticated;
GRANT ALL ON planning_poker_results TO authenticated;
GRANT ALL ON retrospective_actions TO authenticated;

COMMIT;

-- ============================================================
-- VERIFICAÇÕES PÓS-MIGRATION
-- ============================================================

DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'features' AND column_name = 'is_mvp') = 1, 'Coluna is_mvp não criada';
  ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'features' AND column_name = 'acceptance_criteria') = 1, 'Coluna acceptance_criteria não criada';
  ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'retrospective_actions') = 1, 'Tabela retrospective_actions não criada';
  ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'planning_poker_sessions') = 1, 'Tabela planning_poker_sessions não criada';
  RAISE NOTICE '✅ Migration 009 completa!';
END $$;
