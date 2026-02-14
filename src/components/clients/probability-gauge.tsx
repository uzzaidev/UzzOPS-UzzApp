'use client';

function tone(value: number) {
  if (value >= 60) return 'text-emerald-700';
  if (value >= 30) return 'text-amber-700';
  return 'text-red-700';
}

export function ProbabilityGauge({ value }: { value: number | null | undefined }) {
  const safe = typeof value === 'number' ? Math.max(0, Math.min(100, value)) : null;
  const progress = safe ?? 0;

  return (
    <div className="flex items-center gap-2">
      <div
        className="grid h-9 w-9 place-items-center rounded-full border text-[11px] font-semibold"
        style={{
          background: `conic-gradient(currentColor ${progress * 3.6}deg, #e5e7eb 0deg)`,
        }}
      >
        <div className="grid h-7 w-7 place-items-center rounded-full bg-white text-[10px] text-slate-700">
          {safe == null ? '-' : `${Math.round(safe)}%`}
        </div>
      </div>
      <span className={`text-xs font-medium ${safe == null ? 'text-slate-500' : tone(safe)}`}>
        {safe == null ? 'Sem prob.' : 'Probabilidade'}
      </span>
    </div>
  );
}

