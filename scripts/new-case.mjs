#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const CATEGORIES = {
  "1": ["violent-crime", "暴力犯罪"],
  "2": ["police-line-of-duty", "警消殉職"],
  "3": ["bullying", "霸凌"],
  "4": ["data-leak", "個資外洩"],
  "5": ["other", "其他"],
};

const STATUSES = {
  "1": ["in-investigation", "偵查中"],
  "2": ["indicted", "已起訴"],
  "3": ["in-trial", "審理中"],
  "4": ["sentenced", "已判決"],
  "5": ["closed", "結案"],
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function pickFromMap(map) {
  return Object.entries(map)
    .map(([k, [, label]]) => `  ${k}) ${label}`)
    .join("\n");
}

function makePrompter() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });
  const queue = [];
  let resolveCurrent = null;

  rl.on("line", (line) => {
    if (resolveCurrent) {
      const r = resolveCurrent;
      resolveCurrent = null;
      r(line);
    } else {
      queue.push(line);
    }
  });

  rl.on("close", () => {
    if (resolveCurrent) resolveCurrent(null);
  });

  return {
    ask(prompt, fallback = "") {
      process.stdout.write(prompt);
      return new Promise((resolve) => {
        if (queue.length > 0) {
          const line = queue.shift();
          resolve((line ?? "").trim() || fallback);
        } else {
          resolveCurrent = (line) => {
            resolve((line ?? "").trim() || fallback);
          };
        }
      });
    },
    close() {
      rl.close();
    },
  };
}

async function main() {
  console.log("\n=== 新增案件條目 ===\n");
  console.log("⚠️ 紅線提醒：");
  console.log("  • 未滿 18 歲不揭露任何可辨識資訊");
  console.log("  • 判決前一律以代稱（A 男 / 王姓男子）");
  console.log("  • 事實必須附主流媒體 URL");
  console.log("  • 不下定論、不寫評論\n");

  const p = makePrompter();

  const slug = await p.ask("Slug（例：2024-tainan-policewoman）：");
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    console.error("✖ slug 必須為小寫英數與連字號");
    p.close();
    process.exit(1);
  }
  const filePath = path.join(process.cwd(), "content", "cases", `${slug}.mdx`);
  if (fs.existsSync(filePath)) {
    console.error(`✖ ${slug}.mdx 已存在`);
    p.close();
    process.exit(1);
  }

  const title = await p.ask("完整標題：");
  const shortTitle = await p.ask("短標題（卡片用，預設＝完整標題）：", title);
  const occurredAt = await p.ask("發生日期 YYYY-MM-DD：");

  console.log("\n類別：\n" + pickFromMap(CATEGORIES));
  const catIdx = await p.ask("選擇 (1-5)：", "5");
  const category = (CATEGORIES[catIdx] ?? CATEGORIES["5"])[0];

  console.log("\n狀態：\n" + pickFromMap(STATUSES));
  const stIdx = await p.ask("選擇 (1-5)：", "1");
  const status = (STATUSES[stIdx] ?? STATUSES["1"])[0];

  const summary = await p.ask("一段中性摘要：\n> ");
  const trendsKeyword = await p.ask("Google Trends 關鍵詞：");
  const pttKeyword = await p.ask("PTT 關鍵詞：");

  p.close();

  const tpl = `---
slug: ${slug}
title: ${title}
shortTitle: ${shortTitle}
occurredAt: "${occurredAt}"
category: ${category}
status: ${status}
summary: ${summary}
keyQuestions:
  - 嫌犯刑事責任認定進度為何？
  - 相關法規/政策是否跟進？
  - 官方當時承諾的改善是否完成？
sources:
  - url: https://example.com
    publisher: 中央社
    publishedAt: "${occurredAt}"
    title: 待補：來源標題
timeline:
  - date: "${occurredAt}"
    label: 案件發生（待補敘述）
trendsKeyword: "${trendsKeyword}"
pttKeyword: "${pttKeyword}"
lastUpdated: "${todayISO()}"
---

> 本條目所有當事人以代稱描述。內容僅整理已公開報導，不對事實作獨立認定。
`;

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, tpl, "utf8");
  console.log(`\n✓ 已建立 content/cases/${slug}.mdx`);
  console.log("\n下一步：");
  console.log("  1. 編輯該檔，把 sources 換成真實主流媒體 URL");
  console.log("  2. 把 timeline 補完（每筆事件配對一個 source）");
  console.log("  3. 跑 npm run lint:cases 過紅線檢查");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
