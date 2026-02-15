'use client';

import { useState } from 'react';
import { useFeatures } from '@/hooks/useFeatures';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Star, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MvpToggle } from './mvp-toggle';
import { EditFeatureModal } from './edit-feature-modal';
import type { Feature } from '@/types';

interface Props {
  projectId: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Circle; color: string }> = {
  backlog: { label: 'Backlog', icon: Circle, color: 'text-gray-400' },
  todo: { label: 'To Do', icon: Circle, color: 'text-blue-400' },
  in_progress: { label: 'Em Progresso', icon: Clock, color: 'text-yellow-500' },
  review: { label: 'Review', icon: Clock, color: 'text-purple-500' },
  testing: { label: 'Testing', icon: AlertCircle, color: 'text-orange-500' },
  done: { label: 'Done', icon: CheckCircle2, color: 'text-green-500' },
  blocked: { label: 'Bloqueado', icon: AlertCircle, color: 'text-red-500' },
};

const COLUMNS = ['backlog', 'todo', 'in_progress', 'review', 'testing', 'done'] as const;

function MvpFeatureCard({
  feature,
  onEdit,
}: {
  feature: Feature;
  onEdit: (feature: Feature) => void;
}) {
  const config = STATUS_CONFIG[feature.status] ?? STATUS_CONFIG['backlog'];
  const Icon = config.icon;

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={`h-4 w-4 shrink-0 ${config.color}`} />
          <span className="text-xs font-mono text-muted-foreground">{feature.code}</span>
        </div>
        <MvpToggle featureId={feature.id} isMvp={feature.is_mvp ?? true} />
      </div>
      <p className="mt-1.5 text-sm font-medium leading-tight">{feature.name}</p>
      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        <Badge variant="outline" className="text-xs">
          {feature.version}
        </Badge>
        {feature.story_points && (
          <Badge variant="secondary" className="text-xs">
            {feature.story_points} pts
          </Badge>
        )}
        {feature.priority && (
          <Badge
            variant="outline"
            className={`text-xs ${feature.priority === 'P0' ? 'border-red-300 text-red-600' : ''}`}
          >
            {feature.priority}
          </Badge>
        )}
      </div>
      {feature.dod_progress !== null && feature.dod_progress !== undefined && (
        <div className="mt-2">
          <Progress value={feature.dod_progress} className="h-1.5" />
          <p className="mt-0.5 text-xs text-muted-foreground">DoD {feature.dod_progress}%</p>
        </div>
      )}
      <div className="mt-2">
        <Button variant="outline" size="sm" className="w-full" onClick={() => onEdit(feature)}>
          Editar
        </Button>
      </div>
    </div>
  );
}

export function MvpBoardContent({ projectId }: Props) {
  const { data: featuresResponse, isLoading } = useFeatures({ projectId });
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);

  const { data: mvpProgress } = useQuery({
    queryKey: ['mvp-progress', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/metrics/mvp-progress?projectId=${projectId}`);
      if (!res.ok) throw new Error('Erro ao buscar progresso MVP');
      const { data } = await res.json();
      return data;
    },
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-uzzai-primary" />
      </div>
    );
  }

  const allFeatures = featuresResponse?.data ?? [];
  const mvpFeatures = allFeatures.filter((f) => f.is_mvp);

  if (mvpFeatures.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Star className="mb-4 h-16 w-16 text-gray-200" />
          <h3 className="text-lg font-medium text-gray-700">Nenhuma feature MVP</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Marque features como MVP usando a estrela{' '}
            <Star className="inline h-4 w-4 text-yellow-400" /> na tabela de features ou nos cards
            abaixo.
          </p>
        </CardContent>
      </Card>
    );
  }

  const featuresByStatus = COLUMNS.reduce(
    (acc, status) => {
      acc[status] = mvpFeatures.filter((f) => f.status === status);
      return acc;
    },
    {} as Record<string, Feature[]>
  );

  return (
    <div className="space-y-6">
      <EditFeatureModal
        open={Boolean(editingFeature)}
        onOpenChange={(open) => {
          if (!open) setEditingFeature(null);
        }}
        feature={editingFeature}
      />

      {/* Barra de progresso MVP */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-yellow-800">Progresso do MVP</p>
              <p className="text-xs text-yellow-600 mt-0.5">
                {mvpProgress?.mvp_done ?? 0} de {mvpProgress?.mvp_total ?? mvpFeatures.length}{' '}
                features concluídas
              </p>
            </div>
            <span className="text-3xl font-bold text-yellow-700">
              {mvpProgress?.mvp_progress_percentage ?? 0}%
            </span>
          </div>
          <Progress
            value={mvpProgress?.mvp_progress_percentage ?? 0}
            className="h-3 [&>div]:bg-yellow-500"
          />
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {COLUMNS.map((status) => {
          const config = STATUS_CONFIG[status];
          const features = featuresByStatus[status] ?? [];

          return (
            <div key={status} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {config.label}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {features.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {features.map((feature) => (
                  <MvpFeatureCard key={feature.id} feature={feature} onEdit={setEditingFeature} />
                ))}
                {features.length === 0 && (
                  <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 text-center">
                    <p className="text-xs text-gray-400">Vazio</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
