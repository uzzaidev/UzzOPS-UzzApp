import { PokerDashboard } from '@/components/planning-poker/poker-dashboard';
import { Spade } from 'lucide-react';

export default async function PlanningPokerPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
          <Spade className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planning Poker</h1>
          <p className="text-gray-500">
            Estime Business Value e Work Effort com cartas Fibonacci
          </p>
        </div>
      </div>

      <PokerDashboard projectId={projectId} />
    </div>
  );
}
