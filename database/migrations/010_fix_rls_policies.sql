-- ============================================================
-- MIGRATION 010: FIX RLS POLICIES
-- ============================================================
-- Versão: 1.1
-- Data: 2026-02-11
-- Descrição: Corrige policies RLS das migrations 008 e 009 que
--            usavam current_setting('app.current_tenant_id')
--            ou referenciavam a tabela 'profiles' (inexistente).
--            Substitui por políticas simples baseadas em
--            auth.role() = 'authenticated' (app single-tenant).
-- Dependências: 008_sprint_3_metrics.sql, 009_sprint_4_quality.sql
-- ============================================================

BEGIN;

-- ============================================================
-- FIX: sprint_burndown_snapshots (migration 008)
-- ============================================================

DROP POLICY IF EXISTS "Users can view own tenant burndown" ON sprint_burndown_snapshots;
DROP POLICY IF EXISTS "Users can insert own tenant burndown" ON sprint_burndown_snapshots;

CREATE POLICY "Authenticated users can view burndown" ON sprint_burndown_snapshots
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert burndown" ON sprint_burndown_snapshots
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update burndown" ON sprint_burndown_snapshots
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete burndown" ON sprint_burndown_snapshots
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- FIX: baseline_metrics (migration 008)
-- ============================================================

DROP POLICY IF EXISTS "Users can view own tenant baseline" ON baseline_metrics;
DROP POLICY IF EXISTS "Users can manage own tenant baseline" ON baseline_metrics;

CREATE POLICY "Authenticated users can view baseline" ON baseline_metrics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage baseline" ON baseline_metrics
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- FIX: retrospective_actions (migration 009)
-- ============================================================

DROP POLICY IF EXISTS "Users can view own tenant retro actions" ON retrospective_actions;
DROP POLICY IF EXISTS "Users can manage own tenant retro actions" ON retrospective_actions;

CREATE POLICY "Authenticated users can view retro actions" ON retrospective_actions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage retro actions" ON retrospective_actions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- FIX: planning_poker_sessions (migration 009)
-- ============================================================

DROP POLICY IF EXISTS "Users can view own tenant poker sessions" ON planning_poker_sessions;
DROP POLICY IF EXISTS "Users can manage own tenant poker sessions" ON planning_poker_sessions;

CREATE POLICY "Authenticated users can view poker sessions" ON planning_poker_sessions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage poker sessions" ON planning_poker_sessions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- FIX: planning_poker_votes (migration 009)
-- ============================================================

DROP POLICY IF EXISTS "Users can view own tenant poker votes" ON planning_poker_votes;
DROP POLICY IF EXISTS "Users can manage own tenant poker votes" ON planning_poker_votes;

CREATE POLICY "Authenticated users can view poker votes" ON planning_poker_votes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage poker votes" ON planning_poker_votes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- FIX: planning_poker_results (migration 009)
-- ============================================================

DROP POLICY IF EXISTS "Users can view own tenant poker results" ON planning_poker_results;
DROP POLICY IF EXISTS "Users can manage own tenant poker results" ON planning_poker_results;

CREATE POLICY "Authenticated users can view poker results" ON planning_poker_results
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage poker results" ON planning_poker_results
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Notifica PostgREST para recarregar schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 010 completa — RLS policies corrigidas!';
END $$;
