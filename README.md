# 案件溫度計｜FairCases

> 台灣社會案件後續追蹤站。整理已公開報導，呈現「事件時間軸」與「公眾關注熱度」。

當新聞退燒，後續沒人追的時候，這裡是讀者回來找答案的地方：那個案子判了沒？立法跟進了嗎？官員說的改革做了嗎？

## 為什麼

一件社會案件爆出來，新聞關注度通常 7–14 天就掉九成。本站用 Google Trends + PTT 八卦版提及曲線量化「退燒程度」，把「**已退燒但未結案**」的「冷案警報」放在首頁最前面。

**主軸**：不被遺忘 — 不是煽情、不是復仇，是讓還沒得到答案的案件繼續被看見。

## 編輯紅線（CRITICAL）

1. 兒少法第 69 條：未滿 18 歲不揭露姓名/照片/學校/班級/住所/親屬
2. 偵查不公開：偵查中只引官方公開說明
3. 判決前一律以代稱（A 男、王姓男子）
4. 不主動揭露被害人姓名照片
5. 事實附引用 URL，僅引主流媒體與政府公開資訊
6. 不下定論、不做事實認定

完整方針見網站 [`/about`](src/app/about/page.tsx) 與 [CONTENT_GUIDE.md](CONTENT_GUIDE.md)。

## 技術棧

- Next.js 15 App Router · TypeScript · Tailwind 3
- 內容即檔案：`content/cases/*.mdx` + `gray-matter`
- 熱度資料：`google-trends-api` + PTT 搜尋頁爬蟲，每週由 GitHub Actions 自動更新
- 部署：Vercel hobby

## 開發

```bash
npm install
npm run dev          # http://localhost:3000
npm run lint:cases   # 紅線檢查
npm run new-case     # 互動式新增案件骨架
npm run fetch-data   # 拉 Google Trends + PTT
npm run build        # 靜態產出
```

新增案件流程見 [CONTENT_GUIDE.md](CONTENT_GUIDE.md)。

## 部署

見 [DEPLOY.md](DEPLOY.md) — 從零到 Vercel + Google Search Console 完整指南。

## 授權

程式碼：MIT（見 [LICENSE](LICENSE)）
案件條目（`content/cases/`）：編輯內容，**非** MIT 授權，轉載請先聯絡。

## 貢獻 / 回報

- **資訊有誤**：每個案件頁底都有「回報這個案件的錯誤」mailto
- **新案件提案 / 程式 PR**：歡迎開 issue
