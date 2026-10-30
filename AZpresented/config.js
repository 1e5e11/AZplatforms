
window.ABYSS_CONFIG = (function () {
  var isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:';
  var override = new URLSearchParams(location.search).get('api');
  return {
    siteName: 'AZ presented',
    apiBase: override || (isLocal ? 'http://127.0.0.1:8787/api' : 'https://abyss.realgeneral.eu.org/api'),
    rendererBase: 'https://ssssssss.eu.org/md'
  };
})();
