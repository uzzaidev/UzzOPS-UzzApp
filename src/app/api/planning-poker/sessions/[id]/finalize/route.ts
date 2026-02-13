import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const finalizeSchema = z.object({
  feature_id: z.string().uuid(),
  final_value: z.number().int().min(0),
  consensus_level: z.enum(['unanimous', 'majority', 'forced']).optional(),
  discussion_notes: z.string().nullable().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const supabase = await createClient();
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    const body = await request.json();
    const parsed = finalizeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const payload = parsed.data;

    const { data: votes } = await supabase
      .from('planning_poker_votes')
      .select('voter_name, vote_value, vote_numeric')
      .eq('session_id', sessionId)
      .eq('feature_id', payload.feature_id);

    const numericVotes = (votes ?? [])
      .filter((v) => v.vote_numeric !== null)
      .map((v) => v.vote_numeric as number);

    const votesSummary =
      numericVotes.length > 0
        ? {
            min: Math.min(...numericVotes),
            max: Math.max(...numericVotes),
            avg: Math.round(numericVotes.reduce((s, v) => s + v, 0) / numericVotes.length),
            median: numericVotes.sort((a, b) => a - b)[Math.floor(numericVotes.length / 2)],
            votes: (votes ?? []).map((v) => ({ voter: v.voter_name, value: v.vote_value })),
          }
        : null;

    const { data: result, error: resultError } = await supabase
      .from('planning_poker_results')
      .upsert(
        {
          session_id: sessionId,
          feature_id: payload.feature_id,
          final_value: payload.final_value,
          consensus_level: payload.consensus_level ?? 'majority',
          votes_summary: votesSummary,
          discussion_notes: payload.discussion_notes ?? null,
        },
        { onConflict: 'session_id,feature_id' }
      )
      .select()
      .single();

    if (resultError) {
      return NextResponse.json({ error: resultError.message }, { status: 500 });
    }

    const { data: session } = await supabase
      .from('planning_poker_sessions')
      .select('type')
      .eq('id', sessionId)
      .single();

    if (session) {
      const updateField =
        session.type === 'business_value'
          ? { business_value: payload.final_value }
          : { work_effort: payload.final_value };

      await supabase.from('features').update(updateField).eq('id', payload.feature_id);
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error finalizing poker vote:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
