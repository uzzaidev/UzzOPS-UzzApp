-- ============================================================
-- MIGRATION 020: MARKETING FOUNDATION (CALENDARIO MVP)
-- ============================================================
-- Objetivo:
-- 1) Criar fundacao de dados de Marketing (channels, campaigns, content, publications).
-- 2) Aplicar RLS tenant-scoped em todas as tabelas.
-- 3) Preparar consultas de calendario via indexes por tenant/data.
-- Dependencia: 019_progress_hardening.sql
-- ============================================================

-- ------------------------------------------------------------
-- 1) TABELAS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.marketing_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'linkedin', 'tiktok', 'youtube', 'site', 'whatsapp', 'other')),
  color TEXT NOT NULL DEFAULT '#3b82f6',
  icon_key TEXT,
  profile_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_marketing_channels_tenant_platform UNIQUE (tenant_id, platform)
);

CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  objective TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'completed', 'archived')),
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketing_content_pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  topic TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('reels', 'feed', 'carrossel', 'stories', 'artigo', 'video')),
  objective TEXT,
  brief TEXT,
  caption_base TEXT,
  hashtags TEXT[] NOT NULL DEFAULT '{}'::text[],
  cta TEXT,
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'briefing', 'production', 'review', 'approved', 'done', 'archived')),
  responsible_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  due_date DATE,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_marketing_content_code_tenant UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS public.marketing_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  content_piece_id UUID NOT NULL REFERENCES public.marketing_content_pieces(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('instagram', 'linkedin', 'site', 'tiktok', 'youtube', 'whatsapp')),
  channel_config_id UUID REFERENCES public.marketing_channels(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'draft', 'scheduled', 'published', 'cancelled')),
  published_at TIMESTAMPTZ,
  external_url TEXT,
  caption_override TEXT,
  metrics_reach INTEGER,
  metrics_engagement INTEGER,
  metrics_clicks INTEGER,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2) INDEXES
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_tenant_project
  ON public.marketing_campaigns(tenant_id, project_id, status);

CREATE INDEX IF NOT EXISTS idx_marketing_content_tenant_project
  ON public.marketing_content_pieces(tenant_id, project_id, content_type, status);

CREATE INDEX IF NOT EXISTS idx_marketing_publications_tenant_date
  ON public.marketing_publications(tenant_id, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_marketing_publications_tenant_status_date
  ON public.marketing_publications(tenant_id, status, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_marketing_publications_tenant_content
  ON public.marketing_publications(tenant_id, content_piece_id);

-- ------------------------------------------------------------
-- 3) UPDATED_AT TRIGGERS
-- ------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_marketing_channels_updated_at ON public.marketing_channels;
CREATE TRIGGER trg_marketing_channels_updated_at
BEFORE UPDATE ON public.marketing_channels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_marketing_campaigns_updated_at ON public.marketing_campaigns;
CREATE TRIGGER trg_marketing_campaigns_updated_at
BEFORE UPDATE ON public.marketing_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_marketing_content_updated_at ON public.marketing_content_pieces;
CREATE TRIGGER trg_marketing_content_updated_at
BEFORE UPDATE ON public.marketing_content_pieces
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_marketing_publications_updated_at ON public.marketing_publications;
CREATE TRIGGER trg_marketing_publications_updated_at
BEFORE UPDATE ON public.marketing_publications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------
-- 4) RLS
-- ------------------------------------------------------------

ALTER TABLE public.marketing_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_publications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketing_channels_select ON public.marketing_channels;
DROP POLICY IF EXISTS marketing_channels_admin_write ON public.marketing_channels;
DROP POLICY IF EXISTS marketing_campaigns_select ON public.marketing_campaigns;
DROP POLICY IF EXISTS marketing_campaigns_write ON public.marketing_campaigns;
DROP POLICY IF EXISTS marketing_content_select ON public.marketing_content_pieces;
DROP POLICY IF EXISTS marketing_content_write ON public.marketing_content_pieces;
DROP POLICY IF EXISTS marketing_publications_select ON public.marketing_publications;
DROP POLICY IF EXISTS marketing_publications_write ON public.marketing_publications;

CREATE POLICY marketing_channels_select
ON public.marketing_channels
FOR SELECT TO authenticated
USING (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
);

CREATE POLICY marketing_channels_admin_write
ON public.marketing_channels
FOR ALL TO authenticated
USING (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role = 'admin'
  )
)
WITH CHECK (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND cm.role = 'admin'
  )
);

CREATE POLICY marketing_campaigns_select
ON public.marketing_campaigns
FOR SELECT TO authenticated
USING (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
);

CREATE POLICY marketing_campaigns_write
ON public.marketing_campaigns
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

CREATE POLICY marketing_content_select
ON public.marketing_content_pieces
FOR SELECT TO authenticated
USING (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
);

CREATE POLICY marketing_content_write
ON public.marketing_content_pieces
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

CREATE POLICY marketing_publications_select
ON public.marketing_publications
FOR SELECT TO authenticated
USING (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
);

CREATE POLICY marketing_publications_write
ON public.marketing_publications
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

REVOKE ALL ON TABLE public.marketing_channels FROM authenticated;
REVOKE ALL ON TABLE public.marketing_campaigns FROM authenticated;
REVOKE ALL ON TABLE public.marketing_content_pieces FROM authenticated;
REVOKE ALL ON TABLE public.marketing_publications FROM authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.marketing_channels TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.marketing_campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.marketing_content_pieces TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.marketing_publications TO authenticated;

-- ------------------------------------------------------------
-- 5) SEED DE CANAIS PADRAO
-- ------------------------------------------------------------

INSERT INTO public.marketing_channels (tenant_id, name, platform, color, icon_key, is_active)
SELECT
  t.id,
  c.name,
  c.platform,
  c.color,
  c.icon_key,
  true
FROM public.tenants t
CROSS JOIN (
  VALUES
    ('Instagram', 'instagram', '#E1306C', 'instagram'),
    ('LinkedIn', 'linkedin', '#0A66C2', 'linkedin'),
    ('Site', 'site', '#0F766E', 'globe')
) AS c(name, platform, color, icon_key)
ON CONFLICT (tenant_id, platform) DO NOTHING;

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE 'Migration 020 aplicada (marketing foundation).';
  RAISE NOTICE ' - marketing_channels / marketing_campaigns / marketing_content_pieces / marketing_publications criadas';
  RAISE NOTICE ' - RLS tenant-scoped aplicado';
  RAISE NOTICE ' - canais padrao seedados por tenant';
END $$;
