# PDF 字体来源

`fonts/NotoSerifSC-Regular.ttf` 与 `fonts/NotoSerifSC-Bold.ttf` 来自 Google Fonts 的 Noto Serif SC，许可证见 `NotoSerifSC-OFL.txt`：

- 上游字体：https://github.com/google/fonts/blob/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf
- 上游许可：https://github.com/google/fonts/blob/main/ofl/notoserifsc/OFL.txt
- 使用 fonttools 4.66.1 的 `instantiateVariableFont(font, {'wght': 400}, inplace=True)` 生成常规静态 TTF。
- 粗体使用 `instantiateVariableFont(font, {'wght': 700}, inplace=True, updateFontNames=True)` 生成静态 TTF，保留上游全部字形。PDF 使用真实粗体字形，浏览器排版使用同一份字体。

此字体仅用于文字与矢量 PDF 的正文和中文回退。公式及代码使用既有 KaTeX TTF 字体，许可证见 `katex-LICENSE`。

`pdf-fonts.js` 是由 `scripts/build-pdf-fonts.cjs` 预生成的静态字体脚本，包含常规及公式 TTF 的 Base64 数据。`pdf-fonts-bold.js` 单独包含真实粗体 TTF，仅在文档中有粗体时加载。网页导出文字或矢量 PDF 时，浏览器直接解码字体，不使用字体 API 或后端接口，也不需要 `fetch` 本地文件，因此兼容双击 `file://` 打开页面。

更新字体源后，开发者可运行 `node scripts/build-pdf-fonts.cjs` 重新生成脚本。生成工具不参与网页运行，静态部署复制预生成的 `pdf-fonts.js` 与 `pdf-fonts-bold.js` 即可。
