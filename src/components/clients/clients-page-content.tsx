'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ClientKanbanBoard } from '@/components/clients/client-kanban-board';
import { CrmKpiStrip } from '@/components/clients/crm-kpi-strip';
import { IcpBadge } from '@/components/clients/icp-badge';
import { useClients, useCreateClient, useDeactivateClient, useDeleteClient, useUpdateClient } from '@/hooks/useClients';
import { funnelLabel, statusLabel } from '@/lib/crm/labels';
import type { UzzappClient } from '@/types';

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  trial: 'bg-blue-100 text-blue-700 border-blue-200',
  paused: 'bg-amber-100 text-amber-700 border-amber-200',
  churned: 'bg-gray-100 text-gray-700 border-gray-200',
};

type Props = {
  projectId: string;
};

type NewClientForm = {
  name: string;
  company: string;
  phone: string;
  email: string;
  plan: 'starter' | 'pro' | 'enterprise' | 'custom';
  status: 'active' | 'trial' | 'paused' | 'churned';
  funnel_stage: string;
  closing_probability: string;
  potential_value: string;
};

const INITIAL_FORM: NewClientForm = {
  name: '',
  company: '',
  phone: '',
  email: '',
  plan: 'pro',
  status: 'trial',
  funnel_stage: 'lead-novo',
  closing_probability: '',
  potential_value: '',
};

function statusClass(status: string | null) {
  if (!status) return STATUS_BADGE.trial;
  return STATUS_BADGE[status] ?? STATUS_BADGE.trial;
}

function ClientRow({
  client,
  projectId,
}: {
  client: UzzappClient;
  projectId: string;
}) {
  const updateClient = useUpdateClient(projectId);
  const deactivateClient = useDeactivateClient(projectId);
  const deleteClient = useDeleteClient(projectId);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: client.name ?? '',
    company: client.company ?? '',
    phone: client.phone ?? '',
    email: client.email ?? '',
    main_contact_name: client.main_contact_name ?? '',
    main_contact_role: client.main_contact_role ?? '',
    notes: client.notes ?? '',
  });

  const handleStatusChange = (value: 'active' | 'trial' | 'paused' | 'churned') => {
    updateClient.mutate(
      { clientId: client.id, updates: { status: value } },
      {
        onSuccess: () => toast.success('Status do cliente atualizado.'),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleDeactivate = () => {
    deactivateClient.mutate(client.id, {
      onSuccess: () => toast.success('Cliente marcado como churn.'),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleDelete = () => {
    const ok = window.confirm(`Excluir cliente "${client.name}"? Esta acao remove tambem os contatos vinculados.`);
    if (!ok) return;
    deleteClient.mutate(client.id, {
      onSuccess: () => toast.success('Cliente excluido com sucesso.'),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleSaveQuickEdit = () => {
    updateClient.mutate(
      {
        clientId: client.id,
        updates: {
          name: draft.name.trim(),
          company: draft.company.trim() || null,
          phone: draft.phone.trim() || null,
          email: draft.email.trim() || null,
          main_contact_name: draft.main_contact_name.trim() || null,
          main_contact_role: draft.main_contact_role.trim() || null,
          notes: draft.notes.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast.success('Cliente atualizado.');
          setEditOpen(false);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col">
          <Link
            href={`/projects/${projectId}/clients/${client.id}`}
            className="font-medium text-uzzai-primary hover:underline"
          >
            {client.name}
          </Link>
          <span className="text-xs text-muted-foreground">{client.company ?? '-'}</span>
        </div>
      </TableCell>
      <TableCell>
        <IcpBadge icp={client.icp_classification} />
      </TableCell>
      <TableCell className="text-sm">{client.email ?? '-'}</TableCell>
      <TableCell className="text-sm">{client.phone ?? '-'}</TableCell>
      <TableCell className="text-sm uppercase">{client.plan ?? '-'}</TableCell>
      <TableCell className="text-xs">{funnelLabel(client.funnel_stage)}</TableCell>
      <TableCell className="text-xs">
        {client.closing_probability == null ? '-' : `${client.closing_probability}%`}
      </TableCell>
      <TableCell className="text-xs">
        {client.potential_value == null ? '-' : `R$ ${Number(client.potential_value).toFixed(2)}`}
      </TableCell>
      <TableCell>
        <Badge className={statusClass(client.status)} variant="outline">
          {statusLabel(client.status ?? 'trial')}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">{client.onboarded_at ?? '-'}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <select
            className="h-8 rounded-md border px-2 text-xs"
            value={client.status ?? 'trial'}
            onChange={(e) => handleStatusChange(e.target.value as 'active' | 'trial' | 'paused' | 'churned')}
          >
            <option value="active">Ativo</option>
            <option value="trial">Trial</option>
            <option value="paused">Pausado</option>
            <option value="churned">Churn</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeactivate}
            disabled={client.status === 'churned'}
          >
            Churn
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteClient.isPending}
          >
            Excluir
          </Button>
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Editar</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Editar cliente</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2">
                <Input
                  placeholder="Nome"
                  value={draft.name}
                  onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                />
                <Input
                  placeholder="Empresa"
                  value={draft.company}
                  onChange={(e) => setDraft((p) => ({ ...p, company: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Telefone"
                    value={draft.phone}
                    onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))}
                  />
                  <Input
                    placeholder="Email"
                    value={draft.email}
                    onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Contato principal"
                    value={draft.main_contact_name}
                    onChange={(e) => setDraft((p) => ({ ...p, main_contact_name: e.target.value }))}
                  />
                  <Input
                    placeholder="Cargo contato"
                    value={draft.main_contact_role}
                    onChange={(e) => setDraft((p) => ({ ...p, main_contact_role: e.target.value }))}
                  />
                </div>
                <Textarea
                  rows={4}
                  placeholder="Observações"
                  value={draft.notes}
                  onChange={(e) => setDraft((p) => ({ ...p, notes: e.target.value }))}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSaveQuickEdit} disabled={updateClient.isPending}>
                    {updateClient.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button asChild variant="outline" size="sm">
            <Link href={`/projects/${projectId}/clients/${client.id}`}>
              Abrir
            </Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ClientsPageContent({ projectId }: Props) {
  const { data, isLoading, error } = useClients(projectId);
  const createClient = useCreateClient(projectId);
  const updateClient = useUpdateClient(projectId);

  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'lista' | 'pipeline'>('pipeline');
  const [icpFilter, setIcpFilter] = useState<'all' | 'hot' | 'warm' | 'cold' | 'future'>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'paused' | 'churned'>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [form, setForm] = useState<NewClientForm>(INITIAL_FORM);
  const filterStorageKey = `crm-clients-filters:${projectId}`;

  useEffect(() => {
    if (!projectId) return;
    try {
      const raw = window.localStorage.getItem(filterStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<{
        query: string;
        mode: 'lista' | 'pipeline';
        icpFilter: 'all' | 'hot' | 'warm' | 'cold' | 'future';
        stageFilter: string;
        statusFilter: 'all' | 'active' | 'trial' | 'paused' | 'churned';
        productFilter: string;
      }>;
      if (typeof parsed.query === 'string') setQuery(parsed.query);
      if (parsed.mode === 'lista' || parsed.mode === 'pipeline') setMode(parsed.mode);
      if (parsed.icpFilter) setIcpFilter(parsed.icpFilter);
      if (typeof parsed.stageFilter === 'string') setStageFilter(parsed.stageFilter);
      if (parsed.statusFilter) setStatusFilter(parsed.statusFilter);
      if (typeof parsed.productFilter === 'string') setProductFilter(parsed.productFilter);
    } catch {
      // ignore malformed saved filters
    }
  }, [filterStorageKey, projectId]);

  useEffect(() => {
    if (!projectId) return;
    const payload = {
      query,
      mode,
      icpFilter,
      stageFilter,
      statusFilter,
      productFilter,
    };
    window.localStorage.setItem(filterStorageKey, JSON.stringify(payload));
  }, [filterStorageKey, icpFilter, mode, productFilter, projectId, query, stageFilter, statusFilter]);

  const filtered = useMemo(() => {
    const items = data ?? [];
    const q = query.trim().toLowerCase();
    const byText = !q
      ? items
      : items.filter((client) =>
      [client.name, client.company, client.email, client.phone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );

    const byIcp = icpFilter === 'all'
      ? byText
      : byText.filter((client) => client.icp_classification === icpFilter);
    const byStage = stageFilter === 'all'
      ? byIcp
      : byIcp.filter((client) => (client.funnel_stage ?? 'lead-novo') === stageFilter);
    const byStatus = statusFilter === 'all'
      ? byStage
      : byStage.filter((client) => (client.status ?? 'trial') === statusFilter);
    const byProduct = productFilter === 'all'
      ? byStatus
      : byStatus.filter((client) => (client.product_focus ?? 'OUTRO') === productFilter);

    return byProduct;
  }, [data, icpFilter, productFilter, query, stageFilter, statusFilter]);

  const handleCreate = () => {
    if (!form.name.trim()) {
      toast.error('Nome do cliente e obrigatorio.');
      return;
    }

    createClient.mutate(
      {
        name: form.name.trim(),
        company: form.company.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        plan: form.plan,
        status: form.status,
        funnel_stage: form.funnel_stage || undefined,
        closing_probability: form.closing_probability ? Number(form.closing_probability) : undefined,
        potential_value: form.potential_value ? Number(form.potential_value) : undefined,
      },
      {
        onSuccess: () => {
          toast.success('Cliente criado com sucesso.');
          setForm(INITIAL_FORM);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleStageChange = async (clientId: string, stage: string) => {
    try {
      await updateClient.mutateAsync({
        clientId,
        updates: { funnel_stage: stage },
      });
      toast.success('Etapa do funil atualizada.');
      return true;
    } catch (err: any) {
      toast.error(err?.message ?? 'Falha ao atualizar etapa do funil.');
      return false;
    }
  };

  const clearFilters = () => {
    setQuery('');
    setIcpFilter('all');
    setStageFilter('all');
    setStatusFilter('all');
    setProductFilter('all');
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <Skeleton key={n} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">Erro ao carregar clientes.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-3">
        <div className="mb-3">
          <h1 className="text-lg font-semibold text-slate-900">Clientes & Leads</h1>
          <p className="text-xs text-slate-500">Gestao comercial com visao de pipeline e lista.</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Modo:</span>
            <Button
              variant={mode === 'pipeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('pipeline')}
            >
              Pipeline
            </Button>
            <Button
              variant={mode === 'lista' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('lista')}
            >
              Lista
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            Exibindo <span className="font-semibold text-slate-700">{filtered.length}</span> cliente(s)
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">ICP:</span>
          <select
            className="h-8 rounded-md border px-2 text-xs"
            value={icpFilter}
            onChange={(e) => setIcpFilter(e.target.value as 'all' | 'hot' | 'warm' | 'cold' | 'future')}
          >
            <option value="all">Todos</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
            <option value="future">Future</option>
          </select>
          <span className="text-xs text-slate-500">Funil:</span>
          <select
            className="h-8 rounded-md border px-2 text-xs"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="lead-novo">Lead novo</option>
            <option value="qualificado">Qualificado</option>
            <option value="proposta">Proposta</option>
            <option value="negociacao">Negociacao</option>
            <option value="fechado">Fechado</option>
            <option value="stand-by">Stand-by</option>
            <option value="onboarding">Onboarding</option>
            <option value="cliente-ativo">Cliente ativo</option>
            <option value="perdido">Perdido</option>
          </select>
          <span className="text-xs text-slate-500">Status:</span>
          <select
            className="h-8 rounded-md border px-2 text-xs"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'trial' | 'paused' | 'churned')}
          >
            <option value="all">Todos</option>
            <option value="trial">Trial</option>
            <option value="active">Ativo</option>
            <option value="paused">Pausado</option>
            <option value="churned">Churn</option>
          </select>
          <span className="text-xs text-slate-500">Produto:</span>
          <select
            className="h-8 rounded-md border px-2 text-xs"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="CHATBOT">Chatbot</option>
            <option value="SITE-BUILDER">Site Builder</option>
            <option value="UzzBIM">UzzBIM</option>
            <option value="NutriTrain">NutriTrain</option>
            <option value="OUTRO">Outro</option>
          </select>
          <Button size="sm" variant="ghost" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </div>
      </div>

      <CrmKpiStrip clients={filtered} />

      <div className="rounded-lg border bg-white p-3">
        <div className="grid gap-2 md:grid-cols-10">
          <Input
            placeholder="Nome do cliente"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            placeholder="Empresa"
            value={form.company}
            onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
          />
          <Input
            placeholder="Telefone"
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          />
          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <select
            className="h-10 rounded-md border px-3 text-sm"
            value={form.plan}
            onChange={(e) => setForm((prev) => ({ ...prev, plan: e.target.value as NewClientForm['plan'] }))}
          >
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
            <option value="custom">Custom</option>
          </select>
          <select
            className="h-10 rounded-md border px-3 text-sm"
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as NewClientForm['status'] }))}
          >
            <option value="trial">Trial</option>
            <option value="active">Ativo</option>
            <option value="paused">Pausado</option>
            <option value="churned">Churn</option>
          </select>
          <select
            className="h-10 rounded-md border px-3 text-sm"
            value={form.funnel_stage}
            onChange={(e) => setForm((prev) => ({ ...prev, funnel_stage: e.target.value }))}
          >
            <option value="lead-novo">Lead novo</option>
            <option value="qualificado">Qualificado</option>
            <option value="proposta">Proposta</option>
            <option value="negociacao">Negociacao</option>
            <option value="fechado">Fechado</option>
            <option value="onboarding">Onboarding</option>
            <option value="cliente-ativo">Cliente ativo</option>
            <option value="stand-by">Stand-by</option>
            <option value="perdido">Perdido</option>
          </select>
          <Input
            placeholder="Prob %"
            value={form.closing_probability}
            onChange={(e) => setForm((prev) => ({ ...prev, closing_probability: e.target.value }))}
          />
          <Input
            placeholder="Valor potencial"
            value={form.potential_value}
            onChange={(e) => setForm((prev) => ({ ...prev, potential_value: e.target.value }))}
          />
          <Button onClick={handleCreate} disabled={createClient.isPending}>
            Novo cliente
          </Button>
        </div>
      </div>

      <Input
        placeholder="Buscar por nome, empresa, email ou telefone..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {mode === 'pipeline' ? (
        <ClientKanbanBoard clients={filtered} projectId={projectId} onStageChange={handleStageChange} />
      ) : (
        <div className="rounded-lg border bg-white">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>ICP</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Funil</TableHead>
                <TableHead>Prob.</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Onboarded</TableHead>
                <TableHead className="w-44">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((client) => (
                  <ClientRow key={client.id} client={client} projectId={projectId} />
                ))
              )}
            </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
