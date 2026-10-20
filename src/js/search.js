/* icons, site icons and the type-anywhere search */
(function () {
  const C = window.STARTPAGE;

  /* GNOME-ish 16px symbolic icons */
  const P = {
    home: "M8 1.5 1.5 7.2l1 1.1L3.5 7.5V14h3.5v-4h2v4h3.5V7.5l1 .8 1-1.1z",
    gamepad: "M4.5 4h7A3.5 3.5 0 0 1 15 7.5l-.2 3.6a2 2 0 0 1-3.6 1.1L10 10.5H6l-1.2 1.7a2 2 0 0 1-3.6-1.1L1 7.5A3.5 3.5 0 0 1 4.5 4m-.5 2v1.25H2.75v1.5H4V10h1.5V8.75h1.25v-1.5H5.5V6zm7.25.25a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-1.5 1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2",
    database: "M8 1C4.7 1 2 2.1 2 3.5v9C2 13.9 4.7 15 8 15s6-1.1 6-2.5v-9C14 2.1 11.3 1 8 1m0 1.5c2.8 0 4.5.8 4.5 1s-1.7 1-4.5 1-4.5-.8-4.5-1 1.7-1 4.5-1M3.5 6c1.1.6 2.7.9 4.5.9s3.4-.3 4.5-.9v2.2c0 .2-1.7 1-4.5 1s-4.5-.8-4.5-1zm0 4.3c1.1.6 2.7.9 4.5.9s3.4-.3 4.5-.9v2.2c0 .2-1.7 1-4.5 1s-4.5-.8-4.5-1z",
    sparkles: "M6 1l1.3 3.7L11 6 7.3 7.3 6 11 4.7 7.3 1 6l3.7-1.3zm6 7 .8 2.2L15 11l-2.2.8L12 14l-.8-2.2L9 11l2.2-.8z",
    terminal: "M2.5 2h11A1.5 1.5 0 0 1 15 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9A1.5 1.5 0 0 1 2.5 2m0 2v8.5h11V4zm1.2 1.6 1-1 3 2.9-3 2.9-1-1 1.9-1.9zM8 10h4v1.5H8z",
    search: "M6.5 1a5.5 5.5 0 0 1 4.4 8.8l3.9 3.9-1.1 1.1-3.9-3.9A5.5 5.5 0 1 1 6.5 1m0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
    chevron: "M5.3 2.7 6.4 1.6 12.8 8l-6.4 6.4-1.1-1.1L10.6 8z",
    image: "M2 2.5h12v11H2zm1.5 1.5v6.6l2.8-2.8 2.2 2.2 1.5-1.5 2.5 2.5V4zM10.5 5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4",
    sparkle: "M8 0l1.6 6.4L16 8l-6.4 1.6L8 16l-1.6-6.4L0 8l6.4-1.6z",
    globe: "M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1m4.9 6.2h-2.2a11 11 0 0 0-.9-4.1 5.5 5.5 0 0 1 3.1 4.1M8 2.6c.6.8 1.1 2.4 1.2 4.6H6.8C6.9 5 7.4 3.4 8 2.6M3.1 8.8h2.2c.1 1.6.4 3 .9 4.1a5.5 5.5 0 0 1-3.1-4.1m2.2-1.6H3.1a5.5 5.5 0 0 1 3.1-4.1 11 11 0 0 0-.9 4.1M8 13.4c-.6-.8-1.1-2.4-1.2-4.6h2.4c-.1 2.2-.6 3.8-1.2 4.6m1.8-.5c.5-1.1.8-2.5.9-4.1h2.2a5.5 5.5 0 0 1-3.1 4.1",
    menu: "M2 3.5h12V5H2zm0 3.75h12v1.5H2zM2 11h12v1.5H2z",
  };
  const icon = (name, cls = "ico") =>
    `<svg class="${cls}" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="${P[name] || P.globe}"/></svg>`;

  const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };

  /* site icon: local copy in src/icons/<host>.png, first letter if missing */
  function favicon(link, cls = "fav") {
    const letter = (link.name || "?").trim()[0].toUpperCase();
    if (C.favicons === false || link.icon === false) return `<span class="${cls} fav-letter">${letter}</span>`;
    const dir = C.iconDir || "src/icons/";
    const src = `${dir}${host(link.url)}.png`;
    return `<span class="${cls}"><img src="${src}" alt="" loading="lazy" onerror="this.parentNode.classList.add('fav-letter');this.parentNode.textContent='${letter}'"></span>`;
  }

  /* ---------- type-anywhere search ---------- */
  /* engines: older configs had a single engine/engineName */
  const S0 = C.search;
  if (!S0.engines) S0.engines = [{ id: "web", name: S0.engineName, url: S0.engine }];
  S0.engines = S0.engines.filter((e) => e.url);
  const defEngine = () => {
    let id = null; try { id = localStorage.getItem("sp.engine"); } catch {}
    return Math.max(0, S0.engines.findIndex((e) => e.id === (id || S0.defaultEngine)));
  };
  S0.engine = S0.engines[defEngine()].url; S0.engineName = S0.engines[defEngine()].name;
  for (const e of S0.engines) if (!S0.bangs[e.id]) S0.bangs[e.id] = { name: e.name, url: e.url };

  /* sub-links (split chips) are searchable too: "proton drive", "civitai red" */
  const allLinks = () => C.groups.flatMap((g) => g.links.flatMap((l) => [
    { ...l, group: g.title },
    ...(l.sub || []).filter((s) => s.url !== l.url).map((s) => ({ ...s, name: `${l.name} ${s.name.replace(/^\./, "")}`, group: g.title })),
  ]));
  function score(l, q) {
    const n = l.name.toLowerCase(), h = host(l.url);
    if (n.startsWith(q)) return 3;
    if (n.split(/[\s·.-]+/).some((w) => w.startsWith(q))) return 2;
    if (n.includes(q) || h.includes(q)) return 1;
    if (l.group.toLowerCase().startsWith(q)) return 0.5;
    return 0;
  }
  function search(input, panel, opts = {}) {
    let results = [], active = 0, ei = defEngine();
    const go = (url, newTab) => (newTab ? open(url, "_blank") : (location.href = url));
    const build = () => {
      const raw = input.value.trim();
      panel.classList.toggle("on", !!raw);
      document.body.classList.toggle("is-searching", !!raw);
      if (!raw) { results = []; panel.innerHTML = ""; return; }
      const bang = raw.match(/^!(\w+)\s*(.*)$/);
      results = [];
      if (bang && C.search.bangs[bang[1]]) {
        const b = C.search.bangs[bang[1]];
        results.push({ name: `Search ${b.name}`, sub: bang[2] || "…", url: b.url.replace("%s", encodeURIComponent(bang[2])), kind: "web" });
      } else {
        const q = raw.toLowerCase();
        results = allLinks().map((l) => ({ ...l, s: score(l, q) })).filter((l) => l.s > 0).sort((a, b) => b.s - a.s).slice(0, 6);
        const E = S0.engines[ei], nextE = S0.engines[(ei + 1) % S0.engines.length];
        results.push({ name: `Search ${E.name}`, sub: raw + (S0.engines.length > 1 ? `  ·  Tab → ${nextE.name}` : ""), url: E.url.replace("%s", encodeURIComponent(raw)), kind: "web" });
      }
      active = 0;
      panel.innerHTML = results
        .map((r, i) => `<a class="sp-result${i === active ? " is-active" : ""}" href="${r.url}" data-i="${i}">
          ${r.kind === "web" ? `<span class="fav fav-icon">${icon("search")}</span>` : favicon(r)}
          <span class="sp-r-name">${r.name}</span><span class="sp-r-sub">${r.kind === "web" ? r.sub : r.group}</span>
          ${i === 0 ? `<kbd>↵</kbd>` : ""}</a>`)
        .join("");
    };
    const setActive = (i) => {
      active = (i + results.length) % results.length;
      panel.querySelectorAll(".sp-result").forEach((el, k) => el.classList.toggle("is-active", k === active));
    };
    input.addEventListener("input", () => { ei = defEngine(); build(); });
    input.addEventListener("keydown", (e) => {
      if (e.key !== "Tab" || !input.value.trim() || input.value.startsWith("!")) return;
      e.preventDefault(); // Tab / Shift+Tab: try the same search on another engine
      ei = (ei + (e.shiftKey ? -1 : 1) + S0.engines.length) % S0.engines.length;
      build(); setActive(results.length - 1);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
      else if (e.key === "Enter" && results[active]) { e.preventDefault(); go(results[active].url, e.ctrlKey || e.metaKey); }
      else if (e.key === "Escape") { input.value = ""; build(); input.blur(); }
    });
    /* start typing anywhere → goes into the search box (GNOME overview style) */
    addEventListener("keydown", (e) => {
      if (document.activeElement === input || e.ctrlKey || e.metaKey || e.altKey) return;
      if (opts.onKey && opts.onKey(e)) return;
      if (e.key === "/") { e.preventDefault(); input.focus(); }
      else if (e.key.length === 1 && e.key !== " ") { input.focus(); }
    });
  }

  window.SP = { icon, favicon, host, search, engines: S0.engines };
})();
