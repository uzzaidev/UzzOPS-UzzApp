import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { RetrospectiveBoard } from '@/components/sprints/retrospective-board';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, ClipboardList } from 'lucide-react';

export default async function RetrospectivePage({
  params,
}: {
  params: Promise<{ projectId: string; id: string }>;
}) {
  const { projectId, id: sprintId } = await params;
  const supabase = await createClient();

  const { data: sprint } = await supabase
    .from('sprints')
    .select('id, name, status, start_date, end_date, project_id')
    .eq('id', sprintId)
    .single();

  if (!sprint) notFound();

  const statusLabels: Record<string, string> = {
    planned: 'Planejado',
    active: 'Ativo',
    completed: 'Concluído',
    cancelled: 'Cancelado',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href={`/projects/${projectId}/sprints/${sprintId}`}
          className="mt-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Retrospectiva</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-gray-500">{sprint.name}</span>
                <Badge variant="outline">{statusLabels[sprint.status] ?? sprint.status}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RetrospectiveBoard
        sprintId={sprint.id}
        sprintName={sprint.name}
        projectId={sprint.project_id}
      />
    </div>
  );
}
