#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const CASES_DIR = path.join(process.cwd(), "content", "cases");

const FORBIDDEN_PATTERNS = [
  { re: /兇手|殺人犯|犯罪者/, msg: "判決前定罪用語（兇手/殺人犯/犯罪者）" },
  {
    re: /(\S{1,4})姓(?:男童|女童|男學生|女學生|少年|少女)/,
    msg: "疑似揭露未成年當事人指稱方式 — 請改用「一名學生」等中性描述",
  },
];

const REQUIRED_FRONTMATTER = [
  "slug",
  "title",
  "shortTitle",
  "occurredAt",
  "category",
  "status",
  "summary",
  "keyQuestions",
  "sources",
  "timeline",
  "trendsKeyword",
  "pttKeyword",
  "lastUpdated",
];

if (!fs.existsSync(CASES_DIR)) {
  console.log("[lint-cases] no content/cases/ directory; skip.");
  process.exit(0);
}

let errors = 0;
const files = fs.readdirSync(CASES_DIR).filter((f) => f.endsWith(".mdx"));

for (const file of files) {
  const full = path.join(CASES_DIR, file);
  const raw = fs.readFileSync(full, "utf8");

  for (const key of REQUIRED_FRONTMATTER) {
    const re = new RegExp(`(^|\\n)${key}\\s*:`);
    if (!re.test(raw)) {
      console.error(`✖ ${file}: missing frontmatter "${key}"`);
      errors++;
    }
  }

  for (const { re, msg } of FORBIDDEN_PATTERNS) {
    const m = raw.match(re);
    if (m) {
      console.error(`✖ ${file}: ${msg} → "${m[0]}"`);
      errors++;
    }
  }
}

if (errors > 0) {
  console.error(`\n[lint-cases] ${errors} 個問題，請修正後再 build`);
  process.exit(1);
}
console.log(`[lint-cases] ${files.length} 個案件條目通過紅線檢查`);
