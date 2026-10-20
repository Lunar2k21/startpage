/* ~/startpage — your settings live here.
 *
 *  links   : groups → links. `sub` makes a split chip (Proton · Mail Drive …),
 *            `isNew` shows a small dot, `note` is the hover tooltip,
 *            `icon: false` uses the first letter instead of an icon file.
 *  search  : engines (Tab cycles while typing) and !bangs.
 *  icons   : src/icons/<hostname>.png — a missing one shows the first letter.
 *  pictures: drop files into src/images/wall/ and run
 *            python3 tools/probe-palette.py src/images/wall/*
 */
window.STARTPAGE = {
  name: "Lunar",
  wallDir: "src/images/wall/",
  iconDir: "src/icons/",

  /* LINKS — `isNew: true` marks things added in this redesign (small badge).
     `sub` turns a link into a split chip: the main name opens `url`, the small
     segments open their own pages (e.g. Proton → Mail · Drive · Calendar).   */
  groups: [
    {
      id: "daily",
      title: "Daily",
      path: "~/general",
      icon: "home",
      links: [
        {
          name: "Proton", url: "https://mail.proton.me/",
          sub: [
            { name: "Mail", url: "https://mail.proton.me/" },
            { name: "Drive", url: "https://drive.proton.me/", isNew: true },
            { name: "Cal", url: "https://calendar.proton.me/", isNew: true, note: "Proton Calendar" },
            { name: "Pass", url: "https://pass.proton.me/", isNew: true },
          ],
        },
        { name: "YouTube", url: "https://www.youtube.com/" },
        { name: "Reddit", url: "https://www.reddit.com/" },
        { name: "Wykop", url: "https://wykop.pl/", icon: false },
        { name: "Miruro", url: "https://www.miruro.to/" },
        { name: "GitHub", url: "https://github.com/", isNew: true },
      ],
    },
    {
      id: "hoyo",
      title: "HoYoverse",
      path: "~/hoyoverse",
      icon: "gamepad",
      links: [
        { name: "HoYoLAB", url: "https://www.hoyolab.com/home" },
        { name: "Prydwen", url: "https://www.prydwen.gg/" },
        { name: "Genshin.gg", url: "https://genshin.gg/" },
        { name: "Enka.Network", url: "https://enka.network/", isNew: true },
        { name: "Genshin Map", url: "https://act.hoyolab.com/ys/app/interactive-map/index.html", note: "official HoYoLAB map" },
      ],
    },
    {
      id: "data",
      title: "Datamine",
      path: "~/datamine",
      icon: "database",
      links: [
        {
          name: "Honey", url: "https://gensh.honeyhunterworld.com/?lang=EN",
          sub: [
            { name: "Genshin", url: "https://gensh.honeyhunterworld.com/?lang=EN" },
            { name: "Star Rail", url: "https://starrail.honeyhunterworld.com/?lang=EN" },
          ],
        },
        {
          name: "Yatta", url: "https://gi.yatta.moe/en", isNew: true, note: "Project Amber — fast, clean game database",
          sub: [
            { name: "Genshin", url: "https://gi.yatta.moe/en" },
            { name: "Star Rail", url: "https://hsr.yatta.moe/en" },
          ],
        },
        { name: "HomDGCat", url: "https://homdgcat.wiki/", note: "live data only since Jan 2026", icon: false },
      ],
    },
    {
      id: "ai",
      title: "AI",
      path: "~/ai",
      icon: "sparkles",
      links: [
        { name: "Claude", url: "https://claude.ai/", isNew: true },
        { name: "Runpod", url: "https://www.runpod.io/" },
        {
          name: "Civitai", url: "https://civitai.com/models?tag=character",
          sub: [
            { name: ".com", url: "https://civitai.com/models?tag=character" },
            { name: ".red", url: "https://civitai.red/models?tag=character", note: "the uncensored side since April 2026" },
          ],
        },
        { name: "Chub", url: "https://chub.ai/" },
        { name: "Hugging Face", url: "https://huggingface.co/", isNew: true },
      ],
    },
    {
      id: "system",
      title: "System",
      path: "~/system",
      icon: "terminal",
      links: [
        { name: "ProtonDB", url: "https://www.protondb.com/" },
        { name: "ArchWiki", url: "https://wiki.archlinux.org/" },
        { name: "Anti-Cheat?", url: "https://areweanticheatyet.com/", isNew: true, note: "which games run on Linux with anti-cheat" },
      ],
    },
  ],

  /* SEARCH — type anywhere. Enter = top match or the default engine,
     Tab cycles engines for this one search, `!bang query` jumps straight there. */
  search: {
    defaultEngine: "brave",
    engines: [
      { id: "brave", name: "Brave", url: "https://search.brave.com/search?q=%s" },
      { id: "ddg", name: "DuckDuckGo", url: "https://duckduckgo.com/?q=%s" },
      { id: "sp", name: "Startpage", url: "https://www.startpage.com/sp/search?query=%s", note: "Google results, no tracking" },
      { id: "eco", name: "Ecosia", url: "https://www.ecosia.org/search?q=%s", note: "EU; partly on the Staan index" },
      /* any public instance from https://searx.space works — no container needed */
      { id: "sx", name: "SearXNG", url: "" },
    ],
    bangs: {
      i: { name: "Images · Startpage (Google)", url: "https://www.startpage.com/sp/search?query=%s&cat=images" },
      ib: { name: "Images · Bing", url: "https://www.bing.com/images/search?q=%s" },
      iy: { name: "Images · Yandex", url: "https://yandex.com/images/search?text=%s" },
      yt: { name: "YouTube", url: "https://www.youtube.com/results?search_query=%s" },
      r: { name: "Reddit", url: "https://www.reddit.com/search/?q=%s" },
      gh: { name: "GitHub", url: "https://github.com/search?q=%s" },
      aw: { name: "ArchWiki", url: "https://wiki.archlinux.org/index.php?search=%s" },
      pdb: { name: "ProtonDB", url: "https://www.protondb.com/search?q=%s" },
      w: { name: "Wikipedia", url: "https://en.wikipedia.org/w/index.php?search=%s" },
      civ: { name: "Civitai", url: "https://civitai.com/search/models?query=%s" },
    },
  },
};
