import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type CaseStatus =
  | "in-investigation"
  | "indicted"
  | "in-trial"
  | "sentenced"
  | "closed";

export type CaseCategory =
  | "violent-crime"
  | "police-line-of-duty"
  | "drunk-driving"
  | "bullying"
  | "data-leak"
  | "other";

export type CaseSource = {
  url: string;
  publisher: string;
  publishedAt: string;
  title: string;
};

export type CaseTimelineEntry = {
  date: string;
  label: string;
  sourceUrl?: string;
};

export type CaseNote = {
  title: string;
  body: string;
};

export type CaseControversy = {
  /** Short label of the disputed point. */
  point: string;
  /** Neutral one-line description of what's being argued. */
  detail: string;
};

export type CaseFrontmatter = {
  slug: string;
  title: string;
  shortTitle: string;
  occurredAt: string;
  category: CaseCategory;
  status: CaseStatus;
  summary: string;
  keyQuestions: string[];
  sources: CaseSource[];
  timeline: CaseTimelineEntry[];
  trendsKeyword: string;
  pttKeyword: string;
  lastUpdated: string;
  /** Optional sidebar items: related events / media spinoffs, not part of the main case timeline. */
  notes?: CaseNote[];
  /** Optional list of disputed points extracted from coverage — neutral framing, no judgment. */
  controversies?: CaseControversy[];
};

export type CaseRecord = CaseFrontmatter & {
  body: string;
};

const CASES_DIR = path.join(process.cwd(), "content", "cases");

function readCaseFile(file: string): CaseRecord {
  const filePath = path.join(CASES_DIR, file);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return { ...(data as CaseFrontmatter), body: content };
}

export function getAllCases(): CaseRecord[] {
  if (!fs.existsSync(CASES_DIR)) return [];
  const files = fs.readdirSync(CASES_DIR).filter((f) => f.endsWith(".mdx"));
  return files
    .map(readCaseFile)
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
}

export function getCaseBySlug(slug: string): CaseRecord | null {
  const file = `${slug}.mdx`;
  const filePath = path.join(CASES_DIR, file);
  if (!fs.existsSync(filePath)) return null;
  return readCaseFile(file);
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(CASES_DIR)) return [];
  return fs
    .readdirSync(CASES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}
