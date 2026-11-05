/**
 * Service Worker for Threes-Drop PWA
 *
 * Navigations are network-first (so a new deploy is picked up immediately),
 * other local assets are cache-first, CDN assets are network-first with a
 * cache fallback.
 *
 * CACHE_VERSION and LOCAL_ASSETS below are rewritten by build.mjs — edit the
 * markers, not the generated values.
 */
/* BUILD:VERSION_START */const CACHE_VERSION = 'threes-drop-4a7d71e1cff2';/* BUILD:VERSION_END */

const LOCAL_ASSETS = [
  // BUILD:ASSETS_START
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
  './levels.json',
  './bundle.js'
  // BUILD:ASSETS_END
];

// Install: pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(LOCAL_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

function cachePut(request, response) {
  if (!response.ok) return;
  const clone = response.clone();
  caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Navigations: network-first so a fresh deploy is never pinned by the cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then((response) => {
        cachePut(event.request, response);
        return response;
      }).catch(() => {
        return caches.match(event.request).then((cached) => cached || caches.match('./index.html'));
      })
    );
    return;
  }

  // Same-origin assets: cache-first (cache is dropped wholesale on version bump)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          cachePut(event.request, response);
          return response;
        });
      })
    );
    return;
  }

  // CDN resources (Phaser, Google Fonts): network-first with cache fallback
  event.respondWith(
    fetch(event.request).then((response) => {
      cachePut(event.request, response);
      return response;
    }).catch(() => caches.match(event.request))
  );
});
