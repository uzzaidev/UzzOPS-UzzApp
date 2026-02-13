'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SprintVelocity } from '@/hooks/useMetrics';

interface Props {
  sprints: SprintVelocity[];
  averageVelocity: number;
  totalSprintsCompleted: number;
}

export function VelocityChart({ sprints, averageVelocity, totalSprintsCompleted }: Props) {
  const chartData = sprints.map((s) => ({
    name: s.sprint_name?.replace('Sprint ', 'S') ?? 'S?',
    velocity: s.velocity ?? 0,
    committed: s.committed_points ?? 0,
    completion: s.completion_rate ?? 0,
    status: s.status,
  }));

  // Calcular tendência (comparar últimas 2 sprints concluídas)
  const completed = sprints.filter((s) => s.status === 'completed');
  let trend: 'up' | 'down' | 'stable' = 'stable';
  let trendValue = 0;
  if (completed.length >= 2) {
    const last = completed[completed.length - 1].velocity ?? 0;
    const prev = completed[completed.length - 2].velocity ?? 0;
    trendValue = last - prev;
    trend = trendValue > 0 ? 'up' : trendValue < 0 ? 'down' : 'stable';
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Velocity por Sprint</CardTitle>
            <CardDescription>Pontos entregues vs comprometidos por sprint</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-uzzai-primary">{averageVelocity}</p>
              <p className="text-xs text-muted-foreground">média pts/sprint</p>
            </div>
            {completed.length >= 2 && (
              <div className={`flex items-center gap-1 ${trendColor}`}>
                <TrendIcon className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {trendValue > 0 ? '+' : ''}
                  {trendValue}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Badge variant="outline">{totalSprintsCompleted} sprints completos</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <p className="text-sm">Nenhum dado de velocity disponível ainda.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                formatter={(value, name) => [
                  `${value ?? 0} pts`,
                  name === 'velocity' ? 'Entregue' : 'Comprometido',
                ]}
              />
              <Legend
                formatter={(value) => (value === 'velocity' ? 'Entregue' : 'Comprometido')}
              />
              <Bar dataKey="committed" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="committed" />
              <Bar dataKey="velocity" fill="#2D6A5E" radius={[4, 4, 0, 0]} name="velocity" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
