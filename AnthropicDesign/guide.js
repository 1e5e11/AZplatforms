const colorGroups = [
  { title: '背景', subtitle: '先确定画布与层级', colors: [
    ['--color-bg-base', '#ECE9E0', '页面画布', 'body、整页底色；避免直接使用纯白。', 'background: var(--color-bg-base)'],
    ['--color-bg-raised', '#F5F3EC', '轻浮层', '卡片、侧栏、内容面板。', 'background: var(--color-bg-raised)'],
    ['--color-bg-overlay', '#FDFCF8', '高浮层', '弹窗、Popover、输入区域的浅色表面。', 'background: var(--color-bg-overlay)'],
    ['--color-bg-inverted', '#141413', '反色背景', '深色 Hero、深色 CTA、页脚。', 'background: var(--color-bg-inverted)']
  ]},
  { title: '文字', subtitle: '用层级组织阅读顺序', colors: [
    ['--color-text-primary', '#141413', '主要文字', '标题、正文关键内容、主要数字。', 'color: var(--color-text-primary)'],
    ['--color-text-secondary', '#6B6860', '次要文字', '说明、辅助段落、未选中的导航项。', 'color: var(--color-text-secondary)'],
    ['--color-text-muted', '#B0AEA5', '弱化文字', '占位、图表轴标签、低优先级元信息；勿承载重要正文。', 'color: var(--color-text-muted)'],
    ['--color-text-inverted', '#FAF9F5', '反色文字', '深色区块上的文字；橙色按钮建议改用深墨色文字保证对比。', 'color: var(--color-text-inverted)'],
    ['--color-text-link', '#C96442', '文本链接', '正文中的可点击文字；还需下划线等非颜色提示。', 'color: var(--color-text-link)']
  ]},
  { title: '边框', subtitle: '按信息密度选强度', colors: [
    ['--color-border-subtle', '#E8E6DC', '轻分隔', '默认模式的卡片边、柔和分区。', 'border-color: var(--color-border-subtle)'],
    ['--color-border-default', '#D8D5CC', '标准分隔', '表单、数据密集卡片、列表行。', 'border-color: var(--color-border-default)'],
    ['--color-border-strong', '#9B9890', '强分隔', '高优先级界线与工具界面重点控件。', 'border-color: var(--color-border-strong)']
  ]},
  { title: '强调与图表', subtitle: '主 CTA 与系列色分工明确', colors: [
    ['--color-accent-orange', '#D97757', '主强调', '主 CTA、关键行动、品牌强调。不要用蓝色取代主按钮。', 'background: var(--color-accent-orange)'],
    ['--color-accent-warm', '#C96442', '深暖橙', '悬停态、深一点的链接与小标签。', 'color: var(--color-accent-warm)'],
    ['--color-accent-blue', '#6A9BCC', '灰蓝', '图表第二系列或信息辅助，不用于主 CTA。', 'color: var(--color-accent-blue)'],
    ['--color-accent-green', '#788C5D', '橄榄绿', '图表第三系列、自然感辅助。', 'color: var(--color-accent-green)'],
    ['--color-accent-sand', '#C4B99A', '沙棕', '图表第四系列、低优先级装饰。', 'color: var(--color-accent-sand)']
  ]},
  { title: '状态反馈', subtitle: '颜色只表达明确语义', colors: [
    ['--color-success', '#6B8F47', '成功', '保存成功、完成、正向状态。', 'color: var(--color-success)'],
    ['--color-warning', '#C9943A', '警告', '待确认、风险提醒、不可回退前置提示。', 'color: var(--color-warning)'],
    ['--color-error', '#C0453A', '错误 / 危险', '验证错误、删除、覆盖和紧急状态。', 'color: var(--color-error)'],
    ['--color-info', '#5A89B8', '信息', '中性说明和提示信息。', 'color: var(--color-info)']
  ]}
];

const colorAliases = [
  ['--color-bg-surface', 'var(--color-bg-raised)', '通用表面；与 raised 同值'],
  ['--color-bg-elevated', 'var(--color-bg-overlay)', '更高层的内容表面'],
  ['--color-bg-sidebar', '#F0EDE4', '侧栏专用底色；暗色模式有覆写'],
  ['--color-bg-input', 'var(--color-bg-overlay)', '输入控件背景'],
  ['--color-border', 'var(--color-border-default)', '标准边框别名'],
  ['--color-accent', 'var(--color-accent-orange)', '主要强调色别名'],
  ['--color-accent-dim', 'rgba(217,119,87,.12)', '暖橙浅底；标签 / 轻提示'],
  ['--color-accent-glow', 'rgba(217,119,87,.18)', '暖橙柔光；聚焦 / 悬停'],
  ['--color-success-dim', 'rgba(107,143,71,.12)', '成功态浅底'],
  ['--color-success-glow', 'rgba(107,143,71,.12)', '成功态柔光'],
  ['--color-warning-dim', 'rgba(201,148,58,.12)', '警告态浅底'],
  ['--color-error-dim', 'rgba(192,69,58,.12)', '错误态浅底'],
  ['--color-text-accent', 'var(--color-accent-warm)', '强调文字'],
  ['--color-text-success', 'var(--color-success)', '成功状态文字'],
  ['--color-text-error', 'var(--color-error)', '错误状态文字'],
  ['--color-text-warning', 'var(--color-warning)', '警告状态文字'],
  ['--color-text-disabled', 'var(--color-text-muted)', '禁用态文字'],
  ['--color-numeric', 'var(--color-accent-blue)', '辅助数值着色']
];

const typeScale = [
  ['--text-xs', '12px', '英文小标签、密集信息；中文正文勿用'],
  ['--text-sm', '14px', '导航、按钮、英文辅助信息'],
  ['--text-base', '16px', '英文正文、标准控件'],
  ['--text-md', '18px', '引导语、较大正文'],
  ['--text-lg', '20px', '卡片标题'],
  ['--text-xl', '24px', '小节标题'],
  ['--text-2xl', '32px', '章节标题'],
  ['--text-3xl', '44px', '页面标题'],
  ['--text-4xl', '56px', '较大品牌标题'],
  ['--text-5xl', '72px', '大型 Hero 展示标题'],
  ['--text-cn-sm', '15px', '中文辅助说明下限'],
  ['--text-cn-base', '16px', '中文正文基准'],
  ['--text-cn-md', '18px', '中文引导语和重点正文']
];

const fontStacks = [
  ['--font-display', 'Lora → DM Serif Display → Georgia → serif', '拉丁大标题、品牌陈述；中文标题改用 --font-display-cn'],
  ['--font-heading', 'Poppins → DM Sans → Arial → sans-serif', '拉丁 UI、导航、按钮、标签'],
  ['--font-body', 'Lora → DM Serif Text → Georgia → serif', '拉丁正文与长文'],
  ['--font-mono', 'JetBrains Mono → Fira Code → Courier New → monospace', '代码、token、技术编号和辅助数据'],
  ['--font-display-cn', 'Lora → DM Serif Display → LXGW WenKai → Songti SC → STSong → SimSun → serif', '中英混排大标题；中文优先霞鹜文楷，缺字回退系统宋体'],
  ['--font-heading-cn', 'Poppins → DM Sans → Noto Sans SC → Source Han Sans SC → PingFang SC → Microsoft YaHei UI → Microsoft YaHei → sans-serif', '中英混排导航、按钮、表单与 UI 标签'],
  ['--font-body-cn', 'Lora → DM Serif Text → LXGW WenKai → Songti SC → STSong → SimSun → serif', '中英混排正文与长文'],
  ['--font-ui', 'var(--font-heading)', '旧代码兼容别名；新页面优先直接用 heading token']
];

const rhythm = [
  ['--leading-tight', '1.15', '拉丁大标题'], ['--leading-snug', '1.35', '拉丁短标题'],
  ['--leading-normal', '1.55', '拉丁常规正文'], ['--leading-loose', '1.75', '拉丁长文'],
  ['--leading-cn-tight', '1.4', '中文大标题'], ['--leading-cn-snug', '1.6', '中文小标题'],
  ['--leading-cn-normal', '1.75', '中文正文'], ['--leading-cn-loose', '1.9', '中文长文'],
  ['--weight-light', '300', '大号拉丁标题或低对比展示'], ['--weight-regular', '400', '中文标题和常规正文'],
  ['--weight-medium', '500', 'UI 标题、标签和按钮'], ['--weight-semibold', '600', '需要更明确强调的 UI'],
  ['--weight-bold', '700', '少量强强调，避免中文大段使用']
];

const spacing = [
  ['--space-1', '4px'], ['--space-2', '8px'], ['--space-3', '12px'], ['--space-4', '16px'],
  ['--space-5', '20px'], ['--space-6', '24px'], ['--space-8', '32px'], ['--space-10', '40px'],
  ['--space-12', '48px'], ['--space-16', '64px'], ['--space-20', '80px'], ['--space-24', '96px'],
  ['--space-32', '128px'], ['--space-40', '160px']
];

const shapes = [
  ['--radius-sm', '4px', '按钮、输入框、小标签'], ['--radius-md', '8px', '提示条、小面板'],
  ['--radius-lg', '16px', '常规卡片与图片'], ['--radius-xl', '24px', '大型卡片与弹窗'],
  ['--radius-full', '9999px', '胶囊按钮、圆形头像'],
  ['--max-width-prose', '680px', '长文阅读行宽'], ['--max-width-text', '860px', '宽内容段落'],
  ['--max-width-layout', '1200px', '常规页面主容器'], ['--max-width-full', '1440px', '宽屏页面容器']
];

const motion = [
  ['--shadow-card', '0 2px 12px rgba(20,20,19,.07)', '普通卡片轻阴影'],
  ['--shadow-elevated', '0 8px 32px rgba(20,20,19,.08)', '弹层或高层级卡片'],
  ['--shadow-btn', '0 4px 12px rgba(217,119,87,.3)', '主按钮悬停'],
  ['--duration-fast', '150ms', '轻微反馈'], ['--duration-normal', '250ms', '常规状态变化'],
  ['--duration-slow', '400ms', '内容进入'],
  ['--ease-default', 'cubic-bezier(.16,1,.3,1)', '主要过渡：快进慢出'],
  ['--ease-bounce', 'cubic-bezier(.34,1.56,.64,1)', '少量弹性反馈'],
  ['--ease-gentle', 'cubic-bezier(.4,0,.2,1)', '温和的状态切换']
];

const componentGroups = [
  { name: '基础与内容', source: 'references/components/basics.md', items: [
    ['Hero', '页面首屏', '承载一个核心主张、简短说明和主 CTA。'],
    ['Feature Grid', '特性介绍', '用少量卡片解释能力；优先拆分过长内容。'],
    ['Stats', '数据亮点', '展示有上下文的关键数字，数字对齐。'],
    ['Blockquote', '引言与观点', '在叙事内容中强调一句核心话。'],
    ['Pricing', '套餐比较', '突出推荐方案，其余方案保持可比。'],
    ['CTA Dark', '段落收束', '用深色区块承载最终行动。'],
    ['Footer', '全站页脚', '目录列有此项；当前文件正文没有独立实现段落，需按站点信息结构补足。'],
    ['Code Block', '代码示例', '标出语言并提供复制操作。'],
    ['Toast', '短时反馈', '保存或操作成功后短暂提示，不打断任务。'],
    ['Skeleton', '加载占位', '内容未到达时保持布局稳定。']
  ]},
  { name: '导航与结构', source: 'references/components/navigation.md', items: [
    ['Sidebar', '多层导航', '用于工作台或文档；移动端默认收起。'],
    ['Tabs', '同级内容切换', '保持面板位置稳定，支持键盘操作。'],
    ['Breadcrumb', '层级路径', '帮助用户返回上级位置。'],
    ['Pagination', '长列表翻页', '保留当前页与总范围信息。'],
    ['Dropdown', '少量选项', '放置相关操作，避免藏起主要 CTA。']
  ]},
  { name: '表单与交互', source: 'references/components/forms.md', items: [
    ['Form', '信息输入', '字段有标签、辅助说明和错误反馈。'],
    ['Toggle / Switch', '立即生效的开关', '表达开与关，不用于多选。'],
    ['Tooltip', '简短解释', '补充说明，不能承载必须阅读的信息。'],
    ['Modal', '集中决策', '处理少量高优先级任务，维护焦点陷阱。'],
    ['Accordion', '渐进披露', '折叠次要细节，保留清晰的标题。']
  ]},
  { name: '展示与流程', source: 'references/components/display.md', items: [
    ['Table', '结构化数据', '对齐列头、数字和操作；窄屏可横向滚动。'],
    ['Timeline', '时间顺序', '呈现进展、历史与事件顺序。'],
    ['Empty State', '无内容状态', '说明原因并给出下一步。'],
    ['Banner / Alert', '持续提示', '在页面中提醒状态与风险，危险态清晰醒目。'],
    ['Step Indicator', '多步流程', '标示当前、已完成与后续步骤。']
  ]},
  { name: '浮层与快捷操作', source: 'references/components/overlay.md', items: [
    ['Avatar', '人物标识', '头像及头像组，尺寸与回退状态一致。'],
    ['Progress Bar / Ring', '任务进度', '同时给出数值或文字，避免仅靠颜色。'],
    ['Search Bar', '内容检索', '提供查询入口和联想结果。'],
    ['Command Palette', '全局快捷入口', '键盘快速跳转或执行命令，需处理焦点。'],
    ['Drawer', '侧向详情', '不离开主页面查看或编辑次级内容。'],
    ['Chip / Tag', '标签筛选', '表达已选条件，可删除时提供明确按钮。'],
    ['Popover', '就近补充', '承载锚定元素的轻量详情或操作。'],
    ['Carousel', '可切换内容', '用于有限内容组，提供可见控制和状态。'],
    ['Context Menu', '上下文操作', '在特定对象上展示相关操作。'],
    ['Floating Action Button', '高频快捷动作', '在移动或工具场景中固定一个关键动作。']
  ]},
  { name: '反馈与输入', source: 'references/components/feedback.md', items: [
    ['Number Stepper', '数值微调', '按固定步长增加或减少数值。'],
    ['Radio Group', '单项选择', '在互斥选项中清楚展示当前选择。'],
    ['File Dropzone', '文件上传', '提供拖放与点击选择两条路径。'],
    ['Segmented Control', '少量视图切换', '适用于 2–4 个并列选项。'],
    ['Status Indicator', '运行状态', '文字、形状与颜色共同表达状态。'],
    ['Rating', '评分输入', '让用户选取并可修改评分。'],
    ['Notification Dropdown', '通知中心', '展示新消息、已读状态与跳转。']
  ]},
  { name: '对话', source: 'references/components/chat.md', items: [
    ['Chat UI', 'AI 对话', '组合侧栏、消息流、输入区和生成状态。']
  ]}
];

const systems = [
  ['Z-index 分层', '导航、抽屉、弹窗、Toast 共存时', '用 --z-* 分层；这些建议值在 systems.md，需先补进项目 token。'],
  ['响应式断点', '手机、平板与桌面适配', '按内容宽度设断点，移动端先设计；触摸目标至少 44px。'],
  ['暗色模式', '系统或手动切换主题', '统一替换背景、文字、边框 token，避免首次闪白。'],
  ['动画性能', '进入、悬停与状态变化', '主要动画用 transform、opacity；谨慎使用 will-change。'],
  ['焦点陷阱', 'Modal、Drawer、命令面板', '开启时限制 Tab 在浮层内，关闭后把焦点还给触发元素。'],
  ['SVG 图标系统', '按钮、状态和导航图标', '优先 inline SVG + currentColor，统一尺寸与笔画。'],
  ['字体加载', '首屏字体与中英混排', '本地 WOFF2 使用 font-display: swap；中文字体按场景加载或子集化。'],
  ['滚动行为', '弹窗、侧栏与长列表', '锁定背景滚动而不跳动，内部滚动容器避免滚动穿透。'],
  ['表单验证', '输入与提交', '离开字段时检查，提交时全量检查并聚焦首错。'],
  ['图片优化', '内容图与首屏主图', '响应式 srcset；首屏关键图不懒加载，其他图片按需加载。'],
  ['上下文感知 token', '密集数据、复杂流程、紧急报警', '随模式调节边框与间距；紧急状态优先问题、严重度和下一步。']
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function tokenButton(token) { return `<button type="button" class="token-button" data-copy="var(${escapeHtml(token)})" title="复制 var(${escapeHtml(token)})">${escapeHtml(token)}</button>`; }
function table(headers, rows) {
  return `<table class="guide-table"><thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map((cell, index) => index === 0 ? `<th>${cell}</th>` : `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

document.querySelector('#color-groups').innerHTML = colorGroups.map(group => `
  <div class="catalog-group"><div class="subhead-row"><h3>${group.title}</h3><span>${group.subtitle}</span></div><div class="table-scroll">
  ${table(['颜色 / token', '色值', '用途', '在哪里用', '怎么写'], group.colors.map(c => [
    `<span class="color-cell"><i class="color-dot" style="background:${c[1]}"></i>${tokenButton(c[0])}</span>`,
    `<code>${c[1]}</code>`, escapeHtml(c[2]), escapeHtml(c[3]), `<code>${escapeHtml(c[4])}</code>`
  ]))}</div></div>`).join('');

document.querySelector('#color-aliases').innerHTML = table(['别名 token', '当前值', '具体用途'], colorAliases.map(item => [tokenButton(item[0]), `<code>${escapeHtml(item[1])}</code>`, escapeHtml(item[2])]));
document.querySelector('#font-stacks').innerHTML = table(['字体 token', '字体栈 / 回退顺序', '在哪里用'], fontStacks.map(item => [tokenButton(item[0]), `<code>${escapeHtml(item[1])}</code>`, escapeHtml(item[2])]));
document.querySelector('#type-scale').innerHTML = table(['字号 token', '计算值', '建议用途'], typeScale.map(item => [tokenButton(item[0]), `<code>${item[1]}</code>`, escapeHtml(item[2])]));
document.querySelector('#type-rhythm').innerHTML = table(['行高 / 字重 token', '值', '建议用途'], rhythm.map(item => [tokenButton(item[0]), `<code>${item[1]}</code>`, escapeHtml(item[2])]));
document.querySelector('#space-scale').innerHTML = spacing.map(([token, size]) => `<div class="space-item"><div class="space-measure"><i style="width:min(${size},100%)"></i></div>${tokenButton(token)}<span>${size}</span></div>`).join('');
document.querySelector('#shape-scale').innerHTML = table(['token', '值', '在哪里用'], shapes.map(item => [tokenButton(item[0]), `<code>${item[1]}</code>`, escapeHtml(item[2])]));
document.querySelector('#motion-scale').innerHTML = table(['token', '值', '在哪里用'], motion.map(item => [tokenButton(item[0]), `<code>${escapeHtml(item[1])}</code>`, escapeHtml(item[2])]));

const componentCatalog = document.querySelector('#component-catalog');
const componentSearch = document.querySelector('#component-search');
function renderComponents(query = '') {
  const normalized = query.trim().toLowerCase();
  let count = 0;
  componentCatalog.innerHTML = componentGroups.map(group => {
    const items = group.items.filter(item => !normalized || `${group.name} ${item.join(' ')}`.toLowerCase().includes(normalized));
    count += items.length;
    if (!items.length) return '';
    return `<section class="component-family"><div class="component-family-head"><h3>${group.name}<span>${items.length}</span></h3><a href="${group.source}">查看原始实现 ↗</a></div><div class="component-list">${items.map(item => `<article><strong>${escapeHtml(item[0])}</strong><span>${escapeHtml(item[1])}</span><p>${escapeHtml(item[2])}</p></article>`).join('')}</div></section>`;
  }).join('') || '<p class="empty-search">没有匹配的组件。试试“表格”“输入”或“反馈”。</p>';
  document.querySelector('#component-count').textContent = `${count} / 43`;
}
renderComponents();
componentSearch.addEventListener('input', () => renderComponents(componentSearch.value));

document.querySelector('#system-list').innerHTML = systems.map((item, index) => `<article><span>${String(index + 1).padStart(2, '0')}</span><div><h3>${item[0]}</h3><p><strong>适用：</strong>${item[1]}</p><p><strong>做法：</strong>${item[2]}</p></div><a href="references/systems.md" aria-label="查看${item[0]}原文">↗</a></article>`).join('');

const toast = document.querySelector('#guide-toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}
async function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(value);
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
document.addEventListener('click', async (event) => {
  const token = event.target.closest('[data-copy]');
  const code = event.target.closest('[data-copy-target]');
  if (!token && !code) return;
  const value = token ? token.dataset.copy : document.getElementById(code.dataset.copyTarget)?.innerText;
  if (!value) return;
  try { await copyText(value); showToast(`已复制 ${token ? value : '代码'}`); }
  catch { showToast('复制失败，请手动选择内容'); }
});
