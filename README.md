# ~/startpage

A cozy new-tab page: a picture from the collection, the clock, a type-anywhere
search and the links I actually use. The page takes its colours from the
picture (Catppuccin, warmed by the art) and has a frosted-glass look.

**Use it:** open `index.html`, or publish the repo with GitHub Pages and point
*New Tab Override* (or the browser's home page) at the Pages URL.

## Everyday use

| | |
|---|---|
| type anywhere | search links; **Enter** opens the top match or the web |
| **Tab** while typing | same search on the next engine (Brave → DDG → Startpage → Ecosia) |
| `!i` `!iy` `!ib` | image search (Startpage/Google, Yandex, Bing) |
| `!yt` `!r` `!gh` `!aw` `!pdb` `!w` `!civ` | YouTube, Reddit, GitHub, ArchWiki, ProtonDB, Wikipedia, Civitai |
| **← →** or click the picture | next / previous picture |
| **Look** (top right) | colours, dark/pastel, glass opacity & blur, Cozy/Ambient layout, clock style, default engine |

Settings are remembered per browser (localStorage).

## Changing things

- **Links, search engines, bangs, name** — `src/js/config.js`
- **Pictures** — drop images into `src/images/wall/` (a number prefix sets the
  order, the rest of the file name becomes the caption), then run

  ```sh
  python3 tools/probe-palette.py src/images/wall/*
  ```

  This rewrites `src/images/wall/palettes.js` with each picture's colours.
  (Browsers don't let a page opened from disk read pixels of other files, so
  the colours are worked out once here.)
- **Site icons** — `src/icons/<hostname>.png` (32×32). Without one, the link
  shows its first letter.

## Layout

```
index.html
src/css/home.css      styles (fonts, layouts, glass, Look panel)
src/js/config.js      your links + search
src/js/search.js      icons and the type-anywhere search
src/js/palette.js     colour strategies (Catppuccin, art accent, warmed, probed)
src/js/home.js        pictures, clock, layouts, Look panel
src/images/wall/      pictures + palettes.js
src/icons/            site icons
src/fonts/            Fraunces, Nunito, Caveat (offline)
tools/                probe-palette.py
archive/              the old page and the design prototypes
```

Fonts: Fraunces, Nunito, Caveat (SIL Open Font License). Artwork belongs to
its respective artists.
