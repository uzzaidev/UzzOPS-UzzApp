'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import type { Feature } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  backlog: 'bg-gray-100 text-gray-600',
  todo: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  review: 'bg-purple-100 text-purple-700',
  done: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
};

const PRIORITY_DOT: Record<string, string> = {
  P0: 'bg-red-500',
  P1: 'bg-orange-500',
  P2: 'bg-yellow-400',
  P3: 'bg-gray-400',
};

export const FeatureNode = memo(({ data, selected }: NodeProps) => {
  const feature = data as unknown as Feature;
  const statusClass = STATUS_COLORS[feature.status ?? 'backlog'] ?? STATUS_COLORS.backlog;
  const dotClass = PRIORITY_DOT[feature.priority ?? 'P3'] ?? PRIORITY_DOT.P3;

  return (
    <>
      <Handle type="target" position={Position.Left} />

      <div
        className={`rounded-lg border bg-white shadow-sm px-3 py-2 min-w-[180px] max-w-[220px] transition-all ${
          selected ? 'ring-2 ring-uzzai-primary shadow-md' : 'hover:shadow-md'
        } ${feature.is_epic ? 'border-purple-400 bg-purple-50/50' : 'border-gray-200'}`}
      >
        <div className="flex items-start gap-1.5">
          <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${dotClass}`} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-mono text-muted-foreground">{feature.code}</p>
            <p className="text-xs font-medium leading-tight truncate">{feature.name}</p>
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-1 flex-wrap">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusClass}`}>
            {feature.status?.replace('_', ' ')}
          </span>
          {feature.story_points && (
            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
              {feature.story_points}pts
            </span>
          )}
          {feature.is_mvp && (
            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">MVP</span>
          )}
          {feature.is_epic && (
            <Badge variant="outline" className="h-4 text-[10px] px-1 border-purple-400 text-purple-600">épico</Badge>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </>
  );
});

FeatureNode.displayName = 'FeatureNode';
