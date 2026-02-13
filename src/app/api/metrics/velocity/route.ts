import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId é obrigatório' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    // Buscar dados de velocity da materialized view
    const { data: velocityData, error } = await supabase
      .from('sprint_velocity')
      .select('*')
      .eq('project_id', projectId)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching velocity:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const completed = velocityData?.filter((s) => s.status === 'completed') ?? [];

    // Calcular médias
    const avgVelocity =
      completed.length > 0
        ? Math.round(completed.reduce((sum, s) => sum + (s.velocity ?? 0), 0) / completed.length)
        : 0;

    const avgCompletionRate =
      completed.length > 0
        ? Math.round(
            completed.reduce((sum, s) => sum + (s.completion_rate ?? 0), 0) / completed.length
          )
        : 0;

    // Forecast baseado nos últimos 3 sprints
    const last3 = completed.slice(-3);
    const forecastAvg =
      last3.length > 0
        ? Math.round(last3.reduce((sum, s) => sum + (s.velocity ?? 0), 0) / last3.length)
        : 0;

    const forecastPessimistic = Math.max(0, forecastAvg - Math.round(forecastAvg * 0.2));
    const forecastOptimistic = forecastAvg + Math.round(forecastAvg * 0.2);

    return NextResponse.json({
      data: {
        sprints: velocityData ?? [],
        averageVelocity: avgVelocity,
        averageCompletionRate: avgCompletionRate,
        totalSprintsCompleted: completed.length,
        forecast: {
          pessimistic: forecastPessimistic,
          realistic: forecastAvg,
          optimistic: forecastOptimistic,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching velocity metrics:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
