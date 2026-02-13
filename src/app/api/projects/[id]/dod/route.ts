import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    const [levelsRes, historyRes, velocityRes] = await Promise.all([
      supabase
        .from('dod_levels')
        .select('*')
        .eq('project_id', projectId)
        .order('level', { ascending: true }),
      supabase
        .from('dod_history')
        .select('*')
        .eq('project_id', projectId)
        .order('changed_at', { ascending: false })
        .limit(10),
      supabase
        .from('sprint_velocity')
        .select('velocity, completion_rate')
        .eq('project_id', projectId)
        .order('sprint_number', { ascending: false })
        .limit(3),
    ]);

    const levels = levelsRes.data ?? [];
    const history = historyRes.data ?? [];
    const activeLevel = levels.find((l) => l.is_active) ?? null;

    // Verificar elegibilidade para upgrade
    let canUpgrade = false;
    const velocityData = velocityRes.data ?? [];
    if (velocityData.length >= 3 && activeLevel && activeLevel.level < 3) {
      const velocities = velocityData.map((v) => v.velocity ?? 0);
      const avg = velocities.reduce((a, b) => a + b, 0) / velocities.length;
      if (avg > 0) {
        const variance = velocities.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / velocities.length;
        const cv = (Math.sqrt(variance) / avg) * 100;
        const avgCompletion =
          velocityData.reduce((sum, v) => sum + (v.completion_rate ?? 0), 0) / velocityData.length;
        canUpgrade = cv < 20 && avgCompletion > 85;
      }
    }

    return NextResponse.json({ data: { levels, activeLevel, canUpgrade, history } });
  } catch (error) {
    console.error('Error fetching DoD:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
