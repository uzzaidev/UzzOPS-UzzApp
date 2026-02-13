import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const createSprintSchema = z.object({
  project_id: z.string().uuid(),
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  sprint_goal: z.string().trim().min(10),
  start_date: z.string().date(),
  end_date: z.string().date(),
  duration_weeks: z.number().int().min(1).max(4).optional(),
  status: z.enum(['planned', 'active', 'completed', 'cancelled']).optional(),
  capacity_total: z.number().int().min(0).nullable().optional(),
  velocity_target: z.number().int().min(0).nullable().optional(),
  velocity_actual: z.number().int().min(0).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json({ error: 'project_id é obrigatório' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: project } = await supabase
      .from('projects')
      .select('tenant_id')
      .eq('id', projectId)
      .single();

    const { error: authError } = await requireTenant(supabase, {
      tenantId: project?.tenant_id ?? null,
    });
    if (authError) return authError;

    const { data: sprints, error } = await supabase
      .from('sprints')
      .select('*')
      .eq('project_id', projectId)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching sprints:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: sprints });
  } catch (error) {
    console.error('Error in GET /api/sprints:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const parsed = createSprintSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const payload = parsed.data;

    const { data: project } = await supabase
      .from('projects')
      .select('tenant_id')
      .eq('id', payload.project_id)
      .single();

    const { membership, error: authError } = await requireTenant(supabase, {
      tenantId: project?.tenant_id ?? null,
    });
    if (authError) return authError;

    const startDate = new Date(payload.start_date);
    const endDate = new Date(payload.end_date);
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'Data de início deve ser anterior à data de término' },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from('sprints')
      .select('id')
      .eq('project_id', payload.project_id)
      .eq('code', payload.code)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `Código ${payload.code} já existe neste projeto` },
        { status: 400 }
      );
    }

    if (payload.status === 'active') {
      await supabase
        .from('sprints')
        .update({ status: 'completed' })
        .eq('project_id', payload.project_id)
        .eq('status', 'active');
    }

    const { data: sprint, error } = await supabase
      .from('sprints')
      .insert({
        tenant_id: membership!.tenant_id,
        project_id: payload.project_id,
        code: payload.code,
        name: payload.name,
        sprint_goal: payload.sprint_goal,
        duration_weeks: payload.duration_weeks ?? 2,
        start_date: payload.start_date,
        end_date: payload.end_date,
        status: payload.status ?? 'planned',
        capacity_total: payload.capacity_total ?? null,
        velocity_target: payload.velocity_target ?? null,
        velocity_actual: payload.velocity_actual ?? 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating sprint:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: sprint }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/sprints:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
