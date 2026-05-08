"use client";

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
import type { HeatPoint } from "@/lib/coolness";

export function HeatCurve({ data }: { data: HeatPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-rule bg-white p-6 text-center text-sm text-muted">
        熱度資料尚未拉取。執行 <code>npm run fetch-data</code> 後重新部署。
      </div>
    );
  }
  return (
    <div className="h-64 w-full rounded-md border border-rule bg-white p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={32} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="trends"
            name="Google Trends"
            stroke="#c2410c"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="ptt"
            name="PTT 提及"
            stroke="#1f2937"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="news"
            name="新聞報導"
            stroke="#0369a1"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
