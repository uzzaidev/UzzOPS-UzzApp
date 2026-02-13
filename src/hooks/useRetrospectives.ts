import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { RetrospectiveAction, NewRetrospectiveAction } from '@/types';
import { tenantFetch } from '@/lib/api-client';

export function useRetrospectiveActions(sprintId?: string, projectId?: string) {
  return useQuery({
    queryKey: ['retro-actions', sprintId, projectId],
    queryFn: async (): Promise<RetrospectiveAction[]> => {
      const params = new URLSearchParams();
      if (sprintId) params.set('sprintId', sprintId);
      if (projectId) params.set('projectId', projectId);
      const res = await tenantFetch(`/api/retrospectives?${params}`);
      if (!res.ok) throw new Error('Erro ao buscar ações da retrospectiva');
      const { data } = await res.json();
      return data;
    },
    enabled: !!(sprintId || projectId),
    staleTime: 30 * 1000,
  });
}

export function useCreateRetrospectiveAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (action: Omit<NewRetrospectiveAction, 'tenant_id'>): Promise<RetrospectiveAction> => {
      const res = await tenantFetch('/api/retrospectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['retro-actions', data.sprint_id] });
      queryClient.invalidateQueries({ queryKey: ['retro-actions', undefined, data.project_id] });
    },
  });
}

export function useUpdateRetrospectiveAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RetrospectiveAction> }): Promise<RetrospectiveAction> => {
      const res = await tenantFetch(`/api/retrospectives/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }
      const result = await res.json();
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['retro-actions', data.sprint_id] });
    },
  });
}

export function useDeleteRetrospectiveAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, sprintId }: { id: string; sprintId: string }) => {
      const res = await tenantFetch(`/api/retrospectives/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao deletar ação');
      return { id, sprintId };
    },
    onSuccess: ({ sprintId }) => {
      queryClient.invalidateQueries({ queryKey: ['retro-actions', sprintId] });
    },
  });
}
