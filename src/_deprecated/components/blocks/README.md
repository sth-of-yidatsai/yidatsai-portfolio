# Block System — README

Block 系統讓每個專案透過 `projects.json` 中的 `blocks` 陣列，自由組合頁面版型。
`BlockRenderer` 依照 `type` 對應並渲染對應元件，並在所有圖片載入完成後自動 refresh GSAP ScrollTrigger。

---

## 基本用法

在 `src/data/projects.json` 的專案物件中加入 `blocks` 陣列：

```json
{
  "id": "your-project",
  "title": "Project Title",
  "description": "Project description for section-title block.",
  "blocks": [
    { "type": "hero", "image": "/images/projects/xxx/01.webp" },
    { "type": "section-title", "bg": "var(--gray-900)" },
    { "type": "text", "text": "這是一段說明文字..." },
    { "type": "spacer", "size": "lg" }
  ]
}
```

每個 block 物件必須包含 `"type"` 欄位，其餘參數依 type 而定。

---

## Block 類型索引

| type | 元件 | 動畫 |
|---|---|---|
| `hero` | HeroBlock | 背景視差 |
| `section-title` | SectionTitleBlock | Pin + 逐字填色 |
| `text` | TextBlock | Pin + 逐字填色 |
| `carousel` | CarouselBlock | Pin + Crossfade |
| `landscape` | LandscapeBlock | Pin + 縮放展開 |
| `full-image` | FullImageBlock | 視差 |
| `image-left-text-right` | ImageLeftTextRightBlock | 視差 |
| `image-right-text-left` | ImageRightTextLeftBlock | 視差 |
| `image-grid` | ImageGridBlock | 視差 |
| `image-set-a` | ImageSetABlock | 視差 |
| `image-set-b` | ImageSetBBlock | 視差 |
| `image-set-c` | ImageSetCBlock | 視差 |
| `quote` | QuoteBlock | 無 |
| `video` | VideoBlock | 無 |
| `spacer` | SpacerBlock | 無 |

---

## 各 Block 詳細說明

---

### `hero`

專案首圖區塊。大背景圖 + 右側資訊面板，title / year / category / tags 自動從 project 資料讀取。

| 參數 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `type` | string | ✓ | `"hero"` |
| `image` | string | — | 背景圖路徑 |

```json
{
  "type": "hero",
  "image": "/images/projects/formosa-font/03.webp"
}
```

---

### `section-title`

章節標題區塊。顯示 `project.title` 與 `project.description`，捲動時逐字填色。

| 參數 | 類型 | 必填 | 預設值 | 說明 |
|---|---|---|---|---|
| `type` | string | ✓ | — | `"section-title"` |
| `bg` | string | — | `var(--gray-900)` | 背景色 |
| `color` | string | — | `var(--gray-600)` | 文字初始色（未填色） |
| `fillColor` | string | — | `var(--gray-50)` | 文字填色後的顏色 |

```json
{
  "type": "section-title",
  "bg": "var(--linen-300)",
  "color": "var(--gray-300)",
  "fillColor": "var(--gray-900)"
}
```

---

### `text`

長文字區塊。捲動時逐字填色，可選擇置中對齊。

| 參數 | 類型 | 必填 | 預設值 | 說明 |
|---|---|---|---|---|
| `type` | string | ✓ | — | `"text"` |
| `text` | string | ✓ | — | 主文字內容 |
| `label` | string | — | — | 小標題，顯示於文字上方 |
| `bg` | string | — | `transparent` | 背景色 |
| `color` | string | — | `var(--gray-600)` | 文字初始色 |
| `fillColor` | string | — | `var(--gray-900)` | 文字填色後的顏色 |
| `align` | string | — | — | `"center"` 時文字置中 |

```json
{
  "type": "text",
  "label": "About",
  "text": "Inspired by Taiwan's diverse climate and terrain...",
  "bg": "var(--gray-50)",
  "color": "var(--gray-300)",
  "fillColor": "var(--gray-900)",
  "align": "center"
}
```

---

### `carousel`

全螢幕輪播區塊。最多 3 張圖，捲動時依序 crossfade 切換。

| 參數 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `type` | string | ✓ | `"carousel"` |
| `images` | string[] | ✓ | 圖片路徑陣列，最多取前 3 張 |

切換順序：`images[0]` → scroll → `images[1]` → scroll → `images[2]`

```json
{
  "type": "carousel",
  "images": [
    "/images/projects/xxx/11.webp",
    "/images/projects/xxx/12.webp",
    "/images/projects/xxx/13.webp"
  ]
}
```

---

### `landscape`

21:9 寬幅圖框區塊。3 張圖依序縮放入場，最後圖框整體放大至全屏。

| 參數 | 類型 | 必填 | 預設值 | 說明 |
|---|---|---|---|---|
| `type` | string | ✓ | — | `"landscape"` |
| `images` | string[] | ✓ | — | 3 張圖：`[底圖, 第二層, 第三層]` |
| `bg` | string | — | `var(--gray-25)` | 區塊背景色 |

動畫順序：`images[0]` 底圖靜態視差 → `images[1]` scale 入場 → `images[2]` scale 入場 → 整體全屏放大

```json
{
  "type": "landscape",
  "bg": "var(--gray-100)",
  "images": [
    "/images/projects/xxx/01.webp",
    "/images/projects/xxx/02.webp",
    "/images/projects/xxx/03.webp"
  ]
}
```

---

### `full-image`

全幅單張圖片區塊，含視差效果，可附說明文字。

| 參數 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `type` | string | ✓ | `"full-image"` |
| `src` | string | ✓ | 圖片路徑 |
| `alt` | string | — | 圖片 alt 文字 |
| `caption` | string | — | 說明文字，顯示於圖片下方 |

```json
{
  "type": "full-image",
  "src": "/images/projects/xxx/08.webp",
  "alt": "Project overview",
  "caption": "Final spread layout"
}
```

---

### `image-left-text-right`

左圖右文版型。左側全高視差圖片，右側標題 + 段落文字。

| 參數 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `type` | string | ✓ | `"image-left-text-right"` |
| `image` | string | ✓ | 左側圖片路徑 |
| `imageAlt` | string | — | 圖片 alt 文字 |
| `title` | string | — | 右側標題 |
| `text` | string \| string[] | — | 段落文字，可為單一字串或多段陣列 |
| `bg` | string | — | 右側文字區背景色 |
| `color` | string | — | 右側文字顏色 |

```json
{
  "type": "image-left-text-right",
  "image": "/images/projects/xxx/11.webp",
  "bg": "var(--gray-900)",
  "color": "var(--gray-200)",
  "title": "Flora as Form",
  "text": [
    "Each letterform draws from the island's native plants.",
    "The curves echo the organic shapes of tropical flora."
  ]
}
```

---

### `image-right-text-left`

左文右圖版型。參數與 `image-left-text-right` 相同，左右對調。

| 參數 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `type` | string | ✓ | `"image-right-text-left"` |
| `image` | string | ✓ | 右側圖片路徑 |
| `imageAlt` | string | — | 圖片 alt 文字 |
| `title` | string | — | 左側標題 |
| `text` | string \| string[] | — | 段落文字 |
| `bg` | string | — | 左側文字區背景色 |
| `color` | string | — | 左側文字顏色 |

```json
{
  "type": "image-right-text-left",
  "image": "/images/projects/xxx/14.webp",
  "bg": "var(--gray-50)",
  "color": "var(--gray-900)",
  "title": "Design Process",
  "text": "Each glyph was hand-drawn before digitization."
}
```

---

### `image-grid`

多圖網格區塊，支援 2–4 欄，每張圖含視差效果。

| 參數 | 類型 | 必填 | 預設值 | 說明 |
|---|---|---|---|---|
| `type` | string | ✓ | — | `"image-grid"` |
| `images` | Array\<string \| {src: string}\> | ✓ | — | 圖片陣列，可為純路徑或含 `src` 的物件 |
| `columns` | number | — | `2` | 欄數，有效值 `2`–`4` |

```json
{
  "type": "image-grid",
  "columns": 3,
  "images": [
    "/images/projects/xxx/04.webp",
    "/images/projects/xxx/05.webp",
    "/images/projects/xxx/06.webp"
  ]
}
```

---

### `image-set-a`

三圖組合版型 A：大橫圖(7:5) 搭配兩張方形圖(1:1)。

```
[ img1 (7:5) ]  [ img2 (1:1) ]
               [ img3 (1:1) ]
```

| 參數 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `type` | string | ✓ | `"image-set-a"` |
| `images` | Array\<string \| {src, label?}\> | ✓ | 最多取前 3 張，可含 `label` 文字 |
| `bg` | string | — | 區塊背景色 |
| `color` | string | — | label 文字顏色 |

```json
{
  "type": "image-set-a",
  "bg": "var(--gray-25)",
  "color": "var(--gray-700)",
  "images": [
    { "src": "/images/projects/xxx/02.webp", "label": "Cover" },
    { "src": "/images/projects/xxx/05.webp", "label": "Detail A" },
    { "src": "/images/projects/xxx/06.webp", "label": "Detail B" }
  ]
}
```

---

### `image-set-b`

三圖組合版型 B：直向圖(4:5) + 橫向圖(5:4) + 直向圖(4:5)。

```
[ img1 (4:5) ]  [ img2 (5:4) ]
               [ img3 (4:5)  ]
```

| 參數 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `type` | string | ✓ | `"image-set-b"` |
| `images` | Array\<string \| {src, label?}\> | ✓ | 最多取前 3 張 |
| `bg` | string | — | 區塊背景色 |
| `color` | string | — | label 文字顏色 |

```json
{
  "type": "image-set-b",
  "bg": "var(--gray-25)",
  "color": "var(--gray-700)",
  "images": [
    { "src": "/images/projects/xxx/01.webp", "label": "Spread 1" },
    { "src": "/images/projects/xxx/02.webp", "label": "Spread 2" },
    { "src": "/images/projects/xxx/03.webp", "label": "Spread 3" }
  ]
}
```

---

### `image-set-c`

三圖組合版型 C：橫向圖(5:4) + 方形圖(1:1) + 直向圖(4:5)。

```
[ img1 (5:4) ]  [ img2 (1:1) ]
               [ img3 (4:5)  ]
```

| 參數 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `type` | string | ✓ | `"image-set-c"` |
| `images` | Array\<string \| {src, label?}\> | ✓ | 最多取前 3 張 |
| `bg` | string | — | 區塊背景色 |
| `color` | string | — | label 文字顏色 |

```json
{
  "type": "image-set-c",
  "bg": "var(--gray-25)",
  "color": "var(--gray-700)",
  "images": [
    { "src": "/images/projects/xxx/07.webp", "label": "" },
    { "src": "/images/projects/xxx/08.webp", "label": "Process" },
    { "src": "/images/projects/xxx/09.webp", "label": "" }
  ]
}
```

---

### `quote`

引言區塊。含引號裝飾 SVG、引言文字、作者署名，可附圖。

| 參數 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `type` | string | ✓ | `"quote"` |
| `text` | string | ✓ | 引言內容 |
| `author` | string | — | 來源 / 作者，顯示於引言下方 |
| `image` | string | — | 附圖路徑（如 SVG logo），顯示於引號上方 |

```json
{
  "type": "quote",
  "text": "Taiwan was once known as 'Formosa', meaning 'beautiful island' in Portuguese.",
  "author": "Historical Record",
  "image": "/images/projects/formosa-font/title.svg"
}
```

---

### `video`

影片區塊，支援本地 video 檔案或外部 embed（YouTube / Vimeo 等）。

| 參數 | 類型 | 必填 | 說明 |
|---|---|---|---|
| `type` | string | ✓ | `"video"` |
| `src` | string | ✓ | 本地路徑（`/videos/xxx.mp4`）或 embed URL（`https://...`） |
| `poster` | string | — | 本地影片封面圖（embed 無效） |
| `layout` | string | — | `"full"` 全幅 / `"wide"` 寬幅 / 不填為預設居中 |

判斷邏輯：`src` 以 `http` 或 `//` 開頭時自動使用 `<iframe>`，否則使用 `<video>`。

```json
{
  "type": "video",
  "src": "/videos/projects/xxx/demo.mp4",
  "poster": "/images/projects/xxx/cover.webp",
  "layout": "wide"
}
```

```json
{
  "type": "video",
  "src": "https://www.youtube.com/embed/XXXXXXX",
  "layout": "full"
}
```

---

### `spacer`

空白間隔區塊，用於區塊之間增加垂直間距。

| 參數 | 類型 | 必填 | 預設值 | 說明 |
|---|---|---|---|---|
| `type` | string | ✓ | — | `"spacer"` |
| `size` | string | — | `"md"` | `"sm"` / `"md"` / `"lg"` / `"xl"` |

```json
{
  "type": "spacer",
  "size": "lg"
}
```

---

## 三種 image-set 版型對比

| Block | img1 | img2 | img3 | 適用情境 |
|---|---|---|---|---|
| `image-set-a` | 7:5 橫（大） | 1:1 方 | 1:1 方 | 主視覺大圖 + 細節圖 |
| `image-set-b` | 4:5 直 | 5:4 橫 | 4:5 直 | 版面 / 書籍展開頁 |
| `image-set-c` | 5:4 橫 | 1:1 方 | 4:5 直 | 混合比例展示 |

---

## 有捲動 Pin 動畫的 Block

| Block | 動畫描述 | 捲動距離 |
|---|---|---|
| `text` | 頁面 pin，逐字填色 | `1.8vh` |
| `section-title` | 頁面 pin，title + description 逐字填色 | `1.8vh` |
| `carousel` | 頁面 pin，3 張圖依序 crossfade | `2vh` |
| `landscape` | 頁面 pin，圖層縮放入場 → 全屏展開 | `1.8vh` |

> 這些 block 會使用 GSAP `ScrollTrigger` + `pin: true`，設計時需注意不要在這類 block 附近堆疊太多 pin 區塊，避免 pin spacer 計算問題。