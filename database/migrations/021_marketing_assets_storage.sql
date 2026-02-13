-- ============================================================
-- MIGRATION 021: MARKETING ASSETS + STORAGE
-- ============================================================
-- Objetivo:
-- 1) Criar tabela marketing_assets (acervo).
-- 2) Aplicar RLS tenant-scoped.
-- 3) Criar bucket e policies de storage para marketing-assets.
-- Dependencia: 020_marketing_foundation.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.marketing_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  content_piece_id UUID REFERENCES public.marketing_content_pieces(id) ON DELETE SET NULL,
  asset_type TEXT NOT NULL CHECK (
    asset_type IN ('image', 'video', 'carousel_slide', 'caption', 'copy', 'audio', 'reference', 'document')
  ),
  file_name TEXT NOT NULL,
  storage_path TEXT UNIQUE,
  public_url TEXT,
  mime_type TEXT,
  file_size_bytes BIGINT,
  width_px INTEGER,
  height_px INTEGER,
  duration_seconds INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  caption_channel TEXT CHECK (caption_channel IN ('instagram', 'linkedin', 'site', 'tiktok', 'youtube', 'whatsapp')),
  caption_text TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  is_approved BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketing_assets_tenant_content
  ON public.marketing_assets(tenant_id, content_piece_id, asset_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketing_assets_tenant_approved
  ON public.marketing_assets(tenant_id, is_approved, created_at DESC);

DROP TRIGGER IF EXISTS trg_marketing_assets_updated_at ON public.marketing_assets;
CREATE TRIGGER trg_marketing_assets_updated_at
BEFORE UPDATE ON public.marketing_assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.marketing_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketing_assets_select ON public.marketing_assets;
DROP POLICY IF EXISTS marketing_assets_write ON public.marketing_assets;

CREATE POLICY marketing_assets_select
ON public.marketing_assets
FOR SELECT TO authenticated
USING (
  tenant_id IN (
    SELECT cm.tenant_id
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
  )
);

CREATE POLICY marketing_assets_write
ON public.marketing_assets
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

REVOKE ALL ON TABLE public.marketing_assets FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.marketing_assets TO authenticated;

-- Bucket privado, leitura por signed URL.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketing-assets',
  'marketing-assets',
  false,
  52428800,
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav',
    'text/plain',
    'text/markdown',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS marketing_assets_select ON storage.objects;
DROP POLICY IF EXISTS marketing_assets_insert ON storage.objects;
DROP POLICY IF EXISTS marketing_assets_delete ON storage.objects;

CREATE POLICY marketing_assets_select ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'marketing-assets'
  AND EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND name LIKE ('tenant-' || cm.tenant_id::text || '/%')
  )
);

CREATE POLICY marketing_assets_insert ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'marketing-assets'
  AND EXISTS (
    SELECT 1
    FROM public.company_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.status = 'active'
      AND name LIKE ('tenant-' || cm.tenant_id::text || '/%')
  )
);

CREATE POLICY marketing_assets_delete ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'marketing-assets'
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
  RAISE NOTICE 'Migration 021 aplicada (marketing assets/storage).';
  RAISE NOTICE ' - marketing_assets criada + RLS';
  RAISE NOTICE ' - bucket marketing-assets criado/atualizado';
  RAISE NOTICE ' - storage policies tenant-scoped aplicadas';
END $$;
