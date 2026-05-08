#!/usr/bin/env node
// 抓 Google News RSS，依 newsKeyword 計算每週「加權報導頻率」，
// 併進 data/trends/<slug>.json 的 news 欄位。
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { weightOf } from "./lib/news-weights.mjs";

const CASES_DIR = path.join(process.cwd(), "content", "cases");
const OUT_DIR = path.join(process.cwd(), "data", "trends");
const WINDOW_DAYS = 730;

fs.mkdirSync(OUT_DIR, { recursive: true });

if (!fs.existsSync(CASES_DIR)) {
  console.log("[fetch-news] no cases yet; skip.");
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

async function fetchNewsRss(keyword) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    keyword
  )}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; FairCasesBot/1.0)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for News RSS`);
  return res.text();
}

function parseRssItems(xml) {
  const items = [];
  const reItem = /<item>([\s\S]*?)<\/item>/g;
  const rePubDate = /<pubDate>([\s\S]*?)<\/pubDate>/;
  const reSource = /<source[^>]*>([\s\S]*?)<\/source>/;
  let m;
  while ((m = reItem.exec(xml)) !== null) {
    const block = m[1];
    const dateMatch = block.match(rePubDate);
    const sourceMatch = block.match(reSource);
    if (!dateMatch || !sourceMatch) continue;
    items.push({
      pubDate: new Date(dateMatch[1].trim()).getTime(),
      source: sourceMatch[1].trim(),
    });
  }
  return items;
}

async function fetchWeightedByWeek(keyword, occurredAt) {
  const startMs = new Date(occurredAt).getTime();
  const endMs = startMs + WINDOW_DAYS * 86400000;
  const xml = await fetchNewsRss(keyword);
  const items = parseRssItems(xml);

  const buckets = new Map();
  let total = 0;
  let inWindow = 0;
  for (const it of items) {
    total++;
    if (it.pubDate < startMs || it.pubDate > endMs) continue;
    inWindow++;
    const wk = weekKey(new Date(it.pubDate));
    const w = weightOf(it.source);
    if (w === 0) continue;
    buckets.set(wk, (buckets.get(wk) ?? 0) + w);
  }

  return {
    points: [...buckets.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, score]) => ({ date, news: Math.round(score * 10) / 10 })),
    total,
    inWindow,
  };
}

function mergeSeries(existing, fresh) {
  const map = new Map();
  for (const p of existing) map.set(p.date, { ...p });
  for (const p of fresh) {
    const cur = map.get(p.date) ?? { date: p.date };
    cur.news = p.news;
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
  // newsKeyword preferred; fall back to trendsKeyword if missing
  const keyword = data.newsKeyword || data.trendsKeyword;
  const occurredAt = data.occurredAt;
  if (!keyword || !occurredAt) {
    console.log(`[fetch-news] skip ${slug}: missing keyword or occurredAt`);
    continue;
  }

  try {
    const { points, total, inWindow } = await fetchWeightedByWeek(
      keyword,
      occurredAt
    );
    const existing = loadExisting(slug);
    const merged = mergeSeries(existing, points);
    fs.writeFileSync(
      path.join(OUT_DIR, `${slug}.json`),
      JSON.stringify(merged, null, 2)
    );
    console.log(
      `✓ ${slug}: ${points.length} weekly buckets, ${inWindow}/${total} items in window (kw="${keyword}")`
    );
    ok++;
  } catch (e) {
    console.warn(`⚠ ${slug}: news unavailable (${e.message})`);
    fail++;
  }
  // gentle throttle
  await new Promise((r) => setTimeout(r, 1500));
}

console.log(`[fetch-news] done. ok=${ok} fail=${fail}`);
