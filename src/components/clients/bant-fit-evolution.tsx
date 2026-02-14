'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Point = {
  label: string;
  bant: number;
  fit: number;
};

function asNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function BANTFITEvolution({ contacts }: { contacts: Array<Record<string, unknown>> }) {
  const points: Point[] = contacts
    .map((contact) => {
      const bantScores = (contact.bant_scores ?? {}) as Record<string, unknown>;
      const fitScores = (contact.fit_scores ?? {}) as Record<string, unknown>;
      const date = String(contact.data_contato ?? '-');
      return {
        label: date,
        bant: asNumber(bantScores.total),
        fit: asNumber(fitScores.total),
      };
    })
    .filter((p) => p.label !== '-' && (p.bant > 0 || p.fit > 0))
    .sort((a, b) => a.label.localeCompare(b.label));

  if (points.length === 0) {
    return (
      <div className="rounded-md border bg-slate-50 p-3 text-sm text-slate-500">
        Sem historico suficiente para evolucao BANT/FIT.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white p-3">
      <p className="text-xs text-slate-500">Evolucao BANT/FIT</p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 25]} />
            <Tooltip />
            <Line type="monotone" dataKey="bant" stroke="#2563eb" strokeWidth={2} name="BANT" />
            <Line type="monotone" dataKey="fit" stroke="#7c3aed" strokeWidth={2} name="FIT" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

