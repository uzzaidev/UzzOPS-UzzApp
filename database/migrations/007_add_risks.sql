-- Migration 007: Gestão de Riscos (GUT Matrix)
-- Foco: Tabela de riscos com cálculo automático de GUT Score
-- Data: 2026-02-07

-- ============================================
-- 1. CRIAR TABELA RISKS
-- ============================================

CREATE TABLE IF NOT EXISTS risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,

  -- Identificação
  public_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- GUT Matrix (Gravidade × Urgência × Tendência)
  gut_g INTEGER NOT NULL CHECK (gut_g >= 1 AND gut_g <= 5),
  gut_u INTEGER NOT NULL CHECK (gut_u >= 1 AND gut_u <= 5),
  gut_t INTEGER NOT NULL CHECK (gut_t >= 1 AND gut_t <= 5),
  gut_score INTEGER GENERATED ALWAYS AS (gut_g * gut_u * gut_t) STORED,

  -- Classificação e Status
  severity_label TEXT GENERATED ALWAYS AS (
    CASE
      WHEN (gut_g * gut_u * gut_t) >= 100 THEN 'Crítico'
      WHEN (gut_g * gut_u * gut_t) >= 50 THEN 'Alto'
      WHEN (gut_g * gut_u * gut_t) >= 20 THEN 'Médio'
      ELSE 'Baixo'
    END
  ) STORED,
  status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'analyzing', 'mitigated', 'accepted', 'resolved')),

  -- Mitigação
  mitigation_plan TEXT,
  owner_id UUID REFERENCES team_members(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(tenant_id, public_id)
);

-- ============================================
-- 2. ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_risks_tenant_project
  ON risks(tenant_id, project_id);

CREATE INDEX IF NOT EXISTS idx_risks_gut_score
  ON risks(tenant_id, gut_score DESC);

CREATE INDEX IF NOT EXISTS idx_risks_status
  ON risks(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_risks_severity
  ON risks(tenant_id, severity_label);

-- ============================================
-- 3. TRIGGER AUTO-UPDATE TIMESTAMP
-- ============================================

CREATE OR REPLACE FUNCTION update_risks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_risks_updated_at
  BEFORE UPDATE ON risks
  FOR EACH ROW
  EXECUTE FUNCTION update_risks_updated_at();

-- ============================================
-- 4. RLS (ROW LEVEL SECURITY) POLICIES
-- ============================================

-- Habilitar RLS
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver riscos do seu tenant
CREATE POLICY "Users can view risks from their tenant"
  ON risks
  FOR SELECT
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

-- Policy: Usuários podem criar riscos no seu tenant
CREATE POLICY "Users can create risks in their tenant"
  ON risks
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

-- Policy: Usuários podem atualizar riscos do seu tenant
CREATE POLICY "Users can update risks from their tenant"
  ON risks
  FOR UPDATE
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

-- Policy: Usuários podem deletar riscos do seu tenant
CREATE POLICY "Users can delete risks from their tenant"
  ON risks
  FOR DELETE
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
  ));

-- ============================================
-- 5. COMENTÁRIOS (DOCUMENTAÇÃO)
-- ============================================

COMMENT ON TABLE risks IS 'Riscos do projeto com matriz GUT (Gravidade × Urgência × Tendência)';
COMMENT ON COLUMN risks.public_id IS 'Código público do risco (ex: R-001, R-002)';
COMMENT ON COLUMN risks.gut_g IS 'Gravidade: 1 (muito baixa) a 5 (muito alta)';
COMMENT ON COLUMN risks.gut_u IS 'Urgência: 1 (pode esperar) a 5 (imediata)';
COMMENT ON COLUMN risks.gut_t IS 'Tendência: 1 (vai melhorar) a 5 (vai piorar)';
COMMENT ON COLUMN risks.gut_score IS 'Score GUT calculado automaticamente (G × U × T)';
COMMENT ON COLUMN risks.severity_label IS 'Classificação automática: Crítico (≥100), Alto (≥50), Médio (≥20), Baixo (<20)';
COMMENT ON COLUMN risks.status IS 'Status: identified, analyzing, mitigated, accepted, resolved';
COMMENT ON COLUMN risks.mitigation_plan IS 'Plano de ação para mitigar o risco';
COMMENT ON COLUMN risks.owner_id IS 'Responsável por gerenciar o risco';

-- ============================================
-- 6. DADOS SEED (EXEMPLO) - Opcional
-- ============================================

-- Inserir riscos de exemplo (comentado - descomentar se quiser seed data)
/*
-- Assumindo que existe um projeto com ID conhecido
INSERT INTO risks (tenant_id, project_id, public_id, title, description, gut_g, gut_u, gut_t, status, mitigation_plan) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM projects WHERE slug = 'uzzapp' LIMIT 1),
    'R-001',
    'Dependência de API externa instável',
    'A API do WhatsApp Business tem histórico de instabilidade que pode afetar nossa operação',
    5, -- Gravidade: Muito Alta (bloqueia operação)
    4, -- Urgência: Alta (pode acontecer a qualquer momento)
    4, -- Tendência: Alta (não temos controle)
    'analyzing',
    'Implementar sistema de retry e fallback. Criar cache local de mensagens.'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM projects WHERE slug = 'uzzapp' LIMIT 1),
    'R-002',
    'Falta de desenvolvedores especializados em IA',
    'Equipe atual tem pouco conhecimento em LLMs e integrações de IA',
    3, -- Gravidade: Média (pode atrasar)
    3, -- Urgência: Média (temos tempo para treinar)
    2, -- Tendência: Baixa (estamos treinando)
    'mitigated',
    'Curso de LangChain para equipe. Consultoria externa para casos complexos.'
  );
*/
