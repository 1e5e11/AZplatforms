# 墨页 Markdown 显示引擎

`md-renderer.js` 是从编辑器应用中拆出的浏览器端显示引擎。它负责 Markdown 解析、HTML 清理、相对链接处理、标题与目录、分页指令、代码高亮和 KaTeX 公式；编辑框、文件打开、分享链接和模式切换仍由 `app.js` 负责。

## 1. 引入文件

把以下文件放到网页目录中，并按顺序加载。仓库里的 `vendor/` 已经包含对应版本。

```html
<link rel="stylesheet" href="vendor/katex.min.css">
<link rel="stylesheet" href="md-renderer.css">

<script src="vendor/marked.umd.js"></script>
<script src="vendor/purify.min.js"></script>
<script src="vendor/highlight.min.js"></script>
<script src="vendor/katex.min.js"></script>
<script src="md-renderer.js"></script>
```

页面准备一个容器。`markdown` 类提供正文排版：

```html
<article id="document" class="markdown"></article>
```

## 2. 最小示例

```html
<script>
  const source = `# Hello

这是一段 **Markdown**，公式为 $E = mc^2$。

\`\`\`js
console.log('hello');
\`\`\``;

  const engine = new MoyeMarkdownEngine({
    // 用于解析 Markdown 中的相对链接和图片地址。
    baseURL: location.href
  });

  const result = engine.render(source, { page: 'all' });
  document.getElementById('document').replaceChildren(result.fragment);
</script>
```

`render()` 默认也会显示全部页面。返回值包括：

- `fragment`：可直接插入 DOM 的 `DocumentFragment`；
- `pages`：解析后的页面元素数组；
- `headings`：标题数组，每项含 `id`、`text`、`level`、`page`；
- `currentPage`：当前页码；
- `continuous`：是否为连续显示。

## 3. 分页与目录

引擎识别三种独占一行的顶层注释：

```markdown
<!-- md:toc -->

<!-- md:nav -->

<!-- md:page -->
```

- `md:toc` 插入全文目录，默认折叠；传入 `{ tocOpen: true }` 可默认展开。
- `md:nav` 插入上一页、页码和下一页。
- `md:page` 从此处开始新的一页。

显示单页时传入页码：

```js
const result = engine.render(source, {
  page: 2,
  anchor: '安装',
  linkFactory(text, page, anchor) {
    const link = document.createElement('a');
    link.textContent = text;
    link.href = `?page=${page}${anchor ? `#${encodeURIComponent(anchor)}` : ''}`;
    return link;
  }
});
document.getElementById('document').replaceChildren(result.fragment);
```

`anchor` 使用 `headings` 返回的 `id`。若标题在另一页，引擎会自动选择标题所在页。应用需要无刷新翻页时，可以让 `linkFactory` 写入 `data-page`，再在外层监听点击并重新调用 `render()`。

如果页面已有自己的侧栏，可以单独生成目录：

```js
engine.parse(source, { baseURL: location.href });
const toc = engine.makeTOC({ currentPage: 1 });
document.getElementById('sidebar').replaceChildren(toc);
```

## 4. 公式与代码

行内公式支持 `$...$` 和 `\(...\)`，块级公式支持 `$$...$$` 和 `\[...\]`。

没有定界符的裸 LaTeX 也会自动识别：整行公式按独立公式显示，句子中的公式按行内公式显示。引擎只转换 KaTeX 能完整解析的片段，无法解析的内容保持原文；代码块、行内代码和已有定界符的公式不会被重复处理。压平成一行、由连续编号和公式组成的双列表格文本，也会自动还原为表格。

```markdown
设
\zeta_n=e^{2\pi i/n},
则本原 n 次单位根为 \zeta_n^k,\qquad 1\le k\le n.
```

围栏代码块的语言名会交给 highlight.js，例如：

````markdown
```python
print('hello')
```
````

引擎会给代码块生成“复制”按钮，但剪贴板交互由宿主页面决定：

```js
document.addEventListener('click', async event => {
  const button = event.target.closest('.copy-code');
  if (!button) return;
  const code = button.closest('.code-block').querySelector('code').textContent;
  await navigator.clipboard.writeText(code);
  button.textContent = '已复制';
  setTimeout(() => { button.textContent = '复制'; }, 1500);
});
```

## 5. 样式定制

`md-renderer.css` 可独立使用，并读取两个可选 CSS 变量：

```css
:root {
  --az-accent: #7c0a21;
  --az-accent-alpha: #7c0a2164;
}
```

正文默认最大宽度为 `800px`。覆盖 `.markdown` 即可修改：

```css
.markdown { max-width: 920px; font-family: system-ui, sans-serif; }
```

## 6. 安全边界

引擎先用 marked 解析，再用 DOMPurify 清理输出。`style`、`form`、`iframe`、媒体标签及危险属性会被移除；正文链接只允许 HTTP(S)、`mailto:` 和 `tel:`，图片允许 HTTP(S) 和常见图片格式的 Base64 data URL（PNG、JPEG、GIF、WebP、AVIF、BMP、ICO、SVG）。data URL 只允许用于图片，不能用作文档链接。KaTeX 的 `trust` 关闭，远程链接会获得 `noopener noreferrer`。

本地配图可通过 `images` 传入 `Map<资源绝对地址, 图片 data URL>`，例如 `engine.render(markdown, { baseURL, images })`。先按完整地址匹配；相对图片在没有路径匹配且文件名唯一时，按文件名匹配。重名图片使用完整路径区分。可选辅助文件 `md-images.js` 提供 `MoyeImages.readImages(files, baseURL)`，读取浏览器选择的文件并生成此 Map；独立引擎不依赖该辅助文件。

这套处理适合显示不受信任的普通 Markdown，但宿主页面仍应使用最新依赖版本，并用自己的 CSP、请求大小限制和来源策略保护加载环节。引擎只负责显示，不主动请求 Markdown 地址。

## 7. API 速查

```js
const engine = new MoyeMarkdownEngine({ baseURL });

engine.parse(markdown, { baseURL });
engine.render(markdown, {
  baseURL,
  page: 'all',       // 或从 1 开始的页码
  anchor: '',
  tocOpen: false,
  tocLabel: '目录',
  linkFactory
});
engine.makeTOC({ currentPage, continuous, linkFactory });
engine.makeNav(page, linkFactory);
```

项目中的 `app.js` 就是完整集成示例：它调用独立引擎解析正文，再负责编辑器状态、预览翻页和目录交互。
