-- ============================================================
-- MIGRATION 009: SPRINT 5 - BACKLOG AVANÇADO
-- ============================================================
-- Versão: 1.0
-- Data: 2026-02-07
-- Descrição: Mapas Mentais, Decomposição de Épicos, DoD Evolutivo
-- Dependências: 008_sprint_3_metrics.sql
-- ============================================================

-- ============================================================
-- PARTE 1: MAPAS MENTAIS DE BACKLOG (US-5.1)
-- ============================================================

-- Clusters (agrupamentos de features)
CREATE TABLE IF NOT EXISTS feature_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3b82f6', -- Hex color for visual distinction
  position_x FLOAT NOT NULL DEFAULT 0, -- X coordinate in canvas
  position_y FLOAT NOT NULL DEFAULT 0, -- Y coordinate in canvas
  is_collapsed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Relacionamento features com clusters
CREATE TABLE IF NOT EXISTS feature_cluster_members (
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  cluster_id UUID NOT NULL REFERENCES feature_clusters(id) ON DELETE CASCADE,
  position_x FLOAT NOT NULL DEFAULT 0, -- Position within cluster
  position_y FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (feature_id, cluster_id)
);

-- Dependências entre features
CREATE TABLE IF NOT EXISTS feature_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE, -- Feature que depende
  depends_on_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE, -- Feature da qual depende
  dependency_type TEXT NOT NULL CHECK (dependency_type IN ('blocks', 'relates_to', 'duplicates')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(feature_id, depends_on_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_feature_clusters_project ON feature_clusters(project_id);
CREATE INDEX IF NOT EXISTS idx_feature_cluster_members_cluster ON feature_cluster_members(cluster_id);
CREATE INDEX IF NOT EXISTS idx_feature_cluster_members_feature ON feature_cluster_members(feature_id);
CREATE INDEX IF NOT EXISTS idx_feature_dependencies_feature ON feature_dependencies(feature_id);
CREATE INDEX IF NOT EXISTS idx_feature_dependencies_depends_on ON feature_dependencies(depends_on_id);
CREATE INDEX IF NOT EXISTS idx_feature_dependencies_project ON feature_dependencies(project_id);

-- RLS Policies - Clusters
ALTER TABLE feature_clusters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view clusters of their projects" ON feature_clusters;
CREATE POLICY "Users can view clusters of their projects" ON feature_clusters
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can manage clusters of their projects" ON feature_clusters;
CREATE POLICY "Users can manage clusters of their projects" ON feature_clusters
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies - Cluster Members
ALTER TABLE feature_cluster_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view cluster members of their projects" ON feature_cluster_members;
CREATE POLICY "Users can view cluster members of their projects" ON feature_cluster_members
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can manage cluster members of their projects" ON feature_cluster_members;
CREATE POLICY "Users can manage cluster members of their projects" ON feature_cluster_members
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies - Dependencies
ALTER TABLE feature_dependencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view dependencies of their projects" ON feature_dependencies;
CREATE POLICY "Users can view dependencies of their projects" ON feature_dependencies
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can manage dependencies of their projects" ON feature_dependencies;
CREATE POLICY "Users can manage dependencies of their projects" ON feature_dependencies
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- View: Cluster summary (computed field com contagem de features)
CREATE OR REPLACE VIEW cluster_summary AS
SELECT
  c.id,
  c.project_id,
  c.name,
  c.description,
  c.color,
  c.position_x,
  c.position_y,
  c.is_collapsed,
  c.created_at,
  c.updated_at,
  COUNT(fcm.feature_id) as feature_count,
  COALESCE(SUM(f.story_points), 0) as total_story_points,
  COUNT(DISTINCT f.id) FILTER (WHERE f.status = 'done') as features_done,
  ROUND((COUNT(DISTINCT f.id) FILTER (WHERE f.status = 'done')::float /
         NULLIF(COUNT(DISTINCT f.id), 0) * 100)::numeric, 2) as completion_rate
FROM feature_clusters c
LEFT JOIN feature_cluster_members fcm ON c.id = fcm.cluster_id
LEFT JOIN features f ON fcm.feature_id = f.id
GROUP BY c.id, c.project_id, c.name, c.description, c.color, c.position_x, c.position_y, c.is_collapsed, c.created_at, c.updated_at;

-- ============================================================
-- PARTE 2: DECOMPOSIÇÃO DE ÉPICOS (US-5.2)
-- ============================================================

-- Relacionamento épico → histórias
CREATE TABLE IF NOT EXISTS epic_decomposition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epic_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE, -- O épico original
  child_story_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE, -- História criada
  decomposition_strategy TEXT, -- Ex: "by_persona", "by_scenario", "by_layer", "by_criteria"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(epic_id, child_story_id)
);

-- Adicionar campos ao features para marcar como épico decomposto
ALTER TABLE features ADD COLUMN IF NOT EXISTS is_epic BOOLEAN DEFAULT false;
ALTER TABLE features ADD COLUMN IF NOT EXISTS decomposed_at TIMESTAMPTZ;

-- Índices
CREATE INDEX IF NOT EXISTS idx_epic_decomposition_epic ON epic_decomposition(epic_id);
CREATE INDEX IF NOT EXISTS idx_epic_decomposition_child ON epic_decomposition(child_story_id);

-- RLS Policies
ALTER TABLE epic_decomposition ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view decompositions of their projects" ON epic_decomposition;
CREATE POLICY "Users can view decompositions of their projects" ON epic_decomposition
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can manage decompositions of their projects" ON epic_decomposition;
CREATE POLICY "Users can manage decompositions of their projects" ON epic_decomposition
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- View: Epic summary (epics com suas histórias filhas)
CREATE OR REPLACE VIEW epic_summary AS
SELECT
  e.id as epic_id,
  e.name as epic_name,
  e.project_id,
  e.decomposed_at,
  COUNT(ed.child_story_id) as child_stories_count,
  COALESCE(SUM(f.story_points), 0) as total_child_points,
  COUNT(DISTINCT f.id) FILTER (WHERE f.status = 'done') as children_done
FROM features e
LEFT JOIN epic_decomposition ed ON e.id = ed.epic_id
LEFT JOIN features f ON ed.child_story_id = f.id
WHERE e.is_epic = true
GROUP BY e.id, e.name, e.project_id, e.decomposed_at;

-- ============================================================
-- PARTE 3: DOD EVOLUTIVO (US-5.3)
-- ============================================================

-- Níveis de DoD
CREATE TABLE IF NOT EXISTS dod_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  level INT NOT NULL CHECK (level IN (1, 2, 3)),
  name TEXT NOT NULL, -- Ex: "Iniciante", "Intermediário", "Avançado"
  criteria JSONB NOT NULL, -- Array de critérios
  is_active BOOLEAN NOT NULL DEFAULT false,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, level)
);

-- Histórico de mudanças de DoD
CREATE TABLE IF NOT EXISTS dod_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  from_level INT,
  to_level INT NOT NULL,
  reason TEXT,
  changed_by UUID REFERENCES team_members(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_dod_levels_project ON dod_levels(project_id);
CREATE INDEX IF NOT EXISTS idx_dod_levels_active ON dod_levels(project_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_dod_history_project ON dod_history(project_id);
CREATE INDEX IF NOT EXISTS idx_dod_history_date ON dod_history(changed_at DESC);

-- RLS Policies - DoD Levels
ALTER TABLE dod_levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view dod levels of their projects" ON dod_levels;
CREATE POLICY "Users can view dod levels of their projects" ON dod_levels
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can manage dod levels of their projects" ON dod_levels;
CREATE POLICY "Users can manage dod levels of their projects" ON dod_levels
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies - DoD History
ALTER TABLE dod_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view dod history of their projects" ON dod_history;
CREATE POLICY "Users can view dod history of their projects" ON dod_history
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can manage dod history of their projects" ON dod_history;
CREATE POLICY "Users can manage dod history of their projects" ON dod_history
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Função: Seed DoD padrão para novos projetos
CREATE OR REPLACE FUNCTION seed_default_dod()
RETURNS TRIGGER AS $$
BEGIN
  -- Level 1: Iniciante
  INSERT INTO dod_levels (project_id, level, name, criteria, is_active) VALUES
  (NEW.id, 1, 'Iniciante',
   '["Código funciona", "Testes manuais OK", "Sem erros de lint", "Build passa"]'::jsonb,
   true);

  -- Level 2: Intermediário
  INSERT INTO dod_levels (project_id, level, name, criteria, is_active) VALUES
  (NEW.id, 2, 'Intermediário',
   '["Código funciona", "Testes automatizados", "Code review aprovado", "Sem erros de lint", "Build passa", "Deploy em staging OK"]'::jsonb,
   false);

  -- Level 3: Avançado
  INSERT INTO dod_levels (project_id, level, name, criteria, is_active) VALUES
  (NEW.id, 3, 'Avançado',
   '["Código funciona", "Testes automatizados (>80% coverage)", "Code review aprovado", "Performance OK (<2s)", "Security scan passou", "Documentação atualizada", "Deploy em produção OK", "Sem bugs conhecidos"]'::jsonb,
   false);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Seed DoD ao criar projeto
DROP TRIGGER IF EXISTS trigger_seed_dod ON projects;
CREATE TRIGGER trigger_seed_dod
AFTER INSERT ON projects
FOR EACH ROW
EXECUTE FUNCTION seed_default_dod();

-- Função: Check upgrade eligibility (pode ser evoluído para nível superior?)
CREATE OR REPLACE FUNCTION check_dod_upgrade_eligibility(p_project_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_velocity_variance FLOAT;
  v_avg_completion FLOAT;
  v_sprint_count INT;
BEGIN
  -- Contar sprints com dados de velocity
  SELECT COUNT(*) INTO v_sprint_count
  FROM sprint_velocity
  WHERE project_id = p_project_id
    AND velocity > 0;

  -- Precisa de pelo menos 3 sprints
  IF v_sprint_count < 3 THEN
    RETURN false;
  END IF;

  -- Calcular variância de velocity (últimos 3 sprints)
  WITH recent_velocity AS (
    SELECT velocity, completion_rate
    FROM sprint_velocity
    WHERE project_id = p_project_id
    ORDER BY sprint_number DESC
    LIMIT 3
  ),
  stats AS (
    SELECT
      AVG(velocity) as avg_vel,
      STDDEV(velocity) as stddev_vel,
      AVG(completion_rate) as avg_comp
    FROM recent_velocity
  )
  SELECT
    (stddev_vel / NULLIF(avg_vel, 0) * 100),
    avg_comp
  INTO v_velocity_variance, v_avg_completion
  FROM stats;

  -- Elegível se: variance < 20% E completion > 85%
  RETURN (v_velocity_variance < 20 AND v_avg_completion > 85);
END;
$$ LANGUAGE plpgsql;

-- Seed DoD para o projeto existente (UZZAPP) caso ainda não tenha
INSERT INTO dod_levels (project_id, level, name, criteria, is_active)
SELECT
  p.id,
  levels.level,
  levels.name,
  levels.criteria::jsonb,
  levels.is_active
FROM projects p
CROSS JOIN (
  VALUES
    (1, 'Iniciante',       '["Código funciona", "Testes manuais OK", "Sem erros de lint", "Build passa"]', true),
    (2, 'Intermediário',   '["Código funciona", "Testes automatizados", "Code review aprovado", "Sem erros de lint", "Build passa", "Deploy em staging OK"]', false),
    (3, 'Avançado',        '["Código funciona", "Testes automatizados (>80% coverage)", "Code review aprovado", "Performance OK (<2s)", "Security scan passou", "Documentação atualizada", "Deploy em produção OK", "Sem bugs conhecidos"]', false)
) AS levels(level, name, criteria, is_active)
WHERE p.code = 'UZZAPP'
ON CONFLICT (project_id, level) DO NOTHING;

GRANT SELECT ON cluster_summary TO authenticated;
GRANT SELECT ON epic_summary TO authenticated;
GRANT ALL ON feature_clusters TO authenticated;
GRANT ALL ON feature_cluster_members TO authenticated;
GRANT ALL ON feature_dependencies TO authenticated;
GRANT ALL ON epic_decomposition TO authenticated;
GRANT ALL ON dod_levels TO authenticated;
GRANT ALL ON dod_history TO authenticated;

NOTIFY pgrst, 'reload schema';

-- ============================================================
-- PARTE 4: HELPER FUNCTIONS
-- ============================================================

-- Função: Get active DoD for project
CREATE OR REPLACE FUNCTION get_active_dod(p_project_id UUID)
RETURNS TABLE (
  level INT,
  name TEXT,
  criteria JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dod_levels.level,
    dod_levels.name,
    dod_levels.criteria
  FROM dod_levels
  WHERE dod_levels.project_id = p_project_id
    AND dod_levels.is_active = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Função: Count features in cluster
CREATE OR REPLACE FUNCTION count_cluster_features(p_cluster_id UUID)
RETURNS INT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM feature_cluster_members
    WHERE cluster_id = p_cluster_id
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PARTE 5: VERIFICAÇÕES PÓS-MIGRATION
-- ============================================================

-- Verificar que tabelas foram criadas
DO $$
DECLARE
  v_tables TEXT[] := ARRAY[
    'feature_clusters',
    'feature_cluster_members',
    'feature_dependencies',
    'epic_decomposition',
    'dod_levels',
    'dod_history'
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

  RAISE NOTICE '✅ Todas as tabelas do Sprint 5 foram criadas com sucesso!';
END $$;

-- Verificar views
DO $$
DECLARE
  v_views TEXT[] := ARRAY[
    'cluster_summary',
    'epic_summary'
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

  RAISE NOTICE '✅ Todas as views do Sprint 5 foram criadas com sucesso!';
END $$;

-- Verificar funções
DO $$
DECLARE
  v_functions TEXT[] := ARRAY[
    'seed_default_dod',
    'check_dod_upgrade_eligibility',
    'get_active_dod',
    'count_cluster_features'
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

  RAISE NOTICE '✅ Todas as funções do Sprint 5 foram criadas com sucesso!';
END $$;

-- ============================================================
-- SUCESSO!
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║     ✅ MIGRATION 009 COMPLETA!                            ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║     Sprint 5 - Backlog Avançado                            ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║     Recursos criados:                                      ║';
  RAISE NOTICE '║     • 6 tabelas (clusters, dependencies, epics, dod)       ║';
  RAISE NOTICE '║     • 2 views (cluster_summary, epic_summary)              ║';
  RAISE NOTICE '║     • 4 funções (seed, check, get, count)                  ║';
  RAISE NOTICE '║     • 1 trigger (seed_default_dod)                         ║';
  RAISE NOTICE '║     • Índices e RLS policies                               ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '║     Próximo: 010_sprint_6_operational.sql                  ║';
  RAISE NOTICE '║                                                            ║';
  RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;
