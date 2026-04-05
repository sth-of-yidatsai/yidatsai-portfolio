# 開發與部署流程

## 核心概念

- **master** = 正式站（push 觸發 Vercel 部署）
- **其他分支** = 開發中備份（push 不影響正式站）
- **dist/ 只在上線前才 build**，開發中不需要 build

---

## 情境一：開發中備份（不上線）

適用於：新作品還沒完成、功能還在調整、只是想把進度存到遠端

```bash
# 建立新分支（第一次）
git checkout -b project/my-new-project

# 備份目前進度（可重複執行）
git add src/ public/
git commit -m "wip: 進度描述"
git push -u origin project/my-new-project  # 第一次加 -u，之後只需 git push
```

- Vercel 不會部署，正式站不受影響
- 分支上的 push 只是遠端備份

---

## 情境二：正式上線

適用於：作品完成、功能確認沒問題，要讓正式站更新

### 新增作品上線

```bash
# 1. 確認在正確分支，開發完成後 merge 回 master
git checkout master
git merge project/my-new-project

# 2. Build（含 prerender，約 30 秒）
npm run build

# 3. Commit dist/ 並 push
git add dist/
git commit -m "build: add my-new-project"
git push
```

### 單純修改程式碼上線（改樣式、修 bug 等）

```bash
# 在 master 直接改，或從分支 merge 回來後：
npm run build
git add dist/
git commit -m "build: 描述改動"
git push
```

> **重要：** 不管改了什麼，正式站都要靠 `dist/` 更新。沒有 build 就 push，正式站看到的還是舊版本。

---

## 分支命名規則

| 類型 | 命名 | 範例 |
|------|------|------|
| 新作品 | `project/id` | `project/patterned-glass-notebook` |
| 功能修改 | `feat/描述` | `feat/homepage-animation` |
| 修 bug | `fix/描述` | `fix/mobile-layout` |

---

## 新增作品完整流程

```bash
# 開始
git checkout -b project/my-new-project

# --- 開發中，重複備份 ---
git add src/ public/
git commit -m "wip: ..."
git push

# --- 完成後上線 ---
git checkout master
git merge project/my-new-project
npm run build
git add dist/
git commit -m "build: add my-new-project"
git push

# 清理分支（選填）
git branch -d project/my-new-project
git push origin --delete project/my-new-project
```

---

## 注意事項

- `dist/` 不要在開發分支 commit，只在 master 上 commit
- build 前先用 `npm run dev` 確認作品正常
- build 完可用 `npm run preview` 在本機預覽正式版本
- 新作品記得在 `vite.config.js` 加入 prerender 路徑（詳見 [SEO.md](SEO.md)）
