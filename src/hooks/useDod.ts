'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { DodData } from '@/types';
import { tenantFetch } from '@/lib/api-client';

export function useDod(projectId: string) {
  return useQuery({
    queryKey: ['dod', projectId],
    queryFn: async (): Promise<DodData> => {
      const res = await tenantFetch(`/api/projects/${projectId}/dod`);
      if (!res.ok) throw new Error('Erro ao buscar DoD');
      const { data } = await res.json();
      return data;
    },
    enabled: !!projectId,
  });
}

export function useUpgradeDod(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ toLevel, reason }: { toLevel: number; reason: string }) => {
      const res = await tenantFetch(`/api/projects/${projectId}/dod/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toLevel, reason }),
      });
      if (!res.ok) throw new Error('Erro ao fazer upgrade do DoD');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dod', projectId] });
    },
  });
}
