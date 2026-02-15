import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().trim().min(1),
  pilot_goal: z.string().trim().min(1),
  status: z.enum(['planned', 'running', 'completed', 'cancelled']).optional(),
  roadmap_item_id: z.string().uuid().nullable().optional(),
  phases_json: z.array(z.unknown()).optional(),
  success_criteria_json: z.array(z.unknown()).optional(),
  start_date: z.string().date().nullable().optional(),
  end_date: z.string().date().nullable().optional(),
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

    const [programsRes, officesRes, eventsRes] = await Promise.all([
      supabase
        .from('pilot_programs')
        .select('*')
        .eq('tenant_id', membership.tenant_id)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false }),
      supabase
        .from('pilot_offices')
        .select('*')
        .eq('tenant_id', membership.tenant_id)
        .eq('project_id', projectId),
      supabase
        .from('pilot_validation_events')
        .select('*')
        .eq('tenant_id', membership.tenant_id)
        .eq('project_id', projectId)
        .order('event_date', { ascending: false }),
    ]);

    if (programsRes.error) return NextResponse.json({ error: programsRes.error.message }, { status: 400 });
    if (officesRes.error) return NextResponse.json({ error: officesRes.error.message }, { status: 400 });
    if (eventsRes.error) return NextResponse.json({ error: eventsRes.error.message }, { status: 400 });

    return NextResponse.json({
      data: {
        programs: programsRes.data ?? [],
        offices: officesRes.data ?? [],
        events: eventsRes.data ?? [],
      },
    });
  } catch (error) {
    console.error('[cronogramas/pilots][GET]', error);
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
      .from('pilot_programs')
      .insert({
        tenant_id: membership.tenant_id,
        project_id: projectId,
        roadmap_item_id: payload.roadmap_item_id ?? null,
        name: payload.name,
        pilot_goal: payload.pilot_goal,
        status: payload.status ?? 'planned',
        phases_json: payload.phases_json ?? [],
        success_criteria_json: payload.success_criteria_json ?? [],
        start_date: payload.start_date ?? null,
        end_date: payload.end_date ?? null,
        created_by: user?.id ?? null,
      })
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('[cronogramas/pilots][POST]', error);
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
      .from('pilot_programs')
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
    console.error('[cronogramas/pilots][PATCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
