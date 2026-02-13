import { DodCard } from '@/components/quality/dod-card';
import { ShieldCheck } from 'lucide-react';

export default async function DodPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
          <ShieldCheck className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Definition of Done</h1>
          <p className="text-gray-500">Critérios de qualidade evolutivos</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <DodCard projectId={projectId} />
      </div>
    </div>
  );
}
