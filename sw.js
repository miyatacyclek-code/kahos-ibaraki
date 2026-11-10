// Offline support: keeps the app working without internet.
// When you update the app, change the version number below.
const CACHE = "kaho-ibaraki-v39";
const FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png", "./photos/seaside-nemophila.jpg", "./photos/kochia.jpg", "./photos/fukuroda.jpg", "./photos/nakaminato.jpg", "./photos/tsukubasan.jpg", "./photos/oarai.jpg", "./photos/ushiku.jpg", "./photos/kasama.jpg", "./photos/kaho.jpg", "./photos/marukuni.jpg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
