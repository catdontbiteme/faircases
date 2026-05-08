import fs from "node:fs";
import path from "node:path";
import { STATUS_OPEN } from "./labels";
import type { CaseRecord } from "./cases";

export type HeatPoint = {
  date: string;
  trends?: number;
  ptt?: number;
  news?: number;
};

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

type HeatKey = "trends" | "ptt" | "news";

function maxOf(series: HeatPoint[], key: HeatKey): number {
  let m = 0;
  for (const p of series) {
    const v = p[key] ?? 0;
    if (v > m) m = v;
  }
  return m;
}

function recentAverage(
  series: HeatPoint[],
  key: HeatKey,
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
  // Per-signal ratio: each signal compares its own recent average to its own peak,
  // then we take the max — so if media stopped covering AND PTT stopped discussing,
  // the case correctly reads as cold even when one signal is missing.
  const ratios: number[] = [];
  for (const k of ["trends", "ptt", "news"] as const) {
    const peak = maxOf(series, k);
    if (peak === 0) continue;
    ratios.push(recentAverage(series, k) / peak);
  }
  const ratio = ratios.length === 0 ? 0 : Math.max(...ratios);
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

/**
 * "Forgotten score" — quantifies how much a once-hot but unresolved case has
 * fallen off the public radar. Higher = more forgotten.
 *
 *   score = peakHeat × (1 - currentRatio) × isOpen
 *
 * - peakHeat: max signal value across trends/ptt/news (was once how big a deal)
 * - 1 - currentRatio: how far off recent attention has fallen from the peak
 * - isOpen: 0 if case is already sentenced/closed (only unresolved cases count)
 *
 * Returns 0 for any closed case or any case without enough data.
 */
export function computeForgottenScore(
  c: CaseRecord,
  series: HeatPoint[]
): number {
  if (!STATUS_OPEN[c.status]) return 0;

  let peak = 0;
  let recentForPeak = 0;
  for (const k of ["trends", "ptt", "news"] as const) {
    const p = maxOf(series, k);
    if (p > peak) {
      peak = p;
      recentForPeak = recentAverage(series, k);
    }
  }
  if (peak === 0) return 0;
  const ratio = recentForPeak / peak;
  return peak * (1 - ratio);
}
