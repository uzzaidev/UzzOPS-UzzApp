-- ============================================================
-- MIGRATION 025: CLIENT ENRICHMENT - CRM LEAD MANAGEMENT
-- ============================================================
-- Objetivo:
-- 1) Enriquecer uzzapp_clients com qualificacao ICP, contexto de
--    negocio, stakeholders, snapshots de BANT/FIT e metadados de
--    relacionamento (lead_source, last_contact_date).
-- 2) Enriquecer client_contacts com insights estruturados,
--    participantes, deal_outcome desnormalizado e sequencia de
--    interacao.
-- 3) Criar indices de suporte as novas consultas.
-- Dependencia: 023_clients_crm_contacts.sql
-- ============================================================

-- ------------------------------------------------------------
-- 1) UZZAPP_CLIENTS - NOVOS CAMPOS
-- ------------------------------------------------------------

-- Origem do lead
ALTER TABLE public.uzzapp_clients
  ADD COLUMN IF NOT EXISTS lead_source TEXT
    CHECK (
      lead_source IN (
        'indicacao', 'linkedin', 'evento', 'cold-outreach',
        'inbound', 'parceiro', 'outro'
      ) OR lead_source IS NULL
    );

-- Classificacao ICP rapida
ALTER TABLE public.uzzapp_clients
  ADD COLUMN IF NOT EXISTS icp_classification TEXT
    CHECK (
      icp_classification IN ('hot', 'warm', 'cold', 'future')
      OR icp_classification IS NULL
    );

-- Contexto narrativo do negocio do cliente
ALTER TABLE public.uzzapp_clients
  ADD COLUMN IF NOT EXISTS business_context TEXT;

-- Volume aproximado de leads/dia (qualificador critico)
ALTER TABLE public.uzzapp_clients
  ADD COLUMN IF NOT EXISTS lead_daily_volume INTEGER
    CHECK (lead_daily_volume >= 0 OR lead_daily_volume IS NULL);

-- Mapa de stakeholders [{name, role, decision_power, influence, notes}]
ALTER TABLE public.uzzapp_clients
  ADD COLUMN IF NOT EXISTS stakeholders_json JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Snapshot do ultimo BANT {budget, authority, need, timeline, total, updated_at}
ALTER TABLE public.uzzapp_clients
  ADD COLUMN IF NOT EXISTS bant_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Snapshot do ultimo FIT {produto, mercado, financeiro, cultural, tecnico, total, updated_at}
ALTER TABLE public.uzzapp_clients
  ADD COLUMN IF NOT EXISTS fit_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Data do ultimo contato (desnormalizado para ordenacao rapida)
ALTER TABLE public.uzzapp_clients
  ADD COLUMN IF NOT EXISTS last_contact_date DATE;

-- Indices para os novos campos de qualificacao
CREATE INDEX IF NOT EXISTS idx_uzzapp_clients_tenant_icp
  ON public.uzzapp_clients(tenant_id, icp_classification);

CREATE INDEX IF NOT EXISTS idx_uzzapp_clients_tenant_last_contact
  ON public.uzzapp_clients(tenant_id, last_contact_date DESC NULLS LAST);

-- ------------------------------------------------------------
-- 2) CLIENT_CONTACTS - NOVOS CAMPOS
-- ------------------------------------------------------------

-- Insights/aprendizados estruturados [{tipo, titulo, descricao, aplicabilidade}]
ALTER TABLE public.client_contacts
  ADD COLUMN IF NOT EXISTS insights_json JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Participantes {uzzai: [], client: []}
ALTER TABLE public.client_contacts
  ADD COLUMN IF NOT EXISTS participants_json JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Deal outcome desnormalizado (open|won|lost|stand_by) para filtros rapidos
ALTER TABLE public.client_contacts
  ADD COLUMN IF NOT EXISTS deal_outcome TEXT
    CHECK (
      deal_outcome IN ('open', 'won', 'lost', 'stand_by')
      OR deal_outcome IS NULL
    );

-- Sequencia da interacao com esse cliente (1a, 2a, ...)
ALTER TABLE public.client_contacts
  ADD COLUMN IF NOT EXISTS interaction_sequence SMALLINT
    CHECK (interaction_sequence >= 1 OR interaction_sequence IS NULL);

-- Indice para filtros por deal outcome
CREATE INDEX IF NOT EXISTS idx_client_contacts_tenant_deal
  ON public.client_contacts(tenant_id, deal_outcome, data_contato DESC);

-- Indice para historico cronologico por cliente
CREATE INDEX IF NOT EXISTS idx_client_contacts_client_sequence
  ON public.client_contacts(client_id, interaction_sequence ASC NULLS LAST);

-- Garante unicidade da sequencia por cliente quando informada.
CREATE UNIQUE INDEX IF NOT EXISTS idx_client_contacts_client_sequence_unique
  ON public.client_contacts(client_id, interaction_sequence)
  WHERE interaction_sequence IS NOT NULL;

-- ------------------------------------------------------------
-- 3) RELOAD SCHEMA
-- ------------------------------------------------------------

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE 'Migration 025 aplicada (client enrichment).';
  RAISE NOTICE ' - uzzapp_clients: lead_source, icp_classification, business_context';
  RAISE NOTICE ' - uzzapp_clients: lead_daily_volume, stakeholders_json';
  RAISE NOTICE ' - uzzapp_clients: bant_snapshot, fit_snapshot, last_contact_date';
  RAISE NOTICE ' - client_contacts: insights_json, participants_json';
  RAISE NOTICE ' - client_contacts: deal_outcome (desnorm.), interaction_sequence';
END $$;