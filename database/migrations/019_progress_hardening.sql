-- ============================================================
-- MIGRATION 019: PROGRESS HARDENING
-- ============================================================
-- Objetivo:
-- 1) Parametrizar threshold de risco critico.
-- 2) Adicionar janela de dedupe de snapshots para evitar write storm.
-- 3) Garantir governanca de updated_at em project_progress_settings.
-- Dependencia: 018_project_progress_tracking.sql
-- ============================================================

-- ------------------------------------------------------------
-- 1) SETTINGS: NOVOS CAMPOS DE GOVERNANCA
-- ------------------------------------------------------------

ALTER TABLE public.project_progress_settings
  ADD COLUMN IF NOT EXISTS risk_critical_threshold INTEGER NOT NULL DEFAULT 80
    CHECK (risk_critical_threshold >= 1 AND risk_critical_threshold <= 125);

ALTER TABLE public.project_progress_settings
  ADD COLUMN IF NOT EXISTS snapshot_cooldown_seconds INTEGER NOT NULL DEFAULT 45
    CHECK (snapshot_cooldown_seconds >= 0 AND snapshot_cooldown_seconds <= 600);

COMMENT ON COLUMN public.project_progress_settings.risk_critical_threshold IS
  'Limiar GUT para risco critico no calculo de progresso';

COMMENT ON COLUMN public.project_progress_settings.snapshot_cooldown_seconds IS
  'Janela minima entre snapshots do mesmo projeto/evento para dedupe anti write storm';

-- ------------------------------------------------------------
-- 2) TRIGGER DE updated_at PARA SETTINGS
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_project_progress_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_project_progress_settings_updated_at ON public.project_progress_settings;
CREATE TRIGGER trg_project_progress_settings_updated_at
BEFORE UPDATE
ON public.project_progress_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_project_progress_settings_updated_at();

-- ------------------------------------------------------------
-- 3) CALCULO DE PROGRESSO: THRESHOLD PARAMETRICO + DEDUPE
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
  v_event TEXT := COALESCE(p_trigger_event, 'manual');
  v_last_snapshot_at TIMESTAMPTZ;
  v_risk_critical_threshold INTEGER := 80;
  v_snapshot_cooldown_seconds INTEGER := 45;
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

  v_risk_critical_threshold := COALESCE(v_settings.risk_critical_threshold, 80);
  v_snapshot_cooldown_seconds := COALESCE(v_settings.snapshot_cooldown_seconds, 45);

  -- Dedupe: evita snapshot repetido em janela curta para eventos automaticos.
  IF v_snapshot_cooldown_seconds > 0 AND v_event NOT LIKE 'manual%' THEN
    SELECT s.snapshot_at
    INTO v_last_snapshot_at
    FROM public.project_progress_snapshots s
    WHERE s.tenant_id = p_tenant_id
      AND s.project_id = p_project_id
      AND s.trigger_event = v_event
    ORDER BY s.snapshot_at DESC
    LIMIT 1;

    IF v_last_snapshot_at IS NOT NULL
      AND v_last_snapshot_at >= now() - make_interval(secs => v_snapshot_cooldown_seconds) THEN
      RETURN;
    END IF;
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
        AND COALESCE(r.gut_score, COALESCE(r.gut_g, 0) * COALESCE(r.gut_u, 0) * COALESCE(r.gut_t, 0)) >= v_risk_critical_threshold
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
    v_event,
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

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE 'Migration 019 aplicada.';
  RAISE NOTICE ' - threshold de risco critico parametrizado';
  RAISE NOTICE ' - dedupe de snapshots por cooldown ativado';
  RAISE NOTICE ' - trigger de updated_at em progress_settings criado';
END $$;
