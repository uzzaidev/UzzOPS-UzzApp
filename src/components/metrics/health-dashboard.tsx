'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import type { HealthStatus } from '@/hooks/useMetrics';

interface Props {
  health: HealthStatus;
}

type HealthLevel = 'healthy' | 'excellent' | 'warning' | 'critical' | 'unknown';

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'healthy':
    case 'excellent':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'critical':
      return <XCircle className="h-5 w-5 text-red-600" />;
    default:
      return <HelpCircle className="h-5 w-5 text-gray-400" />;
  }
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    healthy: { label: 'Saudável', className: 'bg-green-100 text-green-700 border-green-200' },
    excellent: { label: 'Excelente', className: 'bg-green-100 text-green-700 border-green-200' },
    warning: { label: 'Atenção', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    critical: { label: 'Crítico', className: 'bg-red-100 text-red-700 border-red-200' },
    unknown: { label: 'Sem dados', className: 'bg-gray-100 text-gray-500 border-gray-200' },
  };
  const c = config[status] ?? config['unknown'];
  return (
    <Badge variant="outline" className={c.className}>
      {c.label}
    </Badge>
  );
}

const HEALTH_METRICS = [
  {
    key: 'sprint_consistency_status' as keyof HealthStatus,
    label: 'Consistência de Sprints',
    description: 'Duração uniforme dos sprints ao longo do projeto',
    tip: 'Sprints com durações diferentes geram instabilidade na velocity.',
  },
  {
    key: 'carry_over_status' as keyof HealthStatus,
    label: 'Taxa de Carry-over',
    description: 'Features que não foram concluídas no sprint',
    tip: 'Carry-over > 30% indica que os sprints estão sendo superestimados.',
    metricKey: 'carry_over_percentage' as keyof HealthStatus,
    unit: '%',
  },
  {
    key: 'dod_compliance_status' as keyof HealthStatus,
    label: 'Compliance do DoD',
    description: 'Percentual médio de DoD nas features "Done"',
    tip: 'DoD < 85% indica que features estão sendo marcadas como prontas sem cumprir critérios.',
    metricKey: 'avg_dod_compliance' as keyof HealthStatus,
    unit: '%',
  },
  {
    key: 'velocity_stability_status' as keyof HealthStatus,
    label: 'Estabilidade da Velocity',
    description: 'Variação da velocity entre sprints (coeficiente de variação)',
    tip: 'Velocity instável dificulta planejamento e forecasting.',
  },
];

export function HealthDashboard({ health }: Props) {
  const scoreColor =
    health.overall_health_score >= 80
      ? 'text-green-600'
      : health.overall_health_score >= 60
        ? 'text-yellow-600'
        : 'text-red-600';

  const progressColor =
    health.overall_health_score >= 80
      ? '[&>div]:bg-green-500'
      : health.overall_health_score >= 60
        ? '[&>div]:bg-yellow-500'
        : '[&>div]:bg-red-500';

  if (health.fallback) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scrum Health</CardTitle>
          <CardDescription>
            Execute a migration 008 no Supabase para habilitar as métricas de saúde.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <HelpCircle className="mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm">A view <code className="text-xs bg-muted px-1 rounded">scrum_health_metrics</code> ainda não existe.</p>
            <p className="mt-1 text-xs">Aplique o arquivo <code className="text-xs bg-muted px-1 rounded">database/migrations/008_sprint_3_metrics.sql</code> no Supabase.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Score geral */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Scrum Health Score</CardTitle>
              <CardDescription>Avaliação geral da saúde do processo Scrum</CardDescription>
            </div>
            <StatusBadge status={health.overall_status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className={`text-5xl font-bold ${scoreColor}`}>{health.overall_health_score}</p>
              <p className="text-sm text-muted-foreground">/100</p>
            </div>
            <div className="flex-1">
              <Progress value={health.overall_health_score} className={`h-3 ${progressColor}`} />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>Crítico</span>
                <span>Atenção</span>
                <span>Saudável</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas individuais */}
      <Card>
        <CardHeader>
          <CardTitle>Indicadores Detalhados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {HEALTH_METRICS.map((metric) => {
              const status = health[metric.key] as string;
              const metricValue = metric.metricKey ? (health[metric.metricKey] as number) : null;

              return (
                <div
                  key={String(metric.key)}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <StatusIcon status={status} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{metric.label}</p>
                      <div className="flex items-center gap-2">
                        {metricValue !== null && (
                          <span className="text-sm font-bold">
                            {typeof metricValue === 'number' ? metricValue.toFixed(1) : metricValue}
                            {metric.unit}
                          </span>
                        )}
                        <StatusBadge status={status} />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{metric.description}</p>
                    {(status === 'warning' || status === 'critical') && (
                      <p className="mt-1.5 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">
                        💡 {metric.tip}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
