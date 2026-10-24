/* Allan's 資安島：介面（清單、卡片、時間軸、日誌、導覽）
   3D 場景載入失敗（例如裝置不支援 WebGL）時改用平面六角地圖，清單與卡片照常可用。 */
import { ISLANDS, FLOWS, PATHS, YEAR_PLAN, STANDARDS, ROLES } from "./data.js";

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobile = matchMedia("(max-width: 800px)");
const IMG = "../assets/img/";
const app = $("#app");
const byId = Object.fromEntries(ISLANDS.map(s => [s.id, s]));
const flowById = Object.fromEntries(FLOWS.map(f => [f.id, f]));
const store = {
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* 私密模式 */ } }
};
const ext = (u, inner, cls = "") => `<a class="${cls}" href="${esc(u)}" target="_blank" rel="noopener">${inner}</a>`;
const isl = id => `${byId[id].no} ${esc(byId[id].t)}`;
const TOTAL = ISLANDS.reduce((n, s) => n + s.items.length, 0);

let world = null;
const W = (fn, ...a) => world?.[fn]?.(...a);
const state = { sel: null, flow: null, item: null, sideTab: "islands", q: "", filter: null, month: new Date().getMonth(), path: null, stds: new Set(), ctrlTab: "year" };

/* ================= 側邊清單 ================= */
$("#sideSum").innerHTML = `${ISLANDS.length} 座主題島 ／ ${TOTAL} 項資源 ／ ${FLOWS.length} 條知識流<br>選一座島，走進它的資源風景。`;
$("#tabFlows").textContent = `知識流 ${FLOWS.length}`;
$("#tabIslands").textContent = `主題島 ${ISLANDS.length}`;

function hl(text, q) {
  const t = esc(text);
  if (!q) return t;
  const i = text.toLowerCase().indexOf(q);
  return i < 0 ? t : esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
}
function renderTree() {
  const q = state.q.trim().toLowerCase(), tree = $("#tree");
  if (state.sideTab === "flows") {
    const list = FLOWS.filter(f => !q || [f.id, f.t, f.carry, f.d, byId[f.from].t, byId[f.to].t, f.iso].join(" ").toLowerCase().includes(q));
    tree.innerHTML = list.map(f => `<button class="row flow ${state.flow === f.id ? "on" : ""}" data-flow="${f.id}" style="--c:${byId[f.from].c}">
      <span class="no">${f.id}</span><span class="nm"><b>${hl(f.t, q)}</b><small>${esc(byId[f.from].t)} → ${esc(byId[f.to].t)} · ${f.ci} ${esc(f.carry)}</small></span><span class="ct">↗</span></button>`).join("")
      || `<div class="empty">找不到符合「${esc(state.q)}」的知識流</div>`;
    return;
  }
  const html = ISLANDS.map(s => {
    const hitIsland = !q || [s.t, s.en, s.d, ...s.iso].join(" ").toLowerCase().includes(q);
    const items = q ? s.items.map((it, i) => [it, i]).filter(([it]) => [it.t, it.d, it.tag].join(" ").toLowerCase().includes(q)) : [];
    if (!hitIsland && !items.length) return "";
    return `<button class="row isl ${state.sel === s.id ? "on" : ""}" data-isl="${s.id}" style="--c:${s.c}">
      <span class="no">${s.no}</span><span class="nm"><b>${s.ic} ${hl(s.t, q)}</b><small>${esc(s.en)}</small></span><span class="ct">${s.items.length} ↗</span></button>`
      + items.map(([it, i]) => `<button class="row sub" data-isl="${s.id}" data-i="${i}" style="--c:${s.c}"><span class="dot"></span>
      <span class="nm"><b>${hl(it.t, q)}</b><small>${esc(it.tag)} · ${hl(it.d, q)}</small></span></button>`).join("");
  }).join("");
  tree.innerHTML = html || `<div class="empty">找不到符合「${esc(state.q)}」的資源<br>試試「情資」、「27701」、「稽核」</div>`;
}
$("#tree").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.flow) openFlow(b.dataset.flow);
  else openIsland(b.dataset.isl, b.dataset.i != null ? +b.dataset.i : null);
  if (mobile.matches) setSide(false);
});
$("#search").addEventListener("input", e => { state.q = e.target.value; renderTree(); });
function setSideTab(t) {
  state.sideTab = t;
  $("#tabIslands").classList.toggle("active", t === "islands"); $("#tabIslands").setAttribute("aria-selected", t === "islands");
  $("#tabFlows").classList.toggle("active", t === "flows"); $("#tabFlows").setAttribute("aria-selected", t === "flows");
  renderTree();
}
$("#tabIslands").addEventListener("click", () => setSideTab("islands"));
$("#tabFlows").addEventListener("click", () => setSideTab("flows"));

function setSide(on) {
  app.classList.toggle("side-open", on);
  $("#sideBtn").setAttribute("aria-pressed", on);
  if (on && mobile.matches) { closeCard(true); setCtrl(false); }
  requestAnimationFrame(updateShift);
}
$("#sideBtn").addEventListener("click", () => setSide(!app.classList.contains("side-open")));
$("#sideClose").addEventListener("click", () => setSide(false));
$("#sideHandle").addEventListener("click", () => setSide(false));

/* ================= 卡片 ================= */
const card = $("#card"), cardBody = $("#cardBody");
function stdMatch(it) { return state.filter?.type === "std" && (it.std || []).some(x => state.stds.has(x)); }
function islandCard(s) {
  const i = ISLANDS.indexOf(s), prev = ISLANDS[(i + ISLANDS.length - 1) % ISLANDS.length], next = ISLANDS[(i + 1) % ISLANDS.length];
  const fl = FLOWS.filter(f => f.from === s.id || f.to === s.id);
  const stds = STANDARDS.filter(x => s.items.some(it => (it.std || []).includes(x.id)));
  const [img, who, say] = s.say;
  return `<div class="c-eyebrow">ISLAND ${s.no} · ${esc(s.en)}</div>
    <div class="c-title"><span class="tile">${s.ic}</span><h2>${esc(s.t)}</h2></div>
    <p class="lead">${esc(s.d)}</p>
    <div class="say"><img src="${IMG}${img}.webp" alt="${esc(who)}"><p><b>${esc(who)}</b>「${esc(say)}」</p></div>
    <div class="chips"><span class="chip">${s.items.length} 項資源</span><span class="chip">${fl.length} 條知識流</span>
      ${s.iso.map(x => `<span class="chip iso">${esc(x)}</span>`).join("")}${stds.map(x => `<span class="chip std">${esc(x.t)}</span>`).join("")}</div>
    ${ext(s.cta[1], `${esc(s.cta[0])} ↗`, "cta")}
    <h3 class="sub-h">島上資源 <small>點一下開新分頁</small></h3>
    <ol class="items">${s.items.map((it, k) => `<li data-i="${k}" class="${stdMatch(it) ? "match" : ""}">
      ${ext(it.u, `<i>${k + 1}</i><span><b>${esc(it.t)}</b><small>${esc(it.d)}</small></span><em>${esc(it.tag)}</em><span class="ext">↗</span>`, "it")}
      ${it.alt ? ext(it.alt[1], esc(it.alt[0]), "alt") : ""}</li>`).join("")}</ol>
    ${fl.length ? `<h3 class="sub-h">知識流 <small>和哪些島串在一起</small></h3>
    <div class="fchips">${fl.map(f => `<button class="fchip" data-flow="${f.id}" style="--c:${byId[f.from].c}"><b>${f.id}</b>${f.from === s.id ? "→ " + esc(byId[f.to].t) : "← " + esc(byId[f.from].t)} · ${f.ci}</button>`).join("")}</div>` : ""}
    <div class="card-nav"><button data-isl="${prev.id}">‹ ${isl(prev.id)}</button><button data-isl="${next.id}">${isl(next.id)} ›</button></div>`;
}
function flowCard(f) {
  const a = byId[f.from], b = byId[f.to];
  const i = FLOWS.indexOf(f), prev = FLOWS[(i + FLOWS.length - 1) % FLOWS.length], next = FLOWS[(i + 1) % FLOWS.length];
  return `<div class="c-eyebrow">FLOW ${f.id} · 知識流</div>
    <div class="c-title"><span class="tile">${f.ci}</span><h2>${esc(f.t)}</h2></div>
    <div class="route"><button data-isl="${a.id}" style="--c:${a.c}"><i>${a.ic}</i>${isl(a.id)}</button><span class="arr">→</span><button data-isl="${b.id}"><i>${b.ic}</i>${isl(b.id)}</button></div>
    <p class="lead">${esc(f.d)}</p>
    <div class="carry"><span class="big">${f.ci}</span><div><b>搬運：${esc(f.carry)}</b><small>島民會沿著橋，把它從 ${esc(a.t)} 送到 ${esc(b.t)}</small></div></div>
    <div class="chips">${f.iso ? `<span class="chip iso">${esc(f.iso)}</span>` : ""}<span class="chip">${esc(a.t)} 的 ${a.items.length} 項資源</span></div>
    <div class="card-nav"><button data-flow="${prev.id}">‹ ${prev.id} ${esc(prev.t)}</button><button data-flow="${next.id}">${next.id} ${esc(next.t)} ›</button></div>`;
}
function showCard(html, color) {
  cardBody.innerHTML = html;
  card.style.setProperty("--c", color);
  card.hidden = false;
  card.scrollTop = 0;
  app.classList.add("card-open");
  if (mobile.matches) { setSide(false); setCtrl(false); }
  updateShift();
}
function openIsland(id, itemIdx = null, from3d = false) {
  const s = byId[id];
  if (!s) return;
  if (app.classList.contains("touring")) tourEnd();
  const same = state.sel === id && !card.hidden;
  state.sel = id; state.flow = null; state.item = itemIdx;
  if (!same) showCard(islandCard(s), s.c);
  W("focusFlow", null);
  if (!same || !from3d) W("focus", id);
  setHash(id);
  mascot(`<b>${s.no} ${esc(s.t)}</b> · ${s.items.length} 項資源`);
  applyHighlight();
  renderTree();
  if (itemIdx != null) {
    const li = cardBody.querySelector(`.items li[data-i="${itemIdx}"]`);
    if (li) {
      li.classList.remove("flash"); void li.offsetWidth; li.classList.add("flash");
      li.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
    }
    setTimeout(() => W("flashItem", id, itemIdx), 600);
  }
}
function openFlow(fid) {
  const f = flowById[fid];
  if (!f) return;
  if (app.classList.contains("touring")) tourEnd();
  state.flow = fid; state.sel = null;
  showCard(flowCard(f), byId[f.from].c);
  W("unfocus");
  W("focusFlow", fid);
  setHash(fid);
  mascot(`<b>${f.id}</b> · ${f.ci} 搬運${esc(f.carry)}`);
  applyHighlight();
  renderTree();
}
function closeCard(silent) {
  if (card.hidden) return;
  card.hidden = true;
  card.classList.remove("full");
  app.classList.remove("card-open");
  state.sel = null; state.flow = null;
  W("unfocus"); W("focusFlow", null);
  setHash("");
  if (!silent) mascot();
  applyHighlight();
  renderTree();
  updateShift();
}
cardBody.addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.flow) openFlow(b.dataset.flow);
  else if (b.dataset.isl) openIsland(b.dataset.isl);
});
cardBody.addEventListener("pointerover", e => { const li = e.target.closest(".items li"); W("hoverItem", li ? +li.dataset.i : -1); });
cardBody.addEventListener("pointerleave", () => W("hoverItem", -1));
$("#cardClose").addEventListener("click", () => closeCard());
$("#cardHandle").addEventListener("click", () => { card.classList.toggle("full"); setTimeout(updateShift, 320); });

/* 卡片遮住的區域：把 3D 視角往旁邊推，讓選到的島留在可見範圍中央 */
function updateShift() {
  if (card.hidden) return W("setShift", 0, 0);
  /* 用 offset（不含進場動畫的 transform）計算卡片實際遮住的範圍 */
  if (mobile.matches) W("setShift", 0, Math.max(0, ($("#stage").offsetHeight - card.offsetTop) / 2));
  else W("setShift", Math.max(0, (card.offsetLeft + card.offsetWidth) / 2), 0);
}
addEventListener("resize", () => requestAnimationFrame(updateShift));

function setHash(h) {
  try { history.replaceState(null, "", h ? "#" + h : location.pathname + location.search); } catch { /* file:// 等環境 */ }
}

/* ================= 吉祥物 ================= */
const MASCOT_DEFAULT = "<b>阿拉蕾</b> · 點一座島，開始探索";
function mascot(html) { $("#mascotText").innerHTML = html || MASCOT_DEFAULT; }

/* ================= 高亮：月份、學習路線、標準、知識流 ================= */
function highlightIds() {
  if (state.flow) { const f = flowById[state.flow]; return [f.from, f.to]; }
  return filterIds();
}
function filterIds() {
  const f = state.filter;
  if (!f) return null;
  if (f.type === "month") return YEAR_PLAN[state.month].isl;
  if (f.type === "path") return PATHS.find(p => p.id === state.path).steps;
  if (f.type === "std") return ISLANDS.filter(s => s.items.some(it => (it.std || []).some(x => state.stds.has(x)))).map(s => s.id);
  return null;
}
function applyHighlight() {
  const ids = highlightIds();
  W("setHighlight", ids);
  W("setPath", state.filter?.type === "path" ? PATHS.find(p => p.id === state.path).steps : null);
  const st = $("#status");
  if (state.filter) {
    const n = (filterIds() || []).length;
    st.innerHTML = `<span>● 高亮 ${n} 座島</span><button id="clearFilter">清除</button>`;
    $("#clearFilter").onclick = clearFilter;
  } else st.innerHTML = "";
  if (state.sel && !card.hidden) {
    cardBody.querySelectorAll(".items li").forEach(li => li.classList.toggle("match", stdMatch(byId[state.sel].items[+li.dataset.i])));
  }
}
function clearFilter() {
  state.filter = null; state.path = null; state.stds.clear();
  stopYear();
  $$("#pathBtns button, #stdBtns button").forEach(b => b.setAttribute("aria-pressed", "false"));
  $("#pathNote").textContent = "選一個身分，看推薦的走訪順序。";
  renderStdNote();
  applyHighlight();
}
const goBtns = (ids, numbered) => ids.map((id, i) => `<button class="go" data-isl="${id}">${numbered ? `<i>${i + 1}</i>` : ""}${isl(id)}</button>`).join(numbered ? "→" : "");

/* 01 ISMS 的一年 */
function renderYear() {
  const m = state.month, p = YEAR_PLAN[m];
  $("#month").value = m + 1;
  $("#monthOut").textContent = `${m + 1} 月`;
  $("#yearNote").innerHTML = `<b>${m + 1} 月｜${esc(p.t)}</b>　${esc(p.d)}<br>前往：${goBtns(p.isl)}<br>
    <small>＋ 每月固定：到 <button class="go" data-isl="intel">02 資安情資港</button> 下載情資（A.5.7）。示意排程，實際依組織年度計畫調整。</small>`;
}
$("#month").addEventListener("input", e => {
  state.month = +e.target.value - 1;
  state.filter = { type: "month" };
  renderYear(); applyHighlight();
});
let yearTimer = null;
function stopYear() { clearInterval(yearTimer); yearTimer = null; $("#yearPlay").textContent = "▶"; $("#yearPlay").setAttribute("aria-label", "播放一年"); }
$("#yearPlay").addEventListener("click", () => {
  if (yearTimer) return stopYear();
  state.filter = { type: "month" };
  const step = () => { state.month = (state.month + 1) % 12; renderYear(); applyHighlight(); };
  renderYear(); applyHighlight();
  yearTimer = setInterval(step, 2600);
  $("#yearPlay").textContent = "❚❚"; $("#yearPlay").setAttribute("aria-label", "暫停");
});

/* 02 學習路線 */
$("#pathBtns").innerHTML = PATHS.map(p => `<button data-path="${p.id}" aria-pressed="false">${p.ic} ${esc(p.t)}<small>${p.steps.length} 站</small></button>`).join("");
$("#pathBtns").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  const on = state.path !== b.dataset.path;
  $$("#pathBtns button").forEach(x => x.setAttribute("aria-pressed", on && x === b));
  if (!on) return clearFilter();
  state.path = b.dataset.path;
  state.filter = { type: "path" };
  const p = PATHS.find(x => x.id === state.path);
  $("#pathNote").innerHTML = `<b>${p.ic} ${esc(p.t)}</b>　${esc(p.d)}<br>${goBtns(p.steps, true)}`;
  applyHighlight();
  if (!state.sel && !state.flow) W("overview");
});

/* 03 標準篩選 */
$("#stdBtns").innerHTML = STANDARDS.map(x => `<button data-std="${x.id}" aria-pressed="false" title="${esc(x.d)}">${esc(x.t)}</button>`).join("");
function renderStdNote() {
  if (!state.stds.size) { $("#stdNote").textContent = "可複選。高亮有相關資源的島，卡片裡的對應資源也會標出來。"; return; }
  const ids = filterIds() || [];
  const n = ISLANDS.reduce((k, s) => k + s.items.filter(it => (it.std || []).some(x => state.stds.has(x))).length, 0);
  $("#stdNote").innerHTML = `${[...state.stds].map(id => esc(STANDARDS.find(x => x.id === id).t)).join("、")}：${ids.length} 座島、${n} 項資源<br>${goBtns(ids)}`;
}
$("#stdBtns").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  const id = b.dataset.std;
  state.stds.has(id) ? state.stds.delete(id) : state.stds.add(id);
  b.setAttribute("aria-pressed", state.stds.has(id));
  state.filter = state.stds.size ? { type: "std" } : null;
  renderStdNote();
  applyHighlight();
});
$("#controls").addEventListener("click", e => {
  const g = e.target.closest(".go");
  if (g) { openIsland(g.dataset.isl); return; }
  const t = e.target.closest("[data-tab]");
  if (t && t.dataset.tab !== state.ctrlTab) {
    state.ctrlTab = t.dataset.tab;
    $$("[data-tab]").forEach(x => { x.classList.toggle("active", x === t); x.setAttribute("aria-selected", x === t); });
    $$(".panel").forEach(p => p.classList.toggle("active", p.id === `panel-${state.ctrlTab}`));
    clearFilter();
  }
});
function setCtrl(on) {
  app.classList.toggle("ctrl-open", on);
  $("#ctrlBtn").setAttribute("aria-pressed", on);
  if (on && mobile.matches) { closeCard(true); setSide(false); }
}
$("#ctrlBtn").addEventListener("click", () => setCtrl(!app.classList.contains("ctrl-open")));

/* ================= HUD：時段與圖層 ================= */
const toggles = { names: true, carry: true, flows: false, freeze: reduce, bird: false };
$$("[data-time]").forEach(b => b.addEventListener("click", () => {
  $$("[data-time]").forEach(x => x.setAttribute("aria-pressed", x === b));
  W("setTime", b.dataset.time);
}));
$$("[data-toggle]").forEach(b => {
  const k = b.dataset.toggle;
  if (k in toggles) b.setAttribute("aria-pressed", toggles[k]);
  b.addEventListener("click", () => {
    if (k === "log") return setLog($("#log").hidden);
    toggles[k] = !toggles[k];
    b.setAttribute("aria-pressed", toggles[k]);
    W("setToggle", k, toggles[k]);
  });
});
/* 手機版把 HUD 收進下方面板 */
function placeHud() { (mobile.matches ? $("#hudSlot") : app).appendChild($("#hud")); }
mobile.addEventListener("change", () => { placeHud(); setSide(false); setCtrl(false); updateShift(); });
placeHud();

$("#homeBtn").addEventListener("click", () => { closeCard(); W("overview"); });

/* ================= 島嶼日誌 ================= */
const events = [];
const arrivals = Object.fromEntries(ISLANDS.map(s => [s.id, 0]));
$("#logFlow").innerHTML = `<option value="">全部知識流</option>` + FLOWS.map(f => `<option value="${f.id}">${f.id} ${esc(f.t)}</option>`).join("");
$("#logFlow").addEventListener("change", renderLog);
function logEvent(ev) {
  const now = new Date();
  ev.time = now.toTimeString().slice(0, 8);
  events.unshift(ev);
  if (events.length > 120) events.pop();
  if (ev.kind === "arrive") arrivals[ev.island.id]++;
  if (!$("#log").hidden) { renderLog(); if (!$("#overviewPanel").hidden) renderOverview(); }
}
function renderLog() {
  const f = $("#logFlow").value;
  const list = events.filter(e => !f || e.flow.id === f).slice(0, 60);
  $("#logList").innerHTML = list.map(e => `<li data-flow="${e.flow.id}" style="--c:${byId[e.flow.from].c}"><span class="k ${e.kind}">${e.kind === "depart" ? "出發" : "抵達"}</span>
    <div><time>${e.time}</time><b>${e.flow.id}</b> | ${esc(e.role)} ${e.kind === "depart" ? "前往" : "抵達"} ${esc(e.island.t)} · ${e.flow.ci} ${esc(e.flow.carry)}</div></li>`).join("")
    || `<li class="empty">島民正在出發，稍等一下…</li>`;
}
$("#logList").addEventListener("click", e => { const li = e.target.closest("li[data-flow]"); if (li) openFlow(li.dataset.flow); });
function renderOverview() {
  const max = Math.max(...ISLANDS.map(s => s.items.length));
  const moved = Object.values(arrivals).reduce((a, b) => a + b, 0);
  $("#overviewPanel").innerHTML = `<div class="stats">
      <div class="stat"><b>${ISLANDS.length}</b><span>座主題島</span></div><div class="stat"><b>${TOTAL}</b><span>項資源</span></div>
      <div class="stat"><b>${FLOWS.length}</b><span>條知識流</span></div><div class="stat"><b>${moved}</b><span>件已送達（本次瀏覽）</span></div></div>
    <h3 class="sub-h">各島資源數</h3>
    <ul class="bars">${ISLANDS.map(s => `<li style="--c:${s.c}"><span>${s.no} ${esc(s.t)}</span><span class="bar"><i style="width:${s.items.length / max * 100}%"></i></span><em>${s.items.length}</em></li>`).join("")}</ul>`;
}
function setLog(on) {
  $("#log").hidden = !on;
  $('[data-toggle="log"]').setAttribute("aria-pressed", on);
  if (on) { renderLog(); renderOverview(); if (mobile.matches) { closeCard(true); setSide(false); setCtrl(false); } }
}
$("#logClose").addEventListener("click", () => setLog(false));
$$("[data-logtab]").forEach(b => b.addEventListener("click", () => {
  $$("[data-logtab]").forEach(x => x.setAttribute("aria-selected", x === b));
  const ov = b.dataset.logtab === "overview";
  $("#overviewPanel").hidden = !ov; $("#logBody").hidden = ov;
  if (ov) renderOverview(); else renderLog();
}));

/* ================= 操作說明 ================= */
const INTRO = [
  ["每座島是一類資源", "10 座六角島拼成一面資安盾牌：情資、課程、流程、個案、測驗與 AI 小作品。點一座島，或用「清單」直接搜尋資源。"],
  ["島民沿著知識流搬運", "情資、測驗卷、修補工單……打開上方「知識流」，看資源之間怎麼串起來；「日誌」記錄每一趟出發與抵達。"],
  ["跟著 ISMS 的一年走", "拖動「ISMS 的一年」月份，看這個月該用哪些資源；也可以選一條學習路線，或用標準篩選 27001／27701／42001／TISAX。"],
  ["所有資源都開新分頁", "嵌在 Google Sites 裡也能用。阿拉蕾正在島上巡邏，Allan 在總部等你，祝探索愉快！"]
];
let introStep = 0;
function showIntro(i) {
  introStep = i;
  const [t, d] = INTRO[i];
  $("#introCount").textContent = `HELLO, ISMS / ${String(i + 1).padStart(2, "0")}`;
  $("#introTitle").textContent = t;
  $("#introBody").textContent = d;
  $("#introDots").innerHTML = INTRO.map((_, k) => `<i class="${k === i ? "on" : ""}"></i>`).join("");
  $("#introNext").textContent = i === INTRO.length - 1 ? "開始探索 ✓" : "下一步 →";
  $("#intro").hidden = false;
  $("#introNext").focus();
}
function endIntro() { $("#intro").hidden = true; store.set("ismsIsland.intro", "1"); }
$("#introNext").addEventListener("click", () => introStep < INTRO.length - 1 ? showIntro(introStep + 1) : endIntro());
$("#introSkip").addEventListener("click", endIntro);
$("#helpBtn").addEventListener("click", () => showIntro(0));

/* ================= 自動導覽 ================= */
const TOUR = [
  { id: null, img: "allan-smile", who: "Allan", text: "歡迎來到 Allan's 資安島！10 座島拼成一面資安盾牌，我們一座一座看。" },
  ...ISLANDS.map(s => ({ id: s.id, img: s.say[0], who: s.say[1], text: `<b>${s.no} ${esc(s.t)}</b>　${esc(s.say[2])}` })),
  { id: null, img: "arale-cheer", who: "阿拉蕾", text: "導覽結束！點任何一座島，或打開清單搜尋資源，開始探索吧～" }
];
const tour = { i: 0, timer: null, paused: false };
function tourShow(i) {
  tour.i = i;
  const s = TOUR[i];
  $("#tourImg").src = `${IMG}${s.img}.webp`;
  $("#tourImg").alt = s.who;
  $("#tourText").innerHTML = s.text;
  $("#tourCount").textContent = `${String(i + 1).padStart(2, "0")} / ${TOUR.length}`;
  if (s.id) W("focus", s.id); else W("overview");
  clearTimeout(tour.timer);
  if (!tour.paused) tour.timer = setTimeout(() => i < TOUR.length - 1 ? tourShow(i + 1) : tourEnd(), 6000);
}
function tourStart() {
  closeCard(true); setLog(false); setSide(mobile.matches ? false : app.classList.contains("side-open")); setCtrl(false);
  app.classList.add("touring");
  $("#tour").hidden = false;
  tour.paused = false; $("#tourPause").textContent = "暫停";
  W("setShift", 0, 0);
  tourShow(0);
}
function tourEnd() {
  clearTimeout(tour.timer);
  $("#tour").hidden = true;
  app.classList.remove("touring");
  W("overview");
  mascot();
}
$("#tourBtn").addEventListener("click", tourStart);
$("#tourExit").addEventListener("click", tourEnd);
$("#tourReplay").addEventListener("click", () => { tour.paused = false; $("#tourPause").textContent = "暫停"; tourShow(0); });
$("#tourPause").addEventListener("click", () => {
  tour.paused = !tour.paused;
  $("#tourPause").textContent = tour.paused ? "繼續" : "暫停";
  if (tour.paused) clearTimeout(tour.timer); else tourShow(tour.i);
});

addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (!$("#intro").hidden) endIntro();
  else if (!$("#tour").hidden) tourEnd();
  else if (!$("#log").hidden) setLog(false);
  else if (!card.hidden) closeCard();
  else if (mobile.matches) { setSide(false); setCtrl(false); }
});

/* ================= 平面備援地圖 ================= */
function createFlatWorld({ container, islands, onPick }) {
  const R = 3, GAP = 1.13, Wd = Math.sqrt(3) * R * GAP, DZ = 1.5 * R * GAP;
  const pos = s => { const n = 4 - s.row; return [(s.col - (n - 1) / 2) * Wd, (s.row - 1) * DZ]; };
  const hex = (x, y, r) => Array.from({ length: 6 }, (_, i) => { const a = (60 * i - 90) * Math.PI / 180; return `${(x + r * Math.cos(a)).toFixed(2)},${(y + r * Math.sin(a)).toFixed(2)}`; }).join(" ");
  container.innerHTML = `<svg class="flat" viewBox="-13 -9.6 26 23.6" preserveAspectRatio="xMidYMid meet" role="presentation">
    <rect x="-40" y="-40" width="80" height="80" fill="#9fd3e6"/>
    ${islands.map(s => { const [x, y] = pos(s); return `<g class="fhex" data-id="${s.id}" tabindex="0" role="button" aria-label="${s.no} ${esc(s.t)}">
      <polygon points="${hex(x, y, R * 0.98)}" fill="${s.c}" fill-opacity=".2"/><polygon points="${hex(x, y, R * 0.8)}" fill="#fffdf8"/>
      <text x="${x}" y="${y - 0.5}" text-anchor="middle" font-size="1.7">${s.ic}</text>
      <text x="${x}" y="${y + 1.1}" text-anchor="middle" font-size="0.75" font-weight="900" fill="${s.c}">${s.no}</text>
      <text x="${x}" y="${y + 2}" text-anchor="middle" font-size="0.68" font-weight="700" fill="#14213d">${esc(s.t)}</text></g>`; }).join("")}</svg>`;
  container.querySelectorAll(".fhex").forEach(el => {
    el.addEventListener("click", () => onPick(el.dataset.id));
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(el.dataset.id); } });
  });
  return {
    focus(id) { container.querySelectorAll(".fhex").forEach(el => el.classList.toggle("sel", el.dataset.id === id)); },
    unfocus() { container.querySelectorAll(".fhex").forEach(el => el.classList.remove("sel")); },
    overview() { this.unfocus(); },
    setHighlight(ids) { container.querySelectorAll(".fhex").forEach(el => { el.classList.toggle("hi", !!ids?.includes(el.dataset.id)); el.classList.toggle("dim", !!ids && !ids.includes(el.dataset.id)); }); },
    is3d: false
  };
}

/* ================= 啟動 ================= */
renderTree();
renderYear();
setSide(!mobile.matches && innerWidth >= 1180);
const lt = new Date().getHours();
const startTime = lt >= 19 || lt < 5 ? "night" : lt < 8 ? "dawn" : lt >= 17 ? "dusk" : "day";

try {
  const { createWorld } = await import("./scene.js");
  world = await createWorld({
    container: $("#stage"), labels: $("#labels"), islands: ISLANDS, flows: FLOWS, roles: ROLES, reduce,
    onPick: id => openIsland(id, null, true),
    onItem: (id, i) => openIsland(id, i, true),
    onEvent: logEvent
  });
} catch (err) {
  console.warn("3D 場景無法載入，改用平面地圖：", err);
  $("#stage").innerHTML = "";
  world = createFlatWorld({ container: $("#stage"), islands: ISLANDS, onPick: id => openIsland(id) });
  $$(".seg button, [data-toggle]").forEach(b => { if (b.dataset.toggle !== "log") b.disabled = true; });
}
if (world.is3d) {
  for (const [k, v] of Object.entries(toggles)) if (v !== (k === "names" || k === "carry")) W("setToggle", k, v);
  if (startTime !== "day") $(`[data-time="${startTime}"]`).click();
}
$("#loading").classList.add("done");

const h = decodeURIComponent(location.hash.slice(1));
if (byId[h]) openIsland(h);
else if (flowById[h]) openFlow(h);
else if (!store.get("ismsIsland.intro")) setTimeout(() => showIntro(0), reduce ? 0 : 1200);
addEventListener("hashchange", () => {
  const k = decodeURIComponent(location.hash.slice(1));
  if (byId[k] && k !== state.sel) openIsland(k);
  else if (flowById[k] && k !== state.flow) openFlow(k);
});
