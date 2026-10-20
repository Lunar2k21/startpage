/* colour strategies — picked in the Look panel
 *
 *   ctp    : Catppuccin, fixed accent (what a Catppuccin GNOME setup gives you)
 *   hybrid : Catppuccin surfaces + the accent the wallpaper "asks for",
 *            snapped to the nearest Catppuccin accent
 *   probe  : everything from the art — background tinted with the picture's
 *            shadows, three accents lifted from its colours
 *
 * Each returns a flat token set: bg, bg2, surface, surface2, line, text,
 * subtext, accent, accent2, onAccent. Light mode = Catppuccin Latte (ctp,
 * hybrid) or the probe's pastel twin.                                     */
(function () {
  const CTP = {
    mocha: { rosewater: "#f5e0dc", flamingo: "#f2cdcd", pink: "#f5c2e7", mauve: "#cba6f7", red: "#f38ba8", maroon: "#eba0ac", peach: "#fab387", yellow: "#f9e2af", green: "#a6e3a1", teal: "#94e2d5", sky: "#89dceb", sapphire: "#74c7ec", blue: "#89b4fa", lavender: "#b4befe",
      text: "#cdd6f4", subtext1: "#bac2de", subtext0: "#a6adc8", overlay0: "#6c7086", surface2: "#585b70", surface1: "#45475a", surface0: "#313244", base: "#1e1e2e", mantle: "#181825", crust: "#11111b" },
    macchiato: { rosewater: "#f4dbd6", flamingo: "#f0c6c6", pink: "#f5bde6", mauve: "#c6a0f6", red: "#ed8796", maroon: "#ee99a0", peach: "#f5a97f", yellow: "#eed49f", green: "#a6da95", teal: "#8bd5ca", sky: "#91d7e3", sapphire: "#7dc4e4", blue: "#8aadf4", lavender: "#b7bdf8",
      text: "#cad3f5", subtext1: "#b8c0e0", subtext0: "#a5adcb", overlay0: "#6e738d", surface2: "#5b6078", surface1: "#494d64", surface0: "#363a4f", base: "#24273a", mantle: "#1e2030", crust: "#181926" },
    frappe: { rosewater: "#f2d5cf", flamingo: "#eebebe", pink: "#f4b8e4", mauve: "#ca9ee6", red: "#e78284", maroon: "#ea999c", peach: "#ef9f76", yellow: "#e5c890", green: "#a6d189", teal: "#81c8be", sky: "#99d1db", sapphire: "#85c1dc", blue: "#8caaee", lavender: "#babbf1",
      text: "#c6d0f5", subtext1: "#b5bfe2", subtext0: "#a5adce", overlay0: "#737994", surface2: "#626880", surface1: "#51576d", surface0: "#414559", base: "#303446", mantle: "#292c3c", crust: "#232634" },
    latte: { rosewater: "#dc8a78", flamingo: "#dd7878", pink: "#ea76cb", mauve: "#8839ef", red: "#d20f39", maroon: "#e64553", peach: "#fe640b", yellow: "#df8e1d", green: "#40a02b", teal: "#179299", sky: "#04a5e5", sapphire: "#209fb5", blue: "#1e66f5", lavender: "#7287fd",
      text: "#4c4f69", subtext1: "#5c5f77", subtext0: "#6c6f85", overlay0: "#9ca0b0", surface2: "#acb0be", surface1: "#bcc0cc", surface0: "#ccd0da", base: "#eff1f5", mantle: "#e6e9ef", crust: "#dce0e8" },
  };

  function fromCtp(flavor, a1, a2) {
    const f = CTP[flavor], light = flavor === "latte";
    return {
      bg: f.base, bg2: f.mantle, surface: f.surface0, surface2: f.surface1, line: f.surface2,
      text: f.text, subtext: f.subtext0, accent: f[a1], accent2: f[a2],
      onAccent: light ? f.base : f.crust, name: `${flavor} · ${a1}`,
    };
  }

  function make(strategy, wall, opts = {}) {
    const light = opts.light, flavor = light ? "latte" : opts.flavor || "mocha";
    const fixed = opts.fixedAccent || "mauve";
    if (strategy === "ctp") return fromCtp(flavor, fixed, fixed === "pink" ? "mauve" : "pink");
    const P = window.PALETTES && PALETTES[wall];
    if (!P) return fromCtp(flavor, fixed, "pink");
    if (strategy === "hybrid") return fromCtp(flavor, P.ctp[0], P.ctp[1]);
    if (strategy === "blend") {
      // Catppuccin text + accents, surfaces pulled toward the art's own shadows
      const t = fromCtp(flavor, P.ctp[0], P.ctp[1]), p = P.probe, k = opts.blend ?? 50;
      const mix = (a, b, w = k) => `color-mix(in oklab, ${a}, ${b} ${w}%)`;
      if (light) return { ...t, bg: mix(t.bg, p.lbg, k + 10), bg2: mix(t.bg2, p.lsurface, k), surface: mix(t.surface, p.lbg, 35), surface2: mix(t.surface2, p.lbg, 35), name: `latte·blend · ${P.ctp[0]}` };
      return { ...t, bg: mix(t.bg, p.bg), bg2: mix(t.bg2, p.bg2), surface: mix(t.surface, p.surface), surface2: mix(t.surface2, p.surface2), line: mix(t.line, p.line), name: `${flavor}·blend · ${P.ctp[0]}` };
    }
    const p = P.probe;
    if (light) return { bg: p.lbg, bg2: p.lbg, surface: p.lsurface, surface2: p.lbg, line: p.subtext, text: p.ltext, subtext: p.ltext, accent: p.laccent, accent2: p.laccent2, onAccent: "#ffffff", name: "probe · pastel" };
    return { ...p, subtext: p.subtext, name: "probe · from the art" };
  }

  function apply(tokens, el = document.documentElement) {
    for (const k of ["bg", "bg2", "surface", "surface2", "line", "text", "subtext", "accent", "accent2", "onAccent"]) el.style.setProperty("--" + k, tokens[k]);
  }

  window.Pal = { CTP, make, apply };
})();
