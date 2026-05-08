import Image from "next/image";
import Link from "next/link";
import type { CaseRecord } from "@/lib/cases";
import type { Coolness } from "@/lib/coolness";
import { CATEGORY_ICON } from "@/lib/icons";
import { CATEGORY_LABEL, STATUS_LABEL } from "@/lib/labels";
import { CoolnessBadge } from "./CoolnessBadge";

export function CaseCard({
  c,
  coolness,
}: {
  c: CaseRecord;
  coolness: Coolness;
}) {
  return (
    <Link
      href={`/cases/${c.slug}`}
      className="card-surface group block p-5 no-underline transition hover:border-ink/40 hover:bg-surfaceHi"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="pill">
            <Image
              src={CATEGORY_ICON[c.category]}
              alt=""
              width={14}
              height={14}
              className="opacity-70 invert"
            />
            {CATEGORY_LABEL[c.category]}
          </span>
          <span className="pill">{STATUS_LABEL[c.status]}</span>
        </div>
        <CoolnessBadge coolness={coolness} />
      </div>
      <h2 className="mt-3 font-serif text-lg font-semibold leading-snug text-ink group-hover:underline">
        {c.shortTitle}
      </h2>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/70">
        {c.summary}
      </p>
      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <span>發生：{c.occurredAt}</span>
        <span>更新：{c.lastUpdated}</span>
      </div>
    </Link>
  );
}
