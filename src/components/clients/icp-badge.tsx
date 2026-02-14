'use client';

import { Badge } from '@/components/ui/badge';

type Icp = 'hot' | 'warm' | 'cold' | 'future' | null | undefined;

const ICP_META: Record<Exclude<Icp, null | undefined>, { label: string; className: string }> = {
  hot: { label: 'HOT', className: 'bg-red-50 text-red-700 border-red-200' },
  warm: { label: 'WARM', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  cold: { label: 'COLD', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  future: { label: 'FUTURE', className: 'bg-violet-50 text-violet-700 border-violet-200' },
};

export function IcpBadge({ icp }: { icp: Icp }) {
  if (!icp) return <Badge variant="outline">-</Badge>;
  const meta = ICP_META[icp];
  return (
    <Badge variant="outline" className={meta.className}>
      {meta.label}
    </Badge>
  );
}

