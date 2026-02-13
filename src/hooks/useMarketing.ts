'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tenantFetch } from '@/lib/api-client';

export type MarketingContentType = 'reels' | 'feed' | 'carrossel' | 'stories' | 'artigo' | 'video';
export type MarketingPublicationStatus = 'idea' | 'draft' | 'scheduled' | 'published' | 'cancelled';
export type MarketingChannel = 'instagram' | 'linkedin' | 'site' | 'tiktok' | 'youtube' | 'whatsapp';
export type MarketingContentStatus = 'idea' | 'briefing' | 'production' | 'review' | 'approved' | 'done' | 'archived';
export type MarketingAssetType = 'image' | 'video' | 'carousel_slide' | 'caption' | 'copy' | 'audio' | 'reference' | 'document';

export interface TenantProject {
  id: string;
  code: string;
  name: string;
  status: string;
}

export interface MarketingPublication {
  id: string;
  channel: MarketingChannel;
  scheduled_date: string;
  scheduled_time: string | null;
  status: MarketingPublicationStatus;
  external_url?: string | null;
  notes?: string | null;
  content_piece: {
    id: string;
    code: string;
    title: string;
    content_type: MarketingContentType;
    project_id: string | null;
    status: string;
  } | null;
}

export interface MarketingContentPiece {
  id: string;
  code: string;
  title: string;
  topic: string | null;
  content_type: MarketingContentType;
  objective: string | null;
  brief: string | null;
  caption_base: string | null;
  hashtags: string[];
  cta: string | null;
  status: MarketingContentStatus;
  project_id: string | null;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  project?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface MarketingCampaign {
  id: string;
  tenant_id: string;
  project_id: string | null;
  name: string;
  description: string | null;
  objective: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'active' | 'draft' | 'completed' | 'archived';
  color: string;
  created_at: string;
  updated_at: string;
  project?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface MarketingChannelConfig {
  id: string;
  tenant_id: string;
  name: string;
  platform: 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'site' | 'whatsapp' | 'other';
  color: string;
  icon_key: string | null;
  profile_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketingAsset {
  id: string;
  tenant_id: string;
  content_piece_id: string | null;
  asset_type: MarketingAssetType;
  file_name: string;
  storage_path: string | null;
  download_url?: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  sort_order: number;
  caption_channel: MarketingChannel | null;
  caption_text: string | null;
  tags: string[];
  is_approved: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  content_piece?: {
    id: string;
    code: string;
    title: string;
    project_id: string | null;
    content_type: MarketingContentType;
  } | null;
}

export interface MarketingStats {
  month: string;
  total: number;
  scheduled: number;
  published: number;
  cancelled: number;
  by_channel: Record<string, number>;
  by_type: Record<string, number>;
}

export interface MarketingDashboard {
  month: string;
  previous_month: string;
  posts_current: number;
  posts_previous: number;
  posts_delta_pct: number | null;
  publication_on_time_rate: number | null;
  by_channel: Record<string, number>;
  by_type: Record<string, number>;
  assets_by_type: Record<string, number>;
}

export interface MarketingFilters {
  from?: string;
  to?: string;
  month?: string;
  channel?: string;
  status?: string;
  content_type?: string;
  project_id?: string;
  content_piece_id?: string;
  search?: string;
}

export interface MarketingContentFilters {
  status?: string;
  content_type?: string;
  project_id?: string;
  search?: string;
}

export interface MarketingAssetFilters {
  content_piece_id?: string;
  project_id?: string;
  asset_type?: string;
  approved?: boolean;
  search?: string;
  tags?: string[];
}

function queryString<T extends object>(filters: T) {
  const params = new URLSearchParams();
  Object.entries(filters as Record<string, unknown>).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  });
  return params.toString();
}

export function useTenantProjects() {
  return useQuery({
    queryKey: ['tenant-projects'],
    queryFn: async (): Promise<TenantProject[]> => {
      const res = await tenantFetch('/api/projects');
      if (!res.ok) throw new Error('Erro ao buscar projetos');
      const { data } = await res.json();
      return data ?? [];
    },
    staleTime: 60 * 1000,
  });
}

export function useMarketingPublications(filters: MarketingFilters) {
  return useQuery({
    queryKey: ['marketing-publications', filters],
    queryFn: async (): Promise<MarketingPublication[]> => {
      const qs = queryString(filters);
      const res = await tenantFetch(`/api/marketing/publications${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error('Erro ao buscar publicacoes');
      const { data } = await res.json();
      return data ?? [];
    },
    staleTime: 30 * 1000,
  });
}

export function useMarketingStats(month: string, projectId?: string) {
  return useQuery({
    queryKey: ['marketing-stats', month, projectId],
    queryFn: async (): Promise<MarketingStats> => {
      const qs = new URLSearchParams({ month });
      if (projectId) qs.set('project_id', projectId);
      const res = await tenantFetch(`/api/marketing/publications/stats?${qs.toString()}`);
      if (!res.ok) throw new Error('Erro ao buscar estatisticas');
      const { data } = await res.json();
      return data;
    },
    staleTime: 30 * 1000,
  });
}

export function useMarketingDashboard(month: string, projectId?: string) {
  return useQuery({
    queryKey: ['marketing-dashboard', month, projectId],
    queryFn: async (): Promise<MarketingDashboard> => {
      const qs = new URLSearchParams({ month });
      if (projectId) qs.set('project_id', projectId);
      const res = await tenantFetch(`/api/marketing/dashboard?${qs.toString()}`);
      if (!res.ok) throw new Error('Erro ao buscar dashboard de marketing');
      const { data } = await res.json();
      return data;
    },
    staleTime: 30 * 1000,
  });
}

export function useMarketingContent(filters: MarketingContentFilters) {
  return useQuery({
    queryKey: ['marketing-content', filters],
    queryFn: async (): Promise<MarketingContentPiece[]> => {
      const qs = queryString(filters);
      const res = await tenantFetch(`/api/marketing/content${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error('Erro ao buscar conteudos');
      const { data } = await res.json();
      return data ?? [];
    },
    staleTime: 30 * 1000,
  });
}

export function useMarketingContentById(id: string | null) {
  return useQuery({
    queryKey: ['marketing-content-by-id', id],
    queryFn: async (): Promise<MarketingContentPiece> => {
      const res = await tenantFetch(`/api/marketing/content/${id}`);
      if (!res.ok) throw new Error('Erro ao buscar conteudo');
      const { data } = await res.json();
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useMarketingCampaigns(filters: { project_id?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['marketing-campaigns', filters],
    queryFn: async (): Promise<MarketingCampaign[]> => {
      const qs = queryString(filters);
      const res = await tenantFetch(`/api/marketing/campaigns${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error('Erro ao buscar campanhas');
      const { data } = await res.json();
      return data ?? [];
    },
    staleTime: 30 * 1000,
  });
}

export function useMarketingChannels() {
  return useQuery({
    queryKey: ['marketing-channels'],
    queryFn: async (): Promise<MarketingChannelConfig[]> => {
      const res = await tenantFetch('/api/marketing/channels');
      if (!res.ok) throw new Error('Erro ao buscar canais');
      const { data } = await res.json();
      return data ?? [];
    },
    staleTime: 60 * 1000,
  });
}

export function useMarketingAssets(filters: MarketingAssetFilters) {
  return useQuery({
    queryKey: ['marketing-assets', filters],
    queryFn: async (): Promise<MarketingAsset[]> => {
      const params = new URLSearchParams();
      if (filters.content_piece_id) params.set('content_piece_id', filters.content_piece_id);
      if (filters.project_id) params.set('project_id', filters.project_id);
      if (filters.asset_type) params.set('asset_type', filters.asset_type);
      if (typeof filters.approved === 'boolean') params.set('approved', String(filters.approved));
      if (filters.search) params.set('search', filters.search);
      (filters.tags ?? []).forEach((tag) => params.append('tags[]', tag));

      const qs = params.toString();
      const res = await tenantFetch(`/api/marketing/assets${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error('Erro ao buscar assets');
      const { data } = await res.json();
      return data ?? [];
    },
    staleTime: 30 * 1000,
  });
}

export function useCreateMarketingPublication(projectId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      content_type: MarketingContentType;
      channel: MarketingChannel;
      scheduled_date: string;
      scheduled_time?: string | null;
      status?: MarketingPublicationStatus;
    }) => {
      const res = await tenantFetch('/api/marketing/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          project_id: projectId ?? null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Erro ao criar publicacao');
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-publications'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-stats'] });
    },
  });
}

export function useCreateMarketingContent(projectId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      content_type: MarketingContentType;
      project_id?: string | null;
      topic?: string | null;
      brief?: string | null;
      caption_base?: string | null;
      cta?: string | null;
      due_date?: string | null;
      status?: MarketingContentStatus;
    }) => {
      const res = await tenantFetch('/api/marketing/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          project_id: payload.project_id ?? projectId ?? null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Erro ao criar conteudo');
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-content'] });
    },
  });
}

export function useUpdateMarketingContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const res = await tenantFetch(`/api/marketing/content/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Erro ao atualizar conteudo');
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-content'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-publications'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-stats'] });
    },
  });
}

export function useBatchCreatePublications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      contentId,
      payload,
    }: {
      contentId: string;
      payload: {
        channels: MarketingChannel[];
        scheduled_date: string;
        scheduled_time?: string | null;
        status?: MarketingPublicationStatus;
      };
    }) => {
      const res = await tenantFetch(`/api/marketing/content/${contentId}/publications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Erro ao criar publicacoes em lote');
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-publications'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-stats'] });
    },
  });
}

export function useUpdateMarketingPublication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const res = await tenantFetch(`/api/marketing/publications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Erro ao atualizar publicacao');
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-publications'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-stats'] });
    },
  });
}

export function useCreateMarketingCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      project_id?: string | null;
      name: string;
      description?: string | null;
      objective?: string | null;
      start_date?: string | null;
      end_date?: string | null;
      status?: 'active' | 'draft' | 'completed' | 'archived';
      color?: string;
    }) => {
      const res = await tenantFetch('/api/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Erro ao criar campanha');
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] }),
  });
}

export function useUpdateMarketingCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const res = await tenantFetch(`/api/marketing/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Erro ao atualizar campanha');
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] }),
  });
}

export function useCreateMarketingChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      platform: 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'site' | 'whatsapp' | 'other';
      color?: string;
      icon_key?: string | null;
      profile_url?: string | null;
      is_active?: boolean;
    }) => {
      const res = await tenantFetch('/api/marketing/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Erro ao criar canal');
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing-channels'] }),
  });
}

export function useUpdateMarketingChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const res = await tenantFetch(`/api/marketing/channels/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Erro ao atualizar canal');
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing-channels'] }),
  });
}

export function useUploadMarketingAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      file: File;
      content_piece_id?: string | null;
      asset_type: MarketingAssetType;
      caption_channel?: MarketingChannel | null;
      caption_text?: string | null;
      notes?: string | null;
      tags?: string[];
      sort_order?: number;
    }) => {
      const formData = new FormData();
      formData.append('file', payload.file);
      formData.append('asset_type', payload.asset_type);
      if (payload.content_piece_id) formData.append('content_piece_id', payload.content_piece_id);
      if (payload.caption_channel) formData.append('caption_channel', payload.caption_channel);
      if (payload.caption_text) formData.append('caption_text', payload.caption_text);
      if (payload.notes) formData.append('notes', payload.notes);
      if (payload.tags && payload.tags.length > 0) formData.append('tags', payload.tags.join(','));
      if (typeof payload.sort_order === 'number') formData.append('sort_order', String(payload.sort_order));

      const res = await tenantFetch('/api/marketing/assets/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Erro no upload do asset');
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing-assets'] }),
  });
}

export function useUpdateMarketingAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const res = await tenantFetch(`/api/marketing/assets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Erro ao atualizar asset');
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing-assets'] }),
  });
}

export function useDeleteMarketingAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await tenantFetch(`/api/marketing/assets/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Erro ao remover asset');
      }
      return true;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing-assets'] }),
  });
}

export function useApproveMarketingAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await tenantFetch(`/api/marketing/assets/${id}/approve`, {
        method: 'POST',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Erro ao aprovar asset');
      }
      const { data } = await res.json();
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing-assets'] }),
  });
}
