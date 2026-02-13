import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const updateSessionSchema = z.object({
  revealed: z.boolean().optional(),
  current_feature_index: z.number().int().min(0).optional(),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
  completed_at: z.string().datetime().nullable().optional(),
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

    const [sessionRes, votesRes, resultsRes] = await Promise.all([
      supabase.from('planning_poker_sessions').select('*').eq('id', id).single(),
      supabase.from('planning_poker_votes').select('*').eq('session_id', id),
      supabase.from('planning_poker_results').select('*').eq('session_id', id),
    ]);

    if (sessionRes.error || !sessionRes.data) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }

    const session = sessionRes.data;
    const { data: features } = await supabase
      .from('features')
      .select('id, code, name, description, story_points, business_value, work_effort, bv_w_ratio')
      .in('id', session.feature_ids);

    return NextResponse.json({
      data: {
        session,
        features: features ?? [],
        votes: votesRes.data ?? [],
        results: resultsRes.data ?? [],
      },
    });
  } catch (error) {
    console.error('Error fetching poker session:', error);
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
    const parsed = updateSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('planning_poker_sessions')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating poker session:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
