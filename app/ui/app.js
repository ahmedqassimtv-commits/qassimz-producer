/* QASSIMZ Producer — UI */
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/* ------------------------------------------------------------------ icons */
const IC = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  board: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="7" rx="1.5"/>',
  ideas: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.9V16h5v-.2c0-.8.4-1.5 1-1.9A6 6 0 0 0 12 3z"/>',
  library: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  ai: '<path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  github: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  script: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  clip: '<path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
  check: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1zM12 15l-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  video: '<rect x="2" y="5" width="15" height="14" rx="2"/><path d="m17 10 5-3v10l-5-3"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  graphic: '<path d="M12 19l7-7 3 3-7 7zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18z"/><circle cx="11" cy="11" r="2"/>',
  doc: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
  font: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  other: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>',
  trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  up: '<path d="m18 15-6-6-6 6"/>', down: '<path d="m6 9 6 6 6-6"/>',
  back: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  export: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  play: '<path d="M6 4l14 8-14 8z"/>', pause: '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>', dots: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  wand: '<path d="m15 4 5 5L9 20l-5-5zM14 2v2M20 8h2M19 3l-1.5 1.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  dup: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  open: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>',
  note: '<path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5z"/><path d="M15 3v6h6"/>',
};
const ico = (n, cls = "") => `<svg class="i ${cls}" viewBox="0 0 24 24">${IC[n] || ""}</svg>`;

/* ------------------------------------------------------------------ api / ui helpers */
async function api(m, args = {}) {
  const r = await fetch("api/" + m, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(args) });
  const j = await r.json();
  if (!j.ok) { const e = new Error(j.error || "خطأ"); e.ai = j.ai; throw e; }
  return j.data;
}
let toastT;
function toast(msg, err = false) {
  $$(".toast").forEach((t) => t.remove());
  const t = document.createElement("div");
  t.className = "toast" + (err ? " err" : "");
  t.textContent = msg;
  document.body.appendChild(t);
  clearTimeout(toastT); toastT = setTimeout(() => t.remove(), err ? 6000 : 3000);
}
function fail(e) { toast(e.message || String(e), true); if (e.ai && /المفتاح|التوكن|الإعدادات/.test(e.message)) openSettings("ai"); }
async function busy(btn, fn) {
  if (btn) { btn.classList.add("loading"); btn.dataset.t = btn.innerHTML; }
  try { return await fn(); } catch (e) { fail(e); } finally { if (btn) { btn.classList.remove("loading"); } }
}
function modal(html, { wide = false, onClose } = {}) {
  const m = document.createElement("div");
  m.className = "modal";
  m.innerHTML = `<div class="modal-box ${wide ? "wide" : ""}">${html}</div>`;
  m.close = () => { m.remove(); onClose && onClose(); };
  m.addEventListener("mousedown", (e) => { if (e.target === m) m.close(); });
  $("#layer").appendChild(m);
  $$("[data-close]", m).forEach((b) => (b.onclick = m.close));
  return m;
}
function menu(anchor, items) {
  closeMenus();
  const m = document.createElement("div");
  m.className = "menu";
  m.innerHTML = items.map((it, i) => it === "-" ? "<hr>" : `<button data-i="${i}">${it.icon ? ico(it.icon) : ""}<span>${esc(it.label)}</span></button>`).join("");
  document.body.appendChild(m);
  const r = anchor.getBoundingClientRect();
  const mw = m.offsetWidth, mh = m.offsetHeight;
  m.style.left = Math.max(8, Math.min(innerWidth - mw - 8, r.right - mw)) + "px";
  m.style.top = (r.bottom + mh + 8 > innerHeight ? Math.max(8, r.top - mh - 6) : r.bottom + 6) + "px";
  $$("button", m).forEach((b) => (b.onclick = () => { closeMenus(); items[+b.dataset.i].do(); }));
  setTimeout(() => document.addEventListener("mousedown", outside), 0);
  function outside(e) { if (!m.contains(e.target)) { closeMenus(); document.removeEventListener("mousedown", outside); } }
}
const closeMenus = () => $$(".menu").forEach((m) => m.remove());
function debounce(fn, ms = 500) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
function autoGrow(ta) { const f = () => { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + 2 + "px"; }; ta.addEventListener("input", f); requestAnimationFrame(f); }
const fmtSize = (n) => !n ? "" : n < 1048576 ? Math.round(n / 1024) + " KB" : n < 1073741824 ? (n / 1048576).toFixed(1) + " MB" : (n / 1073741824).toFixed(2) + " GB";
const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const AR_DAYS = ["الأحد", "الاتنين", "التلات", "الأربع", "الخميس", "الجمعة", "السبت"];
const fmtDate = (d) => { if (!d) return ""; const x = new Date(d + "T00:00"); return `${x.getDate()} ${AR_MONTHS[x.getMonth()]}`; };
const minutesLabel = (m) => !m ? "—" : m < 1 ? `${Math.round(m * 60)} ث` : `${m} د`;
const SERIES_COLORS = { red: "#ff4d2e", rose: "#ff2e63", amber: "#f59e0b", green: "#10b981", blue: "#3b82f6", violet: "#8b5cf6", ink: "#1b1a1f" };
const sColor = (s) => SERIES_COLORS[s?.color] || SERIES_COLORS.red;
const stageColor = (s) => `var(--s-${s})`;

/* ------------------------------------------------------------------ state + router */
const S = { info: null, series: [], route: { view: "home" }, boardSeries: null };
const NAV = [
  ["home", "الرئيسية", "home"], ["board", "الحلقات", "board"], ["ideas", "لوحة الأفكار", "ideas"],
  ["library", "المكتبة", "library"], ["calendar", "التقويم", "calendar"], ["assistant", "المساعد الذكي", "ai"],
];
function go(view, arg) { S.route = { view, arg }; render(); $("#main").scrollTop = 0; }

function renderNav() {
  $("#mainNav").innerHTML = NAV.map(([v, label, icon]) =>
    `<button class="nav ${S.route.view === v || (v === "board" && S.route.view === "episode") ? "active" : ""}" data-v="${v}">${ico(icon)}<span>${label}</span></button>`).join("");
  $$("#mainNav .nav").forEach((b) => (b.onclick = () => { S.boardSeries = null; go(b.dataset.v); }));
  $("#seriesNav").innerHTML = S.series.length ? S.series.map((s) =>
    `<button class="nav ${S.route.view === "board" && S.boardSeries === s.id ? "active" : ""}" data-s="${s.id}"><span class="dot" style="background:${sColor(s)}"></span><span class="ell">${esc(s.name)}</span><span class="badge">${s.count}</span></button>`).join("")
    : `<p class="muted" style="font-size:12.5px;padding:6px 12px">مفيش سلاسل لسه</p>`;
  $$("#seriesNav .nav").forEach((b) => {
    b.onclick = () => { S.boardSeries = +b.dataset.s; go("board"); };
    b.oncontextmenu = (e) => { e.preventDefault(); const s = S.series.find((x) => x.id === +b.dataset.s); menu(b, [
      { label: "تعديل السلسلة", icon: "settings", do: () => seriesModal(s) },
      { label: "حذف السلسلة", icon: "trash", do: async () => { if (confirm("حذف السلسلة؟ الحلقات هتفضل موجودة.")) { await api("series_delete", { id: s.id }); await refreshSeries(); render(); } } },
    ]); };
  });
  const st = S.info.settings, ok = st.ai_keys[st.ai_provider] || st.ai_provider === "openai";
  $("#aiLed").classList.toggle("on", !!ok);
  $("#aiText").textContent = ok ? `AI: ${S.info.providers[st.ai_provider].name}` : "فعّل الذكاء الاصطناعي";
}
async function refreshSeries() { S.series = await api("series_list"); }

async function render() {
  renderNav();
  const v = S.route.view;
  const main = $("#main");
  try {
    if (v === "home") await viewHome(main);
    else if (v === "board") await viewBoard(main);
    else if (v === "episode") await viewEpisode(main, S.route.arg);
    else if (v === "ideas") await viewIdeas(main);
    else if (v === "library") await viewLibrary(main);
    else if (v === "calendar") await viewCalendar(main);
    else if (v === "assistant") await viewAssistant(main);
  } catch (e) { fail(e); }
}

/* ================================================================== HOME */
async function viewHome(main) {
  const d = await api("dashboard");
  const st = S.info.stages, names = S.info.stage_names;
  const total = d.total || 1;
  const h = new Date().getHours();
  const greet = h < 12 ? "صباح الخير" : h < 18 ? "أهلاً" : "مساء الخير";
  main.innerHTML = `<div class="view">
    <div class="top"><div class="hello"><div><h1>${greet} يا أحمد 👋</h1><p class="muted">${d.total} حلقة · ${d.series.length} سلسلة · ${d.assets} ملف في المكتبة · ${d.ideas} فكرة على اللوحة</p></div></div>
      <div class="actions"><button class="btn" id="hNewSeries">${ico("plus")}سلسلة جديدة</button><button class="btn primary" id="hNewEp">${ico("plus")}حلقة جديدة</button></div></div>

    <div class="card glass">
      <div class="card-h"><h3>${ico("ideas")}عندك فكرة؟</h3><span class="muted" style="font-size:12.5px">اكتبها وهتتحفظ كحلقة في مرحلة «فكرة»، أو خلّي الذكاء الاصطناعي يقترح عليك</span></div>
      <div class="quick"><input class="in" id="qIdea" placeholder="مثلاً: ليه البحر مالح؟"><button class="btn primary" id="qSave">احفظ الفكرة</button><button class="btn ai" id="qAI">${ico("ai")}اقترح أفكار</button></div>
    </div>

    <div class="card glass">
      <div class="card-h"><h3>${ico("board")}خط الإنتاج</h3><button class="btn sm ghost" id="hBoard">افتح الحلقات ${ico("back")}</button></div>
      <div class="stats">${st.map((s) => `<div class="stat" data-s="${s}" style="--c:${stageColor(s)}"><b>${d.by_stage[s] || 0}</b><span>${names[s]}</span></div>`).join("")}</div>
      <div class="pipe">${st.map((s) => `<i style="--c:${stageColor(s)};width:${((d.by_stage[s] || 0) / total) * 100}%"></i>`).join("")}</div>
    </div>

    <div class="grid3">
      <div class="card glass"><div class="card-h"><h3>${ico("calendar")}الجاي في النشر</h3></div>
        <div class="list">${d.upcoming.length ? d.upcoming.map((e) => `<div class="li click" data-e="${e.id}"><div class="date"><b>${new Date(e.publish_date + "T00:00").getDate()}</b><small>${AR_MONTHS[new Date(e.publish_date + "T00:00").getMonth()]}</small></div><div class="t"><b>${esc(e.title)}</b><small>${names[e.stage]} · ${minutesLabel(e.minutes)}</small></div></div>`).join("")
          : `<div class="empty">${ico("calendar")}<span>حدّد ميعاد نشر لأي حلقة وهتظهر هنا</span></div>`}</div></div>
      <div class="card glass"><div class="card-h"><h3>${ico("check")}مهام مفتوحة</h3></div>
        <div class="list">${d.tasks.length ? d.tasks.map((t) => `<div class="li click" data-e="${t.episode_id}"><div class="t"><b>${esc(t.text)}</b><small>${esc(t.episode_title)}</small></div></div>`).join("")
          : `<div class="empty">${ico("check")}<span>مفيش مهام مفتوحة</span></div>`}</div></div>
      <div class="card glass"><div class="card-h"><h3>${ico("script")}آخر تعديل</h3></div>
        <div class="list">${d.recent.length ? d.recent.map((e) => `<div class="li click" data-e="${e.id}"><span class="chip stage" style="--c:${stageColor(e.stage)}">${names[e.stage]}</span><div class="t"><b>${esc(e.title)}</b><small>${e.words} كلمة · ${minutesLabel(e.minutes)}</small></div></div>`).join("")
          : `<div class="empty">${ico("script")}<b>ابدأ أول حلقة</b><span>اضغط «حلقة جديدة» فوق</span></div>`}</div></div>
    </div></div>`;
  $("#hNewEp").onclick = () => newEpisode();
  $("#hNewSeries").onclick = () => seriesModal();
  $("#hBoard").onclick = () => go("board");
  $$(".stat", main).forEach((s) => (s.onclick = () => go("board")));
  $$("[data-e]", main).forEach((x) => (x.onclick = () => go("episode", +x.dataset.e)));
  const save = async () => { const t = $("#qIdea").value.trim(); if (!t) return; const id = await api("episode_create", { episode: { title: t } }); toast("✓ اتحفظت كفكرة"); go("episode", id); };
  $("#qSave").onclick = save;
  $("#qIdea").onkeydown = (e) => e.key === "Enter" && save();
  $("#qAI").onclick = () => ideasModal($("#qIdea").value.trim());
}

/* ================================================================== BOARD (kanban) */
async function viewBoard(main) {
  const eps = await api("episodes", { series_id: S.boardSeries });
  const names = S.info.stage_names;
  const series = S.series.find((s) => s.id === S.boardSeries);
  main.innerHTML = `<div class="view">
    <div class="top"><div><h1>${series ? esc(series.name) : "كل الحلقات"}</h1><p class="muted">${series?.description ? esc(series.description) + " · " : ""}اسحب الكروت بين المراحل</p></div>
      <div class="actions">
        <select class="sel" id="bSeries" style="width:200px"><option value="">كل السلاسل</option>${S.series.map((s) => `<option value="${s.id}" ${s.id === S.boardSeries ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select>
        <button class="btn ai" id="bIdeas">${ico("ai")}اقترح حلقات</button>
        <button class="btn primary" id="bNew">${ico("plus")}حلقة جديدة</button></div></div>
    <div class="kanban">${S.info.stages.map((s) => {
      const list = eps.filter((e) => e.stage === s);
      return `<div class="col" data-stage="${s}"><div class="col-h"><span class="dot" style="--c:${stageColor(s)}"></span>${names[s]}<span class="n">${list.length}</span></div>
        ${list.map(epCard).join("")}<button class="add" data-add="${s}">+ إضافة</button></div>`;
    }).join("")}</div></div>`;
  $("#bSeries").onchange = (e) => { S.boardSeries = e.target.value ? +e.target.value : null; render(); };
  $("#bNew").onclick = () => newEpisode({ series_id: S.boardSeries });
  $("#bIdeas").onclick = () => ideasModal("", S.boardSeries);
  $$("[data-add]", main).forEach((b) => (b.onclick = () => newEpisode({ series_id: S.boardSeries, stage: b.dataset.add })));
  wireKanban(main);
}
function epCard(e) {
  const s = S.series.find((x) => x.id === e.series_id);
  const pct = e.tasks ? Math.round((e.tasks_done / e.tasks) * 100) : 0;
  return `<div class="ep" draggable="true" data-id="${e.id}">
    <b>${esc(e.title)}</b>
    <div class="meta">${s ? `<span class="chip"><span class="dot" style="background:${sColor(s)};width:8px;height:8px"></span>${esc(s.name)}</span>` : ""}
      ${e.publish_date ? `<span class="chip">${ico("calendar")}${fmtDate(e.publish_date)}</span>` : ""}
      ${e.words ? `<span class="chip">${minutesLabel(e.minutes)}</span>` : ""}
      ${e.assets ? `<span class="chip">${ico("clip")}${e.assets}</span>` : ""}</div>
    ${e.tasks ? `<div class="prog" title="${e.tasks_done}/${e.tasks} مهمة"><i style="width:${pct}%"></i></div>` : ""}</div>`;
}
function wireKanban(root) {
  let dragId = null;
  $$(".ep", root).forEach((c) => {
    c.onclick = () => go("episode", +c.dataset.id);
    c.ondragstart = (e) => { dragId = +c.dataset.id; c.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; };
    c.ondragend = () => c.classList.remove("dragging");
  });
  $$(".col", root).forEach((col) => {
    col.ondragover = (e) => { e.preventDefault(); col.classList.add("over"); };
    col.ondragleave = () => col.classList.remove("over");
    col.ondrop = async (e) => {
      e.preventDefault(); col.classList.remove("over");
      if (!dragId) return;
      const after = $$(".ep", col).find((c) => { const r = c.getBoundingClientRect(); return e.clientY < r.top + r.height / 2 && +c.dataset.id !== dragId; });
      await api("episode_move", { id: dragId, stage: col.dataset.stage, before_id: after ? +after.dataset.id : null });
      dragId = null; render();
    };
  });
}

/* ================================================================== new episode / series / ideas */
function newEpisode(pre = {}) {
  const m = modal(`<div class="modal-h"><h2>حلقة جديدة</h2><button class="btn icon ghost" data-close>${ico("x")}</button></div>
    <label class="f">العنوان<input class="in" id="nTitle" placeholder="عنوان الحلقة" autofocus></label>
    <div class="grid2"><label class="f">السلسلة<select class="sel" id="nSeries"><option value="">بدون سلسلة</option>${S.series.map((s) => `<option value="${s.id}" ${s.id === pre.series_id ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select></label>
      <label class="f">ميعاد النشر<input class="in" type="date" id="nDate"></label></div>
    <label class="f">الفكرة باختصار (اختياري)<textarea class="ta" id="nNotes" placeholder="إيه اللي عايز توصله؟"></textarea></label>
    <div class="modal-f"><button class="btn primary" id="nGo">إنشاء</button><button class="btn ai" id="nGoAI">${ico("ai")}إنشاء + اكتب الهيكل بالذكاء الاصطناعي</button><button class="btn ghost" data-close>إلغاء</button></div>`);
  const create = async (ai) => {
    const title = $("#nTitle", m).value.trim();
    if (!title) return $("#nTitle", m).focus();
    const id = await api("episode_create", { episode: { title, series_id: +$("#nSeries", m).value || null, publish_date: $("#nDate", m).value || null, notes: $("#nNotes", m).value, stage: pre.stage || "idea" } });
    m.close(); await refreshSeries();
    go("episode", id);
    if (ai) setTimeout(() => $("#eOutline")?.click(), 300);
  };
  $("#nGo", m).onclick = () => create(false);
  $("#nGoAI", m).onclick = () => create(true);
  $("#nTitle", m).onkeydown = (e) => e.key === "Enter" && create(false);
}
function seriesModal(s = {}) {
  const m = modal(`<div class="modal-h"><h2>${s.id ? "تعديل السلسلة" : "سلسلة جديدة"}</h2><button class="btn icon ghost" data-close>${ico("x")}</button></div>
    <label class="f">الاسم<input class="in" id="sName" value="${esc(s.name || "")}" placeholder="مثلاً: ليه كده؟"></label>
    <label class="f">عن السلسلة<textarea class="ta" id="sDesc" placeholder="الفكرة العامة والأسلوب — بيساعد الذكاء الاصطناعي يفهم السلسلة">${esc(s.description || "")}</textarea></label>
    <label class="f">اللون<div class="seg" id="sColor">${Object.entries(SERIES_COLORS).map(([k, c]) => `<button data-c="${k}" class="${(s.color || "red") === k ? "on" : ""}"><span class="dot" style="background:${c}"></span></button>`).join("")}</div></label>
    <div class="modal-f"><button class="btn primary" id="sSave">حفظ</button><button class="btn ghost" data-close>إلغاء</button></div>`);
  let color = s.color || "red";
  $$("#sColor button", m).forEach((b) => (b.onclick = () => { color = b.dataset.c; $$("#sColor button", m).forEach((x) => x.classList.toggle("on", x === b)); }));
  $("#sSave", m).onclick = async () => {
    const name = $("#sName", m).value.trim(); if (!name) return;
    const id = await api("series_save", { series: { id: s.id, name, description: $("#sDesc", m).value, color } });
    m.close(); await refreshSeries(); S.boardSeries = id; go("board");
  };
}
function ideasModal(topic = "", seriesId = null) {
  const m = modal(`<div class="modal-h"><h2>${ico("ai")} اقتراح أفكار حلقات</h2><button class="btn icon ghost" data-close>${ico("x")}</button></div>
    <div class="grid2"><label class="f">الموضوع أو الاتجاه<input class="in" id="iTopic" value="${esc(topic)}" placeholder="مثلاً: علم النفس اليومي، تاريخ مصر، الفضاء…"></label>
    <label class="f">السلسلة<select class="sel" id="iSeries"><option value="">بدون</option>${S.series.map((s) => `<option value="${s.id}" ${s.id === seriesId ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select></label></div>
    <div class="modal-f"><button class="btn ai" id="iGo">${ico("ai")}اقترح</button></div>
    <div id="iOut" class="list" style="gap:10px"></div>`, { wide: true });
  $("#iGo", m).onclick = (ev) => busy(ev.currentTarget, async () => {
    const r = await api("ai_ideas", { topic: $("#iTopic", m).value || "أفكار متنوعة", series_id: +$("#iSeries", m).value || null });
    $("#iOut", m).innerHTML = (r.ideas || []).map((x, i) => `<div class="idea-card"><b>${esc(x.title)}</b><span>🎣 ${esc(x.hook)}</span><span class="muted">${esc(x.angle)}</span>
      ${x.research?.length ? `<ul>${x.research.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
      <div><button class="btn sm primary" data-i="${i}">${ico("plus")}خليها حلقة</button></div></div>`).join("");
    $$("[data-i]", m).forEach((b) => (b.onclick = async () => {
      const x = r.ideas[+b.dataset.i];
      await api("episode_create", { episode: { title: x.title, hook: x.hook, notes: `${x.angle}\n\nللبحث:\n- ${(x.research || []).join("\n- ")}`, series_id: +$("#iSeries", m).value || null } });
      b.outerHTML = `<span class="chip" style="color:var(--ok)">✓ اتضافت</span>`; refreshSeries().then(renderNav);
    }));
  });
  if (topic) $("#iGo", m).click();
}

/* ================================================================== EPISODE */
const TABS = [["script", "السكريبت", "script"], ["assets", "الملحقات", "clip"], ["tasks", "المهام والمصادر", "check"], ["publish", "النشر", "rocket"], ["chat", "اسأل الذكاء الاصطناعي", "chat"]];
let EP = null, EP_TAB = "script";
async function viewEpisode(main, id) {
  EP = await api("episode", { id });
  if (!EP) return go("board");
  const names = S.info.stage_names;
  main.innerHTML = `<div class="view">
    <div class="glass ep-head">
      <div class="ep-row" style="justify-content:space-between">
        <button class="btn sm ghost" id="eBack">${ico("back")} رجوع للحلقات</button>
        <div class="tools">
          <button class="btn sm" id="ePrompter">${ico("mic")}تيليبرومبتر</button>
          <button class="btn sm" id="eExport">${ico("export")}تصدير للمونتاج</button>
          <button class="btn sm icon" id="eMore">${ico("dots")}</button></div></div>
      <input class="ep-title" id="eTitle" value="${esc(EP.title)}">
      <div class="ep-row">
        <select class="sel" id="eSeries"><option value="">بدون سلسلة</option>${S.series.map((s) => `<option value="${s.id}" ${s.id === EP.series_id ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select>
        <input class="in" type="date" id="eDate" value="${EP.publish_date || ""}" title="ميعاد النشر">
        <div class="stages">${S.info.stages.map((s) => `<button data-s="${s}" style="--c:${stageColor(s)}" class="${EP.stage === s ? "on" : ""}">${names[s]}</button>`).join("")}</div>
      </div>
      <div class="kpis"><span><b id="kMin">${minutesLabel(EP.minutes)}</b>مدة تقريبية</span><span><b id="kWords">${EP.words}</b>كلمة</span><span><b>${EP.scenes.length}</b>مشهد</span><span><b>${EP.bin.length}</b>ملف</span><span><b>${EP.tasks_done}/${EP.tasks}</b>مهمة</span></div>
    </div>
    <div class="tabs" id="eTabs">${TABS.map(([k, l, i]) => `<button data-t="${k}" class="${EP_TAB === k ? "on" : ""}">${ico(i)}${l}</button>`).join("")}</div>
    <div id="eBody"></div></div>`;
  $("#eBack").onclick = () => go("board");
  const saveTitle = debounce((v) => api("episode_update", { id, fields: { title: v } }), 500);
  $("#eTitle").oninput = (e) => saveTitle(e.target.value);
  $("#eSeries").onchange = (e) => api("episode_update", { id, fields: { series_id: +e.target.value || null } }).then(refreshSeries).then(renderNav);
  $("#eDate").onchange = (e) => api("episode_update", { id, fields: { publish_date: e.target.value || null } });
  $$(".stages button", main).forEach((b) => (b.onclick = async () => { await api("episode_update", { id, fields: { stage: b.dataset.s } }); EP.stage = b.dataset.s; $$(".stages button", main).forEach((x) => x.classList.toggle("on", x === b)); }));
  $$("#eTabs button").forEach((b) => (b.onclick = () => { EP_TAB = b.dataset.t; $$("#eTabs button").forEach((x) => x.classList.toggle("on", x === b)); renderTab(); }));
  $("#ePrompter").onclick = () => teleprompter(EP);
  $("#eExport").onclick = (ev) => busy(ev.currentTarget, async () => {
    if (!S.info.native) return toast("التصدير شغّال من البرنامج المتسطب", true);
    const p = await api("export_episode", { id }); if (p) { toast("✓ اتصدّرت"); api("open_path", { path: p }); }
  });
  $("#eMore").onclick = (ev) => menu(ev.currentTarget, [
    { label: "انسخ السكريبت (Markdown)", icon: "copy", do: async () => { await navigator.clipboard.writeText(await api("script_markdown", { id })); toast("✓ اتنسخ"); } },
    { label: "نسخة من الحلقة", icon: "dup", do: async () => go("episode", await api("episode_duplicate", { id })) },
    "-",
    { label: "حذف الحلقة", icon: "trash", do: async () => { if (confirm("متأكد إنك عايز تمسح الحلقة؟")) { await api("episode_delete", { id }); await refreshSeries(); go("board"); } } },
  ]);
  renderTab();
}
async function reloadEP() { EP = await api("episode", { id: EP.id }); $("#kMin") && ($("#kMin").textContent = minutesLabel(EP.minutes), $("#kWords").textContent = EP.words); }
function renderTab() {
  const b = $("#eBody");
  ({ script: tabScript, assets: tabAssets, tasks: tabTasks, publish: tabPublish, chat: tabChat })[EP_TAB](b);
}

/* ---------- script tab */
function tabScript(b) {
  const wpm = S.info.settings.wpm || 140;
  b.innerHTML = `<div class="view" style="gap:14px">
    <div class="hook"><div style="flex:none;padding-top:8px">🎣</div><div style="flex:1;display:flex;flex-direction:column;gap:6px">
      <b style="font-size:13px">الهوك — أول ٥ ثواني</b><textarea class="ta" id="eHook" placeholder="الجملة اللي هتخلي المشاهد يكمل…">${esc(EP.hook || "")}</textarea></div>
      <button class="btn sm ai" id="eHookAI" style="align-self:flex-end">${ico("ai")}هوكات</button></div>
    ${EP.scenes.length ? "" : `<div class="card glass empty">${ico("script")}<b>السكريبت فاضي</b><span>ابدأ بمشهد، أو خلّي الذكاء الاصطناعي يكتب هيكل كامل للحلقة</span></div>`}
    <div id="scenes" style="display:flex;flex-direction:column;gap:14px">${EP.scenes.map((s, i) => sceneHTML(s, i, wpm)).join("")}</div>
    <div class="ep-row"><button class="btn" id="addScene">${ico("plus")}مشهد جديد</button>
      <button class="btn ai" id="eOutline">${ico("ai")}${EP.scenes.length ? "زوّد مشاهد بالذكاء الاصطناعي" : "اكتب هيكل الحلقة بالذكاء الاصطناعي"}</button>
      <label class="f" style="flex-direction:row;align-items:center;gap:8px;margin-inline-start:auto">المدة المستهدفة<select class="sel" id="eMins" style="width:110px">${[3, 5, 8, 10, 15, 20, 30].map((x) => `<option ${x === 10 ? "selected" : ""}>${x}</option>`).join("")}</select>دقيقة</label></div>
  </div>`;
  const hookSave = debounce((v) => api("episode_update", { id: EP.id, fields: { hook: v } }), 600);
  autoGrow($("#eHook")); $("#eHook").oninput = (e) => hookSave(e.target.value);
  $("#eHookAI").onclick = (ev) => busy(ev.currentTarget, async () => aiResult(ev.currentTarget.closest(".hook"), await api("ai_rewrite", { text: EP.hook || EP.title, mode: "hook", episode_id: EP.id }), (t) => { $("#eHook").value = t.split("\n")[0].replace(/^\d+[.)-]\s*/, ""); hookSave($("#eHook").value); }));
  $("#addScene").onclick = async () => { await api("scene_save", { scene: { episode_id: EP.id, heading: `مشهد ${EP.scenes.length + 1}` } }); await reloadEP(); tabScript(b); $("#scenes .scene:last-child textarea")?.focus(); };
  $("#eOutline").onclick = (ev) => busy(ev.currentTarget, async () => {
    toast("✨ بيكتب الهيكل… ده ممكن ياخد دقيقة");
    await api("ai_outline", { id: EP.id, minutes: +$("#eMins").value });
    await reloadEP(); tabScript(b); toast("✓ الهيكل جاهز — عدّل براحتك");
  });
  $$(".scene", b).forEach((el) => wireScene(el, b, wpm));
}
function sceneHTML(s, i, wpm) {
  const secs = Math.round(((s.text || "").trim().split(/\s+/).filter(Boolean).length / wpm) * 60);
  return `<div class="scene glass" data-id="${s.id}">
    <div class="num">${i + 1}</div>
    <div class="body">
      <div class="scene-h"><input class="in" data-f="heading" value="${esc(s.heading)}" placeholder="اسم المشهد"><span class="dur">${secs} ث تقريباً</span>
        <div class="tools"><button class="btn sm ai" data-act="ai">${ico("ai")}ذكاء</button><button class="btn sm icon ghost" data-act="up" title="لفوق">${ico("up")}</button><button class="btn sm icon ghost" data-act="down" title="لتحت">${ico("down")}</button><button class="btn sm icon ghost" data-act="del" title="حذف">${ico("trash")}</button></div></div>
      <textarea class="ta" data-f="text" placeholder="اكتب الكلام اللي هيتقال…">${esc(s.text)}</textarea>
      <div class="va"><input class="in" data-f="visual" value="${esc(s.visual)}" placeholder="🎬 المرئي: B-roll، جرافيك، لقطة…"><input class="in" data-f="audio" value="${esc(s.audio)}" placeholder="🎵 الصوت: مود الموسيقى، مؤثر…"></div>
      <div class="slot" data-scene="${s.id}">${s.assets.map((a) => miniHTML(a, s.id)).join("")}<button class="btn sm ghost" data-act="attach">${ico("clip")}اربط ملف</button><span class="hint">${s.assets.length ? "" : "أو اسحب ملف من «الملحقات» هنا"}</span></div>
      <div class="ai-slot"></div>
    </div></div>`;
}
function miniHTML(a, sceneId) {
  const th = a.kind === "image" || a.kind === "video" ? `<img src="thumb/${a.id}" onerror="this.replaceWith(document.createRange().createContextualFragment('${ico(a.kind).replace(/"/g, "&quot;")}'))">` : ico(a.kind);
  return `<div class="mini" title="${esc(a.name)}" data-a="${a.id}">${th}<button class="x" data-un="${a.id}" data-sc="${sceneId}">✕</button></div>`;
}
function wireScene(el, b, wpm) {
  const id = +el.dataset.id;
  const save = debounce((f, v) => api("scene_save", { scene: { id, [f]: v } }).then(reloadEP), 600);
  $$("[data-f]", el).forEach((inp) => { inp.oninput = () => { save(inp.dataset.f, inp.value); if (inp.dataset.f === "text") $(".dur", el).textContent = `${Math.round((inp.value.trim().split(/\s+/).filter(Boolean).length / wpm) * 60)} ث تقريباً`; }; });
  autoGrow($("textarea", el));
  $$("[data-act]", el).forEach((btn) => (btn.onclick = async (ev) => {
    const act = btn.dataset.act;
    if (act === "del") { if (confirm("حذف المشهد؟")) { await api("scene_delete", { id }); await reloadEP(); tabScript(b); } }
    else if (act === "up" || act === "down") {
      const ids = EP.scenes.map((s) => s.id), i = ids.indexOf(id), j = act === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= ids.length) return; [ids[i], ids[j]] = [ids[j], ids[i]];
      await api("scenes_reorder", { ids }); await reloadEP(); tabScript(b);
    } else if (act === "attach") pickAssets(EP.id, id, async () => { await reloadEP(); tabScript(b); });
    else if (act === "ai") sceneAIMenu(btn, el, id, b);
  }));
  $$("[data-un]", el).forEach((x) => (x.onclick = async (e) => { e.stopPropagation(); await api("unlink", { asset_id: +x.dataset.un, episode_id: EP.id, scene_id: +x.dataset.sc }); await reloadEP(); tabScript(b); }));
  const slot = $(".slot", el);
  slot.ondragover = (e) => { e.preventDefault(); slot.classList.add("over"); };
  slot.ondragleave = () => slot.classList.remove("over");
  slot.ondrop = async (e) => { e.preventDefault(); slot.classList.remove("over"); const aid = +e.dataTransfer.getData("asset"); if (aid) { await api("link", { asset_id: aid, episode_id: EP.id, scene_id: id }); await reloadEP(); tabScript(b); } };
}
function sceneAIMenu(btn, el, sid, b) {
  const ta = $("textarea", el), out = $(".ai-slot", el);
  const rw = (mode) => () => busy(btn, async () => {
    if (!ta.value.trim()) return toast("اكتب نص المشهد الأول", true);
    const r = await api("ai_rewrite", { text: ta.value, mode, episode_id: EP.id });
    aiResult(out, r, mode === "hook" ? null : (t) => { ta.value = t; ta.dispatchEvent(new Event("input")); });
  });
  menu(btn, [
    { label: "اقترح المرئي والموسيقى", icon: "image", do: () => busy(btn, async () => {
      const r = await api("ai_scene", { scene_id: sid });
      const vis = $('[data-f="visual"]', el), aud = $('[data-f="audio"]', el);
      vis.value = r.visual || vis.value; aud.value = r.audio || aud.value;
      vis.dispatchEvent(new Event("input")); aud.dispatchEvent(new Event("input"));
      out.innerHTML = `<div class="ai-out">🔎 دوّر على: ${esc((r.search || []).join(" · "))}${r.assets?.length ? `\n📎 من مكتبتك: ${r.assets.map((a) => esc(a.name)).join("، ")}<div class="row"><button class="btn sm primary" id="lnk">اربطهم بالمشهد</button></div>` : ""}</div>`;
      const l = $("#lnk", out); if (l) l.onclick = async () => { for (const a of r.assets) await api("link", { asset_id: a.id, episode_id: EP.id, scene_id: sid }); await reloadEP(); tabScript(b); };
    }) },
    "-",
    { label: "اختصره", icon: "wand", do: rw("shorter") }, { label: "طوّله", icon: "wand", do: rw("longer") },
    { label: "عامية مصرية طبيعية", icon: "wand", do: rw("egyptian") }, { label: "لمسة كوميدي", icon: "wand", do: rw("funny") },
    { label: "بسّطه", icon: "wand", do: rw("simple") }, { label: "صحّح الأخطاء", icon: "wand", do: rw("fix") },
    { label: "٥ هوكات للمشهد", icon: "ai", do: rw("hook") },
  ]);
}
function aiResult(container, text, apply) {
  let slot = container.classList.contains("ai-slot") ? container : $(".ai-slot", container) || container;
  const box = document.createElement("div");
  box.className = "ai-out";
  box.innerHTML = `${esc(text)}<div class="row">${apply ? `<button class="btn sm primary" data-ok>استبدل</button>` : ""}<button class="btn sm" data-cp>${ico("copy")}انسخ</button><button class="btn sm ghost" data-no style="color:#fff">قفل</button></div>`;
  if (slot === container && !container.classList.contains("ai-slot")) container.after(box); else { slot.innerHTML = ""; slot.appendChild(box); }
  const ok = $("[data-ok]", box); if (ok) ok.onclick = () => { apply(text); box.remove(); };
  $("[data-cp]", box).onclick = () => { navigator.clipboard.writeText(text); toast("✓ اتنسخ"); };
  $("[data-no]", box).onclick = () => box.remove();
}

/* ---------- assets tab */
async function tabAssets(b) {
  b.innerHTML = `<div class="card glass"><div class="card-h"><h3>${ico("clip")}ملحقات الحلقة <span class="muted" style="font-family:var(--font);font-size:13px">(${EP.bin.length})</span></h3>
    <div class="tools"><button class="btn sm" id="aFromLib">${ico("library")}من المكتبة</button><button class="btn sm primary" id="aImport">${ico("plus")}استيراد ملفات</button><button class="btn sm" id="aImportDir">${ico("folder")}فولدر</button></div></div>
    <p class="muted" style="font-size:12.5px;margin:-6px 0 14px">اسحب أي ملف من هنا على مشهد في «السكريبت» عشان تربطه بيه.</p>
    ${EP.bin.length ? `<div class="lib-grid">${EP.bin.map((a) => assetHTML(a)).join("")}</div>` : `<div class="empty">${ico("clip")}<b>مفيش ملحقات لسه</b><span>استورد صور وموسيقى وفيديوهات وقوالب للحلقة</span></div>`}</div>`;
  $("#aImport").onclick = (ev) => busy(ev.currentTarget, async () => { const r = await importDialog(EP.id); if (r?.length) { await reloadEP(); tabAssets(b); } });
  $("#aImportDir").onclick = (ev) => busy(ev.currentTarget, async () => { const r = await importDialog(EP.id, true); if (r?.length) { await reloadEP(); tabAssets(b); } });
  $("#aFromLib").onclick = () => pickAssets(EP.id, 0, async () => { await reloadEP(); tabAssets(b); });
  wireAssets(b, { onUnlink: async (a) => { await api("unlink", { asset_id: a, episode_id: EP.id }); await reloadEP(); tabAssets(b); } });
}
async function importDialog(eid = null, folder = false) {
  if (!S.info.native) {
    const p = prompt("مسار الملف أو الفولدر:"); if (!p) return [];
    return api("import_paths", { paths: [p], episode_id: eid });
  }
  const r = await api("import_dialog", { episode_id: eid, folder });
  if (r.length) toast(`✓ اتضاف ${r.length} ملف`);
  return r;
}
function assetHTML(a) {
  const th = (a.kind === "image" || a.kind === "video") ? `<img loading="lazy" src="thumb/${a.id}" onerror="this.remove()">` : "";
  return `<div class="asset" draggable="true" data-a="${a.id}"><div class="th">${ico(a.kind)}${th}<span class="chip k">${esc((a.name.split(".").pop() || "").toUpperCase())}</span></div>
    <div class="nm" title="${esc(a.name)}">${esc(a.name)}</div><div class="tg">${esc(a.tags || "بدون تاجات")}</div></div>`;
}
function wireAssets(root, opts = {}) {
  $$(".asset", root).forEach((el) => {
    el.ondragstart = (e) => e.dataTransfer.setData("asset", el.dataset.a);
    el.onclick = () => assetDrawer(+el.dataset.a, opts);
  });
}
async function assetDrawer(id, opts = {}) {
  $$(".drawer").forEach((d) => d.remove());
  const a = await api("asset", { id });
  const d = document.createElement("div");
  d.className = "drawer glass";
  const pv = a.kind === "image" ? `<img src="file/${a.id}">` : a.kind === "video" ? `<video src="file/${a.id}" controls preload="metadata"></video>` : `<div style="padding:30px">${ico(a.kind)}</div>`;
  d.innerHTML = `<div class="modal-h"><h3 class="ell">${esc(a.name)}</h3><button class="btn icon ghost" data-x>${ico("x")}</button></div>
    <div class="pv">${pv}</div>${a.kind === "music" ? `<audio src="file/${a.id}" controls preload="none"></audio>` : ""}
    <label class="f">التاجات<input class="in" id="dTags" value="${esc(a.tags)}" placeholder="كلمات للبحث مفصولة بفاصلة"></label>
    <label class="f">ملاحظة<textarea class="ta" id="dNote" style="min-height:70px">${esc(a.note)}</textarea></label>
    <button class="btn ai" id="dAI">${ico("ai")}تاجات ووصف بالذكاء الاصطناعي</button>
    <dl class="kv"><dt>النوع</dt><dd>${a.kind}</dd><dt>الحجم</dt><dd>${fmtSize(a.size)}</dd>${a.w ? `<dt>الأبعاد</dt><dd>${a.w}×${a.h}</dd>` : ""}<dt>المسار</dt><dd>${esc(a.path)}</dd>
      <dt>مستخدم في</dt><dd>${a.episodes.length ? a.episodes.map((e) => `<a href="#" data-e="${e.id}">${esc(e.title)}</a>`).join("، ") : "—"}</dd></dl>
    <div class="tools"><button class="btn sm" id="dOpen">${ico("open")}افتح</button><button class="btn sm" id="dReveal">${ico("folder")}في الفولدر</button>
      ${opts.onUnlink ? `<button class="btn sm" id="dUnlink">${ico("x")}شيله من الحلقة</button>` : ""}<button class="btn sm danger" id="dDel">${ico("trash")}امسح من المكتبة</button></div>`;
  document.body.appendChild(d);
  $("[data-x]", d).onclick = () => d.remove();
  const save = debounce(() => api("asset_update", { id, fields: { tags: $("#dTags", d).value, note: $("#dNote", d).value } }), 500);
  $("#dTags", d).oninput = save; $("#dNote", d).oninput = save;
  $("#dAI", d).onclick = (ev) => busy(ev.currentTarget, async () => { const r = await api("ai_tag", { id }); $("#dTags", d).value = r.tags; $("#dNote", d).value = r.note; toast("✓ اتعملت التاجات"); });
  $("#dOpen", d).onclick = () => api("open_path", { path: a.path });
  $("#dReveal", d).onclick = () => api("reveal", { path: a.path });
  $$("[data-e]", d).forEach((x) => (x.onclick = (e) => { e.preventDefault(); d.remove(); go("episode", +x.dataset.e); }));
  if (opts.onUnlink) $("#dUnlink", d).onclick = () => { d.remove(); opts.onUnlink(id); };
  $("#dDel", d).onclick = async () => { if (!confirm("مسح الملف من المكتبة؟")) return; await api("asset_delete", { id, delete_file: confirm("تمسح الملف نفسه من الجهاز كمان؟ (لو جوه فولدر المكتبة)") }); d.remove(); render(); };
}
async function pickAssets(eid, sceneId, done) {
  const list = await api("assets");
  const sel = new Set();
  const m = modal(`<div class="modal-h"><h2>اختار من المكتبة</h2><button class="btn icon ghost" data-close>${ico("x")}</button></div>
    <div class="lib-bar"><input class="in" id="pQ" placeholder="ابحث بالاسم أو التاج"><button class="btn sm" id="pImp">${ico("plus")}استيراد جديد</button></div>
    <div class="lib-grid" id="pGrid" style="max-height:52vh;overflow:auto;padding:4px"></div>
    <div class="modal-f"><button class="btn primary" id="pOk">اربط</button><button class="btn ghost" data-close>إلغاء</button></div>`, { wide: true });
  const draw = (q = "") => {
    const l = list.filter((a) => !q || (a.name + " " + a.tags).toLowerCase().includes(q.toLowerCase()));
    $("#pGrid", m).innerHTML = l.length ? l.map(assetHTML).join("") : `<div class="empty" style="grid-column:1/-1">${ico("library")}<b>المكتبة فاضية</b></div>`;
    $$(".asset", m).forEach((el) => { el.classList.toggle("sel", sel.has(+el.dataset.a)); el.onclick = () => { const i = +el.dataset.a; sel.has(i) ? sel.delete(i) : sel.add(i); el.classList.toggle("sel"); }; });
  };
  draw();
  $("#pQ", m).oninput = (e) => draw(e.target.value);
  $("#pImp", m).onclick = async () => { const ids = await importDialog(null); ids.forEach((i) => sel.add(i)); list.splice(0, list.length, ...(await api("assets"))); draw(); };
  $("#pOk", m).onclick = async () => { for (const a of sel) await api("link", { asset_id: a, episode_id: eid, scene_id: sceneId }); m.close(); done && done(); };
}

/* ---------- tasks & sources tab */
function tabTasks(b) {
  b.innerHTML = `<div class="grid2">
    <div class="card glass"><div class="card-h"><h3>${ico("check")}المهام</h3><button class="btn sm ai" id="tAI">${ico("ai")}طلّع مهام من السكريبت</button></div>
      <div id="tList">${EP.tasks_list.map((t) => `<div class="task ${t.done ? "done" : ""}" data-t="${t.id}"><input type="checkbox" ${t.done ? "checked" : ""}><input class="in" value="${esc(t.text)}"><button class="btn sm icon ghost del">${ico("trash")}</button></div>`).join("")}</div>
      <div class="quick" style="margin-top:10px"><input class="in" id="tNew" placeholder="مهمة جديدة… واضغط Enter"></div></div>
    <div class="card glass"><div class="card-h"><h3>${ico("link")}المصادر والبحث</h3><button class="btn sm ai" id="rAI">${ico("ai")}لخّص مصدر</button></div>
      <div id="sList">${EP.sources.map((s) => `<div class="src" data-s="${s.id}"><input class="in" data-f="title" value="${esc(s.title)}" placeholder="العنوان"><input class="in" data-f="url" value="${esc(s.url)}" placeholder="الرابط" dir="ltr"><div class="tools"><button class="btn sm icon ghost op">${ico("open")}</button><button class="btn sm icon ghost del">${ico("trash")}</button></div></div>`).join("")}</div>
      <button class="btn sm" id="sAdd" style="margin-top:10px">${ico("plus")}مصدر</button>
      <label class="f" style="margin-top:16px">ملاحظات البحث<textarea class="ta" id="eNotes" style="min-height:160px" placeholder="معلومات، أرقام، قصص…">${esc(EP.notes || "")}</textarea></label></div></div>`;
  $$(".task", b).forEach((row) => {
    const id = +row.dataset.t;
    $("input[type=checkbox]", row).onchange = (e) => { api("task_save", { task: { id, done: e.target.checked ? 1 : 0 } }); row.classList.toggle("done", e.target.checked); };
    const sv = debounce((v) => api("task_save", { task: { id, text: v } }), 500);
    $(".in", row).oninput = (e) => sv(e.target.value);
    $(".del", row).onclick = async () => { await api("task_delete", { id }); row.remove(); };
  });
  $("#tNew").onkeydown = async (e) => { if (e.key === "Enter" && e.target.value.trim()) { await api("task_save", { task: { episode_id: EP.id, text: e.target.value.trim() } }); await reloadEP(); tabTasks(b); $("#tNew").focus(); } };
  $("#tAI").onclick = (ev) => busy(ev.currentTarget, async () => { const r = await api("ai_tasks", { id: EP.id }); toast(`✓ اتضاف ${r.tasks?.length || 0} مهمة`); await reloadEP(); tabTasks(b); });
  $$(".src", b).forEach((row) => {
    const id = +row.dataset.s;
    const sv = debounce(() => api("source_save", { source: { id, title: $('[data-f="title"]', row).value, url: $('[data-f="url"]', row).value } }), 500);
    $$(".in", row).forEach((i) => (i.oninput = sv));
    $(".op", row).onclick = () => api("open_url", { url: $('[data-f="url"]', row).value });
    $(".del", row).onclick = async () => { await api("source_delete", { id }); row.remove(); };
  });
  $("#sAdd").onclick = async () => { await api("source_save", { source: { episode_id: EP.id } }); await reloadEP(); tabTasks(b); };
  const ns = debounce((v) => api("episode_update", { id: EP.id, fields: { notes: v } }), 600);
  autoGrow($("#eNotes")); $("#eNotes").oninput = (e) => ns(e.target.value);
  $("#rAI").onclick = () => {
    const m = modal(`<div class="modal-h"><h2>${ico("ai")} لخّص مصدر للحلقة</h2><button class="btn icon ghost" data-close>${ico("x")}</button></div>
      <label class="f">الصق نص المقال أو المصدر هنا<textarea class="ta" id="rTxt" style="min-height:220px"></textarea></label>
      <div class="modal-f"><button class="btn ai" id="rGo">${ico("ai")}لخّص</button></div><div id="rOut"></div>`, { wide: true });
    $("#rGo", m).onclick = (ev) => busy(ev.currentTarget, async () => {
      const r = await api("ai_research", { id: EP.id, text: $("#rTxt", m).value });
      aiResult($("#rOut", m), r, (t) => { const n = $("#eNotes"); n.value = (n.value ? n.value + "\n\n" : "") + t; n.dispatchEvent(new Event("input")); m.close(); toast("✓ اتضاف لملاحظات البحث"); });
    });
  };
}

/* ---------- publish tab */
function tabPublish(b) {
  const p = (EP.meta && EP.meta.publish) || null;
  const copyBtn = (t) => `<button class="btn sm icon ghost" data-copy="${esc(t)}" title="انسخ">${ico("copy")}</button>`;
  b.innerHTML = `<div class="card glass"><div class="card-h"><h3>${ico("rocket")}باكدج النشر على يوتيوب</h3><button class="btn ai" id="pAI">${ico("ai")}${p ? "اعمل تاني" : "جهّز بالذكاء الاصطناعي"}</button></div>
    ${p ? `<div class="grid2">
      <div style="display:flex;flex-direction:column;gap:16px">
        <div><h4 style="margin-bottom:8px">العناوين</h4><div class="pub-list">${(p.titles || []).map((t) => `<div class="pub-item"><span>${esc(t)}</span>${copyBtn(t)}<button class="btn sm ghost" data-title="${esc(t)}">استخدمه</button></div>`).join("")}</div></div>
        <div><h4 style="margin-bottom:8px">أفكار الثمبنيل</h4><div class="pub-list">${(p.thumbnail || []).map((t) => `<div class="pub-item"><span>🖼️ ${esc(t)}</span></div>`).join("")}</div></div>
        <div><h4 style="margin-bottom:8px">أفكار شورتس من الحلقة</h4><div class="pub-list">${(p.shorts || []).map((t) => `<div class="pub-item"><span>📱 ${esc(t)}</span></div>`).join("")}</div></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div><div class="card-h" style="margin-bottom:8px"><h4>الوصف</h4>${copyBtn(p.description || "")}</div><textarea class="ta" style="min-height:280px" readonly>${esc(p.description || "")}</textarea></div>
        <div><div class="card-h" style="margin-bottom:8px"><h4>التاجات</h4>${copyBtn((p.tags || []).join(", "))}</div><div class="tags">${(p.tags || []).map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div></div>
      </div></div>` : `<div class="empty">${ico("rocket")}<b>جهّز النشر</b><span>عناوين، وصف بفهرس زمني، تاجات، أفكار ثمبنيل وشورتس — كله من السكريبت</span></div>`}</div>`;
  $("#pAI").onclick = (ev) => busy(ev.currentTarget, async () => { if (!EP.scenes.length) toast("الأحسن تكتب السكريبت الأول عشان النتيجة تبقى أدق"); await api("ai_publish", { id: EP.id }); await reloadEP(); tabPublish(b); });
  $$("[data-copy]", b).forEach((x) => (x.onclick = () => { navigator.clipboard.writeText(x.dataset.copy); toast("✓ اتنسخ"); }));
  $$("[data-title]", b).forEach((x) => (x.onclick = async () => { await api("episode_update", { id: EP.id, fields: { title: x.dataset.title } }); $("#eTitle").value = x.dataset.title; toast("✓ العنوان اتغيّر"); }));
}

/* ---------- chat (episode + global) */
function tabChat(b) { chatUI(b, EP.id, ["اقترح ٣ نهايات أقوى للحلقة", "إيه النقط الضعيفة في السكريبت؟", "اقترح جملة دعوة للتفاعل", "اعمل ملخص في ٣ سطور"], true); }
async function chatUI(root, eid, suggestions, inline = false) {
  const log = await api("chat_log", { episode_id: eid });
  root.innerHTML = `<div class="card glass chat ${inline ? "inline" : ""}">
    <div class="msgs" id="msgs">${log.length ? log.map((m) => `<div class="msg ${m.role}">${esc(m.content)}</div>`).join("") : `<div class="empty">${ico("ai")}<b>اسأل أي حاجة</b><span>${eid ? "المساعد عارف السكريبت والمصادر بتوع الحلقة دي" : "المساعد عارف كل حلقاتك"}</span><div class="sugg">${suggestions.map((s) => `<button>${esc(s)}</button>`).join("")}</div></div>`}</div>
    <div class="composer"><textarea class="ta" id="cIn" placeholder="اكتب رسالتك… (Enter للإرسال، Shift+Enter لسطر جديد)"></textarea>
      <button class="btn icon primary" id="cSend" title="إرسال">${ico("send")}</button>${log.length ? `<button class="btn icon ghost" id="cClear" title="مسح المحادثة">${ico("trash")}</button>` : ""}</div></div>`;
  const msgs = $("#msgs", root), inp = $("#cIn", root);
  msgs.scrollTop = msgs.scrollHeight;
  autoGrow(inp);
  const send = async (text) => {
    text = (text || inp.value).trim(); if (!text) return;
    inp.value = ""; inp.dispatchEvent(new Event("input"));
    $(".empty", msgs)?.remove();
    msgs.insertAdjacentHTML("beforeend", `<div class="msg user">${esc(text)}</div><div class="msg assistant typing">بيفكر…</div>`);
    msgs.scrollTop = msgs.scrollHeight;
    try { const r = await api("chat_send", { message: text, episode_id: eid }); $(".typing", msgs).outerHTML = `<div class="msg assistant">${esc(r)}</div>`; }
    catch (e) { $(".typing", msgs)?.remove(); fail(e); }
    msgs.scrollTop = msgs.scrollHeight;
  };
  inp.onkeydown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };
  $("#cSend", root).onclick = () => send();
  $$(".sugg button", root).forEach((b) => (b.onclick = () => send(b.textContent)));
  const c = $("#cClear", root); if (c) c.onclick = async () => { await api("chat_clear", { episode_id: eid }); chatUI(root, eid, suggestions, inline); };
}
async function viewAssistant(main) {
  main.innerHTML = `<div class="view"><div class="top"><div><h1>المساعد الذكي</h1><p class="muted">بيعرف كل حلقاتك ومراحلها — اسأله عن أفكار، خطة نشر، أو أي حاجة في الإنتاج</p></div></div><div id="gChat"></div></div>`;
  chatUI($("#gChat"), null, ["اقترح خطة نشر للشهر الجاي", "أنهي حلقة أبدأ بيها الأسبوع ده؟", "اقترح سلسلة جديدة تناسب القناة", "إزاي أحسّن الهوكات بتاعتي؟"]);
}

/* ================================================================== IDEAS WHITEBOARD */
const NOTE_COLORS = ["cream", "peach", "rose", "mint", "sky", "lilac", "ink"];
async function viewIdeas(main) {
  main.innerHTML = `<div class="view"><div class="top"><div><h1>لوحة الأفكار</h1><p class="muted">دبل كليك في أي مكان تكتب فكرة · اسحب بالماوس تتحرك · العجلة للزوم</p></div>
    <div class="actions"><button class="btn ai" id="wAI">${ico("ai")}نظّم الأفكار</button></div></div>
    <div class="board-wrap" id="bw"><div class="board-world" id="world"><svg class="board-svg" id="wires" width="1" height="1"></svg></div>
      <div class="board-tools glass"><button class="btn sm" id="wNote">${ico("note")}فكرة</button><button class="btn sm" id="wImg">${ico("image")}صورة</button><button class="btn sm" id="wLink">${ico("link")}وصّل</button></div>
      <div class="board-zoom glass"><button class="btn sm icon ghost" id="zOut">−</button><span id="zPct" style="min-width:44px;text-align:center">100%</span><button class="btn sm icon ghost" id="zIn">+</button><button class="btn sm ghost" id="zFit">ملائمة</button></div>
    </div></div>`;
  const bw = $("#bw"), world = $("#world"), wires = $("#wires");
  let data = await api("board");
  let view = JSON.parse(localStorage.getItem("qp-board-view") || '{"x":60,"y":60,"z":1}');
  let linkFrom = null, selId = null;
  const apply = () => { world.style.transform = `translate(${view.x}px,${view.y}px) scale(${view.z})`; $("#zPct").textContent = Math.round(view.z * 100) + "%"; localStorage.setItem("qp-board-view", JSON.stringify(view)); };
  const toWorld = (cx, cy) => { const r = bw.getBoundingClientRect(); return { x: (cx - r.left - view.x) / view.z, y: (cy - r.top - view.y) / view.z }; };

  function drawWires() {
    const pos = Object.fromEntries(data.items.map((i) => [i.id, i]));
    wires.innerHTML = data.links.map((l) => {
      const a = pos[l.a], b = pos[l.b]; if (!a || !b) return "";
      const ax = a.x + a.w / 2, ay = a.y + a.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2, mx = (ax + bx) / 2;
      return `<path d="M${ax} ${ay} C${mx} ${ay},${mx} ${by},${bx} ${by}" stroke="#ff4d2e" stroke-opacity=".55" stroke-width="2.5" fill="none" stroke-dasharray="6 6"/>`;
    }).join("");
  }
  function noteHTML(it) {
    const isImg = it.type === "image";
    return `<div class="note ${isImg ? "img" : "n-" + (it.color || "cream")}" data-id="${it.id}" style="left:${it.x}px;top:${it.y}px;width:${it.w}px;height:${it.h}px">
      ${isImg ? `<img src="thumb/${it.asset_id}">` : `<div class="txt">${esc(it.text)}</div>`}
      ${it.episode_id ? `<span class="chip ep-chip" data-go="${it.episode_id}">🎬 ${esc(it.episode_title || "حلقة")}</span>` : ""}
      <div class="bar">${isImg ? "" : `<button data-a="color" title="لون">🎨</button><button data-a="ep" title="حوّلها لحلقة">🎬</button>`}<button data-a="del" title="حذف">✕</button></div></div>`;
  }
  function draw() {
    $$(".note", world).forEach((n) => n.remove());
    world.insertAdjacentHTML("beforeend", data.items.map(noteHTML).join(""));
    drawWires();
    $$(".note", world).forEach(wireNote);
  }
  function wireNote(el) {
    const id = +el.dataset.id, it = data.items.find((i) => i.id === id);
    el.onpointerdown = (e) => {
      if (e.target.closest(".bar,[contenteditable=true],.ep-chip")) return;
      e.stopPropagation();
      if (linkFrom) { if (linkFrom !== id) api("board_link", { a: linkFrom, b: id }).then(async () => { data = await api("board"); draw(); }); $$(".link-src").forEach((x) => x.classList.remove("link-src")); linkFrom = null; return; }
      $$(".note.sel").forEach((x) => x.classList.remove("sel")); el.classList.add("sel"); selId = id;
      const sx = e.clientX, sy = e.clientY, ox = it.x, oy = it.y; let moved = false;
      el.setPointerCapture(e.pointerId);
      el.onpointermove = (m) => { moved = true; it.x = ox + (m.clientX - sx) / view.z; it.y = oy + (m.clientY - sy) / view.z; el.style.left = it.x + "px"; el.style.top = it.y + "px"; drawWires(); };
      el.onpointerup = () => { el.onpointermove = null; if (moved) api("board_save", { item: { id, x: Math.round(it.x), y: Math.round(it.y) } }); };
    };
    const txt = $(".txt", el);
    if (txt) {
      el.ondblclick = (e) => { e.stopPropagation(); txt.contentEditable = "true"; txt.focus(); document.getSelection().selectAllChildren(txt); document.getSelection().collapseToEnd(); };
      txt.onblur = () => { txt.contentEditable = "false"; it.text = txt.innerText; api("board_save", { item: { id, text: it.text } }); };
    }
    $$(".bar button", el).forEach((b) => (b.onclick = async (e) => {
      e.stopPropagation();
      if (b.dataset.a === "del") { await api("board_delete", { id }); data = await api("board"); draw(); }
      else if (b.dataset.a === "color") menu(b, NOTE_COLORS.map((c) => ({ label: { cream: "كريمي", peach: "خوخي", rose: "وردي", mint: "نعناعي", sky: "سماوي", lilac: "ليلكي", ink: "غامق" }[c], do: async () => { await api("board_save", { item: { id, color: c } }); it.color = c; draw(); } })));
      else if (b.dataset.a === "ep") { const eid = await api("board_to_episode", { id, series_id: null }); toast("✓ اتعملت حلقة"); data = await api("board"); draw(); setTimeout(() => go("episode", eid), 400); }
    }));
    const chip = $(".ep-chip", el); if (chip) chip.onclick = () => go("episode", +chip.dataset.go);
  }
  async function addNote(x, y, text = "") {
    const id = await api("board_save", { item: { type: "note", x: Math.round(x), y: Math.round(y), w: 230, h: 150, text, color: NOTE_COLORS[Math.floor(Math.random() * 6)] } });
    data = await api("board"); draw();
    const el = $(`.note[data-id="${id}"]`, world); el && el.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
  }
  // pan / zoom
  bw.onpointerdown = (e) => {
    if (e.target.closest(".note,.board-tools,.board-zoom")) return;
    $$(".note.sel").forEach((x) => x.classList.remove("sel"));
    const sx = e.clientX - view.x, sy = e.clientY - view.y; bw.classList.add("panning");
    bw.setPointerCapture(e.pointerId);
    bw.onpointermove = (m) => { view.x = m.clientX - sx; view.y = m.clientY - sy; apply(); };
    bw.onpointerup = () => { bw.onpointermove = null; bw.classList.remove("panning"); };
  };
  bw.onwheel = (e) => { e.preventDefault(); const r = bw.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top; const nz = Math.min(2.5, Math.max(.25, view.z * (e.deltaY < 0 ? 1.1 : 1 / 1.1))); view.x = px - (px - view.x) * (nz / view.z); view.y = py - (py - view.y) * (nz / view.z); view.z = nz; apply(); };
  bw.ondblclick = (e) => { if (e.target.closest(".note,.board-tools,.board-zoom")) return; const p = toWorld(e.clientX, e.clientY); addNote(p.x - 115, p.y - 40); };
  $("#zIn").onclick = () => { view.z = Math.min(2.5, view.z * 1.2); apply(); };
  $("#zOut").onclick = () => { view.z = Math.max(.25, view.z / 1.2); apply(); };
  $("#zFit").onclick = () => {
    if (!data.items.length) { view = { x: 60, y: 60, z: 1 }; return apply(); }
    const xs = data.items.map((i) => i.x), ys = data.items.map((i) => i.y), xe = data.items.map((i) => i.x + i.w), ye = data.items.map((i) => i.y + i.h);
    const minx = Math.min(...xs), miny = Math.min(...ys), w = Math.max(...xe) - minx, h = Math.max(...ye) - miny, r = bw.getBoundingClientRect();
    view.z = Math.min(1.4, Math.max(.25, Math.min((r.width - 120) / w, (r.height - 120) / h))); view.x = (r.width - w * view.z) / 2 - minx * view.z; view.y = (r.height - h * view.z) / 2 - miny * view.z; apply();
  };
  $("#wNote").onclick = () => { const r = bw.getBoundingClientRect(); const p = toWorld(r.left + r.width / 2, r.top + r.height / 2); addNote(p.x - 115 + Math.random() * 60, p.y - 75 + Math.random() * 60); };
  $("#wLink").onclick = () => { if (!selId) return toast("اختار فكرة الأول، وبعدين اضغط «وصّل» واختار التانية"); linkFrom = selId; $(`.note[data-id="${selId}"]`, world)?.classList.add("link-src"); toast("اضغط على الفكرة اللي عايز توصلها"); };
  $("#wImg").onclick = async () => {
    const list = (await api("assets", { kind: "image" }));
    if (!list.length) { const ids = await importDialog(null); if (!ids.length) return; return $("#wImg").click(); }
    const m = modal(`<div class="modal-h"><h2>حط صورة على اللوحة</h2><button class="btn icon ghost" data-close>${ico("x")}</button></div><div class="lib-grid" style="max-height:60vh;overflow:auto">${list.map(assetHTML).join("")}</div>`, { wide: true });
    $$(".asset", m).forEach((el) => (el.onclick = async () => { m.close(); const r = bw.getBoundingClientRect(); const p = toWorld(r.left + r.width / 2, r.top + r.height / 2); await api("board_save", { item: { type: "image", asset_id: +el.dataset.a, x: Math.round(p.x - 120), y: Math.round(p.y - 80), w: 240, h: 160 } }); data = await api("board"); draw(); }));
  };
  $("#wAI").onclick = (ev) => busy(ev.currentTarget, async () => {
    if (data.items.filter((i) => i.type === "note" && i.text.trim()).length < 2) return toast("اكتب فكرتين على الأقل الأول", true);
    const r = await api("ai_board");
    const m = modal(`<div class="modal-h"><h2>${ico("ai")} الأفكار متجمّعة</h2><button class="btn icon ghost" data-close>${ico("x")}</button></div>
      ${(r.groups || []).map((g, i) => `<div class="idea-card"><b>${esc(g.title)}</b><span class="muted">${esc(g.why || "")}</span>
        <ul>${(g.ids || []).map((id) => data.items.find((x) => x.id === +id)).filter(Boolean).map((x) => `<li>${esc(x.text.split("\n")[0])}</li>`).join("")}</ul>
        <div class="tools"><button class="btn sm" data-arr="${i}">رتّبهم جنب بعض</button><button class="btn sm primary" data-mk="${i}">${ico("plus")}اعملها حلقة</button></div></div>`).join("")}`, { wide: true });
    $$("[data-arr]", m).forEach((b) => (b.onclick = async () => {
      const g = r.groups[+b.dataset.arr], items = g.ids.map((id) => data.items.find((x) => x.id === +id)).filter(Boolean);
      const baseX = Math.max(0, ...data.items.map((i) => i.x + i.w)) + 120;
      for (const [k, it] of items.entries()) await api("board_save", { item: { id: it.id, x: baseX + (k % 3) * 250, y: 40 + Math.floor(k / 3) * 180 } });
      for (let k = 1; k < items.length; k++) await api("board_link", { a: items[0].id, b: items[k].id });
      data = await api("board"); draw(); $("#zFit").click(); b.textContent = "✓";
    }));
    $$("[data-mk]", m).forEach((b) => (b.onclick = async () => {
      const g = r.groups[+b.dataset.mk];
      const notes = g.ids.map((id) => data.items.find((x) => x.id === +id)).filter(Boolean).map((x) => "- " + x.text).join("\n");
      await api("episode_create", { episode: { title: g.title, notes } }); b.outerHTML = `<span class="chip" style="color:var(--ok)">✓ اتعملت</span>`;
    }));
  });
  apply(); draw();
  if (!data.items.length) setTimeout(() => toast("دبل كليك في أي مكان على اللوحة عشان تكتب أول فكرة ✍️"), 400);
}

/* ================================================================== LIBRARY */
const KIND_AR = { all: "الكل", image: "صور", video: "فيديو", music: "موسيقى وصوت", graphic: "جرافيك وقوالب", doc: "مستندات", font: "خطوط", other: "أخرى" };
let LIB = { kind: "all", q: "" };
async function viewLibrary(main) {
  main.innerHTML = `<div class="view"><div class="top"><div><h1>المكتبة</h1><p class="muted">كل الصور والموسيقى والفيديوهات والقوالب اللي بتستخدمها — بتاجات وبحث</p></div>
    <div class="actions"><button class="btn" id="lDir">${ico("folder")}استيراد فولدر</button><button class="btn primary" id="lImp">${ico("plus")}استيراد ملفات</button></div></div>
    <div class="lib-bar"><div class="seg" id="lKinds">${Object.entries(KIND_AR).map(([k, l]) => `<button data-k="${k}" class="${LIB.kind === k ? "on" : ""}">${l}</button>`).join("")}</div>
      <input class="in" id="lQ" value="${esc(LIB.q)}" placeholder="ابحث بالاسم أو التاج…" style="margin-inline-start:auto"></div>
    <div id="lGrid"></div></div>`;
  const draw = async () => {
    const list = await api("assets", { kind: LIB.kind, q: LIB.q });
    $("#lGrid").innerHTML = list.length ? `<div class="lib-grid">${list.map(assetHTML).join("")}</div>` : `<div class="card glass empty">${ico("library")}<b>${LIB.q || LIB.kind !== "all" ? "مفيش نتايج" : "المكتبة فاضية"}</b><span>استورد ملفاتك — ${S.info.settings.copy_into_library ? "هتتنسخ في فولدر المكتبة ومتقسمة حسب النوع" : "هتفضل في مكانها"}</span></div>`;
    wireAssets($("#lGrid"));
  };
  $$("#lKinds button").forEach((b) => (b.onclick = () => { LIB.kind = b.dataset.k; $$("#lKinds button").forEach((x) => x.classList.toggle("on", x === b)); draw(); }));
  const dq = debounce(draw, 250);
  $("#lQ").oninput = (e) => { LIB.q = e.target.value; dq(); };
  $("#lImp").onclick = (ev) => busy(ev.currentTarget, async () => { await importDialog(null); draw(); });
  $("#lDir").onclick = (ev) => busy(ev.currentTarget, async () => { await importDialog(null, true); draw(); });
  draw();
}

/* ================================================================== CALENDAR */
let CAL = (() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; })();
async function viewCalendar(main) {
  const eps = await api("episodes");
  const first = new Date(CAL.y, CAL.m, 1), start = new Date(first); start.setDate(1 - first.getDay());
  const todayS = new Date().toISOString().slice(0, 10);
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const days = []; for (let i = 0; i < 42; i++) { const d = new Date(start); d.setDate(start.getDate() + i); days.push(d); }
  const unsched = eps.filter((e) => !e.publish_date && e.stage !== "published");
  main.innerHTML = `<div class="view"><div class="top"><div><h1>تقويم النشر</h1><p class="muted">اسحب أي حلقة على اليوم اللي هتنزل فيه</p></div>
    <div class="actions cal-h"><button class="btn icon" id="cPrev">${ico("back")}</button><h2 style="min-width:170px;text-align:center">${AR_MONTHS[CAL.m]} ${CAL.y}</h2><button class="btn icon" id="cNext" style="transform:scaleX(-1)">${ico("back")}</button><button class="btn sm" id="cToday">النهارده</button></div></div>
    <div style="display:grid;grid-template-columns:minmax(0,1fr) 240px;gap:16px;align-items:start">
      <div class="card glass"><div class="cal">${AR_DAYS.map((d) => `<div class="dow">${d}</div>`).join("")}
        ${days.map((d) => { const s = iso(d); const list = eps.filter((e) => e.publish_date === s); return `<div class="day ${d.getMonth() !== CAL.m ? "out" : ""} ${s === todayS ? "today" : ""}" data-d="${s}"><span class="d">${d.getDate()}</span>${list.map((e) => `<span class="e" draggable="true" data-id="${e.id}" style="--c:${stageColor(e.stage)}" title="${esc(e.title)}">${esc(e.title)}</span>`).join("")}</div>`; }).join("")}</div></div>
      <div class="card glass"><h3 style="margin-bottom:10px">من غير ميعاد</h3><div class="list" style="gap:6px">${unsched.length ? unsched.map((e) => `<span class="e chip" draggable="true" data-id="${e.id}" style="cursor:grab;white-space:normal;line-height:1.6;padding:6px 10px"><span class="dot" style="background:${stageColor(e.stage)}"></span>${esc(e.title)}</span>`).join("") : `<span class="muted" style="font-size:13px">كل الحلقات ليها مواعيد 👌</span>`}</div></div></div></div>`;
  $("#cPrev").onclick = () => { CAL.m--; if (CAL.m < 0) { CAL.m = 11; CAL.y--; } render(); };
  $("#cNext").onclick = () => { CAL.m++; if (CAL.m > 11) { CAL.m = 0; CAL.y++; } render(); };
  $("#cToday").onclick = () => { const d = new Date(); CAL = { y: d.getFullYear(), m: d.getMonth() }; render(); };
  $$(".e", main).forEach((e) => { e.ondragstart = (ev) => ev.dataTransfer.setData("ep", e.dataset.id); e.onclick = () => go("episode", +e.dataset.id); });
  $$(".day", main).forEach((d) => {
    d.ondragover = (e) => { e.preventDefault(); d.classList.add("over"); };
    d.ondragleave = () => d.classList.remove("over");
    d.ondrop = async (e) => { e.preventDefault(); const id = +e.dataTransfer.getData("ep"); if (id) { await api("episode_update", { id, fields: { publish_date: d.dataset.d } }); render(); } };
  });
}

/* ================================================================== TELEPROMPTER */
function teleprompter(e) {
  if (!e.scenes.length) return toast("مفيش سكريبت لسه", true);
  const p = document.createElement("div");
  p.className = "prompter";
  p.innerHTML = `<div class="pbar"><button class="btn sm" id="pPlay">${ico("play")}تشغيل</button>
    <label>السرعة <input type="range" id="pSpeed" min="10" max="160" value="50"></label>
    <label>الخط <input type="range" id="pSize" min="32" max="110" value="56"></label>
    <button class="btn sm" id="pMirror">مراية</button><span class="muted" style="margin-inline-start:auto">مسافة = تشغيل/إيقاف · الأسهم = تقديم/ترجيع · Esc = خروج</span><button class="btn sm" id="pClose">${ico("x")}خروج</button></div>
    <div class="scroll"><div class="guide"></div><div class="text" id="pText">${e.hook ? `<h4>الهوك</h4>${esc(e.hook)}` : ""}${e.scenes.map((s, i) => `<h4>${i + 1}. ${esc(s.heading)}</h4>${esc(s.text).replace(/\n/g, "<br>")}`).join("")}</div></div>`;
  document.body.appendChild(p);
  const t = $("#pText", p); let y = 0, on = false, last = 0, raf;
  const step = (ts) => { if (on) { const dt = last ? (ts - last) / 1000 : 0; y += dt * +$("#pSpeed", p).value; t.style.transform = `translateY(${-y}px)${p.classList.contains("mirror") ? " scaleX(-1)" : ""}`; } last = ts; raf = requestAnimationFrame(step); };
  raf = requestAnimationFrame(step);
  const toggle = () => { on = !on; $("#pPlay", p).innerHTML = on ? `${ico("pause")}إيقاف` : `${ico("play")}تشغيل`; };
  $("#pPlay", p).onclick = toggle;
  $("#pSize", p).oninput = (ev) => t.style.setProperty("--pf", ev.target.value + "px");
  $("#pMirror", p).onclick = () => p.classList.toggle("mirror");
  const close = () => { cancelAnimationFrame(raf); p.remove(); document.removeEventListener("keydown", key); };
  $("#pClose", p).onclick = close;
  const key = (ev) => { if (ev.key === "Escape") close(); if (ev.key === " ") { ev.preventDefault(); toggle(); } if (ev.key === "ArrowDown") y += 80; if (ev.key === "ArrowUp") y = Math.max(0, y - 80); };
  document.addEventListener("keydown", key);
  p.requestFullscreen?.().catch(() => {});
}

/* ================================================================== SETTINGS */
function openSettings(focus) {
  const st = S.info.settings, P = S.info.providers;
  const m = modal(`<div class="modal-h"><h2>الإعدادات</h2><button class="btn icon ghost" data-close>${ico("x")}</button></div>
    <h3>${ico("ai")} الذكاء الاصطناعي</h3>
    <label class="f">الخدمة<select class="sel" id="aiP">${Object.entries(P).map(([k, v]) => `<option value="${k}" ${st.ai_provider === k ? "selected" : ""}>${v.name}</option>`).join("")}</select></label>
    <div id="aiHelp" class="muted" style="font-size:13px;line-height:1.8"></div>
    <label class="f" id="aiKeyL">المفتاح / التوكن<input class="in" id="aiKey" type="password" dir="ltr" placeholder="${st.ai_keys[st.ai_provider] ? "محفوظ ✓ — اكتب جديد لو عايز تغيّره" : "الصق هنا"}"></label>
    <div class="grid2"><label class="f">الموديل<input class="in" id="aiModel" dir="ltr" list="aiModels" value="${esc(st.ai_model || "")}"><datalist id="aiModels"></datalist></label>
      <label class="f" id="aiUrlL">عنوان الخدمة (Ollama / LM Studio)<input class="in" id="aiUrl" dir="ltr" value="${esc(st.ai_url || "http://localhost:11434/v1/chat/completions")}"></label></div>
    <div class="tools"><button class="btn" id="aiTest">${ico("ai")}جرّب الاتصال</button></div>
    <hr style="border:0;border-top:1px solid var(--line)">
    <h3>${ico("library")} المكتبة والسكريبت</h3>
    <label class="f">فولدر المكتبة<div class="quick"><input class="in" id="libDir" dir="ltr" value="${esc(st.library_dir)}"><button class="btn sm" id="libPick">${ico("folder")}اختار</button></div></label>
    <label class="tog"><span>انسخ الملفات المستوردة جوه فولدر المكتبة (متقسمة حسب النوع)</span><input type="checkbox" id="copyLib" ${st.copy_into_library ? "checked" : ""}><span class="sw"></span></label>
    <label class="f">سرعة الكلام (كلمة في الدقيقة) — لحساب المدة<input class="in" id="wpm" type="number" min="80" max="220" value="${st.wpm}" style="width:140px"></label>
    <hr style="border:0;border-top:1px solid var(--line)">
    <h3>${ico("settings")} البرنامج</h3>
    <label class="tog"><span>تحديث تلقائي من GitHub</span><input type="checkbox" id="autoUpd" ${st.auto_update !== false ? "checked" : ""}><span class="sw"></span></label>
    <div class="tools"><button class="btn sm" id="chkUpd">ابحث عن تحديث</button><button class="btn sm" id="bak">${ico("export")}نسخة احتياطية</button>
      <span class="muted" style="font-size:12.5px;align-self:center">الإصدار ${S.info.version} · من أحمد قاسم — قَاسِمز</span></div>
    <div class="modal-f"><button class="btn primary" id="setSave">حفظ</button><button class="btn ghost" data-close>إلغاء</button></div>`, { wide: true });
  const HELP = {
    github: `مجاني مع حساب GitHub بتاعك: افتح <a href="#" data-url="https://github.com/settings/personal-access-tokens/new">إنشاء توكن</a> ← في Permissions اختار <b>Models: Read-only</b> ← Generate ← الصقه هنا.`,
    anthropic: `من <a href="#" data-url="https://console.anthropic.com/settings/keys">Anthropic Console</a> اعمل API key والصقه هنا (مدفوع حسب الاستخدام).`,
    openai: `لموديل محلي: نزّل <a href="#" data-url="https://ollama.com">Ollama</a> وشغّل مثلاً <code dir="ltr">ollama pull qwen2.5:7b</code>. أو أي خدمة متوافقة مع OpenAI (حط الـ key لو محتاجة).`,
  };
  const sync = () => {
    const p = $("#aiP", m).value;
    $("#aiHelp", m).innerHTML = HELP[p];
    $$("[data-url]", m).forEach((a) => (a.onclick = (e) => { e.preventDefault(); api("open_url", { url: a.dataset.url }); }));
    $("#aiUrlL", m).classList.toggle("hidden", p !== "openai");
    $("#aiModels", m).innerHTML = P[p].models.map((x) => `<option value="${x}">`).join("");
    $("#aiModel", m).placeholder = P[p].default_model;
    $("#aiKey", m).placeholder = st.ai_keys[p] ? "محفوظ ✓ — اكتب جديد لو عايز تغيّره" : (p === "openai" ? "اختياري" : "الصق هنا");
  };
  $("#aiP", m).onchange = () => { $("#aiModel", m).value = ""; sync(); };
  sync();
  const collect = () => {
    const p = $("#aiP", m).value, v = { ai_provider: p, ai_model: $("#aiModel", m).value.trim(), ai_url: $("#aiUrl", m).value.trim(),
      library_dir: $("#libDir", m).value.trim(), copy_into_library: $("#copyLib", m).checked, wpm: +$("#wpm", m).value || 140, auto_update: $("#autoUpd", m).checked };
    if ($("#aiKey", m).value.trim()) v["ai_key_" + p] = $("#aiKey", m).value.trim();
    return v;
  };
  const save = async () => { await api("save_settings", { values: collect() }); S.info = await api("info"); renderNav(); };
  $("#setSave", m).onclick = async () => { await save(); m.close(); toast("✓ اتحفظت"); };
  $("#aiTest", m).onclick = (ev) => busy(ev.currentTarget, async () => { await save(); const r = await api("ai_test"); toast("✓ شغّال: " + r.slice(0, 40)); });
  $("#libPick", m).onclick = async () => { const p = await api("pick_folder"); if (p) $("#libDir", m).value = p; };
  $("#chkUpd", m).onclick = (ev) => busy(ev.currentTarget, async () => { const r = await api("check_update"); if (r.version) updateBanner(r); else toast(r.latest ? "✓ عندك أحدث إصدار" : "مقدرتش أوصل لـ GitHub"); });
  $("#bak", m).onclick = async () => { const p = await api("backup"); if (p) toast("✓ اتحفظت: " + p); };
  if (focus === "ai") setTimeout(() => $("#aiKey", m).focus(), 50);
}
function updateBanner(u) {
  if ($("#updBanner")) return;
  const d = document.createElement("div");
  d.id = "updBanner"; d.className = "toast"; d.style.bottom = "auto"; d.style.top = "20px";
  d.innerHTML = `🎉 إصدار جديد ${esc(u.version)} <button class="btn sm primary">حدّث دلوقتي</button>`;
  document.body.appendChild(d);
  $("button", d).onclick = (ev) => busy(ev.currentTarget, () => api("install_update"));
}

/* ================================================================== boot */
async function boot() {
  S.info = await api("info");
  await refreshSeries();
  $("#addSeries").innerHTML = ico("plus"); $("#addSeries").onclick = () => seriesModal();
  $("#btnSettings").innerHTML = ico("settings"); $("#btnSettings").title = "الإعدادات"; $("#btnSettings").onclick = () => openSettings();
  $("#btnGithub").innerHTML = ico("github"); $("#btnGithub").title = "GitHub"; $("#btnGithub").onclick = () => api("open_url", { url: S.info.github });
  $("#btnSupport").innerHTML = ico("heart"); $("#btnSupport").title = "الدعم"; $("#btnSupport").onclick = () => api("open_url", { url: S.info.support });
  $("#aiPill").onclick = () => openSettings("ai");
  render();
  setTimeout(async () => { const i = await api("info"); if (i.update) updateBanner(i.update); }, 8000);
}
document.fonts.ready.then(boot);
