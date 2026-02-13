import { DailyPageContent } from '@/components/daily/daily-page-content';
import { ClipboardList } from 'lucide-react';

export default async function DailyPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
          <ClipboardList className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Scrum</h1>
          <p className="text-sm text-gray-500">
            Registre seu stand-up diário e acompanhe impedimentos
          </p>
        </div>
      </div>

      <DailyPageContent projectId={projectId} />
    </div>
  );
}
