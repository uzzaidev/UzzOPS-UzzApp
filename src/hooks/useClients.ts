'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tenantFetch } from '@/lib/api-client';
import type { UzzappClient } from '@/types';

type UpdateClientPayload = {
  name?: string;
  legal_name?: string | null;
  cnpj?: string | null;
  company?: string | null;
  segment?: string | null;
  company_size?: 'micro' | 'pequena' | 'media' | 'grande' | null;
  city?: string | null;
  state?: string | null;
  address_full?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  main_contact_name?: string | null;
  main_contact_role?: string | null;
  whatsapp_business?: string | null;
  plan?: 'starter' | 'pro' | 'enterprise' | 'custom' | null;
  status?: 'active' | 'trial' | 'paused' | 'churned';
  funnel_stage?: string | null;
  negotiation_status?: string | null;
  closing_probability?: number | null;
  priority?: 'critica' | 'alta' | 'media' | 'baixa' | null;
  potential_value?: number | null;
  monthly_fee_value?: number | null;
  setup_fee_value?: number | null;
  next_interaction_date?: string | null;
  next_action_deadline?: string | null;
  sales_owner_id?: string | null;
  followup_owner_id?: string | null;
  technical_owner_id?: string | null;
  product_focus?: string | null;
  project_label?: string | null;
  preferred_channel?: string | null;
  general_sentiment?: string | null;
  lead_source?: 'indicacao' | 'linkedin' | 'evento' | 'cold-outreach' | 'inbound' | 'parceiro' | 'outro' | null;
  icp_classification?: 'hot' | 'warm' | 'cold' | 'future' | null;
  business_context?: string | null;
  lead_daily_volume?: number | null;
  stakeholders_json?: unknown[];
  bant_snapshot?: Record<string, unknown>;
  fit_snapshot?: Record<string, unknown>;
  last_contact_date?: string | null;
  tags?: string[];
  notes?: string | null;
  onboarded_at?: string | null;
};

export function useClients(projectId: string) {
  return useQuery({
    queryKey: ['clients', projectId],
    queryFn: async () => {
      const res = await tenantFetch(`/api/projects/${projectId}/clients`);
      if (!res.ok) throw new Error('Failed to fetch clients');
      const { data } = await res.json();
      return (data ?? []) as UzzappClient[];
    },
    enabled: !!projectId,
  });
}

export function useClient(clientId: string) {
  return useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const res = await tenantFetch(`/api/uzzapp-clients/${clientId}`);
      if (!res.ok) throw new Error('Failed to fetch client');
      const { data } = await res.json();
      return data as UzzappClient;
    },
    enabled: !!clientId,
  });
}

export function useClientContacts(projectId: string, clientId: string) {
  return useQuery({
    queryKey: ['client-contacts', projectId, clientId],
    queryFn: async () => {
      const res = await tenantFetch(`/api/projects/${projectId}/clients/contacts?client_id=${clientId}`);
      if (!res.ok) throw new Error('Failed to fetch client contacts');
      const { data } = await res.json();
      return (data ?? []) as Array<Record<string, unknown>>;
    },
    enabled: !!projectId && !!clientId,
  });
}

export function useClientContact(contactId: string) {
  return useQuery({
    queryKey: ['client-contact', contactId],
    queryFn: async () => {
      const res = await tenantFetch(`/api/client-contacts/${contactId}`);
      if (!res.ok) throw new Error('Failed to fetch client contact');
      const { data } = await res.json();
      return data as Record<string, unknown>;
    },
    enabled: !!contactId,
  });
}

export function useUpdateClientContact(projectId: string, clientId: string, contactId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      const res = await tenantFetch(`/api/client-contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Failed to update contact');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-contact', contactId] });
      queryClient.invalidateQueries({ queryKey: ['client-contacts', projectId, clientId] });
      queryClient.invalidateQueries({ queryKey: ['clients', projectId] });
    },
  });
}

export function useCreateClient(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      legal_name?: string;
      cnpj?: string;
      company?: string;
      segment?: string;
      company_size?: 'micro' | 'pequena' | 'media' | 'grande';
      city?: string;
      state?: string;
      address_full?: string;
      website?: string;
      phone?: string;
      email?: string;
      main_contact_name?: string;
      main_contact_role?: string;
      whatsapp_business?: string;
      plan?: 'starter' | 'pro' | 'enterprise' | 'custom';
      status?: 'active' | 'trial' | 'paused' | 'churned';
      funnel_stage?: string;
      negotiation_status?: string;
      closing_probability?: number;
      priority?: 'critica' | 'alta' | 'media' | 'baixa';
      potential_value?: number;
      monthly_fee_value?: number;
      setup_fee_value?: number;
      next_interaction_date?: string;
      next_action_deadline?: string;
      sales_owner_id?: string;
      followup_owner_id?: string;
      technical_owner_id?: string;
      product_focus?: string;
      project_label?: string;
      preferred_channel?: string;
      general_sentiment?: string;
      lead_source?: 'indicacao' | 'linkedin' | 'evento' | 'cold-outreach' | 'inbound' | 'parceiro' | 'outro';
      icp_classification?: 'hot' | 'warm' | 'cold' | 'future';
      business_context?: string;
      lead_daily_volume?: number;
      stakeholders_json?: unknown[];
      bant_snapshot?: Record<string, unknown>;
      fit_snapshot?: Record<string, unknown>;
      last_contact_date?: string;
      tags?: string[];
      notes?: string;
      onboarded_at?: string;
    }) => {
      const res = await tenantFetch(`/api/projects/${projectId}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Failed to create client');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', projectId] });
    },
  });
}

export function useUpdateClient(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clientId, updates }: { clientId: string; updates: UpdateClientPayload }) => {
      const res = await tenantFetch(`/api/uzzapp-clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Failed to update client');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', projectId] });
    },
  });
}

export function useDeactivateClient(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clientId: string) => {
      const res = await tenantFetch(`/api/uzzapp-clients/${clientId}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Failed to deactivate client');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', projectId] });
    },
  });
}

export function useDeleteClient(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clientId: string) => {
      const res = await tenantFetch(`/api/uzzapp-clients/${clientId}?hard=true`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Failed to delete client');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', projectId] });
    },
  });
}
