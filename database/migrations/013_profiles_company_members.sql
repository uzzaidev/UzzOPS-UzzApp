-- ============================================================
-- MIGRATION 013: PROFILES + COMPANY_MEMBERS (Multi-Tenancy Real)
-- ============================================================
-- Descrição: Cria a estrutura correta de multi-tenancy:
--   profiles (1:1 com auth.users) + company_members (M2M user ↔ tenant)
-- Dependências: 012_team_auth.sql
-- Contexto: Atualmente team_members mistura perfil pessoal com vínculo
--           à empresa e sem M2M. Isso impede um usuário de pertencer a
--           múltiplas empresas com roles diferentes por empresa.
-- ============================================================

-- ============================================================
-- PARTE 1: TABELA PROFILES (perfil pessoal, 1:1 com auth.users)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- RLS: cada usuário vê e edita apenas o próprio perfil
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

GRANT ALL ON profiles TO authenticated;

-- ============================================================
-- PARTE 2: TABELA COMPANY_MEMBERS (M2M user ↔ tenant com role)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('admin', 'member', 'viewer')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('active', 'pending', 'inactive')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, tenant_id) -- um usuário tem 1 role por empresa
);

CREATE INDEX IF NOT EXISTS idx_company_members_user_id ON company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_company_members_tenant_id ON company_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_company_members_status ON company_members(user_id, status);

-- RLS: usuário vê seus próprios vínculos; admins veem todos da sua empresa
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own memberships" ON company_members;
CREATE POLICY "Users can view own memberships" ON company_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR
    tenant_id IN (
      SELECT tenant_id FROM company_members cm2
      WHERE cm2.user_id = auth.uid()
        AND cm2.status = 'active'
        AND cm2.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage memberships" ON company_members;
CREATE POLICY "Admins can manage memberships" ON company_members
  FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM company_members cm2
      WHERE cm2.user_id = auth.uid()
        AND cm2.status = 'active'
        AND cm2.role = 'admin'
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM company_members cm2
      WHERE cm2.user_id = auth.uid()
        AND cm2.status = 'active'
        AND cm2.role = 'admin'
    )
  );

-- Permite insert próprio (para registro inicial via trigger)
DROP POLICY IF EXISTS "Service role can insert memberships" ON company_members;
CREATE POLICY "Service role can insert memberships" ON company_members
  FOR INSERT TO authenticated
  WITH CHECK (true);

GRANT ALL ON company_members TO authenticated;

-- ============================================================
-- PARTE 3: MIGRAR DADOS EXISTENTES
-- Copia vínculos de team_members → company_members
-- ============================================================

-- Seed profiles para usuários existentes em auth.users
INSERT INTO public.profiles (user_id, full_name, avatar_url)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->>'avatar_url'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
);

-- Seed company_members a partir de team_members que já têm user_id
INSERT INTO public.company_members (user_id, tenant_id, role, status, joined_at)
SELECT
  tm.user_id,
  tm.tenant_id,
  COALESCE(tm.permission_level, 'member') AS role,
  COALESCE(tm.status, 'active') AS status,
  CASE WHEN tm.status = 'active' THEN tm.created_at ELSE NULL END AS joined_at
FROM public.team_members tm
WHERE tm.user_id IS NOT NULL
ON CONFLICT (user_id, tenant_id) DO UPDATE
  SET role = EXCLUDED.role,
      status = EXCLUDED.status,
      joined_at = EXCLUDED.joined_at;

-- ============================================================
-- PARTE 4: FUNÇÕES HELPER
-- ============================================================

-- Retorna o tenant_id ativo do usuário autenticado
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id
  FROM public.company_members
  WHERE user_id = auth.uid()
    AND status = 'active'
  LIMIT 1;
$$;

-- Verifica se o usuário autenticado é admin no tenant informado
CREATE OR REPLACE FUNCTION public.is_admin_in_tenant(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_members
    WHERE user_id = auth.uid()
      AND tenant_id = p_tenant_id
      AND role = 'admin'
      AND status = 'active'
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_user_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_in_tenant(UUID) TO authenticated;

-- ============================================================
-- PARTE 5: ATUALIZAR TRIGGER handle_new_auth_user
-- Agora cria em profiles + company_members (não mais em team_members)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_display_name TEXT;
BEGIN
  -- Nome: usa metadata do signup ou parte do email
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- 1. Criar/atualizar perfil pessoal
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, v_display_name)
  ON CONFLICT (user_id) DO UPDATE
    SET full_name = EXCLUDED.full_name;

  -- 2. Pega o tenant padrão (UzzAI — primeiro tenant criado)
  SELECT id INTO v_tenant_id FROM public.tenants ORDER BY created_at ASC LIMIT 1;

  -- 3. Vincular/criar membership na empresa
  IF EXISTS (SELECT 1 FROM public.team_members WHERE email = NEW.email) THEN
    -- Usuário já existe em team_members: vincular user_id e criar company_members
    UPDATE public.team_members
    SET user_id = NEW.id
    WHERE email = NEW.email AND user_id IS NULL;

    -- Pegar role e status existentes
    INSERT INTO public.company_members (user_id, tenant_id, role, status, joined_at)
    SELECT
      NEW.id,
      tm.tenant_id,
      COALESCE(tm.permission_level, 'member'),
      COALESCE(tm.status, 'active'),
      CASE WHEN tm.status = 'active' THEN NOW() ELSE NULL END
    FROM public.team_members tm
    WHERE tm.email = NEW.email
    ON CONFLICT (user_id, tenant_id) DO UPDATE
      SET role = EXCLUDED.role,
          status = EXCLUDED.status;
  ELSE
    -- Novo usuário: criar como pending
    INSERT INTO public.company_members (user_id, tenant_id, role, status)
    VALUES (NEW.id, v_tenant_id, 'member', 'pending')
    ON CONFLICT (user_id, tenant_id) DO NOTHING;

    -- Também criar em team_members para manter compatibilidade
    INSERT INTO public.team_members (
      tenant_id, name, email, user_id, role,
      permission_level, status, is_active, allocation_percent
    ) VALUES (
      v_tenant_id, v_display_name, NEW.email, NEW.id, 'Membro',
      'member', 'pending', false, 100
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================
-- PARTE 6: TRIGGER updated_at para novas tabelas
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_company_members_updated_at ON company_members;
CREATE TRIGGER set_company_members_updated_at
BEFORE UPDATE ON company_members
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VERIFICAÇÕES PÓS-MIGRATION
-- ============================================================

DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'profiles') = 1,
    'Tabela profiles não criada';
  ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'company_members') = 1,
    'Tabela company_members não criada';
  RAISE NOTICE '✅ Migration 013 completa!';
  RAISE NOTICE '   • profiles criada (1:1 com auth.users)';
  RAISE NOTICE '   • company_members criada (M2M user ↔ tenant)';
  RAISE NOTICE '   • Dados existentes migrados de team_members';
  RAISE NOTICE '   • Trigger handle_new_auth_user atualizado';
  RAISE NOTICE '   • Funções get_user_tenant_id() e is_admin_in_tenant() criadas';
END $$;

NOTIFY pgrst, 'reload schema';
