import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SprintHeader } from '@/components/sprints/sprint-header';
import { SprintBacklogTable } from '@/components/sprints/sprint-backlog-table';
import { SprintGoalSection } from '@/components/sprints/sprint-goal-section';
import { SprintWorkflows } from '@/components/sprints/sprint-workflows';
import { Loader2 } from 'lucide-react';

async function getSprintDetails(sprintId: string) {
  const supabase = await createClient();

  const { data: sprint, error: sprintError } = await supabase
    .from('sprints')
    .select('*')
    .eq('id', sprintId)
    .single();

  if (sprintError || !sprint) {
    console.error('[Sprint Details] Error fetching sprint:', sprintError);
    return null;
  }

  const { data: sprintFeatures, error: featuresError } = await supabase
    .from('sprint_features')
    .select(`
      id,
      priority,
      added_at,
      feature:features (
        id,
        code,
        name,
        description,
        status,
        story_points,
        priority,
        dod_progress,
        created_at
      )
    `)
    .eq('sprint_id', sprintId)
    .order('priority', { ascending: true });

  if (featuresError) {
    console.error('[Sprint Details] Error fetching features:', featuresError);
  }

  const features = sprintFeatures?.map(sf => {
    if (!sf.feature) return null;
    return {
      ...sf.feature,
      sprint_priority: sf.priority,
      added_to_sprint_at: sf.added_at,
      sprint_feature_id: sf.id,
    };
  }).filter(Boolean) || [];

  const totalStoryPoints = features.reduce((sum, f: any) => sum + (f.story_points || 0), 0);
  const completedStoryPoints = features
    .filter((f: any) => f.status === 'done')
    .reduce((sum, f: any) => sum + (f.story_points || 0), 0);

  const featuresTotal = features.length;
  const featuresDone = features.filter((f: any) => f.status === 'done').length;

  const dodAverage = features.length > 0
    ? features.reduce((sum, f: any) => sum + (f.dod_progress || 0), 0) / features.length
    : 0;

  const velocityProgress = sprint.velocity_target > 0
    ? (completedStoryPoints / sprint.velocity_target) * 100
    : 0;

  const capacityProgress = sprint.capacity_total > 0
    ? (totalStoryPoints / sprint.capacity_total) * 100
    : 0;

  return {
    sprint,
    features,
    metrics: {
      velocity: {
        current: completedStoryPoints,
        target: sprint.velocity_target || 0,
        progress: Math.min(velocityProgress, 100)
      },
      features: {
        done: featuresDone,
        total: featuresTotal,
        progress: featuresTotal > 0 ? (featuresDone / featuresTotal) * 100 : 0
      },
      dod: {
        average: Math.round(dodAverage),
        progress: dodAverage
      },
      capacity: {
        used: totalStoryPoints,
        total: sprint.capacity_total || 0,
        progress: Math.min(capacityProgress, 100)
      }
    }
  };
}

export default async function SprintDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; id: string }>;
}) {
  const { id } = await params;

  const data = await getSprintDetails(id);

  if (!data) {
    notFound();
  }

  const { sprint, features, metrics } = data;

  return (
    <div className="flex flex-col gap-6 p-6">
      <SprintHeader sprint={sprint} metrics={metrics} />
      <SprintWorkflows sprint={sprint} />
      <SprintGoalSection sprint={sprint} />
      <Suspense fallback={<SprintBacklogLoading />}>
        <SprintBacklogTable
          sprintId={sprint.id}
          projectId={sprint.project_id}
          features={features}
          isProtected={sprint.is_protected}
        />
      </Suspense>
    </div>
  );
}

function SprintBacklogLoading() {
  return (
    <div className="flex items-center justify-center py-12 border rounded-lg bg-muted/5">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">Carregando backlog...</span>
    </div>
  );
}
