-- ============================================================
-- MIGRATION 024: MD ITEM TYPE CHECK HOTFIX
-- ============================================================
-- Objetivo:
-- Garantir que md_feeder_import_items.item_type aceite contato_cliente
-- mesmo quando ambientes nao aplicaram migration 023 por completo.
-- ============================================================

ALTER TABLE public.md_feeder_import_items
  DROP CONSTRAINT IF EXISTS md_feeder_import_items_item_type_check;

ALTER TABLE public.md_feeder_import_items
  ADD CONSTRAINT md_feeder_import_items_item_type_check
  CHECK (item_type IN (
    'feature','epic','spike','spike_result',
    'bug','bug_resolution','planning_result',
    'sprint','sprint_update','task',
    'user_story','daily','daily_member','retrospective',
    'feature_dependency','baseline_metric',
    'marketing_campaign','marketing_post',
    'risk','team_member','uzzapp_client','contato_cliente'
  ));

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE 'Migration 024 aplicada (md item_type check hotfix).';
  RAISE NOTICE ' - md_feeder_import_items_item_type_check atualizado';
END $$;

