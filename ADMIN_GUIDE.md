# 案件溫度計｜後台與發現引擎使用說明

> 對象：站長本人（你）。
> 目的：讓「找案件 → 寫條目 → 上線」的流程從 90% 手工壓縮到 30% 手工。

---

## 0. 全貌（一張圖看懂）

```
┌─────────────────────────────────────────────────────────────┐
│  每週日 22:00 UTC（週一台灣 06:00）                          │
│  GitHub Actions 自動跑 `npm run discover`                    │
│  → PTT 八卦 + Google News RSS 用「司法民怨」關鍵字掃        │
│  → GPT-4o-mini 用四條件嚴格篩選                              │
│  → 通過的候選寫到 `data/candidates/<slug>.json` 並自動 push  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  你週一早上                                                  │
│  1. `git pull`                                               │
│  2. `npm run dev`                                            │
│  3. 瀏覽 http://localhost:3000/admin/candidates 用密碼登入   │
│  4. 對每個候選按 ✓ Approve 或 ✖ Reject                       │
│     - Approve → 自動 scaffold 草稿到 content/cases/<slug>.mdx │
│     - Reject  → 寫進 _rejected.json，下週不再出現            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Approve 後的 mdx 草稿有 TODO 欄位                           │
│  你只要：                                                    │
│  1. 點開來源連結讀一讀                                       │
│  2. 把 TODO 填齊（occurredAt / category / status / timeline）│
│  3. `npm run lint:cases` 檢查紅線                            │
│  4. `git commit` + `git push`                                │
│  5. `npm run fetch-data` 拉熱度                              │
│  6. `git commit` 熱度資料 + `git push`                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. 一次性設定

### 1.1 OpenAI API key

註冊 https://platform.openai.com → 建立 API key → 充值 ~US$5 應該夠你用一年（GPT-4o-mini 每週掃 30 個叢集 ≈ NT$0.5）。

把 key 加到兩個地方：

**本地** — `.env.local`（複製 `.env.example`）：
```
OPENAI_API_KEY=sk-...你的key
ADMIN_PASSWORD=你自己取一個密碼
```

**GitHub Actions** — repo 頁面 → Settings → Secrets and variables → Actions → New repository secret：
- Name: `OPENAI_API_KEY`
- Value: 同一把 key

`ADMIN_PASSWORD` 不需要設到 GitHub（admin 只在 local dev 用）。

### 1.2 啟動 admin 後台（local）

```bash
npm run dev
```

開瀏覽器到 http://localhost:3000/admin/candidates

第一次會被 redirect 到 `/admin/login`，輸入剛才的 `ADMIN_PASSWORD`。Cookie 8 小時有效。

> ⚠ Admin 後台**只在 local dev 啟用**。生產環境（Vercel）的 `/admin/*` 一律回 404。原因：Vercel 的檔案系統是唯讀的，approve 不能寫 mdx 檔。

---

## 2. 候選發現引擎（discover）

### 2.1 它在做什麼

`scripts/discover-cases.mjs`：

1. **抓 PTT 八卦**：用以下關鍵字逐一搜：
   `恐龍法官` / `輕判` / `不起訴` / `家屬不滿` / `教化可能` / `心神喪失` / `求償無門` / `無罪定讞` / `瘋狂`

2. **抓 Google News RSS**：
   `恐龍法官` / `輕判 家屬` / `判決爭議 台灣` / `求償無門 受害者` / `教化可能 無罪` / `不起訴 民怨`

3. **過濾**：
   - 用 `scripts/lib/news-weights.mjs` 把 0.5 分以下媒體（內容農場、八卦週刊）丟掉
   - URL 重複的去重
   - 標題 4-gram overlap 把同案不同篇聚成一個 cluster

4. **GPT-4o-mini 嚴格四條件篩**：
   - **is_taiwan**：案件發生於台灣
   - **is_specific**：有具體當事人姓名或案發地點
   - **has_controversy**：涉及司法判決爭議、制度漏洞、家屬不滿或公共利益討論
   - **has_2_sources**：cluster 至少 2 篇來自不同主流媒體

   全部滿足才算 candidate。

5. **寫到 `data/candidates/<slug>.json`**，附摘要 + 3 個 controversy 草稿 + 來源清單。

6. **跳過已存在於 `content/cases/` 的 slug**，跳過 `_rejected.json` 裡的 slug。

### 2.2 手動跑

```bash
npm run discover
```

預期輸出：

```
[discover] fetching PTT...
  ptt: 87 items
[discover] fetching Google News RSS...
  news: 64 items
[discover] 142 raw items, clustering...
[discover] 23 clusters (size ≥ 2 or news-only)
  ✖ skip: 國外案件、非台灣
  ✖ skip: 政治新聞，不符
  ↷ 2025-sanxia-pedestrian-crash already in content/cases, skip
  ✓ candidate: 2025-xxx-yyy — 某某案件全名
  ...
[discover] done. llm_calls=18 new_candidates=4
```

### 2.3 GitHub Actions 自動跑

`.github/workflows/discover-candidates.yml`：

- 排程：每週日 22:00 UTC（週一台灣 06:00）
- 也支援手動觸發（**Actions → Weekly candidate discovery → Run workflow**）
- 跑完自動 commit `data/candidates/` + push

**第一次部署**：

1. 確認 repo secrets 已加 `OPENAI_API_KEY`
2. 到 Actions → Weekly candidate discovery → Run workflow，手動觸發一次
3. 等 ~2 分鐘，看是否成功
4. `git pull` 把它產的候選拉下來

---

## 3. Admin 後台

### 3.1 登入

`/admin/login` → 輸入 `ADMIN_PASSWORD` → cookie 8 小時 → 自動跳轉到 `/admin/candidates`。

密碼錯誤會顯示「密碼錯誤」紅色警告，可重試。

### 3.2 候選列表

`/admin/candidates` 顯示所有 `data/candidates/*.json`，按發現時間倒序。每張卡片有：

- **標題**：LLM 建議的案件全名
- **slug**：建議檔名（kebab-case）
- **來源數**：cluster 內幾篇報導
- **summary hint**：50-100 字案件核心
- **controversy hints**：3 條爭議點草稿（10 字內）
- **展開來源**：點「▸ 展開來源」看每篇的標題、媒體、URL

### 3.3 Approve

按 **✓ Approve**：

1. 自動產生 `content/cases/<slug>.mdx`，frontmatter 預填：
   - `slug` / `title` / `shortTitle` / `summary` ← LLM 提供
   - `controversies[]` ← LLM 提供 3 條
   - `sources[]` ← cluster 中的 news 來源（PTT 不算 source）
2. 留下 TODO 欄位讓你填：
   - `occurredAt`（從報導查）
   - `category`（從現有 6 類選）
   - `status`（偵查中 / 已起訴 / 審理中 / 已判決 / 結案）
   - `timeline[]`（自己整理）
   - `keyQuestions[]`（最少 2 條）
   - `trendsKeyword` / `pttKeyword` / `newsKeyword`（拉熱度用的關鍵字）
3. 把候選 JSON 從 `data/candidates/` 刪除（已轉成 mdx）

### 3.4 Reject

按 **✖ Reject**：

1. 把 slug 加到 `data/candidates/_rejected.json`
2. 刪掉候選 JSON
3. 下週 discover 不會再出現

> 一旦 reject 是不可逆的（會進入永久黑名單）。如果你只是「這週沒空寫」，請保留候選不動，下週再決定。

### 3.5 路由總覽

| 路徑 | 功能 |
|------|------|
| `/admin/login` | 密碼登入 |
| `/admin/candidates` | 候選列表 |
| `POST /admin/candidates/[slug]/approve` | scaffold mdx 草稿（前端按鈕觸發） |
| `POST /admin/candidates/[slug]/reject` | 加入黑名單（前端按鈕觸發） |

---

## 4. Approve 之後：把 TODO 草稿補完

### 4.1 草稿長這樣

`content/cases/<slug>.mdx`：

```yaml
---
slug: 2025-some-case
title: 某某案件全名
shortTitle: 某某案
occurredAt: "TODO"
category: TODO
status: TODO
summary: 案件核心 50-100 字描述...
keyQuestions:
  - TODO 問題 1
  - TODO 問題 2
controversies:
  - point: 爭議點 1
    detail: TODO — 在報導中找對應段落，30-80 字中性描述。
  - point: 爭議點 2
    detail: TODO — ...
sources:
  - url: https://...
    publisher: 某某媒體
    publishedAt: "2025-xx-xx"
    title: 報導標題
timeline:
  - date: "TODO"
    label: TODO 案發描述
trendsKeyword: "TODO"
pttKeyword: "TODO"
newsKeyword: "TODO"
lastUpdated: "2026-05-08"
---

> 本條目由 admin candidate scaffold 產生於 2026-05-08。請填齊所有 TODO 欄位後再 push。
```

### 4.2 你要做的 6 件事

1. **occurredAt** — 看任一篇報導的「案發於」段落，寫 `"YYYY-MM-DD"`
2. **category** — 從這 6 個選一個：
   - `violent-crime`（暴力犯罪）
   - `police-line-of-duty`（警消殉職）
   - `drunk-driving`（酒駕致死）
   - `bullying`（霸凌）
   - `data-leak`（個資外洩）
   - `other`（其他）
3. **status** — 看案件目前進度：
   - `in-investigation`（偵查中）
   - `indicted`（已起訴）
   - `in-trial`（審理中）
   - `sentenced`（已判決）
   - `closed`（結案）
4. **timeline[]** — 至少 3 條：案發 / 重大進展 / 最近動態。每條 `date` + `label` + 可選 `sourceUrl`
5. **keyQuestions[]** — 至少 2 條讀者會想知道但目前沒答案的問題
6. **trendsKeyword / pttKeyword / newsKeyword** — 拉熱度用的關鍵字。注意：
   - **trendsKeyword**：1-3 詞，避免太泛（如「車禍」）。例：「李承翰」「金錢豹 酒駕」
   - **pttKeyword**：PTT 搜尋不支援多詞 AND，用單一最關鍵的詞。例：「金錢豹」「李承翰」
   - **newsKeyword**：可多詞，Google News RSS 會 AND 處理。例：「李承翰 鐵路警察」

### 4.3 controversies 詳細寫作要點

LLM 給的 hint 通常只有 10 字左右（「精神鑑定爭議」），你需要展開成 30-80 字中性描述：

> ❌ 太短：「精神鑑定爭議」
> ✅ 適合：「一審依精神鑑定報告判無罪，二審改判 17 年；同份事實得出截然相反結論，凸顯思覺失調症之刑事責任認定灰色地帶」

注意：**爭議點要是「事實上有人在吵的點」，不是你個人的看法**。如果報導沒提爭議，就刪掉那個 controversy。

### 4.4 lint 檢查紅線

```bash
npm run lint:cases
```

會擋下：
- 未滿 18 歲當事人寫姓名 / 學校 / 班級
- 偵查中案件出現定罪用語（「兇手」「殺人犯」）
- 出現「男童」「女童」「少年」「少女」（兒少法地雷詞）

過了才能 push。

---

## 5. 完整 push 流程（每件案）

```bash
# 1. 跑紅線檢查
npm run lint:cases
# > [lint-cases] N 個案件條目通過紅線檢查

# 2. build verify
npm run build
# > Compiled successfully

# 3. commit + push 案件 mdx
git add content/cases/<slug>.mdx
git commit -m "feat: add YYYY 案件名"
git push

# 4. 跑熱度（trends + ptt + news）
npm run fetch-data

# 5. commit + push 熱度資料
git add data/trends/
git commit -m "feat: refresh heat data for N cases"
git push
```

> 為什麼分兩個 commit？因為 case mdx 是內容（你寫的），熱度資料是抓的（機器產的）。分開 commit 在 git history 看比較清楚誰是誰。

---

## 6. 常見狀況

### 6.1 discover 跑出來 0 個候選

可能原因：
- LLM 嚴格篩太嚴（沒有 cluster 同時滿足 4 條件）
- PTT/News 那週剛好沒有司法民怨新聞（罕見）
- 都已經是已存在或 rejected 的案件

**處理**：等下週再跑。或在 `scripts/discover-cases.mjs` 的 `PTT_KEYWORDS` / `NEWS_KEYWORDS` 加新關鍵字。

### 6.2 discover 跑壞了 / OpenAI API 報錯

```
[discover] OPENAI_API_KEY missing — abort.
```
→ 設環境變數，見 §1.1

```
OpenAI HTTP 401: ...
```
→ API key 失效或拼錯

```
OpenAI HTTP 429: ...
```
→ rate limit，等 1 分鐘再跑

### 6.3 Approve 後沒看到 mdx 檔

通常是因為 `content/cases/<slug>.mdx` 已經存在（HTTP 409）。檢查 admin UI 的 alert 訊息。

如果你想覆蓋現有檔案，先手動刪掉 `content/cases/<slug>.mdx`，再回 admin 點 Approve。

### 6.4 我想看上週 reject 過哪些案件

```bash
cat data/candidates/_rejected.json
```

是個 slug 字串陣列。要把某個 slug 「平反」就手動從這個檔刪掉那行。

### 6.5 admin login 一直跳回 login

通常是 cookie 沒設成功。檢查：
1. 瀏覽器允許 localhost cookies
2. `.env.local` 有 `ADMIN_PASSWORD=...`
3. 重啟 `npm run dev`（修改 env 後一定要重啟）

### 6.6 Threads 來源什麼時候支援

目前不支援。Threads 沒有公開 API + 沒有 RSS，要爬蟲面對 Meta 風控。等案件量做大、有預算搞 Threads API 申請或穩定的反爬蟲方案再加。

---

## 7. 成本與限制

### 7.1 OpenAI 費用

- GPT-4o-mini：input ~$0.15/M tokens，output ~$0.60/M tokens
- 每週掃 ~30 個 cluster × 平均 500 input + 200 output tokens ≈ NT$0.5
- 一年總成本 ~NT$25

### 7.2 PTT 限制

- PTT 搜尋頁 rate-limit 嚴格，腳本內已加 throttle
- 搜尋結果只往前翻 ~25 頁、約 500 篇
- **舊案件（>1 年）的 PTT 樣本會稀疏**，這是來源限制

### 7.3 Google News RSS 限制

- 偶爾被 Google 風控回 HTML（驗證頁）— 腳本內已 retry+backoff
- 不阻擋整批：一個關鍵字壞了，其他繼續

### 7.4 LLM 嚴格篩的副作用

「嚴格」表示**寧可漏抓也不亂抓**。你可能漏掉一些值得寫的案件，特別是：
- 標題寫得很委婉的（LLM 看標題判斷不出爭議）
- 只在地方版報導的（cluster 不到 2 篇大媒體）

如果你發現某類案件常常漏抓，告訴我，我可以調 prompt 或加新關鍵字。

---

## 8. 把這份指南匯出成 PDF

VS Code 上：

1. 安裝 [Markdown PDF](https://marketplace.visualstudio.com/items?itemName=yzane.markdown-pdf) 擴充套件
2. 開啟 `ADMIN_GUIDE.md`
3. 右鍵 → **Markdown PDF: Export (pdf)**
4. PDF 會在同目錄產出 `ADMIN_GUIDE.pdf`

不用重灌 puppeteer，也不用裝 wkhtmltopdf。

---

## 9. 改動這份文件後

如果你改了流程（加新 source、換 LLM、改 admin UI），記得回來更新這份。建議改完後：

```bash
git add ADMIN_GUIDE.md
git commit -m "docs: update admin guide for X"
git push
```

文件 rot 比 code rot 更難察覺。
