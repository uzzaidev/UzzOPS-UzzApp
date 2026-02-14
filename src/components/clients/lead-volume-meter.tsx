'use client';

function resolveBand(volume: number | null | undefined) {
  if (typeof volume !== 'number' || Number.isNaN(volume) || volume < 0) {
    return { width: 0, label: 'nao informado', tone: 'bg-slate-400', text: 'text-slate-600' };
  }
  if (volume >= 10) {
    return { width: 100, label: 'alto', tone: 'bg-emerald-500', text: 'text-emerald-700' };
  }
  if (volume >= 5) {
    return { width: 65, label: 'medio', tone: 'bg-amber-500', text: 'text-amber-700' };
  }
  return { width: 35, label: 'baixo', tone: 'bg-rose-500', text: 'text-rose-700' };
}

export function LeadVolumeMeter({ value }: { value: number | null | undefined }) {
  const band = resolveBand(value);

  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Lead volume</span>
        <span className={`font-medium ${band.text}`}>
          {typeof value === 'number' ? `${value}/dia` : '-'} ({band.label})
        </span>
      </div>
      <div className="mt-1 h-2 rounded bg-slate-100">
        <div className={`h-2 rounded ${band.tone}`} style={{ width: `${band.width}%` }} />
      </div>
    </div>
  );
}

