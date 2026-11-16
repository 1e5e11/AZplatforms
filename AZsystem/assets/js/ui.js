import { escapeHtml } from './util.js';

export function toast(message, { error = false, duration = 2600 } = {}) {
  const root = document.getElementById('toast-root');
  if (!root) return;
  const el = document.createElement('div');
  el.className = `toast${error ? ' error' : ''}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 320);
  }, duration);
}

export function openModal({
  title = '',
  body = '',
  footer = '',
  width = 500,
  height = 600,
  tight = false,
  closeOnOverlay = true,
  onMount = null,
} = {}) {
  const root = document.getElementById('overlay-root');
  const overlay = document.createElement('div');
  overlay.className = 'az-overlay';
  const win = document.createElement('div');
  win.className = `az-window${tight ? ' tight-window' : ''}`;
  win.style.width = `${width}px`;
  win.style.height = tight ? 'auto' : `${height}px`;
  win.innerHTML = `
    <button class="az-close" type="button" aria-label="关闭">X</button>
    ${title ? `<div class="az-window-head"><h2 class="az-window-title">${escapeHtml(title)}</h2></div>` : ''}
    <div class="az-window-body">${body}</div>
    ${footer ? `<div class="az-window-foot">${footer}</div>` : ''}
  `;
  overlay.appendChild(win);
  root.appendChild(overlay);

  const closeHandlers = [];
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKey, true);
    overlay.remove();
    for (const fn of closeHandlers) fn();
  };
  const onKey = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close();
    }
  };
  document.addEventListener('keydown', onKey, true);
  win.querySelector('.az-close').addEventListener('click', close);
  overlay.addEventListener('mousedown', (event) => {
    if (closeOnOverlay && event.target === overlay) close();
  });

  const api = {
    overlay,
    windowEl: win,
    bodyEl: win.querySelector('.az-window-body'),
    close,
    query(selector) {
      return win.querySelector(selector);
    },
    queryAll(selector) {
      return [...win.querySelectorAll(selector)];
    },
    onClose(fn) {
      closeHandlers.push(fn);
    },
  };
  if (onMount) onMount(api);
  const focusable = win.querySelector('input:not([type="file"]), textarea, select');
  if (focusable) setTimeout(() => focusable.focus(), 30);
  return api;
}

export function confirmDialog(message, { title = '确认操作', okText = '确定', cancelText = '取消', wine = false } = {}) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    const modal = openModal({
      title,
      tight: true,
      width: 460,
      body: `<div class="note-box">${escapeHtml(message)}</div>`,
      footer: `<button class="az-btn" type="button" data-cancel>${escapeHtml(cancelText)}</button>
               <button class="az-btn ${wine ? 'wine' : ''}" type="button" data-ok>${escapeHtml(okText)}</button>`,
      closeOnOverlay: false,
    });
    modal.query('[data-cancel]').addEventListener('click', () => {
      finish(false);
      modal.close();
    });
    modal.query('[data-ok]').addEventListener('click', () => {
      finish(true);
      modal.close();
    });
    modal.onClose(() => finish(false));
  });
}

export function promptDialog({
  title = '输入',
  label = '内容',
  placeholder = '',
  value = '',
  multiline = false,
  okText = '确定',
  maxLength = 500,
} = {}) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (v) => {
      if (settled) return;
      settled = true;
      resolve(v);
    };
    const inputHtml = multiline
      ? `<textarea class="az-input token-box" data-field maxlength="${maxLength}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(value)}</textarea>`
      : `<input class="az-input" data-field maxlength="${maxLength}" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(value)}">`;
    const modal = openModal({
      title,
      tight: true,
      width: 460,
      body: `<label class="form-row" style="align-items:flex-start">
               <span style="width:70px;flex:0 0 auto;text-align:right;line-height:30px;color:var(--az-accent);font-size:14px">${escapeHtml(label)}</span>
               <span style="flex:1 1 auto">${inputHtml}</span>
             </label>`,
      footer: `<button class="az-btn" type="button" data-cancel>取消</button>
               <button class="az-btn wine" type="button" data-ok>${escapeHtml(okText)}</button>`,
      closeOnOverlay: false,
    });
    const field = modal.query('[data-field]');
    const submit = () => {
      const v = String(field.value || '').trim();
      if (!v) {
        toast('内容不能为空', { error: true });
        field.focus();
        return;
      }
      finish(v);
      modal.close();
    };
    modal.query('[data-cancel]').addEventListener('click', () => {
      finish(null);
      modal.close();
    });
    modal.query('[data-ok]').addEventListener('click', submit);
    field.addEventListener('keydown', (event) => {
      if (!multiline && event.key === 'Enter') {
        event.preventDefault();
        submit();
      }
    });
    modal.onClose(() => finish(null));
  });
}

export function openLightbox({ url, type = 'image', caption = '' }) {
  const root = document.getElementById('lightbox-root');
  if (!root) return;
  const el = document.createElement('div');
  el.className = 'lightbox';
  el.innerHTML = `
    <button class="az-close" type="button" aria-label="关闭">X</button>
    ${type === 'video'
      ? `<video src="${escapeHtml(url)}" controls autoplay></video>`
      : `<img src="${escapeHtml(url)}" alt="${escapeHtml(caption || '图片')}">`}
    ${caption ? `<div class="lb-caption">${escapeHtml(caption)}</div>` : ''}
  `;
  root.appendChild(el);
  const close = () => {
    document.removeEventListener('keydown', onKey, true);
    el.remove();
  };
  const onKey = (event) => {
    if (event.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKey, true);
  el.querySelector('.az-close').addEventListener('click', close);
  el.addEventListener('mousedown', (event) => {
    if (event.target === el) close();
  });
}
