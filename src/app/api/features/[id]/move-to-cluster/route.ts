import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const moveToClusterSchema = z.object({
  clusterId: z.string().uuid().nullable().optional(),
  position: z.object({
    x: z.number().optional(),
    y: z.number().optional(),
  }).optional(),
});

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
    const parsed = moveToClusterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const payload = parsed.data;

    await supabase.from('feature_cluster_members').delete().eq('feature_id', featureId);

    if (!payload.clusterId) {
      return NextResponse.json({ data: null });
    }

    const { data, error } = await supabase
      .from('feature_cluster_members')
      .insert({
        feature_id: featureId,
        cluster_id: payload.clusterId,
        position_x: payload.position?.x ?? 0,
        position_y: payload.position?.y ?? 0,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error moving feature to cluster:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
