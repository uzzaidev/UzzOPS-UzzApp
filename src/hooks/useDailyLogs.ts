'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { DailyLogWithMember, NewDailyLog } from '@/types';
import { tenantFetch } from '@/lib/api-client';

export function useDailyLogs(projectId: string, sprintId?: string) {
  return useQuery({
    queryKey: ['daily-logs', projectId, sprintId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sprintId) params.set('sprintId', sprintId);
      const res = await tenantFetch(`/api/projects/${projectId}/daily-logs?${params}`);
      if (!res.ok) throw new Error('Failed to fetch daily logs');
      const { data } = await res.json();
      return (data ?? []) as DailyLogWithMember[];
    },
    enabled: !!projectId,
  });
}

export function useMyLatestDaily(projectId: string) {
  return useQuery({
    queryKey: ['my-latest-daily', projectId],
    queryFn: async () => {
      const res = await tenantFetch(`/api/daily-logs/my-latest?projectId=${projectId}`);
      if (!res.ok) return null;
      const { data } = await res.json();
      return data as DailyLogWithMember | null;
    },
    enabled: !!projectId,
  });
}

export function useCreateDailyLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (log: NewDailyLog) => {
      const res = await tenantFetch('/api/daily-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? 'Failed to save daily log');
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['daily-logs', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['my-latest-daily', variables.projectId] });
    },
  });
}
