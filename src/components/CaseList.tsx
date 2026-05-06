"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { CaseRecord } from "@/lib/cases";
import type { Coolness } from "@/lib/coolness";
import { CaseCard } from "./CaseCard";
import { CaseFilters } from "./CaseFilters";

export type EnrichedCase = { c: CaseRecord; coolness: Coolness };

type Props = {
  enriched: EnrichedCase[];
};

export function CaseList({ enriched }: Props) {
  const sp = useSearchParams();
  const category = sp?.get("category") ?? "";
  const status = sp?.get("status") ?? "";
  const level = sp?.get("level") ?? "";
  const year = sp?.get("year") ?? "";

  const years = useMemo(() => {
    const set = new Set<string>();
    for (const e of enriched) set.add(e.c.occurredAt.slice(0, 4));
    return [...set].sort((a, b) => (a < b ? 1 : -1));
  }, [enriched]);

  const filtered = useMemo(() => {
    return enriched.filter(({ c, coolness }) => {
      if (category && c.category !== category) return false;
      if (status && c.status !== status) return false;
      if (level && coolness.level !== level) return false;
      if (year && !c.occurredAt.startsWith(year)) return false;
      return true;
    });
  }, [enriched, category, status, level, year]);

  const hasAnyFilter = Boolean(category || status || level || year);
  const alertCount = filtered.filter((e) => e.coolness.level === "alert").length;

  return (
    <>
      {alertCount > 0 && (
        <p className="mb-6 inline-block rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-900">
          ⚠️ 有 <strong>{alertCount}</strong>{" "}
          件「冷案警報」：已被輿論遺忘但案件未結。
        </p>
      )}

      <CaseFilters years={years} hasAnyFilter={hasAnyFilter} />

      {filtered.length === 0 ? (
        <p className="rounded-md border border-dashed border-rule bg-white p-8 text-center text-muted">
          {hasAnyFilter ? "沒有符合篩選條件的案件。" : "目前尚無案件條目。"}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map(({ c, coolness }) => (
            <li key={c.slug}>
              <CaseCard c={c} coolness={coolness} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
