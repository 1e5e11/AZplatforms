/* 墨页 Markdown 显示引擎。浏览器端依赖 marked、DOMPurify、highlight.js 与 KaTeX。 */
((global) => {
  'use strict';

  const CODE_ALIASES = { 'c++':'cpp', cxx:'cpp', cc:'cpp', py:'python', js:'javascript', html:'xml', htm:'xml', md:'markdown', ts:'typescript', sh:'bash', text:'plaintext', txt:'plaintext' };
  const DATA_IMAGE = /^data:image\/(?:png|jpeg|gif|webp|avif|bmp|x-icon|svg\+xml);base64,[a-z0-9+/]+={0,2}$/i;

  function escapeHTML(text) {
    return text.replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[character]);
  }

  function mathToken(type, raw, text, displayMode) {
    return { type, raw, text: text.trim(), displayMode };
  }

  function mathHTMLToken(raw, text, displayMode) {
    const tag = displayMode ? 'div' : 'span';
    return { type:'html', raw, text:`<${tag} data-md-math="${displayMode ? 'display' : 'inline'}">${escapeHTML(text.trim())}</${tag}>`, block:displayMode };
  }

  function installMathExtension() {
    if (global.__moyeMathExtensionInstalled) return;
    global.__moyeMathExtensionInstalled = true;
    marked.use({ extensions: [
      {
        name:'displayMathDollar', level:'block', start:source => source.indexOf('$$'),
        tokenizer(source) { const match = /^\$\$[ \t]*([\s\S]*?)[ \t]*\$\$(?:\n|$)/.exec(source); if (match && match[1].trim()) return mathToken('displayMathDollar', match[0], match[1], true); },
        renderer:token => `<div data-md-math="display">${escapeHTML(token.text)}</div>`
      },
      {
        name:'displayMathBracket', level:'block', start:source => source.indexOf('\\['),
        tokenizer(source) { const match = /^\\\[[ \t]*([\s\S]*?)[ \t]*\\\](?:\n|$)/.exec(source); if (match && match[1].trim()) return mathToken('displayMathBracket', match[0], match[1], true); },
        renderer:token => `<div data-md-math="display">${escapeHTML(token.text)}</div>`
      },
      {
        name:'inlineMathDollar', level:'inline', start:source => source.indexOf('$'),
        tokenizer(source) { const match = /^\$(?!\$)(?!\s)((?:\\.|[^$\\\n])+?)(?<!\s)\$(?!\$)/.exec(source); if (match) return mathToken('inlineMathDollar', match[0], match[1], false); },
        renderer:token => `<span data-md-math="inline">${escapeHTML(token.text)}</span>`
      },
      {
        name:'inlineMathParen', level:'inline', start:source => source.indexOf('\\('),
        tokenizer(source) { const match = /^\\\((.+?)\\\)/.exec(source); if (match && !match[1].includes('\n')) return mathToken('inlineMathParen', match[0], match[1], false); },
        renderer:token => `<span data-md-math="inline">${escapeHTML(token.text)}</span>`
      }
    ] });
  }

  function prepareMathTokens(tokens) {
    const inlineTokens = text => {
      const lexer = new marked.Lexer();
      lexer.tokens.links = tokens.links;
      return lexer.inlineTokens(text);
    };
    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index];
      if (token.type !== 'paragraph') continue;
      const dollar = /^\$\$[ \t]*([\s\S]*?)[ \t]*\$\$\s*$/.exec(token.raw);
      const bracket = /^\\\[[ \t]*([\s\S]*?)[ \t]*\\\]\s*$/.exec(token.raw);
      if (dollar?.[1].trim()) tokens[index] = mathHTMLToken(token.raw, dollar[1], true);
      else if (bracket?.[1].trim()) tokens[index] = mathHTMLToken(token.raw, bracket[1], true);
    }
    marked.walkTokens(tokens, token => {
      if (['paragraph','heading'].includes(token.type) && typeof token.text === 'string' && Array.isArray(token.tokens)) token.tokens = inlineTokens(token.text);
      if (token.type === 'table') for (const cell of [...token.header, ...token.rows.flat()]) cell.tokens = inlineTokens(cell.text);
    });
    const convert = collection => collection.map(token => {
      if (token.type === 'inlineMathDollar' || token.type === 'inlineMathParen') return mathHTMLToken(token.raw, token.text, false);
      if (Array.isArray(token.tokens)) token.tokens = convert(token.tokens);
      if (token.type === 'table') for (const cell of [...token.header, ...token.rows.flat()]) cell.tokens = convert(cell.tokens);
      return token;
    });
    tokens.splice(0, tokens.length, ...convert(tokens));
  }

  function sanitize(html) {
    return DOMPurify.sanitize(html, {
      USE_PROFILES:{ html:true },
      FORBID_TAGS:['style','form','button','iframe','object','embed','video','audio'],
      FORBID_ATTR:['style','id','name','srcset','autofocus','tabindex','hidden'],
      ALLOW_DATA_ATTR:false,
      ADD_ATTR:['data-md-math']
    });
  }

  function renderMath(root) {
    for (const placeholder of root.querySelectorAll('[data-md-math]')) {
      const displayMode = placeholder.dataset.mdMath === 'display';
      const wrapper = document.createElement(displayMode ? 'div' : 'span');
      wrapper.className = displayMode ? 'math-display' : 'math-inline';
      katex.render(placeholder.textContent, wrapper, { displayMode, throwOnError:false, strict:'ignore', trust:false, output:'htmlAndMathml', errorColor:'#7c0a21' });
      placeholder.replaceWith(wrapper);
    }
  }

  class MoyeMarkdownEngine {
    constructor(options = {}) {
      if (!global.marked || !global.DOMPurify || !global.hljs || !global.katex) throw new Error('Markdown 显示引擎缺少 marked、DOMPurify、highlight.js 或 KaTeX。');
      this.baseURL = options.baseURL || global.location?.href || 'http://localhost/';
      this.images = options.images || new Map();
      this.pages = [];
      this.headings = [];
      installMathExtension();
    }

    parse(markdown, options = {}) {
      const baseURL = options.baseURL || this.baseURL;
      const images = options.images || this.images;
      const tokens = marked.lexer(markdown);
      prepareMathTokens(tokens);
      const groups = [[]];
      for (const token of tokens) {
        const match = token.type === 'html' && /^<!-- md:(page|toc|nav) -->\s*$/.exec(token.raw);
        if (match?.[1] === 'page') groups.push([]);
        else if (match) groups.at(-1).push({ directive:match[1] });
        else groups.at(-1).push(token);
      }

      const headings = [];
      const slugs = new Set();
      const pages = groups.map((group, pageIndex) => {
        const article = document.createElement('section');
        article.className = 'document-page';
        let batch = [];
        const flush = () => {
          if (!batch.length) return;
          batch.links = tokens.links;
          const template = document.createElement('template');
          template.innerHTML = sanitize(marked.parser(batch));
          for (const element of template.content.querySelectorAll('[class]')) {
            const language = element.tagName === 'CODE' && element.parentElement?.tagName === 'PRE' && /^language-([\w+-]+)$/.exec(element.className);
            element.removeAttribute('class');
            if (language) element.dataset.language = language[1].toLowerCase();
          }
          renderMath(template.content);
          article.append(template.content);
          batch = [];
        };
        for (const token of group) {
          if (token.directive) {
            flush();
            const slot = document.createElement('div');
            slot.dataset.directive = token.directive;
            article.append(slot);
          } else batch.push(token);
        }
        flush();

        for (const node of article.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
          const stem = node.textContent.trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s+/g, '-') || 'section';
          let slug = stem, suffix = 2;
          while (slugs.has(slug)) slug = `${stem}-${suffix++}`;
          slugs.add(slug);
          node.id = `md-heading-${slug}`;
          headings.push({ id:slug, text:node.textContent, level:Number(node.tagName[1]), page:pageIndex + 1 });
        }

        for (const node of article.querySelectorAll('[href],[src]')) {
          const attr = node.hasAttribute('href') ? 'href' : 'src';
          const value = node.getAttribute(attr);
          if (attr === 'href' && value.startsWith('#')) continue;
          try {
            const url = new URL(attr === 'src' ? value.replace(/\\/g, '/') : value, baseURL);
            let localImage = node.tagName === 'IMG' && images.get(url.href);
            if (!localImage && node.tagName === 'IMG' && !/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(value)) {
              const filename = url.pathname.split('/').pop();
              const matches = [...images].filter(([key]) => new URL(key, baseURL).pathname.split('/').pop() === filename);
              if (matches.length === 1) localImage = matches[0][1];
            }
            if (localImage && DATA_IMAGE.test(localImage)) node.setAttribute(attr, localImage);
            else if (node.tagName === 'IMG' && DATA_IMAGE.test(value)) node.setAttribute(attr, value);
            else if (!['https:','http:', ...(attr === 'href' ? ['mailto:','tel:'] : [])].includes(url.protocol)) node.removeAttribute(attr);
            else node.setAttribute(attr, url.href);
          } catch { node.removeAttribute(attr); }
          if (node.tagName === 'A') {
            node.rel = 'noopener noreferrer';
            if (/^https?:/.test(node.getAttribute('href') || '')) node.target = '_blank';
          }
          if (node.tagName === 'IMG') { node.loading = 'lazy'; node.referrerPolicy = 'no-referrer'; }
        }

        for (const code of article.querySelectorAll('pre > code')) {
          const requested = code.dataset.language || 'text';
          const language = CODE_ALIASES[requested] || requested;
          const raw = code.textContent;
          if (hljs.getLanguage(language) && raw.length <= 100000) {
            try { code.innerHTML = DOMPurify.sanitize(hljs.highlight(raw, { language, ignoreIllegals:true }).value, { ALLOWED_TAGS:['span'], ALLOWED_ATTR:['class'] }); }
            catch { code.textContent = raw; }
          }
          code.className = 'hljs';
          const wrapper = document.createElement('div'); wrapper.className = 'code-block';
          const bar = document.createElement('div'); bar.className = 'code-bar';
          const label = document.createElement('span'); label.textContent = requested;
          const button = document.createElement('button'); button.type = 'button'; button.className = 'copy-code'; button.textContent = '复制'; button.setAttribute('aria-label', `复制 ${requested} 代码`);
          const feedback = document.createElement('span'); feedback.className = 'copy-feedback'; feedback.setAttribute('role', 'status');
          const pre = code.parentElement;
          pre.replaceWith(wrapper); bar.append(label, feedback, button); wrapper.append(bar, pre);
        }
        return article;
      });

      this.baseURL = baseURL;
      this.images = images;
      this.pages = pages;
      this.headings = headings;
      return { pages, headings };
    }

    render(markdown, options = {}) {
      this.parse(markdown, options);
      const requestedPage = options.page ?? 'all';
      const continuous = requestedPage === 'all';
      let currentPage = continuous ? 1 : Math.max(1, Math.min(Number(requestedPage) || 1, this.pages.length));
      const target = this.headings.find(heading => heading.id === options.anchor);
      if (target && !continuous) currentPage = target.page;
      const fragment = document.createDocumentFragment();
      for (let index = 0; index < this.pages.length; index++) {
        if (!continuous && index + 1 !== currentPage) continue;
        const content = this.pages[index].cloneNode(true);
        for (const slot of content.querySelectorAll('[data-directive]')) {
          if (slot.dataset.directive === 'toc') {
            const toc = document.createElement('details'); toc.className = 'document-toc'; toc.open = options.tocOpen === true;
            const summary = document.createElement('summary'); summary.textContent = options.tocLabel || '目录';
            toc.append(summary, this.makeTOC({ currentPage, continuous, linkFactory:options.linkFactory }));
            slot.replaceWith(toc);
          } else slot.replaceWith(this.makeNav(index + 1, options.linkFactory));
        }
        fragment.append(content);
      }
      return { fragment, pages:this.pages, headings:this.headings, currentPage, continuous };
    }

    makeTOC({ currentPage = 1, continuous = false, linkFactory } = {}) {
      const nav = document.createElement('nav');
      nav.setAttribute('aria-label', '全文目录');
      if (!this.headings.length) { nav.textContent = '暂无标题'; return nav; }
      const minLevel = Math.min(...this.headings.map(heading => heading.level));
      for (const heading of this.headings) {
        const link = linkFactory ? linkFactory(heading.text, heading.page, heading.id) : document.createElement('a');
        if (!linkFactory) { link.textContent = heading.text; link.href = `#md-heading-${encodeURIComponent(heading.id)}`; }
        link.className = 'toc-link';
        link.style.setProperty('--depth', heading.level - minLevel);
        if (heading.page === currentPage && !continuous) link.setAttribute('aria-current', 'page');
        const number = document.createElement('span'); number.className = 'toc-page'; number.textContent = String(heading.page).padStart(2, '0');
        link.append(number); nav.append(link);
      }
      return nav;
    }

    makeNav(page, linkFactory) {
      const nav = document.createElement('nav'); nav.className = 'document-nav'; nav.setAttribute('aria-label', '文档分页');
      if (this.pages.length < 2) return document.createDocumentFragment();
      const createLink = (text, target) => linkFactory ? linkFactory(text, target) : Object.assign(document.createElement('a'), { textContent:text, href:`#page-${target}` });
      if (page > 1) nav.append(createLink('← 上一页', page - 1));
      const number = document.createElement('span'); number.textContent = `${page} / ${this.pages.length}`; nav.append(number);
      if (page < this.pages.length) nav.append(createLink('下一页 →', page + 1));
      return nav;
    }
  }

  global.MoyeMarkdownEngine = MoyeMarkdownEngine;
})(window);
