-- =====================================================
-- MIGRATION 008: Sprint 3 - Métricas e Visualização
-- =====================================================
-- Criado: 2026-02-07
-- Descrição: Adiciona suporte para Velocity, Burndown, Forecast e Health
-- Referência: IMPLEMENTATION_ROADMAP.md - Sprint 3
-- =====================================================

BEGIN;

-- =====================================================
-- 1. VELOCITY TRACKING
-- =====================================================

-- Materialized View para performance de velocity
CREATE MATERIALIZED VIEW sprint_velocity AS
SELECT
  s.id as sprint_id,
  s.project_id,
  s.name as sprint_name,
  s.start_date,
  s.end_date,
  s.status,
  s.duration_weeks,

  -- Métricas de features
  COUNT(DISTINCT f.id) as total_features,
  COUNT(DISTINCT f.id) FILTER (WHERE f.status = 'done') as features_done,
  COUNT(DISTINCT f.id) FILTER (WHERE f.status IN ('in_progress', 'review', 'testing')) as features_in_progress,
  COUNT(DISTINCT f.id) FILTER (WHERE f.status = 'todo') as features_todo,

  -- Métricas de pontos
  COALESCE(SUM(f.story_points), 0) as committed_points,
  COALESCE(SUM(f.story_points) FILTER (WHERE f.status = 'done'), 0) as velocity,

  -- Taxa de conclusão
  ROUND(
    (COALESCE(SUM(f.story_points) FILTER (WHERE f.status = 'done'), 0)::float /
     NULLIF(SUM(f.story_points), 0) * 100)::numeric,
    2
  ) as completion_rate,

  -- DoD médio
  ROUND(
    AVG(f.dod_progress) FILTER (WHERE f.status = 'done'),
    2
  ) as avg_dod_compliance,

  -- Timestamps
  NOW() as last_refreshed
FROM sprints s
LEFT JOIN sprint_features sf ON s.id = sf.sprint_id
LEFT JOIN features f ON sf.feature_id = f.id
WHERE s.tenant_id = current_setting('app.current_tenant_id', true)::uuid
GROUP BY s.id, s.project_id, s.name, s.start_date, s.end_date, s.status, s.duration_weeks;

-- Índices para performance
CREATE UNIQUE INDEX idx_sprint_velocity_pk ON sprint_velocity(sprint_id);
CREATE INDEX idx_sprint_velocity_project ON sprint_velocity(project_id, start_date DESC);
CREATE INDEX idx_sprint_velocity_status ON sprint_velocity(status) WHERE status IN ('active', 'completed');

-- Trigger para refresh automático
CREATE OR REPLACE FUNCTION refresh_sprint_velocity()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY sprint_velocity;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers em múltiplas tabelas
CREATE TRIGGER trigger_refresh_velocity_features
AFTER INSERT OR UPDATE OR DELETE ON features
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_sprint_velocity();

CREATE TRIGGER trigger_refresh_velocity_sprint_features
AFTER INSERT OR UPDATE OR DELETE ON sprint_features
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_sprint_velocity();

CREATE TRIGGER trigger_refresh_velocity_sprints
AFTER UPDATE ON sprints
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_sprint_velocity();

-- =====================================================
-- 2. BURNDOWN TRACKING
-- =====================================================

-- Tabela para snapshots diários do burndown
CREATE TABLE sprint_burndown_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,

  -- Data do snapshot
  snapshot_date DATE NOT NULL,

  -- Métricas de pontos
  points_total INT NOT NULL DEFAULT 0,
  points_done INT NOT NULL DEFAULT 0,
  points_remaining INT NOT NULL DEFAULT 0,

  -- Métricas de features
  features_total INT NOT NULL DEFAULT 0,
  features_done INT NOT NULL DEFAULT 0,
  features_remaining INT NOT NULL DEFAULT 0,

  -- Métricas calculadas
  completion_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN points_total > 0 THEN ROUND((points_done::decimal / points_total * 100), 2)
      ELSE 0
    END
  ) STORED,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(sprint_id, snapshot_date),
  CHECK (points_done <= points_total),
  CHECK (points_remaining >= 0),
  CHECK (features_done <= features_total)
);

-- Índices
CREATE INDEX idx_burndown_sprint ON sprint_burndown_snapshots(sprint_id, snapshot_date DESC);
CREATE INDEX idx_burndown_tenant ON sprint_burndown_snapshots(tenant_id);
CREATE INDEX idx_burndown_date ON sprint_burndown_snapshots(snapshot_date DESC);

-- RLS
ALTER TABLE sprint_burndown_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant burndown" ON sprint_burndown_snapshots
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY "Users can insert own tenant burndown" ON sprint_burndown_snapshots
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- Função para gerar snapshot diário
CREATE OR REPLACE FUNCTION generate_daily_burndown_snapshot(p_sprint_id UUID)
RETURNS VOID AS $$
DECLARE
  v_tenant_id UUID;
  v_points_total INT;
  v_points_done INT;
  v_features_total INT;
  v_features_done INT;
BEGIN
  -- Buscar tenant_id do sprint
  SELECT tenant_id INTO v_tenant_id
  FROM sprints
  WHERE id = p_sprint_id;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Sprint não encontrado: %', p_sprint_id;
  END IF;

  -- Calcular métricas
  SELECT
    COALESCE(SUM(f.story_points), 0),
    COALESCE(SUM(f.story_points) FILTER (WHERE f.status = 'done'), 0),
    COUNT(DISTINCT f.id),
    COUNT(DISTINCT f.id) FILTER (WHERE f.status = 'done')
  INTO
    v_points_total,
    v_points_done,
    v_features_total,
    v_features_done
  FROM sprint_features sf
  JOIN features f ON sf.feature_id = f.id
  WHERE sf.sprint_id = p_sprint_id;

  -- Inserir ou atualizar snapshot
  INSERT INTO sprint_burndown_snapshots (
    tenant_id,
    sprint_id,
    snapshot_date,
    points_total,
    points_done,
    points_remaining,
    features_total,
    features_done,
    features_remaining
  )
  VALUES (
    v_tenant_id,
    p_sprint_id,
    CURRENT_DATE,
    v_points_total,
    v_points_done,
    v_points_total - v_points_done,
    v_features_total,
    v_features_done,
    v_features_total - v_features_done
  )
  ON CONFLICT (sprint_id, snapshot_date)
  DO UPDATE SET
    points_total = EXCLUDED.points_total,
    points_done = EXCLUDED.points_done,
    points_remaining = EXCLUDED.points_remaining,
    features_total = EXCLUDED.features_total,
    features_done = EXCLUDED.features_done,
    features_remaining = EXCLUDED.features_remaining;

  RAISE NOTICE 'Snapshot criado para sprint % em %', p_sprint_id, CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar snapshots de todos os sprints ativos
CREATE OR REPLACE FUNCTION generate_all_active_burndown_snapshots()
RETURNS TABLE(sprint_id UUID, sprint_name TEXT, status TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    'snapshot_created'::TEXT
  FROM sprints s
  WHERE s.status = 'active'
    AND s.tenant_id = current_setting('app.current_tenant_id', true)::uuid;

  -- Gerar snapshot para cada sprint ativo
  PERFORM generate_daily_burndown_snapshot(s.id)
  FROM sprints s
  WHERE s.status = 'active'
    AND s.tenant_id = current_setting('app.current_tenant_id', true)::uuid;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. SCRUM HEALTH METRICS
-- =====================================================

-- View para métricas de saúde do Scrum
CREATE VIEW scrum_health_metrics AS
WITH
  -- 1. Consistência de duração dos sprints
  sprint_consistency AS (
    SELECT
      project_id,
      COUNT(DISTINCT duration_weeks) as duration_variations,
      CASE WHEN COUNT(DISTINCT duration_weeks) = 1 THEN 'healthy' ELSE 'critical' END as status
    FROM sprints
    WHERE status IN ('completed', 'active')
      AND tenant_id = current_setting('app.current_tenant_id', true)::uuid
    GROUP BY project_id
  ),

  -- 2. Taxa de carry-over
  carry_over_rate AS (
    SELECT
      s.project_id,
      COUNT(DISTINCT f.id) as total_features,
      COUNT(DISTINCT f.id) FILTER (WHERE f.status != 'done') as carried_features,
      ROUND(
        (COUNT(DISTINCT f.id) FILTER (WHERE f.status != 'done')::float /
         NULLIF(COUNT(DISTINCT f.id), 0) * 100)::numeric,
        2
      ) as carry_over_percentage,
      CASE
        WHEN COUNT(DISTINCT f.id) FILTER (WHERE f.status != 'done')::float / NULLIF(COUNT(DISTINCT f.id), 0) > 0.30 THEN 'critical'
        WHEN COUNT(DISTINCT f.id) FILTER (WHERE f.status != 'done')::float / NULLIF(COUNT(DISTINCT f.id), 0) > 0.15 THEN 'warning'
        ELSE 'healthy'
      END as status
    FROM sprints s
    JOIN sprint_features sf ON s.id = sf.sprint_id
    JOIN features f ON sf.feature_id = f.id
    WHERE s.status = 'completed'
      AND s.tenant_id = current_setting('app.current_tenant_id', true)::uuid
    GROUP BY s.project_id
  ),

  -- 3. Taxa de compliance do DoD
  dod_compliance AS (
    SELECT
      project_id,
      ROUND(AVG(dod_progress) FILTER (WHERE status = 'done'), 2) as avg_dod_compliance,
      CASE
        WHEN AVG(dod_progress) FILTER (WHERE status = 'done') < 85 THEN 'critical'
        WHEN AVG(dod_progress) FILTER (WHERE status = 'done') < 95 THEN 'warning'
        ELSE 'healthy'
      END as status
    FROM features
    WHERE tenant_id = current_setting('app.current_tenant_id', true)::uuid
    GROUP BY project_id
  ),

  -- 4. Velocidade estável (coeficiente de variação)
  velocity_stability AS (
    SELECT
      project_id,
      STDDEV(velocity) / NULLIF(AVG(velocity), 0) as coefficient_of_variation,
      CASE
        WHEN STDDEV(velocity) / NULLIF(AVG(velocity), 0) > 0.30 THEN 'warning'
        WHEN STDDEV(velocity) / NULLIF(AVG(velocity), 0) > 0.20 THEN 'healthy'
        ELSE 'excellent'
      END as status
    FROM sprint_velocity
    WHERE status = 'completed'
    GROUP BY project_id
  )

SELECT
  p.id as project_id,
  p.name as project_name,

  -- Smells individuais
  COALESCE(sc.status, 'unknown') as sprint_consistency_status,
  COALESCE(sc.duration_variations, 0) as duration_variations,

  COALESCE(co.status, 'unknown') as carry_over_status,
  COALESCE(co.carry_over_percentage, 0) as carry_over_percentage,

  COALESCE(dod.status, 'unknown') as dod_compliance_status,
  COALESCE(dod.avg_dod_compliance, 0) as avg_dod_compliance,

  COALESCE(vs.status, 'unknown') as velocity_stability_status,
  COALESCE(vs.coefficient_of_variation, 0) as velocity_cv,

  -- Score geral (0-100)
  (
    CASE WHEN COALESCE(sc.status, 'unknown') = 'healthy' THEN 25 ELSE 0 END +
    CASE
      WHEN COALESCE(co.status, 'unknown') = 'healthy' THEN 25
      WHEN COALESCE(co.status, 'unknown') = 'warning' THEN 15
      ELSE 0
    END +
    CASE
      WHEN COALESCE(dod.status, 'unknown') = 'healthy' THEN 25
      WHEN COALESCE(dod.status, 'unknown') = 'warning' THEN 15
      ELSE 0
    END +
    CASE
      WHEN COALESCE(vs.status, 'unknown') = 'excellent' THEN 25
      WHEN COALESCE(vs.status, 'unknown') = 'healthy' THEN 20
      WHEN COALESCE(vs.status, 'unknown') = 'warning' THEN 10
      ELSE 0
    END
  ) as overall_health_score,

  -- Status geral
  CASE
    WHEN (
      CASE WHEN COALESCE(sc.status, 'unknown') = 'healthy' THEN 25 ELSE 0 END +
      CASE WHEN COALESCE(co.status, 'unknown') = 'healthy' THEN 25 WHEN COALESCE(co.status, 'unknown') = 'warning' THEN 15 ELSE 0 END +
      CASE WHEN COALESCE(dod.status, 'unknown') = 'healthy' THEN 25 WHEN COALESCE(dod.status, 'unknown') = 'warning' THEN 15 ELSE 0 END +
      CASE WHEN COALESCE(vs.status, 'unknown') = 'excellent' THEN 25 WHEN COALESCE(vs.status, 'unknown') = 'healthy' THEN 20 WHEN COALESCE(vs.status, 'unknown') = 'warning' THEN 10 ELSE 0 END
    ) >= 80 THEN 'healthy'
    WHEN (
      CASE WHEN COALESCE(sc.status, 'unknown') = 'healthy' THEN 25 ELSE 0 END +
      CASE WHEN COALESCE(co.status, 'unknown') = 'healthy' THEN 25 WHEN COALESCE(co.status, 'unknown') = 'warning' THEN 15 ELSE 0 END +
      CASE WHEN COALESCE(dod.status, 'unknown') = 'healthy' THEN 25 WHEN COALESCE(dod.status, 'unknown') = 'warning' THEN 15 ELSE 0 END +
      CASE WHEN COALESCE(vs.status, 'unknown') = 'excellent' THEN 25 WHEN COALESCE(vs.status, 'unknown') = 'healthy' THEN 20 WHEN COALESCE(vs.status, 'unknown') = 'warning' THEN 10 ELSE 0 END
    ) >= 60 THEN 'warning'
    ELSE 'critical'
  END as overall_status

FROM projects p
LEFT JOIN sprint_consistency sc ON p.id = sc.project_id
LEFT JOIN carry_over_rate co ON p.id = co.project_id
LEFT JOIN dod_compliance dod ON p.id = dod.project_id
LEFT JOIN velocity_stability vs ON p.id = vs.project_id
WHERE p.tenant_id = current_setting('app.current_tenant_id', true)::uuid;

-- =====================================================
-- 4. BASELINE METRICS
-- =====================================================

-- Tabela para armazenar métricas baseline e tracking
CREATE TABLE baseline_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Nome da métrica
  metric_name TEXT NOT NULL,
  metric_category TEXT NOT NULL CHECK (metric_category IN ('velocity', 'quality', 'process', 'business')),

  -- Valores
  baseline_value DECIMAL(10,2),
  target_value DECIMAL(10,2),
  current_value DECIMAL(10,2),

  -- Unidade (pts, %, dias, etc)
  unit TEXT NOT NULL DEFAULT 'number',

  -- Status
  status TEXT GENERATED ALWAYS AS (
    CASE
      WHEN current_value >= target_value THEN 'achieved'
      WHEN current_value >= baseline_value + (target_value - baseline_value) * 0.5 THEN 'on_track'
      ELSE 'behind'
    END
  ) STORED,

  -- Datas
  baseline_date DATE NOT NULL,
  target_date DATE,
  last_measured_date DATE,

  -- Metadados
  description TEXT,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id, metric_name)
);

-- Índices
CREATE INDEX idx_baseline_project ON baseline_metrics(project_id);
CREATE INDEX idx_baseline_category ON baseline_metrics(metric_category);
CREATE INDEX idx_baseline_status ON baseline_metrics(status);

-- RLS
ALTER TABLE baseline_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant baseline" ON baseline_metrics
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY "Users can manage own tenant baseline" ON baseline_metrics
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- Trigger para updated_at
CREATE TRIGGER set_baseline_updated_at
BEFORE UPDATE ON baseline_metrics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. DADOS INICIAIS (EXEMPLO)
-- =====================================================

-- Função para criar baseline metrics padrão para novo projeto
CREATE OR REPLACE FUNCTION initialize_baseline_metrics(p_project_id UUID)
RETURNS VOID AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Buscar tenant_id
  SELECT tenant_id INTO v_tenant_id FROM projects WHERE id = p_project_id;

  -- Inserir métricas padrão
  INSERT INTO baseline_metrics (tenant_id, project_id, metric_name, metric_category, baseline_value, target_value, current_value, unit, baseline_date, description)
  VALUES
    (v_tenant_id, p_project_id, 'Velocidade Média', 'velocity', 0, 20, 0, 'pts/sprint', CURRENT_DATE, 'Story points entregues por sprint'),
    (v_tenant_id, p_project_id, 'Taxa de Conclusão', 'quality', 0, 90, 0, '%', CURRENT_DATE, 'Percentual de features concluídas no sprint'),
    (v_tenant_id, p_project_id, 'Compliance DoD', 'quality', 0, 95, 0, '%', CURRENT_DATE, 'Percentual médio de DoD nas features'),
    (v_tenant_id, p_project_id, 'Lead Time', 'process', 0, 3, 0, 'dias', CURRENT_DATE, 'Tempo médio de To Do até Done'),
    (v_tenant_id, p_project_id, 'Carry-over Rate', 'process', 0, 10, 0, '%', CURRENT_DATE, 'Percentual de features arrastadas entre sprints')
  ON CONFLICT (project_id, metric_name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. REFRESH INICIAL DA MATERIALIZED VIEW
-- =====================================================

REFRESH MATERIALIZED VIEW sprint_velocity;

-- =====================================================
-- 7. GRANTS (se necessário)
-- =====================================================

-- Conceder permissões para authenticated users
GRANT SELECT ON sprint_velocity TO authenticated;
GRANT ALL ON sprint_burndown_snapshots TO authenticated;
GRANT ALL ON baseline_metrics TO authenticated;
GRANT SELECT ON scrum_health_metrics TO authenticated;

COMMIT;

-- =====================================================
-- VERIFICAÇÕES PÓS-MIGRATION
-- =====================================================

-- Verificar materialized view
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM sprint_velocity) >= 0, 'sprint_velocity não criada';
  RAISE NOTICE 'Materialized view sprint_velocity: OK';
END $$;

-- Verificar tabelas
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'sprint_burndown_snapshots') = 1;
  ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'baseline_metrics') = 1;
  RAISE NOTICE 'Tabelas criadas: OK';
END $$;

-- Verificar funções
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM pg_proc WHERE proname = 'generate_daily_burndown_snapshot') = 1;
  ASSERT (SELECT COUNT(*) FROM pg_proc WHERE proname = 'refresh_sprint_velocity') = 1;
  RAISE NOTICE 'Funções criadas: OK';
END $$;

-- RAISE FINAL NOTICE DA MIGRATION
-- Observação: RAISE NOTICE só pode ser usado dentro de um bloco PL/pgSQL (por exemplo, DO $$ ... END $$;).
-- Esta linha estava fora de qualquer bloco e causava erro de sintaxe no Supabase, então foi comentada.
-- RAISE NOTICE '✅ Migration 008 completa!';
