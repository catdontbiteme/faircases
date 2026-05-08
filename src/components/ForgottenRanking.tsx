import Link from "next/link";
import type { CaseRecord } from "@/lib/cases";
import type { Coolness } from "@/lib/coolness";
import { CATEGORY_LABEL } from "@/lib/labels";

export type ForgottenEntry = {
  c: CaseRecord;
  coolness: Coolness;
  score: number;
};

export function ForgottenRanking({ entries }: { entries: ForgottenEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <section className="mb-10 rounded-lg border border-orange-300 bg-orange-50/60 p-5">
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-semibold text-orange-950">
            ⚠️ 本週最被遺忘的案件
          </h2>
          <p className="mt-1 text-xs text-orange-900/80">
            曾經沸騰、現已退燒、案件未結。每週由 GitHub Actions 重新計算。
          </p>
        </div>
      </header>
      <ol className="space-y-2">
        {entries.map((e, i) => (
          <li key={e.c.slug}>
            <Link
              href={`/cases/${e.c.slug}`}
              className="group flex items-baseline gap-3 rounded-md border border-rule bg-white px-4 py-3 no-underline transition hover:border-ink"
            >
              <span className="font-serif text-2xl font-semibold tabular-nums text-orange-700/70 group-hover:text-orange-800">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-serif text-base font-semibold text-ink group-hover:underline">
                    {e.c.shortTitle}
                  </span>
                  <span className="text-xs text-muted">
                    {CATEGORY_LABEL[e.c.category]}・{e.c.occurredAt}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ink/70">
                  退燒指數 {Math.round(e.coolness.recentRatio * 100)}%・
                  {e.coolness.description}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
