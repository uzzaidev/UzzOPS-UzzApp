import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant, requireAdmin } from '@/lib/tenant';
import { z } from 'zod';

const updateSprintSchema = z.object({
  sprint_goal: z.string().trim().min(10).optional(),
  name: z.string().trim().min(1).optional(),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  status: z.enum(['planned', 'active', 'completed', 'cancelled']).optional(),
  capacity_total: z.number().int().min(0).nullable().optional(),
  velocity_target: z.number().int().min(0).nullable().optional(),
  velocity_actual: z.number().int().min(0).optional(),
  is_protected: z.boolean().optional(),
  started_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
}).strict();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    const { data: sprint, error } = await supabase
      .from('sprints')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !sprint) {
      return NextResponse.json({ error: 'Sprint não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data: sprint });
  } catch (error) {
    console.error('Error fetching sprint:', error);
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
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    const body = await request.json();
    const parsed = updateSprintSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const updateData: Record<string, unknown> = { ...parsed.data };

    if (updateData.start_date && updateData.end_date) {
      const startDate = new Date(updateData.start_date as string);
      const endDate = new Date(updateData.end_date as string);
      if (startDate >= endDate) {
        return NextResponse.json(
          { error: 'Data de início deve ser anterior à data de término' },
          { status: 400 }
        );
      }
    }

    if (updateData.status === 'active') {
      const { data: currentSprint } = await supabase
        .from('sprints')
        .select('project_id, status')
        .eq('id', id)
        .single();

      if (currentSprint) {
        await supabase
          .from('sprints')
          .update({ status: 'completed' })
          .eq('project_id', currentSprint.project_id)
          .eq('status', 'active')
          .neq('id', id);

        updateData.is_protected = true;
        if (currentSprint.status !== 'active') {
          updateData.started_at = new Date().toISOString();
        }
      }
    }

    if (updateData.status === 'completed') {
      const { data: currentSprint } = await supabase
        .from('sprints')
        .select('status')
        .eq('id', id)
        .single();

      if (currentSprint && currentSprint.status !== 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
    }

    const { data: sprint, error } = await supabase
      .from('sprints')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating sprint:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: sprint });
  } catch (error) {
    console.error('Error updating sprint:', error);
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
    const { error: authError } = await requireAdmin(supabase);
    if (authError) return authError;

    const { error } = await supabase.from('sprints').delete().eq('id', id);
    if (error) {
      console.error('Error deleting sprint:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Sprint deletado com sucesso' });
  } catch (error) {
    console.error('Error deleting sprint:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
