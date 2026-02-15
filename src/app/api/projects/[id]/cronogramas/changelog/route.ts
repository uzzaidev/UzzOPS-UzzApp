import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const createSchema = z.object({
  sprint_id: z.string().uuid().nullable().optional(),
  roadmap_item_id: z.string().uuid().nullable().optional(),
  release_label: z.string().nullable().optional(),
  change_date: z.string().date().optional(),
  change_type: z.enum(['feature', 'improvement', 'fix', 'risk_mitigation', 'process', 'breaking_change']),
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  impact_area: z.string().nullable().optional(),
  evidence_links_json: z.array(z.unknown()).optional(),
  visibility: z.enum(['internal', 'customer_facing', 'public']).optional(),
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

    const { data: project } = await supabase
      .from('projects')
      .select('tenant_id')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { membership, error: authError } = await requireTenant(supabase, {
      tenantId: project.tenant_id,
    });
    if (authError || !membership) return authError;

    const { data, error } = await supabase
      .from('product_changelog_entries')
      .select('*')
      .eq('tenant_id', membership.tenant_id)
      .eq('project_id', projectId)
      .order('change_date', { ascending: false })
      .limit(200);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error('[cronogramas/changelog][GET]', error);
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

    const { data: project } = await supabase
      .from('projects')
      .select('tenant_id')
      .eq('id', projectId)
      .single();

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const { membership, user, error: authError } = await requireTenant(supabase, {
      tenantId: project.tenant_id,
    });
    if (authError || !membership) return authError;

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const payload = parsed.data;
    const { data, error } = await supabase
      .from('product_changelog_entries')
      .insert({
        tenant_id: membership.tenant_id,
        project_id: projectId,
        sprint_id: payload.sprint_id ?? null,
        roadmap_item_id: payload.roadmap_item_id ?? null,
        release_label: payload.release_label ?? null,
        change_date: payload.change_date ?? new Date().toISOString().slice(0, 10),
        change_type: payload.change_type,
        title: payload.title,
        summary: payload.summary,
        impact_area: payload.impact_area ?? null,
        evidence_links_json: payload.evidence_links_json ?? [],
        visibility: payload.visibility ?? 'internal',
        created_by: user?.id ?? null,
      })
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('[cronogramas/changelog][POST]', error);
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

    const { data: project } = await supabase
      .from('projects')
      .select('tenant_id')
      .eq('id', projectId)
      .single();

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const { membership, error: authError } = await requireTenant(supabase, {
      tenantId: project.tenant_id,
    });
    if (authError || !membership) return authError;

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const { id, ...payload } = parsed.data;
    const { data, error } = await supabase
      .from('product_changelog_entries')
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
    console.error('[cronogramas/changelog][PATCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
