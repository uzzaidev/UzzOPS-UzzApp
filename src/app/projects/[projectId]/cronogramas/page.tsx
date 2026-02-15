import { CalendarRange } from 'lucide-react';
import { CronogramasPageContent } from '@/components/cronogramas/cronogramas-page-content';

export default async function CronogramasPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
          <CalendarRange className="h-5 w-5 text-indigo-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cronogramas</h1>
          <p className="text-sm text-slate-500">
            Sala operacional de planejamento, execução e previsibilidade.
          </p>
        </div>
      </div>

      <CronogramasPageContent projectId={projectId} />
    </div>
  );
}
