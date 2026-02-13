import { MetricsContent } from '@/components/metrics/metrics-content';
import { BarChart3 } from 'lucide-react';

export default async function MetricsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-uzzai-primary/10">
          <BarChart3 className="h-5 w-5 text-uzzai-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Métricas</h1>
          <p className="text-gray-500">Velocity, Burndown, Forecast e Scrum Health</p>
        </div>
      </div>

      <MetricsContent projectId={projectId} />
    </div>
  );
}
