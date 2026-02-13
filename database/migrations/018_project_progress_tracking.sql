-- ============================================================
-- MIGRATION 018: PROJECT PROGRESS TRACKING (FOUNDATION)
-- ============================================================
-- Objetivo:
-- 1) Criar fundacao confiavel para progresso multidimensional.
-- 2) Registrar historico de mudanca de status dos work items.
-- 3) Calcular snapshots de progresso por projeto.
-- 4) Preparar configuracao de pesos por projeto.
-- Dependencia: 017_hardening_cleanup.sql
-- ============================================================

-- ------------------------------------------------------------
-- 1) SETTINGS (pesos e thresholds por projeto)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.project_progress_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  formula_version TEXT NOT NULL DEFAULT 'v1',

  weight_delivery NUMERIC(5,2) NOT NULL DEFAULT 40.00,
  weight_quality NUMERIC(5,2) NOT NULL DEFAULT 20.00,
  weight_schedule NUMERIC(5,2) NOT NULL DEFAULT 20.00,
  weight_risk NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  weight_capacity NUMERIC(5,2) NOT NULL DEFAULT 10.00,

  -- Peso interno da dimensao entrega: feature vs bug resolvido
  delivery_feature_weight NUMERIC(5,2) NOT NULL DEFAULT 0.70,
  delivery_bug_weight NUMERIC(5,2) NOT NULL DEFAULT 0.30,

  healthy_min NUMERIC(5,2) NOT NULL DEFAULT 75.00,
  attention_min NUMERIC(5,2) NOT NULL DEFAULT 50.00,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_project_progress_settings_project UNIQUE (project_id),
  CONSTRAINT chk_progress_weights_non_negative CHECK (
    weight_delivery >= 0 AND weight_quality >= 0 AND weight_schedule >= 0
    AND weight_risk >= 0 AND weight_capacity >= 0
  ),
  CONSTRAINT chk_delivery_subweights CHECK (
    delivery_feature_weight >= 0 AND delivery_bug_weight >= 0
  )
);

CREATE INDEX IF NOT EXISTS idx_progress_settings_tenant
  ON public.project_progress_settings(tenant_id);

-- ------------------------------------------------------------
-- 2) HISTORICO DE STATUS DOS WORK ITEMS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.work_item_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES public.features(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wish_feature_changed_at
  ON public.work_item_status_history(feature_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_wish_project_changed_at
  ON public.work_item_status_history(project_id, changed_at DESC);

-- ------------------------------------------------------------
-- 3) SNAPSHOTS DE PROGRESSO
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.project_progress_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  trigger_event TEXT NOT NULL DEFAULT 'manual',

  -- Entrega
  features_total INTEGER NOT NULL DEFAULT 0,
  features_done INTEGER NOT NULL DEFAULT 0,
  bugs_total INTEGER NOT NULL DEFAULT 0,
  bugs_resolved INTEGER NOT NULL DEFAULT 0,
  delivery_feature_pct NUMERIC(5,2),
  delivery_bug_pct NUMERIC(5,2),
  delivery_pct NUMERIC(5,2),

  -- Qualidade
  dod_avg_pct NUMERIC(5,2),
  bug_reopen_rate NUMERIC(5,2),
  quality_pct NUMERIC(5,2),

  -- Cronograma
  sprints_completed_total INTEGER NOT NULL DEFAULT 0,
  sprints_on_time INTEGER NOT NULL DEFAULT 0,
  schedule_pct NUMERIC(5,2),
  overdue_items INTEGER NOT NULL DEFAULT 0,
  schedule_adjusted_pct NUMERIC(5,2),

  -- Risco
  risks_total INTEGER NOT NULL DEFAULT 0,
  risks_mitigated INTEGER NOT NULL DEFAULT 0,
  risks_critical_open INTEGER NOT NULL DEFAULT 0,
  risk_pct NUMERIC(5,2),
  risk_adjusted_pct NUMERIC(5,2),

  -- Capacidade
  velocity_avg_last3 NUMERIC(8,2),
  velocity_target NUMERIC(8,2),
  velocity_trend TEXT NOT NULL DEFAULT 'insufficient_data',
  capacity_pct NUMERIC(5,2),

  -- Qualidade do dado
  score_confidence NUMERIC(5,2) NOT NULL DEFAULT 0,
  insufficient_data_flags JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Score final
  progress_score NUMERIC(5,2),
  progress_label TEXT NOT NULL DEFAULT 'insufficient_data',

  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pps_project_time
  ON public.project_progress_snapshots(project_id, snapshot_at DESC);

CREATE INDEX IF NOT EXISTS idx_pps_tenant_time
  ON public.project_progress_snapshots(tenant_id, snapshot_at DESC);

-- ------------------------------------------------------------
-- 4) FUNCOES AUXILIARES
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.clamp_numeric(
  p_value NUMERIC,
  p_min NUMERIC,
  p_max NUMERIC
)
RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT LEAST(GREATEST(p_value, p_min), p_max);
$$;

CREATE OR REPLACE FUNCTION public.safe_pct(
  p_numerator NUMERIC,
  p_denominator NUMERIC
)
RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_denominator IS NULL OR p_denominator = 0 THEN NULL
    ELSE ROUND((p_numerator / p_denominator) * 100.0, 2)
  END;
$$;

-- ------------------------------------------------------------
-- 5) FUNCAO PRINCIPAL DE CALCULO
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.calculate_project_progress(
  p_project_id UUID,
  p_tenant_id UUID,
  p_trigger_event TEXT DEFAULT 'manual'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_settings RECORD;

  v_features_total INTEGER := 0;
  v_features_done INTEGER := 0;
  v_bugs_total INTEGER := 0;
  v_bugs_resolved INTEGER := 0;
  v_delivery_feature_pct NUMERIC(5,2);
  v_delivery_bug_pct NUMERIC(5,2);
  v_delivery_pct NUMERIC(5,2);

  v_dod_avg_pct NUMERIC(5,2);
  v_reopen_events INTEGER := 0;
  v_bug_done_events INTEGER := 0;
  v_bug_reopen_rate NUMERIC(5,2);
  v_quality_pct NUMERIC(5,2);

  v_sprints_completed_total INTEGER := 0;
  v_sprints_on_time INTEGER := 0;
  v_schedule_pct NUMERIC(5,2);
  v_overdue_items INTEGER := 0;
  v_schedule_adjusted_pct NUMERIC(5,2);

  v_risks_total INTEGER := 0;
  v_risks_mitigated INTEGER := 0;
  v_risks_critical_open INTEGER := 0;
  v_risk_pct NUMERIC(5,2);
  v_risk_adjusted_pct NUMERIC(5,2);

  v_velocity_avg_last3 NUMERIC(8,2);
  v_velocity_target NUMERIC(8,2);
  v_velocity_trend TEXT := 'insufficient_data';
  v_capacity_pct NUMERIC(5,2);

  v_valid_dimensions INTEGER := 0;
  v_weight_sum NUMERIC := 0;
  v_progress_score NUMERIC(5,2);
  v_progress_label TEXT := 'insufficient_data';
  v_score_confidence NUMERIC(5,2) := 0;

  v_flags JSONB := '{}'::jsonb;
BEGIN
  IF p_project_id IS NULL OR p_tenant_id IS NULL THEN
    RETURN;
  END IF;

  SELECT *
  INTO v_settings
  FROM public.project_progress_settings
  WHERE project_id = p_project_id;

  IF NOT FOUND THEN
    INSERT INTO public.project_progress_settings (tenant_id, project_id)
    VALUES (p_tenant_id, p_project_id)
    ON CONFLICT (project_id) DO NOTHING;

    SELECT *
    INTO v_settings
    FROM public.project_progress_settings
    WHERE project_id = p_project_id;
  END IF;

  -- Entrega
  SELECT
    COUNT(*) FILTER (WHERE f.work_item_type = 'feature'),
    COUNT(*) FILTER (WHERE f.work_item_type = 'feature' AND f.status = 'done'),
    COUNT(*) FILTER (WHERE f.work_item_type = 'bug'),
    COUNT(*) FILTER (WHERE f.work_item_type = 'bug' AND f.status = 'done')
  INTO
    v_features_total,
    v_features_done,
    v_bugs_total,
    v_bugs_resolved
  FROM public.features f
  WHERE f.tenant_id = p_tenant_id
    AND f.project_id = p_project_id;

  v_delivery_feature_pct := public.safe_pct(v_features_done, v_features_total);
  v_delivery_bug_pct := public.safe_pct(v_bugs_resolved, v_bugs_total);

  IF v_delivery_feature_pct IS NULL AND v_delivery_bug_pct IS NULL THEN
    v_flags := jsonb_set(v_flags, '{delivery}', 'true'::jsonb, true);
    v_delivery_pct := NULL;
  ELSIF v_delivery_feature_pct IS NULL THEN
    v_delivery_pct := v_delivery_bug_pct;
  ELSIF v_delivery_bug_pct IS NULL THEN
    v_delivery_pct := v_delivery_feature_pct;
  ELSE
    v_delivery_pct := ROUND(
      (v_delivery_feature_pct * v_settings.delivery_feature_weight)
      + (v_delivery_bug_pct * v_settings.delivery_bug_weight),
      2
    );
  END IF;

  -- Qualidade
  SELECT ROUND(AVG(f.dod_progress)::numeric, 2)
  INTO v_dod_avg_pct
  FROM public.features f
  WHERE f.tenant_id = p_tenant_id
    AND f.project_id = p_project_id
    AND f.status = 'done';

  SELECT COUNT(*)
  INTO v_bug_done_events
  FROM public.work_item_status_history h
  JOIN public.features f ON f.id = h.feature_id
  WHERE h.tenant_id = p_tenant_id
    AND h.project_id = p_project_id
    AND f.work_item_type = 'bug'
    AND h.to_status = 'done';

  SELECT COUNT(*)
  INTO v_reopen_events
  FROM public.work_item_status_history h
  JOIN public.features f ON f.id = h.feature_id
  WHERE h.tenant_id = p_tenant_id
    AND h.project_id = p_project_id
    AND f.work_item_type = 'bug'
    AND h.from_status = 'done'
    AND h.to_status <> 'done';

  v_bug_reopen_rate := public.safe_pct(v_reopen_events, v_bug_done_events);

  IF v_dod_avg_pct IS NULL AND v_bug_reopen_rate IS NULL THEN
    v_flags := jsonb_set(v_flags, '{quality}', 'true'::jsonb, true);
    v_quality_pct := NULL;
  ELSIF v_dod_avg_pct IS NULL THEN
    v_quality_pct := ROUND(100 - v_bug_reopen_rate, 2);
  ELSIF v_bug_reopen_rate IS NULL THEN
    v_quality_pct := v_dod_avg_pct;
  ELSE
    v_quality_pct := ROUND((v_dod_avg_pct * 0.70) + ((100 - v_bug_reopen_rate) * 0.30), 2);
  END IF;

  -- Cronograma
  SELECT
    COUNT(*) FILTER (WHERE s.status = 'completed'),
    COUNT(*) FILTER (
      WHERE s.status = 'completed'
        AND s.completed_at IS NOT NULL
        AND s.completed_at::date <= s.end_date
    )
  INTO
    v_sprints_completed_total,
    v_sprints_on_time
  FROM public.sprints s
  WHERE s.tenant_id = p_tenant_id
    AND s.project_id = p_project_id;

  SELECT COUNT(*)
  INTO v_overdue_items
  FROM public.features f
  WHERE f.tenant_id = p_tenant_id
    AND f.project_id = p_project_id
    AND f.due_date IS NOT NULL
    AND f.due_date < CURRENT_DATE
    AND f.status <> 'done';

  v_schedule_pct := public.safe_pct(v_sprints_on_time, v_sprints_completed_total);

  IF v_schedule_pct IS NULL THEN
    v_flags := jsonb_set(v_flags, '{schedule}', 'true'::jsonb, true);
    v_schedule_adjusted_pct := NULL;
  ELSE
    v_schedule_adjusted_pct := public.clamp_numeric(v_schedule_pct - LEAST(v_overdue_items * 2, 30), 0, 100);
  END IF;

  -- Risco
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE r.status IN ('mitigated', 'resolved')),
    COUNT(*) FILTER (
      WHERE r.status NOT IN ('mitigated', 'resolved')
        AND COALESCE(r.gut_score, COALESCE(r.gut_g, 0) * COALESCE(r.gut_u, 0) * COALESCE(r.gut_t, 0)) >= 80
    )
  INTO
    v_risks_total,
    v_risks_mitigated,
    v_risks_critical_open
  FROM public.risks r
  WHERE r.tenant_id = p_tenant_id
    AND r.project_id = p_project_id;

  v_risk_pct := public.safe_pct(v_risks_mitigated, v_risks_total);

  IF v_risk_pct IS NULL THEN
    v_flags := jsonb_set(v_flags, '{risk}', 'true'::jsonb, true);
    v_risk_adjusted_pct := NULL;
  ELSE
    v_risk_adjusted_pct := public.clamp_numeric(v_risk_pct - LEAST(v_risks_critical_open * 5, 40), 0, 100);
  END IF;

  -- Capacidade
  WITH last_three AS (
    SELECT s.velocity_actual::numeric AS v
    FROM public.sprints s
    WHERE s.tenant_id = p_tenant_id
      AND s.project_id = p_project_id
      AND s.status = 'completed'
      AND s.velocity_actual IS NOT NULL
    ORDER BY COALESCE(s.completed_at, s.updated_at) DESC
    LIMIT 3
  )
  SELECT ROUND(AVG(v), 2)
  INTO v_velocity_avg_last3
  FROM last_three;

  SELECT s.velocity_target::numeric
  INTO v_velocity_target
  FROM public.sprints s
  WHERE s.tenant_id = p_tenant_id
    AND s.project_id = p_project_id
    AND s.status IN ('active', 'planned')
    AND s.velocity_target IS NOT NULL
  ORDER BY COALESCE(s.started_at, s.created_at) DESC
  LIMIT 1;

  IF v_velocity_avg_last3 IS NULL OR v_velocity_target IS NULL OR v_velocity_target = 0 THEN
    v_flags := jsonb_set(v_flags, '{capacity}', 'true'::jsonb, true);
    v_capacity_pct := NULL;
    v_velocity_trend := 'insufficient_data';
  ELSE
    v_capacity_pct := public.clamp_numeric(ROUND((v_velocity_avg_last3 / v_velocity_target) * 100, 2), 0, 130);
    IF v_velocity_avg_last3 >= (v_velocity_target * 1.05) THEN
      v_velocity_trend := 'improving';
    ELSIF v_velocity_avg_last3 <= (v_velocity_target * 0.95) THEN
      v_velocity_trend := 'declining';
    ELSE
      v_velocity_trend := 'stable';
    END IF;
  END IF;

  -- Score composto: usa apenas dimensoes com dado valido
  IF v_delivery_pct IS NOT NULL THEN
    v_valid_dimensions := v_valid_dimensions + 1;
    v_weight_sum := v_weight_sum + v_settings.weight_delivery;
  END IF;
  IF v_quality_pct IS NOT NULL THEN
    v_valid_dimensions := v_valid_dimensions + 1;
    v_weight_sum := v_weight_sum + v_settings.weight_quality;
  END IF;
  IF v_schedule_adjusted_pct IS NOT NULL THEN
    v_valid_dimensions := v_valid_dimensions + 1;
    v_weight_sum := v_weight_sum + v_settings.weight_schedule;
  END IF;
  IF v_risk_adjusted_pct IS NOT NULL THEN
    v_valid_dimensions := v_valid_dimensions + 1;
    v_weight_sum := v_weight_sum + v_settings.weight_risk;
  END IF;
  IF v_capacity_pct IS NOT NULL THEN
    v_valid_dimensions := v_valid_dimensions + 1;
    v_weight_sum := v_weight_sum + v_settings.weight_capacity;
  END IF;

  v_score_confidence := ROUND((v_valid_dimensions::numeric / 5.0) * 100.0, 2);

  IF v_valid_dimensions >= 3 AND v_weight_sum > 0 THEN
    v_progress_score := ROUND((
      (COALESCE(v_delivery_pct, 0) * CASE WHEN v_delivery_pct IS NULL THEN 0 ELSE v_settings.weight_delivery END) +
      (COALESCE(v_quality_pct, 0) * CASE WHEN v_quality_pct IS NULL THEN 0 ELSE v_settings.weight_quality END) +
      (COALESCE(v_schedule_adjusted_pct, 0) * CASE WHEN v_schedule_adjusted_pct IS NULL THEN 0 ELSE v_settings.weight_schedule END) +
      (COALESCE(v_risk_adjusted_pct, 0) * CASE WHEN v_risk_adjusted_pct IS NULL THEN 0 ELSE v_settings.weight_risk END) +
      (COALESCE(v_capacity_pct, 0) * CASE WHEN v_capacity_pct IS NULL THEN 0 ELSE v_settings.weight_capacity END)
    ) / v_weight_sum, 2);

    IF v_progress_score >= v_settings.healthy_min THEN
      v_progress_label := 'healthy';
    ELSIF v_progress_score >= v_settings.attention_min THEN
      v_progress_label := 'attention';
    ELSE
      v_progress_label := 'critical';
    END IF;
  ELSE
    v_progress_score := NULL;
    v_progress_label := 'insufficient_data';
  END IF;

  INSERT INTO public.project_progress_snapshots (
    tenant_id,
    project_id,
    trigger_event,
    features_total,
    features_done,
    bugs_total,
    bugs_resolved,
    delivery_feature_pct,
    delivery_bug_pct,
    delivery_pct,
    dod_avg_pct,
    bug_reopen_rate,
    quality_pct,
    sprints_completed_total,
    sprints_on_time,
    schedule_pct,
    overdue_items,
    schedule_adjusted_pct,
    risks_total,
    risks_mitigated,
    risks_critical_open,
    risk_pct,
    risk_adjusted_pct,
    velocity_avg_last3,
    velocity_target,
    velocity_trend,
    capacity_pct,
    score_confidence,
    insufficient_data_flags,
    progress_score,
    progress_label,
    created_by
  ) VALUES (
    p_tenant_id,
    p_project_id,
    COALESCE(p_trigger_event, 'manual'),
    v_features_total,
    v_features_done,
    v_bugs_total,
    v_bugs_resolved,
    v_delivery_feature_pct,
    v_delivery_bug_pct,
    v_delivery_pct,
    v_dod_avg_pct,
    v_bug_reopen_rate,
    v_quality_pct,
    v_sprints_completed_total,
    v_sprints_on_time,
    v_schedule_pct,
    v_overdue_items,
    v_schedule_adjusted_pct,
    v_risks_total,
    v_risks_mitigated,
    v_risks_critical_open,
    v_risk_pct,
    v_risk_adjusted_pct,
    v_velocity_avg_last3,
    v_velocity_target,
    v_velocity_trend,
    v_capacity_pct,
    v_score_confidence,
    v_flags,
    v_progress_score,
    v_progress_label,
    auth.uid()
  );

  UPDATE public.projects p
  SET progress = COALESCE(ROUND(v_progress_score), 0)::int,
      updated_at = now()
  WHERE p.id = p_project_id
    AND p.tenant_id = p_tenant_id;
END;
$$;

-- ------------------------------------------------------------
-- 6) TRIGGER: HISTORICO DE STATUS DE WORK ITEM
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.log_work_item_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.work_item_status_history (
      tenant_id, project_id, feature_id, from_status, to_status, changed_by
    ) VALUES (
      NEW.tenant_id, NEW.project_id, NEW.id, NULL, NEW.status, auth.uid()
    );
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.work_item_status_history (
      tenant_id, project_id, feature_id, from_status, to_status, changed_by
    ) VALUES (
      NEW.tenant_id, NEW.project_id, NEW.id, OLD.status, NEW.status, auth.uid()
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_work_item_status_change ON public.features;
CREATE TRIGGER trg_log_work_item_status_change
AFTER INSERT OR UPDATE OF status
ON public.features
FOR EACH ROW
EXECUTE FUNCTION public.log_work_item_status_change();

-- ------------------------------------------------------------
-- 7) TRIGGER: RECALCULO AUTOMATICO
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.recalculate_project_progress_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_project_id UUID;
  v_tenant_id UUID;
  v_event TEXT;
BEGIN
  v_project_id := COALESCE(NEW.project_id, OLD.project_id);
  v_tenant_id := COALESCE(NEW.tenant_id, OLD.tenant_id);

  IF v_project_id IS NULL OR v_tenant_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  v_event := TG_TABLE_NAME || '_' || lower(TG_OP);
  PERFORM public.calculate_project_progress(v_project_id, v_tenant_id, v_event);

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_progress_recalc_features ON public.features;
CREATE TRIGGER trg_progress_recalc_features
AFTER INSERT OR DELETE OR UPDATE OF status, due_date, work_item_type,
  dod_functional, dod_tests, dod_code_review, dod_documentation, dod_deployed, dod_user_acceptance
ON public.features
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_project_progress_trigger();

DROP TRIGGER IF EXISTS trg_progress_recalc_risks ON public.risks;
CREATE TRIGGER trg_progress_recalc_risks
AFTER INSERT OR DELETE OR UPDATE OF status, gut_g, gut_u, gut_t
ON public.risks
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_project_progress_trigger();

DROP TRIGGER IF EXISTS trg_progress_recalc_sprints ON public.sprints;
CREATE TRIGGER trg_progress_recalc_sprints
AFTER INSERT OR DELETE OR UPDATE OF status, completed_at, end_date, velocity_actual, velocity_target
ON public.sprints
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_project_progress_trigger();

-- ------------------------------------------------------------
-- 8) RLS E GRANTS
-- ------------------------------------------------------------

ALTER TABLE public.project_progress_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_item_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_progress_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_progress_settings_select ON public.project_progress_settings;
DROP POLICY IF EXISTS tenant_isolation_progress_settings_write ON public.project_progress_settings;
DROP POLICY IF EXISTS tenant_isolation_work_item_history_select ON public.work_item_status_history;
DROP POLICY IF EXISTS tenant_isolation_work_item_history_insert ON public.work_item_status_history;
DROP POLICY IF EXISTS tenant_isolation_progress_snapshots_select ON public.project_progress_snapshots;
DROP POLICY IF EXISTS tenant_isolation_progress_snapshots_insert ON public.project_progress_snapshots;

CREATE POLICY tenant_isolation_progress_settings_select
ON public.project_progress_settings
FOR SELECT TO authenticated
USING (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
);

CREATE POLICY tenant_isolation_progress_settings_write
ON public.project_progress_settings
FOR ALL TO authenticated
USING (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role = 'admin'
  )
)
WITH CHECK (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role = 'admin'
  )
);

CREATE POLICY tenant_isolation_work_item_history_select
ON public.work_item_status_history
FOR SELECT TO authenticated
USING (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
);

CREATE POLICY tenant_isolation_work_item_history_insert
ON public.work_item_status_history
FOR INSERT TO authenticated
WITH CHECK (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
);

CREATE POLICY tenant_isolation_progress_snapshots_select
ON public.project_progress_snapshots
FOR SELECT TO authenticated
USING (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
);

CREATE POLICY tenant_isolation_progress_snapshots_insert
ON public.project_progress_snapshots
FOR INSERT TO authenticated
WITH CHECK (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
);

REVOKE ALL ON TABLE public.project_progress_settings FROM authenticated;
REVOKE ALL ON TABLE public.work_item_status_history FROM authenticated;
REVOKE ALL ON TABLE public.project_progress_snapshots FROM authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.project_progress_settings TO authenticated;
GRANT SELECT, INSERT ON TABLE public.work_item_status_history TO authenticated;
GRANT SELECT, INSERT ON TABLE public.project_progress_snapshots TO authenticated;

-- ------------------------------------------------------------
-- 9) BACKFILL INICIAL
-- ------------------------------------------------------------

DO $$
DECLARE
  v_project RECORD;
BEGIN
  FOR v_project IN
    SELECT p.id, p.tenant_id
    FROM public.projects p
  LOOP
    PERFORM public.calculate_project_progress(v_project.id, v_project.tenant_id, 'backfill');
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE 'Migration 018 aplicada.';
  RAISE NOTICE ' - project_progress_settings criada';
  RAISE NOTICE ' - work_item_status_history criado';
  RAISE NOTICE ' - project_progress_snapshots criado';
  RAISE NOTICE ' - funcoes e triggers de calculo ativas';
  RAISE NOTICE ' - backfill inicial executado';
END $$;

