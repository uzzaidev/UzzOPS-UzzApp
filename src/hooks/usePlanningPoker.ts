import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantFetch } from '@/lib/api-client';
import type {
  PlanningPokerSession,
  PlanningPokerVote,
  PlanningPokerResult,
  PokerCardValue,
  PokerSessionType,
  PokerConsensus,
} from '@/types';
import type { Feature } from '@/types';

export interface PokerSessionDetail {
  session: PlanningPokerSession;
  features: Pick<Feature, 'id' | 'code' | 'name' | 'description' | 'story_points' | 'business_value' | 'work_effort'>[];
  votes: PlanningPokerVote[];
  results: PlanningPokerResult[];
}

// Lista de sessões do projeto
export function usePokerSessions(projectId: string | null | undefined) {
  return useQuery({
    queryKey: ['poker-sessions', projectId],
    queryFn: async (): Promise<PlanningPokerSession[]> => {
      const res = await tenantFetch(`/api/planning-poker/sessions?projectId=${projectId}`);
      if (!res.ok) throw new Error('Erro ao buscar sessões');
      const { data } = await res.json();
      return data;
    },
    enabled: !!projectId,
    staleTime: 30 * 1000,
  });
}

// Detalhes de uma sessão (polling para simular real-time)
export function usePokerSession(sessionId: string | null | undefined) {
  return useQuery({
    queryKey: ['poker-session', sessionId],
    queryFn: async (): Promise<PokerSessionDetail> => {
      const res = await tenantFetch(`/api/planning-poker/sessions/${sessionId}`);
      if (!res.ok) throw new Error('Erro ao buscar sessão');
      const { data } = await res.json();
      return data;
    },
    enabled: !!sessionId,
    refetchInterval: 3000, // Polling a cada 3s para simular real-time
    staleTime: 0,
  });
}

// Criar sessão
export function useCreatePokerSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      project_id: string;
      name: string;
      type: PokerSessionType;
      feature_ids: string[];
    }): Promise<PlanningPokerSession> => {
      const res = await tenantFetch('/api/planning-poker/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['poker-sessions', data.project_id] });
    },
  });
}

// Votar
export function usePokerVote(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      feature_id: string;
      vote_value: PokerCardValue;
      voter_name: string;
    }) => {
      const res = await tenantFetch(`/api/planning-poker/sessions/${sessionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poker-session', sessionId] });
    },
  });
}

// Revelar votos / avançar feature / concluir sessão
export function useUpdatePokerSession(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: {
      revealed?: boolean;
      current_feature_index?: number;
      status?: 'active' | 'completed' | 'cancelled';
      completed_at?: string;
    }) => {
      const res = await tenantFetch(`/api/planning-poker/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poker-session', sessionId] });
    },
  });
}

// Finalizar feature com valor final
export function useFinalizePokerVote(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      feature_id: string;
      final_value: number;
      consensus_level?: PokerConsensus;
      discussion_notes?: string;
    }) => {
      const res = await tenantFetch(`/api/planning-poker/sessions/${sessionId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poker-session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
}
