'use client';

import type { UzzappClient } from '@/types';
import { Flame, CalendarClock, Handshake, TrendingUp, Thermometer, Snowflake, Sparkles, Users } from 'lucide-react';
import { KpiCard } from '@/components/dashboard/kpi-card';

function sum(values: Array<number | null | undefined>) {
  return values.reduce<number>((acc, n) => acc + (typeof n === 'number' ? n : 0), 0);
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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
      <KpiCard title="Hot" value={String(hot)} icon={Flame} tone="text-red-700" accent="border-red-200" />
      <KpiCard title="Warm" value={String(warm)} icon={Thermometer} tone="text-amber-700" accent="border-amber-200" />
      <KpiCard title="Cold" value={String(cold)} icon={Snowflake} tone="text-blue-700" accent="border-blue-200" />
      <KpiCard title="Future" value={String(future)} icon={Sparkles} tone="text-violet-700" accent="border-violet-200" />
      <KpiCard title="Pipeline" value={money(pipeline)} icon={TrendingUp} accent="border-slate-200" />
      <KpiCard title="Fechados" value={String(closed)} icon={Handshake} accent="border-emerald-200" tone="text-emerald-700" />
      <KpiCard
        title="Acao vencida"
        value={String(overdueActions)}
        icon={CalendarClock}
        tone={overdueActions > 0 ? 'text-red-700' : 'text-slate-700'}
        accent={overdueActions > 0 ? 'border-red-200' : 'border-slate-200'}
      />
      <KpiCard title="Total clientes" value={String(clients.length)} icon={Users} accent="border-slate-200" />
    </div>
  );
}
