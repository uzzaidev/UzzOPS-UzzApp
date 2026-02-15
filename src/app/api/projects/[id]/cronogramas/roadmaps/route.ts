import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const createSchema = z.object({
  code: z.string().nullable().optional(),
  name: z.string().trim().min(1),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  planning_model: z.enum(['scrum', 'kanban', 'hybrid']).optional(),
  horizon_start: z.string().date().nullable().optional(),
  horizon_end: z.string().date().nullable().optional(),
  release_reference_sprints: z.number().int().min(1).nullable().optional(),
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
      .from('roadmaps')
      .select('*')
      .eq('tenant_id', membership.tenant_id)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error('[cronogramas/roadmaps][GET]', error);
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
      .from('roadmaps')
      .insert({
        tenant_id: membership.tenant_id,
        project_id: projectId,
        code: payload.code ?? null,
        name: payload.name,
        status: payload.status ?? 'active',
        planning_model: payload.planning_model ?? 'scrum',
        horizon_start: payload.horizon_start ?? null,
        horizon_end: payload.horizon_end ?? null,
        release_reference_sprints: payload.release_reference_sprints ?? null,
        notes: payload.notes ?? null,
        created_by: user?.id ?? null,
      })
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('[cronogramas/roadmaps][POST]', error);
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
      .from('roadmaps')
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
    console.error('[cronogramas/roadmaps][PATCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
