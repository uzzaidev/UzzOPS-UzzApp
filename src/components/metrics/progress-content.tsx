'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw } from 'lucide-react';
import { useCurrentMembership } from '@/hooks/useTeam';
import { useProgressDetails, useProgressHistory, useRecalculateProgress } from '@/hooks/useProgress';

interface Props {
  projectId: string;
}

function labelVariant(label: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (label === 'healthy') return 'default';
  if (label === 'attention') return 'secondary';
  if (label === 'critical') return 'destructive';
  return 'outline';
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR');
}

export function ProgressContent({ projectId }: Props) {
  const { data: details, isLoading: loadingDetails, error: detailsError } = useProgressDetails(projectId);
  const { data: history, isLoading: loadingHistory, error: historyError } = useProgressHistory(projectId, 30);
  const { data: membership } = useCurrentMembership();
  const recalculate = useRecalculateProgress(projectId);

  const isAdmin = membership?.role === 'admin';
  const snapshot = details?.latestSnapshot ?? null;
  const settings = details?.settings ?? null;
  const flags = snapshot?.insufficient_data_flags ?? {};
  const flagKeys = Object.keys(flags).filter((k) => flags[k]);

  if (loadingDetails) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-uzzai-primary" />
      </div>
    );
  }

  if (detailsError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6 text-red-600">
          Erro ao carregar detalhes de progresso.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Resumo Atual</CardTitle>
            <CardDescription>Ultimo snapshot calculado para o projeto</CardDescription>
          </div>
          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => recalculate.mutate()}
              disabled={recalculate.isPending}
            >
              {recalculate.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Recalcular
            </Button>
          )}
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="mt-1 text-2xl font-bold">
              {snapshot?.progress_score === null || snapshot?.progress_score === undefined
                ? '-'
                : snapshot.progress_score.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge className="mt-2" variant={labelVariant(snapshot?.progress_label ?? 'insufficient_data')}>
              {snapshot?.progress_label ?? 'insufficient_data'}
            </Badge>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Confianca</p>
            <p className="mt-1 text-2xl font-bold">{snapshot?.score_confidence ?? 0}%</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Atualizado Em</p>
            <p className="mt-1 text-sm font-medium">{formatDate(snapshot?.snapshot_at)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Qualidade de Dados</CardTitle>
            <CardDescription>Dimensoes sem dados suficientes</CardDescription>
          </CardHeader>
          <CardContent>
            {flagKeys.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem flags de dados insuficientes.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {flagKeys.map((key) => (
                  <Badge key={key} variant="outline">
                    {key}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuracoes</CardTitle>
            <CardDescription>Parametros atuais de calculo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Formula:</span> {settings?.formula_version ?? 'v1'}
            </p>
            <p>
              <span className="text-muted-foreground">Threshold risco critico:</span>{' '}
              {settings?.risk_critical_threshold ?? 80}
            </p>
            <p>
              <span className="text-muted-foreground">Cooldown snapshots:</span>{' '}
              {settings?.snapshot_cooldown_seconds ?? 45}s
            </p>
            <p>
              <span className="text-muted-foreground">Healthy min:</span> {settings?.healthy_min ?? 75}
            </p>
            <p>
              <span className="text-muted-foreground">Attention min:</span> {settings?.attention_min ?? 50}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historico (30)</CardTitle>
          <CardDescription>Ultimos snapshots gerados</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando historico...
            </div>
          ) : historyError ? (
            <p className="text-sm text-red-600">Erro ao carregar historico.</p>
          ) : (
            <div className="space-y-2">
              {(history?.items ?? []).map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 gap-2 rounded-md border p-3 text-sm md:grid-cols-5"
                >
                  <div>
                    <span className="text-muted-foreground">Data:</span> {formatDate(item.snapshot_at)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Evento:</span> {item.trigger_event}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Score:</span>{' '}
                    {item.progress_score === null ? '-' : item.progress_score.toFixed(2)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confianca:</span> {item.score_confidence}%
                  </div>
                  <div>
                    <Badge variant={labelVariant(item.progress_label)}>{item.progress_label}</Badge>
                  </div>
                </div>
              ))}
              {(history?.items?.length ?? 0) === 0 && (
                <p className="text-sm text-muted-foreground">Sem snapshots para este projeto.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

