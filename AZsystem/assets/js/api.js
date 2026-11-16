const LS_SESSION = 'az_session';
const LS_BASE = 'az_api_base';

function normalizeBase(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

const configBase = normalizeBase(window.AZ_CONFIG && window.AZ_CONFIG.API_BASE);
let apiBase = normalizeBase(localStorage.getItem(LS_BASE) || configBase);
let sessionToken = localStorage.getItem(LS_SESSION) || '';
let unauthorizedHandler = null;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getApiBase() {
  return apiBase;
}

export function setApiBase(value) {
  apiBase = normalizeBase(value || configBase);
  if (apiBase) localStorage.setItem(LS_BASE, apiBase);
  else localStorage.removeItem(LS_BASE);
  return apiBase;
}

export function apiUrl(path) {
  return `${apiBase}${path}`;
}

export function getSessionToken() {
  return sessionToken;
}

export function setSessionToken(token) {
  sessionToken = token || '';
  if (sessionToken) localStorage.setItem(LS_SESSION, sessionToken);
  else localStorage.removeItem(LS_SESSION);
}

export function clearSession() {
  setSessionToken('');
  stopWS();
}

export function onUnauthorized(fn) {
  unauthorizedHandler = fn;
}

export async function request(path, { method = 'GET', body, form, signal } = {}) {
  const headers = {};
  if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`;
  let payload;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(apiUrl(path), { method, headers, body: payload, signal });
  } catch (err) {
    if (err && err.name === 'AbortError') throw err;
    throw new ApiError('无法连接服务器，请检查网络或服务器地址', 0);
  }
  const type = res.headers.get('content-type') || '';
  let data = null;
  try {
    data = type.includes('application/json') ? await res.json() : await res.text();
  } catch {
    data = null;
  }
  if (!res.ok) {
    if (res.status === 401 && sessionToken && unauthorizedHandler) unauthorizedHandler();
    const message = data && data.error ? data.error : `请求失败（${res.status}）`;
    throw new ApiError(message, res.status);
  }
  return data;
}

export function mediaUrl(path, { download = false } = {}) {
  if (!path) return '';
  let url = /^https?:/i.test(path) ? path : apiUrl(path);
  const params = [];
  if (sessionToken) params.push(`token=${encodeURIComponent(sessionToken)}`);
  if (download) params.push('download=1');
  if (params.length) url += (url.includes('?') ? '&' : '?') + params.join('&');
  return url;
}

export async function uploadFile(file, scope, extra = {}) {
  const form = new FormData();
  form.append('scope', scope);
  for (const [key, value] of Object.entries(extra)) form.append(key, value);
  form.append('file', file, file.name || 'upload');
  return request('/api/upload', { method: 'POST', form });
}

export async function uploadAvatar(file, userId = null) {
  const form = new FormData();
  form.append('file', file, file.name || 'avatar');
  const path = userId ? `/api/admin/users/${userId}/avatar` : '/api/me/avatar';
  return request(path, { method: 'POST', form });
}

/* ---------------- WebSocket ---------------- */

let ws = null;
let reconnectTimer = null;
let attempt = 0;
let stopped = true;
let statusHandler = null;
let eventHandler = null;

export function onWsStatus(fn) {
  statusHandler = fn;
}

export function onWsEvent(fn) {
  eventHandler = fn;
}

function notifyStatus(status) {
  if (statusHandler) statusHandler(status);
}

function wsUrl(token) {
  const fallback = `${location.protocol}//${location.host}`;
  let base = apiBase || fallback;
  let url;
  try {
    url = new URL(base);
  } catch {
    url = new URL(fallback);
  }
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/ws`;
  url.search = `?token=${encodeURIComponent(token)}`;
  return url.toString();
}

function scheduleReconnect() {
  if (stopped || !sessionToken) return;
  clearTimeout(reconnectTimer);
  const delay = Math.min(15000, 800 * 2 ** attempt);
  attempt += 1;
  reconnectTimer = setTimeout(() => connectWS(), delay);
}

export function connectWS() {
  if (!sessionToken) return;
  stopped = false;
  clearTimeout(reconnectTimer);
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
  try {
    ws = new WebSocket(wsUrl(sessionToken));
  } catch {
    scheduleReconnect();
    return;
  }
  ws.onopen = () => {
    attempt = 0;
    notifyStatus('online');
  };
  ws.onmessage = (event) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch {
      return;
    }
    if (!data || data.type === 'pong') return;
    if (eventHandler) eventHandler(data);
  };
  ws.onclose = () => {
    notifyStatus('offline');
    if (!stopped) scheduleReconnect();
  };
  ws.onerror = () => {};
}

export function stopWS() {
  stopped = true;
  clearTimeout(reconnectTimer);
  if (ws) {
    try {
      ws.close();
    } catch {
      /* ignore */
    }
    ws = null;
  }
}

export function wsSend(payload) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }
}

window.addEventListener('online', () => {
  if (!stopped && !ws) connectWS();
});
