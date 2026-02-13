import { MvpBoardContent } from '@/components/features/mvp-board-content';
import { Star } from 'lucide-react';

export default async function MvpBoardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
          <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">MVP Board</h1>
          <p className="text-gray-500">Features essenciais para o lançamento</p>
        </div>
      </div>

      <MvpBoardContent projectId={projectId} />
    </div>
  );
}
