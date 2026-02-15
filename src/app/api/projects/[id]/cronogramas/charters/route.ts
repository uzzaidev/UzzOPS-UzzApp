import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const createSchema = z.object({
  version: z.number().int().min(1).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  vision_outcome: z.string().trim().min(1),
  target_users_json: z.array(z.unknown()).optional(),
  critical_hypotheses_json: z.array(z.unknown()).optional(),
  mvp_anchor_cases_json: z.array(z.unknown()).optional(),
  success_metrics_json: z.array(z.unknown()).optional(),
  non_negotiables_json: z.array(z.unknown()).optional(),
  top_risks_json: z.array(z.unknown()).optional(),
  ip_rules_json: z.array(z.unknown()).optional(),
  source_ref: z.string().nullable().optional(),
  valid_from: z.string().date().nullable().optional(),
  valid_to: z.string().date().nullable().optional(),
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
      .from('product_charters')
      .select('*')
      .eq('tenant_id', membership.tenant_id)
      .eq('project_id', projectId)
      .order('version', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error('[cronogramas/charters][GET]', error);
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
      .from('product_charters')
      .insert({
        tenant_id: membership.tenant_id,
        project_id: projectId,
        version: payload.version ?? 1,
        status: payload.status ?? 'draft',
        vision_outcome: payload.vision_outcome,
        target_users_json: payload.target_users_json ?? [],
        critical_hypotheses_json: payload.critical_hypotheses_json ?? [],
        mvp_anchor_cases_json: payload.mvp_anchor_cases_json ?? [],
        success_metrics_json: payload.success_metrics_json ?? [],
        non_negotiables_json: payload.non_negotiables_json ?? [],
        top_risks_json: payload.top_risks_json ?? [],
        ip_rules_json: payload.ip_rules_json ?? [],
        source_ref: payload.source_ref ?? null,
        valid_from: payload.valid_from ?? null,
        valid_to: payload.valid_to ?? null,
        created_by: user?.id ?? null,
      })
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('[cronogramas/charters][POST]', error);
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
      .from('product_charters')
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
    console.error('[cronogramas/charters][PATCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
