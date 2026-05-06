import fs from "node:fs";
import path from "node:path";
import { STATUS_OPEN } from "./labels";
import type { CaseRecord } from "./cases";

export type HeatPoint = { date: string; trends?: number; ptt?: number };

export type CoolnessLevel = "hot" | "warm" | "cold" | "alert";

export const COOLNESS_HOT_THRESHOLD = 0.3;
export const COOLNESS_WARM_THRESHOLD = 0.1;
export const COOLNESS_RECENT_DAYS = 30;

export type Coolness = {
  level: CoolnessLevel;
  recentRatio: number;
  label: string;
  emoji: string;
  description: string;
};

export function loadHeatSeries(slug: string): HeatPoint[] {
  const file = path.join(process.cwd(), "data", "trends", `${slug}.json`);
  if (!fs.existsSync(file)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    if (Array.isArray(raw)) return raw as HeatPoint[];
    return [];
  } catch {
    return [];
  }
}

function maxOf(series: HeatPoint[], key: "trends" | "ptt"): number {
  let m = 0;
  for (const p of series) {
    const v = p[key] ?? 0;
    if (v > m) m = v;
  }
  return m;
}

function recentAverage(
  series: HeatPoint[],
  key: "trends" | "ptt",
  days = COOLNESS_RECENT_DAYS
): number {
  if (series.length === 0) return 0;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const recent = series.filter((p) => new Date(p.date).getTime() >= cutoff);
  if (recent.length === 0) return 0;
  const sum = recent.reduce((acc, p) => acc + (p[key] ?? 0), 0);
  return sum / recent.length;
}

export function computeCoolness(c: CaseRecord, series: HeatPoint[]): Coolness {
  const peak = Math.max(maxOf(series, "trends"), maxOf(series, "ptt"));
  const recent = Math.max(
    recentAverage(series, "trends"),
    recentAverage(series, "ptt")
  );
  const ratio = peak > 0 ? recent / peak : 0;
  const isOpen = STATUS_OPEN[c.status];

  if (ratio >= COOLNESS_HOT_THRESHOLD) {
    return {
      level: "hot",
      recentRatio: ratio,
      label: "仍熱",
      emoji: "🔥",
      description: "近期關注度仍高",
    };
  }
  if (ratio >= COOLNESS_WARM_THRESHOLD) {
    return {
      level: "warm",
      recentRatio: ratio,
      label: "餘溫",
      emoji: "💭",
      description: "熱度下降中",
    };
  }
  if (isOpen) {
    return {
      level: "alert",
      recentRatio: ratio,
      label: "冷案警報",
      emoji: "⚠️",
      description: "已被遺忘，但案件未結",
    };
  }
  return {
    level: "cold",
    recentRatio: ratio,
    label: "已冷",
    emoji: "🧊",
    description: "已退燒、案件已結",
  };
}

export const COOLNESS_SORT_ORDER: Record<CoolnessLevel, number> = {
  alert: 0,
  hot: 1,
  warm: 2,
  cold: 3,
};
