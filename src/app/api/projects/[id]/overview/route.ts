import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { ProjectOverview } from '@/types';
import { requireTenant } from '@/lib/tenant';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('[Overview API] Fetching overview for project:', id);
    const supabase = await createClient();

    const { data: projectTenant } = await supabase
      .from('projects')
      .select('tenant_id')
      .eq('id', id)
      .single();

    const { error: authError } = await requireTenant(supabase, {
      tenantId: projectTenant?.tenant_id ?? null,
    });
    if (authError) return authError;

    // Buscar projeto
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (projectError) {
      console.error('[Overview API] Error fetching project:', projectError);
      return NextResponse.json(
        { error: 'Erro ao buscar projeto', details: projectError.message },
        { status: 500 }
      );
    }

    if (!project) {
      console.log('[Overview API] Project not found:', id);
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    console.log('[Overview API] Project found:', project.code);

    // Buscar todas as features do projeto
    const { data: features } = await supabase
      .from('features')
      .select('*')
      .eq('project_id', id);

    // Buscar sprints ativos (não falhar se não existir)
    const { data: sprints } = await supabase
      .from('sprints')
      .select('*')
      .eq('project_id', id)
      .order('start_date', { ascending: false });

    // Buscar membros da equipe (não falhar se não existir)
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('*')
      .eq('tenant_id', project.tenant_id)
      .eq('is_active', true);

    // Buscar riscos críticos (não falhar se não existir)
    const { data: risks } = await supabase
      .from('risks')
      .select('*')
      .eq('project_id', id)
      .gte('gut_score', 100); // Riscos com GUT >= 100 são críticos

    const featuresList = features ?? [];

    // Calcular KPIs
    const totalFeatures = featuresList.length;
    const featuresDone = featuresList.filter((f) => f.status === 'done').length;
    const featuresInProgress = featuresList.filter((f) => f.status === 'in_progress').length;
    const featuresTodo = featuresList.filter((f) => ['backlog', 'todo'].includes(f.status)).length;

    // Calcular progresso
    const progress = totalFeatures > 0 ? Math.round((featuresDone / totalFeatures) * 100) : 0;

    // Calcular média de DoD
    const avgDodProgress = totalFeatures > 0
      ? Math.round(
          featuresList.reduce((sum, f) => sum + (f.dod_progress || 0), 0) / totalFeatures
        )
      : 0;

    // Sprint atual (primeiro ativo, ou o mais recente planejado)
    const currentSprint =
      sprints?.find((s) => s.status === 'active') ||
      sprints?.find((s) => s.status === 'planned') ||
      null;

    // Sprints ativos
    const activeSprints = sprints?.filter((s) => s.status === 'active') || [];

    // Montar resposta
    const overview: ProjectOverview = {
      project,
      totalFeatures,
      featuresDone,
      featuresInProgress,
      featuresTodo,
      progress,
      avgDodProgress,
      teamSize: teamMembers?.length || 0,
      currentSprint,
      activeSprints,
      criticalRisks: risks?.length || 0,
    };

    console.log('[Overview API] Overview compiled successfully:', {
      totalFeatures,
      featuresDone,
      progress,
      teamSize: teamMembers?.length || 0,
    });

    return NextResponse.json(overview);
  } catch (error) {
    console.error('[Overview API] Error fetching project overview:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
