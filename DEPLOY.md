# 部署步驟（Phase 3）

從零到上線約 30–45 分鐘。**全部在瀏覽器點擊完成**，不需 CLI。

---

## A. 申請專用聯絡 email（5 分鐘）

決定：免費 Gmail 別名 / 申請新 Gmail / 自有網域 email

最快做法：免費 Gmail 別名
1. 用既有 Gmail，前往 https://gmail.com → 設定 → 帳戶 → 新增其他電子郵件地址
2. 或直接用 `meifengasst+faircases@gmail.com` — 寄到這個地址會自動進你的主信箱、且**寄件人能看出他寄到了哪個別名**，方便分流

或新註冊一個 Gmail（推薦：`faircases.tw@gmail.com` 或類似），純粹這個專案用。

決定後把 email 填進下一步 Vercel 環境變數。

---

## B. 建 GitHub repo 並推上去（10 分鐘）

### 1. 在 GitHub 建 repo
- 前往 https://github.com/new
- Repository name: `faircases`
- 描述：`案件溫度計 — 台灣社會案件後續追蹤`
- 設定為 **Public**
- **不要** 勾「Add a README」、「Add .gitignore」、「Choose a license」（本機已有）
- 按 Create repository

### 2. 把專案推上去（複製 GitHub 給你的指令貼進 PowerShell）
GitHub 建完 repo 後會給三段指令，第二段「…or push an existing repository from the command line」就是要的。範例（替換 `<YOUR_USERNAME>`）：

```powershell
cd D:\app\FairCases
git init
git add .
git commit -m "feat: initial public release"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/faircases.git
git push -u origin main
```

如果 push 跳出登入提示：用 GitHub 帳號 + 一個 personal access token（不是密碼）。沒設過 token 走 https://github.com/settings/tokens → Generate new token (classic) → 勾 `repo` 即可。

---

## C. 部署到 Vercel（10 分鐘）

### 1. 登入 Vercel
- 前往 https://vercel.com
- 用 GitHub 帳號登入（會自動拿到你的 repo 權限）

### 2. Import 專案
- 首頁右上 → Add New → Project
- 找到剛剛推的 `faircases` repo → Import
- Framework Preset: **Next.js**（自動偵測）
- Root Directory: `./`（預設）
- Build Command / Output：保持預設

### 3. 設定環境變數（**重要**）
在 Import 頁面下方有 `Environment Variables` 區塊，先填：

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SITE_URL` | `https://faircases.vercel.app`（如果這名字被搶就用 Vercel 給你的） |
| `NEXT_PUBLIC_CONTACT_EMAIL` | （步驟 A 決定的 email） |

> 第一次部署你還不知道 Vercel 會給你什麼網址。**先填一個猜的**（例如 faircases.vercel.app），部署完後到 Settings → Domains 看實際網址，回來修這個變數，然後 Redeploy。

### 4. 按 Deploy
等 1–2 分鐘 build 完。成功後給你網址（通常 `faircases-<random>.vercel.app`）。

### 5. 修正 NEXT_PUBLIC_SITE_URL
- Project → Settings → Environment Variables → 編輯 `NEXT_PUBLIC_SITE_URL` 為實際網址
- Project → Deployments → 最新一筆右側 ⋮ → Redeploy（不勾 Build Cache）

### 6. 驗證
- 網址直接打 `https://<你的>.vercel.app/sitemap.xml` → 應該看到 XML 列表
- `https://<你的>.vercel.app/robots.txt` → 應該看到 sitemap 連結
- 首頁 logo / hero / 篩選器都要正常

---

## D. 提交到 Google Search Console（10 分鐘）

### 1. 加 Property
- 前往 https://search.google.com/search-console
- 左上 → Add property → 選 **URL prefix**（不要 Domain）
- 貼上 `https://<你的>.vercel.app`（含 https）

### 2. 驗證所有權
- 選驗證方式：**HTML tag**（最簡單）
- 複製它給的 `<meta name="google-site-verification" content="XXXXX" />`
- 抓 `XXXXX` 那串值，回 Vercel 加環境變數 `GOOGLE_SITE_VERIFICATION` = `XXXXX`
- 跟我說一聲，我加幾行讓 layout.tsx 把 meta tag 印出來，然後 redeploy → 回 GSC 按 Verify

### 3. 提交 sitemap
- GSC 左側 → Sitemaps → 提交 `sitemap.xml`
- 等 2–3 天 Google 來爬

### 4. 加 Bing Webmaster Tools（選做、5 分鐘）
- 前往 https://www.bing.com/webmasters → 直接 `Import from Google Search Console`，省事

---

## E. 觸發 GitHub Actions 第一次跑（5 分鐘）

當前 `.github/workflows/fetch-data.yml` 是每週一 03:00 UTC 跑。**首次手動跑一次**確認能用：

- GitHub repo → Actions tab → 左側 `Weekly heat data refresh` → 右上 `Run workflow` → 按綠色按鈕
- 等 ~3 分鐘
- 看到綠勾 = 成功；如果 commit 有 diff，會看到 bot 自動推一筆 `chore(data): weekly heat refresh`，Vercel 會跟著重 build

---

## F. 上線後檢查清單

- [ ] 首頁開得開、hero 圖出現
- [ ] 任點一張案件 → HeatCurve 有資料
- [ ] 篩選器 `?level=alert` 直接打網址能 work
- [ ] 案件單頁 → 分享 LINE/X/FB 按鈕點開能正確帶 URL
- [ ] 案件單頁 → 「回報這個案件的錯誤」mailto 點開信件 subject/body 預填
- [ ] `/sitemap.xml` 與 `/robots.txt` 兩個直接訪問都正常
- [ ] GSC 提交 sitemap 並驗證所有權
- [ ] Lighthouse（Chrome DevTools）跑首頁 → 至少 SEO ≥ 95、Accessibility ≥ 90

---

## 常見問題

**Q: Vercel build 失敗，說找不到 hero.png**
A: 確認 `D:\app\FairCases\public\hero.png` 已被 git 追蹤（`git ls-files public/hero.png` 有輸出）。如果 1.5 MB 的 png 漏 commit 就會這樣。

**Q: hero 圖 1.5 MB 太大、Lighthouse 扣分**
A: 用 https://squoosh.app 把 hero.png 壓成 webp（< 300 KB），存回 `public/hero.webp`，把 `src/app/page.tsx` 的 `/hero.png` 改成 `/hero.webp`。

**Q: Google Search Console 顯示「找不到屬性」**
A: 你打成 `http://` 或結尾多斜線。改用 `https://faircases.vercel.app`（無斜線）。
