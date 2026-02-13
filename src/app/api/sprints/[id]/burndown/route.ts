import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sprintId } = await params;
    const supabase = await createClient();
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    // Buscar dados do sprint
    const { data: sprint, error: sprintError } = await supabase
      .from('sprints')
      .select('id, name, start_date, end_date, status, tenant_id')
      .eq('id', sprintId)
      .single();

    if (sprintError || !sprint) {
      return NextResponse.json({ error: 'Sprint não encontrado' }, { status: 404 });
    }

    // Buscar snapshots históricos
    const { data: snapshots, error: snapshotError } = await supabase
      .from('sprint_burndown_snapshots')
      .select('*')
      .eq('sprint_id', sprintId)
      .order('snapshot_date', { ascending: true });

    if (snapshotError) {
      console.error('Error fetching burndown snapshots:', snapshotError);
      return NextResponse.json({ error: snapshotError.message }, { status: 500 });
    }

    // Calcular métricas atuais (para o snapshot de hoje se não existir)
    const { data: currentFeatures } = await supabase
      .from('sprint_features')
      .select('feature:features(id, story_points, status)')
      .eq('sprint_id', sprintId);

    const features = currentFeatures?.map((sf) => sf.feature).flat() ?? [];
    const pointsTotal = features.reduce((sum, f: any) => sum + (f?.story_points ?? 0), 0);
    const pointsDone = features
      .filter((f: any) => f?.status === 'done')
      .reduce((sum, f: any) => sum + (f?.story_points ?? 0), 0);

    // Gerar linha ideal (do início ao fim do sprint)
    const startDate = sprint.start_date ? new Date(sprint.start_date) : new Date();
    const endDate = sprint.end_date ? new Date(sprint.end_date) : new Date();
    const totalDays = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    const idealLine: { date: string; idealPoints: number }[] = [];
    for (let i = 0; i <= totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      idealLine.push({
        date: date.toISOString().split('T')[0],
        idealPoints: Math.round(pointsTotal - (pointsTotal / totalDays) * i),
      });
    }

    return NextResponse.json({
      data: {
        sprint,
        snapshots: snapshots ?? [],
        idealLine,
        current: {
          pointsTotal,
          pointsDone,
          pointsRemaining: pointsTotal - pointsDone,
          completionPercentage:
            pointsTotal > 0 ? Math.round((pointsDone / pointsTotal) * 100) : 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching burndown:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sprintId } = await params;
    const supabase = await createClient();

    // Buscar tenant_id do sprint
    const { data: sprint, error: sprintError } = await supabase
      .from('sprints')
      .select('tenant_id')
      .eq('id', sprintId)
      .single();

    if (sprintError || !sprint) {
      return NextResponse.json({ error: 'Sprint não encontrado' }, { status: 404 });
    }

    // Calcular métricas atuais
    const { data: currentFeatures } = await supabase
      .from('sprint_features')
      .select('feature:features(id, story_points, status)')
      .eq('sprint_id', sprintId);

    const features = currentFeatures?.map((sf) => sf.feature).flat() ?? [];
    const pointsTotal = features.reduce((sum, f: any) => sum + (f?.story_points ?? 0), 0);
    const pointsDone = features
      .filter((f: any) => f?.status === 'done')
      .reduce((sum, f: any) => sum + (f?.story_points ?? 0), 0);
    const featuresTotal = features.length;
    const featuresDone = features.filter((f: any) => f?.status === 'done').length;

    const today = new Date().toISOString().split('T')[0];

    // Upsert snapshot de hoje
    const { data: snapshot, error } = await supabase
      .from('sprint_burndown_snapshots')
      .upsert(
        {
          tenant_id: sprint.tenant_id,
          sprint_id: sprintId,
          snapshot_date: today,
          points_total: pointsTotal,
          points_done: pointsDone,
          points_remaining: pointsTotal - pointsDone,
          features_total: featuresTotal,
          features_done: featuresDone,
          features_remaining: featuresTotal - featuresDone,
        },
        { onConflict: 'sprint_id,snapshot_date' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error creating burndown snapshot:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: snapshot }, { status: 201 });
  } catch (error) {
    console.error('Error creating burndown snapshot:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
