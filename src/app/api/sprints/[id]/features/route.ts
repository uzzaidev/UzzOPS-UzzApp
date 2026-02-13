import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const addFeatureToSprintSchema = z.object({
  feature_id: z.string().uuid(),
  force_override: z.boolean().optional(),
  reason: z.string().optional(),
  priority: z.number().int().min(0).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sprintId } = await params;
    const supabase = await createClient();
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    const { data: sprintFeatures, error } = await supabase
      .from('sprint_features')
      .select(`
        id,
        priority,
        added_at,
        feature:features (
          id,
          code,
          name,
          description,
          status,
          story_points,
          priority,
          created_at
        )
      `)
      .eq('sprint_id', sprintId)
      .order('priority', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Erro ao buscar features do sprint' },
        { status: 500 }
      );
    }

    const features = sprintFeatures?.map((sf) => {
      if (!sf.feature) return null;
      return {
        ...sf.feature,
        sprint_priority: sf.priority,
        added_to_sprint_at: sf.added_at,
        sprint_feature_id: sf.id,
      };
    }).filter(Boolean) || [];

    return NextResponse.json({ data: features });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro interno do servidor', message: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sprintId } = await params;
    const supabase = await createClient();
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    const body = await request.json();
    const parsed = addFeatureToSprintSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const payload = parsed.data;

    const { data: sprint, error: sprintError } = await supabase
      .from('sprints')
      .select('id, status, is_protected')
      .eq('id', sprintId)
      .single();

    if (sprintError || !sprint) {
      return NextResponse.json({ error: 'Sprint não encontrado' }, { status: 404 });
    }

    const forceOverride = payload.force_override === true;
    if (sprint.is_protected) {
      if (!forceOverride) {
        return NextResponse.json(
          { error: 'Sprint ativo (escopo protegido). Confirmação necessária.', code: 'SPRINT_PROTECTED' },
          { status: 403 }
        );
      }

      await supabase.from('sprint_scope_changes').insert({
        sprint_id: sprintId,
        feature_id: payload.feature_id,
        action: 'ADD',
        reason: payload.reason || 'Adição forçada em sprint ativo',
      });
    }

    const { data: feature, error: featureError } = await supabase
      .from('features')
      .select('id')
      .eq('id', payload.feature_id)
      .single();

    if (featureError || !feature) {
      return NextResponse.json({ error: 'Feature não encontrada' }, { status: 404 });
    }

    const { data: existing } = await supabase
      .from('sprint_features')
      .select('id')
      .eq('sprint_id', sprintId)
      .eq('feature_id', payload.feature_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Feature já vinculada a este sprint' }, { status: 400 });
    }

    const { data: sprintFeature, error } = await supabase
      .from('sprint_features')
      .insert({
        sprint_id: sprintId,
        feature_id: payload.feature_id,
        priority: payload.priority || 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Erro ao vincular feature ao sprint' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: sprintFeature }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sprintId } = await params;
    const supabase = await createClient();
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const featureId = searchParams.get('feature_id');
    const forceOverride = searchParams.get('force_override') === 'true';

    if (!featureId) {
      return NextResponse.json({ error: 'feature_id é obrigatório' }, { status: 400 });
    }

    const { data: sprint } = await supabase
      .from('sprints')
      .select('id, is_protected')
      .eq('id', sprintId)
      .single();

    if (sprint?.is_protected) {
      if (!forceOverride) {
        return NextResponse.json(
          {
            error: 'Sprint ativo (escopo protegido). Confirmação necessária para remover.',
            code: 'SPRINT_PROTECTED',
          },
          { status: 403 }
        );
      }

      await supabase.from('sprint_scope_changes').insert({
        sprint_id: sprintId,
        feature_id: featureId,
        action: 'REMOVE',
        reason: 'Remoção forçada em sprint ativo',
      });
    }

    const { error } = await supabase
      .from('sprint_features')
      .delete()
      .eq('sprint_id', sprintId)
      .eq('feature_id', featureId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Feature removida do sprint com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
