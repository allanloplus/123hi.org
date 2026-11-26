# 123hi.org 工作規則（給 Claude）

## 分支與發佈（重要）
- GitHub Pages 從 **`main`** 分支、根目錄發佈，自訂網域 **https://allanlo.123hi.org/**（由 `CNAME` 檔設定，勿刪；舊網址 allanloplus.github.io/123hi.org/ 會自動轉址）。資安島：https://allanlo.123hi.org/isms_island/，米數版：https://allanlo.123hi.org/medsigtw-island/
- 網站擁有者 Allan 已授權：**每次更新完成後，直接合併並推送到 `main`**，不需要再詢問。
  - 若工作分支不是 `main`：先 `git fetch origin main`，把 `origin/main` 合併進工作分支（或在 `main` 上合併工作分支），確認無衝突、頁面正常後 `git push origin HEAD:main`；工作分支也一併推送，保持兩者一致。
  - 不可 force push `main`；遇到衝突時保留雙方內容，無法判斷才詢問。
- 推送後到 Actions 確認「pages build and deployment」成功。若 deploy 失敗並顯示「due to in progress deployment. Please cancel <較舊的 commit> first」，是 GitHub 端把舊部署卡在「進行中」（該舊部署的 workflow 其實已成功），與程式無關；網站會維持前一版。等 GitHub 自行解除後，到該次 run 按 Re-run failed jobs，或再推送一次即可。不要連續推送，以免每次都寄失敗通知信。
- 原因：曾有多個對話各自推送到不同分支，Pages 來源在分支間切換，導致網站沒更新或變回舊版。

## 結構
- **首頁版本**（頁尾可切換，清單在 `versions.js`）：
  - `index.html`：**預設首頁＝貼紙漫畫版**（Google Sites「整頁嵌入」用）。舞台上 Allan 與阿拉蕾對話＋八個分類分頁（`TABS`），內容不往下堆疊。
  - `home-classic.html`：經典版（深藍長頁，含 Google Sites 手機嵌入框的精簡卡片）。Allan 指定保留。
  - 各版的資料陣列（LEVELS、COURSES、PARK、CASES、NEWS、ARCADE、QUIZ、RES、SRC…）與情資下載邏輯內容相同，**增修資源或情資邏輯時，每個版本都要同步**。
  - **預設首頁由 Allan 決定**，沒有他的指示不要更換。訪客在頁尾切換只是連到另一個檔案，不會記住選擇。
  - 新增版本：做成 `home-<名稱>.html`，頁尾放 `<div id="verSwitch" data-current="<id>"></div>` 並載入 `versions.js`，再到 `versions.js` 加一行。
  - 更換預設：把現在的 `index.html` 改名為 `home-<它的名稱>.html`、把新預設改名為 `index.html`，並更新 `versions.js` 的 `file`（預設寫 `"./"`）與本段說明。
- `isms_island/`：Allan's 資安島（3D 資源島），資源清單在 `isms_island/data.js`；首頁新增資源時這裡也要補。
- `medsigtw-island/`：米數資科客製版資安島。**`isms_island/data.js` 新增資源時，這裡也要同步加入**（人物改「米數顧問／AI小助手」，連到外部作品的名稱維持原樣，總部連米數官網）。
- 資安島快取：兩座島的 `index.html`（`island.css?v=`、`app.js?v=`）與 `app.js`（`data.js?v=`、`scene.js?v=`）都帶版本號。**每次修改島的檔案，就把兩座島的版本號一起換成新值**（例如日期＋字母 `20261101b`），否則瀏覽器與 Google Sites 嵌入框會沿用舊的 data.js。
- `assets/img/`：Allan 與阿拉蕾角色素材。

## 情資來源（2026/11/26 起）
- 情資改由 **資安內外部情資蒐集紀錄** 網站提供：repo `allanloplus/intelligence`，https://allanloplus.github.io/intelligence/ （每日自動蒐集；知識庫選單頁為「資安情資/資安情資蒐集紀錄」）。客戶每月下載從這裡，**不再使用 Google 試算表**。
- 它發佈 `data/index.json`（各年度／月份的筆數、資料檔與 Excel 路徑）、`data/YYYY-MM.json`、`downloads/intel-YYYY-MM.xlsx`（每月）、`downloads/intel-YYYY.xlsx`（全年度），皆可跨網域讀取。
- 首頁情資區（各版首頁最後一段 script）讀 `index.json`。統計、焦點 3 則、跑馬燈顯示最近有資料的月份；**主要下載按鈕是客戶要留存的「完整月份」：每月 1–15 日為上個月，16 日起換成本月（累計中）**，另一個月份放在旁邊的次要按鈕（Allan 指定：月初客戶要下載的是上個月）。首頁不放全年度 Excel 與歷年情資（Allan 指定；需要時到查詢與下載專區）。跨年度不需改程式。測試可加 `?today=2026-12-03`。
- 兩座資安島的情資港只連到知識庫的「資安情資蒐集紀錄」頁，不含年度設定。
- 「情資戰情看板」按鈕連到新網站首頁（即其戰情看板分頁）；舊的 `allanlo-g/threat-intel-warroom`（讀 Google 試算表）已不再連結。

## 更新前後檢查
- 選單「Allan's Tools」底下的項目（Allan's AI Map、隨意畫流程圖等）**不放進首頁與資安島**（Allan 指定）。
- 新增連結前，先抓 https://sites.google.com/123hi.org/isms/ 的選單比對實際網址。
- 嵌入的 GitHub 作品可 clone `https://github.com/allanloplus/<repo>` 讀內容（預設分支多半是 `claude/...`，不是 `main`）。
- 推送前確認：桌機／手機無橫向捲動、手機嵌入框（約 390×575）精簡卡片正常、站內連結都回應 200。
