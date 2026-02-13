import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant, requireAdmin } from '@/lib/tenant';
import { z } from 'zod';

const featureUpdateSchema = z.object({
  code: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().nullable().optional(),
  category: z.string().trim().min(1).optional(),
  version: z.enum(['MVP', 'V1', 'V2', 'V3', 'V4']).optional(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'review', 'testing', 'done', 'blocked']).optional(),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']).optional(),
  moscow: z.enum(['Must', 'Should', 'Could', 'Wont']).nullable().optional(),
  gut_g: z.number().int().min(1).max(5).nullable().optional(),
  gut_u: z.number().int().min(1).max(5).nullable().optional(),
  gut_t: z.number().int().min(1).max(5).nullable().optional(),
  responsible: z.array(z.string()).nullable().optional(),
  due_date: z.string().date().nullable().optional(),
  story_points: z.number().int().min(0).nullable().optional(),
  business_value: z.number().int().min(0).nullable().optional(),
  work_effort: z.number().int().min(0).nullable().optional(),
  work_item_type: z.enum(['feature', 'bug']).optional(),
  solution_notes: z.string().trim().nullable().optional(),
  dod_custom_items: z.array(z.string().trim().min(1)).optional(),
  dod_functional: z.boolean().optional(),
  dod_tests: z.boolean().optional(),
  dod_code_review: z.boolean().optional(),
  dod_documentation: z.boolean().optional(),
  dod_deployed: z.boolean().optional(),
  dod_user_acceptance: z.boolean().optional(),
  is_mvp: z.boolean().optional(),
  acceptance_criteria: z.string().nullable().optional(),
  invest_checklist: z.record(z.string(), z.boolean().nullable()).nullable().optional(),
  is_epic: z.boolean().optional(),
  decomposed_at: z.string().datetime().nullable().optional(),
  is_spike: z.boolean().optional(),
  spike_timebox_hours: z.number().int().min(0).nullable().optional(),
  spike_outcome: z.string().nullable().optional(),
  spike_converted_to_story_id: z.string().uuid().nullable().optional(),
}).strict();

async function resolveFeatureTenantId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  featureId: string
) {
  const { data } = await supabase
    .from('features')
    .select('tenant_id')
    .eq('id', featureId)
    .single();

  return data?.tenant_id ?? null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const tenantId = await resolveFeatureTenantId(supabase, id);
    const { error: authError } = await requireTenant(supabase, { tenantId });
    if (authError) return authError;

    const { data: feature, error } = await supabase
      .from('features')
      .select(`
        *,
        project:projects(id, code, name),
        tasks:tasks(*),
        attachments:feature_attachments(*),
        sprint_features(
            id,
            sprint:sprints(id, name, status)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !feature) {
      return NextResponse.json({ error: 'Feature não encontrada' }, { status: 404 });
    }

    const currentSprintFeature = feature.sprint_features?.[0];
    const enrichedFeature = {
      ...feature,
      sprint: currentSprintFeature?.sprint,
      sprint_id: currentSprintFeature?.sprint?.id,
      sprint_feature_id: currentSprintFeature?.id,
    };

    return NextResponse.json({ data: enrichedFeature });
  } catch (error) {
    console.error('Error fetching feature:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const tenantId = await resolveFeatureTenantId(supabase, id);
    const { error: authError } = await requireTenant(supabase, { tenantId });
    if (authError) return authError;

    const body = await request.json();
    const parsed = featureUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const updateData = parsed.data;

    if (updateData.status === 'done') {
      const { data: currentFeature } = await supabase
        .from('features')
        .select('dod_progress')
        .eq('id', id)
        .single();

      if (currentFeature && currentFeature.dod_progress !== 100) {
        return NextResponse.json(
          { error: 'Feature só pode ser marcada como "Done" quando DoD estiver 100% completo' },
          { status: 400 }
        );
      }
    }

    const { data: feature, error } = await supabase
      .from('features')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating feature:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: feature });
  } catch (error) {
    console.error('Error updating feature:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const tenantId = await resolveFeatureTenantId(supabase, id);
    const { error: authError } = await requireAdmin(supabase, { tenantId });
    if (authError) return authError;

    const { error } = await supabase.from('features').delete().eq('id', id);

    if (error) {
      console.error('Error deleting feature:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Feature deletada com sucesso' });
  } catch (error) {
    console.error('Error deleting feature:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
