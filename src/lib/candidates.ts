import fs from "node:fs";
import path from "node:path";

export type CandidateSource = {
  source: "ptt" | "news";
  url: string;
  title: string;
  publisher: string | null;
  publishedAt: string | null;
};

export type Candidate = {
  slug: string;
  title: string;
  shortTitle: string;
  summaryHint: string;
  controversyHints: string[];
  clusterReason: string;
  sources: CandidateSource[];
  discoveredAt: string;
};

const CANDIDATES_DIR = path.join(process.cwd(), "data", "candidates");

export function listCandidates(): Candidate[] {
  if (!fs.existsSync(CANDIDATES_DIR)) return [];
  return fs
    .readdirSync(CANDIDATES_DIR)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(CANDIDATES_DIR, f), "utf8");
      return JSON.parse(raw) as Candidate;
    })
    .sort(
      (a, b) =>
        new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime()
    );
}

export function getCandidate(slug: string): Candidate | null {
  const f = path.join(CANDIDATES_DIR, `${slug}.json`);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, "utf8")) as Candidate;
}

export function deleteCandidate(slug: string): void {
  const f = path.join(CANDIDATES_DIR, `${slug}.json`);
  if (fs.existsSync(f)) fs.unlinkSync(f);
}

export function recordRejection(slug: string): void {
  const f = path.join(CANDIDATES_DIR, "_rejected.json");
  let arr: string[] = [];
  if (fs.existsSync(f)) {
    try {
      const data = JSON.parse(fs.readFileSync(f, "utf8"));
      if (Array.isArray(data)) arr = data;
    } catch {
      arr = [];
    }
  }
  if (!arr.includes(slug)) arr.push(slug);
  fs.writeFileSync(f, JSON.stringify(arr, null, 2));
}
