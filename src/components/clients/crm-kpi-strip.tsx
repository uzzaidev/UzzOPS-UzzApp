'use client';

import type { UzzappClient } from '@/types';

function sum(values: Array<number | null | undefined>) {
  return values.reduce((acc, n) => acc + (typeof n === 'number' ? n : 0), 0);
}

function money(value: number) {
  return `R$ ${value.toFixed(2)}`;
}

export function CrmKpiStrip({ clients }: { clients: UzzappClient[] }) {
  const now = new Date().toISOString().slice(0, 10);
  const hot = clients.filter((c) => c.icp_classification === 'hot').length;
  const warm = clients.filter((c) => c.icp_classification === 'warm').length;
  const cold = clients.filter((c) => c.icp_classification === 'cold').length;
  const future = clients.filter((c) => c.icp_classification === 'future').length;
  const pipeline = sum(clients.map((c) => c.potential_value));
  const closed = clients.filter((c) => c.negotiation_status === 'Fechado').length;
  const overdueActions = clients.filter(
    (c) => !!c.next_action_deadline && c.next_action_deadline < now && c.status !== 'churned'
  ).length;

  return (
    <div className="grid gap-2 rounded-lg border bg-white p-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
      <Kpi label="Hot" value={String(hot)} tone="text-red-700" cardTone="bg-red-50/60 border-red-100" />
      <Kpi label="Warm" value={String(warm)} tone="text-amber-700" cardTone="bg-amber-50/60 border-amber-100" />
      <Kpi label="Cold" value={String(cold)} tone="text-blue-700" cardTone="bg-blue-50/60 border-blue-100" />
      <Kpi label="Future" value={String(future)} tone="text-violet-700" cardTone="bg-violet-50/60 border-violet-100" />
      <Kpi label="Pipeline" value={money(pipeline)} />
      <Kpi label="Fechados" value={String(closed)} />
      <Kpi
        label="Acao vencida"
        value={String(overdueActions)}
        tone={overdueActions > 0 ? 'text-red-700' : 'text-slate-700'}
        cardTone={overdueActions > 0 ? 'bg-red-50/60 border-red-100' : undefined}
      />
      <Kpi label="Total clientes" value={String(clients.length)} />
    </div>
  );
}

function Kpi({
  label,
  value,
  tone = 'text-slate-800',
  cardTone,
}: {
  label: string;
  value: string;
  tone?: string;
  cardTone?: string;
}) {
  return (
    <div className={`rounded-md border bg-slate-50 p-2 shadow-sm ${cardTone ?? ''}`}>
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className={`text-sm font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
