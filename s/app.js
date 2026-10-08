/** S/Link v3: resolve all redirect queries before constructing or showing UI. */
(function () {
  'use strict';

  const codec = window.SLinkCodec;
  let startupError = '';
  // Early execution from <head>: no visible DOM, styles or loading animation.
  // For a valid code, navigation starts synchronously without waiting for DOMContentLoaded.
  if (window.location.search.length > 1) {
    try {
      if (!codec) throw new Error('编解码组件未正确加载。');
      const code = codec.codeFromLocation();
      if (!code) throw new Error('短链接缺少有效的编码数据。');
      const target = codec.decodeCode(code);
      window.location.replace(target);
      return; // Keep the document completely hidden while navigating.
    } catch (err) {
      startupError = '短链接无效：' + (err?.message || '解码失败。');
      // No usable redirect exists: show the generator with this diagnostic.
    }
  } else if (!codec) {
    startupError = '编码组件加载失败，请确认 codec.js 与 dictionary-v3.js 已部署。';
  }

  function initialize() {
    const $ = id => document.getElementById(id);
    const form = $('generate-form');
    const input = $('url-input');
    const button = $('generate-button');
    const error = $('form-error');

    function renderError(message) {
      error.textContent = message;
      error.hidden = !message;
    }
    if (startupError) renderError(startupError);
    input.addEventListener('input', () => {
      $('input-length').textContent = [...input.value].length.toLocaleString('zh-CN') + ' 字符';
      renderError('');
    });
    for (const example of document.querySelectorAll('[data-example]')) {
      example.addEventListener('click', () => {
        input.value = example.getAttribute('data-example');
        input.dispatchEvent(new Event('input'));
        input.focus();
      });
    }
    let requestID = 0;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!codec) return renderError('编码组件尚未加载。');
      const id = ++requestID;
      button.disabled = true;
      button.textContent = '正在压缩…';
      renderError('');
      try {
        const result = await codec.encodeDetailed(input.value);
        if (id !== requestID) return;
        $('short-link').value = result.link;
        $('algorithm').textContent = result.algorithm;
        $('original-size').textContent = result.originalBytes.toLocaleString('zh-CN');
        $('compressed-size').textContent = result.compressedBytes.toLocaleString('zh-CN');
        $('encoded-size').textContent = result.payloadCharacters.toLocaleString('zh-CN');
        const ratio = (result.payloadCharacters / result.href.length - 1) * 100;
        $('saving-ratio').textContent = (ratio > 0 ? '+' : '') + ratio.toFixed(1) + '%';
        $('visit-link').href = result.link;
        $('result-warning').textContent = result.link.length >= result.href.length
          ? '完整短链接包含固定域名前缀，因此本例的完整短链可能比原始网址更长。'
          : '链接包含完整解码信息；不会将目标地址存入映射数据库。';
        $('result').hidden = false;
        $('copy-button').textContent = '复制链接';
      } catch (err) {
        renderError(err?.message || '压缩失败，请检查输入。');
      } finally {
        if (id === requestID) {
          button.disabled = false;
          button.textContent = '压缩 ↗';
        }
      }
    });

    $('copy-button').addEventListener('click', async () => {
      const link = $('short-link').value;
      if (!link) return;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
        await navigator.clipboard.writeText(link);
      } catch {
        $('short-link').focus();
        $('short-link').select();
        try {
          if (!document.execCommand('copy')) throw new Error('Copy failed');
        } catch {
          $('copy-button').textContent = '请手动复制';
          return;
        }
      }
      $('copy-button').textContent = '已复制';
    });
    $('new-button').addEventListener('click', () => {
      ++requestID;
      $('result').hidden = true;
      input.value = '';
      input.dispatchEvent(new Event('input'));
      input.focus();
    });

    // HTML and CSS finished loading. Reveal UI only because no valid redirect is in progress.
    document.documentElement.classList.add('ui-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else initialize();
})();
