"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { CaseCategory, CaseStatus } from "@/lib/cases";
import type { CoolnessLevel } from "@/lib/coolness";
import { CATEGORY_LABEL, STATUS_LABEL } from "@/lib/labels";

const COOLNESS_LABEL: Record<CoolnessLevel, string> = {
  alert: "⚠️ 冷案警報",
  hot: "🔥 仍熱",
  warm: "💭 餘溫",
  cold: "🧊 已冷",
};

const CATEGORIES: CaseCategory[] = [
  "violent-crime",
  "police-line-of-duty",
  "bullying",
  "data-leak",
  "other",
];
const STATUSES: CaseStatus[] = [
  "in-investigation",
  "indicted",
  "in-trial",
  "sentenced",
  "closed",
];
const LEVELS: CoolnessLevel[] = ["alert", "hot", "warm", "cold"];

type Props = {
  years: string[];
  hasAnyFilter: boolean;
};

export function CaseFilters({ years, hasAnyFilter }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(sp?.toString() ?? "");
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  };

  const clearAll = () => router.replace("/", { scroll: false });

  const sel = (k: string) => sp?.get(k) ?? "";

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <Select
        label="類別"
        value={sel("category")}
        onChange={(v) => update("category", v)}
        options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABEL[c] }))}
      />
      <Select
        label="狀態"
        value={sel("status")}
        onChange={(v) => update("status", v)}
        options={STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
      />
      <Select
        label="退燒"
        value={sel("level")}
        onChange={(v) => update("level", v)}
        options={LEVELS.map((l) => ({ value: l, label: COOLNESS_LABEL[l] }))}
      />
      <Select
        label="年份"
        value={sel("year")}
        onChange={(v) => update("year", v)}
        options={years.map((y) => ({ value: y, label: y }))}
      />
      {hasAnyFilter && (
        <button
          type="button"
          onClick={clearAll}
          className="ml-1 rounded-md border border-rule bg-surface px-3 py-1.5 text-sm text-muted hover:border-ink hover:text-ink"
        >
          清除篩選
        </button>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="inline-flex items-center gap-1 rounded-md border border-rule bg-surface pl-3 pr-1 text-sm">
      <span className="text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-0 bg-transparent py-1.5 pr-2 text-ink focus:outline-none focus:ring-0"
      >
        <option value="">全部</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
