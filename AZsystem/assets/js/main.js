import * as api from './api.js';
import * as util from './util.js';
import * as ui from './ui.js';
import * as chat from './chat.js';
import * as files from './files.js';
import * as admin from './admin.js';
import { openProfile } from './profile.js';

const state = {
  me: null,
  users: [],
  conversations: [],
  online: new Set(),
  currentId: null,
  currentConversation: null,
  messages: [],
  hasMore: false,
  view: 'chat',
  hintBusy: false,
};

const els = {};
let loginMode = 'password';
let wsWasOffline = false;

const app = {
  state,
  setView,
  setHint,
  setHintIdle,
  refreshUsers,
  refreshConversations,
  reloadMe,
  updateTitle,
  logout,
};

function cacheElements() {
  els.loginView = document.getElementById('login-view');
  els.appView = document.getElementById('app-view');
  els.loginForm = document.getElementById('login-form');
  els.loginUserRow = document.getElementById('login-user-row');
  els.loginPassRow = document.getElementById('login-pass-row');
  els.loginTokenRow = document.getElementById('login-token-row');
  els.loginUsername = document.getElementById('login-username');
  els.loginPassword = document.getElementById('login-password');
  els.loginToken = document.getElementById('login-token');
  els.loginSubmit = document.getElementById('login-submit');
  els.loginError = document.getElementById('login-error');
  els.serverToggle = document.getElementById('server-toggle');
  els.serverBase = document.getElementById('server-base');
  els.loginTabs = [...document.querySelectorAll('.login-tab')];
  els.navButtons = [...document.querySelectorAll('.nav-btn')];
  els.connDot = document.getElementById('conn-dot');
  els.connText = document.getElementById('conn-text');
  els.meAvatar = document.getElementById('me-avatar');
  els.meName = document.getElementById('me-name');
  els.mePosition = document.getElementById('me-position');
  els.hint = document.getElementById('hintbar');
  els.chatView = document.getElementById('chat-view');
  els.filesView = document.getElementById('files-view');
  els.adminView = document.getElementById('admin-view');
  els.membersPanel = document.getElementById('members-panel');
  els.filesSide = document.getElementById('files-side');
  els.adminSide = document.getElementById('admin-side');
}

/* ---------------- 登录 ---------------- */

function isLocalHost() {
  return ['localhost', '127.0.0.1', '[::1]', ''].includes(location.hostname) || location.protocol === 'file:';
}

function normalizeServer(value) {
  let v = String(value || '').trim();
  if (!v) return '';
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  v = v.replace(/\/+$/, '');
  try {
    const url = new URL(v);
    if (!url.hostname) return '';
    const pathname = url.pathname.replace(/\/+$/, '');
    return url.origin + pathname;
  } catch {
    return '';
  }
}

function setLoginMode(mode) {
  loginMode = mode;
  els.loginTabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.mode === mode));
  els.loginUserRow.classList.toggle('hidden', mode !== 'password');
  els.loginPassRow.classList.toggle('hidden', mode !== 'password');
  els.loginTokenRow.classList.toggle('hidden', mode !== 'token');
  els.loginError.textContent = '';
  const field = mode === 'password' ? els.loginUsername : els.loginToken;
  setTimeout(() => field.focus(), 20);
}

function showLogin(message = '') {
  els.loginView.classList.remove('hidden');
  els.appView.classList.add('hidden');
  els.loginError.textContent = message;
  els.loginSubmit.disabled = false;
  setTimeout(() => {
    const field = loginMode === 'password' ? els.loginUsername : els.loginToken;
    if (field) field.focus();
  }, 30);
}

function bindLogin() {
  els.loginTabs.forEach((tab) => {
    tab.addEventListener('click', () => setLoginMode(tab.dataset.mode));
  });
  els.serverToggle.addEventListener('click', () => {
    const hidden = els.serverBase.classList.contains('hidden');
    els.serverBase.classList.toggle('hidden', !hidden);
    if (hidden) els.serverBase.focus();
  });
  els.loginForm.addEventListener('submit', onLoginSubmit);

  const storedBase = api.getApiBase();
  if (storedBase) els.serverBase.value = storedBase;
  if (!storedBase && !isLocalHost()) {
    els.serverBase.classList.remove('hidden');
    els.loginError.textContent = '请填写后端服务器地址（例如 https://api.example.com）';
  }
}

async function onLoginSubmit(event) {
  event.preventDefault();
  const serverValue = els.serverBase.value.trim();
  if (serverValue) {
    const normalized = normalizeServer(serverValue);
    if (!normalized) {
      els.loginError.textContent = '服务器地址格式不正确';
      return;
    }
    api.setApiBase(normalized);
    els.serverBase.value = normalized;
  }
  if (!api.getApiBase() && !isLocalHost()) {
    els.loginError.textContent = '请先填写后端服务器地址';
    return;
  }
  els.loginError.textContent = '';
  els.loginSubmit.disabled = true;
  api.setSessionToken('');
  try {
    let data;
    if (loginMode === 'password') {
      const username = els.loginUsername.value.trim();
      const password = els.loginPassword.value;
      if (!username || !password) throw new Error('请输入用户名和密码');
      data = await api.request('/api/auth/login', { method: 'POST', body: { username, password } });
    } else {
      const token = els.loginToken.value.trim();
      if (!token) throw new Error('请输入登录 Token');
      data = await api.request('/api/auth/token', { method: 'POST', body: { token } });
    }
    api.setSessionToken(data.token);
    state.me = data.user;
    els.loginPassword.value = '';
    await enterApp();
  } catch (err) {
    api.setSessionToken('');
    els.loginError.textContent = err.message || '登录失败';
    els.loginSubmit.disabled = false;
  }
}

/* ---------------- 进入应用 ---------------- */

async function enterApp() {
  els.loginView.classList.add('hidden');
  els.appView.classList.remove('hidden');
  renderMe();
  els.connDot.className = 'dot offline';
  els.connText.textContent = '连接中';
  setHint('正在加载会话…');
  try {
    await Promise.all([refreshUsers(), refreshConversations()]);
  } catch (err) {
    ui.toast(err.message, { error: true });
  }
  api.connectWS();
  const initial =
    state.conversations.find((c) => c.type === 'all') || state.conversations[0] || null;
  if (initial) {
    await chat.openConversation(initial.id);
  } else {
    chat.closeConversation();
  }
  setHintIdle();
  if (sessionStorage.getItem('az_expired')) sessionStorage.removeItem('az_expired');
}

async function restoreSession() {
  if (!api.getSessionToken()) {
    showLogin(sessionStorage.getItem('az_expired') ? '登录已失效，请重新登录' : '');
    if (sessionStorage.getItem('az_expired')) sessionStorage.removeItem('az_expired');
    return;
  }
  els.loginError.textContent = '正在恢复登录…';
  try {
    const data = await api.request('/api/auth/me');
    state.me = data.user;
    await enterApp();
  } catch (err) {
    if (err && err.status === 401) {
      api.clearSession();
      showLogin('登录已失效，请重新登录');
    } else {
      showLogin(err.message || '无法连接服务器');
    }
  }
}

function logout() {
  api.request('/api/auth/logout', { method: 'POST' }).catch(() => {});
  api.clearSession();
  sessionStorage.removeItem('az_expired');
  location.reload();
}

function renderMe() {
  if (!state.me) return;
  els.meAvatar.innerHTML = '';
  if (state.me.avatarUrl) {
    const img = document.createElement('img');
    img.src = api.mediaUrl(state.me.avatarUrl);
    img.alt = state.me.nickname;
    els.meAvatar.appendChild(img);
  } else {
    els.meAvatar.textContent = util.initials(state.me.nickname);
  }
  els.meName.textContent = state.me.nickname;
  els.mePosition.textContent = state.me.position || '';
  document.querySelectorAll('.admin-only').forEach((el) => {
    el.classList.toggle('hidden', state.me.role !== 'admin');
  });
  updateTitle();
}

/* ---------------- 数据刷新 ---------------- */

async function refreshUsers() {
  const data = await api.request('/api/users');
  state.users = data.users || [];
  state.online = new Set(state.users.filter((u) => u.online).map((u) => u.id));
  if (state.view === 'chat') chat.updatePresence();
}

async function refreshConversations() {
  const data = await api.request('/api/conversations');
  state.conversations = data.conversations || [];
  if (state.currentId) {
    const fresh = state.conversations.find((c) => c.id === state.currentId);
    if (fresh) state.currentConversation = fresh;
    else chat.closeConversation();
  }
  chat.renderConversationList();
  if (state.view === 'chat') chat.updatePresence();
  updateTitle();
  return state.conversations;
}

async function reloadMe() {
  const data = await api.request('/api/auth/me');
  state.me = data.user;
  renderMe();
}

function updateTitle() {
  const unread = state.conversations.reduce((sum, c) => sum + (c.unread || 0), 0);
  document.title = unread > 0 ? `(${unread > 99 ? '99+' : unread}) 啊这工作系统` : '啊这工作系统';
}

/* ---------------- 视图 ---------------- */

function setView(view) {
  if (view === 'admin' && (!state.me || state.me.role !== 'admin')) return;
  state.view = view;
  els.navButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.view === view));
  els.chatView.classList.toggle('hidden', view !== 'chat');
  els.filesView.classList.toggle('hidden', view !== 'files');
  els.adminView.classList.toggle('hidden', view !== 'admin');
  els.membersPanel.classList.toggle('hidden', view !== 'chat');
  els.filesSide.classList.toggle('hidden', view !== 'files');
  els.adminSide.classList.toggle('hidden', view !== 'admin');
  if (view === 'files') files.showFilesView();
  else if (view === 'admin') admin.showAdminView();
  else if (view === 'chat') {
    chat.updatePresence();
    chat.markCurrentRead();
  }
  if (!state.hintBusy) setHintIdle();
}

function setHint(text) {
  state.hintBusy = true;
  els.hint.textContent = text;
}

function setHintIdle() {
  state.hintBusy = false;
  const base = api.getApiBase() || location.origin;
  const where =
    state.view === 'files' ? '公共文件区' : state.view === 'admin' ? '管理后台' : state.currentConversation ? state.currentConversation.name : '消息';
  els.hint.textContent = `${where} · ${state.online.size} 人在线 · 后端 ${base}`;
}

/* ---------------- WebSocket ---------------- */

function applyOnline(ids) {
  state.online = new Set((ids || []).map(Number));
  state.users.forEach((u) => {
    u.online = state.online.has(u.id);
  });
  if (state.view === 'chat') chat.updatePresence();
}

function setPresence(userId, online) {
  const id = Number(userId);
  if (online) state.online.add(id);
  else state.online.delete(id);
  const user = state.users.find((u) => u.id === id);
  if (user) user.online = online;
  if (state.view === 'chat') chat.updatePresence();
}

function notifyDesktop(message) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (!document.hidden) return;
  if (!state.me || (message.sender && message.sender.id === state.me.id)) return;
  if (message.conversationId === state.currentId) return;
  try {
    const conv = state.conversations.find((c) => c.id === message.conversationId);
    new Notification(conv ? conv.name : (message.sender && message.sender.nickname) || '新消息', {
      body: `${message.sender ? message.sender.nickname : ''}：${util.previewText(message)}`,
      tag: `az-conv-${message.conversationId}`,
    });
  } catch {
    /* ignore */
  }
}

function handleWsEvent(event) {
  switch (event.type) {
    case 'hello':
      applyOnline(event.online);
      if (!state.hintBusy) setHintIdle();
      break;
    case 'presence':
      setPresence(event.userId, event.online);
      if (!state.hintBusy) setHintIdle();
      break;
    case 'message':
      chat.onIncoming(event.message);
      notifyDesktop(event.message);
      break;
    case 'message:update':
      chat.onMessageUpdate(event.message);
      break;
    case 'message:delete':
      chat.onMessageDelete(event.messageId, event.conversationId);
      break;
    case 'conversations:refresh':
      refreshConversations().catch(() => {});
      break;
    case 'typing':
      chat.onTyping(event);
      break;
    case 'user:update':
      refreshUsers().catch(() => {});
      if (state.me && event.userId === state.me.id) reloadMe().catch(() => {});
      break;
    default:
      break;
  }
}

function bindWs() {
  api.onWsStatus((status) => {
    if (status === 'online') {
      els.connDot.className = 'dot online';
      els.connText.textContent = '已连接';
      if (wsWasOffline && state.me) {
        refreshUsers().catch(() => {});
        refreshConversations().catch(() => {});
        if (state.currentId) chat.openConversation(state.currentId);
      }
      wsWasOffline = false;
      if (!state.hintBusy) setHintIdle();
    } else {
      els.connDot.className = 'dot offline';
      els.connText.textContent = '重连中';
      wsWasOffline = true;
      if (!state.hintBusy) setHint('实时连接已断开，正在自动重连…');
    }
  });
  api.onWsEvent(handleWsEvent);
  api.onUnauthorized(() => {
    api.clearSession();
    sessionStorage.setItem('az_expired', '1');
    location.reload();
  });
}

/* ---------------- 事件绑定 ---------------- */

function bindApp() {
  els.navButtons.forEach((btn) => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  });
  document.getElementById('user-chip').addEventListener('click', () => openProfile(app));
  document.getElementById('logout-btn').addEventListener('click', logout);
}

function boot() {
  cacheElements();
  bindLogin();
  bindWs();
  chat.initChat(app);
  files.initFiles(app);
  admin.initAdmin(app);
  bindApp();
  restoreSession();
}

boot();
