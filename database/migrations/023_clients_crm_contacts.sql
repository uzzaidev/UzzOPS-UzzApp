-- ============================================================
-- MIGRATION 023: CLIENTS CRM CONTACTS
-- ============================================================
-- Objetivo:
-- 1) Enriquecer cadastro de clientes (uzzapp_clients) com dados comerciais.
-- 2) Criar tabela de atas/interacoes comerciais (client_contacts).
-- 3) Garantir RLS tenant-scoped para clientes e contatos.
-- 4) Expandir enum de item_type do md_feeder para contato_cliente.
-- Dependencia: 022_md_feeder_foundation.sql
-- ============================================================

-- ------------------------------------------------------------
-- 1) EXTENSAO DE CLIENTES
-- ------------------------------------------------------------

ALTER TABLE public.uzzapp_clients
  ADD COLUMN IF NOT EXISTS legal_name TEXT,
  ADD COLUMN IF NOT EXISTS cnpj TEXT,
  ADD COLUMN IF NOT EXISTS segment TEXT,
  ADD COLUMN IF NOT EXISTS company_size TEXT
    CHECK (company_size IN ('micro', 'pequena', 'media', 'grande') OR company_size IS NULL),
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS address_full TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS annual_revenue_estimate NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS main_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS main_contact_role TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_business TEXT,
  ADD COLUMN IF NOT EXISTS funnel_stage TEXT
    CHECK (
      funnel_stage IN (
        'lead-novo', 'qualificado', 'proposta', 'negociacao',
        'fechado', 'onboarding', 'cliente-ativo', 'stand-by', 'perdido'
      ) OR funnel_stage IS NULL
    ),
  ADD COLUMN IF NOT EXISTS negotiation_status TEXT
    CHECK (
      negotiation_status IN ('Em Andamento', 'Stand-by', 'Fechado', 'Perdido', 'Cancelado')
      OR negotiation_status IS NULL
    ),
  ADD COLUMN IF NOT EXISTS closing_probability INTEGER
    CHECK (closing_probability >= 0 AND closing_probability <= 100),
  ADD COLUMN IF NOT EXISTS priority TEXT
    CHECK (priority IN ('critica', 'alta', 'media', 'baixa') OR priority IS NULL),
  ADD COLUMN IF NOT EXISTS potential_value NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS monthly_fee_value NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS setup_fee_value NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS next_interaction_date DATE,
  ADD COLUMN IF NOT EXISTS next_action_deadline DATE,
  ADD COLUMN IF NOT EXISTS sales_owner_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS followup_owner_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS technical_owner_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS product_focus TEXT
    CHECK (product_focus IN ('CHATBOT', 'SITE-BUILDER', 'UzzBIM', 'NutriTrain', 'OUTRO') OR product_focus IS NULL),
  ADD COLUMN IF NOT EXISTS project_label TEXT,
  ADD COLUMN IF NOT EXISTS preferred_channel TEXT
    CHECK (preferred_channel IN ('presencial', 'videochamada', 'telefone', 'whatsapp', 'email') OR preferred_channel IS NULL),
  ADD COLUMN IF NOT EXISTS general_sentiment TEXT
    CHECK (general_sentiment IN ('Positivo', 'Neutro', 'Negativo') OR general_sentiment IS NULL),
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS idx_uzzapp_clients_tenant_status
  ON public.uzzapp_clients(tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_uzzapp_clients_tenant_funnel
  ON public.uzzapp_clients(tenant_id, funnel_stage, negotiation_status);

-- ------------------------------------------------------------
-- 2) TABELA DE CONTATOS / ATAS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.client_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES public.uzzapp_clients(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL DEFAULT 'contato-cliente'
    CHECK (contact_type IN ('contato-cliente')),
  contact_subtype TEXT NOT NULL
    CHECK (contact_subtype IN ('demo', 'setup', 'negociacao', 'follow-up', 'suporte', 'feedback')),
  status TEXT NOT NULL DEFAULT 'rascunho'
    CHECK (status IN ('rascunho', 'realizado', 'agendado', 'cancelado')),
  title TEXT,
  contato_principal TEXT,
  empresa TEXT,
  estagio_funil TEXT
    CHECK (
      estagio_funil IN (
        'lead-novo', 'qualificado', 'proposta', 'negociacao',
        'fechado', 'onboarding', 'cliente-ativo', 'stand-by', 'perdido'
      ) OR estagio_funil IS NULL
    ),
  status_negociacao TEXT
    CHECK (
      status_negociacao IN ('Em Andamento', 'Stand-by', 'Fechado', 'Perdido', 'Cancelado')
      OR status_negociacao IS NULL
    ),
  probabilidade_fechamento INTEGER
    CHECK (probabilidade_fechamento >= 0 AND probabilidade_fechamento <= 100),
  prioridade TEXT
    CHECK (prioridade IN ('critica', 'alta', 'media', 'baixa') OR prioridade IS NULL),
  valor_potencial NUMERIC(14,2),
  valor_mensalidade NUMERIC(14,2),
  valor_setup NUMERIC(14,2),
  data_contato DATE NOT NULL,
  hora_inicio TIME,
  hora_fim TIME,
  duracao_minutos INTEGER CHECK (duracao_minutos >= 0),
  data_proxima_interacao DATE,
  prazo_proxima_acao DATE,
  responsavel_vendas UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  responsavel_followup UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  responsavel_tecnico UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  responsavel_vendas_nome TEXT,
  responsavel_followup_nome TEXT,
  responsavel_tecnico_nome TEXT,
  produto TEXT
    CHECK (produto IN ('CHATBOT', 'SITE-BUILDER', 'UzzBIM', 'NutriTrain', 'OUTRO') OR produto IS NULL),
  projeto TEXT,
  canal TEXT
    CHECK (canal IN ('presencial', 'videochamada', 'telefone', 'whatsapp', 'email') OR canal IS NULL),
  sentimento_geral TEXT
    CHECK (sentimento_geral IN ('Positivo', 'Neutro', 'Negativo') OR sentimento_geral IS NULL),
  tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  summary_md TEXT,
  dashboard_exec JSONB NOT NULL DEFAULT '{}'::jsonb,
  bant_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  fit_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  dores_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  objecoes_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  proximos_passos_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  riscos_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  quality_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  source TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_contacts_tenant_date
  ON public.client_contacts(tenant_id, data_contato DESC);

CREATE INDEX IF NOT EXISTS idx_client_contacts_tenant_client
  ON public.client_contacts(tenant_id, client_id, data_contato DESC);

CREATE INDEX IF NOT EXISTS idx_client_contacts_tenant_status
  ON public.client_contacts(tenant_id, status, contact_subtype);

DROP TRIGGER IF EXISTS trg_client_contacts_updated_at ON public.client_contacts;
CREATE TRIGGER trg_client_contacts_updated_at
BEFORE UPDATE ON public.client_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------
-- 3) RLS: CLIENTES E CONTATOS
-- ------------------------------------------------------------

ALTER TABLE public.uzzapp_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS uzzapp_clients_select ON public.uzzapp_clients;
DROP POLICY IF EXISTS uzzapp_clients_write ON public.uzzapp_clients;
DROP POLICY IF EXISTS client_contacts_select ON public.client_contacts;
DROP POLICY IF EXISTS client_contacts_write ON public.client_contacts;

CREATE POLICY uzzapp_clients_select
ON public.uzzapp_clients
FOR SELECT TO authenticated
USING (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
);

CREATE POLICY uzzapp_clients_write
ON public.uzzapp_clients
FOR ALL TO authenticated
USING (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
)
WITH CHECK (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
);

CREATE POLICY client_contacts_select
ON public.client_contacts
FOR SELECT TO authenticated
USING (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
);

CREATE POLICY client_contacts_write
ON public.client_contacts
FOR ALL TO authenticated
USING (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
)
WITH CHECK (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
);

REVOKE ALL ON TABLE public.uzzapp_clients FROM anon;
REVOKE ALL ON TABLE public.uzzapp_clients FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.uzzapp_clients TO authenticated;

REVOKE ALL ON TABLE public.client_contacts FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.client_contacts TO authenticated;

-- ------------------------------------------------------------
-- 4) MD FEEDER ITEM_TYPE: CONTATO_CLIENTE
-- ------------------------------------------------------------

ALTER TABLE public.md_feeder_import_items
  DROP CONSTRAINT IF EXISTS md_feeder_import_items_item_type_check;

ALTER TABLE public.md_feeder_import_items
  ADD CONSTRAINT md_feeder_import_items_item_type_check
  CHECK (item_type IN (
    'feature','epic','spike','spike_result',
    'bug','bug_resolution','planning_result',
    'sprint','sprint_update','task',
    'user_story','daily','daily_member','retrospective',
    'feature_dependency','baseline_metric',
    'marketing_campaign','marketing_post',
    'risk','team_member','uzzapp_client','contato_cliente'
  ));

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE 'Migration 023 aplicada (clients crm contacts).';
  RAISE NOTICE ' - uzzapp_clients enriquecida com campos comerciais';
  RAISE NOTICE ' - client_contacts criada para atas e interacoes';
  RAISE NOTICE ' - RLS tenant-scoped aplicada em clientes/contatos';
  RAISE NOTICE ' - md_feeder_import_items aceita contato_cliente';
END $$;
