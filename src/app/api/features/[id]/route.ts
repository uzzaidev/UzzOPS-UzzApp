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
        tasks:tasks(*)
      `)
      .eq('id', id)
      .single();

    if (error || !feature) {
      return NextResponse.json({ error: 'Feature não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ data: feature });
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

    // Remover campos que não devem ser atualizados
    const { id: _id, tenant_id, project_id, created_at, updated_at, ...updateData } = body;

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
