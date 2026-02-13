-- ============================================================
-- MIGRATION 012: TEAM AUTH — Registro aberto + aprovação admin
-- ============================================================
-- Descrição: Vincula Supabase Auth a team_members,
--            adiciona permission_level e status,
--            cria trigger automático no signup.
-- Dependências: 001_init.sql, 011_add_user_id_to_team_members.sql
-- ============================================================

-- Garantir que user_id já existe (idempotente)
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- Nível de permissão no sistema
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS permission_level TEXT NOT NULL DEFAULT 'member'
  CHECK (permission_level IN ('admin', 'member'));

-- Status de aprovação
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'pending', 'inactive'));

-- ============================================================
-- Ajustar membros existentes: já ativos e aprovados
-- ============================================================

UPDATE team_members SET status = 'active' WHERE status IS NULL OR status = 'active';

-- Primeiro membro vira admin
UPDATE team_members
SET permission_level = 'admin'
WHERE id = (
  SELECT id FROM team_members ORDER BY created_at ASC LIMIT 1
);

-- ============================================================
-- TRIGGER: Auto-criar team_member no signup do Supabase Auth
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
  -- Pega o tenant padrão (UzzAI)
  SELECT id INTO v_tenant_id FROM tenants ORDER BY created_at ASC LIMIT 1;

  -- Nome: usa metadata do signup ou parte do email
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Se já existe membro com esse email, apenas vincula o user_id
  IF EXISTS (SELECT 1 FROM public.team_members WHERE email = NEW.email) THEN
    UPDATE public.team_members
    SET user_id = NEW.id
    WHERE email = NEW.email
      AND user_id IS NULL; -- não sobrescreve vínculo existente
  ELSE
    -- Cria novo membro como pendente
    INSERT INTO public.team_members (
      tenant_id,
      name,
      email,
      user_id,
      role,
      permission_level,
      status,
      is_active,
      allocation_percent
    ) VALUES (
      v_tenant_id,
      v_display_name,
      NEW.email,
      NEW.id,
      'Membro',
      'member',
      'pending',
      false,
      100
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Remove trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================
-- RLS: manter política simples (authenticated = acesso total)
-- ============================================================

-- team_members já tem RLS habilitado via migration anterior
-- Garante política atualizada
DROP POLICY IF EXISTS "Authenticated users can manage team members" ON team_members;
CREATE POLICY "Authenticated users can manage team members" ON team_members
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- API: função para aprovar membro
-- ============================================================

CREATE OR REPLACE FUNCTION approve_team_member(p_member_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE team_members
  SET status = 'active',
      is_active = true,
      updated_at = NOW()
  WHERE id = p_member_id;
END;
$$;

GRANT ALL ON team_members TO authenticated;
GRANT EXECUTE ON FUNCTION approve_team_member TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_auth_user TO authenticated;

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 012 completa!';
  RAISE NOTICE '   • permission_level adicionado a team_members';
  RAISE NOTICE '   • status adicionado a team_members';
  RAISE NOTICE '   • Trigger on_auth_user_created criado em auth.users';
  RAISE NOTICE '   • Membros existentes: status=active';
  RAISE NOTICE '   • Primeiro membro: permission_level=admin';
  RAISE NOTICE '   • Novos signups: status=pending (aguarda aprovação)';
END $$;
