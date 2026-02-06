import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Feature, NewFeature, FeatureUpdate } from '@/types';

interface FeaturesResponse {
  data: Feature[];
  total: number;
}

interface FeatureFilters {
  version?: string;
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
  projectId?: string;
}

export function useFeatures(filters?: FeatureFilters) {
  const queryParams = new URLSearchParams();
  if (filters?.version) queryParams.set('version', filters.version);
  if (filters?.status) queryParams.set('status', filters.status);
  if (filters?.category) queryParams.set('category', filters.category);
  if (filters?.priority) queryParams.set('priority', filters.priority);
  if (filters?.search) queryParams.set('search', filters.search);
  if (filters?.projectId) queryParams.set('projectId', filters.projectId);

  return useQuery<FeaturesResponse>({
    queryKey: ['features', filters],
    queryFn: async () => {
      const res = await fetch(`/api/features?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error('Falha ao buscar features');
      }
      return res.json();
    },
  });
}

export function useFeature(id: string) {
  return useQuery<{ data: Feature }>({
    queryKey: ['feature', id],
    queryFn: async () => {
      const res = await fetch(`/api/features/${id}`);
      if (!res.ok) {
        throw new Error('Falha ao buscar feature');
      }
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feature: NewFeature) => {
      const res = await fetch('/api/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feature),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Falha ao criar feature');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
      queryClient.invalidateQueries({ queryKey: ['project-overview'] });
    },
  });
}

export function useUpdateFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FeatureUpdate }) => {
      const res = await fetch(`/api/features/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Falha ao atualizar feature');
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
      queryClient.invalidateQueries({ queryKey: ['feature', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['project-overview'] });
    },
  });
}

export function useDeleteFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/features/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Falha ao deletar feature');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
      queryClient.invalidateQueries({ queryKey: ['project-overview'] });
    },
  });
}
