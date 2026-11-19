/* 墨页应用外壳缓存：重复打开直接读缓存，并在后台更新为最新文件。
   资源采用 stale-while-revalidate，部署新版本后无需改这里；用户下一次访问
   会先看到旧缓存、同时后台取新，再下一次即为新版本。 */
const CACHE = 'moye-shell-v1';
const SCOPE_PATH = new URL(self.registration.scope).pathname;
const SHELL_URL = new URL('index.html', self.registration.scope).href;
const SHELL_FILES = [
  'index.html', 'styles.css', 'md-renderer.css',
  'app.js', 'md-renderer.js', 'md-latex.js', 'md-images.js', 'md-files.js', 'md-pdf.js', 'md-export.js',
  'vendor/marked.umd.js', 'vendor/purify.min.js', 'vendor/highlight.min.js',
  'vendor/katex.min.js', 'vendor/katex.min.css'
];
const DOCUMENT = /\.(?:md|markdown|tex|latex|ltx)$/i;
const FONT = /\.(?:woff2?|ttf)$/i;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL_FILES.map(file => new Request(new URL(file, self.registration.scope), { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('moye-') && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

// 绕过 HTTP 缓存重新取一份，并写回缓存；no-store 的本地预览也因此能拿到最新文件。
async function refresh(request) {
  const response = await fetch(request, { cache: 'no-cache' });
  if (response.ok) await (await caches.open(CACHE)).put(request, response.clone());
  return response;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE_PATH)) return;

  if (request.mode === 'navigate') {
    const relative = url.pathname.slice(SCOPE_PATH.length);
    if (relative !== '' && relative !== 'index.html') return;
    event.respondWith((async () => {
      const cached = await caches.match(SHELL_URL);
      if (!cached) return refresh(new Request(SHELL_URL));
      event.waitUntil(refresh(new Request(SHELL_URL, { cache: 'no-cache' })).catch(() => {}));
      return cached;
    })());
    return;
  }

  // 字体文件内容不变，命中缓存后无需再检查。
  if (FONT.test(url.pathname)) {
    event.respondWith((async () => (await caches.match(request)) || refresh(request))());
    return;
  }

  // 文档优先取最新内容，离线时退回缓存。
  if (DOCUMENT.test(url.pathname)) {
    event.respondWith((async () => {
      try { return await refresh(request); }
      catch (error) { const cached = await caches.match(request); if (cached) return cached; throw error; }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (!cached) return refresh(request);
    event.waitUntil(refresh(new Request(request, { cache: 'no-cache' })).catch(() => {}));
    return cached;
  })());
});
