-- ============================================================
-- MIGRATION 010: SPRINT 6 - OPERACIONAL
-- ============================================================
-- Versão: 1.0
-- Data: 2026-02-07
-- Descrição: Daily Scrum Logger, Spike Tracking, Export (metadata)
-- Dependências: 009_sprint_5_backlog.sql
-- ============================================================

-- ============================================================
-- PARTE 1: DAILY SCRUM LOGGER (US-6.1)
-- ============================================================

-- Daily Scrum Logs
CREATE TABLE IF NOT EXISTS daily_scrum_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- As 3 perguntas do Daily
  what_did_yesterday TEXT NOT NULL,
  what_will_do_today TEXT NOT NULL,
  impediments TEXT[], -- Array de impedimentos

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(team_member_id, log_date) -- 1 log por pessoa por dia
);

-- Linking dailies com features (opcional mas útil)
CREATE TABLE IF NOT EXISTS daily_feature_mentions (
  daily_log_id UUID NOT NULL REFERENCES daily_scrum_logs(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  mention_type TEXT NOT NULL CHECK (mention_type IN ('yesterday', 'today')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (daily_log_id, feature_id, mention_type)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_daily_scrum_logs_project ON daily_scrum_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_daily_scrum_logs_sprint ON daily_scrum_logs(sprint_id);
CREATE INDEX IF NOT EXISTS idx_daily_scrum_logs_member ON daily_scrum_logs(team_member_id);
CREATE INDEX IF NOT EXISTS idx_daily_scrum_logs_date ON daily_scrum_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_feature_mentions_daily ON daily_feature_mentions(daily_log_id);
CREATE INDEX IF NOT EXISTS idx_daily_feature_mentions_feature ON daily_feature_mentions(feature_id);

-- RLS Policies - Daily Logs
ALTER TABLE daily_scrum_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view dailies of their projects" ON daily_scrum_logs;
DROP POLICY IF EXISTS "Users can manage their own dailies" ON daily_scrum_logs;
CREATE POLICY "Authenticated users can manage daily logs" ON daily_scrum_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies - Feature Mentions
ALTER TABLE daily_feature_mentions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view mentions of their projects" ON daily_feature_mentions;
DROP POLICY IF EXISTS "Users can manage their own mentions" ON daily_feature_mentions;
CREATE POLICY "Authenticated users can manage daily mentions" ON daily_feature_mentions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- View: Daily summary por sprint
CREATE OR REPLACE VIEW daily_scrum_summary AS
SELECT
  dsl.sprint_id,
  dsl.log_date,
  s.project_id,
  COUNT(DISTINCT dsl.team_member_id) as members_logged,
  (SELECT COUNT(*) FROM team_members WHERE tenant_id = (
    SELECT tenant_id FROM projects WHERE id = s.project_id
  )) as total_members,
  ROUND((COUNT(DISTINCT dsl.team_member_id)::float /
         NULLIF((SELECT COUNT(*) FROM team_members WHERE tenant_id = (
           SELECT tenant_id FROM projects WHERE id = s.project_id
         )), 0) * 100)::numeric, 2) as participation_rate,
  COUNT(dsl.id) FILTER (WHERE cardinality(dsl.impediments) > 0) as members_with_blockers,
  (
    SELECT array_agg(DISTINCT imp)
    FROM daily_scrum_logs dsl2
    CROSS JOIN LATERAL unnest(dsl2.impediments) AS imp
    WHERE dsl2.sprint_id = dsl.sprint_id
      AND dsl2.log_date = dsl.log_date
      AND cardinality(dsl2.impediments) > 0
  ) as all_impediments
FROM daily_scrum_logs dsl
JOIN sprints s ON dsl.sprint_id = s.id
GROUP BY dsl.sprint_id, dsl.log_date, s.project_id;

-- Função: Get latest daily for team member
CREATE OR REPLACE FUNCTION get_latest_daily(p_team_member_id UUID, p_project_id UUID)
RETURNS TABLE (
  what_did_yesterday TEXT,
  what_will_do_today TEXT,
  impediments TEXT[],
  log_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dsl.what_did_yesterday,
    dsl.what_will_do_today,
    dsl.impediments,
    dsl.log_date
  FROM daily_scrum_logs dsl
  WHERE dsl.team_member_id = p_team_member_id
    AND dsl.project_id = p_project_id
  ORDER BY dsl.log_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PARTE 2: SPIKE TRACKING (US-6.2)
-- ============================================================

-- Adicionar campos spike ao features
ALTER TABLE features ADD COLUMN IF NOT EXISTS is_spike BOOLEAN DEFAULT false;
ALTER TABLE features ADD COLUMN IF NOT EXISTS spike_timebox_hours INT;
ALTER TABLE features ADD COLUMN IF NOT EXISTS spike_outcome TEXT;
ALTER TABLE features ADD COLUMN IF NOT EXISTS spike_converted_to_story_id UUID REFERENCES features(id);

-- Índice para spikes
CREATE INDEX IF NOT EXISTS idx_features_spike ON features(project_id) WHERE is_spike = true;

-- View: Spike summary por sprint
CREATE OR REPLACE VIEW spike_summary AS
SELECT
  s.id as sprint_id,
  s.project_id,
  COUNT(DISTINCT f.id) FILTER (WHERE f.is_spike) as total_spikes,
  COUNT(DISTINCT f.id) FILTER (WHERE f.is_spike AND f.status = 'done') as spikes_done,
  COALESCE(SUM(f.spike_timebox_hours) FILTER (WHERE f.is_spike), 0) as total_timebox_hours,
  COUNT(DISTINCT f.id) FILTER (WHERE f.is_spike AND f.spike_outcome IS NOT NULL) as spikes_with_outcomes,
  COUNT(DISTINCT f.spike_converted_to_story_id) FILTER (WHERE f.is_spike) as spikes_converted,
  ROUND((COUNT(DISTINCT f.id) FILTER (WHERE f.is_spike AND f.status = 'done')::float /
         NULLIF(COUNT(DISTINCT f.id) FILTER (WHERE f.is_spike), 0) * 100)::numeric, 2) as spike_completion_rate
FROM sprints s
LEFT JOIN sprint_features sf ON s.id = sf.sprint_id
LEFT JOIN features f ON sf.feature_id = f.id
GROUP BY s.id, s.project_id;

-- IMPORTANTE: Atualizar sprint_velocity para EXCLUIR spikes
-- (Drop e recriar a materialized view para incluir nova lógica)

DROP MATERIALIZED VIEW IF EXISTS sprint_velocity CASCADE;

CREATE MATERIALIZED VIEW sprint_velocity AS
SELECT
  s.id as sprint_id,
  s.project_id,
  s.name as sprint_name,
  s.start_date,
  s.end_date,
  s.goal,

  -- Contar features (EXCLUINDO SPIKES)
  COUNT(DISTINCT f.id) FILTER (WHERE f.status = 'done' AND (f.is_spike IS NULL OR f.is_spike = false)) as features_done,
  COUNT(DISTINCT f.id) FILTER (WHERE (f.is_spike IS NULL OR f.is_spike = false)) as total_features,

  -- Velocity (EXCLUINDO SPIKES)
  COALESCE(SUM(f.story_points) FILTER (WHERE f.status = 'done' AND (f.is_spike IS NULL OR f.is_spike = false)), 0) as velocity,
  COALESCE(SUM(f.story_points) FILTER (WHERE (f.is_spike IS NULL OR f.is_spike = false)), 0) as total_committed_points,

  -- Completion rate (EXCLUINDO SPIKES)
  ROUND((COALESCE(SUM(f.story_points) FILTER (WHERE f.status = 'done' AND (f.is_spike IS NULL OR f.is_spike = false)), 0)::float /
         NULLIF(SUM(f.story_points) FILTER (WHERE (f.is_spike IS NULL OR f.is_spike = false)), 0) * 100)::numeric, 2) as completion_rate,

  -- Carry-over (EXCLUINDO SPIKES)
  COUNT(DISTINCT f.id) FILTER (WHERE f.status != 'done' AND (f.is_spike IS NULL OR f.is_spike = false)) as carry_over_count,
  COALESCE(SUM(f.story_points) FILTER (WHERE f.status != 'done' AND (f.is_spike IS NULL OR f.is_spike = false)), 0) as carry_over_points
FROM sprints s
LEFT JOIN sprint_features sf ON s.id = sf.sprint_id
LEFT JOIN features f ON sf.feature_id = f.id
GROUP BY s.id, s.project_id, s.name, s.start_date, s.end_date, s.goal;

-- Índice na materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_sprint_velocity_sprint_id ON sprint_velocity(sprint_id);
CREATE INDEX IF NOT EXISTS idx_sprint_velocity_project ON sprint_velocity(project_id);

-- Refresh materialized view
REFRESH MATERIALIZED VIEW sprint_velocity;

-- Função: Convert spike to story
CREATE OR REPLACE FUNCTION convert_spike_to_story(p_spike_id UUID, p_new_story_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Update spike para referenciar nova história
  UPDATE features
  SET spike_converted_to_story_id = p_new_story_id,
      status = 'archived'
  WHERE id = p_spike_id;

  -- Opcional: copiar tags e outros metadados para nova história
  UPDATE features
  SET tags = (SELECT tags FROM features WHERE id = p_spike_id),
      priority = (SELECT priority FROM features WHERE id = p_spike_id)
  WHERE id = p_new_story_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PARTE 3: EXPORT METADATA (US-6.3)
-- ============================================================

-- Tabela para rastrear exports (opcional, para histórico)
CREATE TABLE IF NOT EXISTS export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  exported_by UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  export_format TEXT NOT NULL CHECK (export_format IN ('pdf', 'excel', 'json', 'csv')),
  export_sections JSONB, -- Quais seções foram incluídas
  file_size_bytes BIGINT,
  exported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_export_history_project ON export_history(project_id);
CREATE INDEX IF NOT EXISTS idx_export_history_date ON export_history(exported_at DESC);

-- RLS Policies
ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view export history of their projects" ON export_history;
DROP POLICY IF EXISTS "Users can create export history" ON export_history;
CREATE POLICY "Authenticated users can manage export history" ON export_history
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- View: Export summary por projeto
CREATE OR REPLACE VIEW export_summary AS
SELECT
  project_id,
  COUNT(*) as total_exports,
  COUNT(*) FILTER (WHERE export_format = 'pdf') as pdf_exports,
  COUNT(*) FILTER (WHERE export_format = 'excel') as excel_exports,
  COUNT(*) FILTER (WHERE export_format = 'json') as json_exports,
  MAX(exported_at) as last_export_date
FROM export_history
GROUP BY project_id;

-- ============================================================
-- PARTE 4: HELPER FUNCTIONS
-- ============================================================

-- Função: Check if team member logged daily today
CREATE OR REPLACE FUNCTION has_logged_daily_today(p_team_member_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM daily_scrum_logs
    WHERE team_member_id = p_team_member_id
      AND log_date = CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql;

-- Função: Get sprint impediments from dailies
CREATE OR REPLACE FUNCTION get_sprint_impediments(p_sprint_id UUID)
RETURNS TABLE (
  impediment TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    unnest(dsl.impediments) as impediment,
    COUNT(*) as count
  FROM daily_scrum_logs dsl
  WHERE dsl.sprint_id = p_sprint_id
    AND cardinality(dsl.impediments) > 0
  GROUP BY unnest(dsl.impediments)
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Função: Get spike metrics for project
CREATE OR REPLACE FUNCTION get_spike_metrics(p_project_id UUID)
RETURNS TABLE (
  total_spikes INT,
  total_timebox_hours INT,
  completed_spikes INT,
  converted_spikes INT,
  avg_timebox FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INT as total_spikes,
    COALESCE(SUM(spike_timebox_hours), 0)::INT as total_timebox_hours,
    COUNT(*) FILTER (WHERE status = 'done')::INT as completed_spikes,
    COUNT(*) FILTER (WHERE spike_converted_to_story_id IS NOT NULL)::INT as converted_spikes,
    AVG(spike_timebox_hours) as avg_timebox
  FROM features
  WHERE project_id = p_project_id
    AND is_spike = true;
END;
$$ LANGUAGE plpgsql;

-- Função: Record export (helper para API)
CREATE OR REPLACE FUNCTION record_export(
  p_project_id UUID,
  p_exported_by UUID,
  p_format TEXT,
  p_sections JSONB,
  p_file_size BIGINT
)
RETURNS UUID AS $$
DECLARE
  v_export_id UUID;
BEGIN
  INSERT INTO export_history (project_id, exported_by, export_format, export_sections, file_size_bytes)
  VALUES (p_project_id, p_exported_by, p_format, p_sections, p_file_size)
  RETURNING id INTO v_export_id;

  RETURN v_export_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PARTE 5: TRIGGERS
-- ============================================================

-- Trigger: Auto-update updated_at em daily_scrum_logs
CREATE OR REPLACE FUNCTION update_daily_log_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_daily_log_timestamp ON daily_scrum_logs;
CREATE TRIGGER trigger_update_daily_log_timestamp
BEFORE UPDATE ON daily_scrum_logs
FOR EACH ROW
EXECUTE FUNCTION update_daily_log_timestamp();

-- Trigger: Refresh sprint_velocity quando spike é marcado
CREATE OR REPLACE FUNCTION refresh_velocity_on_spike_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Apenas se mudou o campo is_spike
  IF (OLD.is_spike IS DISTINCT FROM NEW.is_spike) THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY sprint_velocity;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_refresh_velocity_spike ON features;
CREATE TRIGGER trigger_refresh_velocity_spike
AFTER UPDATE ON features
FOR EACH ROW
EXECUTE FUNCTION refresh_velocity_on_spike_change();

-- ============================================================
-- PARTE 6: VERIFICAÇÕES PÓS-MIGRATION
-- ============================================================

-- Verificar que tabelas foram criadas
DO $$
DECLARE
  v_tables TEXT[] := ARRAY[
    'daily_scrum_logs',
    'daily_feature_mentions',
    'export_history'
  ];
  v_table TEXT;
  v_count INT;
BEGIN
  FOREACH v_table IN ARRAY v_tables
  LOOP
    SELECT COUNT(*) INTO v_count
    FROM information_schema.tables
    WHERE table_name = v_table;

    IF v_count = 0 THEN
      RAISE EXCEPTION 'Tabela % não foi criada!', v_table;
    END IF;
  END LOOP;

  RAISE NOTICE '✅ Todas as tabelas do Sprint 6 foram criadas com sucesso!';
END $$;

-- Verificar views
DO $$
DECLARE
  v_views TEXT[] := ARRAY[
    'daily_scrum_summary',
    'spike_summary',
    'export_summary'
  ];
  v_view TEXT;
  v_count INT;
BEGIN
  FOREACH v_view IN ARRAY v_views
  LOOP
    SELECT COUNT(*) INTO v_count
    FROM information_schema.views
    WHERE table_name = v_view;

    IF v_count = 0 THEN
      RAISE EXCEPTION 'View % não foi criada!', v_view;
    END IF;
  END LOOP;

  RAISE NOTICE '✅ Todas as views do Sprint 6 foram criadas com sucesso!';
END $$;

-- Verificar materialized view foi recriada
DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM pg_matviews
  WHERE matviewname = 'sprint_velocity';

  IF v_count = 0 THEN
    RAISE EXCEPTION 'Materialized view sprint_velocity não foi recriada!';
  END IF;

  RAISE NOTICE '✅ Materialized view sprint_velocity recriada com exclusão de spikes!';
END $$;

-- Verificar funções
DO $$
DECLARE
  v_functions TEXT[] := ARRAY[
    'get_latest_daily',
    'convert_spike_to_story',
    'has_logged_daily_today',
    'get_sprint_impediments',
    'get_spike_metrics',
    'record_export',
    'update_daily_log_timestamp',
    'refresh_velocity_on_spike_change'
  ];
  v_function TEXT;
  v_count INT;
BEGIN
  FOREACH v_function IN ARRAY v_functions
  LOOP
    SELECT COUNT(*) INTO v_count
    FROM pg_proc
    WHERE proname = v_function;

    IF v_count = 0 THEN
      RAISE EXCEPTION 'Função % não foi criada!', v_function;
    END IF;
  END LOOP;

  RAISE NOTICE '✅ Todas as funções do Sprint 6 foram criadas com sucesso!';
END $$;

-- Verificar campos spike adicionados
DO $$
DECLARE
  v_columns TEXT[] := ARRAY[
    'is_spike',
    'spike_timebox_hours',
    'spike_outcome',
    'spike_converted_to_story_id'
  ];
  v_column TEXT;
  v_count INT;
BEGIN
  FOREACH v_column IN ARRAY v_columns
  LOOP
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns
    WHERE table_name = 'features'
      AND column_name = v_column;

    IF v_count = 0 THEN
      RAISE EXCEPTION 'Coluna % não foi adicionada à tabela features!', v_column;
    END IF;
  END LOOP;

  RAISE NOTICE '✅ Todos os campos spike foram adicionados à tabela features!';
END $$;

-- ============================================================
-- SUCESSO!
-- ============================================================

-- ============================================================
-- GRANTS
-- ============================================================

GRANT ALL ON daily_scrum_logs TO authenticated;
GRANT ALL ON daily_feature_mentions TO authenticated;
GRANT ALL ON export_history TO authenticated;
GRANT SELECT ON daily_scrum_summary TO authenticated;
GRANT SELECT ON spike_summary TO authenticated;
GRANT SELECT ON export_summary TO authenticated;
GRANT SELECT ON sprint_velocity TO authenticated;

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║     ✅ MIGRATION 010 COMPLETA!                            ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║     Sprint 6 - Operacional                                 ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║     Recursos criados:                                      ║';
  RAISE NOTICE '║     • 3 tabelas (daily, mentions, export_history)          ║';
  RAISE NOTICE '║     • 4 campos spike adicionados ao features               ║';
  RAISE NOTICE '║     • 3 views (daily, spike, export summaries)             ║';
  RAISE NOTICE '║     • 1 materialized view atualizada (velocity)            ║';
  RAISE NOTICE '║     • 8 funções (daily, spike, export helpers)             ║';
  RAISE NOTICE '║     • 2 triggers (timestamp, velocity refresh)             ║';
  RAISE NOTICE '║     • Índices e RLS policies                               ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║     🎉 TODOS OS SPRINTS (3-6) COMPLETOS!                   ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '📚 Próximos passos:';
  RAISE NOTICE '   1. Começar implementação do Sprint 3';
  RAISE NOTICE '   2. Ler QUICK_START_GUIDE.md';
  RAISE NOTICE '   3. Implementar US-3.1 (Velocity Tracking)';
  RAISE NOTICE '';
END $$;
