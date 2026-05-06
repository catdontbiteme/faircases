import type { CaseTimelineEntry } from "@/lib/cases";

export function Timeline({ entries }: { entries: CaseTimelineEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <ol className="relative ml-3 border-l border-rule pl-5">
      {entries.map((e, i) => (
        <li key={i} className="relative pb-5 last:pb-0">
          <span className="absolute -left-[26px] top-1 inline-block h-2.5 w-2.5 rounded-full border border-ink bg-paper" />
          <div className="text-xs uppercase tracking-wide text-muted">
            {e.date}
          </div>
          <div className="mt-1 text-sm leading-relaxed">
            {e.label}
            {e.sourceUrl && (
              <>
                {" "}
                <a
                  href={e.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  ↗
                </a>
              </>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
