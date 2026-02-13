'use client';

import { useState } from 'react';
import { Loader2, AlertCircle, Layers } from 'lucide-react';
import { BacklogMapToolbar } from './backlog-map-toolbar';
import { BacklogMapCanvas } from './backlog-map-canvas';
import { BacklogMapSidebar } from './backlog-map-sidebar';
import { useBacklogMap } from '@/hooks/useBacklogMap';

interface Props {
  projectId: string;
}

export function BacklogMapContent({ projectId }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { data, isLoading, error } = useBacklogMap(projectId);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-2">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
          <p className="text-sm text-red-600">Erro ao carregar mapa do backlog.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <BacklogMapToolbar projectId={projectId} />

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas ReactFlow */}
        <div className="flex-1 bg-gray-50">
          {data.clusters.length === 0 && data.features.filter(f => !f.cluster_id).length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-3 max-w-sm">
                <Layers className="h-16 w-16 text-gray-300 mx-auto" />
                <h3 className="font-medium text-gray-700">Nenhum cluster ainda</h3>
                <p className="text-sm text-muted-foreground">
                  Crie um cluster para começar a organizar suas features visualmente.
                </p>
              </div>
            </div>
          ) : (
            <BacklogMapCanvas data={data} projectId={projectId} />
          )}
        </div>

        {/* Sidebar com features sem cluster */}
        {sidebarOpen && (
          <BacklogMapSidebar
            data={data}
            projectId={projectId}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-l-0 rounded-l-lg px-1.5 py-3 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            ◀
          </button>
        )}
      </div>
    </div>
  );
}
