// Takes Small Plates store screenshots with headless Chrome.
// 1. Serve docs/ on http://localhost:8770 (any static server).
// 2. Start Chrome: chrome --headless=new --remote-debugging-port=9333 --user-data-dir=<temp dir>
// 3. node store/capture.mjs
// Writes store/raw/*.png (1080x1920 phone screens), then store/screenshots/*.png (framed with captions)
// and store/feature-graphic.png (1024x500).
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const GAME = "http://localhost:8770/";
const PORT = 9333;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function openTab() {
  const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener("open", r));
  let id = 0;
  const waiting = new Map();
  ws.addEventListener("message", e => {
    const m = JSON.parse(e.data);
    if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); }
  });
  const send = (method, params = {}) => new Promise(r => { const i = ++id; waiting.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  return { send, close: () => ws.close() };
}

async function shot(tab, { w, h, scale, dark = false }, file) {
  await tab.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: scale, mobile: true });
  await tab.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: dark ? "dark" : "light" }, { name: "prefers-reduced-motion", value: "reduce" }] });
  const r = await tab.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, Buffer.from(r.result.data, "base64"));
  console.log("saved", file);
}

const evaluate = (tab, expr) => tab.send("Runtime.evaluate", { expression: expr, awaitPromise: true });

// Runs in the game page: puts it into a specific, good-looking moment.
const SETUP = String.raw`
window.scene = function (name) {
  for (const id of ["intro", "setup", "end", "menu", "page"]) document.getElementById(id).hidden = true;
  const plate = (word, by, course) => ({ word, course, bad: false, cells: Object.assign(Array(5).fill(null), [...word].map(ch => ({ ch, by }))) });
  const row = (letters, by) => ({ word: null, course: 0, bad: false, cells: Object.assign(Array(5).fill(null), letters.map(ch => ch && { ch, by })) });
  if (name === "board" || name === "dark") {
    state = newGame("duo", ["Alex", "Sam"]);
    state.deck = "tilesraonumpcdhgbewykvaeiotnrsl".split("").concat("aeiouaeio".split(""));
    state.pos = 21;
    state.rows = [
      { ...plate("tiled", 0, 4) },
      { ...plate("quiet".replace("qu", "q"), 1, 2) },
      { ...plate("pasta", 0, 1) },
      row(["c", "a", null, null, null], 1),
      { word: null, course: 0, bad: false, cells: [null, null, null, null, null] },
    ];
    state.rows[1].word = "quiet";
    state.rowLog = [["g","g","g","g"], ["g","g"], ["g"], [], []];
    state.specials = [{ w: "pasta", by: 0 }, { w: "lime", by: null }, { w: "toast", by: null }];
    state.scores = [415, 360];
    state.turn = 1;
    state.used = { tin: 0, tine: 1, tile: 0, tiled: 0, quit: 1, quiet: 1, pasta: 0 };
    state.log = [
      { p: 0, w: "tin", pts: 30, kind: "word" }, { p: 1, w: "tine", pts: 75, kind: "word" },
      { p: 1, w: "quit", pts: 140, kind: "word" }, { p: 0, w: "tile", pts: 90, kind: "word" },
      { p: 1, w: "quiet", pts: 145, kind: "word" }, { p: 0, w: "pasta", pts: 295, kind: "word" },
    ];
    state.msg = { kind: "good", p: 0, word: "tiled", pts: 195, note: "course 4" };
    if (name === "dark") { state = newGame("solo", ["You", ""]); Object.assign(state, {
      deck: "trailsmeanpodcghbuyikvwefoaeiusnrtlaoeie".split(""), pos: 14,
      rows: [plate("plate", 0, 3), plate("bread", 0, 1), row(["s", "a", "l"], 0), row(["o", "n"], 0), { word: null, course: 0, bad: false, cells: Array(5).fill(null) }],
      rowLog: [["g","g","g"], ["g"], [], [], []],
      specials: [{ w: "bread", by: 0 }, { w: "tray", by: null }, { w: "soup", by: null }],
      scores: [688, 0], used: { pat: 0, pate: 0, plate: 0, bread: 0 },
      log: [{ p: 0, w: "pat", pts: 50, kind: "word" }, { p: 0, w: "pate", pts: 90, kind: "word" }, { p: 0, w: "plate", pts: 230, kind: "word" }, { p: 0, w: "bread", pts: 318, kind: "word" }],
      msg: { kind: "good", p: 0, word: "bread", pts: 318, note: "a special!" } }); }
    render();
    return;
  }
  if (name === "welcome") { openIntro(false); return; }
  if (name === "howto") { openIntro(true); introGo(1); introGo(1); return; }
  if (name === "daily") {
    const today = dateStr();
    state = newGame("daily", ["You", ""], today);
    Object.assign(state, {
      pos: state.deck.length, over: true, recorded: true, scores: [1185, 0],
      rowLog: [["g","g","g"], ["g","s","g"], ["g","g"], ["g"], ["g","g","g","g"]],
      log: [{ p: 0, w: "tiled", pts: 195, kind: "word" }, { p: 0, w: "lemon", pts: 375, kind: "word" }],
    });
    state.specials.forEach((s, i) => { if (i < 2) s.by = 0; });
    writeJSON(KEY.stats, { ...getStats(), streak: 6, maxStreak: 9, lastDaily: today, bestDaily: 1185 });
    render();
    showEnd();
    return;
  }
  if (name === "stats") {
    writeJSON(KEY.stats, { played: { solo: 23, duo: 41, daily: 18 }, bestSolo: 1240, bestDaily: 1185, bestDish: { w: "quiets", pts: 540 },
      longest: { n: 6, w: "tiled" }, served: 912, sentBack: 37, specials: 54, streak: 6, maxStreak: 9, lastDaily: dateStr() });
    openPage("stats");
    return;
  }
};
`;

async function captureRaw() {
  const tab = await openTab();
  await tab.send("Page.enable");
  await tab.send("Runtime.enable");
  // Skip the sting, the intro and the install banner on load.
  await tab.send("Page.addScriptToEvaluateOnNewDocument", { source: `try { sessionStorage.setItem("da-sting", "1"); localStorage.setItem("small-plates-v1-intro", "true"); localStorage.setItem("small-plates-v1-install-dismissed", "true"); } catch (e) {}` });
  const phone = { w: 360, h: 640, scale: 3 };
  for (const [name, dark] of [["board", false], ["welcome", false], ["howto", false], ["daily", false], ["stats", false], ["dark", true]]) {
    await tab.send("Emulation.setDeviceMetricsOverride", { width: phone.w, height: phone.h, deviceScaleFactor: phone.scale, mobile: true });
    await tab.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: dark ? "dark" : "light" }, { name: "prefers-reduced-motion", value: "reduce" }] });
    await tab.send("Page.navigate", { url: GAME });
    await sleep(1500);
    await evaluate(tab, SETUP);
    const res = await evaluate(tab, `scene(${JSON.stringify(name)}); "ok"`);
    if (res.result?.exceptionDetails) console.log(name, res.result.exceptionDetails);
    await sleep(700);
    await shot(tab, { ...phone, dark }, join(here, "raw", `${name}.png`));
  }
  tab.close();
}

const CAPTIONS = [
  ["board", "Build words one letter at a time", "#2c5aa0"],
  ["welcome", "A word game for one or two", "#2c5aa0"],
  ["howto", "TIN, TINE, TILE, TILED", "#4c7a26"],
  ["daily", "A new Daily Table every day", "#c2412d"],
  ["stats", "Every best dish, saved", "#2c5aa0"],
  ["dark", "Easy on the eyes after dinner", "#1d2433"],
];

async function frame() {
  const tab = await openTab();
  await tab.send("Page.enable");
  const fontLink = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Figtree:wght@600&display=swap">`;
  for (const [name, caption, color] of CAPTIONS) {
    const img = pathToFileURL(join(here, "raw", `${name}.png`)).href;
    const html = `<!doctype html><html><head><meta charset="utf-8">${fontLink}<style>
      html,body{margin:0;width:1080px;height:1920px;overflow:hidden}
      body{background:${color};display:flex;flex-direction:column;align-items:center;font-family:"Young Serif",Georgia,serif;color:#fff}
      h1{font-weight:400;font-size:86px;line-height:1.08;text-align:center;margin:120px 70px 70px;letter-spacing:-0.01em}
      .phone{width:780px;height:1387px;border-radius:64px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.35),0 0 0 14px rgba(255,255,255,.14)}
      .phone img{width:100%;height:100%;display:block}
    </style></head><body><h1>${caption}</h1><div class="phone"><img src="${img}"></div></body></html>`;
    const file = join(here, "frames", `${name}.html`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
    await tab.send("Emulation.setDeviceMetricsOverride", { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false });
    await tab.send("Page.navigate", { url: pathToFileURL(file).href });
    await sleep(1800);
    await shot(tab, { w: 1080, h: 1920, scale: 1 }, join(here, "screenshots", `${CAPTIONS.findIndex(c => c[0] === name) + 1}-${name}.png`));
  }

  // Feature graphic, 1024x500: the S P plates on the cobalt tablecloth.
  const logo = readFileSync(join(here, "..", "app", "kit", "signoff.html"), "utf8").match(/<svg[\s\S]*?<\/svg>/)[0];
  const fg = `<!doctype html><html><head><meta charset="utf-8">${fontLink}<style>
    html,body{margin:0;width:1024px;height:500px;overflow:hidden}
    body{background-color:#2c5aa0;background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.07) 0 32px,transparent 32px 64px),repeating-linear-gradient(90deg,rgba(255,255,255,.07) 0 32px,transparent 32px 64px);
      display:flex;align-items:center;gap:56px;padding:0 70px;box-sizing:border-box;font-family:"Young Serif",Georgia,serif;color:#fff}
    .plates{position:relative;width:330px;height:300px;flex-shrink:0}
    .p{position:absolute;width:190px;height:190px;border-radius:50%;background:radial-gradient(circle at 50% 42%,#fdfdfb 60%,#e4e6e9 100%);
      box-shadow:inset 0 0 0 12px #fdfdfb,inset 0 0 0 19px var(--rim),0 12px 26px rgba(0,0,0,.3);display:grid;place-items:center;
      font-family:"Arial Black","Segoe UI Black",sans-serif;font-size:96px;color:#1d2433}
    .p1{left:0;top:10px;--rim:#c2412d}.p2{left:140px;top:100px;--rim:#4c7a26}
    h1{font-weight:400;font-size:92px;line-height:1;margin:0 0 14px;letter-spacing:-0.01em}
    .tag{font-family:Figtree,sans-serif;font-weight:600;font-size:32px;opacity:.92;margin:0 0 30px}
    .by{display:flex;align-items:center;gap:12px;font-family:Figtree,sans-serif;font-weight:600;font-size:24px;opacity:.9}
    .by svg{height:26px;width:auto;color:#fff}
  </style></head><body><div class="plates"><div class="p p1">S</div><div class="p p2">P</div></div>
    <div><h1>Small Plates</h1><p class="tag">A word game for one or two</p><div class="by">a ${logo} game</div></div></body></html>`;
  const fgFile = join(here, "frames", "feature-graphic.html");
  writeFileSync(fgFile, fg);
  await tab.send("Emulation.setDeviceMetricsOverride", { width: 1024, height: 500, deviceScaleFactor: 1, mobile: false });
  await tab.send("Page.navigate", { url: pathToFileURL(fgFile).href });
  await sleep(1800);
  await shot(tab, { w: 1024, h: 500, scale: 1 }, join(here, "feature-graphic.png"));
  tab.close();
}

await captureRaw();
await frame();
process.exit(0);
