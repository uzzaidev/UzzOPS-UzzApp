import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';

interface Props {
  timebox?: number | null;
}

export function SpikeBadge({ timebox }: Props) {
  return (
    <Badge variant="outline" className="gap-1 border-yellow-400 text-yellow-700 bg-yellow-50">
      <Lightbulb className="h-3 w-3" />
      Spike
      {timebox && (
        <span className="text-[10px]">({timebox}h)</span>
      )}
    </Badge>
  );
}
