const VERSION = '2026-09-28-1';
const CACHE_PREFIX = 'weapon-oobe-ui-static-';
const CACHE_NAME = CACHE_PREFIX + VERSION;
const SCOPE = self.registration.scope;
const INDEX_URL = new URL('index.html', SCOPE).href;
const ROOT_PATH = new URL('./', SCOPE).pathname;
const INDEX_PATH = new URL('index.html', SCOPE).pathname;
const STATIC_URLS = [
  'app.css',
  'app.js',
  'md-renderer.css',
  'md-renderer.js'
].map(name => new URL(`${name}?v=${VERSION}`, SCOPE).href);
const STATIC_SET = new Set(STATIC_URLS);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([INDEX_URL, ...STATIC_URLS]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate' && (url.pathname === ROOT_PATH || url.pathname === INDEX_PATH)) {
    event.respondWith((async () => {
      try {
        return await fetch(request, { cache: 'no-cache' });
      } catch {
        return (await caches.match(INDEX_URL)) || Response.error();
      }
    })());
    return;
  }

  if (!STATIC_SET.has(url.href)) return;
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
