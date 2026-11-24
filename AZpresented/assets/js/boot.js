(function () {
  var theme;
  try { theme = localStorage.getItem('abyss_theme'); } catch (e) { theme = ''; }
  if (theme !== 'dark' && theme !== 'light') {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
  var meta = document.getElementById('theme-color');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#141116' : '#ffffff');
})();
