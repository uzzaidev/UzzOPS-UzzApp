'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Minus, TrendingDown } from 'lucide-react';
import type { VelocityForecast, SprintVelocity } from '@/hooks/useMetrics';

interface Props {
  forecast: VelocityForecast;
  sprints: SprintVelocity[];
  averageCompletionRate: number;
}

export function ForecastCard({ forecast, sprints, averageCompletionRate }: Props) {
  const completed = sprints.filter((s) => s.status === 'completed');

  // Calcular total de backlog pendente (features ainda não done)
  const totalBacklogPoints = sprints
    .filter((s) => s.status !== 'completed')
    .reduce((sum, s) => sum + (s.committed_points ?? 0), 0);

  // Estimativa de sprints necessários para concluir o backlog
  const sprintsNeededPessimistic =
    forecast.pessimistic > 0 ? Math.ceil(totalBacklogPoints / forecast.pessimistic) : null;
  const sprintsNeededRealistic =
    forecast.realistic > 0 ? Math.ceil(totalBacklogPoints / forecast.realistic) : null;
  const sprintsNeededOptimistic =
    forecast.optimistic > 0 ? Math.ceil(totalBacklogPoints / forecast.optimistic) : null;

  // Tendência de velocity (últimas 3 sprints)
  const last3 = completed.slice(-3);
  let velocityTrend: 'improving' | 'declining' | 'stable' = 'stable';
  if (last3.length >= 2) {
    const firstHalf = last3.slice(0, Math.floor(last3.length / 2));
    const secondHalf = last3.slice(Math.ceil(last3.length / 2));
    const firstAvg = firstHalf.reduce((s, v) => s + (v.velocity ?? 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((s, v) => s + (v.velocity ?? 0), 0) / secondHalf.length;
    velocityTrend =
      secondAvg > firstAvg * 1.05
        ? 'improving'
        : secondAvg < firstAvg * 0.95
          ? 'declining'
          : 'stable';
  }

  const trendConfig = {
    improving: { icon: TrendingUp, label: 'Melhorando', color: 'text-green-600' },
    declining: { icon: TrendingDown, label: 'Caindo', color: 'text-red-600' },
    stable: { icon: Minus, label: 'Estável', color: 'text-gray-500' },
  };
  const { icon: TrendIcon, label: trendLabel, color: trendColor } = trendConfig[velocityTrend];

  return (
    <div className="space-y-4">
      {/* Forecast de velocity */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast por Faixas</CardTitle>
          <CardDescription>Estimativa baseada nos últimos 3 sprints concluídos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
              <p className="mb-1 text-xs font-medium text-red-600 uppercase tracking-wide">
                Pessimista (-20%)
              </p>
              <p className="text-3xl font-bold text-red-700">{forecast.pessimistic}</p>
              <p className="mt-1 text-xs text-red-500">pts/sprint</p>
              {sprintsNeededPessimistic !== null && totalBacklogPoints > 0 && (
                <p className="mt-2 text-xs text-red-600">
                  ~{sprintsNeededPessimistic} sprints p/ backlog
                </p>
              )}
            </div>

            <div className="rounded-lg border border-uzzai-primary/30 bg-uzzai-primary/10 p-4 text-center ring-2 ring-uzzai-primary/20">
              <p className="mb-1 text-xs font-medium text-uzzai-primary uppercase tracking-wide">
                Realista
              </p>
              <p className="text-3xl font-bold text-uzzai-primary">{forecast.realistic}</p>
              <p className="mt-1 text-xs text-uzzai-primary/70">pts/sprint</p>
              {sprintsNeededRealistic !== null && totalBacklogPoints > 0 && (
                <p className="mt-2 text-xs text-uzzai-primary">
                  ~{sprintsNeededRealistic} sprints p/ backlog
                </p>
              )}
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
              <p className="mb-1 text-xs font-medium text-green-600 uppercase tracking-wide">
                Otimista (+20%)
              </p>
              <p className="text-3xl font-bold text-green-700">{forecast.optimistic}</p>
              <p className="mt-1 text-xs text-green-500">pts/sprint</p>
              {sprintsNeededOptimistic !== null && totalBacklogPoints > 0 && (
                <p className="mt-2 text-xs text-green-600">
                  ~{sprintsNeededOptimistic} sprints p/ backlog
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas de qualidade */}
      <Card>
        <CardHeader>
          <CardTitle>Indicadores de Processo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Taxa de conclusão */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Taxa de Conclusão Média</p>
                <p className="text-xs text-muted-foreground">
                  Pontos entregues vs comprometidos
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{averageCompletionRate}%</p>
                <Badge
                  variant="outline"
                  className={
                    averageCompletionRate >= 85
                      ? 'border-green-200 text-green-700'
                      : averageCompletionRate >= 70
                        ? 'border-yellow-200 text-yellow-700'
                        : 'border-red-200 text-red-700'
                  }
                >
                  {averageCompletionRate >= 85
                    ? 'Ótimo'
                    : averageCompletionRate >= 70
                      ? 'Regular'
                      : 'Abaixo do esperado'}
                </Badge>
              </div>
            </div>

            {/* Tendência de velocity */}
            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="text-sm font-medium">Tendência de Velocity</p>
                <p className="text-xs text-muted-foreground">Baseado nos últimos 3 sprints</p>
              </div>
              <div className={`flex items-center gap-2 ${trendColor}`}>
                <TrendIcon className="h-5 w-5" />
                <span className="text-sm font-medium">{trendLabel}</span>
              </div>
            </div>

            {/* Sprints analisados */}
            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="text-sm font-medium">Sprints Analisados</p>
                <p className="text-xs text-muted-foreground">Para cálculo do forecast</p>
              </div>
              <Badge variant="secondary">{Math.min(3, completed.length)} de {completed.length}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
