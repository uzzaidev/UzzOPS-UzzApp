-- ============================================================
-- MIGRATION 022: MD FEEDER FOUNDATION (PHASE 1)
-- ============================================================
-- Objetivo:
-- 1) Adicionar campo de observacoes na tabela features.
-- 2) Criar tabelas de import md_feeder_imports e md_feeder_import_items.
-- 3) Aplicar RLS tenant-scoped e grants para authenticated.
-- Dependencia: 021_marketing_assets_storage.sql
-- ============================================================

ALTER TABLE public.features
  ADD COLUMN IF NOT EXISTS observations JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.features.observations IS
  'Array de observacoes importadas. Schema: [{text, source, imported_at, imported_by_name}]';

CREATE TABLE IF NOT EXISTS public.md_feeder_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  sprint_context TEXT,
  original_filename TEXT NOT NULL,
  file_content TEXT NOT NULL,
  parse_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (parse_status IN ('pending', 'parsed', 'confirmed', 'completed', 'failed')),
  items_total INTEGER NOT NULL DEFAULT 0,
  items_created INTEGER NOT NULL DEFAULT 0,
  items_updated INTEGER NOT NULL DEFAULT 0,
  items_skipped INTEGER NOT NULL DEFAULT 0,
  items_failed INTEGER NOT NULL DEFAULT 0,
  parse_errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  parsed_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.md_feeder_import_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  import_id UUID NOT NULL REFERENCES public.md_feeder_imports(id) ON DELETE CASCADE,
  item_index INTEGER NOT NULL,
  item_type TEXT NOT NULL
    CHECK (item_type IN (
      'feature','epic','spike','spike_result',
      'bug','bug_resolution','planning_result',
      'sprint','sprint_update','task',
      'user_story','daily','daily_member','retrospective',
      'feature_dependency','baseline_metric',
      'marketing_campaign','marketing_post',
      'risk','team_member','uzzapp_client'
    )),
  raw_data JSONB NOT NULL,
  validation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (validation_status IN ('pending','valid','invalid','duplicate','duplicate_with_extras')),
  validation_errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  action TEXT
    CHECK (action IN ('create','update','skip','add_observation') OR action IS NULL),
  entity_type TEXT,
  entity_id UUID,
  entity_code TEXT,
  conflict_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_md_feeder_imports_tenant_created
  ON public.md_feeder_imports(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_md_feeder_imports_project
  ON public.md_feeder_imports(project_id);

CREATE INDEX IF NOT EXISTS idx_md_feeder_items_import_idx
  ON public.md_feeder_import_items(import_id, item_index);

CREATE INDEX IF NOT EXISTS idx_md_feeder_items_tenant
  ON public.md_feeder_import_items(tenant_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_md_feeder_imports_updated_at ON public.md_feeder_imports;
CREATE TRIGGER trg_md_feeder_imports_updated_at
BEFORE UPDATE ON public.md_feeder_imports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.md_feeder_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.md_feeder_import_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS md_feeder_imports_select ON public.md_feeder_imports;
DROP POLICY IF EXISTS md_feeder_imports_write ON public.md_feeder_imports;
DROP POLICY IF EXISTS md_feeder_import_items_select ON public.md_feeder_import_items;
DROP POLICY IF EXISTS md_feeder_import_items_write ON public.md_feeder_import_items;

CREATE POLICY md_feeder_imports_select
ON public.md_feeder_imports
FOR SELECT TO authenticated
USING (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
);

CREATE POLICY md_feeder_imports_write
ON public.md_feeder_imports
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

CREATE POLICY md_feeder_import_items_select
ON public.md_feeder_import_items
FOR SELECT TO authenticated
USING (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
);

CREATE POLICY md_feeder_import_items_write
ON public.md_feeder_import_items
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

REVOKE ALL ON TABLE public.md_feeder_imports FROM authenticated;
REVOKE ALL ON TABLE public.md_feeder_import_items FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.md_feeder_imports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.md_feeder_import_items TO authenticated;

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE 'Migration 022 aplicada (md feeder phase 1).';
  RAISE NOTICE ' - coluna features.observations garantida';
  RAISE NOTICE ' - tabelas md_feeder_imports e md_feeder_import_items criadas';
  RAISE NOTICE ' - RLS tenant-scoped aplicada';
END $$;
