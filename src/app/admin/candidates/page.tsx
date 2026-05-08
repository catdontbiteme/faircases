import { listCandidates } from "@/lib/candidates";
import { CandidateCard } from "./CandidateCard";

export const dynamic = "force-dynamic";

export default function CandidatesPage() {
  const candidates = listCandidates();

  return (
    <div className="container-prose py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">候選案件</h1>
          <p className="mt-1 text-sm text-muted">
            由 <code className="text-ink/80">scripts/discover-cases.mjs</code> 自動發現。Approve 會 scaffold mdx 草稿到{" "}
            <code className="text-ink/80">content/cases/</code>，你再 review + push。
          </p>
        </div>
        <span className="text-sm text-muted">{candidates.length} 件</span>
      </div>

      {candidates.length === 0 ? (
        <div className="rounded-md border border-dashed border-rule bg-surface p-8 text-center text-sm text-muted">
          目前沒有待審候選。執行 <code className="text-ink/80">npm run discover</code> 重新掃描。
        </div>
      ) : (
        <ul className="space-y-4">
          {candidates.map((c) => (
            <li key={c.slug}>
              <CandidateCard candidate={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
