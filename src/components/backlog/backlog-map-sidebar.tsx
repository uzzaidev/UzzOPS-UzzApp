'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search, Layers } from 'lucide-react';
import { EpicDecompositionWizard } from './epic-decomposition-wizard';
import type { BacklogMapData, Feature } from '@/types';

interface Props {
  data: BacklogMapData;
  projectId: string;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  backlog: 'bg-gray-100 text-gray-600',
  todo: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
};

export function BacklogMapSidebar({ data, onClose }: Props) {
  const [search, setSearch] = useState('');
  const [wizardFeature, setWizardFeature] = useState<Feature | null>(null);

  const unassigned = data.features.filter((f) => !f.cluster_id);
  const filtered = unassigned.filter(
    (f) =>
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="w-72 border-l bg-white flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <p className="text-sm font-medium">Features sem cluster</p>
            <p className="text-xs text-muted-foreground">{unassigned.length} features</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar feature..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-7 text-sm"
            />
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {search ? 'Nenhuma feature encontrada' : 'Todas as features estão em clusters!'}
            </div>
          ) : (
            filtered.map((feature) => (
              <div
                key={feature.id}
                className="rounded-lg border bg-white p-2.5 hover:border-uzzai-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono text-muted-foreground">{feature.code}</p>
                    <p className="text-xs font-medium leading-tight truncate">{feature.name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_COLORS[feature.status ?? 'backlog'] ?? ''}`}>
                      {feature.status}
                    </span>
                    {feature.story_points && (
                      <span className="text-[10px] text-muted-foreground">{feature.story_points}pts</span>
                    )}
                  </div>
                </div>

                {/* Botão Decompor se for épico ou >8pts */}
                {((feature.story_points ?? 0) > 8 || feature.is_epic) && !feature.decomposed_at && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 h-6 w-full text-[10px] border-purple-300 text-purple-700 hover:bg-purple-50"
                    onClick={() => setWizardFeature(feature)}
                  >
                    <Layers className="mr-1 h-3 w-3" />
                    Decompor épico
                  </Button>
                )}

                {feature.decomposed_at && (
                  <Badge variant="outline" className="mt-1.5 text-[10px] border-gray-300 text-gray-500 w-full justify-center">
                    decomposto
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer stats */}
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          {data.clusters.length} clusters · {data.dependencies.length} dependências
        </div>
      </div>

      {/* Wizard de decomposição */}
      {wizardFeature && (
        <EpicDecompositionWizard
          epic={wizardFeature}
          open={!!wizardFeature}
          onOpenChange={(v) => { if (!v) setWizardFeature(null); }}
        />
      )}
    </>
  );
}
