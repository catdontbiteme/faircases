"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Candidate } from "@/lib/candidates";

type Props = { candidate: Candidate };

export function CandidateCard({ candidate: c }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const act = (action: "approve" | "reject") => {
    startTransition(async () => {
      const res = await fetch(`/admin/candidates/${c.slug}/${action}`, {
        method: "POST",
      });
      if (!res.ok) {
        alert(`${action} 失敗：${await res.text()}`);
        return;
      }
      router.refresh();
    });
  };

  return (
    <article className="rounded-md border border-rule bg-surface p-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg font-semibold leading-tight">
            {c.title}
          </h2>
          <p className="mt-1 text-xs text-muted">
            slug: <code className="text-ink/80">{c.slug}</code> · {c.sources.length} 來源
            · 發現於 {new Date(c.discoveredAt).toLocaleString("zh-TW")}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => act("approve")}
            disabled={pending}
            className="rounded-md border border-rule bg-surfaceHi px-3 py-1.5 text-sm hover:border-ink disabled:opacity-50"
          >
            ✓ Approve
          </button>
          <button
            type="button"
            onClick={() => act("reject")}
            disabled={pending}
            className="rounded-md border border-rule px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-accent disabled:opacity-50"
          >
            ✖ Reject
          </button>
        </div>
      </header>

      <p className="mt-3 text-sm leading-relaxed text-ink/85">{c.summaryHint}</p>

      {c.controversyHints.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm text-ink/80">
          {c.controversyHints.map((h, i) => (
            <li key={i}>• {h}</li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-3 text-xs text-muted hover:text-ink"
      >
        {open ? "▾ 收起來源" : `▸ 展開來源 (${c.sources.length})`}
      </button>

      {open && (
        <ul className="mt-2 space-y-1 text-xs text-ink/70">
          {c.sources.map((s, i) => (
            <li key={i}>
              <span className="mr-2 inline-block w-10 text-muted">[{s.source}]</span>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink"
              >
                {s.title}
              </a>
              {s.publisher && (
                <span className="ml-2 text-muted">— {s.publisher}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
