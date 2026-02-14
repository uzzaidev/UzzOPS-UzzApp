'use client';

import Link from 'next/link';
import type { UzzappClient } from '@/types';
import { IcpBadge } from '@/components/clients/icp-badge';
import { ProbabilityGauge } from '@/components/clients/probability-gauge';
import { priorityLabel } from '@/lib/crm/labels';

function asText(v: unknown) {
  if (v == null) return '-';
  const s = String(v).trim();
  return s || '-';
}

function money(v: number | null) {
  return v == null ? '-' : `R$ ${v.toFixed(2)}`;
}

function isOverdue(date: string | null | undefined) {
  if (!date) return false;
  return date < new Date().toISOString().slice(0, 10);
}

function formatDate(v: unknown) {
  const s = asText(v);
  if (s === '-') return s;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
}

export function ClientCard({
  client,
  projectId,
}: {
  client: UzzappClient;
  projectId: string;
}) {
  return (
    <Link
      href={`/projects/${projectId}/clients/${client.id}`}
      className="block rounded-md border bg-white p-3 transition hover:border-uzzai-primary hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <IcpBadge icp={client.icp_classification} />
        <ProbabilityGauge value={client.closing_probability} />
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900">{client.name}</p>
      <p className="text-xs text-slate-500">{asText(client.main_contact_name)}</p>
      <p className="mt-2 text-xs text-slate-600">
        {asText(client.product_focus)} | Ultimo: {formatDate(client.last_contact_date)}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs font-medium text-slate-800">{money(client.potential_value)}</p>
        {isOverdue(client.next_action_deadline) ? (
          <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[11px] text-red-700">
            Acao vencida
          </span>
        ) : (
          <p className="text-[11px] text-slate-500">{priorityLabel(asText(client.priority))}</p>
        )}
      </div>
    </Link>
  );
}
