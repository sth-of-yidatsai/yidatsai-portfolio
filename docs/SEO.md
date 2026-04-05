# SEO 架構說明

## 整體架構

```
index.html           → 靜態 fallback（社群爬蟲、首次載入）
src/seo/seoConfig.js → 各頁面 meta 設定集中管理
src/hooks/useMeta.js → 路由切換時動態更新 <head>
src/routes.jsx       → 每個路由掛載對應的 meta
vite-plugin-prerender → 本地 build 時預渲染所有頁面為靜態 HTML
public/sitemap.xml   → 自動產生，告知 Google 所有頁面
```

### 運作流程

1. 瀏覽器首次載入 → 讀取預渲染好的靜態 HTML（含完整 meta 與中文內容）
2. React 掛載後 → `useMeta()` 依路由動態覆蓋 `<head>` 內容
3. 本地 `npm run build` → `vite-plugin-prerender` 用 Puppeteer 預渲染每頁，產出靜態 HTML
4. 推上 GitHub → Vercel 自動部署 `dist/`（不自己 build）

> Vercel 設定：Build Command = `echo skip`，Output Directory = `dist`

---

## 部署流程

```bash
npm run build          # build + prerender（本地執行）
git add dist/
git commit -m "build"
git push               # Vercel 自動部署
```

> **注意：** 每次改完程式碼都要重新 build 再 push，push 前忘記 build 會部署到舊版本。

---

## 檔案說明

### `src/seo/seoConfig.js`

所有頁面的 meta 設定集中在這裡。

```js
SITE               // 全站預設值（name、defaultDescription、defaultOgImage）
PAGE_META          // 靜態頁面（home、about、projects、playground、contact）
buildProjectMeta() // 動態產生作品頁 meta（從 projects.json 讀取）
buildProjectJsonLd() // 動態產生作品頁 JSON-LD 結構化資料
```

### `src/hooks/useMeta.js`

接收 meta 物件，路由切換時自動更新 `<head>`，離開頁面時清除。所有動態注入的元素標記 `data-seo="managed"`。

### `src/routes.jsx`

每個路由透過 `handle.meta` 掛載對應的 meta：

```js
{ path: "about", handle: { meta: () => PAGE_META.about } }
{ path: "projects/:id", handle: { meta: (data) => buildProjectMeta(data) } }
```

### `vite.config.js`

- `vite-plugin-prerender` 僅在本地執行（偵測 `VERCEL` 環境變數，CI 環境自動略過）
- `renderAfterTime: 3000` — 每頁等 3 秒讓 React 渲染完成

---

## 各頁面 Meta

| 頁面 | description 語言 | 備註 |
|------|-----------------|------|
| `/` | 中文 | 含「蔡易達」關鍵字 |
| `/about` | 中文 | 含「蔡易達」關鍵字 |
| `/projects` | 中文 | 含「蔡易達」關鍵字 |
| `/playground` | 英文 | 功能性頁面 |
| `/contact` | 英文 | 功能性頁面 |
| `/projects/:id` | 英文 | 從 projects.json 的 description 欄位帶入 |

---

## 中文 SEO 強化

Google 搜尋「蔡易達」的相關性來自以下幾處：

1. **`index.html`** — JSON-LD Person schema 的 `alternateName` 與 `description` 欄位（中文）
2. **`seoConfig.js`** — home、about、projects 頁面的中文 description
3. **`BioSection.jsx`** — About 頁面加入了 `lang="zh-TW"` 的中文段落（可被爬蟲讀取的 body text）
4. **Prerender** — build 時靜態化，Facebook / Line 等不執行 JS 的爬蟲也能讀取完整 OG 資訊

---

## Prerender 設定

**`vite.config.js`** 中設定預渲染的路由：

```js
routes: [
  '/',
  '/about',
  '/projects',
  '/playground',
  '/contact',
  '/projects/formosa-font',
  '/projects/patterned-glass-notebook',
  '/projects/foucault-book-binding',
  // 新增作品時在此加入對應路徑
],
```

---

## 新增作品流程

### 1. 在 `src/data/projects.json` 新增資料

```json
{
  "id": "my-new-project",          // 路徑用，只用英文小寫與連字號
  "title": "My New Project",
  "year": 2025,
  "order": 4,                      // 作品列表排序
  "cover": "01.webp",              // 封面圖（沒有 ogImage 時也用作 OG 圖）
  "ogImage": "og.jpg",             // OG 圖（選填，建議 1200×630px JPG）
  "images": ["01.webp", "02.webp"],
  "description": "英文作品描述，用於 meta description 與 JSON-LD。",
  "category": ["Editorial", "Book"],
  "tags": ["Typography"],
  "size": "square"                 // square / portrait / landscape
}
```

### 2. 放置圖片

```
public/images/projects/my-new-project/
  ├── 01.webp       ← 內頁圖
  ├── 02.webp
  ├── ...
  └── og.jpg        ← OG 圖（選填，1200×630px JPG）
```

### 3. 在 `vite.config.js` 加入預渲染路徑

```js
routes: [
  // ... 現有路由
  '/projects/my-new-project',   // ← 加這行
],
```

### 4. Build、確認、部署

```bash
npm run build
npm run preview   # 本機預覽確認
```

開啟 `http://localhost:4173/projects/my-new-project`，右鍵「檢視原始碼」確認：
- `<meta property="og:image">` 帶入正確圖片
- `<meta name="description">` 帶入作品描述
- `<script type="application/ld+json">` 內有 CreativeWork 結構化資料

確認無誤後：

```bash
git add dist/
git commit -m "build: add my-new-project"
git push
```

---

## Sitemap

`public/sitemap.xml` 在每次 `npm run build` 前由 `scripts/generate-sitemap.js` 自動產生，無需手動維護。新作品加入 `projects.json` 後，下次 build 會自動更新。

---

## 部署後

1. 前往 [Google Search Console](https://search.google.com/search-console)
2. 首次設定：提交 `https://yidatsai.com/sitemap.xml`
3. 新作品上線後：用「URL 檢查」→「要求建立索引」加速收錄
