# ISMS·普拉斯·2026 首頁（Google Sites 嵌入用）

Allan Lo 顧問 × AI 小助手阿拉蕾 的資安知識庫首頁，供 Google Sites「整頁嵌入」使用。

## 發佈（GitHub Pages）
1. Repo → Settings → Pages → Source 選 `Deploy from a branch`，Branch 選本分支（合併後為 `main`）、資料夾 `/ (root)`。
2. 網址為 `https://allanloplus.github.io/123hi.org/`。
3. Google Sites → 插入 → 嵌入 → 「依網址」貼上網址 → 選「整頁」。

## 情資試算表
- 設定在 `index.html` 最下方的 `CONFIG`：`SHEET_ID`、`YEAR`、`MONTH_GIDS`（各月份分頁 gid）、`OTHER_TABS`。
- 首頁依分頁名稱「2026年10月」讀取 1–12 月資料，分頁順序可任意調整；新增資料後重新整理首頁即自動更新。
- 試算表需維持「知道連結的任何人皆可檢視」。
- 明年換新試算表時，更新 `SHEET_ID`、`YEAR` 與 `MONTH_GIDS` 即可。
- 頁面在 Google Sites 嵌入框內無法導向上層頁面，所有連結皆以新分頁開啟。

## 角色素材
`assets/img/` 為由角色設定圖裁切去背的 WebP（Allan 8 種表情、阿拉蕾 8 種表情與全身圖）。
