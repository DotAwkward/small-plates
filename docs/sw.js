// Small Plates service worker: keeps the whole game on the phone so it plays offline.
const PREFIX = "small-plates-";
const CACHE = PREFIX + "b68f1aac6a";
const FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "icons/apple-touch-icon.png",
  "icons/favicon.png",
  "fonts/archivo-black.woff2",
  "fonts/caveat.woff2",
  "fonts/figtree.woff2",
  "fonts/young-serif.woff2",
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      // Other apps on dotawkward.github.io (like Sprout) share this cache storage, so only clear our own old versions.
      .then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(cache => cache.match(req, { ignoreSearch: true })).then(hit => {
      if (hit) return hit;
      return fetch(req).catch(() => (req.mode === "navigate" ? caches.open(CACHE).then(c => c.match("index.html")) : Response.error()));
    })
  );
});
