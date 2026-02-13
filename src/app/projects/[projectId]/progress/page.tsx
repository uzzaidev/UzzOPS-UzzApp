import { TrendingUp } from 'lucide-react';
import { ProgressContent } from '@/components/metrics/progress-content';

export default async function ProgressPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-uzzai-primary/10">
          <TrendingUp className="h-5 w-5 text-uzzai-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progresso</h1>
          <p className="text-gray-500">Score composto, qualidade de dado e historico</p>
        </div>
      </div>

      <ProgressContent projectId={projectId} />
    </div>
  );
}

