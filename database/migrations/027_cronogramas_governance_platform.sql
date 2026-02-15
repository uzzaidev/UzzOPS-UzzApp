-- ============================================================
-- MIGRATION 027: CRONOGRAMAS GOVERNANCE PLATFORM (COMPLETA)
-- ============================================================
-- Objetivo:
-- Estruturar uma camada completa de governanca de cronograma e
-- metodologia para produto/software, cobrindo:
-- - Direcao: Charter, OST, roadmap por outcomes/marcos
-- - Entrega: cerimônias e rastreabilidade de sprint/release
-- - Previsao: snapshots de forecast probabilistico
-- - Descoberta: hipoteses, testes MVP, spikes, evidencias
-- - Governanca: ADR, decision log, changelog, pilotos
--
-- Dependencias:
-- - tenants
-- - projects
-- - sprints (opcional para vinculos de alguns artefatos)
-- ============================================================

-- ------------------------------------------------------------
-- 1) CHARTER E DIRECAO DE PRODUTO
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.product_charters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'archived')),

  vision_outcome TEXT NOT NULL,
  target_users_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  critical_hypotheses_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  mvp_anchor_cases_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  success_metrics_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  non_negotiables_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  top_risks_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  ip_rules_json JSONB NOT NULL DEFAULT '[]'::jsonb,

  source_ref TEXT,
  valid_from DATE,
  valid_to DATE,

  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_product_charters_project_version
  ON public.product_charters(project_id, version);

CREATE UNIQUE INDEX IF NOT EXISTS uq_product_charters_project_active
  ON public.product_charters(project_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_product_charters_tenant_project_status
  ON public.product_charters(tenant_id, project_id, status, created_at DESC);


-- ------------------------------------------------------------
-- 2) OST (OUTCOME / OPORTUNIDADES / SOLUCOES / TESTES)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.outcome_trees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  charter_id UUID REFERENCES public.product_charters(id) ON DELETE SET NULL,

  code TEXT,
  title TEXT NOT NULL,
  outcome_statement TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'archived')),
  horizon_label TEXT,

  owner_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_outcome_trees_project_code
  ON public.outcome_trees(project_id, code)
  WHERE code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_outcome_trees_tenant_project
  ON public.outcome_trees(tenant_id, project_id, status, created_at DESC);


CREATE TABLE IF NOT EXISTS public.outcome_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  outcome_tree_id UUID NOT NULL REFERENCES public.outcome_trees(id) ON DELETE CASCADE,
  parent_opportunity_id UUID REFERENCES public.outcome_opportunities(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  problem_statement TEXT,
  evidence_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  risk_type TEXT
    CHECK (risk_type IN ('value', 'usability', 'feasibility', 'viability', 'business', 'legal', 'security', 'performance') OR risk_type IS NULL),
  priority INTEGER NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'mapped'
    CHECK (status IN ('mapped', 'selected', 'validated', 'discarded')),

  owner_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outcome_opportunities_tree
  ON public.outcome_opportunities(outcome_tree_id, status, priority);

CREATE INDEX IF NOT EXISTS idx_outcome_opportunities_tenant_project
  ON public.outcome_opportunities(tenant_id, project_id, created_at DESC);


CREATE TABLE IF NOT EXISTS public.opportunity_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.outcome_opportunities(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  maturity TEXT NOT NULL DEFAULT 'idea'
    CHECK (maturity IN ('idea', 'prototype', 'mvp_test', 'delivery_candidate', 'implemented', 'discarded')),
  expected_impact_score INTEGER CHECK (expected_impact_score BETWEEN 1 AND 10 OR expected_impact_score IS NULL),
  expected_effort_score INTEGER CHECK (expected_effort_score BETWEEN 1 AND 10 OR expected_effort_score IS NULL),
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100 OR confidence_score IS NULL),

  owner_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunity_solutions_opportunity
  ON public.opportunity_solutions(opportunity_id, maturity, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_opportunity_solutions_tenant_project
  ON public.opportunity_solutions(tenant_id, project_id);


CREATE TABLE IF NOT EXISTS public.solution_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  solution_id UUID NOT NULL REFERENCES public.opportunity_solutions(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL,

  test_type TEXT NOT NULL
    CHECK (test_type IN ('mvp_test', 'prototype', 'spike', 'ux_test', 'pilot', 'benchmark', 'ab_test')),
  hypothesis TEXT NOT NULL,
  method TEXT,
  success_criteria_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  evidence_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  result TEXT NOT NULL DEFAULT 'pending'
    CHECK (result IN ('pending', 'passed', 'failed', 'inconclusive', 'cancelled')),
  decision TEXT
    CHECK (decision IN ('go', 'no_go', 'iterate', 'pivot') OR decision IS NULL),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  owner_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solution_tests_solution
  ON public.solution_tests(solution_id, test_type, result, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_solution_tests_tenant_project
  ON public.solution_tests(tenant_id, project_id, created_at DESC);


-- ------------------------------------------------------------
-- 3) ROADMAP E MARCOS DE RELEASE
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  code TEXT,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'archived')),
  planning_model TEXT NOT NULL DEFAULT 'scrum'
    CHECK (planning_model IN ('scrum', 'kanban', 'hybrid')),
  horizon_start DATE,
  horizon_end DATE,
  release_reference_sprints SMALLINT CHECK (release_reference_sprints >= 1 OR release_reference_sprints IS NULL),
  notes TEXT,

  owner_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_roadmaps_project_code
  ON public.roadmaps(project_id, code)
  WHERE code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_roadmaps_tenant_project_status
  ON public.roadmaps(tenant_id, project_id, status, created_at DESC);


CREATE TABLE IF NOT EXISTS public.roadmap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  parent_item_id UUID REFERENCES public.roadmap_items(id) ON DELETE SET NULL,
  sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL,

  code TEXT,
  item_type TEXT NOT NULL
    CHECK (item_type IN ('outcome', 'milestone', 'release', 'pilot_phase', 'initiative')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'in_progress', 'done', 'blocked', 'cancelled')),
  confidence_pct SMALLINT CHECK (confidence_pct BETWEEN 0 AND 100 OR confidence_pct IS NULL),

  planned_start DATE,
  planned_end DATE,
  actual_start DATE,
  actual_end DATE,
  dependencies_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  success_metrics_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  risk_notes TEXT,

  owner_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_roadmap_items_project_code
  ON public.roadmap_items(project_id, code)
  WHERE code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_roadmap_items_roadmap_status
  ON public.roadmap_items(roadmap_id, status, planned_start);

CREATE INDEX IF NOT EXISTS idx_roadmap_items_tenant_project_type
  ON public.roadmap_items(tenant_id, project_id, item_type, planned_start);


-- ------------------------------------------------------------
-- 4) HIPOTESES E EXPERIMENTOS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.project_hypotheses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  roadmap_item_id UUID REFERENCES public.roadmap_items(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  statement TEXT NOT NULL,
  risk_type TEXT NOT NULL
    CHECK (risk_type IN ('value', 'usability', 'feasibility', 'viability', 'business', 'legal', 'security', 'performance')),
  metric_name TEXT,
  threshold_expression TEXT,
  baseline_value TEXT,
  target_value TEXT,
  evidence_required TEXT,

  status TEXT NOT NULL DEFAULT 'backlog'
    CHECK (status IN ('backlog', 'in_test', 'validated', 'invalidated', 'pivoted', 'parked')),
  confidence_before SMALLINT CHECK (confidence_before BETWEEN 0 AND 100 OR confidence_before IS NULL),
  confidence_after SMALLINT CHECK (confidence_after BETWEEN 0 AND 100 OR confidence_after IS NULL),

  owner_id UUID,
  created_by UUID,
  validated_at TIMESTAMPTZ,
  invalidated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_hypotheses_tenant_project_status
  ON public.project_hypotheses(tenant_id, project_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_hypotheses_risk_type
  ON public.project_hypotheses(project_id, risk_type, status);


CREATE TABLE IF NOT EXISTS public.hypothesis_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  hypothesis_id UUID NOT NULL REFERENCES public.project_hypotheses(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL,

  experiment_type TEXT NOT NULL
    CHECK (experiment_type IN ('mvp_test', 'spike', 'prototype', 'ux_interview', 'pilot_run', 'benchmark', 'simulation')),
  question TEXT NOT NULL,
  timebox_hours INTEGER CHECK (timebox_hours >= 1 OR timebox_hours IS NULL),
  protocol_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  collected_data_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_summary TEXT,
  outcome TEXT
    CHECK (outcome IN ('go', 'no_go', 'iterate', 'pivot', 'inconclusive') OR outcome IS NULL),

  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  owner_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hypothesis_experiments_hypothesis
  ON public.hypothesis_experiments(hypothesis_id, experiment_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hypothesis_experiments_tenant_project
  ON public.hypothesis_experiments(tenant_id, project_id, created_at DESC);


-- ------------------------------------------------------------
-- 5) RASTREABILIDADE DE DECISAO (DECISION LOG + ADR)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.project_decision_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL,
  roadmap_item_id UUID REFERENCES public.roadmap_items(id) ON DELETE SET NULL,

  decision_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL
    CHECK (category IN ('product', 'technical', 'process', 'roadmap', 'risk', 'legal', 'governance')),
  title TEXT NOT NULL,
  decision_text TEXT NOT NULL,
  evidence_text TEXT,
  impact_summary TEXT,
  impact_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  supersedes_decision_id UUID REFERENCES public.project_decision_log(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'superseded', 'reverted')),

  decided_by UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_decision_log_tenant_project
  ON public.project_decision_log(tenant_id, project_id, decision_date DESC);

CREATE INDEX IF NOT EXISTS idx_project_decision_log_status_category
  ON public.project_decision_log(project_id, status, category);


CREATE TABLE IF NOT EXISTS public.architecture_decision_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  decision_log_id UUID REFERENCES public.project_decision_log(id) ON DELETE SET NULL,

  adr_code TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed', 'accepted', 'deprecated', 'superseded', 'rejected')),
  context TEXT NOT NULL,
  decision TEXT NOT NULL,
  alternatives_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  tradeoffs_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  consequences TEXT,
  reevaluation_triggers_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_links_json JSONB NOT NULL DEFAULT '[]'::jsonb,

  decided_at TIMESTAMPTZ,
  decided_by UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_adr_project_code
  ON public.architecture_decision_records(project_id, adr_code);

CREATE INDEX IF NOT EXISTS idx_adr_tenant_project_status
  ON public.architecture_decision_records(tenant_id, project_id, status, created_at DESC);


-- ------------------------------------------------------------
-- 6) CERIMONIAS SCRUM (PLANNING/REVIEW/RETRO/DAILY)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.sprint_ceremonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL,

  ceremony_type TEXT NOT NULL
    CHECK (ceremony_type IN ('planning', 'daily', 'review', 'retrospective')),
  session_date DATE NOT NULL,
  duration_minutes INTEGER CHECK (duration_minutes >= 0 OR duration_minutes IS NULL),
  objective TEXT,
  input_summary TEXT,
  output_summary TEXT,
  decisions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  metrics_snapshot_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  attendees_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  action_items_json JSONB NOT NULL DEFAULT '[]'::jsonb,

  facilitator_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sprint_ceremonies_tenant_project
  ON public.sprint_ceremonies(tenant_id, project_id, session_date DESC);

CREATE INDEX IF NOT EXISTS idx_sprint_ceremonies_sprint_type
  ON public.sprint_ceremonies(sprint_id, ceremony_type, session_date DESC);


-- ------------------------------------------------------------
-- 7) FORECASTS DE RELEASE (SNAPSHOTS)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.release_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE SET NULL,

  label TEXT NOT NULL,
  forecast_model TEXT NOT NULL DEFAULT 'velocity_range'
    CHECK (forecast_model IN ('velocity_range', 'throughput_range', 'monte_carlo')),
  unit TEXT NOT NULL DEFAULT 'story_points'
    CHECK (unit IN ('story_points', 'items')),
  history_window_sprints INTEGER CHECK (history_window_sprints >= 1 OR history_window_sprints IS NULL),
  sample_size INTEGER CHECK (sample_size >= 100 OR sample_size IS NULL),
  confidence_levels_json JSONB NOT NULL DEFAULT '[0.5,0.8,0.9]'::jsonb,
  backlog_scope_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  assumptions_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generated_by UUID,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_release_forecasts_tenant_project
  ON public.release_forecasts(tenant_id, project_id, generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_release_forecasts_model
  ON public.release_forecasts(project_id, forecast_model, generated_at DESC);


-- ------------------------------------------------------------
-- 8) PILOTOS E VALIDACAO COM ESCRITORIOS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.pilot_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  roadmap_item_id UUID REFERENCES public.roadmap_items(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'running', 'completed', 'cancelled')),
  pilot_goal TEXT NOT NULL,
  phases_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  success_criteria_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  start_date DATE,
  end_date DATE,

  owner_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pilot_programs_tenant_project
  ON public.pilot_programs(tenant_id, project_id, status, start_date);


CREATE TABLE IF NOT EXISTS public.pilot_offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  pilot_program_id UUID NOT NULL REFERENCES public.pilot_programs(id) ON DELETE CASCADE,

  office_name TEXT NOT NULL,
  company_name TEXT,
  contact_name TEXT,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'onboarding'
    CHECK (status IN ('onboarding', 'guided_use', 'expansion', 'completed', 'dropped')),
  setup_completed_at TIMESTAMPTZ,
  notes TEXT,

  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pilot_offices_program_status
  ON public.pilot_offices(pilot_program_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pilot_offices_tenant_project
  ON public.pilot_offices(tenant_id, project_id);


CREATE TABLE IF NOT EXISTS public.pilot_validation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  pilot_program_id UUID NOT NULL REFERENCES public.pilot_programs(id) ON DELETE CASCADE,
  pilot_office_id UUID REFERENCES public.pilot_offices(id) ON DELETE SET NULL,
  sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL,

  phase TEXT NOT NULL
    CHECK (phase IN ('onboarding', 'guided_use', 'expansion')),
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('setup', 'training', 'usage_review', 'incident', 'feedback', 'checkpoint')),
  metrics_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  incidents_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  qualitative_feedback TEXT,
  decision TEXT
    CHECK (decision IN ('continue', 'adjust', 'pause', 'stop') OR decision IS NULL),

  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pilot_validation_events_program_date
  ON public.pilot_validation_events(pilot_program_id, event_date DESC);

CREATE INDEX IF NOT EXISTS idx_pilot_validation_events_tenant_project
  ON public.pilot_validation_events(tenant_id, project_id, event_date DESC);


-- ------------------------------------------------------------
-- 9) CHANGELOG DE PRODUTO (RASTREABILIDADE DE ENTREGA)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.product_changelog_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL,
  roadmap_item_id UUID REFERENCES public.roadmap_items(id) ON DELETE SET NULL,

  release_label TEXT,
  change_date DATE NOT NULL DEFAULT CURRENT_DATE,
  change_type TEXT NOT NULL
    CHECK (change_type IN ('feature', 'improvement', 'fix', 'risk_mitigation', 'process', 'breaking_change')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  impact_area TEXT,
  evidence_links_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  visibility TEXT NOT NULL DEFAULT 'internal'
    CHECK (visibility IN ('internal', 'customer_facing', 'public')),

  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_changelog_tenant_project
  ON public.product_changelog_entries(tenant_id, project_id, change_date DESC);

CREATE INDEX IF NOT EXISTS idx_product_changelog_release
  ON public.product_changelog_entries(project_id, release_label, change_date DESC);


-- ------------------------------------------------------------
-- 10) RLS, POLICIES, TRIGGERS, GRANTS
-- ------------------------------------------------------------

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'product_charters',
    'outcome_trees',
    'outcome_opportunities',
    'opportunity_solutions',
    'solution_tests',
    'roadmaps',
    'roadmap_items',
    'project_hypotheses',
    'hypothesis_experiments',
    'project_decision_log',
    'architecture_decision_records',
    'sprint_ceremonies',
    'release_forecasts',
    'pilot_programs',
    'pilot_offices',
    'pilot_validation_events',
    'product_changelog_entries'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);

    EXECUTE format('DROP POLICY IF EXISTS tenant_select_%I ON public.%I;', t, t);
    EXECUTE format($f$
      CREATE POLICY tenant_select_%1$I
      ON public.%1$I
      FOR SELECT TO authenticated
      USING (
        tenant_id IN (
          SELECT tenant_id
          FROM public.company_members
          WHERE user_id = auth.uid()
            AND status = 'active'
        )
      );
    $f$, t);

    EXECUTE format('DROP POLICY IF EXISTS tenant_insert_%I ON public.%I;', t, t);
    EXECUTE format($f$
      CREATE POLICY tenant_insert_%1$I
      ON public.%1$I
      FOR INSERT TO authenticated
      WITH CHECK (
        tenant_id IN (
          SELECT tenant_id
          FROM public.company_members
          WHERE user_id = auth.uid()
            AND status = 'active'
        )
      );
    $f$, t);

    EXECUTE format('DROP POLICY IF EXISTS tenant_update_%I ON public.%I;', t, t);
    EXECUTE format($f$
      CREATE POLICY tenant_update_%1$I
      ON public.%1$I
      FOR UPDATE TO authenticated
      USING (
        tenant_id IN (
          SELECT tenant_id
          FROM public.company_members
          WHERE user_id = auth.uid()
            AND status = 'active'
        )
      )
      WITH CHECK (
        tenant_id IN (
          SELECT tenant_id
          FROM public.company_members
          WHERE user_id = auth.uid()
            AND status = 'active'
        )
      );
    $f$, t);

    EXECUTE format('DROP POLICY IF EXISTS tenant_delete_%I ON public.%I;', t, t);
    EXECUTE format($f$
      CREATE POLICY tenant_delete_%1$I
      ON public.%1$I
      FOR DELETE TO authenticated
      USING (
        tenant_id IN (
          SELECT tenant_id
          FROM public.company_members
          WHERE user_id = auth.uid()
            AND status = 'active'
        )
      );
    $f$, t);

    EXECUTE format('DROP TRIGGER IF EXISTS trg_%1$s_updated_at ON public.%1$s;', t);
    EXECUTE format(
      'CREATE TRIGGER trg_%1$s_updated_at BEFORE UPDATE ON public.%1$s FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();',
      t
    );

    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated;', t);
  END LOOP;
END $$;


-- ------------------------------------------------------------
-- 11) RELOAD SCHEMA + NOTICE
-- ------------------------------------------------------------

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE 'Migration 027 aplicada: Cronogramas Governance Platform (completa).';
  RAISE NOTICE 'Inclui: charter, OST, roadmap, hipoteses, experimentos, ADR, decision log, forecast, pilotos, changelog, cerimonias.';
END $$;

