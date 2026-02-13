import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Risk, NewRisk, RiskUpdate } from '@/types';
import { tenantFetch } from '@/lib/api-client';

interface RisksResponse {
  data: Risk[];
  total: number;
}

interface RiskFilters {
  status?: string;
  severity?: string;
  project_id?: string;
  search?: string;
}

export function useRisks(filters?: RiskFilters) {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.set('status', filters.status);
  if (filters?.severity) queryParams.set('severity', filters.severity);
  if (filters?.project_id) queryParams.set('project_id', filters.project_id);
  if (filters?.search) queryParams.set('search', filters.search);

  return useQuery<RisksResponse>({
    queryKey: ['risks', filters],
    queryFn: async () => {
      const res = await tenantFetch(`/api/risks?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error('Falha ao buscar riscos');
      }
      return res.json();
    },
  });
}

export function useRisk(id: string) {
  return useQuery<{ data: Risk }>({
    queryKey: ['risk', id],
    queryFn: async () => {
      const res = await tenantFetch(`/api/risks/${id}`);
      if (!res.ok) {
        throw new Error('Falha ao buscar risco');
      }
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (risk: Omit<NewRisk, 'tenant_id'>) => {
      const res = await tenantFetch('/api/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(risk),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Falha ao criar risco');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      queryClient.invalidateQueries({ queryKey: ['project-overview'] });
    },
  });
}

export function useUpdateRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RiskUpdate }) => {
      const res = await tenantFetch(`/api/risks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Falha ao atualizar risco');
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      queryClient.invalidateQueries({ queryKey: ['risk', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['project-overview'] });
    },
  });
}

export function useDeleteRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await tenantFetch(`/api/risks/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Falha ao deletar risco');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      queryClient.invalidateQueries({ queryKey: ['project-overview'] });
    },
  });
}
