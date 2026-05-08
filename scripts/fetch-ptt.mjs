#!/usr/bin/env node
// 爬 PTT Gossiping search，依 pttKeyword 計算每週提及次數，
// 併進 data/trends/<slug>.json 的 ptt 欄位。
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CASES_DIR = path.join(process.cwd(), "content", "cases");
const OUT_DIR = path.join(process.cwd(), "data", "trends");
const WINDOW_DAYS = 730;
const MAX_PAGES = 60; // safety net
const UA = "Mozilla/5.0 (compatible; FairCasesBot/1.0)";
const COOKIE = "over18=1";

fs.mkdirSync(OUT_DIR, { recursive: true });

if (!fs.existsSync(CASES_DIR)) {
  console.log("[fetch-ptt] no cases yet; skip.");
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

function weekKey(date) {
  const dt = new Date(date);
  const day = dt.getUTCDay() || 7;
  if (day !== 1) dt.setUTCDate(dt.getUTCDate() - (day - 1));
  return dt.toISOString().slice(0, 10);
}

async function fetchPage(keyword, page) {
  const url = `https://www.ptt.cc/bbs/Gossiping/search?q=${encodeURIComponent(
    keyword
  )}&page=${page}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Cookie: COOKIE },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function parsePostTimestamps(html) {
  // r-ent block contains <a href="/bbs/Gossiping/M.<unix>.A.xxx.html">
  const re = /\/bbs\/Gossiping\/M\.(\d{10})\.A\.[A-Z0-9]+\.html/g;
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    out.push(Number(m[1]) * 1000);
  }
  return out;
}

function findOldestPage(html) {
  // <a class="btn wide" href="/bbs/Gossiping/search?page=22&...">最舊</a>
  const m = html.match(/href="\/bbs\/Gossiping\/search\?page=(\d+)[^"]*">最舊/);
  return m ? Number(m[1]) : 1;
}

async function fetchMentionsByWeek(keyword, occurredAt) {
  const startMs = new Date(occurredAt).getTime();
  const endMs = startMs + WINDOW_DAYS * 86400000;
  const buckets = new Map();
  let totalSeen = 0;

  // PTT search returns latest first on page=1; "最舊" link gives last page number.
  // Strategy: start at last page (oldest), walk backwards to page 1.
  // Stop early if we exceed window end (newer than endMs) AND we've already covered the window.
  const firstPageHtml = await fetchPage(keyword, 1);
  const oldestPage = findOldestPage(firstPageHtml);
  const startPage = Math.min(oldestPage, MAX_PAGES);

  let stopReason = "exhausted";
  for (let p = startPage; p >= 1; p--) {
    const html = p === 1 ? firstPageHtml : await fetchPage(keyword, p);
    const ts = parsePostTimestamps(html);
    if (ts.length === 0) continue;
    let sawWithinWindow = false;
    let sawNewerThanWindow = false;
    for (const t of ts) {
      totalSeen++;
      if (t < startMs) continue; // before case occurred
      if (t > endMs) {
        sawNewerThanWindow = true;
        continue;
      }
      const wk = weekKey(new Date(t));
      buckets.set(wk, (buckets.get(wk) ?? 0) + 1);
      sawWithinWindow = true;
    }
    if (sawNewerThanWindow && !sawWithinWindow) {
      stopReason = `page ${p}: all newer than window`;
      break;
    }
    // gentle throttle
    if (p !== 1) await new Promise((r) => setTimeout(r, 600));
  }

  return {
    points: [...buckets.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, count]) => ({ date, ptt: count })),
    totalSeen,
    pagesScanned: Math.min(startPage, MAX_PAGES),
    stopReason,
  };
}

function mergeSeries(existing, fresh) {
  const map = new Map();
  for (const p of existing) map.set(p.date, { ...p });
  for (const p of fresh) {
    const cur = map.get(p.date) ?? { date: p.date };
    cur.ptt = p.ptt;
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
  const keyword = data.pttKeyword;
  const occurredAt = data.occurredAt;
  if (!keyword || !occurredAt) {
    console.log(`[fetch-ptt] skip ${slug}: missing pttKeyword or occurredAt`);
    continue;
  }

  try {
    const { points, totalSeen, pagesScanned, stopReason } =
      await fetchMentionsByWeek(keyword, occurredAt);
    const existing = loadExisting(slug);
    const merged = mergeSeries(existing, points);
    fs.writeFileSync(
      path.join(OUT_DIR, `${slug}.json`),
      JSON.stringify(merged, null, 2)
    );
    console.log(
      `✓ ${slug}: ${points.length} weekly buckets, ${totalSeen} posts seen across ${pagesScanned} page(s) [${stopReason}]`
    );
    ok++;
  } catch (e) {
    console.error(`✖ ${slug}: ${e.message}`);
    fail++;
  }
  // gentle throttle between cases
  await new Promise((r) => setTimeout(r, 1500));
}

console.log(`[fetch-ptt] done. ok=${ok} fail=${fail}`);
// partial-fail OK: keep going so the rest of the data pipeline (news) still runs.
