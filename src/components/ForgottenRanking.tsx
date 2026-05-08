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
    <section className="mb-10 rounded-lg border-l-2 border-accent bg-surface/60 p-5">
      <header className="mb-4">
        <h2 className="font-serif text-xl font-semibold text-ink">
          ⚠ 本週最被遺忘的案件
        </h2>
        <p className="mt-1 text-xs text-muted">
          曾經沸騰、現已退燒、案件未結。每週由 GitHub Actions 重新計算。
        </p>
      </header>
      <ol className="space-y-2">
        {entries.map((e, i) => (
          <li key={e.c.slug}>
            <Link
              href={`/cases/${e.c.slug}`}
              className="card-surface group flex items-baseline gap-3 px-4 py-3 no-underline transition hover:border-ink/40 hover:bg-surfaceHi"
            >
              <span className="font-serif text-2xl font-semibold tabular-nums text-accent/70 group-hover:text-accent">
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
