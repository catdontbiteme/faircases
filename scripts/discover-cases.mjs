#!/usr/bin/env node
// Phase 1: 候選案件發現引擎
//
// 流程：
//   1. PTT 八卦 + Google News 用「司法民怨」關鍵字掃 ~150 篇近期內容
//   2. 用 weightOf() 過濾掉低品質媒體 + 過短/過舊文章
//   3. 用 OpenAI GPT-4o-mini 對每篇做 STRICT JSON 篩選（4 個必要條件全過才算候選）
//   4. 通過的候選聚合成 `data/candidates/<slug>.json`，附摘要 + controversy 草稿 + 來源清單
//   5. 已存在於 content/cases/ 的不重複出
//   6. 已被人工 reject (data/candidates/_rejected.json) 的不再出現
//
// 輸出：data/candidates/*.json（列表頁吃這個目錄）
// 用法：node scripts/discover-cases.mjs
// 環境：OPENAI_API_KEY required

import fs from "node:fs";
import path from "node:path";
import { weightOf } from "./lib/news-weights.mjs";

const ROOT = process.cwd();
const CASES_DIR = path.join(ROOT, "content", "cases");
const CANDIDATES_DIR = path.join(ROOT, "data", "candidates");
const REJECTED_FILE = path.join(CANDIDATES_DIR, "_rejected.json");

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.error("[discover] OPENAI_API_KEY missing — abort.");
  process.exit(1);
}

fs.mkdirSync(CANDIDATES_DIR, { recursive: true });

// ────────────────────────────────────────────────────────────────────────────
// Source: PTT Gossiping recent posts with controversy keywords
// ────────────────────────────────────────────────────────────────────────────

const PTT_KEYWORDS = [
  "恐龍法官", "輕判", "不起訴", "家屬不滿", "教化可能", "心神喪失",
  "求償無門", "無罪定讞", "瘋狂"
];

async function fetchPtt(keyword) {
  const url = `https://www.ptt.cc/bbs/Gossiping/search?q=${encodeURIComponent(keyword)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; FairCasesBot/1.0)",
      Cookie: "over18=1",
    },
  });
  if (!res.ok) throw new Error(`PTT search HTTP ${res.status}`);
  const html = await res.text();
  const items = [];
  // crude regex: PTT search results have anchors of form /bbs/Gossiping/M.<ts>.A.<id>.html
  const re = /<div class="title">\s*<a href="(\/bbs\/Gossiping\/M\.\d{10}\.A\.[A-Z0-9]+\.html)">([^<]+)<\/a>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    items.push({
      source: "ptt",
      url: `https://www.ptt.cc${m[1]}`,
      title: m[2].trim(),
      keyword,
    });
  }
  return items;
}

// ────────────────────────────────────────────────────────────────────────────
// Source: Google News RSS with controversy keywords
// ────────────────────────────────────────────────────────────────────────────

const NEWS_KEYWORDS = [
  "恐龍法官", "輕判 家屬", "判決爭議 台灣", "求償無門 受害者",
  "教化可能 無罪", "不起訴 民怨"
];

async function fetchNews(keyword) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; FairCasesBot/1.0)" },
  });
  if (!res.ok) throw new Error(`News RSS HTTP ${res.status}`);
  const xml = await res.text();
  const items = [];
  const reItem = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = reItem.exec(xml)) !== null) {
    const block = m[1];
    const title = (block.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
    const link = (block.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || "";
    const source = (block.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1] || "";
    const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || "";
    if (!title || !link) continue;
    if (weightOf(source) < 1) continue; // drop tabloid/farm tier
    items.push({
      source: "news",
      url: link,
      title: stripCdata(title),
      publisher: stripCdata(source),
      publishedAt: pubDate,
      keyword,
    });
  }
  return items;
}

function stripCdata(s) {
  return s.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
}

// ────────────────────────────────────────────────────────────────────────────
// Existing case slugs + rejected slugs
// ────────────────────────────────────────────────────────────────────────────

function loadExistingSlugs() {
  if (!fs.existsSync(CASES_DIR)) return new Set();
  return new Set(
    fs.readdirSync(CASES_DIR)
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => f.replace(/\.mdx$/, ""))
  );
}

function loadRejected() {
  if (!fs.existsSync(REJECTED_FILE)) return new Set();
  try {
    const arr = JSON.parse(fs.readFileSync(REJECTED_FILE, "utf8"));
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Cluster: group items into candidate clusters by title similarity / shared person
// ────────────────────────────────────────────────────────────────────────────

function normalizeTitle(t) {
  return t.replace(/[「」『』《》【】〈〉()()\[\]<>"',，。、！？!?\s]+/g, "").toLowerCase();
}

function clusterItems(items) {
  // crude: cluster by 5-gram of normalized title overlap
  const clusters = [];
  for (const it of items) {
    const norm = normalizeTitle(it.title);
    let placed = false;
    for (const c of clusters) {
      // shared 4-char substring with any existing member → same cluster
      const cnorm = normalizeTitle(c.items[0].title);
      if (sharedNgram(norm, cnorm, 4)) {
        c.items.push(it);
        placed = true;
        break;
      }
    }
    if (!placed) clusters.push({ items: [it] });
  }
  return clusters
    .filter((c) => c.items.length >= 2 || (c.items.length === 1 && c.items[0].source === "news"))
    .sort((a, b) => b.items.length - a.items.length);
}

function sharedNgram(a, b, n) {
  if (a.length < n || b.length < n) return false;
  const set = new Set();
  for (let i = 0; i <= a.length - n; i++) set.add(a.slice(i, i + n));
  for (let i = 0; i <= b.length - n; i++) {
    if (set.has(b.slice(i, i + n))) return true;
  }
  return false;
}

// ────────────────────────────────────────────────────────────────────────────
// LLM filter (OpenAI GPT-4o-mini)
// ────────────────────────────────────────────────────────────────────────────

const SYSTEM = `你是台灣社會案件追蹤站「案件溫度計」的編輯助理。任務：審視一個媒體報導叢集，判斷是否值得收錄為「司法/制度爭議型」案件條目。

嚴格四條件，全部滿足才算 candidate：
1. is_taiwan: 案件發生於台灣
2. is_specific: 有具體當事人姓名或案發地點，不是泛論議題
3. has_controversy: 涉及司法判決爭議、制度漏洞、家屬不滿或公共利益討論（不是單純社會新聞）
4. has_2_sources: 此叢集中至少 2 篇來自不同主流媒體

嚴禁：
- 政治選舉、藝人八卦、純情感糾紛
- 國外案件
- 純犯罪通報無後續討論

輸出 JSON：
{
  "is_candidate": true/false,
  "reason": "30 字以內中文，說明 pass/fail",
  "slug_suggestion": "yyyy-keyword-keyword (kebab-case, 4-6 字)",
  "title": "案件溫度計式的標題（不含括號）",
  "short_title": "短稱 4-8 字",
  "summary_hint": "一段中文 50-100 字描述案件核心爭議",
  "controversy_hints": ["爭議點 1（10 字內）", "爭議點 2", "爭議點 3"]
}

slug_suggestion 為 false 時可留空字串。`;

async function llmJudgeCluster(cluster) {
  const titles = cluster.items.slice(0, 10).map((it, i) =>
    `[${i + 1}] (${it.source}${it.publisher ? "/" + it.publisher : ""}) ${it.title}`
  ).join("\n");

  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: `叢集標題（${cluster.items.length} 篇）：\n${titles}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("empty completion");
  return JSON.parse(content);
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("[discover] fetching PTT...");
  const pttItems = (
    await Promise.allSettled(PTT_KEYWORDS.map((k) => fetchPtt(k).catch(() => [])))
  ).flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  console.log(`  ptt: ${pttItems.length} items`);
  await sleep(1500);

  console.log("[discover] fetching Google News RSS...");
  const newsItems = (
    await Promise.allSettled(NEWS_KEYWORDS.map((k) => fetchNews(k).catch(() => [])))
  ).flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  console.log(`  news: ${newsItems.length} items`);

  const all = [...pttItems, ...newsItems];
  console.log(`[discover] ${all.length} raw items, clustering...`);

  // dedupe by URL first
  const seen = new Set();
  const unique = all.filter((it) => {
    if (seen.has(it.url)) return false;
    seen.add(it.url);
    return true;
  });

  const clusters = clusterItems(unique);
  console.log(`[discover] ${clusters.length} clusters (size ≥ 2 or news-only)`);

  const existingSlugs = loadExistingSlugs();
  const rejected = loadRejected();

  const candidates = [];
  let llmCalls = 0;
  for (const cluster of clusters.slice(0, 30)) {
    try {
      const verdict = await llmJudgeCluster(cluster);
      llmCalls++;
      if (!verdict.is_candidate) {
        console.log(`  ✖ skip: ${verdict.reason}`);
        continue;
      }
      const slug = (verdict.slug_suggestion || "").trim();
      if (!slug) continue;
      if (existingSlugs.has(slug)) {
        console.log(`  ↷ ${slug} already in content/cases, skip`);
        continue;
      }
      if (rejected.has(slug)) {
        console.log(`  ↷ ${slug} previously rejected, skip`);
        continue;
      }
      candidates.push({
        slug,
        title: verdict.title,
        shortTitle: verdict.short_title,
        summaryHint: verdict.summary_hint,
        controversyHints: verdict.controversy_hints || [],
        clusterReason: verdict.reason,
        sources: cluster.items.map((it) => ({
          source: it.source,
          url: it.url,
          title: it.title,
          publisher: it.publisher || null,
          publishedAt: it.publishedAt || null,
        })),
        discoveredAt: new Date().toISOString(),
      });
      console.log(`  ✓ candidate: ${slug} — ${verdict.title}`);
    } catch (e) {
      console.error(`  ! cluster judged failed:`, e.message);
    }
    await sleep(800);
  }

  for (const c of candidates) {
    const f = path.join(CANDIDATES_DIR, `${c.slug}.json`);
    fs.writeFileSync(f, JSON.stringify(c, null, 2));
  }

  console.log(`[discover] done. llm_calls=${llmCalls} new_candidates=${candidates.length}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((e) => {
  console.error("[discover] fatal:", e);
  process.exit(1);
});
