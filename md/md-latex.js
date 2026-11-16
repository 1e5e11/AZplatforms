/* 墨页 LaTeX 文档转换器：把常见 LaTeX 结构转换成可清理的 HTML，公式交给 KaTeX。 */
((global) => {
  'use strict';

  const SECTION_DEPTH = { part:1, chapter:1, section:1, subsection:2, subsubsection:3, paragraph:4, subparagraph:5 };
  const BOOK_DEPTH = { part:1, chapter:1, section:2, subsection:3, subsubsection:4, paragraph:5, subparagraph:6 };
  const TAGS = ['', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const ENV_ARGS = { tabular:1, 'tabular*':2, tabularx:2, longtable:1, minted:1, thebibliography:1, minipage:1, multicols:1, wrapfigure:1, adjustbox:1 };
  const MATH_ENVS = new Set(['equation','equation*','align','align*','alignat','alignat*','gather','gather*','multline','multline*','eqnarray','eqnarray*','displaymath','math','array','split','aligned','gathered','cases','matrix','pmatrix','bmatrix','Bmatrix','vmatrix','Vmatrix','smallmatrix']);
  const THEOREMS = { theorem:'定理', lemma:'引理', proposition:'命题', corollary:'推论', definition:'定义', remark:'注', example:'例', proof:'证明', assumption:'假设', claim:'断言', conjecture:'猜想', notation:'记号', observation:'观察' };
  const DROP_ARGS = new Set(['documentclass','usepackage','geometry','hypersetup','pagestyle','thispagestyle','pagenumbering','setlength','addtolength','setcounter','addtocounter','newcommand','renewcommand','providecommand','DeclareMathOperator','newenvironment','renewenvironment','bibliographystyle','bibliography','addbibresource','graphicspath','captionsetup','sisetup','setmainfont','setsansfont','setmonofont','babelfont','babelprovide','titleformat','titlespacing','hyphenation','vspace','hspace','vskip','hskip','linespread','fontsize','index','glossary','thanks','footnotemark','footnotetext','color','definecolor','pagecolor','caption','tag']);
  const DROP = new Set(['noindent','indent','centering','raggedright','raggedleft','smallskip','medskip','bigskip','linebreak','nopagebreak','protect','relax','leavevmode','ignorespaces','unskip','small','footnotesize','scriptsize','tiny','large','Large','LARGE','huge','Huge','normalsize','bfseries','itshape','mdseries','upshape','slshape','scshape','ttfamily','sffamily','rmfamily','selectfont','appendix','listoffigures','listoftables','hline','kill','hfill','vfill','dotfill','hrulefill','clearpage','newpage','pagebreak','cleardoublepage','enspace','thinspace','negthinspace','!','@','-','/',' ','item','bibitem','maketitle','tableofcontents']);
  const SYMBOLS = {
    alpha:'α', beta:'β', gamma:'γ', delta:'δ', epsilon:'ε', varepsilon:'ε', zeta:'ζ', eta:'η', theta:'θ', vartheta:'ϑ', iota:'ι', kappa:'κ', lambda:'λ', mu:'μ', nu:'ν', xi:'ξ', pi:'π', varpi:'ϖ', rho:'ρ', varrho:'ϱ', sigma:'σ', varsigma:'ς', tau:'τ', upsilon:'υ', phi:'φ', varphi:'φ', chi:'χ', psi:'ψ', omega:'ω',
    Gamma:'Γ', Delta:'Δ', Theta:'Θ', Lambda:'Λ', Xi:'Ξ', Pi:'Π', Sigma:'Σ', Upsilon:'Υ', Phi:'Φ', Psi:'Ψ', Omega:'Ω',
    pm:'±', mp:'∓', times:'×', div:'÷', cdot:'·', le:'≤', leq:'≤', ge:'≥', geq:'≥', ne:'≠', neq:'≠', approx:'≈', equiv:'≡', infty:'∞', partial:'∂', nabla:'∇', sum:'∑', prod:'∏', int:'∫', oint:'∮', to:'→', rightarrow:'→', leftarrow:'←', Rightarrow:'⇒', Leftarrow:'⇐', leftrightarrow:'↔', mapsto:'↦', in:'∈', notin:'∉', subset:'⊂', subseteq:'⊆', cup:'∪', cap:'∩', forall:'∀', exists:'∃', emptyset:'∅', angle:'∠', perp:'⊥', parallel:'∥', degree:'°', circ:'∘', prime:'′', ldots:'…', dots:'…', cdots:'⋯', S:'§', P:'¶', copyright:'©', textregistered:'®', texttrademark:'™', textdegree:'°', textbackslash:'\\', textasciitilde:'~', textasciicircum:'^', textunderscore:'_', textbar:'|', textless:'&lt;', textgreater:'&gt;', textellipsis:'…'
  };
  const COMMAND = /\\([A-Za-z@]+)(\*?)/y;
  const ENV_TOKEN = /\\(begin|end)\s*\{([^{}]+)\}/y;
  const SECTION_CMD = /^\\(part|chapter|section|subsection|subsubsection|paragraph|subparagraph)(\*?)/;
  const PAGE_CMD = /^\\(newpage|clearpage|cleardoublepage|pagebreak)\b/;
  const CONTROL_SYMBOL = /^\\([%&_#{}$\\])/;

  function escapeHTML(text) {
    return String(text).replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[character]);
  }

  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function readGroup(text, index, open = '{', close = '}') {
    let depth = 0;
    for (let cursor = index; cursor < text.length; cursor++) {
      const character = text[cursor];
      if (character === '\\') { cursor++; continue; }
      if (character === open) depth++;
      else if (character === close) { depth--; if (depth === 0) return { value:text.slice(index + 1, cursor), end:cursor + 1 }; }
    }
    return null;
  }

  function parseCommand(text, index, groupsWanted = 0) {
    COMMAND.lastIndex = index;
    const match = COMMAND.exec(text);
    if (!match) return null;
    let end = index + match[0].length;
    while (/\s/.test(text[end] || '')) end++;
    let optional = null;
    if (text[end] === '[') { const group = readGroup(text, end, '[', ']'); if (group) { optional = group.value; end = group.end; } }
    const groups = [];
    for (let count = 0; count < groupsWanted; count++) {
      while (/\s/.test(text[end] || '')) end++;
      if (text[end] !== '{') break;
      const group = readGroup(text, end, '{', '}');
      if (!group) break;
      groups.push(group.value); end = group.end;
    }
    return { name:match[1], starred:!!match[2], optional, groups, end };
  }

  function findEnvironment(text, index, name) {
    ENV_TOKEN.lastIndex = index;
    const match = ENV_TOKEN.exec(text);
    if (!match || match[1] !== 'begin' || match[2] !== name) return null;
    const argsWanted = ENV_ARGS[name] || 0;
    let end = index + match[0].length;
    while (/\s/.test(text[end] || '')) end++;
    let optional = null;
    if (text[end] === '[') { const group = readGroup(text, end, '[', ']'); if (group) { optional = group.value; end = group.end; } }
    const args = [];
    for (let count = 0; count < argsWanted; count++) {
      while (/\s/.test(text[end] || '')) end++;
      if (text[end] !== '{') break;
      const group = readGroup(text, end, '{', '}');
      if (!group) break;
      args.push(group.value); end = group.end;
    }
    const escaped = escapeRegExp(name);
    const open = new RegExp(`\\\\begin\\s*\\{${escaped}\\}`, 'g');
    const close = new RegExp(`\\\\end\\s*\\{${escaped}\\}`, 'g');
    let depth = 1, cursor = end;
    while (cursor < text.length) {
      open.lastIndex = cursor; close.lastIndex = cursor;
      const nextOpen = open.exec(text), nextClose = close.exec(text);
      if (!nextClose) return null;
      if (nextOpen && nextOpen.index < nextClose.index) { depth++; cursor = open.lastIndex; }
      else {
        depth--; cursor = close.lastIndex;
        if (depth === 0) return { optional, args, content:text.slice(end, nextClose.index), end:close.lastIndex };
      }
    }
    return null;
  }

  function protectVerbatim(text) {
    const stored = [];
    const keep = match => `\u0000MOYEV${stored.push(match) - 1}\u0000`;
    text = text.replace(/\\begin\{(verbatim\*?|Verbatim|lstlisting|minted)\}[\s\S]*?\\end\{\1\}/g, keep);
    text = text.replace(/\\verb\*?([^A-Za-z\s])([\s\S]*?)\1/g, keep);
    return { text, restore:value => value.replace(/\u0000MOYEV(\d+)\u0000/g, (match, index) => stored[index]) };
  }

  function stripComments(text) {
    return text.split('\n').map(line => line.replace(/(^|[^\\])%.*$/, '$1')).join('\n');
  }

  function mathDisplay(tex) {
    return `<div data-md-math="display">${escapeHTML(tex)}</div>`;
  }

  function mathInline(tex) {
    return `<span data-md-math="inline">${escapeHTML(tex)}</span>`;
  }

  function inlineMathAt(text, index) {
    let cursor = index + 1;
    while (cursor < text.length) {
      if (text[cursor] === '\\') { cursor += 2; continue; }
      if (text[cursor] === '$' && text[cursor + 1] !== '$') return cursor;
      cursor++;
    }
    return -1;
  }

  function formatLength(value) {
    const text = value.trim();
    const width = /^([\d.]+)\s*\\(?:textwidth|linewidth|columnwidth)$/.exec(text);
    if (width) return String(Math.round(Number(width[1]) * 800));
    if (/^\\(?:textwidth|linewidth|columnwidth)$/.test(text)) return '800';
    const unit = /^([\d.]+)\s*(cm|mm|in|pt|pc|px|em)$/.exec(text);
    if (!unit) return null;
    const factor = { cm:37.8, mm:3.78, in:96, pt:4 / 3, pc:16, px:1, em:16 }[unit[2]];
    return String(Math.round(Number(unit[1]) * factor));
  }

  function imageHTML(parsed, state) {
    const path = (parsed.groups[0] || '').trim();
    if (!path) return '';
    if (/\.pdf$/i.test(path)) return `<a class="latex-pdf" href="${escapeHTML(path)}">PDF 图像：${escapeHTML(path.split('/').pop())}</a>`;
    const options = new Map();
    for (const part of (parsed.optional || '').split(',')) {
      const pair = /^\s*([A-Za-z]+)\s*=\s*(.+?)\s*$/.exec(part);
      if (pair) options.set(pair[1].toLowerCase(), pair[2]);
    }
    const width = options.has('width') ? formatLength(options.get('width')) : null;
    const height = options.has('height') ? formatLength(options.get('height')) : null;
    const alt = path.split('/').pop().replace(/\.[^.]+$/, '');
    return `<img class="latex-image" src="${escapeHTML(path)}" alt="${escapeHTML(alt)}"${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''}>`;
  }

  function inlineHTML(text, state) {
    let html = '', index = 0;
    while (index < text.length) {
      const character = text[index];
      if (text.startsWith('\\\\', index)) {
        index += 2;
        while (/\s/.test(text[index] || '')) index++;
        if (text[index] === '[') { const group = readGroup(text, index, '[', ']'); if (group) index = group.end; }
        html += '<br>'; continue;
      }
      if (character === '$') {
        if (text[index + 1] === '$') {
          const close = text.indexOf('$$', index + 2);
          if (close > index + 2) { html += mathDisplay(text.slice(index + 2, close)); index = close + 2; continue; }
        } else {
          const close = inlineMathAt(text, index);
          if (close > index + 1) { html += mathInline(text.slice(index + 1, close)); index = close + 1; continue; }
        }
      }
      if (text.startsWith('\\[', index)) {
        const close = text.indexOf('\\]', index + 2);
        if (close > index + 2) { html += mathDisplay(text.slice(index + 2, close)); index = close + 2; continue; }
      }
      if (text.startsWith('\\(', index)) {
        const close = text.indexOf('\\)', index + 2);
        if (close > index + 2) { html += mathInline(text.slice(index + 2, close)); index = close + 2; continue; }
      }
      if (character === '\\') {
        const verb = /^\\verb\*?([^A-Za-z\s])([\s\S]*?)\1/.exec(text.slice(index));
        if (verb) { html += `<code>${escapeHTML(verb[2])}</code>`; index += verb[0].length; continue; }
        if (text.startsWith('\\ ', index)) { html += ' '; index += 2; continue; }
        const symbol = CONTROL_SYMBOL.exec(text.slice(index));
        if (symbol) {
          const value = symbol[1];
          index += symbol[0].length;
          if (value === '\\') html += '<br>';
          else if (value === ' ') html += ' ';
          else if (value === '~') html += '&nbsp;';
          else html += escapeHTML(value);
          continue;
        }
        const command = /^\\([A-Za-z@]+)(\*?)/.exec(text.slice(index));
        if (!command) {
          const accent = /^\\([\'`^"=~.])(?:\{([^{}]*)\}|(.))/.exec(text.slice(index));
          if (accent) { html += escapeHTML(accent[2] || accent[3] || ''); index += accent[0].length; continue; }
          const spacing = /^\\([,;:!])/.exec(text.slice(index));
          if (spacing) { html += ' '; index += spacing[0].length; continue; }
          html += '\\'; index++; continue;
        }
        const name = command[1];
        const arity = { textbf:1, textit:1, emph:1, textsl:1, textsc:1, texttt:1, textsf:1, textrm:1, textnormal:1, underline:1, uline:1, textsuperscript:1, textsubscript:1, textcolor:2, colorbox:2, fbox:1, href:2, url:1, includegraphics:1, footnote:1, cite:1, citep:1, citet:1, parencite:1, textcite:1, autocite:1, ref:1, eqref:1, pageref:1, autoref:1, label:1, index:1, input:1, include:1 }[name];
        const parsed = parseCommand(text, index, arity === undefined ? 2 : arity);
        if (!parsed) { html += escapeHTML(character); index++; continue; }
        const group = number => inlineHTML(parsed.groups[number] || '', state);
        const wrap = (tag, content) => `<${tag}>${content}</${tag}>`;
        if (name === 'textbf' || name === 'bf') html += wrap('strong', group(0));
        else if (name === 'textit' || name === 'emph') html += wrap('em', group(0));
        else if (name === 'textsl') html += wrap('em', group(0));
        else if (name === 'textsc') html += `<span class="latex-smallcaps">${group(0)}</span>`;
        else if (name === 'texttt') html += `<code>${group(0)}</code>`;
        else if (name === 'textsf') html += `<span class="latex-sans">${group(0)}</span>`;
        else if (name === 'textrm' || name === 'textnormal') html += group(0);
        else if (name === 'underline' || name === 'uline') html += wrap('u', group(0));
        else if (name === 'textsuperscript') html += wrap('sup', group(0));
        else if (name === 'textsubscript') html += wrap('sub', group(0));
        else if (name === 'textcolor') html += group(1);
        else if (name === 'colorbox') html += group(1);
        else if (name === 'fbox') html += `<span class="latex-fbox">${group(0)}</span>`;
        else if (name === 'href') html += `<a href="${escapeHTML(parsed.groups[0] || '')}">${group(1)}</a>`;
        else if (name === 'url') { const url = parsed.groups[0] || ''; html += `<a href="${escapeHTML(url)}">${escapeHTML(url)}</a>`; }
        else if (name === 'includegraphics') html += imageHTML(parsed, state);
        else if (name === 'footnote') { state.footnotes.push(parsed.groups[0] || ''); html += `<sup class="latex-footnote">[${state.footnotes.length}]</sup>`; }
        else if (['cite','citep','citet','parencite','textcite','autocite'].includes(name)) {
          const keys = (parsed.groups[0] || '').split(',').map(key => key.trim()).filter(Boolean);
          const numbers = keys.map(key => state.bibNumbers.get(key));
          html += `<span class="latex-cite">[${numbers.every(Boolean) ? numbers.join(',') : keys.join(',')}]</span>`;
        } else if (name === 'ref' || name === 'autoref') { const key = (parsed.groups[0] || '').trim(); html += `<span class="latex-ref">${escapeHTML(state.labels[key] || key || '?')}</span>`; }
        else if (name === 'eqref') { const key = (parsed.groups[0] || '').trim(); html += `<span class="latex-ref">(${escapeHTML(state.labels[key] || '?')})</span>`; }
        else if (name === 'pageref') html += '<span class="latex-ref">?</span>';
        else if (name === 'label') { const key = (parsed.groups[0] || '').trim(); if (state.lastNumber) state.labels[key] = state.lastNumber; }
        else if (SYMBOLS[name]) html += SYMBOLS[name];
        else if (name === 'today') html += new Date().toLocaleDateString('zh-CN');
        else if (name === 'and') html += ' · ';
        else if (name === 'newline') html += '<br>';
        else if (name === 'quad' || name === 'qquad') html += ' ';
        else if (name === 'frac' || name === 'dfrac' || name === 'tfrac') html += `${group(0)}/${group(1)}`;
        else if (name === 'sqrt') html += `√${group(0)}`;
        else if (name === 'input' || name === 'include') html += `<span class="latex-note">（未载入 ${escapeHTML(parsed.groups[0] || '')}）</span>`;
        else if (DROP_ARGS.has(name)) { /* 丢弃命令和参数 */ }
        else if (DROP.has(name)) { /* 丢弃排版命令 */ }
        else html += parsed.groups.map(value => inlineHTML(value, state)).filter(Boolean).join(' ');
        index = parsed.end;
        continue;
      }
      if (character === '~') { html += '&nbsp;'; index++; continue; }
      if (text.startsWith('---', index)) { html += '—'; index += 3; continue; }
      if (text.startsWith('--', index)) { html += '–'; index += 2; continue; }
      if (text.startsWith('``', index)) { html += '“'; index += 2; continue; }
      if (text.startsWith("''", index)) { html += '”'; index += 2; continue; }
      if (character === '`') { html += '‘'; index++; continue; }
      if (character === "'") { html += '’'; index++; continue; }
      html += escapeHTML(character);
      index++;
    }
    return html;
  }

  function splitRows(text) {
    const rows = [];
    let current = '', depth = 0;
    for (let index = 0; index < text.length; index++) {
      const character = text[index];
      if (character === '\\') {
        if (text.startsWith('\\\\', index) && depth === 0) { rows.push(current); current = ''; index++; continue; }
        current += character; index++; if (index < text.length) current += text[index]; continue;
      }
      if (character === '{') depth++;
      else if (character === '}') depth = Math.max(0, depth - 1);
      current += character;
    }
    if (current.trim()) rows.push(current);
    return rows;
  }

  function splitCells(row) {
    const cells = [];
    let current = '', depth = 0;
    for (let index = 0; index < row.length; index++) {
      const character = row[index];
      if (character === '\\') { current += character; index++; if (index < row.length) current += row[index]; continue; }
      if (character === '{') depth++;
      else if (character === '}') depth = Math.max(0, depth - 1);
      if (character === '&' && depth === 0) { cells.push(current); current = ''; continue; }
      current += character;
    }
    cells.push(current);
    return cells;
  }

  function tableCell(cell, state) {
    let content = cell, colspan = 0;
    const multi = /^\s*\\multicolumn\s*\{\s*(\d+)\s*\}\s*\{[^{}]*\}\s*\{([\s\S]*)\}\s*$/.exec(cell);
    if (multi) { colspan = Number(multi[1]); content = multi[2]; }
    const multirow = /^\s*\\multirow\s*\{\s*\d+\s*\}\s*\{[^{}]*\}\s*\{([\s\S]*)\}\s*$/.exec(content);
    if (multirow) content = multirow[1];
    content = content.replace(/\\hline|\\cline\s*\{[^{}]*\}/g, '');
    return { html:inlineHTML(content, state), colspan, rowspan:multirow ? 2 : 0 };
  }

  function tabularHTML(content, state) {
    let cleaned = content.replace(/\\(?:hline|toprule|midrule|bottomrule|addlinespace|endhead|endfirsthead|endfoot|endlastfoot|noalign)\b/g, '').replace(/\\cline\s*\{[^{}]*\}/g, '');
    const secondBreak = (() => { let count = 0; for (let index = 0; index < cleaned.length - 1; index++) { if (cleaned[index] === '\\' && cleaned[index + 1] === '\\') { if (++count === 2) return index; index++; } } return -1; })();
    const headerRule = /\\(?:hline|midrule|toprule|bottomrule)\b/.test(cleaned.slice(0, secondBreak < 0 ? cleaned.length : secondBreak));
    const rows = splitRows(cleaned).map(row => splitCells(row).map(cell => tableCell(cell, state))).filter(row => row.some(cell => cell.html.trim()));
    if (!rows.length) return '';
    const head = headerRule && rows.length > 1 ? rows.shift() : null;
    const body = rows.map(row => `<tr>${row.map(cell => `<td${cell.colspan ? ` colspan="${cell.colspan}"` : ''}${cell.rowspan ? ` rowspan="${cell.rowspan}"` : ''}>${cell.html}</td>`).join('')}</tr>`).join('');
    const headHTML = head ? `<thead><tr>${head.map(cell => `<th${cell.colspan ? ` colspan="${cell.colspan}"` : ''}>${cell.html}</th>`).join('')}</tr></thead>` : '';
    return `<div class="latex-table-wrap"><table>${headHTML}<tbody>${body}</tbody></table></div>`;
  }

  function splitItems(content) {
    const items = [];
    let current = '', label = null, started = false, envDepth = 0, braceDepth = 0;
    for (let index = 0; index < content.length;) {
      if (content.startsWith('\\begin{', index)) { envDepth++; current += '\\begin{'; index += 7; continue; }
      if (content.startsWith('\\end{', index)) { envDepth = Math.max(0, envDepth - 1); current += '\\end{'; index += 5; continue; }
      if (envDepth === 0 && braceDepth === 0 && content.startsWith('\\item', index) && !/[A-Za-z]/.test(content[index + 5] || '')) {
        if (started) items.push({ label, content:current });
        current = ''; label = null; started = true;
        index += 5;
        while (/\s/.test(content[index] || '')) index++;
        if (content[index] === '[') { const group = readGroup(content, index, '[', ']'); if (group) { label = group.value; index = group.end; } }
        continue;
      }
      const character = content[index];
      if (character === '\\') { current += character; index++; if (index < content.length) current += content[index++]; continue; }
      if (character === '{') braceDepth++;
      else if (character === '}') braceDepth = Math.max(0, braceDepth - 1);
      current += character; index++;
    }
    if (started) items.push({ label, content:current });
    return items;
  }

  function unwrapParagraph(html) {
    const match = /^<p>([\s\S]*)<\/p>$/.exec(html);
    return match ? match[1] : html;
  }

  function blocksToHTML(nodes) {
    return nodes.map(node => node.pageBreak ? '' : node.html).join('\n');
  }

  function listHTML(name, content, state) {
    const items = splitItems(content);
    if (name === 'description') {
      return `<dl class="latex-description">${items.map(item => `<dt>${inlineHTML(item.label || '', state)}</dt><dd>${unwrapParagraph(blocksToHTML(parseBlocks(item.content, state)))}</dd>`).join('')}</dl>`;
    }
    const tag = name === 'enumerate' ? 'ol' : 'ul';
    return `<${tag}>${items.map(item => `<li>${unwrapParagraph(blocksToHTML(parseBlocks(item.content, state)))}</li>`).join('')}</${tag}>`;
  }

  function figureHTML(name, found, state) {
    let content = found.content, caption = '', labels = [];
    for (const match of content.matchAll(/\\label\s*\{([^}]+)\}/g)) labels.push(match[1]);
    content = content.replace(/\\label\s*\{[^}]*\}/g, '');
    const captionAt = content.search(/\\caption\b/);
    if (captionAt >= 0) {
      const parsed = parseCommand(content, captionAt, 1);
      if (parsed) { caption = parsed.groups[0] || ''; content = content.slice(0, captionAt) + content.slice(parsed.end); }
    }
    const isTable = name === 'table';
    let number = '';
    if (caption) { const counter = isTable ? 'table' : 'figure'; state.counters[counter] = (state.counters[counter] || 0) + 1; number = String(state.counters[counter]); state.lastNumber = number; }
    for (const label of labels) state.labels[label] = number || '?';
    const body = isTable ? blocksToHTML(parseBlocks(content, state)) : inlineHTML(content.replace(/\n/g, ' '), state);
    const label = caption ? `<figcaption><span class="latex-number">${isTable ? '表' : '图'} ${number}</span> ${inlineHTML(caption, state)}</figcaption>` : '';
    return `<figure class="latex-figure${isTable ? ' latex-table-figure' : ''}">${body}${label}</figure>`;
  }

  function theoremHTML(name, found, state, starred = false) {
    const label = THEOREMS[name] || name;
    let number = '';
    if (!starred && name !== 'proof') { state.counters[name] = (state.counters[name] || 0) + 1; number = String(state.counters[name]); }
    const title = found.optional ? `（${inlineHTML(found.optional, state)}）` : '';
    const body = blocksToHTML(parseBlocks(found.content, state));
    return `<div class="latex-theorem latex-${escapeRegExp(name)}"><p class="latex-theorem-head"><strong>${label}${number ? ` ${number}` : ''}</strong>${title}${name === 'proof' ? '' : '.'}</p>${body}${name === 'proof' ? '<span class="latex-qed">□</span>' : ''}</div>`;
  }

  function bibliographyHTML(content, state) {
    const items = [];
    const pattern = /\\bibitem\s*(?:\[[^\]]*\])?\s*\{([^}]+)\}/g;
    const matches = [...content.matchAll(pattern)];
    for (let index = 0; index < matches.length; index++) {
      const start = matches[index].index + matches[index][0].length;
      const end = index + 1 < matches.length ? matches[index + 1].index : content.length;
      const number = state.bibNumbers.get(matches[index][1].trim()) || index + 1;
      items.push(`<li value="${number}">${inlineHTML(content.slice(start, end).trim(), state)}</li>`);
    }
    return `<section class="latex-bibliography"><p class="latex-section-label">参考文献</p><ol>${items.join('')}</ol></section>`;
  }

  function mathEnvironmentHTML(name, found, state) {
    const base = name.replace(/\*$/, ''), starred = name !== base;
    let tex = found.content;
    const labels = [...tex.matchAll(/\\label\s*\{([^}]+)\}/g)].map(match => match[1]);
    tex = tex.replace(/\\label\s*\{[^}]*\}/g, '').replace(/\\(?:nonumber|notag)\b/g, '');
    if (base === 'align' || base === 'eqnarray' || base === 'alignat') tex = `\\begin{aligned}${tex}\\end{aligned}`;
    else if (base === 'gather' || base === 'multline') tex = `\\begin{gathered}${tex}\\end{gathered}`;
    else if (base === 'array') tex = `\\begin{array}{${found.args[0] || 'c'}}${tex}\\end{array}`;
    else if (['split','aligned','gathered','cases','matrix','pmatrix','bmatrix','Bmatrix','vmatrix','Vmatrix','smallmatrix'].includes(base)) tex = `\\begin{${base}}${tex}\\end{${base}}`;
    let number = '';
    if (!starred && !/\\tag\s*\{/.test(tex)) {
      state.counters.equation = (state.counters.equation || 0) + 1;
      number = String(state.counters.equation);
      tex += `\\tag{${number}}`;
    }
    for (const label of labels) state.labels[label] = number || '?';
    return mathDisplay(tex.trim());
  }

  function verbatimHTML(name, found) {
    let language = '';
    if (name === 'minted') language = found.args[0] || '';
    else if (name === 'lstlisting' && found.optional) language = /\blanguage\s*=\s*([A-Za-z0-9_+-]+)/.exec(found.optional)?.[1] || '';
    return `<pre class="latex-verbatim"><code${language ? ` class="language-${escapeHTML(language)}"` : ''}>${escapeHTML(found.content.replace(/^\n/, '').replace(/\n$/, ''))}</code></pre>`;
  }

  function renderEnvironment(name, found, state) {
    const base = name.replace(/\*$/, '');
    if (MATH_ENVS.has(name)) return [{ html:mathEnvironmentHTML(name, found, state) }];
    if (name === 'itemize' || name === 'enumerate' || name === 'description') return [{ html:listHTML(name, found.content, state) }];
    if (base === 'figure' || base === 'table') return [{ html:figureHTML(base, found, state) }];
    if (base === 'tabular' || base === 'tabularx' || base === 'longtable') return [{ html:tabularHTML(found.content, state) }];
    if (name === 'abstract') return [{ html:`<div class="latex-abstract"><p class="latex-section-label">摘要</p>${blocksToHTML(parseBlocks(found.content, state))}</div>` }];
    if (name === 'quote' || name === 'quotation' || name === 'verse') return [{ html:`<blockquote class="latex-quote">${blocksToHTML(parseBlocks(found.content, state))}</blockquote>` }];
    if (name === 'center' || name === 'flushleft' || name === 'flushright') return [{ html:`<div class="latex-${name}">${blocksToHTML(parseBlocks(found.content, state))}</div>` }];
    if (name === 'verbatim' || name === 'verbatim*' || name === 'Verbatim' || name === 'lstlisting' || name === 'minted') return [{ html:verbatimHTML(name, found) }];
    if (name === 'thebibliography') return [{ html:bibliographyHTML(found.content, state) }];
    if (THEOREMS[base]) return [{ html:theoremHTML(base, found, state, name !== base) }];
    if (name === 'document' || name === 'minipage' || name === 'multicols' || name === 'adjustbox' || name === 'landscape') return [{ html:blocksToHTML(parseBlocks(found.content, state)) }];
    return [{ html:`<div class="latex-environment latex-env-${name.replace(/[^A-Za-z0-9_-]/g, '-')}"><p class="latex-env-label">${escapeHTML(base)}</p>${blocksToHTML(parseBlocks(found.content, state))}</div>` }];
  }

  function renderSection(match, title, state) {
    if (match[1] === 'part') return `<h1 class="latex-heading latex-part">${inlineHTML(title, state)}</h1>`;
    const depth = (state.book ? BOOK_DEPTH : SECTION_DEPTH)[match[1]] || 1;
    const tag = TAGS[depth] || 'h6';
    state.counters[depth] = (state.counters[depth] || 0) + 1;
    for (let index = depth + 1; index <= 6; index++) state.counters[index] = 0;
    let number = '';
    if (!match[2]) { number = state.counters.slice(1, depth + 1).join('.'); state.lastNumber = number; }
    return `<${tag} class="latex-heading">${number ? `<span class="latex-number">${number}</span> ` : ''}${inlineHTML(title, state)}</${tag}>`;
  }

  function titleHTML(state) {
    if (!state.title) return '';
    return `<header class="latex-title"><h1>${inlineHTML(state.title, state)}</h1>${state.author ? `<p class="latex-author">${inlineHTML(state.author, state)}</p>` : ''}${state.date ? `<p class="latex-date">${inlineHTML(state.date, state)}</p>` : ''}</header>`;
  }

  function parseBlocks(text, state) {
    const nodes = [];
    let buffer = '', index = 0;
    const flush = () => {
      const content = buffer; buffer = '';
      if (!content.trim()) return;
      for (const paragraph of content.split(/\n[ \t]*\n+|\\par\b/)) {
        if (paragraph.trim()) nodes.push({ html:`<p>${inlineHTML(paragraph.replace(/\n/g, ' '), state)}</p>` });
      }
    };
    while (index < text.length) {
      if (text.startsWith('\\\\', index)) { buffer += '\\\\'; index += 2; continue; }
      if (text.startsWith('$$', index)) {
        const close = text.indexOf('$$', index + 2);
        if (close > index + 2) { flush(); nodes.push({ html:mathDisplay(text.slice(index + 2, close)) }); index = close + 2; continue; }
      }
      if (text.startsWith('\\[', index)) {
        const close = text.indexOf('\\]', index + 2);
        if (close > index + 2) { flush(); nodes.push({ html:mathDisplay(text.slice(index + 2, close)) }); index = close + 2; continue; }
      }
      if (text[index] === '\\') {
        const page = PAGE_CMD.exec(text.slice(index));
        if (page) {
          flush(); nodes.push({ pageBreak:true });
          index += page[0].length;
          while (/\s/.test(text[index] || '')) index++;
          if (text[index] === '[') { const group = readGroup(text, index, '[', ']'); if (group) index = group.end; }
          continue;
        }
        const env = /^\\begin\s*\{([^{}]+)\}/.exec(text.slice(index));
        if (env) {
          const found = findEnvironment(text, index, env[1]);
          if (found) { flush(); nodes.push(...renderEnvironment(env[1], found, state)); index = found.end; continue; }
        }
        const section = SECTION_CMD.exec(text.slice(index));
        if (section) {
          const parsed = parseCommand(text, index, 1);
          if (parsed) { flush(); nodes.push({ html:renderSection(section, parsed.groups[0] || '', state) }); index = parsed.end; continue; }
        }
        const command = parseCommand(text, index, 0);
        if (command) {
          if (command.name === 'maketitle') { flush(); state.maketitle = true; const html = titleHTML(state); if (html) nodes.push({ html }); index = command.end; continue; }
          if (command.name === 'tableofcontents') { flush(); nodes.push({ html:'<div class="latex-toc-marker"></div>' }); index = command.end; continue; }
          if (command.name === 'appendix') { flush(); state.appendix = true; index = command.end; continue; }
        }
      }
      buffer += text[index++];
    }
    flush();
    return nodes;
  }

  function commandValue(text, name) {
    const match = new RegExp(`\\\\${name}\\b`).exec(text);
    if (!match) return '';
    const parsed = parseCommand(text, match.index, 1);
    return parsed?.groups[0] || '';
  }

  function isLatex(source) {
    const start = source.replace(/^\uFEFF/, '').replace(/^(?:\s*%[^\n]*\n)*\s*/, '');
    return /^\\documentclass\b/.test(start) || /^\\begin\s*\{document\}/.test(start);
  }

  function render(source) {
    try {
      const state = { counters:[0,0,0,0,0,0,0], labels:{}, footnotes:[], bibNumbers:new Map(), lastNumber:'', book:false, title:'', author:'', date:'', maketitle:false };
      let text = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
      const protectedText = protectVerbatim(text);
      text = protectedText.restore(stripComments(protectedText.text));
      let preamble = '', body = text;
      const begin = /\\begin\s*\{document\}/.exec(text);
      if (/\\documentclass\b/.test(text) && !begin) {
        return { pages:[`<p class="latex-note">未找到 \\begin{document}，下面显示 LaTeX 原文。</p><pre class="latex-fallback"><code>${escapeHTML(source)}</code></pre>`] };
      }
      if (begin) { preamble = text.slice(0, begin.index); body = text.slice(begin.index + begin[0].length); }
      const end = /\\end\s*\{document\}/.exec(body);
      if (end) body = body.slice(0, end.index);
      state.book = /book|report/.test(commandValue(preamble, 'documentclass'));
      state.title = commandValue(preamble, 'title');
      state.author = commandValue(preamble, 'author');
      state.date = commandValue(preamble, 'date');
      let bibNumber = 0;
      for (const match of body.matchAll(/\\bibitem\s*(?:\[[^\]]*\])?\s*\{([^}]+)\}/g)) state.bibNumbers.set(match[1].trim(), ++bibNumber);
      const nodes = parseBlocks(body, state);
      const pages = [[]];
      for (const node of nodes) { if (node.pageBreak) pages.push([]); else pages[pages.length - 1].push(node); }
      if (state.title && !state.maketitle) pages[0].unshift({ html:titleHTML(state) });
      if (state.footnotes.length) {
        const items = state.footnotes.map(note => `<li>${inlineHTML(note, state)}</li>`).join('');
        pages[pages.length - 1].push({ html:`<section class="latex-footnotes"><p class="latex-section-label">脚注</p><ol>${items}</ol></section>` });
      }
      return { pages:pages.map(page => blocksToHTML(page)) };
    } catch {
      return { pages:[`<pre class="latex-fallback"><code>${escapeHTML(source)}</code></pre>`] };
    }
  }

  global.MoyeLatex = { render, isLatex };
})(window);
