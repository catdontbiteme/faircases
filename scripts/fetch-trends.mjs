#!/usr/bin/env node
// 抓 Google Trends 熱度，產出 data/trends/<slug>.json
// 每個案件從 occurredAt 起 730 天的每週聚合資料
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import googleTrends from "google-trends-api";

const CASES_DIR = path.join(process.cwd(), "content", "cases");
const OUT_DIR = path.join(process.cwd(), "data", "trends");
const WINDOW_DAYS = 730;
const GEO = "TW";

fs.mkdirSync(OUT_DIR, { recursive: true });

if (!fs.existsSync(CASES_DIR)) {
  console.log("[fetch-trends] no cases yet; skip.");
  process.exit(0);
}

function loadExisting(slug) {
  const f = path.join(OUT_DIR, `${slug}.json`);
  if (!fs.existsSync(f)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(f, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function weekKey(d) {
  // ISO week: Monday-anchored YYYY-MM-DD
  const dt = new Date(d);
  const day = dt.getUTCDay() || 7;
  if (day !== 1) dt.setUTCDate(dt.getUTCDate() - (day - 1));
  return dt.toISOString().slice(0, 10);
}

async function fetchSeries(keyword, occurredAt) {
  const start = new Date(occurredAt);
  const end = new Date(start.getTime() + WINDOW_DAYS * 86400000);
  const now = new Date();
  const realEnd = end > now ? now : end;

  let parsed;
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const raw = await googleTrends.interestOverTime({
        keyword,
        startTime: start,
        endTime: realEnd,
        geo: GEO,
      });
      parsed = JSON.parse(raw);
      break;
    } catch (e) {
      lastErr = e;
      const wait = 4000 * attempt;
      console.warn(`  [trends retry ${attempt}/3] "${keyword}" — wait ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  if (!parsed) {
    throw new Error(`unparseable after retries: ${String(lastErr).slice(0, 120)}`);
  }
  const points = parsed?.default?.timelineData ?? [];
  // weekly aggregate
  const buckets = new Map();
  for (const p of points) {
    const ts = Number(p.time) * 1000;
    const wk = weekKey(new Date(ts));
    const v = Number(p.value?.[0] ?? 0);
    const cur = buckets.get(wk) ?? { sum: 0, n: 0 };
    cur.sum += v;
    cur.n += 1;
    buckets.set(wk, cur);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, { sum, n }]) => ({ date, trends: Math.round(sum / n) }));
}

function mergeSeries(existing, fresh) {
  // existing entries may already have ptt; preserve ptt, overwrite trends
  const map = new Map();
  for (const p of existing) map.set(p.date, { ...p });
  for (const p of fresh) {
    const cur = map.get(p.date) ?? { date: p.date };
    cur.trends = p.trends;
    map.set(p.date, cur);
  }
  return [...map.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
}

const files = fs.readdirSync(CASES_DIR).filter((f) => f.endsWith(".mdx"));
let ok = 0;
let fail = 0;

for (const file of files) {
  const slug = file.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(CASES_DIR, file), "utf8");
  const { data } = matter(raw);
  const keyword = data.trendsKeyword;
  const occurredAt = data.occurredAt;
  if (!keyword || !occurredAt) {
    console.log(`[fetch-trends] skip ${slug}: missing keyword or occurredAt`);
    continue;
  }

  try {
    const fresh = await fetchSeries(keyword, occurredAt);
    const existing = loadExisting(slug);
    const merged = mergeSeries(existing, fresh);
    fs.writeFileSync(
      path.join(OUT_DIR, `${slug}.json`),
      JSON.stringify(merged, null, 2)
    );
    console.log(`✓ ${slug}: ${fresh.length} weekly points (kw="${keyword}")`);
    ok++;
  } catch (e) {
    // Don't fail the run; preserve any existing data (e.g. ptt).
    // If this slug has no JSON yet, leave it absent so HeatCurve shows the empty state.
    console.warn(`⚠ ${slug}: trends unavailable (${e.message.split("\n")[0]}); keeping existing data if any`);
    fail++;
  }
  // Throttle to avoid rate-limit
  await new Promise((r) => setTimeout(r, 1500));
}

console.log(`[fetch-trends] done. ok=${ok} fail=${fail}`);
// Exit 0 even on partial failure — Google rate-limits some keywords intermittently;
// CI re-runs next week.
