/* 投放系统 · 推广 / TikTok · 创建广告二级页 */
(function () {
  'use strict';

  var UI = window.ProductUI;
  if (!UI) return;

  var $ = UI.$;
  var escapeHtml = UI.escapeHtml;
  var ICON_BASE = /\/share-site\//.test(location.pathname) ? '../素材/平台图标/' : '素材/平台图标/';
  var TT_ICON = ICON_BASE + 'TikTok.png';
  var CREATE_AD_DRAFT_KEY = 'wonder_ads_tiktok_create_ad_draft_v1';
  var PENDING_TOAST_KEY = 'wonder_ads_pending_toast';
  var CREATE_AD_DRAFT_FIELDS = [
    'productId', 'productName', 'clientKey', 'objective', 'promoType', 'setup',
    'selectedAccountIds', 'authByAccount',
    'campaignName', 'budgetOptimize', 'budgetType', 'budget',
    'adGroupName', 'deliveryPromoType', 'miniId', 'miniName',
    'bidBudgetType', 'bidBudget', 'optGoal', 'optEvent', 'bidStrategy', 'vboWindow', 'targetRoas',
    'auctionStrategy', 'clickAttribution', 'eventStat', 'billingEvent', 'deliverySpeed',
    'startMode', 'startAt', 'endMode', 'endAt', 'scheduleMode', 'scheduleSlots',
    'audienceRegions', 'audienceLanguages', 'audienceGender', 'audienceMinAge',
    'placementVersions', 'placementComment', 'placementDownload', 'placementShare',
    'adName', 'publishMode', 'ttIdentityId', 'ttIdentityByAccount', 'ctaMode', 'ctaByAccount',
    'adTitles', 'landingUrl', 'landingManual',
    'creativeAlloc', 'creativePerGroup', 'creativeGroups', 'activeCreativeGroupId', 'creativeGroupSeq', 'creativeAssignMode', 'splitDimension',
    'currentStep'
  ];
  var createAdTaskSeq = Date.now();

  function nextCreateAdTaskId() {
    createAdTaskSeq += 1;
    return String(createAdTaskSeq);
  }

  var STEPS = [
    { key: 'basic', label: '基础设置' },
    { key: 'campaign', label: '推广系列' },
    { key: 'delivery', label: '投放内容' },
    { key: 'bid', label: '出价和预算' },
    { key: 'audience', label: '受众定向' },
    { key: 'placement', label: '广告位' },
    { key: 'ad', label: '广告设置' },
    { key: 'creative', label: '创意素材' }
  ];

  /* 与 管理/产品列表/小游戏、推广页创建弹窗一致 */
  var MINIS_SEED = [
    ['44760363', 'Fun Overload'],
    ['44760156', 'Mind Block'],
    ['44760356', 'Brainy Find'],
    ['44760195', 'Life Story'],
    ['44760190', 'Brain Mix'],
    ['44758636', 'Flow Mix'],
    ['44759962', 'Life Choice'],
    ['44759891', 'Life Path'],
    ['44760174', 'Brainy Breakout'],
    ['44760164', 'Mind Escape'],
    ['44759426', 'Flow Master'],
    ['44759081', 'Brainy Win'],
    ['44758892', 'Path Flow'],
    ['44760064', 'Wukong Out'],
    ['44759538', 'Help Wukong'],
    ['44758558', 'Draw Rescue Wukong'],
    ['44759245', 'Save Wukong'],
    ['44760080', 'Tidy Hotpot'],
    ['44760005', 'Food Sort'],
    ['44759186', 'Hotpot Master'],
    ['44758887', 'Hyper Desh'],
    ['44760172', 'Sort Coin'],
    ['44759899', 'Sort Coin Master'],
    ['44758632', 'Piggy Coin Sort'],
    ['44759913', 'Sand Ball Drop'],
    ['44759682', 'Ball Sand'],
    ['44759628', 'Ball Run'],
    ['44759541', 'Brain Queen'],
    ['44758400', 'Brain Power Queen'],
    ['44758366', 'Eye Track'],
    ['44760215', '言葉を探す'],
    ['44759979', '文字の宝探し！'],
    ['44759157', '文字の奥に小文字'],
    ['44760160', '文字の中に文字!'],
    ['44760022', 'Count Sprint'],
    ['44759917', 'Digit Merge'],
    ['44759513', 'Diamond Match'],
    ['44758889', 'Diamond ASMR'],
    ['44758476', 'Gems Color Puzzle'],
    ['44759278', 'Brain Power King'],
    ['44760120', 'Word Dig'],
    ['44759570', 'Cute Gun Bump'],
    ['44758408', 'Word Player'],
    ['44759961', 'Card Group'],
    ['44759636', 'Dual Gun Clash'],
    ['44758881', 'Card Assort'],
    ['44759773', 'Tile Stack!'],
    ['44758456', 'Sort Stack'],
    ['44760310', 'Mad Moto'],
    ['44760203', 'Color Tetris']
  ];

  /* 对齐 管理/广告账户/TikTok 授权用户示例 */
  var AUTH_USERS = [
    { name: 'Ilxiaofeng', id: '7597700139473486861' },
    { name: 'BlueVision_wonder', id: '7597700139473486862' },
    { name: 'Sino_wonder', id: '7597700139473486863' },
    { name: 'user7183732511561', id: '7597700139473486864' },
    { name: 'TecDo_choles.lin', id: '7597700139473486865' },
    { name: 'user5630138616128', id: '7597700139473486866' },
    { name: 'tt_media_buyer', id: '7597700139473486867' },
    { name: 'OceanEngine_ops', id: '7597700139473486868' },
    { name: 'playable_admin', id: '7597700139473486869' },
    { name: 'user902184773001', id: '7597700139473486870' },
    { name: 'TecDo_finance.wu', id: '7597700139473486871' },
    { name: 'wonder_ads_bot', id: '7597700139473486872' }
  ];

  var KEY_CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';
  var ACCOUNTS_PER_PRODUCT = 10;

  function qs(name) {
    try {
      return new URLSearchParams(window.location.search).get(name) || '';
    } catch (err) {
      return '';
    }
  }

  function sampleClientKey(productId) {
    var n = parseInt(productId, 10) || 1;
    var key = '';
    var i;
    for (i = 0; i < 16; i += 1) {
      n = (Math.imul(n, 1664525) + 1013904223 + i) >>> 0;
      key += KEY_CHARS[n % KEY_CHARS.length];
    }
    return key;
  }

  function productAbbr(name) {
    var words = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return 'MINI';
    if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
    return words.map(function (w) { return w.charAt(0); }).join('').slice(0, 4).toUpperCase();
  }

  function platformIconHtml() {
    return '<span class="select-option-icon"><img src="' + TT_ICON + '" alt="" /></span>';
  }

  function buildProducts() {
    return MINIS_SEED.map(function (item) {
      return {
        productId: item[0],
        name: item[1],
        platform: 'TikTok Minis',
        clientKey: sampleClientKey(item[0])
      };
    });
  }

  function findAuthUser(name) {
    for (var i = 0; i < AUTH_USERS.length; i += 1) {
      if (AUTH_USERS[i].name === name) return AUTH_USERS[i];
    }
    return null;
  }

  /** 同产品下授权用户通常一致；账户名含 BV → BlueVision_wonder */
  function pickAuthGrants(accountName, seed) {
    var primaryName = /BV/i.test(String(accountName || '')) ? 'BlueVision_wonder' : AUTH_USERS[seed % AUTH_USERS.length].name;
    var primary = findAuthUser(primaryName) || AUTH_USERS[0];
    var grants = [{ name: primary.name, id: primary.id }];
    var extras = [AUTH_USERS[(seed + 2) % AUTH_USERS.length], AUTH_USERS[(seed + 5) % AUTH_USERS.length]];
    extras.forEach(function (user) {
      if (!user || user.name === primary.name) return;
      if (grants.some(function (g) { return g.name === user.name; })) return;
      grants.push({ name: user.name, id: user.id });
    });
    return { grants: grants, auth_user: primary.name };
  }

  /* 固定 ID，便于多行名称/ID 筛选联调（任意产品下同一套） */
  var SAMPLE_ACCOUNT_IDS = [
    '7341008810000001',
    '7341008810000002',
    '7341008810000003',
    '7341008810000004',
    '7341008810000005',
    '7341008810000006',
    '7341008810000007',
    '7341008810000008',
    '7341008810000009',
    '7341008810000010'
  ];

  /** 关联产品选定后生成可投放广告账户（ID 稳定） */
  function generateAccountsForProduct(product, count) {
    if (!product) return [];
    var abbr = productAbbr(product.name);
    var rows = [];
    var n = count || ACCOUNTS_PER_PRODUCT;
    var i;
    for (i = 0; i < n; i += 1) {
      var optimizer = String.fromCharCode(65 + (i % 12));
      var serial = String(10 + i);
      var id = SAMPLE_ACCOUNT_IDS[i] || ('73410088100000' + String(11 + i));
      var advertiserName = [abbr, 'TT', 'BV', 'TM', 'YH' + optimizer, serial].join('_');
      var auth = pickAuthGrants(advertiserName, i);
      rows.push({
        advertiser_id: id,
        advertiser_name: advertiserName,
        product_id: product.productId,
        product_name: product.name,
        client_key: product.clientKey,
        auth_grants: auth.grants,
        auth_user: auth.auth_user
      });
    }
    return rows;
  }

  var PRODUCTS = buildProducts();

  var BUDGET_MIN = 20;
  var BUDGET_MAX = 10000000;

  var state = {
    mode: qs('mode') || 'create',
    taskId: nextCreateAdTaskId(),
    productId: qs('productId'),
    productName: qs('productName'),
    clientKey: qs('clientKey'),
    objective: 'TikTok 即时增长',
    promoType: '小游戏',
    setup: '升级版Smart+ 推广系列',
    selectedAccountIds: [],
    authByAccount: {},
    availableAccounts: [],
    currentStep: 'basic',
    editingBasic: false,
    campaignName: '{YYYYMMDD}_{产品全称}_minigame_VBO_troas_{地区组}_{序号}',
    budgetOptimize: true,
    budgetType: '日预算',
    budget: '',
    adGroupName: '{YYYYMMDD}_{序号}',
    deliveryPromoType: '小游戏',
    miniId: '',
    miniName: '',
    bidBudgetType: '日预算',
    bidBudget: '',
    optGoal: '价值',
    optEvent: '广告收入价值',
    bidStrategy: '目标ROAS',
    vboWindow: 'D0',
    targetRoas: '',
    auctionStrategy: '最大投放量',
    clickAttribution: '30 天',
    eventStat: '每一次',
    billingEvent: 'oCPM',
    deliverySpeed: '标准',
    startMode: '立即开始',
    startAt: '',
    endMode: '长期投放',
    endAt: '',
    scheduleMode: '全天投放',
    scheduleSlots: null,
    audienceRegions: [],
    audienceLanguages: [],
    audienceGender: '不限',
    audienceMinAge: '18',
    placementVersions: ['TikTok'],
    placementComment: true,
    placementDownload: false,
    placementShare: true,
    adName: '{YYYYMMDD}_{序号}',
    publishMode: '统一分配',
    ttIdentityId: '',
    ttIdentityByAccount: {},
    ctaMode: '动态优选',
    ctaByAccount: {},
    adTitles: [''],
    landingUrl: '',
    landingManual: false,
    creativeAlloc: '账户复用',
    creativePerGroup: 10,
    creativeGroups: [],
    activeCreativeGroupId: '',
    creativeGroupSeq: 1,
    /** order：按勾选顺序；shuffle：随机分配 */
    creativeAssignMode: 'order',
    splitDimension: '推广系列'
  };

  var CREATIVE_MAX_PER_GROUP = 50;
  var CREATIVE_MAX_GROUPS = 100;

  var PLACEMENT_VERSION_OPTIONS = ['TikTok'];
  var placementVersionMulti = null;

  var CTA_OPTIONS = ['玩一局', '立即播放', '无需下载', '立即畅玩', '一键播放'];
  var AD_COPY_MAX = 5;
  var AD_COPY_UNITS_MAX = 100;
  var AD_COPY_REMOVE_ICON =
    '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 3l6 6M9 3L3 9"/></svg>';
  var AD_COPY_LINE_PLACEHOLDER = '单行限制 1-100 字符，添加多行请回车换行';
  var AD_COPY_LINE_CLEAR =
    '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l6 6M9 3L3 9"/></svg>';
  /* 与文案库 tiktok-copy.js 示例数据对齐 */
  var AD_COPY_PACKS = [
    { id: 'p1', name: '英文促活包', texts: ['Play free and beat every level today', 'Sort the coins and win big rewards', 'Tap to start your next win'], remark: '投放英语区', creator: '用户A', createdAt: '2026-11-16 10:20:00' },
    { id: 'p2', name: '日文开玩包', texts: ['今すぐ無料で遊ぼう', 'レベルをクリアして報酬をゲット'], remark: '', creator: '用户B', createdAt: '2026-11-15 18:06:12' },
    { id: 'p3', name: '中文下载包', texts: ['免费下载，马上开玩', '通关就送钻石，快来挑战'], remark: '短剧引流', creator: '用户A', createdAt: '2026-11-14 09:30:00' },
    { id: 'p4', name: '混合测试包', texts: ['Download now！限时奖励'], remark: '中英混合', creator: '用户C', createdAt: '2026-11-12 21:15:44' },
    { id: 'p5', name: '满额标题包', texts: ['Play free and beat every level today', '免费下载，马上开玩', 'Sort the coins and win big rewards', 'New levels every Friday', 'Clear the stage in one try'], remark: '已到五条上限', creator: '用户B', createdAt: '2026-11-10 11:00:00' },
    { id: 'p6', name: '日文挑战包', texts: ['本日限定、ダイヤ2倍', '失敗しても、もう一回'], remark: '', creator: '用户C', createdAt: '2026-11-08 16:42:18' }
  ];
  var AD_COPY_LIBRARY = [
    { id: 'c1', text: 'Play free and beat every level today', remark: '英语区促活', creator: '用户A', createdAt: '2026-11-16 10:12:08' },
    { id: 'c2', text: '今すぐ無料で遊ぼう', remark: '日文开玩', creator: '用户B', createdAt: '2026-11-15 18:06:12' },
    { id: 'c3', text: '免费下载，马上开玩', remark: '短剧引流', creator: '用户A', createdAt: '2026-11-14 09:30:00' },
    { id: 'c4', text: 'Download now！限时奖励', remark: '中英混合', creator: '用户C', createdAt: '2026-11-13 14:22:41' },
    { id: 'c5', text: 'Sort the coins and win big rewards', remark: '', creator: '用户A', createdAt: '2026-11-12 11:08:33' },
    { id: 'c6', text: 'レベルをクリアして報酬をゲット', remark: '日文奖励', creator: '用户B', createdAt: '2026-11-11 20:16:05' },
    { id: 'c7', text: 'New levels every Friday', remark: '每周更新', creator: '用户C', createdAt: '2026-11-10 08:45:19' },
    { id: 'c8', text: '通关就送钻石，快来挑战', remark: '', creator: '用户A', createdAt: '2026-11-09 16:02:57' },
    { id: 'c9', text: 'Tap to start your next win', remark: '英语区按钮', creator: '用户B', createdAt: '2026-11-08 13:27:40' },
    { id: 'c10', text: '本日限定、ダイヤ2倍', remark: '日文限时', creator: '用户C', createdAt: '2026-11-07 19:51:22' },
    { id: 'c11', text: 'Clear the stage in one try', remark: '', creator: '用户A', createdAt: '2026-11-06 10:33:15' },
    { id: 'c12', text: '失敗しても、もう一回', remark: '日文重试', creator: '用户B', createdAt: '2026-11-05 15:18:46' }
  ];
  var adCopyPackDraftId = '';
  var adCopyPickDraftIds = [];
  var adCopyPackExpanded = {};
  var adPackDraft = { name: '', creators: [] };
  var adPackApplied = { name: '', creators: [] };
  var adPackPage = 1;
  var adPackPageSize = 20;
  var adPickDraft = { text: '', creators: [] };
  var adPickApplied = { text: '', creators: [] };
  var adPickPage = 1;
  var adPickPageSize = 20;
  var adPackCreatorMulti = null;
  var adPickCreatorMulti = null;
  var adCopyBatchEditor = null;
  /** 选文案抽屉 Tab：copy | pack */
  var adCopyLibTab = 'copy';
  var TT_IDENTITY_OPTIONS = [
    { name: 'braintest_1Q', id: '7592835336963948551' },
    { name: 'braintest_2A', id: '7592835336963948552' },
    { name: 'flowmix_3K', id: '7592835336963948553' },
    { name: 'mindblock_4P', id: '7592835336963948554' },
    { name: 'wukong_out_5', id: '7592835336963948555' },
    { name: 'hotpot_sort_6', id: '7592835336963948556' },
    { name: 'gems_puzzle_7', id: '7592835336963948557' },
    { name: 'word_dig_8M', id: '7592835336963948558' }
  ];
  var adTtUnifiedApi = null;
  var activeCtaAccountId = '';

  var SCHEDULE_DAYS = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
  var SCHEDULE_SLOTS_PER_DAY = 48; /* 每小时 2 格 */
  var bidStartPicker = null;
  var bidEndPicker = null;

  /* 受众定向 · 地区组 > 地区 > 已选项，默认全选 */
  var REGION_GROUPS = [
    { id: 'US', label: '美国 (US)', children: ['美国 (US)'] },
    { id: 'EU', label: '欧盟 (EU)', children: ['德国 (DE)', '英国 (GB)', '法国 (FR)'] },
    {
      id: 'ROW',
      label: '其他 (ROW)',
      children: [
        '巴西 (BR)', '埃及 (EG)', '印度尼西亚 (ID)', '伊拉克 (IQ)', '日本 (JP)', '韩国 (KR)',
        '缅甸 (MM)', '墨西哥 (MX)', '马来西亚 (MY)', '菲律宾 (PH)', '巴基斯坦 (PK)',
        '沙特阿拉伯 (SA)', '泰国 (TH)', '土耳其 (TR)'
      ]
    }
  ];
  var REGION_OPTIONS = flattenRegionOptions(REGION_GROUPS);

  function flattenRegionOptions(groups) {
    var out = [];
    (groups || []).forEach(function (group) {
      (group.children || []).forEach(function (name) {
        if (out.indexOf(name) === -1) out.push(name);
      });
    });
    return out;
  }
  var LANGUAGE_OPTIONS = [
    '英语', '日语', '韩语', '简体中文', '繁体中文', '印地语', '马来语', '葡萄牙语', '俄语', '泰语',
    '越南语', '古吉拉特语', '马拉地语', '卡纳达语', '孟加拉语', '奥里亚语', '泰米尔语', '马拉雅拉姆语', '旁遮普语', '泰卢固语',
    '法语', '德语', '意大利语', '波兰语', '西班牙语', '瑞典语', '土耳其语', '乌克兰语', '阿拉伯语', '捷克语',
    '希腊语', '匈牙利语', '印尼语', '罗马尼亚语', '阿萨姆语', '哈里亚纳语', '拉贾斯坦语', '比哈尔语'
  ];
  var CASCADE_ARROW = '<svg class="cascade-option__arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4.5 3L7.5 6L4.5 9"/></svg>';
  var CLEAR_ICON = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l6 6M9 3L3 9"/></svg>';
  var audienceRegionApi = null;
  var audienceLangMulti = null;

  function allRegions() {
    return REGION_OPTIONS.slice();
  }

  /* 当前小游戏支持的地区。各小游戏目前都是全部地区。 */
  function regionsForCurrentMini() {
    return allRegions();
  }

  function regionCode(label) {
    var matched = String(label || '').match(/\(([A-Z]{2})\)/);
    return matched ? matched[1] : '';
  }

  function createEmptySchedule() {
    var rows = [];
    var d;
    for (d = 0; d < 7; d += 1) {
      var slots = [];
      var s;
      for (s = 0; s < SCHEDULE_SLOTS_PER_DAY; s += 1) slots.push(false);
      rows.push(slots);
    }
    return rows;
  }

  function ensureScheduleSlots() {
    if (!state.scheduleSlots || !state.scheduleSlots[0] || state.scheduleSlots[0].length !== SCHEDULE_SLOTS_PER_DAY) {
      state.scheduleSlots = createEmptySchedule();
    }
    return state.scheduleSlots;
  }


  function findProduct(productId) {
    for (var i = 0; i < PRODUCTS.length; i += 1) {
      if (String(PRODUCTS[i].productId) === String(productId)) return PRODUCTS[i];
    }
    return null;
  }

  function accountsForProduct() {
    return state.availableAccounts.slice();
  }

  function findAccount(id) {
    for (var i = 0; i < state.availableAccounts.length; i += 1) {
      if (state.availableAccounts[i].advertiser_id === id) return state.availableAccounts[i];
    }
    return null;
  }

  function readCreateAdDraft() {
    try {
      var raw = localStorage.getItem(CREATE_AD_DRAFT_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      return data && data.state ? data : null;
    } catch (err) {
      return null;
    }
  }

  function buildCreateAdDraftPayload() {
    var snapshot = {};
    CREATE_AD_DRAFT_FIELDS.forEach(function (key) {
      snapshot[key] = state[key];
    });
    return {
      savedAt: Date.now(),
      state: JSON.parse(JSON.stringify(snapshot))
    };
  }

  function saveCreateAdDraft() {
    try {
      localStorage.setItem(CREATE_AD_DRAFT_KEY, JSON.stringify(buildCreateAdDraftPayload()));
      return true;
    } catch (err) {
      return false;
    }
  }

  function queuePendingToast(text, type) {
    try {
      localStorage.setItem(PENDING_TOAST_KEY, JSON.stringify({
        text: String(text || ''),
        type: type || 'success',
        ts: Date.now()
      }));
    } catch (err) { /* ignore */ }
  }

  function applyCreateAdDraftState(saved) {
    if (!saved || !saved.state) return false;
    var data = saved.state;
    CREATE_AD_DRAFT_FIELDS.forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(data, key)) state[key] = data[key];
    });
    var product = findProduct(state.productId);
    if (product) {
      state.productName = product.name;
      state.clientKey = product.clientKey;
      state.availableAccounts = generateAccountsForProduct(product, ACCOUNTS_PER_PRODUCT);
    } else {
      state.availableAccounts = [];
    }
    if (!Array.isArray(state.selectedAccountIds)) state.selectedAccountIds = [];
    if (!state.authByAccount || typeof state.authByAccount !== 'object') state.authByAccount = {};
    if (!Array.isArray(state.adTitles) || !state.adTitles.length) state.adTitles = [''];
    if (!Array.isArray(state.creativeGroups)) state.creativeGroups = [];
    if (!Array.isArray(state.audienceRegions)) {
      state.audienceRegions = allRegions();
    } else {
      var regionKnown = state.audienceRegions.filter(function (item) {
        return REGION_OPTIONS.indexOf(item) >= 0;
      });
      state.audienceRegions = state.audienceRegions.length && !regionKnown.length
        ? allRegions()
        : regionKnown;
    }
    if (!Array.isArray(state.audienceLanguages)) state.audienceLanguages = [];
    state.audienceLanguages = state.audienceLanguages.filter(function (name) {
      return LANGUAGE_OPTIONS.indexOf(name) >= 0;
    });

    if (!Array.isArray(state.placementVersions)) {
      state.placementVersions = ['TikTok'];
    } else {
      state.placementVersions = state.placementVersions.filter(function (name) {
        return PLACEMENT_VERSION_OPTIONS.indexOf(name) >= 0;
      });
    }
    ensureScheduleSlots();
    return true;
  }

  function syncCreateAdDraftUi() {
    renderProductReadonly();
    syncCardSegs();
    if (accountMulti) accountMulti.render();
    syncAccountLabel();
    renderAuthTable();
    syncCampaignForm();
    var deliveryName = $('deliveryAdGroupName');
    if (deliveryName) deliveryName.value = state.adGroupName || '';
    syncNameTokenTags('deliveryAdGroupName');
    syncSegValue('deliveryPromoTypeSeg', state.deliveryPromoType || '小游戏');
    if (deliveryMiniApi) {
      deliveryMiniApi.setValue(state.miniId || '');
      if (typeof deliveryMiniApi.render === 'function') deliveryMiniApi.render();
    }
    syncBidForm();
    if (audienceRegionApi) audienceRegionApi.render();
    if (audienceLangMulti) audienceLangMulti.render();
    syncSegValue('audienceGenderSeg', state.audienceGender || '不限');
    syncSegValue('audienceAgeSeg', state.audienceMinAge || '18');
    syncPlacementForm();
    ensureAdMapsForAccounts();
    syncAdForm();
    renderCreativeCard();
    if (splitDimApi) splitDimApi.syncLabel(state.splitDimension || '推广系列');
    renderSplitRules();
    setStep(state.currentStep || 'basic', { smooth: false });
  }

  function restoreCreateAdDraft() {
    var saved = readCreateAdDraft();
    if (!applyCreateAdDraftState(saved)) return false;
    syncCreateAdDraftUi();
    return true;
  }

  function initFromQuery() {
    var product = findProduct(state.productId);
    if (product) {
      state.productName = product.name;
      state.clientKey = product.clientKey;
    } else if (state.productName && !state.clientKey) {
      for (var i = 0; i < PRODUCTS.length; i += 1) {
        if (PRODUCTS[i].name === state.productName) {
          product = PRODUCTS[i];
          state.productId = product.productId;
          state.clientKey = product.clientKey;
          break;
        }
      }
    } else {
      product = findProduct(state.productId);
    }

    state.selectedAccountIds = [];
    state.authByAccount = {};
    state.availableAccounts = product
      ? generateAccountsForProduct(product, ACCOUNTS_PER_PRODUCT)
      : [];
  }

  function parseAccountKeywords(raw) {
    /* 与推广列表一致：换行 / 逗号 / 分号 / 空白均可分隔（单行 input 粘贴多行会变空格） */
    return String(raw || '')
      .split(/[\n\r,，;；\s]+/)
      .map(function (s) { return s.trim().toLowerCase(); })
      .filter(Boolean);
  }

  function accountMatchesKeyword(row, keywords) {
    if (!keywords.length) return true;
    var name = String(row.advertiser_name || '').toLowerCase();
    var id = String(row.advertiser_id || '').toLowerCase();
    return keywords.some(function (kw) {
      return name.indexOf(kw) >= 0 || id.indexOf(kw) >= 0;
    });
  }

  function renderProductReadonly() {
    var el = $('basicProductReadonly');
    if (!el) return;
    if (!state.productName) {
      el.classList.add('is-empty');
      el.innerHTML = '<span class="muted">-</span>';
      return;
    }
    el.classList.remove('is-empty');
    el.innerHTML = platformIconHtml() + '<span title="' + escapeHtml(state.productName) + '">' + escapeHtml(state.productName) + '</span>';
  }

  function formatAccountTriggerLabel(selected) {
    var n = (selected || []).length;
    if (!n) return '<span class="muted">请选择</span>';
    return '已选 ' + n + ' 个';
  }

  function syncAccountLabel() {
    var wrap = $('createAccountWrap');
    var label = $('createAccountLabel');
    var selected = state.selectedAccountIds || [];
    if (label) label.innerHTML = formatAccountTriggerLabel(selected);
    if (wrap) wrap.classList.toggle('has-value', selected.length > 0);
    var count = $('createAccountCount');
    if (count) count.textContent = '已选择 ' + selected.length + ' 个';
  }

  var accountMulti = null;
  var accountFilterText = '';

  function bindAccountMulti() {
    accountMulti = UI.bindMultiSelect({
      wrapId: 'createAccountWrap',
      triggerId: 'createAccountTrigger',
      panelId: 'createAccountPanel',
      labelId: 'createAccountLabel',
      listId: 'createAccountList',
      selectedId: 'createAccountSelected',
      countId: 'createAccountCount',
      selectAllId: 'createAccountSelectAll',
      clearId: 'createAccountClear',
      prefix: '',
      formatTriggerLabel: formatAccountTriggerLabel,
      formatSelectedCount: function (n) { return '已选择 ' + n + ' 个'; },
      getOptions: function () {
        var keywords = parseAccountKeywords(accountFilterText);
        return accountsForProduct().filter(function (row) {
          return accountMatchesKeyword(row, keywords);
        }).map(function (row) { return row.advertiser_id; });
      },
      getLabel: function (id) {
        var row = findAccount(id);
        return row ? row.advertiser_name : id;
      },
      getSelected: function () { return state.selectedAccountIds; },
      setSelected: function (arr) {
        state.selectedAccountIds = arr.slice();
        state.selectedAccountIds.forEach(function (id) {
          if (!state.authByAccount[id]) {
            var acc = findAccount(id);
            state.authByAccount[id] = acc ? (acc.auth_user || (acc.auth_grants[0] && acc.auth_grants[0].name) || '') : '';
          }
        });
        Object.keys(state.authByAccount).forEach(function (id) {
          if (state.selectedAccountIds.indexOf(id) < 0) delete state.authByAccount[id];
        });
        $('basicAccountItem').classList.remove('is-error');
        syncAccountLabel();
        renderAuthTable();
        syncAdAccountDependent();
        renderSplitRules();
        if (!creativeEvenAllocMismatch()) setFormItemError('creativeSelectItem', false);
      }
    });

    syncAccountLabel();

    var search = $('createAccountSearch');
    if (search) {
      search.addEventListener('click', function (e) { e.stopPropagation(); });
      search.addEventListener('input', function () {
        accountFilterText = search.value || '';
        accountMulti.render();
      });
    }

    var panelClear = $('createAccountPanelClear');
    if (panelClear) {
      panelClear.addEventListener('click', function () {
        state.selectedAccountIds = [];
        state.authByAccount = {};
        accountMulti.render();
        renderAuthTable();
        syncAdAccountDependent();
        renderSplitRules();
      });
    }

    bindAccountPanelPortal();
  }

  function placePortalPanel(panel, anchor, width) {
    if (!panel || !anchor) return;
    if (panel.getAttribute('data-portal-bound') !== '1') {
      panel.setAttribute('data-portal-bound', '1');
      panel.addEventListener('click', function (e) {
        e.stopPropagation();
        var authOpt = e.target.closest('.single-option[data-auth-name]');
        if (authOpt) {
          var authAccountId = panel.getAttribute('data-auth-panel') || '';
          if (authAccountId) setAuthUser(authAccountId, authOpt.getAttribute('data-auth-name') || '');
          return;
        }
        var ttOpt = e.target.closest('.create-tt-option[data-tt-id], [data-tt-id]');
        if (ttOpt) {
          var ttAccountId = panel.getAttribute('data-tt-panel') || '';
          if (ttAccountId) setTtIdentityForAccount(ttAccountId, ttOpt.getAttribute('data-tt-id') || '');
        }
      });
    }
    document.body.appendChild(panel);
    panel.classList.add('create-ad-panel--portal');
    var rect = anchor.getBoundingClientRect();
    var panelH = panel.offsetHeight || 296;
    var spaceBelow = window.innerHeight - rect.bottom - 8;
    var top = rect.bottom + 4;
    if (panelH > spaceBelow && rect.top - 8 > spaceBelow) {
      top = Math.max(8, rect.top - panelH - 4);
    }
    var left = rect.left;
    var w = width || Math.max(rect.width, 600);
    if (left + w > window.innerWidth - 8) left = Math.max(8, window.innerWidth - w - 8);
    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
    panel.style.width = w + 'px';
  }

  function restorePortalPanel(panel, host) {
    if (!panel || !host) return;
    panel.classList.remove('create-ad-panel--portal');
    panel.style.left = '';
    panel.style.top = '';
    panel.style.width = '';
    if (panel.parentElement !== host) host.appendChild(panel);
  }

  function bindAccountPanelPortal() {
    var wrap = $('createAccountWrap');
    var trigger = $('createAccountTrigger');
    var panel = $('createAccountPanel');
    if (!wrap || !trigger || !panel) return;

    panel.addEventListener('click', function (e) { e.stopPropagation(); });

    function syncPortal() {
      if (panel.classList.contains('is-open')) placePortalPanel(panel, trigger, 600);
      else restorePortalPanel(panel, wrap);
    }

    trigger.addEventListener('click', function () {
      window.requestAnimationFrame(syncPortal);
    });
    document.addEventListener('click', function () {
      window.requestAnimationFrame(function () {
        if (!panel.classList.contains('is-open')) restorePortalPanel(panel, wrap);
      });
    });
    window.addEventListener('resize', function () {
      if (panel.classList.contains('is-open')) placePortalPanel(panel, trigger, 600);
    });
    var main = $('createAdMain');
    if (main) {
      main.addEventListener('scroll', function () {
        if (panel.classList.contains('is-open')) placePortalPanel(panel, trigger, 600);
      });
    }
  }

  function closeAuthPanels() {
    document.querySelectorAll('.single-panel[data-auth-panel].is-open, .create-auth-user-wrap .single-panel.is-open').forEach(function (panel) {
      var accountId = panel.getAttribute('data-auth-panel') || '';
      var wrap = document.querySelector('[data-auth-wrap="' + accountId + '"]');
      panel.classList.remove('is-open');
      if (wrap) restorePortalPanel(panel, wrap);
    });
    document.querySelectorAll('.create-auth-user-wrap .select-trigger.is-open').forEach(function (btn) {
      btn.classList.remove('is-open');
    });
  }

  function renderAuthTable() {
    closeAuthPanels();
    var item = $('basicAuthItem');
    var tbody = $('createAuthBody');
    if (!tbody) return;
    var ids = state.selectedAccountIds;
    if (item) item.hidden = !ids.length;
    if (!ids.length) {
      tbody.innerHTML = '';
      return;
    }
    tbody.innerHTML = ids.map(function (id) {
      var acc = findAccount(id);
      if (!acc) return '';
      var selectedName = state.authByAccount[id] || acc.auth_user || '';
      if (!state.authByAccount[id] && selectedName) state.authByAccount[id] = selectedName;
      var labelHtml = selectedName
        ? escapeHtml(selectedName)
        : '<span class="muted">请选择</span>';
      var options = (acc.auth_grants || []).map(function (grant) {
        var active = grant.name === selectedName ? ' is-active' : '';
        return '<button type="button" class="single-option' + active + '" data-auth-name="' + escapeHtml(grant.name) + '">' +
          escapeHtml(grant.name) +
          '</button>';
      }).join('');
      return (
        '<tr data-account-id="' + escapeHtml(id) + '">' +
          '<td>' + accountCellHtml(acc) + '</td>' +
          '<td>' +
            '<div class="form-item__control create-auth-user-wrap' + (selectedName ? ' has-value' : '') + '" data-auth-wrap="' + escapeHtml(id) + '">' +
              '<button class="select-trigger" type="button" data-auth-trigger="' + escapeHtml(id) + '">' +
                '<span class="select-trigger__text">' + labelHtml + '</span>' +
                '<svg class="select-trigger__arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg>' +
              '</button>' +
              '<div class="single-panel" data-auth-panel="' + escapeHtml(id) + '">' + options + '</div>' +
            '</div>' +
          '</td>' +
        '</tr>'
      );
    }).join('');
  }

  function setAuthUser(accountId, userName) {
    if (!accountId) return;
    state.authByAccount[accountId] = userName || '';
    var item = $('basicAuthItem');
    if (item) item.classList.remove('is-error');
    renderAuthTable();
  }

  function bindAuthTableEvents() {
    var tbody = $('createAuthBody');
    if (!tbody) return;

    tbody.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-auth-trigger]');
      if (!trigger) return;
      e.stopPropagation();
      var id = trigger.getAttribute('data-auth-trigger');
      var wrap = tbody.querySelector('[data-auth-wrap="' + id + '"]');
      var panel = wrap ? wrap.querySelector('[data-auth-panel="' + id + '"]') : null;
      if (!panel) panel = document.body.querySelector('[data-auth-panel="' + id + '"]');
      var open = panel && !panel.classList.contains('is-open');
      closeAuthPanels();
      UI.closePanels();
      if (open && panel && wrap) {
        panel.classList.add('is-open');
        trigger.classList.add('is-open');
        placePortalPanel(panel, trigger, Math.max(trigger.offsetWidth, 200));
      }
    });

  }

  var stepScrollLock = false;
  var stepScrollTimer = 0;

  function setActiveStep(key) {
    if (!key) return;
    state.currentStep = key;
    document.querySelectorAll('#createAdSteps .create-ad-steps__item').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-step') === key);
    });
  }

  function scrollToStep(key, smooth) {
    var card = document.querySelector('[data-step-card="' + key + '"]');
    var main = $('createAdMain');
    setActiveStep(key);
    if (!card || !main) return;
    var nextTop = main.scrollTop + (card.getBoundingClientRect().top - main.getBoundingClientRect().top);
    stepScrollLock = true;
    if (stepScrollTimer) window.clearTimeout(stepScrollTimer);
    if (smooth === false) {
      main.scrollTop = Math.max(0, nextTop);
      stepScrollLock = false;
      return;
    }
    if (typeof main.scrollTo === 'function') {
      main.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
    } else {
      main.scrollTop = Math.max(0, nextTop);
    }
    stepScrollTimer = window.setTimeout(function () {
      stepScrollLock = false;
      stepScrollTimer = 0;
    }, 420);
  }

  function syncStepFromScroll() {
    if (stepScrollLock) return;
    var main = $('createAdMain');
    if (!main) return;
    var anchorY = main.getBoundingClientRect().top + 12;
    var current = STEPS[0].key;
    for (var i = 0; i < STEPS.length; i += 1) {
      var card = document.querySelector('[data-step-card="' + STEPS[i].key + '"]');
      if (!card) continue;
      if (card.getBoundingClientRect().top <= anchorY) current = STEPS[i].key;
    }
    if (current !== state.currentStep) setActiveStep(current);
  }

  function setStep(key, opts) {
    var smooth = !(opts && opts.smooth === false);
    scrollToStep(key, smooth);
  }

  function bindStepAnchors() {
    var main = $('createAdMain');
    if (main) {
      main.addEventListener('scroll', syncStepFromScroll, { passive: true });
    }
  }

  function sanitizeBudgetInput(raw) {
    var s = String(raw == null ? '' : raw).replace(/[^\d.]/g, '');
    var dot = s.indexOf('.');
    if (dot >= 0) {
      s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, '');
      var parts = s.split('.');
      if (parts[1] && parts[1].length > 2) {
        s = parts[0] + '.' + parts[1].slice(0, 2);
      }
    }
    if (s.length > 1 && s.charAt(0) === '0' && s.charAt(1) !== '.') {
      s = s.replace(/^0+/, '') || '0';
    }
    return s;
  }

  function formatFixed2(raw) {
    var s = sanitizeBudgetInput(raw);
    if (!s || s === '.') return '';
    if (s.charAt(s.length - 1) === '.') s = s.slice(0, -1);
    if (!s) return '';
    var num = Number(s);
    if (!isFinite(num)) return '';
    return num.toFixed(2);
  }

  function isBudgetValueValid(raw) {
    var value = String(raw == null ? '' : raw).trim();
    if (!value || !/^\d+(\.\d{1,2})?$/.test(value)) return false;
    var num = Number(value);
    if (!isFinite(num)) return false;
    return num >= BUDGET_MIN && num < BUDGET_MAX;
  }

  function setBudgetError(show) {
    var item = $('campaignBudgetItem');
    if (!item) return;
    item.classList.toggle('is-error', !!show);
  }

  function validateBudgetField() {
    var item = $('campaignBudgetItem');
    var input = $('campaignBudget');
    if (!item || !input || item.hidden) {
      setBudgetError(false);
      return true;
    }
    var raw = String(input.value || '').trim();
    if (!raw) {
      setBudgetError(false);
      return true;
    }
    var ok = isBudgetValueValid(raw);
    setBudgetError(!ok);
    return ok;
  }

  function syncBudgetTypeSeg() {
    var seg = $('campaignBudgetTypeSeg');
    if (!seg) return;
    var on = !!state.budgetOptimize;
    var visible = 0;
    Array.prototype.forEach.call(seg.querySelectorAll('.seg__item'), function (btn) {
      var mode = btn.getAttribute('data-budget-opt');
      var show = on ? mode === 'on' : mode === 'off';
      btn.hidden = !show;
      if (show) visible += 1;
      btn.classList.toggle('is-active', show && (btn.getAttribute('data-value') || '') === state.budgetType);
    });
    seg.classList.toggle('is-single', visible <= 1);
  }

  function syncCampaignBudgetVisibility() {
    var item = $('campaignBudgetItem');
    if (!item) return;
    item.hidden = !state.budgetOptimize;
    if (!state.budgetOptimize) setBudgetError(false);
  }

  function syncCampaignForm() {
    var nameInput = $('campaignName');
    if (nameInput) nameInput.value = state.campaignName || '';

    var sw = $('campaignBudgetOptimize');
    if (sw) {
      sw.classList.toggle('is-on', !!state.budgetOptimize);
      sw.setAttribute('aria-checked', state.budgetOptimize ? 'true' : 'false');
    }

    syncBudgetTypeSeg();
    syncCampaignBudgetVisibility();

    var budgetInput = $('campaignBudget');
    if (budgetInput) budgetInput.value = state.budget || '';
    validateBudgetField();
    syncNameTokenTags('campaignName');
  }

  var NAME_TOKEN_FIELDS = {
    campaignName: { stateKey: 'campaignName', itemId: 'campaignNameItem' },
    deliveryAdGroupName: { stateKey: 'adGroupName', itemId: 'deliveryAdGroupNameItem' },
    adName: { stateKey: 'adName', itemId: 'adNameItem' }
  };

  function syncNameTokenTags(inputId) {
    var input = $(inputId);
    if (!input) return;
    var tags = document.querySelector('.meta-tags[data-target="' + inputId + '"]');
    if (!tags) return;
    var val = input.value || '';
    tags.querySelectorAll('.meta-tag').forEach(function (btn) {
      var token = btn.getAttribute('data-token') || '';
      var repeat = btn.getAttribute('data-repeat') === '1';
      btn.classList.toggle('is-used', !repeat && !!token && val.indexOf(token) !== -1);
    });
  }

  function snapNameTokenCaret(val, index) {
    var i = index;
    if (i < 0) i = 0;
    if (i > val.length) i = val.length;
    var open = val.lastIndexOf('{', Math.max(0, i - 1));
    if (open < 0) return i;
    var close = val.indexOf('}', open);
    if (close < 0 || i <= open || i > close) return i;
    return close + 1;
  }

  function insertNameToken(inputId, token, repeatable) {
    var field = NAME_TOKEN_FIELDS[inputId];
    var input = $(inputId);
    if (!field || !input || !token) return;
    var val = input.value || '';
    if (!repeatable && val.indexOf(token) !== -1) return;
    var start = snapNameTokenCaret(val, input.selectionStart != null ? input.selectionStart : val.length);
    var end = snapNameTokenCaret(val, input.selectionEnd != null ? input.selectionEnd : val.length);
    if (end < start) end = start;
    var before = val.slice(0, start);
    var after = val.slice(end);
    var lead = before && before.charAt(before.length - 1) !== '_';
    var trail = after && after.charAt(0) !== '_';
    var piece = (lead ? '_' : '') + token + (trail ? '_' : '');
    var next = before + piece + after;
    if (input.maxLength > 0 && next.length > input.maxLength) next = next.slice(0, input.maxLength);
    input.value = next;
    state[field.stateKey] = input.value;
    var pos = Math.min(before.length + (lead ? 1 : 0) + token.length, input.value.length);
    input.focus();
    if (input.setSelectionRange) input.setSelectionRange(pos, pos);
    syncNameTokenTags(inputId);
    if (String(input.value || '').trim()) setFormItemError(field.itemId, false);
  }

  function bindNameTokenFields() {
    Object.keys(NAME_TOKEN_FIELDS).forEach(function (inputId) {
      var field = NAME_TOKEN_FIELDS[inputId];
      var input = $(inputId);
      if (input && input.getAttribute('data-name-token') !== '1') {
        input.setAttribute('data-name-token', '1');
        input.addEventListener('input', function () {
          state[field.stateKey] = input.value;
          syncNameTokenTags(inputId);
          if (String(input.value || '').trim()) setFormItemError(field.itemId, false);
        });
      }
      var tags = document.querySelector('.meta-tags[data-target="' + inputId + '"]');
      if (tags && tags.getAttribute('data-bound') !== '1') {
        tags.setAttribute('data-bound', '1');
        tags.addEventListener('mousedown', function (e) {
          if (e.target.closest('.meta-tag')) e.preventDefault();
        });
        tags.addEventListener('click', function (e) {
          var btn = e.target.closest('.meta-tag');
          if (!btn || btn.classList.contains('is-used')) return;
          insertNameToken(inputId, btn.getAttribute('data-token') || '', btn.getAttribute('data-repeat') === '1');
        });
      }
      syncNameTokenTags(inputId);
    });
  }

  function resetCampaignForm() {
    state.campaignName = '{YYYYMMDD}_{产品全称}_minigame_VBO_troas_{地区组}_{序号}';
    state.budgetOptimize = true;
    state.budgetType = '日预算';
    state.budget = '';
    syncCampaignForm();
    syncBidBudgetVisibility();
  }

  function setBudgetOptimize(on) {
    state.budgetOptimize = !!on;
    if (state.budgetOptimize) {
      if (state.budgetType !== '日预算' && state.budgetType !== '总预算') {
        state.budgetType = '日预算';
      }
    } else {
      state.budgetType = '不限';
    }
    syncCampaignForm();
    syncBidBudgetVisibility();
  }

  function setBidBudgetError(show) {
    var item = $('bidBudgetItem');
    if (!item) return;
    item.classList.toggle('is-error', !!show);
  }

  function validateBidBudgetField() {
    var item = $('bidBudgetItem');
    var input = $('bidBudget');
    if (!item || !input || item.hidden) {
      setBidBudgetError(false);
      return true;
    }
    var raw = String(input.value || '').trim();
    if (!raw) {
      setBidBudgetError(false);
      return true;
    }
    var ok = isBudgetValueValid(raw);
    setBidBudgetError(!ok);
    return ok;
  }

  function syncBidBudgetVisibility() {
    var show = !state.budgetOptimize;
    var typeItem = $('bidBudgetTypeItem');
    var budgetItem = $('bidBudgetItem');
    if (typeItem) typeItem.hidden = !show;
    if (budgetItem) budgetItem.hidden = !show;
    if (!show) setBidBudgetError(false);
  }

  function syncBidTargetRoasVisibility() {
    var item = $('bidTargetRoasItem');
    if (!item) return;
    item.hidden = state.bidStrategy !== '目标ROAS';
  }

  function syncBidStartVisibility() {
    var row = $('bidStartAtRow');
    if (!row) return;
    row.hidden = state.startMode !== '指定时间';
  }

  function syncBidEndVisibility() {
    var row = $('bidEndAtRow');
    if (!row) return;
    row.hidden = state.endMode !== '指定时间';
  }

  function syncBidScheduleVisibility() {
    var grid = $('bidScheduleGrid');
    if (!grid) return;
    grid.hidden = state.scheduleMode !== '指定时段';
  }

  function syncSegValue(segId, value) {
    var seg = $(segId);
    if (!seg) return;
    Array.prototype.forEach.call(seg.querySelectorAll('.seg__item'), function (btn) {
      btn.classList.toggle('is-active', (btn.getAttribute('data-value') || '') === value);
    });
  }

  function padScheduleTime(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function scheduleSlotStartLabel(slot) {
    var minutes = slot * 30;
    return padScheduleTime(Math.floor(minutes / 60)) + ':' + padScheduleTime(minutes % 60);
  }

  function scheduleSlotEndLabel(slot) {
    var minutes = (slot + 1) * 30;
    if (minutes >= 24 * 60) return '24:00';
    return padScheduleTime(Math.floor(minutes / 60)) + ':' + padScheduleTime(minutes % 60);
  }

  function scheduleDayRanges(daySlots) {
    var ranges = [];
    var i = 0;
    while (i < daySlots.length) {
      if (!daySlots[i]) {
        i += 1;
        continue;
      }
      var start = i;
      while (i + 1 < daySlots.length && daySlots[i + 1]) i += 1;
      ranges.push(scheduleSlotStartLabel(start) + ' – ' + scheduleSlotEndLabel(i));
      i += 1;
    }
    return ranges;
  }

  function renderScheduleSummary() {
    var el = $('bidScheduleSummary');
    if (!el) return;
    var slots = ensureScheduleSlots();
    var lines = [];
    var d;
    for (d = 0; d < 7; d += 1) {
      var ranges = scheduleDayRanges(slots[d] || []);
      if (!ranges.length) continue;
      lines.push(SCHEDULE_DAYS[d] + '：' + ranges.join('、'));
    }
    if (!lines.length) {
      el.hidden = true;
      el.innerHTML = '';
      return;
    }
    el.hidden = false;
    el.innerHTML = lines.map(function (line) {
      return '<div class="schedule-grid__summary-line">' + escapeHtml(line) + '</div>';
    }).join('');
  }

  function renderScheduleGrid() {
    var table = $('bidScheduleTable');
    if (!table) return;
    var slots = ensureScheduleSlots();
    var html = [];
    html.push('<div class="schedule-grid__corner">星期/时间</div>');
    html.push('<div class="schedule-grid__ampm schedule-grid__ampm--am">00:00 – 12:00</div>');
    html.push('<div class="schedule-grid__ampm schedule-grid__ampm--pm">12:00 – 24:00</div>');
    var h;
    for (h = 0; h < 24; h += 1) {
      var col = h * 2 + 2;
      html.push(
        '<div class="schedule-grid__hour' + (h === 23 ? ' schedule-grid__hour--last' : '') + '"' +
        ' style="grid-column:' + col + ' / span 2">' + h + '</div>'
      );
    }
    var d;
    for (d = 0; d < 7; d += 1) {
      html.push(
        '<div class="schedule-grid__day' + (d === 6 ? ' schedule-grid__day--last' : '') + '"' +
        ' style="grid-row:' + (d + 3) + '">' + SCHEDULE_DAYS[d] + '</div>'
      );
      var s;
      for (s = 0; s < SCHEDULE_SLOTS_PER_DAY; s += 1) {
        html.push(
          '<button class="schedule-grid__cell' + (slots[d][s] ? ' is-on' : '') + '" type="button"' +
          ' data-day="' + d + '" data-slot="' + s + '" style="grid-row:' + (d + 3) + ';grid-column:' + (s + 2) + '"' +
          ' aria-pressed="' + (slots[d][s] ? 'true' : 'false') + '"></button>'
        );
      }
    }
    table.innerHTML = html.join('');
    renderScheduleSummary();
  }

  function bindScheduleGrid() {
    var table = $('bidScheduleTable');
    if (!table || table.getAttribute('data-bound') === '1') return;
    table.setAttribute('data-bound', '1');
    var dragging = false;
    var paintOn = true;
    var lastDay = -1;
    var lastSlot = -1;

    function paintSlot(day, slot) {
      var slots = ensureScheduleSlots();
      if (!slots[day] || slot < 0 || slot >= SCHEDULE_SLOTS_PER_DAY) return;
      slots[day][slot] = paintOn;
      var btn = table.querySelector('.schedule-grid__cell[data-day="' + day + '"][data-slot="' + slot + '"]');
      if (btn) {
        btn.classList.toggle('is-on', paintOn);
        btn.setAttribute('aria-pressed', paintOn ? 'true' : 'false');
      }
    }

    function paintCell(btn) {
      if (!btn) return;
      var day = Number(btn.getAttribute('data-day'));
      var slot = Number(btn.getAttribute('data-slot'));
      if (lastDay === day && lastSlot >= 0) {
        var from = Math.min(lastSlot, slot);
        var to = Math.max(lastSlot, slot);
        var s;
        for (s = from; s <= to; s += 1) paintSlot(day, s);
      } else {
        paintSlot(day, slot);
      }
      lastDay = day;
      lastSlot = slot;
      renderScheduleSummary();
    }

    function cellFromPoint(x, y) {
      var el = document.elementFromPoint(x, y);
      if (!el) return null;
      var btn = el.closest ? el.closest('.schedule-grid__cell') : null;
      if (btn && table.contains(btn)) return btn;
      return null;
    }

    table.addEventListener('mousedown', function (e) {
      var btn = e.target.closest('.schedule-grid__cell');
      if (!btn || !table.contains(btn)) return;
      e.preventDefault();
      dragging = true;
      lastDay = -1;
      lastSlot = -1;
      var day = Number(btn.getAttribute('data-day'));
      var slot = Number(btn.getAttribute('data-slot'));
      paintOn = !ensureScheduleSlots()[day][slot];
      paintCell(btn);
    });

    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var btn = cellFromPoint(e.clientX, e.clientY);
      if (btn) paintCell(btn);
    });

    document.addEventListener('mouseup', function () {
      if (dragging) renderScheduleSummary();
      dragging = false;
      lastDay = -1;
      lastSlot = -1;
    });

    var clearBtn = $('bidScheduleClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        state.scheduleSlots = createEmptySchedule();
        renderScheduleGrid();
      });
    }
  }

  function bindBidDateTimes() {
    bidStartPicker = UI.bindDateTime({
      wrapId: 'bidStartAtWrap',
      triggerId: 'bidStartAtTrigger',
      labelId: 'bidStartAtLabel',
      panelId: 'bidStartAtPanel',
      calId: 'bidStartAtCal',
      hourId: 'bidStartAtHour',
      minuteId: 'bidStartAtMinute',
      secondId: 'bidStartAtSecond',
      displayId: 'bidStartAtDisplay',
      clearId: 'bidStartAtClear',
      onChange: function (value) { state.startAt = value || ''; }
    });
    bidEndPicker = UI.bindDateTime({
      wrapId: 'bidEndAtWrap',
      triggerId: 'bidEndAtTrigger',
      labelId: 'bidEndAtLabel',
      panelId: 'bidEndAtPanel',
      calId: 'bidEndAtCal',
      hourId: 'bidEndAtHour',
      minuteId: 'bidEndAtMinute',
      secondId: 'bidEndAtSecond',
      displayId: 'bidEndAtDisplay',
      clearId: 'bidEndAtClear',
      onChange: function (value) { state.endAt = value || ''; }
    });
  }

  function syncBidForm() {
    syncSegValue('bidBudgetTypeSeg', state.bidBudgetType);
    syncSegValue('bidOptGoalSeg', state.optGoal);
    syncSegValue('bidOptEventSeg', state.optEvent);
    syncSegValue('bidStrategySeg', state.bidStrategy);
    syncSegValue('bidVboSeg', state.vboWindow);
    syncSegValue('bidAuctionSeg', state.auctionStrategy);
    syncSegValue('bidClickAttrSeg', state.clickAttribution);
    syncSegValue('bidEventStatSeg', state.eventStat);
    syncSegValue('bidBillingSeg', state.billingEvent);
    syncSegValue('bidSpeedSeg', state.deliverySpeed);
    syncSegValue('bidStartModeSeg', state.startMode);
    syncSegValue('bidEndModeSeg', state.endMode);
    syncSegValue('bidScheduleModeSeg', state.scheduleMode);

    var budgetInput = $('bidBudget');
    if (budgetInput) budgetInput.value = state.bidBudget || '';
    var roasInput = $('bidTargetRoas');
    if (roasInput) roasInput.value = state.targetRoas || '';
    if (bidStartPicker && bidStartPicker.setValue) bidStartPicker.setValue(state.startAt || '');
    if (bidEndPicker && bidEndPicker.setValue) bidEndPicker.setValue(state.endAt || '');

    syncBidBudgetVisibility();
    syncBidTargetRoasVisibility();
    syncBidStartVisibility();
    syncBidEndVisibility();
    syncBidScheduleVisibility();
    validateBidBudgetField();
    renderScheduleGrid();
  }

  function resetBidForm() {
    state.bidBudgetType = '日预算';
    state.bidBudget = '';
    state.optGoal = '价值';
    state.optEvent = '广告收入价值';
    state.bidStrategy = '目标ROAS';
    state.vboWindow = 'D0';
    state.targetRoas = '';
    state.auctionStrategy = '最大投放量';
    state.clickAttribution = '30 天';
    state.eventStat = '每一次';
    state.billingEvent = 'oCPM';
    state.deliverySpeed = '标准';
    state.startMode = '立即开始';
    state.startAt = '';
    state.endMode = '长期投放';
    state.endAt = '';
    state.scheduleMode = '全天投放';
    state.scheduleSlots = createEmptySchedule();
    syncBidForm();
  }

  function bindBidCard() {
    bindSeg('bidBudgetTypeSeg', null, function (v) {
      if (v === '日预算' || v === '总预算') state.bidBudgetType = v;
    });
    bindSeg('bidOptGoalSeg', null, function (v) { state.optGoal = v || '价值'; });
    bindSeg('bidOptEventSeg', null, function (v) { state.optEvent = v || '广告收入价值'; });
    bindSeg('bidStrategySeg', null, function (v) {
      state.bidStrategy = v || '目标ROAS';
      syncBidTargetRoasVisibility();
    });
    bindSeg('bidVboSeg', null, function (v) { state.vboWindow = v || 'D0'; });
    bindSeg('bidAuctionSeg', null, function (v) { state.auctionStrategy = v || '最大投放量'; });
    bindSeg('bidClickAttrSeg', null, function (v) { state.clickAttribution = v || '30 天'; });
    bindSeg('bidEventStatSeg', null, function (v) { state.eventStat = v || '每一次'; });
    bindSeg('bidBillingSeg', null, function (v) { state.billingEvent = v || 'oCPM'; });
    bindSeg('bidSpeedSeg', null, function (v) { state.deliverySpeed = v || '标准'; });
    bindSeg('bidStartModeSeg', null, function (v) {
      state.startMode = v || '立即开始';
      syncBidStartVisibility();
    });
    bindSeg('bidEndModeSeg', null, function (v) {
      state.endMode = v || '长期投放';
      syncBidEndVisibility();
    });
    bindSeg('bidScheduleModeSeg', null, function (v) {
      state.scheduleMode = v || '全天投放';
      syncBidScheduleVisibility();
    });

    var budgetInput = $('bidBudget');
    if (budgetInput) {
      budgetInput.addEventListener('input', function () {
        var next = sanitizeBudgetInput(budgetInput.value);
        if (next !== budgetInput.value) budgetInput.value = next;
        state.bidBudget = budgetInput.value;
        validateBidBudgetField();
      });
      budgetInput.addEventListener('blur', function () {
        var next = formatFixed2(budgetInput.value);
        budgetInput.value = next;
        state.bidBudget = next;
        validateBidBudgetField();
      });
    }

    var roasInput = $('bidTargetRoas');
    if (roasInput) {
      roasInput.addEventListener('input', function () {
        var next = sanitizeBudgetInput(roasInput.value);
        if (next !== roasInput.value) roasInput.value = next;
        state.targetRoas = roasInput.value;
        if (String(state.targetRoas || '').trim()) setFormItemError('bidTargetRoasItem', false);
      });
      roasInput.addEventListener('blur', function () {
        var next = formatFixed2(roasInput.value);
        roasInput.value = next;
        state.targetRoas = next;
        if (String(state.targetRoas || '').trim()) setFormItemError('bidTargetRoasItem', false);
      });
    }

    bindBidDateTimes();
    bindScheduleGrid();
    ensureScheduleSlots();
    syncBidForm();
  }

  function bindCampaignCard() {
    var sw = $('campaignBudgetOptimize');
    if (sw) {
      sw.addEventListener('click', function () {
        setBudgetOptimize(!state.budgetOptimize);
      });
    }

    bindSeg('campaignBudgetTypeSeg', null, function (v) {
      if (!v) return;
      if (state.budgetOptimize && (v === '日预算' || v === '总预算')) {
        state.budgetType = v;
      } else if (!state.budgetOptimize && v === '不限') {
        state.budgetType = v;
      }
      syncBudgetTypeSeg();
    });

    var budgetInput = $('campaignBudget');
    if (budgetInput) {
      budgetInput.addEventListener('input', function () {
        var next = sanitizeBudgetInput(budgetInput.value);
        if (next !== budgetInput.value) budgetInput.value = next;
        state.budget = budgetInput.value;
        validateBudgetField();
      });
      budgetInput.addEventListener('blur', function () {
        var next = formatFixed2(budgetInput.value);
        budgetInput.value = next;
        state.budget = next;
        validateBudgetField();
      });
    }

    syncCampaignForm();
  }

  var deliveryMiniApi = null;

  function miniIconHtml() {
    return '<span class="create-mini-icon" aria-hidden="true"></span>';
  }

  function miniInfoHtml(item, withId) {
    return (
      '<span class="create-mini-info">' +
        '<span class="create-mini-name">' + escapeHtml(item.minis_name || '-') + '</span>' +
        (withId ? '<span class="create-mini-id">ID：' + escapeHtml(item.minis_id || '') + '</span>' : '') +
      '</span>'
    );
  }

  /** 关联产品对应唯一小游戏：名称同产品，Mini ID = Client key */
  function getDeliveryMiniOptions() {
    if (!state.productName || !state.clientKey) return [];
    return [{
      minis_id: state.clientKey,
      minis_name: state.productName
    }];
  }

  function autoFillDeliveryMini() {
    var list = getDeliveryMiniOptions();
    if (list.length) {
      state.miniId = list[0].minis_id;
      state.miniName = list[0].minis_name;
    } else {
      state.miniId = '';
      state.miniName = '';
    }
    if (deliveryMiniApi) {
      deliveryMiniApi.setValue(state.miniId);
      if (typeof deliveryMiniApi.render === 'function') deliveryMiniApi.render();
    }
    syncAdLandingFromMini(true);
  }

  function bindSelectPanelPortal(wrapId, triggerId, panelId, width) {
    var wrap = $(wrapId);
    var trigger = $(triggerId);
    var panel = $(panelId);
    if (!wrap || !trigger || !panel) return;
    panel.addEventListener('click', function (e) { e.stopPropagation(); });
    function syncPortal() {
      var w = width || Math.max(trigger.offsetWidth, 240);
      if (panel.classList.contains('is-open')) placePortalPanel(panel, trigger, w);
      else restorePortalPanel(panel, wrap);
    }
    trigger.addEventListener('click', function () {
      window.requestAnimationFrame(syncPortal);
    });
    document.addEventListener('click', function () {
      window.requestAnimationFrame(function () {
        if (!panel.classList.contains('is-open')) restorePortalPanel(panel, wrap);
      });
    });
    window.addEventListener('resize', function () {
      if (panel.classList.contains('is-open')) {
        placePortalPanel(panel, trigger, width || Math.max(trigger.offsetWidth, 240));
      }
    });
    var main = $('createAdMain');
    if (main) {
      main.addEventListener('scroll', function () {
        if (panel.classList.contains('is-open')) {
          placePortalPanel(panel, trigger, width || Math.max(trigger.offsetWidth, 240));
        }
      });
    }
  }

  function bindDeliveryMiniSelect() {
    deliveryMiniApi = bindCreateAdSearchSingle({
      wrapId: 'deliveryMiniWrap',
      triggerId: 'deliveryMiniTrigger',
      panelId: 'deliveryMiniPanel',
      labelId: 'deliveryMiniLabel',
      listId: 'deliveryMiniList',
      searchId: 'deliveryMiniSearch',
      getOptions: getDeliveryMiniOptions,
      getLabel: function (item) { return item.minis_name; },
      getValue: function (item) { return item.minis_id; },
      renderLabel: function (item) {
        return miniIconHtml() + miniInfoHtml(item, false);
      },
      renderOption: function (item, selected) {
        return (
          '<button class="create-mini-option' + (selected ? ' is-active' : '') + '" type="button" data-value="' + escapeHtml(item.minis_id) + '">' +
            miniIconHtml() +
            miniInfoHtml(item, true) +
          '</button>'
        );
      },
      onChange: function (value) {
        var list = getDeliveryMiniOptions();
        var hit = null;
        list.forEach(function (item) {
          if (String(item.minis_id) === String(value)) hit = item;
        });
        state.miniId = hit ? hit.minis_id : '';
        state.miniName = hit ? hit.minis_name : '';
        if (state.miniId) setFormItemError('deliveryMiniItem', false);
        syncAdLandingFromMini(true);
      }
    });

    var syncBtn = $('deliveryMiniSync');
    if (syncBtn) {
      syncBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        autoFillDeliveryMini();
        if (deliveryMiniApi && typeof deliveryMiniApi.render === 'function') deliveryMiniApi.render();
      });
    }

    bindSelectPanelPortal('deliveryMiniWrap', 'deliveryMiniTrigger', 'deliveryMiniPanel', 600);
  }

  function resetDeliveryForm() {
    state.adGroupName = '{YYYYMMDD}_{序号}';
    state.deliveryPromoType = '小游戏';
    state.miniId = '';
    state.miniName = '';
    var nameInput = $('deliveryAdGroupName');
    if (nameInput) nameInput.value = state.adGroupName || '';
    syncNameTokenTags('deliveryAdGroupName');
    var seg = $('deliveryPromoTypeSeg');
    if (seg) {
      Array.prototype.forEach.call(seg.querySelectorAll('.seg__item'), function (btn) {
        btn.classList.toggle('is-active', (btn.getAttribute('data-value') || '') === '小游戏');
      });
    }
    autoFillDeliveryMini();
  }

  function bindDeliveryCard() {
    var nameInput = $('deliveryAdGroupName');
    if (nameInput) nameInput.value = state.adGroupName || '';
    syncNameTokenTags('deliveryAdGroupName');
    bindSeg('deliveryPromoTypeSeg', null, function (v) {
      state.deliveryPromoType = v || '小游戏';
    });
    bindDeliveryMiniSelect();
    autoFillDeliveryMini();
  }

  function resetAudienceForm() {
    state.audienceRegions = allRegions();
    state.audienceLanguages = [];
    state.audienceGender = '不限';
    state.audienceMinAge = '18';
    if (audienceRegionApi) audienceRegionApi.render();
    if (audienceLangMulti) audienceLangMulti.render();
    syncSegValue('audienceGenderSeg', state.audienceGender);
    syncSegValue('audienceAgeSeg', state.audienceMinAge);
  }

  function bindAudienceCard() {
    if (!state.audienceRegions.length) state.audienceRegions = allRegions();
    audienceRegionApi = bindCreativeCascadeSelect({
      wrapId: 'audienceRegionWrap',
      triggerId: 'audienceRegionTrigger',
      panelId: 'audienceRegionPanel',
      labelId: 'audienceRegionLabel',
      groupListId: 'audienceRegionGroupList',
      childListId: 'audienceRegionChildList',
      selectedId: 'audienceRegionSelected',
      searchId: 'audienceRegionSearch',
      countId: 'audienceRegionCount',
      selectAllId: 'audienceRegionSelectAll',
      clearAllId: 'audienceRegionPanelClear',
      clearId: 'audienceRegionClear',
      prefix: '',
      tree: REGION_GROUPS,
      getSelected: function () { return state.audienceRegions; },
      setSelected: function (arr) { state.audienceRegions = arr.slice(); }
    });
    bindSelectPanelPortal('audienceRegionWrap', 'audienceRegionTrigger', 'audienceRegionPanel', 640);
    if (audienceRegionApi) audienceRegionApi.render();

    audienceLangMulti = UI.bindMultiSelect({
      wrapId: 'audienceLangWrap',
      triggerId: 'audienceLangTrigger',
      panelId: 'audienceLangPanel',
      labelId: 'audienceLangLabel',
      listId: 'audienceLangList',
      selectedId: 'audienceLangSelected',
      searchId: 'audienceLangSearch',
      countId: 'audienceLangCount',
      selectAllId: 'audienceLangSelectAll',
      clearId: 'audienceLangClear',
      prefix: '',
      getOptions: function () { return LANGUAGE_OPTIONS.slice(); },
      getSelected: function () { return state.audienceLanguages; },
      setSelected: function (arr) { state.audienceLanguages = arr.slice(); }
    });
    var langPanelClear = $('audienceLangPanelClear');
    if (langPanelClear) {
      langPanelClear.addEventListener('click', function () {
        state.audienceLanguages = [];
        if (audienceLangMulti) audienceLangMulti.render();
      });
    }
    bindSelectPanelPortal('audienceLangWrap', 'audienceLangTrigger', 'audienceLangPanel', 600);
    if (audienceLangMulti) audienceLangMulti.render();

    bindSeg('audienceGenderSeg', null, function (v) {
      state.audienceGender = v || '不限';
    });
    bindSeg('audienceAgeSeg', null, function (v) {
      state.audienceMinAge = v || '18';
    });
    syncSegValue('audienceGenderSeg', state.audienceGender);
    syncSegValue('audienceAgeSeg', state.audienceMinAge);
  }

  function syncPlacementSwitch(id, on) {
    var sw = $(id);
    if (!sw) return;
    sw.classList.toggle('is-on', !!on);
    sw.setAttribute('aria-checked', on ? 'true' : 'false');
  }

  function syncPlacementForm() {
    if (placementVersionMulti) placementVersionMulti.render();
    syncPlacementSwitch('placementComment', state.placementComment);
    syncPlacementSwitch('placementDownload', state.placementDownload);
    syncPlacementSwitch('placementShare', state.placementShare);
  }

  function resetPlacementForm() {
    state.placementVersions = ['TikTok'];
    state.placementComment = true;
    state.placementDownload = false;
    state.placementShare = true;
    syncPlacementForm();
  }

  function bindPlacementCard() {
    placementVersionMulti = UI.bindMultiSelect({
      wrapId: 'placementVersionWrap',
      triggerId: 'placementVersionTrigger',
      panelId: 'placementVersionPanel',
      labelId: 'placementVersionLabel',
      listId: 'placementVersionList',
      clearId: 'placementVersionClear',
      prefix: '',
      getOptions: function () { return PLACEMENT_VERSION_OPTIONS.slice(); },
      getSelected: function () { return state.placementVersions; },
      setSelected: function (arr) {
        state.placementVersions = (arr || []).slice();
        if (state.placementVersions.length) setFormItemError('placementVersionItem', false);
      }
    });
    if (placementVersionMulti) placementVersionMulti.render();

    function bindSwitch(id, key) {
      var sw = $(id);
      if (!sw) return;
      sw.addEventListener('click', function () {
        state[key] = !state[key];
        syncPlacementSwitch(id, state[key]);
      });
    }
    bindSwitch('placementComment', 'placementComment');
    bindSwitch('placementDownload', 'placementDownload');
    bindSwitch('placementShare', 'placementShare');
    syncPlacementForm();
  }

  function sampleMiniClickLink(seed) {
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var n = parseInt(String(seed || '1').replace(/\D/g, '').slice(-8), 10) || 1;
    var slug = '';
    var i;
    for (i = 0; i < 11; i += 1) {
      n = (Math.imul(n, 1103515245) + 12345 + i) >>> 0;
      slug += chars[n % chars.length];
    }
    return 'https://www.tiktok.com/minis/' + slug;
  }

  function findTtIdentity(id) {
    for (var i = 0; i < TT_IDENTITY_OPTIONS.length; i += 1) {
      if (String(TT_IDENTITY_OPTIONS[i].id) === String(id)) return TT_IDENTITY_OPTIONS[i];
    }
    return null;
  }

  function ttInfoHtml(item, withId) {
    return (
      '<span class="create-mini-info">' +
        '<span class="create-mini-name">' + escapeHtml(item.name || '-') + '</span>' +
        (withId ? '<span class="create-mini-id create-tt-id">ID：' + escapeHtml(item.id || '') + '</span>' : '') +
      '</span>'
    );
  }

  function ttTriggerHtml(item) {
    return miniIconHtml() + ttInfoHtml(item, false);
  }

  function ttOptionHtml(item, selected) {
    return (
      '<button class="create-mini-option' + (selected ? ' is-active' : '') + '" type="button" data-value="' + escapeHtml(item.id) + '" data-tt-id="' + escapeHtml(item.id) + '">' +
        miniIconHtml() +
        ttInfoHtml(item, true) +
      '</button>'
    );
  }

  function syncTtIdentityOptions() {
    if (adTtUnifiedApi && typeof adTtUnifiedApi.render === 'function') {
      adTtUnifiedApi.render();
    }
    if (state.publishMode === '按账户') renderAdTtTable();
  }

  function defaultCtaSelected() {
    return CTA_OPTIONS.slice();
  }

  function isAdCopyWideChar(code) {
    if (code >= 0x3040 && code <= 0x30FF) return true;
    if (code >= 0x31F0 && code <= 0x31FF) return true;
    if (code >= 0x3400 && code <= 0x4DBF) return true;
    if (code >= 0x4E00 && code <= 0x9FFF) return true;
    if (code >= 0xF900 && code <= 0xFAFF) return true;
    if (code >= 0x3000 && code <= 0x303F) return true;
    if (code >= 0xFF01 && code <= 0xFF60) return true;
    if (code >= 0xFF61 && code <= 0xFF9F) return true;
    if (code >= 0xFFE0 && code <= 0xFFE6) return true;
    return false;
  }

  function adCopyUnits(text) {
    var units = 0;
    var i = 0;
    var value = String(text || '');
    while (i < value.length) {
      var code = value.codePointAt(i);
      units += isAdCopyWideChar(code) ? 2 : 1;
      i += code > 0xFFFF ? 2 : 1;
    }
    return units;
  }

  function normalizeAdTitles(list) {
    var next = (list || []).map(function (t) { return String(t == null ? '' : t); });
    /* 默认至少保留 1 行输入 */
    if (!next.length) next = [''];
    if (next.length > AD_COPY_MAX) next = next.slice(0, AD_COPY_MAX);
    return next;
  }

  function accountCellHtml(acc) {
    if (!acc) return '';
    return (
      '<div class="create-auth-account">' +
        '<span class="create-auth-account__name" title="' + escapeHtml(acc.advertiser_name) + '">' + escapeHtml(acc.advertiser_name) + '</span>' +
        '<span class="create-auth-account__id" title="ID：' + escapeHtml(acc.advertiser_id) + '">ID：' + escapeHtml(acc.advertiser_id) + '</span>' +
      '</div>'
    );
  }

  function ensureAdMapsForAccounts() {
    var ids = state.selectedAccountIds || [];
    ids.forEach(function (id) {
      if (!state.ttIdentityByAccount[id]) state.ttIdentityByAccount[id] = '';
      if (!state.ctaByAccount[id]) state.ctaByAccount[id] = defaultCtaSelected();
    });
    Object.keys(state.ttIdentityByAccount).forEach(function (id) {
      if (ids.indexOf(id) < 0) delete state.ttIdentityByAccount[id];
    });
    Object.keys(state.ctaByAccount).forEach(function (id) {
      if (ids.indexOf(id) < 0) delete state.ctaByAccount[id];
    });
  }

  function syncAdLandingFromMini(force) {
    if (!force && state.landingManual) return;
    var url = '';
    if (state.miniId || state.productId) {
      url = sampleMiniClickLink(state.miniId || state.clientKey || state.productId);
    }
    state.landingUrl = url;
    state.landingManual = false;
    var input = $('adLandingUrl');
    if (input) input.value = url;
    if (String(url || '').trim()) setFormItemError('adLandingItem', false);
    var wrap = $('adLandingWrap');
    if (wrap) wrap.classList.toggle('has-value', !!url);
  }

  function syncAdPublishModeUi() {
    var unified = $('adTtUnifiedItem');
    var byAccount = $('adTtByAccountItem');
    var isUnified = state.publishMode !== '按账户';
    if (unified) unified.hidden = !isUnified;
    if (byAccount) byAccount.hidden = isUnified;
    if (!isUnified) renderAdTtTable();
  }

  function closeAdTtPanels() {
    document.querySelectorAll('.single-panel[data-tt-panel].is-open, .create-ad-tt-wrap .single-panel.is-open').forEach(function (panel) {
      var accountId = panel.getAttribute('data-tt-panel') || '';
      var wrap = document.querySelector('[data-tt-wrap="' + accountId + '"]');
      panel.classList.remove('is-open');
      if (wrap) restorePortalPanel(panel, wrap);
    });
    document.querySelectorAll('.create-ad-tt-wrap .select-trigger.is-open').forEach(function (btn) {
      btn.classList.remove('is-open');
    });
  }

  function closeAdCtaPanel() {
    var panel = $('adCtaSharedPanel');
    var host = $('adCtaItem');
    if (panel) {
      panel.classList.remove('is-open');
      if (host) restorePortalPanel(panel, host.querySelector('.form-item__control') || host);
    }
    document.querySelectorAll('[data-cta-trigger].is-open').forEach(function (btn) {
      btn.classList.remove('is-open');
    });
    activeCtaAccountId = '';
  }

  function ctaLabelHtml(selected) {
    var list = selected || [];
    if (!list.length) return '<span class="muted">请选择</span>';
    if (list.length === CTA_OPTIONS.length) return '已选 ' + list.length + ' 项';
    if (list.length === 1) return escapeHtml(list[0]);
    return '已选 ' + list.length + ' 项';
  }

  function renderAdTtTable() {
    closeAdTtPanels();
    var tbody = $('adTtBody');
    if (!tbody) return;
    ensureAdMapsForAccounts();
    var ids = state.selectedAccountIds || [];
    if (!ids.length) {
      tbody.innerHTML = '<tr><td colspan="2"><span class="muted">请先选择广告账户</span></td></tr>';
      return;
    }
    tbody.innerHTML = ids.map(function (id) {
      var acc = findAccount(id);
      if (!acc) return '';
      var selectedId = state.ttIdentityByAccount[id] || '';
      var selected = findTtIdentity(selectedId);
      var labelHtml = selected
        ? ttTriggerHtml(selected)
        : '<span class="muted">请选择</span>';
      var options = TT_IDENTITY_OPTIONS.map(function (item) {
        return ttOptionHtml(item, String(item.id) === String(selectedId));
      }).join('');
      return (
        '<tr data-account-id="' + escapeHtml(id) + '">' +
          '<td>' + accountCellHtml(acc) + '</td>' +
          '<td>' +
            '<div class="form-item__control create-auth-user-wrap create-ad-tt-wrap' + (selected ? ' has-value' : '') + '" data-tt-wrap="' + escapeHtml(id) + '">' +
              '<button class="select-trigger create-mini-trigger" type="button" data-tt-trigger="' + escapeHtml(id) + '">' +
                '<span class="select-trigger__text">' + labelHtml + '</span>' +
                '<svg class="select-trigger__arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg>' +
              '</button>' +
              '<div class="single-panel create-mini-panel" data-tt-panel="' + escapeHtml(id) + '">' + options + '</div>' +
            '</div>' +
          '</td>' +
        '</tr>'
      );
    }).join('');
  }

  function setTtIdentityForAccount(accountId, identityId) {
    if (!accountId) return;
    state.ttIdentityByAccount[accountId] = identityId || '';
    var missing = (state.selectedAccountIds || []).some(function (id) {
      return !String(state.ttIdentityByAccount[id] || '').trim();
    });
    if (!missing) setFormItemError('adTtByAccountItem', false);
    renderAdTtTable();
  }

  function renderAdCtaTable() {
    closeAdCtaPanel();
    var tbody = $('adCtaBody');
    var shell = $('adCtaTableShell');
    if (!tbody) return;
    ensureAdMapsForAccounts();
    var ids = state.selectedAccountIds || [];
    if (shell) shell.hidden = !ids.length;
    if (!ids.length) {
      tbody.innerHTML = '';
      return;
    }
    tbody.innerHTML = ids.map(function (id) {
      var acc = findAccount(id);
      if (!acc) return '';
      var selected = state.ctaByAccount[id] || defaultCtaSelected();
      return (
        '<tr data-account-id="' + escapeHtml(id) + '">' +
          '<td>' + accountCellHtml(acc) + '</td>' +
          '<td>' +
            '<div class="form-item__control create-ad-cta-cell' + (selected.length ? ' has-value' : '') + '" data-cta-wrap="' + escapeHtml(id) + '">' +
              '<button class="select-trigger" type="button" data-cta-trigger="' + escapeHtml(id) + '">' +
                '<span class="select-trigger__text">' + ctaLabelHtml(selected) + '</span>' +
                '<svg class="select-trigger__arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg>' +
              '</button>' +
            '</div>' +
          '</td>' +
        '</tr>'
      );
    }).join('');
  }

  function renderAdCtaSharedPanel() {
    var list = $('adCtaSharedList');
    var selectedEl = $('adCtaSharedSelected');
    var countEl = $('adCtaSharedCount');
    var search = $('adCtaSharedSearch');
    if (!list || !activeCtaAccountId) return;
    var selected = (state.ctaByAccount[activeCtaAccountId] || []).slice();
    var kw = ((search && search.value) || '').trim().toLowerCase();
    var visible = CTA_OPTIONS.filter(function (name) {
      return !kw || name.toLowerCase().indexOf(kw) !== -1;
    });
    var allChecked = selected.length === CTA_OPTIONS.length && CTA_OPTIONS.length > 0;
    var someChecked = selected.length > 0 && !allChecked;
    var selectAllHtml =
      '<label class="multi-option">' +
        '<input type="checkbox" data-cta-select-all' + (allChecked ? ' checked' : '') + '/>' +
        '<span class="multi-option__label">全选</span>' +
      '</label>';
    list.innerHTML = selectAllHtml + (visible.map(function (name) {
      var checked = selected.indexOf(name) !== -1 ? ' checked' : '';
      return '<label class="multi-option"><input type="checkbox" value="' + escapeHtml(name) + '"' + checked + '/><span class="multi-option__label">' + escapeHtml(name) + '</span></label>';
    }).join('') || '<div class="multi-panel__empty">暂无数据</div>');
    var selectAllInput = list.querySelector('[data-cta-select-all]');
    if (selectAllInput) selectAllInput.indeterminate = someChecked;
    if (selectedEl) {
      selectedEl.innerHTML = selected.length
        ? selected.map(function (name) {
          return '<div class="multi-selected" data-value="' + escapeHtml(name) + '"><span class="multi-selected__name">' + escapeHtml(name) + '</span><button class="multi-selected__remove" type="button" data-remove="' + escapeHtml(name) + '" aria-label="移除"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 2l8 8M10 2L2 10"/></svg></button></div>';
        }).join('')
        : '<div class="multi-panel__empty">暂无已选</div>';
    }
    if (countEl) countEl.textContent = '已选 ' + selected.length + ' 个';
    var trigger = document.querySelector('[data-cta-trigger="' + activeCtaAccountId + '"]');
    if (trigger) {
      var text = trigger.querySelector('.select-trigger__text');
      if (text) text.innerHTML = ctaLabelHtml(selected);
      var wrap = document.querySelector('[data-cta-wrap="' + activeCtaAccountId + '"]');
      if (wrap) wrap.classList.toggle('has-value', !!selected.length);
    }
  }

  function renderAdCopyList() {
    var list = $('adCopyList');
    var countEl = $('adCopyCount');
    var addBtn = $('adCopyAddBtn');
    if (!list) return;
    state.adTitles = normalizeAdTitles(state.adTitles);
    var titles = state.adTitles;
    var solo = titles.length <= 1;
    list.innerHTML = titles.map(function (text, index) {
      var units = adCopyUnits(text);
      var over = units > AD_COPY_UNITS_MAX;
      return (
        '<div class="create-ad-copy__row' + (solo ? ' create-ad-copy__row--solo' : '') + '" data-copy-index="' + index + '">' +
          '<div class="create-ad-copy__field' + (over ? ' is-over' : '') + '">' +
            '<input class="input" type="text" data-ad-copy-input="' + index + '" value="' + escapeHtml(text) + '" placeholder="请输入" autocomplete="off" />' +
            '<span class="create-ad-copy__units">' + units + ' / ' + AD_COPY_UNITS_MAX + '</span>' +
          '</div>' +
          (solo
            ? ''
            : '<button class="create-ad-copy__remove" type="button" data-ad-copy-remove="' + index + '" aria-label="删除">' +
                AD_COPY_REMOVE_ICON +
              '</button>') +
        '</div>'
      );
    }).join('');
    if (countEl) countEl.textContent = '(' + titles.length + ' / ' + AD_COPY_MAX + ')';
    if (addBtn) {
      addBtn.disabled = titles.length >= AD_COPY_MAX;
      addBtn.hidden = titles.length >= AD_COPY_MAX;
    }
  }

  function setAdTitles(list, opts) {
    state.adTitles = normalizeAdTitles(list);
    renderAdCopyList();
    if (state.adTitles.some(function (t) { return String(t || '').trim(); })) {
      setFormItemError('adCopyItem', false);
    }
    if (opts && opts.toast) UI.showToast(opts.toast, 'success');
  }

  function appendAdTitles(texts, opts) {
    var incoming = (texts || []).map(function (t) { return String(t || '').trim(); }).filter(Boolean);
    if (!incoming.length) {
      UI.showToast('请至少选择 1 条文案', 'warning');
      return false;
    }
    var cur = normalizeAdTitles(state.adTitles).filter(function (t) { return String(t).trim(); });
    var next = cur.slice();
    incoming.forEach(function (t) {
      if (next.length >= AD_COPY_MAX) return;
      if (next.indexOf(t) >= 0) return;
      next.push(t);
    });
    if (!next.length) next = [''];
    if (next.length === cur.length && cur.length >= AD_COPY_MAX) {
      UI.showToast('最多添加 ' + AD_COPY_MAX + ' 条文案', 'warning');
      return false;
    }
    setAdTitles(next, opts);
    return true;
  }

  function replaceAdTitles(texts, opts) {
    var next = (texts || []).map(function (t) { return String(t || '').trim(); }).filter(Boolean).slice(0, AD_COPY_MAX);
    if (!next.length) {
      UI.showToast('请至少选择 1 条文案', 'warning');
      return false;
    }
    setAdTitles(next, opts);
    return true;
  }

  function adCopyCreatorOptions() {
    return ['用户A', '用户B', '用户C'];
  }

  function findAdCopyPack(id) {
    var hit = null;
    AD_COPY_PACKS.forEach(function (p) { if (p.id === id) hit = p; });
    return hit;
  }

  function findAdCopyItem(id) {
    var hit = null;
    AD_COPY_LIBRARY.forEach(function (c) { if (c.id === id) hit = c; });
    return hit;
  }

  function filteredAdPacks() {
    var name = (adPackApplied.name || '').trim().toLowerCase();
    var creators = adPackApplied.creators || [];
    return AD_COPY_PACKS.filter(function (item) {
      if (name && String(item.name || '').toLowerCase().indexOf(name) === -1) return false;
      if (creators.length && creators.indexOf(item.creator) === -1) return false;
      return true;
    }).slice().sort(function (a, b) {
      return a.createdAt < b.createdAt ? 1 : -1;
    });
  }

  function filteredAdCopies() {
    var text = (adPickApplied.text || '').trim().toLowerCase();
    var creators = adPickApplied.creators || [];
    return AD_COPY_LIBRARY.filter(function (item) {
      if (text && String(item.text || '').toLowerCase().indexOf(text) === -1) return false;
      if (creators.length && creators.indexOf(item.creator) === -1) return false;
      return true;
    }).slice().sort(function (a, b) {
      return a.createdAt < b.createdAt ? 1 : -1;
    });
  }

  function layoutAdCopyLibTable(table) {
    if (!window.ColResize || !table) return;
    if (table.getAttribute('data-col-resize') === '1') {
      ColResize.syncTableWidth(table);
    } else {
      ColResize.refresh(table, { force: true });
    }
  }

  function layoutAdCopyLibTables() {
    layoutAdCopyLibTable($('adPickTable'));
    layoutAdCopyLibTable($('adPackTable'));
  }

  function syncAdCopyPickLimit() {
    var tip = $('adCopyPickLimit');
    if (!tip) return;
    var onCopy = adCopyLibTab === 'copy';
    tip.hidden = !onCopy;
    if (onCopy) {
      tip.textContent = '已选：' + adCopyPickDraftIds.length + ' / ' + AD_COPY_MAX;
    }
  }

  function renderAdPackTable() {
    var list = filteredAdPacks();
    var totalPages = Math.max(1, Math.ceil(list.length / adPackPageSize) || 1);
    if (adPackPage > totalPages) adPackPage = totalPages;
    var start = (adPackPage - 1) * adPackPageSize;
    var pageRows = list.slice(start, start + adPackPageSize);
    var body = $('adPackBody');
    var empty = $('adPackEmpty');
    if (!body) return;
    if (!pageRows.length) {
      body.innerHTML = '';
      if (empty) empty.hidden = false;
    } else {
      if (empty) empty.hidden = true;
      body.innerHTML = pageRows.map(function (item) {
        var texts = item.texts || [];
        var open = !!adCopyPackExpanded[item.id] && texts.length > 0;
        var checked = adCopyPackDraftId === item.id;
        var detail = open
          ? '<tr class="pack-detail"><td colspan="5"><div class="pack-lines">' +
              texts.map(function (t) {
                return '<div class="pack-lines__item">' + escapeHtml(t) + '</div>';
              }).join('') +
            '</div></td></tr>'
          : '';
        return (
          '<tr data-pack-id="' + escapeHtml(item.id) + '">' +
            '<td class="col-check"><label class="cell-check"><input type="radio" name="adPackRadio" value="' + escapeHtml(item.id) + '"' + (checked ? ' checked' : '') + ' /></label></td>' +
            '<td><div class="pack-name">' +
              '<button class="pack-expand' + (open ? ' is-open' : '') + '" type="button" data-ad-pack-expand="' + escapeHtml(item.id) + '"' +
                (texts.length ? '' : ' disabled') + '>' +
                '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4.5 2.5L8 6L4.5 9.5"/></svg>' +
              '</button>' +
              '<span class="pack-name__text" title="' + escapeHtml(item.name) + '">' + escapeHtml(item.name) + '</span>' +
            '</div></td>' +
            '<td>' + texts.length + '</td>' +
            '<td>' + escapeHtml(item.creator) + '</td>' +
            '<td>' + escapeHtml(item.createdAt) + '</td>' +
          '</tr>' + detail
        );
      }).join('');
    }
    if (UI.renderPagination) {
      UI.renderPagination({
        containerId: 'adPackPagination',
        total: list.length,
        page: adPackPage,
        pageSize: adPackPageSize
      });
    }
    layoutAdCopyLibTable($('adPackTable'));
  }

  function renderAdPickTable() {
    var list = filteredAdCopies();
    var totalPages = Math.max(1, Math.ceil(list.length / adPickPageSize) || 1);
    if (adPickPage > totalPages) adPickPage = totalPages;
    var start = (adPickPage - 1) * adPickPageSize;
    var pageRows = list.slice(start, start + adPickPageSize);
    var body = $('adPickBody');
    var empty = $('adPickEmpty');
    if (!body) return;
    if (!pageRows.length) {
      body.innerHTML = '';
      if (empty) empty.hidden = false;
    } else {
      if (empty) empty.hidden = true;
      body.innerHTML = pageRows.map(function (item) {
        var checked = adCopyPickDraftIds.indexOf(item.id) >= 0;
        return (
          '<tr data-copy-id="' + escapeHtml(item.id) + '">' +
            '<td class="col-check"><label class="cell-check"><input type="checkbox" data-ad-pick-id="' + escapeHtml(item.id) + '"' + (checked ? ' checked' : '') + ' /></label></td>' +
            '<td title="' + escapeHtml(item.text) + '">' + escapeHtml(item.text) + '</td>' +
            '<td>' + adCopyUnits(item.text) + '</td>' +
            '<td>' + escapeHtml(item.creator) + '</td>' +
            '<td>' + escapeHtml(item.createdAt) + '</td>' +
          '</tr>'
        );
      }).join('');
    }
    var all = $('adPickCheckAll');
    if (all) {
      var hit = 0;
      pageRows.forEach(function (row) {
        if (adCopyPickDraftIds.indexOf(row.id) >= 0) hit += 1;
      });
      all.checked = pageRows.length > 0 && hit === pageRows.length;
      all.indeterminate = hit > 0 && hit < pageRows.length;
    }
    if (UI.renderPagination) {
      UI.renderPagination({
        containerId: 'adPickPagination',
        total: list.length,
        page: adPickPage,
        pageSize: adPickPageSize
      });
    }
    layoutAdCopyLibTable($('adPickTable'));
    syncAdCopyPickLimit();
  }

  function switchAdCopyLibTab(next) {
    adCopyLibTab = next === 'pack' ? 'pack' : 'copy';
    document.querySelectorAll('[data-ad-copy-tab]').forEach(function (btn) {
      var on = btn.getAttribute('data-ad-copy-tab') === adCopyLibTab;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    var pickPanel = $('adPickPanel');
    var packPanel = $('adPackPanel');
    if (pickPanel) {
      pickPanel.hidden = adCopyLibTab !== 'copy';
      pickPanel.classList.toggle('is-active', adCopyLibTab === 'copy');
    }
    if (packPanel) {
      packPanel.hidden = adCopyLibTab !== 'pack';
      packPanel.classList.toggle('is-active', adCopyLibTab === 'pack');
    }
    if (UI.closePanels) UI.closePanels();
    if (adCopyLibTab === 'copy') renderAdPickTable();
    else renderAdPackTable();
    syncAdCopyPickLimit();
  }

  function openAdCopyPickDrawer() {
    adCopyPackDraftId = '';
    adCopyPackExpanded = {};
    adCopyPickDraftIds = [];
    adPackDraft = { name: '', creators: [] };
    adPackApplied = { name: '', creators: [] };
    adPackPage = 1;
    adPickDraft = { text: '', creators: [] };
    adPickApplied = { text: '', creators: [] };
    adPickPage = 1;
    var pickInput = $('adPickTextFilter');
    if (pickInput) pickInput.value = '';
    var packInput = $('adPackNameFilter');
    if (packInput) packInput.value = '';
    if (adPickCreatorMulti) adPickCreatorMulti.render();
    if (adPackCreatorMulti) adPackCreatorMulti.render();
    switchAdCopyLibTab('copy');
    UI.openDrawer('adCopyPickDrawer');
    requestAnimationFrame(function () {
      layoutAdCopyLibTables();
    });
  }

  function closeAdCopyPickDrawer() {
    UI.closeDrawer('adCopyPickDrawer');
  }

  function submitAdCopyPickDrawer() {
    if (adCopyLibTab === 'pack') {
      var pack = findAdCopyPack(adCopyPackDraftId);
      if (!pack) {
        UI.showToast('请选择标题包', 'warning');
        return;
      }
      if (replaceAdTitles(pack.texts, { toast: '已应用标题包「' + pack.name + '」' })) {
        closeAdCopyPickDrawer();
      }
      return;
    }
    var texts = adCopyPickDraftIds.map(function (id) {
      var item = findAdCopyItem(id);
      return item ? item.text : '';
    }).filter(Boolean);
    if (appendAdTitles(texts, { toast: '已添加文案' })) {
      closeAdCopyPickDrawer();
    }
  }

  function bindAdCopyLineEditor(editorId, options) {
    var lines = [''];
    var max = (options && options.max) || 0;
    var root = $(editorId);
    if (!root) return null;

    function render(focusIndex, caret) {
      root.innerHTML = lines.map(function (text, index) {
        var over = adCopyUnits(text) > AD_COPY_UNITS_MAX;
        return (
          '<div class="line-editor__row' + (over ? ' is-over' : '') + '">' +
            '<span class="line-editor__no">' + (index + 1) + '</span>' +
            '<div class="line-editor__field">' +
              '<input class="line-editor__input" type="text" data-index="' + index + '" value="' + escapeHtml(text) + '" placeholder="' + escapeHtml(AD_COPY_LINE_PLACEHOLDER) + '" autocomplete="off" />' +
              '<button class="line-editor__clear" type="button" data-clear="' + index + '" aria-label="清除"' + (text ? '' : ' hidden') + '>' + AD_COPY_LINE_CLEAR + '</button>' +
            '</div>' +
          '</div>'
        );
      }).join('');
      if (options && options.onSync) options.onSync();
      if (focusIndex == null) return;
      var input = root.querySelector('.line-editor__input[data-index="' + focusIndex + '"]');
      if (!input) return;
      input.focus();
      var pos = caret == null ? input.value.length : Math.min(caret, input.value.length);
      input.setSelectionRange(pos, pos);
    }

    root.addEventListener('input', function (e) {
      var input = e.target.closest('.line-editor__input');
      if (!input || !root.contains(input)) return;
      var index = Number(input.getAttribute('data-index'));
      var text = input.value;
      var row = input.closest('.line-editor__row');
      var clear = row.querySelector('.line-editor__clear');
      lines[index] = text;
      row.classList.toggle('is-over', adCopyUnits(text) > AD_COPY_UNITS_MAX);
      if (clear) clear.hidden = !text;
      if (options && options.onSync) options.onSync();
    });

    root.addEventListener('keydown', function (e) {
      var input = e.target.closest('.line-editor__input');
      if (!input || !root.contains(input)) return;
      var index = Number(input.getAttribute('data-index'));
      if (e.key === 'Enter') {
        e.preventDefault();
        if (max && lines.length >= max) {
          if (options && options.onLimit) options.onLimit();
          return;
        }
        var caret = input.selectionStart || 0;
        lines[index] = input.value.slice(0, caret);
        lines.splice(index + 1, 0, input.value.slice(caret));
        render(index + 1, 0);
        return;
      }
      if (e.key === 'Backspace' && input.selectionStart === 0 && input.selectionEnd === 0 && index > 0) {
        e.preventDefault();
        var prev = lines[index - 1];
        lines[index - 1] = prev + input.value;
        lines.splice(index, 1);
        render(index - 1, prev.length);
      }
    });

    root.addEventListener('paste', function (e) {
      var input = e.target.closest('.line-editor__input');
      if (!input || !root.contains(input)) return;
      var pasted = (e.clipboardData || window.clipboardData).getData('text') || '';
      if (pasted.indexOf('\n') === -1 && pasted.indexOf('\r') === -1) return;
      e.preventDefault();
      var index = Number(input.getAttribute('data-index'));
      var start = input.selectionStart || 0;
      var end = input.selectionEnd || 0;
      var merged = input.value.slice(0, start) + pasted.replace(/\r\n/g, '\n').replace(/\r/g, '\n') + input.value.slice(end);
      var parts = merged.split('\n');
      var next = lines.slice(0, index).concat(parts, lines.slice(index + 1));
      var limited = false;
      if (max && next.length > max) {
        next = next.slice(0, max);
        limited = true;
      }
      lines = next;
      var focus = Math.min(index + parts.length - 1, lines.length - 1);
      render(focus, lines[focus].length);
      if (limited && options && options.onLimit) options.onLimit();
    });

    root.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-clear]');
      if (!btn || !root.contains(btn)) return;
      var index = Number(btn.getAttribute('data-clear'));
      if (lines.length <= 1) {
        lines[0] = '';
        render(0, 0);
        return;
      }
      lines.splice(index, 1);
      render(Math.min(index, lines.length - 1), 0);
    });

    return {
      getLines: function () { return lines.slice(); },
      setLines: function (next) {
        lines = next && next.length ? next.slice() : [''];
        if (max && lines.length > max) lines = lines.slice(0, max);
      },
      render: render
    };
  }

  function syncAdCopyBatchError() {
    var item = $('adCopyBatchItem');
    if (!item || !adCopyBatchEditor) return;
    var raw = adCopyBatchEditor.getLines();
    var over = raw.some(function (line) { return adCopyUnits(line) > AD_COPY_UNITS_MAX; });
    if (over) {
      item.classList.add('is-error');
      var err = item.querySelector('.form-item__error');
      if (err) err.textContent = '文案不能超过100个字符';
    } else if (raw.some(function (line) { return String(line).trim(); })) {
      item.classList.remove('is-error');
    }
  }

  function openAdCopyBatchModal() {
    var item = $('adCopyBatchItem');
    if (item) item.classList.remove('is-error');
    if (!adCopyBatchEditor) {
      adCopyBatchEditor = bindAdCopyLineEditor('adCopyBatchEditor', {
        max: AD_COPY_MAX,
        onSync: syncAdCopyBatchError,
        onLimit: function () {
          UI.showToast('最多添加 ' + AD_COPY_MAX + ' 条文案', 'warning');
        }
      });
    }
    if (adCopyBatchEditor) {
      adCopyBatchEditor.setLines(['']);
      adCopyBatchEditor.render(0, 0);
    }
    UI.openModal('adCopyBatchModal');
  }

  function setCtaForActive(arr) {
    if (!activeCtaAccountId) return;
    state.ctaByAccount[activeCtaAccountId] = arr.slice();
    var missing = (state.selectedAccountIds || []).some(function (id) {
      return !(state.ctaByAccount[id] || []).length;
    });
    if (!missing) setFormItemError('adCtaItem', false);
    renderAdCtaSharedPanel();
  }

  function hasSelectedAdAccounts() {
    return !!(state.selectedAccountIds && state.selectedAccountIds.length);
  }

  function syncAdFormVisibility() {
    var hasAccounts = hasSelectedAdAccounts();
    var empty = $('adFormEmpty');
    var body = $('adFormBody');
    if (empty) empty.hidden = hasAccounts;
    if (body) body.hidden = !hasAccounts;
    if (!hasAccounts) closeAdCtaPanel();
    /* 展开广告设置时确保文案区至少有一行输入 */
    if (hasAccounts) {
      state.adTitles = normalizeAdTitles(state.adTitles);
      renderAdCopyList();
    }
  }

  function syncAdAccountDependent() {
    ensureAdMapsForAccounts();
    syncAdFormVisibility();
    if (!hasSelectedAdAccounts()) return;
    if (state.publishMode === '按账户') renderAdTtTable();
    renderAdCtaTable();
  }

  function syncAdForm() {
    syncAdFormVisibility();
    var nameInput = $('adName');
    if (nameInput) nameInput.value = state.adName || '';
    syncNameTokenTags('adName');
    if (!hasSelectedAdAccounts()) return;
    syncSegValue('adPublishModeSeg', state.publishMode);
    syncSegValue('adCtaModeSeg', state.ctaMode);
    syncAdPublishModeUi();
    if (adTtUnifiedApi) adTtUnifiedApi.setValue(state.ttIdentityId);
    renderAdCopyList();
    var landingInput = $('adLandingUrl');
    if (landingInput) landingInput.value = state.landingUrl || '';
    var landingWrap = $('adLandingWrap');
    if (landingWrap) landingWrap.classList.toggle('has-value', !!(state.landingUrl || '').trim());
    renderAdCtaTable();
  }

  function resetAdForm() {
    state.adName = '{YYYYMMDD}_{序号}';
    state.publishMode = '统一分配';
    state.ttIdentityId = '';
    state.ttIdentityByAccount = {};
    state.ctaMode = '动态优选';
    state.ctaByAccount = {};
    state.adTitles = [''];
    state.landingUrl = '';
    state.landingManual = false;
    ensureAdMapsForAccounts();
    syncAdLandingFromMini(true);
    syncAdForm();
  }

  function bindAdTtTableEvents() {
    var tbody = $('adTtBody');
    if (!tbody || tbody.getAttribute('data-bound') === '1') return;
    tbody.setAttribute('data-bound', '1');
    tbody.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-tt-trigger]');
      if (!trigger) return;
      e.stopPropagation();
      var id = trigger.getAttribute('data-tt-trigger');
      var wrap = tbody.querySelector('[data-tt-wrap="' + id + '"]');
      var panel = wrap ? wrap.querySelector('[data-tt-panel="' + id + '"]') : null;
      if (!panel) panel = document.body.querySelector('[data-tt-panel="' + id + '"]');
      var open = panel && !panel.classList.contains('is-open');
      closeAdTtPanels();
      closeAdCtaPanel();
      UI.closePanels();
      if (!open || !panel) return;
      panel.classList.add('is-open');
      trigger.classList.add('is-open');
      placePortalPanel(panel, trigger, Math.max(trigger.offsetWidth, 320));
    });
    document.addEventListener('click', function () {
      closeAdTtPanels();
    });
  }

  function bindAdCtaTableEvents() {
    var tbody = $('adCtaBody');
    var panel = $('adCtaSharedPanel');
    if (!tbody || !panel || tbody.getAttribute('data-bound') === '1') return;
    tbody.setAttribute('data-bound', '1');

    tbody.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-cta-trigger]');
      if (!trigger) return;
      e.stopPropagation();
      var id = trigger.getAttribute('data-cta-trigger');
      var open = activeCtaAccountId !== id || !panel.classList.contains('is-open');
      closeAdTtPanels();
      closeAdCtaPanel();
      UI.closePanels();
      if (!open) return;
      activeCtaAccountId = id;
      var search = $('adCtaSharedSearch');
      if (search) search.value = '';
      renderAdCtaSharedPanel();
      panel.classList.add('is-open');
      trigger.classList.add('is-open');
      placePortalPanel(panel, trigger, 600);
    });

    panel.addEventListener('click', function (e) { e.stopPropagation(); });

    var list = $('adCtaSharedList');
    if (list) {
      list.addEventListener('change', function (e) {
        var input = e.target.closest('input[type="checkbox"]');
        if (!input || !activeCtaAccountId) return;
        if (input.hasAttribute('data-cta-select-all')) {
          setCtaForActive(input.checked ? defaultCtaSelected() : []);
          return;
        }
        var selected = (state.ctaByAccount[activeCtaAccountId] || []).slice();
        if (input.checked) {
          if (selected.indexOf(input.value) < 0) selected.push(input.value);
        } else {
          selected = selected.filter(function (n) { return n !== input.value; });
        }
        setCtaForActive(selected);
      });
    }

    var selectedEl = $('adCtaSharedSelected');
    if (selectedEl) {
      selectedEl.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-remove]');
        if (!btn || !activeCtaAccountId) return;
        var name = btn.getAttribute('data-remove');
        setCtaForActive((state.ctaByAccount[activeCtaAccountId] || []).filter(function (n) { return n !== name; }));
      });
    }

    var clearBtn = $('adCtaSharedClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (!activeCtaAccountId) return;
        setCtaForActive([]);
      });
    }
    var search = $('adCtaSharedSearch');
    if (search) {
      search.addEventListener('input', function () {
        renderAdCtaSharedPanel();
      });
    }

    document.addEventListener('click', function () {
      closeAdCtaPanel();
    });
    window.addEventListener('resize', function () {
      if (!panel.classList.contains('is-open') || !activeCtaAccountId) return;
      var trigger = document.querySelector('[data-cta-trigger="' + activeCtaAccountId + '"]');
      if (trigger) placePortalPanel(panel, trigger, 600);
    });
    var main = $('createAdMain');
    if (main) {
      main.addEventListener('scroll', function () {
        if (!panel.classList.contains('is-open') || !activeCtaAccountId) return;
        var trigger = document.querySelector('[data-cta-trigger="' + activeCtaAccountId + '"]');
        if (trigger) placePortalPanel(panel, trigger, 600);
      });
    }
  }

  function bindAdCard() {
    if (UI.closePanels && !UI.closePanels.__createAdPatched) {
      var origClosePanels = UI.closePanels;
      UI.closePanels = function () {
        closeAdCtaPanel();
        closeAdTtPanels();
        closeAuthPanels();
        origClosePanels();
      };
      UI.closePanels.__createAdPatched = true;
    }

    bindSeg('adPublishModeSeg', null, function (v) {
      state.publishMode = v || '统一分配';
      syncAdPublishModeUi();
    });
    bindSeg('adCtaModeSeg', null, function (v) {
      state.ctaMode = v || '动态优选';
    });

    adTtUnifiedApi = bindCreateAdSearchSingle({
      wrapId: 'adTtUnifiedWrap',
      triggerId: 'adTtUnifiedTrigger',
      panelId: 'adTtUnifiedPanel',
      labelId: 'adTtUnifiedLabel',
      listId: 'adTtUnifiedList',
      searchId: 'adTtUnifiedSearch',
      clearId: 'adTtUnifiedClear',
      getOptions: function () { return TT_IDENTITY_OPTIONS.slice(); },
      getLabel: function (item) { return item.name; },
      getValue: function (item) { return item.id; },
      renderLabel: function (item) { return ttTriggerHtml(item); },
      renderOption: function (item, selected) { return ttOptionHtml(item, selected); },
      onChange: function (value) {
        state.ttIdentityId = value || '';
        if (String(state.ttIdentityId).trim()) setFormItemError('adTtUnifiedItem', false);
      }
    });
    var ttSyncBtn = $('adTtUnifiedSync');
    if (ttSyncBtn) {
      ttSyncBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        syncTtIdentityOptions();
      });
    }
    bindSelectPanelPortal('adTtUnifiedWrap', 'adTtUnifiedTrigger', 'adTtUnifiedPanel', 600);

    bindAdTtTableEvents();
    bindAdCtaTableEvents();

    var copyList = $('adCopyList');
    if (copyList && copyList.getAttribute('data-bound') !== '1') {
      copyList.setAttribute('data-bound', '1');
      copyList.addEventListener('input', function (e) {
        var input = e.target.closest('[data-ad-copy-input]');
        if (!input) return;
        var idx = parseInt(input.getAttribute('data-ad-copy-input'), 10);
        if (isNaN(idx)) return;
        state.adTitles = normalizeAdTitles(state.adTitles);
        state.adTitles[idx] = input.value;
        if (state.adTitles.some(function (t) { return String(t || '').trim(); })) {
          setFormItemError('adCopyItem', false);
        }
        var field = input.closest('.create-ad-copy__field');
        var units = adCopyUnits(input.value);
        if (field) {
          field.classList.toggle('is-over', units > AD_COPY_UNITS_MAX);
          var tip = field.querySelector('.create-ad-copy__units');
          if (tip) tip.textContent = units + ' / ' + AD_COPY_UNITS_MAX;
        }
      });
      copyList.addEventListener('click', function (e) {
        var removeBtn = e.target.closest('[data-ad-copy-remove]');
        if (!removeBtn) return;
        var idx = parseInt(removeBtn.getAttribute('data-ad-copy-remove'), 10);
        if (isNaN(idx)) return;
        var next = normalizeAdTitles(state.adTitles).slice();
        if (next.length <= 1) return;
        next.splice(idx, 1);
        setAdTitles(next);
      });
    }
    var copyAddBtn = $('adCopyAddBtn');
    if (copyAddBtn) {
      copyAddBtn.addEventListener('click', function () {
        var next = normalizeAdTitles(state.adTitles).slice();
        if (next.length >= AD_COPY_MAX) {
          UI.showToast('最多添加 ' + AD_COPY_MAX + ' 条文案', 'warning');
          return;
        }
        next.push('');
        setAdTitles(next);
        var focus = document.querySelector('[data-ad-copy-input="' + (next.length - 1) + '"]');
        if (focus) focus.focus();
      });
    }

    if (UI.bindMultiSelect) {
      adPackCreatorMulti = UI.bindMultiSelect({
        wrapId: 'adPackCreatorWrap',
        triggerId: 'adPackCreatorTrigger',
        panelId: 'adPackCreatorPanel',
        labelId: 'adPackCreatorLabel',
        listId: 'adPackCreatorList',
        clearId: 'adPackCreatorClear',
        prefix: '创建人：',
        getOptions: adCopyCreatorOptions,
        getSelected: function () { return adPackDraft.creators; },
        setSelected: function (arr) { adPackDraft.creators = arr.slice(); }
      });
      adPickCreatorMulti = UI.bindMultiSelect({
        wrapId: 'adPickCreatorWrap',
        triggerId: 'adPickCreatorTrigger',
        panelId: 'adPickCreatorPanel',
        labelId: 'adPickCreatorLabel',
        listId: 'adPickCreatorList',
        clearId: 'adPickCreatorClear',
        prefix: '创建人：',
        getOptions: adCopyCreatorOptions,
        getSelected: function () { return adPickDraft.creators; },
        setSelected: function (arr) { adPickDraft.creators = arr.slice(); }
      });
    }
    if (UI.bindInputClearable) {
      UI.bindInputClearable({ wrapId: 'adPackNameFilterWrap' });
      UI.bindInputClearable({ wrapId: 'adPickTextFilterWrap' });
    }
    if (UI.bindPagination) {
      UI.bindPagination({
        containerId: 'adPackPagination',
        getTotal: function () { return filteredAdPacks().length; },
        getPage: function () { return adPackPage; },
        getPageSize: function () { return adPackPageSize; },
        onPageChange: function (page) { adPackPage = page; renderAdPackTable(); },
        onPageSizeChange: function (size) { adPackPageSize = size; adPackPage = 1; renderAdPackTable(); }
      });
      UI.bindPagination({
        containerId: 'adPickPagination',
        getTotal: function () { return filteredAdCopies().length; },
        getPage: function () { return adPickPage; },
        getPageSize: function () { return adPickPageSize; },
        onPageChange: function (page) { adPickPage = page; renderAdPickTable(); },
        onPageSizeChange: function (size) { adPickPageSize = size; adPickPage = 1; renderAdPickTable(); }
      });
    }

    function applyAdPackQuery() {
      adPackDraft.name = ($('adPackNameFilter') && $('adPackNameFilter').value) || '';
      adPackApplied = { name: adPackDraft.name, creators: adPackDraft.creators.slice() };
      adPackPage = 1;
      renderAdPackTable();
    }
    function resetAdPackQuery() {
      adPackDraft = { name: '', creators: [] };
      var input = $('adPackNameFilter');
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (adPackCreatorMulti) adPackCreatorMulti.render();
      applyAdPackQuery();
    }
    function applyAdPickQuery() {
      adPickDraft.text = ($('adPickTextFilter') && $('adPickTextFilter').value) || '';
      adPickApplied = { text: adPickDraft.text, creators: adPickDraft.creators.slice() };
      adPickPage = 1;
      renderAdPickTable();
    }
    function resetAdPickQuery() {
      adPickDraft = { text: '', creators: [] };
      var input = $('adPickTextFilter');
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (adPickCreatorMulti) adPickCreatorMulti.render();
      applyAdPickQuery();
    }

    var pickBtn = $('adCopyPickBtn');
    if (pickBtn) pickBtn.addEventListener('click', openAdCopyPickDrawer);
    var batchBtn = $('adCopyBatchBtn');
    if (batchBtn) batchBtn.addEventListener('click', openAdCopyBatchModal);

    document.querySelectorAll('[data-ad-copy-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchAdCopyLibTab(btn.getAttribute('data-ad-copy-tab'));
      });
    });

    ['adCopyPickDrawerClose', 'adCopyPickCancel'].forEach(function (id) {
      var btn = $(id);
      if (btn) btn.addEventListener('click', closeAdCopyPickDrawer);
    });
    var pickSubmit = $('adCopyPickSubmit');
    if (pickSubmit) pickSubmit.addEventListener('click', submitAdCopyPickDrawer);

    var packQuery = $('adPackQueryBtn');
    if (packQuery) packQuery.addEventListener('click', applyAdPackQuery);
    var packReset = $('adPackResetBtn');
    if (packReset) packReset.addEventListener('click', resetAdPackQuery);
    var packNameFilter = $('adPackNameFilter');
    if (packNameFilter) {
      packNameFilter.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); applyAdPackQuery(); }
      });
    }
    var packBody = $('adPackBody');
    if (packBody && packBody.getAttribute('data-bound') !== '1') {
      packBody.setAttribute('data-bound', '1');
      packBody.addEventListener('change', function (e) {
        var input = e.target.closest('input[type="radio"]');
        if (!input) return;
        adCopyPackDraftId = input.value || '';
      });
      packBody.addEventListener('click', function (e) {
        var expand = e.target.closest('[data-ad-pack-expand]');
        if (expand) {
          e.stopPropagation();
          var eid = expand.getAttribute('data-ad-pack-expand');
          adCopyPackExpanded[eid] = !adCopyPackExpanded[eid];
          renderAdPackTable();
          return;
        }
        var tr = e.target.closest('tr[data-pack-id]');
        if (!tr || e.target.closest('input') || e.target.closest('button')) return;
        var rid = tr.getAttribute('data-pack-id');
        adCopyPackDraftId = rid;
        var radio = tr.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    }

    var pickQuery = $('adPickQueryBtn');
    if (pickQuery) pickQuery.addEventListener('click', applyAdPickQuery);
    var pickReset = $('adPickResetBtn');
    if (pickReset) pickReset.addEventListener('click', resetAdPickQuery);
    var pickTextFilter = $('adPickTextFilter');
    if (pickTextFilter) {
      pickTextFilter.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); applyAdPickQuery(); }
      });
    }
    var pickBody = $('adPickBody');
    if (pickBody && pickBody.getAttribute('data-bound') !== '1') {
      pickBody.setAttribute('data-bound', '1');
      pickBody.addEventListener('change', function (e) {
        var input = e.target.closest('input[data-ad-pick-id]');
        if (!input) return;
        var id = input.getAttribute('data-ad-pick-id');
        var idx = adCopyPickDraftIds.indexOf(id);
        if (input.checked && idx < 0) {
          if (adCopyPickDraftIds.length >= AD_COPY_MAX) {
            input.checked = false;
            UI.showToast('最多选择 ' + AD_COPY_MAX + ' 条文案', 'warning');
            return;
          }
          adCopyPickDraftIds.push(id);
        } else if (!input.checked && idx >= 0) {
          adCopyPickDraftIds.splice(idx, 1);
        }
        renderAdPickTable();
      });
      pickBody.addEventListener('click', function (e) {
        if (e.target.closest('input')) return;
        var tr = e.target.closest('tr[data-copy-id]');
        if (!tr) return;
        var input = tr.querySelector('input[data-ad-pick-id]');
        if (!input) return;
        input.checked = !input.checked;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
    var pickAll = $('adPickCheckAll');
    if (pickAll) {
      pickAll.addEventListener('change', function () {
        var pageRows = filteredAdCopies().slice((adPickPage - 1) * adPickPageSize, adPickPage * adPickPageSize);
        if (pickAll.checked) {
          var skipped = false;
          pageRows.forEach(function (row) {
            if (adCopyPickDraftIds.indexOf(row.id) >= 0) return;
            if (adCopyPickDraftIds.length >= AD_COPY_MAX) {
              skipped = true;
              return;
            }
            adCopyPickDraftIds.push(row.id);
          });
          if (skipped) UI.showToast('最多选择 ' + AD_COPY_MAX + ' 条文案', 'warning');
        } else {
          var remove = {};
          pageRows.forEach(function (row) { remove[row.id] = true; });
          adCopyPickDraftIds = adCopyPickDraftIds.filter(function (id) { return !remove[id]; });
        }
        renderAdPickTable();
      });
    }

    var batchSubmit = $('adCopyBatchSubmit');
    if (batchSubmit) {
      batchSubmit.addEventListener('click', function () {
        var item = $('adCopyBatchItem');
        if (!adCopyBatchEditor) {
          if (item) item.classList.add('is-error');
          return;
        }
        var raw = adCopyBatchEditor.getLines();
        var lines = raw.map(function (line) { return String(line || '').trim(); }).filter(Boolean);
        if (!lines.length) {
          if (item) {
            item.classList.add('is-error');
            var err = item.querySelector('.form-item__error');
            if (err) err.textContent = '请输入文案';
          }
          return;
        }
        if (raw.some(function (line) { return adCopyUnits(line) > AD_COPY_UNITS_MAX; })) {
          if (item) {
            item.classList.add('is-error');
            var err2 = item.querySelector('.form-item__error');
            if (err2) err2.textContent = '文案不能超过100个字符';
          }
          return;
        }
        if (item) item.classList.remove('is-error');
        if (lines.length > AD_COPY_MAX) {
          UI.showToast('最多添加 ' + AD_COPY_MAX + ' 条文案，已截取前 ' + AD_COPY_MAX + ' 条', 'warning');
          lines = lines.slice(0, AD_COPY_MAX);
        }
        if (replaceAdTitles(lines, { toast: '已添加文案' })) {
          UI.closeModal('adCopyBatchModal');
        }
      });
    }

    var landingInput = $('adLandingUrl');
    if (landingInput) {
      landingInput.addEventListener('input', function () {
        state.landingUrl = landingInput.value;
        state.landingManual = true;
        var wrap = $('adLandingWrap');
        if (wrap) wrap.classList.toggle('has-value', !!(landingInput.value || '').trim());
        if (String(landingInput.value || '').trim()) setFormItemError('adLandingItem', false);
      });
    }
    if (UI.bindInputClearable) {
      UI.bindInputClearable({
        wrapId: 'adLandingWrap',
        clearId: 'adLandingClear',
        onClear: function () {
          state.landingUrl = '';
          state.landingManual = true;
        }
      });
    }
    var landingSync = $('adLandingSync');
    if (landingSync) {
      landingSync.addEventListener('click', function () {
        syncAdLandingFromMini(true);
      });
    }

    ensureAdMapsForAccounts();
    syncAdLandingFromMini(true);
    syncAdForm();
  }

  var CREATIVE_FOLDER_ICON = '<img class="tree-node__icon" src="素材/文件夹.png" width="16" height="16" alt="" />';
  var CREATIVE_SYS_FOLDER = (window.MaterialFolderData && window.MaterialFolderData.SYSTEM_FOLDER) || {
    id: 'system_all',
    name: '全部素材',
    system: true,
    children: []
  };
  var CREATIVE_CUSTOM_FOLDERS = (window.MaterialFolderData && window.MaterialFolderData.CUSTOM_FOLDERS) || [];
  var CREATIVE_SEED = window.MaterialSeedData || null;
  var CREATIVE_USERS = (CREATIVE_SEED && CREATIVE_SEED.USERS) || Array.from({ length: 10 }, function (_, i) {
    return '用户' + String.fromCharCode(65 + i);
  });
  var CREATIVE_SYS_TAGS = (CREATIVE_SEED && CREATIVE_SEED.SYSTEM_TAG_NAMES)
    ? CREATIVE_SEED.SYSTEM_TAG_NAMES.slice()
    : ['衍生', '未使用', '已使用', '无消耗', '有消耗'];
  var CREATIVE_DURATION_OPTS = ['0-6s', '7-15s', '16-30s', '31-60s', '>60s'];
  var CREATIVE_CLEAR_ICON = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l6 6M9 3L3 9"/></svg>';
  var CREATIVE_MANUAL_TAG_TREE = (CREATIVE_SEED && CREATIVE_SEED.FORM_TAG_TREE) || [
    { id: 'lang', label: '语言', children: ['英语', '日语', '繁中'] },
    { id: 'mix', label: '混合玩法', children: ['消消乐', '清理', '保护系列'] },
    { id: 'feat', label: '素材特点', children: ['CTR', '副玩法', 'DOGE'] },
    { id: 'fest', label: '节日限定', children: ['圣诞节', '夏日'] }
  ];
  var CREATIVE_TYPE_TREE = (CREATIVE_SEED && CREATIVE_SEED.TYPE_TREE) || [
    { id: 'video', label: '视频', children: ['mp4', 'mov', 'avi', 'mpeg'] },
    { id: 'image', label: '图片', children: ['jpg', 'jpeg', 'png', 'bmp', 'gif'] }
  ];
  var CREATIVE_SIZE_TREE = (CREATIVE_SEED && CREATIVE_SEED.SIZE_TREE) || [
    { id: 'portrait', label: '竖版(9:16)', children: ['1080x1920', '720x1280'] },
    { id: 'landscape', label: '横版(16:9)', children: ['1920x1080', '1280x720'] },
    { id: 'square', label: '方形(1:1)', children: ['1080x1080', '800x800', '512x512', '300x300', '180x180'] },
    { id: 'other', label: '其他', children: ['1200x628'] }
  ];
  var CREATIVE_DEFAULT_FILTERS = ['date', 'name', 'creator', 'sysTag'];
  var CREATIVE_ALL_FILTERS = [
    { key: 'date', label: '上传时间', kind: 'date' },
    { key: 'name', label: '素材名称', kind: 'keyword', inputId: 'creativePickNameInput' },
    { key: 'creator', label: '创意人', kind: 'multi', options: CREATIVE_USERS },
    { key: 'sysTag', label: '系统标签', kind: 'multi', options: CREATIVE_SYS_TAGS },
    { key: 'manualTag', label: '手动标签', kind: 'cascade', tree: CREATIVE_MANUAL_TAG_TREE },
    { key: 'type', label: '类型', kind: 'cascade', tree: CREATIVE_TYPE_TREE },
    { key: 'size', label: '尺寸', kind: 'cascade', tree: CREATIVE_SIZE_TREE },
    { key: 'duration', label: '时长', kind: 'multi', options: CREATIVE_DURATION_OPTS },
    { key: 'source', label: '来源', kind: 'single', options: ['本地上传', '外部采集'] },
    { key: 'xmp', label: '同步XMP', kind: 'single', options: ['是', '否'] },
    { key: 'mediaId', label: '媒体素材ID', kind: 'keyword', inputId: 'creativePickMediaIdInput' }
  ];
  var CREATIVE_COLUMN_GROUPS = ['属性', '数据'];
  function creativeColDef(key, name, group, kind, width, def, frozen, sortable) {
    return {
      key: key,
      name: name,
      group: group,
      kind: kind,
      width: width,
      def: !!def,
      defaultFrozen: !!frozen,
      sortable: !!sortable
    };
  }
  var CREATIVE_COLUMNS = [
    creativeColDef('id', 'ID', '属性', 'text', 88, true, true, false),
    creativeColDef('name', '素材', '属性', 'text', 280, true, true, false),
    creativeColDef('tags', '标签', '属性', 'text', 200, true, false, false),
    creativeColDef('creator', '创意人', '属性', 'text', 100, true, false, false),
    creativeColDef('file_type', '类型', '属性', 'text', 100, false, false, false),
    creativeColDef('file_format', '格式', '属性', 'text', 100, false, false, false),
    creativeColDef('width_height', '尺寸', '属性', 'text', 100, false, false, false),
    creativeColDef('duration', '时长 (秒)', '属性', 'int', 100, false, false, false),
    creativeColDef('source', '来源', '属性', 'text', 100, true, false, false),
    creativeColDef('uploaded_at', '上传时间', '属性', 'datetime', 180, true, false, true),
    creativeColDef('xmp_synced', '同步XMP', '属性', 'text', 100, false, false, false),
    creativeColDef('ad_count', '关联广告数', '属性', 'int', 120, true, false, true),
    creativeColDef('reject_count', '拒审次数', '属性', 'int', 120, true, false, true),
    creativeColDef('spend', '总消耗', '数据', 'float', 120, true, false, true),
    creativeColDef('impressions', '展示数', '数据', 'int', 120, true, false, true),
    creativeColDef('clicks', '点击数', '数据', 'int', 120, true, false, true),
    creativeColDef('ctr', '点击率', '数据', 'percent', 120, true, false, true),
    creativeColDef('cpc', '单次点击成本', '数据', 'float', 120, false, false, true),
    creativeColDef('cpm', '千次展示成本', '数据', 'float', 120, false, false, true),
    creativeColDef('conversions', '转化数', '数据', 'int', 120, true, false, true),
    creativeColDef('cvr', '转化率', '数据', 'percent', 120, false, false, true),
    creativeColDef('cpa', '转化成本', '数据', 'float', 120, false, false, true),
    creativeColDef('video_views', '播放数', '数据', 'int', 120, true, false, true),
    creativeColDef('video_p100', '完播数', '数据', 'int', 120, true, false, true),
    creativeColDef('video_p100_rate', '完播率', '数据', 'percent', 120, true, false, true),
    creativeColDef('video_p75', '75%播放数', '数据', 'int', 120, false, false, true),
    creativeColDef('video_p75_rate', '75%播放率', '数据', 'percent', 120, false, false, true),
    creativeColDef('video_p50', '50%播放数', '数据', 'int', 120, false, false, true),
    creativeColDef('video_p50_rate', '50%播放率', '数据', 'percent', 120, false, false, true),
    creativeColDef('video_p25', '25%播放数', '数据', 'int', 120, false, false, true),
    creativeColDef('video_p25_rate', '25%播放率', '数据', 'percent', 120, false, false, true)
  ];
  var CREATIVE_COLUMN_MAP = {};
  CREATIVE_COLUMNS.forEach(function (col) { CREATIVE_COLUMN_MAP[col.key] = col; });
  var CREATIVE_DEFAULT_COLUMNS = CREATIVE_COLUMNS.filter(function (col) { return col.def; }).map(function (col) { return col.key; });
  var CREATIVE_DEFAULT_FROZEN = CREATIVE_COLUMNS.filter(function (col) { return col.def && col.defaultFrozen; }).length;

  var CREATIVE_VIDEO_SEED = buildCreativeVideoSeed();
  var creativePicker = {
    folderId: CREATIVE_SYS_FOLDER.id,
    folderKw: '',
    showDeliveryData: false,
    deliveryDataReady: false,
    deliveryDateCleared: false,
    page: 1,
    pageSize: loadCreativePickPageSize(),
    rememberPage: loadCreativePickRemember(),
    paginationBound: false,
    draftIds: [],
    expanded: {},
    visibleFilters: CREATIVE_DEFAULT_FILTERS.slice(),
    columns: CREATIVE_DEFAULT_COLUMNS.slice(),
    frozenCount: CREATIVE_DEFAULT_FROZEN,
    columnDraft: [],
    draftFrozenCount: CREATIVE_DEFAULT_FROZEN,
    metricCat: '属性',
    sortSpecs: [],
    draft: emptyCreativePickDraft(),
    applied: emptyCreativePickDraft(),
    /** 非空时：向指定创意组追加/替换素材，不重分配全部创意组 */
    targetGroupId: ''
  };
  var creativePickCreatorMulti = null;
  var creativePickSysTagMulti = null;
  var creativePickDurationMulti = null;
  var creativePickManualTagCascade = null;
  var creativePickTypeCascade = null;
  var creativePickSizeCascade = null;
  var creativePickDateApi = null;
  var creativePickDataDateApi = null;
  var creativePickSortApi = null;

  var CREATIVE_PICK_PAGE_SIZES = [10, 20, 50, 100, 500];
  var CREATIVE_PICK_PAGE_KEY = 'tiktokCreateAd.creativePick.pageSize';
  var CREATIVE_PICK_PAGE_NO_KEY = 'tiktokCreateAd.creativePick.page';
  var CREATIVE_PICK_REMEMBER_KEY = 'tiktokCreateAd.creativePick.rememberPage';

  function emptyCreativePickDraft() {
    return {
      dateStart: '',
      dateEnd: '',
      name: '',
      creator: [],
      sysTag: [],
      manualTag: [],
      type: [],
      size: [],
      duration: [],
      source: '',
      xmp: '',
      mediaId: ''
    };
  }

  function loadCreativePickRemember() {
    try {
      var raw = localStorage.getItem(CREATIVE_PICK_REMEMBER_KEY);
      if (raw == null) return true;
      return raw !== '0';
    } catch (err) {
      return true;
    }
  }

  function loadCreativePickPageSize() {
    if (!loadCreativePickRemember()) return 20;
    try {
      var n = parseInt(localStorage.getItem(CREATIVE_PICK_PAGE_KEY), 10);
      if (CREATIVE_PICK_PAGE_SIZES.indexOf(n) >= 0) return n;
    } catch (err) { /* ignore */ }
    return 20;
  }

  function loadCreativePickPageNo() {
    if (!loadCreativePickRemember()) return 1;
    try {
      var n = parseInt(localStorage.getItem(CREATIVE_PICK_PAGE_NO_KEY), 10);
      if (n >= 1) return n;
    } catch (err) { /* ignore */ }
    return 1;
  }

  function persistCreativePickPagination() {
    try {
      if (creativePicker.rememberPage) {
        localStorage.setItem(CREATIVE_PICK_REMEMBER_KEY, '1');
        localStorage.setItem(CREATIVE_PICK_PAGE_KEY, String(creativePicker.pageSize));
        localStorage.setItem(CREATIVE_PICK_PAGE_NO_KEY, String(Math.max(1, creativePicker.page || 1)));
      } else {
        localStorage.setItem(CREATIVE_PICK_REMEMBER_KEY, '0');
        localStorage.removeItem(CREATIVE_PICK_PAGE_KEY);
        localStorage.removeItem(CREATIVE_PICK_PAGE_NO_KEY);
      }
    } catch (err) { /* ignore */ }
  }

  function clampCreativePickPage(total) {
    var size = creativePicker.pageSize || 20;
    var maxPage = Math.max(1, Math.ceil((total || 0) / size) || 1);
    if (creativePicker.page > maxPage) creativePicker.page = maxPage;
    if (creativePicker.page < 1) creativePicker.page = 1;
    return creativePicker.page;
  }

  function flattenCreativeTreeLeaves(tree) {
    var out = [];
    (tree || []).forEach(function (g) {
      (g.children || []).forEach(function (c) {
        if (out.indexOf(c) === -1) out.push(c);
      });
    });
    return out;
  }

  /** 抽屉内日期面板挂 body，避免被冻结表头盖住 */
  function bindCreativeDatePanelPortal(panelId, triggerId) {
    var panel = $(panelId);
    var trigger = $(triggerId);
    if (!panel || !trigger || panel.__datePortalBound) return;
    panel.__datePortalBound = true;
    if (!panel.__dateHost) panel.__dateHost = panel.parentElement;

    function unportal() {
      panel.classList.remove('date-panel--portal');
      panel.style.position = '';
      panel.style.left = '';
      panel.style.top = '';
      panel.style.right = '';
      panel.style.bottom = '';
      panel.style.margin = '';
      panel.style.zIndex = '';
      var host = panel.__dateHost;
      if (host && panel.parentElement !== host) host.appendChild(panel);
    }

    function portal() {
      if (!panel.classList.contains('is-open')) {
        unportal();
        return;
      }
      if (!panel.__dateHost) panel.__dateHost = panel.parentElement;
      if (panel.parentElement !== document.body) document.body.appendChild(panel);
      panel.classList.add('date-panel--portal');
      var rect = trigger.getBoundingClientRect();
      var pw = panel.offsetWidth || 560;
      var ph = panel.offsetHeight || 320;
      var pad = 8;
      var left = rect.left;
      if (left + pw > window.innerWidth - pad) left = Math.max(pad, window.innerWidth - pw - pad);
      var top = rect.bottom + 4;
      if (top + ph > window.innerHeight - pad && rect.top - ph - 4 >= pad) top = rect.top - ph - 4;
      panel.style.position = 'fixed';
      panel.style.left = left + 'px';
      panel.style.top = top + 'px';
      panel.style.right = 'auto';
      panel.style.margin = '0';
      panel.style.zIndex = '1400';
    }

    var obs = new MutationObserver(function () {
      requestAnimationFrame(portal);
    });
    obs.observe(panel, { attributes: true, attributeFilter: ['class'] });
  }

  function creativeCascadePanelHtml(prefix) {
    return '<div class="cascade-panel" id="' + prefix + 'Panel">' +
      '<div class="cascade-panel__left">' +
        '<div class="cascade-panel__search">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>' +
          '<input type="text" id="' + prefix + 'Search" placeholder="搜索" autocomplete="off" />' +
        '</div>' +
        '<div class="cascade-panel__toolbar">' +
          '<button class="cascade-panel__link" type="button" id="' + prefix + 'SelectAll">全选</button>' +
        '</div>' +
        '<div class="cascade-panel__list" id="' + prefix + 'GroupList"></div>' +
      '</div>' +
      '<div class="cascade-panel__mid">' +
        '<div class="cascade-panel__list" id="' + prefix + 'ChildList"></div>' +
      '</div>' +
      '<div class="cascade-panel__right">' +
        '<div class="cascade-panel__toolbar cascade-panel__toolbar--right">' +
          '<span id="' + prefix + 'Count">已选 0 项</span>' +
          '<button class="cascade-panel__link" type="button" id="' + prefix + 'ClearAll">清空</button>' +
        '</div>' +
        '<div class="cascade-panel__list" id="' + prefix + 'Selected"></div>' +
      '</div>' +
    '</div>';
  }

  function bindCreativeCascadeSelect(cfg) {
    var wrap = $(cfg.wrapId);
    var trigger = $(cfg.triggerId);
    var panel = $(cfg.panelId);
    var label = $(cfg.labelId);
    var groupList = $(cfg.groupListId);
    var childList = $(cfg.childListId);
    var selectedEl = $(cfg.selectedId);
    var search = cfg.searchId ? $(cfg.searchId) : null;
    var countEl = cfg.countId ? $(cfg.countId) : null;
    if (!wrap || !trigger || !panel || !groupList || !childList) return null;

    var tree = cfg.tree || [];
    var activeGroupId = tree[0] ? tree[0].id : '';

    function getSelected() {
      return (cfg.getSelected ? cfg.getSelected() : []).slice();
    }

    function setSelected(arr) {
      if (cfg.setSelected) cfg.setSelected(arr);
    }

    function findGroup(id) {
      var i;
      for (i = 0; i < tree.length; i += 1) {
        if (tree[i].id === id) return tree[i];
      }
      return null;
    }

    function groupState(group, selected) {
      var children = group.children || [];
      var hit = 0;
      children.forEach(function (c) {
        if (selected.indexOf(c) !== -1) hit += 1;
      });
      return {
        all: children.length > 0 && hit === children.length,
        some: hit > 0 && hit < children.length
      };
    }

    function matchesKw(text, kw) {
      if (!kw) return true;
      return String(text).toLowerCase().indexOf(kw) !== -1;
    }

    function syncLabel() {
      var selected = getSelected();
      var prefix = cfg.prefix || '';
      if (!selected.length) {
        label.innerHTML = prefix + '<span class="muted">请选择</span>';
        wrap.classList.remove('has-value');
      } else {
        label.innerHTML = prefix + '已选 ' + selected.length + ' 项';
        wrap.classList.add('has-value');
      }
      if (countEl) countEl.textContent = '已选 ' + selected.length + ' 项';
    }

    function render() {
      var kw = ((search && search.value) || '').trim().toLowerCase();
      var selected = getSelected();
      var visibleGroups = tree.filter(function (g) {
        if (matchesKw(g.label, kw)) return true;
        return (g.children || []).some(function (c) { return matchesKw(c, kw); });
      });
      if (!activeGroupId || !visibleGroups.some(function (g) { return g.id === activeGroupId; })) {
        activeGroupId = visibleGroups[0] ? visibleGroups[0].id : '';
      }

      if (!visibleGroups.length) {
        groupList.innerHTML = '<div class="cascade-panel__empty">暂无数据</div>';
      } else {
        groupList.innerHTML = visibleGroups.map(function (g) {
          var st = groupState(g, selected);
          var active = g.id === activeGroupId ? ' is-active' : '';
          return '<label class="cascade-option' + active + '" data-group="' + escapeHtml(g.id) + '">' +
            '<input type="checkbox" data-group-check="' + escapeHtml(g.id) + '"' + (st.all ? ' checked' : '') + ' />' +
            '<span class="cascade-option__label">' + escapeHtml(g.label) + '</span>' +
            CASCADE_ARROW +
          '</label>';
        }).join('');
        groupList.querySelectorAll('input[data-group-check]').forEach(function (input) {
          var g = findGroup(input.getAttribute('data-group-check'));
          if (!g) return;
          input.indeterminate = groupState(g, selected).some;
        });
      }

      var activeGroup = findGroup(activeGroupId);
      var children = ((activeGroup && activeGroup.children) || []).filter(function (c) {
        return matchesKw(c, kw);
      });
      if (!activeGroup || !children.length) {
        childList.innerHTML = '<div class="cascade-panel__empty">' + (activeGroup ? '暂无数据' : '请选择分组') + '</div>';
      } else {
        childList.innerHTML = children.map(function (c) {
          var checked = selected.indexOf(c) !== -1 ? ' checked' : '';
          return '<label class="cascade-option">' +
            '<input type="checkbox" data-leaf="' + escapeHtml(c) + '"' + checked + ' />' +
            '<span class="cascade-option__label">' + escapeHtml(c) + '</span>' +
          '</label>';
        }).join('');
      }

      if (selectedEl) {
        selectedEl.innerHTML = selected.length
          ? selected.map(function (name) {
              return '<div class="multi-selected"><span class="multi-selected__name"><span title="' + escapeHtml(name) + '">' +
                escapeHtml(name) + '</span></span><button class="multi-selected__remove" type="button" data-remove="' +
                escapeHtml(name) + '" aria-label="移除">' + CLEAR_ICON + '</button></div>';
            }).join('')
          : '';
      }
      syncLabel();
    }

    function needsPortal() {
      return !!(wrap.closest('.drawer') || wrap.closest('.modal-mask'));
    }

    function unportalPanel() {
      panel.classList.remove('cascade-panel--portal');
      panel.style.position = '';
      panel.style.left = '';
      panel.style.top = '';
      panel.style.right = '';
      panel.style.bottom = '';
      panel.style.margin = '';
      panel.style.zIndex = '';
      var host = panel.__cascadeHost;
      if (host && panel.parentElement !== host) host.appendChild(panel);
    }

    function portalPanel() {
      if (!needsPortal()) return;
      if (!panel.__cascadeHost) panel.__cascadeHost = panel.parentElement;
      if (panel.parentElement !== document.body) document.body.appendChild(panel);
      panel.classList.add('cascade-panel--portal');
      var rect = trigger.getBoundingClientRect();
      var pw = panel.offsetWidth || 640;
      var ph = panel.offsetHeight || 296;
      var pad = 8;
      var left = rect.left;
      if (left + pw > window.innerWidth - pad) left = Math.max(pad, window.innerWidth - pw - pad);
      var top = rect.bottom + 4;
      if (top + ph > window.innerHeight - pad && rect.top - ph - 4 >= pad) top = rect.top - ph - 4;
      panel.style.position = 'fixed';
      panel.style.left = left + 'px';
      panel.style.top = top + 'px';
      panel.style.right = 'auto';
      panel.style.margin = '0';
      panel.style.zIndex = '1400';
    }

    function closeCascadePanel() {
      panel.classList.remove('is-open');
      trigger.classList.remove('is-open');
      unportalPanel();
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !panel.classList.contains('is-open');
      if (UI.closePanels) UI.closePanels();
      if (open) {
        panel.classList.add('is-open');
        trigger.classList.add('is-open');
        render();
        portalPanel();
        if (!panel.classList.contains('cascade-panel--portal') && UI.adjustDropdownPlacement) {
          UI.adjustDropdownPlacement(panel, trigger);
        }
      }
    });

    if (search) {
      search.addEventListener('input', render);
      search.addEventListener('click', function (e) { e.stopPropagation(); });
    }

    groupList.addEventListener('click', function (e) {
      var row = e.target.closest('[data-group]');
      if (!row || e.target.closest('input[type="checkbox"]')) return;
      activeGroupId = row.getAttribute('data-group');
      render();
    });

    groupList.addEventListener('change', function (e) {
      var input = e.target.closest('input[data-group-check]');
      if (!input) return;
      var group = findGroup(input.getAttribute('data-group-check'));
      if (!group) return;
      activeGroupId = group.id;
      var selected = getSelected();
      var children = group.children || [];
      if (input.checked) {
        children.forEach(function (c) {
          if (selected.indexOf(c) === -1) selected.push(c);
        });
      } else {
        selected = selected.filter(function (c) { return children.indexOf(c) === -1; });
      }
      setSelected(selected);
      render();
    });

    childList.addEventListener('change', function (e) {
      var input = e.target.closest('input[data-leaf]');
      if (!input) return;
      var name = input.getAttribute('data-leaf');
      var selected = getSelected();
      if (input.checked) {
        if (selected.indexOf(name) === -1) selected.push(name);
      } else {
        selected = selected.filter(function (n) { return n !== name; });
      }
      setSelected(selected);
      render();
    });

    if (selectedEl) {
      selectedEl.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-remove]');
        if (!btn) return;
        setSelected(getSelected().filter(function (n) { return n !== btn.getAttribute('data-remove'); }));
        render();
      });
    }

    if (cfg.selectAllId && $(cfg.selectAllId)) {
      $(cfg.selectAllId).addEventListener('click', function (e) {
        e.stopPropagation();
        var kw = ((search && search.value) || '').trim().toLowerCase();
        var selected = getSelected();
        flattenCreativeTreeLeaves(tree).forEach(function (name) {
          if (!matchesKw(name, kw)) return;
          if (selected.indexOf(name) === -1) selected.push(name);
        });
        setSelected(selected);
        render();
      });
    }

    if (cfg.clearAllId && $(cfg.clearAllId)) {
      $(cfg.clearAllId).addEventListener('click', function (e) {
        e.stopPropagation();
        setSelected([]);
        render();
      });
    }

    if (cfg.clearId && $(cfg.clearId)) {
      $(cfg.clearId).addEventListener('click', function (e) {
        e.stopPropagation();
        setSelected([]);
        render();
        closeCascadePanel();
      });
    }

    wrap.addEventListener('click', function (e) { e.stopPropagation(); });
    panel.addEventListener('click', function (e) { e.stopPropagation(); });
    syncLabel();
    return { render: render, syncLabel: syncLabel, close: closeCascadePanel };
  }

  function buildCreativeVideoSeed() {
    var rows = (CREATIVE_SEED && typeof CREATIVE_SEED.buildRows === 'function')
      ? CREATIVE_SEED.buildRows()
      : [];
    return rows.map(function (row) {
      var copy = {};
      Object.keys(row).forEach(function (k) { copy[k] = row[k]; });
      copy.xmpSynced = row.syncStatus === '已同步';
      return copy;
    });
  }

  function createCreativeGroup(name, videos) {
    var id = 'cg_' + state.creativeGroupSeq;
    state.creativeGroupSeq += 1;
    return {
      id: id,
      name: name || nextCreativeGroupName(),
      videos: (videos || []).slice()
    };
  }

  function findCreativeGroup(id) {
    for (var i = 0; i < state.creativeGroups.length; i += 1) {
      if (state.creativeGroups[i].id === id) return state.creativeGroups[i];
    }
    return null;
  }

  function findCreativeVideo(id) {
    for (var i = 0; i < CREATIVE_VIDEO_SEED.length; i += 1) {
      if (String(CREATIVE_VIDEO_SEED[i].id) === String(id)) return CREATIVE_VIDEO_SEED[i];
    }
    return null;
  }

  function nextCreativeGroupName() {
    var n = 1;
    var used = {};
    state.creativeGroups.forEach(function (g) { used[g.name] = true; });
    while (used['创意组-' + n]) n += 1;
    return '创意组-' + n;
  }

  function creativePerGroupLimit() {
    var n = parseInt(state.creativePerGroup, 10);
    if (!n || n < 1) return 10;
    if (n > CREATIVE_MAX_PER_GROUP) return CREATIVE_MAX_PER_GROUP;
    return n;
  }

  function creativePoolLimit() {
    return CREATIVE_MAX_GROUPS * creativePerGroupLimit();
  }

  function creativePickSelectLimit() {
    return creativePicker.targetGroupId ? creativePerGroupLimit() : creativePoolLimit();
  }

  function creativePickSelectLimitToast() {
    var limit = creativePickSelectLimit();
    if (creativePicker.targetGroupId) {
      return '最多选择 ' + limit + ' 个素材（单创意组上限）';
    }
    return '最多选择 ' + limit + ' 个素材（' + CREATIVE_MAX_GROUPS + ' 组 × 每组 ' + creativePerGroupLimit() + '）';
  }

  function flattenCreativeVideos() {
    var ids = [];
    state.creativeGroups.forEach(function (g) {
      (g.videos || []).forEach(function (id) {
        if (ids.indexOf(id) < 0) ids.push(id);
      });
    });
    return ids;
  }

  function shuffleCreativeIds(ids) {
    var list = (ids || []).slice();
    var i;
    for (i = list.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
    return list;
  }

  function trimCreativeGroupsToPerLimit(limit) {
    var removed = 0;
    state.creativeGroups.forEach(function (g) {
      var videos = g.videos || [];
      if (videos.length > limit) {
        removed += videos.length - limit;
        g.videos = videos.slice(0, limit);
      }
    });
    return removed;
  }

  function redistributeCreativeVideos(ids, opts) {
    var list = (ids || []).slice();
    var mode = (opts && opts.mode) || state.creativeAssignMode || 'order';
    if (mode === 'shuffle') list = shuffleCreativeIds(list);
    var per = creativePerGroupLimit();
    var maxPool = creativePoolLimit();
    var truncated = false;
    if (list.length > maxPool) {
      list = list.slice(0, maxPool);
      truncated = true;
    }
    var groups = [];
    var i;
    state.creativeGroupSeq = 1;
    for (i = 0; i < list.length; i += per) {
      if (groups.length >= CREATIVE_MAX_GROUPS) break;
      var chunk = list.slice(i, i + per);
      groups.push({
        id: 'cg_' + state.creativeGroupSeq,
        name: '创意组-' + state.creativeGroupSeq,
        videos: chunk
      });
      state.creativeGroupSeq += 1;
    }
    state.creativeGroups = groups;
    /* 默认不展开；乱序分配可传入 expandIndex 保持原先展开位 */
    var expandIndex = opts && typeof opts.expandIndex === 'number' ? opts.expandIndex : -1;
    if (expandIndex >= 0 && groups[expandIndex]) {
      state.activeCreativeGroupId = groups[expandIndex].id;
    } else {
      state.activeCreativeGroupId = '';
    }
    if (truncated) {
      UI.showToast('最多支持 ' + CREATIVE_MAX_GROUPS + ' 个创意组，已按每组 ' + per + ' 个截取', 'warning');
    } else if (opts && opts.toast && groups.length) {
      UI.showToast(
        mode === 'shuffle'
          ? '已随机分配为 ' + groups.length + ' 个创意组'
          : '已均分为 ' + groups.length + ' 个创意组',
        'success'
      );
    }
  }

  function shuffleAssignCreativeGroups() {
    var all = flattenCreativeVideos();
    if (!all.length) {
      UI.showToast('暂无素材可分配', 'warning');
      return;
    }
    var expandIndex = -1;
    if (state.activeCreativeGroupId) {
      state.creativeGroups.forEach(function (g, i) {
        if (g.id === state.activeCreativeGroupId) expandIndex = i;
      });
    }
    state.creativeAssignMode = 'shuffle';
    redistributeCreativeVideos(all, { mode: 'shuffle', toast: true, expandIndex: expandIndex });
    renderCreativeCard();
  }

  function clearCreativeGroups() {
    if (!state.creativeGroups.length) {
      UI.showToast('创意组列表已为空', 'warning');
      return;
    }
    state.creativeGroups = [];
    state.activeCreativeGroupId = '';
    state.creativeGroupSeq = 1;
    state.creativeAssignMode = 'order';
    renderCreativeCard();
    UI.showToast('已清空创意组', 'success');
  }

  function syncCreativeSelectLabel() {
    var el = $('creativeSelectCount');
    if (!el) return;
    el.textContent = '（创意组数量：' + state.creativeGroups.length + '/' + CREATIVE_MAX_GROUPS + '）';
    if (state.creativeGroups.length && !creativeEvenAllocMismatch()) {
      setFormItemError('creativeSelectItem', false);
    }
  }

  function stripCreativeExt(name) {
    return String(name || '').replace(/\.[^.]+$/, '');
  }

  function formatCreativeDuration(sec) {
    var n = Number(sec) || 0;
    var h = Math.floor(n / 3600);
    var m = Math.floor((n % 3600) / 60);
    var s = n % 60;
    function pad(v) { return v < 10 ? '0' + v : String(v); }
    return pad(h) + ':' + pad(m) + ':' + pad(s);
  }

  function creativeIsSystemTag(name) {
    if (CREATIVE_SEED && typeof CREATIVE_SEED.isSystemTagName === 'function') {
      return CREATIVE_SEED.isSystemTagName(name);
    }
    return CREATIVE_SYS_TAGS.indexOf(name) >= 0;
  }

  function creativeTagsHtml(tags) {
    var list = (CREATIVE_SEED && typeof CREATIVE_SEED.sortTagsForDisplay === 'function')
      ? CREATIVE_SEED.sortTagsForDisplay(tags)
      : (tags || []).slice();
    return '<div class="tag-list">' + list.map(function (t) {
      var sys = creativeIsSystemTag(t);
      return '<span class="mat-tag' + (sys ? ' mat-tag--system' : '') + '">' + escapeHtml(t) + '</span>';
    }).join('') + '</div>';
  }

  var CREATIVE_PLAY_ICON =
    '<span class="create-creative-card__play" aria-hidden="true">' +
      '<span class="create-creative-card__play-circle">' +
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86z"/></svg>' +
      '</span>' +
    '</span>';

  function creativeGroupVideosHtml(group) {
    var ids = group && group.videos ? group.videos : [];
    if (!ids.length) {
      return '<div class="create-creative-grid"></div>';
    }
    return (
      '<div class="create-creative-grid">' +
        ids.map(function (id) {
          var item = findCreativeVideo(id);
          var fullName = item && item.name ? item.name : (id + '.mp4');
          var oss = (item && item.ossUrl) || '';
          return (
            '<div class="create-creative-card" data-video-id="' + escapeHtml(id) + '">' +
              '<div class="create-creative-card__media">' +
                '<button class="create-creative-card__shot create-creative-card__shot--video" type="button" ' +
                  'data-play-video="' + escapeHtml(id) + '" data-oss="' + escapeHtml(oss) + '" ' +
                  'aria-label="播放 ' + escapeHtml(fullName) + '">' +
                  '<span class="create-creative-card__preview" aria-hidden="true"></span>' +
                  CREATIVE_PLAY_ICON +
                '</button>' +
                '<div class="create-creative-card__shot create-creative-card__shot--cover" aria-hidden="true">' +
                  '<span class="create-creative-card__preview"></span>' +
                '</div>' +
              '</div>' +
              '<div class="create-creative-card__name" title="' + escapeHtml(fullName) + '">' + escapeHtml(fullName) + '</div>' +
              '<button class="create-creative-card__remove" type="button" data-remove-video="' + escapeHtml(id) + '" aria-label="移除">' +
                '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 2l8 8M10 2L2 10"/></svg>' +
              '</button>' +
            '</div>'
          );
        }).join('') +
      '</div>'
    );
  }

  function closeCreativeVideoPlay() {
    var mask = $('creativeVideoPlayModal');
    var video = $('creativeVideoPlayEl');
    if (video) {
      try { video.pause(); } catch (err) { /* ignore */ }
      video.removeAttribute('src');
      video.load();
    }
    if (mask) {
      mask.classList.remove('is-open');
      mask.setAttribute('aria-hidden', 'true');
    }
  }

  function openCreativeVideoPlay(id) {
    var item = findCreativeVideo(id);
    var mask = $('creativeVideoPlayModal');
    var video = $('creativeVideoPlayEl');
    var title = $('creativeVideoPlayTitle');
    if (!mask || !video) return;
    var name = item && item.name ? item.name : String(id);
    var url = (item && item.ossUrl) || '';
    if (title) title.textContent = name;
    if (!url) {
      UI.showToast('暂无可播放地址', 'warning');
      return;
    }
    video.src = url;
    mask.classList.add('is-open');
    mask.setAttribute('aria-hidden', 'false');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        UI.showToast('视频暂无法播放', 'warning');
      });
    }
  }

  function renderCreativeGroups() {
    var wrap = $('creativeGroupList');
    if (!wrap) return;
    if (!state.creativeGroups.length) {
      wrap.innerHTML = '';
      syncCreativeSelectLabel();
      return;
    }
    var arrow = '<svg class="create-creative-item__arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4.5 2.5L8 6L4.5 9.5"/></svg>';
    wrap.innerHTML = state.creativeGroups.map(function (g) {
      var open = g.id === state.activeCreativeGroupId;
      var videoCount = (g.videos || []).length;
      var perLimit = creativePerGroupLimit();
      var addDisabled = videoCount >= perLimit;
      return (
        '<div class="create-creative-item' + (open ? ' is-open' : '') + '" data-group-id="' + escapeHtml(g.id) + '">' +
          '<div class="create-creative-item__head" data-toggle-group="' + escapeHtml(g.id) + '" role="button" tabindex="0">' +
            arrow +
            '<div class="create-creative-item__title">' +
              '<span class="create-creative-item__title-name">' + escapeHtml(g.name) + '</span>' +
              '<span class="create-creative-item__title-meta">（视频: ' + videoCount + '个）</span>' +
            '</div>' +
            '<div class="create-creative-item__actions">' +
              '<button class="create-creative-item__link" type="button" data-add-to-group="' + escapeHtml(g.id) + '"' +
                (addDisabled ? ' disabled title="已达每组创意数上限"' : '') +
              '>添加</button>' +
              '<button class="create-creative-item__link" type="button" data-copy-group="' + escapeHtml(g.id) + '">复制</button>' +
              '<button class="create-creative-item__link" type="button" data-clear-group="' + escapeHtml(g.id) + '">清空</button>' +
              '<button class="create-creative-item__link" type="button" data-del-group="' + escapeHtml(g.id) + '">删除</button>' +
            '</div>' +
          '</div>' +
          '<div class="create-creative-item__body">' +
            '<div class="create-creative-item__tabs">' +
              '<button class="create-creative-item__tab is-active" type="button">视频(' + videoCount + '/' + creativePerGroupLimit() + ')</button>' +
            '</div>' +
            creativeGroupVideosHtml(g) +
          '</div>' +
        '</div>'
      );
    }).join('');
    syncCreativeSelectLabel();
  }

  function syncCreativeAllocTip() {
    var tip = $('creativeAllocTip');
    if (!tip) return;
    tip.textContent = state.creativeAlloc === '平均分配'
      ? '创意组平均分配到不同账户'
      : '全部账户都用同一批创意组';
  }

  function renderCreativeCard() {
    var input = $('creativePerGroup');
    if (input) input.value = String(state.creativePerGroup || 10);
    syncSegValue('creativeAllocSeg', state.creativeAlloc);
    syncCreativeAllocTip();
    renderCreativeGroups();
    renderSplitRules();
  }

  var SPLIT_DIMS = ['推广系列', '广告组', '广告'];
  var splitDimApi = null;

  function splitCreateCounts() {
    var accounts = (state.selectedAccountIds && state.selectedAccountIds.length) || 0;
    var groups = (state.creativeGroups && state.creativeGroups.length) || 0;
    var dim = SPLIT_DIMS.indexOf(state.splitDimension) >= 0 ? state.splitDimension : '推广系列';
    var reuse = state.creativeAlloc !== '平均分配';
    var counts = { '推广系列': 0, '广告组': 0, '广告': 0 };
    if (!accounts || !groups) return counts;
    var leaf = reuse ? accounts * groups : groups;
    if (dim === '推广系列') {
      counts['推广系列'] = leaf;
      counts['广告组'] = leaf;
      counts['广告'] = leaf;
    } else if (dim === '广告组') {
      counts['推广系列'] = accounts;
      counts['广告组'] = leaf;
      counts['广告'] = leaf;
    } else {
      counts['推广系列'] = accounts;
      counts['广告组'] = accounts;
      counts['广告'] = leaf;
    }
    return counts;
  }

  function renderSplitRules() {
    var accounts = (state.selectedAccountIds && state.selectedAccountIds.length) || 0;
    var groups = (state.creativeGroups && state.creativeGroups.length) || 0;
    var accountEl = $('splitAccountCount');
    var groupEl = $('splitCreativeCount');
    var allocEl = $('splitAllocValue');
    if (accountEl) accountEl.textContent = String(accounts);
    if (groupEl) groupEl.textContent = String(groups);
    if (allocEl) allocEl.textContent = state.creativeAlloc === '平均分配' ? '平均分配' : '账户复用';
    var counts = splitCreateCounts();
    SPLIT_DIMS.forEach(function (key) {
      var cell = document.querySelector('[data-split-count="' + key + '"]');
      if (cell) cell.textContent = String(counts[key]);
    });
  }

  function bindSplitRules() {
    if (!UI.bindSingleSelect) return;
    splitDimApi = UI.bindSingleSelect({
      wrapId: 'splitDimWrap',
      triggerId: 'splitDimTrigger',
      panelId: 'splitDimPanel',
      labelId: 'splitDimLabel',
      getValue: function () { return state.splitDimension || '推广系列'; },
      onChange: function (value) {
        state.splitDimension = SPLIT_DIMS.indexOf(value) >= 0 ? value : '推广系列';
        renderSplitRules();
      }
    });
    renderSplitRules();
  }

  function resetCreativeForm() {
    state.creativeAlloc = '账户复用';
    state.creativePerGroup = 10;
    state.creativeGroups = [];
    state.activeCreativeGroupId = '';
    state.creativeGroupSeq = 1;
    state.creativeAssignMode = 'order';
    renderCreativeCard();
  }

  function copyCreativeGroup(id) {
    var src = findCreativeGroup(id);
    if (!src) return;
    if (state.creativeGroups.length >= CREATIVE_MAX_GROUPS) {
      UI.showToast('创意组数量最多 ' + CREATIVE_MAX_GROUPS + ' 个', 'warning');
      return;
    }
    var next = createCreativeGroup(nextCreativeGroupName(), src.videos.slice());
    var idx = -1;
    state.creativeGroups.forEach(function (g, i) { if (g.id === id) idx = i; });
    if (idx >= 0) state.creativeGroups.splice(idx + 1, 0, next);
    else state.creativeGroups.push(next);
    state.activeCreativeGroupId = next.id;
    renderCreativeCard();
  }

  function deleteCreativeGroup(id) {
    state.creativeGroups = state.creativeGroups.filter(function (g) { return g.id !== id; });
    if (state.activeCreativeGroupId === id) {
      state.activeCreativeGroupId = state.creativeGroups[0] ? state.creativeGroups[0].id : '';
    }
    renderCreativeCard();
  }

  function removeCreativeVideo(groupId, videoId) {
    var group = findCreativeGroup(groupId);
    if (!group) return;
    group.videos = group.videos.filter(function (id) { return id !== videoId; });
    /* 组内删空仍保留创意组 */
    if (!group.videos.length) state.activeCreativeGroupId = groupId;
    renderCreativeCard();
  }

  function clearCreativeGroupVideos(groupId) {
    var group = findCreativeGroup(groupId);
    if (!group) return;
    if (!(group.videos && group.videos.length)) {
      UI.showToast('该创意组暂无素材', 'warning');
      return;
    }
    group.videos = [];
    state.activeCreativeGroupId = groupId;
    renderCreativeCard();
    UI.showToast('已清空该创意组素材', 'success');
  }

  function assignVideosToCreativeGroup(groupId, ids) {
    var group = findCreativeGroup(groupId);
    if (!group) return false;
    var per = creativePerGroupLimit();
    var list = [];
    (ids || []).forEach(function (id) {
      if (!id || list.indexOf(id) >= 0) return;
      if (list.length >= per) return;
      list.push(id);
    });
    group.videos = list;
    state.activeCreativeGroupId = groupId;
    return true;
  }

  function findCreativeFolder(id, nodes) {
    if (id === CREATIVE_SYS_FOLDER.id) return CREATIVE_SYS_FOLDER;
    var list = nodes || CREATIVE_CUSTOM_FOLDERS;
    var i;
    for (i = 0; i < list.length; i += 1) {
      if (list[i].id === id) return list[i];
      if (list[i].children && list[i].children.length) {
        var hit = findCreativeFolder(id, list[i].children);
        if (hit) return hit;
      }
    }
    return null;
  }

  function creativeFolderDescendantIds(id) {
    var ids = [id];
    var node = findCreativeFolder(id);
    function walk(n) {
      (n.children || []).forEach(function (c) {
        ids.push(c.id);
        walk(c);
      });
    }
    if (node) walk(node);
    return ids;
  }

  function getCreativeFolderTrail(id) {
    if (!id || id === CREATIVE_SYS_FOLDER.id) {
      return [{ id: CREATIVE_SYS_FOLDER.id, name: CREATIVE_SYS_FOLDER.name }];
    }
    var trail = [];
    function walk(nodes, stack) {
      var i;
      for (i = 0; i < (nodes || []).length; i += 1) {
        var next = stack.concat([{ id: nodes[i].id, name: nodes[i].name }]);
        if (nodes[i].id === id) {
          trail = next;
          return true;
        }
        if (nodes[i].children && walk(nodes[i].children, next)) return true;
      }
      return false;
    }
    walk(CREATIVE_CUSTOM_FOLDERS, []);
    return [{ id: CREATIVE_SYS_FOLDER.id, name: CREATIVE_SYS_FOLDER.name }].concat(trail);
  }

  function renderCreativePickBreadcrumb() {
    var crumb = $('creativePickBreadcrumb');
    if (!crumb) return;
    var trail = getCreativeFolderTrail(creativePicker.folderId);
    crumb.innerHTML = trail.map(function (node, i) {
      var isLast = i === trail.length - 1;
      var item = isLast
        ? '<strong class="lib-breadcrumb__current">' + escapeHtml(node.name) + '</strong>'
        : '<button type="button" class="lib-breadcrumb__link" data-crumb="' + escapeHtml(node.id) + '">' +
            escapeHtml(node.name) +
          '</button>';
      if (i === 0) return item;
      return '<span class="lib-breadcrumb__sep" aria-hidden="true">/</span>' + item;
    }).join('');
  }

  function creativeFolderMatchesKw(node, kw) {
    if (!kw) return true;
    if (String(node.name).toLowerCase().indexOf(kw) >= 0) return true;
    return (node.children || []).some(function (c) { return creativeFolderMatchesKw(c, kw); });
  }

  function renderCreativePickFolders() {
    var root = $('creativePickFolderTree');
    if (!root) return;
    var kw = (creativePicker.folderKw || '').trim().toLowerCase();

    function renderNode(node, depth, canHide) {
      if (canHide && kw && !creativeFolderMatchesKw(node, kw)) return '';
      var hasChild = !!(node.children && node.children.length);
      var collapsed = !creativePicker.expanded[node.id] && !kw && hasChild;
      if (!hasChild) collapsed = false;
      var active = node.id === creativePicker.folderId ? ' is-active' : '';
      var systemCls = node.system ? ' is-system' : '';
      var childrenHtml = hasChild && !collapsed
        ? '<div class="tree-node__children">' + node.children.map(function (c) {
          return renderNode(c, depth + 1, true);
        }).join('') + '</div>'
        : '';
      return (
        '<div class="tree-node' + (collapsed ? ' is-collapsed' : '') + systemCls + '" data-depth="' + depth + '">' +
          '<div class="tree-node__row' + active + '" data-folder-id="' + escapeHtml(node.id) + '" style="padding-left:' + (8 + depth * 20) + 'px">' +
            '<button class="tree-node__toggle' + (hasChild ? '' : ' is-leaf') + '" type="button" data-expand="' + escapeHtml(node.id) + '" aria-label="展开">' +
              '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4.5 3L7.5 6L4.5 9"/></svg>' +
            '</button>' +
            CREATIVE_FOLDER_ICON +
            '<span class="tree-node__name" title="' + escapeHtml(node.name) + '">' + escapeHtml(node.name) + '</span>' +
          '</div>' +
          childrenHtml +
        '</div>'
      );
    }

    var customHtml = CREATIVE_CUSTOM_FOLDERS.map(function (n) {
      return renderNode(n, 0, true);
    }).join('');

    root.innerHTML =
      renderNode(CREATIVE_SYS_FOLDER, 0, false) +
      '<div class="tree-section-label">自定义文件夹</div>' +
      (customHtml || '<div class="tree-empty">暂无自定义文件夹</div>');
  }

  function creativeDurationBucket(sec) {
    var n = Number(sec) || 0;
    if (n <= 6) return '0-6s';
    if (n <= 15) return '7-15s';
    if (n <= 30) return '16-30s';
    if (n <= 60) return '31-60s';
    return '>60s';
  }

  function creativeSafeDiv(a, b) {
    if (!b) return 0;
    return a / b;
  }

  function creativeFormatInt(n) {
    var num = Number(n);
    if (!isFinite(num)) return '-';
    return String(Math.round(num));
  }

  function creativeFormatFloat(n) {
    var num = Number(n);
    if (!isFinite(num)) return '-';
    return num.toFixed(2);
  }

  function creativeFormatPercent(ratio) {
    var num = Number(ratio);
    if (!isFinite(num)) return '-';
    return (num * 100).toFixed(2) + '%';
  }

  function isCreativeDataCol(col) {
    return !!(col && col.group === '数据');
  }

  function isCreativeFrozenKey(key) {
    var col = CREATIVE_COLUMN_MAP[key];
    return !!(col && col.defaultFrozen);
  }

  function creativeMinFrozen(list) {
    var n = 0;
    (list || []).forEach(function (key) {
      if (isCreativeFrozenKey(key)) n += 1;
    });
    return n;
  }

  function canFillCreativeDelivery() {
    return !!(creativePicker.showDeliveryData && creativePicker.deliveryDataReady && !creativePicker.deliveryDateCleared);
  }

  function creativeColumnRaw(row, key) {
    if (!row) return null;
    switch (key) {
      case 'id': return row.id;
      case 'name': return stripCreativeExt(row.name);
      case 'tags': return (row.tags || []).join(',');
      case 'creator': return row.creator;
      case 'file_type': return row.type;
      case 'file_format': return row.format;
      case 'width_height': return row.size;
      case 'duration': return row.durationSec || 0;
      case 'source': return row.source;
      case 'uploaded_at': return row.createdAt;
      case 'xmp_synced': return row.xmpSynced ? '是' : '否';
      case 'ad_count': return row.adCount;
      case 'reject_count': return row.rejectCount;
      case 'spend': return row.spend;
      case 'impressions': return row.impressions;
      case 'clicks': return row.clicks;
      case 'ctr': return creativeSafeDiv(row.clicks, row.impressions);
      case 'cpc': return creativeSafeDiv(row.spend, row.clicks);
      case 'cpm': return creativeSafeDiv(row.spend, row.impressions) * 1000;
      case 'conversions': return row.conversions;
      case 'cvr': return creativeSafeDiv(row.conversions, row.clicks);
      case 'cpa': return creativeSafeDiv(row.spend, row.conversions);
      case 'video_views': return row.videoViews;
      case 'video_p100': return row.videoP100;
      case 'video_p100_rate': return creativeSafeDiv(row.videoP100, row.videoViews);
      case 'video_p75': return row.videoP75;
      case 'video_p75_rate': return creativeSafeDiv(row.videoP75, row.videoViews);
      case 'video_p50': return row.videoP50;
      case 'video_p50_rate': return creativeSafeDiv(row.videoP50, row.videoViews);
      case 'video_p25': return row.videoP25;
      case 'video_p25_rate': return creativeSafeDiv(row.videoP25, row.videoViews);
      default: return null;
    }
  }

  function creativeVisibleCols() {
    return creativePicker.columns.map(function (key) {
      return CREATIVE_COLUMN_MAP[key];
    }).filter(Boolean);
  }

  function getCreativePickFilteredRows() {
    var applied = creativePicker.applied;
    var folderId = creativePicker.folderId || CREATIVE_SYS_FOLDER.id;
    var allowIds = null;
    if (folderId !== CREATIVE_SYS_FOLDER.id) {
      /* 默认展示当前目录及子文件夹素材 */
      allowIds = creativeFolderDescendantIds(folderId);
    }
    var nameKw = (applied.name || '').trim().toLowerCase();
    var mediaKw = (applied.mediaId || '').trim().toLowerCase();
    var rows = CREATIVE_VIDEO_SEED.filter(function (row) {
      if (allowIds && allowIds.indexOf(row.folderId) < 0) return false;
      if (applied.dateStart && row.createdDate < applied.dateStart) return false;
      if (applied.dateEnd && row.createdDate > applied.dateEnd) return false;
      if (nameKw && stripCreativeExt(row.name).toLowerCase().indexOf(nameKw) < 0 && String(row.name).toLowerCase().indexOf(nameKw) < 0) return false;
      if (applied.creator && applied.creator.length && applied.creator.indexOf(row.creator) < 0) return false;
      if (applied.sysTag && applied.sysTag.length) {
        var hit = applied.sysTag.some(function (t) { return (row.tags || []).indexOf(t) >= 0; });
        if (!hit) return false;
      }
      if (applied.manualTag && applied.manualTag.length) {
        var manualHit = applied.manualTag.some(function (t) { return (row.tags || []).indexOf(t) >= 0; });
        if (!manualHit) return false;
      }
      if (applied.type && applied.type.length && applied.type.indexOf(row.format) < 0) return false;
      if (applied.size && applied.size.length && applied.size.indexOf(row.size) < 0) return false;
      if (applied.duration && applied.duration.length && applied.duration.indexOf(creativeDurationBucket(row.durationSec)) < 0) return false;
      if (applied.source && row.source !== applied.source) return false;
      if (applied.xmp) {
        var yes = row.xmpSynced ? '是' : '否';
        if (yes !== applied.xmp) return false;
      }
      if (mediaKw && String(row.mediaId || '').toLowerCase().indexOf(mediaKw) < 0 && String(row.id).toLowerCase().indexOf(mediaKw) < 0) return false;
      return true;
    });
    var specs = creativePicker.sortSpecs || [];
    return rows.slice().sort(function (a, b) {
      var i;
      /* 与素材库一致：无手动排序时按上传时间倒序 */
      if (!specs.length) {
        return (b.createdTs || 0) - (a.createdTs || 0);
      }
      for (i = 0; i < specs.length; i += 1) {
        var spec = specs[i];
        var va = creativeColumnRaw(a, spec.key);
        var vb = creativeColumnRaw(b, spec.key);
        var mul = spec.dir === 'asc' ? 1 : -1;
        if (va == null && vb == null) continue;
        if (va == null) return 1;
        if (vb == null) return -1;
        var cmp = typeof va === 'number' && typeof vb === 'number'
          ? (va - vb) * mul
          : String(va).localeCompare(String(vb), 'zh') * mul;
        if (cmp) return cmp;
      }
      return (b.createdTs || 0) - (a.createdTs || 0);
    });
  }

  function getCreativePickPageRows() {
    var all = getCreativePickFilteredRows();
    clampCreativePickPage(all.length);
    var start = (creativePicker.page - 1) * creativePicker.pageSize;
    return {
      total: all.length,
      pageRows: all.slice(start, start + creativePicker.pageSize)
    };
  }

  function syncCreativePickDraftCount() {
    var tip = $('creativePickDraftCount');
    var limit = creativePickSelectLimit();
    if (tip) tip.textContent = '已选：' + creativePicker.draftIds.length + ' / ' + limit;
  }

  function syncCreativePickCheckAll(pageRows) {
    var rows = pageRows || getCreativePickPageRows().pageRows;
    var hit = 0;
    rows.forEach(function (row) {
      if (creativePicker.draftIds.indexOf(row.id) >= 0) hit += 1;
    });
    var listAll = $('creativePickListCheckAll');
    if (!listAll) return;
    listAll.checked = rows.length > 0 && hit === rows.length;
    listAll.indeterminate = hit > 0 && hit < rows.length;
  }

  function syncCreativePickFilterVisibility() {
    var bar = $('creativePickFilterBar');
    if (!bar) return;
    Array.prototype.forEach.call(bar.querySelectorAll('[data-filter-key]'), function (el) {
      var key = el.getAttribute('data-filter-key');
      el.hidden = creativePicker.visibleFilters.indexOf(key) < 0;
    });
  }

  function syncCreativePickDataDateVisibility() {
    var wrap = $('creativePickDataDateWrap');
    if (!wrap) return;
    wrap.hidden = !creativePicker.showDeliveryData;
    if (creativePicker.showDeliveryData && !creativePicker.deliveryDateCleared) {
      wrap.classList.add('has-value');
    }
  }

  function syncCreativePickFreezeLeft() {
    var table = $('creativePickListTable');
    if (!table) return;
    var cols = table.querySelectorAll('colgroup col');
    var ths = table.querySelectorAll('thead th');
    var bodyRows = table.querySelectorAll('tbody tr');
    var left = 0;
    var count = Math.min(1 + creativePicker.frozenCount, cols.length);
    Array.prototype.forEach.call(cols, function (col, index) {
      var frozen = index < count;
      var width = parseFloat(col.style.width) || parseFloat(col.getAttribute('data-col-width')) || 0;
      if (ths[index]) {
        ths[index].classList.toggle('is-freeze', frozen);
        ths[index].style.left = frozen ? left + 'px' : '';
      }
      Array.prototype.forEach.call(bodyRows, function (tr) {
        var cell = tr.children[index];
        if (!cell) return;
        cell.classList.toggle('is-freeze', frozen);
        cell.style.left = frozen ? left + 'px' : '';
      });
      if (frozen) left += width;
    });
  }

  function creativePickNameCellHtml(row) {
    var name = stripCreativeExt(row.name);
    var sub = (row.size || '') + ' · ' + formatCreativeDuration(row.durationSec);
    return '<div class="material-cell">' +
      '<button class="thumb" type="button" tabindex="-1" aria-hidden="true"><span class="thumb__preview"></span></button>' +
      '<div class="material-cell__meta">' +
        '<div class="material-cell__name-wrap"><span class="material-cell__name" title="' + escapeHtml(name) + '">' + escapeHtml(name) + '</span></div>' +
        '<div class="material-cell__sub">' + escapeHtml(sub) + '</div>' +
      '</div></div>';
  }

  function creativePickCellHtml(row, col) {
    if (col.key === 'name') return creativePickNameCellHtml(row);
    if (col.key === 'tags') return '<div class="tag-cell">' + creativeTagsHtml(row.tags) + '</div>';
    if (isCreativeDataCol(col) && !canFillCreativeDelivery()) return '-';
    var raw = creativeColumnRaw(row, col.key);
    if (raw == null || raw === '') return '-';
    var text;
    if (col.kind === 'int') text = creativeFormatInt(raw);
    else if (col.kind === 'float') text = creativeFormatFloat(raw);
    else if (col.kind === 'percent') text = creativeFormatPercent(raw);
    else text = String(raw);
    return '<span title="' + escapeHtml(text) + '">' + escapeHtml(text) + '</span>';
  }

  function renderCreativePicker() {
    renderCreativePickBreadcrumb();
    renderCreativePickFolders();
    syncCreativePickFilterVisibility();
    syncCreativePickDataDateVisibility();

    var pack = getCreativePickPageRows();
    var cols = creativeVisibleCols();
    var colgroup = $('creativePickColgroup');
    var head = $('creativePickListHead');
    var body = $('creativePickListBody');
    var empty = $('creativePickEmpty');
    var hit = 0;
    pack.pageRows.forEach(function (row) {
      if (creativePicker.draftIds.indexOf(row.id) >= 0) hit += 1;
    });

    if (colgroup) {
      colgroup.innerHTML =
        '<col class="col-check" data-col-width="48" data-col-fixed="true" />' +
        cols.map(function (col) {
          var cls = col.key === 'name' ? ' class="col-material"' : (col.key === 'id' ? ' class="col-id"' : '');
          return '<col' + cls + ' data-col-width="' + col.width + '" />';
        }).join('');
    }

    if (head) {
      head.innerHTML = '<tr>' +
        '<th class="col-check is-freeze"><span class="cell-check"><input type="checkbox" id="creativePickListCheckAll" aria-label="全选"' +
          (pack.pageRows.length && hit === pack.pageRows.length ? ' checked' : '') + ' /></span></th>' +
        cols.map(function (col, index) {
          var cls = [];
          if (col.key === 'name') cls.push('col-material');
          if (col.key === 'id') cls.push('col-id');
          if (isCreativeDataCol(col)) cls.push('num');
          if (index < creativePicker.frozenCount) cls.push('is-freeze');
          var label = escapeHtml(col.name);
          if (col.sortable) {
            label = '<div class="th-sort' + (isCreativeDataCol(col) ? ' th-sort--num' : '') + '" data-key="' + col.key + '"><span>' + label + '</span>' + UI.TH_SORT_ICONS_HTML + '</div>';
          }
          return '<th class="' + cls.join(' ') + '">' + label + '</th>';
        }).join('') +
      '</tr>';
    }

    if (body) {
      body.innerHTML = pack.pageRows.map(function (row) {
        var checked = creativePicker.draftIds.indexOf(row.id) >= 0 ? ' checked' : '';
        return '<tr data-id="' + escapeHtml(row.id) + '">' +
          '<td class="col-check is-freeze"><span class="cell-check"><input type="checkbox" data-pick-id="' + escapeHtml(row.id) + '"' + checked + ' aria-label="选择" /></span></td>' +
          cols.map(function (col, index) {
            var cls = [];
            if (col.key === 'name') cls.push('col-material');
            if (col.key === 'id') cls.push('col-id');
            if (col.key === 'tags') cls.push('col-tags');
            if (isCreativeDataCol(col)) cls.push('num');
            if (index < creativePicker.frozenCount) cls.push('is-freeze');
            return '<td' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + '>' + creativePickCellHtml(row, col) + '</td>';
          }).join('') +
        '</tr>';
      }).join('');
    }

    if (empty) empty.hidden = pack.total > 0;
    syncCreativePickDraftCount();
    syncCreativePickCheckAll(pack.pageRows);

    var rememberEl = $('creativePickRememberPage');
    if (rememberEl) rememberEl.checked = !!creativePicker.rememberPage;

    UI.renderPagination({
      containerId: 'creativePickPagination',
      total: pack.total,
      page: creativePicker.page,
      pageSize: creativePicker.pageSize,
      pageSizes: CREATIVE_PICK_PAGE_SIZES
    });
    if (!creativePicker.paginationBound) {
      creativePicker.paginationBound = true;
      UI.bindPagination({
        containerId: 'creativePickPagination',
        getPage: function () { return creativePicker.page; },
        getPageSize: function () { return creativePicker.pageSize; },
        getTotal: function () { return getCreativePickFilteredRows().length; },
        onPageChange: function (p) {
          creativePicker.page = p;
          persistCreativePickPagination();
          renderCreativePicker();
        },
        onPageSizeChange: function (s) {
          creativePicker.pageSize = s;
          creativePicker.page = 1;
          persistCreativePickPagination();
          renderCreativePicker();
        }
      });
    }

    if (window.ColResize) ColResize.refresh($('creativePickListTable'), { onLayout: syncCreativePickFreezeLeft });
    else syncCreativePickFreezeLeft();
    if (creativePickSortApi) creativePickSortApi.sync();
  }

  function toggleCreativePickId(id) {
    if (!id) return;
    var idx = creativePicker.draftIds.indexOf(id);
    if (idx >= 0) {
      creativePicker.draftIds.splice(idx, 1);
    } else {
      var limit = creativePickSelectLimit();
      if (creativePicker.draftIds.length >= limit) {
        UI.showToast(creativePickSelectLimitToast(), 'warning');
        return;
      }
      creativePicker.draftIds.push(id);
    }
    renderCreativePicker();
  }

  function setCreativePickPageChecked(checked) {
    var rows = getCreativePickPageRows().pageRows;
    var limit = creativePickSelectLimit();
    if (checked) {
      var next = creativePicker.draftIds.slice();
      rows.forEach(function (row) {
        if (next.indexOf(row.id) >= 0) return;
        if (next.length >= limit) return;
        next.push(row.id);
      });
      if (next.length >= limit && rows.some(function (row) { return next.indexOf(row.id) < 0; })) {
        UI.showToast(creativePickSelectLimitToast(), 'warning');
      }
      creativePicker.draftIds = next;
    } else {
      var remove = {};
      rows.forEach(function (row) { remove[row.id] = true; });
      creativePicker.draftIds = creativePicker.draftIds.filter(function (id) { return !remove[id]; });
    }
    renderCreativePicker();
  }

  function snapshotCreativePickDraft() {
    return {
      dateStart: creativePicker.draft.dateStart || '',
      dateEnd: creativePicker.draft.dateEnd || '',
      name: creativePicker.draft.name || '',
      creator: (creativePicker.draft.creator || []).slice(),
      sysTag: (creativePicker.draft.sysTag || []).slice(),
      manualTag: (creativePicker.draft.manualTag || []).slice(),
      type: (creativePicker.draft.type || []).slice(),
      size: (creativePicker.draft.size || []).slice(),
      duration: (creativePicker.draft.duration || []).slice(),
      source: creativePicker.draft.source || '',
      xmp: creativePicker.draft.xmp || '',
      mediaId: creativePicker.draft.mediaId || ''
    };
  }

  function applyCreativePickFilters() {
    creativePicker.applied = snapshotCreativePickDraft();
    if (creativePicker.showDeliveryData && !creativePicker.deliveryDateCleared) {
      creativePicker.deliveryDataReady = true;
    }
    creativePicker.page = 1;
    renderCreativePicker();
  }

  function resetCreativePickFilters() {
    creativePicker.draft = emptyCreativePickDraft();
    creativePicker.applied = emptyCreativePickDraft();
    creativePicker.deliveryDataReady = false;
    ['creativePickNameInput', 'creativePickMediaIdInput'].forEach(function (id) {
      var input = $(id);
      if (input) input.value = '';
    });
    ['creativePickNameWrap', 'creativePickMediaIdWrap', 'creativePickSourceWrap', 'creativePickXmpWrap'].forEach(function (id) {
      var wrap = $(id);
      if (wrap) wrap.classList.remove('has-value');
    });
    syncCreativePickSourceLabel();
    syncCreativePickXmpLabel();
    if (creativePickCreatorMulti) creativePickCreatorMulti.render();
    if (creativePickSysTagMulti) creativePickSysTagMulti.render();
    if (creativePickDurationMulti) creativePickDurationMulti.render();
    if (creativePickManualTagCascade) creativePickManualTagCascade.render();
    if (creativePickTypeCascade) creativePickTypeCascade.render();
    if (creativePickSizeCascade) creativePickSizeCascade.render();
    if (creativePickDateApi && typeof creativePickDateApi.clear === 'function') {
      creativePickDateApi.clear(true);
      syncCreativePickDateDraft();
    }
    creativePicker.page = 1;
    renderCreativePicker();
  }

  function openCreativePicker(opts) {
    var targetGroupId = (opts && opts.targetGroupId) || '';
    creativePicker.targetGroupId = targetGroupId;
    creativePicker.folderId = CREATIVE_SYS_FOLDER.id;
    creativePicker.folderKw = '';
    creativePicker.showDeliveryData = false;
    creativePicker.deliveryDataReady = false;
    creativePicker.deliveryDateCleared = false;
    creativePicker.rememberPage = loadCreativePickRemember();
    creativePicker.pageSize = loadCreativePickPageSize();
    creativePicker.page = creativePicker.rememberPage ? loadCreativePickPageNo() : 1;
    if (targetGroupId) {
      var target = findCreativeGroup(targetGroupId);
      creativePicker.draftIds = target && target.videos ? target.videos.slice() : [];
    } else {
      creativePicker.draftIds = flattenCreativeVideos();
    }
    creativePicker.draft = emptyCreativePickDraft();
    creativePicker.sortSpecs = [];
    var folderKw = $('creativePickFolderKw');
    if (folderKw) folderKw.value = '';
    ['creativePickNameInput', 'creativePickMediaIdInput'].forEach(function (id) {
      var input = $(id);
      if (input) input.value = '';
    });
    ['creativePickNameWrap', 'creativePickMediaIdWrap', 'creativePickSourceWrap', 'creativePickXmpWrap'].forEach(function (id) {
      var wrap = $(id);
      if (wrap) wrap.classList.remove('has-value');
    });
    var showDelivery = $('creativePickShowDelivery');
    if (showDelivery) showDelivery.checked = false;
    syncCreativePickSourceLabel();
    syncCreativePickXmpLabel();
    if (creativePickCreatorMulti) creativePickCreatorMulti.render();
    if (creativePickSysTagMulti) creativePickSysTagMulti.render();
    if (creativePickDurationMulti) creativePickDurationMulti.render();
    if (creativePickManualTagCascade) creativePickManualTagCascade.render();
    if (creativePickTypeCascade) creativePickTypeCascade.render();
    if (creativePickSizeCascade) creativePickSizeCascade.render();
    syncCreativePickDateDraft();
    creativePicker.applied = snapshotCreativePickDraft();
    creativePicker.applied.name = '';
    creativePicker.applied.creator = [];
    creativePicker.applied.sysTag = [];
    creativePicker.applied.manualTag = [];
    creativePicker.applied.type = [];
    creativePicker.applied.size = [];
    creativePicker.applied.duration = [];
    creativePicker.applied.source = '';
    creativePicker.applied.xmp = '';
    creativePicker.applied.mediaId = '';
    clampCreativePickPage(getCreativePickFilteredRows().length);
    persistCreativePickPagination();
    renderCreativePicker();
    UI.openDrawer('creativePickDrawer');
  }

  function closeCreativePicker() {
    creativePicker.targetGroupId = '';
    UI.closeDrawer('creativePickDrawer');
  }

  function submitCreativePicker() {
    var targetId = creativePicker.targetGroupId;
    if (targetId) {
      if (!findCreativeGroup(targetId)) {
        UI.showToast('创意组不存在', 'warning');
        closeCreativePicker();
        renderCreativeCard();
        return;
      }
      var list = creativePicker.draftIds.slice();
      var per = creativePerGroupLimit();
      var truncated = list.length > per;
      if (truncated) list = list.slice(0, per);
      assignVideosToCreativeGroup(targetId, list);
      if (!list.length) {
        UI.showToast('请至少选择 1 个素材', 'warning');
        return;
      }
      if (truncated) {
        UI.showToast('已按单组上限 ' + per + ' 个截取并加入创意组', 'warning');
      } else {
        UI.showToast('已添加 ' + list.length + ' 个素材', 'success');
      }
      closeCreativePicker();
      renderCreativeCard();
      return;
    }
    redistributeCreativeVideos(creativePicker.draftIds, { toast: true });
    closeCreativePicker();
    renderCreativeCard();
  }

  function ymdFromDate(d) {
    if (!d) return '';
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    if (m.length < 2) m = '0' + m;
    if (day.length < 2) day = '0' + day;
    return y + '-' + m + '-' + day;
  }

  function syncCreativePickDateDraft() {
    if (!creativePickDateApi) return;
    creativePicker.draft.dateStart = ymdFromDate(creativePickDateApi.getStart && creativePickDateApi.getStart());
    creativePicker.draft.dateEnd = ymdFromDate(creativePickDateApi.getEnd && creativePickDateApi.getEnd());
    var wrap = $('creativePickDateWrap');
    if (wrap) wrap.classList.toggle('has-value', !!(creativePicker.draft.dateStart && creativePicker.draft.dateEnd));
  }

  function syncCreativePickSourceLabel() {
    var label = $('creativePickSourceLabel');
    var wrap = $('creativePickSourceWrap');
    if (!label) return;
    if (creativePicker.draft.source) {
      label.innerHTML = '来源：' + escapeHtml(creativePicker.draft.source);
      if (wrap) wrap.classList.add('has-value');
    } else {
      label.innerHTML = '来源：<span class="muted">请选择</span>';
      if (wrap) wrap.classList.remove('has-value');
    }
  }

  function syncCreativePickXmpLabel() {
    var label = $('creativePickXmpLabel');
    var wrap = $('creativePickXmpWrap');
    if (!label) return;
    if (creativePicker.draft.xmp) {
      label.innerHTML = '同步XMP：' + escapeHtml(creativePicker.draft.xmp);
      if (wrap) wrap.classList.add('has-value');
    } else {
      label.innerHTML = '同步XMP：<span class="muted">请选择</span>';
      if (wrap) wrap.classList.remove('has-value');
    }
  }

  function creativePickFsControlHtml(f) {
    var key = f.key;
    if (key === 'date') {
      return '<div class="filter-setting-control filter-setting-control--date filter-item--date' +
        (creativePicker.draft.dateStart && creativePicker.draft.dateEnd ? ' has-value' : '') + '" id="creativePickFsDateWrap">' +
        '<button class="date-range-trigger" type="button" id="creativePickFsDateTrigger">' +
          '<span class="date-range-trigger__text" id="creativePickFsDateLabel">上传时间：-</span>' +
        '</button>' +
        '<button class="select-clear" type="button" id="creativePickFsDateClear" aria-label="清除">' + CREATIVE_CLEAR_ICON + '</button>' +
        '<div class="date-panel" id="creativePickFsDatePanel">' +
          '<div class="date-panel__shortcuts" id="creativePickFsDateShortcuts">' +
            '<button class="date-shortcut" type="button" data-shortcut="today">今天</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="yesterday">昨天</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="last7">近7天</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="last30">近30天</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="thisWeek">本周</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="lastWeek">上周</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="thisMonth">本月</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="lastMonth">上月</button>' +
          '</div>' +
          '<div class="date-panel__calendars">' +
            '<div class="date-cal" id="creativePickFsDateCalLeft"></div>' +
            '<div class="date-cal" id="creativePickFsDateCalRight"></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }
    if (f.kind === 'keyword') {
      var val = creativePicker.draft[key] || '';
      return '<div class="filter-setting-control filter-item' + (val ? ' has-value' : '') + '" id="creativePickFsWrap_' + key + '">' +
        '<label class="select-trigger select-trigger--input" for="creativePickFs_' + key + '">' +
          '<span class="select-trigger__prefix">' + escapeHtml(f.label) + '：</span>' +
          '<input class="select-trigger__field" type="text" id="creativePickFs_' + key + '" placeholder="请输入" value="' + escapeHtml(val) + '" autocomplete="off" />' +
        '</label>' +
        '<button class="select-clear" type="button" id="creativePickFsClear_' + key + '" aria-label="清除">' + CREATIVE_CLEAR_ICON + '</button>' +
      '</div>';
    }
    if (f.kind === 'cascade') {
      return '<div class="filter-setting-control" id="creativePickFsWrap_' + key + '">' +
        '<button class="select-trigger" type="button" id="creativePickFsTrigger_' + key + '">' +
          '<span class="select-trigger__text" id="creativePickFsLabel_' + key + '">' + f.label + '：<span class="muted">请选择</span></span>' +
          '<svg class="select-trigger__arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg>' +
        '</button>' +
        '<button class="select-clear" type="button" id="creativePickFsClear_' + key + '" aria-label="清除">' + CREATIVE_CLEAR_ICON + '</button>' +
        '<div class="cascade-panel" id="creativePickFsPanel_' + key + '">' +
          '<div class="cascade-panel__left">' +
            '<div class="cascade-panel__search">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>' +
              '<input type="text" id="creativePickFsSearch_' + key + '" placeholder="搜索" autocomplete="off" />' +
            '</div>' +
            '<div class="cascade-panel__toolbar">' +
              '<button class="cascade-panel__link" type="button" id="creativePickFsSelectAll_' + key + '">全选</button>' +
            '</div>' +
            '<div class="cascade-panel__list" id="creativePickFsGroup_' + key + '"></div>' +
          '</div>' +
          '<div class="cascade-panel__mid">' +
            '<div class="cascade-panel__list" id="creativePickFsChild_' + key + '"></div>' +
          '</div>' +
          '<div class="cascade-panel__right">' +
            '<div class="cascade-panel__toolbar cascade-panel__toolbar--right">' +
              '<span id="creativePickFsCount_' + key + '">已选 0 项</span>' +
              '<button class="cascade-panel__link" type="button" id="creativePickFsClearAll_' + key + '">清空</button>' +
            '</div>' +
            '<div class="cascade-panel__list" id="creativePickFsSelected_' + key + '"></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }
    if (f.kind === 'multi') {
      var opts = f.options || [];
      var dual = opts.length > 7;
      var panel = dual
        ? ('<div class="multi-panel" id="creativePickFsPanel_' + key + '">' +
            '<div class="multi-panel__left">' +
              '<div class="multi-panel__search">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>' +
                '<input type="text" id="creativePickFsSearch_' + key + '" placeholder="搜索" autocomplete="off" />' +
              '</div>' +
              '<div class="multi-panel__toolbar"><button class="multi-panel__link" type="button" id="creativePickFsSelectAll_' + key + '">全选</button></div>' +
              '<div class="multi-panel__list" id="creativePickFsList_' + key + '"></div>' +
            '</div>' +
            '<div class="multi-panel__right">' +
              '<div class="multi-panel__toolbar multi-panel__toolbar--right"><span id="creativePickFsCount_' + key + '">已选择 0 项</span>' +
              '<button class="multi-panel__link" type="button" id="creativePickFsClearAll_' + key + '">清空</button></div>' +
              '<div class="multi-panel__list" id="creativePickFsSelected_' + key + '"></div>' +
            '</div>' +
          '</div>')
        : ('<div class="multi-panel multi-panel--simple" id="creativePickFsPanel_' + key + '">' +
            '<div class="multi-panel__list" id="creativePickFsList_' + key + '"></div>' +
          '</div>');
      return '<div class="filter-setting-control" id="creativePickFsWrap_' + key + '">' +
        '<button class="select-trigger" type="button" id="creativePickFsTrigger_' + key + '">' +
          '<span class="select-trigger__text" id="creativePickFsLabel_' + key + '">' + f.label + '：<span class="muted">请选择</span></span>' +
          '<svg class="select-trigger__arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg>' +
        '</button>' +
        '<button class="select-clear" type="button" id="creativePickFsClear_' + key + '" aria-label="清除">' + CREATIVE_CLEAR_ICON + '</button>' +
        panel +
      '</div>';
    }
    return '<div class="filter-setting-control" id="creativePickFsWrap_' + key + '">' +
      '<button class="select-trigger" type="button" id="creativePickFsTrigger_' + key + '">' +
        '<span class="select-trigger__text" id="creativePickFsLabel_' + key + '">' + f.label + '：<span class="muted">请选择</span></span>' +
        '<svg class="select-trigger__arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg>' +
      '</button>' +
      '<button class="select-clear" type="button" id="creativePickFsClear_' + key + '" aria-label="清除">' + CREATIVE_CLEAR_ICON + '</button>' +
      '<div class="single-panel" id="creativePickFsPanel_' + key + '">' +
        (f.options || []).map(function (o) {
          return '<button class="single-option" type="button" data-value="' + escapeHtml(o) + '">' + escapeHtml(o) + '</button>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  function syncCreativePickBarFromDraft() {
    var nameInput = $('creativePickNameInput');
    if (nameInput) {
      nameInput.value = creativePicker.draft.name || '';
      var nameWrap = $('creativePickNameWrap');
      if (nameWrap) nameWrap.classList.toggle('has-value', !!(creativePicker.draft.name || '').trim());
    }
    var mediaInput = $('creativePickMediaIdInput');
    if (mediaInput) {
      mediaInput.value = creativePicker.draft.mediaId || '';
      var mediaWrap = $('creativePickMediaIdWrap');
      if (mediaWrap) mediaWrap.classList.toggle('has-value', !!(creativePicker.draft.mediaId || '').trim());
    }
    syncCreativePickSourceLabel();
    syncCreativePickXmpLabel();
    if (creativePickCreatorMulti) creativePickCreatorMulti.render();
    if (creativePickSysTagMulti) creativePickSysTagMulti.render();
    if (creativePickDurationMulti) creativePickDurationMulti.render();
    if (creativePickManualTagCascade) creativePickManualTagCascade.render();
    if (creativePickTypeCascade) creativePickTypeCascade.render();
    if (creativePickSizeCascade) creativePickSizeCascade.render();
    if (creativePickDateApi && creativePicker.draft.dateStart && creativePicker.draft.dateEnd) {
      var parts = String(creativePicker.draft.dateStart).split('-');
      var parts2 = String(creativePicker.draft.dateEnd).split('-');
      if (parts.length === 3 && parts2.length === 3 && creativePickDateApi.setRange) {
        creativePickDateApi.setRange(
          new Date(+parts[0], +parts[1] - 1, +parts[2]),
          new Date(+parts2[0], +parts2[1] - 1, +parts2[2]),
          null,
          true
        );
      }
    } else if (creativePickDateApi && creativePickDateApi.clear && !creativePicker.draft.dateStart) {
      creativePickDateApi.clear(true);
    }
    syncCreativePickDateDraft();
  }

  function bindCreativePickFilterSettingsControls() {
    CREATIVE_ALL_FILTERS.forEach(function (f) {
      var key = f.key;
      if (key === 'date') {
        if (!UI.bindDateRange) return;
        var fsDate = UI.bindDateRange({
          wrapId: 'creativePickFsDateWrap',
          triggerId: 'creativePickFsDateTrigger',
          labelId: 'creativePickFsDateLabel',
          panelId: 'creativePickFsDatePanel',
          shortcutsId: 'creativePickFsDateShortcuts',
          calLeftId: 'creativePickFsDateCalLeft',
          calRightId: 'creativePickFsDateCalRight',
          prefix: '上传时间：',
          onChange: function (start, end, shortcut) {
            if (creativePickDateApi && creativePickDateApi.setRange) {
              creativePickDateApi.setRange(start, end, shortcut, true);
            }
            syncCreativePickDateDraft();
            var fsWrap = $('creativePickFsDateWrap');
            if (fsWrap) fsWrap.classList.add('has-value');
          }
        });
        if (creativePickDateApi && creativePickDateApi.getStart && creativePickDateApi.getEnd &&
            creativePickDateApi.getStart() && creativePickDateApi.getEnd() && fsDate && fsDate.setRange) {
          fsDate.setRange(creativePickDateApi.getStart(), creativePickDateApi.getEnd(), null, true);
        }
        var fsDateClear = $('creativePickFsDateClear');
        if (fsDateClear) {
          fsDateClear.addEventListener('click', function (e) {
            e.stopPropagation();
            if (creativePickDateApi && creativePickDateApi.clear) creativePickDateApi.clear();
            if (fsDate && fsDate.clear) fsDate.clear();
            syncCreativePickDateDraft();
            var fsLabel = $('creativePickFsDateLabel');
            var fsWrap = $('creativePickFsDateWrap');
            if (fsLabel) fsLabel.innerHTML = '上传时间：<span class="muted">请选择</span>';
            if (fsWrap) fsWrap.classList.remove('has-value');
          });
        }
        return;
      }
      if (f.kind === 'keyword') {
        var fsInput = $('creativePickFs_' + key);
        var mainInput = $(f.inputId);
        if (fsInput) {
          fsInput.addEventListener('input', function () {
            creativePicker.draft[key] = fsInput.value || '';
            if (mainInput) mainInput.value = fsInput.value;
            var mainWrap = mainInput && mainInput.closest('.filter-item');
            if (mainWrap) mainWrap.classList.toggle('has-value', !!(fsInput.value || '').trim());
            var fsWrap = $('creativePickFsWrap_' + key);
            if (fsWrap) fsWrap.classList.toggle('has-value', !!(fsInput.value || '').trim());
          });
          fsInput.addEventListener('click', function (e) { e.stopPropagation(); });
        }
        var fsClear = $('creativePickFsClear_' + key);
        if (fsClear) {
          fsClear.addEventListener('click', function (e) {
            e.stopPropagation();
            if (fsInput) fsInput.value = '';
            creativePicker.draft[key] = '';
            if (mainInput) mainInput.value = '';
            var mainWrap = mainInput && mainInput.closest('.filter-item');
            if (mainWrap) mainWrap.classList.remove('has-value');
            var fsWrap = $('creativePickFsWrap_' + key);
            if (fsWrap) fsWrap.classList.remove('has-value');
          });
        }
        return;
      }
      if (f.kind === 'cascade') {
        bindCreativeCascadeSelect({
          wrapId: 'creativePickFsWrap_' + key,
          triggerId: 'creativePickFsTrigger_' + key,
          panelId: 'creativePickFsPanel_' + key,
          labelId: 'creativePickFsLabel_' + key,
          groupListId: 'creativePickFsGroup_' + key,
          childListId: 'creativePickFsChild_' + key,
          selectedId: 'creativePickFsSelected_' + key,
          searchId: 'creativePickFsSearch_' + key,
          countId: 'creativePickFsCount_' + key,
          selectAllId: 'creativePickFsSelectAll_' + key,
          clearAllId: 'creativePickFsClearAll_' + key,
          clearId: 'creativePickFsClear_' + key,
          prefix: f.label + '：',
          tree: f.tree || [],
          getSelected: function () { return creativePicker.draft[key] || []; },
          setSelected: function (arr) {
            creativePicker.draft[key] = (arr || []).slice();
            syncCreativePickBarFromDraft();
          }
        });
        return;
      }
      if (f.kind === 'multi' && UI.bindMultiSelect) {
        var opts = f.options || [];
        var dual = opts.length > 7;
        var multiApi = UI.bindMultiSelect({
          wrapId: 'creativePickFsWrap_' + key,
          triggerId: 'creativePickFsTrigger_' + key,
          panelId: 'creativePickFsPanel_' + key,
          labelId: 'creativePickFsLabel_' + key,
          listId: 'creativePickFsList_' + key,
          selectedId: dual ? 'creativePickFsSelected_' + key : null,
          searchId: dual ? 'creativePickFsSearch_' + key : null,
          countId: dual ? 'creativePickFsCount_' + key : null,
          selectAllId: dual ? 'creativePickFsSelectAll_' + key : null,
          clearId: 'creativePickFsClear_' + key,
          prefix: f.label + '：',
          getOptions: function () { return (f.options || []).slice(); },
          getSelected: function () { return creativePicker.draft[key] || []; },
          setSelected: function (arr) {
            creativePicker.draft[key] = (arr || []).slice();
            syncCreativePickBarFromDraft();
          }
        });
        var panelClear = $('creativePickFsClearAll_' + key);
        if (panelClear) {
          panelClear.addEventListener('click', function (e) {
            e.stopPropagation();
            creativePicker.draft[key] = [];
            if (multiApi && multiApi.render) multiApi.render();
            syncCreativePickBarFromDraft();
          });
        }
        if (multiApi && multiApi.render) multiApi.render();
        return;
      }
      if (f.kind === 'single' && UI.bindSingleSelect) {
        UI.bindSingleSelect({
          wrapId: 'creativePickFsWrap_' + key,
          triggerId: 'creativePickFsTrigger_' + key,
          panelId: 'creativePickFsPanel_' + key,
          labelId: 'creativePickFsLabel_' + key,
          clearId: 'creativePickFsClear_' + key,
          prefix: f.label + '：',
          getValue: function () { return creativePicker.draft[key] || ''; },
          onChange: function (v) {
            creativePicker.draft[key] = v || '';
            syncCreativePickBarFromDraft();
          }
        });
      }
    });
  }

  function openCreativePickFilterSettings() {
    var grid = $('creativePickFilterCheckGrid');
    if (!grid) return;
    creativePicker.filterSettingsSnapshot = {
      draft: snapshotCreativePickDraft(),
      visibleFilters: creativePicker.visibleFilters.slice()
    };
    creativePicker.filterVisibleDraft = creativePicker.visibleFilters.slice();
    function renderFsItem(f) {
      if (!f) return '';
      var checked = creativePicker.filterVisibleDraft.indexOf(f.key) >= 0;
      return '<div class="filter-setting-item" data-fs-key="' + f.key + '">' +
        '<input type="checkbox" value="' + f.key + '"' + (checked ? ' checked' : '') + ' />' +
        creativePickFsControlHtml(f) +
      '</div>';
    }
    var rowsHtml = '';
    var i;
    for (i = 0; i < CREATIVE_ALL_FILTERS.length; i += 3) {
      rowsHtml += '<div class="filter-setting-row">' +
        CREATIVE_ALL_FILTERS.slice(i, i + 3).map(renderFsItem).join('') +
      '</div>';
    }
    grid.innerHTML = rowsHtml;
    bindCreativePickFilterSettingsControls();
    bindCreativeDatePanelPortal('creativePickFsDatePanel', 'creativePickFsDateTrigger');
    UI.openModal('creativePickFilterModal');
  }

  function restoreCreativePickFilterSettingsSnapshot() {
    var snap = creativePicker.filterSettingsSnapshot;
    if (!snap) return;
    creativePicker.draft = {
      dateStart: snap.draft.dateStart || '',
      dateEnd: snap.draft.dateEnd || '',
      name: snap.draft.name || '',
      creator: (snap.draft.creator || []).slice(),
      sysTag: (snap.draft.sysTag || []).slice(),
      manualTag: (snap.draft.manualTag || []).slice(),
      type: (snap.draft.type || []).slice(),
      size: (snap.draft.size || []).slice(),
      duration: (snap.draft.duration || []).slice(),
      source: snap.draft.source || '',
      xmp: snap.draft.xmp || '',
      mediaId: snap.draft.mediaId || ''
    };
    creativePicker.visibleFilters = (snap.visibleFilters || CREATIVE_DEFAULT_FILTERS).slice();
    creativePicker.filterSettingsSnapshot = null;
    syncCreativePickBarFromDraft();
    syncCreativePickFilterVisibility();
  }

  function closeCreativePickFilterSettings(restore) {
    if (restore) restoreCreativePickFilterSettingsSnapshot();
    else creativePicker.filterSettingsSnapshot = null;
    UI.closeModal('creativePickFilterModal');
  }

  function submitCreativePickFilterSettings() {
    var selected = [];
    var grid = $('creativePickFilterCheckGrid');
    if (grid) {
      Array.prototype.forEach.call(grid.querySelectorAll('.filter-setting-item > input[type="checkbox"]'), function (input) {
        if (input.checked) selected.push(input.value);
      });
    }
    creativePicker.visibleFilters = CREATIVE_ALL_FILTERS.map(function (f) { return f.key; }).filter(function (key) {
      return selected.indexOf(key) >= 0;
    });
    creativePicker.filterSettingsSnapshot = null;
    syncCreativePickBarFromDraft();
    syncCreativePickFilterVisibility();
    UI.closeModal('creativePickFilterModal');
  }

  function renderCreativePickMetricModal() {
    var kw = (($('creativePickMetricSearch') && $('creativePickMetricSearch').value) || '').trim().toLowerCase();
    var grouped = {};
    CREATIVE_COLUMN_GROUPS.forEach(function (g) { grouped[g] = []; });
    CREATIVE_COLUMNS.forEach(function (col) {
      if (kw && col.name.toLowerCase().indexOf(kw) < 0 && col.key.toLowerCase().indexOf(kw) < 0) return;
      if (!grouped[col.group]) grouped[col.group] = [];
      grouped[col.group].push(col);
    });
    var visibleGroups = CREATIVE_COLUMN_GROUPS.filter(function (g) { return (grouped[g] || []).length; });
    if (visibleGroups.indexOf(creativePicker.metricCat) < 0) {
      creativePicker.metricCat = visibleGroups[0] || CREATIVE_COLUMN_GROUPS[0];
    }
    var cats = $('creativePickMetricCats');
    var options = $('creativePickMetricOptions');
    var selectedList = $('creativePickMetricSelectedList');
    var countEl = $('creativePickMetricSelectedCount');
    if (cats) {
      cats.innerHTML = visibleGroups.map(function (group) {
        return '<button class="metric-cat' + (group === creativePicker.metricCat ? ' is-active' : '') + '" type="button" data-group="' + escapeHtml(group) + '">' + escapeHtml(group) + '</button>';
      }).join('');
    }
    if (options) {
      options.innerHTML = visibleGroups.map(function (group) {
        var groupCols = grouped[group] || [];
        var selectable = groupCols.filter(function (col) { return !isCreativeFrozenKey(col.key); });
        var checkedN = groupCols.filter(function (col) { return creativePicker.columnDraft.indexOf(col.key) >= 0; }).length;
        var allOn = groupCols.length > 0 && checkedN === groupCols.length;
        return '<section class="metric-group" data-group="' + escapeHtml(group) + '">' +
          '<div class="metric-group__head">' +
            '<input class="metric-check" type="checkbox" data-group-check="' + escapeHtml(group) + '"' + (allOn ? ' checked' : '') + (selectable.length ? '' : ' disabled') + ' />' +
            '<span>' + escapeHtml(group) + '</span></div>' +
          '<div class="metric-group__grid">' + groupCols.map(function (col) {
            var on = creativePicker.columnDraft.indexOf(col.key) >= 0;
            var locked = isCreativeFrozenKey(col.key);
            return '<label class="metric-option' + (locked ? ' is-disabled' : '') + '">' +
              '<input class="metric-check" type="checkbox" value="' + col.key + '"' + (on ? ' checked' : '') + (locked ? ' disabled' : '') + ' />' +
              '<span class="metric-option__name" title="' + escapeHtml(col.name) + '">' + escapeHtml(col.name) + '</span></label>';
          }).join('') + '</div></section>';
      }).join('');
    }
    creativePicker.draftFrozenCount = Math.max(
      creativeMinFrozen(creativePicker.columnDraft),
      Math.min(creativePicker.draftFrozenCount, creativePicker.columnDraft.length)
    );
    var freezeAt = creativePicker.draftFrozenCount;
    var listHtml = '';
    if (!creativePicker.columnDraft.length) {
      listHtml = '<div class="multi-panel__empty">请添加指标</div>';
    } else {
      creativePicker.columnDraft.forEach(function (key, idx) {
        if (idx === freezeAt) listHtml += '<div class="metric-freeze" data-freeze-line="1">拖到上方的列将冻结显示</div>';
        var col = CREATIVE_COLUMN_MAP[key];
        if (!col) return;
        var forced = isCreativeFrozenKey(key);
        var frozen = idx < freezeAt;
        var icon = frozen
          ? '<svg class="metric-selected__lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="6" y="11" width="12" height="9" rx="1"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>'
          : '<svg class="metric-selected__drag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
        var remove = forced ? '' : '<button class="metric-selected__remove" type="button" data-remove-col="' + escapeHtml(key) + '" aria-label="移除"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 2l8 8M10 2L2 10"/></svg></button>';
        listHtml += '<div class="metric-selected__item' + (frozen ? ' is-frozen' : '') + '" draggable="' + (forced ? 'false' : 'true') + '" data-metric="' + escapeHtml(key) + '">' +
          icon + '<span class="metric-selected__name">' + escapeHtml(col.name) + '</span>' + remove + '</div>';
      });
      if (freezeAt >= creativePicker.columnDraft.length) {
        listHtml += '<div class="metric-freeze" data-freeze-line="1">拖到上方的列将冻结显示</div>';
      }
    }
    if (selectedList) selectedList.innerHTML = listHtml;
    if (countEl) countEl.textContent = '已选 ' + creativePicker.columnDraft.length + ' 列';
  }

  function openCreativePickMetricModal() {
    creativePicker.columnDraft = creativePicker.columns.slice();
    creativePicker.draftFrozenCount = creativePicker.frozenCount;
    creativePicker.metricCat = '属性';
    var search = $('creativePickMetricSearch');
    if (search) search.value = '';
    renderCreativePickMetricModal();
    UI.openModal('creativePickMetricModal');
  }

  function bindCreativePickerFilters() {
    if (UI.bindDateRange && !creativePickDateApi) {
      creativePickDateApi = UI.bindDateRange({
        wrapId: 'creativePickDateWrap',
        triggerId: 'creativePickDateTrigger',
        panelId: 'creativePickDatePanel',
        labelId: 'creativePickDateLabel',
        shortcutsId: 'creativePickDateShortcuts',
        calLeftId: 'creativePickDateCalLeft',
        calRightId: 'creativePickDateCalRight',
        prefix: '上传时间：',
        defaultShortcut: 'last7',
        onChange: function () { syncCreativePickDateDraft(); }
      });
      bindCreativeDatePanelPortal('creativePickDatePanel', 'creativePickDateTrigger');
      syncCreativePickDateDraft();
      var dateClear = $('creativePickDateClear');
      if (dateClear) {
        dateClear.addEventListener('click', function (e) {
          e.stopPropagation();
          if (creativePickDateApi && creativePickDateApi.clear) creativePickDateApi.clear();
          syncCreativePickDateDraft();
        });
      }
    }

    if (UI.bindDateRange && !creativePickDataDateApi) {
      creativePickDataDateApi = UI.bindDateRange({
        wrapId: 'creativePickDataDateWrap',
        triggerId: 'creativePickDataDateTrigger',
        panelId: 'creativePickDataDatePanel',
        labelId: 'creativePickDataDateLabel',
        shortcutsId: 'creativePickDataDateShortcuts',
        calLeftId: 'creativePickDataDateCalLeft',
        calRightId: 'creativePickDataDateCalRight',
        prefix: '数据时间：',
        defaultShortcut: 'last7',
        onChange: function () {
          creativePicker.deliveryDateCleared = false;
          creativePicker.deliveryDataReady = false;
          var wrap = $('creativePickDataDateWrap');
          if (wrap) wrap.classList.add('has-value');
        }
      });
      var dataDateClear = $('creativePickDataDateClear');
      if (dataDateClear) {
        dataDateClear.addEventListener('click', function (e) {
          e.stopPropagation();
          if (creativePickDataDateApi && creativePickDataDateApi.clear) creativePickDataDateApi.clear();
          creativePicker.deliveryDateCleared = true;
          creativePicker.deliveryDataReady = false;
          var wrap = $('creativePickDataDateWrap');
          if (wrap) wrap.classList.remove('has-value');
          renderCreativePicker();
        });
      }
    }

    if (!creativePickCreatorMulti) {
      creativePickCreatorMulti = UI.bindMultiSelect({
        wrapId: 'creativePickCreatorWrap',
        triggerId: 'creativePickCreatorTrigger',
        panelId: 'creativePickCreatorPanel',
        labelId: 'creativePickCreatorLabel',
        listId: 'creativePickCreatorList',
        selectedId: 'creativePickCreatorSelected',
        countId: 'creativePickCreatorCount',
        selectAllId: 'creativePickCreatorSelectAll',
        clearId: 'creativePickCreatorClear',
        searchId: 'creativePickCreatorSearch',
        prefix: '创意人：',
        getOptions: function () { return CREATIVE_USERS.slice(); },
        getSelected: function () { return creativePicker.draft.creator; },
        setSelected: function (arr) { creativePicker.draft.creator = arr.slice(); }
      });
      var creatorClearAll = $('creativePickCreatorClearAll');
      if (creatorClearAll) {
        creatorClearAll.addEventListener('click', function () {
          creativePicker.draft.creator = [];
          if (creativePickCreatorMulti) creativePickCreatorMulti.render();
        });
      }
    }

    if (!creativePickSysTagMulti) {
      creativePickSysTagMulti = UI.bindMultiSelect({
        wrapId: 'creativePickSysTagWrap',
        triggerId: 'creativePickSysTagTrigger',
        panelId: 'creativePickSysTagPanel',
        labelId: 'creativePickSysTagLabel',
        listId: 'creativePickSysTagList',
        clearId: 'creativePickSysTagClear',
        prefix: '系统标签：',
        getOptions: function () { return CREATIVE_SYS_TAGS.slice(); },
        getSelected: function () { return creativePicker.draft.sysTag; },
        setSelected: function (arr) { creativePicker.draft.sysTag = arr.slice(); }
      });
    }

    if (!creativePickDurationMulti) {
      creativePickDurationMulti = UI.bindMultiSelect({
        wrapId: 'creativePickDurationWrap',
        triggerId: 'creativePickDurationTrigger',
        panelId: 'creativePickDurationPanel',
        labelId: 'creativePickDurationLabel',
        listId: 'creativePickDurationList',
        clearId: 'creativePickDurationClear',
        prefix: '时长：',
        getOptions: function () { return CREATIVE_DURATION_OPTS.slice(); },
        getSelected: function () { return creativePicker.draft.duration; },
        setSelected: function (arr) { creativePicker.draft.duration = arr.slice(); }
      });
    }

    if (!creativePickManualTagCascade) {
      creativePickManualTagCascade = bindCreativeCascadeSelect({
        wrapId: 'creativePickManualTagWrap',
        triggerId: 'creativePickManualTagTrigger',
        panelId: 'creativePickManualTagPanel',
        labelId: 'creativePickManualTagLabel',
        groupListId: 'creativePickManualTagGroupList',
        childListId: 'creativePickManualTagChildList',
        selectedId: 'creativePickManualTagSelected',
        searchId: 'creativePickManualTagSearch',
        countId: 'creativePickManualTagCount',
        selectAllId: 'creativePickManualTagSelectAll',
        clearAllId: 'creativePickManualTagClearAll',
        clearId: 'creativePickManualTagClear',
        prefix: '手动标签：',
        tree: CREATIVE_MANUAL_TAG_TREE,
        getSelected: function () { return creativePicker.draft.manualTag; },
        setSelected: function (arr) { creativePicker.draft.manualTag = arr.slice(); }
      });
    }

    if (!creativePickTypeCascade) {
      creativePickTypeCascade = bindCreativeCascadeSelect({
        wrapId: 'creativePickTypeWrap',
        triggerId: 'creativePickTypeTrigger',
        panelId: 'creativePickTypePanel',
        labelId: 'creativePickTypeLabel',
        groupListId: 'creativePickTypeGroupList',
        childListId: 'creativePickTypeChildList',
        selectedId: 'creativePickTypeSelected',
        searchId: 'creativePickTypeSearch',
        countId: 'creativePickTypeCount',
        selectAllId: 'creativePickTypeSelectAll',
        clearAllId: 'creativePickTypeClearAll',
        clearId: 'creativePickTypeClear',
        prefix: '类型：',
        tree: CREATIVE_TYPE_TREE,
        getSelected: function () { return creativePicker.draft.type; },
        setSelected: function (arr) { creativePicker.draft.type = arr.slice(); }
      });
    }

    if (!creativePickSizeCascade) {
      creativePickSizeCascade = bindCreativeCascadeSelect({
        wrapId: 'creativePickSizeWrap',
        triggerId: 'creativePickSizeTrigger',
        panelId: 'creativePickSizePanel',
        labelId: 'creativePickSizeLabel',
        groupListId: 'creativePickSizeGroupList',
        childListId: 'creativePickSizeChildList',
        selectedId: 'creativePickSizeSelected',
        searchId: 'creativePickSizeSearch',
        countId: 'creativePickSizeCount',
        selectAllId: 'creativePickSizeSelectAll',
        clearAllId: 'creativePickSizeClearAll',
        clearId: 'creativePickSizeClear',
        prefix: '尺寸：',
        tree: CREATIVE_SIZE_TREE,
        getSelected: function () { return creativePicker.draft.size; },
        setSelected: function (arr) { creativePicker.draft.size = arr.slice(); }
      });
    }

    function bindKeyword(inputId, wrapId, clearId, field) {
      var input = $(inputId);
      if (input && input.getAttribute('data-bound') !== '1') {
        input.setAttribute('data-bound', '1');
        input.addEventListener('input', function () {
          creativePicker.draft[field] = input.value || '';
          var wrap = $(wrapId);
          if (wrap) wrap.classList.toggle('has-value', !!(input.value || '').trim());
        });
      }
      var clear = $(clearId);
      if (clear && clear.getAttribute('data-bound') !== '1') {
        clear.setAttribute('data-bound', '1');
        clear.addEventListener('click', function () {
          if (input) input.value = '';
          creativePicker.draft[field] = '';
          var wrap = $(wrapId);
          if (wrap) wrap.classList.remove('has-value');
        });
      }
    }
    bindKeyword('creativePickNameInput', 'creativePickNameWrap', 'creativePickNameClear', 'name');
    bindKeyword('creativePickMediaIdInput', 'creativePickMediaIdWrap', 'creativePickMediaIdClear', 'mediaId');

    function bindSingleFilter(wrapId, triggerId, panelId, clearId, field, syncLabel) {
      var wrap = $(wrapId);
      var trigger = $(triggerId);
      var panel = $(panelId);
      if (!wrap || wrap.getAttribute('data-bound') === '1') return;
      wrap.setAttribute('data-bound', '1');
      if (trigger && panel) {
        trigger.addEventListener('click', function (e) {
          e.stopPropagation();
          var open = !panel.classList.contains('is-open');
          document.querySelectorAll('.single-panel.is-open').forEach(function (p) { p.classList.remove('is-open'); });
          if (open) panel.classList.add('is-open');
        });
        panel.addEventListener('click', function (e) {
          var opt = e.target.closest('.single-option[data-value]');
          if (!opt) return;
          creativePicker.draft[field] = opt.getAttribute('data-value') || '';
          syncLabel();
          panel.classList.remove('is-open');
        });
      }
      var clear = $(clearId);
      if (clear) {
        clear.addEventListener('click', function (e) {
          e.stopPropagation();
          creativePicker.draft[field] = '';
          syncLabel();
        });
      }
    }
    bindSingleFilter('creativePickSourceWrap', 'creativePickSourceTrigger', 'creativePickSourcePanel', 'creativePickSourceClear', 'source', syncCreativePickSourceLabel);
    bindSingleFilter('creativePickXmpWrap', 'creativePickXmpTrigger', 'creativePickXmpPanel', 'creativePickXmpClear', 'xmp', syncCreativePickXmpLabel);
  }

  function bindCreativeCard() {
    bindCreativePickerFilters();

    bindSeg('creativeAllocSeg', null, function (v) {
      state.creativeAlloc = v || '账户复用';
      syncCreativeAllocTip();
      renderSplitRules();
      if (!creativeEvenAllocMismatch()) setFormItemError('creativeSelectItem', false);
    });

    var perInput = $('creativePerGroup');
    if (perInput) {
      perInput.setAttribute('data-prev-per', String(parseInt(state.creativePerGroup, 10) || 10));
      perInput.addEventListener('focus', function () {
        perInput.setAttribute('data-prev-per', String(parseInt(state.creativePerGroup, 10) || 10));
      });
      perInput.addEventListener('input', function () {
        var raw = String(perInput.value || '').replace(/\D/g, '');
        if (raw !== perInput.value) perInput.value = raw;
        var n = parseInt(raw, 10);
        state.creativePerGroup = n > 0 ? n : '';
      });
      perInput.addEventListener('blur', function () {
        var n = parseInt(perInput.value, 10);
        if (!n || n < 1) n = 10;
        if (n > CREATIVE_MAX_PER_GROUP) {
          n = CREATIVE_MAX_PER_GROUP;
          UI.showToast('单个创意组最多 ' + CREATIVE_MAX_PER_GROUP + ' 个创意', 'warning');
        }
        state.creativePerGroup = n;
        perInput.value = String(n);
        var prev = parseInt(perInput.getAttribute('data-prev-per'), 10);
        if (!prev || prev < 1) prev = n;
        perInput.setAttribute('data-prev-per', String(n));
        if (n < prev && state.creativeGroups.length) {
          var removed = trimCreativeGroupsToPerLimit(n);
          renderCreativeCard();
          if (removed) UI.showToast('已按每组 ' + n + ' 个保留较早添加的素材', 'warning');
        } else {
          renderCreativeCard();
        }
      });
    }

    var addBtn = $('creativeAddMaterialBtn');
    if (addBtn) addBtn.addEventListener('click', openCreativePicker);

    var shuffleBtn = $('creativeShuffleBtn');
    if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleAssignCreativeGroups);

    var clearGroupsBtn = $('creativeClearGroupsBtn');
    if (clearGroupsBtn) clearGroupsBtn.addEventListener('click', clearCreativeGroups);

    var list = $('creativeGroupList');
    if (list) {
      list.addEventListener('click', function (e) {
        var addToGroupBtn = e.target.closest('[data-add-to-group]');
        if (addToGroupBtn) {
          e.stopPropagation();
          if (addToGroupBtn.disabled) return;
          var addGid = addToGroupBtn.getAttribute('data-add-to-group');
          var addGroup = findCreativeGroup(addGid);
          if (addGroup && (addGroup.videos || []).length >= creativePerGroupLimit()) {
            UI.showToast('已达每组创意数上限', 'warning');
            return;
          }
          openCreativePicker({ targetGroupId: addGid });
          return;
        }
        var copyBtn = e.target.closest('[data-copy-group]');
        if (copyBtn) {
          e.stopPropagation();
          copyCreativeGroup(copyBtn.getAttribute('data-copy-group'));
          return;
        }
        var clearBtn = e.target.closest('[data-clear-group]');
        if (clearBtn) {
          e.stopPropagation();
          clearCreativeGroupVideos(clearBtn.getAttribute('data-clear-group'));
          return;
        }
        var delBtn = e.target.closest('[data-del-group]');
        if (delBtn) {
          e.stopPropagation();
          deleteCreativeGroup(delBtn.getAttribute('data-del-group'));
          return;
        }
        var removeBtn = e.target.closest('[data-remove-video]');
        if (removeBtn) {
          e.stopPropagation();
          var item = removeBtn.closest('[data-group-id]');
          removeCreativeVideo(item ? item.getAttribute('data-group-id') : '', removeBtn.getAttribute('data-remove-video'));
          return;
        }
        var playBtn = e.target.closest('[data-play-video]');
        if (playBtn) {
          e.stopPropagation();
          openCreativeVideoPlay(playBtn.getAttribute('data-play-video'));
          return;
        }
        var head = e.target.closest('[data-toggle-group]');
        if (!head) return;
        var gid = head.getAttribute('data-toggle-group');
        state.activeCreativeGroupId = state.activeCreativeGroupId === gid ? '' : gid;
        renderCreativeCard();
      });
    }

    var playClose = $('creativeVideoPlayClose');
    if (playClose) playClose.addEventListener('click', closeCreativeVideoPlay);
    var playMask = $('creativeVideoPlayModal');
    if (playMask) {
      playMask.addEventListener('click', function (e) {
        if (e.target === playMask) closeCreativeVideoPlay();
      });
    }

    var folderTree = $('creativePickFolderTree');
    if (folderTree) {
      folderTree.addEventListener('click', function (e) {
        var expand = e.target.closest('[data-expand]');
        if (expand) {
          e.stopPropagation();
          var eid = expand.getAttribute('data-expand');
          creativePicker.expanded[eid] = !creativePicker.expanded[eid];
          renderCreativePickFolders();
          return;
        }
        var row = e.target.closest('[data-folder-id]');
        if (!row) return;
        creativePicker.folderId = row.getAttribute('data-folder-id') || CREATIVE_SYS_FOLDER.id;
        creativePicker.page = 1;
        renderCreativePicker();
      });
    }
    var folderKw = $('creativePickFolderKw');
    if (folderKw) {
      folderKw.addEventListener('input', function () {
        creativePicker.folderKw = folderKw.value || '';
        renderCreativePickFolders();
      });
    }

    var queryBtn = $('creativePickQueryBtn');
    if (queryBtn) queryBtn.addEventListener('click', applyCreativePickFilters);
    var resetBtn = $('creativePickResetBtn');
    if (resetBtn) resetBtn.addEventListener('click', function () {
      resetCreativePickFilters();
      /* 重置后立即按空条件查询 */
      applyCreativePickFilters();
    });

    var crumbEl = $('creativePickBreadcrumb');
    if (crumbEl && crumbEl.getAttribute('data-bound') !== '1') {
      crumbEl.setAttribute('data-bound', '1');
      crumbEl.addEventListener('click', function (e) {
        var link = e.target.closest('[data-crumb]');
        if (!link) return;
        var id = link.getAttribute('data-crumb') || CREATIVE_SYS_FOLDER.id;
        creativePicker.folderId = id;
        creativePicker.page = 1;
        renderCreativePicker();
      });
    }

    var rememberPage = $('creativePickRememberPage');
    if (rememberPage && rememberPage.getAttribute('data-bound') !== '1') {
      rememberPage.setAttribute('data-bound', '1');
      rememberPage.checked = !!creativePicker.rememberPage;
      rememberPage.addEventListener('change', function () {
        creativePicker.rememberPage = !!rememberPage.checked;
        persistCreativePickPagination();
      });
    }

    var showDelivery = $('creativePickShowDelivery');
    if (showDelivery) {
      showDelivery.addEventListener('change', function () {
        creativePicker.showDeliveryData = !!showDelivery.checked;
        creativePicker.deliveryDataReady = false;
        if (!creativePicker.showDeliveryData) {
          creativePicker.sortSpecs = (creativePicker.sortSpecs || []).filter(function (s) {
            return !isCreativeDataCol(CREATIVE_COLUMN_MAP[s.key]);
          });
        } else if (creativePicker.deliveryDateCleared && creativePickDataDateApi && creativePickDataDateApi.setRange) {
          var today = new Date();
          today.setHours(0, 0, 0, 0);
          var start = new Date(today);
          start.setDate(start.getDate() - 6);
          creativePickDataDateApi.setRange(start, today, 'last7', true);
          creativePicker.deliveryDateCleared = false;
        }
        syncCreativePickDataDateVisibility();
        renderCreativePicker();
      });
    }

    var filterSettingBtn = $('creativePickFilterSettingBtn');
    if (filterSettingBtn) {
      filterSettingBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        openCreativePickFilterSettings();
      });
    }
    var filterSubmit = $('creativePickFilterSubmit');
    if (filterSubmit) filterSubmit.addEventListener('click', submitCreativePickFilterSettings);

    var metricsBtn = $('creativePickMetricsBtn');
    if (metricsBtn) metricsBtn.addEventListener('click', openCreativePickMetricModal);
    var metricSearch = $('creativePickMetricSearch');
    if (metricSearch) metricSearch.addEventListener('input', renderCreativePickMetricModal);
    var metricCats = $('creativePickMetricCats');
    if (metricCats) {
      metricCats.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-group]');
        if (!btn) return;
        creativePicker.metricCat = btn.getAttribute('data-group') || '属性';
        renderCreativePickMetricModal();
      });
    }
    var metricOptions = $('creativePickMetricOptions');
    if (metricOptions) {
      metricOptions.addEventListener('change', function (e) {
        var input = e.target.closest('input.metric-check');
        if (!input) return;
        if (input.hasAttribute('data-group-check')) {
          var group = input.getAttribute('data-group-check');
          CREATIVE_COLUMNS.forEach(function (col) {
            if (col.group !== group || isCreativeFrozenKey(col.key)) return;
            var idx = creativePicker.columnDraft.indexOf(col.key);
            if (input.checked && idx < 0) creativePicker.columnDraft.push(col.key);
            if (!input.checked && idx >= 0) creativePicker.columnDraft.splice(idx, 1);
          });
        } else {
          var key = input.value;
          if (isCreativeFrozenKey(key)) return;
          var at = creativePicker.columnDraft.indexOf(key);
          if (input.checked && at < 0) creativePicker.columnDraft.push(key);
          if (!input.checked && at >= 0) creativePicker.columnDraft.splice(at, 1);
        }
        renderCreativePickMetricModal();
      });
    }
    var metricSelectedList = $('creativePickMetricSelectedList');
    if (metricSelectedList) {
      metricSelectedList.addEventListener('click', function (e) {
        var remove = e.target.closest('[data-remove-col]');
        if (!remove) return;
        var rk = remove.getAttribute('data-remove-col');
        if (isCreativeFrozenKey(rk)) return;
        creativePicker.columnDraft = creativePicker.columnDraft.filter(function (k) { return k !== rk; });
        renderCreativePickMetricModal();
      });
      metricSelectedList.addEventListener('dragstart', function (e) {
        var item = e.target.closest('[data-metric]');
        if (!item || isCreativeFrozenKey(item.getAttribute('data-metric'))) {
          e.preventDefault();
          return;
        }
        creativePicker.dragMetric = item.getAttribute('data-metric');
      });
      metricSelectedList.addEventListener('dragover', function (e) { e.preventDefault(); });
      metricSelectedList.addEventListener('drop', function (e) {
        e.preventDefault();
        var key = creativePicker.dragMetric;
        creativePicker.dragMetric = '';
        if (!key || isCreativeFrozenKey(key)) return;
        var line = e.target.closest('[data-freeze-line]');
        var target = e.target.closest('[data-metric]');
        var list = creativePicker.columnDraft.filter(function (k) { return k !== key; });
        var insertAt = list.length;
        if (line) insertAt = creativePicker.draftFrozenCount;
        else if (target) {
          insertAt = list.indexOf(target.getAttribute('data-metric'));
          if (insertAt < 0) insertAt = list.length;
        }
        list.splice(insertAt, 0, key);
        creativePicker.columnDraft = list;
        if (line) {
          creativePicker.draftFrozenCount = Math.max(creativeMinFrozen(list), Math.min(insertAt + 1, list.length));
        }
        renderCreativePickMetricModal();
      });
    }
    var metricClear = $('creativePickMetricClear');
    if (metricClear) {
      metricClear.addEventListener('click', function () {
        creativePicker.columnDraft = creativePicker.columnDraft.filter(isCreativeFrozenKey);
        creativePicker.draftFrozenCount = creativeMinFrozen(creativePicker.columnDraft);
        renderCreativePickMetricModal();
      });
    }
    var metricSubmit = $('creativePickMetricSubmit');
    if (metricSubmit) {
      metricSubmit.addEventListener('click', function () {
        creativePicker.columns = creativePicker.columnDraft.slice();
        creativePicker.frozenCount = Math.max(
          creativeMinFrozen(creativePicker.columns),
          Math.min(creativePicker.draftFrozenCount, creativePicker.columns.length)
        );
        UI.closeModal('creativePickMetricModal');
        renderCreativePicker();
      });
    }

    if (UI.bindThSort && !creativePickSortApi) {
      creativePickSortApi = UI.bindThSort({
        root: '#creativePickListTable',
        getState: function () { return { specs: creativePicker.sortSpecs }; },
        setState: function (next) {
          var specs = (next && next.specs) || [];
          creativePicker.sortSpecs = specs.length ? [specs[specs.length - 1]] : [];
        },
        onChange: function () {
          creativePicker.page = 1;
          renderCreativePicker();
        }
      });
    }

    var listTable = $('creativePickListTable');
    if (listTable && listTable.getAttribute('data-pick-bound') !== '1') {
      listTable.setAttribute('data-pick-bound', '1');
      listTable.addEventListener('change', function (e) {
        if (e.target && e.target.id === 'creativePickListCheckAll') {
          setCreativePickPageChecked(!!e.target.checked);
          return;
        }
        var input = e.target.closest('input[data-pick-id]');
        if (!input) return;
        var id = input.getAttribute('data-pick-id');
        var idx = creativePicker.draftIds.indexOf(id);
        if (input.checked && idx < 0) {
          if (creativePicker.draftIds.length >= creativePickSelectLimit()) {
            input.checked = false;
            UI.showToast(creativePickSelectLimitToast(), 'warning');
            return;
          }
          creativePicker.draftIds.push(id);
        } else if (!input.checked && idx >= 0) {
          creativePicker.draftIds.splice(idx, 1);
        }
        renderCreativePicker();
      });
      listTable.addEventListener('click', function (e) {
        if (e.target.closest('input[type="checkbox"]')) return;
        if (e.target.closest('.th-sort')) return;
        var tr = e.target.closest('tbody tr[data-id]');
        if (!tr) return;
        toggleCreativePickId(tr.getAttribute('data-id'));
      });
    }

    ['creativePickClose', 'creativePickCancel'].forEach(function (id) {
      var btn = $(id);
      if (btn) btn.addEventListener('click', closeCreativePicker);
    });
    var submitBtn = $('creativePickSubmit');
    if (submitBtn) submitBtn.addEventListener('click', submitCreativePicker);

    renderCreativeCard();
  }

  function syncCardSegs() {
    function sync(segId, value) {
      var seg = $(segId);
      if (!seg) return;
      Array.prototype.forEach.call(seg.querySelectorAll('.seg__item'), function (btn) {
        btn.classList.toggle('is-active', (btn.getAttribute('data-value') || '') === value);
      });
    }
    sync('basicObjectiveSeg', state.objective);
    sync('basicPromoTypeSeg', state.promoType);
    sync('basicSetupSeg', state.setup);
  }

  function syncModalSegs() {
    function sync(segId, value) {
      var seg = $(segId);
      if (!seg) return;
      Array.prototype.forEach.call(seg.querySelectorAll('.seg__item'), function (btn) {
        btn.classList.toggle('is-active', (btn.getAttribute('data-value') || '') === value);
      });
    }
    sync('createAdObjectiveSeg', modalDraft.objective);
    sync('createAdPromoTypeSeg', modalDraft.promoType);
    sync('createAdSetupSeg', modalDraft.setup);
  }

  function bindSeg(segId, getDraft, setDraft) {
    var seg = $(segId);
    if (!seg) return;
    seg.addEventListener('click', function (e) {
      var btn = e.target.closest('.seg__item');
      if (!btn || !seg.contains(btn)) return;
      Array.prototype.forEach.call(seg.querySelectorAll('.seg__item'), function (item) {
        item.classList.toggle('is-active', item === btn);
      });
      if (setDraft) setDraft(btn.getAttribute('data-value') || '');
    });
  }

  var modalDraft = {
    objective: '',
    promoType: '',
    setup: '',
    productId: ''
  };
  var createAdProductApi = null;

  function bindCreateAdSearchSingle(cfg) {
    var wrap = $(cfg.wrapId);
    var trigger = $(cfg.triggerId);
    var panel = $(cfg.panelId);
    var label = $(cfg.labelId);
    var list = $(cfg.listId);
    var search = $(cfg.searchId);
    var value = '';

    function options() {
      return cfg.getOptions ? cfg.getOptions() : [];
    }

    function textOf(item) {
      return cfg.getLabel ? cfg.getLabel(item) : String(item);
    }

    function valueOf(item) {
      return cfg.getValue ? cfg.getValue(item) : String(item);
    }

    function findCurrent() {
      var found = null;
      options().forEach(function (item) {
        if (String(valueOf(item)) === String(value)) found = item;
      });
      return found;
    }

    function syncLabel() {
      var current = findCurrent();
      if (!current) {
        label.innerHTML = '<span class="muted">请选择</span>';
        wrap.classList.remove('has-value');
        return;
      }
      if (cfg.renderLabel) {
        label.innerHTML = cfg.renderLabel(current);
      } else {
        var icon = cfg.getIconHtml ? cfg.getIconHtml(current) : '';
        label.innerHTML = icon + '<span>' + escapeHtml(textOf(current)) + '</span>';
      }
      wrap.classList.add('has-value');
    }

    function matchKeyword(item, kw) {
      if (!kw) return true;
      if (textOf(item).toLowerCase().indexOf(kw) >= 0) return true;
      if (String(valueOf(item) || '').toLowerCase().indexOf(kw) >= 0) return true;
      return false;
    }

    function render() {
      var kw = ((search && search.value) || '').trim().toLowerCase();
      var items = options().filter(function (item) {
        return matchKeyword(item, kw);
      });
      if (!items.length) {
        list.innerHTML = '<div class="single-panel__empty">暂无数据</div>';
        return;
      }
      list.innerHTML = items.map(function (item) {
        var itemValue = valueOf(item);
        var selected = String(itemValue) === String(value);
        if (cfg.renderOption) return cfg.renderOption(item, selected);
        var icon = cfg.getIconHtml ? cfg.getIconHtml(item) : '';
        var active = selected ? ' is-active' : '';
        return '<button type="button" class="single-option' + active + '" data-value="' + escapeHtml(itemValue) + '">' +
          icon + '<span>' + escapeHtml(textOf(item)) + '</span></button>';
      }).join('');
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !panel.classList.contains('is-open');
      UI.closePanels();
      if (!open) return;
      if (search) search.value = '';
      render();
      panel.classList.add('is-open');
      trigger.classList.add('is-open');
      if (search) search.focus();
    });
    if (search) {
      search.addEventListener('click', function (e) { e.stopPropagation(); });
      search.addEventListener('input', render);
    }
    list.addEventListener('click', function (e) {
      var opt = e.target.closest('[data-value]');
      if (!opt || !list.contains(opt)) return;
      value = opt.getAttribute('data-value') || '';
      if (cfg.onChange) cfg.onChange(value);
      syncLabel();
      UI.closePanels();
    });
    if (cfg.clearId) {
      $(cfg.clearId).addEventListener('click', function (e) {
        e.stopPropagation();
        value = '';
        if (cfg.onChange) cfg.onChange('');
        syncLabel();
        UI.closePanels();
      });
    }
    wrap.addEventListener('click', function (e) { e.stopPropagation(); });
    syncLabel();
    return {
      getValue: function () { return value; },
      setValue: function (next) {
        value = next || '';
        syncLabel();
      },
      render: render
    };
  }

  function openCreateAdModal() {
    modalDraft.objective = state.objective;
    modalDraft.promoType = state.promoType;
    modalDraft.setup = state.setup;
    modalDraft.productId = state.productId || '';
    syncModalSegs();
    if (createAdProductApi) createAdProductApi.setValue(modalDraft.productId);
    var item = $('createAdProductItem');
    if (item) item.classList.remove('is-error');
    UI.openModal('createAdModal');
  }

  function closeCreateAdModal() {
    UI.closePanels();
    UI.closeModal('createAdModal');
  }

  function openSubmitConfirm() {
    UI.openModal('createAdSubmitConfirm');
  }

  function closeSubmitConfirm() {
    UI.closeModal('createAdSubmitConfirm');
  }

  function requestSubmitCreateAdModal() {
    if (!modalDraft.productId) {
      var item = $('createAdProductItem');
      if (item) item.classList.add('is-error');
      return;
    }
    if (!findProduct(modalDraft.productId)) {
      var errItem = $('createAdProductItem');
      if (errItem) errItem.classList.add('is-error');
      return;
    }
    if (String(state.productId || '') !== String(modalDraft.productId)) {
      openSubmitConfirm();
      return;
    }
    applyCreateAdModal();
  }

  function clearProductLinkedConfig() {
    state.selectedAccountIds = [];
    state.authByAccount = {};
    if (accountMulti) accountMulti.render();
    renderAuthTable();
    autoFillDeliveryMini();
    state.audienceRegions = regionsForCurrentMini();
    if (audienceRegionApi) audienceRegionApi.render();
    state.ttIdentityId = '';
    state.ttIdentityByAccount = {};
    state.ctaMode = '动态优选';
    state.ctaByAccount = {};
    if (adTtUnifiedApi) adTtUnifiedApi.setValue('');
    syncAdLandingFromMini(true);
    syncAdForm();
    renderSplitRules();
  }

  function applyCreateAdModal() {
    var product = findProduct(modalDraft.productId);
    if (!product) {
      closeSubmitConfirm();
      var errItem = $('createAdProductItem');
      if (errItem) errItem.classList.add('is-error');
      return;
    }
    var productChanged = String(state.productId || '') !== String(product.productId);
    state.objective = modalDraft.objective;
    state.promoType = modalDraft.promoType;
    state.setup = modalDraft.setup;
    state.productId = product.productId;
    state.productName = product.name;
    state.clientKey = product.clientKey;
    setFormItemError('basicProductItem', false);
    state.availableAccounts = generateAccountsForProduct(product, ACCOUNTS_PER_PRODUCT);
    if (productChanged) clearProductLinkedConfig();
    else if (accountMulti) accountMulti.render();
    syncCardSegs();
    renderProductReadonly();
    closeSubmitConfirm();
    closeCreateAdModal();
  }

  /* —— init —— */
  initFromQuery();

  var titleEl = $('createAdPageTitle');
  if (titleEl) titleEl.textContent = '创建广告';
  document.title = '创建广告 - Wonder Ads';

  renderProductReadonly();
  syncCardSegs();
  bindAccountMulti();
  if (accountMulti) accountMulti.render();
  renderAuthTable();
  bindAuthTableEvents();
  bindCampaignCard();
  bindDeliveryCard();
  bindNameTokenFields();
  bindBidCard();
  bindAudienceCard();
  bindPlacementCard();
  bindAdCard();
  bindCreativeCard();
  bindSplitRules();
  bindStepAnchors();
  setActiveStep('basic');

  if (state.mode === 'draft') {
    if (!restoreCreateAdDraft()) {
      UI.showToast('暂无草稿，已按新建打开', 'warning');
    }
  }

  createAdProductApi = bindCreateAdSearchSingle({
    wrapId: 'createAdProductWrap',
    triggerId: 'createAdProductTrigger',
    panelId: 'createAdProductPanel',
    labelId: 'createAdProductLabel',
    listId: 'createAdProductList',
    searchId: 'createAdProductSearch',
    clearId: 'createAdProductClear',
    getOptions: function () { return PRODUCTS.slice(); },
    getLabel: function (item) { return item.name; },
    getValue: function (item) { return item.productId; },
    getIconHtml: function () { return platformIconHtml(); },
    onChange: function (value) {
      modalDraft.productId = value || '';
      if (value) {
        var item = $('createAdProductItem');
        if (item) item.classList.remove('is-error');
      }
    }
  });

  bindSeg('createAdObjectiveSeg', null, function (v) { modalDraft.objective = v; });
  bindSeg('createAdPromoTypeSeg', null, function (v) { modalDraft.promoType = v; });
  bindSeg('createAdSetupSeg', null, function (v) { modalDraft.setup = v; });

  $('createAdSteps').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-step]');
    if (!btn) return;
    setStep(btn.getAttribute('data-step'));
  });

  $('basicEditBtn').addEventListener('click', openCreateAdModal);

  document.querySelectorAll('[data-close="createAdModal"]').forEach(function (btn) {
    btn.addEventListener('click', closeCreateAdModal);
  });
  document.querySelectorAll('[data-close="createAdSubmitConfirm"]').forEach(function (btn) {
    btn.addEventListener('click', closeSubmitConfirm);
  });
  document.querySelectorAll('[data-close="creativePickFilterModal"]').forEach(function (btn) {
    btn.addEventListener('click', function () { closeCreativePickFilterSettings(true); });
  });
  document.querySelectorAll('[data-close="creativePickMetricModal"]').forEach(function (btn) {
    btn.addEventListener('click', function () { UI.closeModal('creativePickMetricModal'); });
  });
  document.querySelectorAll('[data-close="adCopyBatchModal"]').forEach(function (btn) {
    btn.addEventListener('click', function () { UI.closeModal('adCopyBatchModal'); });
  });
  $('createAdModalSubmit').addEventListener('click', requestSubmitCreateAdModal);
  $('createAdSubmitConfirmOk').addEventListener('click', applyCreateAdModal);

  var previewUi = {
    active: false,
    tabId: '',
    page: 1,
    pageSize: 20,
    rows: []
  };

  function goBackToPromotion(opts) {
    opts = opts || {};
    if (opts.toast) queuePendingToast(opts.toast, opts.type || 'success');
    if (window.opener && !window.opener.closed) {
      try { window.opener.focus(); } catch (err) { /* ignore */ }
      window.close();
      setTimeout(function () {
        window.location.href = 'tiktok-promotion.html';
      }, 120);
      return;
    }
    window.location.href = 'tiktok-promotion.html';
  }

  function formatPreviewRegionCodes() {
    var codes = [];
    (state.audienceRegions || []).forEach(function (item) {
      if (REGION_OPTIONS.indexOf(item) < 0) return;
      var code = regionCode(item);
      if (code && codes.indexOf(code) < 0) codes.push(code);
    });
    return codes.length ? codes.join(',') : '-';
  }

  function formatPreviewRegionGroups() {
    var selected = state.audienceRegions || [];
    var groups = [];
    REGION_GROUPS.forEach(function (group) {
      var hit = (group.children || []).some(function (name) {
        return selected.indexOf(name) !== -1;
      });
      if (hit) groups.push(group.id);
    });
    return groups.join('_');
  }

  function previewBudgetType() {
    if (state.budgetOptimize) return state.budgetType || '-';
    return state.bidBudgetType || '-';
  }

  function previewBudgetValueText() {
    var raw = state.budgetOptimize ? state.budget : state.bidBudget;
    if (raw === '' || raw == null) return '-';
    var n = Number(raw);
    if (!isFinite(n)) return String(raw);
    return n.toFixed(2);
  }

  function previewOptGoalText() {
    var goal = String(state.optGoal || '').trim() || '-';
    var event = String(state.optEvent || '').trim() || '-';
    return goal + ' - ' + event;
  }

  function previewBidLineText() {
    var strategy = String(state.bidStrategy || '').trim() || '-';
    if (strategy === '目标ROAS') {
      var roas = String(state.targetRoas || '').trim();
      return '目标ROAS：' + (roas || '-');
    }
    return strategy;
  }

  function previewNameInitials(name) {
    var text = String(name || '').trim();
    if (!text) return '';
    var parts = text
      .replace(/([a-z\u00e0-\u00ff])([A-Z])/g, '$1 $2')
      .split(/[^0-9A-Za-z\u00C0-\u024F\u3040-\u30ff\u4e00-\u9fff]+/)
      .filter(Boolean);
    if (!parts.length) return text.charAt(0).toUpperCase();
    return parts.map(function (part) { return part.charAt(0); }).join('').toUpperCase();
  }

  function previewTodayTokens() {
    var now = new Date();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var mm = (month < 10 ? '0' : '') + month;
    var dd = (day < 10 ? '0' : '') + day;
    return { ymd: String(now.getFullYear()) + mm + dd, md: mm + dd };
  }

  function fillPreviewName(template, ctx) {
    var text = String(template || '');
    var map = {
      '{产品全称}': ctx.productName,
      '{产品简称}': ctx.productAbbr,
      '{优化师简称}': ctx.optimizerAbbr,
      '{YYYYMMDD}': ctx.ymd,
      '{MMDD}': ctx.md,
      '{地区组}': ctx.regionGroup
    };
    Object.keys(map).forEach(function (token) {
      text = text.split(token).join(map[token] == null ? '' : String(map[token]));
    });
    var seqIndex = ctx.seqIndex || 0;
    text = text.replace(/\{序号(\d*)\}/g, function (_, digits) {
      var start = digits ? parseInt(digits, 10) : 1;
      if (!isFinite(start)) start = 1;
      return String(start + seqIndex);
    });
    return text;
  }

  function creativeGroupsForAccount(accountIndex, accountCount) {
    var groups = state.creativeGroups || [];
    if (state.creativeAlloc !== '平均分配') return groups.slice();
    if (!accountCount) return [];
    return groups.filter(function (_, index) { return index % accountCount === accountIndex; });
  }

  function buildPreviewRows() {
    var campaign = state.campaignName || '';
    var adGroup = state.adGroupName || '';
    var ad = state.adName || '';
    var promoType = state.deliveryPromoType || state.promoType || '-';
    var miniName = state.miniName || state.productName || '-';
    var budgetType = previewBudgetType();
    var budget = previewBudgetValueText();
    var objectiveLines = ['推广类型：' + promoType, miniName];
    var budgetLines = ['预算优化：' + (state.budgetOptimize ? '开' : '关'), budgetType + '：' + budget];
    var bidLines = [previewOptGoalText(), previewBidLineText()];
    var region = formatPreviewRegionCodes();
    var dates = previewTodayTokens();
    var productName = state.productName || '';
    var productAbbrText = previewNameInitials(productName);
    var accountIds = state.selectedAccountIds || [];
    var rows = [];
    var dim = SPLIT_DIMS.indexOf(state.splitDimension) >= 0 ? state.splitDimension : '推广系列';
    var campaignSeq = 0;
    var adGroupSeq = 0;
    var adSeq = 0;
    accountIds.forEach(function (id, accountIndex) {
      var acc = findAccount(id);
      var userName = state.authByAccount[id] || (acc && acc.auth_user) || '';
      var nameCtx = {
        productName: productName,
        productAbbr: productAbbrText,
        optimizerAbbr: previewNameInitials(userName),
        ymd: dates.ymd,
        md: dates.md,
        regionGroup: formatPreviewRegionGroups()
      };
      var groups = creativeGroupsForAccount(accountIndex, accountIds.length);
      var accountCampaignIndex = null;
      var accountAdGroupIndex = null;
      groups.forEach(function (group, groupIndex) {
        var campaignIndex;
        var adGroupIndex;
        var adIndex;
        if (dim === '广告') {
          if (accountCampaignIndex == null) accountCampaignIndex = campaignSeq++;
          if (accountAdGroupIndex == null) accountAdGroupIndex = adGroupSeq++;
          campaignIndex = accountCampaignIndex;
          adGroupIndex = accountAdGroupIndex;
          adIndex = adSeq++;
        } else if (dim === '广告组') {
          if (accountCampaignIndex == null) accountCampaignIndex = campaignSeq++;
          campaignIndex = accountCampaignIndex;
          adGroupIndex = adGroupSeq++;
          adIndex = adSeq++;
        } else {
          campaignIndex = campaignSeq++;
          adGroupIndex = adGroupSeq++;
          adIndex = adSeq++;
        }
        var campaignText = fillPreviewName(campaign, Object.assign({ seqIndex: campaignIndex }, nameCtx));
        var adGroupText = fillPreviewName(adGroup, Object.assign({ seqIndex: adGroupIndex }, nameCtx));
        var adText = fillPreviewName(ad, Object.assign({ seqIndex: adIndex }, nameCtx));
        rows.push({
          id: 'pv-' + id + '-' + (group.id || groupIndex),
          accountId: id,
          accountName: acc ? acc.advertiser_name : String(id),
          enabled: true,
          checked: false,
          adName: adText,
          adGroupName: adGroupText,
          campaignName: campaignText,
          creativeGroupName: group.name || '',
          objectiveLines: objectiveLines,
          budgetLines: budgetLines,
          bidLines: bidLines,
          region: region
        });
      });
    });
    return rows;
  }

  function previewRowsForTab() {
    if (!previewUi.tabId) return previewUi.rows.slice();
    return previewUi.rows.filter(function (row) { return row.accountId === previewUi.tabId; });
  }

  function syncPreviewChrome() {
    var title = $('createAdPageTitle');
    if (title) {
      title.innerHTML = previewUi.active
        ? '创建广告<span class="create-ad-page__crumb-sep">/</span><span class="create-ad-page__crumb-current">预览</span>'
        : '创建广告';
    }
    var formActions = $('createAdFormActions');
    var previewActions = $('createAdPreviewActions');
    if (formActions) formActions.hidden = !!previewUi.active;
    if (previewActions) previewActions.hidden = !previewUi.active;
  }

  function setFormItemError(itemId, show, message) {
    var item = $(itemId);
    if (!item) return;
    item.classList.toggle('is-error', !!show);
    if (message) {
      var err = item.querySelector('.form-item__error');
      if (err) err.textContent = message;
    }
  }

  function clearCreateAdRequiredErrors() {
    [
      'basicProductItem', 'basicAccountItem', 'basicAuthItem',
      'campaignNameItem', 'campaignBudgetItem',
      'deliveryAdGroupNameItem', 'deliveryMiniItem',
      'bidBudgetItem', 'bidTargetRoasItem',
      'placementVersionItem',
      'adNameItem', 'adTtUnifiedItem', 'adTtByAccountItem',
      'adCopyItem', 'adCtaItem', 'adLandingItem',
      'creativeSelectItem'
    ].forEach(function (id) { setFormItemError(id, false); });
  }

  function scrollToFormItem(itemId, step) {
    if (previewUi.active) exitPreviewView();
    if (step) setStep(step, { smooth: false });
    var item = $(itemId);
    var main = $('createAdMain');
    if (!item || !main) return;
    window.requestAnimationFrame(function () {
      var offset = item.getBoundingClientRect().top - main.getBoundingClientRect().top;
      var nextTop = main.scrollTop + offset - 16;
      if (typeof main.scrollTo === 'function') {
        main.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
      } else {
        main.scrollTop = Math.max(0, nextTop);
      }
      var focusEl = item.querySelector('input.input:not([type="checkbox"]):not([type="radio"]), .select-trigger, textarea');
      if (focusEl && typeof focusEl.focus === 'function') {
        try { focusEl.focus({ preventScroll: true }); } catch (err) { focusEl.focus(); }
      }
    });
  }

  function failCreateAdRequired(itemId, step, message) {
    setFormItemError(itemId, true, message);
    return { ok: false, itemId: itemId, step: step };
  }

  function validateCreateAdRequired() {
    clearCreateAdRequiredErrors();

    if (!state.productId && !state.productName) {
      return failCreateAdRequired('basicProductItem', 'basic', '请选择关联产品');
    }
    if (!(state.selectedAccountIds && state.selectedAccountIds.length)) {
      return failCreateAdRequired('basicAccountItem', 'basic', '请选择广告账户');
    }
    var authMissing = state.selectedAccountIds.some(function (id) {
      return !String(state.authByAccount[id] || '').trim();
    });
    if (authMissing) {
      return failCreateAdRequired('basicAuthItem', 'basic', '请为每个广告账户选择授权用户');
    }

    var campaignName = String(state.campaignName || ($('campaignName') && $('campaignName').value) || '').trim();
    state.campaignName = campaignName;
    if (!campaignName) {
      return failCreateAdRequired('campaignNameItem', 'campaign', '请输入推广系列名称');
    }
    if (state.budgetOptimize) {
      var budgetRaw = String(($('campaignBudget') && $('campaignBudget').value) || state.budget || '').trim();
      state.budget = budgetRaw;
      if (!budgetRaw) {
        return failCreateAdRequired('campaignBudgetItem', 'campaign', '请输入预算');
      }
      if (!isBudgetValueValid(budgetRaw)) {
        return failCreateAdRequired('campaignBudgetItem', 'campaign', '预算金额范围：[20, 10000000)');
      }
    }

    var adGroupName = String(state.adGroupName || ($('deliveryAdGroupName') && $('deliveryAdGroupName').value) || '').trim();
    state.adGroupName = adGroupName;
    if (!adGroupName) {
      return failCreateAdRequired('deliveryAdGroupNameItem', 'delivery', '请输入广告组名称');
    }
    if (!String(state.miniId || '').trim()) {
      return failCreateAdRequired('deliveryMiniItem', 'delivery', '请选择小游戏');
    }

    if (!state.budgetOptimize) {
      var bidRaw = String(($('bidBudget') && $('bidBudget').value) || state.bidBudget || '').trim();
      state.bidBudget = bidRaw;
      if (!bidRaw) {
        return failCreateAdRequired('bidBudgetItem', 'bid', '请输入预算');
      }
      if (!isBudgetValueValid(bidRaw)) {
        return failCreateAdRequired('bidBudgetItem', 'bid', '预算金额范围：[20, 10000000)');
      }
    }
    if (state.bidStrategy === '目标ROAS') {
      var roasRaw = String(($('bidTargetRoas') && $('bidTargetRoas').value) || state.targetRoas || '').trim();
      state.targetRoas = roasRaw;
      if (!roasRaw) {
        return failCreateAdRequired('bidTargetRoasItem', 'bid', '请输入目标ROAS');
      }
    }
    if (!(state.placementVersions && state.placementVersions.length)) {
      return failCreateAdRequired('placementVersionItem', 'placement', '请选择广告位');
    }

    var adName = String(state.adName || ($('adName') && $('adName').value) || '').trim();
    state.adName = adName;
    if (!adName) {
      return failCreateAdRequired('adNameItem', 'ad', '请输入广告名称');
    }
    if (state.publishMode === '按账户') {
      var ttMissing = state.selectedAccountIds.some(function (id) {
        return !String(state.ttIdentityByAccount[id] || '').trim();
      });
      if (ttMissing) {
        return failCreateAdRequired('adTtByAccountItem', 'ad', '请为每个广告账户选择TikTok账号');
      }
    } else if (!String(state.ttIdentityId || '').trim()) {
      return failCreateAdRequired('adTtUnifiedItem', 'ad', '请选择TikTok账号');
    }

    var titles = (state.adTitles || []).map(function (t) { return String(t || '').trim(); }).filter(Boolean);
    if (!titles.length) {
      return failCreateAdRequired('adCopyItem', 'ad', '请输入广告文案');
    }
    if (state.ctaMode !== '动态优选') {
      var ctaMissing = state.selectedAccountIds.some(function (id) {
        return !(state.ctaByAccount[id] || []).length;
      });
      if (ctaMissing) {
        return failCreateAdRequired('adCtaItem', 'ad', '请选择行动号召');
      }
    }

    var landing = String(($('adLandingUrl') && $('adLandingUrl').value) || state.landingUrl || '').trim();
    state.landingUrl = landing;
    if (!landing) {
      return failCreateAdRequired('adLandingItem', 'ad', '请输入目标页面');
    }

    if (!(state.creativeGroups && state.creativeGroups.length)) {
      return failCreateAdRequired('creativeSelectItem', 'creative', '请至少添加一个创意组');
    }
    if (creativeEvenAllocMismatch()) {
      return failCreateAdRequired('creativeSelectItem', 'creative', '创意组数量必须是广告账户数的整倍数');
    }

    return { ok: true };
  }

  function creativeEvenAllocMismatch() {
    if (state.creativeAlloc !== '平均分配') return false;
    var accounts = (state.selectedAccountIds && state.selectedAccountIds.length) || 0;
    var groups = (state.creativeGroups && state.creativeGroups.length) || 0;
    if (!accounts || !groups) return false;
    return groups % accounts !== 0;
  }

  function ensureCreateAdRequiredValid() {
    var result = validateCreateAdRequired();
    if (result.ok) return true;
    scrollToFormItem(result.itemId, result.step);
    return false;
  }

  function syncPreviewCounts() {
    var el = $('createAdPreviewCounts');
    if (!el) return;
    var counts = splitCreateCounts();
    var accounts = (state.selectedAccountIds && state.selectedAccountIds.length) || 0;
    function perAccount(total) {
      if (!accounts || !total) return '0';
      var value = Math.round((total / accounts) * 100) / 100;
      if (Math.abs(value - Math.round(value)) < 1e-9) return String(Math.round(value));
      return String(value);
    }
    el.textContent =
      '推广系列 ' + perAccount(counts['推广系列']) +
      '  广告组 ' + perAccount(counts['广告组']) +
      '  广告 ' + perAccount(counts['广告']);
  }

  function syncPreviewBatchBtn() {
    var btn = $('createAdPreviewBatchBtn');
    var menu = $('createAdPreviewBatchMenu');
    if (!btn) return;
    var hasChecked = previewCheckedRows().length > 0;
    btn.disabled = !hasChecked;
    if (!hasChecked && menu) {
      menu.classList.remove('is-open');
      btn.classList.remove('is-open');
    }
  }

  function syncPreviewTabsNav() {
    var viewport = $('createAdPreviewTabsViewport');
    var tabs = $('createAdPreviewTabs');
    var prev = $('createAdPreviewTabsPrev');
    var next = $('createAdPreviewTabsNext');
    if (!viewport || !tabs) return;
    var maxScroll = Math.max(0, tabs.scrollWidth - viewport.clientWidth);
    var show = maxScroll > 1;
    if (prev) prev.hidden = !show;
    if (next) next.hidden = !show;
    if (!show) tabs.scrollLeft = 0;
  }

  function renderPreviewTabs() {
    var host = $('createAdPreviewTabs');
    if (!host) return;
    var ids = [];
    previewUi.rows.forEach(function (row) {
      if (ids.indexOf(row.accountId) < 0) ids.push(row.accountId);
    });
    if (!ids.length) {
      host.innerHTML = '<div class="create-ad-preview__tab is-active" style="cursor:default">暂无已选账户</div>';
      previewUi.tabId = '';
      requestAnimationFrame(syncPreviewTabsNav);
      return;
    }
    if (ids.indexOf(previewUi.tabId) < 0) previewUi.tabId = ids[0];
    host.innerHTML = ids.map(function (id) {
      var acc = findAccount(id);
      var name = acc ? acc.advertiser_name : id;
      return (
        '<button class="create-ad-preview__tab' + (id === previewUi.tabId ? ' is-active' : '') +
          '" type="button" role="tab" data-preview-tab="' + escapeHtml(id) + '" aria-selected="' +
          (id === previewUi.tabId ? 'true' : 'false') + '" title="' + escapeHtml(name) + '">' +
          escapeHtml(name) +
        '</button>'
      );
    }).join('');
    requestAnimationFrame(syncPreviewTabsNav);
  }

  function renderPreviewTable() {
    var body = $('createAdPreviewBody');
    var empty = $('createAdPreviewEmpty');
    if (!body) return;
    var list = previewRowsForTab();
    var totalPages = Math.max(1, Math.ceil(list.length / previewUi.pageSize) || 1);
    if (previewUi.page > totalPages) previewUi.page = totalPages;
    var start = (previewUi.page - 1) * previewUi.pageSize;
    var pageRows = list.slice(start, start + previewUi.pageSize);
    if (!pageRows.length) {
      body.innerHTML = '';
      if (empty) empty.hidden = false;
    } else {
      if (empty) empty.hidden = true;
      body.innerHTML = pageRows.map(function (row) {
        function linesHtml(lines) {
          return '<div class="preview-multiline">' + (lines || []).map(function (line) {
            return '<span>' + escapeHtml(line) + '</span>';
          }).join('') + '</div>';
        }
        return (
          '<tr data-preview-id="' + escapeHtml(row.id) + '">' +
            '<td class="col-check"><label class="cell-check"><input type="checkbox" data-preview-check="' +
              escapeHtml(row.id) + '"' + (row.checked ? ' checked' : '') + ' /></label></td>' +
            '<td class="col-switch"><button class="switch' + (row.enabled ? ' is-on' : '') +
              '" type="button" role="switch" aria-checked="' + (row.enabled ? 'true' : 'false') +
              '" data-preview-switch="' + escapeHtml(row.id) + '" aria-label="开关"></button></td>' +
            '<td title="' + escapeHtml(row.campaignName) + '">' + escapeHtml(row.campaignName) + '</td>' +
            '<td title="' + escapeHtml(row.adGroupName) + '">' + escapeHtml(row.adGroupName) + '</td>' +
            '<td title="' + escapeHtml(row.adName) + '">' + escapeHtml(row.adName) + '</td>' +
            '<td title="' + escapeHtml(row.creativeGroupName) + '">' + escapeHtml(row.creativeGroupName) + '</td>' +
            '<td>' + linesHtml(row.objectiveLines) + '</td>' +
            '<td>' + linesHtml(row.budgetLines) + '</td>' +
            '<td>' + linesHtml(row.bidLines) + '</td>' +
            '<td title="' + escapeHtml(row.region) + '">' + escapeHtml(row.region) + '</td>' +
          '</tr>'
        );
      }).join('');
    }
    var all = $('createAdPreviewCheckAll');
    if (all) {
      var hit = 0;
      pageRows.forEach(function (row) { if (row.checked) hit += 1; });
      all.checked = pageRows.length > 0 && hit === pageRows.length;
      all.indeterminate = hit > 0 && hit < pageRows.length;
    }
    syncPreviewCounts();
    syncPreviewBatchBtn();
    if (UI.renderPagination) {
      UI.renderPagination({
        containerId: 'createAdPreviewPagination',
        total: list.length,
        page: previewUi.page,
        pageSize: previewUi.pageSize
      });
    }
    if (window.ColResize) {
      var table = $('createAdPreviewTable');
      if (table) {
        if (table.getAttribute('data-col-resize') === '1') ColResize.syncTableWidth(table);
        else ColResize.refresh(table, { force: true });
      }
    }
  }

  function renderPreviewView() {
    renderPreviewTabs();
    renderPreviewTable();
  }

  function enterPreviewView() {
    previewUi.rows = buildPreviewRows();
    previewUi.page = 1;
    previewUi.tabId = previewUi.rows[0] ? previewUi.rows[0].accountId : '';
    previewUi.active = true;
    var body = $('createAdFormShell');
    if (body) body.classList.add('is-preview');
    var panel = $('createAdPreview');
    if (panel) panel.hidden = false;
    syncPreviewChrome();
    renderPreviewView();
    requestAnimationFrame(function () {
      syncPreviewTabsNav();
      if (window.ColResize) {
        var table = $('createAdPreviewTable');
        if (table) ColResize.refresh(table, { force: true });
      }
    });
  }

  function exitPreviewView() {
    previewUi.active = false;
    var body = $('createAdFormShell');
    if (body) body.classList.remove('is-preview');
    var panel = $('createAdPreview');
    if (panel) panel.hidden = true;
    var menu = $('createAdPreviewBatchMenu');
    var batchBtn = $('createAdPreviewBatchBtn');
    if (menu) menu.classList.remove('is-open');
    if (batchBtn) batchBtn.classList.remove('is-open');
    syncPreviewChrome();
  }

  function resetConfiguredItems() {
    state.selectedAccountIds = [];
    state.authByAccount = {};
    if (accountMulti) accountMulti.render();
    renderAuthTable();
    resetCampaignForm();
    resetDeliveryForm();
    resetBidForm();
    resetAudienceForm();
    resetPlacementForm();
    resetAdForm();
    resetCreativeForm();
    state.splitDimension = '推广系列';
    if (splitDimApi) splitDimApi.syncLabel('推广系列');
    renderSplitRules();
    syncCardSegs();
    setStep('basic', { smooth: false });
    if (previewUi.active) exitPreviewView();
  }

  function findPreviewRow(id) {
    for (var i = 0; i < previewUi.rows.length; i += 1) {
      if (previewUi.rows[i].id === id) return previewUi.rows[i];
    }
    return null;
  }

  function previewCheckedRows() {
    return previewUi.rows.filter(function (row) { return row.checked; });
  }

  $('createAdBackBtn').addEventListener('click', function () {
    if (previewUi.active) {
      exitPreviewView();
      return;
    }
    goBackToPromotion();
  });

  var createAdBusyTimer = 0;

  function setCreateAdBusy(on, btn) {
    var shell = $('createAdFormShell');
    var mask = $('createAdProcessing');
    var groups = [$('createAdFormActions'), $('createAdPreviewActions')];
    if (mask) mask.hidden = !on;
    if (shell) shell.setAttribute('aria-busy', on ? 'true' : 'false');
    groups.forEach(function (actions) {
      if (!actions) return;
      actions.classList.toggle('is-busy', !!on);
      actions.querySelectorAll('button').forEach(function (el) {
        el.disabled = !!on;
        el.classList.toggle('is-loading', !!(on && el === btn));
      });
    });
  }

  function runCreateAdBusy(btn, done) {
    if (createAdBusyTimer) return;
    setCreateAdBusy(true, btn);
    createAdBusyTimer = setTimeout(function () {
      createAdBusyTimer = 0;
      setCreateAdBusy(false, btn);
      done();
    }, 1500);
  }

  var createAdResetBtn = $('createAdResetBtn');
  if (createAdResetBtn) {
    createAdResetBtn.addEventListener('click', function () {
      runCreateAdBusy(createAdResetBtn, function () {
        resetConfiguredItems();
        UI.showToast('已重置', 'success');
      });
    });
  }
  var createAdSaveBtn = $('createAdSaveBtn');
  if (createAdSaveBtn) {
    createAdSaveBtn.addEventListener('click', function () {
      runCreateAdBusy(createAdSaveBtn, function () {
        if (!saveCreateAdDraft()) {
          UI.showToast('草稿保存失败', 'error');
          return;
        }
        queuePendingToast('已保存草稿', 'success');
        window.location.href = 'tiktok-promotion.html';
      });
    });
  }
  function stableStringify(value) {
    if (value == null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) {
      return '[' + value.map(function (item) { return stableStringify(item); }).join(',') + ']';
    }
    var keys = Object.keys(value).sort();
    return '{' + keys.map(function (key) {
      return JSON.stringify(key) + ':' + stableStringify(value[key]);
    }).join(',') + '}';
  }

  function createAdFormFingerprint() {
    var snapshot = {};
    CREATE_AD_DRAFT_FIELDS.forEach(function (key) {
      if (key === 'currentStep') return;
      snapshot[key] = state[key];
    });
    return stableStringify(snapshot);
  }

  var submittedFormFingerprint = '';

  function submitCreateAdTask(btn) {
    if (submittedFormFingerprint && submittedFormFingerprint === createAdFormFingerprint()) {
      UI.showToast('当前任务已提交，请勿重复操作', 'warning');
      return;
    }
    if (!ensureCreateAdRequiredValid()) return;
    if (submittedFormFingerprint) state.taskId = nextCreateAdTaskId();
    runCreateAdBusy(btn, function () {
      submittedFormFingerprint = createAdFormFingerprint();
      UI.showToast('任务已提交，请前往任务中心查看', 'success');
    });
  }

  var createAdPreviewBtn = $('createAdPreviewBtn');
  if (createAdPreviewBtn) {
    createAdPreviewBtn.addEventListener('click', function () {
      if (!ensureCreateAdRequiredValid()) return;
      enterPreviewView();
    });
  }
  var createAdSubmitBtn = $('createAdSubmitBtn');
  if (createAdSubmitBtn) {
    createAdSubmitBtn.addEventListener('click', function () {
      submitCreateAdTask(createAdSubmitBtn);
    });
  }
  var createAdPreviewBackBtn = $('createAdPreviewBackBtn');
  if (createAdPreviewBackBtn) {
    createAdPreviewBackBtn.addEventListener('click', function () {
      exitPreviewView();
    });
  }
  var createAdPreviewSubmitBtn = $('createAdPreviewSubmitBtn');
  if (createAdPreviewSubmitBtn) {
    createAdPreviewSubmitBtn.addEventListener('click', function () {
      submitCreateAdTask(createAdPreviewSubmitBtn);
    });
  }

  var previewTabs = $('createAdPreviewTabs');
  if (previewTabs) {
    previewTabs.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-preview-tab]');
      if (!btn) return;
      previewUi.tabId = btn.getAttribute('data-preview-tab') || '';
      previewUi.page = 1;
      renderPreviewView();
    });
  }

  function scrollPreviewTabs(dir) {
    var tabs = $('createAdPreviewTabs');
    var viewport = $('createAdPreviewTabsViewport');
    if (!tabs || !viewport) return;
    var step = Math.max(160, Math.floor(viewport.clientWidth * 0.6));
    tabs.scrollLeft = Math.max(0, tabs.scrollLeft + dir * step);
    syncPreviewTabsNav();
  }

  var previewTabsPrev = $('createAdPreviewTabsPrev');
  if (previewTabsPrev) {
    previewTabsPrev.addEventListener('click', function () { scrollPreviewTabs(-1); });
  }
  var previewTabsNext = $('createAdPreviewTabsNext');
  if (previewTabsNext) {
    previewTabsNext.addEventListener('click', function () { scrollPreviewTabs(1); });
  }
  window.addEventListener('resize', function () {
    if (previewUi.active) syncPreviewTabsNav();
  });

  var previewBody = $('createAdPreviewBody');
  if (previewBody && previewBody.getAttribute('data-bound') !== '1') {
    previewBody.setAttribute('data-bound', '1');
    previewBody.addEventListener('change', function (e) {
      var input = e.target.closest('[data-preview-check]');
      if (!input) return;
      var row = findPreviewRow(input.getAttribute('data-preview-check'));
      if (!row) return;
      row.checked = !!input.checked;
      renderPreviewTable();
    });
    previewBody.addEventListener('click', function (e) {
      var del = e.target.closest('[data-preview-delete]');
      if (del) {
        var delId = del.getAttribute('data-preview-delete');
        previewUi.rows = previewUi.rows.filter(function (row) { return row.id !== delId; });
        renderPreviewView();
        UI.showToast('已删除', 'success');
        return;
      }
      var sw = e.target.closest('[data-preview-switch]');
      if (sw) {
        var row = findPreviewRow(sw.getAttribute('data-preview-switch'));
        if (!row) return;
        row.enabled = !row.enabled;
        renderPreviewTable();
        return;
      }
      if (e.target.closest('input') || e.target.closest('button') || e.target.closest('a')) return;
      var tr = e.target.closest('tr[data-preview-id]');
      if (!tr) return;
      var check = tr.querySelector('[data-preview-check]');
      if (!check) return;
      check.checked = !check.checked;
      check.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  var previewCheckAll = $('createAdPreviewCheckAll');
  if (previewCheckAll) {
    previewCheckAll.addEventListener('change', function () {
      var pageRows = previewRowsForTab().slice(
        (previewUi.page - 1) * previewUi.pageSize,
        previewUi.page * previewUi.pageSize
      );
      pageRows.forEach(function (row) { row.checked = !!previewCheckAll.checked; });
      renderPreviewTable();
    });
  }

  if (UI.bindPagination) {
    UI.bindPagination({
      containerId: 'createAdPreviewPagination',
      getTotal: function () { return previewRowsForTab().length; },
      getPage: function () { return previewUi.page; },
      getPageSize: function () { return previewUi.pageSize; },
      onPageChange: function (page) { previewUi.page = page; renderPreviewTable(); },
      onPageSizeChange: function (size) { previewUi.pageSize = size; previewUi.page = 1; renderPreviewTable(); }
    });
  }

  function runPreviewBatch(action) {
    var list = previewCheckedRows();
    if (!list.length) {
      UI.showToast('请先勾选广告', 'warning');
      return;
    }
    if (action === 'enable') {
      list.forEach(function (row) { row.enabled = true; });
      renderPreviewTable();
      UI.showToast('已开启', 'success');
      return;
    }
    if (action === 'pause') {
      list.forEach(function (row) { row.enabled = false; });
      renderPreviewTable();
      UI.showToast('已暂停', 'success');
    }
  }

  var previewBatchBtn = $('createAdPreviewBatchBtn');
  var previewBatchMenu = $('createAdPreviewBatchMenu');
  if (previewBatchBtn && previewBatchMenu) {
    previewBatchBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (previewBatchBtn.disabled) return;
      var open = !previewBatchMenu.classList.contains('is-open');
      previewBatchMenu.classList.toggle('is-open', open);
      previewBatchBtn.classList.toggle('is-open', open);
    });
    previewBatchMenu.addEventListener('click', function (e) {
      e.stopPropagation();
      var item = e.target.closest('[data-preview-batch]');
      if (!item) return;
      previewBatchMenu.classList.remove('is-open');
      previewBatchBtn.classList.remove('is-open');
      runPreviewBatch(item.getAttribute('data-preview-batch'));
    });
  }

  document.addEventListener('click', function () {
    closeAuthPanels();
    if (previewBatchMenu) previewBatchMenu.classList.remove('is-open');
    if (previewBatchBtn) previewBatchBtn.classList.remove('is-open');
  });

  syncPreviewChrome();
})();
