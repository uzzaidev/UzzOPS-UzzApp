import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    // Get feature IDs for this sprint
    const { data: sprintFeatures } = await supabase
      .from('sprint_features')
      .select('feature_id')
      .eq('sprint_id', id);

    const featureIds = sprintFeatures?.map((sf) => sf.feature_id) ?? [];

    const [summaryRes, spikesRes] = await Promise.all([
      supabase.from('spike_summary').select('*').eq('sprint_id', id).maybeSingle(),
      featureIds.length > 0
        ? supabase.from('features').select('*').in('id', featureIds).eq('is_spike', true)
        : Promise.resolve({ data: [] }),
    ]);

    return NextResponse.json({
      data: {
        summary: summaryRes.data,
        spikes: spikesRes.data ?? [],
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
