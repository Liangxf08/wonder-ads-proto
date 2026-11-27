/* 投放系统 · 推广 / TikTok · 广告账户（定版）+ 推广系列/广告组/广告（壳同步） */
(function () {
  'use strict';

  var UI = window.ProductUI;
  if (!UI) return;

  var PROMO_TABS = ['account', 'campaign', 'adgroup', 'ad'];
  var PROMO_TAB_META = {
    account: { label: '广告账户', namePrefix: 'ACC', idBase: 7341008800001001 },
    campaign: { label: '推广系列', namePrefix: 'CAMP', idBase: 7342008800001001 },
    adgroup: { label: '广告组', namePrefix: 'ADG', idBase: 7343008800001001 },
    ad: { label: '广告', namePrefix: 'AD', idBase: 7344008800001001 }
  };
  var currentTab = 'account';

  var $ = UI.$;
  var escapeHtml = UI.escapeHtml;
  var ICON_BASE = /\/share-site\//.test(location.pathname) ? '../素材/平台图标/' : '素材/平台图标/';
  var PLATFORM_ICONS = {
    'TikTok Minis': ICON_BASE + 'TikTok.png',
    Android: ICON_BASE + 'Android.png',
    iOS: ICON_BASE + 'iOS.png'
  };
  /* 平台枚举与筛选说明一致：TikTok Minis、Android、iOS */
  var SHARED_PLATFORMS = ['TikTok Minis', 'Android', 'iOS'];
  var CAMPAIGN_PROMO_TYPES = ['MINIS', '应用安装'];
  var ADGROUP_PROMO_TYPES = ['小游戏', '短剧', 'Android', 'iOS'];
  var EFFECTIVE_STATUSES = ['投放中', '部分投放', '已暂停', '已删除'];
  var ACCOUNT_STATUSES = ['启用', '禁用'];
  var AUTOMATION_TYPES = ['升级版Smart+ 推广系列', '手动推广系列'];
  var BUDGET_MODES = ['不限', '日预算', '总预算'];
  var OPT_GOALS = ['价值', '安装'];
  var OPT_EVENTS = ['广告收入价值', '安装'];
  var BID_TYPES = ['最大投放量', '成本上限'];
  var DEEP_BID_TYPES = ['目标ROAS', '最高价值'];
  var LOCATION_SAMPLES = ['BR,EG,ID,IQ,JP,MM,PH,PK,SA,TH,TR,US', 'US,JP,KR', 'ID,TH,VN,PH', 'BR,MX,US'];
  /* 与 管理/产品列表/小游戏 目录一致（示例数据.xlsx · 小游戏） */
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
  var KEY_CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';
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
  var APP_SEED = [
    ['10001', 'Life Story', 'Android'],
    ['10002', 'Flow Master', 'Android'],
    ['10003', 'Path Flow', 'Android'],
    ['10004', 'Brain Power King', 'iOS'],
    ['10005', 'Word Dig', 'iOS'],
    ['10006', 'Cute Gun Bump', 'iOS'],
    ['10007', 'Mad Moto', 'Android'],
    ['10008', 'Color Tetris', 'iOS']
  ];
  var PRODUCTS = MINIS_SEED.map(function (item) {
    return {
      name: item[1],
      platform: 'TikTok Minis',
      clientKey: sampleClientKey(item[0]),
      productId: item[0]
    };
  }).concat(APP_SEED.map(function (item) {
    return {
      name: item[1],
      platform: item[2],
      clientKey: sampleClientKey(item[0]),
      productId: item[0]
    };
  }));
  var OPTIMIZERS = Array.from({ length: 12 }, function (_, i) {
    return '用户' + String.fromCharCode(65 + i);
  });

  var ALL_TABS = ['account', 'campaign', 'adgroup', 'ad'];
  /* defByTab：true 为筛选栏默认展示。上线时间只作指标，不进筛选。 */
  var FILTER_DEFS = [
    { key: 'account', name: '广告账户', tabs: ALL_TABS, defByTab: { account: true, campaign: true, adgroup: false, ad: false } },
    { key: 'campaign', name: '推广系列', tabs: ['campaign', 'adgroup', 'ad'], defByTab: { campaign: true, adgroup: true, ad: false } },
    { key: 'adgroup', name: '广告组', tabs: ['adgroup', 'ad'], defByTab: { adgroup: true, ad: true } },
    { key: 'ad', name: '广告', tabs: ['ad'], defByTab: { ad: true } },
    { key: 'promo_type', name: '推广类型', tabs: ['campaign', 'adgroup'], defByTab: { campaign: true, adgroup: true } },
    { key: 'create_time', name: '创建时间', tabs: ['campaign', 'adgroup', 'ad'], def: false },
    { key: 'status', name: '状态', tabs: ALL_TABS, defByTab: { account: false, campaign: true, adgroup: true, ad: true } },
    { key: 'platform', name: '平台', tabs: ALL_TABS, defByTab: { account: true, campaign: false, adgroup: false, ad: false } },
    { key: 'product', name: '产品', tabs: ALL_TABS, defByTab: { account: true, campaign: false, adgroup: false, ad: false } },
    { key: 'optimizer', name: '优化师', tabs: ALL_TABS, defByTab: { account: true, campaign: false, adgroup: false, ad: false } }
  ];

  var COHORT_DAYS = [0, 1, 2, 3, 4, 5, 6, 13, 20, 27, 29, 31];
  var COHORT_HOURS = { 0: 24, 1: 48, 2: 72, 3: 96, 4: 120, 5: 144, 6: 168, 13: 336, 20: 504, 27: 672, 29: 720, 31: 768 };
  var SHARED_DEFAULT_METRICS = [
    'spend', 'total_revenue', 'total_roas',
    'impressions', 'clicks', 'ctr', 'cpc', 'cpm',
    'ad_total', 'ad_roas_d0'
  ];
  var DEFAULT_KEYS = {
    account: ['advertiser_name', 'advertiser_id', 'balance', 'optimizer_name'].concat(SHARED_DEFAULT_METRICS),
    campaign: ['operation_status', 'campaign_name', 'campaign_id', 'budget_mode', 'budget'].concat(SHARED_DEFAULT_METRICS),
    adgroup: ['operation_status', 'adgroup_name', 'adgroup_id', 'deep_bid_type', 'roas_bid'].concat(SHARED_DEFAULT_METRICS),
    ad: ['operation_status', 'ad_name', 'smart_plus_ad_id', 'effective_status'].concat(SHARED_DEFAULT_METRICS)
  };
  var FROZEN_KEYS = {
    account: ['advertiser_name', 'advertiser_id'],
    campaign: ['operation_status', 'campaign_name', 'campaign_id'],
    adgroup: ['operation_status', 'adgroup_name', 'adgroup_id'],
    ad: ['operation_status', 'ad_name', 'smart_plus_ad_id']
  };
  var ATTR_ORDER = {
    account: [
      'advertiser_name', 'advertiser_id', 'balance', 'platform', 'product_name',
      'release_date', 'optimizer_name', 'status'
    ],
    campaign: [
      'operation_status', 'campaign_name', 'campaign_id', 'advertiser_name', 'advertiser_id',
      'objective_type', 'app_promotion_type', 'campaign_automation_type', 'budget_optimize_on',
      'budget_mode', 'budget', 'create_time', 'effective_status', 'platform', 'product_name',
      'release_date', 'optimizer_name'
    ],
    adgroup: [
      'operation_status', 'adgroup_name', 'adgroup_id', 'campaign_name', 'campaign_id',
      'advertiser_name', 'advertiser_id', 'promotion_type', 'optimization_goal', 'optimization_event',
      'bid_type', 'deep_bid_type', 'roas_bid', 'billing_event', 'budget_mode', 'budget', 'location_ids',
      'schedule_start_time', 'schedule_end_time', 'create_time', 'effective_status', 'platform',
      'product_name', 'release_date', 'optimizer_name'
    ],
    ad: [
      'operation_status', 'ad_name', 'smart_plus_ad_id', 'adgroup_name', 'adgroup_id',
      'campaign_name', 'campaign_id', 'advertiser_name', 'advertiser_id', 'create_time',
      'effective_status', 'platform', 'product_name', 'release_date', 'optimizer_name'
    ]
  };
  var ENTITY_TABS = ['campaign', 'adgroup', 'ad'];

  function metricCol(key, name, group, kind, width, tipOrExtra) {
    var tip = '';
    var extra = null;
    if (typeof tipOrExtra === 'string') {
      tip = tipOrExtra;
    } else if (tipOrExtra) {
      extra = tipOrExtra;
      tip = tipOrExtra.tip || '';
    }
    var tabs = (extra && extra.tabs) || ALL_TABS;
    var col = {
      key: key,
      name: name,
      group: group,
      kind: kind,
      width: width || 112,
      tip: tip,
      tabs: tabs,
      def: false,
      defaultFrozen: false,
      copyable: false
    };
    if (extra) {
      Object.keys(extra).forEach(function (k) {
        if (k !== 'tip') col[k] = extra[k];
      });
    }
    if (typeof col.def !== 'boolean') col.def = false;
    return col;
  }

  function cohortHourTip(day, tail) {
    return '点击后 ' + (COHORT_HOURS[day] || ((day + 1) * 24)) + ' 小时内' + tail;
  }

  function cohortCols(prefix, label, group, kind, tipFn) {
    return COHORT_DAYS.map(function (day) {
      return metricCol(prefix + '_d' + day, 'D' + day + ' ' + label, group, kind, 128, tipFn ? tipFn(day) : ('D' + day + ' ' + label));
    });
  }

  var COLUMNS = [
    metricCol('advertiser_name', '广告账户名称', '属性指标', 'text', 200, { tabs: ALL_TABS }),
    metricCol('advertiser_id', '广告账户ID', '属性指标', 'text', 180, { tabs: ALL_TABS }),
    metricCol('balance', '账户余额', '属性指标', 'money', 120, { tabs: ['account'] }),
    metricCol('platform', '平台', '属性指标', 'text', 120, { tabs: ALL_TABS }),
    metricCol('product_name', '产品名称', '属性指标', 'product', 160, { tabs: ALL_TABS, names: { account: '产品' } }),
    metricCol('release_date', '上线时间', '属性指标', 'text', 120, { tabs: ALL_TABS }),
    metricCol('optimizer_name', '优化师', '属性指标', 'text', 100, { tabs: ALL_TABS }),
    metricCol('status', '投放状态', '属性指标', 'status', 100, { tabs: ['account'] }),

    metricCol('operation_status', '开关', '属性指标', 'switch', 80, { tabs: ENTITY_TABS }),
    metricCol('campaign_name', '推广系列名称', '属性指标', 'text', 220, { tabs: ENTITY_TABS }),
    metricCol('campaign_id', '推广系列ID', '属性指标', 'text', 180, { tabs: ENTITY_TABS }),
    metricCol('objective_type', '推广目标', '属性指标', 'text', 120, { tabs: ['campaign'] }),
    metricCol('app_promotion_type', '推广类型', '属性指标', 'text', 120, { tabs: ['campaign'] }),
    metricCol('campaign_automation_type', '推广设置', '属性指标', 'text', 180, { tabs: ['campaign'] }),
    metricCol('budget_optimize_on', '预算优化', '属性指标', 'text', 100, { tabs: ['campaign'] }),
    metricCol('budget_mode', '预算模式', '属性指标', 'text', 100, { tabs: ['campaign', 'adgroup'] }),
    metricCol('budget', '预算', '属性指标', 'money', 112, { tabs: ['campaign', 'adgroup'] }),
    metricCol('create_time', '创建时间', '属性指标', 'text', 168, { tabs: ENTITY_TABS }),
    metricCol('effective_status', '状态', '属性指标', 'status', 100, { tabs: ENTITY_TABS }),

    metricCol('adgroup_name', '广告组名称', '属性指标', 'text', 220, { tabs: ['adgroup', 'ad'] }),
    metricCol('adgroup_id', '广告组ID', '属性指标', 'text', 180, { tabs: ['adgroup', 'ad'] }),
    metricCol('promotion_type', '推广类型', '属性指标', 'text', 120, { tabs: ['adgroup'] }),
    metricCol('optimization_goal', '优化目标', '属性指标', 'text', 100, { tabs: ['adgroup'] }),
    metricCol('optimization_event', '转化事件', '属性指标', 'text', 120, { tabs: ['adgroup'] }),
    metricCol('bid_type', '竞价策略', '属性指标', 'text', 120, { tabs: ['adgroup'] }),
    metricCol('deep_bid_type', '出价策略', '属性指标', 'text', 120, { tabs: ['adgroup'] }),
    metricCol('roas_bid', '目标ROAS', '属性指标', 'money', 112, { tabs: ['adgroup'] }),
    metricCol('billing_event', '计费事件', '属性指标', 'text', 100, { tabs: ['adgroup'] }),
    metricCol('location_ids', '地区', '属性指标', 'text', 220, { tabs: ['adgroup'] }),
    metricCol('schedule_start_time', '开始时间', '属性指标', 'text', 168, { tabs: ['adgroup'] }),
    metricCol('schedule_end_time', '结束时间', '属性指标', 'text', 168, { tabs: ['adgroup'] }),

    metricCol('ad_name', '广告名称', '属性指标', 'text', 220, { tabs: ['ad'] }),
    metricCol('smart_plus_ad_id', '广告ID', '属性指标', 'text', 180, { tabs: ['ad'] }),

    metricCol('spend', '总消耗', '核心指标', 'money', 112, { tabs: ALL_TABS, tip: '广告消耗总金额' }),
    metricCol('billed_cost', '净消耗', '核心指标', 'money', 112, { tabs: ['account'], tip: '广告消耗总金额，不包括使用的广告赠款或优惠券' }),
    metricCol('cash_spend', '现金消耗', '核心指标', 'money', 112, { tabs: ['account'], tip: '投放广告产生的现金消耗' }),
    metricCol('voucher_spend', '赠款消耗', '核心指标', 'money', 112, { tabs: ['account'], tip: '投放广告产生的赠款消耗' }),
    metricCol('total_revenue', '累计总收入', '核心指标', 'money', 120, '计算公式：累计广告收入+累计付费收入'),
    metricCol('total_roas', '累计ROAS', '核心指标', 'rate', 120, '计算公式：累计总收入/总消耗'),
    metricCol('impressions', '展示量', '核心指标', 'int', 112, '广告展示的次数'),
    metricCol('clicks', '点击量', '核心指标', 'int', 112, '广告获得的跳转到指定目标页面的点击次数'),
    metricCol('ctr', '点击率', '核心指标', 'rate', 112, '计算公式：点击量/展示量'),
    metricCol('cpc', '平均点击成本', '核心指标', 'money', 128, '计算公式：总消耗/点击量'),
    metricCol('cpm', '千次展示成本', '核心指标', 'money', 128, '计算公式：总消耗/展示量*1000'),
    metricCol('reach', '覆盖人数', '核心指标', 'int', 112, '至少看过您的广告一次的去重用户数'),
    metricCol('reach_cpm', '覆盖千人成本', '核心指标', 'money', 128, '计算公式：总消耗/覆盖人数*1000'),
    metricCol('frequency', '频次', '核心指标', 'int', 112, '计算公式：展示量/覆盖人数'),
    metricCol('conversion', '转化量', '核心指标', 'int', 112, '广告达成您选择的优化事件的次数'),
    metricCol('cost_per_conversion', '平均转化成本', '核心指标', 'money', 128, '计算公式：总消耗/转化量'),
    metricCol('conversion_rate', '转化率', '核心指标', 'rate', 112, '计算公式：转化量/展示量'),

    metricCol('active', '活跃度', '转化指标', 'int', 112, '归因于广告的首次打开次数'),
    metricCol('active_cost', '活跃平均成本', '转化指标', 'money', 128, '计算公式：总消耗/活跃度'),
    metricCol('unique_open', '去重打开次数', '转化指标', 'int', 128, '归因于广告的去重非首次打开次数'),
    metricCol('unique_open_cost', '去重打开成本', '转化指标', 'money', 128, '计算公式：总消耗/去重打开次数'),
    metricCol('open_rate', '打开率', '转化指标', 'rate', 112, '计算公式：去重打开次数/点击量'),
    metricCol('total_open', '总打开次数', '转化指标', 'int', 120, '归因于广告的非首次打开操作次数'),
    metricCol('open_cost', '单次打开成本', '转化指标', 'money', 128, '计算公式：总消耗/总打开次数'),

    metricCol('unique_ad', '去重广告展示数', '广告曝光', 'int', 140, '去重广告展示事件次数'),
    metricCol('unique_ad_cost', '去重广告展示成本', '广告曝光', 'money', 148, '计算公式：总消耗/去重广告展示数'),
    metricCol('ad_rate', '广告展示率', '广告曝光', 'rate', 120, '计算公式：去重广告展示数/点击量'),
    metricCol('ad_total', '广告展示总数', '广告曝光', 'int', 128, '广告展示事件次数'),
    metricCol('ad_cost', '广告展示成本', '广告曝光', 'money', 128, '计算公式：总消耗/广告展示总数'),
    metricCol('ad_value', '累计广告收入', '广告曝光', 'money', 120, '广告展示事件的总价值'),
    metricCol('ad_value_per', '单次广告收入', '广告曝光', 'money', 128, '计算公式：累计广告收入/广告展示总数'),
    metricCol('ad_roas', '广告 ROAS', '广告曝光', 'rate', 120, '计算公式：累计广告收入/总消耗'),
    metricCol('ad_impr_d0', 'D0 广告展示数', '广告曝光', 'int', 140, '点击后 24 小时内发生的广告展示事件总数')
  ].concat(cohortCols('ad_revenue', '广告收入', '广告曝光', 'money', function (day) {
    return cohortHourTip(day, '的广告收入');
  }))
    .concat(cohortCols('ad_roas', '广告ROAS', '广告曝光', 'rate', function (day) {
      return '计算公式：D' + day + ' 广告收入/总消耗';
    }))
    .concat([
      metricCol('unique_pay', '去重付费量', '付费价值', 'int', 120, '去重付费操作的次数'),
      metricCol('unique_pay_cost', '去重付费成本', '付费价值', 'money', 128, '计算公式：总消耗/去重付费量'),
      metricCol('pay_rate', '付费率', '付费价值', 'rate', 112, '计算公式：去重付费量/点击量'),
      metricCol('pay_count', '付费数', '付费价值', 'int', 112, '付费操作的次数'),
      metricCol('pay_cost', '平均付费成本', '付费价值', 'money', 128, '计算公式：总消耗/付费数'),
      metricCol('pay_value', '累计付费收入', '付费价值', 'money', 120, '付费操作的总价值'),
      metricCol('pay_value_per', '单次付费收入', '付费价值', 'money', 128, '计算公式：累计付费收入/付费数'),
      metricCol('pay_roas', '付费 ROAS', '付费价值', 'rate', 120, '计算公式：累计付费收入/总消耗'),
      metricCol('pay_count_d0', 'D0 付费量', '付费价值', 'int', 120, '点击后 24 小时内发生的付费事件数量')
    ])
    .concat(cohortCols('pay_value', '付费收入', '付费价值', 'money', function (day) {
      return cohortHourTip(day, '所有付费事件的总价值');
    }))
    .concat(cohortCols('pay_roas', '付费ROAS', '付费价值', 'rate', function (day) {
      return '计算公式：D' + day + ' 付费收入/总消耗';
    }));

  COLUMNS.forEach(function (col) {
    if (SHARED_DEFAULT_METRICS.indexOf(col.key) >= 0) col.def = true;
  });
  var COLUMN_MAP = {};
  COLUMNS.forEach(function (col) { COLUMN_MAP[col.key] = col; });

  function colLabel(col) {
    if (!col) return '';
    if (col.names && col.names[currentTab]) return col.names[currentTab];
    return col.name;
  }

  function columnsForTab(tab) {
    var list = COLUMNS.filter(function (col) {
      return !col.tabs || col.tabs.indexOf(tab) >= 0;
    });
    var order = {};
    (ATTR_ORDER[tab] || []).forEach(function (key, idx) { order[key] = idx; });
    var attrs = [];
    var rest = [];
    list.forEach(function (col) {
      if (col.group === '属性指标') attrs.push(col);
      else rest.push(col);
    });
    attrs.sort(function (a, b) {
      var ai = order.hasOwnProperty(a.key) ? order[a.key] : 999;
      var bi = order.hasOwnProperty(b.key) ? order[b.key] : 999;
      return ai - bi;
    });
    return attrs.concat(rest);
  }

  function filterDefsForTab(tab) {
    var list = FILTER_DEFS.filter(function (item) {
      return item.tabs && item.tabs.indexOf(tab) >= 0;
    });
    if (tab !== 'account') return list;
    var order = ['account', 'platform', 'product', 'optimizer', 'status'];
    return list.slice().sort(function (a, b) {
      return order.indexOf(a.key) - order.indexOf(b.key);
    });
  }

  function groupsForTab(tab) {
    var groups = [];
    columnsForTab(tab).forEach(function (col) {
      if (groups.indexOf(col.group) < 0) groups.push(col.group);
    });
    return groups;
  }

  var GROUPS = groupsForTab('account');

  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function formatDate(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function formatDateTime(d) {
    return formatDate(d) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }

  function switchStateFromStatus(effectiveStatus, operationStatus) {
    if (operationStatus === '禁用') return { on: false, disabled: true };
    if (effectiveStatus === '投放中' || effectiveStatus === '部分投放') return { on: true, disabled: false };
    if (effectiveStatus === '已暂停') return { on: false, disabled: false };
    if (effectiveStatus === '已删除') return { on: true, disabled: true };
    return { on: false, disabled: true };
  }

  function disabledOpTip(effectiveStatus, operationStatus) {
    if (operationStatus === '禁用') return '禁用状态不允许操作';
    if (effectiveStatus === '已删除') return '已删除状态不允许操作';
    return '';
  }

  function promoTypeOptions() {
    return currentTab === 'adgroup' ? ADGROUP_PROMO_TYPES.slice() : CAMPAIGN_PROMO_TYPES.slice();
  }

  function entityLabel() {
    if (currentTab === 'adgroup') return '广告组';
    if (currentTab === 'ad') return '广告';
    return '推广系列';
  }

  function buildRows(tab) {
    var meta = PROMO_TAB_META[tab] || PROMO_TAB_META.account;
    var rows = [];
    var i;
    var seedOffset = { account: 0, campaign: 3, adgroup: 7, ad: 11 }[tab] || 0;
    var minisPool = PRODUCTS.filter(function (p) { return p.platform === 'TikTok Minis'; });
    var appPool = PRODUCTS.filter(function (p) { return p.platform !== 'TikTok Minis'; });
    var pool = PRODUCTS;
    var campaignTailStatuses = ['投放中', '部分投放', '已暂停', '已删除', '部分投放'];
    function pickEnum(list, index, salt) {
      return list[Math.abs((index + 1) * 17 + salt * 13) % list.length];
    }
    for (i = 0; i < 20; i++) {
      var product;
      var objectiveType = '应用推广';
      var promoType;
      var effective;
      var budgetOptimizeOn;
      var budgetMode;
      var budget;
      if (tab === 'campaign') {
        if (i < 15) {
          product = minisPool[i % minisPool.length];
          promoType = 'MINIS';
          effective = '投放中';
          if (i < 5) {
            budgetOptimizeOn = '开';
            budgetMode = '日预算';
            budget = 10000;
          } else if (i < 10) {
            budgetOptimizeOn = '开';
            budgetMode = '总预算';
            budget = 50000;
          } else {
            budgetOptimizeOn = '关';
            budgetMode = '不限';
            budget = 0;
          }
        } else {
          product = appPool[(i - 15) % appPool.length];
          promoType = '应用安装';
          effective = campaignTailStatuses[i - 15];
          budgetOptimizeOn = '开';
          budgetMode = '日预算';
          budget = 200;
        }
      } else {
        product = pool[(i + seedOffset) % pool.length];
        promoType = product.platform === 'TikTok Minis' ? 'MINIS' : '应用安装';
        effective = EFFECTIVE_STATUSES[i % EFFECTIVE_STATUSES.length];
        budgetOptimizeOn = i % 3 === 0 ? '开' : '关';
        budgetMode = BUDGET_MODES[i % BUDGET_MODES.length];
        budget = budgetMode === '不限' ? 0 : Math.round((50 + i * 23.5) * 100) / 100;
      }
      if (tab === 'adgroup') {
        if (i < 10) {
          effective = '投放中';
          budgetMode = '不限';
          budget = 0;
        } else {
          effective = pickEnum(EFFECTIVE_STATUSES, i, 3);
          budgetOptimizeOn = pickEnum(['开', '关'], i, 9);
          budgetMode = pickEnum(BUDGET_MODES, i, 11);
          budget = budgetMode === '不限' ? 0 : Math.round((80 + ((i * 37) % 900)) * 100) / 100;
        }
      }
      if (tab === 'ad' && i < 10) effective = '投放中';
      var on = i % 5 !== 0;
      var impressions = 22000 + i * 3180 + seedOffset * 400;
      var clicks = Math.round(impressions * (0.011 + (i % 6) * 0.0035));
      /* 默认总消耗降序：前 15 条靠前；后 5 条消耗递减 */
      var campaignTailSpend = [500, 480, 460, 440, 420];
      var spend = tab === 'campaign'
        ? (i < 15
          ? Math.round((9800 - i * 80) * 100) / 100
          : campaignTailSpend[i - 15])
        : (tab === 'adgroup'
          ? (i < 10
            ? Math.round((8600 - i * 90) * 100) / 100
            : Math.round((480 - (i - 10) * 28) * 100) / 100)
          : (i < 10
            ? Math.round((7400 - i * 80) * 100) / 100
            : Math.round((360 - (i - 10) * 20) * 100) / 100));
      var release = new Date(2026, 2 + (i % 6), 1 + ((i * 3) % 27));
      var created = new Date(2026, 1 + (i % 8), 2 + ((i * 2) % 26), 9 + (i % 8), (i * 7) % 60, (i * 13) % 60);
      var opStatus = switchStateFromStatus(effective).on ? '开' : '关';
      /* 下级复用上级名称/ID，便于名称下钻筛选命中 */
      var accIdx = tab === 'campaign' ? (i % 20) : i;
      var accProduct = minisPool[accIdx % minisPool.length];
      var accName = accProduct.name.replace(/\s+/g, '_').toUpperCase() + '_TT_' + (accIdx + 1);
      var accId = String(PROMO_TAB_META.account.idBase + accIdx);
      var campProduct = i < 15 ? minisPool[i % minisPool.length] : appPool[(i - 15) % appPool.length];
      var campName = campProduct.name + '-CAMP-' + (i + 1);
      var campId = String(1805523000000100 + 300 + i);
      var adgProduct = pool[(i + 7) % pool.length];
      var adgName = adgProduct.name + '-ADG-' + (i + 1);
      var adgId = String(1905523000000100 + 700 + i);
      var goal = i % 3 === 2 ? '安装' : '价值';
      var deepBid = goal === '安装' ? '最高价值' : (i % 2 === 0 ? '目标ROAS' : '最高价值');
      var scheduleEnd = new Date(created.getTime());
      scheduleEnd.setDate(scheduleEnd.getDate() + 14 + (i % 10));
      var adgroupPromo = product.platform === 'Android' ? 'Android' : (product.platform === 'iOS' ? 'iOS' : (i % 2 ? '短剧' : '小游戏'));
      var bidType = (tab === 'adgroup' && i >= 10) ? pickEnum(BID_TYPES, i, 17) : BID_TYPES[i % BID_TYPES.length];
      if (tab === 'adgroup') {
        if (i < 10) {
          adgroupPromo = '小游戏';
          goal = '价值';
          bidType = '最大投放量';
          deepBid = '目标ROAS';
        } else {
          goal = pickEnum(OPT_GOALS, i, 5);
          deepBid = pickEnum(DEEP_BID_TYPES, i, 7);
          adgroupPromo = pickEnum(ADGROUP_PROMO_TYPES, i, 13);
        }
        if ((adgroupPromo === '小游戏' || adgroupPromo === '短剧') && i >= 10) {
          goal = '价值';
          bidType = '最大投放量';
        }
      }
      var row = {
        id: tab + '_' + i,
        advertiser_id: tab === 'campaign' ? accId : String(meta.idBase + i),
        advertiser_name: tab === 'campaign' ? accName : (product.name.replace(/\s+/g, '_').toUpperCase() + '_TT_' + (accIdx + 1)),
        balance: Math.round((80 + i * 37.26) * 100) / 100,
        platform: product.platform,
        product_name: product.name,
        client_key: product.clientKey,
        release_date: formatDate(release),
        optimizer_name: OPTIMIZERS[(i + seedOffset) % OPTIMIZERS.length],
        status: on ? '启用' : '禁用',
        campaign_name: (tab === 'adgroup' || tab === 'ad') ? campName : (product.name + '-CAMP-' + (i + 1)),
        campaign_id: (tab === 'adgroup' || tab === 'ad') ? campId : String(1805523000000100 + seedOffset * 100 + i),
        adgroup_name: tab === 'ad' ? adgName : (product.name + '-ADG-' + (i + 1)),
        adgroup_id: tab === 'ad' ? adgId : String(1905523000000100 + seedOffset * 100 + i),
        ad_name: product.name + '-AD-' + (i + 1),
        smart_plus_ad_id: String(2005523000000100 + seedOffset * 100 + i),
        objective_type: objectiveType,
        app_promotion_type: promoType,
        promotion_type: adgroupPromo,
        optimization_goal: goal,
        optimization_event: goal === '价值' ? '广告收入价值' : '安装',
        bid_type: bidType,
        deep_bid_type: deepBid,
        roas_bid: deepBid !== '目标ROAS' ? null
          : (tab === 'adgroup' && i < 10 ? (i % 2 === 0 ? 1 : 1.2)
            : (tab === 'adgroup' ? [0.8, 1.5, 1.8, 2, 0.9][(i - 10) % 5]
              : Math.round((0.8 + (i % 5) * 0.35) * 100) / 100)),
        billing_event: 'oCPM',
        location_ids: (tab === 'adgroup' && i >= 10) ? pickEnum(LOCATION_SAMPLES, i, 19) : LOCATION_SAMPLES[i % LOCATION_SAMPLES.length],
        schedule_start_time: formatDateTime(created),
        schedule_end_time: formatDateTime(scheduleEnd),
        campaign_automation_type: tab === 'campaign'
          ? (i >= 18 ? '手动推广系列' : '升级版Smart+ 推广系列')
          : AUTOMATION_TYPES[i % AUTOMATION_TYPES.length],
        budget_optimize_on: budgetOptimizeOn,
        budget_mode: budgetMode,
        budget: budget,
        create_time: formatDateTime(created),
        effective_status: effective,
        operation_status: opStatus,
        seed: i + seedOffset,
        spend: spend,
        impressions: impressions,
        clicks: clicks,
        reach: Math.round(impressions * 0.58),
        conversion: Math.round(clicks * (0.07 + (i % 5) * 0.015)),
        active: Math.round(clicks * 0.48),
        unique_open: Math.round(clicks * 0.4),
        total_open: Math.round(clicks * 0.72),
        unique_ad: Math.round(impressions * 0.26),
        ad_total: Math.round(impressions * 0.7),
        ad_value: Math.round(spend * 0.48 * 100) / 100,
        unique_pay: Math.round(clicks * 0.035),
        pay_count: Math.round(clicks * 0.06),
        pay_value: Math.round(spend * (0.58 + (i % 4) * 0.1) * 100) / 100
      };
      rows.push(row);
    }
    return rows;
  }

  function emptyDraft() {
    return {
      platform: [],
      product: [],
      optimizer: [],
      status: '',
      statuses: [],
      promoTypes: [],
      releaseStart: null,
      releaseEnd: null,
      createStart: null,
      createEnd: null
    };
  }

  function filterDefaultOn(item, tab) {
    if (item.defByTab && Object.prototype.hasOwnProperty.call(item.defByTab, tab)) return !!item.defByTab[tab];
    return !!item.def;
  }

  function defaultVisibleFilters(tab) {
    tab = tab || currentTab;
    return filterDefsForTab(tab).filter(function (item) {
      return filterDefaultOn(item, tab);
    }).map(function (item) { return item.key; });
  }

  function defaultColumnKeys(tab) {
    tab = tab || currentTab;
    return (DEFAULT_KEYS[tab] || DEFAULT_KEYS.account).slice();
  }

  function defaultColumns(tab) {
    var keys = defaultColumnKeys(tab);
    var allowed = {};
    columnsForTab(tab || currentTab).forEach(function (col) { allowed[col.key] = true; });
    return keys.filter(function (key) { return allowed[key]; });
  }

  function createTabState(tab) {
    var cols = defaultColumns(tab);
    return {
      rows: buildRows(tab),
      draft: emptyDraft(),
      applied: emptyDraft(),
      appliedAccount: '',
      appliedCampaign: '',
      appliedAdgroup: '',
      appliedAd: '',
      accountKeyword: '',
      campaignKeyword: '',
      adgroupKeyword: '',
      adKeyword: '',
      visibleFilters: defaultVisibleFilters(tab),
      columns: cols.slice(),
      frozenCount: cols.filter(function (key) { return isDefaultFrozenKey(key, tab); }).length,
      columnDraft: cols.slice(),
      draftFrozenCount: cols.filter(function (key) { return isDefaultFrozenKey(key, tab); }).length,
      columnPresets: [],
      activePresetId: 'default',
      editingPresetId: '',
      presetSeq: 1,
      sortState: { specs: [] },
      page: 1,
      pageSize: 20,
      selectedIds: {},
      appliedScale: 1,
      metricFilters: {},
      metricColors: {}
    };
  }

  var tabStates = {};
  PROMO_TABS.forEach(function (tab) {
    tabStates[tab] = createTabState(tab);
  });

  var rows = tabStates.account.rows;
  var draft = tabStates.account.draft;
  var applied = tabStates.account.applied;
  var appliedAccount = '';
  var appliedCampaign = '';
  var appliedAdgroup = '';
  var appliedAd = '';
  var visibleFilters = tabStates.account.visibleFilters.slice();
  var pendingAction = null;
  var batchBudgetState = {
    tab: 'daily',
    drafts: {},
    rows: [],
    modes: { daily: 'set', total: 'set' },
    units: { daily: 'USD', total: 'USD' },
    bulkValues: { daily: '', total: '' }
  };
  var batchBidState = {
    tab: 'roas',
    drafts: {},
    rows: [],
    modes: { roas: 'set' },
    units: { roas: 'num' },
    bulkValues: { roas: '' }
  };
  var cellEditState = { id: '', field: '' };
  var filterSettingsSnapshot = null;
  var columns = tabStates.account.columns.slice();
  var frozenCount = tabStates.account.frozenCount;
  var columnDraft = tabStates.account.columnDraft.slice();
  var draftFrozenCount = tabStates.account.draftFrozenCount;
  var metricCat = GROUPS[0];
  var metricAnchorLock = false;
  var metricTipAnchor = null;
  var columnPresets = [];
  var activePresetId = 'default';
  var editingPresetId = '';
  var presetEditId = '';
  var presetDeleteId = '';
  var presetSeq = 1;
  var sortState = { specs: [] };
  var page = 1;
  var pageSize = 20;
  var selectedIds = {};
  var appliedScale = 1;
  var metricFilters = {};
  var metricColors = {};
  var metricPop = { kind: '', key: '' };
  var METRIC_FILTER_OPS = [
    { id: 'gt', label: '大于' },
    { id: 'gte', label: '大于等于' },
    { id: 'lt', label: '小于' },
    { id: 'lte', label: '小于等于' },
    { id: 'eq', label: '等于' },
    { id: 'neq', label: '不等于' }
  ];
  var METRIC_HEAT_COLORS = [
    { id: 'orange', token: '--color-warning-6', name: '橙色' },
    { id: 'gold', token: '--color-data-11', name: '金色' },
    { id: 'red', token: '--color-danger-6', name: '红色' },
    { id: 'pink', token: '--color-data-15', name: '粉色' },
    { id: 'purple', token: '--color-data-9', name: '紫色' },
    { id: 'lime', token: '--color-data-13', name: '黄绿' },
    { id: 'green', token: '--color-data-7', name: '绿色' },
    { id: 'cyan', token: '--color-data-17', name: '青色' },
    { id: 'blue', token: '--color-data-1', name: '蓝色' },
    { id: 'deep', token: '--color-success-6', name: '深绿' }
  ];
  var batchStatusValue = '启用';

  var dateApi = null;
  var releaseDateApi = null;
  var createDateApi = null;
  var fsCreateDateApi = null;
  var platformMulti = null;
  var productMulti = null;
  var optimizerMulti = null;
  var promoTypeApi = null;
  var statusApi = null;
  var statusMulti = null;
  var accountClear = null;
  var campaignClear = null;
  var adgroupClear = null;
  var adClear = null;
  var sortApi = null;

  function currentScale() {
    if (!dateApi) return 1;
    var start = dateApi.getStart();
    var end = dateApi.getEnd();
    if (!start || !end) return 1;
    var days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
    return Math.max(days, 1) / 7;
  }

  function ratio(a, b) { return b ? a / b : 0; }

  function cohortFactor(row, day) {
    var weights = { 0: 0.42, 1: 0.51, 2: 0.58, 3: 0.64, 4: 0.7, 5: 0.75, 6: 0.8, 13: 0.9, 20: 0.96, 27: 1.02, 29: 1.05, 31: 1.08 };
    return (weights[day] || 1) * (0.92 + (row.seed % 5) * 0.03);
  }

  function metricNumber(row, key, scale) {
    var spend = row.spend * scale;
    var impressions = row.impressions * scale;
    var clicks = row.clicks * scale;
    var reach = row.reach * scale;
    var conversion = row.conversion * scale;
    var active = row.active * scale;
    var uniqueOpen = row.unique_open * scale;
    var totalOpen = row.total_open * scale;
    var uniqueAd = row.unique_ad * scale;
    var adTotal = row.ad_total * scale;
    var adValue = row.ad_value * scale;
    var uniquePay = row.unique_pay * scale;
    var payCount = row.pay_count * scale;
    var payValue = row.pay_value * scale;
    var billed = spend * 0.92;
    var cash = spend * 0.78;
    var voucher = spend - cash;
    var totalRevenue = adValue + payValue;
    var dayMatch = /_d(\d+)$/.exec(key);
    var factor = dayMatch ? cohortFactor(row, Number(dayMatch[1])) : 1;

    if (key === 'balance') return row.balance;
    if (key === 'spend') return spend;
    if (key === 'billed_cost') return billed;
    if (key === 'cash_spend') return cash;
    if (key === 'voucher_spend') return voucher;
    if (key === 'total_revenue') return totalRevenue;
    if (key === 'total_roas') return ratio(totalRevenue, spend);
    if (key === 'impressions') return impressions;
    if (key === 'clicks') return clicks;
    if (key === 'ctr') return ratio(clicks, impressions);
    if (key === 'cpc') return clicks ? spend / clicks : 0;
    if (key === 'cpm') return impressions ? spend / impressions * 1000 : 0;
    if (key === 'reach') return reach;
    if (key === 'reach_cpm') return reach ? spend / reach * 1000 : 0;
    if (key === 'frequency') return ratio(impressions, reach);
    if (key === 'conversion') return conversion;
    if (key === 'cost_per_conversion') return conversion ? spend / conversion : 0;
    if (key === 'conversion_rate') return ratio(conversion, impressions);
    if (key === 'active') return active;
    if (key === 'active_cost') return active ? spend / active : 0;
    if (key === 'unique_open') return uniqueOpen;
    if (key === 'unique_open_cost') return uniqueOpen ? spend / uniqueOpen : 0;
    if (key === 'open_rate') return ratio(uniqueOpen, clicks);
    if (key === 'total_open') return totalOpen;
    if (key === 'open_cost') return totalOpen ? spend / totalOpen : 0;
    if (key === 'unique_ad') return uniqueAd;
    if (key === 'unique_ad_cost') return uniqueAd ? spend / uniqueAd : 0;
    if (key === 'ad_rate') return ratio(uniqueAd, clicks);
    if (key === 'ad_total') return adTotal;
    if (key === 'ad_cost') return adTotal ? spend / adTotal : 0;
    if (key === 'ad_value') return adValue;
    if (key === 'ad_value_per') return adTotal ? adValue / adTotal : 0;
    if (key === 'ad_roas') return ratio(adValue, spend);
    if (key === 'ad_impr_d0') return adTotal * cohortFactor(row, 0);
    if (key.indexOf('ad_revenue_d') === 0) return adValue * factor;
    if (key.indexOf('ad_roas_d') === 0) return ratio(adValue * factor, spend);
    if (key === 'unique_pay') return uniquePay;
    if (key === 'unique_pay_cost') return uniquePay ? spend / uniquePay : 0;
    if (key === 'pay_rate') return ratio(uniquePay, clicks);
    if (key === 'pay_count') return payCount;
    if (key === 'pay_cost') return payCount ? spend / payCount : 0;
    if (key === 'pay_value') return payValue;
    if (key === 'pay_value_per') return payCount ? payValue / payCount : 0;
    if (key === 'pay_roas') return ratio(payValue, spend);
    if (key === 'pay_count_d0') return payCount * cohortFactor(row, 0);
    if (key.indexOf('pay_value_d') === 0) return payValue * factor;
    if (key.indexOf('pay_roas_d') === 0) return ratio(payValue * factor, spend);
    return 0;
  }

  function formatNumber(n, digits) {
    var value = Number(n || 0);
    if (!isFinite(value)) value = 0;
    return value.toFixed(digits);
  }

  function formatByKind(n, kind) {
    if (kind === 'money') return formatNumber(n, 2);
    if (kind === 'int') return formatNumber(n, 0);
    if (kind === 'dec') return formatNumber(n, 2);
    if (kind === 'rate') return formatNumber(n * 100, 2) + '%';
    return '';
  }

  function isNumericMetric(col) {
    return !!(col && col.group !== '属性指标');
  }

  function isRatioMetric(key) {
    if (key === 'total_roas' || key === 'ctr' || key === 'cpc' || key === 'cpm' || key === 'reach_cpm' || key === 'frequency' || key === 'cost_per_conversion' || key === 'conversion_rate' || key === 'active_cost' || key === 'unique_open_cost' || key === 'open_rate' || key === 'open_cost' || key === 'unique_ad_cost' || key === 'ad_rate' || key === 'ad_cost' || key === 'ad_value_per' || key === 'ad_roas' || key === 'unique_pay_cost' || key === 'pay_rate' || key === 'pay_cost' || key === 'pay_value_per' || key === 'pay_roas') return true;
    return key.indexOf('ad_roas_d') === 0 || key.indexOf('pay_roas_d') === 0;
  }

  function isDefaultFrozenKey(key, tab) {
    tab = tab || currentTab;
    return (FROZEN_KEYS[tab] || []).indexOf(key) >= 0;
  }

  function currentPlatforms() {
    return SHARED_PLATFORMS.slice();
  }

  function parseMultiLineKw(raw) {
    return String(raw || '')
      .split(/[\n\r,，;；\s]+/)
      .map(function (s) { return s.trim().toLowerCase(); })
      .filter(Boolean);
  }

  function matchNameIdKw(row, rawKw, nameKey, idKey) {
    var tokens = parseMultiLineKw(rawKw);
    if (!tokens.length) return true;
    var name = String(row[nameKey] || '').toLowerCase();
    var id = String(row[idKey] || '').toLowerCase();
    return tokens.some(function (t) {
      return name.indexOf(t) !== -1 || id.indexOf(t) !== -1;
    });
  }

  function matchAccountKw(row, rawKw) {
    return matchNameIdKw(row, rawKw, 'advertiser_name', 'advertiser_id');
  }

  function matchCampaignKw(row, rawKw) {
    return matchNameIdKw(row, rawKw, 'campaign_name', 'campaign_id');
  }

  function productOptions() {
    return PRODUCTS.filter(function (item) {
      return !draft.platform.length || draft.platform.indexOf(item.platform) >= 0;
    }).map(function (item) { return item.name; });
  }

  function productIconHtml(platform) {
    var src = PLATFORM_ICONS[platform];
    if (!src) return '';
    return '<span class="select-option-icon"><img src="' + src + '" alt="" /></span>';
  }

  function productPlatform(name) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].name === name) return PRODUCTS[i].platform;
    }
    return '';
  }

  function pruneProducts() {
    var allowed = productOptions();
    draft.product = draft.product.filter(function (name) { return allowed.indexOf(name) >= 0; });
  }

  function cloneDraft(src) {
    return {
      platform: (src.platform || []).slice(),
      product: (src.product || []).slice(),
      optimizer: (src.optimizer || []).slice(),
      status: src.status || '',
      statuses: (src.statuses || []).slice(),
      promoTypes: (src.promoTypes || []).slice(),
      releaseStart: src.releaseStart ? new Date(src.releaseStart.getTime()) : null,
      releaseEnd: src.releaseEnd ? new Date(src.releaseEnd.getTime()) : null,
      createStart: src.createStart ? new Date(src.createStart.getTime()) : null,
      createEnd: src.createEnd ? new Date(src.createEnd.getTime()) : null
    };
  }

  function inDateFieldRange(row, field, start, end) {
    if (!start || !end) return true;
    var raw = String(row[field] || '').slice(0, 10);
    var parts = raw.split('-');
    if (parts.length !== 3) return false;
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    d.setHours(0, 0, 0, 0);
    var s = new Date(start.getTime()); s.setHours(0, 0, 0, 0);
    var e = new Date(end.getTime()); e.setHours(0, 0, 0, 0);
    return d >= s && d <= e;
  }

  function metricOpLabel(id) {
    var found = '大于';
    METRIC_FILTER_OPS.forEach(function (op) {
      if (op.id === id) found = op.label;
    });
    return found;
  }

  function heatColorById(id) {
    var found = null;
    METRIC_HEAT_COLORS.forEach(function (item) {
      if (item.id === id) found = item;
    });
    return found;
  }

  function metricFilterConds(key) {
    return (metricFilters[key] || []).filter(function (cond) {
      return cond && cond.op && cond.value !== '' && cond.value != null && isFinite(Number(cond.value));
    }).slice(0, 1);
  }

  function matchMetricCond(num, cond) {
    var n = Number(cond.value);
    if (!isFinite(num) || !isFinite(n)) return false;
    if (cond.op === 'gt') return num > n;
    if (cond.op === 'gte') return num >= n;
    if (cond.op === 'lt') return num < n;
    if (cond.op === 'lte') return num <= n;
    if (cond.op === 'eq') return Math.abs(num - n) < 1e-9;
    if (cond.op === 'neq') return Math.abs(num - n) >= 1e-9;
    return true;
  }

  function parseFilterInput(key, value) {
    var n = Number(value);
    if (!isFinite(n)) return NaN;
    var col = COLUMN_MAP[key];
    if (col && col.kind === 'rate') return n / 100;
    return n;
  }

  function rowPassesMetricFilters(row, scale) {
    var keys = Object.keys(metricFilters);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var conds = metricFilterConds(key);
      if (!conds.length) continue;
      var num = metricNumber(row, key, scale);
      if (!isFinite(num)) return false;
      for (var j = 0; j < conds.length; j++) {
        var cond = { op: conds[j].op, value: parseFilterInput(key, conds[j].value) };
        if (!matchMetricCond(num, cond)) return false;
      }
    }
    return true;
  }

  function buildHeatScale(metrics, list, scale) {
    var heat = {};
    (metrics || []).forEach(function (metric) {
      if (!metricColors[metric]) return;
      var min = Infinity;
      var max = -Infinity;
      list.forEach(function (row) {
        var n = metricNumber(row, metric, scale);
        if (!isFinite(n)) return;
        if (n < min) min = n;
        if (n > max) max = n;
      });
      if (min !== Infinity) heat[metric] = { min: min, max: max };
    });
    return heat;
  }

  function metricHeatAttr(metric, raw, scaleMap) {
    var spec = heatColorById(metricColors[metric]);
    if (!spec) return '';
    var num = Number(raw);
    if (!isFinite(num)) return '';
    var range = scaleMap[metric];
    var t = 1;
    if (range && range.max > range.min) t = (num - range.min) / (range.max - range.min);
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    var pct = Math.round(18 + t * 62);
    return ' style="--heat-color:var(' + spec.token + ');--heat-amt:' + pct + '%"';
  }

  function metricToolsHtml(key) {
    var filtering = metricFilterConds(key).length > 0;
    var color = heatColorById(metricColors[key]);
    var dot = color
      ? '<i class="th-metric__dot" style="--heat-color:var(' + color.token + ')"></i>'
      : '';
    return '<div class="th-metric__bar">' +
      '<button type="button" class="th-metric__btn' + (filtering ? ' is-on' : '') + '" data-metric-filter="' + escapeHtml(key) + '" aria-label="筛选" title="筛选">' +
        '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.8 2.2h12.4c.3 0 .5.3.3.6L9.6 8.1v4.6c0 .3-.2.5-.5.6l-2.2.9c-.4.1-.7-.1-.7-.5V8.1L1.5 2.8c-.2-.3 0-.6.3-.6z" fill="currentColor"/></svg>' +
      '</button>' +
      '<button type="button" class="th-metric__btn' + (color ? ' is-on' : '') + '" data-metric-color="' + escapeHtml(key) + '" aria-label="色彩地图" title="色彩地图">' +
        '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="3.2" cy="8" r="1.15" fill="currentColor"/><circle cx="8" cy="8" r="1.15" fill="currentColor"/><circle cx="12.8" cy="8" r="1.15" fill="currentColor"/></svg>' +
        dot +
      '</button>' +
    '</div>';
  }

  function inReleaseRange(row, start, end) {
    return inDateFieldRange(row, 'release_date', start, end);
  }

  function filteredRows() {
    var scale = appliedScale;
    var list = rows.filter(function (row) {
      if (visibleFilters.indexOf('account') >= 0 && !matchAccountKw(row, appliedAccount)) return false;
      if (visibleFilters.indexOf('campaign') >= 0 && !matchCampaignKw(row, appliedCampaign)) return false;
      if (visibleFilters.indexOf('adgroup') >= 0 && !matchNameIdKw(row, appliedAdgroup, 'adgroup_name', 'adgroup_id')) return false;
      if (visibleFilters.indexOf('ad') >= 0 && !matchNameIdKw(row, appliedAd, 'ad_name', 'smart_plus_ad_id')) return false;
      if (visibleFilters.indexOf('promo_type') >= 0 && applied.promoTypes && applied.promoTypes.length) {
        var promoField = currentTab === 'adgroup' ? row.promotion_type : row.app_promotion_type;
        if (applied.promoTypes.indexOf(promoField) < 0) return false;
      }
      if (visibleFilters.indexOf('platform') >= 0 && applied.platform.length && applied.platform.indexOf(row.platform) < 0) return false;
      if (visibleFilters.indexOf('product') >= 0 && applied.product.length && applied.product.indexOf(row.product_name) < 0) return false;
      if (visibleFilters.indexOf('optimizer') >= 0 && applied.optimizer.length && applied.optimizer.indexOf(row.optimizer_name) < 0) return false;
      if (visibleFilters.indexOf('status') >= 0) {
        if (currentTab === 'account') {
          if (applied.status && row.status !== applied.status) return false;
        } else if (applied.statuses.length && applied.statuses.indexOf(row.effective_status) < 0) {
          return false;
        }
      }
      if (visibleFilters.indexOf('release_date') >= 0 && !inReleaseRange(row, applied.releaseStart, applied.releaseEnd)) return false;
      if (visibleFilters.indexOf('create_time') >= 0 && !inDateFieldRange(row, 'create_time', applied.createStart, applied.createEnd)) return false;
      if (!rowPassesMetricFilters(row, scale)) return false;
      return true;
    });
    return UI.sortRowsBySpecs(list, effectiveSortSpecs(), function (a, b, key) {
      var av = sortValue(a, key, scale);
      var bv = sortValue(b, key, scale);
      if (typeof av === 'number' || typeof bv === 'number') return av - bv;
      return String(av).localeCompare(String(bv), 'zh');
    });
  }

  function firstNumericKey() {
    var key = '';
    columns.some(function (colKey) {
      if (!isNumericMetric(COLUMN_MAP[colKey])) return false;
      key = colKey;
      return true;
    });
    return key;
  }

  function effectiveSortSpecs() {
    var visible = {};
    columns.forEach(function (key) { visible[key] = true; });
    var specs = (sortState.specs || []).filter(function (spec) {
      return spec && visible[spec.key] && (spec.dir === 'asc' || spec.dir === 'desc');
    });
    /* 有手动排序才用；否则静默按总消耗降序，表头不选中 */
    if (specs.length) return [specs[specs.length - 1]];
    if (visible.spend) return [{ key: 'spend', dir: 'desc' }];
    var key = firstNumericKey();
    return key ? [{ key: key, dir: 'desc' }] : [];
  }

  function sortValue(row, key, scale) {
    var col = COLUMN_MAP[key];
    if (!col) return '';
    if (!isNumericMetric(col)) return row[key] || '';
    return metricNumber(row, key, scale);
  }

  function displayValue(row, col, scale) {
    if (col.kind === 'switch') return row.operation_status || '';
    if (col.kind === 'status') {
      return currentTab === 'account' ? (row.status || '') : (row.effective_status || '');
    }
    if (col.kind === 'text' || col.kind === 'product') return row[col.key] || '';
    if (col.group === '属性指标' && col.kind === 'money') {
      if (col.key === 'budget' && row.budget_mode === '不限') return ' - ';
      if (col.key === 'roas_bid' && (row.deep_bid_type !== '目标ROAS' || row.roas_bid == null)) return '-';
      return formatByKind(Number(row[col.key]) || 0, 'money');
    }
    return formatByKind(metricNumber(row, col.key, scale), col.kind);
  }

  function summedMetrics(list, scale) {
    var sums = {};
    COLUMNS.forEach(function (col) {
      if (!isNumericMetric(col) || isRatioMetric(col.key)) return;
      var total = 0;
      list.forEach(function (row) { total += metricNumber(row, col.key, scale); });
      sums[col.key] = total;
    });
    return sums;
  }

  function summaryNumber(sums, key) {
    if (!isRatioMetric(key)) return sums[key] || 0;
    var spend = sums.spend || 0;
    var impressions = sums.impressions || 0;
    var clicks = sums.clicks || 0;
    var reach = sums.reach || 0;
    var conversion = sums.conversion || 0;
    var active = sums.active || 0;
    var uniqueOpen = sums.unique_open || 0;
    var totalOpen = sums.total_open || 0;
    var uniqueAd = sums.unique_ad || 0;
    var adTotal = sums.ad_total || 0;
    var adValue = sums.ad_value || 0;
    var uniquePay = sums.unique_pay || 0;
    var payCount = sums.pay_count || 0;
    var payValue = sums.pay_value || 0;
    if (key === 'total_roas') return ratio(sums.total_revenue || 0, spend);
    if (key === 'ctr') return ratio(clicks, impressions);
    if (key === 'cpc') return clicks ? spend / clicks : 0;
    if (key === 'cpm') return impressions ? spend / impressions * 1000 : 0;
    if (key === 'reach_cpm') return reach ? spend / reach * 1000 : 0;
    if (key === 'frequency') return ratio(impressions, reach);
    if (key === 'cost_per_conversion') return conversion ? spend / conversion : 0;
    if (key === 'conversion_rate') return ratio(conversion, impressions);
    if (key === 'active_cost') return active ? spend / active : 0;
    if (key === 'unique_open_cost') return uniqueOpen ? spend / uniqueOpen : 0;
    if (key === 'open_rate') return ratio(uniqueOpen, clicks);
    if (key === 'open_cost') return totalOpen ? spend / totalOpen : 0;
    if (key === 'unique_ad_cost') return uniqueAd ? spend / uniqueAd : 0;
    if (key === 'ad_rate') return ratio(uniqueAd, clicks);
    if (key === 'ad_cost') return adTotal ? spend / adTotal : 0;
    if (key === 'ad_value_per') return adTotal ? adValue / adTotal : 0;
    if (key === 'ad_roas') return ratio(adValue, spend);
    if (key.indexOf('ad_roas_d') === 0) return ratio(sums[key.replace('ad_roas_', 'ad_revenue_')] || 0, spend);
    if (key === 'unique_pay_cost') return uniquePay ? spend / uniquePay : 0;
    if (key === 'pay_rate') return ratio(uniquePay, clicks);
    if (key === 'pay_cost') return payCount ? spend / payCount : 0;
    if (key === 'pay_value_per') return payCount ? payValue / payCount : 0;
    if (key === 'pay_roas') return ratio(payValue, spend);
    if (key.indexOf('pay_roas_d') === 0) return ratio(sums[key.replace('pay_roas_', 'pay_value_')] || 0, spend);
    return 0;
  }

  function visibleColumns() {
    return columns.map(function (key) { return COLUMN_MAP[key]; }).filter(Boolean);
  }

  function minFrozenCount(draftKeys) {
    var n = 0;
    (draftKeys || []).forEach(function (key) {
      if (isDefaultFrozenKey(key)) n += 1;
    });
    return n;
  }

  function selectedCount() {
    return Object.keys(selectedIds).filter(function (id) { return selectedIds[id]; }).length;
  }

  function isDeletedEntity(row) {
    return !!(row && row.effective_status === '已删除');
  }

  /* 推广系列 / 广告组 / 广告：已删除不参与批量修改 */
  function operableSelectedIds() {
    return Object.keys(selectedIds).filter(function (id) {
      if (!selectedIds[id]) return false;
      if (currentTab === 'account') return true;
      var row = null;
      rows.some(function (item) {
        if (item.id !== id) return false;
        row = item;
        return true;
      });
      return !!(row && !isDeletedEntity(row));
    });
  }

  function syncBatchMenu() {
    var menu = $('batchMenu');
    if (!menu) return;
    if (currentTab === 'campaign' || currentTab === 'adgroup' || currentTab === 'ad') {
      menu.innerHTML =
        '<button class="batch-menu__item" type="button" role="menuitem" data-batch="enable">开启</button>' +
        '<button class="batch-menu__item" type="button" role="menuitem" data-batch="pause">暂停</button>' +
        '<button class="batch-menu__item" type="button" role="menuitem" data-batch="delete">删除</button>' +
        (currentTab === 'ad'
          ? ''
          : '<button class="batch-menu__item" type="button" role="menuitem" data-batch="budget">修改预算</button>') +
        (currentTab === 'adgroup'
          ? '<button class="batch-menu__item" type="button" role="menuitem" data-batch="bid">修改出价</button>'
          : '');
    } else {
      menu.innerHTML = '<button class="batch-menu__item" type="button" role="menuitem" data-batch="status">修改投放状态</button>';
    }
  }

  function syncStatusFilterUi() {
    var accountWrap = $('statusWrap');
    var campWrap = $('statusCampWrap');
    var statusVisible = visibleFilters.indexOf('status') >= 0;
    var isAccount = currentTab === 'account';
    if (accountWrap) {
      if (!statusVisible || !isAccount) accountWrap.setAttribute('hidden', '');
      else accountWrap.removeAttribute('hidden');
    }
    if (campWrap) {
      if (!statusVisible || isAccount) campWrap.setAttribute('hidden', '');
      else campWrap.removeAttribute('hidden');
    }
    if (!isAccount && statusMulti) statusMulti.render();
    else if (statusApi) statusApi.syncLabel(draft.status || '');
  }

  function openActionConfirm(cfg) {
    pendingAction = cfg || null;
    var title = $('actionConfirmTitle');
    var body = $('actionConfirmBody');
    var icon = $('actionConfirmIcon');
    if (title) title.textContent = cfg.title || '确认';
    if (body) body.textContent = cfg.body || '确认执行该操作吗？';
    if (icon) icon.className = 'confirm-modal__icon' + (cfg.danger ? ' confirm-modal__icon--danger' : ' confirm-modal__icon--warning');
    UI.openModal('actionConfirmModal');
  }

  function applyEffectiveStatus(ids, status) {
    var idMap = {};
    ids.forEach(function (id) { idMap[id] = true; });
    rows.forEach(function (row) {
      if (!idMap[row.id]) return;
      row.effective_status = status;
      var sw = switchStateFromStatus(status);
      row.operation_status = sw.on ? '开' : '关';
    });
  }

  function syncBatchBtn() {
    var count = selectedCount();
    var btn = $('batchBtn');
    if (btn) btn.disabled = count === 0;
    var summary = $('selectionSummary');
    var countEl = $('selectionCount');
    if (countEl) countEl.textContent = String(count);
    if (summary) {
      if (count > 0) summary.removeAttribute('hidden');
      else summary.setAttribute('hidden', '');
    }
  }

  function clearTableSelection() {
    selectedIds = {};
    renderTable();
  }

  function pruneSelection(list) {
    var map = {};
    list.forEach(function (row) { map[row.id] = true; });
    Object.keys(selectedIds).forEach(function (id) {
      if (!map[id]) delete selectedIds[id];
    });
    syncBatchBtn();
  }

  function COPY_ICON() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="12" height="12" rx="1"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/></svg>';
  }

  function EDIT_ICON() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>';
  }

  function statusTagClass(status) {
    if (status === '启用' || status === '已开启') return 'status-tag--on';
    if (status === '禁用' || status === '已暂停' || status === '已删除') return 'status-tag--off';
    return 'status-tag--muted';
  }

  function cellEditBtnHtml(field) {
    return '<button class="cell-edit-btn" type="button" data-cell-edit="' + escapeHtml(field) + '" aria-label="编辑" title="编辑">' +
      EDIT_ICON() +
    '</button>';
  }

  function cellWithQuickEdit(text, field) {
    return '<div class="cell-edit-wrap">' +
      '<span class="cell-edit-wrap__text" title="' + escapeHtml(String(text)) + '">' + escapeHtml(String(text)) + '</span>' +
      cellEditBtnHtml(field) +
    '</div>';
  }

  function openTabWithKeyword(targetTab, filterKey, name) {
    name = String(name || '').trim();
    if (!name) return;
    var s = tabStates[targetTab];
    if (!s) return;
    var field = filterKey + 'Keyword';
    var appliedField = {
      account: 'appliedAccount',
      campaign: 'appliedCampaign',
      adgroup: 'appliedAdgroup',
      ad: 'appliedAd'
    }[filterKey];
    s[field] = name;
    s[appliedField] = name;
    if ((s.visibleFilters || []).indexOf(filterKey) < 0) {
      s.visibleFilters = [filterKey].concat(s.visibleFilters || defaultVisibleFilters(targetTab));
    }
    s.page = 1;
    if (currentTab !== targetTab) {
      switchPromoTab(targetTab);
      return;
    }
    var input = $(field);
    if (input) input.value = name;
    var clearApi = filterKey === 'account' ? accountClear
      : filterKey === 'campaign' ? campaignClear
      : filterKey === 'adgroup' ? adgroupClear
      : adClear;
    if (clearApi) clearApi.sync();
    if (filterKey === 'account') appliedAccount = name;
    else if (filterKey === 'campaign') appliedCampaign = name;
    else if (filterKey === 'adgroup') appliedAdgroup = name;
    else appliedAd = name;
    if (visibleFilters.indexOf(filterKey) < 0) {
      visibleFilters = [filterKey].concat(visibleFilters);
      syncOptionalVisibility();
    }
    page = 1;
    renderTable();
  }

  function openCampaignByAccount(name) {
    openTabWithKeyword('campaign', 'account', name);
  }

  function cellHtml(row, col, scale) {
    if (currentTab === 'account' && col.key === 'advertiser_name') {
      var accName = row.advertiser_name || '';
      if (!accName) return '-';
      return '<button type="button" class="link cell-account-link" data-goto-campaign="' + escapeHtml(accName) + '" title="' + escapeHtml(accName) + '">' +
        escapeHtml(accName) +
      '</button>';
    }
    if (col.kind === 'switch') {
      var sw = switchStateFromStatus(row.effective_status, row.operation_status);
      var tip = sw.disabled ? disabledOpTip(row.effective_status, row.operation_status) : '';
      var btn = '<button class="switch' + (sw.on ? ' is-on' : '') + '" type="button" data-row-switch="' + escapeHtml(row.id) + '"' +
        (sw.disabled ? ' disabled' : '') +
        ' role="switch" aria-checked="' + (sw.on ? 'true' : 'false') + '" aria-label="开关"></button>';
      if (!tip) return btn;
      return '<span class="op-disabled-tip" data-disabled-tip="' + escapeHtml(tip) + '">' + btn + '</span>';
    }
    if (col.kind === 'status') {
      if (currentTab !== 'account') return escapeHtml(row.effective_status || '-');
      var statusText = row.status || '-';
      return '<span class="status-tag ' + statusTagClass(statusText) + '">' + escapeHtml(statusText) + '</span>';
    }
    if (col.kind === 'product') {
      if (currentTab !== 'account') return escapeHtml(row.product_name || '-');
      var icon = productIconHtml(row.platform);
      return '<span class="cell-product">' + icon + '<span>' + escapeHtml(row.product_name || '-') + '</span></span>';
    }
    var text = displayValue(row, col, scale);
    if (!text && text !== 0) text = '-';
    if (currentTab === 'campaign' && col.key === 'campaign_name') {
      var campName = row.campaign_name || '';
      if (!campName) return '-';
      var canEditName = !disabledOpTip(row.effective_status);
      return '<div class="cell-edit-wrap">' +
        '<button type="button" class="link cell-account-link" data-goto-adgroup="' + escapeHtml(campName) + '" title="' + escapeHtml(campName) + '">' +
          escapeHtml(campName) +
        '</button>' +
        (canEditName ? cellEditBtnHtml(col.key) : '') +
      '</div>';
    }
    if (currentTab === 'adgroup' && col.key === 'adgroup_name') {
      var adgName = row.adgroup_name || '';
      if (!adgName) return '-';
      var canEditAdg = !disabledOpTip(row.effective_status);
      return '<div class="cell-edit-wrap">' +
        '<button type="button" class="link cell-account-link" data-goto-ad="' + escapeHtml(adgName) + '" title="' + escapeHtml(adgName) + '">' +
          escapeHtml(adgName) +
        '</button>' +
        (canEditAdg ? cellEditBtnHtml(col.key) : '') +
      '</div>';
    }
    if (currentTab === 'ad' && col.key === 'ad_name') {
      var adName = row.ad_name || '';
      if (!adName) return '-';
      if (disabledOpTip(row.effective_status)) return escapeHtml(adName);
      return cellWithQuickEdit(adName, col.key);
    }
    if (currentTab === 'adgroup' && col.key === 'roas_bid') {
      var roasTip = disabledOpTip(row.effective_status);
      if (roasTip) {
        return '<span class="op-disabled-tip cell-edit-wrap" data-disabled-tip="' + escapeHtml(roasTip) + '">' +
          '<span class="cell-edit-wrap__text">' + escapeHtml(String(text)) + '</span>' +
        '</span>';
      }
      if (row.deep_bid_type !== '目标ROAS' || row.roas_bid == null) return escapeHtml(String(text));
      return cellWithQuickEdit(text, col.key);
    }
    if (currentTab === 'campaign' && col.key === 'budget') {
      var budgetTip = disabledOpTip(row.effective_status);
      if (budgetTip) {
        return '<span class="op-disabled-tip cell-edit-wrap" data-disabled-tip="' + escapeHtml(budgetTip) + '">' +
          '<span class="cell-edit-wrap__text">' + escapeHtml(String(text)) + '</span>' +
        '</span>';
      }
      if (row.budget_mode === '不限') return escapeHtml(String(text));
      return cellWithQuickEdit(text, col.key);
    }
    if (col.copyable && text && text !== '-' && String(text).trim() !== '-') {
      return '<span class="cell-copy"><span class="cell-copy__text">' + escapeHtml(String(text)) + '</span>' +
        '<button class="cell-copy__btn" type="button" data-copy="' + escapeHtml(String(text)) + '" aria-label="复制">' + COPY_ICON() + '</button></span>';
    }
    return escapeHtml(String(text));
  }

  function syncFreezeLeft() {
    var table = $('accountTable');
    if (!table) return;
    var cols = table.querySelectorAll('colgroup col');
    var headRows = table.querySelectorAll('thead tr');
    var bodyRows = table.querySelectorAll('tbody tr, tfoot tr');
    var left = 0;
    var count = Math.min(frozenCount + 1, cols.length);
    Array.prototype.forEach.call(cols, function (col, index) {
      var frozen = index < count;
      var width = parseFloat(col.style.width) || parseFloat(col.getAttribute('data-col-width')) || 0;
      Array.prototype.forEach.call(headRows, function (tr) {
        var cell = tr.children[index];
        if (!cell) return;
        cell.classList.toggle('is-freeze', frozen);
        cell.style.left = frozen ? left + 'px' : '';
      });
      Array.prototype.forEach.call(bodyRows, function (tr) {
        var cell = tr.children[index];
        if (!cell) return;
        cell.classList.toggle('is-freeze', frozen);
        cell.style.left = frozen ? left + 'px' : '';
      });
      if (frozen) left += width;
    });
  }

  function renderTable() {
    closeMetricPops();
    closeCellEditPop();
    hideOpFloatTip();
    var scale = appliedScale;
    var list = filteredRows();
    pruneSelection(list);
    var totalPages = Math.max(1, Math.ceil(list.length / pageSize) || 1);
    if (page > totalPages) page = totalPages;
    var pageRows = list.slice((page - 1) * pageSize, page * pageSize);
    var cols = visibleColumns();
    var metricKeys = cols.filter(isNumericMetric).map(function (col) { return col.key; });
    var heatScale = buildHeatScale(metricKeys, list, scale);

    $('tableColgroup').innerHTML =
      '<col class="col-check" data-col-width="48" />' +
      cols.map(function (col) {
      return '<col data-col-width="' + col.width + '" />';
    }).join('');

    var pageAllChecked = pageRows.length > 0 && pageRows.every(function (row) { return selectedIds[row.id]; });
    var pageSome = pageRows.some(function (row) { return selectedIds[row.id]; });

    var headRow =
      '<tr>' +
      '<th class="col-check is-freeze"><label class="cell-check"><input type="checkbox" id="checkAll"' +
      (pageAllChecked ? ' checked' : '') + ' aria-label="全选" /></label></th>' +
      cols.map(function (col, index) {
        var cls = [];
        if (isNumericMetric(col)) cls.push('num');
        if (index < frozenCount) cls.push('is-freeze');
        if (!isNumericMetric(col)) {
          return '<th class="' + cls.join(' ') + '">' + escapeHtml(colLabel(col)) + '</th>';
        }
        return '<th class="' + cls.join(' ') + '"><div class="th-sort th-sort--num" data-key="' + col.key + '">' +
          '<span>' + escapeHtml(colLabel(col)) + '</span>' + UI.TH_SORT_ICONS_HTML +
        '</div></th>';
      }).join('') + '</tr>';

    var toolRow =
      '<tr class="metric-tool-row">' +
      '<td class="col-check is-freeze metric-tool-cell"></td>' +
      cols.map(function (col, index) {
        var cls = ['metric-tool-cell'];
        if (index < frozenCount) cls.push('is-freeze');
        var inner = isNumericMetric(col) ? metricToolsHtml(col.key) : '';
        return '<td class="' + cls.join(' ') + '">' + inner + '</td>';
      }).join('') + '</tr>';

    $('tableHead').innerHTML = headRow + toolRow;

    var checkAll = $('checkAll');
    if (checkAll) checkAll.indeterminate = pageSome && !pageAllChecked;

    $('tableBody').innerHTML = pageRows.map(function (row) {
      return '<tr data-id="' + escapeHtml(row.id) + '">' +
        '<td class="col-check is-freeze"><label class="cell-check"><input type="checkbox" data-row-check="' + escapeHtml(row.id) + '"' +
        (selectedIds[row.id] ? ' checked' : '') + ' aria-label="选择" /></label></td>' +
        cols.map(function (col, index) {
        var cls = [];
          var heat = '';
        if (index < frozenCount) cls.push('is-freeze');
          if (isNumericMetric(col)) {
            cls.push('num');
            heat = metricHeatAttr(col.key, metricNumber(row, col.key, scale), heatScale);
            if (heat) cls.push('metric-heat');
          }
          return '<td' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + heat + '>' + cellHtml(row, col, scale) + '</td>';
      }).join('') + '</tr>';
    }).join('');

    var foot = $('tableFoot');
    if (!list.length) {
      foot.innerHTML = '';
    } else {
      var sums = summedMetrics(list, scale);
      var labelPlaced = false;
      foot.innerHTML = '<tr><td class="col-check is-freeze"></td>' + cols.map(function (col, index) {
        var cls = [];
        var text = '';
        if (index < frozenCount) cls.push('is-freeze');
        if (!isNumericMetric(col)) {
          if (!labelPlaced) {
            text = '合计';
            labelPlaced = true;
          }
        } else {
          cls.push('num');
          text = formatByKind(summaryNumber(sums, col.key), col.kind);
        }
        return '<td' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + '>' + escapeHtml(text) + '</td>';
      }).join('') + '</tr>';
    }

    $('emptyTip').hidden = list.length > 0;
    $('accountTable').hidden = false;
    UI.renderPagination({ containerId: 'pagination', total: list.length, page: page, pageSize: pageSize });
    if (window.ColResize) {
      ColResize.refresh($('accountTable'), { onLayout: syncFreezeLeft });
    } else {
      syncFreezeLeft();
    }
    if (sortApi) sortApi.sync();
    syncBatchBtn();
  }

  function applyQuery() {
    appliedScale = currentScale();
    applied = cloneDraft(draft);
    appliedAccount = visibleFilters.indexOf('account') >= 0 ? ($('accountKeyword').value || '') : '';
    appliedCampaign = visibleFilters.indexOf('campaign') >= 0 ? (($('campaignKeyword') && $('campaignKeyword').value) || '') : '';
    appliedAdgroup = visibleFilters.indexOf('adgroup') >= 0 ? (($('adgroupKeyword') && $('adgroupKeyword').value) || '') : '';
    appliedAd = visibleFilters.indexOf('ad') >= 0 ? (($('adKeyword') && $('adKeyword').value) || '') : '';
    if (visibleFilters.indexOf('release_date') >= 0 && draft.releaseStart && draft.releaseEnd) {
      applied.releaseStart = draft.releaseStart;
      applied.releaseEnd = draft.releaseEnd;
    } else {
      applied.releaseStart = null;
      applied.releaseEnd = null;
    }
    if (visibleFilters.indexOf('create_time') >= 0 && draft.createStart && draft.createEnd) {
      applied.createStart = draft.createStart;
      applied.createEnd = draft.createEnd;
    } else {
      applied.createStart = null;
      applied.createEnd = null;
    }
    page = 1;
    renderTable();
  }

  function clonePlain(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function saveCurrentTabState() {
    var s = tabStates[currentTab];
    if (!s) return;
    s.rows = rows;
    s.draft = cloneDraft(draft);
    s.applied = cloneDraft(applied);
    s.appliedAccount = appliedAccount;
    s.appliedCampaign = appliedCampaign;
    s.appliedAdgroup = appliedAdgroup;
    s.appliedAd = appliedAd;
    s.accountKeyword = ($('accountKeyword') && $('accountKeyword').value) || '';
    s.campaignKeyword = ($('campaignKeyword') && $('campaignKeyword').value) || '';
    s.adgroupKeyword = ($('adgroupKeyword') && $('adgroupKeyword').value) || '';
    s.adKeyword = ($('adKeyword') && $('adKeyword').value) || '';
    s.visibleFilters = visibleFilters.slice();
    s.columns = columns.slice();
    s.frozenCount = frozenCount;
    s.columnDraft = columnDraft.slice();
    s.draftFrozenCount = draftFrozenCount;
    s.columnPresets = columnPresets.map(function (item) {
      return {
        id: item.id,
        name: item.name,
        keys: (item.keys || []).slice(),
        frozenCount: item.frozenCount
      };
    });
    s.activePresetId = activePresetId;
    s.editingPresetId = editingPresetId;
    s.presetSeq = presetSeq;
    s.sortState = { specs: (sortState.specs || []).slice() };
    s.page = page;
    s.pageSize = pageSize;
    s.selectedIds = Object.assign({}, selectedIds);
    s.appliedScale = appliedScale;
    s.metricFilters = clonePlain(metricFilters);
    s.metricColors = clonePlain(metricColors);
  }

  function restoreTabState(tab) {
    var s = tabStates[tab];
    if (!s) return;
    rows = s.rows;
    draft = cloneDraft(s.draft);
    applied = cloneDraft(s.applied);
    appliedAccount = s.appliedAccount || '';
    appliedCampaign = s.appliedCampaign || '';
    appliedAdgroup = s.appliedAdgroup || '';
    appliedAd = s.appliedAd || '';
    visibleFilters = (s.visibleFilters || defaultVisibleFilters(tab)).slice();
    columns = (s.columns || defaultColumns(tab)).slice();
    frozenCount = s.frozenCount || 0;
    columnDraft = (s.columnDraft || columns).slice();
    draftFrozenCount = s.draftFrozenCount || frozenCount;
    columnPresets = (s.columnPresets || []).map(function (item) {
      return {
        id: item.id,
        name: item.name,
        keys: (item.keys || []).slice(),
        frozenCount: item.frozenCount
      };
    });
    activePresetId = s.activePresetId || 'default';
    editingPresetId = s.editingPresetId || '';
    presetSeq = s.presetSeq || 1;
    sortState = { specs: ((s.sortState && s.sortState.specs) || []).slice() };
    page = s.page || 1;
    pageSize = s.pageSize || 20;
    selectedIds = Object.assign({}, s.selectedIds || {});
    appliedScale = s.appliedScale || 1;
    metricFilters = clonePlain(s.metricFilters || {});
    metricColors = clonePlain(s.metricColors || {});
    GROUPS = groupsForTab(tab);
    if (GROUPS.indexOf(metricCat) < 0) metricCat = GROUPS[0] || '';
    if ($('accountKeyword')) $('accountKeyword').value = s.accountKeyword || '';
    if (accountClear) accountClear.sync();
    if ($('campaignKeyword')) $('campaignKeyword').value = s.campaignKeyword || '';
    if (campaignClear) campaignClear.sync();
    if ($('adgroupKeyword')) $('adgroupKeyword').value = s.adgroupKeyword || '';
    if (adgroupClear) adgroupClear.sync();
    if ($('adKeyword')) $('adKeyword').value = s.adKeyword || '';
    if (adClear) adClear.sync();
    if (draft.releaseStart && draft.releaseEnd && releaseDateApi) {
      releaseDateApi.setRange(draft.releaseStart, draft.releaseEnd, null, true);
    } else {
      clearReleaseDate();
    }
    if (draft.createStart && draft.createEnd && createDateApi) {
      createDateApi.setRange(draft.createStart, draft.createEnd, null, true);
      var createWrap = $('createDateWrap');
      if (createWrap) createWrap.classList.add('has-value');
    } else {
      clearCreateDate();
    }
    syncOptionalVisibility();
    syncBarFilters();
    if (statusApi) statusApi.syncLabel(draft.status);
    if (statusMulti) statusMulti.render();
    if (productMulti) productMulti.render();
    renderPresetMenu();
    closeMetricPops();
    closePresetMenu();
    renderTable();
  }

  function switchPromoTab(tab) {
    if (PROMO_TABS.indexOf(tab) < 0 || tab === currentTab) return;
    if (UI.closePanels) UI.closePanels();
    closeMetricPops();
    closeCellEditPop();
    hideOpFloatTip();
    closePresetMenu();
    saveCurrentTabState();
    currentTab = tab;
    document.querySelectorAll('#promoTabs [data-promo-tab]').forEach(function (btn) {
      var on = btn.getAttribute('data-promo-tab') === tab;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    restoreTabState(tab);
  }

  function syncOptionalVisibility() {
    var allowed = {};
    filterDefsForTab(currentTab).forEach(function (item) { allowed[item.key] = true; });
    document.querySelectorAll('#filterBar [data-filter]').forEach(function (el) {
      var key = el.getAttribute('data-filter');
      if (key === 'status') return;
      if (!allowed[key]) {
        el.hidden = true;
        return;
      }
      el.hidden = visibleFilters.indexOf(key) < 0;
    });
    syncStatusFilterUi();
    syncBatchMenu();
  }

  function clearHiddenDraft() {
    if (visibleFilters.indexOf('account') < 0) {
      if ($('accountKeyword')) $('accountKeyword').value = '';
      if (accountClear) accountClear.sync();
    }
    if (visibleFilters.indexOf('campaign') < 0) {
      if ($('campaignKeyword')) $('campaignKeyword').value = '';
      if (campaignClear) campaignClear.sync();
    }
    if (visibleFilters.indexOf('adgroup') < 0) {
      if ($('adgroupKeyword')) $('adgroupKeyword').value = '';
      if (adgroupClear) adgroupClear.sync();
    }
    if (visibleFilters.indexOf('ad') < 0) {
      if ($('adKeyword')) $('adKeyword').value = '';
      if (adClear) adClear.sync();
    }
    if (visibleFilters.indexOf('promo_type') < 0) draft.promoTypes = [];
    if (visibleFilters.indexOf('platform') < 0) draft.platform = [];
    if (visibleFilters.indexOf('product') < 0) draft.product = [];
    if (visibleFilters.indexOf('optimizer') < 0) draft.optimizer = [];
    if (visibleFilters.indexOf('status') < 0) {
      draft.status = '';
      draft.statuses = [];
    }
    if (visibleFilters.indexOf('release_date') < 0) clearReleaseDate();
    if (visibleFilters.indexOf('create_time') < 0) clearCreateDate();
    syncBarFilters();
  }

  function syncBarFilters() {
    if (platformMulti) platformMulti.render();
    if (productMulti) productMulti.render();
    if (optimizerMulti) optimizerMulti.render();
    if (promoTypeApi) promoTypeApi.render();
    if (statusMulti) statusMulti.render();
    if (statusApi) statusApi.syncLabel(draft.status);
  }

  function last7Range() {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var start = new Date(today.getTime());
    start.setDate(start.getDate() - 6);
    return [start, today];
  }

  function clearReleaseDate() {
    if (releaseDateApi && typeof releaseDateApi.clear === 'function') releaseDateApi.clear(true);
    draft.releaseStart = null;
    draft.releaseEnd = null;
    var label = $('releaseDateLabel');
    if (label) label.innerHTML = '上线时间：<span class="muted">请选择</span>';
    var wrap = $('releaseDateWrap');
    if (wrap) wrap.classList.remove('has-value');
    var fsLabel = $('fsReleaseLabel');
    if (fsLabel) fsLabel.innerHTML = '上线时间：<span class="muted">请选择</span>';
    var fsWrap = $('fsReleaseWrap');
    if (fsWrap) fsWrap.classList.remove('has-value');
    if (UI.closePanels) UI.closePanels();
  }

  function clearCreateDate() {
    if (createDateApi && typeof createDateApi.clear === 'function') createDateApi.clear(true);
    if (fsCreateDateApi && typeof fsCreateDateApi.clear === 'function') fsCreateDateApi.clear(true);
    draft.createStart = null;
    draft.createEnd = null;
    var label = $('createDateLabel');
    if (label) label.innerHTML = '创建时间：<span class="muted">请选择</span>';
    var wrap = $('createDateWrap');
    if (wrap) wrap.classList.remove('has-value');
    var fsLabel = $('fsCreateLabel');
    if (fsLabel) fsLabel.innerHTML = '创建时间：<span class="muted">请选择</span>';
    var fsWrap = $('fsCreateWrap');
    if (fsWrap) fsWrap.classList.remove('has-value');
    if (UI.closePanels) UI.closePanels();
  }

  function resetFilters() {
    draft = emptyDraft();
    if ($('accountKeyword')) $('accountKeyword').value = '';
    if (accountClear) accountClear.sync();
    if ($('campaignKeyword')) $('campaignKeyword').value = '';
    if (campaignClear) campaignClear.sync();
    if ($('adgroupKeyword')) $('adgroupKeyword').value = '';
    if (adgroupClear) adgroupClear.sync();
    if ($('adKeyword')) $('adKeyword').value = '';
    if (adClear) adClear.sync();
    clearReleaseDate();
    clearCreateDate();
    syncBarFilters();
  }

  /* —— 筛选设置 —— */
  var CLEAR_ICON = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l6 6M9 3L3 9"/></svg>';
  var ARROW_ICON = '<svg class="select-trigger__arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg>';

  function multiPanelHtml(key, dual) {
    if (dual) {
      return '<div class="multi-panel" id="fsPanel_' + key + '">' +
        '<div class="multi-panel__left">' +
          '<div class="multi-panel__search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg><input type="text" id="fsSearch_' + key + '" placeholder="搜索" autocomplete="off" /></div>' +
          '<div class="multi-panel__toolbar"><button class="multi-panel__link" type="button" data-fs-all="' + key + '">全选</button></div>' +
          '<div class="multi-panel__list" id="fsList_' + key + '"></div>' +
        '</div>' +
        '<div class="multi-panel__right">' +
          '<div class="multi-panel__toolbar multi-panel__toolbar--right"><span id="fsCount_' + key + '">已选择 0 项</span><button class="multi-panel__link" type="button" data-fs-clear="' + key + '">清空</button></div>' +
          '<div class="multi-panel__list" id="fsSelected_' + key + '"></div>' +
        '</div></div>';
    }
    return '<div class="multi-panel multi-panel--simple" id="fsPanel_' + key + '"><div class="multi-panel__list" id="fsList_' + key + '"></div></div>';
  }

  var KEYWORD_FILTERS = {
    account: { inputId: 'fs_account', clearId: 'fsClear_account', wrapId: 'fsWrap_account', barId: 'accountKeyword', prefix: '广告账户：' },
    campaign: { inputId: 'fs_campaign', clearId: 'fsClear_campaign', wrapId: 'fsWrap_campaign', barId: 'campaignKeyword', prefix: '推广系列：' },
    adgroup: { inputId: 'fs_adgroup', clearId: 'fsClear_adgroup', wrapId: 'fsWrap_adgroup', barId: 'adgroupKeyword', prefix: '广告组：' },
    ad: { inputId: 'fs_ad', clearId: 'fsClear_ad', wrapId: 'fsWrap_ad', barId: 'adKeyword', prefix: '广告：' }
  };

  function filterSettingControlHtml(item) {
    var key = item.key;
    if (KEYWORD_FILTERS[key]) {
      var meta = KEYWORD_FILTERS[key];
      var inputId = meta.inputId;
      var clearId = meta.clearId;
      var wrapId = meta.wrapId;
      var barId = meta.barId;
      var prefix = meta.prefix;
      var value = ($(barId) && $(barId).value) || '';
      return '<div class="filter-setting-control' + (value ? ' has-value' : '') + '" id="' + wrapId + '">' +
        '<label class="select-trigger select-trigger--input" for="' + inputId + '">' +
          '<span class="select-trigger__prefix">' + prefix + '</span>' +
          '<input class="select-trigger__field" type="text" id="' + inputId + '" placeholder="名称/ID，可多行输入" value="' + escapeHtml(value) + '" autocomplete="off" />' +
        '</label>' +
        '<button class="select-clear" type="button" id="' + clearId + '" aria-label="清除">' + CLEAR_ICON + '</button></div>';
    }
    if (key === 'release_date' || key === 'create_time') {
      if (key === 'create_time') {
        var hasCreate = !!(draft.createStart && draft.createEnd);
        var createLabel = hasCreate
          ? ('创建时间：' + formatDate(draft.createStart) + ' ~ ' + formatDate(draft.createEnd))
          : '创建时间：<span class="muted">请选择</span>';
        return '<div class="filter-setting-control filter-setting-control--date filter-item--date' + (hasCreate ? ' has-value' : '') + '" id="fsCreateWrap">' +
          '<button class="date-range-trigger" type="button" id="fsCreateTrigger"><span class="date-range-trigger__text" id="fsCreateLabel">' + createLabel + '</span></button>' +
          '<button class="select-clear" type="button" id="fsCreateClear" aria-label="清除">' + CLEAR_ICON + '</button>' +
          '<div class="date-panel" id="fsCreatePanel">' +
            '<div class="date-panel__shortcuts" id="fsCreateShortcuts">' +
              '<button class="date-shortcut" type="button" data-shortcut="today">今天</button>' +
              '<button class="date-shortcut" type="button" data-shortcut="yesterday">昨天</button>' +
              '<button class="date-shortcut" type="button" data-shortcut="last7">近7天</button>' +
              '<button class="date-shortcut" type="button" data-shortcut="last30">近30天</button>' +
              '<button class="date-shortcut" type="button" data-shortcut="thisWeek">本周</button>' +
              '<button class="date-shortcut" type="button" data-shortcut="lastWeek">上周</button>' +
              '<button class="date-shortcut" type="button" data-shortcut="thisMonth">本月</button>' +
              '<button class="date-shortcut" type="button" data-shortcut="lastMonth">上月</button>' +
            '</div>' +
            '<div class="date-panel__calendars"><div class="date-cal" id="fsCreateCalLeft"></div><div class="date-cal" id="fsCreateCalRight"></div></div>' +
          '</div></div>';
      }
    }
    if (key === 'release_date') {
      var hasRelease = !!(draft.releaseStart && draft.releaseEnd);
      var releaseLabel = hasRelease
        ? ('上线时间：' + formatDate(draft.releaseStart) + ' ~ ' + formatDate(draft.releaseEnd))
        : '上线时间：<span class="muted">请选择</span>';
      return '<div class="filter-setting-control filter-setting-control--date filter-item--date' + (hasRelease ? ' has-value' : '') + '" id="fsReleaseWrap">' +
        '<button class="date-range-trigger" type="button" id="fsReleaseTrigger"><span class="date-range-trigger__text" id="fsReleaseLabel">' + releaseLabel + '</span></button>' +
        '<button class="select-clear" type="button" id="fsReleaseClear" aria-label="清除">' + CLEAR_ICON + '</button>' +
        '<div class="date-panel" id="fsReleasePanel">' +
          '<div class="date-panel__shortcuts" id="fsReleaseShortcuts">' +
            '<button class="date-shortcut" type="button" data-shortcut="today">今天</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="yesterday">昨天</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="last7">近7天</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="last30">近30天</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="thisWeek">本周</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="lastWeek">上周</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="thisMonth">本月</button>' +
            '<button class="date-shortcut" type="button" data-shortcut="lastMonth">上月</button>' +
          '</div>' +
          '<div class="date-panel__calendars"><div class="date-cal" id="fsReleaseCalLeft"></div><div class="date-cal" id="fsReleaseCalRight"></div></div>' +
        '</div></div>';
    }
    if (key === 'status' && currentTab === 'account') {
      return '<div class="filter-setting-control" id="fsWrap_status">' +
        '<button class="select-trigger" type="button" id="fsTrigger_status">' +
          '<span class="select-trigger__text" id="fsLabel_status">投放状态：<span class="muted">请选择</span></span>' + ARROW_ICON +
        '</button>' +
        '<button class="select-clear" type="button" id="fsClear_status" aria-label="清除">' + CLEAR_ICON + '</button>' +
        '<div class="single-panel" id="fsPanel_status">' +
          '<button class="single-option" type="button" data-value="启用">启用</button>' +
          '<button class="single-option" type="button" data-value="禁用">禁用</button>' +
        '</div></div>';
    }
    var dual = key === 'product' || key === 'optimizer';
    return '<div class="filter-setting-control" id="fsWrap_' + key + '">' +
      '<button class="select-trigger" type="button" id="fsTrigger_' + key + '">' +
        '<span class="select-trigger__text" id="fsLabel_' + key + '">' + escapeHtml(item.name) + '：<span class="muted">请选择</span></span>' + ARROW_ICON +
      '</button>' +
      '<button class="select-clear" type="button" data-fs-clear-icon="' + key + '" aria-label="清除">' + CLEAR_ICON + '</button>' +
      multiPanelHtml(key, dual) +
    '</div>';
  }

  function keywordClearApi(key) {
    if (key === 'account') return accountClear;
    if (key === 'campaign') return campaignClear;
    if (key === 'adgroup') return adgroupClear;
    return adClear;
  }

  function bindFilterSettingsControls() {
    Object.keys(KEYWORD_FILTERS).forEach(function (key) {
      var meta = KEYWORD_FILTERS[key];
      var input = $(meta.inputId);
      if (!input) return;
      var wrap = $(meta.wrapId);
      var clearApi = keywordClearApi(key);
      function syncHas() { if (wrap) wrap.classList.toggle('has-value', !!input.value); }
      input.addEventListener('input', function () {
        var bar = $(meta.barId);
        if (bar) bar.value = input.value;
        if (clearApi) clearApi.sync();
        syncHas();
      });
      var clearBtn = $(meta.clearId);
      if (clearBtn) {
        clearBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          input.value = '';
          var bar = $(meta.barId);
          if (bar) bar.value = '';
          if (clearApi) clearApi.sync();
          syncHas();
        });
      }
    });

    var fsReleaseApi = $('fsReleaseWrap') ? UI.bindDateRange({
      wrapId: 'fsReleaseWrap',
      triggerId: 'fsReleaseTrigger',
      labelId: 'fsReleaseLabel',
      panelId: 'fsReleasePanel',
      shortcutsId: 'fsReleaseShortcuts',
      calLeftId: 'fsReleaseCalLeft',
      calRightId: 'fsReleaseCalRight',
      prefix: '上线时间：',
      onChange: function (start, end, shortcut) {
        draft.releaseStart = start;
        draft.releaseEnd = end;
        if (releaseDateApi && start && end) releaseDateApi.setRange(start, end, shortcut, true);
        var bar = $('releaseDateWrap');
        if (bar) bar.classList.toggle('has-value', !!(start && end));
        var fsWrap = $('fsReleaseWrap');
        if (fsWrap) fsWrap.classList.toggle('has-value', !!(start && end));
      }
    }) : null;
    if (fsReleaseApi && draft.releaseStart && draft.releaseEnd) {
      fsReleaseApi.setRange(draft.releaseStart, draft.releaseEnd, null, true);
      var fsWrapInit = $('fsReleaseWrap');
      if (fsWrapInit) fsWrapInit.classList.add('has-value');
    }
    var fsReleaseClear = $('fsReleaseClear');
    if (fsReleaseClear) {
      fsReleaseClear.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        clearReleaseDate();
      });
    }

    if (currentTab === 'account' && $('fsWrap_status')) {
      UI.bindSingleSelect({
        wrapId: 'fsWrap_status',
        triggerId: 'fsTrigger_status',
        panelId: 'fsPanel_status',
        labelId: 'fsLabel_status',
        clearId: 'fsClear_status',
        prefix: '投放状态：',
        getValue: function () { return draft.status || ''; },
        onChange: function (value) {
          draft.status = value || '';
          syncBarFilters();
        }
      });
    }

    function bindFsMulti(key, prefix, getOptions, getIconHtml) {
      var dual = key === 'product' || key === 'optimizer';
      function draftKey() {
        if (key === 'status') return 'statuses';
        if (key === 'promo_type') return 'promoTypes';
        return key;
      }
      var api = UI.bindMultiSelect({
        wrapId: 'fsWrap_' + key,
        triggerId: 'fsTrigger_' + key,
        panelId: 'fsPanel_' + key,
        labelId: 'fsLabel_' + key,
        listId: 'fsList_' + key,
        selectedId: dual ? 'fsSelected_' + key : null,
        searchId: dual ? 'fsSearch_' + key : null,
        countId: dual ? 'fsCount_' + key : null,
        prefix: prefix,
        getOptions: getOptions,
        getIconHtml: getIconHtml,
        getSelected: function () { return draft[draftKey()] || []; },
        setSelected: function (arr) {
          draft[draftKey()] = arr;
          if (key === 'platform') {
            pruneProducts();
          }
          syncBarFilters();
        }
      });
      var clearIcon = document.querySelector('[data-fs-clear-icon="' + key + '"]');
      if (clearIcon) {
        clearIcon.addEventListener('click', function (e) {
          e.stopPropagation();
          draft[draftKey()] = [];
          if (key === 'platform') pruneProducts();
          if (api) api.render();
          syncBarFilters();
        });
      }
      var allBtn = document.querySelector('[data-fs-all="' + key + '"]');
      if (allBtn) {
        allBtn.addEventListener('click', function () {
          draft[draftKey()] = getOptions().slice();
          if (api) api.render();
          syncBarFilters();
        });
      }
      var clearBtn = document.querySelector('[data-fs-clear="' + key + '"]');
      if (clearBtn) {
        clearBtn.addEventListener('click', function () {
          draft[draftKey()] = [];
          if (api) api.render();
          syncBarFilters();
        });
      }
    }

    bindFsMulti('platform', '平台：', currentPlatforms);
    if ($('fsWrap_promo_type')) bindFsMulti('promo_type', '推广类型：', promoTypeOptions);
    if (currentTab !== 'account') {
      bindFsMulti('status', '状态：', function () { return EFFECTIVE_STATUSES; });
    }
    if ($('fsCreateWrap')) {
      fsCreateDateApi = UI.bindDateRange({
        wrapId: 'fsCreateWrap',
        triggerId: 'fsCreateTrigger',
        labelId: 'fsCreateLabel',
        panelId: 'fsCreatePanel',
        shortcutsId: 'fsCreateShortcuts',
        calLeftId: 'fsCreateCalLeft',
        calRightId: 'fsCreateCalRight',
        prefix: '创建时间：',
        onChange: function (start, end, shortcut) {
          draft.createStart = start;
          draft.createEnd = end;
          if (createDateApi && start && end) createDateApi.setRange(start, end, shortcut, true);
          else if (createDateApi && typeof createDateApi.clear === 'function' && !start && !end) createDateApi.clear(true);
          var has = !!(start && end);
          var bar = $('createDateWrap');
          if (bar) bar.classList.toggle('has-value', has);
          var fsWrap = $('fsCreateWrap');
          if (fsWrap) fsWrap.classList.toggle('has-value', has);
        }
      });
      if (fsCreateDateApi && draft.createStart && draft.createEnd) {
        fsCreateDateApi.setRange(draft.createStart, draft.createEnd, null, true);
        var fsWrapInit = $('fsCreateWrap');
        if (fsWrapInit) fsWrapInit.classList.add('has-value');
      }
      if ($('fsCreateClear')) {
        $('fsCreateClear').addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          clearCreateDate();
        });
      }
    } else {
      fsCreateDateApi = null;
    }
    bindFsMulti('product', '产品：', productOptions, function (name) {
      return productIconHtml(productPlatform(name));
    });
    bindFsMulti('optimizer', '优化师：', function () { return OPTIMIZERS; });
  }

  function openFilterSettings() {
    var defs = filterDefsForTab(currentTab);
      filterSettingsSnapshot = {
        draft: cloneDraft(draft),
      account: ($('accountKeyword') && $('accountKeyword').value) || '',
      campaign: ($('campaignKeyword') && $('campaignKeyword').value) || '',
      adgroup: ($('adgroupKeyword') && $('adgroupKeyword').value) || '',
      ad: ($('adKeyword') && $('adKeyword').value) || '',
      visible: visibleFilters.slice()
    };
    var grid = $('filterSettingGrid');
    var visibleDraft = visibleFilters.slice();
    function itemHtml(item) {
      var checked = visibleDraft.indexOf(item.key) >= 0;
      return '<div class="filter-setting-item" data-fs-key="' + item.key + '">' +
        '<input type="checkbox" value="' + item.key + '"' + (checked ? ' checked' : '') + ' />' +
        filterSettingControlHtml(item) +
      '</div>';
    }
    var rowsHtml = '';
    var i;
    for (i = 0; i < defs.length; i += 3) {
      rowsHtml += '<div class="filter-setting-row">' + defs.slice(i, i + 3).map(itemHtml).join('') + '</div>';
    }
    grid.innerHTML = rowsHtml;
    bindFilterSettingsControls();
    UI.openModal('filterSettingModal');
  }

  function cancelFilterSettings() {
    var snap = filterSettingsSnapshot;
    filterSettingsSnapshot = null;
    if (snap) {
      draft = cloneDraft(snap.draft);
      if ($('accountKeyword')) $('accountKeyword').value = snap.account || '';
      if (accountClear) accountClear.sync();
      if ($('campaignKeyword')) $('campaignKeyword').value = snap.campaign || '';
      if (campaignClear) campaignClear.sync();
      if ($('adgroupKeyword')) $('adgroupKeyword').value = snap.adgroup || '';
      if (adgroupClear) adgroupClear.sync();
      if ($('adKeyword')) $('adKeyword').value = snap.ad || '';
      if (adClear) adClear.sync();
      syncBarFilters();
    }
    UI.closePanels();
    UI.closeModal('filterSettingModal');
  }

  function submitFilterSettings() {
    var selected = [];
    $('filterSettingGrid').querySelectorAll('.filter-setting-item > input[type="checkbox"]').forEach(function (input) {
      if (input.checked) selected.push(input.value);
    });
    visibleFilters = filterDefsForTab(currentTab).map(function (item) { return item.key; }).filter(function (key) {
      return selected.indexOf(key) >= 0;
    });
    filterSettingsSnapshot = null;
    syncOptionalVisibility();
    clearHiddenDraft();
    UI.closePanels();
    UI.closeModal('filterSettingModal');
    applyQuery();
  }

  /* —— 自定义列 —— */
  function normalizeMetricDraft(draftKeys) {
    var allowed = {};
    columnsForTab(currentTab).forEach(function (col) { allowed[col.key] = true; });
    var seen = {};
    var list = [];
    (draftKeys || []).forEach(function (key) {
      if (!key || seen[key] || !allowed[key] || !COLUMN_MAP[key]) return;
      seen[key] = true;
      list.push(key);
    });
    columnsForTab(currentTab).forEach(function (col) {
      if (isDefaultFrozenKey(col.key) && !seen[col.key]) {
        list.unshift(col.key);
        seen[col.key] = true;
      }
    });
    var locked = [];
    var free = [];
    list.forEach(function (key) {
      if (isDefaultFrozenKey(key)) locked.push(key);
      else free.push(key);
    });
    return locked.concat(free);
  }

  function renderMetricModal() {
    hideMetricTip();
    var kw = ($('metricSearch').value || '').trim().toLowerCase();
    var tabCols = columnsForTab(currentTab);
    var grouped = {};
    GROUPS.forEach(function (group) { grouped[group] = []; });
    tabCols.forEach(function (col) {
      var label = colLabel(col);
      if (kw && label.toLowerCase().indexOf(kw) < 0 && col.name.toLowerCase().indexOf(kw) < 0 && col.key.toLowerCase().indexOf(kw) < 0) return;
      if (!grouped[col.group]) grouped[col.group] = [];
      grouped[col.group].push(col);
    });
    var visibleGroups = GROUPS.filter(function (group) { return (grouped[group] || []).length; });
    if (visibleGroups.indexOf(metricCat) < 0) metricCat = visibleGroups[0] || GROUPS[0];

    $('metricCats').innerHTML = visibleGroups.map(function (group) {
      return '<button class="metric-cat' + (group === metricCat ? ' is-active' : '') + '" type="button" data-group="' + escapeHtml(group) + '">' + escapeHtml(group) + '</button>';
    }).join('') || '<div class="transfer__empty">无匹配</div>';

    $('metricOptions').innerHTML = visibleGroups.map(function (group) {
      var cols = grouped[group] || [];
      var selectable = cols.filter(function (col) { return !isDefaultFrozenKey(col.key); });
      var checkedCount = cols.filter(function (col) { return columnDraft.indexOf(col.key) >= 0; }).length;
      var allOn = cols.length > 0 && checkedCount === cols.length;
      return '<section class="metric-group" id="metricGroup-' + escapeHtml(group) + '" data-group="' + escapeHtml(group) + '">' +
        '<div class="metric-group__head">' +
          '<input class="metric-check" type="checkbox" data-group-check="' + escapeHtml(group) + '"' + (allOn ? ' checked' : '') + (selectable.length ? '' : ' disabled') + ' />' +
          '<span>' + escapeHtml(group) + '</span>' +
        '</div>' +
        '<div class="metric-group__grid">' + cols.map(function (col) {
          var on = columnDraft.indexOf(col.key) >= 0;
          var locked = isDefaultFrozenKey(col.key);
          var tipAttr = col.tip ? ' data-tip="' + escapeHtml(col.tip) + '"' : '';
          return '<label class="metric-option' + (locked ? ' is-disabled' : '') + '">' +
            '<input class="metric-check" type="checkbox" value="' + col.key + '"' + (on ? ' checked' : '') + (locked ? ' disabled' : '') + ' />' +
            '<span class="metric-option__name"' + tipAttr + '>' + escapeHtml(colLabel(col)) + '</span>' +
          '</label>';
        }).join('') + '</div></section>';
    }).join('') || '<div class="transfer__empty">无匹配指标</div>';

    $('metricOptions').querySelectorAll('[data-group-check]').forEach(function (input) {
      var group = input.getAttribute('data-group-check');
      var cols = grouped[group] || [];
      var checkedCount = cols.filter(function (col) { return columnDraft.indexOf(col.key) >= 0; }).length;
      var allOn = cols.length > 0 && checkedCount === cols.length;
      input.indeterminate = checkedCount > 0 && !allOn;
    });

    var freezeAt = Math.min(Math.max(draftFrozenCount, 0), columnDraft.length);
    draftFrozenCount = Math.max(freezeAt, minFrozenCount(columnDraft));
    freezeAt = draftFrozenCount;
    var listHtml = '';
    if (!columnDraft.length) {
      listHtml = '<div class="transfer__empty">请添加指标</div>';
    } else {
      columnDraft.forEach(function (key, idx) {
        if (idx === freezeAt) {
          listHtml += '<div class="metric-freeze" data-freeze-line="1">拖到上方的列将冻结显示</div>';
        }
        var col = COLUMN_MAP[key];
        var forced = isDefaultFrozenKey(key);
        var frozen = idx < freezeAt;
        var icon = frozen
          ? '<svg class="metric-selected__lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="6" y="11" width="12" height="9" rx="1"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>'
          : '<svg class="metric-selected__drag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
        var remove = forced
          ? ''
          : '<button class="metric-selected__remove" type="button" data-remove-col="' + escapeHtml(key) + '" aria-label="移除"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 2l8 8M10 2L2 10"/></svg></button>';
        listHtml += '<div class="metric-selected__item' + (frozen ? ' is-frozen' : '') + '" draggable="' + (forced ? 'false' : 'true') + '" data-metric="' + escapeHtml(key) + '" data-index="' + idx + '">' +
          icon +
          '<span class="metric-selected__name">' + escapeHtml(colLabel(col)) + '</span>' +
          remove +
        '</div>';
      });
      if (freezeAt >= columnDraft.length) {
        listHtml += '<div class="metric-freeze" data-freeze-line="1">拖到上方的列将冻结显示</div>';
      }
    }
    $('metricSelectedList').innerHTML = listHtml;
    $('metricSelectedCount').textContent = '已选 ' + columnDraft.length + ' 列';
  }

  function toggleMetricKey(key, checked) {
    if (isDefaultFrozenKey(key)) return;
    var idx = columnDraft.indexOf(key);
    if (checked && idx < 0) columnDraft.push(key);
    else if (!checked && idx >= 0) {
      columnDraft.splice(idx, 1);
      if (idx < draftFrozenCount) draftFrozenCount = Math.max(minFrozenCount(columnDraft), draftFrozenCount - 1);
    }
    draftFrozenCount = Math.max(draftFrozenCount, minFrozenCount(columnDraft));
  }

  function restoreDefaultMetrics() {
    columnDraft = normalizeMetricDraft(defaultColumnKeys(currentTab));
    draftFrozenCount = minFrozenCount(columnDraft);
    activePresetId = 'default';
    $('metricSearch').value = '';
    metricCat = GROUPS[0];
    renderMetricModal();
  }

  function applyColumnConfig(keys, freeze, presetId) {
    columns = normalizeMetricDraft(keys.slice());
    frozenCount = Math.max(freeze || 0, minFrozenCount(columns));
    frozenCount = Math.min(frozenCount, columns.length);
    activePresetId = presetId || 'default';
    renderTable();
    renderPresetMenu();
  }

  function findPreset(id) {
    for (var i = 0; i < columnPresets.length; i++) {
      if (columnPresets[i].id === id) return columnPresets[i];
    }
    return null;
  }

  function presetNameExists(name, excludeId) {
    var n = String(name || '').trim();
    if (!n) return false;
    if (n === '默认列') return true;
    return columnPresets.some(function (item) {
      return item.name === n && item.id !== excludeId;
    });
  }

  function closePresetMenu() {
    var wrap = $('metricsWrap');
    if (wrap) wrap.classList.remove('is-open');
  }

  function renderPresetMenu() {
    var menu = $('presetMenu');
    if (!menu) return;
    var editIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>';
    var delIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M6 7l1 14h10l1-14"/><path d="M10 11v5M14 11v5"/></svg>';
    var html = '<div class="preset-menu__title">常用列</div><div class="preset-menu__list">';
    columnPresets.forEach(function (item) {
      html += '<div class="preset-menu__item">' +
        '<button class="preset-menu__name" type="button" role="menuitem" data-preset-apply="' + escapeHtml(item.id) + '" title="' + escapeHtml(item.name) + '">' + escapeHtml(item.name) + '</button>' +
        '<span class="preset-menu__actions">' +
          '<button class="preset-menu__action" type="button" data-preset-edit="' + escapeHtml(item.id) + '" aria-label="编辑">' + editIcon + '</button>' +
          '<button class="preset-menu__action" type="button" data-preset-delete="' + escapeHtml(item.id) + '" aria-label="删除">' + delIcon + '</button>' +
        '</span></div>';
    });
    html += '</div><button class="preset-menu__footer" type="button" data-preset-open-modal>自定义列</button>';
    menu.innerHTML = html;
  }

  function applyPreset(id) {
    var item = findPreset(id);
    if (!item) return;
    applyColumnConfig(item.keys, item.frozenCount, item.id);
    closePresetMenu();
  }

  function openMetricModalForPreset(id) {
    var item = findPreset(id);
    if (!item) return;
    closePresetMenu();
    editingPresetId = id;
    activePresetId = id;
    columnDraft = normalizeMetricDraft(item.keys.slice());
    draftFrozenCount = Math.max(item.frozenCount || 0, minFrozenCount(columnDraft));
    draftFrozenCount = Math.min(draftFrozenCount, columnDraft.length);
    $('metricSearch').value = '';
    metricCat = GROUPS[0];
    if ($('metricSaveCommon')) $('metricSaveCommon').checked = false;
    syncMetricSaveName();
    renderMetricModal();
    UI.openModal('metricModal');
  }

  function openPresetDelete(id) {
    if (!findPreset(id)) return;
    presetDeleteId = id;
    UI.openModal('presetDeleteModal');
  }

  function ensureMetricTip() {
    var tip = document.getElementById('metricDefTip');
    if (tip) return tip;
    tip = document.createElement('div');
    tip.id = 'metricDefTip';
    tip.className = 'form-help-tip';
    tip.setAttribute('role', 'tooltip');
    tip.innerHTML = '<span class="form-help-tip__text"></span><span class="form-help-tip__arrow" aria-hidden="true"></span>';
    document.body.appendChild(tip);
    return tip;
  }

  function hideMetricTip() {
    metricTipAnchor = null;
    var tip = document.getElementById('metricDefTip');
    if (tip) tip.classList.remove('is-open');
  }

  function showMetricTip(anchor) {
    var msg = anchor.getAttribute('data-tip') || '';
    if (!msg) return;
    metricTipAnchor = anchor;
    var tip = ensureMetricTip();
    var textEl = tip.querySelector('.form-help-tip__text');
    if (textEl) textEl.textContent = msg;
    tip.classList.remove('is-below');
    tip.classList.add('is-open');
    tip.style.left = '0px';
    tip.style.top = '0px';
    function place() {
      if (metricTipAnchor !== anchor) return;
      var a = anchor.getBoundingClientRect();
      var t = tip.getBoundingClientRect();
      if (!t.width || !t.height) return;
      var gap = 6;
      var pad = 8;
      var left = a.left + a.width / 2 - t.width / 2;
      left = Math.max(pad, Math.min(left, window.innerWidth - t.width - pad));
      var top = a.top - t.height - gap;
      if (top < pad) {
        top = a.bottom + gap;
        tip.classList.add('is-below');
      } else {
        tip.classList.remove('is-below');
      }
      tip.style.left = left + 'px';
      tip.style.top = top + 'px';
      tip.style.setProperty('--arrow-left', (a.left + a.width / 2 - left) + 'px');
    }
    place();
    requestAnimationFrame(place);
  }

  function openMetricModal() {
    editingPresetId = '';
    GROUPS = groupsForTab(currentTab);
    columnDraft = normalizeMetricDraft(columns.slice());
    draftFrozenCount = Math.max(frozenCount, minFrozenCount(columnDraft));
    $('metricSearch').value = '';
    metricCat = GROUPS[0];
    if ($('metricSaveCommon')) $('metricSaveCommon').checked = false;
    syncMetricSaveName();
    renderMetricModal();
    UI.openModal('metricModal');
  }

  function exportCsv() {
    var scale = appliedScale;
    var list = filteredRows();
    var cols = visibleColumns();
    var lines = [cols.map(function (col) { return '"' + colLabel(col).replace(/"/g, '""') + '"'; }).join(',')];
    list.forEach(function (row) {
      lines.push(cols.map(function (col) {
        var val = displayValue(row, col, scale);
        return '"' + String(val == null ? '' : val).replace(/"/g, '""') + '"';
      }).join(','));
    });
    var stamp = formatDate(new Date()).replace(/-/g, '');
    var tabName = (PROMO_TAB_META[currentTab] && PROMO_TAB_META[currentTab].label) || '广告账户';
    UI.downloadText('TikTok推广_' + tabName + '_' + stamp + '.csv', '\ufeff' + lines.join('\n'), 'text/csv;charset=utf-8');
  }

  /* —— 绑定 —— */
  dateApi = UI.bindDateRange({
    wrapId: 'dateRangeWrap',
    triggerId: 'dateRangeTrigger',
    labelId: 'dateRangeLabel',
    panelId: 'datePanel',
    shortcutsId: 'dateShortcuts',
    calLeftId: 'dateCalLeft',
    calRightId: 'dateCalRight',
    defaultShortcut: 'today'
  });

  releaseDateApi = UI.bindDateRange({
    wrapId: 'releaseDateWrap',
    triggerId: 'releaseDateTrigger',
    labelId: 'releaseDateLabel',
    panelId: 'releaseDatePanel',
    shortcutsId: 'releaseDateShortcuts',
    calLeftId: 'releaseDateCalLeft',
    calRightId: 'releaseDateCalRight',
    prefix: '上线时间：',
    onChange: function (start, end) {
      draft.releaseStart = start;
      draft.releaseEnd = end;
      var wrap = $('releaseDateWrap');
      if (wrap) wrap.classList.toggle('has-value', !!(start && end));
    }
  });
  clearReleaseDate();
  if ($('releaseDateClear')) {
    $('releaseDateClear').addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      clearReleaseDate();
    });
  }

  accountClear = UI.bindInputClearable({ wrapId: 'accountKeywordWrap', inputId: 'accountKeyword', clearId: 'accountKeywordClear' });

  platformMulti = UI.bindMultiSelect({
    wrapId: 'platformWrap',
    triggerId: 'platformTrigger',
    panelId: 'platformPanel',
    labelId: 'platformLabel',
    listId: 'platformList',
    clearId: 'platformClear',
    prefix: '平台：',
    getOptions: currentPlatforms,
    getSelected: function () { return draft.platform; },
    setSelected: function (arr) {
      draft.platform = arr;
      pruneProducts();
      if (productMulti) productMulti.render();
    }
  });

  promoTypeApi = UI.bindMultiSelect({
    wrapId: 'promoTypeWrap',
    triggerId: 'promoTypeTrigger',
    panelId: 'promoTypePanel',
    labelId: 'promoTypeLabel',
    listId: 'promoTypeList',
    clearId: 'promoTypeClear',
    prefix: '推广类型：',
    getOptions: promoTypeOptions,
    getSelected: function () { return draft.promoTypes || []; },
    setSelected: function (arr) { draft.promoTypes = Array.isArray(arr) ? arr : []; }
  });

  createDateApi = UI.bindDateRange({
    wrapId: 'createDateWrap',
    triggerId: 'createDateTrigger',
    labelId: 'createDateLabel',
    panelId: 'createDatePanel',
    shortcutsId: 'createDateShortcuts',
    calLeftId: 'createDateCalLeft',
    calRightId: 'createDateCalRight',
    prefix: '创建时间：',
    onChange: function (start, end) {
      draft.createStart = start;
      draft.createEnd = end;
      var wrap = $('createDateWrap');
      if (wrap) wrap.classList.toggle('has-value', !!(start && end));
    }
  });
  clearCreateDate();
  if ($('createDateClear')) {
    $('createDateClear').addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      clearCreateDate();
    });
  }

  campaignClear = UI.bindInputClearable({
    wrapId: 'campaignKeywordWrap',
    inputId: 'campaignKeyword',
    clearId: 'campaignKeywordClear'
  });
  if ($('campaignKeyword')) {
    $('campaignKeyword').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') applyQuery();
    });
  }
  adgroupClear = UI.bindInputClearable({
    wrapId: 'adgroupKeywordWrap',
    inputId: 'adgroupKeyword',
    clearId: 'adgroupKeywordClear'
  });
  if ($('adgroupKeyword')) {
    $('adgroupKeyword').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') applyQuery();
    });
  }
  adClear = UI.bindInputClearable({
    wrapId: 'adKeywordWrap',
    inputId: 'adKeyword',
    clearId: 'adKeywordClear'
  });
  if ($('adKeyword')) {
    $('adKeyword').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') applyQuery();
    });
  }

  statusMulti = UI.bindMultiSelect({
    wrapId: 'statusCampWrap',
    triggerId: 'statusCampTrigger',
    panelId: 'statusMultiPanel',
    labelId: 'statusCampLabel',
    listId: 'statusMultiList',
    clearId: 'statusCampClear',
    prefix: '状态：',
    getOptions: function () { return EFFECTIVE_STATUSES; },
    getSelected: function () { return draft.statuses || []; },
    setSelected: function (arr) { draft.statuses = Array.isArray(arr) ? arr : []; }
  });

  productMulti = UI.bindMultiSelect({
    wrapId: 'productWrap',
    triggerId: 'productTrigger',
    panelId: 'productPanel',
    labelId: 'productLabel',
    listId: 'productList',
    selectedId: 'productSelected',
    searchId: 'productSearch',
    countId: 'productCount',
    selectAllId: 'productSelectAll',
    clearId: 'productClear',
    prefix: '产品：',
    getOptions: productOptions,
    getIconHtml: function (name) { return productIconHtml(productPlatform(name)); },
    getSelected: function () { return draft.product; },
    setSelected: function (arr) { draft.product = arr; }
  });
  var productPanelClearBtn = $('productPanelClear');
  if (productPanelClearBtn) {
    productPanelClearBtn.addEventListener('click', function () {
      draft.product = [];
      productMulti.render();
    });
  }

  optimizerMulti = UI.bindMultiSelect({
    wrapId: 'optimizerWrap',
    triggerId: 'optimizerTrigger',
    panelId: 'optimizerPanel',
    labelId: 'optimizerLabel',
    listId: 'optimizerList',
    selectedId: 'optimizerSelected',
    searchId: 'optimizerSearch',
    countId: 'optimizerCount',
    selectAllId: 'optimizerSelectAll',
    clearId: 'optimizerClear',
    prefix: '优化师：',
    options: OPTIMIZERS,
    getSelected: function () { return draft.optimizer; },
    setSelected: function (arr) { draft.optimizer = arr; }
  });
  var optimizerPanelClearBtn = $('optimizerPanelClear');
  if (optimizerPanelClearBtn) {
    optimizerPanelClearBtn.addEventListener('click', function () {
      draft.optimizer = [];
      optimizerMulti.render();
    });
  }

  statusApi = UI.bindSingleSelect({
    wrapId: 'statusWrap',
    triggerId: 'statusTrigger',
    panelId: 'statusPanel',
    labelId: 'statusLabel',
    clearId: 'statusClear',
    prefix: '投放状态：',
    getValue: function () { return draft.status; },
    onChange: function (value) { draft.status = value; }
  });

  sortApi = UI.bindThSort({
    root: '#accountTable',
    getState: function () { return sortState; },
    setState: function (next) {
      var specs = (next && next.specs) || [];
      sortState = { specs: specs.length ? [specs[specs.length - 1]] : [] };
    },
    onChange: function () {
      page = 1;
      renderTable();
    }
  });

  UI.bindPagination({
    containerId: 'pagination',
    onPageChange: function (next) {
      page = next;
      renderTable();
    },
    onPageSizeChange: function (size) {
      pageSize = size;
      page = 1;
      renderTable();
    }
  });

  $('queryBtn').addEventListener('click', applyQuery);
  $('resetBtn').addEventListener('click', resetFilters);
  $('accountKeyword').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') applyQuery();
  });
  $('filterSettingBtn').addEventListener('click', openFilterSettings);
  $('filterSettingSubmit').addEventListener('click', submitFilterSettings);

  document.querySelectorAll('[data-close="filterSettingModal"]').forEach(function (btn) {
    btn.addEventListener('click', cancelFilterSettings);
  });

  /* —— 创建广告 ——
   * 关联产品 ← 管理/产品列表/小游戏
   * 账户筛选 ← 管理/广告账户/TikTok（Client key）∩ 资产/TikTok/Mini（Mini ID）
   */
  function createAdProductAbbr(name) {
    var words = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return 'MINI';
    if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
    return words.map(function (w) { return w.charAt(0); }).join('').slice(0, 4).toUpperCase();
  }

  function createAdOptimizerAbbr(name) {
    return ('YH' + String(name || '').replace(/^用户/, '')).toUpperCase();
  }

  function createAdAccountName(product, optimizer) {
    return [createAdProductAbbr(product.name), 'TT', 'BV', 'TM', createAdOptimizerAbbr(optimizer)].join('_');
  }

  function createAdMinisProducts() {
    return PRODUCTS.filter(function (item) {
      return item.platform === 'TikTok Minis';
    });
  }

  /* 小游戏各建 4 个广告账户，Client key 与产品列表一致（对齐管理/广告账户/TikTok） */
  var CREATE_AD_ACCOUNTS_PER_PRODUCT = 4;
  function buildCreateAdAccountRows() {
    var rows = [];
    createAdMinisProducts().forEach(function (product, pi) {
      var j;
      for (j = 0; j < CREATE_AD_ACCOUNTS_PER_PRODUCT; j += 1) {
        var i = pi * CREATE_AD_ACCOUNTS_PER_PRODUCT + j;
        var optimizer = OPTIMIZERS[j % OPTIMIZERS.length];
        var id = '73410088' + String(10000001 + i);
        rows.push({
          advertiser_id: id,
          advertiser_name: createAdAccountName(product, optimizer),
          product_name: product.name,
          product_id: product.productId,
          client_key: product.clientKey,
          platform: product.platform
        });
      }
    });
    return rows;
  }

  /**
   * Mini 列表：每账户挂一条同名小游戏，Mini ID = 该账户 Client key（满足匹配条件）；
   * 另挂一条短剧（随机 Mini ID）模拟非匹配项。
   */
  function buildCreateAdMiniRows(accountRows) {
    var extraNames = ['Moonlit Vow', 'Heir of the North', 'Second Chance', 'Hidden Crown', 'After Midnight', 'Paper Rings'];
    var rows = [];
    accountRows.forEach(function (account, i) {
      rows.push({
        advertiser_id: account.advertiser_id,
        advertiser_name: account.advertiser_name,
        minis_name: account.product_name,
        minis_id: account.client_key,
        minis_type: '小游戏'
      });
      rows.push({
        advertiser_id: account.advertiser_id,
        advertiser_name: account.advertiser_name,
        minis_name: extraNames[i % extraNames.length],
        minis_id: 'x' + String(account.client_key || '').slice(1),
        minis_type: '短剧'
      });
    });
    return rows;
  }

  var CREATE_AD_ACCOUNT_ROWS = buildCreateAdAccountRows();
  var CREATE_AD_MINI_ROWS = buildCreateAdMiniRows(CREATE_AD_ACCOUNT_ROWS);
  var createAdDraft = {
    objective: 'TikTok 即时增长',
    promoType: '小游戏',
    setup: '升级版Smart+ 推广系列',
    productId: '',
    productName: '',
    clientKey: '',
    advertiserId: '',
    advertiserName: ''
  };
  var createAdMatchedAccounts = [];
  var createAdProductApi = null;
  var CREATE_AD_DRAFT_KEY = 'wonder_ads_tiktok_create_ad_draft_v1';
  var PENDING_TOAST_KEY = 'wonder_ads_pending_toast';

  function createAdFindProduct(productId) {
    var list = createAdMinisProducts();
    for (var i = 0; i < list.length; i += 1) {
      if (String(list[i].productId) === String(productId)) return list[i];
    }
    return null;
  }

  function readSavedCreateAdDraft() {
    try {
      var raw = localStorage.getItem(CREATE_AD_DRAFT_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      return data && data.state ? data : null;
    } catch (err) {
      return null;
    }
  }

  function applySavedDraftProductToModal() {
    var saved = readSavedCreateAdDraft();
    if (!saved || !saved.state || !saved.state.productId) return false;
    var product = createAdFindProduct(saved.state.productId);
    if (!product) return false;
    createAdDraft.productId = product.productId;
    createAdDraft.productName = product.name;
    createAdDraft.clientKey = product.clientKey;
    if (createAdProductApi) createAdProductApi.setValue(product.productId);
    clearCreateAdProductError();
    return true;
  }

  function consumePendingToast() {
    try {
      var raw = localStorage.getItem(PENDING_TOAST_KEY);
      if (!raw) return;
      localStorage.removeItem(PENDING_TOAST_KEY);
      var msg = JSON.parse(raw);
      if (msg && msg.text) UI.showToast(msg.text, msg.type || 'success');
    } catch (err) { /* ignore */ }
  }

  function clearCreateAdProductError() {
    var item = $('createAdProductItem');
    if (item) item.classList.remove('is-error');
  }

  function showCreateAdProductError() {
    var item = $('createAdProductItem');
    if (item) item.classList.add('is-error');
  }

  function resetCreateAdModal() {
    createAdDraft.productId = '';
    createAdDraft.productName = '';
    createAdDraft.clientKey = '';
    createAdDraft.advertiserId = '';
    createAdDraft.advertiserName = '';
    createAdMatchedAccounts = [];
    clearCreateAdProductError();
    if (createAdProductApi) createAdProductApi.setValue('');
  }

  function openCreateAdModal(options) {
    var opts = options || {};
    if (!opts.keepDraft) resetCreateAdModal();
    applySavedDraftProductToModal();
    UI.openModal('createAdModal');
  }

  function closeCreateAdModal() {
    UI.closePanels();
    UI.closeModal('createAdModal');
  }

  /**
   * 新建：
   * 1) 管理/广告账户/TikTok：按关联产品 Client key 取账户
   * 2) 资产/TikTok/Mini：取这些账户下的 Mini ID
   * 3) 仅展示 Client key === Mini ID 的账户
   */
  function matchAccountsByClientKey(clientKey) {
    var key = String(clientKey || '').trim().toLowerCase();
    if (!key) return [];
    var byProduct = CREATE_AD_ACCOUNT_ROWS.filter(function (row) {
      return String(row.client_key || '').toLowerCase() === key;
    });
    if (!byProduct.length) return [];
    var accountIds = {};
    byProduct.forEach(function (row) {
      accountIds[row.advertiser_id] = true;
    });
    var miniIds = {};
    CREATE_AD_MINI_ROWS.forEach(function (row) {
      if (!accountIds[row.advertiser_id]) return;
      miniIds[String(row.minis_id || '').toLowerCase()] = true;
    });
    return byProduct.filter(function (row) {
      return !!miniIds[String(row.client_key || '').toLowerCase()];
    });
  }

  function buildCreateAdPageUrl(mode) {
    var params = new URLSearchParams();
    params.set('mode', mode || 'create');
    if (createAdDraft.productId) params.set('productId', createAdDraft.productId);
    if (createAdDraft.productName) params.set('productName', createAdDraft.productName);
    if (createAdDraft.clientKey) params.set('clientKey', createAdDraft.clientKey);
    if (createAdDraft.advertiserId) params.set('advertiserId', createAdDraft.advertiserId);
    if (createAdDraft.advertiserName) params.set('advertiserName', createAdDraft.advertiserName);
    return 'tiktok-create-ad.html?' + params.toString();
  }

  /** 新建：按 Client key ∩ Mini ID 筛账户，新标签打开二级页，当前页关闭弹窗 */
  function prepareCreateAdAndEnter() {
    var product = createAdFindProduct(createAdDraft.productId);
    if (!product) {
      showCreateAdProductError();
      return;
    }
    createAdDraft.productName = product.name;
    createAdDraft.clientKey = product.clientKey;
    var matched = matchAccountsByClientKey(product.clientKey);
    createAdMatchedAccounts = matched.slice();
    /* 预填首个匹配账户；二级页会按 Client key 载入全部可选项并默认全选 */
    if (matched.length) {
      createAdDraft.advertiserId = matched[0].advertiser_id;
      createAdDraft.advertiserName = matched[0].advertiser_name;
    } else {
      createAdDraft.advertiserId = '';
      createAdDraft.advertiserName = '';
    }
    var url = buildCreateAdPageUrl('create');
    window.open(url, '_blank');
    closeCreateAdModal();
    resetCreateAdModal();
  }

  function showCreateAdPage(mode) {
    var listView = $('promoListView');
    var page = $('createAdPage');
    var title = $('createAdPageTitle');
    if (listView) listView.hidden = true;
    if (page) page.hidden = false;
    if (title) title.textContent = '创建广告';
    closeCreateAdModal();
  }

  function hideCreateAdPage() {
    var listView = $('promoListView');
    var page = $('createAdPage');
    if (page) page.hidden = true;
    if (listView) listView.hidden = false;
    if (window.ColResize && $('accountTable')) {
      try { ColResize.refresh($('accountTable'), { onLayout: syncFreezeLeft }); } catch (err) { /* ignore */ }
    }
  }

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
      var icon = cfg.getIconHtml ? cfg.getIconHtml(current) : '';
      label.innerHTML = icon + '<span>' + escapeHtml(textOf(current)) + '</span>';
      wrap.classList.add('has-value');
    }

    function render() {
      var kw = ((search && search.value) || '').trim().toLowerCase();
      var items = options().filter(function (item) {
        return !kw || textOf(item).toLowerCase().indexOf(kw) >= 0;
      });
      if (!items.length) {
        list.innerHTML = '<div class="single-panel__empty">暂无数据</div>';
        return;
      }
      list.innerHTML = items.map(function (item) {
        var itemValue = valueOf(item);
        var icon = cfg.getIconHtml ? cfg.getIconHtml(item) : '';
        var active = String(itemValue) === String(value) ? ' is-active' : '';
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
      var opt = e.target.closest('.single-option');
      if (!opt) return;
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
      refresh: function () {
        render();
        syncLabel();
      }
    };
  }

  createAdProductApi = bindCreateAdSearchSingle({
    wrapId: 'createAdProductWrap',
    triggerId: 'createAdProductTrigger',
    panelId: 'createAdProductPanel',
    labelId: 'createAdProductLabel',
    listId: 'createAdProductList',
    searchId: 'createAdProductSearch',
    clearId: 'createAdProductClear',
    getOptions: createAdMinisProducts,
    getLabel: function (item) { return item.name; },
    getValue: function (item) { return item.productId; },
    getIconHtml: function (item) { return productIconHtml(item.platform); },
    onChange: function (value) {
      createAdDraft.productId = value || '';
      var product = createAdFindProduct(value);
      createAdDraft.productName = product ? product.name : '';
      createAdDraft.clientKey = product ? product.clientKey : '';
      if (value) clearCreateAdProductError();
    }
  });

  $('createAdBtn').addEventListener('click', function () {
    openCreateAdModal();
  });

  document.querySelectorAll('[data-close="createAdModal"]').forEach(function (btn) {
    btn.addEventListener('click', closeCreateAdModal);
  });

  $('createAdDraftBtn').addEventListener('click', function () {
    var saved = readSavedCreateAdDraft();
    if (!saved || !saved.state || !saved.state.productId) {
      UI.showToast('暂无草稿', 'warning');
      return;
    }
    applySavedDraftProductToModal();
    if (!createAdDraft.productId) {
      showCreateAdProductError();
      return;
    }
    var url = buildCreateAdPageUrl('draft');
    window.open(url, '_blank');
    closeCreateAdModal();
  });

  $('createAdNewBtn').addEventListener('click', function () {
    if (!createAdDraft.productId) {
      showCreateAdProductError();
      return;
    }
    prepareCreateAdAndEnter();
  });

  $('createAdBackBtn').addEventListener('click', hideCreateAdPage);

  $('metricsWrap').addEventListener('mouseenter', function () {
    renderPresetMenu();
  });
  $('metricsBtn').addEventListener('click', function (e) {
    e.stopPropagation();
    closePresetMenu();
    openMetricModal();
  });
  $('presetMenu').addEventListener('click', function (e) {
    e.stopPropagation();
    var openModal = e.target.closest('[data-preset-open-modal]');
    if (openModal) {
      closePresetMenu();
      openMetricModal();
      return;
    }
    var applyBtn = e.target.closest('[data-preset-apply]');
    if (applyBtn) {
      applyPreset(applyBtn.getAttribute('data-preset-apply'));
      return;
    }
    var editBtn = e.target.closest('[data-preset-edit]');
    if (editBtn) {
      openMetricModalForPreset(editBtn.getAttribute('data-preset-edit'));
      return;
    }
    var delBtn = e.target.closest('[data-preset-delete]');
    if (delBtn) {
      closePresetMenu();
      openPresetDelete(delBtn.getAttribute('data-preset-delete'));
    }
  });
  $('exportBtn').addEventListener('click', exportCsv);
  renderPresetMenu();

  $('metricSearch').addEventListener('input', renderMetricModal);
  $('metricCats').addEventListener('click', function (e) {
    var btn = e.target.closest('.metric-cat');
    if (!btn) return;
    var group = btn.getAttribute('data-group');
    metricCat = group;
    renderMetricModal();
    var el = document.getElementById('metricGroup-' + group);
    var scroller = $('metricOptions');
    if (el && scroller) {
      metricAnchorLock = true;
      scroller.scrollTo({ top: Math.max(0, el.offsetTop - 8), behavior: 'smooth' });
      window.setTimeout(function () { metricAnchorLock = false; }, 400);
    }
  });
  $('metricOptions').addEventListener('scroll', function () {
    if (metricAnchorLock) return;
    var scroller = $('metricOptions');
    var groups = scroller.querySelectorAll('.metric-group');
    if (!groups.length) return;
    var top = scroller.scrollTop + 24;
    var active = groups[0].getAttribute('data-group');
    Array.prototype.forEach.call(groups, function (group) {
      if (group.offsetTop <= top) active = group.getAttribute('data-group');
    });
    if (active && active !== metricCat) {
      metricCat = active;
      Array.prototype.forEach.call($('metricCats').querySelectorAll('.metric-cat'), function (btn) {
        btn.classList.toggle('is-active', btn.getAttribute('data-group') === active);
      });
    }
  });
  $('metricOptions').addEventListener('change', function (e) {
    var input = e.target;
    if (!input.classList.contains('metric-check')) return;
    if (input.getAttribute('data-group-check')) {
      var group = input.getAttribute('data-group-check');
      columnsForTab(currentTab).filter(function (col) { return col.group === group && !isDefaultFrozenKey(col.key); }).forEach(function (col) {
        toggleMetricKey(col.key, input.checked);
      });
    } else {
    toggleMetricKey(input.value, input.checked);
    }
    renderMetricModal();
  });
  $('metricClear').addEventListener('click', function () {
    columnDraft = columnsForTab(currentTab).filter(function (col) { return isDefaultFrozenKey(col.key); }).map(function (col) { return col.key; });
    draftFrozenCount = columnDraft.length;
    renderMetricModal();
  });

  $('metricReset').addEventListener('click', restoreDefaultMetrics);

  function syncMetricSaveName() {
    var checked = !!($('metricSaveCommon') && $('metricSaveCommon').checked);
    var input = $('metricSaveName');
    if (!input) return;
    input.hidden = !checked;
    if (!checked) input.value = '';
  }

  if ($('metricSaveCommon')) {
    $('metricSaveCommon').addEventListener('change', syncMetricSaveName);
  }

  $('metricOptions').addEventListener('mouseover', function (e) {
    var name = e.target.closest('.metric-option__name[data-tip]');
    if (!name || !$('metricOptions').contains(name)) return;
    if (name === metricTipAnchor) return;
    showMetricTip(name);
  });
  $('metricOptions').addEventListener('mouseout', function (e) {
    var name = e.target.closest('.metric-option__name[data-tip]');
    if (!name || name !== metricTipAnchor) return;
    var related = e.relatedTarget && e.relatedTarget.closest
      ? e.relatedTarget.closest('.metric-option__name[data-tip]')
      : null;
    if (related === name) return;
    hideMetricTip();
  });
  $('metricOptions').addEventListener('scroll', hideMetricTip);
  $('metricSelectedList').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-remove-col]');
    if (!btn) return;
    toggleMetricKey(btn.getAttribute('data-remove-col'), false);
    renderMetricModal();
  });

  var dragKey = null;
  $('metricSelectedList').addEventListener('dragstart', function (e) {
    var item = e.target.closest('[data-metric]');
    if (!item || item.getAttribute('draggable') === 'false') return;
    dragKey = item.getAttribute('data-metric');
    item.classList.add('is-dragging');
  });
  $('metricSelectedList').addEventListener('dragend', function () {
    dragKey = null;
    renderMetricModal();
  });
  $('metricSelectedList').addEventListener('dragover', function (e) {
    e.preventDefault();
    var item = e.target.closest('[data-metric], .metric-freeze');
    Array.prototype.forEach.call($('metricSelectedList').querySelectorAll('.is-drag-over'), function (el) {
      el.classList.remove('is-drag-over');
    });
    if (item) item.classList.add('is-drag-over');
  });
  $('metricSelectedList').addEventListener('drop', function (e) {
    e.preventDefault();
    if (!dragKey) return;
    var from = columnDraft.indexOf(dragKey);
    if (from < 0) return;
    var freezeEl = e.target.closest('.metric-freeze');
    var item = e.target.closest('[data-metric]');
      columnDraft.splice(from, 1);
    if (freezeEl) {
      columnDraft.splice(0, 0, dragKey);
      draftFrozenCount = Math.max(draftFrozenCount, minFrozenCount(columnDraft));
      if (from >= draftFrozenCount) draftFrozenCount += 1;
    } else if (item) {
      var to = Number(item.getAttribute('data-index'));
      if (from < to) to -= 1;
      columnDraft.splice(to, 0, dragKey);
      if (to < draftFrozenCount && from >= draftFrozenCount) draftFrozenCount += 1;
      if (to >= draftFrozenCount && from < draftFrozenCount) draftFrozenCount = Math.max(minFrozenCount(columnDraft), draftFrozenCount - 1);
    } else {
      columnDraft.push(dragKey);
      if (from < draftFrozenCount) draftFrozenCount = Math.max(minFrozenCount(columnDraft), draftFrozenCount - 1);
    }
        draftFrozenCount = Math.max(draftFrozenCount, minFrozenCount(columnDraft));
    dragKey = null;
    renderMetricModal();
  });

  $('metricSubmit').addEventListener('click', function () {
    if (!columnDraft.length) {
      UI.showToast('请至少选择 1 列');
      return;
    }
    var keys = normalizeMetricDraft(columnDraft.slice());
    var freeze = Math.max(draftFrozenCount, minFrozenCount(keys));
    freeze = Math.min(freeze, keys.length);
    var saveCommon = !!($('metricSaveCommon') && $('metricSaveCommon').checked);
    if (saveCommon) {
      var name = (($('metricSaveName') && $('metricSaveName').value) || '').trim();
      if (!name) {
        UI.showToast('请输入名称');
        if ($('metricSaveName')) $('metricSaveName').focus();
        return;
      }
      if (presetNameExists(name, editingPresetId || undefined)) {
        UI.showToast('常用列名称已存在');
        if ($('metricSaveName')) $('metricSaveName').focus();
        return;
      }
      if (editingPresetId) {
        var editing = findPreset(editingPresetId);
        if (editing) {
          editing.name = name;
          editing.keys = keys.slice();
          editing.frozenCount = freeze;
        }
        hideMetricTip();
        UI.closeModal('metricModal');
        applyColumnConfig(keys, freeze, editingPresetId);
        editingPresetId = '';
        UI.showToast('常用列已更新');
        return;
      }
      var preset = {
        id: 'preset_' + (presetSeq++),
        name: name,
        keys: keys.slice(),
        frozenCount: freeze
      };
      columnPresets.push(preset);
      hideMetricTip();
      UI.closeModal('metricModal');
      applyColumnConfig(keys, freeze, preset.id);
      UI.showToast('常用列已保存');
      return;
    }
    if (editingPresetId) {
      var current = findPreset(editingPresetId);
      if (current) {
        current.keys = keys.slice();
        current.frozenCount = freeze;
      }
      hideMetricTip();
      UI.closeModal('metricModal');
      applyColumnConfig(keys, freeze, editingPresetId);
      editingPresetId = '';
      UI.showToast('自定义列已更新');
      return;
    }
    hideMetricTip();
    UI.closeModal('metricModal');
    applyColumnConfig(keys, freeze, activePresetId === 'default' ? 'default' : activePresetId);
    UI.showToast('自定义列已更新');
  });
  document.querySelectorAll('[data-close="metricModal"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      editingPresetId = '';
      hideMetricTip();
      UI.closeModal('metricModal');
    });
  });

  function clearPresetRenameError() {
    var item = $('presetRenameItem');
    if (item) item.classList.remove('is-error');
  }

  if ($('presetRenameInput')) {
    $('presetRenameInput').addEventListener('input', clearPresetRenameError);
  }

  $('presetRenameSubmit').addEventListener('click', function () {
    var item = findPreset(presetEditId);
    if (!item) {
      UI.closeModal('presetRenameModal');
      return;
    }
    var name = (($('presetRenameInput') && $('presetRenameInput').value) || '').trim();
    var formItem = $('presetRenameItem');
    var err = $('presetRenameError');
    if (!name) {
      if (err) err.textContent = '请输入名称';
      if (formItem) formItem.classList.add('is-error');
      return;
    }
    if (presetNameExists(name, presetEditId)) {
      if (err) err.textContent = '常用列名称已存在';
      if (formItem) formItem.classList.add('is-error');
      return;
    }
    item.name = name;
    UI.closeModal('presetRenameModal');
    renderPresetMenu();
    UI.showToast('提交成功');
  });
  document.querySelectorAll('[data-close="presetRenameModal"]').forEach(function (btn) {
    btn.addEventListener('click', function () { UI.closeModal('presetRenameModal'); });
  });

  $('presetDeleteOk').addEventListener('click', function () {
    var id = presetDeleteId;
    var wasActive = activePresetId === id;
    columnPresets = columnPresets.filter(function (item) { return item.id !== id; });
    UI.closeModal('presetDeleteModal');
    if (wasActive) {
      applyColumnConfig(defaultColumnKeys(), minFrozenCount(defaultColumnKeys()), 'default');
    } else {
      renderPresetMenu();
    }
    UI.showToast('删除成功');
  });
  document.querySelectorAll('[data-close="presetDeleteModal"]').forEach(function (btn) {
    btn.addEventListener('click', function () { UI.closeModal('presetDeleteModal'); });
  });

  $('accountTable').addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'checkAll') {
      var list = filteredRows().slice((page - 1) * pageSize, page * pageSize);
      list.forEach(function (row) { selectedIds[row.id] = !!t.checked; });
      renderTable();
      return;
    }
    var id = t.getAttribute('data-row-check');
    if (!id) return;
    selectedIds[id] = !!t.checked;
    syncBatchBtn();
    var pageRows = filteredRows().slice((page - 1) * pageSize, page * pageSize);
    var all = pageRows.length > 0 && pageRows.every(function (row) { return selectedIds[row.id]; });
    var some = pageRows.some(function (row) { return selectedIds[row.id]; });
    var checkAll = $('checkAll');
    if (checkAll) {
      checkAll.checked = all;
      checkAll.indeterminate = some && !all;
    }
  });

  var opFloatTipEl = null;
  var opFloatTipHost = null;

  function ensureOpFloatTip() {
    if (opFloatTipEl) return opFloatTipEl;
    opFloatTipEl = document.createElement('div');
    opFloatTipEl.className = 'op-float-tip';
    opFloatTipEl.setAttribute('role', 'tooltip');
    document.body.appendChild(opFloatTipEl);
    return opFloatTipEl;
  }

  function hideOpFloatTip() {
    if (!opFloatTipEl) return;
    opFloatTipEl.classList.remove('is-open');
    opFloatTipEl.textContent = '';
    opFloatTipHost = null;
  }

  function showOpFloatTip(host) {
    if (!host) return;
    var text = host.getAttribute('data-disabled-tip') || '';
    if (!text) {
      hideOpFloatTip();
      return;
    }
    var tip = ensureOpFloatTip();
    tip.textContent = text;
    tip.classList.add('is-open');
    opFloatTipHost = host;
    var rect = host.getBoundingClientRect();
    var tipW = tip.offsetWidth;
    var tipH = tip.offsetHeight;
    var left = Math.round(rect.left + rect.width / 2 - tipW / 2);
    var top = Math.round(rect.top - tipH - 10);
    if (left < 8) left = 8;
    if (left + tipW > window.innerWidth - 8) left = window.innerWidth - tipW - 8;
    if (top < 8) top = Math.round(rect.bottom + 10);
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }

  function closeCellEditPop() {
    var pop = $('cellEditPop');
    if (!pop) return;
    pop.classList.remove('is-open');
    pop.setAttribute('aria-hidden', 'true');
    cellEditState = { id: '', field: '' };
  }

  function findRowById(id) {
    var found = null;
    rows.some(function (item) {
      if (item.id === id) { found = item; return true; }
      return false;
    });
    return found;
  }

  function startCellEdit(row, field, btn) {
    if (!row || !btn || !field) return;
    var pop = $('cellEditPop');
    var input = $('cellEditInput');
    if (!pop || !input) return;
    cellEditState = { id: row.id, field: field };
    if (field === 'campaign_name' || field === 'adgroup_name' || field === 'ad_name') {
      input.value = row[field] || '';
      input.placeholder = field === 'ad_name'
        ? '请输入广告名称'
        : (field === 'adgroup_name' ? '请输入广告组名称' : '请输入推广系列名称');
      input.setAttribute('inputmode', 'text');
    } else if (field === 'roas_bid') {
      input.value = row.roas_bid == null ? '' : String(row.roas_bid);
      input.placeholder = '请输入目标ROAS';
      input.setAttribute('inputmode', 'decimal');
    } else {
      input.value = row.budget_mode === '不限' ? '' : String(row.budget == null ? '' : row.budget);
      input.placeholder = '请输入预算';
      input.setAttribute('inputmode', 'decimal');
    }
    pop.classList.add('is-open');
    pop.setAttribute('aria-hidden', 'false');
    var rect = btn.getBoundingClientRect();
    var popW = 320;
    var left = rect.left;
    var top = rect.bottom + 4;
    if (left + popW > window.innerWidth - 16) left = window.innerWidth - popW - 16;
    if (left < 16) left = 16;
    if (top + 120 > window.innerHeight - 16) top = Math.max(16, rect.top - 120);
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
    setTimeout(function () {
      input.focus();
      input.select();
    }, 0);
  }

  function commitCellEdit() {
    var id = cellEditState.id;
    var field = cellEditState.field;
    var row = id ? findRowById(id) : null;
    var input = $('cellEditInput');
    if (!row || !input || !field) {
      closeCellEditPop();
      return;
    }
    var raw = (input.value || '').trim();
    if (field === 'campaign_name' || field === 'adgroup_name' || field === 'ad_name') {
      if (!raw) {
        UI.showToast(field === 'ad_name' ? '请输入广告名称' : (field === 'adgroup_name' ? '请输入广告组名称' : '请输入推广系列名称'));
        input.focus();
        return;
      }
      row[field] = raw;
    } else if (field === 'roas_bid') {
      var roasNum = Number(raw);
      if (!raw || !isFinite(roasNum) || roasNum < 0) {
        UI.showToast('请输入有效目标ROAS');
        input.focus();
        return;
      }
      row.roas_bid = Math.round(roasNum * 100) / 100;
      row.deep_bid_type = '目标ROAS';
    } else if (field === 'budget') {
      var num = Number(raw);
      if (!raw || !isFinite(num) || num < 0) {
        UI.showToast('请输入有效预算');
        input.focus();
        return;
      }
      if (row.budget_mode === '不限') row.budget_mode = '日预算';
      row.budget = Math.round(num * 100) / 100;
    }
    closeCellEditPop();
    renderTable();
    UI.showToast('修改成功');
  }

  $('accountTable').addEventListener('pointerover', function (e) {
    var host = e.target.closest('[data-disabled-tip]');
    if (!host || !$('accountTable').contains(host)) return;
    if (host === opFloatTipHost) return;
    showOpFloatTip(host);
  });
  $('accountTable').addEventListener('pointerout', function (e) {
    var host = e.target.closest('[data-disabled-tip]');
    if (!host || !$('accountTable').contains(host)) return;
    var related = e.relatedTarget;
    if (related && host.contains(related)) return;
    if (opFloatTipHost === host) hideOpFloatTip();
  });
  var tableWrapForTip = document.querySelector('#dataPanel .table-wrap');
  if (tableWrapForTip) {
    tableWrapForTip.addEventListener('scroll', hideOpFloatTip);
  }
  window.addEventListener('scroll', hideOpFloatTip, true);

  $('accountTable').addEventListener('click', function (e) {
    var accountLink = e.target.closest('[data-goto-campaign]');
    if (accountLink) {
      e.preventDefault();
      e.stopPropagation();
      openCampaignByAccount(accountLink.getAttribute('data-goto-campaign'));
      return;
    }
    var campaignLink = e.target.closest('[data-goto-adgroup]');
    if (campaignLink) {
      e.preventDefault();
      e.stopPropagation();
      openTabWithKeyword('adgroup', 'campaign', campaignLink.getAttribute('data-goto-adgroup'));
      return;
    }
    var adgroupLink = e.target.closest('[data-goto-ad]');
    if (adgroupLink) {
      e.preventDefault();
      e.stopPropagation();
      openTabWithKeyword('ad', 'adgroup', adgroupLink.getAttribute('data-goto-ad'));
      return;
    }
    var editBtn = e.target.closest('[data-cell-edit]');
    if (editBtn) {
      e.preventDefault();
      e.stopPropagation();
      var tr = editBtn.closest('tr[data-id]');
      var row = tr ? findRowById(tr.getAttribute('data-id')) : null;
      startCellEdit(row, editBtn.getAttribute('data-cell-edit'), editBtn);
      return;
    }
    var copyBtn = e.target.closest('[data-copy]');
    if (copyBtn) {
      UI.copyText(copyBtn.getAttribute('data-copy'));
      return;
    }
    var switchBtn = e.target.closest('[data-row-switch]');
    if (!switchBtn || switchBtn.disabled) return;
    e.preventDefault();
    var rowId = switchBtn.getAttribute('data-row-switch');
    var row = findRowById(rowId);
    if (!row) return;
    var turningOn = !switchBtn.classList.contains('is-on');
    openActionConfirm({
      title: turningOn ? '开启确认' : '暂停确认',
      body: turningOn ? ('确认开启该' + entityLabel() + '吗？') : ('确认暂停该' + entityLabel() + '吗？'),
      danger: false,
      run: function () {
        applyEffectiveStatus([rowId], turningOn ? '投放中' : '已暂停');
        renderTable();
        UI.showToast('提交成功');
      }
    });
  });

  if ($('cellEditOk')) {
    $('cellEditOk').addEventListener('click', function (e) {
      e.stopPropagation();
      commitCellEdit();
    });
  }
  if ($('cellEditCancel')) {
    $('cellEditCancel').addEventListener('click', function (e) {
      e.stopPropagation();
      closeCellEditPop();
    });
  }
  if ($('cellEditInput')) {
    $('cellEditInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitCellEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeCellEditPop();
      }
    });
    $('cellEditInput').addEventListener('click', function (e) { e.stopPropagation(); });
  }
  if ($('cellEditPop')) {
    $('cellEditPop').addEventListener('click', function (e) { e.stopPropagation(); });
  }
  document.addEventListener('click', function (e) {
    if (!$('cellEditPop') || !$('cellEditPop').classList.contains('is-open')) return;
    if (e.target.closest('#cellEditPop') || e.target.closest('[data-cell-edit]')) return;
    closeCellEditPop();
  });

  if ($('selectionClear')) {
    $('selectionClear').addEventListener('click', function (e) {
      e.stopPropagation();
      clearTableSelection();
    });
  }

  var batchMenu = $('batchMenu');
  var batchBtn = $('batchBtn');
  batchBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (batchBtn.disabled) return;
    var open = !batchMenu.classList.contains('is-open');
    UI.closePanels();
    if (open) batchMenu.classList.add('is-open');
  });
  batchMenu.addEventListener('click', function (e) {
    var item = e.target.closest('[data-batch]');
    if (!item) return;
    batchMenu.classList.remove('is-open');
    var action = item.getAttribute('data-batch');
    var ids = currentTab === 'account'
      ? Object.keys(selectedIds).filter(function (id) { return selectedIds[id]; })
      : operableSelectedIds();
    if (!ids.length) return;
    if (action === 'status') {
      batchStatusValue = '启用';
      Array.prototype.forEach.call($('batchStatusSeg').querySelectorAll('.seg__item'), function (btn) {
        btn.classList.toggle('is-active', btn.getAttribute('data-value') === '启用');
      });
      UI.openModal('batchStatusModal');
      return;
    }
    if (action === 'enable') {
      openActionConfirm({
        title: '开启确认',
        body: '确认开启已选' + entityLabel() + '吗？',
        run: function () {
          applyEffectiveStatus(ids, '投放中');
          selectedIds = {};
          renderTable();
          UI.showToast('提交成功');
        }
      });
      return;
    }
    if (action === 'pause') {
      openActionConfirm({
        title: '暂停确认',
        body: '确认暂停已选' + entityLabel() + '吗？',
        run: function () {
          applyEffectiveStatus(ids, '已暂停');
          selectedIds = {};
          renderTable();
          UI.showToast('提交成功');
        }
      });
      return;
    }
    if (action === 'delete') {
      openActionConfirm({
        title: '删除确认',
        body: '确认删除已选' + entityLabel() + '吗？',
        danger: true,
        run: function () {
          applyEffectiveStatus(ids, '已删除');
          selectedIds = {};
          renderTable();
          UI.showToast('提交成功');
        }
      });
      return;
    }
    if (action === 'budget') openBatchBudgetModal();
    if (action === 'bid') openBatchBidModal();
  });

  if ($('actionConfirmOk')) {
    $('actionConfirmOk').addEventListener('click', function () {
      var action = pendingAction;
      pendingAction = null;
      UI.closeModal('actionConfirmModal');
      if (action && typeof action.run === 'function') action.run();
    });
  }
  document.querySelectorAll('[data-close="actionConfirmModal"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      pendingAction = null;
      UI.closeModal('actionConfirmModal');
    });
  });

  function budgetBatchBucket(row) {
    if (!row) return 'locked';
    if (disabledOpTip(row.effective_status) || row.budget_mode === '不限') return 'locked';
    if (row.budget_mode === '总预算') return 'total';
    return 'daily';
  }

  function budgetLockedReason(row) {
    var tip = disabledOpTip(row.effective_status);
    if (tip) return tip;
    if (row.budget_mode === '不限') return '不限预算不可编辑';
    return '无法修改';
  }

  function formatBudgetMoney(n) {
    var num = Number(n);
    if (!isFinite(num)) return '-';
    return formatNumber(num, 2);
  }

  function batchBudgetEmptySvg() {
    return '<svg class="budget-batch-empty__icon" viewBox="0 0 72 72" fill="none" aria-hidden="true">' +
      '<circle cx="36" cy="36" r="28" stroke="currentColor" stroke-width="2" opacity="0.45"/>' +
      '<circle cx="36" cy="26" r="10" stroke="currentColor" stroke-width="2" opacity="0.7"/>' +
      '<path d="M36 40c-8 0-14 4-16 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.7"/>' +
      '<circle cx="52" cy="18" r="3" fill="currentColor" opacity="0.35"/>' +
      '<circle cx="18" cy="48" r="2.5" fill="currentColor" opacity="0.3"/>' +
      '</svg>';
  }

  function batchBudgetSelectedRows() {
    var idMap = {};
    Object.keys(selectedIds).forEach(function (id) {
      if (selectedIds[id]) idMap[id] = true;
    });
    return rows.filter(function (row) {
      return idMap[row.id] && !isDeletedEntity(row);
    });
  }

  function batchBudgetRowsByTab(tab) {
    return batchBudgetState.rows.filter(function (row) {
      return budgetBatchBucket(row) === tab;
    });
  }

  function batchBudgetModeLabel(tab, mode) {
    var prefix = tab === 'total' ? '总预算' : '日预算';
    if (mode === 'inc') return prefix + ' 增加';
    if (mode === 'dec') return prefix + ' 减少';
    return prefix + ' 设为';
  }

  function batchBudgetModeOptions(tab) {
    return [
      { value: 'set', label: batchBudgetModeLabel(tab, 'set') },
      { value: 'inc', label: batchBudgetModeLabel(tab, 'inc') },
      { value: 'dec', label: batchBudgetModeLabel(tab, 'dec') }
    ];
  }

  function calcBatchBudgetNext(current, mode, unit, amount) {
    var base = Number(current) || 0;
    var next = base;
    if (mode === 'set') next = amount;
    else if (mode === 'inc') next = unit === '%' ? base * (1 + amount / 100) : base + amount;
    else if (mode === 'dec') next = unit === '%' ? base * (1 - amount / 100) : base - amount;
    if (!isFinite(next) || next < 0) next = 0;
    return Math.round(next * 100) / 100;
  }

  function batchBudgetChangedCount() {
    var count = 0;
    batchBudgetState.rows.forEach(function (row) {
      if (budgetBatchBucket(row) === 'locked') return;
      var raw = String(batchBudgetState.drafts[row.id] == null ? '' : batchBudgetState.drafts[row.id]).trim();
      if (!raw) return;
      var num = Number(raw);
      if (!isFinite(num) || num < 0) return;
      if (Math.round(num * 100) / 100 === Math.round((Number(row.budget) || 0) * 100) / 100) return;
      count += 1;
    });
    return count;
  }

  function batchEntityNoun() {
    return currentTab === 'adgroup' ? '广告组' : '推广系列';
  }

  function batchEntityName(row) {
    if (!row) return '';
    return currentTab === 'adgroup' ? (row.adgroup_name || '') : (row.campaign_name || '');
  }

  function syncBatchBudgetFooter() {
    var count = batchBudgetChangedCount();
    if ($('batchBudgetChanged')) $('batchBudgetChanged').textContent = '已修改 ' + count + ' 个' + batchEntityNoun();
    if ($('batchBudgetSubmit')) $('batchBudgetSubmit').disabled = count <= 0;
  }

  function batchBudgetSelectHtml(kind, tab, value, options) {
    var label = value;
    options.forEach(function (opt) {
      if (opt.value === value) label = opt.label;
    });
    return '<div class="page-size-wrap budget-batch-select" data-budget-select="' + kind + '" data-budget-tab-key="' + tab + '">' +
      '<button class="select-trigger" type="button" data-budget-select-trigger="' + kind + '">' +
        '<span class="select-trigger__text">' + escapeHtml(label) + '</span>' +
        '<svg class="select-trigger__arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg>' +
      '</button>' +
      '<div class="single-panel">' +
        options.map(function (opt) {
          return '<div class="single-option' + (opt.value === value ? ' is-active' : '') + '" data-budget-option="' + escapeHtml(opt.value) + '">' +
            escapeHtml(opt.label) +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  function renderBatchBudgetBulk(tab) {
    var mode = batchBudgetState.modes[tab] || 'set';
    var unit = batchBudgetState.units[tab] || 'USD';
    var bulkVal = batchBudgetState.bulkValues[tab] || '';
    var appendHtml = mode === 'set'
      ? '<span class="input-compound__append">USD</span>'
      : '<div class="input-compound__append input-compound__append--select">' +
          batchBudgetSelectHtml('unit', tab, unit, [
            { value: 'USD', label: 'USD' },
            { value: '%', label: '%' }
          ]) +
        '</div>';
    return '<div class="budget-batch-bulk">' +
      batchBudgetSelectHtml('mode', tab, mode, batchBudgetModeOptions(tab)) +
      '<div class="input-compound budget-batch-bulk__value">' +
        '<input class="input input-compound__input" type="text" inputmode="decimal" placeholder="请输入" autocomplete="off" ' +
          'data-budget-bulk="' + tab + '" value="' + escapeHtml(bulkVal) + '" />' +
        appendHtml +
      '</div>' +
      '<button class="btn btn--primary" type="button" data-budget-apply="' + tab + '">全部应用</button>' +
    '</div>';
  }

  function renderBatchBudgetEditablePanel(tab) {
    var panel = document.querySelector('[data-budget-panel="' + tab + '"]');
    if (!panel) return;
    var list = batchBudgetRowsByTab(tab);
    var modeLabel = tab === 'total' ? '总预算' : '日预算';
    if (!list.length) {
      panel.innerHTML =
        '<div class="budget-batch-empty">' +
          batchBudgetEmptySvg() +
          '<div>您选择的' + batchEntityNoun() + '均未使用' + modeLabel + '。</div>' +
        '</div>';
      return;
    }
    var rowsHtml = list.map(function (row) {
      var draft = batchBudgetState.drafts[row.id];
      var value = draft == null ? '' : String(draft);
      var spendText = formatByKind(Number(row.spend) || 0, 'money');
      var budgetText = formatBudgetMoney(row.budget);
      return '<tr data-budget-row="' + escapeHtml(row.id) + '">' +
        '<td><span class="budget-batch-name" title="' + escapeHtml(batchEntityName(row)) + '">' + escapeHtml(batchEntityName(row) || '-') + '</span></td>' +
        '<td class="is-num">' + escapeHtml(spendText) + '</td>' +
        '<td class="is-num">' + escapeHtml(budgetText) + '</td>' +
        '<td><div class="input-compound budget-batch-new">' +
          '<input class="input input-compound__input" type="text" inputmode="decimal" placeholder="请输入" autocomplete="off" ' +
            'data-budget-new="' + escapeHtml(row.id) + '" value="' + escapeHtml(value) + '" />' +
          '<span class="input-compound__append">USD</span>' +
        '</div></td>' +
      '</tr>';
    }).join('');
    panel.innerHTML =
      renderBatchBudgetBulk(tab) +
      '<div class="budget-batch-table-wrap">' +
        '<table class="budget-batch-table">' +
          '<colgroup>' +
            '<col class="col-name" />' +
            '<col class="col-spend" />' +
            '<col class="col-budget" />' +
            '<col class="col-new" />' +
          '</colgroup>' +
          '<thead><tr>' +
            '<th>' + batchEntityNoun() + '名称</th><th class="is-num">消耗</th><th class="is-num">预算</th><th>新预算</th>' +
          '</tr></thead>' +
          '<tbody>' + rowsHtml + '</tbody>' +
        '</table>' +
      '</div>';
  }

  function renderBatchBudgetLockedPanel() {
    var panel = $('batchBudgetPanelLocked');
    if (!panel) return;
    var list = batchBudgetRowsByTab('locked');
    if (!list.length) {
      panel.innerHTML =
        '<div class="budget-batch-empty">' +
          batchBudgetEmptySvg() +
          '<div>没有无法修改的' + batchEntityNoun() + '。</div>' +
        '</div>';
      return;
    }
    var rowsHtml = list.map(function (row) {
      var spendText = formatByKind(Number(row.spend) || 0, 'money');
      var budgetText = row.budget_mode === '不限' ? ' - ' : formatBudgetMoney(row.budget);
      return '<tr>' +
        '<td><span class="budget-batch-name" title="' + escapeHtml(batchEntityName(row)) + '">' + escapeHtml(batchEntityName(row) || '-') + '</span></td>' +
        '<td class="is-num">' + escapeHtml(spendText) + '</td>' +
        '<td class="is-num">' + escapeHtml(budgetText) + '</td>' +
        '<td>' + escapeHtml(budgetLockedReason(row)) + '</td>' +
      '</tr>';
    }).join('');
    panel.innerHTML =
      '<div class="budget-batch-table-wrap">' +
        '<table class="budget-batch-table">' +
          '<colgroup>' +
            '<col class="col-name" />' +
            '<col class="col-spend" />' +
            '<col class="col-budget" />' +
            '<col class="col-reason" />' +
          '</colgroup>' +
          '<thead><tr>' +
            '<th>' + batchEntityNoun() + '名称</th><th class="is-num">消耗</th><th class="is-num">预算</th><th>原因</th>' +
          '</tr></thead>' +
          '<tbody>' + rowsHtml + '</tbody>' +
        '</table>' +
      '</div>';
  }

  function setBatchBudgetTab(tab) {
    batchBudgetState.tab = tab;
    document.querySelectorAll('#batchBudgetTabs [data-budget-tab]').forEach(function (btn) {
      var active = btn.getAttribute('data-budget-tab') === tab;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    document.querySelectorAll('[data-budget-panel]').forEach(function (panel) {
      var active = panel.getAttribute('data-budget-panel') === tab;
      panel.classList.toggle('is-active', active);
      if (active) panel.removeAttribute('hidden');
      else panel.setAttribute('hidden', '');
    });
    if (UI.closePanels) UI.closePanels();
  }

  function renderBatchBudgetModal() {
    renderBatchBudgetEditablePanel('daily');
    renderBatchBudgetEditablePanel('total');
    renderBatchBudgetLockedPanel();
    setBatchBudgetTab(batchBudgetState.tab);
    syncBatchBudgetFooter();
  }

  function openBatchBudgetModal() {
    batchBudgetState.rows = batchBudgetSelectedRows();
    batchBudgetState.drafts = {};
    batchBudgetState.modes = { daily: 'set', total: 'set' };
    batchBudgetState.units = { daily: 'USD', total: 'USD' };
    batchBudgetState.bulkValues = { daily: '', total: '' };
    var order = ['daily', 'total', 'locked'];
    var first = 'daily';
    for (var i = 0; i < order.length; i++) {
      if (batchBudgetRowsByTab(order[i]).length) {
        first = order[i];
        break;
      }
    }
    batchBudgetState.tab = first;
    renderBatchBudgetModal();
    UI.openModal('batchBudgetModal');
  }

  if ($('batchBudgetTabs')) {
    $('batchBudgetTabs').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-budget-tab]');
      if (!btn) return;
      setBatchBudgetTab(btn.getAttribute('data-budget-tab'));
    });
  }

  if ($('batchBudgetModal')) {
    $('batchBudgetModal').addEventListener('click', function (e) {
      var option = e.target.closest('[data-budget-option]');
      if (option) {
        var wrap = option.closest('[data-budget-select]');
        if (!wrap || !$('batchBudgetModal').contains(wrap)) return;
        var kind = wrap.getAttribute('data-budget-select');
        var tabKey = wrap.getAttribute('data-budget-tab-key');
        var value = option.getAttribute('data-budget-option');
        if (kind === 'mode') {
          batchBudgetState.modes[tabKey] = value;
          if (value === 'set') batchBudgetState.units[tabKey] = 'USD';
        } else if (kind === 'unit') {
          batchBudgetState.units[tabKey] = value;
        }
        if (UI.closePanels) UI.closePanels();
        renderBatchBudgetEditablePanel(tabKey);
        syncBatchBudgetFooter();
        return;
      }

      var selectTrigger = e.target.closest('[data-budget-select-trigger]');
      if (selectTrigger) {
        e.stopPropagation();
        var selectWrap = selectTrigger.closest('.budget-batch-select');
        var panel = selectWrap && selectWrap.querySelector('.single-panel');
        if (!panel) return;
        var open = !panel.classList.contains('is-open');
        if (UI.closePanels) UI.closePanels();
        if (open) panel.classList.add('is-open');
        return;
      }

      var applyBtn = e.target.closest('[data-budget-apply]');
      if (applyBtn) {
        var tab = applyBtn.getAttribute('data-budget-apply');
        var bulk = document.querySelector('[data-budget-bulk="' + tab + '"]');
        var raw = ((bulk && bulk.value) || '').trim();
        var num = Number(raw);
        if (!raw || !isFinite(num) || num < 0) {
          UI.showToast('请输入有效数值');
          return;
        }
        batchBudgetState.bulkValues[tab] = raw;
        var mode = batchBudgetState.modes[tab] || 'set';
        var unit = batchBudgetState.units[tab] || 'USD';
        batchBudgetRowsByTab(tab).forEach(function (row) {
          batchBudgetState.drafts[row.id] = String(calcBatchBudgetNext(row.budget, mode, unit, num));
        });
        renderBatchBudgetEditablePanel(tab);
        syncBatchBudgetFooter();
        return;
      }
    });
    $('batchBudgetModal').addEventListener('input', function (e) {
      var bulkInput = e.target.closest('[data-budget-bulk]');
      if (bulkInput) {
        batchBudgetState.bulkValues[bulkInput.getAttribute('data-budget-bulk')] = bulkInput.value;
        return;
      }
      var input = e.target.closest('[data-budget-new]');
      if (!input) return;
      var id = input.getAttribute('data-budget-new');
      batchBudgetState.drafts[id] = input.value;
      syncBatchBudgetFooter();
    });
  }

  if ($('batchBudgetSubmit')) {
    $('batchBudgetSubmit').addEventListener('click', function () {
      if (batchBudgetChangedCount() <= 0) return;
      var appliedCount = 0;
      batchBudgetState.rows.forEach(function (snap) {
        if (budgetBatchBucket(snap) === 'locked') return;
        var raw = String(batchBudgetState.drafts[snap.id] == null ? '' : batchBudgetState.drafts[snap.id]).trim();
        if (!raw) return;
        var num = Number(raw);
        if (!isFinite(num) || num < 0) return;
        var next = Math.round(num * 100) / 100;
        if (next === Math.round((Number(snap.budget) || 0) * 100) / 100) return;
        var target = rows.find(function (row) { return row.id === snap.id; });
        if (!target) return;
        target.budget = next;
        appliedCount += 1;
      });
      if (!appliedCount) return;
      selectedIds = {};
      UI.closeModal('batchBudgetModal');
      UI.showToast('提交成功');
      renderTable();
    });
  }
  document.querySelectorAll('[data-close="batchBudgetModal"]').forEach(function (btn) {
    btn.addEventListener('click', function () { UI.closeModal('batchBudgetModal'); });
  });

  function bidBatchBucket(row) {
    if (!row) return 'locked';
    if (row.deep_bid_type === '目标ROAS') return 'roas';
    return 'locked';
  }

  function bidLockedReason() {
    return '最高价值不支持设置出价';
  }

  function batchBidRowsByTab(tab) {
    return batchBidState.rows.filter(function (row) {
      return bidBatchBucket(row) === tab;
    });
  }

  function batchBidModeLabel(mode) {
    if (mode === 'inc') return '目标ROAS 增加';
    if (mode === 'dec') return '目标ROAS 减少';
    return '目标ROAS 设为';
  }

  function batchBidChangedCount() {
    var count = 0;
    batchBidState.rows.forEach(function (row) {
      if (bidBatchBucket(row) !== 'roas') return;
      var raw = String(batchBidState.drafts[row.id] == null ? '' : batchBidState.drafts[row.id]).trim();
      if (!raw) return;
      var num = Number(raw);
      if (!isFinite(num) || num < 0) return;
      if (Math.round(num * 100) / 100 === Math.round((Number(row.roas_bid) || 0) * 100) / 100) return;
      count += 1;
    });
    return count;
  }

  function syncBatchBidFooter() {
    var count = batchBidChangedCount();
    if ($('batchBidChanged')) $('batchBidChanged').textContent = '已修改 ' + count + ' 个广告组';
    if ($('batchBidSubmit')) $('batchBidSubmit').disabled = count <= 0;
  }

  function batchBidSelectHtml(kind, value, options) {
    var label = value;
    options.forEach(function (opt) {
      if (opt.value === value) label = opt.label;
    });
    return '<div class="page-size-wrap budget-batch-select" data-bid-select="' + kind + '">' +
      '<button class="select-trigger" type="button" data-bid-select-trigger="' + kind + '">' +
        '<span class="select-trigger__text">' + escapeHtml(label) + '</span>' +
        '<svg class="select-trigger__arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg>' +
      '</button>' +
      '<div class="single-panel">' +
        options.map(function (opt) {
          return '<div class="single-option' + (opt.value === value ? ' is-active' : '') + '" data-bid-option="' + escapeHtml(opt.value) + '">' +
            escapeHtml(opt.label) +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  function renderBatchBidBulk() {
    var mode = batchBidState.modes.roas || 'set';
    var unit = batchBidState.units.roas || 'num';
    var bulkVal = batchBidState.bulkValues.roas || '';
    var valueHtml = mode === 'set'
      ? '<input class="input budget-batch-roas-input" type="text" inputmode="decimal" placeholder="请输入" autocomplete="off" ' +
          'data-bid-bulk="roas" value="' + escapeHtml(bulkVal) + '" />'
      : '<div class="input-compound budget-batch-bulk__value">' +
          '<input class="input input-compound__input" type="text" inputmode="decimal" placeholder="请输入" autocomplete="off" ' +
            'data-bid-bulk="roas" value="' + escapeHtml(bulkVal) + '" />' +
          '<div class="input-compound__append input-compound__append--select">' +
            batchBidSelectHtml('unit', unit, [
              { value: 'num', label: '数值' },
              { value: '%', label: '%' }
            ]) +
          '</div>' +
        '</div>';
    return '<div class="budget-batch-bulk">' +
      batchBidSelectHtml('mode', mode, [
        { value: 'set', label: batchBidModeLabel('set') },
        { value: 'inc', label: batchBidModeLabel('inc') },
        { value: 'dec', label: batchBidModeLabel('dec') }
      ]) +
      valueHtml +
      '<button class="btn btn--primary" type="button" data-bid-apply="roas">全部应用</button>' +
    '</div>';
  }

  function renderBatchBidRoasPanel() {
    var panel = $('batchBidPanelRoas');
    if (!panel) return;
    var list = batchBidRowsByTab('roas');
    if (!list.length) {
      panel.innerHTML =
        '<div class="budget-batch-empty">' +
          batchBudgetEmptySvg() +
          '<div>您选择的广告组均未使用目标ROAS。</div>' +
        '</div>';
      return;
    }
    var rowsHtml = list.map(function (row) {
      var draft = batchBidState.drafts[row.id];
      var value = draft == null ? '' : String(draft);
      var spendText = formatByKind(Number(row.spend) || 0, 'money');
      var roasText = formatBudgetMoney(row.roas_bid);
      var name = row.adgroup_name || '';
      return '<tr>' +
        '<td><span class="budget-batch-name" title="' + escapeHtml(name) + '">' + escapeHtml(name || '-') + '</span></td>' +
        '<td class="is-num">' + escapeHtml(spendText) + '</td>' +
        '<td class="is-num">' + escapeHtml(roasText) + '</td>' +
        '<td><input class="input budget-batch-roas-input" type="text" inputmode="decimal" placeholder="请输入" autocomplete="off" ' +
          'data-bid-new="' + escapeHtml(row.id) + '" value="' + escapeHtml(value) + '" /></td>' +
      '</tr>';
    }).join('');
    panel.innerHTML =
      renderBatchBidBulk() +
      '<div class="budget-batch-table-wrap">' +
        '<table class="budget-batch-table">' +
          '<colgroup>' +
            '<col class="col-name" />' +
            '<col class="col-spend" />' +
            '<col class="col-budget" />' +
            '<col class="col-new" />' +
          '</colgroup>' +
          '<thead><tr>' +
            '<th>广告组名称</th><th class="is-num">消耗</th><th class="is-num">目标ROAS</th><th>新目标ROAS</th>' +
          '</tr></thead>' +
          '<tbody>' + rowsHtml + '</tbody>' +
        '</table>' +
      '</div>';
  }

  function renderBatchBidLockedPanel() {
    var panel = $('batchBidPanelLocked');
    if (!panel) return;
    var list = batchBidRowsByTab('locked');
    if (!list.length) {
      panel.innerHTML =
        '<div class="budget-batch-empty">' +
          batchBudgetEmptySvg() +
          '<div>没有无法修改的广告组。</div>' +
        '</div>';
      return;
    }
    var rowsHtml = list.map(function (row) {
      var name = row.adgroup_name || '';
      return '<tr>' +
        '<td><span class="budget-batch-name" title="' + escapeHtml(name) + '">' + escapeHtml(name || '-') + '</span></td>' +
        '<td>' + escapeHtml(row.deep_bid_type || '-') + '</td>' +
        '<td>' + escapeHtml(bidLockedReason()) + '</td>' +
      '</tr>';
    }).join('');
    panel.innerHTML =
      '<div class="budget-batch-table-wrap">' +
        '<table class="budget-batch-table">' +
          '<colgroup><col class="col-name" /><col class="col-strategy" /><col class="col-reason" /></colgroup>' +
          '<thead><tr><th>广告组名称</th><th>出价策略</th><th>原因</th></tr></thead>' +
          '<tbody>' + rowsHtml + '</tbody>' +
        '</table>' +
      '</div>';
  }

  function setBatchBidTab(tab) {
    batchBidState.tab = tab;
    document.querySelectorAll('#batchBidTabs [data-bid-tab]').forEach(function (btn) {
      var active = btn.getAttribute('data-bid-tab') === tab;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    document.querySelectorAll('[data-bid-panel]').forEach(function (panel) {
      var active = panel.getAttribute('data-bid-panel') === tab;
      panel.classList.toggle('is-active', active);
      if (active) panel.removeAttribute('hidden');
      else panel.setAttribute('hidden', '');
    });
    if (UI.closePanels) UI.closePanels();
  }

  function renderBatchBidModal() {
    renderBatchBidRoasPanel();
    renderBatchBidLockedPanel();
    setBatchBidTab(batchBidState.tab);
    syncBatchBidFooter();
  }

  function openBatchBidModal() {
    batchBidState.rows = batchBudgetSelectedRows();
    batchBidState.drafts = {};
    batchBidState.modes = { roas: 'set' };
    batchBidState.units = { roas: 'num' };
    batchBidState.bulkValues = { roas: '' };
    var order = ['roas', 'locked'];
    var first = 'roas';
    for (var i = 0; i < order.length; i++) {
      if (batchBidRowsByTab(order[i]).length) {
        first = order[i];
        break;
      }
    }
    batchBidState.tab = first;
    renderBatchBidModal();
    UI.openModal('batchBidModal');
  }

  if ($('batchBidTabs')) {
    $('batchBidTabs').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-bid-tab]');
      if (!btn) return;
      setBatchBidTab(btn.getAttribute('data-bid-tab'));
    });
  }

  if ($('batchBidModal')) {
    $('batchBidModal').addEventListener('click', function (e) {
      var option = e.target.closest('[data-bid-option]');
      if (option) {
        var wrap = option.closest('[data-bid-select]');
        if (!wrap || !$('batchBidModal').contains(wrap)) return;
        var kind = wrap.getAttribute('data-bid-select');
        var value = option.getAttribute('data-bid-option');
        if (kind === 'mode') {
          batchBidState.modes.roas = value;
          if (value === 'set') batchBidState.units.roas = 'num';
        } else if (kind === 'unit') {
          batchBidState.units.roas = value;
        }
        if (UI.closePanels) UI.closePanels();
        renderBatchBidRoasPanel();
        syncBatchBidFooter();
        return;
      }
      var selectTrigger = e.target.closest('[data-bid-select-trigger]');
      if (selectTrigger) {
        e.stopPropagation();
        var selectWrap = selectTrigger.closest('.budget-batch-select');
        var panel = selectWrap && selectWrap.querySelector('.single-panel');
        if (!panel) return;
        var open = !panel.classList.contains('is-open');
        if (UI.closePanels) UI.closePanels();
        if (open) panel.classList.add('is-open');
        return;
      }
      var applyBtn = e.target.closest('[data-bid-apply]');
      if (applyBtn) {
        var bulk = document.querySelector('[data-bid-bulk="roas"]');
        var raw = ((bulk && bulk.value) || '').trim();
        var num = Number(raw);
        if (!raw || !isFinite(num) || num < 0) {
          UI.showToast('请输入有效数值');
          return;
        }
        batchBidState.bulkValues.roas = raw;
        var mode = batchBidState.modes.roas || 'set';
        var unit = mode === 'set' ? 'num' : (batchBidState.units.roas || 'num');
        batchBidRowsByTab('roas').forEach(function (row) {
          batchBidState.drafts[row.id] = String(calcBatchBudgetNext(row.roas_bid, mode, unit === '%' ? '%' : 'USD', num));
        });
        renderBatchBidRoasPanel();
        syncBatchBidFooter();
      }
    });
    $('batchBidModal').addEventListener('input', function (e) {
      var bulkInput = e.target.closest('[data-bid-bulk]');
      if (bulkInput) {
        batchBidState.bulkValues.roas = bulkInput.value;
        return;
      }
      var input = e.target.closest('[data-bid-new]');
      if (!input) return;
      batchBidState.drafts[input.getAttribute('data-bid-new')] = input.value;
      syncBatchBidFooter();
    });
  }

  if ($('batchBidSubmit')) {
    $('batchBidSubmit').addEventListener('click', function () {
      if (batchBidChangedCount() <= 0) return;
      var appliedCount = 0;
      batchBidState.rows.forEach(function (snap) {
        if (bidBatchBucket(snap) !== 'roas') return;
        var raw = String(batchBidState.drafts[snap.id] == null ? '' : batchBidState.drafts[snap.id]).trim();
        if (!raw) return;
        var num = Number(raw);
        if (!isFinite(num) || num < 0) return;
        var next = Math.round(num * 100) / 100;
        if (next === Math.round((Number(snap.roas_bid) || 0) * 100) / 100) return;
        var target = rows.find(function (row) { return row.id === snap.id; });
        if (!target) return;
        target.roas_bid = next;
        target.deep_bid_type = '目标ROAS';
        appliedCount += 1;
      });
      if (!appliedCount) return;
      selectedIds = {};
      UI.closeModal('batchBidModal');
      UI.showToast('提交成功');
      renderTable();
    });
  }
  document.querySelectorAll('[data-close="batchBidModal"]').forEach(function (btn) {
    btn.addEventListener('click', function () { UI.closeModal('batchBidModal'); });
  });

  $('batchStatusSeg').addEventListener('click', function (e) {
    var btn = e.target.closest('.seg__item');
    if (!btn) return;
    batchStatusValue = btn.getAttribute('data-value');
    Array.prototype.forEach.call($('batchStatusSeg').querySelectorAll('.seg__item'), function (el) {
      el.classList.toggle('is-active', el === btn);
    });
  });

  $('batchStatusSubmit').addEventListener('click', function () {
    var ids = currentTab === 'account'
      ? Object.keys(selectedIds).filter(function (id) { return selectedIds[id]; })
      : operableSelectedIds();
    if (!ids.length) {
      UI.closeModal('batchStatusModal');
      return;
    }
    rows.forEach(function (row) {
      if (ids.indexOf(row.id) >= 0) row.status = batchStatusValue;
    });
    selectedIds = {};
    UI.closeModal('batchStatusModal');
    UI.showToast('提交成功');
    renderTable();
  });
  document.querySelectorAll('[data-close="batchStatusModal"]').forEach(function (btn) {
    btn.addEventListener('click', function () { UI.closeModal('batchStatusModal'); });
  });

  function closeOpMenus() {
    document.querySelectorAll('.metric-filter__op.is-open').forEach(function (el) {
      el.classList.remove('is-open');
    });
  }

  function closeMetricPops() {
    closeOpMenus();
    var filterPop = document.getElementById('metricFilterPop');
    var colorPop = document.getElementById('metricColorPop');
    if (filterPop) filterPop.hidden = true;
    if (colorPop) colorPop.hidden = true;
    metricPop.kind = '';
    metricPop.key = '';
  }

  function placeMetricPop(pop, anchor) {
    pop.hidden = false;
    var rect = anchor.getBoundingClientRect();
    var width = pop.offsetWidth;
    var height = pop.offsetHeight;
    var left = Math.round(rect.left + (rect.width - width) / 2);
    var top = Math.round(rect.bottom + 4);
    var maxLeft = window.innerWidth - width - 8;
    if (left > maxLeft) left = Math.max(8, maxLeft);
    if (left < 8) left = 8;
    if (top + height > window.innerHeight - 8) top = Math.max(8, Math.round(rect.top - height - 4));
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  }

  function renderFilterRows(conds) {
    var list = document.getElementById('metricFilterList');
    if (!list) return;
    var cond = (conds && conds[0]) || { op: 'gt', value: '' };
    var op = cond.op || 'gt';
    var menu = METRIC_FILTER_OPS.map(function (item) {
      return '<button type="button" class="metric-filter__op-item' + (item.id === op ? ' is-on' : '') + '" data-op-pick="' + item.id + '">' + item.label + '</button>';
    }).join('');
    list.innerHTML = '<div class="metric-filter__row" data-op="' + op + '">' +
      '<div class="metric-filter__op">' +
        '<button type="button" class="metric-filter__op-btn" data-op-toggle>' + metricOpLabel(op) + '</button>' +
        '<div class="metric-filter__op-menu">' + menu + '</div>' +
      '</div>' +
      '<div class="metric-filter__num">' +
        '<input class="input" type="text" inputmode="decimal" autocomplete="off" value="' + escapeHtml(cond.value == null ? '' : String(cond.value)) + '" />' +
        '<span class="metric-filter__step">' +
          '<button type="button" data-step="1" aria-label="增加"></button>' +
          '<button type="button" data-step="-1" aria-label="减少"></button>' +
        '</span>' +
      '</div>' +
    '</div>';
  }

  function ensureMetricPops() {
    if (document.getElementById('metricFilterPop')) return;
    var filter = document.createElement('div');
    filter.id = 'metricFilterPop';
    filter.className = 'metric-pop metric-filter';
    filter.hidden = true;
    filter.innerHTML =
      '<div class="metric-filter__title">显示符合以下条件的行</div>' +
      '<div class="metric-filter__list" id="metricFilterList"></div>' +
      '<div class="metric-filter__foot">' +
        '<button type="button" class="btn btn--text" id="metricFilterReset">重置</button>' +
        '<button type="button" class="btn btn--primary" id="metricFilterApply">应用</button>' +
      '</div>';
    var color = document.createElement('div');
    color.id = 'metricColorPop';
    color.className = 'metric-pop metric-color';
    color.hidden = true;
    color.innerHTML =
      '<button type="button" class="metric-color__none" data-heat="">无热图</button>' +
      '<div class="metric-color__grid">' +
        METRIC_HEAT_COLORS.map(function (item) {
          return '<button type="button" class="metric-color__swatch" data-heat="' + item.id + '" aria-label="' + item.name + '" style="--heat-color:var(' + item.token + ')"></button>';
        }).join('') +
      '</div>';
    document.body.appendChild(filter);
    document.body.appendChild(color);
    filter.addEventListener('click', onFilterPopClick);
    color.addEventListener('click', onColorPopClick);
  }

  function openMetricFilter(key, anchor) {
    ensureMetricPops();
    var same = metricPop.kind === 'filter' && metricPop.key === key;
    closeMetricPops();
    if (same || !key) return;
    var saved = metricFilters[key];
    var first = saved && saved[0];
    renderFilterRows(first ? [{ op: first.op, value: first.value }] : [{ op: 'gt', value: '' }]);
    metricPop.kind = 'filter';
    metricPop.key = key;
    placeMetricPop(document.getElementById('metricFilterPop'), anchor);
  }

  function openMetricColor(key, anchor) {
    ensureMetricPops();
    var same = metricPop.kind === 'color' && metricPop.key === key;
    closeMetricPops();
    if (same || !key) return;
    var current = metricColors[key] || '';
    var pop = document.getElementById('metricColorPop');
    pop.querySelectorAll('[data-heat]').forEach(function (btn) {
      btn.classList.toggle('is-on', (btn.getAttribute('data-heat') || '') === current);
    });
    metricPop.kind = 'color';
    metricPop.key = key;
    placeMetricPop(pop, anchor);
  }

  function applyMetricFilterFromPop() {
    var key = metricPop.key;
    var list = document.getElementById('metricFilterList');
    if (!key || !list) return;
    var conds = [];
    var invalid = false;
    Array.prototype.forEach.call(list.querySelectorAll('.metric-filter__row'), function (row) {
      var input = row.querySelector('input');
      var value = (input.value || '').trim();
      input.classList.remove('is-error');
      if (value === '') return;
      if (!isFinite(Number(value))) {
        input.classList.add('is-error');
        invalid = true;
      return;
    }
      conds.push({ op: row.getAttribute('data-op') || 'gt', value: value });
    });
    if (invalid) return;
    if (conds.length) metricFilters[key] = conds;
    else delete metricFilters[key];
    page = 1;
    renderTable();
  }

  function onFilterPopClick(e) {
    var toggle = e.target.closest('[data-op-toggle]');
    if (toggle) {
      e.preventDefault();
      var wrap = toggle.closest('.metric-filter__op');
      var open = wrap.classList.contains('is-open');
      closeOpMenus();
      if (!open) wrap.classList.add('is-open');
      return;
    }
    var pick = e.target.closest('[data-op-pick]');
    if (pick) {
      e.preventDefault();
      var row = pick.closest('.metric-filter__row');
      var op = pick.getAttribute('data-op-pick');
      row.setAttribute('data-op', op);
      var labelBtn = row.querySelector('[data-op-toggle]');
      if (labelBtn) labelBtn.textContent = metricOpLabel(op);
      row.querySelectorAll('[data-op-pick]').forEach(function (item) {
        item.classList.toggle('is-on', item.getAttribute('data-op-pick') === op);
      });
      closeOpMenus();
      return;
    }
    var stepBtn = e.target.closest('[data-step]');
    if (stepBtn) {
      e.preventDefault();
      var input = stepBtn.closest('.metric-filter__num').querySelector('input');
      var cur = input.value.trim() === '' ? 0 : Number(input.value);
      if (!isFinite(cur)) cur = 0;
      input.value = String(Math.round((cur + Number(stepBtn.getAttribute('data-step'))) * 10000) / 10000);
      input.classList.remove('is-error');
      return;
    }
    if (e.target.closest('#metricFilterReset')) {
      e.preventDefault();
      if (metricPop.key) delete metricFilters[metricPop.key];
      page = 1;
      renderTable();
      return;
    }
    if (e.target.closest('#metricFilterApply')) {
      e.preventDefault();
      applyMetricFilterFromPop();
    }
  }

  function onColorPopClick(e) {
    var btn = e.target.closest('[data-heat]');
    if (!btn || !metricPop.key) return;
    e.preventDefault();
    var id = btn.getAttribute('data-heat') || '';
    if (id) metricColors[metricPop.key] = id;
    else delete metricColors[metricPop.key];
    renderTable();
  }

  function setDataFullscreen(on) {
    var panel = $('dataPanel');
    var btn = $('fullscreenBtn');
    var tip = $('fullscreenTip');
    if (!panel) return;
    var enable = !!on;
    panel.classList.toggle('is-fullscreen', enable);
    document.body.classList.toggle('promo-fs-open', enable);
    var label = enable ? '退出全屏' : '全屏';
    if (btn) btn.setAttribute('aria-label', label);
    if (tip) tip.setAttribute('data-tip', label);
    if (window.ColResize && $('accountTable')) {
      try { ColResize.refresh($('accountTable'), { onLayout: syncFreezeLeft }); } catch (err) { /* ignore */ }
    }
  }

  $('refreshBtn').addEventListener('click', function () {
    applyQuery();
    UI.showToast('已刷新');
  });

  $('fullscreenBtn').addEventListener('click', function () {
    var panel = $('dataPanel');
    if (!panel) return;
    setDataFullscreen(!panel.classList.contains('is-fullscreen'));
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && $('dataPanel') && $('dataPanel').classList.contains('is-fullscreen')) {
      setDataFullscreen(false);
    }
    if (e.key === 'Escape' && metricPop.kind) closeMetricPops();
  });

  $('tableHead').addEventListener('click', function (e) {
    var filterBtn = e.target.closest('[data-metric-filter]');
    if (filterBtn) {
      e.preventDefault();
      e.stopPropagation();
      openMetricFilter(filterBtn.getAttribute('data-metric-filter'), filterBtn);
      return;
    }
    var colorBtn = e.target.closest('[data-metric-color]');
    if (colorBtn) {
      e.preventDefault();
      e.stopPropagation();
      openMetricColor(colorBtn.getAttribute('data-metric-color'), colorBtn);
    }
  });

  document.addEventListener('click', function (e) {
    if (!metricPop.kind) return;
    if (e.target.closest('.metric-pop')) {
      if (!e.target.closest('.metric-filter__op')) closeOpMenus();
      return;
    }
    if (e.target.closest('[data-metric-filter], [data-metric-color]')) return;
    closeMetricPops();
  });

  var tableWrap = document.querySelector('#dataPanel .table-wrap');
  if (tableWrap) {
    tableWrap.addEventListener('scroll', function () {
      if (metricPop.kind) closeMetricPops();
    });
  }

  var promoTabs = $('promoTabs');
  if (promoTabs) {
    promoTabs.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-promo-tab]');
      if (!btn || btn.disabled) return;
      switchPromoTab(btn.getAttribute('data-promo-tab'));
    });
  }

  syncOptionalVisibility();
  syncBatchMenu();
  applyQuery();
  consumePendingToast();
})();
