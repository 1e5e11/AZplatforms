/* 墨页 URL / Markdown protocol v1. See README.md. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const MAX_BYTES = 2 * 1024 * 1024;
  const EXAMPLE = `# 让文字，安静成页。

一份 Markdown，就是一处可以分享的阅读空间。

> 在左侧写作，在右侧阅读。打开本地文件，或粘贴一个 Markdown 地址，就能开始。

行内公式写作 $E = mc^2$，独立公式则使用双美元符号：

$$
\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}
$$

<!-- md:toc -->

## 从一段文字开始

保留 **重点**、*语气*，以及 ~~划去的念头~~。标题、列表、引用与表格，都各得其所。

| 写作 | 阅读 |
| --- | --- |
| Markdown 源文 | 即时排版 |
| 文件与链接 | 一键打开 |
| 目录与分页 | 按章节阅读 |

## 分享一张纯净的纸

点击「复制阅读链接」，对方打开后只会看到文档。工具、编辑器与应用名称都会隐去。

<!-- md:nav -->

<!-- md:page -->

# 下一页，继续。

## 为长文留出呼吸

在段落之间单独写一行分页注释，前后各空一行：

\`\`\`markdown
<!-- md:page -->
\`\`\`

目录使用 \`<!-- md:toc -->\`，文内翻页链接使用 \`<!-- md:nav -->\`。这些注释在普通 Markdown 阅读器中不可见。

## 一份兼容的文档

普通的 \`---\` 仍然是分隔线。代码块里的指令只是示例，不会让文档意外分页。

详细的参数约定、编码示例和边界行为，见「阅读规范」。

<!-- md:nav -->`;

  let pure = document.documentElement.classList.contains('reader');
  let pages = [], headings = [], currentPage = 1, continuous = false, baseURL = location.href, renderEngine;
  let sourceURL = '', requestNumber = 0, controller, sourceText = '', revisionTimer;
  let localImages = new Map();
  let openedFileName = '';
  let fileSession;
  const host = pure ? $('readerDocument') : $('document');
  if (pure) { $('workspace').remove(); $('readerRoot').hidden = false; }

  function status(message) { if (!pure) $('status').textContent = message; }
  function fail(message) {
    host.replaceChildren();
    const p = document.createElement('p'); p.setAttribute('role', 'alert'); p.textContent = message;
    host.append(p); status(message);
  }
  function parameters() {
    const query = new URLSearchParams(location.search);
    const fragment = new URLSearchParams(location.hash.slice(1));
    const hasFragmentSource = fragment.has('md') || fragment.has('src');
    if (hasFragmentSource && (query.has('md') || query.has('src'))) throw new Error('正文来源不能同时出现在查询参数和片段中。');
    const params = hasFragmentSource ? fragment : query;
    for (const key of ['md','src','images','base','page','anchor']) if (params.getAll(key).length > 1) throw new Error(`参数 ${key} 不能重复。`);
    if (params.has('md') && params.has('src')) throw new Error('md 与 src 只能传入一个。');
    return { params, inFragment: hasFragmentSource };
  }
  function pageOption(params) {
    const value = params.get('page') || '1';
    if (value === 'all') return 'all';
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) throw new Error('page 必须是从 1 开始的整数，或 all。');
    return Number(value);
  }
  function safeURL(value, base) {
    const url = new URL(value, base);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('文件地址必须是 HTTP(S) 地址或站点内的相对路径，且不能包含账号密码。');
    return url;
  }
  function parseDocument(markdown) {
    const result = renderEngine.parse(markdown, { baseURL, images:localImages });
    pages = result.pages; headings = result.headings;
    document.title = headings[0]?.text || (pure ? 'Markdown' : '墨页 · Markdown 阅读与编辑');
  }
  function navigationURL(page, anchor = '') {
    const url = new URL(location.href);
    if (pure) {
      const { params, inFragment } = parameters();
      params.set('page', String(page)); params.delete('anchor');
      if (anchor) params.set('anchor', anchor);
      if (inFragment) url.hash = params.toString();
      else { url.search = params.toString(); url.hash = ''; }
    } else {
      // Modified clicks and "open link in new tab" must also open the current document.
      const params = new URLSearchParams(sourceURL ? { src: sourceURL } : { md: sourceText });
      if (!sourceURL) addImageParameters(params);
      params.set('page', String(page)); if (anchor) params.set('anchor', anchor);
      url.search = ''; url.hash = params.toString();
    }
    return url.href;
  }
  function addImageParameters(params) {
    if (baseURL !== location.href) params.set('base', baseURL);
    const used = new Set(pages.flatMap(page => [...page.querySelectorAll('img')].map(image => image.getAttribute('src'))));
    const entries = [...localImages].filter(([, data]) => used.has(data));
    if (entries.length) params.set('images', JSON.stringify(entries));
  }
  function link(text, page, anchor = '') {
    const a = document.createElement('a'); a.textContent = text; a.href = navigationURL(page, anchor);
    a.dataset.page = page; if (anchor) a.dataset.anchor = anchor;
    return a;
  }
  function makeTOC() {
    return renderEngine.makeTOC({ currentPage, continuous, linkFactory:link });
  }
  function makeNav(page) {
    return renderEngine.makeNav(page, link);
  }
  function showPage(page = 1, anchor = '', scroll = false) {
    continuous = page === 'all';
    currentPage = continuous ? 1 : Math.max(1, Math.min(page, pages.length));
    // An anchor identifies a heading across the whole document and takes priority over the requested page.
    const target = headings.find(h => h.id === anchor);
    if (target && !continuous) currentPage = target.page;
    host.replaceChildren();
    for (let i = 0; i < pages.length; i++) {
      if (!continuous && i + 1 !== currentPage) continue;
      const content = pages[i].cloneNode(true);
      for (const slot of content.querySelectorAll('[data-directive]')) {
        if (slot.dataset.directive === 'toc') {
          const toc = document.createElement('details'); toc.className = 'document-toc';
          const summary = document.createElement('summary'); summary.textContent = '目录'; toc.append(summary, makeTOC()); slot.replaceWith(toc);
        } else slot.replaceWith(makeNav(i + 1));
      }
      host.append(content);
    }
    if (!sourceText.trim() && !pure) { const p = document.createElement('p'); p.className = 'empty'; p.textContent = '在左侧写下第一行，或打开一份 Markdown 文件。'; host.append(p); }
    if (!pure) {
      $('outline').replaceChildren(makeTOC()); $('headingCount').textContent = `${headings.length} 节`;
      $('viewOutline').replaceChildren(makeTOC()); $('viewHeadingCount').textContent = `${headings.length} 节`;
      $('pager').replaceChildren();
      if (pages.length > 1) {
        const prev = document.createElement('button'); prev.textContent = '← 上一页'; prev.disabled = currentPage === 1; prev.onclick = () => navigate(currentPage - 1);
        const next = document.createElement('button'); next.textContent = '下一页 →'; next.disabled = currentPage === pages.length; next.onclick = () => navigate(currentPage + 1);
        const number = document.createElement('span'); number.textContent = `${currentPage} / ${pages.length}`; $('pager').append(prev, number, next);
      }
    }
    if (anchor) requestAnimationFrame(() => { const node = [...host.querySelectorAll('[id]')].find(n => n.id === `md-heading-${anchor}`); node?.scrollIntoView({ block: 'start' }); });
    else if (scroll) { if (pure) window.scrollTo(0,0); else $('preview').scrollTop = 0; }
  }
  function navigate(page, anchor = '') {
    if (pure) { history.pushState(null, '', navigationURL(page, anchor)); }
    showPage(page, anchor, true);
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('.copy-code');
    if (button && host.contains(button)) {
      const raw = button.closest('.code-block').querySelector('pre > code').textContent;
      const feedback = button.parentElement.querySelector('.copy-feedback');
      copy(raw, '代码已复制').then(success => {
        if (!button.isConnected) return;
        button.textContent = success ? '已复制' : '重试';
        feedback.textContent = success ? '代码已复制' : '请手动复制';
        setTimeout(() => { button.textContent = '复制'; feedback.textContent = ''; }, 2200);
      });
      return;
    }
    const a = event.target.closest('a'); if (!a || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (a.dataset.page) { event.preventDefault(); navigate(Number(a.dataset.page), a.dataset.anchor || ''); }
    else if (host.contains(a) && a.getAttribute('href')?.startsWith('#')) {
      let id; try { id = decodeURIComponent(a.getAttribute('href').slice(1)); } catch { return; }
      const heading = headings.find(h => h.id === id);
      if (heading) { event.preventDefault(); navigate(heading.page, id); }
    }
  });
  function render(text, page = 1, anchor = '', announce = true) {
    if (new TextEncoder().encode(text).length > MAX_BYTES) throw new Error('文档超过 2 MiB，请拆分后载入。');
    sourceText = text; parseDocument(text); showPage(page, anchor);
    if (!pure) { $('charCount').textContent = `${text.length.toLocaleString()} 字`; if (announce) status(`已排版 · ${pages.length} 页 · ${headings.length} 个标题`); }
  }
  async function fetchMarkdown(address) {
    const url = safeURL(address, location.href);
    controller?.abort(); controller = new AbortController();
    const active = controller;
    const timeout = setTimeout(() => active.abort(), 15000);
    try {
      const response = await fetch(url, { signal: active.signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
      if (!response.ok) throw new Error(`文件加载失败（HTTP ${response.status}）。`);
      if (/text\/html/i.test(response.headers.get('content-type') || '')) throw new Error('这个地址返回网页，请提供 Markdown 原始文件链接。');
      if (Number(response.headers.get('content-length')) > MAX_BYTES) throw new Error('文档超过 2 MiB，请拆分后载入。');
      const reader = response.body.getReader(), chunks = []; let size = 0;
      while (true) { const { value, done } = await reader.read(); if (done) break; size += value.length; if (size > MAX_BYTES) { await reader.cancel(); throw new Error('文档超过 2 MiB，请拆分后载入。'); } chunks.push(value); }
      const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes), url: response.url || url.href };
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('加载已取消或超时，请重试。');
      if (error instanceof TypeError) throw new Error('无法读取文件。请检查地址、UTF-8 编码、网络，以及远程服务器是否允许跨域访问（CORS）。');
      throw error;
    } finally { clearTimeout(timeout); }
  }
  async function loadAddress(address) {
    const request = ++requestNumber; status('正在载入…');
    try {
      const result = await fetchMarkdown(address); if (request !== requestNumber) return;
      baseURL = result.url; sourceURL = result.url; localImages = new Map(); openedFileName = '';
      if (!pure) $('folderDocument').hidden = true;
      if (pure) { const { params } = parameters(); render(result.text, pageOption(params), params.get('anchor') || (!location.hash.includes('=') ? decodeURIComponent(location.hash.slice(1)) : '')); }
      else { setEditorValue(result.text); $('source').value = sourceURL; const name = decodeURIComponent(new URL(sourceURL).pathname.split('/').pop() || '远程文档.md'); fileSession.reset(result.text, /\.(md|markdown)$/i.test(name) ? name : `${name}.md`); render(result.text); }
    } catch (error) { if (request === requestNumber) { if (pure) fail(error.message); else status(error.message); } }
  }
  function stopLoad() { requestNumber++; controller?.abort(); sourceURL = ''; }
  function exportKaTeXStyles() {
    const href = new URL('vendor/katex.min.css', location.href).href;
    const sheet = [...document.styleSheets].find(candidate => candidate.href === href);
    try {
      const fontRoot = new URL('vendor/fonts/', location.href).href;
      return [...sheet.cssRules].map(rule => rule.cssText).join('\n').replace(/url\((["']?)(fonts\/[^)'"\s]+)\1\)/g, (_, quote, path) => `url("${new URL(path.slice('fonts/'.length), fontRoot).href}")`);
    } catch { return ''; }
  }
  async function copy(text, message) {
    try { await navigator.clipboard.writeText(text); status(message); return true; }
    catch {
      const box = document.createElement('textarea'); box.value = text; box.setAttribute('aria-label','待复制内容'); box.style.cssText = 'position:fixed;inset:20%;width:60%;height:60%;z-index:10;background:white'; document.body.append(box); box.focus(); box.select();
      try { if (document.execCommand('copy')) { box.remove(); status(message); return true; } } catch { /* Leave selectable fallback visible. */ }
      status('无法访问剪贴板，请从文本框手动复制，按 Escape 关闭。');
      box.addEventListener('keydown', event => { if (event.key === 'Escape') box.remove(); });
      box.addEventListener('blur', () => box.remove(), { once:true }); return false;
    }
  }
  if (!window.marked || !window.DOMPurify || !window.hljs || !window.katex || !window.MoyeMarkdownEngine || !window.MoyeImages) { fail('Markdown 显示引擎或依赖组件未加载，请检查相关文件是否完整后刷新。'); return; }
  renderEngine = new MoyeMarkdownEngine({ baseURL });
  if (pure) {
    try {
      const { params } = parameters(); pageOption(params);
      localImages = MoyeImages.decodeImages(params.get('images'));
      if (params.has('md') && params.has('base')) {
        const url = new URL(params.get('base'), location.href);
        baseURL = location.protocol === 'file:' && url.protocol === 'file:' ? url.href : safeURL(url.href, location.href).href;
      }
      if (params.has('md')) render(params.get('md'), pageOption(params), params.get('anchor') || '');
      else if (params.get('src')?.trim()) { host.textContent = '正在读取文档…'; loadAddress(params.get('src')); }
      else throw new Error('src 不能为空，请提供 Markdown 文件地址。');
    } catch (error) { fail(error.message); }
    window.addEventListener('popstate', () => location.reload());
    window.addEventListener('hashchange', () => location.reload());
    return;
  }
  // Pasting a #md / #src share URL into the same tab is a fragment navigation,
  // so the browser will not rerun this script unless we explicitly reload.
  window.addEventListener('hashchange', () => {
    const fragment = new URLSearchParams(location.hash.slice(1));
    if (fragment.has('md') || fragment.has('src')) location.reload();
  });
  const editor = $('editor'), editorHighlight = $('editorHighlight').querySelector('code'), workspace = $('workspace');
  fileSession = new MoyeFiles.FileSession({
    getText:() => editor.value,
    onStatus:status,
    onChange:session => {
      $('documentName').textContent = `${session.name}${session.dirty ? ' · 未保存' : ''}`;
      if (session.handle) openedFileName = session.name;
      $('saveFile').disabled = session.busy; $('saveAs').disabled = session.busy;
    }
  });
  $('saveFile').onclick = () => fileSession.save();
  $('saveAs').onclick = () => fileSession.save(true);
  window.addEventListener('beforeunload', event => { if (fileSession.dirty) { event.preventDefault(); event.returnValue = ''; } });
  document.addEventListener('keydown', event => {
    if (workspace.dataset.mode === 'edit' && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault(); if (!event.repeat) fileSession.save(event.shiftKey);
    }
  });
  const themeButtons = [$('themeToggle'), $('viewThemeToggle')];
  function setTheme(theme, persist = true) {
    const dark = theme === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    themeButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(dark));
      button.textContent = button.id === 'viewThemeToggle' ? `切换${dark ? '浅色' : '深色'}模式` : (dark ? '浅色' : '深色');
      button.title = `切换到${dark ? '浅色' : '深色'}模式`;
    });
    if (persist) {
      try { localStorage.setItem('moye-theme', dark ? 'dark' : 'light'); } catch { /* Theme still applies for this visit. */ }
    }
  }
  function toggleTheme() { setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); }
  setTheme(document.documentElement.dataset.theme, false);
  function setMode(mode) {
    const viewing = mode === 'view';
    if (viewing) {
      try { render(editor.value, currentPage); } catch (error) { status(error.message); return; }
      $('viewOutlinePanel').open = false; $('viewMore').open = false;
    }
    workspace.dataset.mode = viewing ? 'view' : 'edit';
    $('editMode').setAttribute('aria-pressed', String(!viewing));
    $('viewMode').setAttribute('aria-pressed', String(viewing));
    if (viewing) requestAnimationFrame(() => $('preview').scrollTo({ top:0, behavior:'smooth' }));
    else requestAnimationFrame(() => editor.focus({ preventScroll:true }));
  }
  function updateEditorHighlight() {
    const raw = editor.value;
    const input = raw.endsWith('\n') ? `${raw} ` : raw;
    try { editorHighlight.innerHTML = DOMPurify.sanitize(hljs.highlight(input, { language:'markdown', ignoreIllegals:true }).value, { ALLOWED_TAGS:['span'], ALLOWED_ATTR:['class'] }); }
    catch { editorHighlight.textContent = input; }
  }
  function setEditorValue(value) { editor.value = value; updateEditorHighlight(); }
  setEditorValue(EXAMPLE); fileSession.reset(EXAMPLE, '阅读示例.md'); render(EXAMPLE);
  $('editMode').onclick = () => setMode('edit');
  $('viewMode').onclick = () => setMode('view');
  $('returnToEdit').onclick = () => setMode('edit');
  themeButtons.forEach(button => { button.onclick = toggleTheme; });
  $('viewOutline').addEventListener('click', event => { if (event.target.closest('a')) $('viewOutlinePanel').open = false; });
  editor.addEventListener('scroll', () => { $('editorHighlight').scrollTop = editor.scrollTop; $('editorHighlight').scrollLeft = editor.scrollLeft; });
  editor.addEventListener('input', () => {
    updateEditorHighlight(); fileSession.changed(); stopLoad(); clearTimeout(revisionTimer);
    const previousStatus = $('status').textContent;
    // A pending preview must not replace a newer save or export result message.
    revisionTimer = setTimeout(() => { try { render(editor.value, currentPage, '', $('status').textContent === previousStatus); } catch (error) { status(error.message); } }, 120);
  });
  $('example').onclick = () => { stopLoad(); openedFileName = ''; $('folderDocument').hidden = true; localImages = new Map(); baseURL = location.href; setEditorValue(EXAMPLE); fileSession.reset(EXAMPLE, '阅读示例.md'); render(EXAMPLE); };
  $('clear').onclick = () => { stopLoad(); openedFileName = ''; $('folderDocument').hidden = true; localImages = new Map(); baseURL = location.href; setEditorValue(''); $('source').value = ''; fileSession.reset(''); render(''); editor.focus(); };
  $('sourceForm').onsubmit = event => { event.preventDefault(); if ($('source').value.trim()) loadAddress($('source').value.trim()); else status('请先输入文件地址。'); };
  async function openFile(file, files = [file], handle = null) {
    if (!file) return; stopLoad(); const request = requestNumber;
    if (!/\.(md|markdown)$/i.test(file.name)) { status('请选择 .md 或 .markdown 文件。'); return; }
    if (file.size > MAX_BYTES) { status('文档超过 2 MiB，请拆分后载入。'); return; }
    try {
      const text = new TextDecoder('utf-8', { fatal:true }).decode(await file.arrayBuffer()); if (request !== requestNumber) return;
      const images = await MoyeImages.readImages(files, location.href); if (request !== requestNumber) return;
      localImages = images; baseURL = MoyeImages.fileURL(file.webkitRelativePath || file.name, location.href);
      openedFileName = file.name;
      setEditorValue(text); fileSession.reset(text, file.name, handle); $('source').value = ''; render(text);
    } catch (error) { if (request === requestNumber) status(error instanceof TypeError ? '文件读取失败，请确认文件采用 UTF-8 编码。' : error.message); }
  }
  $('openFile').onclick = async () => {
    if (typeof window.showOpenFilePicker !== 'function') { $('file').click(); return; }
    try {
      const [handle] = await window.showOpenFilePicker({ types:MoyeFiles.types, multiple:false });
      const file = await handle.getFile(); $('folderDocument').hidden = true; await openFile(file, [file], handle);
    } catch (error) {
      if (error.name === 'AbortError') return;
      if (error.name === 'SecurityError') { $('file').click(); return; }
      status(`打开文件失败：${error.message}`);
    }
  };
  $('file').onchange = () => { if ($('file').files.length) { $('folderDocument').hidden = true; openFile($('file').files[0]); } $('file').value = ''; };
  async function importImages(files, documentBase = baseURL, assetBase = baseURL) {
    const request = ++requestNumber; controller?.abort();
    try {
      const images = await MoyeImages.readImages(files, assetBase, localImages);
      if (request !== requestNumber) return;
      stopLoad(); localImages = images; baseURL = documentBase; render(editor.value, currentPage);
      status(`已导入 ${files.filter(MoyeImages.imageType).length} 张图片 · 使用 ![说明](图片文件名) 引用`);
    } catch (error) { if (request === requestNumber) status(error.message); }
  }
  function openFiles(files, handles = new Map()) {
    const documents = files.filter(file => /\.(md|markdown)$/i.test(file.name));
    if (documents.length > 1) {
      const select = $('folderDocument'); select.replaceChildren(new Option('选择 Markdown 文档…', ''));
      documents.forEach((file, index) => select.append(new Option(file.webkitRelativePath || file.name, String(index))));
      select.hidden = false;
      select.onchange = () => { if (select.value !== '') { const file = documents[Number(select.value)]; openFile(file, files, handles.get(file)); } };
      status('请选择要打开的 Markdown 文档，配图会一起载入。'); return;
    }
    $('folderDocument').hidden = true;
    if (documents.length) return openFile(documents[0], files, handles.get(documents[0]));
    if (files.some(MoyeImages.imageType)) return importImages(files);
    status('请选择 Markdown 文件或 PNG、JPEG、GIF、WebP、AVIF、BMP、ICO、SVG 图片。');
  }
  async function readDirectory(directory, prefix = directory.name, files = [], handles = new Map()) {
    for await (const child of directory.values()) {
      if (child.kind === 'directory') await readDirectory(child, `${prefix}/${child.name}`, files, handles);
      else {
        if (!/\.(md|markdown|png|jpe?g|gif|webp|avif|bmp|ico|svg)$/i.test(child.name)) continue;
        if (files.length >= 1000) throw new Error('文件夹中可用文件超过 1,000 个，请选择较小的文件夹。');
        const file = await child.getFile();
        Object.defineProperty(file, 'webkitRelativePath', { value:`${prefix}/${child.name}` });
        files.push(file); handles.set(file, child);
      }
    }
    return { files, handles };
  }
  function openFolderFiles(files, handles = new Map()) {
    // When a document is already open, its matching file determines the base directory.
    const matches = files.filter(file => file.name === openedFileName);
    if (matches.length === 1) {
      if (!fileSession.handle && handles.has(matches[0])) fileSession.handle = handles.get(matches[0]);
      importImages(files, MoyeImages.fileURL(matches[0].webkitRelativePath || matches[0].name, location.href), location.href);
    } else if (files.length) openFiles(files, handles);
  }
  $('openFolder').onclick = async () => {
    if (typeof window.showDirectoryPicker !== 'function') { $('folder').click(); return; }
    try {
      const directory = await window.showDirectoryPicker();
      const { files, handles } = await readDirectory(directory); openFolderFiles(files, handles);
    } catch (error) {
      if (error.name === 'AbortError') return;
      if (error.name === 'SecurityError') { $('folder').click(); return; }
      status(`打开文件夹失败：${error.message}`);
    }
  };
  $('folder').onchange = () => {
    const files = [...$('folder').files]; $('folder').value = ''; openFolderFiles(files);
  };
  $('openImages').onclick = () => $('images').click();
  $('images').onchange = () => { const files = [...$('images').files]; $('images').value = ''; if (files.length) importImages(files); };
  $('copySource').onclick = () => copy(editor.value, 'Markdown 原文已复制');
  document.addEventListener('dragover', event => { if (event.dataTransfer.types.includes('Files')) event.preventDefault(); });
  document.addEventListener('drop', async event => {
    if (!event.dataTransfer.files.length && ![...event.dataTransfer.items].some(item => item.kind === 'file')) return;
    event.preventDefault();
    const fallback = [...event.dataTransfer.files];
    // Obtain handle promises during the drop event, before its data store is protected.
    const pending = [...event.dataTransfer.items].filter(item => item.kind === 'file').map(item => item.getAsFileSystemHandle?.());
    try {
      const entries = await Promise.all(pending);
      if (!entries.length || entries.some(handle => !handle)) { openFiles(fallback); return; }
      const files = [], handles = new Map();
      for (const handle of entries) {
        if (handle.kind === 'directory') await readDirectory(handle, handle.name, files, handles);
        else { const file = await handle.getFile(); files.push(file); handles.set(file, handle); }
      }
      openFiles(files, handles);
    } catch (error) { status(`拖入文件失败：${error.message}`); }
  });
  $('share').onclick = () => {
    try { render(editor.value, currentPage); } catch (error) { status(error.message); return; }
    const url = new URL(location.href); url.search = ''; url.hash = '';
    const params = new URLSearchParams();
    if (sourceURL && sourceText === $('editor').value) params.set('src', sourceURL);
    else { params.set('md', $('editor').value); addImageParameters(params); }
    params.set('page', String(currentPage)); url.hash = params.toString();
    if (url.href.length > 64000) { status('正文或图片使链接超过 64,000 字符。请复制 HTML，或将 Markdown 和图片托管后使用 src 分享。'); return; }
    copy(url.href, '阅读链接已复制 · 打开后仅显示文档');
  };
  function buildExportHost() {
    render(editor.value, currentPage);
    const exportHost = document.createElement('article'); exportHost.className = 'markdown';
    for (let i = 0; i < pages.length; i++) { const page = pages[i].cloneNode(true); for (const slot of page.querySelectorAll('[data-directive]')) { if (slot.dataset.directive === 'toc') { const toc = makeTOC(); for (const a of toc.querySelectorAll('a')) { a.href = `#${encodeURIComponent(a.dataset.anchor)}`; a.removeAttribute('data-page'); a.removeAttribute('data-anchor'); } slot.replaceWith(toc); } else slot.remove(); } for (const heading of page.querySelectorAll('[id^="md-heading-"]')) heading.id = heading.id.slice('md-heading-'.length); exportHost.append(page); }
    for (const bar of exportHost.querySelectorAll('.code-bar')) bar.remove();
    return exportHost;
  }
  $('copyHtml').onclick = () => {
    let exportHost;
    try { exportHost = buildExportHost(); } catch (error) { status(error.message); return; }
    const syntaxCSS = document.getElementById('codeTheme').textContent;
    const mathCSS = exportKaTeXStyles();
    copy(`<style>del{color:#7c0a21;text-decoration-thickness:2px}.document-page+.document-page{break-before:page}img{max-width:100%}pre{overflow:auto;white-space:pre}code{font-family:Consolas,monospace}.math-display{overflow-x:auto;text-align:center}${syntaxCSS}${mathCSS}</style>\n${exportHost.outerHTML}`, '全文 HTML 已复制');
  };
  $('exportFormat').addEventListener('change', () => { $('pdfMode').hidden = $('exportFormat').value !== 'pdf'; });
  $('exportFile').onclick = async () => {
    const button = $('exportFile'), format = $('exportFormat').value, pdfMode = $('pdfMode').value;
    const label = format === 'pdf' ? `${{image:'图片', vector:'矢量', text:'文字'}[pdfMode]} PDF` : format.toUpperCase();
    if (button.disabled) return;
    button.disabled = true; $('exportFormat').disabled = true; $('pdfMode').disabled = true;
    try {
      clearTimeout(revisionTimer);
      const exportHost = buildExportHost(), syntax = $('codeTheme').textContent;
      const name = fileSession.name.replace(/\.(md|markdown)$/i, '') || '未命名';
      status(`正在导出 ${label} 全文…`);
      let blob;
      if (format === 'html') blob = await MoyeExport.html(exportHost, syntax, exportKaTeXStyles(), name);
      else if (format === 'pdf') blob = await MoyeExport.pdf(exportHost, syntax, name, status, pdfMode);
      else blob = await MoyeExport.image(exportHost, syntax, format);
      MoyeFiles.download(blob, `${name}.${format === 'jpeg' ? 'jpg' : format}`);
      status(`已导出 ${label} 全文 · ${name}`);
    } catch (error) { status(`导出失败：${error.message}`); }
    finally { button.disabled = false; $('exportFormat').disabled = false; $('pdfMode').disabled = false; }
  };
  $('help').onclick = event => { event.preventDefault(); loadAddress('./README.md'); };
  $('editor').addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); $('copyHtml').click(); } });
})();
