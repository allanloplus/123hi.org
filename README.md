# ISMS·普拉斯·2026 首頁（Google Sites 嵌入用）

Allan Lo 顧問 × AI 小助手阿拉蕾 的資安知識庫首頁，供 Google Sites「整頁嵌入」使用。

## 發佈（GitHub Pages）
1. Repo → Settings → Pages → Source 選 `Deploy from a branch`，Branch 選本分支（合併後為 `main`）、資料夾 `/ (root)`。
2. 網址為 `https://allanloplus.github.io/123hi.org/`。
3. Google Sites → 插入 → 嵌入 → 「依網址」貼上網址 → 選「整頁」。

## 情資試算表
- 設定在 `index.html` 最下方的 `CONFIG`（`SHEET_ID`、`FEED_GID`）。
- 試算表需設為「知道連結的任何人皆可檢視」，按鈕（Excel / PDF 下載）、嵌入表與「最新情資」卡片、跑馬燈才會正常。
- `FEED_GID` 留空時讀取**第一個分頁**；請把最新月份分頁維持在最左邊，首頁就會自動更新。

## 角色素材
`assets/img/` 為由角色設定圖裁切去背的 WebP（Allan 8 種表情、阿拉蕾 8 種表情與全身圖）。
