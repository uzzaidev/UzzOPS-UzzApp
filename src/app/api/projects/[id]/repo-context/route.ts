import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';

function nextCode(prefix: string, values: string[]) {
  let maxN = 0;
  for (const raw of values) {
    const normalized = String(raw ?? '').toUpperCase();
    if (!normalized.startsWith(`${prefix}-`)) continue;
    const n = Number.parseInt(normalized.replace(`${prefix}-`, ''), 10);
    if (!Number.isNaN(n) && n > maxN) maxN = n;
  }
  return `${prefix}-${String(maxN + 1).padStart(3, '0')}`;
}

function asTextContext(data: any) {
  const features = (data.features ?? [])
    .map((f: any) => `${f.code} ${f.status}`)
    .join(' | ');
  const bugs = (data.open_bugs ?? [])
    .map((b: any) => `${b.code} ${b.priority} ${b.status}`)
    .join(' | ');
  const risks = (data.risks ?? [])
    .map((r: any) => `${r.public_id} GUT=${r.gut_score ?? 0} ${r.status}`)
    .join(' | ');
  const members = (data.team_members ?? []).map((m: any) => `${m.name} (${m.role})`).join(' | ');

  return [
    `PROJETO: ${data.project.code} - ${data.project.name} - status: ${data.project.status} - progress: ${data.project.progress ?? 0}%`,
    `SPRINT ATIVO: ${data.active_sprint ? `${data.active_sprint.code} (${data.active_sprint.start_date} - ${data.active_sprint.end_date}) - goal: "${data.active_sprint.sprint_goal}"` : 'nenhum'}`,
    `FEATURES (ultimas ${data.features?.length ?? 0}): ${features || 'nenhuma'}`,
    `BUGS ABERTOS: ${bugs || 'nenhum'}`,
    `RISCOS: ${risks || 'nenhum'}`,
    `MEMBROS: ${members || 'nenhum'}`,
    `CLIENTES ATIVOS: ${data.clients_active ?? 0}`,
    `PROXIMOS CODES: feature=${data.next_codes.feature}, sprint=${data.next_codes.sprint}, risk=${data.next_codes.risk}`,
  ].join('\n');
}

function asLlmContext(data: any) {
  const features = (data.features ?? [])
    .map((f: any) => `- ${f.code} | ${f.status} | ${f.name}`)
    .join('\n');
  const bugs = (data.open_bugs ?? [])
    .map((b: any) => `- ${b.code} | ${b.priority} | ${b.status}`)
    .join('\n');
  const risks = (data.risks ?? [])
    .map((r: any) => `- ${r.public_id} | GUT=${r.gut_score ?? 0} | ${r.status}`)
    .join('\n');
  const members = (data.team_members ?? [])
    .map((m: any) => `- ${m.name} | ${m.role} | ${m.status}`)
    .join('\n');
  const clients = (data.clients ?? [])
    .map((c: any) => `- ${c.name} | ${c.status} | ${c.plan ?? 'n/a'}`)
    .join('\n');

  return [
    '# UZZOPS_REPO_CONTEXT',
    'template: uzzops-feeder',
    'template_version: 1.0',
    '',
    '[PROJECT]',
    `code=${data.project.code}`,
    `name=${data.project.name}`,
    `status=${data.project.status}`,
    `progress=${data.project.progress ?? 0}`,
    '',
    '[ACTIVE_SPRINT]',
    data.active_sprint
      ? `code=${data.active_sprint.code}\nstart_date=${data.active_sprint.start_date}\nend_date=${data.active_sprint.end_date}\ngoal=${data.active_sprint.sprint_goal}`
      : 'none',
    '',
    '[FEATURES_RECENT]',
    features || '- none',
    '',
    '[OPEN_BUGS]',
    bugs || '- none',
    '',
    '[RISKS]',
    risks || '- none',
    '',
    '[TEAM_MEMBERS]',
    members || '- none',
    '',
    '[CLIENTS]',
    clients || '- none',
    '',
    '[NEXT_CODES]',
    `feature=${data.next_codes.feature}`,
    `sprint=${data.next_codes.sprint}`,
    `risk=${data.next_codes.risk}`,
    '',
    '[INSTRUCTIONS]',
    '- Use only evidence from transcript.',
    '- Respect existing codes; avoid duplicates.',
    '- Use YYYY-MM-DD for dates.',
    '- Output must follow uzzops-feeder template.',
  ].join('\n');
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
      .select('id, tenant_id, code, name, status, progress')
      .eq('id', projectId)
      .single();

    const { membership, error: authError } = await requireTenant(supabase, {
      tenantId: project?.tenant_id ?? null,
    });
    if (authError || !membership) return authError;

    if (!project) {
      return NextResponse.json({ error: 'Projeto nao encontrado.' }, { status: 404 });
    }

    const [
      featuresRes,
      bugsRes,
      risksRes,
      teamRes,
      activeSprintRes,
      allFeatureCodesRes,
      allSprintCodesRes,
      allRiskIdsRes,
      clientsRes,
      clientsListRes,
    ] = await Promise.all([
      supabase
        .from('features')
        .select('code, name, status')
        .eq('tenant_id', membership.tenant_id)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('features')
        .select('code, priority, status')
        .eq('tenant_id', membership.tenant_id)
        .eq('project_id', projectId)
        .eq('work_item_type', 'bug')
        .neq('status', 'done')
        .order('priority', { ascending: true })
        .limit(20),
      supabase
        .from('risks')
        .select('public_id, status, gut_score')
        .eq('tenant_id', membership.tenant_id)
        .eq('project_id', projectId)
        .order('gut_score', { ascending: false })
        .limit(20),
      supabase
        .from('team_members')
        .select('name, role, status')
        .eq('tenant_id', membership.tenant_id)
        .eq('status', 'active')
        .order('name', { ascending: true })
        .limit(30),
      supabase
        .from('sprints')
        .select('code, start_date, end_date, sprint_goal, status')
        .eq('tenant_id', membership.tenant_id)
        .eq('project_id', projectId)
        .eq('status', 'active')
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('features')
        .select('code')
        .eq('tenant_id', membership.tenant_id)
        .eq('project_id', projectId)
        .ilike('code', 'F-%'),
      supabase
        .from('sprints')
        .select('code')
        .eq('tenant_id', membership.tenant_id)
        .eq('project_id', projectId)
        .ilike('code', 'SPR-%'),
      supabase
        .from('risks')
        .select('public_id')
        .eq('tenant_id', membership.tenant_id)
        .eq('project_id', projectId)
        .ilike('public_id', 'RSK-%'),
      supabase
        .from('uzzapp_clients')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', membership.tenant_id)
        .eq('status', 'active'),
      supabase
        .from('uzzapp_clients')
        .select('name, status, plan')
        .eq('tenant_id', membership.tenant_id)
        .order('created_at', { ascending: false })
        .limit(30),
    ]);

    const payload = {
      project,
      active_sprint: activeSprintRes.data ?? null,
      features: featuresRes.data ?? [],
      open_bugs: bugsRes.data ?? [],
      risks: risksRes.data ?? [],
      team_members: teamRes.data ?? [],
      clients_active: clientsRes.count ?? 0,
      clients: clientsListRes.data ?? [],
      next_codes: {
        feature: nextCode('F', (allFeatureCodesRes.data ?? []).map((x: any) => x.code)),
        sprint: nextCode('SPR', (allSprintCodesRes.data ?? []).map((x: any) => x.code)),
        risk: nextCode('RSK', (allRiskIdsRes.data ?? []).map((x: any) => x.public_id)),
      },
    };

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') ?? 'json';

    if (format === 'text') {
      return new NextResponse(asTextContext(payload), {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (format === 'llm') {
      return new NextResponse(asLlmContext(payload), {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    return NextResponse.json({ data: payload });
  } catch (error) {
    console.error('Error building repo-context:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
