(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const codec = window.SLinkCodec;
  if (!codec) { document.body.textContent = '编码组件加载失败，请检查 codec.js 和 dictionary-v3.js 是否与 index.html 放在同一目录。'; return; }

  function show(section) {
    $('generator').hidden = section !== 'generator';
    $('redirect-screen').hidden = section !== 'redirect';
    $('invalid-screen').hidden = section !== 'invalid';
  }

  const form = $('generate-form'), input = $('url-input');
  const button = $('generate-button');
  const error = $('form-error');
  input.addEventListener('input', () => {
    $('input-length').textContent = [...input.value].length.toLocaleString('zh-CN') + ' 字符';
    error.hidden = true;
  });
  for (const node of document.querySelectorAll('[data-example]')) {
    node.addEventListener('click', () => {
      input.value = node.getAttribute('data-example');
      input.dispatchEvent(new Event('input'));
      input.focus();
    });
  }
  let requestID = 0;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const id = ++requestID;
    button.disabled = true;
    button.textContent = '正在优化…';
    error.hidden = true;
    try {
      const result = await codec.encodeDetailed(input.value);
      if (id !== requestID) return;
      const link = result.link;
      $('short-link').value = link;
      $('algorithm').textContent = result.algorithm;
      $('original-size').textContent = result.originalBytes.toLocaleString('zh-CN');
      $('compressed-size').textContent = result.compressedBytes.toLocaleString('zh-CN');
      $('encoded-size').textContent = result.payloadCharacters.toLocaleString('zh-CN');
      const ratio = (result.payloadCharacters / result.href.length - 1) * 100;
      $('saving-ratio').textContent = (ratio > 0 ? '+' : '') + ratio.toFixed(1) + '%';
      $('saving-note').textContent = ratio <= 0 ? '载荷比源 URL 更短' : '载荷比源 URL 更长';
      $('visit-link').href = link;
      $('result-warning').textContent =
        link.length >= result.href.length
          ? '提示：对于此地址，包含固定域名的完整短链接比原始网址更长。无数据库压缩无法像服务端随机短码一样保证缩短。'
          : '链接已包含全部还原信息。目标 URL 不会保存到服务器；固定域名路径已计算在完整短链接内。';
      $('result').hidden = false;
      $('result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      $('copy-button').textContent = '复制链接';
    } catch (err) {
      error.textContent = err.message || '生成失败，请检查输入。';
      error.hidden = false;
    } finally {
      if (id === requestID) { button.disabled = false; button.textContent = '开始压缩 →'; }
    }
  });
  $('copy-button').addEventListener('click', async () => {
    const link = $('short-link').value;
    if (!link) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('API unavailable');
      await navigator.clipboard.writeText(link);
    } catch {
      $('short-link').focus();
      $('short-link').select();
      if (!document.execCommand('copy')) {
        $('copy-button').textContent = '请手动复制';
        return;
      }
    }
    $('copy-button').textContent = '✓ 已复制';
  });
  $('new-button').addEventListener('click', () => {
    requestID++;
    $('result').hidden = true;
    input.value = '';
    input.dispatchEvent(new Event('input'));
    input.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  if (window.location.search.length > 1) {
    try {
      const code = codec.codeFromLocation();
      const target = codec.decodeCode(code);
      show('redirect');
      const url = new URL(target);
      $('destination-host').textContent = url.hostname;
      $('destination-url').textContent = target;
      $('redirect-go').href = target;
      const cancel = $('redirect-cancel');
      const progress = $('redirect-progress-bar');
      const redirect = window.setTimeout(() => window.location.replace(target), 1500);
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => { progress.style.width = '100%'; }));
      cancel.addEventListener('click', () => {
        window.clearTimeout(redirect);
        cancel.disabled = true;
        cancel.textContent = '已取消自动跳转';
        progress.style.transition = 'none';
        progress.style.width = '0';
      });
    } catch (err) {
      show('invalid');
      $('decode-error').textContent = err.message || '无法解码链接。';
    }
  } else show('generator');
})();
