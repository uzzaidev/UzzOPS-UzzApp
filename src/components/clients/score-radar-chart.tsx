'use client';

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';

type ScoreRadarChartProps = {
  values: Record<string, unknown>;
  keys: string[];
  labels?: Record<string, string>;
  color?: string;
};

function asNumber(v: unknown) {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

export function ScoreRadarChart({
  values,
  keys,
  labels = {},
  color = '#2563eb',
}: ScoreRadarChartProps) {
  const data = keys.map((k) => ({
    metric: labels[k] ?? k,
    value: asNumber(values[k]),
  }));

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
          <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.25} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

