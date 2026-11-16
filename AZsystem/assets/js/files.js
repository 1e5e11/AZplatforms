import { request, mediaUrl, uploadFile } from './api.js';
import * as util from './util.js';
import * as ui from './ui.js';

let app = null;
let files = [];
let storage = { used: 0, limit: 5 * 1024 * 1024 * 1024 };
let loaded = false;
let loading = false;
let selectedFile = null;
let uploading = false;
const els = {};

export function initFiles(appRef) {
  app = appRef;
  els.view = document.getElementById('files-view');
  els.side = document.getElementById('files-side');
  buildSkeleton();
}

function buildSkeleton() {
  els.view.innerHTML = `
    <div class="view-head">
      <span class="view-title">公共文件区</span>
      <input class="az-input search" id="files-search" placeholder="搜索文件名或说明" autocomplete="off">
      <button class="az-btn" id="files-upload-btn" type="button">上传文件</button>
      <button class="az-btn small" id="files-refresh" type="button">刷新</button>
    </div>
    <div class="view-body" id="files-list"><div class="empty-block">加载中…</div></div>
  `;
  els.list = document.getElementById('files-list');
  const search = document.getElementById('files-search');
  search.addEventListener('input', util.debounce(() => loadFiles(search.value.trim()), 300));
  document.getElementById('files-refresh').addEventListener('click', () => loadFiles(search.value.trim()));
  document.getElementById('files-upload-btn').addEventListener('click', openUploadModal);
  els.list.addEventListener('click', onListClick);

  els.side.innerHTML = `
    <div class="files-side">
      <div class="side-title">上传到公共文件区</div>
      <div class="side-form">
        <button type="button" class="az-btn" id="side-pick">选择文件</button>
        <div class="file-pick" id="side-file-name">未选择文件</div>
        <input class="az-input" id="side-desc" placeholder="文件说明（可选）" maxlength="300">
        <button type="button" class="az-btn" id="side-upload" disabled>上传</button>
        <div class="form-note">公共文件区对所有员工开放，单个文件最大 100MB，项目总存储上限 5GB。</div>
      </div>
      <div class="side-section" id="files-side-stats"></div>
    </div>
  `;
  document.getElementById('side-pick').addEventListener('click', async () => {
    selectedFile = await util.pickFile('');
    const nameEl = document.getElementById('side-file-name');
    nameEl.textContent = selectedFile ? `${selectedFile.name} · ${util.fmtSize(selectedFile.size)}` : '未选择文件';
    document.getElementById('side-upload').disabled = !selectedFile || uploading;
  });
  document.getElementById('side-upload').addEventListener('click', () => {
    if (!selectedFile) return;
    doUpload(selectedFile, document.getElementById('side-desc').value.trim(), () => {
      selectedFile = null;
      document.getElementById('side-file-name').textContent = '未选择文件';
      document.getElementById('side-desc').value = '';
      document.getElementById('side-upload').disabled = true;
    });
  });
}

export function showFilesView() {
  if (!loaded && !loading) loadFiles('');
  else if (loaded) renderList();
  renderSideStats();
}

export async function loadFiles(query = '') {
  if (loading) return;
  loading = true;
  if (!loaded) els.list.innerHTML = '<div class="empty-block">加载中…</div>';
  try {
    const data = await request(`/api/files${query ? `?q=${encodeURIComponent(query)}` : ''}`);
    files = data.files || [];
    if (data.storage) storage = data.storage;
    loaded = true;
    renderList(query);
    renderSideStats();
  } catch (err) {
    els.list.innerHTML = `<div class="empty-block">${util.escapeHtml(err.message)}</div>`;
    ui.toast(err.message, { error: true });
  } finally {
    loading = false;
  }
}

function fileExt(name) {
  const idx = String(name || '').lastIndexOf('.');
  if (idx < 0) return 'FILE';
  return String(name).slice(idx + 1).slice(0, 4).toUpperCase();
}

function canDelete(file) {
  return file.owner && (file.owner.id === app.state.me.id || app.state.me.role === 'admin');
}

function renderList(query = '') {
  const search = document.getElementById('files-search');
  if (search && search.value !== query && query) search.value = query;
  if (!files.length) {
    els.list.innerHTML = `<div class="empty-block">${query ? '没有匹配的文件' : '公共文件区还是空的，上传第一个文件吧。'}</div>`;
    return;
  }
  els.list.innerHTML = files.map((file) => {
    const isImage = String(file.mime).startsWith('image/');
    const canPreview = isImage || file.mime === 'application/pdf' || String(file.mime).startsWith('video/');
    const ownerName = file.owner ? file.owner.nickname : '已离职员工';
    return `
      <div class="file-row" data-file-id="${file.id}">
        <span class="file-badge">${util.escapeHtml(fileExt(file.name))}</span>
        <span class="file-main">
          <a class="file-name" href="${util.escapeHtml(mediaUrl(file.url, { download: true }))}" title="${util.escapeHtml(file.name)}">${util.escapeHtml(file.name)}</a>
          <span class="file-desc">${util.escapeHtml(file.description || '')}</span>
        </span>
        <span class="file-meta">${util.escapeHtml(util.fmtSize(file.size))}<br>${util.escapeHtml(ownerName)} · ${util.escapeHtml(util.fmtTime(file.createdAt))}</span>
        <span class="file-actions">
          ${canPreview ? `<button type="button" class="az-btn small" data-preview="${file.id}">预览</button>` : ''}
          <a class="az-btn small" href="${util.escapeHtml(mediaUrl(file.url, { download: true }))}">下载</a>
          ${canDelete(file) ? `<button type="button" class="az-btn small" data-del="${file.id}">删除</button>` : ''}
        </span>
      </div>`;
  }).join('');
}

function renderSideStats() {
  const el = document.getElementById('files-side-stats');
  if (!el) return;
  const totalBytes = files.reduce((sum, f) => sum + (Number(f.size) || 0), 0);
  const used = Number(storage.used) || totalBytes;
  const limit = Number(storage.limit) || 5 * 1024 * 1024 * 1024;
  const percent = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  el.innerHTML = `
    <div class="side-title">文件统计</div>
    <div class="admin-side" style="padding:0">
      <div class="side-line"><span>公共文件</span><span>${files.length} 个</span></div>
      <div class="side-line"><span>项目存储</span><span>${util.fmtSize(used)} / ${util.fmtSize(limit)}</span></div>
      <div class="side-line"><span>使用比例</span><span>${percent}%</span></div>
    </div>
    <div class="form-note">单文件最大 100MB，项目总存储上限 5GB。点击文件名可直接下载。</div>
  `;
}

function onListClick(event) {
  const del = event.target.closest('[data-del]');
  if (del) {
    const id = Number(del.dataset.del);
    const file = files.find((f) => f.id === id);
    if (!file) return;
    ui.confirmDialog(`确定删除公共文件「${file.name}」吗？删除后无法恢复。`, {
      title: '删除文件',
      okText: '删除',
      wine: true,
    }).then(async (ok) => {
      if (!ok) return;
      try {
        await request(`/api/files/${id}`, { method: 'DELETE' });
        ui.toast('文件已删除');
        loadFiles(document.getElementById('files-search').value.trim());
      } catch (err) {
        ui.toast(err.message, { error: true });
      }
    });
    return;
  }
  const preview = event.target.closest('[data-preview]');
  if (preview) {
    const file = files.find((f) => f.id === Number(preview.dataset.preview));
    if (!file) return;
    const url = mediaUrl(file.url);
    if (String(file.mime).startsWith('video/')) {
      ui.openLightbox({ url, type: 'video', caption: file.name });
    } else if (file.mime === 'application/pdf') {
      window.open(url, '_blank', 'noopener');
    } else {
      ui.openLightbox({ url, caption: file.name });
    }
  }
}

function openUploadModal() {
  let file = null;
  const modal = ui.openModal({
    title: '上传文件',
    tight: true,
    width: 500,
    body: `
      <div class="side-form">
        <button type="button" class="az-btn" data-pick>选择文件</button>
        <div class="file-pick" data-filename>未选择文件</div>
        <input class="az-input" data-desc placeholder="文件说明（可选）" maxlength="300">
        <div class="form-note">上传后所有员工都可以查看和下载。单文件最大 100MB，项目总存储上限 5GB。</div>
      </div>
    `,
    footer: `<button type="button" class="az-btn" data-cancel>取消</button>
             <button type="button" class="az-btn wine" data-upload disabled>上传</button>`,
    closeOnOverlay: false,
  });
  const uploadBtn = modal.query('[data-upload]');
  modal.query('[data-pick]').addEventListener('click', async () => {
    file = await util.pickFile('');
    modal.query('[data-filename]').textContent = file ? `${file.name} · ${util.fmtSize(file.size)}` : '未选择文件';
    uploadBtn.disabled = !file;
  });
  modal.query('[data-cancel]').addEventListener('click', modal.close);
  uploadBtn.addEventListener('click', () => {
    if (!file) return;
    doUpload(file, (modal.query('[data-desc]').value || '').trim(), () => {
      modal.close();
    });
  });
}

async function doUpload(file, description, onDone) {
  if (uploading) return;
  if (file.size > 100 * 1024 * 1024) {
    ui.toast('文件最大 100MB', { error: true });
    return;
  }
  uploading = true;
  app.setHint(`正在上传 ${file.name}…`);
  try {
    await uploadFile(file, 'public', { description });
    ui.toast('文件已上传');
    app.setHintIdle();
    loadFiles(document.getElementById('files-search').value.trim());
    if (onDone) onDone();
  } catch (err) {
    app.setHintIdle();
    ui.toast(err.message, { error: true });
  } finally {
    uploading = false;
  }
}
