# ISMS·普拉斯·AllanLo 首頁（Google Sites 嵌入用）

Allan Lo 顧問 × AI 小助手阿拉蕾 的資安知識庫首頁，供 Google Sites「整頁嵌入」使用。

## 發佈（GitHub Pages）
1. Repo → Settings → Pages → Source 選 `Deploy from a branch`，Branch 選 `main`、資料夾 `/ (root)`。之後所有修改都合併進 `main`。
2. 網址為 `https://allanloplus.github.io/123hi.org/`（資安島：`https://allanloplus.github.io/123hi.org/isms_island/`）。
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

## Allan's 資安島（`isms_island/`）
參考 HEART 政策島的互動 3D 島嶼地圖，網址為 `https://allanloplus.github.io/123hi.org/isms_island/`，與首頁互不影響。
- 10 座六角島拼成盾牌形，每座島是一類資源；點島或用右側清單（可搜尋）開啟資源卡片，所有資源開新分頁。
- 島與島之間有 13 條「知識流」，島民沿著橋搬運情資、測驗卷等；「日誌」記錄每趟出發與抵達。
- 下方面板：ISMS 的一年（月份時間軸，示意排程）、學習路線、標準篩選（27001／27701／42001／TISAX／資通安全法）。
- 島嶼、資源、知識流、學習路線與年度排程都在 `isms_island/data.js`；首頁新增資源時，這裡也要一起補上。
- 可用網址錨點直接開啟某座島或知識流，例如 `isms_island/#intel`、`isms_island/#L3`。
- Three.js 0.170.0 放在 `isms_island/vendor/three/`（MIT 授權），不依賴外部 CDN；裝置不支援 WebGL 時改用平面六角地圖。

## 米數的資安島（`medsigtw-island/`）
給米數資科使用的資安島複本，網址為 `https://allanloplus.github.io/123hi.org/medsigtw-island/`。
- 與 `isms_island/` 內容相同，差別：品牌改為「米數的資安島／米數資科」，顧問稱「米數顧問」、阿拉蕾稱「AI小助手」，總部島改連米數官網 `https://www.medsigtw.com/` 與資安業務信箱 `isms@medsigtw.com`。
- 連到外部頁面的資源（課程、測驗、遊戲、YouTube、AI Map、個案）名稱維持原樣，與點進去的頁面一致。
- 資料夾自成一體（角色圖在 `medsigtw-island/img/`、Three.js 在 `vendor/`），整包複製到米數的網站也能直接使用。
- 兩座島各自有 `data.js`；資源有增減時，兩邊要一起更新。
