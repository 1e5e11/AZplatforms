/* =========================================================
   啊这AI · AZAI
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BLOG = 'https://ssssssss.eu.org/AZpresented/index.html#/';
  var POSTS_API = 'https://abyss.realgeneral.eu.org/api/posts?limit=6';

  /* ---------- 背景 / 导航状态 ---------- */
  var rail = document.getElementById('rail');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id], footer[id]'));
  var bgs = {};
  document.querySelectorAll('.bg[data-bg]').forEach(function (el) {
    bgs[el.dataset.bg] = el;
  });
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-target]'));

  var currentId = 'top';

  function setActive(id) {
    if (!id || id === currentId) return;
    currentId = id;

    // 页脚属于“联系我们”的延续，沿用它的背景与导航状态
    var mapped = id === 'footer' ? 'contact' : id;

    Object.keys(bgs).forEach(function (key) {
      bgs[key].classList.toggle('is-active', key === mapped);
    });

    var tone = 'light';
    var section = document.getElementById(id);
    if (section) tone = section.dataset.tone || 'light';
    rail.dataset.tone = tone;

    navLinks.forEach(function (link) {
      var on = link.dataset.target === mapped;
      link.classList.toggle('is-active', on);
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -49% 0px', threshold: 0 });

    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- 首屏滚动视差 ---------- */
  var hero = document.querySelector('.hero');
  var ticking = false;

  function onScroll() {
    if (reduceMotion || !hero) return;
    var h = hero.offsetHeight || window.innerHeight;
    var p = Math.min(1, Math.max(0, window.scrollY / (h * 0.85)));
    hero.style.setProperty('--p', p.toFixed(4));
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      onScroll();
      ticking = false;
    });
  }, { passive: true });

  onScroll();

  /* ---------- 入场动画 ---------- */
  var reveals = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- 数字滚动 ---------- */
  var counters = document.querySelectorAll('[data-count]');

  function runCounter(el) {
    var target = parseInt(el.dataset.count, 10);
    var pad = parseInt(el.dataset.pad, 10) || 0;

    if (reduceMotion || isNaN(target)) {
      el.textContent = String(isNaN(target) ? el.textContent : target).padStart(pad, '0');
      return;
    }

    var duration = 1300;
    var start = null;

    function step(now) {
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased)).padStart(pad, '0');
      if (t < 1) window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- 移动端菜单 ---------- */
  var burger = document.getElementById('burger');
  var mobileNav = document.getElementById('mobile-nav');
  var lastFocus = null;

  function setMenu(open) {
    if (!burger || !mobileNav) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    mobileNav.classList.toggle('is-open', open);
    rail.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';

    if (open) {
      lastFocus = document.activeElement;
      var first = mobileNav.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    } else if (lastFocus && lastFocus.focus) {
      lastFocus.focus({ preventScroll: true });
    }
  }

  if (burger) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
  }

  if (mobileNav) {
    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('is-open')) {
      setMenu(false);
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 900 && mobileNav && mobileNav.classList.contains('is-open')) {
      setMenu(false);
    }
  });

  /* ---------- 最新资讯：运行时读取博客 ----------
     页面里的三张卡片是静态兜底，接口成功时用最新文章替换 */
  var postsEl = document.querySelector('.posts');

  function formatDate(iso) {
    if (!iso) return '';
    var d = String(iso).slice(0, 10).split('-');
    return d.length === 3 ? d[0] + '.' + d[1] + '.' + d[2] : '';
  }

  // 博客摘要里常带「用户：… 助手：…」的问答痕迹和 LaTeX 行内公式
  function cleanExcerpt(text) {
    if (!text) return '';
    var t = String(text);
    var qa = t.indexOf('助手：');
    if (qa >= 0) t = t.slice(qa + 3);

    return t
      .replace(/\\left|\\right/g, '')
      .replace(/\^?\\circ/g, '°')
      .replace(/\\times/g, '×')
      .replace(/\\cdot/g, '·')
      .replace(/\\leq?/g, '≤')
      .replace(/\\geq?/g, '≥')
      .replace(/\${1,2}/g, '')
      .replace(/\\[a-zA-Z]+/g, '')
      .replace(/[{}]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function arrowIcon() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#i-arrow');
    svg.appendChild(use);
    svg.setAttribute('aria-hidden', 'true');
    return svg;
  }

  function renderPosts(list) {
    if (!postsEl) return;
    postsEl.textContent = '';

    list.slice(0, 3).forEach(function (post) {
      var a = document.createElement('a');
      a.className = 'post';
      a.href = BLOG + 'post/' + encodeURIComponent(post.slug);
      a.target = '_blank';
      a.rel = 'noopener';

      var meta = document.createElement('div');
      meta.className = 'post__meta';

      var cat = document.createElement('span');
      cat.className = 'post__cat';
      cat.textContent = post.category || '随笔';

      var time = document.createElement('time');
      time.dateTime = String(post.created_at || '').slice(0, 10);
      time.textContent = formatDate(post.created_at);

      meta.appendChild(cat);
      meta.appendChild(time);

      var title = document.createElement('h3');
      title.className = 'post__title';
      title.textContent = post.title || '无标题';

      var excerpt = document.createElement('p');
      excerpt.className = 'post__excerpt';
      excerpt.textContent = cleanExcerpt(post.excerpt);

      var foot = document.createElement('div');
      foot.className = 'post__foot';

      var mins = document.createElement('span');
      mins.textContent = post.reading_minutes ? post.reading_minutes + ' 分钟阅读' : '阅读全文';

      foot.appendChild(mins);
      foot.appendChild(arrowIcon());

      a.appendChild(meta);
      a.appendChild(title);
      a.appendChild(excerpt);
      a.appendChild(foot);
      postsEl.appendChild(a);
    });
  }

  function loadPosts() {
    if (!postsEl || !('fetch' in window)) return;

    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 8000);

    fetch(POSTS_API, { signal: controller.signal })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var list = (data && data.posts ? data.posts : [])
          .filter(function (p) { return p && !p.deleted; })
          .sort(function (a, b) {
            return String(b.created_at).localeCompare(String(a.created_at));
          });

        if (list.length) renderPosts(list);
      })
      .catch(function () {
        if (postsEl) postsEl.classList.add('is-error');
      })
      .finally(function () {
        clearTimeout(timer);
      });
  }

  loadPosts();

  /* ---------- 订阅表单 ---------- */
  var form = document.getElementById('subscribe');
  var note = document.getElementById('subscribe-note');

  if (form && note) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var value = input ? input.value.trim() : '';

      if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        note.textContent = '请输入有效的电子邮箱地址。';
        if (input) input.focus();
        return;
      }

      note.textContent = '订阅通道正在接入。在此之前，欢迎直接访问 AZ presented 博客获取最新内容。';
      var link = document.createElement('a');
      link.href = BLOG;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = '前往博客';
      note.appendChild(document.createTextNode(' '));
      note.appendChild(link);
      form.reset();
    });
  }
})();
