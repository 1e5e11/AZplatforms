const CACHE_NAME = 'character-copy-v6-keyboard-symbols';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './assets/emoji-data.js',
  './assets/keyboard-data.js',
  './vendor/mathjax-tex-svg-3.2.2.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(names.filter(name => name !== CACHE_NAME && name.startsWith('character-copy-')).map(name => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  const isPage = event.request.mode === 'navigate';
  if (isPage) {
    event.respondWith(fetch(event.request).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
