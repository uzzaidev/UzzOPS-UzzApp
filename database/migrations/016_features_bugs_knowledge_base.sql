-- ============================================================
-- MIGRATION 016: FEATURES/BUGS + KNOWLEDGE BASE
-- ============================================================
-- Objetivo:
-- 1) Permitir classificar item como feature ou bug.
-- 2) Adicionar campo de solução textual no próprio item.
-- 3) Adicionar anexos (.md/.txt/.pdf) por item via Storage + metadata.
-- Dependência: 015_harden_permissions_and_tenant_context.sql
-- ============================================================

-- ------------------------------------------------------------
-- 1) FEATURES: tipo de item + solução textual
-- ------------------------------------------------------------

ALTER TABLE features
  ADD COLUMN IF NOT EXISTS work_item_type TEXT NOT NULL DEFAULT 'feature'
    CHECK (work_item_type IN ('feature', 'bug'));

ALTER TABLE features
  ADD COLUMN IF NOT EXISTS solution_notes TEXT;

ALTER TABLE features
  ADD COLUMN IF NOT EXISTS dod_custom_items TEXT[] NOT NULL DEFAULT '{}'::text[];

COMMENT ON COLUMN features.work_item_type IS 'Tipo do item: feature ou bug';
COMMENT ON COLUMN features.solution_notes IS 'Base textual de solução / diagnóstico / decisões';
COMMENT ON COLUMN features.dod_custom_items IS 'Critérios personalizados de DoD definidos na criação/edição do item';

CREATE INDEX IF NOT EXISTS idx_features_work_item_type
  ON features(work_item_type);

-- ------------------------------------------------------------
-- 2) TABELA DE METADATA DOS ANEXOS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS feature_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  mime_type TEXT,
  file_size BIGINT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feature_attachments_feature
  ON feature_attachments(feature_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feature_attachments_tenant
  ON feature_attachments(tenant_id);

ALTER TABLE feature_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation_feature_attachments_select" ON feature_attachments;
DROP POLICY IF EXISTS "tenant_isolation_feature_attachments_insert" ON feature_attachments;
DROP POLICY IF EXISTS "tenant_isolation_feature_attachments_delete" ON feature_attachments;

CREATE POLICY "tenant_isolation_feature_attachments_select" ON feature_attachments
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM company_members
      WHERE user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "tenant_isolation_feature_attachments_insert" ON feature_attachments
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id
      FROM company_members
      WHERE user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "tenant_isolation_feature_attachments_delete" ON feature_attachments
  FOR DELETE TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM company_members
      WHERE user_id = auth.uid()
        AND status = 'active'
    )
  );

REVOKE ALL ON TABLE feature_attachments FROM authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE feature_attachments TO authenticated;

-- ------------------------------------------------------------
-- 3) STORAGE BUCKET + POLICIES
-- ------------------------------------------------------------
-- Bucket privado (não público). Download via signed URL.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'feature-assets',
  'feature-assets',
  false,
  10485760, -- 10 MB
  ARRAY['text/plain', 'text/markdown', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "feature_assets_select" ON storage.objects;
DROP POLICY IF EXISTS "feature_assets_insert" ON storage.objects;
DROP POLICY IF EXISTS "feature_assets_delete" ON storage.objects;

CREATE POLICY "feature_assets_select" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'feature-assets'
  AND EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND name LIKE ('tenant-' || cm.tenant_id::text || '/%')
  )
);

CREATE POLICY "feature_assets_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'feature-assets'
  AND EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND name LIKE ('tenant-' || cm.tenant_id::text || '/%')
  )
);

CREATE POLICY "feature_assets_delete" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'feature-assets'
  AND EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND name LIKE ('tenant-' || cm.tenant_id::text || '/%')
  )
);

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 016 completa!';
  RAISE NOTICE '   • features/work_item_type + solution_notes adicionados';
  RAISE NOTICE '   • feature_attachments criada com RLS por tenant';
  RAISE NOTICE '   • storage bucket feature-assets criado/atualizado';
END $$;
