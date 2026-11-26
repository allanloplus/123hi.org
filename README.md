# ISMS·普拉斯·AllanLo 首頁（Google Sites 嵌入用）

Allan Lo 顧問 × AI 小助手阿拉蕾 的資安知識庫首頁，供 Google Sites「整頁嵌入」使用。

## 發佈（GitHub Pages）
1. Repo → Settings → Pages → Source 選 `Deploy from a branch`，Branch 選 `main`、資料夾 `/ (root)`。之後所有修改都直接合併並推送到 `main`（見 `CLAUDE.md`）。
2. 網址為 `https://allanlo.123hi.org/`（資安島：`https://allanlo.123hi.org/isms_island/`）。
3. Google Sites → 插入 → 嵌入 → 「依網址」貼上網址 → 選「整頁」。

## 首頁版本（頁尾可切換）
首頁有多種風格，清單在 `versions.js`，每一頁的頁尾都有「首頁風格」切換列。預設首頁就是 `index.html`，由 Allan 決定。

| 版本 | 檔案 | 說明 |
|---|---|---|
| 🎨 貼紙漫畫版（預設） | `index.html` | 上方舞台 Allan 與阿拉蕾輪流說話（點角色換下一句）＋八個分類分頁（資安情資、課程動畫、ISMS 流程、主題樂園、個案研究、課後測驗、教學資源、AI 遊樂場）。點分類只換下方面板；可用 `#courses`、`#cases` 等錨點直接開啟。 |
| 🌌 經典版 | `home-classic.html` | 深藍長頁：頁首 → 情資跑馬燈 → 情資下載橫幅 → 入口 → 課程海報 → 流程地圖 → 主題樂園 → 個案研究室 → 小劇場 → 測驗 → 遊樂場 → 資源 → 認識我們。 |
| 🚆 台灣環島版 | `home-taiwan.html` | 「資安環島」Team Taiwan：台灣地圖上的環島鐵路，八個車站就是八個分類（臺北 資安情資 → 新竹 課程動畫 → … → 花蓮 AI 遊樂場），點車站列車開過去、下方面板換成該站內容。 |
| 👽 外星人風格版 | `home-alien.html` | 「地球資安標本採集」：外星偵察艦駕駛艙，舷窗下的八個地球資安標本就是八個分類，點了飛碟用光束吸上來、下方出現標本分析報告。外星符文解碼、翻譯機開關、Zorg 外星觀察員的誤解台詞、地球威脅指數儀表與採集進度。 |

各版的連結與文字集中在各自底部 `<script>` 的陣列（`COURSES`、`FLOWS`、`QUIZ`、`RES`、`SRC`…），新增課程或連結時每個版本都要改。新增版本與更換預設的步驟見 `CLAUDE.md`。

## 情資來源
- 首頁情資區讀取「資安內外部情資蒐集紀錄」網站 https://allanloplus.github.io/intelligence/ （每日自動蒐集）發佈的 `data/index.json` 與每月資料檔，不再使用 Google 試算表。
- 顯示最近有資料的月份，提供該月 Excel、全年度 Excel 與歷年全年度 Excel 下載；月初會多一顆上月 Excel。跨年度自動切換，不需修改。
- Google Sites 嵌入框不允許導向上層頁面，所有連結皆以新分頁開啟。

## 角色素材
`assets/img/` 為由角色設定圖裁切去背的 WebP（Allan 8 種表情、阿拉蕾 8 種表情與全身圖）。

## Allan's 資安島（`isms_island/`）
參考 HEART 政策島的互動 3D 島嶼地圖，網址為 `https://allanlo.123hi.org/isms_island/`，與首頁互不影響。
- 10 座六角島拼成盾牌形，每座島是一類資源；點島或用右側清單（可搜尋）開啟資源卡片，所有資源開新分頁。
- 島與島之間有 13 條「知識流」，島民沿著橋搬運情資、測驗卷等；「日誌」記錄每趟出發與抵達。
- 下方面板：ISMS 的一年（月份時間軸，示意排程）、學習路線、標準篩選（27001／27701／42001／TISAX／資通安全法）。
- 島嶼、資源、知識流、學習路線與年度排程都在 `isms_island/data.js`；首頁新增資源時，這裡也要一起補上。
- 可用網址錨點直接開啟某座島或知識流，例如 `isms_island/#intel`、`isms_island/#L3`。
- Three.js 0.170.0 放在 `isms_island/vendor/three/`（MIT 授權），不依賴外部 CDN；裝置不支援 WebGL 時改用平面六角地圖。

## 米數的資安島（`medsigtw-island/`）
給米數資科使用的資安島複本，網址為 `https://allanlo.123hi.org/medsigtw-island/`。
- 與 `isms_island/` 內容相同，差別：品牌改為「米數的資安島／米數資科」，顧問稱「米數顧問」、阿拉蕾稱「AI小助手」，總部島改連米數官網 `https://www.medsigtw.com/` 與資安業務信箱 `isms@medsigtw.com`。
- 連到外部頁面的資源（課程、測驗、遊戲、YouTube、個案）名稱維持原樣，與點進去的頁面一致。
- 資料夾自成一體（角色圖在 `medsigtw-island/img/`、Three.js 在 `vendor/`），整包複製到米數的網站也能直接使用。
- 兩座島各自有 `data.js`；資源有增減時，兩邊要一起更新。
