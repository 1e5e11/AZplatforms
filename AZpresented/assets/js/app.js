(function () {
  'use strict';

  var cfg = Object.assign(
    {
      siteName: 'AZ presented',
      apiBase: 'https://abyss.realgeneral.eu.org/api',
      rendererBase: 'https://ssssssss.eu.org/md'
    },
    window.ABYSS_CONFIG || {}
  );

  var API = String(cfg.apiBase).replace(/\/+$/, '');
  var RENDERER = String(cfg.rendererBase).replace(/\/+$/, '');
  var TOKEN_KEY = 'abyss_admin_token';
  var LANG_KEY = 'abyss_lang';
  var THEME_KEY = 'abyss_theme';
  var AI_KEY_STORE = 'abyss_deepseek_key';
  var DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
  var DEEPSEEK_MODEL = 'deepseek-chat';
  var AI_AUTHOR = (function () {
    try {
      return localStorage.getItem('abyss_default_author') || 'AI';
    } catch (e) {
      return 'AI';
    }
  })();
  var MAX_IMAGE_BYTES = 10 * 1024 * 1024;
  var PAGE = document.body.getAttribute('data-page') === 'admin' ? 'admin' : 'public';
  var view = document.getElementById('view');
  var statusbar = document.getElementById('statusbar');
  var searchInput = document.getElementById('search-input');
  var navAdmin = document.getElementById('nav-admin');
  var langToggle = document.getElementById('lang-toggle');
  var themeToggle = document.getElementById('theme-toggle');

  function readLang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved === 'zh' || saved === 'en') return saved;
    } catch (e) {
      /* ignore */
    }
    return (navigator.language || 'zh').toLowerCase().indexOf('en') === 0 ? 'en' : 'zh';
  }

  var lang = readLang();

  function L(zh, en) {
    return lang === 'en' ? en : zh;
  }

  function readTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {
      /* ignore */
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function updateThemeToggle() {
    if (!themeToggle) return;
    var dark = currentTheme() === 'dark';
    themeToggle.textContent = dark ? L('浅色', 'Light') : L('深色', 'Dark');
    themeToggle.setAttribute('aria-label', dark
      ? L('切换到浅色模式', 'Switch to light mode')
      : L('切换到深色模式', 'Switch to dark mode'));
  }

  function themedRendererUrl(url) {
    var theme = currentTheme();
    if (/[#&]theme=/.test(url)) return url.replace(/([#&])theme=[^&]*/, '$1theme=' + theme);
    return url + (url.indexOf('#') >= 0 ? '&' : '#') + 'theme=' + theme;
  }

  function applyThemeToFrames() {
    var frames = document.querySelectorAll('iframe.reader-frame');
    for (var i = 0; i < frames.length; i += 1) {
      frames[i].src = themedRendererUrl(frames[i].src);
    }
  }

  function applyTheme(theme, persist) {
    var next = theme === 'dark' ? 'dark' : 'light';
    var changed = currentTheme() !== next;
    document.documentElement.setAttribute('data-theme', next);
    var meta = document.getElementById('theme-color');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#171315' : '#ffffff');
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        /* ignore */
      }
    }
    updateThemeToggle();
    if (changed) applyThemeToFrames();
  }

  function setTheme(next) {
    applyTheme(next, true);
  }

  var SERVER_ERRORS = {
    '令牌无效': 'Invalid token',
    '尝试次数过多，请稍后再试': 'Too many attempts. Try again later.',
    '请求体过大': 'Request body too large',
    '图片内容为空': 'The image is empty',
    '不支持的图片格式': 'Unsupported image format',
    '图片过大': 'Image is too large',
    '图片不存在': 'Image not found',
    '导入数据格式无效': 'Invalid import data',
    '数据格式无效': 'Invalid data format',
    '压缩包过大': 'Archive is too large',
    '压缩包格式无效': 'Invalid archive',
    '压缩包数据不完整': 'Incomplete archive',
    '压缩包中缺少 posts.json': 'The archive has no posts.json',
    'posts.json 格式无效': 'Invalid posts.json',
    '压缩包解压失败': 'Cannot unpack the archive',
    '不支持的压缩方式': 'Unsupported compression method',
    '压缩包解压后过大': 'Archive contents are too large',
    '压缩包文件过多': 'Too many files in the archive',
    '不支持加密的压缩包': 'Encrypted archives are not supported',
    '不支持 ZIP64 压缩包': 'ZIP64 archives are not supported',
    'JSON 格式无效': 'Invalid JSON',
    '请求体长度无效': 'Invalid request length',
    '接口不存在': 'Endpoint not found',
    '文章不存在': 'Post not found',
    '文章已删除，请先从回收站恢复': 'This post is in the trash. Restore it first.',
    '文章已在回收站': 'This post is already in the trash',
    '文章未被删除': 'This post is not deleted',
    '标题不能为空': 'Title is required',
    '正文不能为空': 'Body is required',
    '标题过长': 'Title is too long',
    '发布时间格式无效': 'Invalid publish date',
    '已存在': 'Already exists',
    '名称不能为空': 'Name is required',
    '版本不存在': 'Version not found',
    '服务器内部错误': 'Internal server error',
    '需要管理员权限': 'Admin permission required',
    '无权操作这篇文章': 'You cannot edit this post',
    '分类不存在': 'Category does not exist',
    '作者不存在': 'Author not found'
  };

  function translateServerError(message) {
    if (!message || lang !== 'en') return message;
    if (SERVER_ERRORS[message]) return SERVER_ERRORS[message];
    var used = /^仍有 (\d+) 篇文章在使用，无法删除$/.exec(message);
    if (used) return used[1] + ' post(s) still use it, so it cannot be deleted.';
    return message;
  }

  function setLang(next) {
    lang = next === 'en' ? 'en' : 'zh';
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {
      /* ignore */
    }
    lastStatusAt = 0;
    applyStaticLang();
    updateTopbar();
    if (state.role && state.route && state.route.name === 'admin') {
      view.innerHTML = adminHtml();
      if (state.previewMode) refreshPreview();
      setDefaultStatus(true);
      return;
    }
    if (PAGE === 'admin') setDefaultStatus(true);
    renderRoute();
  }

  function applyStaticLang() {
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    document.title = PAGE === 'admin'
      ? L('AZ presented — 管理', 'AZ presented — Admin')
      : 'AZ presented';
    var brand = document.querySelector('.brand');
    var brandCn = document.querySelector('.brand-cn');
    var brandEn = document.querySelector('.brand-en');
    if (brand) {
      brand.setAttribute(
        'aria-label',
        PAGE === 'admin' ? L('返回博客', 'Back to blog') : L('返回首页', 'Back to home')
      );
    }
    if (brandCn) brandCn.textContent = 'AZ presented';
    if (brandEn) brandEn.textContent = PAGE === 'admin' ? L('管理台', 'ADMIN CONSOLE') : 'AZ PRESENTED';
    if (searchInput) {
      searchInput.placeholder = L('搜索文章…', 'Search articles…');
      searchInput.setAttribute('aria-label', L('搜索文章', 'Search articles'));
    }
    langToggle.textContent = L('EN', '中');
    langToggle.setAttribute('aria-label', L('切换到英文', 'Switch to Chinese'));
    updateThemeToggle();
  }

  function ApiError(status, message) {
    this.name = 'ApiError';
    this.status = status;
    this.message = message;
  }
  ApiError.prototype = Object.create(Error.prototype);

  function readToken() {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || '';
    } catch (e) {
      return '';
    }
  }

  function readAiKey() {
    try {
      return localStorage.getItem(AI_KEY_STORE) || '';
    } catch (e) {
      return '';
    }
  }

  function writeAiKey(key) {
    try {
      if (key) localStorage.setItem(AI_KEY_STORE, key);
      else localStorage.removeItem(AI_KEY_STORE);
    } catch (e) {
      /* ignore */
    }
  }

  var state = {
    token: readToken(),
    isAdmin: false,
    role: null,
    authorName: '',
    query: '',
    category: '',
    route: null,
    lastRoute: null,
    posts: [],
    total: 0,
    categories: [],
    authors: [],
    adminTab: 'write',
    draft: null,
    editingSlug: null,
    versions: [],
    currentVersion: 0,
    adminPosts: [],
    selectedSlugs: {},
    logsFiles: [],
    logFile: '',
    logsEntries: [],
    logsErrorsOnly: false,
    previewMode: false,
    saving: false,
    aiBusy: false,
    editingDeleted: false
  };
  state.draft = emptyDraft();

  var ticket = 0;
  var searchTimer = null;
  var previewTimer = null;
  var imageAnchor = null;
  var statusTimer = null;
  var lastStatusAt = 0;

  /* ---------- utilities ---------- */

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'zh-CN', {
      year: 'numeric',
      month: lang === 'en' ? 'short' : 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(d);
  }

  function hrefFor(file, hash) {
    return file + location.search + (hash || '');
  }

  function postCount(n) {
    return L(n + ' 篇', n + (n === 1 ? ' post' : ' posts'));
  }

  function versionCount(n) {
    return L(n + ' 版', n + (n === 1 ? ' version' : ' versions'));
  }

  function fmtShort(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(d);
  }

  function toLocalInput(iso) {
    var d = iso ? new Date(iso) : new Date();
    if (isNaN(d.getTime())) d = new Date();
    return (
      d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      'T' + pad(d.getHours()) + ':' + pad(d.getMinutes())
    );
  }

  function fromLocalInput(value) {
    if (!value) return '';
    var d = new Date(value);
    return isNaN(d.getTime()) ? '' : d.toISOString();
  }

  function emptyDraft() {
    return {
      title: '',
      author: '',
      category: '',
      tags: '',
      excerpt: '',
      content: '',
      slug: '',
      created_at: toLocalInput(new Date()),
      pinned: false,
      featured: false
    };
  }

  function postToDraft(post) {
    return {
      title: post.title || '',
      author: post.author || '',
      category: post.category || '',
      tags: (post.tags || []).join(', '),
      excerpt: post.excerpt || '',
      content: post.content || '',
      slug: post.slug || '',
      created_at: toLocalInput(post.created_at),
      pinned: Boolean(post.pinned),
      featured: Boolean(post.featured)
    };
  }

  function rendererUrlFromMarkdown(markdown) {
    return themedRendererUrl(RENDERER + '#md=' + encodeURIComponent(String(markdown || '')));
  }

  function displayMarkdown(post) {
    var content = String(post.content || '');
    var match = content.match(/^\s*#\s+(.+?)\s*(?:\r?\n|$)/);
    if (match && match[1].trim() === String(post.title || '').trim()) {
      return content.slice(match[0].length).replace(/^\s*\n/, '');
    }
    return content;
  }

  function rawUrlForPost(post, stripTitle) {
    return API + '/posts/' + encodeURIComponent(post.slug) + '/raw' + (stripTitle ? '?strip_title=1' : '');
  }

  function rendererUrlForPost(post) {
    if (/^https:\/\//i.test(API)) {
      return themedRendererUrl(RENDERER + '#src=' + encodeURIComponent(rawUrlForPost(post, true)));
    }
    return rendererUrlFromMarkdown(displayMarkdown(post));
  }

  /* ---------- API ---------- */

  async function request(path, options) {
    options = options || {};
    var headers = {};
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    if (options.auth && state.token) headers.Authorization = 'Bearer ' + state.token;
    var response;
    try {
      response = await fetch(API + path, {
        method: options.method || 'GET',
        headers: headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        cache: 'no-store'
      });
    } catch (e) {
      throw new ApiError(0, L('无法连接服务器，请检查网络', 'Cannot reach the server. Check your connection.'));
    }
    var text = await response.text();
    var data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = {};
      }
    }
    if (!response.ok) {
      throw new ApiError(response.status, translateServerError(data.error) || L('请求失败（' + response.status + '）', 'Request failed (' + response.status + ')'));
    }
    return data;
  }

  function setToken(token) {
    state.token = token;
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      /* ignore */
    }
  }

  function applyIdentity(data) {
    state.role = data.role === 'author' ? 'author' : 'admin';
    state.authorName = data.role === 'author' ? String(data.name || '') : '';
    state.isAdmin = state.role === 'admin';
  }

  function clearToken() {
    state.token = '';
    state.isAdmin = false;
    state.role = null;
    state.authorName = '';
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      /* ignore */
    }
  }

  async function verifyToken() {
    if (!state.token) {
      state.isAdmin = false;
      state.role = null;
      state.authorName = '';
      return false;
    }
    try {
      var data = await request('/auth', { method: 'POST', body: { token: state.token } });
      applyIdentity(data);
      return true;
    } catch (e) {
      state.isAdmin = false;
      state.role = null;
      state.authorName = '';
      if (e.status === 401) clearToken();
      return false;
    }
  }

  function resetAdminRoute() {
    if (PAGE === 'admin' && location.hash !== '#/admin') location.hash = '#/admin';
    else renderRoute();
  }

  function authError(err) {
    if (err && err.status === 401) {
      clearToken();
      startNewDraft();
      state.adminTab = 'write';
      setStatus(L('令牌无效或已过期，请重新登录', 'Invalid or expired token. Please sign in again.'), 'error');
      resetAdminRoute();
      return true;
    }
    return false;
  }

  /* ---------- status bar ---------- */

  function setStatus(text, tone) {
    if (!statusbar) return;
    lastStatusAt = Date.now();
    statusbar.textContent = text;
    statusbar.dataset.tone = tone || '';
    clearTimeout(statusTimer);
    if (tone !== 'error') {
      statusTimer = setTimeout(function () {
        if (!state.saving) setDefaultStatus(true);
      }, 6000);
    }
  }

  function setDefaultStatus(force) {
    if (!statusbar) return;
    if (!force && Date.now() - lastStatusAt < 4500) return;
    if (PAGE === 'admin') {
      statusbar.textContent = state.isAdmin
        ? L('管理员模式 · 令牌仅保存在当前标签页', 'Admin mode · token kept in this tab only')
        : state.role === 'author'
          ? L(
            '作者模式 · ' + state.authorName + ' · 只能管理自己的文章',
            'Author mode · ' + state.authorName + ' · own posts only'
          )
          : L('管理台 · 请输入登录令牌', 'Admin · token required');
    } else {
      statusbar.textContent = '';
    }
    statusbar.dataset.tone = '';
  }

  /* ---------- routing ---------- */

  function parseRoute() {
    var raw = (location.hash || '#/').replace(/^#/, '');
    if (raw.charAt(0) !== '/') raw = '/' + raw;
    var parts = raw
      .split('/')
      .filter(Boolean)
      .map(function (part) {
        try {
          return decodeURIComponent(part);
        } catch (e) {
          return part;
        }
      });
    if (parts[0] === 'post' && parts[1]) return { name: 'post', slug: parts[1] };
    if (parts[0] === 'admin') {
      if (parts[1] === 'edit' && parts[2]) return { name: 'admin', edit: parts[2] };
      return { name: 'admin' };
    }
    return { name: 'home' };
  }

  function updateTopbar() {
    var brand = document.querySelector('.brand');
    if (PAGE === 'admin') {
      if (searchInput) searchInput.style.display = 'none';
      navAdmin.textContent = L('博客', 'Blog');
      navAdmin.setAttribute('href', hrefFor('index.html'));
      if (brand) brand.setAttribute('href', hrefFor('index.html'));
    } else {
      if (searchInput) searchInput.style.display = '';
      navAdmin.textContent = L('管理', 'Admin');
      navAdmin.setAttribute('href', hrefFor('admin.html'));
      if (brand) brand.setAttribute('href', '#/');
    }
  }

  async function renderRoute() {
    var my = ++ticket;
    var route = parseRoute();
    var previous = state.route;

    if (PAGE === 'admin') {
      if (route.name === 'post') {
        location.replace(hrefFor('index.html', '#/post/' + encodeURIComponent(route.slug)));
        return;
      }
      if (route.name === 'home') route = { name: 'admin' };
      if (route.name !== 'admin') {
        location.replace(hrefFor('index.html'));
        return;
      }
    } else if (route.name === 'admin') {
      location.replace(
        hrefFor('admin.html', route.edit ? '#/admin/edit/' + encodeURIComponent(route.edit) : '')
      );
      return;
    }

    document.body.classList.toggle('article-view', PAGE === 'public' && route.name === 'post');
    state.route = route;
    state.lastRoute = previous;
    updateTopbar(route);

    if (PAGE === 'public') {
      if (route.name === 'post') await renderArticle(route.slug, my);
      else await renderHome(my);
      return;
    }

    if (route.edit) {
      state.adminTab = 'write';
    } else if (!previous || previous.name !== 'admin') {
      state.adminTab = 'write';
      startNewDraft();
    }
    await renderAdmin(route, my);
  }

  function startNewDraft() {
    state.draft = emptyDraft();
    state.editingSlug = null;
    state.versions = [];
    state.currentVersion = 0;
    state.previewMode = false;
    state.editingDeleted = false;
  }

  function draftDirty() {
    var d = state.draft;
    if (!d) return false;
    return Boolean(d.title.trim() || d.content.trim() || d.excerpt.trim() || d.tags.trim());
  }

  function startNewPost() {
    if (draftDirty() && !confirm(L(
      '开始一篇新文章？当前未保存的内容会清空。',
      'Start a new post? Unsaved content will be cleared.'
    ))) return;
    startNewDraft();
    state.adminTab = 'write';
    if (location.hash !== '#/admin') location.hash = '#/admin';
    else renderRoute();
  }

  /* ---------- public: home ---------- */

  function showLoading(label) {
    view.innerHTML =
      '<div class="workspace"><section class="panel glass main-panel">' +
      '<div class="empty-state"><p class="empty-text">' + esc(label) + '</p></div>' +
      '</section></div>';
  }

  function renderError(message, action) {
    view.innerHTML =
      '<div class="workspace"><section class="panel glass main-panel">' +
      '<div class="empty-state"><p class="empty-title">' + L('读取失败', 'Failed to load') + '</p>' +
      '<p class="empty-text">' + esc(message) + '</p>' +
      '<button class="az-button" data-action="' + esc(action || 'retry-route') + '">' +
      L('重试', 'Retry') + '</button>' +
      '</div></section></div>';
    setStatus(message, 'error');
  }

  async function renderHome(my) {
    showLoading(L('正在读取文章…', 'Loading posts…'));
    var params = new URLSearchParams({ limit: '100' });
    if (state.query) params.set('q', state.query);
    if (state.category) params.set('category', state.category);
    try {
      var results = await Promise.all([request('/posts?' + params.toString()), request('/categories')]);
      if (my !== ticket) return;
      state.posts = results[0].posts || [];
      state.total = results[0].total || 0;
      state.categories = results[1].categories || [];
      view.innerHTML = homeHtml();
      setDefaultStatus();
    } catch (e) {
      if (my !== ticket) return;
      renderError(e.message);
    }
  }

  function homeHtml() {
    var allActive = state.category === '';
    var categoryChips =
      '<button class="tag' + (allActive ? ' active' : '') + '" data-action="filter-category" data-category="">' +
      L('全部', 'All') + '</button>' +
      state.categories
        .map(function (c) {
          var active = state.category === c.name;
          return (
            '<button class="tag' + (active ? ' active' : '') + '" data-action="filter-category" data-category="' +
            esc(c.name) + '">' + esc(c.name) + '</button>'
          );
        })
        .join('');

    var rows = state.posts.length
      ? state.posts.map(postRowHtml).join('')
      : '<div class="empty-state"><p class="empty-title">' + L('还没有文章', 'No posts yet') +
        '</p><p class="empty-text">' +
        (state.query || state.category
          ? L('换个关键词或分类试试。', 'Try another keyword or category.')
          : L('管理员登录后即可发布第一篇。', 'Sign in as admin to publish the first post.')) +
        '</p></div>';

    return (
      '<div class="workspace">' +
      '<section class="panel glass main-panel">' +
      '<div class="panel-head"><h1 class="panel-title">' + L('最近文章', 'Recent posts') + '</h1>' +
      '<span class="panel-note">' +
      (state.query || state.category
        ? L('筛选出 ' + state.total + ' 篇', state.total + ' found')
        : postCount(state.total)) +
      '</span></div>' +
      '<div class="category-strip">' + categoryChips + '</div>' +
      '<div class="post-list">' + rows + '</div>' +
      '</section></div>'
    );
  }

  function postBadges(post) {
    var badges = '';
    if (post.pinned) badges += '<span class="badge pin">' + L('置顶', 'Pinned') + '</span>';
    if (post.featured) badges += '<span class="badge featured">' + L('精选', 'Featured') + '</span>';
    return badges;
  }

  function postRowHtml(post) {
    var href = '#/post/' + encodeURIComponent(post.slug);
    return (
      '<article class="post-row">' +
      '<a class="post-link" href="' + href + '">' +
      '<h3 class="post-title">' + esc(post.title) + postBadges(post) + '</h3>' +
      '<div class="post-meta">' + esc(fmtDate(post.created_at)) + ' · ' + esc(post.author) + ' · ' +
      esc(post.category) + ' · ' + L(
        Number(post.reading_minutes || 1) + ' 分钟',
        Number(post.reading_minutes || 1) + ' min read'
      ) + '</div>' +
      '<p class="post-excerpt">' + esc(post.excerpt) + '</p>' +
      '</a></article>'
    );
  }

  /* ---------- public: article ---------- */

  async function renderArticle(slug, my) {
    showLoading(L('正在读取文章…', 'Loading post…'));
    try {
      var data = await request('/posts/' + encodeURIComponent(slug));
      if (my !== ticket) return;
      var post = data.post;
      var readerUrl = rendererUrlForPost(post);
      view.innerHTML = articleHtml(post, readerUrl);
      setDefaultStatus();
    } catch (e) {
      if (my !== ticket) return;
      if (e.status === 404) {
        view.innerHTML =
          '<div class="workspace"><section class="panel glass main-panel">' +
          '<div class="empty-state"><p class="empty-title">' + L('文章不存在', 'Post not found') + '</p>' +
          '<p class="empty-text">' +
          L('它可能已被删除，或者链接有误。', 'It may have been deleted, or the link is wrong.') +
          '</p><a class="az-button" href="#/">' + L('返回文章列表', 'Back to posts') +
          '</a></div></section></div>';
      } else {
        renderError(e.message);
      }
    }
  }

  function articleHtml(post, readerUrl) {
    var tags = (post.tags || [])
      .map(function (tag) {
        return '<button class="tag" data-action="tag-search" data-tag="' + esc(tag) + '">' + esc(tag) + '</button>';
      })
      .join('');

    return (
      '<div class="workspace article-workspace">' +
      '<section class="panel glass main-panel article-panel">' +
      '<div class="article-head">' +
      '<a class="back-link" href="#/">← ' + L('返回文章列表', 'Back to posts') + '</a>' +
      '<div class="article-title-row">' +
      '<h1 class="article-title">' + esc(post.title) + postBadges(post) + '</h1>' +
      (tags ? '<div class="tag-list article-tags">' + tags + '</div>' : '') +
      '</div>' +
      '<div class="article-meta">' + esc(fmtDate(post.created_at)) + ' · ' + esc(post.author) + ' · ' +
      esc(post.category) + ' · ' + L(
        Number(post.reading_minutes || 1) + ' 分钟',
        Number(post.reading_minutes || 1) + ' min read'
      ) +
      ' · <a class="inline-link" href="' + esc(readerUrl) + '" target="_blank" rel="noopener">' +
      L('新标签页打开', 'Open in a new tab') + '</a></div>' +
      '</div>' +
      '<div class="reader-shell">' +
      '<iframe class="reader-frame" src="' + esc(readerUrl) + '" title="' + esc(post.title) +
      '" loading="eager" referrerpolicy="no-referrer"></iframe>' +
      '</div>' +
      '</section></div>'
    );
  }

  /* ---------- admin: entry ---------- */

  async function renderAdmin(route, my) {
    if (!state.role) {
      renderLogin();
      return;
    }
    state.previewMode = false;
    try {
      await loadTaxonomy(false);
      if (route.edit) {
        var data = await request('/admin/posts/' + encodeURIComponent(route.edit), { auth: true });
        if (my !== ticket) return;
        state.editingSlug = data.post.slug;
        state.draft = postToDraft(data.post);
        state.editingDeleted = Boolean(data.post.deleted);
        state.versions = data.versions || [];
        state.currentVersion = state.versions.length ? state.versions[0].version : 0;
      } else if (state.adminTab === 'logs' && state.isAdmin) {
        await loadLogs();
      } else {
        applyTaxonomyDefaults();
        if (state.adminTab === 'manage') {
          var list = await request('/admin/posts', { auth: true });
          if (my !== ticket) return;
          state.adminPosts = list.posts || [];
          var available = {};
          state.adminPosts.forEach(function (post) {
            if (!post.deleted) available[post.slug] = true;
          });
          Object.keys(state.selectedSlugs).forEach(function (slug) {
            if (!available[slug]) delete state.selectedSlugs[slug];
          });
        }
      }
      if (my !== ticket) return;
      view.innerHTML = adminHtml();
      setDefaultStatus();
    } catch (e) {
      if (authError(e)) return;
      if (my !== ticket) return;
      renderError(e.message);
    }
  }

  async function loadTaxonomy(force) {
    if (!force && state.categories.length && state.authors.length) return;
    var results = await Promise.all([request('/categories'), request('/authors')]);
    state.categories = results[0].categories || [];
    state.authors = results[1].authors || [];
  }

  function applyTaxonomyDefaults() {
    if (state.editingSlug) return;
    if (state.role === 'author') {
      state.draft.author = state.authorName;
      if (!state.draft.category && state.categories.length) state.draft.category = state.categories[0].name;
    } else if (!state.draft.author) {
      state.draft.author = AI_AUTHOR;
    }
  }

  function renderLogin(message) {
    view.innerHTML =
      '<div class="login-screen"><section class="panel glass login-panel">' +
      '<h1 class="login-title">' + L('管理', 'Admin') + '</h1>' +
      '<p class="login-sub">' +
      L(
        '输入管理员令牌或作者令牌，进入对应的写作与文章管理界面。',
        'Enter an admin token or your author token to manage posts.'
      ) +
      '</p><form id="login-form" autocomplete="off">' +
      '<label class="field"><span class="field-label">' + L('登录令牌', 'Access token') + '</span>' +
      '<input id="token-input" class="az-input login-input" type="password" placeholder="' +
      L('粘贴令牌…', 'Paste token…') + '" autocomplete="current-password"></label>' +
      (message ? '<p class="form-error">' + esc(message) + '</p>' : '') +
      '<button class="az-confirm login-submit" type="submit">' + L('进入管理台', 'Enter dashboard') + '</button>' +
      '</form>' +
      '<p class="login-hint">' +
      L(
        '令牌只保存在当前标签页的 sessionStorage 中，关闭标签页即清除。',
        'The token lives in this tab’s sessionStorage and is cleared when the tab closes.'
      ) +
      '</p><a class="op login-back" href="#/">← ' + L('返回博客', 'Back to blog') + '</a>' +
      '</section></div>';
    var input = document.getElementById('token-input');
    if (input) input.focus();
  }

  /* ---------- admin: layout ---------- */

  function adminHtml() {
    var write = state.adminTab === 'write';
    var manage = state.adminTab === 'manage';
    var logs = state.isAdmin && state.adminTab === 'logs';
    return (
      '<div class="workspace admin-workspace">' +
      '<section class="panel glass main-panel admin-main">' +
      '<div class="admin-bar">' +
      '<div class="tabs">' +
      '<button class="tab' + (write ? ' active' : '') + '" data-action="admin-write">' +
      L('写作', 'Write') + '</button>' +
      '<button class="tab' + (manage ? ' active' : '') + '" data-action="admin-manage">' +
      L('文章管理', 'Posts') + '</button>' +
      (state.isAdmin
        ? '<button class="tab' + (logs ? ' active' : '') + '" data-action="admin-logs">' +
          L('日志', 'Logs') + '</button>'
        : '') +
      '</div>' +
      '<div class="admin-bar-ops">' +
      '<button class="az-button new-post-btn" data-action="new-post">' +
      L('写新文章', 'New post') + '</button>' +
      (state.isAdmin
        ? '<button class="op ai-settings-btn" data-action="ai-settings" title="' +
          L('配置 DeepSeek API Key', 'Configure DeepSeek API key') + '">' +
          L('AI 设置', 'AI settings') + '</button>'
        : '') +
      (state.role === 'author' ? '<span class="admin-state">' + esc(state.authorName) + '</span>' : '') +
      (state.editingSlug && !manage ? '<span class="admin-state">' + L('编辑中', 'Editing') + '</span>' : '') +
      '<a class="op" href="' + hrefFor('index.html') + '">' + L('博客', 'Blog') + '</a>' +
      '<button class="op" data-action="logout">' + L('退出', 'Sign out') + '</button>' +
      '</div></div>' +
      (logs ? logsHtml() : manage ? manageHtml() : editorHtml()) +
      '<div class="admin-bottom">' +
      (logs
        ? ''
        : manage
          ? (state.isAdmin ? statsPanel() : '') + taxonomyPanel()
          : publishPanel() + versionsPanel() + taxonomyPanel()) +
      '</div>' +
      '</section></div>'
    );
  }

  function editorHtml() {
    var d = state.draft;
    var editing = !!state.editingSlug;
    var previewing = state.previewMode;
    var authorOptions = state.authors
      .map(function (a) {
        return '<option value="' + esc(a.name) + '"></option>';
      })
      .join('');
    var categoryOptions = state.categories
      .map(function (c) {
        return '<option value="' + esc(c.name) + '"></option>';
      })
      .join('');
    var categorySelectOptions = state.categories
      .map(function (c) {
        return '<option value="' + esc(c.name) + '"' +
          (c.name === d.category ? ' selected' : '') + '>' + esc(c.name) + '</option>';
      })
      .join('');
    if (d.category && !state.categories.some(function (c) { return c.name === d.category; })) {
      categorySelectOptions = '<option value="' + esc(d.category) + '" selected>' +
        esc(d.category) + '</option>' + categorySelectOptions;
    }

    return (
      '<div class="editor">' +
      (state.editingDeleted
        ? '<div class="banner">' + L('这篇文章在回收站中，保存已禁用。', 'This post is in the trash. Saving is disabled.') +
          '<button class="op" data-action="restore-post" data-slug="' + esc(state.editingSlug) + '">' +
          L('恢复到文章列表', 'Restore to posts') + '</button></div>'
        : '') +
      '<input class="az-input editor-title" data-field="title" value="' + esc(d.title) +
      '" placeholder="' + (state.isAdmin
        ? L('文章标题（留空由 AI 生成）', 'Post title (blank = AI generates)')
        : L('文章标题', 'Post title')) +
      '" aria-label="' + L('文章标题', 'Post title') + '">' +
      '<div class="editor-meta">' +
      (state.role === 'author'
        ? '<span class="field inline"><span class="field-label">' + L('作者', 'Author') +
          '</span><span class="readonly-value">' + esc(state.authorName) + '</span></span>'
        : '<label class="field inline"><span class="field-label">' + L('作者', 'Author') + '</span>' +
          '<input class="az-input" data-field="author" list="author-options" value="' + esc(d.author) +
          '" placeholder="' + L('佚名', 'Anonymous') + '"></label>') +
      '<label class="field inline"><span class="field-label">' + L('分类', 'Category') + '</span>' +
      (state.role === 'author'
        ? '<select class="az-input" data-field="category" aria-label="' + L('分类', 'Category') + '">' +
          categorySelectOptions + '</select>'
        : '<input class="az-input" data-field="category" list="category-options" value="' + esc(d.category) +
          '" placeholder="' + L('留空由 AI 生成', 'Blank = AI generates') + '">') +
      '</label>' +
      '<label class="field inline"><span class="field-label">' + L('发布', 'Published') + '</span>' +
      '<input class="az-input" type="datetime-local" data-field="created_at" value="' + esc(d.created_at) + '"></label>' +
      (editing
        ? '<span class="field inline"><span class="field-label">' + L('标识', 'Slug') + '</span><span class="slug-text">' +
          esc(d.slug) + '</span></span>'
        : '<label class="field inline"><span class="field-label">' + L('标识', 'Slug') + '</span>' +
          '<input class="az-input" data-field="slug" value="' + esc(d.slug) + '" placeholder="' +
          L('自动生成', 'Auto') + '"></label>') +
      '</div>' +
      '<div class="editor-tabs">' +
      '<button class="tab' + (previewing ? '' : ' active') + '" data-action="editor-tab" data-tab="write">' +
      L('编辑', 'Write') + '</button>' +
      '<button class="tab' + (previewing ? ' active' : '') + '" data-action="editor-tab" data-tab="preview">' +
      L('预览', 'Preview') + '</button>' +
      '<span id="char-count" class="char-count">' +
      L(d.content.length + ' 字', d.content.length + ' chars') + '</span>' +
      '</div>' +
      '<div class="md-toolbar">' +
      '<button class="op" data-action="md-insert" data-kind="heading">' + L('标题', 'Heading') + '</button>' +
      '<button class="op" data-action="md-insert" data-kind="bold">' + L('粗体', 'Bold') + '</button>' +
      '<button class="op" data-action="md-insert" data-kind="italic">' + L('斜体', 'Italic') + '</button>' +
      '<button class="op" data-action="md-insert" data-kind="code">' + L('代码', 'Code') + '</button>' +
      '<button class="op" data-action="md-insert" data-kind="math">' + L('公式', 'Math') + '</button>' +
      '<button class="op" data-action="md-insert" data-kind="mathblock">' + L('公式块', 'Math block') + '</button>' +
      '<button class="op" data-action="md-insert" data-kind="link">' + L('链接', 'Link') + '</button>' +
      '<button class="op" data-action="md-image">' + L('图片', 'Image') + '</button>' +
      '<button class="op" data-action="md-insert" data-kind="quote">' + L('引用', 'Quote') + '</button>' +
      '<button class="op" data-action="md-insert" data-kind="list">' + L('列表', 'List') + '</button>' +
      '<button class="op" data-action="md-insert" data-kind="codeblock">' + L('代码块', 'Code block') + '</button>' +
      '</div>' +
      '<input id="image-input" type="file" accept="image/png,image/jpeg,image/gif,image/webp" multiple hidden>' +
      '<div id="editor-pane" class="editor-pane"' + (previewing ? ' hidden' : '') + '>' +
      '<textarea id="content-editor" class="az-textarea editor-textarea" data-field="content" ' +
      'placeholder="' + L(
        '用 Markdown 写作，支持 $行内公式$ 与 $$独立公式$$…',
        'Write in Markdown. Inline $math$ and $$display math$$ are supported…'
      ) + '">' + esc(d.content) + '</textarea>' +
      '</div>' +
      '<div id="editor-preview" class="editor-preview"' + (previewing ? '' : ' hidden') + '></div>' +
      '</div>' +
      '<datalist id="author-options">' + authorOptions + '</datalist>' +
      '<datalist id="category-options">' + categoryOptions + '</datalist>'
    );
  }

  function publishPanel() {
    var d = state.draft;
    var editing = !!state.editingSlug;
    return (
      '<section class="panel glass side-panel publish-panel">' +
      '<div class="panel-head"><h2 class="panel-title">' + L('发布', 'Publish') + '</h2></div>' +
      '<label class="field"><span class="field-label">' + L('标签', 'Tags') + '</span>' +
      '<input class="az-input" data-field="tags" value="' + esc(d.tags) + '" placeholder="' +
      L('用逗号分隔', 'Comma separated') + '"></label>' +
      '<label class="field"><span class="field-label">' + L('摘要', 'Excerpt') + '</span>' +
      '<textarea class="az-textarea small" data-field="excerpt" rows="3" placeholder="' +
      L('留空则自动截取', 'Auto-generated if empty') + '">' +
      esc(d.excerpt) + '</textarea></label>' +
      (state.isAdmin
        ? '<div class="flag-row">' +
          '<label class="check"><input type="checkbox" data-flag="pinned"' + (d.pinned ? ' checked' : '') + '>' +
          L('置顶', 'Pinned') + '</label>' +
          '<label class="check"><input type="checkbox" data-flag="featured"' + (d.featured ? ' checked' : '') + '>' +
          L('精选', 'Featured') + '</label>' +
          '</div>'
        : '') +
      '<div class="publish-actions">' +
      '<button class="az-confirm publish-button" data-action="publish"' +
      (state.saving || state.aiBusy || state.editingDeleted ? ' disabled' : '') + '>' +
      (state.aiBusy
        ? L('AI 生成中…', 'Generating…')
        : state.saving
        ? L('保存中…', 'Saving…')
        : state.editingDeleted
          ? L('文章在回收站', 'In trash')
          : editing
            ? L('保存修改', 'Save changes')
            : L('发布文章', 'Publish post')) + '</button>' +
      (editing
        ? '<a class="op" href="' + esc(rendererUrlFromMarkdown(d.content)) + '" target="_blank" rel="noopener">' +
          L('新标签页预览', 'Preview in new tab') + '</a>' +
          '<a class="op" href="' + hrefFor('index.html', '#/post/' + encodeURIComponent(state.editingSlug)) +
          '" target="_blank" rel="noopener">' + L('查看文章', 'View post') + '</a>'
        : '<button class="op" data-action="clear-draft">' + L('清空', 'Clear') + '</button>') +
      '</div>' +
      '<p class="hint">' +
      (editing
        ? L(
          '正在编辑 ' + esc(state.editingSlug) + (state.currentVersion ? ' · 第 ' + state.currentVersion + ' 版' : ''),
          'Editing ' + esc(state.editingSlug) + (state.currentVersion ? ' · v' + state.currentVersion : '')
        )
        : L('发布后立即出现在文章列表，并保存第一个版本。', 'Goes live immediately and saves version 1.')) +
      '</p>' +
      '</section>'
    );
  }

  function versionsPanel() {
    if (!state.editingSlug) return '';
    var labels = {
      create: L('创建', 'Created'),
      update: L('编辑', 'Edited'),
      delete: L('删除', 'Deleted'),
      restore: L('恢复', 'Restored')
    };
    var rows = state.versions.length
      ? state.versions
          .map(function (v) {
            var current = v.version === state.currentVersion;
            return (
              '<div class="version-row' + (current ? ' current' : '') + '">' +
              '<span class="version-label">#' + v.version + ' · ' + esc(labels[v.action] || v.action) + '</span>' +
              '<span class="version-time">' + esc(fmtShort(v.saved_at)) + '</span>' +
              '<span class="version-ops">' +
              '<button class="op" data-action="view-version" data-version="' + v.version + '">' +
              L('查看', 'View') + '</button>' +
              (current ? '' : '<button class="op" data-action="restore-version" data-version="' + v.version + '">' +
                L('恢复', 'Restore') + '</button>') +
              '</span></div>'
            );
          })
          .join('')
      : '<p class="hint">' + L('暂无版本记录。', 'No versions yet.') + '</p>';
    return (
      '<section class="panel glass side-panel versions-panel">' +
      '<div class="panel-head"><h2 class="panel-title">' + L('版本', 'Versions') + '</h2>' +
      '<span class="panel-note">' + versionCount(state.versions.length) + '</span></div>' +
      '<div class="version-list">' + rows + '</div>' +
      '</section>'
    );
  }

  function taxonomyPanel() {
    function rowsFor(kind, manageable) {
      var isAuthor = kind === 'author';
      var items = isAuthor ? state.authors : state.categories;
      if (!items.length) return '<p class="hint">' + L('暂无。', 'None.') + '</p>';
      return items
        .map(function (item) {
          return (
            '<div class="tax-row">' +
            '<button class="tax-name" data-action="tax-pick" data-kind="' + kind + '" data-name="' +
            esc(item.name) + '">' + esc(item.name) + '</button>' +
            '<span class="tax-count">' + Number(item.count || 0) + '</span>' +
            (isAuthor && manageable
              ? '<button class="op tax-token" data-action="rename-author" data-name="' + esc(item.name) + '">' +
                L('改名', 'Rename') + '</button>' +
                '<button class="op tax-token" data-action="issue-token" data-name="' + esc(item.name) + '">' +
                (item.has_token ? L('换令牌', 'New token') : L('发令牌', 'Token')) + '</button>' +
                (item.has_token
                  ? '<button class="op tax-token" data-action="revoke-token" data-name="' + esc(item.name) + '">' +
                    L('撤销', 'Revoke') + '</button>'
                  : '')
              : '') +
            (manageable
              ? '<button class="op tax-del" data-action="tax-delete" data-kind="' + kind + '" data-name="' +
                esc(item.name) + '" title="' + L('删除', 'Delete') + '">×</button>'
              : '') +
            '</div>'
          );
        })
        .join('');
    }

    function block(kind, manageable) {
      var isCat = kind === 'category';
      var label = isCat ? L('分类', 'Categories') : L('作者', 'Authors');
      var newLabel = isCat ? L('新分类', 'New category') : L('新作者', 'New author');
      return (
        '<div class="tax-block"><div class="tax-head"><span>' + label + '</span><span class="tax-hint">' +
        L('点击选用', 'Click to use') + '</span></div>' +
        '<div class="tax-list">' + rowsFor(kind, manageable) + '</div>' +
        (manageable
          ? '<div class="tax-add"><input id="tax-' + kind + '-input" class="az-input" placeholder="' + newLabel +
            '" aria-label="' + newLabel + '"><button class="az-button" data-action="tax-add" data-kind="' + kind + '">' +
            L('添加', 'Add') + '</button></div>'
          : '') +
        '</div>'
      );
    }

    if (!state.isAdmin) {
      return (
        '<section class="panel glass side-panel tax-panel">' +
        '<div class="panel-head"><h2 class="panel-title">' + L('分类', 'Categories') + '</h2></div>' +
        '<div class="tax-block"><div class="tax-head"><span></span><span class="tax-hint">' +
        L('点击选用', 'Click to use') + '</span></div>' +
        '<div class="tax-list">' + rowsFor('category', false) + '</div></div>' +
        '</section>'
      );
    }

    return (
      '<section class="panel glass side-panel tax-panel">' +
      '<div class="panel-head"><h2 class="panel-title">' + L('分类与作者', 'Categories & authors') + '</h2></div>' +
      block('category', true) +
      block('author', true) +
      '</section>'
    );
  }

  function statsPanel() {
    var active = state.adminPosts.filter(function (p) {
      return !p.deleted;
    }).length;
    var deleted = state.adminPosts.length - active;
    return (
      '<section class="panel glass mini-panel"><div class="panel-head"><h2 class="panel-title">' +
      L('统计', 'Stats') + '</h2></div>' +
      '<div class="stat-row"><span>' + L('在用', 'Active') + '</span><span class="stat-num">' + active + '</span></div>' +
      '<div class="stat-row"><span>' + L('回收站', 'Trash') + '</span><span class="stat-num">' + deleted + '</span></div>' +
      '<p class="hint">' +
      L('删除的文章保留全部历史版本，可随时恢复。', 'Deleted posts keep every version and can be restored at any time.') +
      '</p></section>'
    );
  }

  function manageHtml() {
    var activePosts = state.adminPosts.filter(function (post) { return !post.deleted; });
    var selectedCount = activePosts.filter(function (post) {
      return Boolean(state.selectedSlugs[post.slug]);
    }).length;
    var allSelected = activePosts.length > 0 && selectedCount === activePosts.length;
    var rows = state.adminPosts.length
      ? state.adminPosts
          .map(function (post) {
            var selectable = state.isAdmin && !post.deleted;
            var selected = selectable && Boolean(state.selectedSlugs[post.slug]);
            var ops = post.deleted
              ? '<button class="op" data-action="restore-post" data-slug="' + esc(post.slug) + '">' +
                L('恢复', 'Restore') + '</button>' +
                '<button class="op" data-action="view-versions" data-slug="' + esc(post.slug) + '">' +
                L('版本', 'Versions') + '</button>'
              : '<a class="op" href="' + hrefFor('index.html', '#/post/' + encodeURIComponent(post.slug)) +
                '" target="_blank" rel="noopener">' + L('查看', 'View') + '</a>' +
                '<button class="op" data-action="edit-post" data-slug="' + esc(post.slug) + '">' +
                L('编辑', 'Edit') + '</button>' +
                (state.isAdmin
                  ? '<button class="op" data-action="delete-post" data-slug="' + esc(post.slug) + '">' +
                    L('删除', 'Delete') + '</button>'
                  : '') +
                '<button class="op" data-action="view-versions" data-slug="' + esc(post.slug) + '">' +
                L('版本', 'Versions') + '</button>';
            return (
              '<div class="manage-row' + (post.deleted ? ' deleted' : '') + '">' +
              (selectable
                ? '<label class="check manage-select"><input type="checkbox" data-select-slug="' +
                  esc(post.slug) + '"' + (selected ? ' checked' : '') + ' aria-label="' +
                  L('选择文章', 'Select post') + '"></label>'
                : '') +
              '<div class="manage-main">' +
              '<div class="manage-title">' + esc(post.title) + postBadges(post) +
              (post.deleted ? '<span class="badge">' + L('回收站', 'Trash') + '</span>' : '') + '</div>' +
              '<div class="manage-meta">' + esc(fmtDate(post.created_at)) + ' · ' + esc(post.author) + ' · ' +
              esc(post.category) + ' · ' + L(Number(post.views || 0) + ' 次浏览',
                Number(post.views || 0) + ' views') + ' · ' +
              L('更新 ', 'updated ') + esc(fmtShort(post.updated_at)) + '</div>' +
              '</div>' +
              '<div class="manage-ops">' + ops + '</div>' +
              '</div>'
            );
          })
          .join('')
      : '<div class="empty-state"><p class="empty-text">' + L('还没有文章。', 'No posts yet.') + '</p>' +
        '<button class="az-button" data-action="admin-write">' +
        L('去写第一篇', 'Write the first post') + '</button></div>';

    return (
      '<div class="manage-list-head"><h2 class="panel-title">' +
      L(state.isAdmin ? '文章管理' : '我的文章', state.isAdmin ? 'Manage posts' : 'My posts') +
      '</h2><span class="panel-note">' + postCount(state.adminPosts.length) + '</span>' +
      (state.isAdmin
        ? '<div class="manage-tools">' +
          '<label class="check">' +
          '<input type="checkbox" data-select-all' + (allSelected ? ' checked' : '') + '>' +
          L('全选', 'All') + '</label>' +
          '<button class="op" data-action="export-selected">' + L('导出选中', 'Export selected') +
          ' (<span id="export-count">' + selectedCount + '</span>)</button>' +
          '<button class="op" data-action="export-all">' + L('导出全部', 'Export all') + '</button>' +
          '<button class="op" data-action="import-posts">' + L('导入', 'Import') + '</button>' +
          '<input id="import-input" type="file" accept="application/json,.json,application/zip,.zip" hidden>' +
          '</div>'
        : '') +
      '</div>' +
      '<div class="manage-list">' + rows + '</div>'
    );
  }

  function selectedSlugsList() {
    return Object.keys(state.selectedSlugs);
  }

  function updateExportCount() {
    var counter = document.getElementById('export-count');
    if (counter) counter.textContent = String(selectedSlugsList().length);
  }

  async function exportPosts(slugs) {
    try {
      setStatus(L('正在导出…', 'Exporting…'));
      var headers = { 'Content-Type': 'application/json' };
      if (state.token) headers.Authorization = 'Bearer ' + state.token;
      var response;
      try {
        response = await fetch(API + '/admin/export', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ format: 'zip', slugs: slugs }),
          cache: 'no-store'
        });
      } catch (e) {
        throw new ApiError(0, L('无法连接服务器，请检查网络', 'Cannot reach the server. Check your connection.'));
      }
      if (!response.ok) {
        var text = await response.text();
        var error = {};
        if (text) {
          try {
            error = JSON.parse(text);
          } catch (e) {
            error = {};
          }
        }
        throw new ApiError(response.status, translateServerError(error.error) ||
          L('导出失败（' + response.status + '）', 'Export failed (' + response.status + ')'));
      }
      var posts = Number(response.headers.get('X-Export-Posts') || 0);
      var images = Number(response.headers.get('X-Export-Images') || 0);
      var blob = await response.blob();
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      var stamp = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = 'az-presented-posts-' + (slugs.length ? 'selected-' : '') + stamp + '.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      setStatus(L('已导出 ' + posts + ' 篇文章、' + images + ' 张图片',
        'Exported ' + posts + ' post(s) and ' + images + ' image(s)'));
    } catch (e) {
      if (!authError(e)) setStatus(e.message, 'error');
    }
  }

  async function importArchiveFile(file) {
    if (!confirm(L(
      '导入这个压缩包？其中的文章和图片会被恢复，已存在的标识会自动跳过。',
      'Import this archive? Its posts and images will be restored; existing slugs are skipped.'
    ))) return;
    try {
      setStatus(L('正在导入…', 'Importing…'));
      var buffer = await file.arrayBuffer();
      var headers = { 'Content-Type': 'application/zip' };
      if (state.token) headers.Authorization = 'Bearer ' + state.token;
      var response;
      try {
        response = await fetch(API + '/admin/import-archive', {
          method: 'POST',
          headers: headers,
          body: buffer,
          cache: 'no-store'
        });
      } catch (e) {
        throw new ApiError(0, L('无法连接服务器，请检查网络', 'Cannot reach the server. Check your connection.'));
      }
      var text = await response.text();
      var data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = {};
        }
      }
      if (!response.ok) {
        throw new ApiError(response.status, translateServerError(data.error) ||
          L('导入失败（' + response.status + '）', 'Import failed (' + response.status + ')'));
      }
      var message = L('已导入 ' + data.imported + ' 篇', 'Imported ' + data.imported);
      if (data.images) message += L('、恢复 ' + data.images + ' 张图片', ' and ' + data.images + ' image(s)');
      if (data.skipped) message += L('，跳过 ' + data.skipped + ' 篇', ', skipped ' + data.skipped);
      if (data.errors && data.errors.length) {
        message += L('，失败 ' + data.errors.length + ' 篇（' + data.errors[0].error + '）',
          ', failed ' + data.errors.length + ' (' + data.errors[0].error + ')');
      }
      setStatus(message, data.errors && data.errors.length ? 'error' : '');
      await renderRoute();
    } catch (e) {
      if (!authError(e)) setStatus(e.message, 'error');
    }
  }

  async function importPostsFile(file) {
    if (/\.zip$/i.test(String(file.name || '')) || /zip/i.test(String(file.type || ''))) {
      await importArchiveFile(file);
      return;
    }
    var text;
    try {
      text = await file.text();
    } catch (e) {
      setStatus(L('无法读取文件', 'Cannot read the file'), 'error');
      return;
    }
    var data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      setStatus(L('JSON 格式无效', 'Invalid JSON'), 'error');
      return;
    }
    var posts = Array.isArray(data) ? data : (data && Array.isArray(data.posts) ? data.posts : null);
    if (!posts) {
      setStatus(L('文件中没有 posts 数组', 'No posts array in the file'), 'error');
      return;
    }
    if (!posts.length) {
      setStatus(L('文件中没有文章', 'The file has no posts'), 'error');
      return;
    }
    if (!confirm(L(
      '导入 ' + posts.length + ' 篇文章？已存在的标识会自动跳过。',
      'Import ' + posts.length + ' post(s)? Existing slugs will be skipped.'
    ))) return;
    try {
      setStatus(L('正在导入…', 'Importing…'));
      var result = await request('/admin/import', { method: 'POST', auth: true, body: { posts: posts } });
      var message = L('已导入 ' + result.imported + ' 篇', 'Imported ' + result.imported);
      if (result.skipped) message += L('，跳过 ' + result.skipped + ' 篇', ', skipped ' + result.skipped);
      if (result.errors && result.errors.length) {
        message += L('，失败 ' + result.errors.length + ' 篇（' + result.errors[0].error + '）',
          ', failed ' + result.errors.length + ' (' + result.errors[0].error + ')');
      }
      setStatus(message, result.errors && result.errors.length ? 'error' : '');
      await renderRoute();
    } catch (e) {
      if (!authError(e)) setStatus(e.message, 'error');
    }
  }

  async function renameAuthor(from, to) {
    try {
      var data = await request('/authors/' + encodeURIComponent(from) + '/rename', {
        method: 'POST',
        auth: true,
        body: { name: to }
      });
      if (state.draft.author === from) state.draft.author = data.name;
      if (from === AI_AUTHOR) {
        AI_AUTHOR = data.name;
        try {
          localStorage.setItem('abyss_default_author', data.name);
        } catch (e) {
          /* ignore */
        }
      }
      state.adminPosts.forEach(function (post) {
        if (post.author === from) post.author = data.name;
      });
      await loadTaxonomy(true);
      setStatus(L('已把作者「' + from + '」改名为「' + data.name + '」',
        'Renamed author "' + from + '" to "' + data.name + '"'));
      await renderRoute();
    } catch (e) {
      if (!authError(e)) setStatus(e.message, 'error');
    }
  }

  function formatBytes(bytes) {
    var n = Number(bytes || 0);
    if (n >= 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + ' MB';
    if (n >= 1024) return (n / 1024).toFixed(1) + ' KB';
    return n + ' B';
  }

  function logRowHtml(entry) {
    var status = Number(entry.status || 0);
    var tone = status >= 500 ? ' is-error' : status >= 400 ? ' is-warn' : '';
    var requestPath = String(entry.path || '') + (entry.query ? '?' + String(entry.query) : '');
    return (
      '<details class="log-row' + tone + '">' +
      '<summary>' +
      '<span class="log-status">' + esc(status) + '</span>' +
      '<span class="log-path">' + esc(entry.method || '') + ' ' + esc(requestPath) + '</span>' +
      '<span class="log-meta">' + esc(fmtDate(entry.time)) + ' · ' + esc(entry.duration_ms) + ' ms · ' +
      esc(entry.ip || '') + (entry.user ? ' · ' + esc(entry.user) : '') + '</span>' +
      '</summary>' +
      '<pre class="log-json">' + esc(JSON.stringify(entry, null, 2)) + '</pre>' +
      '</details>'
    );
  }

  function logsHtml() {
    var options = state.logsFiles.map(function (file) {
      return '<option value="' + esc(file.name) + '"' + (file.name === state.logFile ? ' selected' : '') + '>' +
        esc(file.name) + ' · ' + esc(formatBytes(file.size)) + '</option>';
    }).join('');
    var rows = state.logsEntries.length
      ? state.logsEntries.map(logRowHtml).join('')
      : '<div class="empty-state"><p class="empty-text">' + L('没有日志。', 'No log entries.') + '</p></div>';
    return (
      '<div class="manage-list-head"><h2 class="panel-title">' + L('日志', 'Logs') + '</h2>' +
      '<span class="panel-note">' + state.logsEntries.length + '</span>' +
      '<div class="manage-tools">' +
      (options
        ? '<select class="az-input log-file" data-log-file aria-label="' + L('日志文件', 'Log file') + '">' +
          options + '</select>'
        : '') +
      '<label class="check"><input type="checkbox" data-log-errors' +
      (state.logsErrorsOnly ? ' checked' : '') + '>' + L('只看错误', 'Errors only') + '</label>' +
      '<button class="op" data-action="logs-refresh">' + L('刷新', 'Refresh') + '</button>' +
      '</div></div>' +
      '<div class="log-list">' + rows + '</div>'
    );
  }

  async function loadLogs() {
    var query = '?limit=200';
    if (state.logFile) query += '&file=' + encodeURIComponent(state.logFile);
    if (state.logsErrorsOnly) query += '&errors=1';
    var data = await request('/admin/logs' + query, { auth: true });
    state.logsFiles = data.files || [];
    state.logFile = data.file || '';
    state.logsEntries = data.entries || [];
  }

  /* ---------- AI: DeepSeek ---------- */

  var aiModalEl = null;

  function closeAiModal() {
    if (aiModalEl) {
      aiModalEl.remove();
      aiModalEl = null;
    }
  }

  function openAiSettings() {
    closeAiModal();
    var savedKey = readAiKey();
    var wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML =
      '<section class="panel glass token-modal ai-modal" role="dialog" aria-modal="true">' +
      '<button class="token-close" data-ai-action="close" aria-label="' + L('关闭', 'Close') + '">X</button>' +
      '<h2 class="panel-title">' + L('DeepSeek API', 'DeepSeek API') + '</h2>' +
      '<p class="token-hint">' +
      L(
        'API Key 只保存在当前浏览器的 localStorage 中，调用时直接发送给 DeepSeek，不会上传到博客服务器。',
        'The API key is stored only in this browser’s localStorage and sent directly to DeepSeek. It is never uploaded to the blog server.'
      ) +
      '</p>' +
      '<label class="field"><span class="field-label">' + L('API Key', 'API key') + '</span>' +
      '<input id="ai-key-input" class="az-input" type="password" autocomplete="off" spellcheck="false" ' +
      'placeholder="sk-..." value="' + esc(savedKey) + '"></label>' +
      '<p class="token-hint">' +
      L(
        '发布时如果标题或分类留空，会用 deepseek-chat 自动生成。',
        'If the title or category is blank when publishing, deepseek-chat generates it automatically.'
      ) +
      '</p>' +
      '<div class="token-actions">' +
      '<button class="az-button" data-ai-action="save">' + L('保存', 'Save') + '</button>' +
      '<button class="az-button" data-ai-action="clear">' + L('清除', 'Clear') + '</button>' +
      '<button class="az-button" data-ai-action="close">' + L('关闭', 'Close') + '</button>' +
      '</div></section>';
    document.body.appendChild(wrap);
    aiModalEl = wrap;
    var input = wrap.querySelector('#ai-key-input');
    if (input) {
      input.focus();
      input.select();
    }
    wrap.addEventListener('click', function (event) {
      if (event.target === wrap) {
        closeAiModal();
        return;
      }
      var button = event.target.closest('[data-ai-action]');
      if (!button) return;
      var action = button.dataset.aiAction;
      if (action === 'close') {
        closeAiModal();
      } else if (action === 'save') {
        var value = input ? input.value.trim() : '';
        writeAiKey(value);
        closeAiModal();
        setStatus(value
          ? L('DeepSeek API Key 已保存在本地', 'DeepSeek API key saved locally')
          : L('已清除 DeepSeek API Key', 'DeepSeek API key cleared'));
      } else if (action === 'clear') {
        writeAiKey('');
        if (input) {
          input.value = '';
          input.focus();
        }
        setStatus(L('已清除 DeepSeek API Key', 'DeepSeek API key cleared'));
      }
    });
    if (input) {
      input.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        var save = wrap.querySelector('[data-ai-action="save"]');
        if (save) save.click();
      });
    }
  }

  function parseAiJson(text) {
    var raw = String(text || '').trim();
    var start = raw.indexOf('{');
    var end = raw.lastIndexOf('}');
    if (start === -1 || end <= start) return {};
    try {
      return JSON.parse(raw.slice(start, end + 1));
    } catch (e) {
      return {};
    }
  }

  function trimGenerated(value, max) {
    return String(value || '')
      .trim()
      .replace(/^["'“”「」《》]+|["'“”「」《》]+$/g, '')
      .slice(0, max);
  }

  async function generateWithDeepSeek(needTitle, needCategory) {
    var d = state.draft;
    var categories = state.categories.map(function (c) { return c.name; });
    var isAdmin = state.role === 'admin';
    var categoryRule;
    if (isAdmin) {
      categoryRule = categories.length
        ? '优先从这些已有分类中选择：' + categories.join('、') + '。都不合适时可以创建一个 2-8 字的新分类。'
        : '创建一个 2-8 字的新分类。';
    } else {
      categoryRule = '分类必须从这些已有分类中选择：' + (categories.join('、') || '（无）') + '。';
    }

    var system = [
      '你是中文博客编辑。阅读文章正文，生成简洁准确的标题和分类。',
      '标题不超过 30 个汉字，不要使用引号、书名号，也不要带句末标点。',
      categoryRule,
      '只输出 json，格式为 {"title":"标题","category":"分类"}，不要输出解释或 Markdown。'
    ].join('\n');

    var parts = [];
    if (needTitle) parts.push('请生成标题。');
    if (needCategory) parts.push('请生成分类。');
    if (d.title.trim()) parts.push('当前标题：' + d.title.trim());
    parts.push('正文：\n' + String(d.content || '').slice(0, 6000));

    var response;
    try {
      response = await fetch(DEEPSEEK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + readAiKey()
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: parts.join('\n\n') }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.6,
          max_tokens: 300,
          stream: false
        })
      });
    } catch (e) {
      throw new Error(L(
        '无法连接 DeepSeek，请检查网络或 API Key',
        'Cannot reach DeepSeek. Check your network or API key.'
      ));
    }

    var text = await response.text();
    var data = {};
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = {};
    }
    if (!response.ok) {
      var detail = data && data.error && data.error.message ? String(data.error.message) : '';
      if (response.status === 401) {
        throw new Error(L('DeepSeek API Key 无效', 'DeepSeek API key is invalid'));
      }
      if (response.status === 402) {
        throw new Error(L('DeepSeek 账户余额不足', 'DeepSeek account has insufficient balance'));
      }
      if (response.status === 429) {
        throw new Error(L('DeepSeek 请求过于频繁，请稍后再试', 'Too many DeepSeek requests. Try again later.'));
      }
      throw new Error(L(
        'DeepSeek 请求失败（' + response.status + '）' + (detail ? '：' + detail : ''),
        'DeepSeek request failed (' + response.status + ')' + (detail ? ': ' + detail : '')
      ));
    }

    var content = data && data.choices && data.choices[0] && data.choices[0].message
      ? String(data.choices[0].message.content || '')
      : '';
    var parsed = parseAiJson(content);
    var title = trimGenerated(parsed.title, 200);
    var category = trimGenerated(parsed.category, 60);

    if (needTitle && !title) {
      throw new Error(L(
        'AI 未能生成标题，请手动填写后重试',
        'AI could not generate a title. Enter one manually and try again.'
      ));
    }
    if (needCategory && !category) category = categories[0] || '未分类';
    if (!isAdmin && needCategory && categories.indexOf(category) === -1) {
      category = categories[0] || '未分类';
    }
    return { title: title, category: category };
  }

  /* ---------- admin actions ---------- */

  function updatePublishButton() {
    var btn = document.querySelector('.publish-button');
    if (!btn) return;
    btn.disabled = state.saving || state.aiBusy || state.editingDeleted;
    btn.textContent = state.aiBusy
      ? L('AI 生成中…', 'Generating…')
      : state.saving
        ? L('保存中…', 'Saving…')
        : state.editingDeleted
          ? L('文章在回收站', 'In trash')
          : state.editingSlug
            ? L('保存修改', 'Save changes')
            : L('发布文章', 'Publish post');
  }

  async function savePost() {
    if (state.saving || state.aiBusy) return;
    var d = state.draft;
    if (!d.content.trim()) {
      setStatus(L('正文不能为空', 'Body is required'), 'error');
      var contentInput = document.getElementById('content-editor');
      if (contentInput) contentInput.focus();
      return;
    }

    var needTitle = !d.title.trim();
    var needCategory = state.isAdmin && !d.category.trim();
    if (state.isAdmin && (needTitle || needCategory)) {
      if (!readAiKey()) {
        setStatus(L(
          '标题或分类为空时需要 AI 生成，请先在「AI 设置」中填写 DeepSeek API Key',
          'A blank title or category is generated by AI. Set your DeepSeek API key in AI settings first.'
        ), 'error');
        openAiSettings();
        return;
      }
      state.aiBusy = true;
      updatePublishButton();
      setStatus(L('正在用 DeepSeek 生成标题与分类…', 'Generating title and category with DeepSeek…'));
      try {
        var generated = await generateWithDeepSeek(needTitle, needCategory);
        if (needTitle) {
          d.title = generated.title;
          var titleInput = document.querySelector('[data-field="title"]');
          if (titleInput) titleInput.value = generated.title;
        }
        if (needCategory) {
          d.category = generated.category;
          var categoryInput = document.querySelector('[data-field="category"]');
          if (categoryInput) categoryInput.value = generated.category;
        }
      } catch (e) {
        state.aiBusy = false;
        updatePublishButton();
        setStatus(e.message, 'error');
        return;
      }
      state.aiBusy = false;
      updatePublishButton();
    }

    if (!d.title.trim()) {
      setStatus(L('标题不能为空', 'Title is required'), 'error');
      var emptyTitleInput = document.querySelector('[data-field="title"]');
      if (emptyTitleInput) emptyTitleInput.focus();
      return;
    }
    var payload = {
      title: d.title,
      author: d.author,
      category: d.category,
      tags: d.tags,
      excerpt: d.excerpt,
      content: d.content,
      pinned: Boolean(d.pinned),
      featured: Boolean(d.featured)
    };
    var created = fromLocalInput(d.created_at);
    if (created) payload.created_at = created;
    var editingSlug = state.editingSlug;
    if (!editingSlug && d.slug.trim()) payload.slug = d.slug.trim();

    state.saving = true;
    updatePublishButton();
    try {
      var data = editingSlug
        ? await request('/posts/' + encodeURIComponent(editingSlug), { method: 'PUT', body: payload, auth: true })
        : await request('/posts', { method: 'POST', body: payload, auth: true });
      state.saving = false;
      var post = data.post;
      if (!editingSlug) {
        state.editingSlug = post.slug;
        state.draft = postToDraft(post);
        setStatus(L('文章已发布', 'Post published'));
        location.hash = '#/admin/edit/' + encodeURIComponent(post.slug);
      } else {
        state.draft = postToDraft(post);
        setStatus(L('修改已保存，新版本已记录', 'Changes saved as a new version'));
        await renderRoute();
      }
    } catch (e) {
      state.saving = false;
      updatePublishButton();
      if (authError(e)) return;
      setStatus(e.message, 'error');
    }
  }

  async function deletePost(slug, redirect) {
    if (!confirm(L(
      '删除后文章会进入回收站，历史版本仍会保留。确定删除？',
      'The post will move to the trash; version history is kept. Delete it?'
    ))) return;
    try {
      await request('/posts/' + encodeURIComponent(slug), { method: 'DELETE', auth: true });
      setStatus(L('已移入回收站', 'Moved to trash'));
      if (state.editingSlug === slug) startNewDraft();
      if (redirect) location.hash = '#/';
      else await renderRoute();
    } catch (e) {
      if (!authError(e)) setStatus(e.message, 'error');
    }
  }

  async function restorePost(slug, goEdit) {
    try {
      await request('/posts/' + encodeURIComponent(slug) + '/restore', { method: 'POST', auth: true });
      setStatus(L('已从回收站恢复', 'Restored from trash'));
      if (goEdit) location.hash = '#/admin/edit/' + encodeURIComponent(slug);
      else await renderRoute();
    } catch (e) {
      if (!authError(e)) setStatus(e.message, 'error');
    }
  }

  async function restoreVersion(version) {
    if (!state.editingSlug) return;
    if (!confirm(L(
      '把文章恢复到第 ' + version + ' 版？当前内容会先保留为一个版本。',
      'Restore version #' + version + '? The current content is kept as a version first.'
    ))) return;
    try {
      var data = await request(
        '/posts/' + encodeURIComponent(state.editingSlug) + '/versions/' + version + '/restore',
        { method: 'POST', auth: true }
      );
      state.draft = postToDraft(data.post);
      state.editingSlug = data.post.slug;
      setStatus(L(
        '已恢复到第 ' + version + ' 版，并生成新版本',
        'Restored version #' + version + ' as a new version'
      ));
      await renderRoute();
    } catch (e) {
      if (!authError(e)) setStatus(e.message, 'error');
    }
  }

  async function viewVersion(version) {
    if (!state.editingSlug) return;
    var win = window.open('about:blank', '_blank');
    try {
      var data = await request(
        '/posts/' + encodeURIComponent(state.editingSlug) + '/versions/' + version,
        { auth: true }
      );
      var url = rendererUrlFromMarkdown(data.version.content);
      if (win) win.location.replace(url);
      else window.open(url, '_blank', 'noopener');
    } catch (e) {
      if (win) win.close();
      if (!authError(e)) setStatus(e.message, 'error');
    }
  }

  var tokenModalEl = null;

  function closeTokenModal() {
    if (tokenModalEl) {
      tokenModalEl.remove();
      tokenModalEl = null;
    }
  }

  function copyText(text, done) {
    function fallback() {
      var area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
      } catch (e) {
        /* ignore */
      }
      area.remove();
      done();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }
  }

  function showTokenModal(name, token) {
    closeTokenModal();
    var wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML =
      '<section class="panel glass token-modal" role="dialog" aria-modal="true">' +
      '<button class="token-close" data-token-action="close" aria-label="' + L('关闭', 'Close') + '">X</button>' +
      '<h2 class="panel-title">' + L('作者令牌', 'Author token') + '</h2>' +
      '<p class="token-name">' + esc(name) + '</p>' +
      '<p class="token-hint">' +
      L(
        '令牌只显示这一次。请立即复制并安全发送给该作者；重新生成后旧令牌会立即失效。',
        'This token is shown only once. Copy it now and send it securely; generating a new token invalidates the old one.'
      ) +
      '</p>' +
      '<input class="az-input token-value" readonly value="' + esc(token) + '">' +
      '<div class="token-actions">' +
      '<button class="az-button" data-token-action="copy">' + L('复制', 'Copy') + '</button>' +
      '<button class="az-button" data-token-action="close">' + L('关闭', 'Close') + '</button>' +
      '</div></section>';
    document.body.appendChild(wrap);
    tokenModalEl = wrap;
    var input = wrap.querySelector('.token-value');
    input.focus();
    input.select();
    wrap.addEventListener('click', function (event) {
      if (event.target === wrap) {
        closeTokenModal();
        return;
      }
      var button = event.target.closest('[data-token-action]');
      if (!button) return;
      if (button.dataset.tokenAction === 'close') {
        closeTokenModal();
      } else if (button.dataset.tokenAction === 'copy') {
        copyText(token, function () {
          button.textContent = L('已复制', 'Copied');
        });
      }
    });
  }

  async function issueToken(name) {
    if (!state.isAdmin) return;
    var author = state.authors.find(function (a) {
      return a.name === name;
    });
    if (author && author.has_token && !confirm(L(
      '重新生成令牌？旧令牌会立即失效。',
      'Generate a new token? The old token stops working immediately.'
    ))) return;
    try {
      var data = await request('/authors/' + encodeURIComponent(name) + '/token', {
        method: 'POST',
        auth: true
      });
      showTokenModal(name, data.token);
      await loadTaxonomy(true);
      await renderRoute();
    } catch (e) {
      if (!authError(e)) setStatus(e.message, 'error');
    }
  }

  async function revokeToken(name) {
    if (!state.isAdmin) return;
    if (!confirm(L(
      '撤销该作者的令牌？对方下次请求时会被登出。',
      'Revoke this author token? They will be signed out on their next request.'
    ))) return;
    try {
      await request('/authors/' + encodeURIComponent(name) + '/token', {
        method: 'DELETE',
        auth: true
      });
      await loadTaxonomy(true);
      setStatus(L('令牌已撤销', 'Token revoked'));
      await renderRoute();
    } catch (e) {
      if (!authError(e)) setStatus(e.message, 'error');
    }
  }

  async function addTaxonomy(kind) {
    var input = document.getElementById('tax-' + kind + '-input');
    var name = input ? input.value.trim() : '';
    if (!name) return;
    var path = kind === 'category' ? '/categories' : '/authors';
    try {
      await request(path, { method: 'POST', body: { name: name }, auth: true });
      if (kind === 'category' && !state.draft.category) state.draft.category = name;
      if (kind === 'author' && !state.draft.author) state.draft.author = name;
      await loadTaxonomy(true);
      setStatus(kind === 'category' ? L('已添加分类', 'Category added') : L('已添加作者', 'Author added'));
      await renderRoute();
    } catch (e) {
      if (!authError(e)) setStatus(e.message, 'error');
    }
  }

  async function deleteTaxonomy(kind, name) {
    var prompt = kind === 'category'
      ? L('删除分类「' + name + '」？', 'Delete category “' + name + '”?')
      : L('删除作者「' + name + '」？', 'Delete author “' + name + '”?');
    if (!confirm(prompt)) return;
    var path = kind === 'category' ? '/categories/' : '/authors/';
    try {
      await request(path + encodeURIComponent(name), { method: 'DELETE', auth: true });
      await loadTaxonomy(true);
      setStatus(L('已删除', 'Deleted'));
      await renderRoute();
    } catch (e) {
      if (!authError(e)) setStatus(e.message, 'error');
    }
  }

  function setEditorTab(tab) {
    state.previewMode = tab === 'preview';
    document.querySelectorAll('[data-action="editor-tab"]').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    var pane = document.getElementById('editor-pane');
    var preview = document.getElementById('editor-preview');
    if (!pane || !preview) return;
    pane.hidden = tab !== 'write';
    preview.hidden = tab !== 'preview';
    if (tab === 'preview') refreshPreview();
    else {
      var textarea = document.getElementById('content-editor');
      if (textarea) textarea.focus();
    }
  }

  function refreshPreview() {
    if (!state.previewMode) return;
    var box = document.getElementById('editor-preview');
    if (!box) return;
    var frame = box.querySelector('iframe');
    if (!frame) {
      frame = document.createElement('iframe');
      frame.className = 'reader-frame';
      frame.title = L('Markdown 预览', 'Markdown preview');
      frame.setAttribute('referrerpolicy', 'no-referrer');
      box.appendChild(frame);
    }
    frame.src = rendererUrlFromMarkdown(state.draft.content);
  }

  function schedulePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(refreshPreview, 700);
  }

  function insertMarkdown(kind) {
    var textarea = document.getElementById('content-editor');
    if (!textarea) return;
    var snippets = {
      heading: { prefix: '## ', suffix: '' },
      bold: { prefix: '**', suffix: '**' },
      italic: { prefix: '*', suffix: '*' },
      code: { prefix: '`', suffix: '`' },
      math: { prefix: '$', suffix: '$' },
      mathblock: { prefix: '\n$$\n', suffix: '\n$$\n' },
      link: { prefix: '[', suffix: '](https://)' },
      quote: { prefix: '> ', suffix: '' },
      list: { prefix: '- ', suffix: '' },
      codeblock: { prefix: '\n```\n', suffix: '\n```\n' }
    };
    var snippet = snippets[kind];
    if (!snippet) return;
    var start = textarea.selectionStart;
    var end = textarea.selectionEnd;
    var value = textarea.value;
    var selected = value.slice(start, end);
    var insert = snippet.prefix + selected + snippet.suffix;
    textarea.value = value.slice(0, start) + insert + value.slice(end);
    var caret = selected ? start + insert.length : start + snippet.prefix.length;
    textarea.setSelectionRange(caret, caret);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.focus();
  }

  function insertTextIntoEditor(text, anchor) {
    var textarea = document.getElementById('content-editor');
    if (!textarea) return;
    var start = anchor ? anchor.start : textarea.selectionStart;
    var end = anchor ? anchor.end : textarea.selectionEnd;
    var value = textarea.value;
    var before = value.slice(0, start);
    var after = value.slice(end);
    var prefix = before && !/\n\s*$/.test(before) ? '\n\n' : '';
    var suffix = after && !/^\s*\n/.test(after) ? '\n\n' : '';
    var insert = prefix + text + suffix;
    textarea.value = before + insert + after;
    var caret = start + insert.length;
    textarea.setSelectionRange(caret, caret);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.focus();
  }

  async function uploadImageFile(file) {
    var headers = { 'Content-Type': file.type || 'application/octet-stream' };
    if (state.token) headers.Authorization = 'Bearer ' + state.token;
    var response;
    try {
      response = await fetch(API + '/uploads', {
        method: 'POST',
        headers: headers,
        body: file,
        cache: 'no-store'
      });
    } catch (e) {
      throw new ApiError(0, L('无法连接服务器，请检查网络', 'Cannot reach the server. Check your connection.'));
    }
    var text = await response.text();
    var data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = {};
      }
    }
    if (!response.ok) {
      throw new ApiError(response.status, translateServerError(data.error) ||
        L('图片上传失败（' + response.status + '）', 'Image upload failed (' + response.status + ')'));
    }
    return data;
  }

  async function uploadImages(files, anchor) {
    var list = Array.prototype.slice.call(files || []);
    if (!list.length) return;
    if (!state.token) {
      setStatus(L('请先登录再上传图片', 'Sign in before uploading images'), 'error');
      return;
    }
    var markdown = [];
    for (var i = 0; i < list.length; i++) {
      var file = list[i];
      var isImage = file.type
        ? /^image\/(png|jpe?g|gif|webp)$/.test(file.type)
        : /\.(png|jpe?g|gif|webp)$/i.test(file.name || '');
      if (!isImage) {
        setStatus(L('仅支持 PNG、JPEG、GIF、WebP 图片', 'Only PNG, JPEG, GIF and WebP images are supported'), 'error');
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setStatus(L('单张图片不能超过 10MB', 'Each image must be 10MB or smaller'), 'error');
        return;
      }
      setStatus(L('图片上传中…（' + (i + 1) + '/' + list.length + '）',
        'Uploading image ' + (i + 1) + '/' + list.length + '…'));
      var data = await uploadImageFile(file);
      var alt = String(file.name || 'image').replace(/\.[^.]+$/, '').replace(/[[\]]/g, '').trim() || 'image';
      markdown.push('![' + alt + '](' + API + '/uploads/' + data.name + ')');
    }
    insertTextIntoEditor(markdown.join('\n'), anchor);
    setStatus(L('已插入 ' + markdown.length + ' 张图片', 'Inserted ' + markdown.length + ' image(s)'));
  }

  function updateCharCount() {
    var counter = document.getElementById('char-count');
    if (counter) {
      counter.textContent = L(
        state.draft.content.length + ' 字',
        state.draft.content.length + ' chars'
      );
    }
  }

  /* ---------- events ---------- */

  view.addEventListener('click', function (event) {
    var target = event.target.closest('[data-action]');
    if (!target) return;
    var action = target.dataset.action;
    var slug = target.dataset.slug;

    switch (action) {
      case 'retry-route':
        renderRoute();
        break;
      case 'filter-category':
        state.category = target.dataset.category || '';
        if (state.route && state.route.name === 'home') renderRoute();
        else location.hash = '#/';
        break;
      case 'tag-search':
        state.query = target.dataset.tag || '';
        state.category = '';
        searchInput.value = state.query;
        if (state.route && state.route.name === 'home') renderRoute();
        else location.hash = '#/';
        break;
      case 'edit-post':
        if (slug) location.hash = '#/admin/edit/' + encodeURIComponent(slug);
        break;
      case 'view-versions':
        if (slug) location.hash = '#/admin/edit/' + encodeURIComponent(slug);
        break;
      case 'delete-post':
        if (slug) deletePost(slug, !(state.route && state.route.name === 'admin'));
        break;
      case 'restore-post':
        if (slug) restorePost(slug, false);
        break;
      case 'logout':
        clearToken();
        startNewDraft();
        state.adminTab = 'write';
        setStatus(L('已退出管理', 'Signed out'));
        resetAdminRoute();
        break;
      case 'admin-write':
        state.adminTab = 'write';
        renderRoute();
        break;
      case 'new-post':
        startNewPost();
        break;
      case 'ai-settings':
        openAiSettings();
        break;
      case 'admin-manage':
        state.adminTab = 'manage';
        if (state.route && state.route.edit) location.hash = '#/admin';
        else renderRoute();
        break;
      case 'admin-logs':
        if (!state.isAdmin) break;
        state.adminTab = 'logs';
        renderRoute();
        break;
      case 'logs-refresh':
        renderRoute();
        break;
      case 'export-all':
        exportPosts([]);
        break;
      case 'export-selected': {
        var slugs = selectedSlugsList();
        if (!slugs.length) {
          setStatus(L('请先选择要导出的文章', 'Select posts to export first'), 'error');
          break;
        }
        exportPosts(slugs);
        break;
      }
      case 'import-posts': {
        var importInput = document.getElementById('import-input');
        if (importInput) importInput.click();
        break;
      }
      case 'rename-author': {
        var authorFrom = target.dataset.name || '';
        var authorTo = window.prompt(L('新的作者名', 'New author name'), authorFrom);
        if (authorTo === null) break;
        authorTo = authorTo.trim();
        if (!authorTo || authorTo === authorFrom) break;
        renameAuthor(authorFrom, authorTo);
        break;
      }
      case 'clear-draft':
        if (confirm(L('清空当前草稿？', 'Clear the current draft?'))) {
          startNewDraft();
          renderRoute();
        }
        break;
      case 'publish':
        savePost();
        break;
      case 'editor-tab':
        setEditorTab(target.dataset.tab || 'write');
        break;
      case 'md-insert':
        insertMarkdown(target.dataset.kind);
        break;
      case 'md-image': {
        var editor = document.getElementById('content-editor');
        var picker = document.getElementById('image-input');
        if (!editor || !picker) break;
        if (!state.token) {
          setStatus(L('请先登录再上传图片', 'Sign in before uploading images'), 'error');
          break;
        }
        imageAnchor = { start: editor.selectionStart, end: editor.selectionEnd };
        picker.click();
        break;
      }
      case 'view-version':
        viewVersion(Number(target.dataset.version));
        break;
      case 'restore-version':
        restoreVersion(Number(target.dataset.version));
        break;
      case 'tax-add':
        addTaxonomy(target.dataset.kind);
        break;
      case 'tax-delete':
        deleteTaxonomy(target.dataset.kind, target.dataset.name);
        break;
      case 'issue-token':
        issueToken(target.dataset.name);
        break;
      case 'revoke-token':
        revokeToken(target.dataset.name);
        break;
      case 'tax-pick': {
        var kind = target.dataset.kind;
        var name = target.dataset.name || '';
        var field = kind === 'category' ? 'category' : 'author';
        state.draft[field] = name;
        var input = document.querySelector('[data-field="' + field + '"]');
        if (input) input.value = name;
        setStatus(kind === 'category'
          ? L('已选用分类：' + name, 'Category: ' + name)
          : L('已选用作者：' + name, 'Author: ' + name));
        break;
      }
      default:
        break;
    }
  });

  view.addEventListener('input', function (event) {
    var target = event.target;
    if (!target.dataset) return;
    if (target.dataset.flag) {
      state.draft[target.dataset.flag] = Boolean(target.checked);
      return;
    }
    if (!target.dataset.field) return;
    var field = target.dataset.field;
    state.draft[field] = target.value;
    if (field === 'content') {
      updateCharCount();
      if (state.previewMode) schedulePreview();
    }
  });

  function reportUploadError(err) {
    setStatus((err && err.message) || L('图片上传失败', 'Image upload failed'), 'error');
  }

  view.addEventListener('change', function (event) {
    var target = event.target;
    if (!target) return;

    if (target.id === 'image-input') {
      var files = Array.prototype.slice.call(target.files || []);
      var anchor = imageAnchor;
      imageAnchor = null;
      target.value = '';
      uploadImages(files, anchor).catch(reportUploadError);
      return;
    }

    if (target.id === 'import-input') {
      var importFile = target.files && target.files[0];
      target.value = '';
      if (importFile) importPostsFile(importFile);
      return;
    }

    if (target.dataset && target.dataset.selectAll !== undefined) {
      if (target.checked) {
        state.adminPosts.forEach(function (post) {
          if (!post.deleted) state.selectedSlugs[post.slug] = true;
        });
      } else {
        state.selectedSlugs = {};
      }
      Array.prototype.forEach.call(document.querySelectorAll('[data-select-slug]'), function (input) {
        input.checked = Boolean(state.selectedSlugs[input.dataset.selectSlug]);
      });
      updateExportCount();
      return;
    }

    if (target.dataset && target.dataset.selectSlug) {
      if (target.checked) state.selectedSlugs[target.dataset.selectSlug] = true;
      else delete state.selectedSlugs[target.dataset.selectSlug];
      updateExportCount();
      return;
    }

    if (target.dataset && target.dataset.logFile !== undefined) {
      state.logFile = target.value;
      renderRoute();
      return;
    }

    if (target.dataset && target.dataset.logErrors !== undefined) {
      state.logsErrorsOnly = Boolean(target.checked);
      renderRoute();
    }
  });

  view.addEventListener('paste', function (event) {
    var target = event.target;
    if (!target || target.id !== 'content-editor' || !event.clipboardData) return;
    var items = event.clipboardData.items || [];
    var files = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].kind !== 'file' || !/^image\//.test(items[i].type)) continue;
      var file = items[i].getAsFile();
      if (file) files.push(file);
    }
    if (!files.length) return;
    event.preventDefault();
    uploadImages(files, null).catch(reportUploadError);
  });

  view.addEventListener('dragover', function (event) {
    if (event.target && event.target.id === 'content-editor') event.preventDefault();
  });

  view.addEventListener('drop', function (event) {
    var target = event.target;
    if (!target || target.id !== 'content-editor' || !event.dataTransfer) return;
    var files = Array.prototype.slice.call(event.dataTransfer.files || [])
      .filter(function (file) { return /^image\//.test(file.type); });
    if (!files.length) return;
    event.preventDefault();
    uploadImages(files, null).catch(reportUploadError);
  });

  view.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter') return;
    if (event.target.id === 'tax-category-input') {
      event.preventDefault();
      addTaxonomy('category');
    } else if (event.target.id === 'tax-author-input') {
      event.preventDefault();
      addTaxonomy('author');
    }
  });

  view.addEventListener('submit', async function (event) {
    if (event.target.id !== 'login-form') return;
    event.preventDefault();
    var input = document.getElementById('token-input');
    var token = input ? input.value.trim() : '';
    if (!token) {
      setStatus(L('请输入管理员令牌', 'Enter the admin token'), 'error');
      return;
    }
    var button = event.target.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    try {
      var auth = await request('/auth', { method: 'POST', body: { token: token } });
      setToken(token);
      applyIdentity(auth);
      setStatus(auth.role === 'admin'
        ? L('已进入管理台', 'Signed in as admin')
        : L('已以作者身份登录：' + auth.name, 'Signed in as author: ' + auth.name));
      renderRoute();
    } catch (e) {
      if (button) button.disabled = false;
      setStatus(e.status === 429 ? e.message : L('令牌无效', 'Invalid token'), 'error');
      renderLogin(e.message);
    }
  });

  langToggle.addEventListener('click', function () {
    setLang(lang === 'en' ? 'zh' : 'en');
  });

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  if (window.matchMedia) {
    var schemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    var followSystemTheme = function () {
      var saved = '';
      try {
        saved = localStorage.getItem(THEME_KEY) || '';
      } catch (e) {
        /* ignore */
      }
      if (saved !== 'dark' && saved !== 'light') {
        applyTheme(schemeQuery.matches ? 'dark' : 'light', false);
      }
    };
    if (schemeQuery.addEventListener) schemeQuery.addEventListener('change', followSystemTheme);
    else if (schemeQuery.addListener) schemeQuery.addListener(followSystemTheme);
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      state.query = searchInput.value.trim();
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        if (state.route && state.route.name === 'home') renderRoute();
        else location.hash = '#/';
      }, 280);
    });
  }

  window.addEventListener('hashchange', renderRoute);

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeTokenModal();
      closeAiModal();
    }
  });

  async function init() {
    if (PAGE === 'public') state.token = '';
    applyTheme(readTheme(), false);
    applyStaticLang();
    if (searchInput) searchInput.value = state.query;
    if (PAGE === 'admin' && state.token) await verifyToken();
    updateTopbar();
    setDefaultStatus();
    await renderRoute();
  }

  init();
})();
