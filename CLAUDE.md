# 123hi.org 工作規則（給 Claude）

## 分支與發佈（重要）
- GitHub Pages 從 **`main`** 分支、根目錄發佈，自訂網域 **https://allanlo.123hi.org/**（由 `CNAME` 檔設定，勿刪；舊網址 allanloplus.github.io/123hi.org/ 會自動轉址）。資安島：https://allanlo.123hi.org/isms_island/，米數版：https://allanlo.123hi.org/medsigtw-island/
- 網站擁有者 Allan 已授權：**每次更新完成後，直接合併並推送到 `main`**，不需要再詢問。
  - 若工作分支不是 `main`：先 `git fetch origin main`，把 `origin/main` 合併進工作分支（或在 `main` 上合併工作分支），確認無衝突、頁面正常後 `git push origin HEAD:main`；工作分支也一併推送，保持兩者一致。
  - 不可 force push `main`；遇到衝突時保留雙方內容，無法判斷才詢問。
- 推送後到 Actions 確認「pages build and deployment」成功。若 deploy 失敗並顯示「due to in progress deployment. Please cancel <較舊的 commit> first」，是 GitHub 端把舊部署卡在「進行中」（該舊部署的 workflow 其實已成功），與程式無關；網站會維持前一版。等 GitHub 自行解除後，到該次 run 按 Re-run failed jobs，或再推送一次即可。不要連續推送，以免每次都寄失敗通知信。
- 原因：曾有多個對話各自推送到不同分支，Pages 來源在分支間切換，導致網站沒更新或變回舊版。

## 結構
- `index.html`：首頁（Google Sites「整頁嵌入」用）。各區塊資料在底部 `<script>` 的陣列（PORTALS、COURSES、LEVELS、PARK、CASES、ARCADE、QUIZ、RES、SRC…）。
- `isms_island/`：Allan's 資安島（3D 資源島），資源清單在 `isms_island/data.js`；首頁新增資源時這裡也要補。
- `medsigtw-island/`：米數資科客製版資安島。**`isms_island/data.js` 新增資源時，這裡也要同步加入**（人物改「米數顧問／AI小助手」，連到外部作品的名稱維持原樣，總部連米數官網）。
- 資安島快取：兩座島的 `index.html`（`island.css?v=`、`app.js?v=`）與 `app.js`（`data.js?v=`、`scene.js?v=`）都帶版本號。**每次修改島的檔案，就把兩座島的版本號一起換成新值**（例如日期＋字母 `20261101b`），否則瀏覽器與 Google Sites 嵌入框會沿用舊的 data.js。
- `assets/img/`：Allan 與阿拉蕾角色素材。

## 更新前後檢查
- 新增連結前，先抓 https://sites.google.com/123hi.org/isms/ 的選單比對實際網址。
- 嵌入的 GitHub 作品可 clone `https://github.com/allanloplus/<repo>` 讀內容（預設分支多半是 `claude/...`，不是 `main`）。
- 推送前確認：桌機／手機無橫向捲動、手機嵌入框（約 390×575）精簡卡片正常、站內連結都回應 200。
