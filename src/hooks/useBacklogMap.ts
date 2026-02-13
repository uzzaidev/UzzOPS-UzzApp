'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { BacklogMapData, FeatureCluster } from '@/types';
import { tenantFetch } from '@/lib/api-client';

export function useBacklogMap(projectId: string) {
  return useQuery({
    queryKey: ['backlog-map', projectId],
    queryFn: async (): Promise<BacklogMapData> => {
      const res = await tenantFetch(`/api/projects/${projectId}/backlog-map`);
      if (!res.ok) throw new Error('Erro ao buscar mapa de backlog');
      const { data } = await res.json();
      return data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 30,
  });
}

export function useCreateCluster(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cluster: Partial<FeatureCluster>) => {
      const res = await tenantFetch(`/api/projects/${projectId}/clusters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cluster),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? 'Erro ao criar cluster');
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog-map', projectId] });
    },
  });
}

export function useUpdateCluster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clusterId, updates }: { clusterId: string; updates: Partial<FeatureCluster> }) => {
      const res = await tenantFetch(`/api/clusters/${clusterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Erro ao atualizar cluster');
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog-map'] });
    },
  });
}

export function useDeleteCluster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clusterId: string) => {
      const res = await tenantFetch(`/api/clusters/${clusterId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao deletar cluster');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog-map'] });
    },
  });
}

export function useMoveFeatureToCluster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      featureId,
      clusterId,
      position,
    }: {
      featureId: string;
      clusterId: string | null;
      position?: { x: number; y: number };
    }) => {
      const res = await tenantFetch(`/api/features/${featureId}/move-to-cluster`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clusterId, position }),
      });
      if (!res.ok) throw new Error('Erro ao mover feature');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog-map'] });
    },
  });
}

export function useCreateDependency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      featureId,
      dependsOnId,
      dependencyType,
      projectId,
    }: {
      featureId: string;
      dependsOnId: string;
      dependencyType: 'blocks' | 'relates_to' | 'duplicates';
      projectId: string;
    }) => {
      const res = await tenantFetch(`/api/features/${featureId}/dependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dependsOnId, dependencyType, projectId }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? 'Erro ao criar dependência');
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog-map'] });
    },
  });
}

export function useDeleteDependency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ featureId, dependsOnId }: { featureId: string; dependsOnId: string }) => {
      const res = await tenantFetch(
        `/api/features/${featureId}/dependencies?dependsOnId=${dependsOnId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Erro ao remover dependência');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog-map'] });
    },
  });
}
