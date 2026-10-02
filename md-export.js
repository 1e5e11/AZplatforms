/* Full-document exports use a separate light page; the live preview stays paginated. */
(() => {
  'use strict';
  const WIDTH = 896, SCALE = 2;
  const css = `
    .moye-export{box-sizing:border-box;width:896px;padding:48px;background:#fff;color:#171315;
      font:16px 'Times New Roman','宋体',serif;--az-accent:#7c0a21;--az-accent-alpha:#7c0a2164;
      --az-muted:#6d6567;--az-code-tint:#7c0a2109;color-scheme:light}
    .moye-export *{box-sizing:border-box}.moye-export a{color:#7c0a21;text-underline-offset:4px}
    .moye-export .markdown{max-width:800px;margin:0 auto;line-height:1.85;overflow-wrap:anywhere}
    .moye-export h1,.moye-export h2,.moye-export h3,.moye-export h4,.moye-export h5,.moye-export h6{color:#7c0a21;font-weight:400;line-height:1.4}
    .moye-export h1{font-size:36px;margin:0 0 24px}.moye-export h2{font-size:26px;margin:32px 0 14px}
    .moye-export h3{font-size:21px;margin:24px 0 12px}.moye-export h4{font-size:18px}
    .moye-export p{margin:14px 0}.moye-export li{margin:4px 0}.moye-export ul,.moye-export ol{padding-left:26px}
    .moye-export blockquote{margin:22px 0;padding:1px 20px;border-left:2px solid #7c0a21;color:#6d6567}
    .moye-export pre{margin:0;padding:16px 18px;border:1px solid #7c0a2164;font-size:13px;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere}
    .moye-export code{font-family:Consolas,'Liberation Mono',monospace;font-size:.86em}.moye-export pre code{font-size:inherit}
    .moye-export :not(pre)>code{padding:2px 4px;background:#7c0a2109}
    .moye-export .code-block{margin:20px 0;border:1px solid #7c0a2164;border-radius:.15em;overflow:hidden}.moye-export .code-block pre{border:0}
    .moye-export table{border-collapse:collapse;display:table;max-width:100%;font-size:14px;table-layout:fixed;width:100%}
    .moye-export th,.moye-export td{padding:8px 14px;border:1px solid #7c0a2164;text-align:left;overflow-wrap:anywhere}
    .moye-export th{color:#7c0a21;font-weight:400}.moye-export del{color:#7c0a21;text-decoration-thickness:2px}
    .moye-export hr{border:0;border-top:1px solid #7c0a2164;margin:28px 0}.moye-export img{max-width:100%;height:auto}
    .moye-export .math-display{max-width:100%;margin:22px 0;padding:4px 0;overflow:hidden;text-align:center}
    .moye-export .math-display>.katex-display{margin:0}.moye-export .math-inline{white-space:nowrap}
    .moye-export .toc-link{display:block;font-size:14px;line-height:30px;padding-left:calc(10px + var(--depth,0)*14px);text-decoration:none}
    .moye-export .toc-page{float:right;font-size:10px;margin-left:8px}
    .moye-export .document-page{display:flow-root}.moye-export .document-page+.document-page{margin-top:48px;padding-top:32px;border-top:1px solid #7c0a2164}
    @media print{.moye-export{width:auto;padding:0}.moye-export .document-page+.document-page{break-before:page;margin:0;padding:0;border:0}}
  `;
  function dataURL(blob) {
    return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); });
  }
  async function resource(url) {
    const response = await fetch(url, { credentials:'omit', referrerPolicy:'no-referrer', signal:AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return dataURL(await response.blob());
  }
  async function images(article) {
    const cache = new Map();
    await Promise.all([...article.querySelectorAll('img[src]')].map(async image => {
      const src = image.src;
      try {
        if (!src.startsWith('data:')) {
          if (!cache.has(src)) cache.set(src, resource(src));
          image.src = await cache.get(src);
        }
        await Promise.race([image.decode(), new Promise((_, reject) => setTimeout(() => reject(new Error('图片加载超时')), 15000))]);
      } catch { throw new Error(`无法导出图片「${image.alt || src}」。请导入本地图片，或使用允许跨域访问的图片地址。`); }
    }));
  }
  function styles(syntax, math) {
    // Export the light syntax palette even when the application uses a dark theme.
    syntax = syntax.replace(/\[data-theme=dark\][\s\S]*$/, '').replace(/(^|})\s*([^{}]+)\{/g, (_, start, selectors) => `${start}${selectors.split(',').map(selector => `.moye-export ${selector.trim()}`).join(',')}{`);
    return `${css}\n${syntax}\n${math}`;
  }
  async function html(article, syntax, math, title) {
    await images(article);
    const fonts = new Map();
    if (!article.querySelector('.katex')) math = '';
    for (const match of math.matchAll(/url\(["']?([^)'"\s]+)["']?\)/g)) {
      const url = match[1];
      if (!url.startsWith('data:') && !fonts.has(url)) fonts.set(url, resource(url));
    }
    for (const [url, pending] of fonts) math = math.split(url).join(await pending);
    const wrap = document.createElement('main'); wrap.className = 'moye-export'; wrap.append(article);
    const safeTitle = document.createElement('title'); safeTitle.textContent = title;
    return new Blob([`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${safeTitle.outerHTML}<style>${styles(syntax, math)}</style></head><body style="margin:0;background:white">${wrap.outerHTML}</body></html>`], { type:'text/html;charset=utf-8' });
  }
  async function stage(article, syntax) {
    if (!window.html2canvas) throw new Error('导出组件未加载，请检查 vendor 文件。');
    const root = document.createElement('div'); root.className = 'moye-export';
    root.dataset.theme = 'light'; root.style.cssText = 'position:absolute;left:-10000px;top:0;pointer-events:none';
    const style = document.createElement('style'); style.textContent = styles(syntax, '');
    root.append(style, article); document.body.append(root);
    try {
      await images(article); await document.fonts.ready;
      return root;
    } catch (error) { root.remove(); throw error; }
  }
  function canvas(root, options = {}) {
    return html2canvas(root, { scale:SCALE, backgroundColor:'#fff', logging:false, useCORS:true, scrollX:0, scrollY:0, windowWidth:1200, ...options });
  }
  async function image(article, syntax, format) {
    const root = await stage(article, syntax);
    try {
      const height = Math.ceil(root.getBoundingClientRect().height);
      if (height * SCALE > 32767 || WIDTH * height * SCALE * SCALE > 32000000) throw new Error('文档过长，无法生成完整图片。请导出 PDF，或拆分文档后导出图片。');
      const result = await canvas(root, { width:WIDTH, height });
      const blob = await new Promise(resolve => result.toBlob(resolve, format === 'jpeg' ? 'image/jpeg' : 'image/png', .95));
      result.width = result.height = 0;
      if (!blob) throw new Error('图片生成失败，请改用 PDF 或缩短文档。');
      return blob;
    } finally { root.remove(); }
  }
  function pageEnd(page, offset, limit) {
    const top = page.getBoundingClientRect().top;
    let end = limit;
    // Move page boundaries above any text line, table row, image or formula they intersect.
    const rects = [];
    for (const element of page.querySelectorAll('img, tr, .math-display, h1, h2, h3, h4, h5, h6')) rects.push(element.getBoundingClientRect());
    const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (!walker.currentNode.textContent.trim()) continue;
      const range = document.createRange(); range.selectNodeContents(walker.currentNode); rects.push(...range.getClientRects());
    }
    // Recheck after moving the boundary because neighbouring elements may overlap vertically.
    for (let i = 0; i < 10; i++) {
      const previous = end;
      for (const rect of rects) {
        const start = Math.floor(rect.top - top), bottom = Math.ceil(rect.bottom - top);
        if (start < end && bottom > end && start > offset + 24) end = Math.min(end, start);
      }
      if (end === previous) break;
    }
    return end;
  }
  async function pdf(article, syntax, title, progress = () => {}, mode = 'text') {
    if (!window.jspdf?.jsPDF) throw new Error('PDF 组件未加载，请检查 vendor 文件。');
    if (!['image', 'vector', 'text'].includes(mode)) throw new Error('不支持的 PDF 内容类型。');
    const root = await stage(article, syntax);
    try {
      const pdf = new jspdf.jsPDF({ unit:'mm', format:'a4', compress:true, putOnlyUsedFonts:true });
      pdf.setProperties({ title, creator:'墨页' });
      let fonts;
      if (mode !== 'image') {
        progress('正在加载 PDF 字体…');
        if (!window.MoyePDF) throw new Error('PDF 文字组件未加载，请检查 md-pdf.js。');
        fonts = await MoyePDF.prepare(root, pdf, mode);
      }
      const width = 186, capacity = Math.floor(273 * 800 / width);
      let count = 0;
      for (const page of article.querySelectorAll('.document-page')) {
        // Logical Markdown page breaks always start a new PDF page.
        page.style.cssText = 'margin:0;padding:0;border:0';
        const height = Math.ceil(page.getBoundingClientRect().height);
        let offset = 0;
        do {
          const end = Math.min(height, pageEnd(page, offset, offset + capacity));
          const slice = Math.max(1, end - offset);
          progress(`正在生成 PDF · 第 ${count + 1} 页…`);
          if (count++) pdf.addPage();
          if (mode === 'image') {
            const result = await canvas(page, { y:offset, width:800, height:slice });
            pdf.addImage(result, 'PNG', 12, 12, width, slice * width / 800, undefined, 'FAST');
            result.width = result.height = 0;
          } else await MoyePDF.render(page, pdf, fonts, mode, offset, slice, canvas);
          offset = end;
        } while (offset < height);
      }
      return pdf.output('blob');
    } finally { root.remove(); }
  }
  window.MoyeExport = { html, image, pdf };
})();
