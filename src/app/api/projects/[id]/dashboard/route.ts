import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function monthRange(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const from = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
  const to = new Date(Date.UTC(y, m + 1, 0)).toISOString().slice(0, 10);
  return { from, to };
}

function toDateOnly(value: unknown): string | null {
  if (!value) return null;
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();

    const { data: project } = await supabase
      .from('projects')
      .select('id, tenant_id, name, code, status, description')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { membership, error: authError } = await requireTenant(supabase, {
      tenantId: project.tenant_id,
    });
    if (authError || !membership) return authError;

    const today = new Date().toISOString().slice(0, 10);
    const month = monthRange(new Date());

    const [
      featuresRes,
      sprintsRes,
      risksRes,
      retrosRes,
      dailiesRes,
      clientsRes,
      publicationsRes,
      contentRes,
      healthRes,
    ] = await Promise.all([
      supabase
        .from('features')
        .select('id, code, name, status, story_points, dod_progress, is_spike, created_at, updated_at')
        .eq('project_id', projectId),
      supabase
        .from('sprints')
        .select('id, code, name, status, start_date, end_date, velocity_target, velocity_actual, created_at, updated_at')
        .eq('project_id', projectId)
        .order('start_date', { ascending: false }),
      supabase
        .from('risks')
        .select('id, title, status, gut_score, created_at, updated_at')
        .eq('project_id', projectId),
      supabase
        .from('retrospective_actions')
        .select('id, status, action_text, created_at, updated_at')
        .eq('project_id', projectId),
      supabase
        .from('daily_scrum_logs')
        .select('id, log_date, impediments, created_at, updated_at')
        .eq('project_id', projectId)
        .order('log_date', { ascending: false })
        .limit(20),
      supabase
        .from('uzzapp_clients')
        .select(
          'id, name, icp_classification, potential_value, monthly_fee_value, negotiation_status, next_action_deadline, funnel_stage, status, closing_probability'
        )
        .eq('tenant_id', membership.tenant_id),
      supabase
        .from('marketing_publications')
        .select(
          'id, channel, status, scheduled_date, published_at, created_at, content_piece:marketing_content_pieces(project_id, title, content_type)'
        )
        .eq('tenant_id', membership.tenant_id)
        .gte('scheduled_date', month.from)
        .lte('scheduled_date', month.to),
      supabase
        .from('marketing_content_pieces')
        .select('id, status, project_id, title, content_type, due_date, updated_at')
        .eq('tenant_id', membership.tenant_id),
      supabase
        .from('scrum_health_metrics')
        .select('overall_health_score, overall_status')
        .eq('project_id', projectId)
        .maybeSingle(),
    ]);

    const features = (featuresRes.data ?? []) as Array<Record<string, any>>;
    const sprints = (sprintsRes.data ?? []) as Array<Record<string, any>>;
    const risks = (risksRes.data ?? []) as Array<Record<string, any>>;
    const retros = (retrosRes.data ?? []) as Array<Record<string, any>>;
    const dailies = (dailiesRes.data ?? []) as Array<Record<string, any>>;
    const clients = (clientsRes.data ?? []) as Array<Record<string, any>>;

    const publications = ((publicationsRes.data ?? []) as Array<Record<string, any>>).filter(
      (p) => p.content_piece?.project_id === projectId
    );
    const content = ((contentRes.data ?? []) as Array<Record<string, any>>).filter(
      (c) => c.project_id === projectId
    );

    const currentSprint =
      sprints.find((s) => s.status === 'active') ??
      sprints.find((s) => s.status === 'planned') ??
      null;

    let sprintPointsTotal = 0;
    let sprintPointsDone = 0;
    if (currentSprint?.id) {
      const { data: sprintFeatures } = await supabase
        .from('sprint_features')
        .select('feature:features(story_points, status)')
        .eq('sprint_id', currentSprint.id);
      const rows = ((sprintFeatures ?? []) as Array<Record<string, any>>).map((r) => r.feature).filter(Boolean);
      sprintPointsTotal = rows.reduce((sum, r) => sum + (Number(r.story_points) || 0), 0);
      sprintPointsDone = rows
        .filter((r) => r.status === 'done')
        .reduce((sum, r) => sum + (Number(r.story_points) || 0), 0);
    }

    const totalFeatures = features.length;
    const featuresDone = features.filter((f) => f.status === 'done').length;
    const featuresInProgress = features.filter((f) => f.status === 'in_progress').length;
    const featuresBlocked = features.filter((f) => f.status === 'blocked').length;
    const progressPct = totalFeatures > 0 ? Math.round((featuresDone / totalFeatures) * 100) : 0;
    const avgDod = totalFeatures > 0
      ? Math.round(features.reduce((sum, f) => sum + (Number(f.dod_progress) || 0), 0) / totalFeatures)
      : 0;

    const criticalRisks = risks.filter((r) => (Number(r.gut_score) || 0) >= 100).length;
    const retroPending = retros.filter((r) => r.status === 'pending').length;
    const retroInProgress = retros.filter((r) => r.status === 'in_progress').length;
    const retroDone = retros.filter((r) => r.status === 'done').length;
    const activeSpikes = features.filter((f) => f.is_spike && f.status !== 'done').length;

    const impedimentsOpen = dailies.reduce((sum, d) => {
      const list = Array.isArray(d.impediments) ? d.impediments : [];
      return sum + list.filter((x) => String(x).trim().length > 0).length;
    }, 0);

    const postsCurrent = publications.length;
    const postsTarget = 18;
    const postsPct = Math.round((postsCurrent / postsTarget) * 100);
    const published = publications.filter((p) => p.status === 'published');
    const publishedOnTime = published.filter((p) => {
      const scheduled = toDateOnly(p.scheduled_date);
      const publishedAt = toDateOnly(p.published_at);
      if (!scheduled || !publishedAt) return false;
      return publishedAt <= scheduled;
    }).length;
    const onTimeRate = published.length > 0 ? Math.round((publishedOnTime / published.length) * 100) : 0;
    const contentByStatus = content.reduce<Record<string, number>>((acc, item) => {
      const key = String(item.status ?? 'unknown');
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const nextPublications = publications
      .filter((p) => (toDateOnly(p.scheduled_date) ?? '9999-12-31') >= today && p.status !== 'cancelled')
      .sort((a, b) => String(a.scheduled_date).localeCompare(String(b.scheduled_date)))
      .slice(0, 3)
      .map((p) => ({
        id: p.id,
        title: String(p.content_piece?.title ?? 'Publicacao'),
        channel: String(p.channel ?? '-'),
        scheduled_date: toDateOnly(p.scheduled_date),
        status: String(p.status ?? '-'),
      }));

    const funnel = clients.reduce<Record<string, number>>((acc, c) => {
      const stage = String(c.funnel_stage ?? 'lead-novo');
      acc[stage] = (acc[stage] ?? 0) + 1;
      return acc;
    }, {});
    const hotLeads = clients
      .filter((c) => c.icp_classification === 'hot')
      .sort((a, b) => (Number(b.closing_probability) || 0) - (Number(a.closing_probability) || 0))
      .slice(0, 3)
      .map((c) => ({
        id: c.id,
        name: String(c.name ?? 'Cliente'),
        closing_probability: Number(c.closing_probability) || 0,
        stage: String(c.funnel_stage ?? '-'),
      }));
    const pipelineValue = clients.reduce((sum, c) => sum + (Number(c.potential_value) || 0), 0);
    const mrrValue = clients.reduce((sum, c) => sum + (Number(c.monthly_fee_value) || 0), 0);
    const overdueActions = clients.filter((c) => {
      const date = toDateOnly(c.next_action_deadline);
      return date != null && date < today && c.status !== 'churned';
    }).length;

    const sprintProgress =
      currentSprint && (Number(currentSprint.velocity_target) || sprintPointsTotal) > 0
        ? Math.round(
            (100 * (Number(currentSprint.velocity_actual) || sprintPointsDone)) /
              (Number(currentSprint.velocity_target) || sprintPointsTotal)
          )
        : 0;

    const fallbackHealth = clamp(
      Math.round(
        progressPct * 0.35 +
          avgDod * 0.25 +
          clamp(sprintProgress, 0, 100) * 0.2 +
          clamp(postsPct, 0, 100) * 0.1 +
          clamp((hotLeads.length / Math.max(1, clients.length)) * 100, 0, 100) * 0.1 -
          clamp(criticalRisks * 8 + featuresBlocked * 2, 0, 35)
      ),
      0,
      100
    );

    const healthScore = Number((healthRes.data as any)?.overall_health_score) || fallbackHealth;
    const healthStatus =
      String((healthRes.data as any)?.overall_status ?? '').trim() ||
      (healthScore >= 75 ? 'healthy' : healthScore >= 50 ? 'attention' : 'critical');

    return NextResponse.json({
      data: {
        project: {
          id: project.id,
          name: project.name,
          code: project.code,
          status: project.status,
          description: project.description,
        },
        kpis: {
          health_score: healthScore,
          health_status: healthStatus,
          sprint_progress: clamp(sprintProgress, 0, 100),
          total_features: totalFeatures,
          features_done: featuresDone,
          features_in_progress: featuresInProgress,
          blocked_features: featuresBlocked,
          critical_risks: criticalRisks,
          posts_current: postsCurrent,
          posts_target: postsTarget,
          hot_leads: hotLeads.length,
          active_leads: clients.filter((c) => c.negotiation_status !== 'Fechado').length,
          pipeline_value: pipelineValue,
        },
        development: {
          current_sprint: currentSprint,
          sprint_points_total: sprintPointsTotal,
          sprint_points_done: sprintPointsDone,
          feature_status_counts: {
            backlog: features.filter((f) => f.status === 'backlog').length,
            todo: features.filter((f) => f.status === 'todo').length,
            in_progress: featuresInProgress,
            review: features.filter((f) => f.status === 'review').length,
            testing: features.filter((f) => f.status === 'testing').length,
            done: featuresDone,
            blocked: featuresBlocked,
          },
          mvp_progress: progressPct,
          dod_average: avgDod,
          retros: {
            pending: retroPending,
            in_progress: retroInProgress,
            done: retroDone,
          },
          spikes: {
            active: activeSpikes,
            total: features.filter((f) => f.is_spike).length,
          },
          impediments_open: impedimentsOpen,
        },
        marketing: {
          posts_current: postsCurrent,
          posts_target: postsTarget,
          posts_progress: clamp(postsPct, 0, 100),
          publication_on_time_rate: clamp(onTimeRate, 0, 100),
          content_pipeline: contentByStatus,
          next_publications: nextPublications,
        },
        crm: {
          funnel,
          hot_leads: hotLeads,
          revenue_summary: {
            potential_total: pipelineValue,
            mrr_total: mrrValue,
          },
          overdue_actions: overdueActions,
        },
      },
    });
  } catch (error) {
    console.error('[Dashboard API] unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

