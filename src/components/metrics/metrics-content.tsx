'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, BarChart3, TrendingDown, Target, Heart } from 'lucide-react';
import { useVelocity, useBurndown, useHealthMetrics } from '@/hooks/useMetrics';
import { useSprints } from '@/hooks/useSprints';
import { VelocityChart } from './velocity-chart';
import { BurndownChart } from './burndown-chart';
import { ForecastCard } from './forecast-card';
import { HealthDashboard } from './health-dashboard';

interface Props {
  projectId: string;
}

function LoadingState() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-uzzai-primary" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <p className="text-red-600">{message}</p>
      </CardContent>
    </Card>
  );
}

export function MetricsContent({ projectId }: Props) {
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');

  const { data: velocityData, isLoading: velocityLoading, error: velocityError } = useVelocity(projectId);
  const { data: sprintsResponse, isLoading: sprintsLoading } = useSprints(projectId);
  const { data: healthData, isLoading: healthLoading } = useHealthMetrics(projectId);

  // Selecionar sprint ativo por padrão
  const sprints = sprintsResponse?.data ?? [];
  const activeSprint = sprints.find((s) => s.status === 'active');
  const effectiveSprintId = selectedSprintId || activeSprint?.id || sprints[0]?.id;

  const { data: burndownData, isLoading: burndownLoading } = useBurndown(effectiveSprintId);

  return (
    <Tabs defaultValue="velocity">
      <div className="flex items-center justify-between">
        <TabsList className="grid w-auto grid-cols-4">
          <TabsTrigger value="velocity" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Velocity
          </TabsTrigger>
          <TabsTrigger value="burndown" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Burndown
          </TabsTrigger>
          <TabsTrigger value="forecast" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Forecast
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Health
          </TabsTrigger>
        </TabsList>
      </div>

      {/* US-3.1: VELOCITY */}
      <TabsContent value="velocity" className="mt-6">
        {velocityLoading ? (
          <LoadingState />
        ) : velocityError ? (
          <ErrorState message="Erro ao carregar dados de velocity. Verifique se a migration 008 foi aplicada." />
        ) : velocityData ? (
          <VelocityChart
            sprints={velocityData.sprints}
            averageVelocity={velocityData.averageVelocity}
            totalSprintsCompleted={velocityData.totalSprintsCompleted}
          />
        ) : (
          <ErrorState message="Nenhum dado de velocity disponível." />
        )}
      </TabsContent>

      {/* US-3.2: BURNDOWN */}
      <TabsContent value="burndown" className="mt-6 space-y-4">
        {/* Seletor de sprint */}
        {!sprintsLoading && sprints.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sprint:</span>
            <Select
              value={effectiveSprintId}
              onValueChange={setSelectedSprintId}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecionar sprint..." />
              </SelectTrigger>
              <SelectContent>
                {sprints.map((sprint) => (
                  <SelectItem key={sprint.id} value={sprint.id}>
                    {sprint.name}
                    {sprint.status === 'active' && ' (ativo)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {burndownLoading ? (
          <LoadingState />
        ) : !effectiveSprintId ? (
          <ErrorState message="Nenhum sprint encontrado. Crie um sprint primeiro." />
        ) : burndownData ? (
          <BurndownChart data={burndownData} sprintId={effectiveSprintId} />
        ) : (
          <ErrorState message="Erro ao carregar dados de burndown." />
        )}
      </TabsContent>

      {/* US-3.3: FORECAST */}
      <TabsContent value="forecast" className="mt-6">
        {velocityLoading ? (
          <LoadingState />
        ) : velocityData && velocityData.totalSprintsCompleted === 0 ? (
          <Card>
            <CardContent className="flex h-48 items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Target className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <p className="text-sm">Forecast disponível após o primeiro sprint concluído.</p>
              </div>
            </CardContent>
          </Card>
        ) : velocityData ? (
          <ForecastCard
            forecast={velocityData.forecast}
            sprints={velocityData.sprints}
            averageCompletionRate={velocityData.averageCompletionRate}
          />
        ) : (
          <ErrorState message="Erro ao carregar dados de forecast." />
        )}
      </TabsContent>

      {/* US-3.4: HEALTH */}
      <TabsContent value="health" className="mt-6">
        {healthLoading ? (
          <LoadingState />
        ) : healthData ? (
          <HealthDashboard health={healthData} />
        ) : (
          <ErrorState message="Erro ao carregar métricas de saúde." />
        )}
      </TabsContent>
    </Tabs>
  );
}
