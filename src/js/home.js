/* ~/startpage — wallpapers, colours, layouts, Look panel */
/* cookie clock shape: three wavy polygons it slowly morphs between */
(function () {
  const shape = (amp, phase) => {
    const pts = [];
    for (let i = 0; i < 144; i++) {
      const a = (i / 144) * Math.PI * 2, r = 50 - amp - 0.5 + amp * Math.cos(a * 9 + phase);
      pts.push(`${(50 + r * Math.cos(a)).toFixed(2)}% ${(50 + r * Math.sin(a)).toFixed(2)}%`);
    }
    return `polygon(${pts.join(",")})`;
  };
  const A = shape(3.6, 0), B = shape(5.2, Math.PI / 2), D = shape(2.4, Math.PI);
  document.documentElement.style.setProperty("--cookie-a", A);
  const st = document.createElement("style");
  st.textContent = `@keyframes cookie-morph { 0%,100% { clip-path: ${A}; } 33% { clip-path: ${B}; } 66% { clip-path: ${D}; } }`;
  document.head.append(st);
})();

const C = STARTPAGE, $ = (s) => document.querySelector(s);
const store = { get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
const S = {
  pal: store.get("sp.pal", "blend"), mode: store.get("sp.mode", "auto"), flavor: store.get("sp.flavor", "mocha"),
  acc: store.get("sp.acc", "auto"), lay: store.get("sp.lay", "cozy"), clock: store.get("sp.clock", "plain"),
  glass: store.get("sp.glass", "on"), ga: +store.get("sp.ga", 50), gb: +store.get("sp.gb", 22), wb: +store.get("sp.wb", 26),
  sec: store.get("sp.sec", "off"), engine: store.get("sp.engine", C.search.defaultEngine),
};
const DIR = C.wallDir || "src/images/wall/";
const WALLS = Object.entries(PALETTES).map(([file, p]) => ({ file, src: DIR + (p.video || file), poster: DIR + file, video: !!p.video,
  title: file.replace(/^\d+-|\.jpg$/g, "").replace(/-/g, " ") }));
let wi = Math.max(0, WALLS.findIndex((w) => w.file === store.get("sp.wall")));

/* ---------- system accent: browsers that expose it give us CSS AccentColor ---------- */
function systemAccent() {
  if (!CSS.supports("color", "AccentColor")) return null;
  const d = document.createElement("i"); d.style.color = "AccentColor"; document.body.append(d);
  const c = getComputedStyle(d).color; d.remove();
  const m = c.match(/\d+(\.\d+)?/g); if (!m) return null;
  return "#" + m.slice(0, 3).map((x) => (+x | 0).toString(16).padStart(2, "0")).join("");
}
function nearestCtp(hex) {
  const lab = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const a = lab(hex); let best = ["mauve", 1e9];
  for (const k of ["rosewater", "flamingo", "pink", "mauve", "red", "maroon", "peach", "yellow", "green", "teal", "sky", "sapphire", "blue", "lavender"]) {
    const b = lab(Pal.CTP.mocha[k]); const d = a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0); if (d < best[1]) best = [k, d];
  }
  return best[0];
}
const sys = systemAccent();

/* ---------- links ---------- */
const newDot = (l) => (l.isNew || (l.sub || []).some((x) => x.isNew) ? `<i class="dot-new" title="new in this redesign"></i>` : "");
const chip = (l) => l.sub
  ? `<span class="chip split"><a class="main" href="${l.url}" title="${l.note || SP.host(l.url)}">${SP.favicon(l)}${l.name}</a>${l.sub.map((s) => `<a class="sub" href="${s.url}" title="${s.note || SP.host(s.url)}">${s.name}</a>`).join("")}${newDot(l)}</span>`
  : `<a class="chip spr" href="${l.url}" title="${l.note || SP.host(l.url)}">${SP.favicon(l)}${l.name}${newDot(l)}</a>`;
const chips = (g) => `<div class="chips">${g.links.map(chip).join("")}</div>`;
const shelf = (g) => `<section class="shelf${g.id === "daily" ? " wide" : ""}"><h2>${SP.icon(g.icon)}${g.title}</h2>${chips(g)}</section>`;
document.querySelectorAll(".sico").forEach((e) => (e.innerHTML = SP.icon("search")));
const uw = matchMedia("(min-aspect-ratio: 2/1) and (min-width: 2000px)");
function place() {
  const L = ["daily", "system"];
  if (S.lay === "cozy") {
    $("#side").prepend($("#searchC")); $("#side").prepend($("#clockC"));
    if (uw.matches) { $("#lcol").replaceChildren($("#clockC").cloneNode(true)); $("#lcol").firstChild.id = "clockC2"; }
    // daily on top full-width, the rest balanced into two columns by size
    const rest = C.groups.filter((g) => g.id !== "daily"), cols = [[], []], h = [0, 0];
    for (const g of rest) { const k = h[0] <= h[1] ? 0 : 1; cols[k].push(g); h[k] += g.links.length + 2; }
    $("#shelves").innerHTML = C.groups.filter((g) => g.id === "daily").map(shelf).join("") + cols.map((c) => `<div class="col">${c.map(shelf).join("")}</div>`).join("");
  } else {
    $("#dock").replaceChildren($("#searchC"));
    $("#dock").insertAdjacentHTML("beforeend", C.groups.map((g, i) => `<div class="pill" data-i="${i}"><button class="spr">${SP.icon(g.icon)}${g.title}</button><div class="pop">${shelf(g)}</div></div>`).join(""));
    if (uw.matches) {
      $("#asideL").replaceChildren($("#clockA")); $("#asideL").insertAdjacentHTML("beforeend", C.groups.filter((g) => L.includes(g.id)).map(shelf).join(""));
      $("#asideR").innerHTML = C.groups.filter((g) => !L.includes(g.id)).map(shelf).join("");
    } else document.querySelector(".ambient").append($("#clockA"));
  }
  fit(); tick();
}
$("#dock").addEventListener("click", (e) => {
  const p = e.target.closest(".pill > button")?.parentNode; if (!p) return;
  e.stopPropagation(); document.querySelectorAll(".pill").forEach((x) => x.classList.toggle("open", x === p && !x.classList.contains("open")));
});

/* ---------- clock ---------- */
function tick() {
  const d = new Date(), t = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const part = (h) => (h < 5 ? "night" : h < 12 ? "morning" : h < 18 ? "afternoon" : h < 22 ? "evening" : "night");
  document.querySelectorAll(".clock").forEach((c) => {
    c.querySelector(".plain-t").innerHTML = t + `<span class="sec">${String(d.getSeconds()).padStart(2, "0")}</span>`; c.querySelector(".ct").textContent = t;
    c.querySelector(".g").innerHTML = `${d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} · <b>good ${part(d.getHours())}, ${C.name}</b>`;
  });
}
setInterval(tick, 1000);

/* ---------- media ---------- */
function showMedia(host, w) {
  const old = [...host.querySelectorAll(".layer")];
  const layer = document.createElement("div"); layer.className = "layer";
  const el = document.createElement(w.video ? "video" : "img");
  if (w.video) Object.assign(el, { muted: true, loop: true, autoplay: true, playsInline: true, poster: w.poster });
  el.src = w.src; layer.append(el);
  const go = () => { host.append(layer); requestAnimationFrame(() => layer.classList.add("in")); old.forEach((o) => { o.classList.add("out"); setTimeout(() => o.remove(), 750); });
    w.aspect = (el.naturalWidth || el.videoWidth) / (el.naturalHeight || el.videoHeight) || 1.6; fit(); };
  w.video ? el.addEventListener("loadeddata", go, { once: true }) : (el.onload = go);
}
function fit() {
  const a = WALLS[wi].aspect || 1.6, r = document.documentElement.style;
  let h = Math.min(innerHeight * (uw.matches ? 0.72 : 0.66), 980), w = h * a, mw = innerWidth * (uw.matches ? 0.34 : 0.44);
  if (w > mw) { w = mw; h = w / a; }
  r.setProperty("--mw", w + "px"); r.setProperty("--mh", h + "px");
  let ah = innerHeight, aw = ah * a, amw = innerWidth * (uw.matches ? 0.6 : 1);
  if (aw > amw) { aw = amw; ah = aw / a; }
  r.setProperty("--aw", aw + "px"); r.setProperty("--ah", ah + "px");
}
addEventListener("resize", fit);

/* ---------- palette ---------- */
const WHY = {
  ctp: "Plain Catppuccin with a fixed accent — matches a Catppuccin GNOME exactly, ignores the wallpaper.",
  hybrid: "Catppuccin surfaces; the accent is the Catppuccin colour nearest to what the wallpaper is made of.",
  blend: "Catppuccin text and accents, but the surfaces lean halfway toward the wallpaper's own shadows — wine, ember, teal, navy.",
  probe: "Everything from the art: background from its shadows, accents from its colours. Best when GNOME follows the wallpaper too (ChromaLeon).",
};
function isLight() { return S.mode === "light" || (S.mode === "auto" && matchMedia("(prefers-color-scheme: light)").matches); }
function paint() {
  const w = WALLS[wi], light = isLight();
  const fixed = S.acc === "auto" ? (sys ? nearestCtp(sys) : "mauve") : S.acc;
  const t = Pal.make(S.pal, w.file, { flavor: S.flavor, light, fixedAccent: fixed });
  Pal.apply(t);
  $("#why").textContent = WHY[S.pal] + `  [${t.name}]`;
  $("#sw").innerHTML = ["bg", "surface", "text", "accent", "accent2"].map((k) => `<i style="background:${t[k]}" title="${k}"></i>`).join("");
  $("#glow").style.setProperty("--glow", `url(${PALETTES[w.file].thumb})`);
  document.querySelector('meta[name="theme-color"]').content = getComputedStyle(document.documentElement).getPropertyValue("--bg");
}
function setWall(i) {
  wi = (i + WALLS.length) % WALLS.length; store.set("sp.wall", WALLS[wi].file);
  showMedia($("#mediaC"), WALLS[wi]); showMedia($("#mediaA"), WALLS[wi]);
  $("#cap").textContent = WALLS[wi].title; paint();
  $("#backwall").style.setProperty("--wallimg", `url("${new URL(WALLS[wi].poster, location.href).href}")`);
}
matchMedia("(prefers-color-scheme: light)").addEventListener("change", paint);

/* ---------- settings ---------- */
$("#segAcc").style.gridTemplateColumns = "1.6fr repeat(6, 1fr)"; $("#segAcc").innerHTML = `<button data-v="auto" title="${sys ? "system accent " + sys : "no system accent exposed — mauve"}">System${sys ? "" : "?"}</button>` +
  ["mauve", "pink", "peach", "blue", "teal", "lavender"].map((a) => `<button data-v="${a}" style="color:${Pal.CTP.mocha[a]}">●</button>`).join("");
$("#segEngine").innerHTML = SP.engines.map((e) => `<button data-v="${e.id}" title="${e.note || ""}">${e.name}</button>`).join("");
const segs = { segPal: "pal", segMode: "mode", segFlavor: "flavor", segAcc: "acc", segLay: "lay", segClock: "clock", segGlass: "glass", segSec: "sec", segEngine: "engine" };
function glassVars() {
  const r = document.documentElement.style;
  r.setProperty("--ga", S.ga / 100); r.setProperty("--gb", S.gb + "px"); r.setProperty("--wb", S.wb + "px");
  $("#gaV").textContent = S.ga + "%"; $("#gbV").textContent = S.gb; $("#wbV").textContent = S.wb;
}
for (const k of ["ga", "gb", "wb"]) { const el = $("#" + k); el.value = S[k]; el.addEventListener("input", () => { S[k] = +el.value; store.set("sp." + k, S[k]); glassVars(); }); }
glassVars();
function syncUI() {
  for (const [id, k] of Object.entries(segs)) document.querySelectorAll(`#${id} button`).forEach((b) => b.classList.toggle("on", b.dataset.v === S[k]));
  document.body.classList.toggle("lay-ambient", S.lay === "ambient");
  document.body.classList.toggle("clock-cookie", S.clock === "cookie");
  document.body.classList.toggle("glass", S.glass === "on");
  document.body.classList.toggle("show-sec", S.sec === "on");
  document.querySelectorAll(".slider").forEach((x) => (x.style.opacity = S.glass === "on" ? 1 : 0.4));
}
for (const [id, k] of Object.entries(segs)) $("#" + id).addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  const layChanged = k === "lay" && S.lay !== b.dataset.v;
  S[k] = b.dataset.v; store.set("sp." + k, S[k]); syncUI(); paint(); if (layChanged) place();
});
$("#setBtn").onclick = (e) => { e.stopPropagation(); $("#panel").classList.toggle("on"); };
addEventListener("click", (e) => {
  if (!e.target.closest(".panel")) $("#panel").classList.remove("on");
  if (!e.target.closest(".pill")) document.querySelectorAll(".pill").forEach((x) => x.classList.remove("open"));
});
$("#prev").onclick = () => setWall(wi - 1); $("#next").onclick = () => setWall(wi + 1);
$("#mediaC").onclick = () => setWall(wi + 1);

syncUI(); place(); setWall(wi); uw.addEventListener("change", place);
SP.search($("#q"), $("#results"), { onKey: (e) => {
  if (e.key === "ArrowRight") return setWall(wi + 1), true;
  if (e.key === "ArrowLeft") return setWall(wi - 1), true;
  if (e.key === "Escape") return $("#panel").classList.remove("on"), true;
} });
