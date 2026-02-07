-- Migration 004: Sprint Scope Audit (Histórico de Mudanças de Escopo)
-- Cria tabela para registrar adições/remoções de features em sprints ativos

CREATE TABLE IF NOT EXISTS sprint_scope_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('ADD', 'REMOVE')),
    reason TEXT, -- Motivo opcional (placeholder para futuro)
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tenant_id UUID DEFAULT auth.uid() -- Se usar RLS, associar ao tenant/user
);

-- Índices para performance
CREATE INDEX idx_scope_changes_sprint ON sprint_scope_changes(sprint_id);
CREATE INDEX idx_scope_changes_feature ON sprint_scope_changes(feature_id);

COMMENT ON TABLE sprint_scope_changes IS 'Auditoria de mudanças de escopo em sprints ativos (Scope Creep Log)';
