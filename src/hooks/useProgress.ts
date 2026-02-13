'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tenantFetch } from '@/lib/api-client';

export interface ProgressSnapshot {
  id: string;
  tenant_id: string;
  project_id: string;
  snapshot_at: string;
  trigger_event: string;
  progress_score: number | null;
  progress_label: 'healthy' | 'attention' | 'critical' | 'insufficient_data';
  score_confidence: number;
  insufficient_data_flags: Record<string, boolean>;
}

export interface ProgressSettings {
  id: string;
  tenant_id: string;
  project_id: string;
  formula_version: string;
  risk_critical_threshold: number;
  snapshot_cooldown_seconds: number;
  healthy_min: number;
  attention_min: number;
}

interface ProgressDetailsResponse {
  projectId: string;
  tenantId: string;
  latestSnapshot: ProgressSnapshot | null;
  settings: ProgressSettings | null;
}

interface ProgressHistoryResponse {
  projectId: string;
  tenantId: string;
  items: ProgressSnapshot[];
  count: number;
  limit: number;
}

export function useProgressDetails(projectId: string | null | undefined) {
  return useQuery({
    queryKey: ['progress-details', projectId],
    queryFn: async (): Promise<ProgressDetailsResponse> => {
      const res = await tenantFetch(`/api/projects/${projectId}/progress/details`);
      if (!res.ok) throw new Error('Erro ao carregar detalhes de progresso');
      const { data } = await res.json();
      return data;
    },
    enabled: !!projectId,
    staleTime: 60 * 1000,
  });
}

export function useProgressHistory(projectId: string | null | undefined, limit = 30) {
  return useQuery({
    queryKey: ['progress-history', projectId, limit],
    queryFn: async (): Promise<ProgressHistoryResponse> => {
      const res = await tenantFetch(`/api/projects/${projectId}/progress/history?limit=${limit}`);
      if (!res.ok) throw new Error('Erro ao carregar historico de progresso');
      const { data } = await res.json();
      return data;
    },
    enabled: !!projectId,
    staleTime: 60 * 1000,
  });
}

export function useRecalculateProgress(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await tenantFetch(`/api/projects/${projectId}/progress/recalculate`, {
        method: 'POST',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Erro ao recalcular progresso');
      }
      const { data } = await res.json();
      return data as { latestSnapshot: ProgressSnapshot | null };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-details', projectId] });
      queryClient.invalidateQueries({ queryKey: ['progress-history', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-overview', projectId] });
    },
  });
}

