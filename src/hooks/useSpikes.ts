'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SpikeSummary, Feature } from '@/types';
import { tenantFetch } from '@/lib/api-client';

export function useSpikes(sprintId: string) {
  return useQuery({
    queryKey: ['spikes', sprintId],
    queryFn: async () => {
      const res = await tenantFetch(`/api/sprints/${sprintId}/spikes`);
      if (!res.ok) throw new Error('Failed to fetch spikes');
      const { data } = await res.json();
      return data as { summary: SpikeSummary | null; spikes: Feature[] };
    },
    enabled: !!sprintId,
  });
}

export function useUpdateSpike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      featureId,
      updates,
    }: {
      featureId: string;
      updates: {
        is_spike?: boolean;
        spike_timebox_hours?: number | null;
        spike_outcome?: string | null;
      };
    }) => {
      const res = await tenantFetch(`/api/features/${featureId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? 'Failed to update spike');
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spikes'] });
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
}
