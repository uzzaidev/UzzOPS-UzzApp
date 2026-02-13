import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const voteSchema = z.object({
  feature_id: z.string().uuid(),
  vote_value: z.enum(['0', '½', '1', '2', '3', '5', '8', '13', '21', '∞', '?', '☕']),
  voter_name: z.string().trim().min(1),
});

const NUMERIC_MAP: Record<string, number | null> = {
  '0': 0, '½': 0, '1': 1, '2': 2, '3': 3, '5': 5,
  '8': 8, '13': 13, '21': 21, '∞': null, '?': null, '☕': null,
};

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
    const parsed = voteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const payload = parsed.data;

    const voteNumeric = NUMERIC_MAP[payload.vote_value] ?? null;

    const { data, error } = await supabase
      .from('planning_poker_votes')
      .upsert(
        {
          session_id: sessionId,
          feature_id: payload.feature_id,
          voter_name: payload.voter_name,
          vote_value: payload.vote_value,
          vote_numeric: voteNumeric,
        },
        { onConflict: 'session_id,feature_id,voter_name' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error saving poker vote:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
