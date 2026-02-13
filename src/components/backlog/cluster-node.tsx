'use client';

import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { useUpdateCluster, useDeleteCluster } from '@/hooks/useBacklogMap';
import type { ClusterSummary } from '@/types';

export const ClusterNode = memo(({ data }: NodeProps) => {
  const cluster = data as unknown as ClusterSummary;
  const [collapsed, setCollapsed] = useState(cluster.is_collapsed);
  const updateCluster = useUpdateCluster();
  const deleteCluster = useDeleteCluster();

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    updateCluster.mutate({ clusterId: cluster.id, updates: { is_collapsed: next } });
  };

  return (
    <>
      <Handle type="target" position={Position.Left} />

      <div
        className="rounded-xl border-2 shadow-md bg-white/95 backdrop-blur-sm"
        style={{ borderColor: cluster.color, minWidth: 280 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-3 py-2 rounded-t-xl"
          style={{ backgroundColor: `${cluster.color}20` }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cluster.color }} />
            <span className="font-semibold text-sm truncate">{cluster.name}</span>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={toggleCollapse}
            >
              {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              onClick={() => deleteCluster.mutate(cluster.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        {!collapsed && (
          <div className="px-3 py-2 flex items-center gap-3 text-xs text-muted-foreground border-t">
            <span>{cluster.feature_count} features</span>
            <span>{cluster.total_story_points} pts</span>
            <Badge
              variant="outline"
              className="h-4 text-[10px] px-1"
              style={{ borderColor: cluster.color, color: cluster.color }}
            >
              {cluster.completion_rate ?? 0}% done
            </Badge>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} />
    </>
  );
});

ClusterNode.displayName = 'ClusterNode';
