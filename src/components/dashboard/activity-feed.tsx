'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { ActivityFeedItem } from '@/hooks/useDashboard';

const MODULE_TONE: Record<ActivityFeedItem['module'], string> = {
  dev: 'bg-blue-50 text-blue-700 border-blue-200',
  crm: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  marketing: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  risk: 'bg-red-50 text-red-700 border-red-200',
  daily: 'bg-amber-50 text-amber-700 border-amber-200',
  retro: 'bg-violet-50 text-violet-700 border-violet-200',
};

function moduleLabel(module: ActivityFeedItem['module']) {
  if (module === 'dev') return 'Dev';
  if (module === 'crm') return 'CRM';
  if (module === 'marketing') return 'MKT';
  if (module === 'risk') return 'Risk';
  if (module === 'daily') return 'Daily';
  return 'Retro';
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function moduleDot(module: ActivityFeedItem['module']) {
  if (module === 'dev') return 'bg-blue-500';
  if (module === 'crm') return 'bg-emerald-500';
  if (module === 'marketing') return 'bg-fuchsia-500';
  if (module === 'risk') return 'bg-red-500';
  if (module === 'daily') return 'bg-amber-500';
  return 'bg-violet-500';
}

export function ActivityFeed({ items }: { items: ActivityFeedItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">Sem eventos recentes.</p>;
  }

  return (
    <div className="space-y-2">
      {items.slice(0, 10).map((item) => {
        const line = (
          <div className="rounded-md border bg-slate-50 p-3 transition hover:bg-slate-100">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                <span className={`h-2 w-2 rounded-full ${moduleDot(item.module)}`} />
                {item.title}
              </p>
              <Badge variant="outline" className={MODULE_TONE[item.module]}>
                {moduleLabel(item.module)}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-slate-600">{item.description}</p>
            <p className="mt-1 text-[11px] text-slate-500">{formatDate(item.at)}</p>
          </div>
        );

        return item.href ? (
          <Link key={item.id} href={item.href}>
            {line}
          </Link>
        ) : (
          <div key={item.id}>{line}</div>
        );
      })}
    </div>
  );
}
