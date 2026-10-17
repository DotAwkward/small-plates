// Builds Small Plates from game.template.html:
//   small-plates.html  the Claude artifact version (page body only, Google Fonts)
//   docs/              the installable offline web app served by GitHub Pages
// Run: node build.js
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dir = __dirname;
const words = fs.readFileSync(path.join(dir, "words-3to5.txt"), "utf8")
  .split(/\r?\n/).map(w => w.trim()).filter(w => /^[a-z]{3,5}$/.test(w));
const dict = new Set(words);

// Today's specials: food and travel words, checked against the dictionary.
const themed = [
  "menu", "soup", "wine", "beer", "cafe", "dish", "fork", "meal", "tray", "rice", "lime", "salt",
  "chef", "taco", "tour", "trip", "road", "boat", "sail", "port", "gate", "hike", "tent", "view",
  "cork", "mint", "pear", "plum", "tart", "stew", "lamb", "tuna", "feta", "tide",
  "bread", "plate", "pasta", "salad", "toast", "lemon", "olive", "steak", "spoon", "table",
  "train", "beach", "hotel", "coast", "route", "globe", "tapas", "diner", "sauce", "crust",
  "cider", "ferry", "plaza",
].filter(w => dict.has(w));
const s4 = themed.filter(w => w.length === 4);
const s5 = themed.filter(w => w.length === 5);

const template = fs.readFileSync(path.join(dir, "game.template.html"), "utf8");
const appVersion = "1.1 · " + crypto.createHash("sha1").update(template).digest("hex").slice(0, 7);
const page = template
  .replace("__APPVERSION__", () => appVersion)
  .replace("__WORDS__", () => words.join(" "))
  .replace("__SPECIALS4__", () => JSON.stringify(s4))
  .replace("__SPECIALS5__", () => JSON.stringify(s5));

// 1. Artifact version
fs.writeFileSync(path.join(dir, "small-plates.html"), page);

// 2. Web app version: full document, self-hosted fonts, manifest, service worker.
const app = path.join(dir, "app");
const docs = path.join(dir, "docs");
fs.rmSync(docs, { recursive: true, force: true });
fs.cpSync(path.join(app, "fonts"), path.join(docs, "fonts"), { recursive: true });
fs.cpSync(path.join(app, "icons"), path.join(docs, "icons"), { recursive: true });
fs.copyFileSync(path.join(app, "manifest.webmanifest"), path.join(docs, "manifest.webmanifest"));
fs.writeFileSync(path.join(docs, ".nojekyll"), "");

const fontFaces = `
@font-face { font-family: "Archivo Black"; src: url(fonts/archivo-black.woff2) format("woff2"); font-weight: 400; font-display: swap; }
@font-face { font-family: "Caveat"; src: url(fonts/caveat.woff2) format("woff2"); font-weight: 400 700; font-display: swap; }
@font-face { font-family: "Figtree"; src: url(fonts/figtree.woff2) format("woff2"); font-weight: 300 900; font-display: swap; }
@font-face { font-family: "Young Serif"; src: url(fonts/young-serif.woff2) format("woff2"); font-weight: 400; font-display: swap; }`;

const body = page.replace(/<!--fonts-->[\s\S]*?<!--\/fonts-->/, "");
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="A word game for one or two: plate letters, serve words, and turn each one into the next course.">
<meta name="theme-color" content="#eef1f5" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#10141b" media="(prefers-color-scheme: dark)">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Small Plates">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icons/favicon.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<style>${fontFaces}
:root { padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }
body { margin: 0; }
[hidden] { display: none !important; }
</style>
${body}
<script>
if ("serviceWorker" in navigator) {
  // When an update installs, reload once so the new version shows right away (the game is saved).
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController || reloaded) return;
    reloaded = true;
    location.reload();
  });
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
</script>
</html>
`;
fs.writeFileSync(path.join(docs, "index.html"), html);

// Cache version changes whenever any shipped file changes, so phones pick up updates.
const hash = crypto.createHash("sha1");
for (const f of [html, fs.readFileSync(path.join(app, "manifest.webmanifest")), fs.readFileSync(path.join(app, "sw.js"))]) hash.update(f);
const version = hash.digest("hex").slice(0, 10);
fs.writeFileSync(path.join(docs, "sw.js"), fs.readFileSync(path.join(app, "sw.js"), "utf8").replace("__VERSION__", version));

console.log(`small-plates.html + docs/ built: ${words.length} words, ${s4.length}+${s5.length} specials, ${(page.length / 1024).toFixed(0)} KB page, cache ${version}`);
