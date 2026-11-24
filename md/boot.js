/* Runs before the stylesheets so the first paint already has the right theme. */
(() => {
  const root = document.documentElement;
  const query = new URLSearchParams(location.search);
  const fragment = new URLSearchParams(location.hash.slice(1));
  const paramTheme = (fragment.get('theme') || query.get('theme') || '').toLowerCase();
  let theme = paramTheme === 'dark' || paramTheme === 'light' ? paramTheme : '';
  if (!theme) {
    try { theme = localStorage.getItem('moye-theme') || ''; } catch { /* Storage may be unavailable. */ }
  }
  root.dataset.theme = theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if (['md','src'].some(key => query.has(key) || fragment.has(key))) root.classList.add('reader');

  if (!('serviceWorker' in navigator)) return;
  // file:// 与本地 http 预览默认不注册，避免开发时读到旧缓存；测试可用 __moyeForceSW 打开。
  if (location.protocol !== 'https:' && !window.__moyeForceSW) return;
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
})();
