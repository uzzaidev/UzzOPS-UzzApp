import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantFetch } from '@/lib/api-client';

// =====================================================
// TIPOS
// =====================================================

export interface SprintVelocity {
  sprint_id: string;
  project_id: string;
  sprint_name: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  duration_weeks: number | null;
  total_features: number;
  features_done: number;
  features_in_progress: number;
  features_todo: number;
  committed_points: number;
  velocity: number;
  completion_rate: number;
  avg_dod_compliance: number | null;
}

export interface VelocityForecast {
  pessimistic: number;
  realistic: number;
  optimistic: number;
}

export interface VelocityMetrics {
  sprints: SprintVelocity[];
  averageVelocity: number;
  averageCompletionRate: number;
  totalSprintsCompleted: number;
  forecast: VelocityForecast;
}

export interface BurndownSnapshot {
  id: string;
  sprint_id: string;
  snapshot_date: string;
  points_total: number;
  points_done: number;
  points_remaining: number;
  features_total: number;
  features_done: number;
  features_remaining: number;
  completion_percentage: number;
}

export interface IdealLinePoint {
  date: string;
  idealPoints: number;
}

export interface BurndownData {
  sprint: {
    id: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
    status: string;
  };
  snapshots: BurndownSnapshot[];
  idealLine: IdealLinePoint[];
  current: {
    pointsTotal: number;
    pointsDone: number;
    pointsRemaining: number;
    completionPercentage: number;
  };
}

export interface HealthStatus {
  overall_health_score: number;
  overall_status: 'healthy' | 'warning' | 'critical' | 'unknown';
  sprint_consistency_status: string;
  carry_over_status: string;
  dod_compliance_status: string;
  velocity_stability_status: string;
  carry_over_percentage: number;
  avg_dod_compliance: number;
  velocity_cv: number;
  duration_variations: number;
  recentSprints: {
    id: string;
    name: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
  }[];
  velocityTrend: {
    sprint_id: string;
    sprint_name: string;
    velocity: number;
    completion_rate: number;
    status: string;
  }[];
  fallback: boolean;
}

// =====================================================
// US-3.1: VELOCITY TRACKING
// =====================================================

export function useVelocity(projectId: string | null | undefined) {
  return useQuery({
    queryKey: ['velocity', projectId],
    queryFn: async (): Promise<VelocityMetrics> => {
      const res = await tenantFetch(`/api/metrics/velocity?projectId=${projectId}`);
      if (!res.ok) throw new Error('Erro ao buscar dados de velocity');
      const { data } = await res.json();
      return data;
    },
    enabled: !!projectId,
    staleTime: 60 * 1000,
  });
}

// =====================================================
// US-3.2: BURNDOWN CHART
// =====================================================

export function useBurndown(sprintId: string | null | undefined) {
  return useQuery({
    queryKey: ['burndown', sprintId],
    queryFn: async (): Promise<BurndownData> => {
      const res = await tenantFetch(`/api/sprints/${sprintId}/burndown`);
      if (!res.ok) throw new Error('Erro ao buscar dados de burndown');
      const { data } = await res.json();
      return data;
    },
    enabled: !!sprintId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateBurndownSnapshot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sprintId: string) => {
      const res = await tenantFetch(`/api/sprints/${sprintId}/burndown`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Erro ao criar snapshot de burndown');
      const { data } = await res.json();
      return data;
    },
    onSuccess: (_, sprintId) => {
      queryClient.invalidateQueries({ queryKey: ['burndown', sprintId] });
    },
  });
}

// =====================================================
// US-3.4: SCRUM HEALTH DASHBOARD
// =====================================================

export function useHealthMetrics(projectId: string | null | undefined) {
  return useQuery({
    queryKey: ['health-metrics', projectId],
    queryFn: async (): Promise<HealthStatus> => {
      const res = await tenantFetch(`/api/projects/${projectId}/health`);
      if (!res.ok) throw new Error('Erro ao buscar métricas de saúde');
      const { data } = await res.json();
      return data;
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  });
}
