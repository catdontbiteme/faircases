# ChatGPT 圖像提示詞集（黑色悲傷主題）

整體視覺基調：**Dark mournful editorial** — 深夜檔案室、未亮的燭光、被遺忘的卷宗。沉重、克制、莊嚴，但**不要血腥、不要恐怖、不要驚悚**。

把每段提示詞整段複製貼進 ChatGPT（要選有圖像生成的模式：DALL·E 3 或 4o image）。

---

## 共通風格基底（每段提示詞已內含，不必另貼）

> Dark mournful editorial style. Deep charcoal black (#0a0a0a) and graphite (#1f1f1f) base, with a single muted ember glow as the only color accent — dim amber #b45309, never bright orange or red. Heavy negative space, low light, archival hush. Inspired by Caravaggio's chiaroscuro, Edward Hopper's solitude, The New York Times "The Daily" cover art, and museum night-mode photography. NO blood, NO weapons, NO police tape, NO faces, NO text in image, NO neon, NO sensationalism. Quiet grief, not horror.

---

## 1. Logo（站名「案件溫度計」）

**用途**：header 旁的小圖示
**輸出**：1024×1024 PNG，**透明背景**

```
Create a minimalist logo icon for a Taiwanese case-tracking website called "案件溫度計" (Case Thermometer). The icon must subtly combine two concepts in a single mark: a thermometer (representing the public-attention "temperature" of a forgotten case) and an unsealed archival folder or paper document (representing unresolved cases that should not be forgotten).

Visual style: dark mournful editorial. Solid graphite charcoal silhouette (#1f1f1f) on transparent background, with one tiny ember-amber dot or glow (#b45309) as the only color — placed where the thermometer's mercury bulb would be, signifying the last warmth of remembrance.

Geometric, flat 2D vector. No gradients except possibly a soft amber glow around the ember dot. No text, no human figures, no flames, no warning symbols, no skulls, no police imagery, no candles. Must remain readable in silhouette at 32×32 pixel favicon size — limit to maximum 2 visual elements that read as one mark.

Output 1024×1024 PNG with transparent background.
```

---

## 2. Favicon（極簡版）

**用途**：瀏覽器分頁（32×32）
**做法**：拿到 logo 後同對話追問

```
Take the logo concept above and create an even simpler version optimized for a 32×32 pixel favicon. Reduce to a single bold silhouette + the ember-amber dot. Solid shapes only, no fine details. The ember dot must remain recognizable at thumbnail size. Same dark mournful palette: graphite #1f1f1f silhouette + amber #b45309 dot, transparent background. Output 512×512 PNG.
```

存成 `public/favicon.png`，再到 https://favicon.io/favicon-converter/ 轉 `.ico` 也存到 `public/`。

---

## 3. 首頁 Hero 意象圖（核心情感畫面）

**用途**：首頁標題上方的橫幅，整個網站的情感定錨
**輸出**：1600×900 (16:9) PNG 或 WebP

```
Create a wide editorial banner illustration (16:9, 1600×900) for the homepage of a Taiwanese case-tracking website. The image must evoke "cases that should not be forgotten" — quiet grief, vigil, remembrance — without depicting any specific incident, victim, or perpetrator.

Composition: a long shelf or row of standing archival paper folders inside a darkened, almost unlit reading room at midnight. Most folders are deep charcoal, gathering thin dust, fading into the black background as the row recedes. ONE folder near the foreground is held barely visible by a single faint ember glow — as if a small flame inside it is about to go out, but hasn't yet. A thin shaft of pale moonlight falls from a high unseen window, just enough to outline the folder edges.

Atmosphere: dark mournful editorial, like a candlelight vigil in an archive. Heavy shadows occupying 70% of the frame. The single ember-amber light source (#b45309) is the only warm color — everything else is graphite, charcoal, deep black, with hints of cool blue-grey in the shadows.

Style: editorial illustration with painterly chiaroscuro, NOT photo-realism, NOT 3D render. Inspired by Caravaggio's lighting, Edward Hopper's solitude, and The Reporter (報導者) cover art. NO people, NO faces, NO hands, NO text or letters anywhere in the image, NO weapons, NO police tape, NO flames or fire visible, NO blood, NO obviously distressing imagery. Quiet, dignified, mournful — not horror.

Output 1600×900, leave room at top for white headline text to be overlaid later.
```

存 `public/hero.webp`（用 https://squoosh.app 壓到 < 250KB）。
然後改 [`src/app/layout.tsx`](src/app/layout.tsx) 的 `/hero.svg` 為 `/hero.webp`。

### Hero 不滿意的追加指令

- 「再來一張，把 ember 光點縮小一半，整體再暗 20%」
- 「保持構圖，把所有檔案夾換成更模糊、更失焦」
- 「移除月光，只留 ember 光」
- 「畫面正中央留更多空白，標題會疊在上方」

---

## 4. 四個類別 icon（一次出全套，保證風格統一）

**用途**：案件卡片的類別 pill
**輸出**：2048×2048 PNG，2×2 grid，自己再切

```
Create a set of 4 minimalist category icons for a Taiwanese case-tracking website with a dark mournful theme. Present all four together in a single 2×2 grid image, each icon clearly separated with adequate margin so I can crop them individually. ALL four MUST share the exact same visual style — same line weight, same proportions, same level of abstraction.

The 4 categories, each rendered as one icon, all abstract:

1. **Violent crime** — a single fractured circle, broken into 2-3 pieces with a thin gap between them. NO weapons, NO blood, NO human figures.
2. **Police / fire line-of-duty death** — a simple shield silhouette with one dimmed star or lamp inside. NO uniforms, NO police equipment, NO faces, NO actual emblems.
3. **Bullying** — three small circles, with two clustered together and one isolated apart with a faint connecting dotted line, conveying exclusion abstractly.
4. **Personal data leak** — a closed padlock with one small fragment or flake floating away from it.

Style: thin line drawing, line weight roughly 2.5px relative to a 24px target size. Solid graphite charcoal lines (#1f1f1f) on warm off-white card background (#fafaf7) — these icons will sit on light pill chips, so they must be DARK lines on LIGHT background, NOT inverted. NO color, NO gradient, NO shadow, NO fill except the line itself. NO text, NO numbers, NO labels.

Each icon must be recognizable at 16×16 pixel size, meaning each must reduce cleanly to silhouette. Output 2048×2048 PNG with transparent or pure white background, the 4 icons in a 2×2 grid with consistent margin.
```

切成 4 張 512×512 用 https://www.iloveimg.com/crop-image 或任何切圖工具：
- `public/icons/violent-crime.png`
- `public/icons/police-line-of-duty.png`
- `public/icons/bullying.png`
- `public/icons/data-leak.png`

切完後，編輯 [`src/lib/icons.ts`](src/lib/icons.ts) 把 `.svg` 副檔名改成 `.png`。

---

## 風格紅線（對自己也對 ChatGPT）

即使要黑色悲傷，**這些絕對不要**：

- ✗ 血、傷口、警示帶、屍袋、殯儀館
- ✗ 兒童、青少年、警察、軍人、任何人臉
- ✗ 火焰燃燒、十字架、墓碑、棺材
- ✗ 紅色（過於戲劇化）— 改用 ember amber #b45309
- ✗ 圖中文字、書名、英文 logo（DALL·E 常自作主張加，要明確禁止）
- ✗ 暗網駭客、駭客面具、二進位代碼瀑布

**為什麼克制**：本站定位是「沉重的紀念」，不是「驚悚題材」。**真正的悲傷不需要尖叫**。

---

## 操作流程

1. 開新 ChatGPT 對話，模型選 GPT-4o
2. 一段一段貼提示詞，每段一張（hero 那張可以多生 3-4 張挑最好的）
3. 拿到圖後：
   - hero → squoosh.app 壓 webp
   - logo / icon → 透明背景 PNG 直接用
   - favicon → favicon.io 轉 ico
4. 全部丟到 `D:\app\FairCases\public\` 對應路徑
5. 跑 `npm run dev`，看效果

## 萬一 ChatGPT 風格走鐘

最常出錯的兩個問題與救援指令：

- **太花俏**：「整張圖請降低飽和度 40%，把所有發光元素再縮小一半」
- **加了文字**：「移除圖中所有英文、中文、數字、書名標籤」
- **太恐怖**：「保持構圖，但讓氛圍從 horror 改成 quiet mourning，光源從尖銳改為柔和」
- **風格不一致**（4 icon 那組）：「重畫一遍，4 個 icon 全部用完全一樣的線條粗細、一樣的圓角，看起來像同一個設計師同一支筆畫的」
