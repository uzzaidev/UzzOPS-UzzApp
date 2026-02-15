import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tenantFetch } from '@/lib/api-client';

export function useCronogramasOverview(projectId: string) {
  return useQuery({
    queryKey: ['cronogramas-overview', projectId],
    queryFn: async () => {
      const res = await tenantFetch(`/api/projects/${projectId}/cronogramas/overview`);
      if (!res.ok) throw new Error('Falha ao buscar overview de cronogramas');
      return res.json();
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function useCronogramasCharters(projectId: string) {
  return useQuery({
    queryKey: ['cronogramas-charters', projectId],
    queryFn: async () => {
      const res = await tenantFetch(`/api/projects/${projectId}/cronogramas/charters`);
      if (!res.ok) throw new Error('Falha ao buscar charters');
      return res.json();
    },
    enabled: !!projectId,
  });
}

export function useCronogramasRoadmaps(projectId: string) {
  return useQuery({
    queryKey: ['cronogramas-roadmaps', projectId],
    queryFn: async () => {
      const res = await tenantFetch(`/api/projects/${projectId}/cronogramas/roadmaps`);
      if (!res.ok) throw new Error('Falha ao buscar roadmaps');
      return res.json();
    },
    enabled: !!projectId,
  });
}

export function useCronogramasRoadmapItems(projectId: string, roadmapId?: string) {
  return useQuery({
    queryKey: ['cronogramas-roadmap-items', projectId, roadmapId ?? 'all'],
    queryFn: async () => {
      const query = roadmapId ? `?roadmap_id=${roadmapId}` : '';
      const res = await tenantFetch(`/api/projects/${projectId}/cronogramas/roadmap-items${query}`);
      if (!res.ok) throw new Error('Falha ao buscar roadmap items');
      return res.json();
    },
    enabled: !!projectId,
  });
}

export function useCronogramasHypotheses(projectId: string, status?: string) {
  return useQuery({
    queryKey: ['cronogramas-hypotheses', projectId, status ?? 'all'],
    queryFn: async () => {
      const query = status ? `?status=${status}` : '';
      const res = await tenantFetch(`/api/projects/${projectId}/cronogramas/hypotheses${query}`);
      if (!res.ok) throw new Error('Falha ao buscar hipóteses');
      return res.json();
    },
    enabled: !!projectId,
  });
}

export function useCronogramasDecisionLog(projectId: string) {
  return useQuery({
    queryKey: ['cronogramas-decisions', projectId],
    queryFn: async () => {
      const res = await tenantFetch(`/api/projects/${projectId}/cronogramas/decision-log`);
      if (!res.ok) throw new Error('Falha ao buscar decision log');
      return res.json();
    },
    enabled: !!projectId,
  });
}

export function useCronogramasForecasts(projectId: string) {
  return useQuery({
    queryKey: ['cronogramas-forecasts', projectId],
    queryFn: async () => {
      const res = await tenantFetch(`/api/projects/${projectId}/cronogramas/forecasts`);
      if (!res.ok) throw new Error('Falha ao buscar forecasts');
      return res.json();
    },
    enabled: !!projectId,
  });
}

export function useCronogramasPilots(projectId: string) {
  return useQuery({
    queryKey: ['cronogramas-pilots', projectId],
    queryFn: async () => {
      const res = await tenantFetch(`/api/projects/${projectId}/cronogramas/pilots`);
      if (!res.ok) throw new Error('Falha ao buscar pilotos');
      return res.json();
    },
    enabled: !!projectId,
  });
}

export function useCronogramasChangelog(projectId: string) {
  return useQuery({
    queryKey: ['cronogramas-changelog', projectId],
    queryFn: async () => {
      const res = await tenantFetch(`/api/projects/${projectId}/cronogramas/changelog`);
      if (!res.ok) throw new Error('Falha ao buscar changelog');
      return res.json();
    },
    enabled: !!projectId,
  });
}

export function useCreateCronogramaDecision(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await tenantFetch(`/api/projects/${projectId}/cronogramas/decision-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Falha ao criar decisão');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cronogramas-overview', projectId] });
      queryClient.invalidateQueries({ queryKey: ['cronogramas-decisions', projectId] });
    },
  });
}

type CronogramaManualSection =
  | 'charters'
  | 'roadmaps'
  | 'roadmap-items'
  | 'hypotheses'
  | 'decision-log'
  | 'forecasts'
  | 'pilots'
  | 'changelog';

function invalidateCronogramaQueries(queryClient: ReturnType<typeof useQueryClient>, projectId: string) {
  queryClient.invalidateQueries({ queryKey: ['cronogramas-overview', projectId] });
  queryClient.invalidateQueries({ queryKey: ['cronogramas-charters', projectId] });
  queryClient.invalidateQueries({ queryKey: ['cronogramas-roadmaps', projectId] });
  queryClient.invalidateQueries({ queryKey: ['cronogramas-roadmap-items', projectId] });
  queryClient.invalidateQueries({ queryKey: ['cronogramas-hypotheses', projectId] });
  queryClient.invalidateQueries({ queryKey: ['cronogramas-decisions', projectId] });
  queryClient.invalidateQueries({ queryKey: ['cronogramas-forecasts', projectId] });
  queryClient.invalidateQueries({ queryKey: ['cronogramas-pilots', projectId] });
  queryClient.invalidateQueries({ queryKey: ['cronogramas-changelog', projectId] });
}

export function useCronogramaManualMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      section,
      method,
      payload,
    }: {
      section: CronogramaManualSection;
      method: 'POST' | 'PATCH';
      payload: Record<string, unknown>;
    }) => {
      const res = await tenantFetch(`/api/projects/${projectId}/cronogramas/${section}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Falha na operação manual');
      }
      return res.json();
    },
    onSuccess: () => {
      invalidateCronogramaQueries(queryClient, projectId);
    },
  });
}
