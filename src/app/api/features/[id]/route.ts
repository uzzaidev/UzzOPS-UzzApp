import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: feature, error } = await supabase
      .from('features')
      .select(`
        *,
        project:projects(id, code, name),
        tasks:tasks(*),
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

    // Flattern sprint info for easier frontend consumption
    // Assumindo que uma feature só pode estar em UM sprint ativo/futuro por vez, ou pegamos o último.
    // O backend idealmente deveria garantir unicidade, mas o schema é N:N.
    // Vamos pegar o primeiro sprint encontrado (ou lógica de "current").
    const currentSprintFeature = feature.sprint_features?.[0];
    const enrichedFeature = {
      ...feature,
      sprint: currentSprintFeature?.sprint,
      sprint_id: currentSprintFeature?.sprint?.id,
      sprint_feature_id: currentSprintFeature?.id // Para remoção se necessário
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
    const body = await request.json();

    // Validação: Se tentando marcar como "done", verificar DoD
    if (body.status === 'done') {
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

    // Remover campos que não devem ser atualizados (incluindo dod_progress que é calculado)
    const {
      id: _id,
      tenant_id,
      project_id,
      created_at,
      updated_at,
      dod_progress, // Campo calculado, não deve ser enviado
      gut_score, // Também calculado
      bv_w_ratio, // Também calculado
      ...updateData
    } = body;

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
