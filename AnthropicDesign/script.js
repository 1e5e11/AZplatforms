const modeContent = {
  default: {
    address: 'anthropic / default',
    eyebrow: 'A MORE HUMAN INTERFACE',
    title: '为思考，<br><em>留一点空间。</em>',
    description: '让内容拥有呼吸感，让每一次互动都自然发生。',
    button: '探索更多',
    caption: 'DEFAULT MODE',
    number: '01 / 04',
    explainer: '适合内容页与常规产品界面。保留足够留白，以清晰的层级引导阅读。'
  },
  brand: {
    address: 'anthropic / brand',
    eyebrow: 'THE FUTURE FEELS HUMAN',
    title: '更大胆地，<br><em>表达温度。</em>',
    description: '放大排版与情绪，让品牌故事更有力量。',
    button: '了解故事',
    caption: 'BRAND MODE',
    number: '02 / 04',
    explainer: '适合品牌官网与落地页。允许受控的暖色渐变和更鲜明的视觉张力。'
  },
  data: {
    address: 'anthropic / analytics',
    eyebrow: 'INSIGHTS AT A GLANCE',
    title: '让每个数据，<br><em>一目了然。</em>',
    description: '缩短视线移动距离，强化关键指标的对比。',
    button: '查看报告',
    caption: 'DATA MODE',
    number: '03 / 04',
    explainer: '适合看板与报表。压缩间距、提高对比度，使高密度信息依然易于扫描。'
  },
  tool: {
    address: 'anthropic / workspace',
    eyebrow: 'BUILT FOR YOUR WORKFLOW',
    title: '让工作，<br><em>顺畅发生。</em>',
    description: '把常用操作放在手边，让效率成为默认体验。',
    button: '打开工作台',
    caption: 'TOOL MODE',
    number: '04 / 04',
    explainer: '适合后台与专业工具。优先保证功能完整、信息清楚与快速操作。'
  }
};

const tabs = [...document.querySelectorAll('.mode-tab')];
const preview = document.querySelector('#mode-preview');

function selectMode(tab, focus = false) {
  const data = modeContent[tab.dataset.mode];
  if (!data) return;
  tabs.forEach((item) => {
    const active = item === tab;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });
  preview.dataset.mode = tab.dataset.mode;
  preview.setAttribute('aria-labelledby', tab.id);
  document.querySelector('#preview-address').textContent = data.address;
  document.querySelector('#preview-eyebrow').textContent = data.eyebrow;
  document.querySelector('#preview-title').innerHTML = data.title;
  document.querySelector('#preview-description').textContent = data.description;
  document.querySelector('#preview-button').innerHTML = `${data.button} <b>↗</b>`;
  document.querySelector('#preview-caption').textContent = data.caption;
  document.querySelector('.preview-bottom span:last-child').textContent = data.number;
  document.querySelector('#preview-explainer').textContent = data.explainer;
  if (focus) tab.focus();
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectMode(tab));
  tab.addEventListener('keydown', (event) => {
    let nextIndex;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex !== undefined) {
      event.preventDefault();
      selectMode(tabs[nextIndex], true);
    }
  });
});

const toast = document.querySelector('#toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

async function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const input = document.createElement('textarea');
  input.value = value;
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand('copy');
  input.remove();
  if (!copied) throw new Error('copy failed');
}

document.querySelectorAll('.swatch').forEach((swatch) => {
  swatch.addEventListener('click', async () => {
    try {
      await copyText(swatch.dataset.copy);
      showToast(`已复制 ${swatch.dataset.copy}`);
    } catch {
      showToast(`复制失败，请手动使用 ${swatch.dataset.copy}`);
    }
  });
});

document.querySelectorAll('.demo-action').forEach((button) => {
  button.addEventListener('click', () => showToast(`${button.textContent.trim().replace('↗', '').trim()} · 组件示例`));
});

const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', '打开导航菜单');
  siteNav.classList.remove('is-open');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
  siteNav.classList.toggle('is-open', open);
});
siteNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});
