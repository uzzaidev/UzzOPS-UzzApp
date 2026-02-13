import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;
    const supabase = await createClient();
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    // Buscar métricas de saúde da view scrum_health_metrics
    const { data: health, error: healthError } = await supabase
      .from('scrum_health_metrics')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (healthError && healthError.code !== 'PGRST116') {
      console.error('Error fetching health metrics:', healthError);
      return NextResponse.json({ error: healthError.message }, { status: 500 });
    }

    // Buscar dados adicionais de sprints para enriquecer
    const { data: sprints } = await supabase
      .from('sprints')
      .select('id, name, status, start_date, end_date')
      .eq('project_id', projectId)
      .order('start_date', { ascending: false })
      .limit(5);

    // Buscar velocity dos últimos sprints
    const { data: velocityData } = await supabase
      .from('sprint_velocity')
      .select('sprint_id, sprint_name, velocity, completion_rate, status')
      .eq('project_id', projectId)
      .eq('status', 'completed')
      .order('start_date', { ascending: false })
      .limit(5);

    // Se a view ainda não existe (migration não aplicada), retornar dados parciais
    if (!health) {
      const featuresTotal =
        (
          await supabase
            .from('features')
            .select('id', { count: 'exact', head: true })
            .eq('project_id', projectId)
        ).count ?? 0;

      const featuresDone =
        (
          await supabase
            .from('features')
            .select('id', { count: 'exact', head: true })
            .eq('project_id', projectId)
            .eq('status', 'done')
        ).count ?? 0;

      return NextResponse.json({
        data: {
          project_id: projectId,
          overall_health_score: 0,
          overall_status: 'unknown',
          sprint_consistency_status: 'unknown',
          carry_over_status: 'unknown',
          dod_compliance_status: 'unknown',
          velocity_stability_status: 'unknown',
          carry_over_percentage: 0,
          avg_dod_compliance: 0,
          velocity_cv: 0,
          duration_variations: 0,
          recentSprints: sprints ?? [],
          velocityTrend: velocityData ?? [],
          fallback: true,
          featuresTotal,
          featuresDone,
        },
      });
    }

    return NextResponse.json({
      data: {
        ...health,
        recentSprints: sprints ?? [],
        velocityTrend: velocityData ?? [],
        fallback: false,
      },
    });
  } catch (error) {
    console.error('Error fetching project health:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
