import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const createRetrospectiveSchema = z.object({
  sprint_id: z.string().uuid(),
  project_id: z.string().uuid(),
  category: z.enum(['worked_well', 'needs_improvement', 'experiment']),
  action_text: z.string().trim().min(1),
  status: z.enum(['pending', 'in_progress', 'done', 'abandoned']).optional(),
  owner_id: z.string().uuid().nullable().optional(),
  due_date: z.string().date().nullable().optional(),
  success_criteria: z.string().nullable().optional(),
  outcome: z.string().nullable().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sprintId = searchParams.get('sprintId');
    const projectId = searchParams.get('projectId');

    if (!sprintId && !projectId) {
      return NextResponse.json({ error: 'sprintId ou projectId é obrigatório' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    let query = supabase
      .from('retrospective_actions')
      .select('*')
      .order('created_at', { ascending: true });

    if (sprintId) query = query.eq('sprint_id', sprintId);
    if (projectId) query = query.eq('project_id', projectId);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    console.error('Error fetching retrospective actions:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { membership, error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    const body = await request.json();
    const parsed = createRetrospectiveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const payload = parsed.data;

    const { data, error } = await supabase
      .from('retrospective_actions')
      .insert({
        tenant_id: membership!.tenant_id,
        sprint_id: payload.sprint_id,
        project_id: payload.project_id,
        category: payload.category,
        action_text: payload.action_text,
        status: payload.status ?? 'pending',
        owner_id: payload.owner_id ?? null,
        due_date: payload.due_date ?? null,
        success_criteria: payload.success_criteria ?? null,
        outcome: payload.outcome ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating retrospective action:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
