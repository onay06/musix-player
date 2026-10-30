const CACHE_NAME = "nh-music-v6";
const FILES = ["./", "./index.html", "./manifest.json", "./nh-logo.png"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("nh-music-") && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    try {
      const fresh = await fetch(event.request);
      if (fresh.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, fresh.clone());
      }
      return fresh;
    } catch {
      return cached || Response.error();
    }
  })());
});