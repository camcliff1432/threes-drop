/**
 * Service Worker for Threes-Drop PWA
 * Cache-first for local assets, network-first for CDN with cache fallback.
 */
const CACHE_VERSION = 'threes-drop-v1';

const LOCAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
  './levels.json',
  './js/types.js',
  './js/config.js',
  './js/SoundManager.js',
  './js/HighScoreManager.js',
  './js/LevelManager.js',
  './js/CustomLevelLoader.js',
  './js/PowerUpManager.js',
  './js/SpecialTileManager.js',
  './js/BoardLogic.js',
  './js/Tile.js',
  './js/UIHelpers.js',
  './js/GameInputHandler.js',
  './js/GameUIManager.js',
  './js/GameAnimationController.js',
  './js/TileCollectionManager.js',
  './js/DailyChallengeManager.js',
  './js/AchievementManager.js',
  './js/GameStateManager.js',
  './js/scenes/MenuScene.js',
  './js/scenes/DailyChallengeScene.js',
  './js/scenes/TileCollectionScene.js',
  './js/scenes/TutorialSelectScene.js',
  './js/scenes/LeaderboardScene.js',
  './js/scenes/AchievementScene.js',
  './js/scenes/StatsScene.js',
  './js/scenes/GameScene.js',
  './js/main.js'
];

// Install: pre-cache local assets
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

// Fetch: cache-first for local, network-first for CDN
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Same-origin (local assets): cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          // Cache new local resources dynamically
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
  } else {
    // CDN resources (Phaser, Google Fonts): network-first with cache fallback
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});
