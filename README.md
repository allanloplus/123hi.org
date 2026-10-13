# ISMS·普拉斯·2026 首頁（Google Sites 嵌入用）

Allan Lo 顧問 × AI 小助手阿拉蕾 的資安知識庫首頁，供 Google Sites「整頁嵌入」使用。

## 發佈（GitHub Pages）
1. Repo → Settings → Pages → Source 選 `Deploy from a branch`，Branch 選本分支（合併後為 `main`）、資料夾 `/ (root)`。
2. 網址為 `https://allanloplus.github.io/123hi.org/`。
3. Google Sites → 插入 → 嵌入 → 「依網址」貼上網址 → 選「整頁」。

## 首頁區塊
頁首（Allan × 阿拉蕾）→ 最新情資跑馬燈 → 情資下載橫幅（Excel 下載、本月焦點 3 則、可展開線上瀏覽）→ 今天想學什麼（5 個入口）→ 課程動畫海報 → ISMS 運作流程地圖 A01–A15 → 資安小劇場 → 課後測驗 → 教學資源／外部情資來源 → 認識我們。

各區塊的連結與文字集中在 `index.html` 底部 `<script>` 的 `PORTALS`、`COURSES`、`FLOWS`、`CHAT`、`QUIZ`、`RES`、`SRC` 陣列，新增課程或連結只要改這裡。

## 情資試算表
- `SHEET_ID`、`YEAR` 設定在 `<script>` 最上方；明年換新試算表時修改這兩項即可。
- 本月焦點依分頁名稱「2026年10月」自動讀取，試算表需維持「知道連結的任何人皆可檢視」。
- Google Sites 嵌入框不允許導向上層頁面，所有連結皆以新分頁開啟。

## 角色素材
`assets/img/` 為由角色設定圖裁切去背的 WebP（Allan 8 種表情、阿拉蕾 8 種表情與全身圖）。
