// Service worker simples: cache offline só da tela de flashcards (/revisar),
// pro trem sem sinal. Resumos e caderno de questões continuam só online.
const CACHE = "estudos-af6-v1";
const PRECACHE_URLS = ["/revisar", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Assets estáticos do Next: cache-first (imutáveis por hash de build)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const resp = await fetch(request);
        if (resp.ok) cache.put(request, resp.clone());
        return resp;
      })
    );
    return;
  }

  // Página de revisar (e navegação em geral): network-first, cai pro cache se offline
  if (request.mode === "navigate" || url.pathname === "/revisar") {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          const clone = resp.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
          return resp;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/revisar")))
    );
  }
});
