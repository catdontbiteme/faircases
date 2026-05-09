"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type CompareSeries = {
  slug: string;
  shortTitle: string;
  /** Weekly news values, oldest first. Length need not match across series. */
  weekly: { date: string; value: number }[];
};

type Row = Record<string, number | string | undefined> & { date: string };

const WEEKS_BACK = 12;

// 6 high-contrast colors that survive on the dark surface. Order is stable so
// repeat renders use the same color per case.
const PALETTE = [
  "#d97706", // amber - accent-aligned
  "#60a5fa", // sky
  "#a78bfa", // violet
  "#34d399", // emerald
  "#f472b6", // pink
  "#fb923c", // orange
];

export function AttentionCompareChart({
  series,
}: {
  series: CompareSeries[];
}) {
  const { rows, lines } = useMemo(() => buildChartData(series), [series]);

  if (rows.length === 0 || lines.length === 0) {
    return null;
  }

  return (
    <section className="mb-10 rounded-lg border border-rule bg-surface/60 p-5">
      <header className="mb-3">
        <h2 className="font-serif text-xl font-semibold text-ink">
          📊 近 12 週公眾關注熱度比較
        </h2>
        <p className="mt-1 text-xs text-muted">
          各案件每週新聞報導加權頻率，以該案件歷史峰值為 100 歸一化。看現在大家在關心哪一件。
        </p>
      </header>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="#2a2e33" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#7a7568" }}
              stroke="#2a2e33"
              minTickGap={32}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#7a7568" }}
              stroke="#2a2e33"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1c2025",
                border: "1px solid #2a2e33",
                borderRadius: "6px",
                color: "#d6d3c0",
              }}
              labelStyle={{ color: "#d6d3c0" }}
              formatter={(value: number, name: string) => [
                `${Math.round(value)} / 100`,
                name,
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "#d6d3c0" }}
              iconType="plainline"
            />
            {lines.map((l, i) => (
              <Line
                key={l.dataKey}
                type="monotone"
                dataKey={l.dataKey}
                name={l.label}
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function buildChartData(series: CompareSeries[]): {
  rows: Row[];
  lines: { dataKey: string; label: string }[];
} {
  // Take the most recent WEEKS_BACK buckets per case, normalize to its own peak.
  // Then merge by date so each row has all cases as columns.
  const dateSet = new Set<string>();
  const normalized = series
    .map((s) => {
      if (!s.weekly || s.weekly.length === 0) return null;
      const peak = s.weekly.reduce((m, p) => (p.value > m ? p.value : m), 0);
      if (peak === 0) return null;
      const tail = s.weekly.slice(-WEEKS_BACK);
      tail.forEach((p) => dateSet.add(p.date));
      return {
        slug: s.slug,
        label: s.shortTitle,
        points: new Map(
          tail.map((p) => [p.date, Math.round((p.value / peak) * 100)])
        ),
      };
    })
    .filter((n): n is NonNullable<typeof n> => n !== null);

  if (normalized.length === 0) return { rows: [], lines: [] };

  const dates = [...dateSet].sort();
  const rows: Row[] = dates.map((d) => {
    const r: Row = { date: d };
    for (const n of normalized) {
      r[n.slug] = n.points.get(d);
    }
    return r;
  });

  const lines = normalized.map((n) => ({ dataKey: n.slug, label: n.label }));
  return { rows, lines };
}
