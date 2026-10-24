/* Allan's 資安島：島嶼、資源、知識流與學習路線
   資源連結與首頁 index.html 的 PORTALS／COURSES／FLOWS… 同源；首頁新增資源時，這裡也要一起補上。 */

export const SITE = "https://sites.google.com/123hi.org/isms/";
export const SHEET = "https://docs.google.com/spreadsheets/d/1lxBMegXKCiBZZpnD16WTp4hZm3P6tgvnH5lqQ5q1V0I";
export const HOME = "../";
const CASE_URL = "https://allanloplus.github.io/CASE/";

const site = p => /^(https?:|mailto:|#|\.\.?\/)/.test(p) ? p : SITE + p.split("/").map(encodeURIComponent).join("/");

/* 標準篩選用的代號 */
export const STANDARDS = [
  { id: "27001", t: "ISO 27001", d: "資訊安全管理" },
  { id: "27701", t: "ISO 27701", d: "隱私資訊管理" },
  { id: "42001", t: "ISO 42001", d: "AI 管理系統" },
  { id: "TISAX", t: "TISAX", d: "汽車產業資安" },
  { id: "CSMA", t: "資通安全法", d: "事件通報與稽核" }
];

/* row／col：盾牌形六角排列（第 0 排 4 座 → 第 3 排 1 座） */
export const ISLANDS = [
  {
    id: "hq", t: "Allan 總部", en: "HEADQUARTERS", ic: "🛡️", c: "#1d2f57", row: 1, col: 1, kind: "hq",
    d: "Allan 與阿拉蕾的基地：每月整理資安情資、錄製課程動畫、做 AI 小作品，全部從這裡出發。",
    say: ["allan-smile", "Allan", "資安不是一次性的專案，是每天、每月、每年的習慣。歡迎上島！"],
    iso: ["5.1 領導與承諾"],
    cta: ["🏠 回到 ISMS·普拉斯 首頁", HOME],
    items: [
      { t: "ISMS·普拉斯 首頁", d: "情資、課程、測驗、遊戲一頁看完", tag: "首頁", u: HOME, std: ["27001"] },
      { t: "ISMS 知識庫網站", d: "Google Sites 完整版", tag: "網站", u: SITE, std: ["27001", "27701", "42001", "TISAX", "CSMA"] },
      { t: "Allan's AI Map", d: "Allan 用 AI 做的全部作品", tag: "作品集", u: site("allans-ai-map") },
      { t: "來信與 Allan 討論", d: "allanlo.plus@gmail.com", tag: "Email", u: "mailto:allanlo.plus@gmail.com" }
    ]
  },
  {
    id: "intel", t: "資安情資港", en: "INTEL HARBOR", ic: "📡", c: "#e03131", row: 0, col: 1, kind: "harbor",
    d: "每月彙整 NICS、TWCERT、iThome、TechNews 等來源的漏洞與事件情報，下載即可留存作為稽核佐證。",
    say: ["arale-wow", "阿拉蕾", "情資點一下就能下載！記得對照資產清冊，評估對我們的影響喔。"],
    iso: ["A.5.7 威脅情資", "A.8.8 技術脆弱性管理"],
    cta: ["⬇️ 下載本月情資 Excel", `${SHEET}/export?format=xlsx`],
    items: [
      { t: "下載情資 Excel", d: "資安內外部情資蒐集紀錄_2026", tag: "Excel", u: `${SHEET}/export?format=xlsx`, std: ["27001"] },
      { t: "開啟線上情資表", d: "含各月份分頁", tag: "試算表", u: `${SHEET}/edit`, std: ["27001"] },
      { t: "情資作業動畫解說", d: "13 段動畫：情資蒐集、脆弱性識別、AI 風險排序到稽核證據", tag: "Lv.1", u: site("資安情資/資安情資作業動畫解說"), std: ["27001"] },
      { t: "內外部情資地圖", d: "內部事件與外部來源一張圖掌握", tag: "Lv.2", u: site("資安情資/內外部情資地圖"), std: ["27001"] },
      { t: "資安情資戰情室", d: "內外部情資、脆弱性與處置成效儀表板", tag: "Lv.3", u: site("資安情資/資安情資戰情室dashboard"), std: ["27001"] },
      { t: "情資官特訓營", d: "7 個關卡＋稽核大魔王，過關領結訓證書", tag: "Lv.4", u: site("資安情資/遊戲學習-情資官特訓營"), std: ["27001"] }
    ]
  },
  {
    id: "beacon", t: "情資燈塔", en: "SOURCE BEACON", ic: "🔭", c: "#1c7ed6", row: 0, col: 0, kind: "lighthouse",
    d: "島外的情資從這裡上岸：國家資通安全研究院、TWCERT/CC、各 ISAC 與資安媒體，是每月情資表的來源。",
    say: ["allan-point", "Allan", "情資來源要固定、可追溯；外部議題記得回饋到 4.1 組織全景。"],
    iso: ["A.5.6 與特殊關注團體聯繫", "4.1 組織全景"],
    cta: ["🌐 國家資通安全研究院", "https://www.nics.nat.gov.tw/"],
    items: [
      { t: "國家資通安全研究院", d: "漏洞新聞、漏洞公告", tag: "NICS", u: "https://www.nics.nat.gov.tw/", std: ["27001", "CSMA"] },
      { t: "TWCERT/CC", d: "資安新聞、通報", tag: "TW", u: "https://www.twcert.org.tw/", std: ["27001", "CSMA"] },
      { t: "H-ISAC", d: "衛福部資安資訊分享中心", tag: "H", u: "https://hisac.nat.gov.tw/", std: ["27001", "CSMA"] },
      { t: "F-ISAC", d: "金融資安資訊分享", tag: "F", u: "https://www.fisac.tw/", std: ["27001"] },
      { t: "iThome 資安", d: "資安日報、週報", tag: "iT", u: "https://www.ithome.com.tw/security", std: ["27001"] },
      { t: "TechNews 資安", d: "科技新報資安快報", tag: "TN", u: "https://infosecu.technews.tw/", std: ["27001"] },
      { t: "趨勢科技研究", d: "威脅研究報告", tag: "TM", u: "https://www.trendmicro.com/zh_tw/research.html", std: ["27001"] },
      { t: "政府機關資安月報", d: "數位發展部資通安全署", tag: "月報", u: "https://moda.gov.tw/ACS/press/report/670", std: ["CSMA"] }
    ]
  },
  {
    id: "cinema", t: "動畫影城", en: "NOW SHOWING", ic: "🎬", c: "#0c8599", row: 0, col: 2, kind: "cinema",
    d: "由 Allan 與阿拉蕾主演的完整線上課程：ISO 27001、27701、42001、TISAX 與資通安全法。",
    say: ["arale-explain", "阿拉蕾", "阿拉蕾幫腔上課囉！先看 3 分鐘入門，再挑完整課程～"],
    iso: ["A.6.3 資安認知、教育及訓練", "7.3 認知"],
    cta: ["▶ 先看 3 分鐘和 ISO27001", site("課程動畫/3分鐘和iso27001")],
    items: [
      { t: "ISO27001 完整線上互動教材", d: "條文與控制措施互動學習", tag: "互動教材", u: site("課程動畫/iso27001完整線上互動教材"), std: ["27001"] },
      { t: "ISO27701 完整線上課程", d: "隱私資訊管理系統", tag: "隱私管理", u: site("課程動畫/iso27701完整線上課程"), std: ["27701"] },
      { t: "ISO42001 完整線上課程", d: "AI 管理系統", tag: "AI 管理", u: site("課程動畫/iso42001完整線上課程"), std: ["42001"] },
      { t: "TISAX 要求完整解說", d: "汽車產業資安評估", tag: "汽車產業", u: site("課程動畫/tisax要求完整解說"), std: ["TISAX"] },
      { t: "3 分鐘和 ISO27001", d: "第一次接觸 ISMS 從這裡開始", tag: "快速入門", u: site("課程動畫/3分鐘和iso27001"), std: ["27001"] },
      { t: "用心智圖了解 ISO27001", d: "一張圖看懂條文架構", tag: "心智圖", u: site("課程動畫/用心智圖了解iso27001"), std: ["27001"] },
      { t: "Allan 的年度資安宣導", d: "全員資安教育訓練", tag: "年度必修", u: site("課程動畫/allan的年度資安宣導"), std: ["27001", "CSMA"] },
      { t: "資通安全法－資安事件通報", d: "事件分級與通報時限", tag: "事件通報", u: site("課程動畫/資通安全法-資安事件通報"), std: ["CSMA"] }
    ]
  },
  {
    id: "flow", t: "ISMS 流程步道", en: "ISMS JOURNEY", ic: "🗺️", c: "#5f3dc4", row: 1, col: 2, kind: "trail",
    d: "A01–A15 十五站運作流程，一站一支動畫：從治理、資產、存取，一路走到事件管理與遵循性。",
    say: ["arale-think", "阿拉蕾", "跟我一起走完 15 站，一站一支動畫，看懂整個 ISMS！"],
    iso: ["4.4 ISMS", "附錄 A 控制措施"],
    cta: ["🚶 從 A01 治理出發", ""],
    items: [["治理", "🏛️"], ["人員安全", "👥"], ["資訊保護", "🔐"], ["資產管理", "📦"], ["存取管理", "🔑"], ["保全組態", "⚙️"], ["實體安全", "🏢"],
      ["威脅與弱點管理", "🛡️"], ["應用程式安全", "🧩"], ["系統與網路安全", "🌐"], ["供應者安全管理", "🤝"], ["資安事件管理", "🚨"], ["持續性", "♻️"], ["資訊安全保證", "✅"], ["遵循性", "📜"]]
      .map(([f, ic], i) => {
        const no = String(i + 1).padStart(2, "0");
        return { t: `${f}流程`, m: `A${no} ${f}`, d: `${ic} 第 ${i + 1} 站流程動畫解說`, tag: `A${no}`, u: site(`課程動畫/isms運作流程課程解說/a${no}_${f}流程`), std: ["27001"] };
      })
  },
  {
    id: "cases", t: "個案偵探社", en: "CASE ROOM", ic: "🕵️", c: "#9c5a24", row: 1, col: 0, kind: "detective",
    d: "真實資安事件改編的企業個案：動畫閱讀、討論互動、決策模擬，每案約 90 分鐘。",
    say: ["allan-think", "Allan", "先別急著找兇手，先問：哪一道控制措施沒有發揮作用？"],
    iso: ["A.5.24–A.5.28 事件管理", "10.2 矯正措施"],
    cta: ["🔍 進入資安個案研究室", site("ai寫的個案/資安個案研究室")],
    items: [
      ["S115001", "總經理先看到新聞：PHP2Shell 情資應變的 48 小時", "PHP2Shell 重大漏洞外洩與緊急修補", "PHP2Shell 48 小時"],
      ["S111001", "倒數十天：艾倫建設的勒索軟體風暴", "上市公司遭勒索軟體攻擊，海量資料遭洩", "勒索軟體風暴"],
      ["S111002", "補丁之後：艾倫普拉斯科技的 Log4j 供應鏈風暴", "Log4j 重大資安漏洞揭露半年後仍不可大意", "Log4j 供應鏈風暴"],
      ["S111003", "沒收回的那把鑰匙：艾倫普拉斯傳媒的跨年直播危機", "離職員工偷刪前東家資料，該當何罪？", "沒收回的鑰匙"],
      ["S111004", "畫面不能重拍：曦光傳媒的片庫歸零事件", "電視台新聞片庫慘遭協力廠商刪除", "片庫歸零事件"],
      ["S111005", "起飛之前：艾倫普拉斯科技的營業秘密保衛戰", "離職時請別帶走公司的營業秘密", "營業秘密保衛戰"]
    ].map(([id, t, o, m]) => ({ t, m, d: `改編自：${o}`, tag: id, u: `${CASE_URL}#${id}-read`, alt: ["💬 討論", `${CASE_URL}#${id}-discuss`], std: id === "S115001" ? ["27001", "CSMA"] : ["27001"] }))
  },
  {
    id: "park", t: "ISMS 主題樂園", en: "THEME PARK", ic: "🎡", c: "#2f9e44", row: 2, col: 1, kind: "park",
    d: "ISMS 工作觀：用動畫、地圖和遊戲，玩出對 ISMS 一整年的整體感。",
    say: ["allan-laugh", "Allan", "每天像刷牙、每月像量血壓、每年像全身健檢——這就是 ISMS 的節奏。"],
    iso: ["9.1 監督與量測", "PDCA"],
    cta: ["🗓️ 先看「ISMS 的一年」", site("isms工作觀/isms工作的一年")],
    items: [
      { t: "ISMS 的一年", d: "每天、每月、每年的 ISMS 工作節奏", tag: "動畫", u: site("isms工作觀/isms工作的一年"), std: ["27001"] },
      { t: "ISMS 工作地圖", d: "時間、流程、工作類別三種視角", tag: "互動動畫", u: site("isms工作觀/isms工作地圖"), std: ["27001"] },
      { t: "ISMS 資安小鎮", d: "點建築，認識各部門的 ISMS 工作與稽核準備度", tag: "互動地圖", u: site("isms工作觀/isms資安小鎮"), std: ["27001"] },
      { t: "ISMS 大富翁", d: "擲骰子走完資安一年，年底外部稽核拿驗證", tag: "桌遊 1～4 人", u: site("isms工作觀/isms大富翁遊戲"), std: ["27001"] },
      { t: "實體安全大冒險", d: "探索 16 個 A.7 實體安全控制項", tag: "自由探索", u: site("isms工作觀/實體安全大冒險"), std: ["27001"] }
    ]
  },
  {
    id: "quiz", t: "測驗學園", en: "QUIZ ACADEMY", ic: "📝", c: "#f08c00", row: 2, col: 0, kind: "school",
    d: "上完課來挑戰！ISMS 導入、資安課程、ISMS Auditor 與 IT 知識四套課後測驗。",
    say: ["arale-cheer", "阿拉蕾", "答對就能拿到阿拉蕾的讚 👍 不會的題目回去看動畫再來！"],
    iso: ["7.2 適任性", "9.2 內部稽核"],
    cta: ["🕵️ 挑戰 ISMS Auditor 測驗", site("課後測驗專區/isms-auditor知識測驗")],
    items: [
      { t: "ISMS 導入專案課後測驗", d: "導入專案各階段重點", tag: "測驗", u: site("課後測驗專區/isms導入專案課後測驗"), std: ["27001"] },
      { t: "資安課程課後測驗", d: "年度資安教育訓練", tag: "測驗", u: site("課後測驗專區/資安課程課後測驗"), std: ["27001", "CSMA"] },
      { t: "ISMS Auditor 知識測驗", d: "內部稽核員的條文與實務", tag: "測驗", u: site("課後測驗專區/isms-auditor知識測驗"), std: ["27001"] },
      { t: "Allan's IT 知識測驗", d: "企業 MIS 與 IT 基礎", tag: "測驗", u: site("課後測驗專區/allans-it知識測驗") }
    ]
  },
  {
    id: "library", t: "資源圖書館", en: "LIBRARY", ic: "📚", c: "#d6336c", row: 0, col: 3, kind: "library",
    d: "教學網站、條文解說簡報、上課影音與技術文章，想深入讀的都在這裡。",
    say: ["allan-wink", "Allan", "條文看不懂？先看解說簡報，再回頭對照標準原文。"],
    iso: ["7.2 適任性", "7.5 文件化資訊"],
    cta: ["▶ YouTube－AllanLo", "https://www.youtube.com/channel/UCnsy7Lewl-4BIw4T5J2vV4Q"],
    items: [
      { t: "ISO27001 教學資源", d: "教學網站", tag: "27001", u: "https://sites.google.com/123hi.org/iso27001/", std: ["27001"] },
      { t: "ISO27701 教學資源", d: "條文解說簡報", tag: "27701", u: "https://sites.google.com/view/allanlo-iso27701/iso27701%E6%A2%9D%E6%96%87%E8%A7%A3%E8%AA%AA%E7%B0%A1%E5%A0%B1", std: ["27701"] },
      { t: "TISAX 教學資源", d: "汽車產業資安", tag: "TX", u: "https://sites.google.com/123hi.org/tisax/", std: ["TISAX"] },
      { t: "ISMS 系統化展示", d: "系統實作範例", tag: "展示", u: "https://sites.google.com/view/allantest001/", std: ["27001"] },
      { t: "YouTube－AllanLo", d: "上課影音", tag: "影音", u: "https://www.youtube.com/channel/UCnsy7Lewl-4BIw4T5J2vV4Q" },
      { t: "iT 邦幫忙文章", d: "Allan 的技術文章", tag: "文章", u: "https://ithelp.ithome.com.tw/users/20151950/articles" },
      { t: "資安教學影音整理", d: "分類影音資源", tag: "影音", u: site("教學資源/allan的資安教學分類影音資源整理"), std: ["27001"] }
    ]
  },
  {
    id: "arcade", t: "AI 遊樂場", en: "BREAK TIME", ic: "🕹️", c: "#be4bdb", row: 3, col: 0, kind: "arcade",
    d: "下課時間！Allan 用 AI 做的遊戲與小作品，有幾款偷偷藏了資安梗。",
    say: ["arale-laugh", "阿拉蕾", "鐵支＝零時差攻擊？♠Q 是勒索豬？玩了就知道！"],
    iso: [],
    cta: ["🤖 看 Allan's AI Map 全部作品", site("allans-ai-map")],
    items: [
      { t: "ALLAN 家族說故事劇場", d: "《花草派》手繪繪本，Allan 家族重新配音", tag: "繪本", u: "https://allanloplus.github.io/picture-book99/" },
      { t: "跟著 Allan 走一趟特富野古道", d: "鄒族獵徑、運材鐵道與古道小遊戲", tag: "古道", u: "https://allanloplus.github.io/Tefuye_Historic_Trail/" },
      { t: "Allan 與阿拉蕾的橋牌桌", d: "和阿拉蕾搭檔，對抗駭客小黑與釣魚怪", tag: "橋牌", u: "https://allanloplus.github.io/bridge/" },
      { t: "Allan 的拱豬夜市", d: "♠Q 是勒索豬，♦J 是資安預算羊", tag: "拱豬", u: "https://allanloplus.github.io/Gong_Zhu/" },
      { t: "Allan's 資安大老二", d: "環島攻防戰：鐵支＝零時差攻擊", tag: "大老二", u: "https://allanloplus.github.io/big2/" },
      { t: "資安大富翁－快樂遊台灣", d: "22 縣市環島，把韌性指數推到 100%", tag: "大富翁", u: "https://allanloplus.github.io/Monopoly/" },
      { t: "Allan 在哪裡？要吃甚麼？", d: "阿拉蕾從 373 道台灣美食幫你挑", tag: "美食", u: "https://allanloplus.github.io/What-to-eat/" }
    ]
  }
];
ISLANDS.forEach((s, i) => { s.no = String(i + 1).padStart(2, "0"); });
/* 流程步道的 CTA 指向 A01 */
ISLANDS.find(s => s.id === "flow").cta[1] = ISLANDS.find(s => s.id === "flow").items[0].u;

/* 知識流：島民沿著這些線搬運東西 */
export const FLOWS = [
  { from: "beacon", to: "intel", t: "外部情資匯入情資表", carry: "漏洞公告", ci: "📰", iso: "A.5.7", d: "NICS、TWCERT 等來源每月彙整進「資安內外部情資蒐集紀錄」。" },
  { from: "intel", to: "flow", t: "高風險漏洞走修補流程", carry: "修補工單", ci: "🛠️", iso: "A.8.8", d: "情資中碰到高風險漏洞，走 A08 威脅與弱點管理的修補流程。" },
  { from: "intel", to: "cases", t: "情資改編成個案", carry: "事件卷宗", ci: "📁", iso: "A.5.7", d: "「PHP2Shell 情資應變的 48 小時」就是從情資表長出來的個案。" },
  { from: "cinema", to: "quiz", t: "看完動畫做測驗", carry: "測驗卷", ci: "📝", iso: "7.2", d: "課程動畫看完，到測驗學園檢查學習成果。" },
  { from: "flow", to: "quiz", t: "走完流程考 Auditor", carry: "稽核檢核表", ci: "📋", iso: "9.2", d: "A01–A15 走完一輪，用 ISMS Auditor 知識測驗模擬內部稽核。" },
  { from: "library", to: "cinema", t: "教學網站配課程動畫", carry: "講義", ci: "📚", iso: "7.2", d: "條文解說簡報與教學網站，搭配動畫一起看更好懂。" },
  { from: "park", to: "flow", t: "從整體感到逐站深入", carry: "工作地圖", ci: "🗺️", iso: "4.4", d: "先在樂園看懂 ISMS 一整年，再到步道逐站看流程動畫。" },
  { from: "cases", to: "flow", t: "個案對照控制措施", carry: "改善建議", ci: "💡", iso: "10.2", d: "討論個案時，回頭找出對應的流程站與控制措施。" },
  { from: "quiz", to: "arcade", t: "過關去下課", carry: "過關徽章", ci: "🏅", iso: "", d: "測驗過關，去 AI 遊樂場放鬆一下。" },
  { from: "hq", to: "intel", t: "Allan 每月整理情資", carry: "情資 Excel", ci: "📊", iso: "A.5.7", d: "每個月 Allan 整理情資，更新到情資表給客戶下載。" },
  { from: "hq", to: "cinema", t: "錄製課程動畫", carry: "動畫腳本", ci: "🎬", iso: "A.6.3", d: "Allan 與阿拉蕾把艱澀條文變成好懂的動畫。" },
  { from: "beacon", to: "hq", t: "外部議題回饋組織全景", carry: "外部議題", ci: "🌐", iso: "4.1", d: "外部情資也是外部議題，回饋到治理與 4.1 組織全景。" },
  { from: "arcade", to: "hq", t: "AI 小作品收進 AI Map", carry: "新作品", ci: "🤖", iso: "", d: "每一款 AI 小作品，最後都收進 Allan's AI Map。" }
];
FLOWS.forEach((f, i) => { f.id = `L${i + 1}`; });

/* 學習路線：依身分推薦的島嶼順序 */
export const PATHS = [
  { id: "new", ic: "🌱", t: "ISMS 新手", steps: ["cinema", "park", "flow", "quiz"], d: "3 分鐘入門 → 主題樂園看整體 → 流程步道逐站 → 課後測驗" },
  { id: "intel", ic: "🎖️", t: "情資官", steps: ["beacon", "intel", "cases", "flow"], d: "認識情資來源 → 下載情資 → 個案演練 → A08 修補流程" },
  { id: "audit", ic: "🕵️", t: "內部稽核員", steps: ["flow", "cases", "library", "quiz"], d: "流程 15 站 → 個案找缺失 → 條文簡報 → Auditor 測驗" },
  { id: "privacy", ic: "🔐", t: "隱私・AI 治理", steps: ["cinema", "library", "quiz"], d: "27701／42001 課程 → 條文解說 → 課後測驗" },
  { id: "tisax", ic: "🚗", t: "TISAX 汽車業", steps: ["library", "cinema", "flow"], d: "TISAX 教學資源 → 要求完整解說 → 對照流程" },
  { id: "fun", ic: "🎮", t: "下課放鬆", steps: ["park", "arcade"], d: "ISMS 大富翁 → AI 遊樂場" }
];

/* ISMS 的一年（示意排程，實際依各組織年度計畫調整） */
export const YEAR_PLAN = [
  { t: "年度計畫", d: "訂定年度資安目標（6.2）與教育訓練計畫", isl: ["hq", "cinema"] },
  { t: "資產盤點・風險評鑑", d: "更新資產清冊（A.5.9），執行風險評鑑（6.1.2）", isl: ["flow", "park"] },
  { t: "資安宣導", d: "全員資安教育訓練與課後測驗（A.6.3）", isl: ["cinema", "quiz"] },
  { t: "供應者管理", d: "供應者評鑑與委外管理（A.5.19–A.5.22）", isl: ["flow", "cases"] },
  { t: "弱點管理", d: "弱點掃描與修補，追蹤情資中的高風險漏洞（A.8.8）", isl: ["intel", "flow"] },
  { t: "營運持續演練", d: "備份還原與營運持續演練（A.5.30、A.8.13），參考勒索軟體個案", isl: ["flow", "cases"] },
  { t: "社交工程演練", d: "釣魚郵件演練與宣導，複習年度資安宣導", isl: ["cinema", "quiz"] },
  { t: "權限審查", d: "帳號與存取權限審查、離職帳號清查（A.5.18、A.6.5）", isl: ["flow", "cases"] },
  { t: "內部稽核", d: "依 9.2 執行內部稽核，先用 Auditor 測驗暖身", isl: ["quiz", "flow"] },
  { t: "管理審查", d: "矯正措施追蹤（10.2）與管理審查（9.3）", isl: ["hq", "library"] },
  { t: "外部稽核", d: "驗證／追查稽核：備妥紀錄與佐證，含每月情資紀錄", isl: ["intel", "park"] },
  { t: "年度檢討", d: "檢討成效、規劃明年。辛苦一年，下課囉！", isl: ["hq", "arcade"] }
];

/* 島民角色（搬運知識流的小人） */
export const ROLES = [
  { t: "顧問", c: "#1d2f57" }, { t: "稽核員", c: "#495057" }, { t: "資安長", c: "#c92a2a" },
  { t: "工程師", c: "#0c8599" }, { t: "情資官", c: "#5f3dc4" }, { t: "學員", c: "#f08c00" }, { t: "承辦人", c: "#2f9e44" }
];
