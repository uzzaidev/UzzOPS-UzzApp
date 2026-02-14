'use client';

import { useQuery } from '@tanstack/react-query';
import { tenantFetch } from '@/lib/api-client';

export type EnterpriseDashboardData = {
  project: {
    id: string;
    name: string;
    code: string | null;
    status: string | null;
    description: string | null;
  };
  kpis: {
    health_score: number;
    health_status: string;
    sprint_progress: number;
    total_features: number;
    features_done: number;
    features_in_progress: number;
    blocked_features: number;
    critical_risks: number;
    posts_current: number;
    posts_target: number;
    hot_leads: number;
    active_leads: number;
    pipeline_value: number;
  };
  development: {
    current_sprint: Record<string, unknown> | null;
    sprint_points_total: number;
    sprint_points_done: number;
    feature_status_counts: Record<string, number>;
    mvp_progress: number;
    dod_average: number;
    retros: {
      pending: number;
      in_progress: number;
      done: number;
    };
    spikes: {
      active: number;
      total: number;
    };
    impediments_open: number;
  };
  marketing: {
    posts_current: number;
    posts_target: number;
    posts_progress: number;
    publication_on_time_rate: number;
    content_pipeline: Record<string, number>;
    next_publications: Array<{
      id: string;
      title: string;
      channel: string;
      scheduled_date: string | null;
      status: string;
    }>;
  };
  crm: {
    funnel: Record<string, number>;
    hot_leads: Array<{
      id: string;
      name: string;
      closing_probability: number;
      stage: string;
    }>;
    revenue_summary: {
      potential_total: number;
      mrr_total: number;
    };
    overdue_actions: number;
  };
};

export type ActivityFeedItem = {
  id: string;
  module: 'dev' | 'crm' | 'marketing' | 'risk' | 'daily' | 'retro';
  title: string;
  description: string;
  at: string;
  href?: string;
};

export function useEnterpriseDashboard(projectId: string) {
  return useQuery({
    queryKey: ['enterprise-dashboard', projectId],
    queryFn: async () => {
      const res = await tenantFetch(`/api/projects/${projectId}/dashboard`);
      if (!res.ok) throw new Error('Erro ao buscar dashboard enterprise');
      const body = await res.json();
      return body.data as EnterpriseDashboardData;
    },
    enabled: !!projectId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useProjectActivityFeed(projectId: string) {
  return useQuery({
    queryKey: ['project-activity-feed', projectId],
    queryFn: async () => {
      const res = await tenantFetch(`/api/projects/${projectId}/activity-feed`);
      if (!res.ok) throw new Error('Erro ao buscar feed de atividades');
      const body = await res.json();
      return (body.data ?? []) as ActivityFeedItem[];
    },
    enabled: !!projectId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
