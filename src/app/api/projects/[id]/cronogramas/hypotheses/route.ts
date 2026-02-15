import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().trim().min(1),
  statement: z.string().trim().min(1),
  risk_type: z.enum(['value', 'usability', 'feasibility', 'viability', 'business', 'legal', 'security', 'performance']),
  status: z.enum(['backlog', 'in_test', 'validated', 'invalidated', 'pivoted', 'parked']).optional(),
  metric_name: z.string().nullable().optional(),
  threshold_expression: z.string().nullable().optional(),
  baseline_value: z.string().nullable().optional(),
  target_value: z.string().nullable().optional(),
  evidence_required: z.string().nullable().optional(),
  confidence_before: z.number().int().min(0).max(100).nullable().optional(),
  confidence_after: z.number().int().min(0).max(100).nullable().optional(),
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
    const status = url.searchParams.get('status');

    let query = supabase
      .from('project_hypotheses')
      .select('*')
      .eq('tenant_id', membership.tenant_id)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error('[cronogramas/hypotheses][GET]', error);
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
      .from('project_hypotheses')
      .insert({
        tenant_id: membership.tenant_id,
        project_id: projectId,
        roadmap_item_id: payload.roadmap_item_id ?? null,
        title: payload.title,
        statement: payload.statement,
        risk_type: payload.risk_type,
        status: payload.status ?? 'backlog',
        metric_name: payload.metric_name ?? null,
        threshold_expression: payload.threshold_expression ?? null,
        baseline_value: payload.baseline_value ?? null,
        target_value: payload.target_value ?? null,
        evidence_required: payload.evidence_required ?? null,
        confidence_before: payload.confidence_before ?? null,
        confidence_after: payload.confidence_after ?? null,
        created_by: user?.id ?? null,
      })
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('[cronogramas/hypotheses][POST]', error);
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
      .from('project_hypotheses')
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
    console.error('[cronogramas/hypotheses][PATCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
