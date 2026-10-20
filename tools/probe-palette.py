#!/usr/bin/env python3
"""Probe wallpapers for a palette  →  src/images/wall/palettes.js

    python3 tools/probe-palette.py src/images/wall/*.jpg

For every image it writes three things the startpage can use:
  probe : a full dark palette built from the picture itself
          (background tinted with the picture's own shadows, 3 accents)
  ctp   : the nearest Catppuccin accents to those colours (name + hex),
          so the page can stay Catppuccin but still "follow" the wallpaper
  thumb : a tiny 48x27 average for the ambient glow (base64 jpg)

Browsers won't let a file:// page read pixels of neighbouring images, which
is why this runs once here instead of in the page.
"""
import base64, io, json, math, os, sys
import numpy as np
from PIL import Image

# ---------------------------------------------------------------- colour math
def srgb_to_lin(c):
    c = c / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)

def lin_to_srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, 12.92 * c, 1.055 * c ** (1 / 2.4) - 0.055) * 255

def rgb_to_oklab(rgb):
    r, g, b = [srgb_to_lin(rgb[..., i]) for i in range(3)]
    l = np.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
    m = np.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
    s = np.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
    return np.stack([0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
                     1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
                     0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s], -1)

def oklab_to_rgb(lab):
    L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
    return np.stack([lin_to_srgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
                     lin_to_srgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
                     lin_to_srgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)], -1)

def lch(L, C, h):
    return np.array([L, C * math.cos(math.radians(h)), C * math.sin(math.radians(h))])

def hexc(rgb):
    r, g, b = [int(round(float(x))) for x in rgb]
    return f"#{r:02x}{g:02x}{b:02x}"

def fit_gamut(L, C, h):
    """reduce chroma until the colour fits sRGB"""
    while C > 0:
        lab = lch(L, C, h)
        L_, a, b = lab
        l = (L_ + 0.3963377774 * a + 0.2158037573 * b) ** 3
        m = (L_ - 0.1055613458 * a - 0.0638541728 * b) ** 3
        s = (L_ - 0.0894841775 * a - 1.291485548 * b) ** 3
        rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
               -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
               -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
        if all(-0.001 <= x <= 1.001 for x in rgb):
            return hexc(oklab_to_rgb(lab))
        C -= 0.005
    return hexc(oklab_to_rgb(lch(L, 0, h)))

def rel_lum(hexs):
    c = np.array([int(hexs[i:i + 2], 16) for i in (1, 3, 5)], float)
    r, g, b = srgb_to_lin(c)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast(a, b):
    la, lb = sorted([rel_lum(a), rel_lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)

# ---------------------------------------------------------------- catppuccin
CTP = {
  "mocha":  dict(rosewater="#f5e0dc", flamingo="#f2cdcd", pink="#f5c2e7", mauve="#cba6f7", red="#f38ba8", maroon="#eba0ac", peach="#fab387", yellow="#f9e2af", green="#a6e3a1", teal="#94e2d5", sky="#89dceb", sapphire="#74c7ec", blue="#89b4fa", lavender="#b4befe",
                 text="#cdd6f4", subtext1="#bac2de", subtext0="#a6adc8", overlay2="#9399b2", overlay1="#7f849c", overlay0="#6c7086", surface2="#585b70", surface1="#45475a", surface0="#313244", base="#1e1e2e", mantle="#181825", crust="#11111b"),
  "latte":  dict(rosewater="#dc8a78", flamingo="#dd7878", pink="#ea76cb", mauve="#8839ef", red="#d20f39", maroon="#e64553", peach="#fe640b", yellow="#df8e1d", green="#40a02b", teal="#179299", sky="#04a5e5", sapphire="#209fb5", blue="#1e66f5", lavender="#7287fd",
                 text="#4c4f69", subtext1="#5c5f77", subtext0="#6c6f85", overlay2="#7c7f93", overlay1="#8c8fa1", overlay0="#9ca0b0", surface2="#acb0be", surface1="#bcc0cc", surface0="#ccd0da", base="#eff1f5", mantle="#e6e9ef", crust="#dce0e8"),
}
ACCENTS = ["rosewater", "flamingo", "pink", "mauve", "red", "maroon", "peach", "yellow", "green", "teal", "sky", "sapphire", "blue", "lavender"]

def to_lab(hexs):
    return rgb_to_oklab(np.array([[int(hexs[i:i + 2], 16) for i in (1, 3, 5)]], float))[0]

def nearest_ctp(hexs, exclude=()):
    """nearest Catppuccin accent, judged mostly on hue (lightness is Catppuccin's job)"""
    t = to_lab(hexs); th = math.atan2(t[2], t[1]); tc = math.hypot(t[1], t[2])
    best = None
    for n in ACCENTS:
        if n in exclude: continue
        if n in ("rosewater", "flamingo") and tc > 0.075: continue  # too pale for a colourful source
        c = to_lab(CTP["mocha"][n]); ch = math.atan2(c[2], c[1]); cc = math.hypot(c[1], c[2])
        dh = abs((th - ch + math.pi) % (2 * math.pi) - math.pi)
        d = dh * max(tc, 0.06) * 4 + abs(tc - cc) * 2.2
        if best is None or d < best[0]: best = (d, n)
    return best[1]

# ---------------------------------------------------------------- probe
def kmeans(x, w, k, it=25, seed=1):
    rng = np.random.default_rng(seed)
    cent = x[rng.choice(len(x), k, replace=False, p=w / w.sum())]
    for _ in range(it):
        d = ((x[:, None, :] - cent[None]) ** 2).sum(-1); lab = d.argmin(1)
        for j in range(k):
            m = lab == j
            if m.any(): cent[j] = (x[m] * w[m, None]).sum(0) / w[m].sum()
    return cent, lab

def probe(path):
    im = Image.open(path).convert("RGB"); im.thumbnail((128, 128))
    px = np.asarray(im, float).reshape(-1, 3)
    lab = rgb_to_oklab(px); L = lab[:, 0]; C = np.hypot(lab[:, 1], lab[:, 2]); H = (np.degrees(np.arctan2(lab[:, 2], lab[:, 1])) + 360) % 360

    # mood: hue of the picture's shadows (darkest 30 %), weighted by chroma
    dark = L <= np.quantile(L, 0.3)
    wa = C[dark] + 0.01
    mood_h = math.degrees(math.atan2((np.sin(np.radians(H[dark])) * wa).sum(), (np.cos(np.radians(H[dark])) * wa).sum())) % 360
    mood_c = float(np.clip((C[dark] * wa).sum() / wa.sum(), 0.012, 0.038))
    # mean of the whole picture (used for tinting light mode)
    all_h = math.degrees(math.atan2((lab[:, 2]).sum(), (lab[:, 1]).sum())) % 360

    # accents: colourful clusters, scored by area * chroma, skin tones damped
    colourful = (C > 0.045) & (L > 0.3) & (L < 0.93)
    xs = lab[colourful]; ws = C[colourful]
    skin = (H[colourful] > 30) & (H[colourful] < 75) & (C[colourful] < 0.1) & (L[colourful] > 0.72)
    ws = ws * np.where(skin, 0.35, 1.0)
    accents = []
    if len(xs) > 40:
        cent, lbl = kmeans(xs, ws, 8)
        scored = []
        for j, c in enumerate(cent):
            area = ws[lbl == j].sum()
            if area <= 0: continue
            cl, cc = c[0], math.hypot(c[1], c[2]); ch = math.degrees(math.atan2(c[2], c[1])) % 360
            scored.append((math.sqrt(area) * cc * (1.1 - abs(cl - 0.68)), cl, cc, ch))
        scored.sort(reverse=True)
        for s in scored:
            if all(min(abs(s[3] - a[3]), 360 - abs(s[3] - a[3])) > 35 for a in accents):
                accents.append(s)
            if len(accents) == 3: break
    while len(accents) < 3:  # grey pictures: fall back to the mood hue
        accents.append((0, 0.7, 0.09, (mood_h + 40 * len(accents)) % 360))

    def acc(a, L_, cmin, cmax):
        return fit_gamut(L_, float(np.clip(a[2] * 1.15, cmin, cmax)), a[3])

    p = {
        "bg":        fit_gamut(0.185, mood_c * 0.9, mood_h),
        "bg2":       fit_gamut(0.22, mood_c, mood_h),
        "surface":   fit_gamut(0.26, mood_c * 1.1, mood_h),
        "surface2":  fit_gamut(0.32, mood_c * 1.1, mood_h),
        "line":      fit_gamut(0.4, mood_c, mood_h),
        "text":      fit_gamut(0.93, 0.018, mood_h),
        "subtext":   fit_gamut(0.76, 0.03, mood_h),
        "accent":    acc(accents[0], 0.80, 0.07, 0.15),
        "accent2":   acc(accents[1], 0.80, 0.06, 0.14),
        "accent3":   acc(accents[2], 0.80, 0.05, 0.13),
        "onAccent":  fit_gamut(0.22, 0.05, accents[0][3]),
        # light / pastel twin built from the same hues
        "lbg":       fit_gamut(0.965, min(mood_c * 0.5, 0.02), all_h),
        "lsurface":  fit_gamut(0.995, 0.006, all_h),
        "ltext":     fit_gamut(0.32, 0.035, mood_h),
        "laccent":   acc(accents[0], 0.56, 0.08, 0.16),
        "laccent2":  acc(accents[1], 0.58, 0.07, 0.15),
    }
    raw = [hexc(oklab_to_rgb(lch(a[1], a[2], a[3]))) for a in accents]
    n1 = nearest_ctp(raw[0]); n2 = nearest_ctp(raw[1], exclude=(n1,)); n3 = nearest_ctp(raw[2], exclude=(n1, n2))
    # contrast sanity
    p["_contrast"] = {k: float(v) for k, v in {"text/bg": round(contrast(p["text"], p["bg"]), 1), "accent/bg": round(contrast(p["accent"], p["bg"]), 1), "onAccent/accent": round(contrast(p["onAccent"], p["accent"]), 1)}.items()}

    t = Image.open(path).convert("RGB").resize((48, 27), Image.BILINEAR); buf = io.BytesIO(); t.save(buf, "JPEG", quality=70)
    return {"probe": p, "raw": raw, "ctp": [n1, n2, n3], "mood": round(mood_h), "thumb": "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()}

def main():
    files = [f for f in sys.argv[1:] if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))]
    if not files: sys.exit(__doc__)
    out = {}
    for f in sorted(files):
        r = probe(f); out[os.path.basename(f)] = r
        for ext in (".webm", ".mp4"):  # a looping clip next to its poster frame
            if os.path.exists(os.path.splitext(f)[0] + ext): r["video"] = os.path.basename(os.path.splitext(f)[0] + ext)
        print(f"{os.path.basename(f):28s} accent {r['probe']['accent']} {r['probe']['accent2']} {r['probe']['accent3']}  bg {r['probe']['bg']}  ctp {r['ctp']}  {r['probe']['_contrast']}")
    dest = os.path.join(os.path.dirname(os.path.abspath(files[0])), "palettes.js")
    with open(dest, "w") as fh:
        fh.write("/* written by tools/probe-palette.py */\nwindow.PALETTES = " + json.dumps(out, indent=1) + ";\n")
    print("→", dest)

if __name__ == "__main__":
    main()
