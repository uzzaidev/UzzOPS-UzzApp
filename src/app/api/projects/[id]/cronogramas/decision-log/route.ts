import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().trim().min(1),
  category: z.enum(['product', 'technical', 'process', 'roadmap', 'risk', 'legal', 'governance']),
  decision_text: z.string().trim().min(1),
  decision_date: z.string().date().optional(),
  evidence_text: z.string().nullable().optional(),
  impact_summary: z.string().nullable().optional(),
  impact_json: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(['active', 'superseded', 'reverted']).optional(),
  sprint_id: z.string().uuid().nullable().optional(),
  roadmap_item_id: z.string().uuid().nullable().optional(),
});

const updateSchema = createSchema.partial().extend({
  id: z.string().uuid(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    const { data: project } = await supabase.from('projects').select('tenant_id').eq('id', projectId).single();
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    const { membership, error: authError } = await requireTenant(supabase, { tenantId: project.tenant_id });
    if (authError || !membership) return authError;

    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get('limit') ?? '50'), 200);

    const { data, error } = await supabase
      .from('project_decision_log')
      .select('*')
      .eq('tenant_id', membership.tenant_id)
      .eq('project_id', projectId)
      .order('decision_date', { ascending: false })
      .limit(limit);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error('[cronogramas/decision-log][GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    const { data: project } = await supabase.from('projects').select('tenant_id').eq('id', projectId).single();
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    const { membership, user, error: authError } = await requireTenant(supabase, { tenantId: project.tenant_id });
    if (authError || !membership) return authError;

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const payload = parsed.data;
    const { data, error } = await supabase
      .from('project_decision_log')
      .insert({
        tenant_id: membership.tenant_id,
        project_id: projectId,
        title: payload.title,
        category: payload.category,
        decision_text: payload.decision_text,
        decision_date: payload.decision_date ?? new Date().toISOString().slice(0, 10),
        evidence_text: payload.evidence_text ?? null,
        impact_summary: payload.impact_summary ?? null,
        impact_json: payload.impact_json ?? {},
        status: payload.status ?? 'active',
        sprint_id: payload.sprint_id ?? null,
        roadmap_item_id: payload.roadmap_item_id ?? null,
        created_by: user?.id ?? null,
      })
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('[cronogramas/decision-log][POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    const { data: project } = await supabase.from('projects').select('tenant_id').eq('id', projectId).single();
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    const { membership, error: authError } = await requireTenant(supabase, { tenantId: project.tenant_id });
    if (authError || !membership) return authError;

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const { id, ...payload } = parsed.data;
    const { data, error } = await supabase
      .from('project_decision_log')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('tenant_id', membership.tenant_id)
      .eq('project_id', projectId)
      .eq('id', id)
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[cronogramas/decision-log][PATCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
