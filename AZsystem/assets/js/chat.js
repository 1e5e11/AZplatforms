import { request, mediaUrl, uploadFile, wsSend } from './api.js';
import * as util from './util.js';
import * as ui from './ui.js';

let app = null;
let openSeq = 0;
let loadingOlder = false;
let uploading = false;
let lastTypingSent = 0;
let recorder = null;
let recordStream = null;
let recordChunks = [];
let recordStartedAt = 0;
let recordTimer = null;
let recordCancelled = false;

const els = {};

export function initChat(appRef) {
  app = appRef;
  els.search = document.getElementById('conv-search');
  els.list = document.getElementById('conv-list');
  els.leftFoot = document.getElementById('left-foot');
  els.messages = document.getElementById('messages');
  els.title = document.getElementById('chat-title');
  els.sub = document.getElementById('chat-sub');
  els.actions = document.getElementById('chat-actions');
  els.composer = document.getElementById('composer');
  els.input = document.getElementById('composer-input');
  els.send = document.getElementById('composer-send');
  els.tools = document.getElementById('composer-tools');
  els.toolNote = document.getElementById('tool-note');
  els.typing = document.getElementById('typing-line');
  els.members = document.getElementById('members-panel');
  els.recBar = document.getElementById('recorder-bar');
  els.recTime = document.getElementById('rec-time');
  els.recStop = document.getElementById('rec-stop');
  els.recCancel = document.getElementById('rec-cancel');

  els.search.addEventListener('input', () => renderConversationList());
  document.getElementById('new-chat-btn').addEventListener('click', openNewChatModal);
  els.list.addEventListener('click', (event) => {
    const item = event.target.closest('[data-conv]');
    if (item) openConversation(Number(item.dataset.conv));
  });

  els.tools.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-kind]');
    if (btn) handleKindButton(btn.dataset.kind);
  });

  els.send.addEventListener('click', sendText);
  els.input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      sendText();
    }
  });
  els.input.addEventListener('input', () => {
    autoGrow();
    sendTyping();
  });
  els.recStop.addEventListener('click', () => stopRecording(true));
  els.recCancel.addEventListener('click', () => stopRecording(false));

  els.actions.addEventListener('click', onChatActionClick);
  els.members.addEventListener('click', onChatActionClick);

  els.messages.addEventListener('click', onMessagesClick);
  els.messages.addEventListener('scroll', () => {
    if (!state().currentId || !state().hasMore || loadingOlder) return;
    if (els.messages.scrollTop < 24) loadOlder();
  });
  window.addEventListener('resize', autoGrow);
}

function state() {
  return app.state;
}

function currentConv() {
  return state().currentConversation;
}

function findConv(id) {
  return state().conversations.find((c) => c.id === Number(id)) || null;
}

function userById(id) {
  const fromUsers = state().users.find((u) => u.id === Number(id));
  if (fromUsers) return fromUsers;
  const members = state().currentConversation ? state().currentConversation.members : [];
  return members.find((u) => u.id === Number(id)) || null;
}

function isOnline(id) {
  return state().online.has(Number(id)) || (userById(id) && userById(id).online);
}

function canManageGroup(conv) {
  if (!conv || conv.type !== 'group') return false;
  return conv.ownerId === state().me.id || state().me.role === 'admin';
}

/* ---------------- 会话列表 ---------------- */

function convAvatar(conv) {
  if (conv.type === 'dm') {
    return util.avatarHtml({ nickname: conv.name, avatarUrl: conv.avatarUrl });
  }
  if (conv.type === 'all') {
    return util.avatarHtml({ nickname: '全' });
  }
  return util.avatarHtml({ nickname: conv.name });
}

function convTypeLabel(conv) {
  if (conv.type === 'all') return '全员';
  if (conv.type === 'group') return '群';
  return '';
}

export function renderConversationList() {
  if (!els.list) return;
  const query = (els.search.value || '').trim().toLowerCase();
  const me = state().me;
  const list = state().conversations.filter((conv) => {
    if (!query) return true;
    if (conv.name.toLowerCase().includes(query)) return true;
    return (conv.members || []).some((m) => (m.nickname || '').toLowerCase().includes(query));
  });

  if (!list.length) {
    els.list.innerHTML = '<div class="empty-block">没有匹配的会话</div>';
  } else {
    els.list.innerHTML = list.map((conv) => {
      const last = conv.lastMessage;
      const own = last && last.sender && last.sender.id === me.id;
      const prefix =
        last && conv.type !== 'dm'
          ? `${own ? '我' : last.sender.nickname}：`
          : '';
      const preview = last ? prefix + util.previewText(last) : '暂无消息';
      const active = conv.id === state().currentId;
      const badge = conv.unread > 0
        ? `<span class="unread">${conv.unread > 99 ? '99+' : conv.unread}</span>`
        : '';
      return `
        <button type="button" class="conv-item${active ? ' active' : ''}" data-conv="${conv.id}">
          ${convAvatar(conv)}
          <span class="conv-main">
            <span class="conv-name">
              <span class="conv-name-text" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${util.escapeHtml(conv.name)}</span>
              ${convTypeLabel(conv) ? `<span class="conv-type">${convTypeLabel(conv)}</span>` : ''}
            </span>
            <span class="conv-preview">${util.escapeHtml(preview)}</span>
          </span>
          <span class="conv-side">
            <span class="conv-time">${last ? util.fmtTime(last.createdAt) : ''}</span>
            ${badge}
          </span>
        </button>`;
    }).join('');
  }
  const totalUnread = state().conversations.reduce((sum, c) => sum + (c.unread || 0), 0);
  els.leftFoot.textContent = `${state().conversations.length} 个会话 · ${state().online.size} 人在线${totalUnread ? ` · ${totalUnread} 条未读` : ''}`;
  if (app.updateTitle) app.updateTitle();
}

/* ---------------- 打开会话 ---------------- */

export async function openConversation(id, options = {}) {
  const seq = ++openSeq;
  let conv = findConv(id);
  if (!conv) {
    try {
      const data = await request(`/api/conversations/${id}`);
      conv = data.conversation;
    } catch (err) {
      ui.toast(err.message, { error: true });
      return;
    }
  }
  if (seq !== openSeq) return;
  state().currentId = conv.id;
  state().currentConversation = conv;
  state().readOnly = !!options.readOnly;
  applyReadOnly();
  app.setView('chat');
  renderConversationList();
  renderHeader();
  renderMembersPanel();
  els.messages.innerHTML = '<div class="empty-hint">加载中…</div>';
  els.typing.textContent = '';
  if (!state().readOnly) els.input.focus();

  try {
    const data = await request(`/api/conversations/${conv.id}/messages?limit=40`);
    if (seq !== openSeq) return;
    state().messages = data.messages || [];
    state().hasMore = !!data.hasMore;
    renderMessages({ scrollToBottom: true });
    if (!state().readOnly) markRead();
  } catch (err) {
    if (seq !== openSeq) return;
    els.messages.innerHTML = '<div class="empty-hint">消息加载失败</div>';
    ui.toast(err.message, { error: true });
  }
}

function applyReadOnly() {
  if (!els.composer) return;
  els.composer.classList.toggle('hidden', !!state().readOnly);
}

export function closeConversation() {
  openSeq += 1;
  state().currentId = null;
  state().currentConversation = null;
  state().messages = [];
  state().readOnly = false;
  applyReadOnly();
  if (els.title) els.title.textContent = '会话';
  if (els.sub) els.sub.textContent = '';
  if (els.actions) els.actions.innerHTML = '';
  if (els.members) els.members.innerHTML = '';
  if (els.messages) els.messages.innerHTML = '<div class="empty-hint">选择一个会话开始聊天</div>';
}

function markRead() {
  const conv = currentConv();
  if (!conv || state().readOnly) return;
  const last = state().messages[state().messages.length - 1];
  const messageId = last ? last.id : 0;
  request(`/api/conversations/${conv.id}/read`, { method: 'POST', body: { messageId } }).catch(() => {});
  conv.unread = 0;
  renderConversationList();
}

export function markCurrentRead() {
  if (state().currentId && !state().readOnly) markRead();
}

/* ---------------- 头部与成员 ---------------- */

function renderHeader() {
  const conv = currentConv();
  if (!conv) return;
  const members = conv.members || [];
  els.title.textContent = conv.name;
  let sub = '';
  if (conv.type === 'all') {
    sub = `${members.length} 位成员 · 全体同事`;
  } else if (conv.type === 'group') {
    const owner = userById(conv.ownerId);
    sub = `${members.length} 位成员${owner ? ` · 群主 ${owner.nickname}` : ''}`;
  } else {
    const other = members.find((m) => m.id !== state().me.id) || members[0];
    sub = other ? `${other.position || '同事'} · ${isOnline(other.id) ? '在线' : '离线'}` : '私信';
  }
  if (state().readOnly) sub = `管理员只读查看 · ${sub}`;
  els.sub.textContent = sub;

  const buttons = ['<button type="button" class="az-btn small" data-action="members">成员</button>'];
  if (state().readOnly) {
    buttons.push('<button type="button" class="az-btn small" data-action="back-admin">返回管理</button>');
  } else if (conv.type === 'group') {
    if (canManageGroup(conv)) {
      buttons.push('<button type="button" class="az-btn small" data-action="invite">邀请</button>');
      buttons.push('<button type="button" class="az-btn small" data-action="rename">群名</button>');
    }
    buttons.push('<button type="button" class="az-btn small" data-action="leave">退出</button>');
  }
  els.actions.innerHTML = buttons.join('');
}

export function renderMembersPanel() {
  if (!els.members) return;
  const conv = currentConv();
  if (!conv) {
    els.members.innerHTML = '';
    return;
  }
  const members = (conv.members || []).map((m) => {
    const live = userById(m.id) || m;
    return { ...m, nickname: live.nickname, position: live.position, avatarUrl: live.avatarUrl, online: isOnline(m.id) };
  });
  const rows = members.map((m) => `
    <div class="member-row">
      ${util.avatarHtml(m, 'avatar avatar-sm')}
      <span class="member-main">
        <span class="member-name">${util.escapeHtml(m.nickname)}${m.id === state().me.id ? '（我）' : ''}</span>
        <span class="member-position">${util.escapeHtml(m.position || '')}</span>
      </span>
      ${m.role === 'admin' ? '<span class="member-badge">老板</span>' : ''}
      <span class="dot ${m.online ? 'online' : 'offline'}" title="${m.online ? '在线' : '离线'}"></span>
    </div>`).join('');

  let actions = '';
  if (!state().readOnly && conv.type === 'group') {
    if (canManageGroup(conv)) {
      actions += '<button type="button" class="az-btn small" data-action="invite">邀请成员</button>';
      actions += '<button type="button" class="az-btn small" data-action="rename">修改群名</button>';
    }
    actions += '<button type="button" class="az-btn small" data-action="leave">退出群聊</button>';
  }
  let note = '';
  if (state().readOnly) {
    note = '管理员审计视图，只读。';
  } else if (conv.type === 'dm') {
    note = '这是你们的私信会话，只有双方可以看到。';
  } else if (conv.type === 'all') {
    note = '全员群包含所有在职员工，新员工会自动加入。';
  }

  els.members.innerHTML = `
    <div class="members-head">
      <span class="members-title">成员</span>
      <span class="members-count">${members.length} 人 · ${members.filter((m) => m.online).length} 在线</span>
    </div>
    <div class="member-list">${rows}</div>
    ${actions ? `<div class="member-actions">${actions}</div>` : ''}
    ${note ? `<div class="side-note">${util.escapeHtml(note)}</div>` : ''}
  `;
}

/* ---------------- 消息渲染 ---------------- */

function messageContent(m) {
  const file = m.file;
  switch (m.kind) {
    case 'text':
      return `<div class="msg-text">${util.linkify(util.escapeHtml(m.body || ''))}</div>`;
    case 'image':
      if (!file) return '<div class="msg-text">[图片已失效]</div>';
      return `<div class="msg-bubble media"><img class="msg-image" src="${util.escapeHtml(mediaUrl(file.url))}" data-lightbox="${util.escapeHtml(mediaUrl(file.url))}" data-lightbox-caption="${util.escapeHtml(file.name || '图片')}" alt="图片"></div>`;
    case 'video':
      if (!file) return '<div class="msg-text">[视频已失效]</div>';
      return `<div class="msg-bubble media"><video class="msg-video" src="${util.escapeHtml(mediaUrl(file.url))}" controls preload="metadata"></video></div>`;
    case 'voice': {
      if (!file) return '<div class="msg-text">[语音已失效]</div>';
      const duration = util.formatDuration(m.body && m.body.duration);
      return `<div class="msg-bubble"><audio class="msg-audio" src="${util.escapeHtml(mediaUrl(file.url))}" controls preload="metadata"></audio><div class="msg-audio-meta">语音 ${duration}</div></div>`;
    }
    case 'location': {
      const lat = Number(m.body.lat);
      const lng = Number(m.body.lng);
      const label = (m.body && m.body.label) || '共享位置';
      const mapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
      return `<div class="msg-bubble"><div class="loc-card">
        <div class="loc-title">${util.escapeHtml(label)}</div>
        <div class="loc-coord">${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
        <a href="${util.escapeHtml(mapUrl)}" target="_blank" rel="noopener noreferrer">在地图中查看</a>
      </div></div>`;
    }
    case 'file': {
      if (!file) return '<div class="msg-text">[文件已失效]</div>';
      return `<div class="msg-bubble"><div class="file-card">
        <span class="file-name">${util.escapeHtml(file.name)}</span>
        <span class="file-meta">${util.escapeHtml(util.fmtSize(file.size))}</span>
        <span class="file-actions"><a class="az-btn small" href="${util.escapeHtml(mediaUrl(file.url, { download: true }))}">下载文件</a></span>
      </div>`;
    }
    case 'chain': {
      const body = m.body || {};
      const entries = Array.isArray(body.entries) ? body.entries : [];
      const rows = entries.length
        ? entries.map((entry, index) => `
            <div class="chain-entry">
              <span class="chain-index">${index + 1}</span>
              <span class="chain-name">${util.escapeHtml(entry.nickname || '')}</span>
              <span class="chain-text">${util.escapeHtml(entry.text || '')}</span>
            </div>`).join('')
        : '<div class="chain-entry"><span class="chain-text">还没有人接龙，来第一个吧。</span></div>';
      return `<div class="msg-bubble"><div class="chain-card">
        <div class="chain-title">${util.escapeHtml(body.title || '接龙')}</div>
        <div class="chain-entries">${rows}</div>
        <div class="chain-foot"><span>${entries.length} 人已接龙</span>${state().readOnly ? '' : `<button type="button" class="az-btn small" data-chain-join="${m.id}">参加接龙</button>`}</div>
      </div></div>`;
    }
    case 'system':
      return null;
    default:
      return `<div class="msg-text">[未知消息]</div>`;
  }
}

function messageHtml(m) {
  if (m.kind === 'system') {
    return `<div class="msg-system">${util.escapeHtml(m.body || '')}</div>`;
  }
  const own = m.sender && m.sender.id === state().me.id;
  const canDelete =
    own || (state().me.role === 'admin' && m.sender && m.sender.id !== 0);
  const name = own ? '我' : (m.sender && m.sender.nickname) || '未知';
  const avatarUser = m.sender || { nickname: '?' };
  return `
    <div class="msg-row${own ? ' own' : ''}" data-msg-id="${m.id}">
      ${util.avatarHtml(avatarUser, 'avatar avatar-sm')}
      <div class="msg-body">
        <div class="msg-meta">
          <span class="msg-name">${util.escapeHtml(name)}</span>
          <span>${util.escapeHtml(util.fmtTime(m.createdAt))}</span>
          ${canDelete ? `<span class="msg-actions"><button type="button" class="msg-delete" data-delete="${m.id}">删除</button></span>` : ''}
        </div>
        ${messageContent(m)}
      </div>
    </div>`;
}

export function renderMessages({ scrollToBottom = false, preserveScroll = false } = {}) {
  const container = els.messages;
  const prevHeight = container.scrollHeight;
  const prevTop = container.scrollTop;
  const wasNearBottom = prevHeight - prevTop - container.clientHeight < 80;

  const fragments = [];
  if (state().hasMore) {
    fragments.push('<button type="button" class="load-more" data-load-more>加载更早的消息</button>');
  }
  let lastDay = '';
  for (const m of state().messages) {
    const dayKey = new Date(m.createdAt).toDateString();
    if (dayKey !== lastDay) {
      fragments.push(`<div class="msg-system">${util.escapeHtml(util.fmtDay(m.createdAt))}</div>`);
      lastDay = dayKey;
    }
    fragments.push(messageHtml(m));
  }
  container.innerHTML = fragments.join('') || '<div class="empty-hint">还没有消息，说点什么吧</div>';

  if (preserveScroll) {
    container.scrollTop = container.scrollHeight - prevHeight + prevTop;
  } else if (scrollToBottom || wasNearBottom) {
    container.scrollTop = container.scrollHeight;
    container.querySelectorAll('img.msg-image, video.msg-video').forEach((media) => {
      const eventName = media.tagName === 'VIDEO' ? 'loadedmetadata' : 'load';
      const ready = media.tagName === 'VIDEO' ? media.readyState > 0 : media.complete;
      if (ready) return;
      media.addEventListener(
        eventName,
        () => {
          if (state().view === 'chat') container.scrollTop = container.scrollHeight;
        },
        { once: true }
      );
    });
  }
}

async function loadOlder() {
  if (loadingOlder || !state().hasMore || !state().messages.length) return;
  loadingOlder = true;
  try {
    const first = state().messages[0];
    const data = await request(`/api/conversations/${state().currentId}/messages?before=${first.id}&limit=40`);
    const older = data.messages || [];
    const existing = new Set(state().messages.map((m) => m.id));
    const merged = older.filter((m) => !existing.has(m.id)).concat(state().messages);
    state().messages = merged;
    state().hasMore = !!data.hasMore;
    renderMessages({ preserveScroll: true });
  } catch (err) {
    ui.toast(err.message, { error: true });
  } finally {
    loadingOlder = false;
  }
}

function appendMessage(message, { scroll = true } = {}) {
  if (state().messages.some((m) => m.id === message.id)) return false;
  state().messages.push(message);
  renderMessages({ scrollToBottom: scroll });
  return true;
}

function onMessagesClick(event) {
  const lightbox = event.target.closest('[data-lightbox]');
  if (lightbox) {
    ui.openLightbox({
      url: lightbox.dataset.lightbox,
      caption: lightbox.dataset.lightboxCaption || '',
    });
    return;
  }
  const del = event.target.closest('[data-delete]');
  if (del) {
    const messageId = Number(del.dataset.delete);
    ui.confirmDialog('确定删除这条消息吗？删除后无法恢复。', {
      title: '删除消息',
      okText: '删除',
      wine: true,
    }).then(async (ok) => {
      if (!ok) return;
      try {
        await request(`/api/messages/${messageId}`, { method: 'DELETE' });
        removeMessage(messageId);
      } catch (err) {
        ui.toast(err.message, { error: true });
      }
    });
    return;
  }
  const chain = event.target.closest('[data-chain-join]');
  if (chain) {
    joinChain(Number(chain.dataset.chainJoin));
    return;
  }
  if (event.target.closest('[data-load-more]')) loadOlder();
}

/* ---------------- 实时事件 ---------------- */

export function onIncoming(message) {
  const conv = findConv(message.conversationId);
  const isCurrentConv = state().currentId === message.conversationId;
  if (isCurrentConv) {
    const viewing = state().view === 'chat';
    const added = appendMessage(message, { scroll: viewing });
    if (conv) {
      conv.lastMessage = message;
      if (viewing) {
        conv.unread = 0;
        if (added) markRead();
      } else {
        conv.unread = (conv.unread || 0) + 1;
      }
    }
    renderConversationList();
  } else if (conv) {
    conv.lastMessage = message;
    if (message.sender && message.sender.id !== state().me.id) {
      conv.unread = (conv.unread || 0) + 1;
    }
    renderConversationList();
  } else {
    app.refreshConversations();
  }
}

export function onMessageUpdate(message) {
  const index = state().messages.findIndex((m) => m.id === message.id);
  if (index >= 0) {
    state().messages[index] = message;
    renderMessages({ preserveScroll: true });
  }
  const conv = findConv(message.conversationId);
  if (conv && conv.lastMessage && conv.lastMessage.id === message.id) {
    conv.lastMessage = message;
    renderConversationList();
  }
}

export function removeMessage(messageId) {
  const before = state().messages.length;
  state().messages = state().messages.filter((m) => m.id !== messageId);
  if (state().messages.length !== before) {
    renderMessages({ preserveScroll: true });
    const conv = currentConv();
    if (conv) {
      conv.lastMessage = state().messages[state().messages.length - 1] || null;
      renderConversationList();
    }
  }
}

export function onMessageDelete(messageId, conversationId) {
  if (state().currentId === conversationId) {
    removeMessage(messageId);
  }
  const conv = findConv(conversationId);
  if (conv && conv.lastMessage && conv.lastMessage.id === messageId) {
    app.refreshConversations();
  }
}

export function onTyping(event) {
  if (state().currentId !== event.conversationId) return;
  els.typing.textContent = `${event.nickname} 正在输入…`;
  clearTimeout(onTyping.timer);
  onTyping.timer = setTimeout(() => {
    els.typing.textContent = '';
  }, 2600);
}

export function updatePresence() {
  renderConversationList();
  if (state().view === 'chat') {
    renderMembersPanel();
    renderHeader();
  }
}

/* ---------------- 发送 ---------------- */

function sendTyping() {
  if (!state().currentId) return;
  const now = Date.now();
  if (now - lastTypingSent < 1500) return;
  lastTypingSent = now;
  wsSend({ type: 'typing', conversationId: state().currentId });
}

async function postMessage(kind, body, fileId = null) {
  if (state().readOnly) throw new Error('只读查看，不能发送消息');
  const conv = currentConv();
  if (!conv) return null;
  const data = await request('/api/messages', {
    method: 'POST',
    body: { conversationId: conv.id, kind, body, fileId },
  });
  onIncoming(data.message);
  return data.message;
}

async function sendText() {
  if (state().readOnly) {
    ui.toast('只读查看，不能发送消息', { error: true });
    return;
  }
  const text = (els.input.value || '').trim();
  if (!text) return;
  if (!state().currentId) {
    ui.toast('请先选择一个会话', { error: true });
    return;
  }
  els.send.disabled = true;
  try {
    await postMessage('text', text);
    els.input.value = '';
    autoGrow();
    els.input.focus();
  } catch (err) {
    ui.toast(err.message, { error: true });
  } finally {
    els.send.disabled = false;
  }
}

function autoGrow() {
  els.input.style.height = 'auto';
  const h = Math.max(64, Math.min(170, els.input.scrollHeight));
  els.input.style.height = `${h}px`;
}

function setKind(kind) {
  els.tools.querySelectorAll('[data-kind]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.kind === kind);
  });
  const notes = {
    text: '',
    image: '选择图片后立即发送',
    video: '选择视频后立即发送（最大 100MB）',
    voice: '点击“语音”开始录音，再次点击结束',
    location: '获取当前位置并发送',
    file: '选择任意文件后立即发送（最大 100MB）',
    chain: '发起一条接龙',
  };
  els.toolNote.textContent = notes[kind] || '';
}

function resetKind() {
  setKind('text');
  els.input.focus();
}

async function handleKindButton(kind) {
  if (kind === 'text') {
    resetKind();
    return;
  }
  if (state().readOnly) {
    ui.toast('只读查看，不能发送消息', { error: true });
    return;
  }
  if (!state().currentId) {
    ui.toast('请先选择一个会话', { error: true });
    return;
  }
  if (recorder && kind === 'voice') {
    stopRecording(true);
    return;
  }
  if (recorder) stopRecording(false);
  setKind(kind);
  try {
    if (kind === 'image') await sendFileMessage('image', 'image/*');
    else if (kind === 'video') await sendFileMessage('video', 'video/*');
    else if (kind === 'file') await sendFileMessage('file', '');
    else if (kind === 'voice') await startRecording();
    else if (kind === 'location') await shareLocation();
    else if (kind === 'chain') await createChain();
  } catch (err) {
    ui.toast(err.message || String(err), { error: true });
  } finally {
    if (kind !== 'voice' || !recorder) resetKind();
  }
}

async function sendFileMessage(kind, accept) {
  if (uploading) {
    ui.toast('正在上传，请稍候', { error: true });
    return;
  }
  const file = await util.pickFile(accept);
  if (!file) return;
  if (file.size > 100 * 1024 * 1024) {
    ui.toast('文件最大 100MB', { error: true });
    return;
  }
  uploading = true;
  app.setHint(`正在上传 ${file.name}…`);
  try {
    let body = {};
    if (kind === 'image') body = await util.imageDimensions(file);
    const data = await uploadFile(file, 'chat');
    await postMessage(kind, body, data.file.id);
    app.setHintIdle();
  } catch (err) {
    app.setHintIdle();
    throw err;
  } finally {
    uploading = false;
  }
}

/* ---------------- 语音 ---------------- */

async function startRecording() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
    throw new Error('当前浏览器不支持录音');
  }
  try {
    recordStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    throw new Error('无法访问麦克风，请检查浏览器权限');
  }
  const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
  recorder = new MediaRecorder(recordStream, mime ? { mimeType: mime } : undefined);
  recordChunks = [];
  recordCancelled = false;
  recordStartedAt = Date.now();
  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size) recordChunks.push(event.data);
  };
  recorder.onstop = async () => {
    const duration = Math.max(1, Math.round((Date.now() - recordStartedAt) / 1000));
    const cancelled = recordCancelled;
    const chunks = recordChunks;
    const type = recorder.mimeType || 'audio/webm';
    cleanupRecorder();
    if (cancelled || !chunks.length) return;
    const blob = new Blob(chunks, { type });
    const ext = type.includes('ogg') ? 'ogg' : type.includes('mp4') ? 'm4a' : 'webm';
    const file = new File([blob], `语音.${ext}`, { type });
    uploading = true;
    app.setHint('正在上传语音…');
    try {
      const data = await uploadFile(file, 'chat');
      await postMessage('voice', { duration }, data.file.id);
      app.setHintIdle();
    } catch (err) {
      app.setHintIdle();
      ui.toast(err.message, { error: true });
    } finally {
      uploading = false;
      resetKind();
    }
  };
  recorder.start();
  els.recBar.classList.remove('hidden');
  els.recTime.textContent = '00:00';
  clearInterval(recordTimer);
  recordTimer = setInterval(() => {
    els.recTime.textContent = util.formatDuration((Date.now() - recordStartedAt) / 1000);
    if (Date.now() - recordStartedAt > 5 * 60 * 1000) stopRecording(true);
  }, 500);
}

function cleanupRecorder() {
  clearInterval(recordTimer);
  recordTimer = null;
  if (recordStream) {
    for (const track of recordStream.getTracks()) track.stop();
    recordStream = null;
  }
  recorder = null;
  els.recBar.classList.add('hidden');
}

function stopRecording(send) {
  if (!recorder) return;
  recordCancelled = !send;
  try {
    recorder.stop();
  } catch {
    cleanupRecorder();
  }
}

/* ---------------- 位置 ---------------- */

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('当前浏览器不支持定位'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(err && err.code === 1 ? '定位权限被拒绝' : '无法获取当前位置')),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

async function shareLocation() {
  let coords = null;
  try {
    coords = await getPosition();
  } catch (err) {
    ui.toast(err.message, { error: true });
  }
  openLocationModal(coords);
}

function openLocationModal(coords) {
  const manual = !coords;
  const modal = ui.openModal({
    title: '发送位置',
    tight: true,
    width: 460,
    body: `
      <div class="form-row"><label>位置说明</label><input class="az-input" data-label placeholder="例如：公司一楼前台" maxlength="120"></div>
      ${manual
        ? `<div class="form-row"><label>纬度</label><input class="az-input" data-lat placeholder="31.230416" inputmode="decimal"></div>
           <div class="form-row"><label>经度</label><input class="az-input" data-lng placeholder="121.473701" inputmode="decimal"></div>`
        : `<div class="form-note">坐标：${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}</div>`}
      <div class="form-note">${manual ? '无法自动定位，请手动填写坐标。' : '位置将发送到当前会话。'}</div>
    `,
    footer: `<button type="button" class="az-btn" data-cancel>取消</button>
             <button type="button" class="az-btn wine" data-send>发送位置</button>`,
    closeOnOverlay: false,
  });
  modal.query('[data-cancel]').addEventListener('click', modal.close);
  modal.query('[data-send]').addEventListener('click', async () => {
    const label = (modal.query('[data-label]').value || '').trim();
    let lat = coords ? coords.lat : Number(modal.query('[data-lat]').value);
    let lng = coords ? coords.lng : Number(modal.query('[data-lng]').value);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
      ui.toast('纬度需在 -90~90，经度需在 -180~180', { error: true });
      return;
    }
    try {
      await postMessage('location', { lat, lng, label: label || '共享位置' });
      modal.close();
    } catch (err) {
      ui.toast(err.message, { error: true });
    }
  });
}

/* ---------------- 接龙 ---------------- */

function createChain() {
  const modal = ui.openModal({
    title: '发起接龙',
    tight: true,
    width: 500,
    body: `
      <div class="form-row"><label>接龙标题</label><input class="az-input" data-title placeholder="例如：周五聚餐报名" maxlength="100"></div>
      <div class="form-row" style="align-items:flex-start"><label style="line-height:30px">接龙内容</label><textarea class="az-input token-box" data-first maxlength="200" placeholder="例如：张三 参加（可留空）"></textarea></div>
      <div class="form-note">其他人可以在消息中点击“参加接龙”继续填写。</div>
    `,
    footer: `<button type="button" class="az-btn" data-cancel>取消</button>
             <button type="button" class="az-btn wine" data-create>发起接龙</button>`,
    closeOnOverlay: false,
  });
  modal.query('[data-cancel]').addEventListener('click', modal.close);
  modal.query('[data-create]').addEventListener('click', async () => {
    const title = (modal.query('[data-title]').value || '').trim() || '接龙';
    const first = (modal.query('[data-first]').value || '').trim();
    try {
      await postMessage('chain', { title, first });
      modal.close();
    } catch (err) {
      ui.toast(err.message, { error: true });
    }
  });
}

async function joinChain(messageId) {
  if (state().readOnly) {
    ui.toast('只读查看，不能参加接龙', { error: true });
    return;
  }
  const text = await ui.promptDialog({
    title: '参加接龙',
    label: '接龙内容',
    placeholder: '例如：张三 参加',
    maxLength: 200,
    okText: '接龙',
  });
  if (!text) return;
  try {
    const data = await request(`/api/messages/${messageId}/chain`, { method: 'POST', body: { text } });
    onMessageUpdate(data.message);
  } catch (err) {
    ui.toast(err.message, { error: true });
  }
}

/* ---------------- 会话操作 ---------------- */

function onChatActionClick(event) {
  const btn = event.target.closest('[data-action]');
  if (!btn) return;
  handleChatAction(btn.dataset.action);
}

async function handleChatAction(action) {
  if (action === 'back-admin') {
    app.setView('admin');
    return;
  }
  const conv = currentConv();
  if (!conv) return;
  if (action === 'members') {
    openMembersModal();
    return;
  }
  if (action === 'invite') {
    openInviteModal();
    return;
  }
  if (action === 'rename') {
    const name = await ui.promptDialog({
      title: '修改群名',
      label: '群名称',
      value: conv.name,
      maxLength: 60,
      okText: '保存',
    });
    if (!name) return;
    try {
      await request(`/api/conversations/${conv.id}`, { method: 'PATCH', body: { name } });
      await app.refreshConversations();
      const fresh = findConv(conv.id);
      if (fresh) {
        state().currentConversation = fresh;
        renderHeader();
        renderMembersPanel();
      }
    } catch (err) {
      ui.toast(err.message, { error: true });
    }
    return;
  }
  if (action === 'leave') {
    const ok = await ui.confirmDialog(`确定退出群聊「${conv.name}」吗？`, {
      title: '退出群聊',
      okText: '退出',
      wine: true,
    });
    if (!ok) return;
    try {
      await request(`/api/conversations/${conv.id}/members/${state().me.id}`, { method: 'DELETE' });
      closeConversation();
      await app.refreshConversations();
      const first = state().conversations[0];
      if (first) openConversation(first.id);
    } catch (err) {
      ui.toast(err.message, { error: true });
    }
  }
}

function openMembersModal() {
  const conv = currentConv();
  if (!conv) return;
  const members = conv.members || [];
  const manage = !state().readOnly && conv.type === 'group' && canManageGroup(conv);
  const rows = members.map((m) => {
    const live = userById(m.id) || m;
    const canRemove = manage && m.id !== state().me.id;
    return `
      <div class="choice-row">
        ${util.avatarHtml({ ...m, nickname: live.nickname, avatarUrl: live.avatarUrl }, 'avatar avatar-sm')}
        <span>${util.escapeHtml(live.nickname)}${m.id === state().me.id ? '（我）' : ''}</span>
        <span class="choice-sub">${util.escapeHtml(live.position || '')} · ${isOnline(m.id) ? '在线' : '离线'}</span>
        ${canRemove ? `<button type="button" class="az-btn small" data-remove="${m.id}">移出</button>` : ''}
      </div>`;
  }).join('');
  const modal = ui.openModal({
    title: '群成员',
    tight: true,
    width: 500,
    body: `<div class="choice-list">${rows}</div>
           <div class="form-note">${conv.type === 'all' ? '全员群包含所有在职员工。' : conv.type === 'dm' ? '私信只有你们两人。' : '群主可以移除成员。'}</div>`,
    footer: `${manage ? '<button type="button" class="az-btn" data-invite>邀请成员</button>' : ''}
             <button type="button" class="az-btn" data-close>关闭</button>`,
    closeOnOverlay: true,
  });
  modal.query('[data-close]').addEventListener('click', modal.close);
  const inviteBtn = modal.query('[data-invite]');
  if (inviteBtn) {
    inviteBtn.addEventListener('click', () => {
      modal.close();
      openInviteModal();
    });
  }
  modal.windowEl.addEventListener('click', async (event) => {
    const btn = event.target.closest('[data-remove]');
    if (!btn) return;
    const userId = Number(btn.dataset.remove);
    const target = userById(userId) || members.find((m) => m.id === userId);
    const ok = await ui.confirmDialog(`确定将 ${target ? target.nickname : '该成员'} 移出群聊吗？`, {
      title: '移出成员',
      okText: '移出',
      wine: true,
    });
    if (!ok) return;
    try {
      await request(`/api/conversations/${conv.id}/members/${userId}`, { method: 'DELETE' });
      modal.close();
      await app.refreshConversations();
      const fresh = findConv(conv.id);
      if (fresh) {
        state().currentConversation = fresh;
        renderHeader();
        renderMembersPanel();
      }
    } catch (err) {
      ui.toast(err.message, { error: true });
    }
  });
}

function openInviteModal() {
  const conv = currentConv();
  if (!conv || conv.type !== 'group') return;
  const memberIds = new Set((conv.members || []).map((m) => m.id));
  const candidates = state().users.filter((u) => u.active !== false && !memberIds.has(u.id) && u.id !== state().me.id);
  if (!candidates.length) {
    ui.toast('没有可邀请的同事了');
    return;
  }
  const rows = candidates.map((u) => `
    <label class="choice-row">
      <input type="checkbox" value="${u.id}">
      ${util.avatarHtml(u, 'avatar avatar-sm')}
      <span>${util.escapeHtml(u.nickname)}</span>
      <span class="choice-sub">${util.escapeHtml(u.position || '')}</span>
    </label>`).join('');
  const modal = ui.openModal({
    title: '邀请成员',
    tight: true,
    width: 500,
    body: `<div class="choice-list">${rows}</div>`,
    footer: `<button type="button" class="az-btn" data-cancel>取消</button>
             <button type="button" class="az-btn wine" data-ok>邀请</button>`,
    closeOnOverlay: false,
  });
  modal.query('[data-cancel]').addEventListener('click', modal.close);
  modal.query('[data-ok]').addEventListener('click', async () => {
    const userIds = modal.queryAll('input[type="checkbox"]:checked').map((el) => Number(el.value));
    if (!userIds.length) {
      ui.toast('请选择要邀请的同事', { error: true });
      return;
    }
    try {
      await request(`/api/conversations/${conv.id}/members`, { method: 'POST', body: { userIds } });
      modal.close();
      await app.refreshConversations();
      const fresh = findConv(conv.id);
      if (fresh) {
        state().currentConversation = fresh;
        renderHeader();
        renderMembersPanel();
      }
      ui.toast('已邀请');
    } catch (err) {
      ui.toast(err.message, { error: true });
    }
  });
}

export function openNewChatModal() {
  const others = state().users.filter((u) => u.id !== state().me.id && u.active !== false);
  const dmRows = others.map((u) => `
    <button type="button" class="choice-row" data-dm-user="${u.id}" style="width:100%;border-left:0;border-right:0;border-top:0;background:none;text-align:left">
      ${util.avatarHtml(u, 'avatar avatar-sm')}
      <span>${util.escapeHtml(u.nickname)}</span>
      <span class="choice-sub">${util.escapeHtml(u.position || '')} · ${isOnline(u.id) ? '在线' : '离线'}</span>
    </button>`).join('') || '<div class="empty-block">暂无其他同事</div>';

  const groupRows = others.map((u) => `
    <label class="choice-row">
      <input type="checkbox" value="${u.id}">
      ${util.avatarHtml(u, 'avatar avatar-sm')}
      <span>${util.escapeHtml(u.nickname)}</span>
      <span class="choice-sub">${util.escapeHtml(u.position || '')}</span>
    </label>`).join('') || '<div class="empty-block">暂无其他同事</div>';

  const modal = ui.openModal({
    title: '发起聊天',
    width: 500,
    height: 600,
    body: `
      <div class="modal-tabs">
        <button type="button" class="az-btn small active" data-tab="dm">私信</button>
        <button type="button" class="az-btn small" data-tab="group">群聊</button>
      </div>
      <div data-pane="dm">
        <div class="form-note">选择一位同事开始私信。</div>
        <div class="choice-list" style="max-height:380px">${dmRows}</div>
      </div>
      <div data-pane="group" class="hidden">
        <div class="form-row"><label>群名称</label><input class="az-input" data-group-name placeholder="例如：市场部项目组" maxlength="60"></div>
        <div class="form-note">勾选群成员：</div>
        <div class="choice-list" style="max-height:330px">${groupRows}</div>
      </div>
    `,
    footer: `<button type="button" class="az-btn" data-cancel>取消</button>
             <button type="button" class="az-btn wine hidden" data-create-group>创建群聊</button>`,
    closeOnOverlay: false,
  });
  const tabs = modal.queryAll('[data-tab]');
  const panes = {
    dm: modal.query('[data-pane="dm"]'),
    group: modal.query('[data-pane="group"]'),
  };
  const createBtn = modal.query('[data-create-group]');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      const isDm = tab.dataset.tab === 'dm';
      panes.dm.classList.toggle('hidden', !isDm);
      panes.group.classList.toggle('hidden', isDm);
      createBtn.classList.toggle('hidden', isDm);
    });
  });
  modal.query('[data-cancel]').addEventListener('click', modal.close);
  modal.bodyEl.addEventListener('click', async (event) => {
    const row = event.target.closest('[data-dm-user]');
    if (!row) return;
    const userId = Number(row.dataset.dmUser);
    try {
      const data = await request('/api/conversations', { method: 'POST', body: { type: 'dm', userId } });
      modal.close();
      await app.refreshConversations();
      openConversation(data.conversation.id);
    } catch (err) {
      ui.toast(err.message, { error: true });
    }
  });
  createBtn.addEventListener('click', async () => {
    const name = (modal.query('[data-group-name]').value || '').trim();
    const memberIds = modal.queryAll('input[type="checkbox"]:checked').map((el) => Number(el.value));
    if (!name) {
      ui.toast('请填写群名称', { error: true });
      return;
    }
    if (!memberIds.length) {
      ui.toast('请至少选择一位成员', { error: true });
      return;
    }
    try {
      const data = await request('/api/conversations', { method: 'POST', body: { type: 'group', name, memberIds } });
      modal.close();
      await app.refreshConversations();
      openConversation(data.conversation.id);
    } catch (err) {
      ui.toast(err.message, { error: true });
    }
  });
}

export function clearComposer() {
  els.input.value = '';
  autoGrow();
  setKind('text');
}
