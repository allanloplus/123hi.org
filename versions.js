/* 首頁版本切換列（每頁最上方，Allan 指定要醒目、不低調）。每個首頁版本放一行；目前的預設首頁 file 寫 "./"（它就是 index.html）。
   頁面在頁尾放 <div id="verSwitch" data-current="版本 id"></div> 並載入本檔：切換列畫在頁面最上方、這個框隱藏，並在它的位置加上頁尾署名「創意設計：Allan Lo」。
   換預設首頁、新增版本的步驟見 CLAUDE.md「首頁版本」。順序就是切換列的順序，經典版固定放最後。 */
window.HOME_VERSIONS = [
  { id: "sticker", emo: "🎨", name: "貼紙漫畫版", file: "./" },
  { id: "taiwan", emo: "🚆", name: "台灣環島版", file: "home-taiwan.html" },
  { id: "sakura", emo: "🌸", name: "賞櫻風格版", file: "home-sakura.html" },
  { id: "poem", emo: "🖌️", name: "詩情畫意版", file: "home-poem.html" },
  { id: "tarot", emo: "🔮", name: "塔羅牌版", file: "home-tarot.html" },
  { id: "alien", emo: "👽", name: "外星人風格版", file: "home-alien.html" },
  { id: "classic", emo: "🌌", name: "經典版", file: "home-classic.html" }   /* Allan 指定：經典版放最後 */
];
(function () {
  var box = document.getElementById("verSwitch"); if (!box) return;
  var cur = box.dataset.current, css = document.createElement("style");
  css.textContent =
    "#verBar{position:relative;z-index:60;display:flex;align-items:center;gap:10px;padding:7px 14px;background:linear-gradient(90deg,#1b1630,#2b2148 50%,#1b1630);color:#fff;font:600 13.5px/1.3 'Noto Sans TC',system-ui,-apple-system,'Microsoft JhengHei',sans-serif;box-shadow:0 2px 12px rgba(0,0,0,.28);border-bottom:2px solid #ffd166}" +
    "#verBar .vl{flex:none;display:flex;align-items:center;gap:6px;letter-spacing:.08em;color:#ffd166;white-space:nowrap}" +
    "#verBar .vl i{font-style:normal;font-size:16px}" +
    "#verBar .vs{display:flex;gap:6px;flex:1;min-width:0;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding:1px 0}" +
    "#verBar .vs::-webkit-scrollbar{display:none}" +
    "#verBar .vs>:first-child{margin-left:auto}#verBar .vs>:last-child{margin-right:auto}" +
    "#verBar a,#verBar b{flex:none;display:inline-flex;align-items:center;gap:4px;padding:5px 13px;border:1px solid rgba(255,255,255,.35);border-radius:999px;white-space:nowrap;text-decoration:none;color:#fff;font-weight:700;transition:background .15s,border-color .15s}" +
    "#verBar a:hover{background:rgba(255,255,255,.14);border-color:#fff}" +
    "#verBar b{background:#ffd166;border-color:#ffd166;color:#1b1630}" +
    "#verSwitch{display:none!important}" +
    "#verCredit{margin:14px 0 0;text-align:center;font-size:13px;letter-spacing:.12em;opacity:.8}" +
    "#verCredit b{font-weight:700;letter-spacing:.06em}" +
    "@media (max-width:760px){#verBar{padding:6px 10px;gap:8px;font-size:12.5px}#verBar .vl span{display:none}#verBar a,#verBar b{padding:4px 11px}}";
  document.head.appendChild(css);
  var bar = document.createElement("nav");
  bar.id = "verBar"; bar.setAttribute("aria-label", "切換首頁風格");
  bar.innerHTML = '<span class="vl"><i>🏠</i><span>首頁風格</span></span><div class="vs">' + window.HOME_VERSIONS.map(function (v) {
    var label = v.emo + " " + v.name;
    return v.id === cur ? '<b aria-current="page">' + label + "</b>" : '<a href="' + v.file + '" target="_self">' + label + "</a>";
  }).join("") + "</div>";
  document.body.insertBefore(bar, document.body.firstChild);
  /* 頁尾署名（Allan 指定）：放在原本頁尾切換框的位置，顏色跟隨各頁頁尾 */
  var credit = document.createElement("p");
  credit.id = "verCredit"; credit.innerHTML = "創意設計：<b>Allan Lo</b>";
  box.parentNode.insertBefore(credit, box.nextSibling);
  /* 手機：切換列可左右滑動，先把目前這一版捲進畫面 */
  var list = bar.querySelector(".vs"), on = bar.querySelector("b");
  if (on && list.scrollWidth > list.clientWidth) list.scrollLeft = on.offsetLeft - list.clientWidth / 2 + on.offsetWidth / 2;
})();
