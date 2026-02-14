'use client';

import { Badge } from '@/components/ui/badge';

function asText(v: unknown) {
  if (v == null) return '-';
  const s = String(v).trim();
  return s || '-';
}

function levelClass(value: string) {
  const key = value.trim().toLowerCase();
  if (key === 'alta' || key === 'high') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (key === 'media' || key === 'medio' || key === 'medium') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

export function StakeholderCard({ stakeholder }: { stakeholder: Record<string, unknown> }) {
  const name = asText(stakeholder.name);
  const role = asText(stakeholder.role);
  const decisionPower = asText(stakeholder.decision_power);
  const influence = asText(stakeholder.influence);
  const notes = asText(stakeholder.notes);

  return (
    <div className="rounded border bg-slate-50 p-3">
      <p className="text-sm font-semibold text-slate-900">{name}</p>
      <p className="text-xs text-slate-500">{role}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <Badge variant="outline" className={levelClass(decisionPower)}>
          Poder: {decisionPower}
        </Badge>
        <Badge variant="outline" className={levelClass(influence)}>
          Influencia: {influence}
        </Badge>
      </div>
      <p className="mt-2 text-xs text-slate-600">{notes}</p>
    </div>
  );
}

