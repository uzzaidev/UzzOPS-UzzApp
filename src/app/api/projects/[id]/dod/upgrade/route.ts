import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/tenant';
import { z } from 'zod';

const upgradeDodSchema = z.object({
  toLevel: z.number().int().min(1).max(3),
  reason: z.string().nullable().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    const { error: authError } = await requireAdmin(supabase);
    if (authError) return authError;

    const body = await request.json();
    const parsed = upgradeDodSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const payload = parsed.data;

    const { data: currentLevel } = await supabase
      .from('dod_levels')
      .select('level')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .maybeSingle();

    await supabase
      .from('dod_levels')
      .update({ is_active: false })
      .eq('project_id', projectId)
      .eq('is_active', true);

    const { error } = await supabase
      .from('dod_levels')
      .update({ is_active: true, activated_at: new Date().toISOString() })
      .eq('project_id', projectId)
      .eq('level', payload.toLevel);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from('dod_history').insert({
      project_id: projectId,
      from_level: currentLevel?.level ?? null,
      to_level: payload.toLevel,
      reason: payload.reason ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error upgrading DoD:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
