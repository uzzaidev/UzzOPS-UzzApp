-- Migration 003: Sprint Essentials (Fundamentos Scrum)
-- Foco: Sprint Goal obrigatório, duração fixa, proteção de escopo

-- 1. Adicionar campos essenciais à tabela sprints
ALTER TABLE sprints 
  ADD COLUMN IF NOT EXISTS sprint_goal TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS duration_weeks INT NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS is_protected BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- 2. ATUALIZAR sprints existentes que têm goal vazio (para não violar constraint)
UPDATE sprints 
SET sprint_goal = 'Sprint Goal - Atualizar objetivo'
WHERE sprint_goal = '' OR sprint_goal IS NULL;

-- 3. Constraint: Sprint Goal não pode ser vazio (após atualização)
ALTER TABLE sprints 
  ADD CONSTRAINT sprint_goal_not_empty 
  CHECK (LENGTH(TRIM(sprint_goal)) >= 10);

-- 3. Constraint: Duração entre 1 e 4 semanas
ALTER TABLE sprints 
  ADD CONSTRAINT sprint_duration_valid 
  CHECK (duration_weeks >= 1 AND duration_weeks <= 4);

-- 4. Criar tabela sprint_features (many-to-many)
CREATE TABLE IF NOT EXISTS sprint_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE NOT NULL,
  feature_id UUID REFERENCES features(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP DEFAULT NOW(),
  priority INT DEFAULT 0,
  UNIQUE(sprint_id, feature_id)
);

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_sprint_features_sprint ON sprint_features(sprint_id);
CREATE INDEX IF NOT EXISTS idx_sprint_features_feature ON sprint_features(feature_id);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON sprints(status);
CREATE INDEX IF NOT EXISTS idx_sprints_project ON sprints(project_id);

-- 6. Comentários para documentação
COMMENT ON COLUMN sprints.sprint_goal IS 'Objetivo claro do sprint em 1 frase (obrigatório, mín 10 chars)';
COMMENT ON COLUMN sprints.duration_weeks IS 'Duração fixa do sprint (1-4 semanas, não editável após start)';
COMMENT ON COLUMN sprints.is_protected IS 'Proteção de escopo: TRUE impede adição de features (ativado ao iniciar sprint)';
COMMENT ON COLUMN sprints.started_at IS 'Data/hora em que o sprint foi iniciado (status mudou para active)';
COMMENT ON COLUMN sprints.completed_at IS 'Data/hora em que o sprint foi concluído (status mudou para completed)';
COMMENT ON TABLE sprint_features IS 'Vínculo many-to-many entre sprints e features';
