import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Feature, NewFeature, FeatureUpdate } from '@/types';
import { tenantFetch } from '@/lib/api-client';

interface FeaturesResponse {
  data: Feature[];
  total: number;
}

interface FeatureFilters {
  version?: string;
  status?: string;
  category?: string;
  priority?: string;
  itemType?: string;
  search?: string;
  projectId?: string;
}

export function useFeatures(filters?: FeatureFilters) {
  const queryParams = new URLSearchParams();
  if (filters?.version) queryParams.set('version', filters.version);
  if (filters?.status) queryParams.set('status', filters.status);
  if (filters?.category) queryParams.set('category', filters.category);
  if (filters?.priority) queryParams.set('priority', filters.priority);
  if (filters?.itemType) queryParams.set('itemType', filters.itemType);
  if (filters?.search) queryParams.set('search', filters.search);
  if (filters?.projectId) queryParams.set('projectId', filters.projectId);

  return useQuery<FeaturesResponse>({
    queryKey: ['features', filters],
    queryFn: async () => {
      const res = await tenantFetch(`/api/features?${queryParams.toString()}`);
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
      const res = await tenantFetch(`/api/features/${id}`);
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
    mutationFn: async (feature: Omit<NewFeature, 'tenant_id'>) => {
      const res = await tenantFetch('/api/features', {
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
      const res = await tenantFetch(`/api/features/${id}`, {
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
      const res = await tenantFetch(`/api/features/${id}`, {
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

export interface FeatureAttachmentItem {
  id: string;
  tenant_id: string;
  feature_id: string;
  file_name: string;
  file_path: string;
  mime_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
  download_url?: string | null;
}

export function useFeatureAttachments(featureId: string) {
  return useQuery<{ data: FeatureAttachmentItem[] }>({
    queryKey: ['feature-attachments', featureId],
    queryFn: async () => {
      const res = await tenantFetch(`/api/features/${featureId}/attachments`);
      if (!res.ok) {
        throw new Error('Falha ao buscar anexos');
      }
      return res.json();
    },
    enabled: !!featureId,
  });
}

export function useUploadFeatureAttachment(featureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const res = await tenantFetch(`/api/features/${featureId}/attachments`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Falha ao enviar anexo');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-attachments', featureId] });
    },
  });
}

export function useDeleteFeatureAttachment(featureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attachmentId: string) => {
      const res = await tenantFetch(
        `/api/features/${featureId}/attachments?attachmentId=${attachmentId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Falha ao remover anexo');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-attachments', featureId] });
    },
  });
}
