import { request, uploadAvatar } from './api.js';
import * as util from './util.js';
import * as ui from './ui.js';

let app = null;
let stats = null;
let loading = false;
const els = {};

export function initAdmin(appRef) {
  app = appRef;
  els.view = document.getElementById('admin-view');
  els.side = document.getElementById('admin-side');
  els.view.addEventListener('click', onViewClick);
}

export function showAdminView() {
  loadStats();
}

async function loadStats() {
  if (loading) return;
  loading = true;
  if (!stats) {
    els.view.innerHTML = `
      <div class="view-head"><span class="view-title">管理后台</span></div>
      <div class="admin-body"><div class="empty-block">加载中…</div></div>`;
  }
  try {
    const data = await request('/api/admin/stats?days=14');
    stats = data;
    render();
  } catch (err) {
    if (!stats) {
      els.view.innerHTML = `
        <div class="view-head"><span class="view-title">管理后台</span></div>
        <div class="admin-body"><div class="empty-block">${util.escapeHtml(err.message)}</div></div>`;
    }
    ui.toast(err.message, { error: true });
  } finally {
    loading = false;
  }
}

function methodLabel(method) {
  if (method === 'password') return '密码登录';
  if (method === 'token') return 'Token 登录';
  return method || '';
}

function render() {
  const t = stats.totals;
  const users = stats.users || [];
  const storageUsed = Number(t.storageUsed) || 0;
  const storageLimit = Number(t.storageLimit) || 5 * 1024 * 1024 * 1024;
  const storagePercent = storageLimit ? Math.min(100, Math.round((storageUsed / storageLimit) * 100)) : 0;
  const daily = buildDaily(stats.daily || [], stats.days || 14);
  const max = Math.max(1, ...daily.map((d) => d.count));
  const chart = daily.map((d) => `
    <div class="bar-col" title="${util.escapeHtml(d.date)}：${d.count} 次登录">
      <span class="bar-value">${d.count || ''}</span>
      <span class="bar" style="height:${Math.max(2, Math.round((d.count / max) * 86))}px"></span>
      <span class="bar-label">${util.escapeHtml(util.fmtShortDate(d.date))}</span>
    </div>`).join('');

  const rows = users.map((u) => {
    const isAdmin = u.role === 'admin';
    return `
      <div class="emp-row${u.active ? '' : ' inactive'}" data-user-id="${u.id}">
        ${util.avatarHtml(u, 'avatar avatar-sm')}
        <span class="emp-main">
          <span class="emp-name">${util.escapeHtml(u.nickname)}${isAdmin ? '（老板）' : ''}</span>
          <span class="emp-sub">@${util.escapeHtml(u.username)} · ${util.escapeHtml(u.position || '未设置职位')}</span>
        </span>
        <span class="emp-last">${u.lastLogin ? util.escapeHtml(util.fmtTime(u.lastLogin.at)) : '从未登录'}<br>7日 ${u.logins7} 次</span>
        <span class="dot ${u.online ? 'online' : 'offline'}" title="${u.online ? '在线' : '离线'}"></span>
        <span class="emp-actions">
          <button type="button" class="az-btn small" data-edit="${u.id}">编辑</button>
          ${isAdmin ? '' : `<button type="button" class="az-btn small" data-toggle="${u.id}">${u.active ? '停用' : '启用'}</button>`}
        </span>
      </div>`;
  }).join('') || '<div class="empty-block">还没有员工</div>';

  const logins = (stats.recent || []).map((row) => `
    <div class="login-row-admin">
      <span class="lr-time">${util.escapeHtml(util.fmtTime(row.at))}</span>
      <span class="lr-name">${util.escapeHtml(row.nickname)}</span>
      <span class="lr-method">${util.escapeHtml(methodLabel(row.method))}</span>
      <span class="lr-ip">${util.escapeHtml(row.ip || '')}</span>
    </div>`).join('') || '<div class="empty-block">暂无登录记录</div>';

  els.view.innerHTML = `
    <div class="view-head">
      <span class="view-title">管理后台</span>
      <button type="button" class="az-btn" data-action="new" style="margin-left:auto">新建员工</button>
      <button type="button" class="az-btn small" data-action="conversations">全部会话</button>
      <button type="button" class="az-btn small" data-action="logs">系统日志</button>
      <button type="button" class="az-btn small" data-action="refresh">刷新</button>
    </div>
    <div class="admin-body">
      <div class="stat-grid">
        <div class="stat-tile"><div class="stat-label">在职员工</div><div class="stat-value">${t.employees}</div></div>
        <div class="stat-tile"><div class="stat-label">当前在线</div><div class="stat-value">${t.online}</div></div>
        <div class="stat-tile"><div class="stat-label">今日登录</div><div class="stat-value">${t.loginsToday}</div></div>
        <div class="stat-tile"><div class="stat-label">今日消息</div><div class="stat-value">${t.messagesToday}</div></div>
        <div class="stat-tile"><div class="stat-label">公共文件</div><div class="stat-value">${t.publicFiles}</div></div>
        <div class="stat-tile"><div class="stat-label">群聊 / 私信</div><div class="stat-value">${t.groups} / ${t.dms}</div></div>
        <div class="stat-tile" title="${util.escapeHtml(util.fmtSize(storageUsed))} / ${util.escapeHtml(util.fmtSize(storageLimit))}"><div class="stat-label">存储用量</div><div class="stat-value">${storagePercent}%</div></div>
      </div>
      <div class="admin-section"><span>近 ${stats.days} 天登录次数</span><span class="hint">悬停柱状图查看日期</span></div>
      <div class="chart-panel">${chart}</div>
      <div class="admin-section">
        <span>员工管理</span>
        <span class="hint">共 ${users.length} 个账号 · 点击“编辑”分配昵称、职位与头像</span>
      </div>
      <div>${rows}</div>
      <div class="admin-section"><span>最近登录记录</span><span class="hint">最多显示 60 条</span></div>
      <div>${logins}</div>
    </div>
  `;

  els.side.innerHTML = `
    <div class="admin-side">
      <div class="side-title">今日概览</div>
      <div class="big-number">${t.loginsToday}</div>
      <div class="form-note" style="text-align:right">次登录</div>
      <div class="side-line"><span>在线员工</span><span>${t.online} / ${t.employees}</span></div>
      <div class="side-line"><span>今日消息</span><span>${t.messagesToday}</span></div>
      <div class="side-line"><span>消息总数</span><span>${t.messages}</span></div>
      <div class="side-line"><span>已停用账号</span><span>${t.employeesAll - t.employees}</span></div>
      <div class="side-line"><span>存储用量</span><span>${util.fmtSize(storageUsed)} / ${util.fmtSize(storageLimit)}</span></div>
      <div class="side-section">
        <div class="side-title">说明</div>
        <div class="form-note">员工可用用户名密码登录，也可使用个人 Token 免密登录。管理员可随时重置密码或重新生成 Token。</div>
      </div>
    </div>
  `;
}

function buildDaily(rows, days) {
  const map = new Map(rows.map((r) => [r.date, r]));
  const list = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const row = map.get(key);
    list.push({ date: key, count: row ? row.count : 0 });
  }
  return list;
}

function onViewClick(event) {
  const action = event.target.closest('[data-action]');
  if (action) {
    const a = action.dataset.action;
    if (a === 'refresh') loadStats();
    if (a === 'new') openNewUserModal();
    if (a === 'conversations') openConversationsModal();
    if (a === 'logs') openLogsModal();
    return;
  }
  const edit = event.target.closest('[data-edit]');
  if (edit) {
    const user = findUser(Number(edit.dataset.edit));
    if (user) openEditUserModal(user);
    return;
  }
  const toggle = event.target.closest('[data-toggle]');
  if (toggle) {
    const user = findUser(Number(toggle.dataset.toggle));
    if (user) toggleUser(user);
  }
}

function findUser(id) {
  return stats && stats.users.find((u) => u.id === id);
}

async function toggleUser(user) {
  const disabling = user.active;
  if (disabling) {
    const ok = await ui.confirmDialog(
      `确定停用「${user.nickname}」的账号吗？停用后该员工将无法登录，登录会话会立即失效。`,
      { title: '停用账号', okText: '停用', wine: true }
    );
    if (!ok) return;
  }
  try {
    await request(`/api/admin/users/${user.id}`, { method: 'PATCH', body: { active: !user.active } });
    ui.toast(disabling ? '账号已停用' : '账号已启用');
    await app.refreshUsers();
    loadStats();
  } catch (err) {
    ui.toast(err.message, { error: true });
  }
}

function openNewUserModal() {
  const modal = ui.openModal({
    title: '新建员工',
    tight: true,
    width: 500,
    body: `
      <div class="form-row"><label>用户名</label><input class="az-input" data-username placeholder="3-30 位字母数字 _ . -" maxlength="30"></div>
      <div class="form-row"><label>初始密码</label><input class="az-input" data-password type="password" placeholder="至少 6 位" maxlength="100"></div>
      <div class="form-row"><label>昵称</label><input class="az-input" data-nickname placeholder="例如：张三" maxlength="40"></div>
      <div class="form-row"><label>职位</label><input class="az-input" data-position placeholder="例如：前端工程师" maxlength="40"></div>
      <div class="form-note">员工创建后会自动加入全员群。昵称会显示在聊天中。</div>
    `,
    footer: `<button type="button" class="az-btn" data-cancel>取消</button>
             <button type="button" class="az-btn wine" data-create>创建账号</button>`,
    closeOnOverlay: false,
  });
  modal.query('[data-cancel]').addEventListener('click', modal.close);
  modal.query('[data-create]').addEventListener('click', async () => {
    const username = (modal.query('[data-username]').value || '').trim();
    const password = modal.query('[data-password]').value || '';
    const nickname = (modal.query('[data-nickname]').value || '').trim();
    const position = (modal.query('[data-position]').value || '').trim();
    if (!username || !password) {
      ui.toast('请填写用户名和初始密码', { error: true });
      return;
    }
    try {
      await request('/api/admin/users', {
        method: 'POST',
        body: { username, password, nickname, position },
      });
      modal.close();
      ui.toast('员工已创建');
      await app.refreshUsers();
      await app.refreshConversations();
      loadStats();
    } catch (err) {
      ui.toast(err.message, { error: true });
    }
  });
}

function openEditUserModal(user) {
  const isAdmin = user.role === 'admin';
  const modal = ui.openModal({
    title: '员工资料',
    width: 500,
    height: 600,
    body: `
      <div class="user-detail">
        ${util.avatarHtml(user, 'avatar avatar-lg')}
        <div>
          <div class="user-detail-name">${util.escapeHtml(user.nickname)}</div>
          <div class="user-detail-sub">@${util.escapeHtml(user.username)} · ${isAdmin ? '管理员' : '员工'} · ${user.online ? '在线' : '离线'}</div>
        </div>
      </div>
      <div class="form-section">基本资料</div>
      <div class="form-row"><label>昵称</label><input class="az-input" data-nickname value="${util.escapeHtml(user.nickname)}" maxlength="40"></div>
      <div class="form-row"><label>职位</label><input class="az-input" data-position value="${util.escapeHtml(user.position || '')}" maxlength="40"></div>
      <div class="form-row"><label>状态</label>
        <label style="width:auto;display:flex;gap:6px;align-items:center;color:var(--az-text);font-size:14px">
          <input type="checkbox" data-active ${user.active ? 'checked' : ''} ${isAdmin ? 'disabled' : ''} style="accent-color:var(--az-accent)">
          <span>${isAdmin ? '管理员始终启用' : '在职（取消勾选则停用账号）'}</span>
        </label>
      </div>
      <div class="modal-actions"><button type="button" class="az-btn wine" data-save>保存资料</button></div>

      <div class="form-section">头像</div>
      <div class="user-detail" data-avatar-area>
        ${util.avatarHtml(user, 'avatar avatar-lg')}
        <button type="button" class="az-btn" data-avatar>上传新头像</button>
      </div>
      <div class="form-note">支持 JPG/PNG 等图片，最大 10MB。</div>

      <div class="form-section">重置密码</div>
      <div class="form-row"><label>新密码</label><input class="az-input" data-password type="password" placeholder="至少 6 位" maxlength="100"></div>
      <div class="modal-actions"><button type="button" class="az-btn" data-reset>重置密码</button></div>
      <div class="form-note">重置后该员工所有登录会话会失效，需要重新登录。</div>

      <div class="form-section">登录 Token</div>
      <textarea class="az-input token-box" data-token readonly>${util.escapeHtml(user.personalToken || '')}</textarea>
      <div class="modal-actions">
        <button type="button" class="az-btn" data-copy>复制 Token</button>
        <button type="button" class="az-btn" data-regen>重新生成</button>
      </div>
      <div class="form-note">Token 可用于免密登录；重新生成后旧 Token 立即失效。</div>

      <div class="form-section">登录统计</div>
      <div class="profile-line"><span class="k">最近登录</span><span class="v">${user.lastLogin ? util.escapeHtml(util.fmtTime(user.lastLogin.at)) + ' · ' + util.escapeHtml(methodLabel(user.lastLogin.method)) : '从未登录'}</span></div>
      <div class="profile-line"><span class="k">近 7 天</span><span class="v">${user.logins7} 次</span></div>
      <div class="profile-line"><span class="k">近 30 天</span><span class="v">${user.logins30} 次</span></div>
      <div class="profile-line"><span class="k">最近 IP</span><span class="v">${user.lastLogin ? util.escapeHtml(user.lastLogin.ip || '—') : '—'}</span></div>
    `,
    footer: `<button type="button" class="az-btn" data-close>关闭</button>`,
  });
  modal.query('[data-close]').addEventListener('click', modal.close);

  modal.query('[data-save]').addEventListener('click', async () => {
    const nickname = (modal.query('[data-nickname]').value || '').trim();
    const position = (modal.query('[data-position]').value || '').trim();
    if (!nickname) {
      ui.toast('昵称不能为空', { error: true });
      return;
    }
    const body = { nickname, position };
    if (!isAdmin) body.active = modal.query('[data-active]').checked;
    try {
      await request(`/api/admin/users/${user.id}`, { method: 'PATCH', body });
      ui.toast('资料已保存');
      await app.refreshUsers();
      await app.refreshConversations();
      modal.close();
      loadStats();
    } catch (err) {
      ui.toast(err.message, { error: true });
    }
  });

  modal.query('[data-avatar]').addEventListener('click', async () => {
    const file = await util.pickFile('image/*');
    if (!file) return;
    try {
      await uploadAvatar(file, user.id);
      ui.toast('头像已更新');
      modal.close();
      await app.refreshUsers();
      loadStats();
    } catch (err) {
      ui.toast(err.message, { error: true });
    }
  });

  modal.query('[data-reset]').addEventListener('click', async () => {
    const password = modal.query('[data-password]').value || '';
    if (password.length < 6) {
      ui.toast('密码至少 6 位', { error: true });
      return;
    }
    const ok = await ui.confirmDialog(`确定重置「${user.nickname}」的密码吗？该员工当前登录会立即失效。`, {
      title: '重置密码',
      okText: '重置',
      wine: true,
    });
    if (!ok) return;
    try {
      await request(`/api/admin/users/${user.id}/password`, { method: 'POST', body: { password } });
      modal.query('[data-password]').value = '';
      ui.toast('密码已重置');
    } catch (err) {
      ui.toast(err.message, { error: true });
    }
  });

  modal.query('[data-copy]').addEventListener('click', async () => {
    const token = modal.query('[data-token]').value;
    const ok = await util.copyText(token);
    ui.toast(ok ? 'Token 已复制' : '复制失败，请手动选择复制', { error: !ok });
  });

  modal.query('[data-regen]').addEventListener('click', async () => {
    const ok = await ui.confirmDialog('重新生成后，旧 Token 将立即失效。确定继续吗？', {
      title: '重新生成 Token',
      okText: '重新生成',
      wine: true,
    });
    if (!ok) return;
    try {
      const data = await request(`/api/admin/users/${user.id}/token`, { method: 'POST' });
      modal.query('[data-token]').value = data.token;
      ui.toast('Token 已重新生成');
      loadStats();
    } catch (err) {
      ui.toast(err.message, { error: true });
    }
  });
}

/* ---------------- 会话审计 ---------------- */

const ACTION_LABELS = {
  login: '密码登录',
  login_failed: '登录失败',
  token_login: 'Token 登录',
  logout: '退出登录',
  nickname: '修改昵称',
  password: '修改密码',
  user_create: '创建员工',
  user_update: '更新员工',
  user_password: '重置密码',
  user_token: '重置 Token',
  user_avatar: '更新头像',
  conversation_create: '创建会话',
  conversation_rename: '修改群名',
  member_add: '添加成员',
  member_remove: '移除成员',
  message_delete: '删除消息',
  file_upload: '上传文件',
  file_delete: '删除文件',
  storage_limit: '存储超额',
  server_error: '服务器错误',
};

function actionLabel(action) {
  return ACTION_LABELS[action] || action;
}

function logCategory(action) {
  if (action === 'login' || action === 'login_failed' || action === 'token_login' || action === 'logout') {
    return 'login';
  }
  if (action.startsWith('user_') || action === 'nickname' || action === 'password') return 'user';
  if (action.startsWith('conversation') || action.startsWith('member_')) return 'conversation';
  if (action.startsWith('message')) return 'message';
  if (action.startsWith('file') || action === 'storage_limit') return 'file';
  return 'system';
}

async function openConversationsModal() {
  let items = [];
  const modal = ui.openModal({
    title: '全部会话',
    width: 500,
    height: 600,
    body: `
      <div class="form-row"><label>搜索</label><input class="az-input" data-search placeholder="群名或成员昵称"></div>
      <div data-list class="audit-list"><div class="empty-block">加载中…</div></div>
    `,
    footer: '<button type="button" class="az-btn" data-close>关闭</button>',
  });
  const listEl = modal.query('[data-list]');
  const searchEl = modal.query('[data-search]');
  modal.query('[data-close]').addEventListener('click', modal.close);

  function render() {
    const q = (searchEl.value || '').trim().toLowerCase();
    const shown = items.filter((c) => {
      if (!q) return true;
      return `${c.name} ${c.members.map((m) => m.nickname).join(' ')}`.toLowerCase().includes(q);
    });
    if (!shown.length) {
      listEl.innerHTML = '<div class="empty-block">没有匹配的会话</div>';
      return;
    }
    listEl.innerHTML = shown.map((c) => {
      const typeLabel = c.type === 'all' ? '全员群' : c.type === 'group' ? '群聊' : '私信';
      const last = c.lastMessage
        ? `${util.previewText(c.lastMessage)} · ${util.fmtTime(c.lastMessage.createdAt)}`
        : '暂无消息';
      const members = c.members.map((m) => m.nickname).join('、');
      return `
        <button type="button" class="audit-conv-row" data-audit="${c.id}">
          ${util.avatarHtml({ nickname: c.name, avatarUrl: c.avatarUrl }, 'avatar avatar-sm')}
          <span class="audit-conv-main">
            <span class="audit-conv-name">${util.escapeHtml(c.name)}<span class="audit-conv-type">${typeLabel}</span></span>
            <span class="audit-conv-sub">${c.memberCount} 人 · ${c.messageCount} 条消息 · ${util.escapeHtml(last)}</span>
            <span class="audit-conv-sub">${util.escapeHtml(members)}</span>
          </span>
          <span class="row-end">查看</span>
        </button>`;
    }).join('');
  }

  listEl.addEventListener('click', (event) => {
    const row = event.target.closest('[data-audit]');
    if (!row) return;
    modal.close();
    app.openAuditConversation(Number(row.dataset.audit));
  });
  searchEl.addEventListener('input', render);
  try {
    const data = await request('/api/admin/conversations');
    items = data.conversations || [];
    render();
  } catch (err) {
    listEl.innerHTML = `<div class="empty-block">${util.escapeHtml(err.message)}</div>`;
  }
}

/* ---------------- 系统日志 ---------------- */

async function openLogsModal() {
  let logs = [];
  const modal = ui.openModal({
    title: '系统日志',
    width: 560,
    height: 640,
    body: `
      <div class="form-row">
        <label>筛选</label>
        <select class="az-input" data-filter style="width:150px">
          <option value="all">全部日志</option>
          <option value="login">登录</option>
          <option value="user">账号</option>
          <option value="conversation">会话</option>
          <option value="message">消息</option>
          <option value="file">文件</option>
          <option value="system">系统</option>
        </select>
        <button type="button" class="az-btn small" data-refresh>刷新</button>
        <span class="form-note" data-count></span>
      </div>
      <div data-list class="log-list"><div class="empty-block">加载中…</div></div>
    `,
    footer: '<button type="button" class="az-btn" data-close>关闭</button>',
  });
  const listEl = modal.query('[data-list]');
  const filterEl = modal.query('[data-filter]');
  const countEl = modal.query('[data-count]');
  modal.query('[data-close]').addEventListener('click', modal.close);

  function render() {
    const cat = filterEl.value;
    const shown = logs.filter((log) => cat === 'all' || logCategory(log.action) === cat);
    countEl.textContent = `${shown.length} 条`;
    if (!shown.length) {
      listEl.innerHTML = '<div class="empty-block">暂无日志</div>';
      return;
    }
    listEl.innerHTML = shown.map((log) => `
      <div class="audit-log-row">
        <div class="al-top">
          <span class="al-time">${util.escapeHtml(util.fmtTime(log.at))}</span>
          <span class="al-actor">${util.escapeHtml(log.actor_name || '系统')}</span>
          <span class="al-action">${util.escapeHtml(actionLabel(log.action))}</span>
          <span class="al-ip">${util.escapeHtml(log.ip || '')}</span>
        </div>
        <div class="al-detail">${util.escapeHtml(log.detail || '')}</div>
      </div>`).join('');
  }

  async function load() {
    try {
      const data = await request('/api/admin/logs?limit=300');
      logs = data.logs || [];
      render();
    } catch (err) {
      listEl.innerHTML = `<div class="empty-block">${util.escapeHtml(err.message)}</div>`;
    }
  }

  filterEl.addEventListener('change', render);
  modal.query('[data-refresh]').addEventListener('click', load);
  load();
}
