import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';

async function authProject(supabase: Awaited<ReturnType<typeof createClient>>, projectId: string) {
  const { data: project } = await supabase
    .from('projects')
    .select('id, tenant_id')
    .eq('id', projectId)
    .single();

  if (!project) return { error: NextResponse.json({ error: 'Project not found' }, { status: 404 }) };

  const { membership, error } = await requireTenant(supabase, { tenantId: project.tenant_id });
  if (error || !membership) return { error };
  return { project, membership };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    const auth = await authProject(supabase, projectId);
    if ('error' in auth) return auth.error;

    const tenantId = auth.membership.tenant_id;

    const [
      chartersRes,
      outcomeTreesRes,
      opportunitiesRes,
      solutionsRes,
      testsRes,
      roadmapsRes,
      roadmapItemsRes,
      hypothesesRes,
      experimentsRes,
      decisionsRes,
      adrsRes,
      ceremoniesRes,
      forecastsRes,
      pilotsRes,
      pilotOfficesRes,
      pilotEventsRes,
      changelogRes,
    ] = await Promise.all([
      supabase.from('product_charters').select('id, status').eq('tenant_id', tenantId).eq('project_id', projectId),
      supabase.from('outcome_trees').select('id, status').eq('tenant_id', tenantId).eq('project_id', projectId),
      supabase.from('outcome_opportunities').select('id, status').eq('tenant_id', tenantId).eq('project_id', projectId),
      supabase.from('opportunity_solutions').select('id, maturity').eq('tenant_id', tenantId).eq('project_id', projectId),
      supabase.from('solution_tests').select('id, test_type, result, created_at').eq('tenant_id', tenantId).eq('project_id', projectId).order('created_at', { ascending: false }).limit(5),
      supabase.from('roadmaps').select('id, status').eq('tenant_id', tenantId).eq('project_id', projectId),
      supabase.from('roadmap_items').select('id, status, item_type, planned_start, planned_end').eq('tenant_id', tenantId).eq('project_id', projectId),
      supabase.from('project_hypotheses').select('id, status, risk_type').eq('tenant_id', tenantId).eq('project_id', projectId),
      supabase.from('hypothesis_experiments').select('id, outcome, experiment_type, created_at').eq('tenant_id', tenantId).eq('project_id', projectId).order('created_at', { ascending: false }).limit(5),
      supabase.from('project_decision_log').select('id, category, decision_date, status').eq('tenant_id', tenantId).eq('project_id', projectId).order('decision_date', { ascending: false }).limit(10),
      supabase.from('architecture_decision_records').select('id, adr_code, status, created_at').eq('tenant_id', tenantId).eq('project_id', projectId).order('created_at', { ascending: false }).limit(10),
      supabase.from('sprint_ceremonies').select('id, ceremony_type, session_date').eq('tenant_id', tenantId).eq('project_id', projectId).order('session_date', { ascending: false }).limit(10),
      supabase.from('release_forecasts').select('id, forecast_model, generated_at, label').eq('tenant_id', tenantId).eq('project_id', projectId).order('generated_at', { ascending: false }).limit(5),
      supabase.from('pilot_programs').select('id, status, start_date, end_date').eq('tenant_id', tenantId).eq('project_id', projectId),
      supabase.from('pilot_offices').select('id, status').eq('tenant_id', tenantId).eq('project_id', projectId),
      supabase.from('pilot_validation_events').select('id, event_type, event_date, decision').eq('tenant_id', tenantId).eq('project_id', projectId).order('event_date', { ascending: false }).limit(10),
      supabase.from('product_changelog_entries').select('id, change_type, change_date, title').eq('tenant_id', tenantId).eq('project_id', projectId).order('change_date', { ascending: false }).limit(10),
    ]);

    const count = (x: any) => x?.data?.length ?? 0;

    const hypotheses = hypothesesRes.data ?? [];
    const roadmapItems = roadmapItemsRes.data ?? [];
    const pilotPrograms = pilotsRes.data ?? [];

    return NextResponse.json({
      data: {
        counts: {
          charters: count(chartersRes),
          outcome_trees: count(outcomeTreesRes),
          opportunities: count(opportunitiesRes),
          solutions: count(solutionsRes),
          solution_tests: count(testsRes),
          roadmaps: count(roadmapsRes),
          roadmap_items: count(roadmapItemsRes),
          hypotheses: count(hypothesesRes),
          experiments: count(experimentsRes),
          decisions: count(decisionsRes),
          adrs: count(adrsRes),
          ceremonies: count(ceremoniesRes),
          forecasts: count(forecastsRes),
          pilots: count(pilotsRes),
          pilot_offices: count(pilotOfficesRes),
          pilot_events: count(pilotEventsRes),
          changelog: count(changelogRes),
        },
        health: {
          hypotheses_validated: hypotheses.filter((h: any) => h.status === 'validated').length,
          hypotheses_invalidated: hypotheses.filter((h: any) => h.status === 'invalidated').length,
          roadmap_items_done: roadmapItems.filter((x: any) => x.status === 'done').length,
          roadmap_items_total: roadmapItems.length,
          pilots_running: pilotPrograms.filter((p: any) => p.status === 'running').length,
        },
        latest: {
          decision_log: decisionsRes.data ?? [],
          adrs: adrsRes.data ?? [],
          ceremonies: ceremoniesRes.data ?? [],
          forecasts: forecastsRes.data ?? [],
          pilot_events: pilotEventsRes.data ?? [],
          changelog: changelogRes.data ?? [],
          solution_tests: testsRes.data ?? [],
          hypothesis_experiments: experimentsRes.data ?? [],
        },
      },
    });
  } catch (error) {
    console.error('[cronogramas/overview] unexpected error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

