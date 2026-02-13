-- Migration 006: Fix Missing Columns and Tables (Defensiva)
-- Motivo: Migrations 003, 004 não foram rodadas, causando erros de coluna/tabela não encontrada

-- ============================================================================
-- 1. FIX: Adicionar coluna 'added_at' em sprint_features (se não existir)
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'sprint_features'
        AND column_name = 'added_at'
    ) THEN
        ALTER TABLE sprint_features
        ADD COLUMN added_at TIMESTAMP DEFAULT NOW();

        RAISE NOTICE 'Coluna added_at adicionada com sucesso a sprint_features';
    ELSE
        RAISE NOTICE 'Coluna added_at já existe em sprint_features';
    END IF;
END $$;

-- ============================================================================
-- 2. FIX: Criar tabela sprint_scope_changes (se não existir)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sprint_scope_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('ADD', 'REMOVE')),
    reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tenant_id UUID -- Placeholder para futuro RLS
);

-- Índices para performance (só cria se não existir)
CREATE INDEX IF NOT EXISTS idx_scope_changes_sprint ON sprint_scope_changes(sprint_id);
CREATE INDEX IF NOT EXISTS idx_scope_changes_feature ON sprint_scope_changes(feature_id);

COMMENT ON TABLE sprint_scope_changes IS 'Auditoria de mudanças de escopo em sprints ativos (Scope Creep Log)';

-- ============================================================================
-- 3. FIX: Adicionar campos essenciais em sprints (se não existirem)
-- ============================================================================
DO $$
BEGIN
    -- sprint_goal
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'sprints' AND column_name = 'sprint_goal'
    ) THEN
        ALTER TABLE sprints ADD COLUMN sprint_goal TEXT NOT NULL DEFAULT '';
        RAISE NOTICE 'Coluna sprint_goal adicionada';
    END IF;

    -- duration_weeks
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'sprints' AND column_name = 'duration_weeks'
    ) THEN
        ALTER TABLE sprints ADD COLUMN duration_weeks INT NOT NULL DEFAULT 2;
        RAISE NOTICE 'Coluna duration_weeks adicionada';
    END IF;

    -- is_protected
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'sprints' AND column_name = 'is_protected'
    ) THEN
        ALTER TABLE sprints ADD COLUMN is_protected BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Coluna is_protected adicionada';
    END IF;

    -- started_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'sprints' AND column_name = 'started_at'
    ) THEN
        ALTER TABLE sprints ADD COLUMN started_at TIMESTAMP;
        RAISE NOTICE 'Coluna started_at adicionada';
    END IF;

    -- completed_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'sprints' AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE sprints ADD COLUMN completed_at TIMESTAMP;
        RAISE NOTICE 'Coluna completed_at adicionada';
    END IF;
END $$;

-- ============================================================================
-- 4. ATUALIZAR sprints existentes com goal vazio
-- ============================================================================
UPDATE sprints
SET sprint_goal = 'Sprint Goal - Atualizar objetivo'
WHERE sprint_goal = '' OR sprint_goal IS NULL;

-- ============================================================================
-- 5. Adicionar constraints (apenas se não existirem)
-- ============================================================================
DO $$
BEGIN
    -- Constraint: Sprint Goal não vazio
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'sprint_goal_not_empty'
    ) THEN
        ALTER TABLE sprints
        ADD CONSTRAINT sprint_goal_not_empty
        CHECK (LENGTH(TRIM(sprint_goal)) >= 10);
        RAISE NOTICE 'Constraint sprint_goal_not_empty adicionada';
    END IF;

    -- Constraint: Duração válida
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'sprint_duration_valid'
    ) THEN
        ALTER TABLE sprints
        ADD CONSTRAINT sprint_duration_valid
        CHECK (duration_weeks >= 1 AND duration_weeks <= 4);
        RAISE NOTICE 'Constraint sprint_duration_valid adicionada';
    END IF;
END $$;

-- ============================================================================
-- 6. Criar índices adicionais (se não existirem)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_sprint_features_sprint ON sprint_features(sprint_id);
CREATE INDEX IF NOT EXISTS idx_sprint_features_feature ON sprint_features(feature_id);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON sprints(status);
CREATE INDEX IF NOT EXISTS idx_sprints_project ON sprints(project_id);

-- ============================================================================
-- 7. Comentários para documentação
-- ============================================================================
COMMENT ON COLUMN sprints.sprint_goal IS 'Objetivo claro do sprint em 1 frase (obrigatório, mín 10 chars)';
COMMENT ON COLUMN sprints.duration_weeks IS 'Duração fixa do sprint (1-4 semanas, não editável após start)';
COMMENT ON COLUMN sprints.is_protected IS 'Proteção de escopo: TRUE impede adição de features (ativado ao iniciar sprint)';
COMMENT ON COLUMN sprints.started_at IS 'Data/hora em que o sprint foi iniciado (status mudou para active)';
COMMENT ON COLUMN sprints.completed_at IS 'Data/hora em que o sprint foi concluído (status mudou para completed)';
COMMENT ON TABLE sprint_features IS 'Vínculo many-to-many entre sprints e features';
COMMENT ON COLUMN sprint_features.added_at IS 'Data/hora em que a feature foi adicionada ao sprint';

-- Recarregar cache para garantir que a API veja as mudanças
NOTIFY pgrst, 'reload config';

-- LOG FINAL
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 006 concluída com sucesso!';
END $$;
