/* 墨页 Markdown 显示引擎。浏览器端依赖 marked、DOMPurify、highlight.js 与 KaTeX。 */
((global) => {
  'use strict';

  const CODE_ALIASES = { 'c++':'cpp', cxx:'cpp', cc:'cpp', py:'python', js:'javascript', html:'xml', htm:'xml', md:'markdown', ts:'typescript', sh:'bash', text:'plaintext', txt:'plaintext' };
  const DATA_IMAGE = /^data:image\/(?:png|jpeg|gif|webp|avif|bmp|x-icon|svg\+xml);base64,[a-z0-9+/]+={0,2}$/i;
  const SVG_BLOCK = /^ {0,3}<svg[\s>][\s\S]*?<\/svg\s*>(?:\n|$)/i;
  const SVG_INLINE = /^<svg[\s>][\s\S]*?<\/svg\s*>/i;
  // 定位属性会让内嵌图形脱离正文，盖住阅读器界面。
  const SVG_BLOCKED_STYLES = ['position', 'inset', 'inset-block', 'inset-block-start', 'inset-block-end', 'inset-inline', 'inset-inline-start', 'inset-inline-end', 'top', 'right', 'bottom', 'left', 'z-index', 'float'];
  const MAX_INLINE_MATH = 5000, MAX_DISPLAY_MATH = 20000;
  let svgSequence = 0;

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

  // 裸 LaTeX：没有 $ / \( \) / \[ \] 定界符、直接写在正文里的公式。
  // 只处理 KaTeX 能完整解析的片段，否则保持原文，避免误伤普通文本。
  const BARE_MATH_CHARS = new Set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789{}()[]^_=+-/|<>!.,;:'\\&");
  const BARE_MATH_TRIGGER = /^(?:\\[A-Za-z]+|\^\{|\^[A-Za-z0-9]|_\{)/;
  const BARE_MATH_WORD = /^[A-Za-z]{2,}$/;
  const BARE_MATH_MAX = 400;
  const BARE_DISPLAY_MAX = 4000;

  function isBareMathChar(character) {
    return BARE_MATH_CHARS.has(character);
  }

  function collectProtectedRanges(line) {
    const ranges = [];
    let index = 0;
    while (index < line.length) {
      const character = line[index];
      if (character === '`') {
        let length = 1;
        while (line[index + length] === '`') length++;
        const close = line.indexOf('`'.repeat(length), index + length);
        if (close >= 0) { ranges.push([index, close + length]); index = close + length; continue; }
        index += length; continue;
      }
      if (character === '\\' && (line[index + 1] === '(' || line[index + 1] === '[')) {
        const closer = line[index + 1] === '(' ? '\\)' : '\\]';
        const close = line.indexOf(closer, index + 2);
        if (close >= 0) { ranges.push([index, close + 2]); index = close + 2; continue; }
      }
      if (character === '$') {
        if (line[index + 1] === '$') {
          const close = line.indexOf('$$', index + 2);
          if (close >= 0) { ranges.push([index, close + 2]); index = close + 2; continue; }
          index += 2; continue;
        }
        let close = index + 1;
        while (close < line.length && line[close] !== '$') { if (line[close] === '\\') close++; close++; }
        if (close < line.length) { ranges.push([index, close + 1]); index = close + 1; continue; }
      }
      if (character === '<' && (line[index + 1] === '/' || /[A-Za-z!]/.test(line[index + 1] || ''))) {
        const close = line.indexOf('>', index + 1);
        if (close >= 0) { ranges.push([index, close + 1]); index = close + 1; continue; }
      }
      if ((character === 'h' || character === 'w') && (/^https?:\/\//.test(line.slice(index)) || /^www\./.test(line.slice(index)))) {
        let close = index;
        while (close < line.length && !/[\s<>"'）】]/.test(line[close])) close++;
        ranges.push([index, close]); index = close; continue;
      }
      index++;
    }
    return ranges;
  }

  function braceDepths(line, lo, hi) {
    const depths = new Uint16Array(line.length + 1);
    let depth = 0;
    for (let index = 0; index < line.length; index++) {
      depths[index] = depth;
      if (index < lo || index >= hi) continue;
      if (line[index] === '\\') {
        index++;
        if (index <= line.length) depths[index] = depth;
        continue;
      }
      if (line[index] === '{') depth++;
      else if (line[index] === '}') depth = Math.max(0, depth - 1);
    }
    depths[line.length] = depth;
    return depths;
  }

  function wordEndingAt(line, index, lo) {
    let start = index;
    while (start >= lo && /[A-Za-z]/.test(line[start])) start--;
    return line.slice(start + 1, index + 1);
  }

  function wordStartingAt(line, index, hi) {
    let end = index;
    while (end < hi && /[A-Za-z]/.test(line[end])) end++;
    return line.slice(index, end);
  }

  function expandBareSpan(line, start, end, lo, hi, depths) {
    let left = start, right = end;
    while (left > lo) {
      const character = line[left - 1];
      if (isBareMathChar(character)) { left--; continue; }
      if (character === ' ' || character === '\t') {
        let cut = left - 1;
        while (cut >= lo && (line[cut] === ' ' || line[cut] === '\t')) cut--;
        if (cut < lo || !isBareMathChar(line[cut])) break;
        if (depths[cut] === 0 && BARE_MATH_WORD.test(wordEndingAt(line, cut, lo))) break;
        left = cut;
        continue;
      }
      break;
    }
    while (right < hi) {
      const character = line[right];
      if (isBareMathChar(character)) { right++; continue; }
      if (character === ' ' || character === '\t') {
        let cut = right;
        while (cut < hi && (line[cut] === ' ' || line[cut] === '\t')) cut++;
        if (cut >= hi) { right = cut; break; }
        if (!isBareMathChar(line[cut])) break;
        if (depths[right] === 0 && BARE_MATH_WORD.test(wordStartingAt(line, cut, hi))) break;
        right = cut;
        continue;
      }
      break;
    }
    return [left, right];
  }

  function findBareSpans(line, ranges) {
    const spans = [];
    const intervals = [];
    let cursor = 0;
    for (const [start, end] of ranges) {
      if (start > cursor) intervals.push([cursor, start]);
      cursor = Math.max(cursor, end);
    }
    intervals.push([cursor, line.length]);
    for (const [lo, hi] of intervals) {
      if (hi - lo < 2) continue;
      const depths = braceDepths(line, lo, hi);
      let index = lo;
      while (index < hi) {
        const character = line[index];
        if (character !== '\\' && character !== '^' && character !== '_') { index++; continue; }
        if (character === '\\' && line[index - 1] === '\\') { index++; continue; }
        const trigger = BARE_MATH_TRIGGER.exec(line.slice(index, hi));
        if (!trigger || depths[index] > 0) { index++; continue; }
        const [start, end] = expandBareSpan(line, index, index + trigger[0].length, lo, hi, depths);
        if (end > start) {
          spans.push({ start, end });
          index = end;
        } else index++;
      }
    }
    spans.sort((left, right) => left.start - right.start);
    const merged = [];
    for (const span of spans) {
      const last = merged[merged.length - 1];
      if (last && span.start <= last.end) last.end = Math.max(last.end, span.end);
      else merged.push({ ...span });
    }
    return merged;
  }

  function acceptsBareTeX(raw, displayMode) {
    const base = raw.trim();
    if (!base || base.length > (displayMode ? BARE_DISPLAY_MAX : BARE_MATH_MAX)) return null;
    if (/^[A-Za-z]:[\\/]/.test(base) || base.startsWith('\\\\')) return null;
    // 扁平化的表格行（如「1 x-1 2 x+1 3 x^2+x+1」）不是公式，避免整行被当成数学。
    if ((base.match(/\b\d{1,2}[ \t]+[A-Za-z\\]/g) || []).length >= 3) return null;
    const candidates = [];
    if (base.includes('\\begin{')) {
      // 从网页复制时，对齐环境的换行 \\ 常被吞掉，只剩下行首的 [2mm] 之类间距。
      const aligned = base.replace(/(^|\n)[ \t]*\[(\d*\.?\d+(?:em|mm|cm|pt|ex|px|in|pc))\]/g, '$1\\\\[$2]');
      if (aligned !== base) candidates.push(aligned);
    }
    candidates.push(base);
    // 从网页复制的 \substack{...\\ (k,n)=1} 常被压成 \(k,n)=1，补回换行但不吞掉括号。
    const repaired = base.replace(/\\\(/g, "\\\\(").replace(/\\\)/g, "\\\\)");
    if (repaired !== base) candidates.push(repaired);
    for (const tex of candidates) {
      try {
        katex.renderToString(tex, { throwOnError:true, strict:'ignore', trust:false, displayMode });
        return tex;
      } catch { /* Try the next candidate. */ }
    }
    return null;
  }

  function flattenedTableMarkdown(line) {
    // 网页复制常把两列表格压成「表头表头 1 公式 2 公式 …」的一行。
    if (!line || /^\s/.test(line) || /[|$]/.test(line)) return null;
    const tokens = line.trim().split(/\s+/);
    if (tokens.length < 12 || tokens.length % 2 !== 0) return null;
    const header = tokens.slice(0, 2);
    if (header.some(text => !/^[A-Za-z0-9\\{}()[\]^_+\-*=.,;:'/!<>]+$/.test(text))) return null;
    const rows = [];
    for (let index = 2; index < tokens.length; index += 2) {
      const key = tokens[index], value = tokens[index + 1];
      if (!/^\d{1,3}$/.test(key)) return null;
      if (!/^[A-Za-z0-9\\{}()[\]^_+\-*=.,;:'/!<>]+$/.test(value)) return null;
      rows.push([key, value]);
    }
    for (let index = 0; index < rows.length; index++) {
      if (Number(rows[index][0]) !== Number(rows[0][0]) + index) return null;
    }
    if (rows.filter(([, value]) => /[\\^_]/.test(value)).length < Math.ceil(rows.length / 2)) return null;
    const mathCell = text => /[\\^_+\-=]/.test(text) || /^[A-Za-z]$/.test(text) ? `$${text}$` : text;
    const head = header.map(text => /[\\^_]/.test(text) || /^[A-Za-z]$/.test(text) ? `$${text}$` : text);
    return `| ${head[0]} | ${head[1]} |\n| --- | --- |\n${rows.map(([key, value]) => `| ${key} | ${mathCell(value)} |`).join('\n')}`;
  }

  function transformBareLine(line) {
    if (!/[\\^]|_\{/.test(line)) return line;
    const spans = findBareSpans(line, collectProtectedRanges(line));
    if (!spans.length) return line;
    const trimmedEnd = line.trimEnd().length;
    if (spans.length === 1 && spans[0].start === 0 && spans[0].end === trimmedEnd && !line.slice(trimmedEnd).trim()) {
      const tex = acceptsBareTeX(line, true);
      if (tex) return `\n<div data-md-math="display">${escapeHTML(tex)}</div>\n`;
    }
    let result = '', cursor = 0, changed = false;
    for (const span of spans) {
      const tex = acceptsBareTeX(line.slice(span.start, span.end), false);
      if (!tex) continue;
      result += line.slice(cursor, span.start) + `<span data-md-math="inline">${escapeHTML(tex)}</span>`;
      cursor = span.end;
      changed = true;
    }
    return changed ? result + line.slice(cursor) : line;
  }

  function processBareBlock(lines) {
    const output = lines.slice();
    const protectedLines = new Array(lines.length).fill(false);
    let dollar = false, bracket = false, svg = false;
    for (let index = 0; index < lines.length; index++) {
      const trimmed = lines[index].trim();
      if (svg || /^<svg[\s>]/i.test(trimmed)) {
        protectedLines[index] = true;
        svg = !/<\/svg\s*>/i.test(trimmed);
        continue;
      }
      if (trimmed === '$$') { dollar = !dollar; protectedLines[index] = true; continue; }
      if (trimmed === '\\[' || trimmed === '\\]') { bracket = !bracket; protectedLines[index] = true; continue; }
      if (dollar || bracket) { protectedLines[index] = true; continue; }
      if (/^(?: {4,}|\t)/.test(lines[index])) protectedLines[index] = true;
      else if (/^\s*<[A-Za-z!/]/.test(lines[index]) && !/^\s*<!--\s*md:/.test(lines[index])) protectedLines[index] = true;
    }
    const replaced = new Set();
    for (let index = 0; index < lines.length; index++) {
      if (protectedLines[index]) continue;
      const begin = /^\\begin\{([A-Za-z*]+)\}/.exec(lines[index]);
      if (!begin) continue;
      const endToken = `\\end{${begin[1]}}`;
      if (lines[index].includes(endToken)) continue;
      let end = -1;
      for (let next = index + 1; next < lines.length; next++) {
        if (protectedLines[next]) break;
        if (lines[next].includes(endToken)) { end = next; break; }
      }
      if (end < 0) continue;
      const endAt = lines[end].indexOf(endToken) + endToken.length;
      if (lines[end].slice(endAt).trim()) continue;
      const tex = acceptsBareTeX(lines.slice(index, end + 1).join('\n'), true);
      if (!tex) continue;
      output[index] = `\n<div data-md-math="display">${escapeHTML(tex)}</div>\n`;
      replaced.add(index);
      for (let remove = index + 1; remove <= end; remove++) output[remove] = null;
      index = end;
    }
    for (let index = 0; index < lines.length; index++) {
      if (protectedLines[index] || replaced.has(index) || output[index] === null) continue;
      const table = flattenedTableMarkdown(output[index]);
      if (table) { output[index] = `\n${table}\n`; replaced.add(index); continue; }
      output[index] = transformBareLine(output[index]);
    }
    return output.filter(line => line !== null).join('\n');
  }

  function expandBareMath(source) {
    if (!/[\\^]|_\{/.test(source)) return source;
    const lines = source.replace(/\r\n?/g, '\n').split('\n');
    const output = [];
    let block = [], fenced = false, fence = '';
    const flush = () => { if (block.length) { output.push(processBareBlock(block)); block = []; } };
    for (const line of lines) {
      const match = /^ {0,3}(`{3,}|~{3,})/.exec(line);
      if (fenced) {
        output.push(line);
        if (match && match[1][0] === fence[0] && match[1].length >= fence.length) fenced = false;
        continue;
      }
      if (match) { flush(); fenced = true; fence = match[1]; output.push(line); continue; }
      block.push(line);
    }
    flush();
    return output.join('\n');
  }

  function installMathExtension() {
    if (global.__moyeMathExtensionInstalled) return;
    global.__moyeMathExtensionInstalled = true;
    marked.use({ extensions: [
      {
        name:'displayMathDollar', level:'block', start:source => { const index = source.search(/^\$\$/m); return index < 0 ? undefined : index; },
        tokenizer(source) { const match = /^\$\$[ \t]*([\s\S]*?)[ \t]*\$\$(?:\n|$)/.exec(source); if (match && match[1].trim()) return mathToken('displayMathDollar', match[0], match[1], true); },
        renderer:token => `<div data-md-math="display">${escapeHTML(token.text)}</div>`
      },
      {
        name:'displayMathBracket', level:'block', start:source => { const index = source.search(/^\\\[/m); return index < 0 ? undefined : index; },
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

  // 内嵌 <svg> 整块交给原始 HTML，避免图形里的文字被当成 Markdown 语法。
  function installSVGExtension() {
    if (global.__moyeSVGExtensionInstalled) return;
    global.__moyeSVGExtensionInstalled = true;
    marked.use({ extensions: [
      {
        name:'inlineSvgBlock', level:'block',
        start:source => { const index = source.search(/^ {0,3}<svg[\s>]/i); return index < 0 ? undefined : index; },
        tokenizer(source) {
          const match = SVG_BLOCK.exec(source);
          if (match) return { type:'html', raw:match[0], text:match[0].trim(), block:true };
        }
      },
      {
        name:'inlineSvg', level:'inline',
        start:source => { const index = source.search(/<svg[\s>]/i); return index < 0 ? undefined : index; },
        tokenizer(source) {
          const match = SVG_INLINE.exec(source);
          if (match) return { type:'html', raw:match[0], text:match[0], block:false };
        }
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

  function splitCSSList(text) {
    const parts = [];
    let current = '', quote = '', depth = 0;
    for (let index = 0; index < text.length; index++) {
      const character = text[index];
      if (quote) {
        current += character;
        if (character === '\\') current += text[++index] || '';
        else if (character === quote) quote = '';
        continue;
      }
      if (character === '"' || character === "'") { quote = character; current += character; continue; }
      if (character === '(' || character === '[') depth++;
      else if (character === ')' || character === ']') depth = Math.max(0, depth - 1);
      if (character === ',' && depth === 0) { parts.push(current); current = ''; continue; }
      current += character;
    }
    if (current.trim()) parts.push(current);
    return parts;
  }

  // 只读取顶层样式规则；@media、@import 等条件规则不进入内联流程。
  function cssRules(css) {
    const rules = [];
    let index = 0;
    while (index < css.length) {
      while (index < css.length && /\s/.test(css[index])) index++;
      if (css.startsWith('/*', index)) {
        const close = css.indexOf('*/', index + 2);
        index = close < 0 ? css.length : close + 2;
        continue;
      }
      const start = index;
      let quote = '', depth = 0, open = -1;
      while (index < css.length) {
        const character = css[index];
        if (quote) {
          if (character === '\\') index++;
          else if (character === quote) quote = '';
        } else if (character === '"' || character === "'") quote = character;
        else if (css.startsWith('/*', index)) {
          const close = css.indexOf('*/', index + 2);
          index = close < 0 ? css.length : close + 1;
        } else if (character === '(') depth++;
        else if (character === ')') depth = Math.max(0, depth - 1);
        else if (character === '{' && depth === 0) { open = index; break; }
        else if (character === ';' && depth === 0) break;
        index++;
      }
      const prelude = css.slice(start, index).trim();
      if (open < 0 || index >= css.length || css[index] === ';') { index++; continue; }
      quote = '';
      depth = 1;
      index++;
      while (index < css.length && depth) {
        const character = css[index];
        if (quote) {
          if (character === '\\') index++;
          else if (character === quote) quote = '';
        } else if (character === '"' || character === "'") quote = character;
        else if (css.startsWith('/*', index)) {
          const close = css.indexOf('*/', index + 2);
          index = close < 0 ? css.length : close + 1;
        } else if (character === '{') depth++;
        else if (character === '}') depth--;
        index++;
      }
      if (!prelude.startsWith('@')) rules.push({ selector:prelude, body:css.slice(open + 1, Math.max(open + 1, index - 1)) });
    }
    return rules;
  }

  // SVG 内的 <style> 一旦留在页面里会作用于整篇文档。这里把规则展开到
  // 匹配的元素上，再移除 <style>，样式便只跟随这张图。
  function inlineSVGStyles(svg) {
    for (const style of [...svg.querySelectorAll('style')]) {
      for (const rule of cssRules(style.textContent || '')) {
        for (const selector of splitCSSList(rule.selector)) {
          const rootOnly = /^(?::root|svg)$/i.test(selector.trim());
          let target = selector.trim().replace(/^:root\b/i, '').replace(/^svg\b/i, '').replace(/^[\s>+~]+/, '').trim() || '*';
          let nodes;
          try { nodes = rootOnly ? [svg] : [...svg.querySelectorAll(target)]; } catch { continue; }
          for (const node of nodes) {
            if (!node.style) continue;
            node.style.cssText = `${node.style.cssText}${node.style.cssText ? ';' : ''}${rule.body}`;
          }
        }
      }
      style.remove();
    }
  }

  // 图形内部 id 加前缀，避免多张图或页面元素互相覆盖引用。
  function scopeSVG(svg) {
    inlineSVGStyles(svg);
    const scope = `md-svg-${++svgSequence}`;
    const elements = [svg, ...svg.querySelectorAll('*')];
    const idNodes = elements.filter(node => node.hasAttribute('id'));
    const ids = new Set(idNodes.map(node => node.getAttribute('id')).filter(Boolean));
    const rename = id => ids.has(id) ? `${scope}-${id}` : id;
    for (const element of elements) {
      for (const name of SVG_BLOCKED_STYLES) element.style?.removeProperty(name);
      for (const name of element.getAttributeNames()) {
        if (name === 'id') continue;
        const value = element.getAttribute(name);
        if (!value) continue;
        let next = value;
        if (name === 'aria-labelledby' || name === 'aria-describedby') next = value.split(/\s+/).map(rename).join(' ');
        else if (value.includes('#')) {
          next = value.replace(/url\(\s*(['"]?)#([^)'"\s]+)\1\s*\)/g, (match, quote, id) => `url(${quote}#${rename(id)}${quote})`);
          if ((name === 'href' || name === 'xlink:href') && next.startsWith('#')) next = `#${rename(next.slice(1))}`;
        }
        if (next !== value) element.setAttribute(name, next);
      }
    }
    for (const node of idNodes) node.setAttribute('id', `${scope}-${node.getAttribute('id')}`);
  }

  function prepareContent(root) {
    for (const style of [...root.querySelectorAll('style')]) if (!style.closest('svg')) style.remove();
    for (const element of root.querySelectorAll('[style]')) if (!element.closest('svg')) element.removeAttribute('style');
    for (const element of root.querySelectorAll('[id]')) if (!element.closest('svg')) element.removeAttribute('id');
    for (const input of [...root.querySelectorAll('input')]) {
      if (input.getAttribute('type') !== 'checkbox' || !input.hasAttribute('disabled')) { input.remove(); continue; }
      for (const attribute of [...input.attributes]) if (!['type', 'checked', 'disabled'].includes(attribute.name)) input.removeAttribute(attribute.name);
    }
    for (const svg of root.querySelectorAll('svg')) if (!svg.parentElement?.closest('svg')) scopeSVG(svg);
  }

  function sanitize(html) {
    return DOMPurify.sanitize(html, {
      USE_PROFILES:{ html:true, svg:true, svgFilters:true },
      FORBID_TAGS:['form','button','select','option','optgroup','datalist','textarea','label','fieldset','legend','output','meter','progress','dialog','iframe','object','embed','video','audio'],
      FORBID_ATTR:['name','srcset','autofocus','tabindex','hidden'],
      ALLOW_DATA_ATTR:false,
      ADD_ATTR:['data-md-math']
    });
  }

  function renderMath(root) {
    for (const placeholder of root.querySelectorAll('[data-md-math]')) {
      const displayMode = placeholder.dataset.mdMath === 'display';
      const source = placeholder.textContent;
      const wrapper = document.createElement(displayMode ? 'div' : 'span');
      wrapper.className = displayMode ? 'math-display' : 'math-inline';
      try {
        if (source.length > (displayMode ? MAX_DISPLAY_MATH : MAX_INLINE_MATH)) throw new Error('公式过长');
        // maxSize 限制 \rule、\kern 等用户指定尺寸，避免单个公式撑出整页。
        katex.render(source, wrapper, { displayMode, throwOnError:false, strict:'ignore', trust:false, maxSize:20, output:'htmlAndMathml', errorColor:'#7c0a21' });
      } catch {
        // 深层嵌套等极端输入可能抛出非 ParseError；保留原文，不中断整篇文档。
        wrapper.classList.add('math-error');
        wrapper.style.cssText = 'color:#7c0a21;white-space:pre-wrap;overflow-wrap:anywhere';
        wrapper.textContent = source.length > 600 ? `${source.slice(0, 600)}…` : source;
      }
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
      installSVGExtension();
    }

    parse(markdown, options = {}) {
      const baseURL = options.baseURL || this.baseURL;
      const images = options.images || this.images;
      const tokens = marked.lexer(expandBareMath(markdown));
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
          prepareContent(template.content);
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
          if (node.localName === 'a') {
            node.setAttribute('rel', 'noopener noreferrer');
            if (/^https?:/.test(node.getAttribute('href') || '')) node.setAttribute('target', '_blank');
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
