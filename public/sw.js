/* eslint-disable no-restricted-globals */

// Simple offline-first service worker.
// - Keeps online behavior identical (network-first for navigations).
// - Enables offline for previously visited pages and cached API responses.
// - Avoids caching admin/auth routes.

const VERSION = "v1";
const STATIC_CACHE = `static-${VERSION}`;
const PAGES_CACHE = `pages-${VERSION}`;
const API_CACHE = `api-${VERSION}`;

const PRECACHE_URLS = ["/", "/offline", "/manifest.webmanifest", "/logo.png"];

function isSameOrigin(url) {
  return new URL(url).origin === self.location.origin;
}

function isAdminOrAuthPath(pathname) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/auth")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      try {
        await cache.addAll(PRECACHE_URLS);
      } catch {
        // Best-effort precache; offline will still work after first visit.
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== PAGES_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (!isSameOrigin(req.url)) {
    return;
  }

  // Never cache non-GET requests (e.g. calculate POST). Let the app decide fallback behavior.
  if (req.method !== "GET") {
    return;
  }

  if (isAdminOrAuthPath(url.pathname)) {
    return;
  }

  // Cache calculator browse API for offline browsing after first visit.
  if (url.pathname === "/api/calculators") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(API_CACHE);
        const cached = await cache.match(req);
        const fetchPromise = fetch(req)
          .then((res) => {
            if (res.ok) void cache.put(req, res.clone());
            return res;
          })
          .catch(() => undefined);

        return cached ?? (await fetchPromise) ?? new Response(JSON.stringify({ items: [], total: 0 }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      })(),
    );
    return;
  }

  // Navigation: network-first, then cache fallback, then offline page.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PAGES_CACHE);
        try {
          const res = await fetch(req);
          if (res.ok) {
            void cache.put(req, res.clone());
          }
          return res;
        } catch {
          const cached = await cache.match(req);
          if (cached) return cached;
          const offline =
            (await caches.match("/offline")) ??
            (await cache.match("/offline")) ??
            (await caches.match("/"));
          return offline ?? new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
        }
      })(),
    );
    return;
  }

  // Static assets: cache-first.
  const dest = req.destination;
  if (dest === "script" || dest === "style" || dest === "image" || dest === "font") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(req);
        if (cached) return cached;
        const res = await fetch(req);
        if (res.ok) void cache.put(req, res.clone());
        return res;
      })(),
    );
  }
});

