(() => {
  'use strict';

  const BUILD = '2026-11-03-pollinations-7';
  const POLLINATIONS_ENDPOINT = 'https://text.pollinations.ai/openai';
  const KEYLESSAI_ENDPOINT = 'https://keylessai.thryx.workers.dev/v1/chat/completions';
  const PROVIDER_PRESETS = {
    pollinations: { name:'Pollinations · 免费', endpoint:POLLINATIONS_ENDPOINT, model:'openai-fast' },
    keylessai: { name:'KeylessAI · 免费', endpoint:KEYLESSAI_ENDPOINT, model:'gpt-4o' },
    openai: { name:'OpenAI', endpoint:'https://api.openai.com/v1/chat/completions', model:'gpt-5.2' },
    deepseek: { name:'DeepSeek', endpoint:'https://api.deepseek.com/chat/completions', model:'deepseek-chat' },
    glm: { name:'智谱 GLM', endpoint:'https://open.bigmodel.cn/api/paas/v4/chat/completions', model:'glm-4.5-flash' },
    kimi: { name:'Moonshot Kimi', endpoint:'https://api.moonshot.cn/v1/chat/completions', model:'kimi-k3' },
    siliconflow: { name:'硅基流动', endpoint:'https://api.siliconflow.cn/v1/chat/completions', model:'deepseek-ai/DeepSeek-V4-Flash' },
    azai: { name:'AZAI（啊这一号）', endpoint:'https://ai.realgeneral.eu.org/v1/chat/completions', model:'AZ I' },
    custom: { name:'Custom API', endpoint:'', model:'custom-model' }
  };
  const LOCAL_PROXY_DEFAULT = 'http://127.0.0.1:8787/api/proxy';
  const SAME_ORIGIN_PROXY_DEFAULT = '/api/proxy';
  const IS_WEB_PAGE = location.protocol === 'http:' || location.protocol === 'https:';
  const IS_LOOPBACK_PAGE = IS_WEB_PAGE && ['127.0.0.1', 'localhost', '::1'].includes(location.hostname);
  const DEFAULT_PROXY_URL = location.protocol === 'file:' || IS_LOOPBACK_PAGE
    ? LOCAL_PROXY_DEFAULT
    : SAME_ORIGIN_PROXY_DEFAULT;

  const DEFAULT_SETTINGS = {
    provider: 'pollinations',
    apiBase: POLLINATIONS_ENDPOINT,
    apiKey: '',
    rememberKey: false,
    model: 'openai-fast',
    customModel: '',
    temperature: 0.7,
    stream: true,
    thinking: false,
    sidebarCollapsed: false,
    sidebarWidth: 256,
    systemPrompt: '',
    theme: 'system',
    language: 'zh',
    transport: 'direct',
    proxyUrl: DEFAULT_PROXY_URL,
    providerModels: {}
  };

  const I18N = {
    zh: {
      provider: '提供商', model: '模型', endpoint: '接口', temperature: '温度',
      stream: '流式', storage: '存储', newChat: '新聊天', newChatTop: '新建聊天', history: '历史',
      apiKeyButton: 'API / Key', refreshModels: '刷新模型', dark: '深色', light: '浅色', more: '更多',
      rename: '重命名', export: '导出', send: '发送', stop: '停止', clearInput: '清空输入',
      copyMessage: '复制消息', copied: '已复制', copyFailed: '复制失败',
      attach: '附件', composerHint: 'Enter 发送 · Shift+Enter 换行 · 可粘贴 / 拖入文件',
      attachmentEmpty: '可粘贴、选择或拖入文件 / 图片',
      dropHere: '把文件或图片拖到这里', import: '导入', session: '会话',
      messages: '消息', tokens: 'Tokens', updated: '更新', settings: '设置',
      language: '语言', apiEndpoint: 'API 接口', connection: '连接方式', proxyUrl: '代理地址',
      apiKey: 'API Key', rememberKey: '记住 Key', customModel: '自定义模型',
      thinking: '思考', thinkingContent: '思考过程', thinkingUnavailable: '当前接口不支持思考参数，已按普通模式继续', streaming: '流式输出', systemPrompt: '系统提示词', appearance: '外观',
      testApi: '测试 API', save: '保存', cancel: '取消', discardSettings: '取消', renameChat: '重命名聊天',
      searchChats: '搜索聊天', messagePlaceholder: '输入消息…', optionalSystem: '可选系统提示词',
      apiConfigured: 'API 已配置', apiNotConfigured: 'API 未配置',
      renderNote: 'Markdown 由项目内 md-renderer 安全渲染。',
      endpointNote: '填写完整的 Chat Completions 地址，而不是只填 /v1 基础地址。',
      proxyNote: '默认浏览器直连。若接口不允许跨域，可在此配置代理地址。',
      keyNote: '若选择记住 Key，会把 Key 保存在本浏览器 IndexedDB；同源脚本理论上可能读取它。',
      modelSwitchWarn: '这个对话已经有历史消息。中途切换模型可能降低上下文一致性和性能。\n\n仍要切换模型吗？',
      modelSwitchToast: '已切换模型 · 旧上下文可能影响表现',
      deleteConfirm: '删除“{title}”？只会删除本浏览器中的本地副本。',
      deleteDone: '已删除', settingsSaved: '设置已保存',
      noMatching: '没有匹配的聊天', untitled: '未命名', newChatTitle: '新聊天',
      ready: '就绪 · 对话保存在本浏览器 IndexedDB',
      calling: '正在调用 {model}…', stopped: '已停止生成 · 部分回复已保存在本地',
      apiFailed: 'API 请求失败', apiTestFailed: 'API 测试失败', apiTestOk: 'API 测试成功',
      missingEndpoint: '请先设置 API 接口', missingModel: '请先选择模型',
      emptyResponse: '[空回复]', stoppedText: '[生成已停止]',
      failedFetch: 'API 连接失败。请检查网络和接口地址，或改用支持跨域的供应商。',
      directFailedProxyOk: '浏览器直连不可用，已自动通过代理连接',
      proxyUnavailable: '代理不可用。请检查设置中的代理地址，或把连接方式改为“浏览器直连”。',
      testing: '正在测试 API…', refreshingModels: '刷新中…', refreshStart: '正在刷新 {provider} 模型…',
      refreshDone: '{provider} 模型已刷新（{count} 个）',
      refreshFallback: '模型刷新失败 · 保留已有模型选项',
      invalidModels: '接口未返回有效模型列表',
      invalidModelsEndpoint: '请填写有效的 HTTP(S) Chat Completions 接口地址',
      imported: '已导入 {count} 个聊天', importFailed: '导入失败',
      fileTooLarge: '文件过大：{name}（单个文件上限 8 MB）',
      tooManyFiles: '一次最多附加 10 个文件',
      attachedCount: '已附加 {count} 个文件',
      binaryLocalOnly: '二进制文件仅保存在本地；通用 Chat Completions 不保证能直接读取它。',
      imageModelNote: '图片会以 image_url 发送；所选模型必须支持视觉输入。',
      usageActual: 'API', usageEstimated: '估算',
      input: '输入', output: '输出', total: '总计',
      draft: '草稿估算', localHistory: '本地记录',
      providerCustom: '自定义 API',
      connectionAuto: 'Auto（直连优先，失败后走代理）', connectionDirect: '浏览器直连',
      connectionProxy: '代理 / 同源 Relay', rememberNo: '否', rememberYes: '是，保存在此浏览器',
      on: '开', off: '关', themeSystem: '跟随系统', themeLight: '浅色', themeDark: '深色',
      basicSettings: '常用设置', connectionSettings: '连接与密钥', generationSettings: '生成设置', instructionsSettings: '提示词',
      resizeSidebar: '调整侧栏宽度', closeHistory: '关闭历史', showSidebar: '展开侧栏', hideSidebar: '收起侧栏', quickAdvanced: '会话与参数', exportChat: '导出 JSON', exportMarkdown: '导出 Markdown', exportAll: '导出全部',
      systemPromptNote: '此提示词会在每次对话中优先发送；保存后生效。', promptCount: '{count} / 10000', clearSystemPrompt: '清空提示词',
      keyOptional: 'AZAI 默认无需 API Key；仅在服务端启用认证时填写。', azaiSettingNote: '模型 AZ I 仅支持文本，温度 0–5，服务端固定关闭思考。该服务目前不返回 CORS 头，浏览器直连会被拦截；服务端为响应添加 Access-Control-Allow-Origin 即可。',
      azaiCorsHint: 'AZAI 服务未返回 CORS 头，浏览器无法直连；服务端只需为响应添加 Access-Control-Allow-Origin: *（请求已用简单请求，无需 OPTIONS）。',
      apiKeyOptionalPlaceholder: '可选；默认无需填写', azaiDocsLink: 'AZAI API 文档',
      pollinationsKeyNote: 'Pollinations 免费接口无需 API Key，打开页面即可对话；匿名额度有频率限制。',
      keylessaiKeyNote: 'KeylessAI 免费接口无需 API Key，任意非空 Key 均可。',
      pollinationsSettingNote: 'Pollinations 免费、无需 Key。仅 localhost 域名会被 Turnstile 拦截；用 file://、127.0.0.1 或正式域名打开即可直连。',
      keylessaiSettingNote: 'KeylessAI 免费、无需 Key。workers.dev 在部分地区被 SNI 阻断；如直连失败，可为 Worker 绑定自定义域名。',
      azaiImagesUnsupported: 'AZAI 仅支持文本；已在请求中省略图片附件。'
    },
    en: {
      provider: 'Provider', model: 'Model', endpoint: 'Endpoint', temperature: 'Temperature',
      stream: 'Stream', storage: 'Storage', newChat: 'New', newChatTop: 'New chat', history: 'History',
      apiKeyButton: 'API / Key', refreshModels: 'Refresh models', dark: 'Dark', light: 'Light', more: 'More',
      rename: 'Rename', export: 'Export', send: 'Send', stop: 'Stop', clearInput: 'Clear input',
      copyMessage: 'Copy message', copied: 'Copied', copyFailed: 'Copy failed',
      attach: 'Attach', composerHint: 'Enter send · Shift+Enter newline · paste / drag files',
      attachmentEmpty: 'Paste, choose, or drag files / images',
      dropHere: 'Drop files or images here', import: 'Import', session: 'Session',
      messages: 'Messages', tokens: 'Tokens', updated: 'Updated', settings: 'Settings',
      language: 'Language', apiEndpoint: 'API endpoint', connection: 'Connection', proxyUrl: 'Proxy URL',
      apiKey: 'API key', rememberKey: 'Remember key', customModel: 'Custom model',
      thinking: 'Thinking', thinkingContent: 'Thinking', thinkingUnavailable: 'This endpoint does not support the thinking parameter; continued normally', streaming: 'Streaming', systemPrompt: 'System prompt', appearance: 'Appearance',
      testApi: 'Test API', save: 'Save', cancel: 'Cancel', discardSettings: 'Cancel', renameChat: 'Rename chat',
      searchChats: 'search chats', messagePlaceholder: 'Message…', optionalSystem: 'optional system prompt',
      apiConfigured: 'API configured', apiNotConfigured: 'API not configured',
      renderNote: 'Markdown is safely rendered by the local md-renderer.',
      endpointNote: 'Use the full Chat Completions endpoint, not only the /v1 base URL.',
      proxyNote: 'Browser-direct by default. Configure a proxy URL here if an endpoint does not allow CORS.',
      keyNote: 'A remembered key is stored locally in IndexedDB. Any script running on the same origin can potentially access it.',
      modelSwitchWarn: 'This conversation already has history. Switching models mid-conversation can reduce context consistency and performance.\n\nSwitch anyway?',
      modelSwitchToast: 'Model switched · earlier context may affect performance',
      deleteConfirm: 'Delete “{title}”? This only removes the local browser copy.',
      deleteDone: 'Deleted', settingsSaved: 'Settings saved',
      noMatching: 'No matching chats', untitled: 'Untitled', newChatTitle: 'New chat',
      ready: 'Ready · conversations stay in IndexedDB on this browser',
      calling: 'Calling {model}…', stopped: 'Generation stopped · partial response saved locally',
      apiFailed: 'API request failed', apiTestFailed: 'API test failed', apiTestOk: 'API test succeeded',
      missingEndpoint: 'Set API endpoint first', missingModel: 'Select a model first',
      emptyResponse: '[empty response]', stoppedText: '[generation stopped]',
      failedFetch: 'API connection failed. Check the network and endpoint, or switch to a provider that allows CORS.',
      directFailedProxyOk: 'Browser-direct request was unavailable; connected through the proxy',
      proxyUnavailable: 'Proxy unavailable. Check the proxy URL, or set Connection to Browser direct.',
      testing: 'Testing API…', refreshingModels: 'Refreshing…', refreshStart: 'Refreshing {provider} models…',
      refreshDone: '{provider} models refreshed ({count})',
      refreshFallback: 'Model refresh failed · keeping existing model options',
      invalidModels: 'The endpoint did not return a valid model list',
      invalidModelsEndpoint: 'Enter a valid HTTP(S) Chat Completions endpoint',
      imported: 'Imported {count} chat(s)', importFailed: 'Import failed',
      fileTooLarge: 'File too large: {name} (8 MB limit per file)',
      tooManyFiles: 'Up to 10 attachments per message',
      attachedCount: '{count} file(s) attached',
      binaryLocalOnly: 'Binary files are stored locally; generic Chat Completions APIs are not guaranteed to read them directly.',
      imageModelNote: 'Images are sent as image_url content; the selected model must support vision input.',
      usageActual: 'API', usageEstimated: 'estimated',
      input: 'input', output: 'output', total: 'total',
      draft: 'draft est.', localHistory: 'local history',
      providerCustom: 'Custom API',
      connectionAuto: 'Auto (direct first, then relay)', connectionDirect: 'Browser direct',
      connectionProxy: 'Proxy / same-origin relay', rememberNo: 'No', rememberYes: 'Yes, in this browser',
      on: 'on', off: 'off', themeSystem: 'System', themeLight: 'Light', themeDark: 'Dark',
      basicSettings: 'Basic', connectionSettings: 'Connection & key', generationSettings: 'Generation', instructionsSettings: 'Instructions',
      resizeSidebar: 'Resize sidebar', closeHistory: 'Close history', showSidebar: 'Show sidebar', hideSidebar: 'Hide sidebar', quickAdvanced: 'Chat & parameters', exportChat: 'Export JSON', exportMarkdown: 'Export Markdown', exportAll: 'Export all',
      systemPromptNote: 'This instruction is sent before each conversation and takes effect when saved.', promptCount: '{count} / 10000', clearSystemPrompt: 'Clear prompt',
      keyOptional: 'AZAI does not require a key by default. Enter one only if server authentication is enabled.', azaiSettingNote: 'AZ I accepts text only, supports temperature 0–5, and keeps reasoning disabled. The service currently sends no CORS headers, so browser-direct calls are blocked; adding Access-Control-Allow-Origin to its responses is enough.',
      azaiCorsHint: 'AZAI sends no CORS headers, so the browser cannot call it directly. Add Access-Control-Allow-Origin: * to its responses; requests already use a simple request, so no OPTIONS handler is needed.',
      apiKeyOptionalPlaceholder: 'Optional; no key by default', azaiDocsLink: 'AZAI API docs',
      pollinationsKeyNote: 'Pollinations is free and needs no API key — the page works as soon as it opens. Anonymous requests are rate limited.',
      keylessaiKeyNote: 'KeylessAI is free and needs no API key; any non-empty key is accepted.',
      pollinationsSettingNote: 'Pollinations is free and keyless. Only the localhost hostname is blocked by Turnstile; open the page from file://, 127.0.0.1, or a real domain to connect directly.',
      keylessaiSettingNote: 'KeylessAI is free and keyless. workers.dev is SNI-blocked in some regions; bind a custom domain to the Worker if direct calls fail.',
      azaiImagesUnsupported: 'AZAI accepts text only; image attachments were omitted from this request.'
    }
  };

  const DB_NAME = 'az-llm-chat';
  const DB_VERSION = 1;
  const STORE_CONVERSATIONS = 'conversations';
  const STORE_SETTINGS = 'settings';
  const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
  const MAX_TEXT_BYTES = 2 * 1024 * 1024;
  const MAX_ATTACHMENTS = 10;

  let db = null;
  let settings = { ...DEFAULT_SETTINGS };
  let conversations = [];
  let activeConversation = null;
  let abortController = null;
  let isGenerating = false;
  let renderTimer = null;
  let sessionApiKey = '';
  let pendingAttachments = [];
  let dragDepth = 0;
  const modelRefreshRequests = { active: null, modal: null };

  const $ = id => document.getElementById(id);
  const app = $('app');
  const messagesEl = $('messages');
  const historyListEl = $('historyList');
  const promptInput = $('promptInput');
  const sendBtn = $('sendBtn');
  const stopBtn = $('stopBtn');

  let mdRenderer = null;
  try {
    if (window.MoyeMarkdownEngine) mdRenderer = new window.MoyeMarkdownEngine({ baseURL: location.href });
    document.documentElement.dataset.markdownRenderer = mdRenderer ? 'moye' : 'plain-text';
  } catch (error) {
    document.documentElement.dataset.markdownRenderer = 'plain-text';
    console.warn('md-renderer unavailable; falling back to plain text', error);
  }

  function t(key, vars = {}) {
    let value = (I18N[settings.language] || I18N.en)[key] ?? I18N.en[key] ?? key;
    for (const [k, v] of Object.entries(vars)) value = value.replaceAll(`{${k}}`, String(v));
    return value;
  }

  function setText(id, key) {
    const el = $(id);
    if (el) el.textContent = t(key);
  }

  function setOptionText(selectId, value, text) {
    const select = $(selectId);
    const option = select ? [...select.options].find(o => o.value === value) : null;
    if (option) option.textContent = text;
  }

  function applyLanguage() {
    document.documentElement.lang = settings.language === 'zh' ? 'zh-CN' : 'en';
    $('languageQuick').value = settings.language;
    $('languageSetting').value = settings.language;

    setText('providerQuickLabel', 'provider');
    setText('modelQuickLabel', 'model');
    setText('endpointQuickLabel', 'endpoint');
    setText('temperatureQuickLabel', 'temperature');
    setText('streamQuickLabel', 'stream');
    setText('storageQuickLabel', 'storage');
    setText('newChatBtn', 'newChat');
    setText('newChatTopLabel', 'newChatTop');
    $('newChatTopBtn').setAttribute('aria-label', t('newChatTop'));
    setText('settingsBtn', 'settings');
    setText('menuNewChatBtn', 'newChat');
    setText('quickAdvancedTitle', 'quickAdvanced');
    setText('moreBtn', 'more');
    updateModelRefreshButton(false);
    updateModelRefreshButton(true);
    setText('renameBtn', 'rename');
    setText('exportOneBtn', 'exportChat');
    setText('exportMarkdownBtn', 'exportMarkdown');
    setText('exportAllBtn', 'exportAll');
    setText('sendBtn', 'send');
    setText('stopBtn', 'stop');
    setText('clearDraftBtn', 'clearInput');
    setText('attachBtn', 'attach');
    setText('thinkingBtn', 'thinking');
    setText('composerHint', 'composerHint');
    setText('historyPanelTitle', 'history');
    $('sidebarResizeHandle').setAttribute('aria-label', t('resizeSidebar'));
    setText('importBtn', 'import');
    setText('sessionPanelTitle', 'session');
    setText('infoProviderLabel', 'provider');
    setText('infoModelLabel', 'model');
    setText('infoMessagesLabel', 'messages');
    setText('infoTokensLabel', 'tokens');
    setText('infoUpdatedLabel', 'updated');
    setText('settingsTitle', 'settings');
    setText('languageSettingLabel', 'language');
    setText('providerSettingLabel', 'provider');
    setText('apiBaseSettingLabel', 'apiEndpoint');
    setText('transportSettingLabel', 'connection');
    setText('proxyUrlSettingLabel', 'proxyUrl');
    setText('apiKeySettingLabel', 'apiKey');
    setText('azaiDocsLink', 'azaiDocsLink');
    setText('rememberKeySettingLabel', 'rememberKey');
    setText('modelSettingLabel', 'model');
    setText('customModelSettingLabel', 'customModel');
    setText('temperatureSettingLabel', 'temperature');
    setText('streamSettingLabel', 'streaming');
    setText('systemPromptSettingLabel', 'systemPrompt');
    setText('clearSystemPromptBtn', 'clearSystemPrompt');
    setText('themeSettingLabel', 'appearance');
    setText('testApiBtn', 'testApi');
    setText('saveSettingsBtn', 'save');
    setText('renameBoxTitle', 'renameChat');
    setText('renameCancel', 'cancel');
    setText('renameSave', 'save');
    setText('renderingNote', 'renderNote');
    setText('endpointSettingNote', 'endpointNote');
    setText('proxySettingNote', 'proxyNote');
    setText('keySettingNote', 'keyNote');
    setText('basicSettingsSummary', 'basicSettings');
    setText('connectionSettingsSummary', 'connectionSettings');
    setText('generationSettingsSummary', 'generationSettings');
    setText('instructionsSettingsSummary', 'instructionsSettings');
    setText('settingsCancelBtn', 'discardSettings');

    promptInput.placeholder = t('messagePlaceholder');
    $('historySearch').placeholder = t('searchChats');
    $('systemPromptSetting').placeholder = t('optionalSystem');
    $('systemPromptNote').textContent = t('systemPromptNote');
    $('systemPromptCount').textContent = t('promptCount', { count:$('systemPromptSetting').value.length });
    const helpProvider = $('settingsModal').classList.contains('open')
      ? $('providerSetting').value
      : settings.provider;
    updateSettingsProviderHelp(helpProvider);
    $('attachmentStrip').dataset.empty = t('attachmentEmpty');
    $('dropOverlay').textContent = t('dropHere');
    $('themeBtn').textContent = isDarkTheme() ? t('light') : t('dark');

    setOptionText('streamQuick', 'true', t('on'));
    setOptionText('streamQuick', 'false', t('off'));
    setOptionText('streamSetting', 'true', t('on'));
    setOptionText('streamSetting', 'false', t('off'));
    setOptionText('rememberKeySetting', 'false', t('rememberNo'));
    setOptionText('rememberKeySetting', 'true', t('rememberYes'));
    setOptionText('themeSetting', 'system', t('themeSystem'));
    setOptionText('themeSetting', 'light', t('themeLight'));
    setOptionText('themeSetting', 'dark', t('themeDark'));
    setOptionText('transportSetting', 'auto', t('connectionAuto'));
    setOptionText('transportSetting', 'direct', t('connectionDirect'));
    setOptionText('transportSetting', 'proxy', t('connectionProxy'));

    updateSidebarControl();
    updateInfoPanel();
    renderHistory();
    renderPendingAttachments();
    if (!isGenerating) setBottomStatus(t('ready'));
  }

  function uid() {
    if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  function nowISO() { return new Date().toISOString(); }
  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    const locale = settings.language === 'zh' ? 'zh-CN' : undefined;
    return d.toLocaleString(locale, { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
  }
  function setBottomStatus(text) { $('bottomStatus').textContent = text; }
  function toast(text, duration = 1900) {
    const el = $('toast');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), duration);
  }
  function clampNumber(value, min, max, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
  }
  function temperatureMax(provider = settings.provider) {
    return provider === 'azai' ? 5 : 2;
  }
  function updateTemperatureBounds(provider = settings.provider, includeQuick = true) {
    const max = String(temperatureMax(provider));
    if (includeQuick) $('temperatureQuick').max = max;
    $('temperatureSetting').max = max;
  }
  function updateSystemPromptCount() {
    $('systemPromptCount').textContent = t('promptCount', { count:$('systemPromptSetting').value.length });
  }
  function updateSettingsProviderHelp(provider = settings.provider) {
    $('keySettingNote').textContent = provider === 'pollinations'
      ? t('pollinationsKeyNote')
      : provider === 'keylessai' ? t('keylessaiKeyNote')
      : provider === 'azai' ? t('keyOptional') : t('keyNote');
    $('apiKeySetting').placeholder = ['pollinations', 'keylessai', 'azai'].includes(provider) ? t('apiKeyOptionalPlaceholder') : 'sk-…';
    const notes = {
      azai: t('azaiSettingNote'),
      pollinations: t('pollinationsSettingNote'),
      keylessai: t('keylessaiSettingNote')
    };
    $('azaiSettingNoteText').textContent = notes[provider] || '';
    $('azaiSettingNote').hidden = !notes[provider];
    $('azaiDocsLink').hidden = provider !== 'azai';
  }

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_CONVERSATIONS)) {
          const store = database.createObjectStore(STORE_CONVERSATIONS, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
        if (!database.objectStoreNames.contains(STORE_SETTINGS)) {
          database.createObjectStore(STORE_SETTINGS, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  function idbGetAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }
  function idbGet(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }
  function idbPut(storeName, value) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
  function idbDelete(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  function cleanSettingsForStorage(value) {
    const copy = structuredClone(value);
    if (!copy.rememberKey) copy.apiKey = '';
    return { id: 'main', value: copy };
  }
  async function loadSettings() {
    const row = await idbGet(STORE_SETTINGS, 'main');
    settings = { ...DEFAULT_SETTINGS, ...(row?.value || {}) };
    if (!settings.providerModels || typeof settings.providerModels !== 'object' || Array.isArray(settings.providerModels)) {
      settings.providerModels = {};
    }
    if (!['zh','en'].includes(settings.language)) settings.language = 'zh';
    if (!['auto','direct','proxy'].includes(settings.transport)) settings.transport = 'auto';
    if (!['system','light','dark'].includes(settings.theme)) settings.theme = 'system';
    settings.sidebarCollapsed = settings.sidebarCollapsed === true;
    settings.sidebarWidth = clampNumber(settings.sidebarWidth, 210, 420, 256);
    if (!PROVIDER_PRESETS[settings.provider]) {
      // Also migrates stored settings from removed providers.
      settings.provider = 'pollinations';
      settings.apiBase = POLLINATIONS_ENDPOINT;
      settings.model = 'openai-fast';
      settings.customModel = '';
    }
    settings.temperature = clampNumber(settings.temperature, 0, temperatureMax(settings.provider), 0.7);
    if (settings.provider === 'azai') settings.thinking = false;
    // Migrate v2's localhost proxy setting when this same file is deployed on a
    // public HTTP(S) origin. 127.0.0.1 would otherwise point at each visitor's
    // own machine and produce ERR_CONNECTION_REFUSED.
    if (!settings.proxyUrl || (!IS_LOOPBACK_PAGE && IS_WEB_PAGE && String(settings.proxyUrl).trim() === LOCAL_PROXY_DEFAULT)) {
      settings.proxyUrl = DEFAULT_PROXY_URL;
    }
    if (!settings.rememberKey) settings.apiKey = '';
    sessionApiKey = settings.apiKey || '';
    await applyUrlConfig();
    applyTheme();
    syncSettingsToUI();
  }
  async function applyUrlConfig() {
    const url = new URL(location.href);
    const params = url.searchParams;
    const fields = ['provider', 'model', 'apiBase', 'endpoint', 'apiKey', 'transport', 'proxyUrl',
      'temperature', 'stream', 'thinking', 'systemPrompt', 'theme', 'language'];
    if (!fields.some(name => params.has(name))) return;
    const value = name => params.get(name)?.trim() || '';
    let changed = false;
    const provider = value('provider');
    if (provider && PROVIDER_PRESETS[provider]) {
      settings.provider = provider;
      settings.apiBase = PROVIDER_PRESETS[provider].endpoint;
      settings.model = PROVIDER_PRESETS[provider].model;
      settings.customModel = '';
      changed = true;
    }
    const endpoint = value('apiBase') || value('endpoint');
    if (endpoint && /^https?:\/\//i.test(endpoint)) {
      settings.apiBase = endpoint;
      changed = true;
    }
    const model = value('model');
    if (model) { settings.model = model.slice(0, 200); settings.customModel = ''; changed = true; }
    const transport = value('transport');
    if (['auto', 'direct', 'proxy'].includes(transport)) { settings.transport = transport; changed = true; }
    const proxyUrl = value('proxyUrl');
    if (proxyUrl && (/^https?:\/\//i.test(proxyUrl) || proxyUrl.startsWith('/'))) {
      settings.proxyUrl = proxyUrl;
      changed = true;
    }
    if (params.has('temperature') && Number.isFinite(Number(value('temperature')))) {
      settings.temperature = clampNumber(value('temperature'), 0, temperatureMax(settings.provider), settings.temperature);
      changed = true;
    }
    for (const name of ['stream', 'thinking']) {
      if (['true', 'false', '1', '0'].includes(value(name))) {
        settings[name] = ['true', '1'].includes(value(name));
        changed = true;
      }
    }
    if (params.has('systemPrompt')) { settings.systemPrompt = (params.get('systemPrompt') || '').slice(0, 10000); changed = true; }
    if (['system', 'light', 'dark'].includes(value('theme'))) { settings.theme = value('theme'); changed = true; }
    if (['zh', 'en'].includes(value('language'))) { settings.language = value('language'); changed = true; }
    if (settings.provider === 'azai') settings.thinking = false;
    if (params.has('apiKey')) {
      sessionApiKey = params.get('apiKey') || '';
      settings.rememberKey = false;
      settings.apiKey = '';
      params.delete('apiKey');
      history.replaceState(history.state, '', url.pathname + url.search + url.hash);
      changed = true;
    }
    if (changed) await saveSettings();
  }

  async function saveSettings() {
    settings.apiKey = settings.rememberKey ? sessionApiKey : '';
    await idbPut(STORE_SETTINGS, cleanSettingsForStorage(settings));
  }

  function currentApiKey() { return sessionApiKey.trim(); }
  function currentModel() { return (settings.customModel || '').trim() || settings.model; }
  function currentEndpoint() {
    return (settings.apiBase || '').trim() || PROVIDER_PRESETS[settings.provider]?.endpoint || '';
  }
  function effectiveProxyUrl(cfg = settings) {
    const configured = String(cfg.proxyUrl || '').trim();
    if (configured) return configured;
    return DEFAULT_PROXY_URL;
  }
  function isDarkTheme() {
    return settings.theme === 'dark' || (settings.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  }
  function applyTheme() {
    app.classList.toggle('az-dark', settings.theme === 'dark');
    app.classList.toggle('az-system', settings.theme === 'system');
    document.documentElement.style.colorScheme = isDarkTheme() ? 'dark' : 'light';
    document.documentElement.style.backgroundColor = isDarkTheme() ? '#000' : '#fff';
    if ($('themeBtn')) $('themeBtn').textContent = isDarkTheme() ? t('light') : t('dark');
  }

  function modelsEndpoint(cfg) {
    const endpoint = (cfg.apiBase || '').trim() || PROVIDER_PRESETS[cfg.provider]?.endpoint || '';
    if (!endpoint) throw new Error(t('missingEndpoint'));
    let url;
    try { url = new URL(endpoint); }
    catch { throw new Error(t('invalidModelsEndpoint')); }
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error(t('invalidModelsEndpoint'));
    if (/\/chat\/completions\/?$/.test(url.pathname)) {
      url.pathname = url.pathname.replace(/\/chat\/completions\/?$/, '/models');
    } else if (/\/openai\/?$/.test(url.pathname)) {
      // Pollinations' OpenAI-compatible endpoint is /openai; its catalog is /models.
      url.pathname = url.pathname.replace(/\/openai\/?$/, '/models');
    } else {
      throw new Error(t('invalidModelsEndpoint'));
    }
    url.hash = '';
    return url.href;
  }
  function modelCacheKey(cfg) {
    try { return JSON.stringify([cfg.provider, modelsEndpoint(cfg)]); }
    catch { return ''; }
  }
  function cachedModels(cfg) {
    const cached = settings.providerModels[modelCacheKey(cfg)];
    if (Array.isArray(cached) && cached.length) return cached;
    const preset = PROVIDER_PRESETS[cfg.provider];
    return preset?.model ? [{ id: preset.model, name: preset.model }] : [];
  }
  function buildModelOptions(select, selected, modelList = cachedModels(settings)) {
    const models = modelList;
    select.innerHTML = '';
    models.forEach(m => {
      const o = document.createElement('option');
      o.value = m.id;
      o.textContent = m.name || m.id;
      select.appendChild(o);
    });
    if (selected && !models.some(m => m.id === selected)) {
      const o = document.createElement('option');
      o.value = selected;
      o.textContent = selected;
      select.appendChild(o);
    }
    select.value = selected || models[0]?.id || '';
  }

  function syncSettingsToUI() {
    app.classList.toggle('sidebar-collapsed', !!settings.sidebarCollapsed);
    setSidebarWidth(settings.sidebarWidth, false);
    $('providerQuick').value = settings.provider;
    buildModelOptions($('modelQuick'), settings.model);
    $('endpointQuick').value = currentEndpoint();
    updateTemperatureBounds(settings.provider);
    $('temperatureQuick').value = settings.temperature;
    $('streamQuick').value = String(settings.stream);
    $('thinkingBtn').setAttribute('aria-pressed', String(!!settings.thinking));
    $('thinkingBtn').classList.toggle('active', !!settings.thinking);
    $('thinkingBtn').hidden = settings.provider === 'azai';
    $('languageQuick').value = settings.language;

    $('languageSetting').value = settings.language;
    $('providerSetting').value = settings.provider;
    $('apiBaseSetting').value = currentEndpoint();
    $('transportSetting').value = settings.transport;
    $('proxyUrlSetting').value = settings.proxyUrl || LOCAL_PROXY_DEFAULT;
    $('apiKeySetting').value = sessionApiKey;
    $('rememberKeySetting').value = String(settings.rememberKey);
    buildModelOptions($('modelSetting'), settings.model);
    $('customModelSetting').value = settings.customModel || '';
    $('temperatureSetting').value = settings.temperature;
    $('streamSetting').value = String(settings.stream);
    $('systemPromptSetting').value = settings.systemPrompt || '';
    updateSystemPromptCount();
    $('themeSetting').value = settings.theme;
    applyLanguage();
    updateInfoPanel();
  }

  function collectSettingsFromModal() {
    const provider = $('providerSetting').value;
    const model = $('modelSetting').value || settings.model;
    return {
      ...settings,
      language: $('languageSetting').value,
      provider,
      apiBase: $('apiBaseSetting').value.trim() || PROVIDER_PRESETS[provider]?.endpoint || '',
      transport: $('transportSetting').value,
      proxyUrl: $('proxyUrlSetting').value.trim() || LOCAL_PROXY_DEFAULT,
      rememberKey: $('rememberKeySetting').value === 'true',
      model,
      customModel: $('customModelSetting').value.trim(),
      temperature: clampNumber($('temperatureSetting').value, 0, temperatureMax(provider), 0.7),
      stream: $('streamSetting').value === 'true',
      systemPrompt: $('systemPromptSetting').value,
      theme: $('themeSetting').value
    };
  }

  function modelForConfig(cfg) { return (cfg.customModel || '').trim() || cfg.model; }
  function shouldWarnModelSwitch(newModel) {
    if (!activeConversation?.messages?.length) return false;
    const previous = activeConversation.model || currentModel();
    return !!previous && !!newModel && previous !== newModel;
  }
  function confirmModelSwitch(newModel) {
    if (!shouldWarnModelSwitch(newModel)) return true;
    return confirm(t('modelSwitchWarn'));
  }

  function makeConversation(title = t('newChatTitle')) {
    const stamp = nowISO();
    return {
      id: uid(),
      title,
      createdAt: stamp,
      updatedAt: stamp,
      messages: [],
      provider: settings.provider,
      model: currentModel()
    };
  }
  async function createNewChat() {
    if (isGenerating) stopGeneration();
    pendingAttachments = [];
    renderPendingAttachments();
    const convo = makeConversation();
    conversations.unshift(convo);
    activeConversation = convo;
    await idbPut(STORE_CONVERSATIONS, convo);
    $('historyPanel').classList.remove('drawer-open', 'mobile-open');
    updateSidebarControl();
    renderAll();
    promptInput.focus();
  }
  async function loadConversations() {
    conversations = await idbGetAll(STORE_CONVERSATIONS);
    conversations.sort((a,b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    if (!conversations.length) {
      const convo = makeConversation();
      conversations = [convo];
      await idbPut(STORE_CONVERSATIONS, convo);
    }
    activeConversation = conversations[0];
  }
  async function persistActive() {
    if (!activeConversation) return;
    activeConversation.updatedAt = nowISO();
    activeConversation.provider = settings.provider;
    await idbPut(STORE_CONVERSATIONS, activeConversation);
    conversations.sort((a,b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    renderHistory();
    updateInfoPanel();
  }
  function autoTitle(text, attachments = []) {
    const base = text.replace(/\s+/g, ' ').trim() || attachments[0]?.name || t('newChatTitle');
    return base.length > 42 ? base.slice(0, 42) + '…' : base;
  }

  function renderAll() {
    renderMessages();
    renderHistory();
    renderPendingAttachments();
    updateInfoPanel();
  }
  function renderHistory() {
    const q = $('historySearch').value.trim().toLowerCase();
    const filtered = conversations.filter(c => {
      if (!q) return true;
      const content = [
        c.title, c.model,
        ...(c.messages || []).map(m => `${m.content || ''} ${(m.attachments || []).map(a => a.name).join(' ')}`)
      ].join('\n').toLowerCase();
      return content.includes(q);
    });
    historyListEl.innerHTML = '';
    filtered.forEach(c => {
      const row = document.createElement('div');
      row.className = 'history-row' + (activeConversation?.id === c.id ? ' selected' : '');
      row.dataset.id = c.id;

      const title = document.createElement('div');
      title.className = 'history-title';
      title.textContent = c.title || t('untitled');

      const meta = document.createElement('div');
      meta.className = 'history-meta';
      meta.textContent = `${formatDate(c.updatedAt)} · ${c.messages?.length || 0} msg · ${c.model || '—'}`;

      const actions = document.createElement('div');
      actions.className = 'row-actions';
      const rename = document.createElement('button');
      rename.className = 'tiny-action';
      rename.textContent = settings.language === 'zh' ? '改' : 'edit';
      rename.title = t('rename');
      rename.addEventListener('click', e => { e.stopPropagation(); openRename(c); });
      const del = document.createElement('button');
      del.className = 'tiny-action danger';
      del.textContent = settings.language === 'zh' ? '删' : 'del';
      del.title = settings.language === 'zh' ? '删除' : 'Delete';
      del.addEventListener('click', e => { e.stopPropagation(); deleteConversation(c.id); });
      actions.append(rename, del);
      row.append(title, meta, actions);
      row.addEventListener('click', () => selectConversation(c.id));
      historyListEl.appendChild(row);
    });
    if (!filtered.length) {
      const empty = document.createElement('div');
      empty.className = 'history-row muted';
      empty.textContent = t('noMatching');
      historyListEl.appendChild(empty);
    }
  }
  function selectConversation(id) {
    if (isGenerating) stopGeneration();
    const c = conversations.find(x => x.id === id);
    if (!c) return;
    activeConversation = c;
    pendingAttachments = [];
    $('historyPanel').classList.remove('drawer-open', 'mobile-open');
    updateSidebarControl();
    renderAll();
  }
  async function deleteConversation(id) {
    const c = conversations.find(x => x.id === id);
    if (!c) return;
    if (!confirm(t('deleteConfirm', { title: c.title }))) return;
    await idbDelete(STORE_CONVERSATIONS, id);
    conversations = conversations.filter(x => x.id !== id);
    if (!conversations.length) {
      const fresh = makeConversation();
      conversations = [fresh];
      await idbPut(STORE_CONVERSATIONS, fresh);
    }
    if (activeConversation?.id === id) activeConversation = conversations[0];
    renderAll();
    toast(t('deleteDone'));
  }

  function openRename(conversation = activeConversation) {
    if (!conversation) return;
    $('renameBox').dataset.id = conversation.id;
    $('renameInput').value = conversation.title || '';
    $('renameBox').classList.add('open');
    setTimeout(() => $('renameInput').select(), 0);
  }
  function closeRename() { $('renameBox').classList.remove('open'); }
  async function saveRename() {
    const id = $('renameBox').dataset.id;
    const c = conversations.find(x => x.id === id);
    if (!c) return closeRename();
    c.title = $('renameInput').value.trim() || t('untitled');
    c.updatedAt = nowISO();
    await idbPut(STORE_CONVERSATIONS, c);
    closeRename();
    renderAll();
  }

  function renderMarkdownInto(container, text) {
    container.replaceChildren();
    if (!mdRenderer) {
      container.textContent = text || '';
      return;
    }
    try {
      const result = mdRenderer.render(text || '', {
        page: 'all',
        baseURL: location.href,
        tocLabel: settings.language === 'zh' ? '目录' : 'Contents'
      });
      container.appendChild(result.fragment);
      for (const button of container.querySelectorAll('.copy-code')) {
        button.textContent = settings.language === 'zh' ? '复制' : 'Copy';
        button.setAttribute('aria-label', settings.language === 'zh' ? '复制代码' : 'Copy code');
      }
    } catch (error) {
      console.warn('md-renderer failed', error);
      container.textContent = text || '';
    }
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, c => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
    }[c]));
  }
  function formatBytes(n) {
    if (!Number.isFinite(n)) return '';
    if (n < 1024) return `${n} B`;
    if (n < 1024*1024) return `${(n/1024).toFixed(1)} KB`;
    return `${(n/1024/1024).toFixed(1)} MB`;
  }
  function renderMessageAttachments(container, attachments = []) {
    if (!attachments.length) return;
    const group = document.createElement('div');
    group.className = 'message-attachments';
    for (const a of attachments) {
      const item = document.createElement('div');
      item.className = 'message-attachment';
      const label = document.createElement('div');
      label.textContent = `${a.kind === 'image' ? '▧' : '▤'} ${a.name} · ${formatBytes(a.size)}`;
      item.appendChild(label);
      if (a.kind === 'image' && a.dataUrl) {
        const img = document.createElement('img');
        img.src = a.dataUrl;
        img.alt = a.name;
        img.loading = 'lazy';
        item.appendChild(img);
      } else if (a.kind === 'binary') {
        const note = document.createElement('div');
        note.className = 'muted';
        note.textContent = t('binaryLocalOnly');
        item.appendChild(note);
      }
      group.appendChild(item);
    }
    container.appendChild(group);
  }
  function formatUsage(usage) {
    if (!usage) return '';
    const kind = usage.estimated ? t('usageEstimated') : t('usageActual');
    return `${kind} · ${t('input')} ${usage.prompt_tokens || 0} · ${t('output')} ${usage.completion_tokens || 0} · ${t('total')} ${usage.total_tokens || 0}`;
  }

  async function writeClipboard(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {}
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) throw new Error('Clipboard copy failed');
  }

  function renderReasoning(box, message) {
    if (!message.reasoning) return;
    const details = document.createElement('details');
    details.className = 'message-reasoning';
    const summary = document.createElement('summary');
    summary.textContent = t('thinkingContent');
    const body = document.createElement('div');
    body.className = 'message-reasoning-body';
    body.textContent = message.reasoning;
    details.append(summary, body);
    box.prepend(details);
  }

  function renderMessages() {
    messagesEl.innerHTML = '';
    const list = activeConversation?.messages || [];
    if (!list.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = settings.language === 'zh'
        ? '<div class="formula">有什么可以帮你？</div><div class="hint">从一个问题开始。</div>'
        : '<div class="formula">How can I help you?</div><div class="hint">Start with a question.</div>';
      messagesEl.appendChild(empty);
      return;
    }

    list.forEach((m, index) => {
      const wrap = document.createElement('div');
      wrap.className = `message-wrap ${m.role === 'user' ? 'user' : 'assistant'}`;
      const name = document.createElement('div');
      name.className = 'message-name';
      name.textContent = m.role === 'user' ? (settings.language === 'zh' ? '你' : 'You') : (m.model || activeConversation.model || 'Assistant');
      const box = document.createElement('div');
      box.className = 'message-box' + (m.streaming ? ' streaming' : '');
      box.dataset.messageIndex = String(index);

      renderMessageAttachments(box, m.attachments || []);
      const content = document.createElement('div');
      content.className = 'message-content markdown';
      renderReasoning(box, m);
      renderMarkdownInto(content, m.content || '');
      box.appendChild(content);

      if (m.usage) {
        const usage = document.createElement('div');
        usage.className = 'message-usage';
        usage.textContent = formatUsage(m.usage);
        box.appendChild(usage);
      }
      const actions = document.createElement('div');
      actions.className = 'message-actions';
      const copyButton = document.createElement('button');
      copyButton.type = 'button';
      copyButton.className = 'copy-message';
      copyButton.dataset.messageIndex = String(index);
      copyButton.textContent = t('copyMessage');
      copyButton.setAttribute('aria-label', t('copyMessage'));
      actions.appendChild(copyButton);
      wrap.append(name, box, actions);
      messagesEl.appendChild(wrap);
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function scheduleAssistantRender(messageIndex) {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => {
      const box = messagesEl.querySelector(`[data-message-index="${messageIndex}"]`);
      const msg = activeConversation?.messages?.[messageIndex];
      if (!box || !msg) return;
      let content = box.querySelector('.message-content');
      if (!content) {
        box.innerHTML = '';
        renderMessageAttachments(box, msg.attachments || []);
        content = document.createElement('div');
        content.className = 'message-content markdown';
        box.appendChild(content);
      }
      box.querySelector('.message-reasoning')?.remove();
      renderReasoning(box, msg);
      renderMarkdownInto(content, msg.content || '');
      box.classList.toggle('streaming', !!msg.streaming);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 45);
  }

  function normalizeUsage(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const prompt = Number(raw.prompt_tokens ?? raw.input_tokens ?? raw.inputTokens ?? 0);
    const completion = Number(raw.completion_tokens ?? raw.output_tokens ?? raw.outputTokens ?? 0);
    let total = Number(raw.total_tokens ?? raw.totalTokens ?? 0);
    if (!total) total = prompt + completion;
    if (!prompt && !completion && !total) return null;
    return {
      prompt_tokens: Math.max(0, Math.round(prompt || 0)),
      completion_tokens: Math.max(0, Math.round(completion || 0)),
      total_tokens: Math.max(0, Math.round(total || 0)),
      estimated: false
    };
  }
  function estimateTextTokens(text) {
    text = String(text || '');
    const cjk = (text.match(/[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) || []).length;
    const other = text.length - cjk;
    return Math.max(0, cjk + Math.ceil(other / 4));
  }
  function estimateAttachmentTokens(attachments = []) {
    let n = 0;
    for (const a of attachments) {
      if (a.kind === 'text') n += estimateTextTokens(a.text || '');
      else if (a.kind === 'image') n += 255; // rough placeholder; real image tokenization is provider/model-specific
      else n += 12;
    }
    return n;
  }
  function estimateApiMessages(apiMessages) {
    let total = 0;
    for (const m of apiMessages) {
      total += 4;
      if (typeof m.content === 'string') total += estimateTextTokens(m.content);
      else if (Array.isArray(m.content)) {
        for (const part of m.content) {
          if (part.type === 'text') total += estimateTextTokens(part.text || '');
          if (part.type === 'image_url') total += 255;
        }
      }
    }
    return total + 2;
  }
  function conversationUsage(c = activeConversation) {
    const result = { prompt_tokens:0, completion_tokens:0, total_tokens:0, estimated:false, hasEstimated:false };
    for (const m of c?.messages || []) {
      if (!m.usage) continue;
      result.prompt_tokens += Number(m.usage.prompt_tokens || 0);
      result.completion_tokens += Number(m.usage.completion_tokens || 0);
      result.total_tokens += Number(m.usage.total_tokens || 0);
      if (m.usage.estimated) result.hasEstimated = true;
    }
    result.estimated = result.hasEstimated;
    return result;
  }
  function updateTokenHint() {
    const usage = conversationUsage();
    const draft = estimateTextTokens(promptInput.value) + estimateAttachmentTokens(pendingAttachments);
    const prefix = usage.hasEstimated ? '~' : '';
    $('tokenHint').textContent = `${prefix}${usage.total_tokens} ${t('tokens')}${draft ? ` · ${t('draft')} ~${draft}` : ''}`;
  }
  function updateInfoPanel() {
    const keyReady = !!currentApiKey();
    const endpointReady = !!currentEndpoint();
    const keyOptional = ['pollinations', 'keylessai', 'azai'].includes(settings.provider);
    const configured = endpointReady && (keyReady || keyOptional);
    $('apiDot').classList.toggle('on', configured);
    $('apiStatus').textContent = configured ? t('apiConfigured') : t('apiNotConfigured');
    $('infoProvider').textContent = PROVIDER_PRESETS[settings.provider]?.name || t('providerCustom');
    $('infoModel').textContent = currentModel() || '—';
    $('infoMessages').textContent = activeConversation?.messages?.length || 0;
    const usage = conversationUsage();
    $('infoTokens').textContent = `${usage.hasEstimated ? '~' : ''}${usage.total_tokens}`;
    $('infoUpdated').textContent = formatDate(activeConversation?.updatedAt);
    $('endpointQuick').value = currentEndpoint();
    updateTokenHint();
  }

  function requestHeaders(key = currentApiKey(), provider = settings.provider) {
    // AZ I parses JSON from a text/plain body. Keeping it a CORS "simple
    // request" avoids the preflight OPTIONS it does not implement.
    const headers = { 'Content-Type': provider === 'azai' ? 'text/plain' : 'application/json' };
    if (key) headers.Authorization = `Bearer ${key}`;
    return headers;
  }
  async function proxyFetch(target, init = {}, cfg = settings) {
    const proxyUrl = effectiveProxyUrl(cfg);
    const headers = new Headers(init.headers || {});
    headers.set('X-AZ-Target', target);
    return fetch(proxyUrl, { ...init, headers });
  }
  function isPollinationsTarget(target) {
    try { return new URL(target, location.href).hostname === 'text.pollinations.ai'; }
    catch { return false; }
  }
  // The classic Pollinations API accepts one request at a time per IP. Hold the
  // slot until the response body is fully consumed (streams included), release
  // it on abort, and retry briefly when a 429 says the previous request is still
  // running.
  let pollinationsBusy = false;
  const pollinationsQueue = [];
  function releasePollinationsSlot() {
    const next = pollinationsQueue.shift();
    if (next) next();
    else pollinationsBusy = false;
  }
  function waitForPollinationsSlot() {
    return new Promise(resolve => pollinationsQueue.push(resolve));
  }
  async function pollinationsRequest(run, signal) {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (pollinationsBusy) await waitForPollinationsSlot();
      else pollinationsBusy = true;
      let response;
      try {
        response = await Promise.race([
          run(),
          new Promise((_, reject) => {
            if (!signal) return;
            const abort = () => reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
            if (signal.aborted) abort();
            else signal.addEventListener('abort', abort, { once: true });
          })
        ]);
      } catch (error) {
        releasePollinationsSlot();
        throw error;
      }
      if (response.status === 429 && attempt < 2) {
        try { await response.body?.cancel(); } catch {}
        releasePollinationsSlot();
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      if (!response.body) { releasePollinationsSlot(); return response; }
      const reader = response.body.getReader();
      let released = false;
      const done = () => { if (!released) { released = true; releasePollinationsSlot(); } };
      const body = new ReadableStream({
        async pull(controller) {
          try {
            const { value, done: finished } = await reader.read();
            if (finished) { controller.close(); done(); }
            else controller.enqueue(value);
          } catch (error) {
            controller.error(error);
            done();
          }
        },
        cancel(reason) { done(); return reader.cancel(reason); }
      });
      return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers });
    }
  }
  async function networkFetch(target, init = {}, cfg = settings) {
    const transport = cfg.transport || 'auto';
    const direct = () => fetch(target, init);
    const relay = () => proxyFetch(target, init, cfg);
    const send = run => isPollinationsTarget(target) ? pollinationsRequest(run, init.signal) : run();
    const isAbort = error => error?.name === 'AbortError';
    if (transport === 'direct') return send(direct);
    if (transport === 'proxy') {
      try { return await send(relay); }
      catch (e) {
        if (isAbort(e)) throw e;
        const err = new Error(t('proxyUnavailable'));
        err.cause = e;
        err.code = 'NETWORK';
        throw err;
      }
    }

    // Auto mode is direct-first. The configured relay is only a last resort
    // when the browser cannot reach the provider at all.
    try { return await send(direct); }
    catch (e) { if (isAbort(e)) throw e; }

    try {
      const response = await send(relay);
      toast(t('directFailedProxyOk'), 2600);
      return response;
    } catch (proxyError) {
      if (isAbort(proxyError)) throw proxyError;
      const err = new Error(t('failedFetch'));
      err.cause = proxyError;
      err.code = 'NETWORK';
      throw err;
    }
  }

  function apiContentForMessage(m) {
    const attachments = m.attachments || [];
    let text = m.content || '';
    for (const a of attachments) {
      if (a.kind === 'text') {
        const clipped = String(a.text || '').slice(0, 700000);
        text += `\n\n[Attached file: ${a.name}]\n${clipped}`;
      } else if (a.kind === 'binary') {
        text += `\n\n[Attached binary file: ${a.name}, ${formatBytes(a.size)}. The generic chat endpoint may not have access to its bytes.]`;
      }
    }
    const images = attachments.filter(a => a.kind === 'image' && a.dataUrl);
    if (!images.length) return text;
    if (settings.provider === 'azai') {
      const names = images.map(a => a.name).filter(Boolean).join(', ');
      return `${text}${text ? '\n\n' : ''}[${t('azaiImagesUnsupported')}${names ? ` ${names}` : ''}]`;
    }
    const parts = [{ type: 'text', text: text || 'Please analyze the attached image(s).' }];
    for (const a of images) parts.push({ type:'image_url', image_url:{ url:a.dataUrl } });
    return parts;
  }
  // AZ I caps messages at 100, each at 16000 chars, and the whole request at
  // 64000 chars (256 KiB body). Trim old turns rather than let the server 413.
  function limitAzaiMessages(messages) {
    const list = messages.slice(-100).map(m => (
      typeof m.content === 'string' && m.content.length > 16000
        ? { ...m, content: m.content.slice(0, 16000) }
        : m
    ));
    let total = list.reduce((n, m) => n + (typeof m.content === 'string' ? m.content.length : 0), 0);
    while (total > 64000) {
      const index = list.findIndex((m, i) => i > 0 && m.role !== 'system');
      if (index === -1) break;
      const [removed] = list.splice(index, 1);
      total -= typeof removed.content === 'string' ? removed.content.length : 0;
    }
    return list;
  }
  function buildApiMessages(excludeId = '') {
    const result = [];
    if (settings.systemPrompt.trim()) result.push({ role:'system', content:settings.systemPrompt.trim() });
    for (const m of activeConversation?.messages || []) {
      if (m.id === excludeId) continue;
      if (m.role !== 'user' && m.role !== 'assistant') continue;
      if (m.role === 'assistant' && m.streaming && !m.content) continue;
      result.push({ role:m.role, content:apiContentForMessage(m) });
    }
    return settings.provider === 'azai' ? limitAzaiMessages(result) : result;
  }
  function extractReasoning(message) {
    const value = message?.reasoning_content ?? message?.reasoning ?? '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.map(x => typeof x === 'string' ? x : (x?.text || '')).join('');
    return '';
  }
  function extractNonStreamContent(data) {
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) return content.map(x => typeof x === 'string' ? x : (x?.text || '')).join('');
    return '';
  }
  async function parseSSE(response, onDelta, onUsage, onReasoning) {
    if (!response.body) throw new Error('Streaming body is not available in this browser.');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const handleEvent = event => {
      for (const line of event.split(/\r?\n/)) {
        if (!line.startsWith('data:')) continue;
        const raw = line.slice(5).trim();
        if (!raw || raw === '[DONE]') continue;
        let payload;
        try { payload = JSON.parse(raw); } catch { continue; }
        // AZAI (and some other servers) report mid-stream failures as a 200 SSE
        // event with an error object instead of a non-2xx HTTP status.
        if (payload?.error) {
          const detail = payload.error.message || payload.error.type || JSON.stringify(payload.error);
          throw new Error(detail);
        }
        const usage = normalizeUsage(payload?.usage);
        if (usage) onUsage?.(usage);
        const delta = payload?.choices?.[0]?.delta;
        const piece = typeof delta?.content === 'string'
          ? delta.content
          : Array.isArray(delta?.content)
            ? delta.content.map(x => typeof x === 'string' ? x : (x?.text || '')).join('')
            : '';
        if (piece) onDelta(piece);
        const reasoning = extractReasoning(delta);
        if (reasoning) onReasoning?.(reasoning);
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream:true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() || '';
      for (const event of events) handleEvent(event);
    }
    if (buffer.trim()) handleEvent(buffer);
  }
  async function apiError(response) {
    let detail = '';
    try {
      const clone = response.clone();
      const data = await clone.json();
      detail = data?.error?.message || data?.message || JSON.stringify(data);
    } catch {
      try { detail = await response.text(); } catch {}
    }
    detail = detail ? ` · ${detail.slice(0, 500)}` : '';
    return new Error(`HTTP ${response.status} ${response.statusText}${detail}`);
  }
  function displayApiError(error, provider = settings.provider) {
    const message = error?.message || String(error);
    if (provider === 'azai' && /failed to fetch|networkerror|load failed|fetch failed/i.test(message)) {
      return `${message} · ${t('azaiCorsHint')}`;
    }
    return message;
  }
  async function executeChatRequest(body, signal) {
    const init = {
      method:'POST',
      headers:requestHeaders(),
      body:JSON.stringify(body),
      signal
    };
    let response = await networkFetch(currentEndpoint(), init);
    if (!response.ok && body.stream_options && [400, 404, 422].includes(response.status)) {
      const retryBody = { ...body };
      delete retryBody.stream_options;
      try { await response.body?.cancel(); } catch {}
      response = await networkFetch(currentEndpoint(), { ...init, body:JSON.stringify(retryBody) });
      body = retryBody;
    }
    if (!response.ok && body.reasoning_effort && [400, 422].includes(response.status)) {
      const retryBody = { ...body };
      delete retryBody.reasoning_effort;
      try { await response.body?.cancel(); } catch {}
      response = await networkFetch(currentEndpoint(), { ...init, body:JSON.stringify(retryBody) });
      if (response.ok) toast(t('thinkingUnavailable'), 2800);
    }
    return response;
  }

  async function sendMessage() {
    if (isGenerating) return;
    const text = promptInput.value.trim();
    if (!text && !pendingAttachments.length) return;
    if (!currentEndpoint()) { toast(t('missingEndpoint')); openSettings(); return; }
    if (!currentModel()) { toast(t('missingModel')); openSettings(); return; }

    if (!activeConversation) await createNewChat();
    const attachments = structuredClone(pendingAttachments);
    if (!activeConversation.messages.length && [t('newChatTitle'), 'New chat', '新聊天'].includes(activeConversation.title)) {
      activeConversation.title = autoTitle(text, attachments);
    }

    const userMessage = {
      id:uid(), role:'user', content:text, attachments,
      createdAt:nowISO()
    };
    activeConversation.messages.push(userMessage);
    if (settings.provider === 'azai' && activeConversation.messages.some(m => m.attachments?.some(a => a.kind === 'image'))) {
      toast(t('azaiImagesUnsupported'), 2600);
    }
    promptInput.value = '';
    pendingAttachments = [];
    renderPendingAttachments();

    const assistantMessage = {
      id:uid(), role:'assistant', content:'', createdAt:nowISO(),
      model:currentModel(), streaming:!!settings.stream
    };
    activeConversation.messages.push(assistantMessage);
    activeConversation.model = currentModel();
    activeConversation.provider = settings.provider;
    await persistActive();
    renderMessages();

    isGenerating = true;
    sendBtn.disabled = true;
    stopBtn.disabled = false;
    abortController = new AbortController();
    setBottomStatus(t('calling', { model:currentModel() }));

    const assistantIndex = activeConversation.messages.length - 1;
    const apiMessages = buildApiMessages(assistantMessage.id);
    const inputEstimate = estimateApiMessages(apiMessages);
    const body = {
      model:currentModel(),
      messages:apiMessages,
      temperature:settings.temperature,
      stream:!!settings.stream
    };
    if (settings.stream) body.stream_options = { include_usage:true };
    if (settings.thinking && settings.provider !== 'azai') body.reasoning_effort = 'medium';

    let actualUsage = null;
    try {
      const response = await executeChatRequest(body, abortController.signal);
      if (!response.ok) throw await apiError(response);

      if (settings.stream) {
        await parseSSE(response, piece => {
          assistantMessage.content += piece;
          scheduleAssistantRender(assistantIndex);
        }, usage => { actualUsage = usage; }, piece => {
          assistantMessage.reasoning = (assistantMessage.reasoning || '') + piece;
          scheduleAssistantRender(assistantIndex);
        });
      } else {
        const data = await response.json();
        assistantMessage.content = extractNonStreamContent(data);
        assistantMessage.reasoning = extractReasoning(data?.choices?.[0]?.message);
        actualUsage = normalizeUsage(data?.usage);
        if (!assistantMessage.content && !assistantMessage.reasoning) throw new Error('The API returned no assistant text.');
      }

      assistantMessage.streaming = false;
      if (!assistantMessage.content) assistantMessage.content = t('emptyResponse');
      assistantMessage.usage = actualUsage || {
        prompt_tokens:inputEstimate,
        completion_tokens:estimateTextTokens(assistantMessage.content),
        total_tokens:inputEstimate + estimateTextTokens(assistantMessage.content),
        estimated:true
      };
      await persistActive();
      renderMessages();
      setBottomStatus(`${t('ready')} · ${currentModel()}`);
    } catch (error) {
      assistantMessage.streaming = false;
      if (error?.name === 'AbortError') {
        if (!assistantMessage.content) assistantMessage.content = t('stoppedText');
        assistantMessage.usage = actualUsage || {
          prompt_tokens:inputEstimate,
          completion_tokens:estimateTextTokens(assistantMessage.content),
          total_tokens:inputEstimate + estimateTextTokens(assistantMessage.content),
          estimated:true
        };
        setBottomStatus(t('stopped'));
      } else {
        const message = displayApiError(error);
        assistantMessage.content += (assistantMessage.content ? '\n\n' : '') + `> API error: ${message}`;
        assistantMessage.usage = actualUsage || {
          prompt_tokens:inputEstimate,
          completion_tokens:estimateTextTokens(assistantMessage.content),
          total_tokens:inputEstimate + estimateTextTokens(assistantMessage.content),
          estimated:true
        };
        setBottomStatus(`${t('apiFailed')} · ${message}`);
        toast(t('apiFailed'), 2600);
      }
      await persistActive();
      renderMessages();
    } finally {
      isGenerating = false;
      sendBtn.disabled = false;
      stopBtn.disabled = true;
      abortController = null;
      updateTokenHint();
      promptInput.focus();
    }
  }
  function stopGeneration() { if (abortController) abortController.abort(); }

  function isTextFile(file) {
    if (file.type?.startsWith('text/')) return true;
    return /\.(txt|md|markdown|json|jsonl|csv|tsv|xml|html?|css|js|mjs|cjs|ts|tsx|jsx|py|java|c|h|cpp|hpp|cc|cs|go|rs|php|rb|swift|kt|kts|sh|bat|cmd|ps1|sql|yaml|yml|toml|ini|cfg|log|tex|r|lua|vue|svelte)$/i.test(file.name);
  }
  function readFileDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
      reader.readAsDataURL(file);
    });
  }
  async function fileToAttachment(file) {
    if (file.size > MAX_ATTACHMENT_BYTES) throw new Error(t('fileTooLarge', { name:file.name }));
    if (file.type?.startsWith('image/')) {
      return {
        id:uid(), name:file.name || 'image', type:file.type || 'image/*',
        size:file.size, kind:'image', dataUrl:await readFileDataUrl(file)
      };
    }
    if (isTextFile(file)) {
      if (file.size > MAX_TEXT_BYTES) throw new Error(t('fileTooLarge', { name:file.name }));
      return {
        id:uid(), name:file.name || 'file.txt', type:file.type || 'text/plain',
        size:file.size, kind:'text', text:await file.text()
      };
    }
    return {
      id:uid(), name:file.name || 'file', type:file.type || 'application/octet-stream',
      size:file.size, kind:'binary'
    };
  }
  async function addFiles(fileList) {
    const files = [...(fileList || [])];
    if (!files.length) return;
    const room = MAX_ATTACHMENTS - pendingAttachments.length;
    if (room <= 0) return toast(t('tooManyFiles'));
    for (const file of files.slice(0, room)) {
      try {
        pendingAttachments.push(await fileToAttachment(file));
      } catch (e) {
        toast(e.message || String(e), 3000);
      }
    }
    if (files.length > room) toast(t('tooManyFiles'));
    renderPendingAttachments();
    updateTokenHint();
    if (pendingAttachments.some(a => a.kind === 'image')) setBottomStatus(t('imageModelNote'));
    else if (pendingAttachments.some(a => a.kind === 'binary')) setBottomStatus(t('binaryLocalOnly'));
    else setBottomStatus(t('attachedCount', { count:pendingAttachments.length }));
  }
  function renderPendingAttachments() {
    const strip = $('attachmentStrip');
    strip.innerHTML = '';
    strip.dataset.empty = t('attachmentEmpty');
    for (const a of pendingAttachments) {
      const chip = document.createElement('div');
      chip.className = 'attachment-chip';
      chip.title = `${a.name} · ${formatBytes(a.size)}`;
      chip.append(document.createTextNode(`${a.kind === 'image' ? '▧' : '▤'} ${a.name}`));
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'X';
      remove.addEventListener('click', () => {
        pendingAttachments = pendingAttachments.filter(x => x.id !== a.id);
        renderPendingAttachments();
        updateTokenHint();
      });
      chip.appendChild(remove);
      strip.appendChild(chip);
    }
  }

  function openSettings() {
    syncSettingsToUI();
    $('settingsModal').classList.add('open');
    setTimeout(() => $('apiKeySetting').focus(), 0);
  }
  function closeSettings() {
    $('settingsModal').classList.remove('open');
    modelRefreshRequests.modal?.abort();
    modelRefreshRequests.modal = null;
    syncSettingsToUI();
    updateModelRefreshButton(true);
  }

  async function saveSettingsFromModal() {
    const candidate = collectSettingsFromModal();
    if (candidate.provider === 'azai') candidate.thinking = false;
    const nextModel = modelForConfig(candidate);
    if (!confirmModelSwitch(nextModel)) {
      syncSettingsToUI();
      return;
    }
    const oldModel = currentModel();
    const connectionChanged = modelRefreshSignature(settings, currentApiKey()) !==
      modelRefreshSignature(candidate, $('apiKeySetting').value.trim());
    settings = candidate;
    sessionApiKey = $('apiKeySetting').value.trim();
    settings.apiKey = settings.rememberKey ? sessionApiKey : '';
    applyTheme();
    await saveSettings();
    syncSettingsToUI();
    closeSettings();
    if (oldModel !== nextModel && activeConversation?.messages?.length) toast(t('modelSwitchToast'), 2600);
    renderAll();
    toast(t('settingsSaved'));
    if (connectionChanged) void refreshModels();
  }

  async function testApi() {
    const candidate = collectSettingsFromModal();
    const key = $('apiKeySetting').value.trim();
    const endpoint = candidate.apiBase || PROVIDER_PRESETS[candidate.provider]?.endpoint || '';
    const model = modelForConfig(candidate);
    if (!endpoint || !model) return toast(!endpoint ? t('missingEndpoint') : t('missingModel'));
    $('testApiBtn').disabled = true;
    setBottomStatus(t('testing'));
    try {
      const payload = {
        model,
        messages:[{ role:'user', content:'Reply with exactly: OK' }],
        temperature:0,
        stream:false
      };
      // AZ I ignores generation caps; omit it so the request matches its docs.
      if (candidate.provider !== 'azai') payload.max_tokens = 16;
      const response = await networkFetch(endpoint, {
        method:'POST',
        headers:requestHeaders(key, candidate.provider),
        body:JSON.stringify(payload)
      }, candidate);
      if (!response.ok) throw await apiError(response);
      const data = await response.json();
      const reply = extractNonStreamContent(data);
      const usage = normalizeUsage(data?.usage);
      toast(reply ? `API OK · ${reply.slice(0,60)}` : 'API OK');
      setBottomStatus(`${t('apiTestOk')}${usage ? ` · ${formatUsage(usage)}` : ''}`);
    } catch (e) {
      toast(t('apiTestFailed'), 2600);
      setBottomStatus(`${t('apiTestFailed')} · ${displayApiError(e, candidate.provider)}`);
    } finally {
      $('testApiBtn').disabled = false;
      updateInfoPanel();
    }
  }

  function normalizeModelList(payload) {
    const arr = Array.isArray(payload) ? payload : (payload?.data || payload?.models || []);
    if (!Array.isArray(arr)) throw new Error(t('invalidModels'));
    return arr.map(m => ({
      id:String(typeof m === 'string' ? m : m?.id || m?.model || m?.name || '').trim(),
      name:String(typeof m === 'string' ? m : m?.name || m?.display_name || m?.id || m?.model || '').trim(),
      raw:m
    })).filter(m => m.id);
  }
  function modelRefreshSignature(cfg, key) {
    return JSON.stringify([cfg.provider, cfg.apiBase, cfg.transport, cfg.proxyUrl, key]);
  }
  function updateModelRefreshButton(fromModal) {
    const button = $(fromModal ? 'refreshModelsSettingBtn' : 'refreshModelsBtn');
    const busy = !!modelRefreshRequests[fromModal ? 'modal' : 'active'];
    button.disabled = busy;
    button.textContent = t(busy ? 'refreshingModels' : 'refreshModels');
    button.setAttribute('aria-busy', String(busy));
  }
  async function refreshModels({ fromModal = false } = {}) {
    const context = fromModal ? 'modal' : 'active';
    modelRefreshRequests[context]?.abort();
    const controller = new AbortController();
    modelRefreshRequests[context] = controller;
    const cfg = fromModal ? collectSettingsFromModal() : { ...settings };
    const key = fromModal ? $('apiKeySetting').value.trim() : currentApiKey();
    const signature = modelRefreshSignature(cfg, key);
    // Only the latest request for an unchanged connection may update its controls.
    const isCurrent = () => {
      if (controller.signal.aborted || modelRefreshRequests[context] !== controller) return false;
      if (fromModal && !$('settingsModal').classList.contains('open')) return false;
      const currentCfg = fromModal ? collectSettingsFromModal() : settings;
      const currentKey = fromModal ? $('apiKeySetting').value.trim() : currentApiKey();
      return signature === modelRefreshSignature(currentCfg, currentKey);
    };
    const providerName = PROVIDER_PRESETS[cfg.provider]?.name || t('providerCustom');
    updateModelRefreshButton(fromModal);
    setBottomStatus(t('refreshStart', { provider: providerName }));
    try {
      const endpoint = modelsEndpoint(cfg);
      const response = await networkFetch(endpoint, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
        headers: key ? { Authorization: `Bearer ${key}` } : {}
      }, cfg);
      if (!response.ok) throw await apiError(response);
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.toLowerCase().includes('json')) {
        throw new Error(settings.language === 'zh'
          ? '模型接口返回的不是 JSON，请检查接口或代理地址'
          : 'Model endpoint did not return JSON; check the endpoint or proxy URL');
      }
      const data = await response.json();
      const all = normalizeModelList(data);
      if (!all.length) throw new Error(t('invalidModels'));
      const merged = new Map();
      for (const m of all) merged.set(m.id, { id: m.id, name: m.name || m.id });
      const models = [...merged.values()].sort((a,b) => a.name.localeCompare(b.name));
      if (!isCurrent()) return;
      settings.providerModels[modelCacheKey(cfg)] = models;
      await saveSettings();
      if (!isCurrent()) return;
      // Keep the chosen model and any unsaved settings while replacing options.
      if (fromModal) {
        buildModelOptions($('modelSetting'), $('modelSetting').value, models);
      } else {
        buildModelOptions($('modelQuick'), settings.model, models);
        if (!$('settingsModal').classList.contains('open')) {
          buildModelOptions($('modelSetting'), settings.model, models);
        }
      }
      const message = t('refreshDone', { provider: providerName, count: models.length });
      toast(message);
      setBottomStatus(message);
    } catch (e) {
      if (!isCurrent()) return;
      setBottomStatus(`${t('refreshFallback')} · ${displayApiError(e, cfg.provider)}`);
      toast(t('refreshFallback'), 2600);
    } finally {
      if (modelRefreshRequests[context] === controller) {
        modelRefreshRequests[context] = null;
        updateModelRefreshButton(fromModal);
      }
    }
  }

  async function switchProvider(provider) {
    const previous = { ...settings };
    const preset = PROVIDER_PRESETS[provider] || PROVIDER_PRESETS.custom;
    settings.provider = provider;
    settings.apiBase = preset.endpoint;
    settings.customModel = '';
    settings.temperature = clampNumber(settings.temperature, 0, temperatureMax(provider), settings.temperature);
    if (provider === 'azai') settings.thinking = false;
    settings.model = preset.model;
    const nextModel = currentModel();
    if (shouldWarnModelSwitch(nextModel) && !confirm(t('modelSwitchWarn'))) {
      settings = previous;
      syncSettingsToUI();
      return false;
    }
    if (activeConversation?.messages?.length && activeConversation.model !== nextModel) toast(t('modelSwitchToast'), 2600);
    syncSettingsToUI();
    await saveSettings();
    if (settings.provider === provider) void refreshModels();
    return true;
  }

  function safeFileName(name) {
    return (name || 'chat').replace(/[\\/:*?"<>|]+/g, '_').slice(0,80);
  }
  function downloadJson(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function downloadText(filename, content, type = 'text/plain;charset=utf-8') {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function exportConversation(conversation = activeConversation) {
    if (!conversation) return;
    downloadJson(`az-chat-${safeFileName(conversation.title)}.json`, {
      format:'az-llm-chat/conversation-v2',
      exportedAt:nowISO(),
      conversation
    });
  }
  function exportConversationMarkdown(conversation = activeConversation) {
    if (!conversation) return;
    const locale = settings.language === 'zh' ? 'zh-CN' : undefined;
    const dateText = value => {
      if (!value) return '';
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? '' : date.toLocaleString(locale);
    };
    const lines = [
      `# ${(conversation.title || t('untitled')).replace(/[\r\n]+/g, ' ')}`,
      '',
      `- ${t('provider')}: ${PROVIDER_PRESETS[conversation.provider]?.name || conversation.provider || t('providerCustom')}`,
      `- ${t('model')}: ${conversation.model || '—'}`,
      `- ${t('updated')}: ${dateText(conversation.updatedAt) || '—'}`,
      `- Exported: ${dateText(nowISO())}`
    ];
    for (const message of conversation.messages || []) {
      const role = message.role === 'user'
        ? (settings.language === 'zh' ? '你' : 'You')
        : (settings.language === 'zh' ? '助手' : 'Assistant');
      const model = message.role === 'assistant' && message.model ? ` · ${message.model}` : '';
      lines.push('', `## ${role}${model}${message.createdAt ? ` · ${dateText(message.createdAt)}` : ''}`, '');
      if (message.reasoning) lines.push(`### ${t('thinkingContent')}`, '', message.reasoning, '');
      if (message.content) lines.push(message.content, '');
      for (const attachment of message.attachments || []) {
        const name = attachment.name || (settings.language === 'zh' ? '未命名附件' : 'Unnamed attachment');
        if (attachment.kind === 'text') {
          lines.push(`**${settings.language === 'zh' ? '文本附件' : 'Text attachment'}: ${name}**`, '', attachment.text || '', '');
        } else {
          const type = attachment.kind === 'image'
            ? (settings.language === 'zh' ? '图片附件' : 'Image attachment')
            : (settings.language === 'zh' ? '二进制附件' : 'Binary attachment');
          lines.push(`- ${type}: ${name}${attachment.size ? ` (${formatBytes(attachment.size)})` : ''}`);
        }
      }
      if (message.usage) lines.push(`_${t('tokens')}: ${message.usage.total_tokens || 0}${message.usage.estimated ? ' · estimated' : ''}_`, '');
    }
    downloadText(`az-chat-${safeFileName(conversation.title)}.md`, lines.join('\n').trimEnd() + '\n', 'text/markdown;charset=utf-8');
  }
  function exportAll() {
    downloadJson(`az-llm-chat-backup-${new Date().toISOString().slice(0,10)}.json`, {
      format:'az-llm-chat/backup-v2',
      exportedAt:nowISO(),
      conversations,
      settings:{ ...settings, apiKey:undefined, rememberKey:false }
    });
  }
  async function importJsonFile(file) {
    const payload = JSON.parse(await file.text());
    let incoming = [];
    if (/^az-llm-chat\/conversation-v[12]$/.test(payload?.format) && payload.conversation) incoming = [payload.conversation];
    else if (/^az-llm-chat\/backup-v[12]$/.test(payload?.format) && Array.isArray(payload.conversations)) incoming = payload.conversations;
    else if (Array.isArray(payload)) incoming = payload;
    else throw new Error('Unsupported backup format.');

    let count = 0;
    for (const raw of incoming) {
      if (!raw || !Array.isArray(raw.messages)) continue;
      const c = {
        id:raw.id && !conversations.some(x => x.id === raw.id) ? raw.id : uid(),
        title:String(raw.title || 'Imported chat'),
        createdAt:raw.createdAt || nowISO(),
        updatedAt:nowISO(),
        provider:raw.provider || 'custom',
        model:raw.model || '',
        messages:raw.messages.map(m => ({
          id:m.id || uid(),
          role:m.role === 'user' ? 'user' : 'assistant',
          content:String(m.content || ''),
          reasoning:String(m.reasoning || ''),
          createdAt:m.createdAt || nowISO(),
          model:m.model || undefined,
          attachments:Array.isArray(m.attachments) ? m.attachments : [],
          usage:m.usage || undefined
        }))
      };
      await idbPut(STORE_CONVERSATIONS, c);
      conversations.push(c);
      count++;
    }
    conversations.sort((a,b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    if (count) activeConversation = conversations[0];
    renderAll();
    toast(t('imported', { count }));
  }

  function maxSidebarWidth() {
    return Math.max(210, Math.min(420, window.innerWidth - 420));
  }
  function setSidebarWidth(value, remember = true) {
    const width = Math.round(Math.max(210, Math.min(maxSidebarWidth(), Number(value) || 256)));
    if (remember) settings.sidebarWidth = width;
    app.style.setProperty('--sidebar-open-width', width + 'px');
    $('sidebarResizeHandle').setAttribute('aria-valuenow', String(width));
    $('sidebarResizeHandle').setAttribute('aria-valuemax', String(maxSidebarWidth()));
  }
  function bindSidebarResize() {
    const handle = $('sidebarResizeHandle');
    let pointerId = null;
    handle.addEventListener('pointerdown', e => {
      if (e.button !== 0 || matchMedia('(max-width: 760px)').matches || settings.sidebarCollapsed) return;
      e.preventDefault();
      pointerId = e.pointerId;
      handle.setPointerCapture(pointerId);
      app.classList.add('sidebar-resizing');
      setSidebarWidth(e.clientX);
    });
    handle.addEventListener('pointermove', e => {
      if (e.pointerId === pointerId) setSidebarWidth(e.clientX);
    });
    const endResize = e => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      app.classList.remove('sidebar-resizing');
      if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId);
      saveSettings();
    };
    handle.addEventListener('pointerup', endResize);
    handle.addEventListener('pointercancel', endResize);
    handle.addEventListener('keydown', e => {
      const step = e.shiftKey ? 30 : 10;
      const next = e.key === 'ArrowLeft' ? settings.sidebarWidth - step
        : e.key === 'ArrowRight' ? settings.sidebarWidth + step
        : e.key === 'Home' ? 210
        : e.key === 'End' ? maxSidebarWidth() : null;
      if (next === null) return;
      e.preventDefault();
      setSidebarWidth(next);
      saveSettings();
    });
    window.addEventListener('resize', () => setSidebarWidth(settings.sidebarWidth, false));
  }
  function closeQuickPanel() {
    const restoreFocus = $('quickPanel').contains(document.activeElement);
    $('quickPanel').classList.remove('open');
    $('quickPanel').setAttribute('aria-hidden', 'true');
    $('moreBtn').setAttribute('aria-expanded', 'false');
    if (restoreFocus) $('moreBtn').focus();
  }
  function updateSidebarControl() {
    const mobile = matchMedia('(max-width: 760px)').matches;
    const open = mobile ? $('historyPanel').classList.contains('drawer-open') : !settings.sidebarCollapsed;
    $('toggleSidebarBtn').setAttribute('aria-label', t('hideSidebar'));
    $('toggleSidebarBtn').setAttribute('title', t('hideSidebar'));
    $('toggleSidebarBtn').setAttribute('aria-expanded', String(open));
    $('showSidebarBtn').textContent = t('showSidebar');
    $('showSidebarBtn').hidden = open;
    $('showSidebarBtn').setAttribute('aria-expanded', String(open));
    $('modelQuick').setAttribute('aria-label', t('model'));
  }
  async function toggleSidebar() {
    if (matchMedia('(max-width: 760px)').matches) {
      $('historyPanel').classList.toggle('drawer-open');
    } else {
      settings.sidebarCollapsed = !settings.sidebarCollapsed;
      app.classList.toggle('sidebar-collapsed', settings.sidebarCollapsed);
      await saveSettings();
    }
    updateSidebarControl();
  }

  function bindEvents() {
    bindSidebarResize();
    $('settingsBtn').addEventListener('click', openSettings);
    $('newChatTopBtn').addEventListener('click', createNewChat);
    $('toggleSidebarBtn').addEventListener('click', toggleSidebar);
    $('showSidebarBtn').addEventListener('click', toggleSidebar);
    $('menuNewChatBtn').addEventListener('click', createNewChat);
    $('quickPanel').addEventListener('click', e => {
      const action = e.target.closest('.quick-actions button');
      if (!action) return;
      closeQuickPanel();
      if (action.id === 'showSidebarBtn' && matchMedia('(max-width: 760px)').matches
          && $('historyPanel').classList.contains('drawer-open')) {
        $('historySearch').focus();
      }
    });
    $('settingsClose').addEventListener('click', closeSettings);
    $('settingsCancelBtn').addEventListener('click', closeSettings);
    $('saveSettingsBtn').addEventListener('click', saveSettingsFromModal);
    $('testApiBtn').addEventListener('click', testApi);
    $('newChatBtn').addEventListener('click', createNewChat);
    $('sendBtn').addEventListener('click', sendMessage);
    $('stopBtn').addEventListener('click', stopGeneration);
    $('clearDraftBtn').addEventListener('click', () => {
      promptInput.value = '';
      pendingAttachments = [];
      renderPendingAttachments();
      updateTokenHint();
      promptInput.focus();
    });
    $('attachBtn').addEventListener('click', () => $('attachmentInput').click());
    $('thinkingBtn').addEventListener('click', async () => {
      settings.thinking = !settings.thinking;
      await saveSettings();
      syncSettingsToUI();
    });
    $('attachmentInput').addEventListener('change', async e => {
      await addFiles(e.target.files);
      e.target.value = '';
    });
    $('renameBtn').addEventListener('click', () => openRename(activeConversation));
    $('renameCancel').addEventListener('click', closeRename);
    $('renameSave').addEventListener('click', saveRename);
    $('renameInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') saveRename();
      if (e.key === 'Escape') closeRename();
    });
    $('historySearch').addEventListener('input', renderHistory);
    $('exportOneBtn').addEventListener('click', () => exportConversation(activeConversation));
    $('exportMarkdownBtn').addEventListener('click', () => exportConversationMarkdown(activeConversation));
    $('exportAllBtn').addEventListener('click', exportAll);
    $('importBtn').addEventListener('click', () => $('importFile').click());
    $('importFile').addEventListener('change', async e => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      try { await importJsonFile(file); }
      catch (err) { toast(t('importFailed')); setBottomStatus(`${t('importFailed')} · ${err.message}`); }
    });
    $('refreshModelsBtn').addEventListener('click', () => refreshModels());
    $('refreshModelsSettingBtn').addEventListener('click', () => refreshModels({ fromModal: true }));

    $('providerQuick').addEventListener('change', async e => {
      const old = settings.provider;
      if (!await switchProvider(e.target.value)) e.target.value = old;
    });
    $('modelQuick').addEventListener('change', async e => {
      const oldModel = currentModel();
      const next = e.target.value;
      if (!confirmModelSwitch(next)) {
        e.target.value = settings.model;
        return;
      }
      settings.model = next;
      settings.customModel = '';
      await saveSettings();
      syncSettingsToUI();
      if (oldModel !== next && activeConversation?.messages?.length) toast(t('modelSwitchToast'), 2600);
    });
    $('temperatureQuick').addEventListener('change', async e => {
      settings.temperature = clampNumber(e.target.value, 0, temperatureMax(settings.provider), settings.temperature);
      await saveSettings(); syncSettingsToUI();
    });
    $('streamQuick').addEventListener('change', async e => {
      settings.stream = e.target.value === 'true';
      await saveSettings(); syncSettingsToUI();
    });
    $('languageQuick').addEventListener('change', async e => {
      settings.language = e.target.value;
      await saveSettings();
      applyLanguage();
      renderAll();
    });
    $('themeBtn').addEventListener('click', async () => {
      settings.theme = isDarkTheme() ? 'light' : 'dark';
      applyTheme();
      $('themeSetting').value = settings.theme;
      await saveSettings();
      applyLanguage();
    });

    $('moreBtn').addEventListener('click', () => {
      const open = !$('quickPanel').classList.contains('open');
      $('quickPanel').classList.toggle('open', open);
      $('quickPanel').setAttribute('aria-hidden', String(!open));
      $('moreBtn').setAttribute('aria-expanded', String(open));
    });

    $('providerSetting').addEventListener('change', e => {
      const provider = e.target.value;
      const preset = PROVIDER_PRESETS[provider] || PROVIDER_PRESETS.custom;
      $('apiBaseSetting').value = preset.endpoint;
      $('customModelSetting').value = '';
      updateTemperatureBounds(provider, false);
      $('temperatureSetting').value = String(clampNumber($('temperatureSetting').value, 0, temperatureMax(provider), settings.temperature));
      updateSettingsProviderHelp(provider);
      const candidate = collectSettingsFromModal();
      buildModelOptions($('modelSetting'), preset.model, cachedModels(candidate));
      void refreshModels({ fromModal: true });
    });
    $('systemPromptSetting').addEventListener('input', updateSystemPromptCount);
    $('clearSystemPromptBtn').addEventListener('click', () => {
      $('systemPromptSetting').value = '';
      updateSystemPromptCount();
      $('systemPromptSetting').focus();
    });
    $('languageSetting').addEventListener('change', e => {
      const previous = settings.language;
      settings.language = e.target.value;
      applyLanguage();
      settings.language = previous;
      $('languageSetting').value = e.target.value;
    });

    promptInput.addEventListener('input', updateTokenHint);
    promptInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        sendMessage();
      }
    });
    promptInput.addEventListener('paste', e => {
      const files = [...(e.clipboardData?.files || [])];
      if (files.length) addFiles(files);
    });

    const chatPanel = document.querySelector('.chat-panel');
    chatPanel.addEventListener('dragenter', e => {
      if (![...(e.dataTransfer?.types || [])].includes('Files')) return;
      e.preventDefault(); dragDepth++; chatPanel.classList.add('dragging');
    });
    chatPanel.addEventListener('dragover', e => {
      if (![...(e.dataTransfer?.types || [])].includes('Files')) return;
      e.preventDefault(); e.dataTransfer.dropEffect = 'copy';
    });
    chatPanel.addEventListener('dragleave', e => {
      if (![...(e.dataTransfer?.types || [])].includes('Files')) return;
      e.preventDefault(); dragDepth = Math.max(0, dragDepth - 1);
      if (!dragDepth) chatPanel.classList.remove('dragging');
    });
    chatPanel.addEventListener('drop', e => {
      e.preventDefault(); dragDepth = 0; chatPanel.classList.remove('dragging');
      addFiles(e.dataTransfer?.files);
    });

    matchMedia('(max-width: 760px)').addEventListener('change', () => {
      $('historyPanel').classList.remove('drawer-open', 'mobile-open');
      updateSidebarControl();
    });

    document.addEventListener('click', e => {
      if (!$('quickPanel').classList.contains('open')) return;
      if ($('quickPanel').contains(e.target) || $('moreBtn').contains(e.target)) return;
      closeQuickPanel();
    });

    document.addEventListener('click', async e => {
      const messageButton = e.target.closest('.copy-message');
      if (messageButton) {
        const index = Number(messageButton.dataset.messageIndex);
        const message = activeConversation?.messages?.[index];
        if (!message) return;
        try {
          await writeClipboard(message.content || '');
          messageButton.textContent = t('copied');
          setTimeout(() => { messageButton.textContent = t('copyMessage'); }, 1500);
        } catch { toast(t('copyFailed')); }
        return;
      }
      const button = e.target.closest('.copy-code');
      if (!button) return;
      const code = button.closest('.code-block')?.querySelector('code')?.textContent || '';
      try {
        await writeClipboard(code);
        button.textContent = t('copied');
        setTimeout(() => { button.textContent = settings.language === 'zh' ? '复制' : 'Copy'; }, 1500);
      } catch { toast(t('copyFailed')); }
    });

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeSettings(); closeRename();
        $('historyPanel').classList.remove('drawer-open', 'mobile-open');
        closeQuickPanel();
        updateSidebarControl();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (matchMedia('(max-width: 760px)').matches) {
          $('historyPanel').classList.add('drawer-open');
        } else if (settings.sidebarCollapsed) {
          settings.sidebarCollapsed = false;
          app.classList.remove('sidebar-collapsed');
          saveSettings();
        }
        updateSidebarControl();
        $('historySearch').focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault(); openSettings();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault(); createNewChat();
      }
    });
  }

  async function init() {
    try {
      db = await openDB();
      await loadSettings();
      await loadConversations();
      bindEvents();
      matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (settings.theme === 'system') { applyTheme(); applyLanguage(); }
      });
      renderAll();
      applyLanguage();
      setBottomStatus(t('ready'));
      if (document.activeElement === document.body || document.activeElement === promptInput) {
        promptInput.focus({ preventScroll: true });
      }
    } catch (e) {
      console.error(e);
      document.body.innerHTML = `<pre style="white-space:pre-wrap;padding:20px;font-family:serif">Failed to initialize local database:\n${escapeHtml(e.message || e)}</pre>`;
    }
  }

  init();

  if (IS_WEB_PAGE && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js', { updateViaCache: 'none' })
        .catch(error => console.warn('Static asset cache unavailable', error));
    }, { once: true });
  }
})();
