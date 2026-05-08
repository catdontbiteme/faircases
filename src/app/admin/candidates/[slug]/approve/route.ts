import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCandidate, deleteCandidate } from "@/lib/candidates";

const CASES_DIR = path.join(process.cwd(), "content", "cases");

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("disabled in production", { status: 404 });
  }
  const { slug } = await params;
  const c = getCandidate(slug);
  if (!c) return new NextResponse("candidate not found", { status: 404 });

  const target = path.join(CASES_DIR, `${slug}.mdx`);
  if (fs.existsSync(target)) {
    return new NextResponse(`${slug}.mdx already exists`, { status: 409 });
  }

  fs.mkdirSync(CASES_DIR, { recursive: true });
  fs.writeFileSync(target, scaffoldMdx(c));
  deleteCandidate(slug);

  return NextResponse.json({ ok: true, scaffoldedAt: target });
}

function scaffoldMdx(c: ReturnType<typeof getCandidate>): string {
  if (!c) throw new Error("nullish candidate");

  const today = new Date().toISOString().slice(0, 10);

  const sourcesYaml = c.sources
    .filter((s) => s.source === "news") // PTT 不算 source；只列主流媒體
    .map(
      (s) =>
        `  - url: ${s.url}\n    publisher: ${s.publisher || "TODO"}\n    publishedAt: "${
          s.publishedAt ? formatDate(s.publishedAt) : "TODO"
        }"\n    title: ${escapeYaml(s.title)}`
    )
    .join("\n");

  const controversiesYaml = c.controversyHints
    .map(
      (h) =>
        `  - point: ${escapeYaml(h)}\n    detail: TODO — 在報導中找對應段落，30-80 字中性描述。`
    )
    .join("\n");

  return `---
slug: ${c.slug}
title: ${escapeYaml(c.title)}
shortTitle: ${escapeYaml(c.shortTitle)}
occurredAt: "TODO"
category: TODO
status: TODO
summary: ${escapeYaml(c.summaryHint)}
keyQuestions:
  - TODO 問題 1
  - TODO 問題 2
controversies:
${controversiesYaml || "  - point: TODO\n    detail: TODO"}
sources:
${sourcesYaml || "  - url: TODO\n    publisher: TODO\n    publishedAt: \"TODO\"\n    title: TODO"}
timeline:
  - date: "TODO"
    label: TODO 案發描述
trendsKeyword: "TODO"
pttKeyword: "TODO"
newsKeyword: "TODO"
lastUpdated: "${today}"
---

> 本條目由 admin candidate scaffold 產生於 ${today}。請填齊所有 TODO 欄位後再 push。
> 自動發現備註：${c.clusterReason}
`;
}

function escapeYaml(s: string): string {
  // simple: wrap in quotes if contains : or starts with - or "
  if (/[:#&*?!|>'"%@`{}\[\]]/.test(s) || /^[\s-]/.test(s)) {
    return `"${s.replace(/"/g, '\\"')}"`;
  }
  return s;
}

function formatDate(isoOrRfc: string): string {
  const d = new Date(isoOrRfc);
  if (isNaN(d.getTime())) return "TODO";
  return d.toISOString().slice(0, 10);
}
