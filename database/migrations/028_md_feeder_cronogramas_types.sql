-- ============================================================
-- MIGRATION 028: MD FEEDER CRONOGRAMAS TYPES
-- ============================================================
-- Objetivo:
-- Adicionar tipos de cronogramas e governança ao check constraint
-- de md_feeder_import_items.item_type
-- ============================================================
-- Dependências:
-- - Migration 027 (cronogramas_governance_platform)
-- ============================================================

ALTER TABLE public.md_feeder_import_items
  DROP CONSTRAINT IF EXISTS md_feeder_import_items_item_type_check;

ALTER TABLE public.md_feeder_import_items
  ADD CONSTRAINT md_feeder_import_items_item_type_check
  CHECK (item_type IN (
    -- Tipos originais (Fase 1-4)
    'feature','epic','spike','spike_result',
    'bug','bug_resolution','planning_result',
    'sprint','sprint_update','task',
    'user_story','daily','daily_member','retrospective',
    'feature_dependency','baseline_metric',
    'marketing_campaign','marketing_post',
    'risk','team_member','uzzapp_client','contato_cliente',
    -- Tipos de cronogramas e governança (Migration 027)
    'product_charter',
    'outcome_tree',
    'outcome_opportunity',
    'opportunity_solution',
    'solution_test',
    'roadmap',
    'roadmap_item',
    'project_hypothesis',
    'hypothesis_experiment',
    'decision_log',
    'adr',
    'sprint_ceremony',
    'release_forecast',
    'pilot_program',
    'pilot_office',
    'pilot_validation_event',
    'product_changelog'
  ));

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE 'Migration 028 aplicada (md feeder cronogramas types).';
  RAISE NOTICE ' - md_feeder_import_items_item_type_check atualizado com tipos de cronogramas';
END $$;

