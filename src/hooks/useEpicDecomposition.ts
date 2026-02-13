'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { DecompositionSuggestion, NewChildStory } from '@/types';
import { tenantFetch } from '@/lib/api-client';

export function useSuggestDecomposition(epicId: string | null) {
  return useQuery({
    queryKey: ['decompose-suggestions', epicId],
    queryFn: async (): Promise<DecompositionSuggestion[]> => {
      const res = await tenantFetch(`/api/features/${epicId}/suggest-decomposition`);
      if (!res.ok) throw new Error('Erro ao buscar sugestões');
      const { data } = await res.json();
      return data ?? [];
    },
    enabled: !!epicId,
  });
}

export function useDecomposeEpic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      epicId,
      stories,
      strategy,
    }: {
      epicId: string;
      stories: NewChildStory[];
      strategy: string;
    }) => {
      const res = await tenantFetch(`/api/features/${epicId}/decompose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stories, strategy }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? 'Erro ao decompor épico');
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
      queryClient.invalidateQueries({ queryKey: ['backlog-map'] });
    },
  });
}
