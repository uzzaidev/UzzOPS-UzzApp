-- ============================================================
-- MIGRATION 026: USER FEEDBACK NATIVE
-- ============================================================
-- Objetivo:
-- 1) Registrar feedback de usuarios com contexto de pagina.
-- 2) Armazenar screenshot no Supabase Storage.
-- 3) Permitir listagem e tratamento por status.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,

  user_id UUID NOT NULL,
  user_email TEXT,
  user_name TEXT,

  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'sugestao'
    CHECK (type IN ('bug', 'sugestao', 'elogio', 'outro')),
  priority TEXT NOT NULL DEFAULT 'media'
    CHECK (priority IN ('critica', 'alta', 'media', 'baixa')),

  screenshot_url TEXT,
  screenshot_path TEXT,

  page_url TEXT,
  page_title TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  status TEXT NOT NULL DEFAULT 'novo'
    CHECK (status IN ('novo', 'em-analise', 'resolvido', 'descartado')),
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_feedback_tenant_status
  ON public.user_feedback(tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_feedback_project_created
  ON public.user_feedback(project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_feedback_tenant_type
  ON public.user_feedback(tenant_id, type, created_at DESC);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_insert_feedback" ON public.user_feedback;
CREATE POLICY "tenant_insert_feedback"
  ON public.user_feedback FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id
      FROM public.company_members
      WHERE user_id = auth.uid()
        AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "tenant_select_feedback" ON public.user_feedback;
CREATE POLICY "tenant_select_feedback"
  ON public.user_feedback FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM public.company_members
      WHERE user_id = auth.uid()
        AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "tenant_update_feedback" ON public.user_feedback;
CREATE POLICY "tenant_update_feedback"
  ON public.user_feedback FOR UPDATE TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id
      FROM public.company_members
      WHERE user_id = auth.uid()
        AND status = 'active'
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id
      FROM public.company_members
      WHERE user_id = auth.uid()
        AND status = 'active'
    )
  );

DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'feedback-screenshots',
    'feedback-screenshots',
    false,
    5242880,
    ARRAY['image/png', 'image/jpeg', 'image/webp']
  )
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'storage.buckets nao encontrado neste ambiente; bucket deve ser criado manualmente.';
END $$;

DO $$
BEGIN
  CREATE POLICY "tenant_upload_feedback_screenshots"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'feedback-screenshots'
      AND auth.uid() IS NOT NULL
    );
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
  WHEN undefined_table THEN
    RAISE NOTICE 'storage.objects nao encontrado neste ambiente.';
END $$;

DO $$
BEGIN
  CREATE POLICY "tenant_read_feedback_screenshots"
    ON storage.objects FOR SELECT TO authenticated
    USING (
      bucket_id = 'feedback-screenshots'
      AND auth.uid() IS NOT NULL
    );
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
  WHEN undefined_table THEN
    RAISE NOTICE 'storage.objects nao encontrado neste ambiente.';
END $$;

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE 'Migration 026 aplicada: user_feedback + feedback-screenshots.';
END $$;
