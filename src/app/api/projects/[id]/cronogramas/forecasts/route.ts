import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const createSchema = z.object({
  label: z.string().trim().min(1),
  roadmap_id: z.string().uuid().nullable().optional(),
  forecast_model: z.enum(['velocity_range', 'throughput_range', 'monte_carlo']).optional(),
  unit: z.enum(['story_points', 'items']).optional(),
  history_window_sprints: z.number().int().min(1).nullable().optional(),
  sample_size: z.number().int().min(100).nullable().optional(),
  confidence_levels_json: z.array(z.number()).optional(),
  backlog_scope_json: z.array(z.unknown()).optional(),
  assumptions_json: z.record(z.string(), z.unknown()).optional(),
  output_json: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().nullable().optional(),
});

const updateSchema = createSchema.partial().extend({
  id: z.string().uuid(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    const { data: project } = await supabase.from('projects').select('tenant_id').eq('id', projectId).single();
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    const { membership, error: authError } = await requireTenant(supabase, { tenantId: project.tenant_id });
    if (authError || !membership) return authError;

    const { data, error } = await supabase
      .from('release_forecasts')
      .select('*')
      .eq('tenant_id', membership.tenant_id)
      .eq('project_id', projectId)
      .order('generated_at', { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error('[cronogramas/forecasts][GET]', error);
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
      .from('release_forecasts')
      .insert({
        tenant_id: membership.tenant_id,
        project_id: projectId,
        roadmap_id: payload.roadmap_id ?? null,
        label: payload.label,
        forecast_model: payload.forecast_model ?? 'velocity_range',
        unit: payload.unit ?? 'story_points',
        history_window_sprints: payload.history_window_sprints ?? null,
        sample_size: payload.sample_size ?? null,
        confidence_levels_json: payload.confidence_levels_json ?? [0.5, 0.8, 0.9],
        backlog_scope_json: payload.backlog_scope_json ?? [],
        assumptions_json: payload.assumptions_json ?? {},
        output_json: payload.output_json ?? {},
        generated_by: user?.id ?? null,
        notes: payload.notes ?? null,
      })
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('[cronogramas/forecasts][POST]', error);
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
      .from('release_forecasts')
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
    console.error('[cronogramas/forecasts][PATCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
