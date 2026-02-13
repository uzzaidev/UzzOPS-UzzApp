import { BacklogMapContent } from '@/components/backlog/backlog-map-content';
import { Network } from 'lucide-react';

export default async function BacklogMapPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b bg-white flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
          <Network className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mapa Mental do Backlog</h1>
          <p className="text-sm text-gray-500">
            Organize features em clusters e visualize dependências
          </p>
        </div>
      </div>

      {/* Canvas full height */}
      <div className="flex-1 overflow-hidden">
        <BacklogMapContent projectId={projectId} />
      </div>
    </div>
  );
}
