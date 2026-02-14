'use client';

import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { CrmKpiStrip } from '@/components/clients/crm-kpi-strip';
import { ClientKanbanBoard } from '@/components/clients/client-kanban-board';
import { useClients, useUpdateClient } from '@/hooks/useClients';
import { funnelLabel } from '@/lib/crm/labels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  projectId: string;
};

const STAGES = [
  'lead-novo',
  'qualificado',
  'proposta',
  'negociacao',
  'fechado',
  'stand-by',
];

export function CrmDashboardContent({ projectId }: Props) {
  const { data, isLoading, error } = useClients(projectId);
  const updateClient = useUpdateClient(projectId);
  const clients = data ?? [];

  const stageCounts = STAGES.map((stage) => ({
    stage,
    count: clients.filter((c) => (c.funnel_stage ?? 'lead-novo') === stage).length,
  }));

  const topPipeline = [...clients]
    .sort((a, b) => (b.potential_value ?? 0) - (a.potential_value ?? 0))
    .slice(0, 8);

  const handleStageChange = async (clientId: string, stage: string) => {
    try {
      await updateClient.mutateAsync({
        clientId,
        updates: { funnel_stage: stage },
      });
      return true;
    } catch {
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">Erro ao carregar dashboard CRM.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-2 z-20 -mx-2 rounded-lg border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur">
        <CrmKpiStrip clients={clients} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Pipeline por etapa</CardTitle>
            <Link href={`/projects/${projectId}/clients`} className="text-xs text-uzzai-primary underline">
              Ver clientes
            </Link>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {stageCounts.map((item) => (
              <div key={item.stage} className="rounded-md border bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{funnelLabel(item.stage)}</p>
                <p className="text-lg font-semibold text-slate-900">{item.count}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Top pipeline</CardTitle>
            <Link href={`/projects/${projectId}/clients`} className="text-xs text-uzzai-primary underline">
              Ver tudo
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {topPipeline.length === 0 ? (
              <p className="text-sm text-slate-500">Sem clientes.</p>
            ) : (
              topPipeline.map((client) => (
                <Link
                  key={client.id}
                  href={`/projects/${projectId}/clients/${client.id}`}
                  className="block rounded-md border bg-slate-50 p-2 text-sm hover:border-uzzai-primary"
                >
                  <p className="font-medium text-slate-900">{client.name}</p>
                  <p className="text-xs text-slate-500">
                    {(client.potential_value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kanban operacional</CardTitle>
          <p className="text-sm text-slate-500">Arraste os cards para atualizar o estagio do funil.</p>
        </CardHeader>
        <CardContent className="pt-0">
          <ClientKanbanBoard clients={clients} projectId={projectId} onStageChange={handleStageChange} />
        </CardContent>
      </Card>
    </div>
  );
}
