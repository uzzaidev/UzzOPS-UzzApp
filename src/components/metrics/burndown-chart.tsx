'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { BurndownData } from '@/hooks/useMetrics';
import { useCreateBurndownSnapshot } from '@/hooks/useMetrics';

interface Props {
  data: BurndownData;
  sprintId: string;
}

export function BurndownChart({ data, sprintId }: Props) {
  const createSnapshot = useCreateBurndownSnapshot();

  // Combinar linha ideal com snapshots reais
  const combinedData = data.idealLine.map((ideal) => {
    const snapshot = data.snapshots.find((s) => s.snapshot_date === ideal.date);
    return {
      date: ideal.date,
      dateLabel: format(parseISO(ideal.date), 'dd/MM', { locale: ptBR }),
      ideal: ideal.idealPoints,
      real: snapshot ? snapshot.points_remaining : undefined,
    };
  });

  // Adicionar ponto atual se hoje não está no ideal line
  const today = new Date().toISOString().split('T')[0];
  const todayInIdeal = data.idealLine.some((p) => p.date === today);
  if (!todayInIdeal && data.current.pointsTotal > 0) {
    combinedData.push({
      date: today,
      dateLabel: 'Hoje',
      ideal: 0,
      real: data.current.pointsRemaining,
    });
  }

  const { current } = data;
  const isOnTrack =
    current.pointsRemaining <= (combinedData.find((d) => d.date === today)?.ideal ?? 0) + 2;

  const statusColor =
    isOnTrack
      ? 'bg-green-100 text-green-700'
      : current.completionPercentage > 50
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-700';

  const statusLabel =
    isOnTrack ? 'No prazo' : current.completionPercentage > 50 ? 'Atenção' : 'Atrasado';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{data.sprint.name} — Burndown</CardTitle>
            <CardDescription>Pontos restantes vs linha ideal do sprint</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColor}>{statusLabel}</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => createSnapshot.mutate(sprintId)}
              disabled={createSnapshot.isPending}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${createSnapshot.isPending ? 'animate-spin' : ''}`} />
              Snapshot
            </Button>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="mt-3 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-xl font-bold">{current.pointsTotal}</p>
            <p className="text-xs text-muted-foreground">Total pts</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-xl font-bold text-green-600">{current.pointsDone}</p>
            <p className="text-xs text-muted-foreground">Entregues</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-xl font-bold text-orange-500">{current.pointsRemaining}</p>
            <p className="text-xs text-muted-foreground">Restantes</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {current.pointsTotal === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <p className="text-sm">Nenhuma feature com story points neste sprint.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={combinedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                formatter={(value, name) => [
                  `${value ?? 0} pts`,
                  name === 'ideal' ? 'Linha Ideal' : 'Real',
                ]}
              />
              <Legend formatter={(value) => (value === 'ideal' ? 'Linha Ideal' : 'Real')} />
              <ReferenceLine y={0} stroke="#ccc" />
              <Line
                type="monotone"
                dataKey="ideal"
                stroke="#94a3b8"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
                name="ideal"
              />
              <Line
                type="monotone"
                dataKey="real"
                stroke="#2D6A5E"
                strokeWidth={2.5}
                dot={{ fill: '#2D6A5E', r: 4 }}
                connectNulls={false}
                name="real"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
