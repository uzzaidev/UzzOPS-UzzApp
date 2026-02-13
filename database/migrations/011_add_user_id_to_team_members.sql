-- ============================================================
-- MIGRATION 011: ADD USER_ID TO TEAM_MEMBERS
-- ============================================================
-- Descrição: Vincula membros da equipe ao usuário Supabase Auth
-- ============================================================

ALTER TABLE team_members ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

GRANT ALL ON team_members TO authenticated;

NOTIFY pgrst, 'reload schema';

-- ============================================================
-- COMO VINCULAR SEU USUÁRIO A UM MEMBRO:
--
-- 1. No Supabase Dashboard → Authentication → Users
--    Copie o UUID do seu usuário logado.
--
-- 2. Execute:
--    UPDATE team_members
--    SET user_id = 'SEU-UUID-AQUI'
--    WHERE name = 'SEU-NOME-AQUI';
--
-- OU vincule todos os membros ao mesmo usuário (app single-user):
--    UPDATE team_members
--    SET user_id = auth.uid();
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 011 completa: user_id adicionado a team_members';
  RAISE NOTICE '⚠️  Lembre de vincular seu usuário: UPDATE team_members SET user_id = ''SEU-UUID'' WHERE name = ''SEU-NOME'';';
END $$;
