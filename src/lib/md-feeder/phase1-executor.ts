import type { SupabaseClient } from '@supabase/supabase-js';
import type { Phase1ValidatedItem } from './parser';

type ImportContext = {
  tenantId: string;
  projectId: string | null;
  importId: string;
  sourceName: string;
  actorUserId: string | null;
  actorName: string;
};

type ExecutionResult = {
  index: number;
  status: 'created' | 'updated' | 'skipped' | 'failed';
  entityId: string | null;
  entityCode: string | null;
  message: string;
};

function asString(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number') return String(v);
  return '';
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => asString(x)).filter(Boolean);
}

function asMoneyNumber(v: unknown): number | null {
  const raw = asString(v);
  if (!raw) return null;
  const normalized = raw
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function asDurationMinutes(v: unknown): number | null {
  const raw = asString(v);
  if (!raw) return null;
  const direct = Number(raw);
  if (Number.isFinite(direct)) return Math.max(0, Math.trunc(direct));

  const m = /(?:(\d+)h)?(?:(\d+)m)?/i.exec(raw);
  if (!m) return null;
  const h = m[1] ? Number(m[1]) : 0;
  const min = m[2] ? Number(m[2]) : 0;
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
  return (h * 60) + min;
}

function asPercentNumber(v: unknown): number | null {
  const raw = asString(v);
  if (!raw) return null;
  const n = Number(raw.replace('%', '').trim());
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.trunc(n)));
}

function asJsonObject(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  const raw = asString(v);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

function asJsonArray(v: unknown): unknown[] | null {
  if (Array.isArray(v)) return v;
  const raw = asString(v);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function extractSectionBullets(summary: string, sectionTitles: string[]): string[] {
  if (!summary) return [];
  const escaped = sectionTitles.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`##\\s+(?:${escaped.join('|')})[\\s\\S]*?(?=\\n##\\s+|$)`, 'i');
  const match = re.exec(summary);
  if (!match?.[0]) return [];
  return match[0]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- ') || /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^-+\s+/, '').replace(/^\d+\.\s+/, '').trim())
    .filter(Boolean);
}

function parseChecklist(summary: string): Array<{ item: string; done: boolean }> {
  if (!summary) return [];
  const re = /##\s+CHECKLIST DE QUALIDADE[\s\S]*?(?=\n##\s+|$)/i;
  const match = re.exec(summary);
  if (!match?.[0]) return [];
  return match[0]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- [ ]') || line.startsWith('- [x]') || line.startsWith('- [X]'))
    .map((line) => ({
      item: line.replace(/^- \[[xX ]\]\s*/, '').trim(),
      done: line.startsWith('- [x]') || line.startsWith('- [X]'),
    }))
    .filter((x) => x.item);
}

function normalizePersonRef(v: unknown): string {
  const raw = asString(v);
  if (!raw) return '';
  return raw.replace(/\[\[|\]\]/g, '').trim();
}

async function resolveTeamMemberIdByName(
  supabase: SupabaseClient,
  tenantId: string,
  ref: unknown
) {
  const name = normalizePersonRef(ref);
  if (!name) return null;
  const { data } = await supabase
    .from('team_members')
    .select('id')
    .eq('tenant_id', tenantId)
    .ilike('name', name)
    .limit(1)
    .maybeSingle();
  return ((data as any)?.id as string | undefined) ?? null;
}

async function appendFeatureObservation(
  supabase: SupabaseClient,
  featureId: string,
  rawText: string,
  ctx: ImportContext
) {
  if (!rawText) return;
  const { data: feature } = await supabase
    .from('features')
    .select('observations')
    .eq('id', featureId)
    .single();

  const current = Array.isArray((feature as any)?.observations)
    ? ([...(feature as any).observations] as unknown[])
    : [];

  current.push({
    text: rawText,
    source: ctx.sourceName,
    imported_at: new Date().toISOString(),
    imported_by_name: ctx.actorName,
  });

  await supabase.from('features').update({ observations: current }).eq('id', featureId);
}

export async function generateNextFeatureCode(
  supabase: SupabaseClient,
  tenantId: string,
  projectId: string | null
) {
  let q = supabase.from('features').select('code').eq('tenant_id', tenantId).ilike('code', 'F-%');
  if (projectId) q = q.eq('project_id', projectId);
  const { data } = await q;
  let maxN = 0;
  for (const row of data ?? []) {
    const code = String((row as any).code ?? '').toUpperCase();
    const n = Number.parseInt(code.replace(/^F-/, ''), 10);
    if (!Number.isNaN(n) && n > maxN) maxN = n;
  }
  return `F-${String(maxN + 1).padStart(3, '0')}`;
}

async function createFeatureOrBug(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  const raw = item.rawData;
  const providedCode = asString(raw.code).toUpperCase();
  const code = providedCode || (await generateNextFeatureCode(supabase, ctx.tenantId, ctx.projectId));
  const workItemType = item.itemType === 'bug' ? 'bug' : 'feature';
  const isEpic = item.itemType === 'epic';
  const isSpike = item.itemType === 'spike';

  const payload = {
    tenant_id: ctx.tenantId,
    project_id: ctx.projectId,
    code,
    name: asString(raw.name),
    description: asString(raw.description) || null,
    category: asString(raw.category),
    version: asString(raw.version).toUpperCase() || 'MVP',
    status: asString(raw.status) || 'backlog',
    priority: asString(raw.priority).toUpperCase() || 'P2',
    responsible: asStringArray(raw.responsible),
    due_date: asString(raw.due_date) || null,
    story_points:
      raw.story_points == null || Number.isNaN(Number(raw.story_points))
        ? null
        : Number(raw.story_points),
    work_item_type: workItemType,
    is_epic: isEpic,
    is_spike: isSpike,
    spike_timebox_hours:
      raw.spike_timebox_hours == null || Number.isNaN(Number(raw.spike_timebox_hours))
        ? null
        : Number(raw.spike_timebox_hours),
    spike_outcome: asString(raw.spike_outcome) || null,
    solution_notes: asString(raw.solution_notes) || null,
    observations: [],
  };

  const { data, error } = await supabase.from('features').insert(payload).select('id, code').single();
  if (error) {
    throw new Error(error.message);
  }

  const observation = asString(raw.observation);
  if (observation) {
    await appendFeatureObservation(supabase, (data as any).id, observation, ctx);
  }

  return { id: (data as any).id as string, code: (data as any).code as string };
}

async function applyEpicDecomposition(
  supabase: SupabaseClient,
  epicId: string,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  const raw = item.rawData;
  const strategy = asString(raw.decomposition_strategy) || 'manual';
  const childCodes = asStringArray(raw.child_codes).map((v) => v.toUpperCase());
  const childNames = asStringArray(raw.child_names);

  for (const code of childCodes) {
    const feature = await resolveFeatureIdByCode(supabase, ctx.tenantId, code);
    if (!feature?.id) continue;
    await supabase
      .from('epic_decomposition')
      .upsert({ epic_id: epicId, child_story_id: feature.id, decomposition_strategy: strategy });
  }

  for (const name of childNames) {
    if (!ctx.projectId) continue;
    const newCode = await generateNextFeatureCode(supabase, ctx.tenantId, ctx.projectId);
    const { data: child } = await supabase
      .from('features')
      .insert({
        tenant_id: ctx.tenantId,
        project_id: ctx.projectId,
        code: newCode,
        name,
        description: asString(raw.child_description) || null,
        category: asString(raw.category) || 'Produto',
        version: asString(raw.version).toUpperCase() || 'V1',
        status: 'backlog',
        priority: asString(raw.priority).toUpperCase() || 'P2',
        work_item_type: 'feature',
      })
      .select('id')
      .single();
    if (!(child as any)?.id) continue;
    await supabase
      .from('epic_decomposition')
      .upsert({ epic_id: epicId, child_story_id: (child as any).id, decomposition_strategy: strategy });
  }
}

async function applyBugResolution(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  const raw = item.rawData;
  const code = asString(raw.code).toUpperCase();
  const nextStatus = asString(raw.status);
  const solutionNotes = asString(raw.solution_notes) || null;

  const { data: feature, error: featureError } = await supabase
    .from('features')
    .select('id, code, status, project_id')
    .eq('tenant_id', ctx.tenantId)
    .eq('code', code)
    .single();

  if (featureError || !feature) {
    throw new Error(`Feature/bug com code ${code} nao encontrado.`);
  }

  const { error: updateError } = await supabase
    .from('features')
    .update({
      status: nextStatus,
      solution_notes: solutionNotes,
    })
    .eq('id', (feature as any).id);
  if (updateError) {
    throw new Error(updateError.message);
  }

  const historyPayload = {
    tenant_id: ctx.tenantId,
    project_id: (feature as any).project_id ?? ctx.projectId,
    feature_id: (feature as any).id,
    from_status: (feature as any).status ?? null,
    to_status: nextStatus,
    changed_by: ctx.actorUserId,
  };
  await supabase.from('work_item_status_history').insert(historyPayload);

  const observation = asString(raw.observation);
  if (observation) {
    await appendFeatureObservation(supabase, (feature as any).id, observation, ctx);
  }

  return { id: (feature as any).id as string, code: (feature as any).code as string };
}

async function applyObservationToExisting(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  const code = item.entityCode ?? asString(item.rawData.code).toUpperCase();
  const { data: feature, error } = await supabase
    .from('features')
    .select('id, code')
    .eq('tenant_id', ctx.tenantId)
    .eq('code', code)
    .single();
  if (error || !feature) {
    throw new Error(`Nao foi possivel localizar feature ${code} para observacao.`);
  }
  const observation = asString(item.rawData.observation);
  await appendFeatureObservation(supabase, (feature as any).id, observation, ctx);
  return { id: (feature as any).id as string, code: (feature as any).code as string };
}

async function createRisk(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  const raw = item.rawData;
  const { count } = await supabase
    .from('risks')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', ctx.tenantId);
  const nextPublicId = `RSK-${String((count ?? 0) + 1).padStart(3, '0')}`;
  const publicId = asString(raw.public_id).toUpperCase() || nextPublicId;

  const payload = {
    tenant_id: ctx.tenantId,
    project_id: ctx.projectId,
    public_id: publicId,
    title: asString(raw.title),
    description: asString(raw.description) || null,
    gut_g: Number(raw.gut_g ?? 1),
    gut_u: Number(raw.gut_u ?? 1),
    gut_t: Number(raw.gut_t ?? 1),
    status: asString(raw.status) || 'identified',
    mitigation_plan: asString(raw.mitigation_plan) || null,
    owner_id: null as string | null,
  };

  const { data, error } = await supabase.from('risks').insert(payload).select('id, public_id').single();
  if (error || !data) throw new Error(error?.message ?? 'Falha ao criar risk.');
  return { id: (data as any).id as string, code: (data as any).public_id as string };
}

async function createRetrospective(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  if (!ctx.projectId) throw new Error('project_id obrigatorio para retrospective.');
  const raw = item.rawData;

  let sprintId = asString(raw.sprint_id);
  if (!sprintId) {
    const sprintCode = asString(raw.sprint_code);
    if (sprintCode) {
      const { data: sprintByCode } = await supabase
        .from('sprints')
        .select('id')
        .eq('tenant_id', ctx.tenantId)
        .eq('project_id', ctx.projectId)
        .eq('code', sprintCode)
        .single();
      sprintId = (sprintByCode as any)?.id ?? '';
    }
  }
  if (!sprintId) {
    const { data: activeSprint } = await supabase
      .from('sprints')
      .select('id')
      .eq('tenant_id', ctx.tenantId)
      .eq('project_id', ctx.projectId)
      .eq('status', 'active')
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();
    sprintId = (activeSprint as any)?.id ?? '';
  }
  if (!sprintId) throw new Error('Nao foi possivel determinar sprint_id para retrospective.');

  const payload = {
    tenant_id: ctx.tenantId,
    sprint_id: sprintId,
    project_id: ctx.projectId,
    category: asString(raw.category) || 'needs_improvement',
    action_text: asString(raw.action_text),
    status: asString(raw.status) || 'pending',
    owner_id: null as string | null,
    due_date: asString(raw.due_date) || null,
    success_criteria: asString(raw.success_criteria) || null,
    outcome: asString(raw.outcome) || null,
  };
  const { data, error } = await supabase
    .from('retrospective_actions')
    .insert(payload)
    .select('id')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Falha ao criar retrospective.');
  return { id: (data as any).id as string, code: '' };
}

async function applyPlanningResult(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  const raw = item.rawData;
  const code = asString(raw.code).toUpperCase();
  const { data: feature, error } = await supabase
    .from('features')
    .select('id, code')
    .eq('tenant_id', ctx.tenantId)
    .eq('code', code)
    .single();
  if (error || !feature) throw new Error(`Feature ${code} nao encontrada para planning_result.`);

  const patch: Record<string, unknown> = {};
  if (raw.story_points != null && !Number.isNaN(Number(raw.story_points))) {
    patch.story_points = Number(raw.story_points);
  }
  if (raw.business_value != null && !Number.isNaN(Number(raw.business_value))) {
    patch.business_value = Number(raw.business_value);
  }
  if (raw.work_effort != null && !Number.isNaN(Number(raw.work_effort))) {
    patch.work_effort = Number(raw.work_effort);
  }
  if (Object.keys(patch).length === 0 && raw.final_value != null && !Number.isNaN(Number(raw.final_value))) {
    patch.story_points = Number(raw.final_value);
  }
  if (Object.keys(patch).length === 0) {
    throw new Error('planning_result sem campos numericos validos para atualizar.');
  }

  const { error: updateError } = await supabase.from('features').update(patch).eq('id', (feature as any).id);
  if (updateError) throw new Error(updateError.message);
  return { id: (feature as any).id as string, code: (feature as any).code as string };
}

async function upsertBaselineMetric(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  if (!ctx.projectId) throw new Error('project_id obrigatorio para baseline_metric.');
  const raw = item.rawData;
  const payload = {
    tenant_id: ctx.tenantId,
    project_id: ctx.projectId,
    metric_name: asString(raw.metric_name),
    metric_category: asString(raw.metric_category),
    baseline_value: raw.baseline_value == null ? null : Number(raw.baseline_value),
    target_value: raw.target_value == null ? null : Number(raw.target_value),
    current_value: raw.current_value == null ? null : Number(raw.current_value),
    unit: asString(raw.unit) || 'number',
    baseline_date: asString(raw.baseline_date),
    target_date: asString(raw.target_date) || null,
    last_measured_date: asString(raw.last_measured_date) || null,
    description: asString(raw.description) || null,
    notes: asString(raw.notes) || null,
  };
  const { data, error } = await supabase
    .from('baseline_metrics')
    .upsert(payload, { onConflict: 'project_id,metric_name' })
    .select('id, metric_name')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Falha ao upsert baseline_metric.');
  return { id: (data as any).id as string, code: (data as any).metric_name as string };
}

async function createMarketingCampaign(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  const raw = item.rawData;
  const payload = {
    tenant_id: ctx.tenantId,
    project_id: ctx.projectId,
    name: asString(raw.name),
    description: asString(raw.description) || null,
    objective: asString(raw.objective) || null,
    start_date: asString(raw.start_date) || null,
    end_date: asString(raw.end_date) || null,
    status: asString(raw.status) || 'draft',
    color: asString(raw.color) || '#3b82f6',
    created_by: ctx.actorUserId,
  };
  const { data, error } = await supabase
    .from('marketing_campaigns')
    .insert(payload)
    .select('id, name')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Falha ao criar marketing_campaign.');
  return { id: (data as any).id as string, code: (data as any).name as string };
}

async function createMarketingPost(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  const raw = item.rawData;
  const { count } = await supabase
    .from('marketing_content_pieces')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', ctx.tenantId);
  const code = asString(raw.code) || `MKT-${String((count ?? 0) + 1).padStart(3, '0')}`;

  let campaignId: string | null = null;
  const campaignName = asString(raw.campaign_name);
  if (campaignName) {
    const { data: campaign } = await supabase
      .from('marketing_campaigns')
      .select('id')
      .eq('tenant_id', ctx.tenantId)
      .ilike('name', campaignName)
      .limit(1)
      .maybeSingle();
    campaignId = (campaign as any)?.id ?? null;
  }

  const { data: content, error: contentError } = await supabase
    .from('marketing_content_pieces')
    .insert({
      tenant_id: ctx.tenantId,
      project_id: ctx.projectId,
      campaign_id: campaignId,
      code,
      title: asString(raw.title),
      topic: asString(raw.topic) || null,
      content_type: asString(raw.content_type),
      objective: asString(raw.objective) || null,
      brief: asString(raw.brief) || null,
      caption_base: asString(raw.caption_base) || null,
      hashtags: asStringArray(raw.hashtags),
      cta: asString(raw.cta) || null,
      status: asString(raw.content_status) || 'idea',
      responsible_id: null as string | null,
      due_date: asString(raw.due_date) || null,
      notes: asString(raw.notes) || null,
      created_by: ctx.actorUserId,
    })
    .select('id, code')
    .single();
  if (contentError || !content) throw new Error(contentError?.message ?? 'Falha ao criar marketing_content.');

  const { error: pubError } = await supabase.from('marketing_publications').insert({
    tenant_id: ctx.tenantId,
    content_piece_id: (content as any).id,
    channel: asString(raw.channel),
    scheduled_date: asString(raw.scheduled_date),
    scheduled_time: asString(raw.scheduled_time) || null,
    status: asString(raw.status) || 'scheduled',
    caption_override: asString(raw.caption_override) || null,
    notes: asString(raw.publication_notes) || null,
    created_by: ctx.actorUserId,
  });
  if (pubError) throw new Error(pubError.message);

  return { id: (content as any).id as string, code: (content as any).code as string };
}

async function resolveFeatureIdByCode(
  supabase: SupabaseClient,
  tenantId: string,
  code: string
) {
  const { data: feature } = await supabase
    .from('features')
    .select('id, code, project_id')
    .eq('tenant_id', tenantId)
    .eq('code', code)
    .maybeSingle();
  return feature as { id: string; code: string; project_id: string | null } | null;
}

async function generateNextSprintCode(
  supabase: SupabaseClient,
  tenantId: string,
  projectId: string
) {
  const { data } = await supabase
    .from('sprints')
    .select('code')
    .eq('tenant_id', tenantId)
    .eq('project_id', projectId)
    .ilike('code', 'SPR-%');
  let maxN = 0;
  for (const row of data ?? []) {
    const n = Number.parseInt(String((row as any).code ?? '').replace(/^SPR-/, ''), 10);
    if (!Number.isNaN(n) && n > maxN) maxN = n;
  }
  return `SPR-${String(maxN + 1).padStart(3, '0')}`;
}

async function generateNextUserStoryPublicId(
  supabase: SupabaseClient,
  tenantId: string
) {
  const { data } = await supabase.from('user_stories').select('public_id').eq('tenant_id', tenantId);
  let maxN = 0;
  for (const row of data ?? []) {
    const n = Number.parseInt(String((row as any).public_id ?? '').replace(/^US-/, ''), 10);
    if (!Number.isNaN(n) && n > maxN) maxN = n;
  }
  return `US-${String(maxN + 1).padStart(3, '0')}`;
}

async function resolveTeamMemberId(
  supabase: SupabaseClient,
  ctx: ImportContext,
  memberName?: string
) {
  if (memberName) {
    const { data: byName } = await supabase
      .from('team_members')
      .select('id')
      .eq('tenant_id', ctx.tenantId)
      .ilike('name', memberName)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();
    if ((byName as any)?.id) return (byName as any).id as string;
  }

  if (ctx.actorUserId) {
    const { data: byUser } = await supabase
      .from('team_members')
      .select('id')
      .eq('tenant_id', ctx.tenantId)
      .eq('user_id', ctx.actorUserId)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();
    if ((byUser as any)?.id) return (byUser as any).id as string;
  }

  const { data: firstActive } = await supabase
    .from('team_members')
    .select('id')
    .eq('tenant_id', ctx.tenantId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();
  return ((firstActive as any)?.id as string | undefined) ?? null;
}

async function createSprint(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  if (!ctx.projectId) throw new Error('project_id obrigatorio para sprint.');
  const raw = item.rawData;
  const code = asString(raw.code).toUpperCase() || (await generateNextSprintCode(supabase, ctx.tenantId, ctx.projectId));

  const payload = {
    tenant_id: ctx.tenantId,
    project_id: ctx.projectId,
    code,
    name: asString(raw.name),
    sprint_goal: asString(raw.sprint_goal),
    goal: asString(raw.goal) || asString(raw.sprint_goal),
    start_date: asString(raw.start_date),
    end_date: asString(raw.end_date),
    status: asString(raw.status) || 'planned',
    duration_weeks: raw.duration_weeks == null ? 2 : Number(raw.duration_weeks),
    capacity_total: raw.capacity_total == null ? null : Number(raw.capacity_total),
    velocity_target: raw.velocity_target == null ? null : Number(raw.velocity_target),
    velocity_actual: raw.velocity_actual == null ? null : Number(raw.velocity_actual),
  };

  const { data, error } = await supabase.from('sprints').insert(payload).select('id, code').single();
  if (error || !data) throw new Error(error?.message ?? 'Falha ao criar sprint.');
  return { id: (data as any).id as string, code: (data as any).code as string };
}

async function updateSprint(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  if (!ctx.projectId) throw new Error('project_id obrigatorio para sprint_update.');
  const raw = item.rawData;
  const sprintIdRaw = asString(raw.sprint_id);
  const sprintCodeRaw = asString(raw.sprint_code).toUpperCase();

  let sprintId = sprintIdRaw;
  if (!sprintId && sprintCodeRaw) {
    const { data: byCode } = await supabase
      .from('sprints')
      .select('id')
      .eq('tenant_id', ctx.tenantId)
      .eq('project_id', ctx.projectId)
      .eq('code', sprintCodeRaw)
      .maybeSingle();
    sprintId = ((byCode as any)?.id as string | undefined) ?? '';
  }
  if (!sprintId) throw new Error('Sprint nao encontrada para sprint_update.');

  const patch: Record<string, unknown> = {};
  if (asString(raw.status)) patch.status = asString(raw.status);
  if (asString(raw.sprint_goal)) patch.sprint_goal = asString(raw.sprint_goal);
  if (asString(raw.start_date)) patch.start_date = asString(raw.start_date);
  if (asString(raw.end_date)) patch.end_date = asString(raw.end_date);
  if (raw.velocity_actual != null) patch.velocity_actual = Number(raw.velocity_actual);
  if (raw.velocity_target != null) patch.velocity_target = Number(raw.velocity_target);
  if (raw.capacity_total != null) patch.capacity_total = Number(raw.capacity_total);
  if (Object.keys(patch).length === 0) throw new Error('sprint_update sem campos para atualizar.');

  const { data, error } = await supabase.from('sprints').update(patch).eq('id', sprintId).select('id, code').single();
  if (error || !data) throw new Error(error?.message ?? 'Falha ao atualizar sprint.');
  return { id: (data as any).id as string, code: (data as any).code as string };
}

async function createTask(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  const raw = item.rawData;
  const featureIdRaw = asString(raw.feature_id);
  const featureCode = asString(raw.feature_code).toUpperCase();

  let featureId = featureIdRaw;
  if (!featureId && featureCode) {
    const feature = await resolveFeatureIdByCode(supabase, ctx.tenantId, featureCode);
    featureId = feature?.id ?? '';
  }
  if (!featureId) throw new Error('Feature nao encontrada para task.');

  const payload = {
    tenant_id: ctx.tenantId,
    feature_id: featureId,
    title: asString(raw.title),
    description: asString(raw.description) || null,
    status: asString(raw.status) || 'todo',
    assigned_to: asString(raw.assigned_to) || null,
    estimated_hours: raw.estimated_hours == null ? null : Number(raw.estimated_hours),
  };
  const { data, error } = await supabase.from('tasks').insert(payload).select('id').single();
  if (error || !data) throw new Error(error?.message ?? 'Falha ao criar task.');
  return { id: (data as any).id as string, code: featureCode || featureId };
}

async function createUserStory(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  const raw = item.rawData;
  const featureIdRaw = asString(raw.feature_id);
  const featureCode = asString(raw.feature_code).toUpperCase();

  let featureId = featureIdRaw;
  if (!featureId && featureCode) {
    const feature = await resolveFeatureIdByCode(supabase, ctx.tenantId, featureCode);
    featureId = feature?.id ?? '';
  }
  if (!featureId) throw new Error('Feature nao encontrada para user_story.');

  const publicId = asString(raw.public_id) || (await generateNextUserStoryPublicId(supabase, ctx.tenantId));
  const acceptanceCriteria = Array.isArray(raw.acceptance_criteria)
    ? raw.acceptance_criteria
    : asString(raw.acceptance_criteria)
      ? [asString(raw.acceptance_criteria)]
      : [];

  const payload = {
    tenant_id: ctx.tenantId,
    feature_id: featureId,
    public_id: publicId,
    as_a: asString(raw.as_a),
    i_want: asString(raw.i_want),
    so_that: asString(raw.so_that),
    acceptance_criteria: acceptanceCriteria,
  };

  const { data, error } = await supabase.from('user_stories').insert(payload).select('id, public_id').single();
  if (error || !data) throw new Error(error?.message ?? 'Falha ao criar user_story.');
  return { id: (data as any).id as string, code: (data as any).public_id as string };
}

async function createDailyLog(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext,
  isMemberSpecific: boolean
) {
  if (!ctx.projectId) throw new Error('project_id obrigatorio para daily.');
  const raw = item.rawData;

  let sprintId = asString(raw.sprint_id);
  const sprintCode = asString(raw.sprint_code).toUpperCase();
  if (!sprintId && sprintCode) {
    const { data: sprintByCode } = await supabase
      .from('sprints')
      .select('id')
      .eq('tenant_id', ctx.tenantId)
      .eq('project_id', ctx.projectId)
      .eq('code', sprintCode)
      .maybeSingle();
    sprintId = ((sprintByCode as any)?.id as string | undefined) ?? '';
  }

  const memberName = isMemberSpecific ? asString(raw.member_name) : undefined;
  const teamMemberId = await resolveTeamMemberId(supabase, ctx, memberName);
  if (!teamMemberId) throw new Error('Nao foi possivel resolver team_member para daily.');

  const payload = {
    project_id: ctx.projectId,
    sprint_id: sprintId || null,
    team_member_id: teamMemberId,
    log_date: asString(raw.log_date || raw.date) || new Date().toISOString().slice(0, 10),
    what_did_yesterday: asString(raw.what_did_yesterday),
    what_will_do_today: asString(raw.what_will_do_today),
    impediments: asStringArray(raw.impediments),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('daily_scrum_logs')
    .upsert(payload, { onConflict: 'team_member_id,log_date' })
    .select('id')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Falha ao criar/atualizar daily.');

  const dailyLogId = (data as any).id as string;
  const yesterdayCodes = asStringArray(raw.yesterday_feature_codes).map((c) => c.toUpperCase());
  const todayCodes = asStringArray(raw.today_feature_codes).map((c) => c.toUpperCase());

  for (const code of yesterdayCodes) {
    const feature = await resolveFeatureIdByCode(supabase, ctx.tenantId, code);
    if (feature?.id) {
      await supabase
        .from('daily_feature_mentions')
        .upsert({ daily_log_id: dailyLogId, feature_id: feature.id, mention_type: 'yesterday' });
    }
  }
  for (const code of todayCodes) {
    const feature = await resolveFeatureIdByCode(supabase, ctx.tenantId, code);
    if (feature?.id) {
      await supabase
        .from('daily_feature_mentions')
        .upsert({ daily_log_id: dailyLogId, feature_id: feature.id, mention_type: 'today' });
    }
  }

  return { id: dailyLogId, code: payload.log_date };
}

async function createFeatureDependency(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  if (!ctx.projectId) throw new Error('project_id obrigatorio para feature_dependency.');
  const raw = item.rawData;
  const featureCode = asString(raw.feature_code).toUpperCase();
  const dependsOnCode = asString(raw.depends_on_code).toUpperCase();
  const feature = await resolveFeatureIdByCode(supabase, ctx.tenantId, featureCode);
  const dependsOn = await resolveFeatureIdByCode(supabase, ctx.tenantId, dependsOnCode);
  if (!feature?.id || !dependsOn?.id) throw new Error('Features nao encontradas para dependencia.');

  const payload = {
    project_id: ctx.projectId,
    feature_id: feature.id,
    depends_on_id: dependsOn.id,
    dependency_type: asString(raw.dependency_type) || 'blocks',
  };
  const { data, error } = await supabase
    .from('feature_dependencies')
    .upsert(payload, { onConflict: 'feature_id,depends_on_id' })
    .select('id')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Falha ao criar dependencia.');
  return { id: (data as any).id as string, code: `${featureCode}->${dependsOnCode}` };
}

async function applySpikeResult(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  const raw = item.rawData;
  const code = asString(raw.code).toUpperCase();
  const feature = await resolveFeatureIdByCode(supabase, ctx.tenantId, code);
  if (!feature?.id) throw new Error(`Spike ${code} nao encontrado para spike_result.`);

  const spikeOutcome = asString(raw.spike_outcome || raw.outcome);
  const nextStatus = asString(raw.status) || 'done';
  const patch: Record<string, unknown> = {
    spike_outcome: spikeOutcome || null,
    status: nextStatus,
  };

  let convertedStoryId: string | null = null;
  const convertToStory = String(raw.convert_to_story ?? 'false') === 'true';
  if (convertToStory && ctx.projectId) {
    const newCode = await generateNextFeatureCode(supabase, ctx.tenantId, ctx.projectId);
    const { data: story, error: storyError } = await supabase
      .from('features')
      .insert({
        tenant_id: ctx.tenantId,
        project_id: ctx.projectId,
        code: newCode,
        name: asString(raw.story_name) || `Story derivada de ${code}`,
        description: asString(raw.story_description) || spikeOutcome || null,
        category: asString(raw.category) || 'Backend',
        version: asString(raw.version).toUpperCase() || 'V1',
        status: 'backlog',
        priority: asString(raw.priority).toUpperCase() || 'P2',
        story_points: raw.story_points == null ? null : Number(raw.story_points),
        work_item_type: 'feature',
      })
      .select('id')
      .single();
    if (storyError || !story) throw new Error(storyError?.message ?? 'Falha ao converter spike para story.');
    convertedStoryId = (story as any).id as string;
    patch.spike_converted_to_story_id = convertedStoryId;
  }

  const { error: updateError } = await supabase.from('features').update(patch).eq('id', feature.id);
  if (updateError) throw new Error(updateError.message);

  const { data: updated } = await supabase
    .from('features')
    .select('id, code')
    .eq('id', feature.id)
    .single();
  return { id: (updated as any).id as string, code: (updated as any).code as string };
}

async function createTeamMember(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  const raw = item.rawData;
  const payload = {
    tenant_id: ctx.tenantId,
    name: asString(raw.name),
    email: asString(raw.email) || `${Date.now()}@local.invalid`,
    role: asString(raw.role) || 'developer',
    department: asString(raw.department) || null,
    allocation_percent: raw.allocation_percent == null ? 100 : Number(raw.allocation_percent),
    velocity_avg: raw.velocity_avg == null ? null : Number(raw.velocity_avg),
    is_active: raw.is_active == null ? true : Boolean(raw.is_active),
    status: raw.is_active === false ? 'inactive' : 'active',
    permission_level: 'member',
  };
  const { data, error } = await supabase
    .from('team_members')
    .insert(payload)
    .select('id, name')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Falha ao criar team_member.');
  return { id: (data as any).id as string, code: (data as any).name as string };
}

async function upsertTeamMemberExtras(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  const raw = item.rawData;
  const email = asString(raw.email).toLowerCase();
  const name = asString(raw.name);
  let query = supabase.from('team_members').select('id, name').eq('tenant_id', ctx.tenantId).limit(1);
  query = email ? query.ilike('email', email) : query.ilike('name', name);
  const { data: target, error: targetError } = await query.maybeSingle();
  if (targetError || !target) throw new Error('team_member duplicado nao localizado para complementar dados.');

  const patch: Record<string, unknown> = {};
  if (asString(raw.department)) patch.department = asString(raw.department);
  if (asString(raw.role)) patch.role = asString(raw.role);
  if (raw.allocation_percent != null) patch.allocation_percent = Number(raw.allocation_percent);
  if (raw.velocity_avg != null) patch.velocity_avg = Number(raw.velocity_avg);
  if (raw.is_active != null) {
    patch.is_active = Boolean(raw.is_active);
    patch.status = raw.is_active ? 'active' : 'inactive';
  }
  if (Object.keys(patch).length > 0) {
    const { error: updateError } = await supabase.from('team_members').update(patch).eq('id', (target as any).id);
    if (updateError) throw new Error(updateError.message);
  }
  return { id: (target as any).id as string, code: (target as any).name as string };
}

async function createUzzappClient(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  const raw = item.rawData;
  const closingProbability = asPercentNumber(raw.probabilidade_fechamento ?? raw.closing_probability);
  const clientName = asString(raw.name);
  const clientEmail = asString(raw.email).toLowerCase();
  const clientPhone = asString(raw.phone);
  const clientCompany = asString(raw.company);
  const leadDailyVolume =
    raw.lead_daily_volume == null || raw.lead_daily_volume === ''
      ? null
      : Number(raw.lead_daily_volume);

  const payload = {
    tenant_id: ctx.tenantId,
    name: clientName,
    legal_name: asString(raw.legal_name) || null,
    cnpj: asString(raw.cnpj) || null,
    company: clientCompany || null,
    segment: asString(raw.segment) || null,
    company_size: asString(raw.company_size) || null,
    city: asString(raw.city) || null,
    state: asString(raw.state) || null,
    address_full: asString(raw.address_full) || null,
    website: asString(raw.website) || null,
    phone: clientPhone || null,
    email: clientEmail || null,
    main_contact_name: asString(raw.contato_principal || raw.main_contact_name) || null,
    main_contact_role: asString(raw.main_contact_role) || null,
    whatsapp_business: asString(raw.whatsapp_business) || null,
    plan: asString(raw.plan) || null,
    status: asString(raw.status) || 'active',
    funnel_stage: asString(raw.estagio_funil || raw.funnel_stage) || null,
    negotiation_status: asString(raw.status_negociacao || raw.negotiation_status) || null,
    closing_probability: closingProbability,
    priority: asString(raw.prioridade || raw.priority) || null,
    potential_value: asMoneyNumber(raw.valor_potencial ?? raw.potential_value),
    monthly_fee_value: asMoneyNumber(raw.valor_mensalidade ?? raw.monthly_fee_value),
    setup_fee_value: asMoneyNumber(raw.valor_setup ?? raw.setup_fee_value),
    next_interaction_date: asString(raw.data_proxima_interacao || raw.next_interaction_date) || null,
    next_action_deadline: asString(raw.prazo_proxima_acao || raw.next_action_deadline) || null,
    product_focus: asString(raw.produto || raw.product_focus) || null,
    project_label: asString(raw.projeto || raw.project_label) || null,
    preferred_channel: asString(raw.canal || raw.preferred_channel) || null,
    general_sentiment: asString(raw.sentimento_geral || raw.general_sentiment) || null,
    lead_source: asString(raw.lead_source) || null,
    icp_classification: asString(raw.icp_classification) || null,
    business_context: asString(raw.business_context) || null,
    lead_daily_volume:
      typeof leadDailyVolume === 'number' && Number.isInteger(leadDailyVolume) && leadDailyVolume >= 0
        ? leadDailyVolume
        : null,
    stakeholders_json: asJsonArray(raw.stakeholders_json) ?? [],
    bant_snapshot:
      asJsonObject(raw.bant_snapshot) ??
      asJsonObject(raw.bant_scores) ??
      asJsonObject(raw.bant_scores_json) ??
      {},
    fit_snapshot:
      asJsonObject(raw.fit_snapshot) ??
      asJsonObject(raw.fit_scores) ??
      asJsonObject(raw.fit_scores_json) ??
      {},
    last_contact_date: asString(raw.last_contact_date) || null,
    tags: asStringArray(raw.tags),
    notes: asString(raw.observation || raw.notes) || null,
    onboarded_at: asString(raw.onboarded_at) || new Date().toISOString().slice(0, 10),
  };
  // Dedupe resiliente: quando email/phone nao existem, tenta nome+empresa
  // para evitar criar duplicatas no reimport de templates ricos.
  let existingQuery = supabase
    .from('uzzapp_clients')
    .select('id, name')
    .eq('tenant_id', ctx.tenantId)
    .limit(1);

  if (clientEmail) existingQuery = existingQuery.ilike('email', clientEmail);
  else if (clientPhone) existingQuery = existingQuery.eq('phone', clientPhone);
  else if (clientName && clientCompany) {
    existingQuery = existingQuery.ilike('name', clientName).ilike('company', clientCompany);
  } else if (clientName) {
    existingQuery = existingQuery.ilike('name', clientName);
  }

  const { data: existingClient } = await existingQuery.maybeSingle();
  if ((existingClient as any)?.id) {
    const { error: updateError } = await supabase
      .from('uzzapp_clients')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', (existingClient as any).id);
    if (updateError) throw new Error(updateError.message);
    return {
      id: (existingClient as any).id as string,
      code: ((existingClient as any).name as string) || clientName,
    };
  }

  const { data, error } = await supabase
    .from('uzzapp_clients')
    .insert(payload)
    .select('id, name')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Falha ao criar uzzapp_client.');
  return { id: (data as any).id as string, code: (data as any).name as string };
}

async function upsertUzzappClientExtras(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  const raw = item.rawData;
  const email = asString(raw.email).toLowerCase();
  const phone = asString(raw.phone);
  let query = supabase.from('uzzapp_clients').select('id, name').eq('tenant_id', ctx.tenantId).limit(1);
  query = phone ? query.eq('phone', phone) : query.ilike('email', email);
  const { data: target, error: targetError } = await query.maybeSingle();
  if (targetError || !target) throw new Error('uzzapp_client duplicado nao localizado para complementar dados.');

  const patch: Record<string, unknown> = {};
  if (asString(raw.legal_name)) patch.legal_name = asString(raw.legal_name);
  if (asString(raw.cnpj)) patch.cnpj = asString(raw.cnpj);
  if (asString(raw.company)) patch.company = asString(raw.company);
  if (asString(raw.segment)) patch.segment = asString(raw.segment);
  if (asString(raw.company_size)) patch.company_size = asString(raw.company_size);
  if (asString(raw.city)) patch.city = asString(raw.city);
  if (asString(raw.state)) patch.state = asString(raw.state);
  if (asString(raw.address_full)) patch.address_full = asString(raw.address_full);
  if (asString(raw.website)) patch.website = asString(raw.website);
  if (asString(raw.contato_principal || raw.main_contact_name)) {
    patch.main_contact_name = asString(raw.contato_principal || raw.main_contact_name);
  }
  if (asString(raw.main_contact_role)) patch.main_contact_role = asString(raw.main_contact_role);
  if (asString(raw.whatsapp_business)) patch.whatsapp_business = asString(raw.whatsapp_business);
  if (asString(raw.plan)) patch.plan = asString(raw.plan);
  if (asString(raw.status)) patch.status = asString(raw.status);
  if (asString(raw.estagio_funil || raw.funnel_stage)) {
    patch.funnel_stage = asString(raw.estagio_funil || raw.funnel_stage);
  }
  if (asString(raw.status_negociacao || raw.negotiation_status)) {
    patch.negotiation_status = asString(raw.status_negociacao || raw.negotiation_status);
  }
  if (raw.probabilidade_fechamento != null || raw.closing_probability != null) {
    patch.closing_probability = asPercentNumber(raw.probabilidade_fechamento ?? raw.closing_probability);
  }
  if (asString(raw.prioridade || raw.priority)) {
    patch.priority = asString(raw.prioridade || raw.priority);
  }
  const potential = asMoneyNumber(raw.valor_potencial ?? raw.potential_value);
  if (potential != null) patch.potential_value = potential;
  const monthly = asMoneyNumber(raw.valor_mensalidade ?? raw.monthly_fee_value);
  if (monthly != null) patch.monthly_fee_value = monthly;
  const setup = asMoneyNumber(raw.valor_setup ?? raw.setup_fee_value);
  if (setup != null) patch.setup_fee_value = setup;
  if (asString(raw.data_proxima_interacao || raw.next_interaction_date)) {
    patch.next_interaction_date = asString(raw.data_proxima_interacao || raw.next_interaction_date);
  }
  if (asString(raw.prazo_proxima_acao || raw.next_action_deadline)) {
    patch.next_action_deadline = asString(raw.prazo_proxima_acao || raw.next_action_deadline);
  }
  if (asString(raw.produto || raw.product_focus)) patch.product_focus = asString(raw.produto || raw.product_focus);
  if (asString(raw.projeto || raw.project_label)) patch.project_label = asString(raw.projeto || raw.project_label);
  if (asString(raw.canal || raw.preferred_channel)) patch.preferred_channel = asString(raw.canal || raw.preferred_channel);
  if (asString(raw.sentimento_geral || raw.general_sentiment)) {
    patch.general_sentiment = asString(raw.sentimento_geral || raw.general_sentiment);
  }
  if (asString(raw.lead_source)) patch.lead_source = asString(raw.lead_source);
  if (asString(raw.icp_classification)) patch.icp_classification = asString(raw.icp_classification);
  if (asString(raw.business_context)) patch.business_context = asString(raw.business_context);
  if (raw.lead_daily_volume != null && raw.lead_daily_volume !== '') {
    const leadDailyVolume = Number(raw.lead_daily_volume);
    if (Number.isInteger(leadDailyVolume) && leadDailyVolume >= 0) {
      patch.lead_daily_volume = leadDailyVolume;
    }
  }
  if (asJsonArray(raw.stakeholders_json)) patch.stakeholders_json = asJsonArray(raw.stakeholders_json);
  if (asJsonObject(raw.bant_snapshot)) patch.bant_snapshot = asJsonObject(raw.bant_snapshot);
  if (asJsonObject(raw.fit_snapshot)) patch.fit_snapshot = asJsonObject(raw.fit_snapshot);
  if (asString(raw.last_contact_date)) patch.last_contact_date = asString(raw.last_contact_date);
  if (Array.isArray(raw.tags)) patch.tags = asStringArray(raw.tags);
  if (asString(raw.observation || raw.notes)) patch.notes = asString(raw.observation || raw.notes);
  if (asString(raw.onboarded_at)) patch.onboarded_at = asString(raw.onboarded_at);
  if (asString(raw.name)) patch.name = asString(raw.name);
  if (Object.keys(patch).length > 0) {
    const { error: updateError } = await supabase.from('uzzapp_clients').update(patch).eq('id', (target as any).id);
    if (updateError) throw new Error(updateError.message);
  }
  return { id: (target as any).id as string, code: (target as any).name as string };
}

async function syncContactToClient(
  supabase: SupabaseClient,
  clientId: string,
  contact: {
    estagio_funil?: string | null;
    status_negociacao?: string | null;
    probabilidade_fechamento?: number | null;
    sentimento_geral?: string | null;
    data_contato: string;
    data_proxima_interacao?: string | null;
    prazo_proxima_acao?: string | null;
    bantScores: Record<string, unknown>;
    fitScores: Record<string, unknown>;
  }
): Promise<void> {
  const patch: Record<string, unknown> = {
    last_contact_date: contact.data_contato,
  };

  if (contact.estagio_funil) patch.funnel_stage = contact.estagio_funil;
  if (contact.status_negociacao) patch.negotiation_status = contact.status_negociacao;
  if (contact.probabilidade_fechamento != null) patch.closing_probability = contact.probabilidade_fechamento;
  if (contact.sentimento_geral) patch.general_sentiment = contact.sentimento_geral;
  if (contact.data_proxima_interacao) patch.next_interaction_date = contact.data_proxima_interacao;
  if (contact.prazo_proxima_acao) patch.next_action_deadline = contact.prazo_proxima_acao;
  if (Object.keys(contact.bantScores).length > 0) {
    patch.bant_snapshot = {
      ...contact.bantScores,
      updated_at: contact.data_contato,
    };
  }
  if (Object.keys(contact.fitScores).length > 0) {
    patch.fit_snapshot = {
      ...contact.fitScores,
      updated_at: contact.data_contato,
    };
  }

  await supabase.from('uzzapp_clients').update(patch).eq('id', clientId);
}

async function createClientContact(
  supabase: SupabaseClient,
  item: Phase1ValidatedItem,
  ctx: ImportContext
) {
  const raw = item.rawData;
  const clientRefName = normalizePersonRef(raw.cliente || raw.client_name || raw.name);
  const clientEmail = asString(raw.email).toLowerCase();
  const clientPhone = asString(raw.phone);
  const clientIdRaw = asString(raw.client_id);
  const salesOwnerId = await resolveTeamMemberIdByName(supabase, ctx.tenantId, raw.responsavel_vendas);
  const followupOwnerId = await resolveTeamMemberIdByName(supabase, ctx.tenantId, raw.responsavel_followup);
  const techOwnerId = await resolveTeamMemberIdByName(supabase, ctx.tenantId, raw.responsavel_tecnico);
  const probabilidadeRaw = asString(raw.probabilidade_fechamento);
  const probabilidade = probabilidadeRaw
    ? Number(probabilidadeRaw.replace('%', '').trim())
    : null;

  let clientId = clientIdRaw;
  if (!clientId) {
    let query = supabase
      .from('uzzapp_clients')
      .select('id')
      .eq('tenant_id', ctx.tenantId)
      .limit(1);

    if (clientEmail) query = query.ilike('email', clientEmail);
    else if (clientPhone) query = query.eq('phone', clientPhone);
    else if (clientRefName && asString(raw.empresa || raw.company)) {
      query = query
        .ilike('name', clientRefName)
        .ilike('company', asString(raw.empresa || raw.company));
    } else if (clientRefName) {
      query = query.ilike('name', clientRefName);
    }

    const { data: existingClient } = await query.maybeSingle();
    clientId = ((existingClient as any)?.id as string | undefined) ?? '';
  }

  if (!clientId) {
    const { data: createdClient, error: createClientError } = await supabase
      .from('uzzapp_clients')
      .insert({
        tenant_id: ctx.tenantId,
        name: clientRefName || 'Cliente sem nome',
        company: asString(raw.empresa || raw.company) || null,
        phone: clientPhone || null,
        email: clientEmail || null,
        status: 'trial',
      })
      .select('id')
      .single();

    if (createClientError || !createdClient) {
      throw new Error(createClientError?.message ?? 'Falha ao criar cliente base para contato.');
    }
    clientId = (createdClient as any).id as string;
  }

  const payload = {
    tenant_id: ctx.tenantId,
    project_id: ctx.projectId,
    client_id: clientId,
    contact_type: 'contato-cliente',
    contact_subtype: asString(raw.subtipo),
    status: asString(raw.status) || 'rascunho',
    title: asString(raw.title) || null,
    contato_principal: asString(raw.contato_principal) || null,
    empresa: asString(raw.empresa) || null,
    estagio_funil: asString(raw.estagio_funil) || null,
    status_negociacao: asString(raw.status_negociacao) || null,
    probabilidade_fechamento: Number.isFinite(probabilidade as number) ? probabilidade : null,
    prioridade: asString(raw.prioridade) || null,
    valor_potencial: asMoneyNumber(raw.valor_potencial),
    valor_mensalidade: asMoneyNumber(raw.valor_mensalidade),
    valor_setup: asMoneyNumber(raw.valor_setup),
    data_contato: asString(raw.data_contato),
    hora_inicio: asString(raw.hora_inicio) || null,
    hora_fim: asString(raw.hora_fim) || null,
    duracao_minutos: asDurationMinutes(raw.duracao ?? raw.duracao_minutos),
    data_proxima_interacao: asString(raw.data_proxima_interacao) || null,
    prazo_proxima_acao: asString(raw.prazo_proxima_acao) || null,
    responsavel_vendas: salesOwnerId,
    responsavel_followup: followupOwnerId,
    responsavel_tecnico: techOwnerId,
    responsavel_vendas_nome: normalizePersonRef(raw.responsavel_vendas) || null,
    responsavel_followup_nome: normalizePersonRef(raw.responsavel_followup) || null,
    responsavel_tecnico_nome: normalizePersonRef(raw.responsavel_tecnico) || null,
    produto: asString(raw.produto) || null,
    projeto: asString(raw.projeto) || null,
    canal: asString(raw.canal) || null,
    sentimento_geral: asString(raw.sentimento_geral) || null,
    tags: asStringArray(raw.tags),
    summary_md: asString(raw.summary_md) || null,
    dashboard_exec: {} as Record<string, unknown>,
    bant_scores: {} as Record<string, unknown>,
    fit_scores: {} as Record<string, unknown>,
    dores_json: [] as unknown[],
    objecoes_json: [] as unknown[],
    proximos_passos_json: [] as unknown[],
    riscos_json: [] as unknown[],
    quality_checklist: [] as unknown[],
    insights_json: [] as unknown[],
    participants_json: {} as Record<string, unknown>,
    deal_outcome: null as string | null,
    interaction_sequence: null as number | null,
    source: asString(raw.source) || ctx.sourceName,
    created_by: ctx.actorUserId,
  };

  const summaryMd = payload.summary_md ?? '';
  const dashboardExec =
    asJsonObject(raw.dashboard_exec) ??
    asJsonObject(raw.dashboard_exec_json) ??
    {};
  const bantScores =
    asJsonObject(raw.bant_scores) ??
    asJsonObject(raw.bant_scores_json) ??
    {};
  const fitScores =
    asJsonObject(raw.fit_scores) ??
    asJsonObject(raw.fit_scores_json) ??
    {};
  const insights = asJsonArray(raw.insights_json) ?? [];
  const participantsUzzai = asStringArray(raw.participants_uzzai);
  const participantsClient = asStringArray(raw.participants_client);
  const participantsJson =
    asJsonObject(raw.participants_json) ??
    (participantsUzzai.length > 0 || participantsClient.length > 0
      ? { uzzai: participantsUzzai, client: participantsClient }
      : {});

  if (!dashboardExec.deal_outcome) {
    const negotiation = asString(raw.status_negociacao);
    if (negotiation === 'Fechado') dashboardExec.deal_outcome = 'won';
    else if (negotiation === 'Perdido' || negotiation === 'Cancelado') dashboardExec.deal_outcome = 'lost';
    else if (negotiation === 'Stand-by') dashboardExec.deal_outcome = 'stand_by';
    else dashboardExec.deal_outcome = 'open';
  }
  if (!dashboardExec.deal_outcome_reason) {
    dashboardExec.deal_outcome_reason = asString(raw.deal_outcome_reason || raw.motivo_desfecho) || null;
  }
  if (!dashboardExec.next_strategy) {
    dashboardExec.next_strategy = asString(raw.next_strategy || raw.estrategia_proxima_acao) || null;
  }
  if (!dashboardExec.competitor) {
    dashboardExec.competitor = asString(raw.competitor || raw.concorrente) || null;
  }
  if (!dashboardExec.decision_summary) {
    dashboardExec.decision_summary = asString(raw.decision_summary || raw.resumo_decisao) || null;
  }
  if (!dashboardExec.probability_justification) {
    dashboardExec.probability_justification =
      asString(raw.probability_justification || raw.justificativa_probabilidade) || null;
  }

  if (Object.keys(bantScores).length === 0) {
    const budget = raw.budget_score == null ? null : Number(raw.budget_score);
    const authority = raw.authority_score == null ? null : Number(raw.authority_score);
    const need = raw.need_score == null ? null : Number(raw.need_score);
    const timeline = raw.timeline_score == null ? null : Number(raw.timeline_score);
    if ([budget, authority, need, timeline].some((v) => Number.isFinite(v as number))) {
      bantScores.budget = Number.isFinite(budget as number) ? budget : null;
      bantScores.authority = Number.isFinite(authority as number) ? authority : null;
      bantScores.need = Number.isFinite(need as number) ? need : null;
      bantScores.timeline = Number.isFinite(timeline as number) ? timeline : null;
      bantScores.total =
        (Number.isFinite(budget as number) ? (budget as number) : 0) +
        (Number.isFinite(authority as number) ? (authority as number) : 0) +
        (Number.isFinite(need as number) ? (need as number) : 0) +
        (Number.isFinite(timeline as number) ? (timeline as number) : 0);
    }
  }

  if (Object.keys(fitScores).length === 0) {
    const produto = raw.fit_produto_score == null ? null : Number(raw.fit_produto_score);
    const mercado = raw.fit_mercado_score == null ? null : Number(raw.fit_mercado_score);
    const financeiro = raw.fit_financeiro_score == null ? null : Number(raw.fit_financeiro_score);
    const cultural = raw.fit_cultural_score == null ? null : Number(raw.fit_cultural_score);
    const tecnico = raw.fit_tecnico_score == null ? null : Number(raw.fit_tecnico_score);
    if ([produto, mercado, financeiro, cultural, tecnico].some((v) => Number.isFinite(v as number))) {
      fitScores.produto = Number.isFinite(produto as number) ? produto : null;
      fitScores.mercado = Number.isFinite(mercado as number) ? mercado : null;
      fitScores.financeiro = Number.isFinite(financeiro as number) ? financeiro : null;
      fitScores.cultural = Number.isFinite(cultural as number) ? cultural : null;
      fitScores.tecnico = Number.isFinite(tecnico as number) ? tecnico : null;
      fitScores.total =
        (Number.isFinite(produto as number) ? (produto as number) : 0) +
        (Number.isFinite(mercado as number) ? (mercado as number) : 0) +
        (Number.isFinite(financeiro as number) ? (financeiro as number) : 0) +
        (Number.isFinite(cultural as number) ? (cultural as number) : 0) +
        (Number.isFinite(tecnico as number) ? (tecnico as number) : 0);
    }
  }

  const dores =
    asJsonArray(raw.dores_json) ??
    extractSectionBullets(summaryMd, ['DORES IDENTIFICADAS']);
  const objecoes =
    asJsonArray(raw.objecoes_json) ??
    extractSectionBullets(summaryMd, ['OBJECOES IDENTIFICADAS E TRATAMENTO', 'OBJEÇÕES IDENTIFICADAS E TRATAMENTO']);
  const proximosPassos =
    asJsonArray(raw.proximos_passos_json) ??
    extractSectionBullets(summaryMd, ['FOLLOW-UPS E PROXIMOS PASSOS', 'FOLLOW-UPS E PRÓXIMOS PASSOS']);
  const riscos =
    asJsonArray(raw.riscos_json) ??
    extractSectionBullets(summaryMd, ['RISCOS E BLOQUEIOS']);
  const qualityChecklist =
    asJsonArray(raw.quality_checklist) ??
    parseChecklist(summaryMd);
  let dealOutcome =
    asString(raw.deal_outcome) ||
    asString(dashboardExec.deal_outcome) ||
    '';
  if (!dealOutcome) {
    const negotiation = asString(raw.status_negociacao);
    if (negotiation === 'Fechado') dealOutcome = 'won';
    else if (negotiation === 'Perdido' || negotiation === 'Cancelado') dealOutcome = 'lost';
    else if (negotiation === 'Stand-by') dealOutcome = 'stand_by';
    else dealOutcome = 'open';
  }

  const { data: lastContact } = await supabase
    .from('client_contacts')
    .select('interaction_sequence')
    .eq('client_id', clientId)
    .order('interaction_sequence', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  const interactionSequence = Number((lastContact as any)?.interaction_sequence ?? 0) + 1;

  payload.dashboard_exec = dashboardExec;
  payload.bant_scores = bantScores;
  payload.fit_scores = fitScores;
  payload.dores_json = dores;
  payload.objecoes_json = objecoes;
  payload.proximos_passos_json = proximosPassos;
  payload.riscos_json = riscos;
  payload.quality_checklist = qualityChecklist;
  payload.insights_json = insights;
  payload.participants_json = participantsJson;
  payload.deal_outcome = dealOutcome;
  payload.interaction_sequence = interactionSequence;

  let { data, error } = await supabase
    .from('client_contacts')
    .insert(payload)
    .select('id')
    .single();

  // Compatibilidade: alguns ambientes ficaram com schema cache/legacy inconsistente
  // para campos *_nome. Faz retry sem esses campos para nao perder o restante do contato.
  if (error && /responsavel_follow/i.test(error.message)) {
    const fallbackPayload: Record<string, unknown> = { ...payload };
    delete fallbackPayload.responsavel_vendas_nome;
    delete fallbackPayload.responsavel_followup_nome;
    delete fallbackPayload.responsavel_tecnico_nome;

    const retry = await supabase
      .from('client_contacts')
      .insert(fallbackPayload)
      .select('id')
      .single();
    data = retry.data;
    error = retry.error;
  }
  if (error && /interaction_sequence/i.test(error.message)) {
    const { data: latestContact } = await supabase
      .from('client_contacts')
      .select('interaction_sequence')
      .eq('client_id', clientId)
      .order('interaction_sequence', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();
    const retryPayload: Record<string, unknown> = {
      ...payload,
      interaction_sequence: Number((latestContact as any)?.interaction_sequence ?? 0) + 1,
    };
    const retry = await supabase
      .from('client_contacts')
      .insert(retryPayload)
      .select('id')
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error || !data) throw new Error(error?.message ?? 'Falha ao criar contato_cliente.');
  await syncContactToClient(supabase, clientId, {
    estagio_funil: asString(raw.estagio_funil) || null,
    status_negociacao: asString(raw.status_negociacao) || null,
    probabilidade_fechamento: Number.isFinite(probabilidade as number) ? probabilidade : null,
    sentimento_geral: asString(raw.sentimento_geral) || null,
    data_contato: asString(raw.data_contato),
    data_proxima_interacao: asString(raw.data_proxima_interacao) || null,
    prazo_proxima_acao: asString(raw.prazo_proxima_acao) || null,
    bantScores,
    fitScores,
  });
  return { id: (data as any).id as string, code: clientRefName || clientId };
}

export async function executePhase1Import(
  supabase: SupabaseClient,
  items: Phase1ValidatedItem[],
  ctx: ImportContext,
  overrides?: Record<string, { action?: 'skip' | 'create' | 'update' | 'add_observation' }>
) {
  const results: ExecutionResult[] = [];
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of items) {
    const overrideAction = overrides?.[String(item.itemIndex)]?.action;
    const effectiveAction = overrideAction ?? item.action;

    if (item.validationStatus === 'invalid' || !effectiveAction || effectiveAction === 'skip') {
      skipped += 1;
      results.push({
        index: item.itemIndex,
        status: 'skipped',
        entityId: null,
        entityCode: item.entityCode,
        message:
          item.validationStatus === 'invalid'
            ? `Item invalido: ${item.validationErrors.join('; ')}`
            : 'Item pulado.',
      });
      await supabase
        .from('md_feeder_import_items')
        .update({
          action: 'skip',
          conflict_reason:
            item.validationStatus === 'invalid'
              ? item.validationErrors.join('; ')
              : 'skip por regra/override',
        })
        .eq('import_id', ctx.importId)
        .eq('item_index', item.itemIndex);
      continue;
    }

    try {
      let entity: { id: string; code: string } | null = null;

      if (effectiveAction === 'create') {
        if (
          item.itemType === 'feature' ||
          item.itemType === 'bug' ||
          item.itemType === 'epic' ||
          item.itemType === 'spike'
        ) {
          entity = await createFeatureOrBug(supabase, item, ctx);
          if (item.itemType === 'epic' && entity?.id) {
            await applyEpicDecomposition(supabase, entity.id, item, ctx);
          }
          created += 1;
        } else if (item.itemType === 'risk') {
          entity = await createRisk(supabase, item, ctx);
          created += 1;
        } else if (item.itemType === 'sprint') {
          entity = await createSprint(supabase, item, ctx);
          created += 1;
        } else if (item.itemType === 'task') {
          entity = await createTask(supabase, item, ctx);
          created += 1;
        } else if (item.itemType === 'user_story') {
          entity = await createUserStory(supabase, item, ctx);
          created += 1;
        } else if (item.itemType === 'daily') {
          entity = await createDailyLog(supabase, item, ctx, false);
          created += 1;
        } else if (item.itemType === 'daily_member') {
          entity = await createDailyLog(supabase, item, ctx, true);
          created += 1;
        } else if (item.itemType === 'feature_dependency') {
          entity = await createFeatureDependency(supabase, item, ctx);
          created += 1;
        } else if (item.itemType === 'team_member') {
          entity = await createTeamMember(supabase, item, ctx);
          created += 1;
        } else if (item.itemType === 'uzzapp_client') {
          entity = await createUzzappClient(supabase, item, ctx);
          created += 1;
        } else if (item.itemType === 'contato_cliente') {
          entity = await createClientContact(supabase, item, ctx);
          created += 1;
        } else if (item.itemType === 'retrospective') {
          entity = await createRetrospective(supabase, item, ctx);
          created += 1;
        } else if (item.itemType === 'marketing_campaign') {
          entity = await createMarketingCampaign(supabase, item, ctx);
          created += 1;
        } else if (item.itemType === 'marketing_post') {
          entity = await createMarketingPost(supabase, item, ctx);
          created += 1;
        } else {
          throw new Error(`Acao create nao suportada para ${item.itemType}.`);
        }
      } else if (effectiveAction === 'update') {
        if (item.itemType === 'bug_resolution') {
          entity = await applyBugResolution(supabase, item, ctx);
          updated += 1;
        } else if (item.itemType === 'spike_result') {
          entity = await applySpikeResult(supabase, item, ctx);
          updated += 1;
        } else if (item.itemType === 'sprint_update') {
          entity = await updateSprint(supabase, item, ctx);
          updated += 1;
        } else if (item.itemType === 'planning_result') {
          entity = await applyPlanningResult(supabase, item, ctx);
          updated += 1;
        } else if (item.itemType === 'baseline_metric') {
          entity = await upsertBaselineMetric(supabase, item, ctx);
          updated += 1;
        } else {
          throw new Error(`Acao update nao suportada para ${item.itemType}.`);
        }
      } else if (effectiveAction === 'add_observation') {
        if (item.itemType === 'feature' || item.itemType === 'bug') {
          entity = await applyObservationToExisting(supabase, item, ctx);
        } else if (item.itemType === 'team_member') {
          entity = await upsertTeamMemberExtras(supabase, item, ctx);
        } else if (item.itemType === 'uzzapp_client') {
          entity = await upsertUzzappClientExtras(supabase, item, ctx);
        } else {
          throw new Error(`Acao add_observation nao suportada para ${item.itemType}.`);
        }
        updated += 1;
      }

      await supabase
        .from('md_feeder_import_items')
        .update({
          action: effectiveAction,
          entity_type: item.itemType === 'bug_resolution' ? 'feature' : item.itemType,
          entity_id: entity?.id ?? null,
          entity_code: entity?.code ?? item.entityCode,
          conflict_reason: null,
        })
        .eq('import_id', ctx.importId)
        .eq('item_index', item.itemIndex);

      results.push({
        index: item.itemIndex,
        status: effectiveAction === 'create' ? 'created' : 'updated',
        entityId: entity?.id ?? null,
        entityCode: entity?.code ?? null,
        message: `${effectiveAction} executado com sucesso`,
      });
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : 'Falha desconhecida';
      results.push({
        index: item.itemIndex,
        status: 'failed',
        entityId: null,
        entityCode: item.entityCode,
        message,
      });
      await supabase
        .from('md_feeder_import_items')
        .update({
          conflict_reason: message,
        })
        .eq('import_id', ctx.importId)
        .eq('item_index', item.itemIndex);
    }
  }

  return {
    counters: { created, updated, skipped, failed },
    results,
  };
}
