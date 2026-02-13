import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const createDependencySchema = z.object({
  dependsOnId: z.string().uuid(),
  dependencyType: z.enum(['blocks', 'relates_to', 'duplicates']).optional(),
  projectId: z.string().uuid(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: featureId } = await params;
    const supabase = await createClient();
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    const { data, error } = await supabase
      .from('feature_dependencies')
      .select('*')
      .or(`feature_id.eq.${featureId},depends_on_id.eq.${featureId}`);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error('Error fetching dependencies:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: featureId } = await params;
    const supabase = await createClient();
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    const body = await request.json();
    const parsed = createDependencySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const payload = parsed.data;

    if (featureId === payload.dependsOnId) {
      return NextResponse.json({ error: 'Uma feature não pode depender de si mesma' }, { status: 400 });
    }

    const { data: circular } = await supabase
      .from('feature_dependencies')
      .select('id')
      .eq('feature_id', payload.dependsOnId)
      .eq('depends_on_id', featureId)
      .maybeSingle();

    if (circular) {
      return NextResponse.json({ error: 'Dependência circular detectada' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('feature_dependencies')
      .insert({
        project_id: payload.projectId,
        feature_id: featureId,
        depends_on_id: payload.dependsOnId,
        dependency_type: payload.dependencyType ?? 'blocks',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Dependência já existe' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating dependency:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: featureId } = await params;
    const { searchParams } = new URL(request.url);
    const dependsOnId = searchParams.get('dependsOnId');

    if (!dependsOnId) {
      return NextResponse.json({ error: 'dependsOnId é obrigatório' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    const { error } = await supabase
      .from('feature_dependencies')
      .delete()
      .eq('feature_id', featureId)
      .eq('depends_on_id', dependsOnId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dependency:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
