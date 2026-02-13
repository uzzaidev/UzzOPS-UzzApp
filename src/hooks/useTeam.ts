'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { TeamMemberFull, CompanyMember } from '@/types';
import { getActiveTenantId, tenantFetch } from '@/lib/api-client';

export function useTeam(projectId: string) {
  return useQuery({
    queryKey: ['team', projectId],
    queryFn: async () => {
      const res = await tenantFetch(`/api/projects/${projectId}/team`);
      if (!res.ok) throw new Error('Failed to fetch team');
      const { data } = await res.json();
      return (data ?? []) as TeamMemberFull[];
    },
    enabled: !!projectId,
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, updates }: { memberId: string; updates: Record<string, unknown> }) => {
      const res = await tenantFetch(`/api/team-members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? 'Failed to update member');
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team'] }),
  });
}

export function useDeactivateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const res = await tenantFetch(`/api/team-members/${memberId}`, { method: 'DELETE' });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? 'Failed to deactivate member');
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team'] }),
  });
}

/**
 * Retorna o company_members do usuário autenticado (role, status, tenant_id).
 * Útil para checar se o usuário é admin antes de mostrar ações sensíveis.
 */
export function useCurrentMembership() {
  const supabase = createClient();
  return useQuery({
    queryKey: ['current-membership'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const activeTenantId = getActiveTenantId();
      const query = supabase
        .from('company_members')
        .select('id, tenant_id, role, status')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (activeTenantId) {
        query.eq('tenant_id', activeTenantId);
      }

      const { data } = await query.order('joined_at', { ascending: false }).order('created_at', { ascending: false });
      return ((data ?? [])[0] ?? null) as CompanyMember | null;
    },
  });
}
