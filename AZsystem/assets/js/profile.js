import { request, uploadAvatar } from './api.js';
import * as util from './util.js';
import * as ui from './ui.js';

export function openProfile(app) {
  const me = app.state.me;
  if (!me) return;
  const modal = ui.openModal({
    title: '个人设置',
    width: 500,
    height: 600,
    body: `
      <div class="user-detail">
        ${util.avatarHtml(me, 'avatar avatar-lg')}
        <div>
          <div class="user-detail-name">${util.escapeHtml(me.nickname)}</div>
          <div class="user-detail-sub">@${util.escapeHtml(me.username)} · ${me.role === 'admin' ? '管理员' : '员工'} · ${util.escapeHtml(me.position || '未设置职位')}</div>
        </div>
      </div>

      <div class="form-section">头像</div>
      <div class="user-detail">
        ${util.avatarHtml(me, 'avatar avatar-lg')}
        <button type="button" class="az-btn" data-avatar>上传新头像</button>
      </div>
      <div class="form-note">支持 JPG/PNG 等图片，最大 10MB。</div>

      <div class="form-section">登录 Token</div>
      <textarea class="az-input token-box" data-token readonly>${util.escapeHtml(me.personalToken || '')}</textarea>
      <div class="modal-actions">
        <button type="button" class="az-btn" data-copy>复制 Token</button>
      </div>
      <div class="form-note">在任何登录页选择“Token 登录”并粘贴此 Token，即可免密登录。请勿把 Token 发给无关人员。</div>

      <div class="form-section">修改密码</div>
      <div class="form-row"><label>原密码</label><input class="az-input" data-old-password type="password" autocomplete="current-password"></div>
      <div class="form-row"><label>新密码</label><input class="az-input" data-new-password type="password" placeholder="至少 6 位" autocomplete="new-password" maxlength="100"></div>
      <div class="modal-actions"><button type="button" class="az-btn" data-change-password>修改密码</button></div>
      <div class="form-note">修改后，其他设备上的登录会失效，当前设备保持登录。</div>

      <div class="form-section">我的登录统计</div>
      <div id="profile-login-stats"><div class="form-note">加载中…</div></div>

      <div class="form-section">桌面通知</div>
      <div class="modal-actions" style="justify-content:flex-start">
        <button type="button" class="az-btn" data-notify>开启桌面通知</button>
      </div>
      <div class="form-note">开启后，页面在后台时收到新消息会显示系统通知。</div>
    `,
    footer: `<button type="button" class="az-btn" data-logout>退出登录</button>
             <button type="button" class="az-btn" data-close>关闭</button>`,
  });

  modal.query('[data-close]').addEventListener('click', modal.close);
  modal.query('[data-logout]').addEventListener('click', () => {
    modal.close();
    app.logout();
  });

  modal.query('[data-avatar]').addEventListener('click', async () => {
    const file = await util.pickFile('image/*');
    if (!file) return;
    try {
      await uploadAvatar(file);
      modal.close();
      ui.toast('头像已更新');
      await app.reloadMe();
      await app.refreshUsers();
    } catch (err) {
      ui.toast(err.message, { error: true });
    }
  });

  modal.query('[data-copy]').addEventListener('click', async () => {
    const ok = await util.copyText(modal.query('[data-token]').value);
    ui.toast(ok ? 'Token 已复制' : '复制失败，请手动选择复制', { error: !ok });
  });

  modal.query('[data-change-password]').addEventListener('click', async () => {
    const oldPassword = modal.query('[data-old-password]').value || '';
    const newPassword = modal.query('[data-new-password]').value || '';
    if (newPassword.length < 6) {
      ui.toast('新密码至少 6 位', { error: true });
      return;
    }
    try {
      await request('/api/auth/me/password', {
        method: 'POST',
        body: { oldPassword, newPassword },
      });
      modal.query('[data-old-password]').value = '';
      modal.query('[data-new-password]').value = '';
      ui.toast('密码已修改');
    } catch (err) {
      ui.toast(err.message, { error: true });
    }
  });

  modal.query('[data-notify]').addEventListener('click', async () => {
    if (!('Notification' in window)) {
      ui.toast('当前浏览器不支持桌面通知', { error: true });
      return;
    }
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      ui.toast('桌面通知已开启');
      new Notification('啊这工作系统', { body: '桌面通知已开启' });
    } else {
      ui.toast('未获得桌面通知权限', { error: true });
    }
  });

  loadLoginStats(modal);
}

async function loadLoginStats(modal) {
  const box = modal.query('#profile-login-stats');
  if (!box) return;
  try {
    const data = await request('/api/auth/me/logins');
    const rows = (data.events || []).slice(0, 8).map((event) => `
      <div class="login-row-admin">
        <span class="lr-time">${util.escapeHtml(util.fmtTime(event.at))}</span>
        <span class="lr-method">${event.method === 'token' ? 'Token 登录' : '密码登录'}</span>
        <span class="lr-ip">${util.escapeHtml(event.ip || '')}</span>
      </div>`).join('') || '<div class="form-note">暂无登录记录</div>';
    box.innerHTML = `
      <div class="profile-line"><span class="k">近 7 天</span><span class="v">${data.count7} 次登录</span></div>
      <div class="profile-line"><span class="k">近 30 天</span><span class="v">${data.count30} 次登录</span></div>
      <div style="margin-top:6px">${rows}</div>
    `;
  } catch (err) {
    box.innerHTML = `<div class="form-note">${util.escapeHtml(err.message)}</div>`;
  }
}
