-- ============================================================
-- MIGRATION 017: HARDENING CLEANUP (POST AUDIT)
-- ============================================================
-- Objetivo:
-- 1) Remover policies legadas permissivas (USING/WITH CHECK true).
-- 2) Remover insercao permissiva em company_members.
-- 3) Reduzir superficie de acesso anon em tabelas criticas.
-- 4) Tornar resolucao de tenant deterministica e evitar bootstrap
--    de tenant por "primeiro tenant" no signup.
-- Dependencia: 016_features_bugs_knowledge_base.sql
-- ============================================================

-- ------------------------------------------------------------
-- 1) REMOVER POLICIES LEGADAS PERMISSIVAS
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Authenticated users can delete burndown" ON public.sprint_burndown_snapshots;
DROP POLICY IF EXISTS "Authenticated users can insert burndown" ON public.sprint_burndown_snapshots;
DROP POLICY IF EXISTS "Authenticated users can update burndown" ON public.sprint_burndown_snapshots;
DROP POLICY IF EXISTS "Authenticated users can view burndown" ON public.sprint_burndown_snapshots;
DROP POLICY IF EXISTS "Authenticated users can view baseline" ON public.baseline_metrics;
DROP POLICY IF EXISTS "Authenticated users can view poker results" ON public.planning_poker_results;
DROP POLICY IF EXISTS "Authenticated users can view poker sessions" ON public.planning_poker_sessions;
DROP POLICY IF EXISTS "Authenticated users can view poker votes" ON public.planning_poker_votes;
DROP POLICY IF EXISTS "Authenticated users can view retro actions" ON public.retrospective_actions;

-- Company members: remover insert permissivo por self-service.
DROP POLICY IF EXISTS self_insert_membership ON public.company_members;

-- ------------------------------------------------------------
-- 2) ACL MINIMA PARA ANON EM TABELAS CRITICAS
-- ------------------------------------------------------------

REVOKE ALL ON TABLE public.features FROM anon;
REVOKE ALL ON TABLE public.company_members FROM anon;
REVOKE ALL ON TABLE public.projects FROM anon;
REVOKE ALL ON TABLE public.team_members FROM anon;
REVOKE ALL ON TABLE public.profiles FROM anon;

-- ------------------------------------------------------------
-- 3) FUNCOES DE CONTEXTO DE TENANT
-- ------------------------------------------------------------

-- Deterministica: escolhe a membership ativa mais recente.
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT tenant_id
  FROM public.company_members
  WHERE user_id = auth.uid()
    AND status = 'active'
  ORDER BY COALESCE(joined_at, created_at) DESC, created_at DESC
  LIMIT 1;
$$;

-- Nao vincula mais novo usuario ao "primeiro tenant" automaticamente.
-- Vinculo ocorre apenas se houver convite/pre-cadastro em team_members.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_display_name TEXT;
BEGIN
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, v_display_name)
  ON CONFLICT (user_id) DO UPDATE
    SET full_name = EXCLUDED.full_name;

  IF EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE email = NEW.email
  ) THEN
    UPDATE public.team_members
    SET user_id = NEW.id
    WHERE email = NEW.email
      AND user_id IS NULL;

    INSERT INTO public.company_members (user_id, tenant_id, role, status, joined_at)
    SELECT
      NEW.id,
      tm.tenant_id,
      COALESCE(tm.permission_level, 'member'),
      COALESCE(tm.status, 'pending'),
      CASE WHEN tm.status = 'active' THEN NOW() ELSE NULL END
    FROM public.team_members tm
    WHERE tm.email = NEW.email
    ON CONFLICT (user_id, tenant_id) DO UPDATE
      SET role = EXCLUDED.role,
          status = EXCLUDED.status,
          joined_at = COALESCE(public.company_members.joined_at, EXCLUDED.joined_at);
  END IF;

  RETURN NEW;
END;
$$;

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE 'Migration 017 aplicada (hardening cleanup).';
  RAISE NOTICE ' - Policies permissivas removidas';
  RAISE NOTICE ' - self_insert_membership removida';
  RAISE NOTICE ' - Grants anon minimizados em tabelas criticas';
  RAISE NOTICE ' - Contexto de tenant/singup ajustado';
END $$;
