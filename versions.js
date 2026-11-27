/* 首頁版本切換（頁尾）。每個首頁版本放一行；目前的預設首頁 file 寫 "./"（它就是 index.html）。
   頁面只要放 <div id="verSwitch" data-current="版本 id"></div> 並載入本檔，就會出現切換列。
   換預設首頁、新增版本的步驟見 CLAUDE.md「首頁版本」。 */
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
  css.textContent = "#verSwitch{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;margin:14px 0 0;font-size:13px;line-height:1.3}" +
    "#verSwitch a,#verSwitch b{display:inline-block;padding:4px 12px;border:1.5px solid currentColor;border-radius:999px;font-weight:700;text-decoration:none;color:inherit}" +
    "#verSwitch a{opacity:.75}#verSwitch a:hover{opacity:1;background:rgba(127,127,127,.18)}" +
    "#verSwitch b{background:rgba(127,127,127,.28)}";
  document.head.appendChild(css);
  box.setAttribute("aria-label", "切換首頁風格");
  box.innerHTML = "<span>首頁風格</span>" + window.HOME_VERSIONS.map(function (v) {
    var label = v.emo + " " + v.name;
    return v.id === cur ? '<b aria-current="page">' + label + " ✓</b>" : '<a href="' + v.file + '" target="_self">' + label + "</a>";
  }).join("");
})();
