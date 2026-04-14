# 專案圖片系統說明

## 概覽

本專案採用 **WebP + 多尺寸 srcset** 的響應式圖片架構，由以下三個部分組成：

```
scripts/generate-responsive-images.js   ← 產生各尺寸圖片檔
scripts/generate-alt-texts.js           ← 用 Claude CLI 自動生成中英文 alt 文字
src/data/image-alts.json               ← 圖片 alt 文字庫（自動產生，commit 進 repo）
src/utils/imgSrcSet.js                  ← srcset 字串建構 & preload 選圖
src/utils/getAltText.js                 ← alt 文字查詢工具（支援語言參數）
```

---

## 一、圖片規格規則

### 來源圖片要求

- 格式：**WebP**
- 放置位置：`public/images/projects/{專案slug}/`
- 命名：`01.webp`, `02.webp`, `03.webp` ...（純數字流水號）
- 建議來源解析度：**3200px 或 3840px 寬**（確保各尺寸都能有效縮放）

### 自動產生的尺寸變體

執行 `npm run generate-images` 後，每張來源圖片會在同目錄產生以下檔案：

| 檔名後綴 | 像素寬 | 用途 |
|---|---|---|
| `01-800.webp` | 800px | 手機、小螢幕 |
| `01-1200.webp` | 1200px | 手機高 DPR、小平板 |
| `01-1600.webp` | 1600px | 平板、筆電低 DPR |
| `01-2400.webp` | 2400px | 桌機、MacBook Retina |
| `01-3200.webp` | 3200px | 2K/4K 螢幕、大型 Retina |
| `01.webp` | 原始尺寸 | 來源原圖（不直接使用於 srcset） |

- 壓縮品質：**85**（sharp WebP quality）
- `withoutEnlargement: true`：來源圖小於目標尺寸時不放大
- 已存在的變體自動跳過，不重複產生

---

## 二、裝置對照表

### pickResponsiveSrc（Preload 選圖邏輯）

計算方式：`needed = window.innerWidth × devicePixelRatio`

| needed 範圍 | 選用檔案 | 說明 |
|---|---|---|
| ≤ 900px | `-800.webp` | |
| 901–1400px | `-1200.webp` | |
| 1401–1800px | `-1600.webp` | |
| 1801–2600px | `-2400.webp` | |
| 2601px 以上 | `-3200.webp` | 含 4K、Retina 大螢幕 |

### 常見裝置實際對照

| 裝置 | 螢幕寬 | DPR | needed | 載入檔案 |
|---|---|---|---|---|
| iPhone SE / 小手機 | 375px | 2x | 750 | `-800.webp` |
| iPhone 15 Pro | 393px | 3x | 1179 | `-1200.webp` |
| iPad (直向) | 768px | 2x | 1536 | `-1600.webp` |
| iPad Pro 13" | 1024px | 2x | 2048 | `-2400.webp` |
| 13" MacBook Air (Retina) | 1280px | 2x | 2560 | `-2400.webp` |
| 14" MacBook Pro (Retina) | 1440px | 2x | 2880 | `-3200.webp` |
| 1920px 一般顯示器 1x | 1920px | 1x | 1920 | `-2400.webp` |
| 2560px 2K 顯示器 1x | 2560px | 1x | 2560 | `-2400.webp` |
| 1920px 顯示器 2x | 1920px | 2x | 3840 | `-3200.webp` |
| 4K 顯示器 1x | 3840px | 1x | 3840 | `-3200.webp` |

> 原圖（3840px / 3200px）不出現在 srcset 中，永遠不會被瀏覽器載入。

---

## 三、Block 元件 sizes 規則

各 Block 元件透過 `buildSrcSet(src)` 產生 srcset，並設定不同的 `sizes`：

| 元件 | sizes 設定 | 圖片比例 | loading |
|---|---|---|---|
| `CarouselBlock` | `100vw` | 全寬輪播 | — |
| `ImgSet1aBlock` | `(max-width: 768px) 100vw, 1200px` | 單張全幅 | lazy |
| `ImgSet1bBlock` | `(max-width: 768px) 100vw, 1200px` | 單張全幅（變體） | lazy |
| `ImgSet2aBlock` | `(max-width: 768px) 100vw, 50vw` | 2 欄 | eager |
| `ImgSet2bBlock` | `(max-width: 768px) 100vw, 50vw` | 2 欄（變體） | lazy |
| `ImgSet3aBlock` | `(max-width: 768px) 100vw, 33vw` | 3 欄 | eager |
| `ImgSet3bBlock` | `(max-width: 768px) 100vw, 33vw` | 3 欄（變體） | eager |
| `ImgSet4aBlock` | `(max-width: 768px) 50vw, 25vw` | 4 欄 | eager |
| `ImgTextBlock` | `(max-width: 768px) 100vw, 50vw` | 圖文各半 | eager |

### sizes 的意義

`sizes` 告訴瀏覽器「這張圖在畫面上佔多少寬」，瀏覽器再用 `顯示寬 × DPR` 從 srcset 選最接近的尺寸。
例如 `50vw` 在 1920px 螢幕 2x DPR → 需要 `1920 × 0.5 × 2 = 1920px` → 選 `-2400.webp`。

---

## 四、Preload 機制

每個專案頁面開頭宣告 `PRELOAD_IMAGES`，對 Hero 圖使用 `pickResponsiveSrc()` 預先依裝置選圖，避免 Hero 圖出現後才開始下載。

```js
// 範例：FoucaultBookBinding.jsx
const PRELOAD_IMAGES = [
  pickResponsiveSrc(`${BASE}/01.webp`),  // Hero 圖，依裝置選尺寸
  `${BASE}/title.svg`,                   // Title SVG
];
usePagePreloader(PRELOAD_IMAGES);
```

---

## 五、Alt 文字系統

### 架構

圖片 alt 文字獨立存放於 `src/data/image-alts.json`，不寫入 `projects.json`，以避免單一檔案過長。

key 格式：`"{projectId}/{filename}"` → `{ "en": "...", "zh": "..." }`

```json
{
  "formosa-font/01.webp": {
    "en": "A white booklet featuring botanical illustration...",
    "zh": "一本白色小冊子，封面有精緻的植物插圖..."
  },
  "foucault-book-binding/01.webp": {
    "en": "A flat-lay arrangement of redesigned book covers...",
    "zh": "平鋪展示的傅柯著作重新設計封面..."
  }
}
```

### 查詢工具：`getAltText(src, fallback?, lang?)`

所有 Block 元件透過 `src/utils/getAltText.js` 查詢 alt 文字：

```js
import { getAltText } from '../../utils/getAltText';

// 接受完整路徑或相對 key，支援語言參數
<img alt={getAltText(src, title ?? '', language)} ... />
```

- 支援完整路徑（`/images/projects/formosa-font/01.webp`）或相對 key（`formosa-font/01.webp`）
- `lang` 參數接受 `'en'` 或 `'zh'`（預設 `'en'`）
- 查無資料時回傳 `fallback`（預設 `''`）
- 向後相容舊版純字串格式

### 生成 Alt 文字

```bash
npm run generate-alts
```

- 使用 Claude Code CLI（訂閱帳號，不需要 API key）
- **雙語**：每張圖產生英文（`en`）與繁體中文（`zh`）兩種 alt
- **Incremental**：`en` 和 `zh` 都已存在才跳過；缺哪個就補哪個
- 自動跳過：responsive 變體（`-800`、`-1200` 等）、`og.jpg`、`title.svg`
- 結果寫入 `src/data/image-alts.json` 後需 commit 進 repo

---

## 六、新增專案流程

### Step 1 — 準備原圖

```
public/images/projects/{新專案-slug}/
├── 01.webp   ← 來源原圖，建議 3200px 或 3840px 寬
├── 02.webp
├── 03.webp
├── title.svg ← 專案標題 SVG（若有）
└── ...
```

### Step 2 — 產生響應式變體

```bash
npm run generate-images
```

執行後自動產生 `-800` / `-1200` / `-1600` / `-2400` / `-3200` 五組變體。

### Step 2.5 — 生成 Alt 文字

```bash
npm run generate-alts
```

用 Claude Code CLI 對新圖自動生成 alt 文字，寫入 `src/data/image-alts.json`。確認內容後 commit。

### Step 3 — 建立專案頁面

在 `src/pages/projects/` 新增頁面檔案，宣告 `PRELOAD_IMAGES` 與 block 資料：

```js
import { pickResponsiveSrc } from '../../utils/imgSrcSet';
import { usePagePreloader } from '../../hooks/usePagePreloader';

const BASE = '/images/projects/新專案-slug';

const PRELOAD_IMAGES = [
  pickResponsiveSrc(`${BASE}/01.webp`),  // Hero 圖
  `${BASE}/title.svg`,
];

// blocks 陣列使用各 Block 元件，src 填相對路徑
// buildSrcSet 在 Block 元件內部自動呼叫，不需手動傳入
```

### Step 4 — 在 App.jsx 註冊路由

確認 `src/App.jsx` 中加入新專案的路由。

### Step 5 — 確認 srcset 正確

在瀏覽器 DevTools → Network → 篩選 `Img`，確認各裝置載入正確尺寸的 `-800` / `-1200` / ... 變體，而非原圖。

---

## 七、注意事項

- **不要直接使用原圖路徑作為 `src`**：`buildSrcSet` 會以原圖路徑作為 `src` fallback，但 srcset 中不包含原圖，瀏覽器只在完全不支援 srcset 時才 fallback 到原圖（幾乎不發生）。
- **SVG 不產生變體**：`buildSrcSet` 遇到 `.svg` 返回 `null`，直接以原始 SVG 呈現。
- **重新跑 generate-images 是安全的**：已存在的變體會自動跳過，不重複壓縮。
- **來源圖寬度 < 目標尺寸**：`withoutEnlargement: true` 保護，不會放大圖片（例如 1920px 原圖不會產生 2400px 變體，而是直接輸出 1920px）。
- **`generate-alts` 不在 prebuild 流程**：避免每次 build 都呼叫 CLI，需手動執行後 commit `image-alts.json`。
- **Alt 文字品質**：自動生成的結果可在 `image-alts.json` 中直接編輯修正，格式為純 JSON。
