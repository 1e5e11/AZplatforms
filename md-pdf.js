/* Render the existing HTML layout onto a PDF canvas, without a page screenshot. */
(() => {
  'use strict';
  const cache = new Map();
  const fontURLs = new Map();
  const fontBundleURL = new URL('./vendor/pdf-fonts.js', document.currentScript.src).href;
  const boldBundleURL = new URL('./vendor/pdf-fonts-bold.js', document.currentScript.src).href;
  const bundles = new Map();
  function loadFonts(bold = false) {
    const name = bold ? 'MoyePDFBoldFontData' : 'MoyePDFFontData';
    const file = bold ? 'pdf-fonts-bold.js' : 'pdf-fonts.js';
    if (window[name]) return Promise.resolve(window[name]);
    if (!bundles.has(name)) bundles.set(name, new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const finish = error => {
        clearTimeout(timer); script.remove();
        if (error) reject(error); else resolve(window[name]);
      };
      const timer = setTimeout(() => finish(new Error(`PDF 字体加载超时，请检查 vendor/${file}。`)), 15000);
      script.src = bold ? boldBundleURL : fontBundleURL;
      script.onload = () => finish(window[name] ? null : new Error(`PDF 字体文件无效，请检查 vendor/${file}。`));
      script.onerror = () => finish(new Error(`无法加载 PDF 字体，请检查 vendor/${file}。`));
      document.head.append(script);
    }).catch(error => { bundles.delete(name); throw error; }));
    return bundles.get(name);
  }
  const families = new Set(['AMS', 'Caligraphic', 'Fraktur', 'Main', 'Math', 'SansSerif', 'Script', 'Size1', 'Size2', 'Size3', 'Size4', 'Typewriter'].map(name => `KaTeX_${name}`));
  async function font(family, variant = 'Regular') {
    const key = `${family}-${variant}`;
    if (!cache.has(key)) cache.set(key, (async () => {
      const bold = family === 'MoyeSerif' && variant === 'Bold';
      const encoded = (await loadFonts(bold))[key];
      if (!encoded) throw new Error(`PDF 字体缺少 ${key}，请检查 vendor/${bold ? 'pdf-fonts-bold.js' : 'pdf-fonts.js'}。`);
      const buffer = Uint8Array.from(atob(encoded), char => char.charCodeAt(0)).buffer;
      return { key, buffer, encoded, outline:opentype.parse(buffer) };
    })().catch(error => { cache.delete(key); throw error; }));
    return cache.get(key);
  }
  function face(value) {
    const family = value.match(/KaTeX_[A-Za-z0-9]+/)?.[0];
    const bold = /\b(bold|[6-9]00)\b/.test(value), italic = /\b(italic|oblique)\b/.test(value);
    if (!family || !families.has(family)) return { family:'MoyeSerif', variant:bold ? 'Bold' : 'Regular', bold, italic };
    let variant = 'Regular';
    if (family === 'KaTeX_Main') variant = bold && italic ? 'BoldItalic' : bold ? 'Bold' : italic ? 'Italic' : 'Regular';
    else if (family === 'KaTeX_SansSerif') variant = bold ? 'Bold' : italic ? 'Italic' : 'Regular';
    else if (family === 'KaTeX_Math') variant = bold ? 'BoldItalic' : 'Italic';
    else if (['KaTeX_Caligraphic', 'KaTeX_Fraktur'].includes(family) && bold) variant = 'Bold';
    return { family, variant, bold, italic };
  }
  async function prepare(root, pdf, mode) {
    if (!window.opentype || !pdf.svg) throw new Error('矢量 PDF 组件未加载，请检查 vendor 文件。');
    const chinese = await font('MoyeSerif');
    function fontFace(loaded, weight) {
      if (!fontURLs.has(loaded.key)) fontURLs.set(loaded.key, URL.createObjectURL(new Blob([loaded.buffer], { type:'font/ttf' })));
      return `@font-face{font-family:MoyeSerif;font-weight:${weight};src:url("${fontURLs.get(loaded.key)}") format("truetype")}`;
    }
    root.dataset.pdfMode = mode;
    // KaTeX's visually clipped MathML is an accessibility copy of the formula.
    for (const element of root.querySelectorAll('.katex-mathml')) element.remove();
    const style = document.createElement('style');
    // A CSS font face is also copied into html2canvas's layout iframe. A face
    // registered only through document.fonts would silently use fallback metrics.
    style.textContent = `${fontFace(chinese, 400)} .moye-export[data-pdf-mode]{font-family:MoyeSerif,serif}.moye-export[data-pdf-mode] code{font-family:KaTeX_Typewriter,MoyeSerif,monospace}`;
    root.append(style);
    await document.fonts.ready;
    const requested = new Map([['MoyeSerif-Regular', chinese]]);
    for (const element of root.querySelectorAll('*')) {
      const css = getComputedStyle(element), selected = face(`${css.fontStyle} ${css.fontWeight} ${css.fontFamily}`);
      const key = `${selected.family}-${selected.variant}`;
      if (!requested.has(key)) requested.set(key, font(selected.family, selected.variant));
      // Bold CJK characters inside a formula or code font need the same real fallback.
      if (selected.bold && !requested.has('MoyeSerif-Bold')) requested.set('MoyeSerif-Bold', font('MoyeSerif', 'Bold'));
    }
    const fonts = new Map();
    for (const [key, pending] of requested) {
      const loaded = await pending; fonts.set(key, loaded);
      // Outline mode needs no embedded fonts or text objects.
      if (mode === 'text') {
        pdf.addFileToVFS(`${key}.ttf`, loaded.encoded);
        pdf.addFont(`${key}.ttf`, key, 'normal');
      }
    }
    if (fonts.has('MoyeSerif-Bold')) style.textContent += fontFace(fonts.get('MoyeSerif-Bold'), 700);
    await document.fonts.ready;
    return fonts;
  }
  function svgImage(image) {
    if (!image.src?.startsWith('data:image/svg+xml')) return null;
    const comma = image.src.indexOf(','), header = image.src.slice(0, comma), body = image.src.slice(comma + 1);
    const xml = /;base64/i.test(header) ? new TextDecoder().decode(Uint8Array.from(atob(body), char => char.charCodeAt(0))) : decodeURIComponent(body);
    const doc = new DOMParser().parseFromString(xml, 'image/svg+xml');
    if (doc.querySelector('parsererror') || doc.documentElement.localName !== 'svg') throw new Error('SVG 图片格式无效。');
    DOMPurify.sanitize(doc.documentElement, { IN_PLACE:true, USE_PROFILES:{ svg:true, svgFilters:true } });
    return doc.documentElement;
  }
  function svgLabels(svg, fonts) {
    if (!svg.querySelector('text')) return svg;
    // A diagram's labels are graphics too. Outlining them also avoids svg2pdf's
    // built-in Latin-only fonts corrupting Chinese labels inside an SVG image.
    const host = document.createElement('div');
    host.className = 'moye-export'; host.dataset.theme = 'light';
    host.style.cssText = 'position:absolute;left:-10000px;top:0;pointer-events:none';
    // Keep styles in an imported diagram from affecting the editor itself.
    const copy = document.importNode(svg, true); host.attachShadow({ mode:'closed' }).append(copy); document.body.append(host);
    const loaded = fonts.get('MoyeSerif-Regular');
    try {
      for (const label of copy.querySelectorAll('text')) {
        label.style.fontFamily = 'MoyeSerif';
        for (const span of label.querySelectorAll('tspan')) span.style.fontFamily = 'MoyeSerif';
        const characters = [];
        const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) for (const character of walker.currentNode.textContent) characters.push({ character, element:walker.currentNode.parentElement });
        if (label.getNumberOfChars() !== characters.length) throw new Error('SVG 标签包含复杂空白排版，请改用图片 PDF 模式。');
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        for (const attr of label.attributes) if (!['x', 'y', 'dx', 'dy', 'rotate'].includes(attr.name)) group.setAttribute(attr.name, attr.value);
        for (let i = 0; i < characters.length; i++) {
          const { character, element } = characters[i], style = getComputedStyle(element), position = label.getStartPositionOfChar(i);
          if (!loaded.outline.charToGlyphIndex(character) && !/\s/.test(character)) throw new Error(`SVG 标签字体缺少字符「${character}」，请改用图片 PDF 模式。`);
          const glyph = loaded.outline.charToGlyph(character).getPath(position.x, position.y, parseFloat(style.fontSize));
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', glyph.toPathData(3));
          path.setAttribute('fill', style.fill); path.setAttribute('stroke', style.stroke); path.setAttribute('stroke-width', style.strokeWidth);
          const rotation = label.getRotationOfChar(i);
          if (rotation) path.setAttribute('transform', `rotate(${rotation} ${position.x} ${position.y})`);
          group.append(path);
        }
        label.replaceWith(group);
      }
      return copy;
    } finally { host.remove(); }
  }
  async function render(page, pdf, fonts, mode, offset, height, renderCanvas) {
    const ctx = pdf.context2d, factor = 186 / 800, pendingSVG = [], textRuns = [];
    const metrics = document.createElement('canvas').getContext('2d');
    ctx.autoPaging = false;
    ctx.setTransform(factor, 0, 0, factor, 12, 12);
    function text(value, x, y) {
      const point = ctx.ctx.transform.applyToPoint({ x, y });
      // Clipping alone leaves off-page text in the PDF's selectable text layer.
      if (point.y < 12 - .1 || point.y > 12 + height * factor + .1 || !value) return;
      const cssFont = ctx.font, selected = face(cssFont), size = parseFloat(cssFont.match(/([\d.]+)px/)?.[1] || '16');
      const preferred = fonts.get(`${selected.family}-${selected.variant}`) || fonts.get('MoyeSerif-Regular');
      metrics.font = cssFont;
      if (ctx.textAlign === 'right' || ctx.textAlign === 'end') x -= metrics.measureText(value).width;
      else if (ctx.textAlign === 'center') x -= metrics.measureText(value).width / 2;
      let prefix = '', run = '', runFont, runLeft = x;
      const flush = () => {
        if (!run) return;
        const position = ctx.ctx.transform.applyToPoint({ x:runLeft, y });
        const synthetic = runFont.key.startsWith('MoyeSerif-') || runFont.key === 'KaTeX_Typewriter-Regular';
        const strokeBold = runFont.key === 'KaTeX_Typewriter-Regular' && selected.bold;
        pdf.saveGraphicsState();
        pdf.setGState(new pdf.GState({ opacity:ctx.globalAlpha * ctx.ctx.fillOpacity }));
        pdf.setFont(runFont.key, 'normal');
        pdf.setFontSize(size * ctx.ctx.transform.scaleX * pdf.internal.scaleFactor);
        const options = { baseline:ctx.textBaseline, renderingMode:strokeBold ? 'fillThenStroke' : 'fill' };
        if (strokeBold) { pdf.setDrawColor(pdf.getTextColor()); pdf.setLineWidth(size * factor * .025); }
        if (synthetic && selected.italic) pdf.advancedAPI(() => pdf.text(run, position.x, position.y, { ...options, angle:new pdf.Matrix(1, 0, -.2, 1, .2 * position.y, 0) }));
        else pdf.text(run, position.x, position.y, options);
        pdf.restoreGraphicsState();
        run = '';
      };
      for (const character of value) {
        const fallback = selected.bold ? fonts.get('MoyeSerif-Bold') : fonts.get('MoyeSerif-Regular');
        const loaded = preferred.outline.charToGlyphIndex(character) ? preferred : fallback;
        if (!loaded.outline.charToGlyphIndex(character) && !/\s/.test(character)) throw new Error(`PDF 字体缺少字符「${character}」，请改用图片模式。`);
        if (mode === 'text' && character.codePointAt(0) > 0xffff) throw new Error(`文字 PDF 暂不支持字符「${character}」，请改用矢量或图片模式。`);
        const left = x + metrics.measureText(prefix).width;
        if (mode === 'text') {
          // The native PDF canvas preserves transformations and the text baseline.
          if (runFont !== loaded) { flush(); runFont = loaded; runLeft = left; }
          run += character;
        } else {
          let baseline = y;
          if (ctx.textBaseline === 'bottom') baseline -= size * .15;
          else if (ctx.textBaseline === 'middle') baseline += size * .35;
          const path = loaded.outline.charToGlyph(character).getPath(left, baseline, size);
          const synthetic = loaded.key.startsWith('MoyeSerif-') || loaded.key === 'KaTeX_Typewriter-Regular';
          if (synthetic && selected.italic) for (const command of path.commands) {
            for (const suffix of ['', '1', '2']) if (command[`x${suffix}`] !== undefined) command[`x${suffix}`] -= .2 * (command[`y${suffix}`] - baseline);
          }
          ctx.beginPath();
          for (const command of path.commands) {
            if (command.type === 'M') ctx.moveTo(command.x, command.y);
            else if (command.type === 'L') ctx.lineTo(command.x, command.y);
            else if (command.type === 'C') ctx.bezierCurveTo(command.x1, command.y1, command.x2, command.y2, command.x, command.y);
            else if (command.type === 'Q') ctx.quadraticCurveTo(command.x1, command.y1, command.x, command.y);
            else if (command.type === 'Z') ctx.closePath();
          }
          pdf.setGState(new pdf.GState({ opacity:ctx.globalAlpha * ctx.ctx.fillOpacity }));
          ctx.fill();
          if (loaded.key === 'KaTeX_Typewriter-Regular' && selected.bold) { ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = size * .025; ctx.stroke(); ctx.restore(); }
        }
        prefix += character;
      }
      if (mode === 'text') flush();
      ctx.font = cssFont;
    }
    const proxy = new Proxy(ctx, {
      get(target, key) {
        if (key === 'fillText') return (value, x, y) => {
          const transform = ctx.ctx.transform.clone(), point = transform.applyToPoint({ x, y });
          if (point.y < 12 - .1 || point.y > 12 + height * factor + .1) return;
          if (ctx.globalAlpha * ctx.ctx.fillOpacity === 0) return;
          textRuns.push({ value, x, y, transform, point, font:ctx.font, fillStyle:ctx.fillStyle, textBaseline:ctx.textBaseline, textAlign:ctx.textAlign, alpha:ctx.globalAlpha });
        };
        if (['fill', 'fillRect', 'stroke', 'strokeRect'].includes(key)) return (...args) => {
          pdf.setGState(new pdf.GState({ opacity:ctx.globalAlpha * ctx.ctx.fillOpacity, 'stroke-opacity':ctx.globalAlpha * ctx.ctx.strokeOpacity }));
          return target[key](...args);
        };
        if (key === 'measureText') return value => { metrics.font = ctx.font; return metrics.measureText(value); };
        if (key === 'drawImage') return (image, ...args) => {
          const svg = svgImage(image);
          let x, y, width, h;
          if (args.length === 8) [, , , , x, y, width, h] = args;
          else [x, y, width = image.width, h = image.height] = args;
          const a = ctx.ctx.transform.applyToPoint({ x, y });
          const b = ctx.ctx.transform.applyToPoint({ x:x + width, y:y + h });
          if (svg) pendingSVG.push({ svg, x:a.x, y:a.y, width:b.x - a.x, height:b.y - a.y });
          else {
            // Decode SVG separately; actual bitmap assets retain their native resolution.
            const bitmap = document.createElement('canvas'); bitmap.width = image.naturalWidth || image.width; bitmap.height = image.naturalHeight || image.height;
            bitmap.getContext('2d').drawImage(image, 0, 0);
            pdf.addImage(bitmap, 'PNG', a.x, a.y, b.x - a.x, b.y - a.y, undefined, 'FAST');
          }
        };
        const value = Reflect.get(target, key);
        return typeof value === 'function' ? value.bind(target) : value;
      },
      set(target, key, value) { Reflect.set(target, key, value); return true; }
    });
    pdf.saveGraphicsState();
    pdf.rect(12, 12, 186, height * factor, null).clip().discardPath();
    try {
      await renderCanvas(page, { canvas:{ getContext:() => proxy }, scale:1, y:offset, width:800, height });
      // HTML painting visits parent text before nested spans. Emit in reading order
      // so copying highlighted code or a paragraph with emphasis stays coherent.
      textRuns.sort((a, b) => a.point.y - b.point.y);
      for (let first = 0; first < textRuns.length;) {
        let end = first + 1;
        while (end < textRuns.length && textRuns[end].point.y - textRuns[first].point.y < .5) end++;
        const line = textRuns.slice(first, end).sort((a, b) => a.point.x - b.point.x);
        for (const run of line) {
          ctx.ctx.transform = run.transform; ctx.font = run.font; ctx.fillStyle = run.fillStyle; ctx.textBaseline = run.textBaseline; ctx.textAlign = run.textAlign; ctx.globalAlpha = run.alpha;
          text(run.value, run.x, run.y);
        }
        first = end;
      }
      for (const item of pendingSVG) await pdf.svg(svgLabels(item.svg, fonts), { x:item.x, y:item.y, width:item.width, height:item.height });
    } finally { pdf.restoreGraphicsState(); }
  }
  window.MoyePDF = { prepare, render };
})();
