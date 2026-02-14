'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

export function KpiCard({
  title,
  value,
  subtitle,
  badge,
  icon: Icon,
  tone = 'text-slate-900',
  accent = 'border-slate-200',
}: {
  title: string;
  value: string;
  subtitle?: string;
  badge?: string;
  icon?: LucideIcon;
  tone?: string;
  accent?: string;
}) {
  return (
    <Card className={`border ${accent} bg-white shadow-sm`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-xs font-medium text-slate-500">
            {Icon ? <Icon className="h-4 w-4" /> : null}
            {title}
          </CardTitle>
          {badge ? (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
              {badge}
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${tone}`}>{value}</p>
        {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
      </CardContent>
    </Card>
  );
}
