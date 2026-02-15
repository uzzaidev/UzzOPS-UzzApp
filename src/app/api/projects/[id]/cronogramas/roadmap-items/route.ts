import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const createSchema = z.object({
  roadmap_id: z.string().uuid(),
  code: z.string().nullable().optional(),
  item_type: z.enum(['outcome', 'milestone', 'release', 'pilot_phase', 'initiative']),
  title: z.string().trim().min(1),
  description: z.string().nullable().optional(),
  status: z.enum(['planned', 'in_progress', 'done', 'blocked', 'cancelled']).optional(),
  confidence_pct: z.number().int().min(0).max(100).nullable().optional(),
  planned_start: z.string().date().nullable().optional(),
  planned_end: z.string().date().nullable().optional(),
  success_metrics_json: z.array(z.unknown()).optional(),
  dependencies_json: z.array(z.unknown()).optional(),
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
    const roadmapId = url.searchParams.get('roadmap_id');

    let query = supabase
      .from('roadmap_items')
      .select('*')
      .eq('tenant_id', membership.tenant_id)
      .eq('project_id', projectId)
      .order('planned_start', { ascending: true, nullsFirst: false });
    if (roadmapId) query = query.eq('roadmap_id', roadmapId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error('[cronogramas/roadmap-items][GET]', error);
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
      .from('roadmap_items')
      .insert({
        tenant_id: membership.tenant_id,
        project_id: projectId,
        roadmap_id: payload.roadmap_id,
        code: payload.code ?? null,
        item_type: payload.item_type,
        title: payload.title,
        description: payload.description ?? null,
        status: payload.status ?? 'planned',
        confidence_pct: payload.confidence_pct ?? null,
        planned_start: payload.planned_start ?? null,
        planned_end: payload.planned_end ?? null,
        success_metrics_json: payload.success_metrics_json ?? [],
        dependencies_json: payload.dependencies_json ?? [],
        created_by: user?.id ?? null,
      })
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('[cronogramas/roadmap-items][POST]', error);
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
      .from('roadmap_items')
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
    console.error('[cronogramas/roadmap-items][PATCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
