import { Megaphone } from 'lucide-react';
import { MarketingCalendarContent } from '@/components/marketing/marketing-calendar-content';

export default async function MarketingPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-uzzai-primary/10">
          <Megaphone className="h-5 w-5 text-uzzai-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing</h1>
          <p className="text-gray-500">Calendario editorial e planejamento de publicacoes</p>
        </div>
      </div>

      <MarketingCalendarContent projectId={projectId} />
    </div>
  );
}

