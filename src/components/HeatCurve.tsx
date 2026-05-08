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
      <div className="card-surface border-dashed p-6 text-center text-sm text-muted">
        熱度資料尚未拉取。執行 <code>npm run fetch-data</code> 後重新部署。
      </div>
    );
  }
  return (
    <div className="card-surface h-64 w-full p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -16 }}>
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
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1c2025",
              border: "1px solid #2a2e33",
              borderRadius: "6px",
              color: "#d6d3c0",
            }}
            labelStyle={{ color: "#d6d3c0" }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#d6d3c0" }} />
          <Line
            type="monotone"
            dataKey="trends"
            name="Google Trends"
            stroke="#d97706"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="ptt"
            name="PTT 提及"
            stroke="#9ca3af"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="news"
            name="新聞報導"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
