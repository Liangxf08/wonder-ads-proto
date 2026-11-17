/* 投放系统 · 管理 / 广告账户 / TikTok */
(function () {
  'use strict';

  var UI = window.ProductUI;
  if (!UI) return;

  var $ = UI.$;
  var escapeHtml = UI.escapeHtml;

  var PRODUCT_TYPES = ['TikTok Minis'];
  var TYPE_ABBR = { 'TikTok Minis': 'TM' };
  var ICON_BASE = /\/share-site\//.test(location.pathname) ? '../素材/平台图标/' : '素材/平台图标/';
  var PLATFORM_ICONS = {
    'TikTok Minis': ICON_BASE + 'TikTok.png'
  };
  var PRODUCTS = [
    { key: 'tm-iq', type: 'TikTok Minis', name: 'IQ Seek', abbr: 'IQS' },
    { key: 'tm-life-builder', type: 'TikTok Minis', name: 'Life Builder', abbr: 'LB' },
    { key: 'tm-master', type: 'TikTok Minis', name: 'Master Your Life', abbr: 'MYL' },
    { key: 'tm-relax', type: 'TikTok Minis', name: 'Relax Mind', abbr: 'RM' },
    { key: 'tm-dream', type: 'TikTok Minis', name: 'My Dream Life', abbr: 'MDL' },
    { key: 'tm-easy', type: 'TikTok Minis', name: 'Easy Mind', abbr: 'EM' },
    { key: 'tm-parking', type: 'TikTok Minis', name: 'Parking Fever', abbr: 'PF' },
    { key: 'tm-car', type: 'TikTok Minis', name: 'Car Match', abbr: 'CM' },
    { key: 'tm-ink', type: 'TikTok Minis', name: 'Ink Trace Quest', abbr: 'ITQ' },
    { key: 'tm-creator', type: 'TikTok Minis', name: 'Life Creator', abbr: 'LC' }
  ];
  var PRODUCT_IDS = {
    'tm-iq': '44761011',
    'tm-life-builder': '44761012',
    'tm-master': '44761013',
    'tm-relax': '44761014',
    'tm-dream': '44761015',
    'tm-easy': '44761016',
    'tm-parking': '44761017',
    'tm-car': '44761018',
    'tm-ink': '44761019',
    'tm-creator': '44761020'
  };
  var CLIENT_KEYS = {
    'tm-iq': 'mg5mtz1tcejwhf0x',
    'tm-life-builder': 'k8n2qwp4rvdhx7sa',
    'tm-master': 'b3c9lm6tujy0e1fo',
    'tm-relax': 'p7a4hs2nkw5zd8qi',
    'tm-dream': 'v1e6gx9mrc3b0tuh',
    'tm-easy': 'd5f8ow2yjl4k7npa',
    'tm-parking': 'h0q3si6uc9x2m5be',
    'tm-car': 'r8t1va4zg7n0c6dw',
    'tm-ink': 'j2l5mb8eq1p4s7hy',
    'tm-creator': 'n6c0dk3fw9a2u5ti'
  };
  PRODUCTS.forEach(function (item) {
    item.productId = PRODUCT_IDS[item.key] || '';
    item.clientKey = CLIENT_KEYS[item.key] || '';
  });

  var OPTIMIZERS = Array.from({ length: 12 }, function (_, i) {
    return '用户' + String.fromCharCode(65 + i);
  });
  var AUTH_OPERATORS = OPTIMIZERS.slice(0, 6);
  var LINKED_AUTH_NAMES = ['Ilxiaofeng', 'BlueVision_wonder', 'Sino_wonder'];
  var AUTH_SEEDS = [
    { name: 'Ilxiaofeng', email: 'ilxiaofeng@yongwangkeji.cn', operator: '用户A', autoAuth: true },
    { name: 'BlueVision_wonder', email: 'xvision@bluefocus.com', operator: '用户B', autoAuth: false },
    { name: 'Sino_wonder', email: 'xinoi@sinointeractive.com', operator: '用户C', autoAuth: false },
    { name: 'user7183732511561', email: 'ttcode@yongwangkeji.cn', operator: '用户D', autoAuth: false },
    { name: 'TecDo_choles.lin', email: 'cholesn@tec-do.com', operator: '用户E', autoAuth: false },
    { name: 'user5630138616128', email: 'lsyncs@yongwangkeji.cn', operator: '用户F', autoAuth: false },
    { name: 'tt_media_buyer', email: 'buyer@yongwangkeji.cn', operator: '用户A', autoAuth: true },
    { name: 'OceanEngine_ops', email: 'ops@bluefocus.com', operator: '用户B', autoAuth: false },
    { name: 'playable_admin', email: 'admin@sinointeractive.com', operator: '用户C', autoAuth: true },
    { name: 'user902184773001', email: 'north@yongwangkeji.cn', operator: '用户D', autoAuth: false },
    { name: 'TecDo_finance.wu', email: 'finance@tec-do.com', operator: '用户E', autoAuth: false },
    { name: 'wonder_ads_bot', email: 'bot@yongwangkeji.cn', operator: '用户F', autoAuth: true }
  ];
  var COMPANIES = [
    'Wonder Group Holdings Limited',
    '北京万嘉珠华科技有限公司',
    'Miracle Holdings Limited',
    '广州勇往科技有限公司'
  ];
  var ACCOUNT_STATUSES = [
    '该广告账户已关户',
    '申请待审核',
    '待验证',
    '审核不通过',
    '审核通过',
    'CRM审核不通过',
    '修改待审核',
    '修改审核不通过',
    '用户被惩罚',
    '等待CRM审核',
    '待对公验证',
    '自助开户待验证资质',
    '合同未生效'
  ];

  var FILTER_DEFS = [
    { key: 'account', name: '广告账户', def: true },
    { key: 'productType', name: '平台', def: true },
    { key: 'product', name: '产品名称', def: true },
    { key: 'optimizer', name: '优化师', def: true },
    { key: 'company', name: '账户主体', def: false },
    { key: 'accountStatus', name: '账户状态', def: false },
    { key: 'authUser', name: '授权用户', def: false },
    { key: 'authStatus', name: '授权状态', def: false },
    { key: 'status', name: '投放状态', def: false }
  ];

  var GROUPS = ['指标'];

  function colDef(key, name, kind, width, def, frozen, copy) {
    return {
      key: key,
      name: name,
      group: '指标',
      kind: kind,
      width: width,
      def: !!def,
      defaultFrozen: !!frozen,
      copy: !!copy
    };
  }

  var COLUMNS = [
    colDef('advertiser_name', '账户名称', 'text', 200, true, true, false),
    colDef('advertiser_id', '账户ID', 'text', 200, true, true, true),
    colDef('product_type', '平台', 'text', 120, true, false, false),
    colDef('product_name', '产品名称', 'text', 200, true, false, false),
    colDef('product_id', '产品ID', 'text', 140, false, false, true),
    colDef('client_key', 'Client key', 'text', 180, false, false, true),
    colDef('optimizer_name', '优化师', 'text', 100, true, false, false),
    colDef('balance', '账户余额', 'money', 120, true, false, false),
    colDef('company', '账户主体', 'text', 160, false, false, false),
    colDef('account_status', '账户状态', 'text', 120, false, false, false),
    colDef('auth_user', '授权用户', 'text', 160, true, false, false),
    colDef('auth_status', '授权状态', 'dot', 100, true, false, false),
    colDef('status', '投放状态', 'tag', 100, true, false, false),
    colDef('created_at', '创建时间', 'text', 180, true, false, false),
    colDef('updated_at', '更新时间', 'text', 180, false, false, false)
  ];

  var COLUMN_MAP = {};
  COLUMNS.forEach(function (col) { COLUMN_MAP[col.key] = col; });
  COLUMN_MAP.balance.sortable = true;
  COLUMN_MAP.updated_at.sortable = true;
  COLUMN_MAP.created_at.sortable = true;

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function formatDateTime(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
      ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  }

  function formatMoney(value) {
    var num = Number(value);
    if (!isFinite(num)) return '-';
    return num.toFixed(2);
  }

  function optimizerAbbr(name) {
    return ('YH' + String(name || '').replace(/^用户/, '')).toUpperCase();
  }

  function accountName(product, optimizer) {
    return [product.abbr, 'TT', 'BV', TYPE_ABBR[product.type], optimizerAbbr(optimizer)].join('_');
  }

  function productByKey(key) {
    for (var i = 0; i < PRODUCTS.length; i += 1) {
      if (PRODUCTS[i].key === key) return PRODUCTS[i];
    }
    return null;
  }

  function productByClientKey(id) {
    var key = String(id || '').trim().toLowerCase();
    if (!key) return null;
    for (var i = 0; i < PRODUCTS.length; i += 1) {
      if (String(PRODUCTS[i].clientKey || '').toLowerCase() === key) return PRODUCTS[i];
    }
    return null;
  }

  function productIconHtml(type) {
    var src = PLATFORM_ICONS[type];
    if (!src) return '';
    return '<span class="select-option-icon"><img src="' + src + '" alt="" /></span>';
  }

  function productOptionIcon(key) {
    var item = productByKey(key);
    return item ? productIconHtml(item.type) : '';
  }

  function sampleProducts() {
    return PRODUCTS.slice();
  }

  function buildRows() {
    var rows = [];
    var products = sampleProducts();
    var i;
    for (i = 0; i < products.length; i += 1) {
      var product = products[i];
      var optimizer = OPTIMIZERS[i % OPTIMIZERS.length];
      var created = new Date(2026, 9, 1 + ((i * 11) % 28), 8 + (i % 10), (i * 13) % 60, (i * 17) % 60);
      var updated = new Date(created.getTime() + (i + 1) * 3600000 * 6);
      var id = '73410088' + String(10000001 + i);
      rows.push({
        id: id,
        advertiser_name: accountName(product, optimizer),
        advertiser_id: id,
        product_type: product.type,
        product_key: product.key,
        product_name: product.name,
        product_id: product.productId,
        client_key: product.clientKey,
        optimizer_name: optimizer,
        balance: Math.round(((i * 137.26) + (i % 4 === 0 ? 0 : 18.5)) * 100) / 100,
        auth_user: LINKED_AUTH_NAMES[i % LINKED_AUTH_NAMES.length],
        company: COMPANIES[i % COMPANIES.length],
        account_status: ACCOUNT_STATUSES[i % ACCOUNT_STATUSES.length],
        auth_status: i % 7 === 0 ? '已失效' : '已授权',
        status: i % 5 === 0 ? '禁用' : '启用',
        updated_at: formatDateTime(updated),
        created_at: formatDateTime(created)
      });
    }
    return rows;
  }

  var ALL_ROWS = buildRows();

  function buildAuthRows() {
    var base = new Date(2026, 9, 2, 10, 0, 0);
    return AUTH_SEEDS.map(function (item, i) {
      var time = new Date(base.getTime() + i * 3000);
      return {
        id: 'auth_' + (i + 1),
        userName: item.name,
        email: item.email,
        accountCount: 0,
        operator: item.operator,
        autoAuth: item.autoAuth,
        updatedAt: formatDateTime(time)
      };
    });
  }

  var authRows = buildAuthRows();
  var authFiltered = authRows.slice();
  var authPage = 1;
  var authPageSize = 20;
  var authOperators = [];
  var authAuto = '';
  var pendingAuthDeleteId = null;
  var pickingAccountId = null;
  var pickedAuthUser = '';
  var authPickMode = 'single';
  var AUTH_PICK_TIP_SINGLE = '系统会使用所选授权账号的 Token，对广告账户进行广告创建、编辑等 API 操作。';
  var AUTH_PICK_TIP_BATCH = '如果广告账户与授权用户之间不存在关联关系，则不会对这些账户变更授权';

  function setAuthPickTip(text) {
    $('authPickTipText').textContent = text;
  }

  function authUserNames() {
    return authRows.map(function (user) { return user.userName; });
  }

  function assignAuthGrants() {
    var base = new Date(2026, 2, 6, 17, 23, 44);
    ALL_ROWS.forEach(function (row, i) {
      var primary = LINKED_AUTH_NAMES[i % LINKED_AUTH_NAMES.length];
      var grants = [{
        userName: primary,
        grantedAt: formatDateTime(new Date(base.getTime() + i * 86400000))
      }];
      if (i % 2 === 0) {
        var second = LINKED_AUTH_NAMES[(i + 1) % LINKED_AUTH_NAMES.length];
        if (second !== primary) {
          grants.push({
            userName: second,
            grantedAt: formatDateTime(new Date(base.getTime() + (i + 12) * 86400000))
          });
        }
      }
      row.auth_grants = grants;
      row.auth_user = primary;
    });
  }

  function syncAuthAccountCounts() {
    authRows.forEach(function (user) {
      user.accountCount = ALL_ROWS.filter(function (row) {
        return (row.auth_grants || []).some(function (item) { return item.userName === user.userName; });
      }).length;
    });
  }

  function findAuthUser(name) {
    for (var i = 0; i < authRows.length; i += 1) {
      if (authRows[i].userName === name) return authRows[i];
    }
    return null;
  }

  function renderAuthPick(row) {
    var grants = (row.auth_grants || []).slice().sort(function (a, b) {
      return String(b.grantedAt || '').localeCompare(String(a.grantedAt || ''));
    });
    var body = $('authPickBody');
    var empty = $('authPickEmpty');
    if (!grants.length) {
      body.innerHTML = '';
      empty.hidden = false;
      pickedAuthUser = '';
      return;
    }
    empty.hidden = true;
    if (!pickedAuthUser) pickedAuthUser = grants[0].userName;
    body.innerHTML = grants.map(function (grant) {
      var user = findAuthUser(grant.userName);
      var email = user ? maskEmail(user.email) : '-';
      var operator = user ? user.operator : '-';
      var checked = grant.userName === pickedAuthUser;
      return '<tr data-pick-row="' + escapeHtml(grant.userName) + '">' +
        '<td class="col-check"><label class="cell-radio"><input type="radio" name="authUserPick" value="' +
          escapeHtml(grant.userName) + '"' + (checked ? ' checked' : '') + ' aria-label="选择授权用户" /></label></td>' +
        '<td title="' + escapeHtml(grant.userName) + '">' + escapeHtml(grant.userName) + '</td>' +
        '<td title="' + escapeHtml(user ? user.email : '') + '">' + escapeHtml(email) + '</td>' +
        '<td>' + escapeHtml(operator) + '</td>' +
        '<td>' + escapeHtml(grant.grantedAt || '-') + '</td>' +
      '</tr>';
    }).join('');
  }

  function openAuthPickModal(rowId) {
    var row = null;
    ALL_ROWS.forEach(function (item) { if (item.id === rowId) row = item; });
    if (!row) return;
    authPickMode = 'single';
    pickingAccountId = row.id;
    pickedAuthUser = row.auth_user || '';
    setAuthPickTip(AUTH_PICK_TIP_SINGLE);
    renderAuthPick(row);
    UI.closePanels();
    closeBatch();
    UI.openModal('authPickModal');
  }

  function collectSelectedAuthGrants() {
    var map = {};
    ALL_ROWS.forEach(function (row) {
      if (!selected[row.id]) return;
      (row.auth_grants || []).forEach(function (grant) {
        var prev = map[grant.userName];
        if (!prev || String(grant.grantedAt || '') > String(prev.grantedAt || '')) {
          map[grant.userName] = { userName: grant.userName, grantedAt: grant.grantedAt };
        }
      });
    });
    return Object.keys(map).map(function (name) { return map[name]; });
  }

  function openBatchAuthModal() {
    authPickMode = 'batch';
    pickingAccountId = null;
    pickedAuthUser = '';
    setAuthPickTip(AUTH_PICK_TIP_BATCH);
    renderAuthPick({ auth_grants: collectSelectedAuthGrants(), auth_user: '' });
    UI.closePanels();
    closeBatch();
    UI.openModal('authPickModal');
  }

  function closeAuthPickModal() {
    pickingAccountId = null;
    pickedAuthUser = '';
    authPickMode = 'single';
    setAuthPickTip(AUTH_PICK_TIP_SINGLE);
    UI.closeModal('authPickModal');
  }

  function saveBatchAuthPick() {
    var changed = 0;
    if (!pickedAuthUser) {
      UI.showToast('请选择授权用户', 'error');
      return;
    }
    ALL_ROWS.forEach(function (row) {
      if (!selected[row.id]) return;
      var linked = (row.auth_grants || []).some(function (item) { return item.userName === pickedAuthUser; });
      if (!linked) return;
      row.auth_user = pickedAuthUser;
      row.updated_at = formatDateTime(new Date());
      changed += 1;
    });
    selected = {};
    closeAuthPickModal();
    renderTable();
    if (changed) UI.showToast('提交成功');
    else UI.showToast('所选账户均无该授权关联', 'error');
  }

  function saveAuthPickModal() {
    var row = null;
    if (authPickMode === 'batch') {
      saveBatchAuthPick();
      return;
    }
    ALL_ROWS.forEach(function (item) { if (item.id === pickingAccountId) row = item; });
    if (!row) {
      closeAuthPickModal();
      return;
    }
    if ((row.auth_grants || []).length && !pickedAuthUser) {
      UI.showToast('请选择授权用户', 'error');
      return;
    }
    row.auth_user = pickedAuthUser || '';
    row.updated_at = formatDateTime(new Date());
    closeAuthPickModal();
    renderTable();
    UI.showToast('提交成功');
  }

  var TIKTOK_AUTH_URL = 'https://business-api.tiktok.com/portal/auth?app_id=7619174901470986256&state=your_custom_params&redirect_uri=https%3A%2F%2Fbigdata.zuiqiangyingyu.net';
  var OAUTH_USER_NAME = 'portal_auth_user';
  var OAUTH_USER_EMAIL = 'portal.auth@yongwangkeji.cn';
  var OAUTH_PREFIXES = ['CWSM_TT_BV', 'TMJ_TT_US', 'WP_TT_EU', 'SM_TT_SEA', 'OM_TT_NA', 'PF_TT_JP'];
  var OAUTH_FEATURED = [
    ['7595510834332368897', 'BT_TT_BV_minigame_01'],
    ['7602217642383049840', 'NJSS_TT_TD_minigame_01'],
    ['7605595695210479632', 'AIO_TT_TD_minigame_02'],
    ['7602217649384456193', 'IQ Challenge_TT_TD_minigame_01'],
    ['7602217721052413969', 'Save The Pets_TT_TD_minigame_01'],
    ['7602217573983436817', 'AnnoyTok_TT_TD_minigame_01'],
    ['7602217666354544657', 'AMEP_TT_TD_minigame_01']
  ];
  var waitingAuthReturn = false;
  var openedAuthAt = 0;
  var oauthAllRows = [];
  var oauthFilteredRows = [];
  var oauthSelectedIds = {};
  var oauthFilterStatus = '';

  function oauthSelectedCount() {
    return Object.keys(oauthSelectedIds).length;
  }

  function buildOAuthCallbackRows() {
    var exists = {};
    var rows = [];
    var used = {};
    ALL_ROWS.forEach(function (row) { exists[row.advertiser_id] = true; });
    function pushRow(id, name) {
      if (used[id]) return;
      used[id] = true;
      rows.push({
        accountId: id,
        accountName: name,
        authorized: !!exists[id]
      });
    }
    ALL_ROWS.slice(0, 8).forEach(function (row) {
      pushRow(row.advertiser_id, row.advertiser_name);
    });
    OAUTH_FEATURED.forEach(function (item) { pushRow(item[0], item[1]); });
    var i = 0;
    while (rows.length < 100) {
      var seq = i + 1;
      pushRow(
        '761' + String(1000000000000000 + i * 137 + 29),
        OAUTH_PREFIXES[i % OAUTH_PREFIXES.length] + '_oauth_' + (seq < 10 ? '0' : '') + seq
      );
      i += 1;
    }
    return rows;
  }

  function applyOAuthFilter() {
    var kw = ($('oauthKw').value || '').trim().toLowerCase();
    oauthFilteredRows = oauthAllRows.filter(function (row) {
      if (kw) {
        var nameHit = row.accountName.toLowerCase().indexOf(kw) !== -1;
        var idHit = row.accountId.toLowerCase().indexOf(kw) !== -1;
        if (!nameHit && !idHit) return false;
      }
      if (oauthFilterStatus === '已授权' && !row.authorized) return false;
      if (oauthFilterStatus === '未授权' && row.authorized) return false;
      return true;
    });
    renderOAuthPickTable();
  }

  function syncOAuthCount() {
    var listIds = oauthFilteredRows.map(function (row) { return row.accountId; });
    var checkedCount = listIds.filter(function (id) { return oauthSelectedIds[id]; }).length;
    $('oauthSelectedCount').textContent = String(checkedCount);
    $('oauthAvailableCount').textContent = String(listIds.length);
    return { listIds: listIds, checkedCount: checkedCount };
  }

  function renderOAuthPickTable() {
    var body = $('oauthPickBody');
    var empty = $('oauthPickEmpty');
    var checkAll = $('oauthCheckAll');
    var count = syncOAuthCount();
    if (!oauthFilteredRows.length) {
      body.innerHTML = '';
      empty.hidden = false;
      checkAll.checked = false;
      checkAll.indeterminate = false;
      return;
    }
    empty.hidden = true;
    body.innerHTML = oauthFilteredRows.map(function (row) {
      var checked = !!oauthSelectedIds[row.accountId];
      var status = row.authorized ? '已授权' : '未授权';
      var dot = row.authorized ? 'status-dot--done' : 'status-dot--error';
      return '<tr>' +
        '<td class="col-check"><span class="cell-check"><input type="checkbox" data-oauth-check="' + escapeHtml(row.accountId) + '"' +
          (checked ? ' checked' : '') + ' aria-label="选择' + escapeHtml(row.accountName) + '" /></span></td>' +
        '<td title="' + escapeHtml(row.accountId) + '">' + escapeHtml(row.accountId) + '</td>' +
        '<td title="' + escapeHtml(row.accountName) + '">' + escapeHtml(row.accountName) + '</td>' +
        '<td><span class="status-dot ' + dot + '">' + escapeHtml(status) + '</span></td>' +
      '</tr>';
    }).join('');
    checkAll.checked = count.listIds.length > 0 && count.checkedCount === count.listIds.length;
    checkAll.indeterminate = count.checkedCount > 0 && count.checkedCount < count.listIds.length;
  }

  function openOAuthPickModal() {
    oauthAllRows = buildOAuthCallbackRows();
    oauthSelectedIds = {};
    oauthFilterStatus = '';
    if (oauthKwClear) oauthKwClear.clear();
    else {
      $('oauthKw').value = '';
      $('oauthKwWrap').classList.remove('has-value');
    }
    if (oauthStatusApi) oauthStatusApi.syncLabel('');
    applyOAuthFilter();
    UI.closePanels();
    closeBatch();
    UI.openModal('oauthPickModal');
  }

  function closeOAuthPickModal() {
    UI.closeModal('oauthPickModal');
  }

  function tryShowOAuthPick() {
    if (!waitingAuthReturn) return;
    if (document.hidden) return;
    if (Date.now() - openedAuthAt < 600) return;
    waitingAuthReturn = false;
    if ($('oauthPickModal').classList.contains('is-open')) return;
    if (currentTab !== 'account') switchTab('account');
    openOAuthPickModal();
  }

  function ensureOAuthUser() {
    var user = findAuthUser(OAUTH_USER_NAME);
    if (user) return user;
    user = {
      id: 'auth_oauth',
      userName: OAUTH_USER_NAME,
      email: OAUTH_USER_EMAIL,
      accountCount: 0,
      operator: '用户A',
      autoAuth: false,
      updatedAt: formatDateTime(new Date())
    };
    authRows.unshift(user);
    return user;
  }

  function linkAccountToOAuthUser(row, userName, now) {
    if (!row.auth_grants) row.auth_grants = [];
    if (!row.auth_grants.some(function (item) { return item.userName === userName; })) {
      row.auth_grants.push({ userName: userName, grantedAt: now });
    }
    row.auth_user = userName;
    row.auth_status = '已授权';
    row.updated_at = now;
  }

  function saveOAuthPickModal() {
    if (!oauthSelectedCount()) {
      UI.showToast('请选择账户', 'error');
      return;
    }
    var user = ensureOAuthUser();
    var now = formatDateTime(new Date());
    var added = 0;
    Object.keys(oauthSelectedIds).forEach(function (accountId) {
      var pick = null;
      oauthAllRows.forEach(function (item) { if (item.accountId === accountId) pick = item; });
      if (!pick) return;
      var row = null;
      ALL_ROWS.forEach(function (item) { if (item.advertiser_id === pick.accountId) row = item; });
      if (!row) {
        row = {
          id: pick.accountId,
          advertiser_name: pick.accountName,
          advertiser_id: pick.accountId,
          product_type: '',
          product_key: '',
          product_name: '',
          product_id: '',
          client_key: '',
          optimizer_name: '用户A',
          balance: 0,
          auth_user: '',
          auth_grants: [],
          company: '',
          account_status: '审核通过',
          auth_status: '已授权',
          status: '启用',
          updated_at: now,
          created_at: now
        };
        ALL_ROWS.unshift(row);
        added += 1;
      }
      linkAccountToOAuthUser(row, user.userName, now);
    });
    user.updatedAt = now;
    syncAuthAccountCounts();
    syncAuthUserPanel();
    if (authUserMulti) authUserMulti.render();
    applyAuthFilter();
    closeOAuthPickModal();
    page = 1;
    renderTable();
    UI.showToast(added ? '已添加 ' + added + ' 个广告账户' : '已关联授权用户');
  }

  function maskEmail(email) {
    var raw = String(email || '');
    var at = raw.indexOf('@');
    if (at < 2) return raw;
    return raw.charAt(0) + '***' + raw.charAt(at - 1) + raw.slice(at);
  }

  assignAuthGrants();
  syncAuthAccountCounts();

  function emptyDraft() {
    return {
      keyword: '',
      productTypes: [],
      products: [],
      optimizers: [],
      companies: [],
      accountStatuses: [],
      authUsers: [],
      authStatus: '',
      status: ''
    };
  }

  function cloneDraft(src) {
    return {
      keyword: src.keyword || '',
      productTypes: (src.productTypes || []).slice(),
      products: (src.products || []).slice(),
      optimizers: (src.optimizers || []).slice(),
      companies: (src.companies || []).slice(),
      accountStatuses: (src.accountStatuses || []).slice(),
      authUsers: (src.authUsers || []).slice(),
      authStatus: src.authStatus || '',
      status: src.status || ''
    };
  }

  var draft = emptyDraft();
  var applied = emptyDraft();
  var visibleFilters = FILTER_DEFS.filter(function (item) { return item.def; }).map(function (item) { return item.key; });
  var columns = COLUMNS.filter(function (col) { return col.def; }).map(function (col) { return col.key; });
  var frozenCount = COLUMNS.filter(function (col) { return col.def && col.defaultFrozen; }).length;
  var columnDraft = [];
  var draftFrozenCount = frozenCount;
  var metricCat = GROUPS[0];
  var metricAnchorLock = false;
  var dragMetric = null;
  var selected = {};
  var filterSettingsSnapshot = null;
  var sortSpecs = [{ key: 'created_at', dir: 'desc' }];
  var sortApi = null;
  var ACTION_COL_WIDTH = 100;
  var page = 1;
  var pageSize = 20;
  var currentTab = 'account';

  function includesText(value, kw) {
    return String(value || '').toLowerCase().indexOf(kw) >= 0;
  }

  function productOptions() {
    return PRODUCTS.filter(function (item) {
      return !draft.productTypes.length || draft.productTypes.indexOf(item.type) >= 0;
    }).map(function (item) { return item.key; });
  }

  function pruneProducts() {
    var allow = productOptions();
    draft.products = draft.products.filter(function (key) { return allow.indexOf(key) >= 0; });
  }

  function filteredRows() {
    var kw = (applied.keyword || '').trim().toLowerCase();
    var list = ALL_ROWS.filter(function (row) {
      if (visibleFilters.indexOf('account') >= 0 && kw && !includesText(row.advertiser_name, kw) && !includesText(row.advertiser_id, kw)) return false;
      if (visibleFilters.indexOf('productType') >= 0 && applied.productTypes.length && applied.productTypes.indexOf(row.product_type) < 0) return false;
      if (visibleFilters.indexOf('product') >= 0 && applied.products.length && applied.products.indexOf(row.product_key) < 0) return false;
      if (visibleFilters.indexOf('optimizer') >= 0 && applied.optimizers.length && applied.optimizers.indexOf(row.optimizer_name) < 0) return false;
      if (visibleFilters.indexOf('company') >= 0 && applied.companies.length && applied.companies.indexOf(row.company) < 0) return false;
      if (visibleFilters.indexOf('accountStatus') >= 0 && applied.accountStatuses.length && applied.accountStatuses.indexOf(row.account_status) < 0) return false;
      if (visibleFilters.indexOf('authUser') >= 0 && applied.authUsers.length && applied.authUsers.indexOf(row.auth_user) < 0) return false;
      if (visibleFilters.indexOf('authStatus') >= 0 && applied.authStatus && row.auth_status !== applied.authStatus) return false;
      if (visibleFilters.indexOf('status') >= 0 && applied.status && row.status !== applied.status) return false;
      return true;
    });
    if (!sortSpecs.length) return list;
    return UI.sortRowsBySpecs(list, sortSpecs, function (a, b, key) {
      if (key === 'created_at' || key === 'updated_at') {
        return String(a[key] || '').localeCompare(String(b[key] || ''));
      }
      return Number(a[key]) - Number(b[key]);
    });
  }

  function pruneSelection() {
    var keep = {};
    filteredRows().forEach(function (row) {
      if (selected[row.id]) keep[row.id] = true;
    });
    selected = keep;
  }

  function selectedCount() {
    return Object.keys(selected).length;
  }

  function syncFilterVisibility() {
    document.querySelectorAll('#filterBarAccount [data-filter]').forEach(function (el) {
      el.hidden = visibleFilters.indexOf(el.getAttribute('data-filter')) < 0;
    });
  }

  function syncAuthUserPanel() {
    var panel = $('authUserPanel');
    if (!panel) return;
    panel.classList.toggle('multi-panel--simple', authUserNames().length <= 7);
  }

  function statusTag(value) {
    var cls = value === '启用' || value === '已授权' ? 'tag--enabled' : 'tag--disabled';
    return '<span class="tag ' + cls + '">' + escapeHtml(value) + '</span>';
  }

  function cellHtml(row, col) {
    if (col.copy) {
      var copyValue = row[col.key] == null ? '' : String(row[col.key]);
      if (!copyValue) return '<span>-</span>';
      return '<span class="cell-id"><span class="cell-id__text" title="' + escapeHtml(copyValue) + '">' + escapeHtml(copyValue) + '</span>' +
        '<button class="copy-btn" type="button" data-copy="' + escapeHtml(copyValue) + '" title="复制' + escapeHtml(col.name) + '" aria-label="复制' + escapeHtml(col.name) + '">' + UI.COPY_ICON + '</button></span>';
    }
    if (col.kind === 'money') return formatMoney(row.balance);
    if (col.key === 'product_name') {
      return '<span class="product-cell">' + productIconHtml(row.product_type) +
        '<span class="product-cell__name" title="' + escapeHtml(row.product_name) + '">' + escapeHtml(row.product_name) + '</span></span>';
    }
    if (col.key === 'auth_user') {
      var authName = row.auth_user || '-';
      return '<span class="auth-user-cell">' +
        '<span class="auth-user-cell__name" title="' + escapeHtml(authName) + '">' + escapeHtml(authName) + '</span>' +
        '<button class="auth-user-cell__edit" type="button" data-auth-edit="' + escapeHtml(row.id) + '" aria-label="编辑" title="编辑">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>' +
        '</button></span>';
    }
    if (col.kind === 'dot') {
      var dot = row.auth_status === '已授权' ? 'status-dot--done' : 'status-dot--error';
      return '<span class="status-dot ' + dot + '">' + escapeHtml(row.auth_status) + '</span>';
    }
    if (col.kind === 'tag') return statusTag(row.status);
    var text = row[col.key] == null || row[col.key] === '' ? '-' : String(row[col.key]);
    return '<span title="' + escapeHtml(text) + '">' + escapeHtml(text) + '</span>';
  }

  function visibleColumns() {
    return columns.map(function (key) { return COLUMN_MAP[key]; }).filter(Boolean);
  }

  function syncBatch() {
    var btn = $('batchBtn');
    if (!btn) return;
    var count = selectedCount();
    btn.disabled = count === 0;
    if (count === 0) closeBatch();
  }

  function closeBatch() {
    var menu = $('batchMenu');
    var btn = $('batchBtn');
    if (menu) menu.classList.remove('is-open');
    if (btn) btn.classList.remove('is-open');
  }

  function syncFreezeLeft() {
    var table = $('accountTable');
    if (!table) return;
    var cols = table.querySelectorAll('colgroup col');
    var ths = table.querySelectorAll('thead th');
    var bodyRows = table.querySelectorAll('tbody tr');
    var last = cols.length - 1;
    if (last >= 0 && cols[last].classList.contains('col-action')) {
      var current = parseFloat(cols[last].style.width) || ACTION_COL_WIDTH;
      var extra = current - ACTION_COL_WIDTH;
      if (extra > 0.5 && last > 0) {
        var prev = cols[last - 1];
        prev.style.width = ((parseFloat(prev.style.width) || 0) + extra) + 'px';
      }
      cols[last].style.width = ACTION_COL_WIDTH + 'px';
      cols[last].style.minWidth = ACTION_COL_WIDTH + 'px';
      cols[last].style.maxWidth = ACTION_COL_WIDTH + 'px';
    }
    var left = 0;
    var count = Math.min(1 + frozenCount, cols.length);
    Array.prototype.forEach.call(cols, function (col, index) {
      var frozen = index < count && !col.classList.contains('col-action');
      var width = parseFloat(col.style.width) || 0;
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

  function renderTable() {
    var list = filteredRows();
    var totalPages = Math.max(1, Math.ceil(list.length / pageSize) || 1);
    if (page > totalPages) page = totalPages;
    var pageRows = list.slice((page - 1) * pageSize, page * pageSize);
    var cols = visibleColumns();
    var pageIds = pageRows.map(function (row) { return row.id; });
    var checkedCount = pageIds.filter(function (id) { return selected[id]; }).length;

    $('tableColgroup').innerHTML =
      '<col class="col-check" data-col-width="48" />' +
      cols.map(function (col) {
        return '<col data-col-width="' + col.width + '" />';
      }).join('') +
      '<col class="col-action" data-col-width="' + ACTION_COL_WIDTH + '" />';

    $('tableHead').innerHTML = '<tr>' +
      '<th class="col-check is-freeze"><span class="cell-check"><input type="checkbox" id="checkAll" aria-label="全选"' +
        (pageIds.length && checkedCount === pageIds.length ? ' checked' : '') + ' /></span></th>' +
      cols.map(function (col, index) {
        var cls = [];
        if (col.kind === 'money') cls.push('num');
        if (index < frozenCount) cls.push('is-freeze');
        var label = escapeHtml(col.name);
        if (col.sortable) {
          label = '<div class="th-sort' + (col.kind === 'money' ? ' th-sort--num' : '') + '" data-key="' + col.key + '"><span>' + label + '</span>' + UI.TH_SORT_ICONS_HTML + '</div>';
        }
        return '<th class="' + cls.join(' ') + '">' + label + '</th>';
      }).join('') +
      '<th class="col-action">操作</th>' +
    '</tr>';

    $('tableBody').innerHTML = pageRows.map(function (row) {
      return '<tr data-id="' + escapeHtml(row.id) + '">' +
        '<td class="col-check is-freeze"><span class="cell-check"><input type="checkbox" data-check="' + escapeHtml(row.id) + '" aria-label="选择' + escapeHtml(row.advertiser_name) + '"' +
          (selected[row.id] ? ' checked' : '') + ' /></span></td>' +
        cols.map(function (col, index) {
          var cls = [];
          if (index < frozenCount) cls.push('is-freeze');
          if (col.kind === 'money') cls.push('num');
          return '<td' + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + '>' + cellHtml(row, col) + '</td>';
        }).join('') +
        '<td class="col-action"><button class="link" type="button" data-edit="' + escapeHtml(row.id) + '">编辑</button></td>' +
      '</tr>';
    }).join('');

    var all = $('checkAll');
    if (all) all.indeterminate = checkedCount > 0 && checkedCount < pageIds.length;
    $('emptyTip').hidden = list.length > 0;
    UI.renderPagination({ containerId: 'pagination', total: list.length, page: page, pageSize: pageSize });
    syncBatch();
    if (window.ColResize) ColResize.refresh($('accountTable'), { onLayout: syncFreezeLeft });
    else syncFreezeLeft();
    if (sortApi) sortApi.sync();
  }

  function applyQuery() {
    applied = cloneDraft(draft);
    page = 1;
    pruneSelection();
    renderTable();
  }

  function clearFilterValue(key, target) {
    if (key === 'account') target.keyword = '';
    else if (key === 'productType') target.productTypes = [];
    else if (key === 'product') target.products = [];
    else if (key === 'optimizer') target.optimizers = [];
    else if (key === 'company') target.companies = [];
    else if (key === 'accountStatus') target.accountStatuses = [];
    else if (key === 'authUser') target.authUsers = [];
    else if (key === 'authStatus') target.authStatus = '';
    else if (key === 'status') target.status = '';
  }

  function syncControls() {
    $('accountKeyword').value = draft.keyword;
    if (keywordClear) keywordClear.sync();
    if (productTypeMulti) productTypeMulti.render();
    pruneProducts();
    if (productMulti) productMulti.render();
    if (optimizerMulti) optimizerMulti.render();
    if (companyMulti) companyMulti.render();
    if (accountStatusMulti) accountStatusMulti.render();
    if (authUserMulti) authUserMulti.render();
    if (authStatusApi) authStatusApi.syncLabel(draft.authStatus);
    if (statusApi) statusApi.syncLabel(draft.status);
  }

  function resetFilters() {
    draft = emptyDraft();
    syncControls();
    applyQuery();
  }

  function switchTab(tab) {
    currentTab = tab === 'auth' ? 'auth' : 'account';
    document.querySelectorAll('.page-tabs__item').forEach(function (btn) {
      var on = btn.getAttribute('data-tab') === currentTab;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    $('filterBarAccount').hidden = currentTab !== 'account';
    $('filterBarAuth').hidden = currentTab !== 'auth';
    $('dataPanelAccount').hidden = currentTab !== 'account';
    $('dataPanelAuth').hidden = currentTab !== 'auth';
    UI.closePanels();
    closeBatch();
    if (currentTab === 'account') renderTable();
    else {
      renderAuthTable();
      if (window.ColResize) ColResize.refresh($('authTable'));
    }
  }

  function isDefaultFrozenKey(key) {
    var col = COLUMN_MAP[key];
    return !!(col && col.defaultFrozen);
  }

  function minFrozenCount(list) {
    var n = 0;
    (list || []).forEach(function (key) {
      if (isDefaultFrozenKey(key)) n += 1;
    });
    return n;
  }

  var FS_ARROW = '<svg class="select-trigger__arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4.5L6 7.5L9 4.5"/></svg>';
  var FS_CLEAR = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l6 6M9 3L3 9"/></svg>';
  var FS_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>';

  function fsMultiPanelHtml(key, simple) {
    if (simple) {
      return '<div class="multi-panel multi-panel--simple" id="fsPanel_' + key + '"><div class="multi-panel__list" id="fsList_' + key + '"></div></div>';
    }
    return '<div class="multi-panel" id="fsPanel_' + key + '">' +
      '<div class="multi-panel__left">' +
        '<div class="multi-panel__search">' + FS_SEARCH + '<input type="text" id="fsSearch_' + key + '" placeholder="搜索" autocomplete="off" /></div>' +
        '<div class="multi-panel__toolbar"><button class="multi-panel__link" type="button" id="fsAll_' + key + '">全选</button></div>' +
        '<div class="multi-panel__list" id="fsList_' + key + '"></div>' +
      '</div>' +
      '<div class="multi-panel__right">' +
        '<div class="multi-panel__toolbar multi-panel__toolbar--right"><span id="fsCount_' + key + '">已选择 0 项</span><button class="multi-panel__link" type="button" id="fsPanelClear_' + key + '">清空</button></div>' +
        '<div class="multi-panel__list" id="fsSelected_' + key + '"></div>' +
      '</div></div>';
  }

  function filterSettingControlHtml(item) {
    var key = item.key;
    if (key === 'account') {
      var value = draft.keyword || '';
      return '<div class="filter-setting-control' + (value ? ' has-value' : '') + '" id="fsWrap_account">' +
        '<label class="select-trigger select-trigger--input" for="fs_account">' +
          '<span class="select-trigger__prefix">广告账户：</span>' +
          '<input class="select-trigger__field" type="text" id="fs_account" placeholder="请输入" value="' + escapeHtml(value) + '" autocomplete="off" />' +
        '</label>' +
        '<button class="select-clear" type="button" id="fsClear_account" aria-label="清除">' + FS_CLEAR + '</button>' +
      '</div>';
    }
    var singles = key === 'authStatus' ? ['已授权', '已失效'] : (key === 'status' ? ['启用', '禁用'] : null);
    if (singles) {
      return '<div class="filter-setting-control" id="fsWrap_' + key + '">' +
        '<button class="select-trigger" type="button" id="fsTrigger_' + key + '">' +
          '<span class="select-trigger__text" id="fsLabel_' + key + '">' + escapeHtml(item.name) + '：<span class="muted">请选择</span></span>' +
          FS_ARROW +
        '</button>' +
        '<button class="select-clear" type="button" id="fsClear_' + key + '" aria-label="清除">' + FS_CLEAR + '</button>' +
        '<div class="single-panel" id="fsPanel_' + key + '">' +
          singles.map(function (option) {
            return '<button class="single-option" type="button" data-value="' + escapeHtml(option) + '">' + escapeHtml(option) + '</button>';
          }).join('') +
        '</div></div>';
    }
    var simple = key === 'productType' || key === 'company';
    return '<div class="filter-setting-control" id="fsWrap_' + key + '">' +
      '<button class="select-trigger" type="button" id="fsTrigger_' + key + '">' +
        '<span class="select-trigger__text" id="fsLabel_' + key + '">' + escapeHtml(item.name) + '：<span class="muted">请选择</span></span>' +
        FS_ARROW +
      '</button>' +
      '<button class="select-clear" type="button" id="fsClear_' + key + '" aria-label="清除">' + FS_CLEAR + '</button>' +
      fsMultiPanelHtml(key, simple) +
    '</div>';
  }

  function bindFilterSettingControls() {
    var fsProductApi = null;
    var input = $('fs_account');
    var wrap = $('fsWrap_account');
    function syncKeyword() {
      wrap.classList.toggle('has-value', !!input.value);
    }
    input.addEventListener('input', function () {
      draft.keyword = input.value || '';
      $('accountKeyword').value = draft.keyword;
      if (keywordClear) keywordClear.sync();
      syncKeyword();
    });
    input.addEventListener('click', function (e) { e.stopPropagation(); });
    $('fsClear_account').addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      input.value = '';
      draft.keyword = '';
      $('accountKeyword').value = '';
      if (keywordClear) keywordClear.sync();
      syncKeyword();
      input.focus();
    });
    syncKeyword();

    function bindFsMulti(key, prefix, getOptions, getSelected, setSelected, barApi, extra) {
      var api = UI.bindMultiSelect(Object.assign({
        wrapId: 'fsWrap_' + key,
        triggerId: 'fsTrigger_' + key,
        panelId: 'fsPanel_' + key,
        labelId: 'fsLabel_' + key,
        listId: 'fsList_' + key,
        selectedId: $('fsSelected_' + key) ? 'fsSelected_' + key : undefined,
        searchId: $('fsSearch_' + key) ? 'fsSearch_' + key : undefined,
        countId: $('fsCount_' + key) ? 'fsCount_' + key : undefined,
        selectAllId: $('fsAll_' + key) ? 'fsAll_' + key : undefined,
        clearId: 'fsClear_' + key,
        prefix: prefix,
        getOptions: getOptions,
        getSelected: getSelected,
        setSelected: function (arr) {
          setSelected(arr);
          if (barApi) barApi.render();
        }
      }, extra || {}));
      var panelClear = $('fsPanelClear_' + key);
      if (panelClear && api) {
        panelClear.addEventListener('click', function (e) {
          e.stopPropagation();
          setSelected([]);
          if (barApi) barApi.render();
          api.render();
        });
      }
      return api;
    }

    fsProductApi = bindFsMulti('product', '产品名称：', productOptions, function () { return draft.products; }, function (arr) { draft.products = arr; }, productMulti, {
      getLabel: function (key) {
        var item = productByKey(key);
        return item ? item.name : key;
      },
      getIconHtml: productOptionIcon
    });
    bindFsMulti('productType', '平台：', function () { return PRODUCT_TYPES; }, function () { return draft.productTypes; }, function (arr) {
      draft.productTypes = arr;
      pruneProducts();
      if (productMulti) productMulti.render();
      if (fsProductApi) fsProductApi.render();
    }, productTypeMulti);
    bindFsMulti('optimizer', '优化师：', function () { return OPTIMIZERS; }, function () { return draft.optimizers; }, function (arr) { draft.optimizers = arr; }, optimizerMulti);
    bindFsMulti('company', '账户主体：', function () { return COMPANIES; }, function () { return draft.companies; }, function (arr) { draft.companies = arr; }, companyMulti);
    bindFsMulti('accountStatus', '账户状态：', function () { return ACCOUNT_STATUSES; }, function () { return draft.accountStatuses; }, function (arr) { draft.accountStatuses = arr; }, accountStatusMulti);
    bindFsMulti('authUser', '授权用户：', authUserNames, function () { return draft.authUsers; }, function (arr) { draft.authUsers = arr; }, authUserMulti);

    UI.bindSingleSelect({
      wrapId: 'fsWrap_authStatus',
      triggerId: 'fsTrigger_authStatus',
      panelId: 'fsPanel_authStatus',
      labelId: 'fsLabel_authStatus',
      clearId: 'fsClear_authStatus',
      prefix: '授权状态：',
      getValue: function () { return draft.authStatus; },
      onChange: function (value) {
        draft.authStatus = value || '';
        if (authStatusApi) authStatusApi.syncLabel(draft.authStatus);
      }
    });
    UI.bindSingleSelect({
      wrapId: 'fsWrap_status',
      triggerId: 'fsTrigger_status',
      panelId: 'fsPanel_status',
      labelId: 'fsLabel_status',
      clearId: 'fsClear_status',
      prefix: '投放状态：',
      getValue: function () { return draft.status; },
      onChange: function (value) {
        draft.status = value || '';
        if (statusApi) statusApi.syncLabel(draft.status);
      }
    });
  }

  function openFilterSettings() {
    if (!filterSettingsSnapshot) filterSettingsSnapshot = cloneDraft(draft);
    var rows = '';
    var i;
    for (i = 0; i < FILTER_DEFS.length; i += 3) {
      rows += '<div class="filter-setting-row">' + FILTER_DEFS.slice(i, i + 3).map(function (item) {
        var checked = visibleFilters.indexOf(item.key) >= 0;
        return '<div class="filter-setting-item" data-fs-key="' + item.key + '">' +
          '<input type="checkbox" value="' + item.key + '"' + (checked ? ' checked' : '') + ' />' +
          filterSettingControlHtml(item) +
        '</div>';
      }).join('') + '</div>';
    }
    $('filterSettingGrid').innerHTML = rows;
    bindFilterSettingControls();
    UI.closePanels();
    UI.openModal('filterSettingModal');
  }

  function cancelFilterSettings() {
    var snap = filterSettingsSnapshot;
    filterSettingsSnapshot = null;
    if (snap) {
      draft = cloneDraft(snap);
      syncControls();
    }
    UI.closePanels();
    UI.closeModal('filterSettingModal');
  }

  function submitFilterSettings() {
    var selectedKeys = [];
    $('filterSettingGrid').querySelectorAll('.filter-setting-item > input[type="checkbox"]').forEach(function (input) {
      if (input.checked) selectedKeys.push(input.value);
    });
    var next = FILTER_DEFS.map(function (item) { return item.key; }).filter(function (key) {
      return selectedKeys.indexOf(key) >= 0;
    });
    FILTER_DEFS.forEach(function (item) {
      if (next.indexOf(item.key) < 0) clearFilterValue(item.key, draft);
    });
    visibleFilters = next;
    filterSettingsSnapshot = null;
    syncFilterVisibility();
    syncControls();
    UI.closePanels();
    UI.closeModal('filterSettingModal');
    applyQuery();
  }

  function renderMetricModal() {
    var kw = ($('metricSearch').value || '').trim().toLowerCase();
    var grouped = {};
    GROUPS.forEach(function (group) { grouped[group] = []; });
    COLUMNS.forEach(function (col) {
      if (kw && col.name.toLowerCase().indexOf(kw) < 0 && col.key.toLowerCase().indexOf(kw) < 0) return;
      if (!grouped[col.group]) grouped[col.group] = [];
      grouped[col.group].push(col);
    });
    var visibleGroups = GROUPS.filter(function (group) { return (grouped[group] || []).length; });
    if (visibleGroups.indexOf(metricCat) < 0) metricCat = visibleGroups[0] || GROUPS[0];

    $('metricCats').innerHTML = visibleGroups.map(function (group) {
      return '<button class="metric-cat' + (group === metricCat ? ' is-active' : '') + '" type="button" data-group="' + escapeHtml(group) + '">' + escapeHtml(group) + '</button>';
    }).join('') || '<div class="multi-panel__empty">无匹配</div>';

    $('metricOptions').innerHTML = visibleGroups.map(function (group) {
      var cols = grouped[group] || [];
      var selectable = cols.filter(function (col) { return !isDefaultFrozenKey(col.key); });
      var checkedN = cols.filter(function (col) { return columnDraft.indexOf(col.key) >= 0; }).length;
      var allOn = cols.length > 0 && checkedN === cols.length;
      return '<section class="metric-group" id="metricGroup-' + escapeHtml(group) + '" data-group="' + escapeHtml(group) + '">' +
        '<div class="metric-group__head">' +
          '<input class="metric-check" type="checkbox" data-group-check="' + escapeHtml(group) + '"' + (allOn ? ' checked' : '') + (selectable.length ? '' : ' disabled') + ' aria-label="全选' + escapeHtml(group) + '" />' +
          '<span>' + escapeHtml(group) + '</span></div>' +
        '<div class="metric-group__grid">' + cols.map(function (col) {
          var on = columnDraft.indexOf(col.key) >= 0;
          var locked = isDefaultFrozenKey(col.key);
          return '<label class="metric-option' + (locked ? ' is-disabled' : '') + '">' +
            '<input class="metric-check" type="checkbox" value="' + col.key + '"' + (on ? ' checked' : '') + (locked ? ' disabled' : '') + ' />' +
            '<span class="metric-option__name" title="' + escapeHtml(col.name) + '">' + escapeHtml(col.name) + '</span></label>';
        }).join('') + '</div></section>';
    }).join('') || '<div class="multi-panel__empty">无匹配指标</div>';

    $('metricOptions').querySelectorAll('[data-group-check]').forEach(function (input) {
      var group = input.getAttribute('data-group-check');
      var cols = grouped[group] || [];
      var checkedN = cols.filter(function (col) { return columnDraft.indexOf(col.key) >= 0; }).length;
      input.indeterminate = checkedN > 0 && checkedN < cols.length;
    });

    draftFrozenCount = Math.max(minFrozenCount(columnDraft), Math.min(draftFrozenCount, columnDraft.length));
    var freezeAt = draftFrozenCount;
    var listHtml = '';
    if (!columnDraft.length) {
      listHtml = '<div class="multi-panel__empty">请添加指标</div>';
    } else {
      columnDraft.forEach(function (key, idx) {
        if (idx === freezeAt) listHtml += '<div class="metric-freeze" data-freeze-line="1">拖到上方的列将冻结显示</div>';
        var col = COLUMN_MAP[key];
        var forced = isDefaultFrozenKey(key);
        var frozen = idx < freezeAt;
        var icon = frozen
          ? '<svg class="metric-selected__lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="6" y="11" width="12" height="9" rx="1"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>'
          : '<svg class="metric-selected__drag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
        var remove = forced ? '' : '<button class="metric-selected__remove" type="button" data-remove-col="' + escapeHtml(key) + '" aria-label="移除"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 2l8 8M10 2L2 10"/></svg></button>';
        listHtml += '<div class="metric-selected__item' + (frozen ? ' is-frozen' : '') + '" draggable="' + (forced ? 'false' : 'true') + '" data-metric="' + escapeHtml(key) + '">' +
          icon + '<span class="metric-selected__name">' + escapeHtml(col.name) + '</span>' + remove + '</div>';
      });
      if (freezeAt >= columnDraft.length) listHtml += '<div class="metric-freeze" data-freeze-line="1">拖到上方的列将冻结显示</div>';
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

  function normalizeFrozenDraft() {
    var forced = [];
    var rest = [];
    columnDraft.forEach(function (key) {
      if (isDefaultFrozenKey(key)) forced.push(key);
      else rest.push(key);
    });
    var userFrozen = rest.splice(0, Math.max(0, draftFrozenCount - forced.length));
    columnDraft = forced.concat(userFrozen, rest);
    draftFrozenCount = forced.length + userFrozen.length;
  }

  var keywordClear = UI.bindInputClearable({
    wrapId: 'accountKeywordWrap',
    inputId: 'accountKeyword',
    clearId: 'accountKeywordClear'
  });

  var productTypeMulti = UI.bindMultiSelect({
    wrapId: 'productTypeWrap',
    triggerId: 'productTypeTrigger',
    panelId: 'productTypePanel',
    labelId: 'productTypeLabel',
    listId: 'productTypeList',
    clearId: 'productTypeClear',
    prefix: '平台：',
    getOptions: function () { return PRODUCT_TYPES; },
    getSelected: function () { return draft.productTypes; },
    setSelected: function (arr) {
      draft.productTypes = arr;
      pruneProducts();
      if (productMulti) productMulti.render();
    }
  });

  var productMulti = UI.bindMultiSelect({
    wrapId: 'productWrap',
    triggerId: 'productTrigger',
    panelId: 'productPanel',
    labelId: 'productLabel',
    listId: 'productList',
    selectedId: 'productSelected',
    searchId: 'productSearch',
    countId: 'productCount',
    selectAllId: 'productSelectAll',
    clearId: 'productPanelClear',
    prefix: '产品名称：',
    getOptions: productOptions,
    getLabel: function (key) {
      var item = productByKey(key);
      return item ? item.name : key;
    },
    getIconHtml: productOptionIcon,
    getSelected: function () { return draft.products; },
    setSelected: function (arr) { draft.products = arr; }
  });

  var optimizerMulti = UI.bindMultiSelect({
    wrapId: 'optimizerWrap',
    triggerId: 'optimizerTrigger',
    panelId: 'optimizerPanel',
    labelId: 'optimizerLabel',
    listId: 'optimizerList',
    selectedId: 'optimizerSelected',
    searchId: 'optimizerSearch',
    countId: 'optimizerCount',
    selectAllId: 'optimizerSelectAll',
    clearId: 'optimizerPanelClear',
    prefix: '优化师：',
    getOptions: function () { return OPTIMIZERS; },
    getSelected: function () { return draft.optimizers; },
    setSelected: function (arr) { draft.optimizers = arr; }
  });

  var companyMulti = UI.bindMultiSelect({
    wrapId: 'companyWrap',
    triggerId: 'companyTrigger',
    panelId: 'companyPanel',
    labelId: 'companyLabel',
    listId: 'companyList',
    clearId: 'companyClear',
    prefix: '账户主体：',
    getOptions: function () { return COMPANIES; },
    getSelected: function () { return draft.companies; },
    setSelected: function (arr) { draft.companies = arr; }
  });

  var accountStatusMulti = UI.bindMultiSelect({
    wrapId: 'accountStatusWrap',
    triggerId: 'accountStatusTrigger',
    panelId: 'accountStatusPanel',
    labelId: 'accountStatusLabel',
    listId: 'accountStatusList',
    selectedId: 'accountStatusSelected',
    searchId: 'accountStatusSearch',
    countId: 'accountStatusCount',
    selectAllId: 'accountStatusSelectAll',
    clearId: 'accountStatusPanelClear',
    prefix: '账户状态：',
    getOptions: function () { return ACCOUNT_STATUSES; },
    getSelected: function () { return draft.accountStatuses; },
    setSelected: function (arr) { draft.accountStatuses = arr; }
  });

  var authUserMulti = UI.bindMultiSelect({
    wrapId: 'authUserWrap',
    triggerId: 'authUserTrigger',
    panelId: 'authUserPanel',
    labelId: 'authUserLabel',
    listId: 'authUserList',
    selectedId: 'authUserSelected',
    searchId: 'authUserSearch',
    countId: 'authUserCount',
    selectAllId: 'authUserSelectAll',
    clearId: 'authUserPanelClear',
    prefix: '授权用户：',
    getOptions: authUserNames,
    getSelected: function () { return draft.authUsers; },
    setSelected: function (arr) { draft.authUsers = arr; }
  });

  var authStatusApi = UI.bindSingleSelect({
    wrapId: 'authStatusWrap',
    triggerId: 'authStatusTrigger',
    panelId: 'authStatusPanel',
    labelId: 'authStatusLabel',
    clearId: 'authStatusClear',
    prefix: '授权状态：',
    getValue: function () { return draft.authStatus; },
    onChange: function (value) { draft.authStatus = value || ''; }
  });

  var statusApi = UI.bindSingleSelect({
    wrapId: 'statusWrap',
    triggerId: 'statusTrigger',
    panelId: 'statusPanel',
    labelId: 'statusLabel',
    clearId: 'statusClear',
    prefix: '投放状态：',
    getValue: function () { return draft.status; },
    onChange: function (value) { draft.status = value || ''; }
  });

  $('productClear').addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    draft.products = [];
    productMulti.render();
  });
  $('optimizerClear').addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    draft.optimizers = [];
    optimizerMulti.render();
  });
  $('accountStatusClear').addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    draft.accountStatuses = [];
    accountStatusMulti.render();
  });
  $('authUserClear').addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    draft.authUsers = [];
    authUserMulti.render();
  });

  $('accountKeyword').addEventListener('input', function () {
    draft.keyword = this.value || '';
  });
  $('accountKeyword').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyQuery();
    }
  });

  $('resetBtn').addEventListener('click', resetFilters);
  $('queryBtn').addEventListener('click', applyQuery);

  document.querySelectorAll('.page-tabs__item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchTab(btn.getAttribute('data-tab'));
    });
  });

  $('filterSettingBtn').addEventListener('click', function () {
    UI.closePanels();
    closeBatch();
    openFilterSettings();
  });

  $('filterSettingSubmit').addEventListener('click', submitFilterSettings);

  $('refreshBtn').addEventListener('click', function () {
    renderTable();
    UI.showToast('刷新成功');
  });

  $('metricsBtn').addEventListener('click', function () {
    UI.closePanels();
    closeBatch();
    columnDraft = columns.slice();
    draftFrozenCount = frozenCount;
    $('metricSearch').value = '';
    renderMetricModal();
    UI.openModal('metricModal');
  });

  $('metricSearch').addEventListener('input', renderMetricModal);
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

  $('metricClear').addEventListener('click', function () {
    columnDraft = columnDraft.filter(isDefaultFrozenKey);
    draftFrozenCount = columnDraft.length;
    renderMetricModal();
  });

  $('metricSubmit').addEventListener('click', function () {
    if (!columnDraft.length) {
      UI.showToast('请至少选择 1 列', 'warning');
      return;
    }
    normalizeFrozenDraft();
    columns = columnDraft.slice();
    frozenCount = draftFrozenCount;
    UI.closeModal('metricModal');
    renderTable();
    UI.showToast('自定义列已更新');
  });

  $('metricOptions').addEventListener('change', function (e) {
    var groupInput = e.target.closest('[data-group-check]');
    if (groupInput) {
      var group = groupInput.getAttribute('data-group-check');
      var checked = groupInput.checked;
      COLUMNS.forEach(function (col) {
        if (col.group !== group || isDefaultFrozenKey(col.key)) return;
        toggleMetricKey(col.key, checked);
      });
      renderMetricModal();
      return;
    }
    var input = e.target.closest('input.metric-check');
    if (!input || input.disabled || input.hasAttribute('data-group-check')) return;
    toggleMetricKey(input.value, input.checked);
    renderMetricModal();
  });

  $('metricCats').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-group]');
    if (!btn) return;
    var group = btn.getAttribute('data-group');
    var el = document.getElementById('metricGroup-' + group);
    var scroller = $('metricOptions');
    if (!el || !scroller) return;
    metricAnchorLock = true;
    metricCat = group;
    Array.prototype.forEach.call($('metricCats').querySelectorAll('.metric-cat'), function (item) {
      item.classList.toggle('is-active', item === btn);
    });
    scroller.scrollTo({ top: Math.max(0, el.offsetTop - 8), behavior: 'smooth' });
    window.setTimeout(function () { metricAnchorLock = false; }, 400);
  });

  $('metricSelectedList').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-remove-col]');
    if (!btn) return;
    toggleMetricKey(btn.getAttribute('data-remove-col'), false);
    renderMetricModal();
  });

  $('metricSelectedList').addEventListener('dragstart', function (e) {
    var item = e.target.closest('[data-metric]');
    if (!item || item.getAttribute('draggable') === 'false') {
      e.preventDefault();
      return;
    }
    dragMetric = item.getAttribute('data-metric');
    item.classList.add('is-dragging');
    try {
      e.dataTransfer.setData('text/plain', dragMetric);
      e.dataTransfer.effectAllowed = 'move';
    } catch (err) { /* ignore */ }
  });

  $('metricSelectedList').addEventListener('dragend', function () {
    var item = $('metricSelectedList').querySelector('.is-dragging');
    if (item) item.classList.remove('is-dragging');
    Array.prototype.forEach.call($('metricSelectedList').querySelectorAll('.is-drag-over'), function (el) {
      el.classList.remove('is-drag-over');
    });
    dragMetric = null;
  });

  $('metricSelectedList').addEventListener('dragover', function (e) {
    e.preventDefault();
    if (!dragMetric) return;
    var line = e.target.closest('[data-freeze-line]');
    var item = e.target.closest('[data-metric]');
    Array.prototype.forEach.call($('metricSelectedList').querySelectorAll('.is-drag-over'), function (el) {
      el.classList.remove('is-drag-over');
    });
    if (line) line.classList.add('is-drag-over');
    else if (item) item.classList.add('is-drag-over');
  });

  $('metricSelectedList').addEventListener('drop', function (e) {
    e.preventDefault();
    if (!dragMetric || isDefaultFrozenKey(dragMetric)) return;
    var line = e.target.closest('[data-freeze-line]');
    var item = e.target.closest('[data-metric]');
    var from = columnDraft.indexOf(dragMetric);
    if (from < 0) return;
    if (line) {
      columnDraft.splice(from, 1);
      var insertAt = from < draftFrozenCount ? Math.max(minFrozenCount(columnDraft), draftFrozenCount - 1) : draftFrozenCount;
      insertAt = Math.max(minFrozenCount(columnDraft), Math.min(insertAt, columnDraft.length));
      columnDraft.splice(insertAt, 0, dragMetric);
      draftFrozenCount = Math.max(minFrozenCount(columnDraft), insertAt + 1);
    } else if (item) {
      var target = item.getAttribute('data-metric');
      if (target === dragMetric) return;
      var to = columnDraft.indexOf(target);
      if (to < 0) return;
      var wasFrozen = from < draftFrozenCount;
      var toFrozen = to < draftFrozenCount;
      columnDraft.splice(from, 1);
      columnDraft.splice(to, 0, dragMetric);
      if (!wasFrozen && toFrozen) draftFrozenCount = Math.max(draftFrozenCount, minFrozenCount(columnDraft));
      else if (wasFrozen && !toFrozen) draftFrozenCount = Math.max(minFrozenCount(columnDraft), draftFrozenCount - 1);
    }
    normalizeFrozenDraft();
    renderMetricModal();
  });

  $('batchWrap').addEventListener('click', function (e) { e.stopPropagation(); });
  $('batchBtn').addEventListener('click', function () {
    if (this.disabled) return;
    var open = !$('batchMenu').classList.contains('is-open');
    UI.closePanels();
    $('batchMenu').classList.toggle('is-open', open);
    this.classList.toggle('is-open', open);
  });
  $('batchMenu').addEventListener('click', function (e) {
    var item = e.target.closest('[data-batch]');
    if (!item) return;
    var kind = item.getAttribute('data-batch');
    closeBatch();
    if (kind === 'product') openBatchProductModal();
    else if (kind === 'optimizer') openBatchOptimizerModal();
    else if (kind === 'auth') openBatchAuthModal();
    else if (kind === 'status') openBatchStatusModal();
  });
  document.addEventListener('click', closeBatch);

  $('accountTable').addEventListener('click', function (e) {
    var authEdit = e.target.closest('[data-auth-edit]');
    if (authEdit) {
      e.preventDefault();
      e.stopPropagation();
      openAuthPickModal(authEdit.getAttribute('data-auth-edit'));
      return;
    }
    var editBtn = e.target.closest('[data-edit]');
    if (editBtn) {
      e.preventDefault();
      e.stopPropagation();
      openEditModal(editBtn.getAttribute('data-edit'));
      return;
    }
    var copyBtn = e.target.closest('[data-copy]');
    if (copyBtn) {
      e.preventDefault();
      e.stopPropagation();
      UI.copyText(copyBtn.getAttribute('data-copy'));
      return;
    }
    var box = e.target.closest('input[type="checkbox"]');
    if (!box) return;
    if (box.id === 'checkAll') {
      var on = box.checked;
      $('accountTable').querySelectorAll('tbody input[data-check]').forEach(function (input) {
        var id = input.getAttribute('data-check');
        if (on) selected[id] = true;
        else delete selected[id];
        input.checked = on;
      });
      box.indeterminate = false;
      syncBatch();
      return;
    }
    var id = box.getAttribute('data-check');
    if (!id) return;
    if (box.checked) selected[id] = true;
    else delete selected[id];
    var boxes = $('accountTable').querySelectorAll('tbody input[data-check]');
    var total = boxes.length;
    var onCount = 0;
    Array.prototype.forEach.call(boxes, function (input) {
      if (input.checked) onCount += 1;
    });
    var all = $('checkAll');
    if (all) {
      all.checked = total > 0 && onCount === total;
      all.indeterminate = onCount > 0 && onCount < total;
    }
    syncBatch();
  });

  document.querySelectorAll('[data-close]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-close');
      if (id === 'filterSettingModal') cancelFilterSettings();
      else UI.closeModal(id);
    });
  });

  UI.bindPagination({
    containerId: 'pagination',
    getPage: function () { return page; },
    getPageSize: function () { return pageSize; },
    getTotal: function () { return filteredRows().length; },
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

  sortApi = UI.bindThSort({
    root: '#accountTable',
    getState: function () { return { specs: sortSpecs }; },
    setState: function (next) {
      var specs = (next && next.specs) || [];
      sortSpecs = specs.length ? [specs[specs.length - 1]] : [];
    },
    onChange: function () {
      page = 1;
      renderTable();
    }
  });

  function renderAuthTable() {
    var start = (authPage - 1) * authPageSize;
    var pageRows = authFiltered.slice(start, start + authPageSize);
    if (!authFiltered.length) {
      $('authBody').innerHTML = '';
      $('authEmptyTip').hidden = false;
    } else {
      $('authEmptyTip').hidden = true;
      $('authBody').innerHTML = pageRows.map(function (row) {
        var canDelete = row.accountCount <= 0;
        var delAttr = canDelete
          ? ' data-auth-del="' + escapeHtml(row.id) + '"'
          : ' disabled title="存在授权账户，无法删除"';
        return '<tr>' +
          '<td><button class="switch' + (row.autoAuth ? ' is-on' : '') + '" type="button" data-auth-switch="' +
            escapeHtml(row.id) + '" role="switch" aria-checked="' + (row.autoAuth ? 'true' : 'false') + '" aria-label="自动授权"></button></td>' +
          '<td title="' + escapeHtml(row.userName) + '">' + escapeHtml(row.userName) + '</td>' +
          '<td title="' + escapeHtml(row.email) + '">' + escapeHtml(maskEmail(row.email)) + '</td>' +
          '<td>' + escapeHtml(String(row.accountCount)) + '</td>' +
          '<td>' + escapeHtml(row.operator) + '</td>' +
          '<td>' + escapeHtml(row.updatedAt) + '</td>' +
          '<td class="col-action"><button class="link" type="button"' + delAttr + '>删除</button></td>' +
        '</tr>';
      }).join('');
    }
    UI.renderPagination({
      containerId: 'authPagination',
      total: authFiltered.length,
      page: authPage,
      pageSize: authPageSize
    });
  }

  function applyAuthFilter() {
    var nameKw = ($('authNameKeyword').value || '').trim().toLowerCase();
    var emailKw = ($('authEmailKeyword').value || '').trim().toLowerCase();
    authFiltered = authRows.filter(function (row) {
      if (nameKw && row.userName.toLowerCase().indexOf(nameKw) < 0) return false;
      if (emailKw && row.email.toLowerCase().indexOf(emailKw) < 0) return false;
      if (authOperators.length && authOperators.indexOf(row.operator) < 0) return false;
      if (authAuto === '开启' && !row.autoAuth) return false;
      if (authAuto === '关闭' && row.autoAuth) return false;
      return true;
    });
    authPage = 1;
    renderAuthTable();
  }

  function resetAuthFilter() {
    $('authNameKeyword').value = '';
    $('authEmailKeyword').value = '';
    if (authNameClear) authNameClear.sync();
    if (authEmailClear) authEmailClear.sync();
    authOperators = [];
    authAuto = '';
    if (authOperatorMulti) authOperatorMulti.render();
    if (authAutoApi) authAutoApi.syncLabel('');
    applyAuthFilter();
  }

  var authNameClear = UI.bindInputClearable({ wrapId: 'authNameWrap', inputId: 'authNameKeyword', clearId: 'authNameClear' });
  var authEmailClear = UI.bindInputClearable({ wrapId: 'authEmailWrap', inputId: 'authEmailKeyword', clearId: 'authEmailClear' });

  var authOperatorMulti = UI.bindMultiSelect({
    wrapId: 'authOperatorWrap',
    triggerId: 'authOperatorTrigger',
    panelId: 'authOperatorPanel',
    labelId: 'authOperatorLabel',
    listId: 'authOperatorList',
    selectedId: 'authOperatorSelected',
    searchId: 'authOperatorSearch',
    countId: 'authOperatorCount',
    selectAllId: 'authOperatorSelectAll',
    clearId: 'authOperatorClear',
    prefix: '操作人：',
    getOptions: function () { return AUTH_OPERATORS; },
    getSelected: function () { return authOperators; },
    setSelected: function (arr) { authOperators = arr; }
  });

  var authAutoApi = UI.bindSingleSelect({
    wrapId: 'authAutoWrap',
    triggerId: 'authAutoTrigger',
    panelId: 'authAutoPanel',
    labelId: 'authAutoLabel',
    clearId: 'authAutoClear',
    prefix: '自动授权：',
    getValue: function () { return authAuto; },
    onChange: function (value) { authAuto = value || ''; }
  });

  UI.bindPagination({
    containerId: 'authPagination',
    getPage: function () { return authPage; },
    getPageSize: function () { return authPageSize; },
    getTotal: function () { return authFiltered.length; },
    onPageChange: function (next) {
      authPage = next;
      renderAuthTable();
    },
    onPageSizeChange: function (size) {
      authPageSize = size;
      authPage = 1;
      renderAuthTable();
    }
  });

  $('authSearchBtn').addEventListener('click', applyAuthFilter);
  $('authResetBtn').addEventListener('click', resetAuthFilter);
  $('authNameKeyword').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') applyAuthFilter();
  });
  $('authEmailKeyword').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') applyAuthFilter();
  });
  $('authBody').addEventListener('click', function (e) {
    var sw = e.target.closest('[data-auth-switch]');
    if (sw) {
      var row = null;
      authRows.forEach(function (item) { if (item.id === sw.getAttribute('data-auth-switch')) row = item; });
      if (!row) return;
      row.autoAuth = !row.autoAuth;
      row.updatedAt = formatDateTime(new Date());
      renderAuthTable();
      UI.showToast(row.autoAuth ? '已开启自动授权' : '已关闭自动授权');
      return;
    }
    var del = e.target.closest('[data-auth-del]');
    if (!del || del.disabled) return;
    pendingAuthDeleteId = del.getAttribute('data-auth-del');
    UI.openModal('authDeleteModal');
  });
  $('authDeleteClose').addEventListener('click', function () {
    pendingAuthDeleteId = null;
    UI.closeModal('authDeleteModal');
  });
  $('authDeleteCancel').addEventListener('click', function () {
    pendingAuthDeleteId = null;
    UI.closeModal('authDeleteModal');
  });
  $('authPickBody').addEventListener('change', function (e) {
    var input = e.target.closest('input[name="authUserPick"]');
    if (!input) return;
    pickedAuthUser = input.value || '';
  });
  $('authPickBody').addEventListener('click', function (e) {
    var tr = e.target.closest('[data-pick-row]');
    if (!tr) return;
    pickedAuthUser = tr.getAttribute('data-pick-row') || '';
    var radio = tr.querySelector('input[name="authUserPick"]');
    if (radio) radio.checked = true;
  });
  $('authPickClose').addEventListener('click', closeAuthPickModal);
  $('authPickCancel').addEventListener('click', closeAuthPickModal);
  $('authPickSave').addEventListener('click', saveAuthPickModal);

  var oauthKwClear = UI.bindInputClearable({ wrapId: 'oauthKwWrap', inputId: 'oauthKw', clearId: 'oauthKwClear' });
  var oauthStatusApi = UI.bindSingleSelect({
    wrapId: 'oauthStatusWrap',
    triggerId: 'oauthStatusTrigger',
    panelId: 'oauthStatusPanel',
    labelId: 'oauthStatusLabel',
    clearId: 'oauthStatusClear',
    prefix: '授权状态：',
    getValue: function () { return oauthFilterStatus; },
    onChange: function (value) { oauthFilterStatus = value || ''; }
  });

  var importRows = [];

  function findAccountById(accountId) {
    for (var i = 0; i < ALL_ROWS.length; i += 1) {
      if (ALL_ROWS[i].advertiser_id === accountId) return ALL_ROWS[i];
    }
    return null;
  }

  function layoutImportColumns(table) {
    if (!table) return;
    var cols = table.querySelectorAll('colgroup col');
    if (cols.length < 2) return;
    var available = table.parentElement ? table.parentElement.clientWidth : 0;
    var used = 0;
    var i;
    var width;
    for (i = 0; i < cols.length - 1; i += 1) {
      width = parseFloat(cols[i].getAttribute('data-col-width')) || 0;
      used += width;
      cols[i].style.width = width + 'px';
      cols[i].style.minWidth = width + 'px';
      cols[i].style.maxWidth = width + 'px';
    }
    var rest = available > used ? Math.max(160, available - used) : 160;
    var last = cols[cols.length - 1];
    last.setAttribute('data-col-width', String(rest));
    last.style.width = rest + 'px';
    last.style.minWidth = rest + 'px';
    last.style.maxWidth = '';
    if (available > 0 && used + rest <= available + 1) {
      table.style.width = '100%';
      table.style.minWidth = '100%';
    } else {
      table.style.width = (used + rest) + 'px';
      table.style.minWidth = (used + rest) + 'px';
    }
  }

  function refreshImportTable() {
    var table = $('importTable');
    if (!window.ColResize || !table) return;
    ColResize.refresh(table, { onLayout: layoutImportColumns });
    /* 弹窗打开后会再初始化一次列宽，并清掉上面的回调，需在那之后重新锁列 */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var current = $('importTable');
        if (!current) return;
        var opts = current._colResizeOpts || {};
        opts.onLayout = layoutImportColumns;
        current._colResizeOpts = opts;
        layoutImportColumns(current);
      });
    });
  }

  function openImportModal() {
    importRows = [];
    showImportTip();
    renderImportTable();
    $('importFile').value = '';
    UI.openModal('importModal');
    refreshImportTable();
  }

  function closeImportModal() {
    UI.closeModal('importModal');
  }

  function showImportTip() {
    $('importAlert').classList.remove('is-show', 'is-success');
    $('importAlertText').textContent = '';
  }

  function showImportAlert(text, type) {
    $('importAlertText').textContent = text;
    $('importAlert').classList.add('is-show');
    $('importAlert').classList.toggle('is-success', type === 'success');
  }

  function renderImportTable() {
    var body = $('importBody');
    var empty = $('importEmpty');
    if (!importRows.length) {
      body.innerHTML = '';
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    body.innerHTML = importRows.map(function (row) {
      return '<tr>' +
        '<td title="' + escapeHtml(row.accountId) + '">' + escapeHtml(row.accountId || '-') + '</td>' +
        '<td title="' + escapeHtml(row.platform) + '">' + escapeHtml(row.platform || '-') + '</td>' +
        '<td title="' + escapeHtml(row.clientKey) + '">' + escapeHtml(row.clientKey || '-') + '</td>' +
        '<td>' + escapeHtml(row.optimizer || '-') + '</td>' +
        '<td>' + escapeHtml(row.status || '-') + '</td>' +
        '<td class="col-error">' + escapeHtml(row.error || '') + '</td>' +
      '</tr>';
    }).join('');
    refreshImportTable();
  }

  function downloadTemplate() {
    var sampleId = ALL_ROWS[0] ? ALL_ROWS[0].advertiser_id : '7341008810000001';
    var samplePlatform = (ALL_ROWS[0] && ALL_ROWS[0].product_type) || PRODUCT_TYPES[0];
    var sampleClientKey = PRODUCTS[0] ? PRODUCTS[0].clientKey : '';
    var sampleOptimizer = '用户A';
    var sampleStatus = '启用';
    var colW = '210';
    var emptyRows = '';
    var i;
    for (i = 0; i < 20; i += 1) {
      emptyRows +=
        '<Row>' +
        '<Cell ss:StyleID="sText"><Data ss:Type="String"></Data></Cell>' +
        '<Cell ss:StyleID="sCell"><Data ss:Type="String"></Data></Cell>' +
        '<Cell ss:StyleID="sText"><Data ss:Type="String"></Data></Cell>' +
        '<Cell ss:StyleID="sCell"><Data ss:Type="String"></Data></Cell>' +
        '<Cell ss:StyleID="sCell"><Data ss:Type="String"></Data></Cell>' +
        '</Row>';
    }
    var xml =
      '<?xml version="1.0"?>' +
      '<?mso-application progid="Excel.Sheet"?>' +
      '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ' +
      'xmlns:o="urn:schemas-microsoft-com:office:office" ' +
      'xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
      'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ' +
      'xmlns:html="http://www.w3.org/TR/REC-html40">' +
      '<Styles>' +
      '<Style ss:ID="Default" ss:Name="Normal">' +
      '<Alignment ss:Vertical="Center"/>' +
      '<Borders/>' +
      '<Font ss:FontName="微软雅黑" x:CharSet="134" ss:Size="10"/>' +
      '<Interior/>' +
      '<NumberFormat/>' +
      '<Protection/>' +
      '</Style>' +
      '<Style ss:ID="sCell">' +
      '<Alignment ss:Vertical="Center"/>' +
      '<Borders/>' +
      '<Font ss:FontName="微软雅黑" x:CharSet="134" ss:Size="10"/>' +
      '<Interior ss:Pattern="None"/>' +
      '</Style>' +
      '<Style ss:ID="sText">' +
      '<Alignment ss:Vertical="Center"/>' +
      '<Borders/>' +
      '<Font ss:FontName="微软雅黑" x:CharSet="134" ss:Size="10"/>' +
      '<Interior ss:Pattern="None"/>' +
      '<NumberFormat ss:Format="@"/>' +
      '</Style>' +
      '</Styles>' +
      '<Worksheet ss:Name="导入模板">' +
      '<Table ss:DefaultRowHeight="18">' +
      '<Column ss:StyleID="sText" ss:AutoFitWidth="0" ss:Width="' + colW + '"/>' +
      '<Column ss:StyleID="sCell" ss:AutoFitWidth="0" ss:Width="120"/>' +
      '<Column ss:StyleID="sText" ss:AutoFitWidth="0" ss:Width="' + colW + '"/>' +
      '<Column ss:StyleID="sCell" ss:AutoFitWidth="0" ss:Width="' + colW + '"/>' +
      '<Column ss:StyleID="sCell" ss:AutoFitWidth="0" ss:Width="80"/>' +
      '<Row>' +
      '<Cell ss:StyleID="sText"><Data ss:Type="String">账户ID</Data></Cell>' +
      '<Cell ss:StyleID="sCell"><Data ss:Type="String">平台</Data></Cell>' +
      '<Cell ss:StyleID="sText"><Data ss:Type="String">Client key</Data></Cell>' +
      '<Cell ss:StyleID="sCell"><Data ss:Type="String">优化师</Data></Cell>' +
      '<Cell ss:StyleID="sCell"><Data ss:Type="String">状态</Data></Cell>' +
      '</Row>' +
      '<Row>' +
      '<Cell ss:StyleID="sText"><Data ss:Type="String">' + sampleId + '</Data></Cell>' +
      '<Cell ss:StyleID="sCell"><Data ss:Type="String">' + samplePlatform + '</Data></Cell>' +
      '<Cell ss:StyleID="sText"><Data ss:Type="String">' + sampleClientKey + '</Data></Cell>' +
      '<Cell ss:StyleID="sCell"><Data ss:Type="String">' + sampleOptimizer + '</Data></Cell>' +
      '<Cell ss:StyleID="sCell"><Data ss:Type="String">' + sampleStatus + '</Data></Cell>' +
      '</Row>' +
      emptyRows +
      '</Table>' +
      '<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">' +
      '<DisplayGridlines/>' +
      '</WorksheetOptions>' +
      '</Worksheet>' +
      '</Workbook>';
    var blob = new Blob(['\uFEFF' + xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'TikTok账户导入模板.xls';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    UI.showToast('模板已下载');
  }

  function normalizeAccountId(raw) {
    var v = String(raw == null ? '' : raw).trim();
    var formulaMatch;
    if (!v) return '';
    if (v.charAt(0) === "'") v = v.slice(1).trim();
    formulaMatch = v.match(/^=\s*"([^"]*)"\s*$/) || v.match(/^=\s*(.+)$/);
    if (formulaMatch) v = String(formulaMatch[1]).trim();
    v = v.replace(/^\t+/, '').replace(/\s+/g, '');
    return v;
  }

  function parseCsvLine(line) {
    var result = [];
    var cur = '';
    var inQuotes = false;
    var i;
    var ch;
    for (i = 0; i < line.length; i += 1) {
      ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            cur += '"';
            i += 1;
          } else {
            inQuotes = false;
          }
        } else {
          cur += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',' || ch === '\t') {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result;
  }

  function normalizeHeader(h) {
    return String(h || '').replace(/^\uFEFF/, '').trim().toLowerCase().replace(/\s+/g, '');
  }

  function mapHeaderIndex(headers) {
    var map = { accountId: -1, platform: -1, clientKey: -1, optimizer: -1, status: -1 };
    headers.forEach(function (h, i) {
      var key = normalizeHeader(h);
      if (key === '账户id' || key === 'accountid' || key === 'account_id') map.accountId = i;
      else if (key === '平台' || key === 'platform') map.platform = i;
      else if (key === 'clientkey' || key === 'client_key') map.clientKey = i;
      else if (key === '优化师' || key === 'optimizer') map.optimizer = i;
      else if (key === '状态' || key === '投放状态' || key === 'status') map.status = i;
    });
    return map;
  }

  function validateImportRow(row, idSet) {
    var errors = [];
    if (!row.accountId) {
      errors.push('必填项不能为空');
    } else if (/e[+-]/i.test(row.accountId) || !/^\d{5,}$/.test(row.accountId) || idSet[row.accountId] || !findAccountById(row.accountId)) {
      errors.push('账户ID 无法匹配');
    }
    if (row.accountId) idSet[row.accountId] = true;
    if (row.platform && PRODUCT_TYPES.indexOf(row.platform) < 0) errors.push('平台无法匹配');
    if (row.clientKey && !productByClientKey(row.clientKey)) errors.push('Client key 无法匹配');
    if (row.optimizer && OPTIMIZERS.indexOf(row.optimizer) < 0) errors.push('优化师无法匹配');
    if (row.status && row.status !== '启用' && row.status !== '禁用') errors.push('状态无法匹配');
    if (row.accountId && !row.platform && !row.clientKey && !row.optimizer && !row.status) errors.push('必填项不能为空');
    return errors.join('；');
  }

  function buildImportRows(headers, dataLines, splitLine) {
    var col = mapHeaderIndex(headers);
    var idSet = {};
    var rows = [];
    var i;
    var cols;
    var row;
    if (col.accountId < 0 || col.platform < 0 || col.clientKey < 0 || col.optimizer < 0 || col.status < 0) {
      return { error: '表头不正确，需包含：账户ID、平台、Client key、优化师、状态' };
    }
    for (i = 0; i < dataLines.length; i += 1) {
      cols = splitLine(dataLines[i]);
      row = {
        accountId: normalizeAccountId(cols[col.accountId]),
        platform: String(cols[col.platform] == null ? '' : cols[col.platform]).trim(),
        clientKey: normalizeAccountId(cols[col.clientKey]),
        optimizer: String(cols[col.optimizer] == null ? '' : cols[col.optimizer]).trim(),
        status: String(cols[col.status] == null ? '' : cols[col.status]).trim(),
        error: ''
      };
      row.error = validateImportRow(row, idSet);
      rows.push(row);
    }
    if (!rows.length) return { error: '未解析到有效数据行，请检查文件内容' };
    return { rows: rows };
  }

  function parseImportHtml(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var table = doc.querySelector('table');
    var trs;
    var headers;
    var dataLines;
    if (!table) return { error: '无法解析模板表格，请使用下载的导入模板' };
    trs = Array.prototype.slice.call(table.querySelectorAll('tr'));
    if (!trs.length) return { error: '文件内容为空，请使用下载的模板填写后重新上传' };
    headers = Array.prototype.map.call(trs[0].querySelectorAll('td,th'), function (cell) {
      return (cell.textContent || '').trim();
    });
    dataLines = trs.slice(1).map(function (tr) {
      return Array.prototype.map.call(tr.querySelectorAll('td,th'), function (cell) {
        return (cell.textContent || '').trim();
      });
    }).filter(function (line) {
      return line.some(function (c) { return String(c).trim() !== ''; });
    });
    return buildImportRows(headers, dataLines, function (line) { return line; });
  }

  function parseImportSpreadsheetML(xmlText) {
    var doc = new DOMParser().parseFromString(xmlText, 'application/xml');
    var rows;
    var headers;
    var dataLines;
    function cellIndex(cell, fallback) {
      var raw = cell.getAttribute('ss:Index') || cell.getAttribute('Index');
      var n = Number(raw);
      return n > 0 ? n : fallback;
    }
    function rowCells(row) {
      var cells = Array.prototype.slice.call(row.getElementsByTagName('Cell'));
      var cols = [];
      var nextIndex = 1;
      cells.forEach(function (cell) {
        var idx = cellIndex(cell, nextIndex);
        var data;
        while (nextIndex < idx) {
          cols.push('');
          nextIndex += 1;
        }
        data = cell.getElementsByTagName('Data')[0];
        cols.push(data ? String(data.textContent || '').trim() : '');
        nextIndex += 1;
      });
      return cols;
    }
    if (doc.querySelector('parsererror')) return { error: '无法解析模板表格，请使用下载的导入模板' };
    rows = Array.prototype.slice.call(doc.getElementsByTagName('Row'));
    if (!rows.length) return { error: '文件内容为空，请使用下载的模板填写后重新上传' };
    headers = rowCells(rows[0]);
    dataLines = rows.slice(1).map(rowCells).filter(function (line) {
      return line.some(function (c) { return String(c).trim() !== ''; });
    });
    return buildImportRows(headers, dataLines, function (line) { return line; });
  }

  function parseImportText(text) {
    var raw = String(text || '');
    var lines;
    if (
      /<Workbook[\s>]/i.test(raw) ||
      /urn:schemas-microsoft-com:office:spreadsheet/i.test(raw) ||
      /ss:Workbook/i.test(raw)
    ) {
      return parseImportSpreadsheetML(raw);
    }
    if (/<html[\s>]/i.test(raw) || /<table[\s>]/i.test(raw)) return parseImportHtml(raw);
    lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(function (line) {
      return line.trim() !== '';
    });
    if (!lines.length) return { error: '文件内容为空，请使用下载的模板填写后重新上传' };
    return buildImportRows(parseCsvLine(lines[0]), lines.slice(1), parseCsvLine);
  }

  function handleImportFile(file) {
    var name;
    var reader;
    if (!file) return;
    name = (file.name || '').toLowerCase();
    if (name.endsWith('.xlsx')) {
      importRows = [];
      renderImportTable();
      showImportAlert('暂不支持 .xlsx，请下载模板（.xls）填写后上传，或另存为 CSV');
      UI.showToast('导入失败：请上传 .xls 或 .csv 文件', 'error');
      return;
    }
    reader = new FileReader();
    reader.onload = function (e) {
      var result = parseImportText(e.target.result);
      var errCount;
      if (result.error) {
        importRows = [];
        renderImportTable();
        showImportAlert(result.error);
        UI.showToast('导入失败：' + result.error, 'error');
        return;
      }
      importRows = result.rows;
      renderImportTable();
      errCount = importRows.filter(function (r) { return r.error; }).length;
      if (errCount) {
        showImportAlert('共 ' + importRows.length + ' 行，其中 ' + errCount + ' 行校验失败；确认提交后将默认移除失败数据');
        UI.showToast('有 ' + errCount + ' 行校验失败，确认后将自动移除', 'error');
      } else {
        showImportAlert('共 ' + importRows.length + ' 行，校验通过', 'success');
        UI.showToast('文件解析成功，共 ' + importRows.length + ' 行');
      }
    };
    reader.onerror = function () {
      importRows = [];
      renderImportTable();
      showImportAlert('文件读取失败，请重试');
      UI.showToast('导入失败：文件读取失败', 'error');
    };
    reader.readAsText(file, 'UTF-8');
  }

  function confirmImport() {
    var validRows;
    var removedCount;
    var updated = 0;
    if (!importRows.length) {
      showImportAlert('请先上传文件');
      UI.showToast('请先上传导入文件', 'error');
      return;
    }
    validRows = importRows.filter(function (r) { return !r.error; });
    removedCount = importRows.length - validRows.length;
    if (!validRows.length) {
      showImportAlert('全部数据校验失败，已无可提交内容');
      UI.showToast('导入失败：没有可提交的有效数据', 'error');
      return;
    }
    validRows.forEach(function (row) {
      var existing = findAccountById(row.accountId);
      var product;
      var optimizer;
      if (!existing) return;
      product = row.clientKey ? productByClientKey(row.clientKey) : productByKey(existing.product_key);
      optimizer = row.optimizer || existing.optimizer_name;
      if (row.clientKey && product) {
        existing.product_type = product.type;
        existing.product_key = product.key;
        existing.product_name = product.name;
        existing.product_id = product.productId;
        existing.client_key = product.clientKey || '';
      }
      if (row.platform) {
        existing.product_type = row.platform;
        if (product && product.type !== row.platform) product = null;
      }
      if (row.optimizer) existing.optimizer_name = row.optimizer;
      if (row.status === '启用' || row.status === '禁用') existing.status = row.status;
      if (product) existing.advertiser_name = accountName(product, optimizer);
      existing.updated_at = formatDateTime(new Date());
      updated += 1;
    });
    closeImportModal();
    renderTable();
    if (removedCount) UI.showToast('导入成功：已更新 ' + updated + ' 条，已移除失败数据 ' + removedCount + ' 条');
    else UI.showToast('导入成功：已更新 ' + updated + ' 条账户');
  }

  var editingRowId = '';
  var editPlatform = 'TikTok Minis';

  function findRowById(id) {
    for (var i = 0; i < ALL_ROWS.length; i += 1) {
      if (ALL_ROWS[i].id === id) return ALL_ROWS[i];
    }
    return null;
  }

  function setSegValue(id, value) {
    var seg = $(id);
    if (!seg) return;
    Array.prototype.forEach.call(seg.querySelectorAll('.seg__item'), function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-value') === value);
    });
  }

  function getSegValue(id) {
    var active = $(id).querySelector('.seg__item.is-active');
    return active ? active.getAttribute('data-value') : '';
  }

  function bindSearchSingle(cfg) {
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
        if (valueOf(item) === value) found = item;
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
        var active = itemValue === value ? ' is-active' : '';
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

  function editProductOptions() {
    return PRODUCTS.filter(function (item) { return item.type === editPlatform; });
  }

  var editProductApi = bindSearchSingle({
    wrapId: 'editProductWrap',
    triggerId: 'editProductTrigger',
    panelId: 'editProductPanel',
    labelId: 'editProductLabel',
    listId: 'editProductList',
    searchId: 'editProductSearch',
    clearId: 'editProductClear',
    getOptions: editProductOptions,
    getLabel: function (item) { return item.name; },
    getValue: function (item) { return item.key; },
    getIconHtml: function (item) { return productIconHtml(item.type); }
  });

  var editOptimizerApi = bindSearchSingle({
    wrapId: 'editOptimizerWrap',
    triggerId: 'editOptimizerTrigger',
    panelId: 'editOptimizerPanel',
    labelId: 'editOptimizerLabel',
    listId: 'editOptimizerList',
    searchId: 'editOptimizerSearch',
    clearId: 'editOptimizerClear',
    getOptions: function () { return OPTIMIZERS; },
    getLabel: function (item) { return item; },
    getValue: function (item) { return item; }
  });

  function openEditModal(rowId) {
    var row = findRowById(rowId);
    var product;
    if (!row) return;
    editingRowId = row.id;
    $('editAccountName').value = row.advertiser_name;
    $('editAccountId').value = row.advertiser_id;
    editPlatform = PRODUCT_TYPES.indexOf(row.product_type) >= 0 ? row.product_type : 'TikTok Minis';
    setSegValue('editPlatformSeg', editPlatform);
    product = productByKey(row.product_key);
    editProductApi.setValue(product && product.type === editPlatform ? product.key : '');
    editProductApi.refresh();
    editOptimizerApi.setValue(OPTIMIZERS.indexOf(row.optimizer_name) >= 0 ? row.optimizer_name : '');
    setSegValue('editStatusSeg', row.status === '禁用' ? '禁用' : '启用');
    UI.closePanels();
    UI.openModal('editModal');
  }

  function closeEditModal() {
    editingRowId = '';
    UI.closePanels();
    UI.closeModal('editModal');
  }

  function saveEditModal() {
    var row = findRowById(editingRowId);
    var platform = getSegValue('editPlatformSeg') || 'TikTok Minis';
    var product = productByKey(editProductApi.getValue());
    var optimizer = editOptimizerApi.getValue();
    if (!row) return;
    if (product && product.type !== platform) product = null;
    row.product_type = platform;
    row.status = getSegValue('editStatusSeg') || '启用';
    row.optimizer_name = optimizer;
    if (product) {
      row.product_key = product.key;
      row.product_name = product.name;
      row.product_id = product.productId;
      row.client_key = product.clientKey || '';
      row.advertiser_name = accountName(product, optimizer || row.optimizer_name || '用户A');
    } else {
      row.product_key = '';
      row.product_name = '';
      row.product_id = '';
      row.client_key = '';
    }
    row.updated_at = formatDateTime(new Date());
    closeEditModal();
    renderTable();
    UI.showToast('提交成功');
  }

  $('editPlatformSeg').addEventListener('click', function (e) {
    var btn = e.target.closest('.seg__item');
    var product;
    if (!btn) return;
    editPlatform = btn.getAttribute('data-value') || 'TikTok Minis';
    setSegValue('editPlatformSeg', editPlatform);
    product = productByKey(editProductApi.getValue());
    if (!product || product.type !== editPlatform) editProductApi.setValue('');
    editProductApi.refresh();
  });
  $('editStatusSeg').addEventListener('click', function (e) {
    var btn = e.target.closest('.seg__item');
    if (!btn) return;
    setSegValue('editStatusSeg', btn.getAttribute('data-value'));
  });
  $('editClose').addEventListener('click', closeEditModal);
  $('editCancel').addEventListener('click', closeEditModal);
  $('editSave').addEventListener('click', saveEditModal);

  var batchPlatform = 'TikTok Minis';

  function batchProductOptions() {
    return PRODUCTS.filter(function (item) { return item.type === batchPlatform; });
  }

  function clearBatchError(id) {
    var item = $(id);
    if (item) item.classList.remove('is-error');
  }

  var batchProductApi = bindSearchSingle({
    wrapId: 'batchProductWrap',
    triggerId: 'batchProductTrigger',
    panelId: 'batchProductPanel',
    labelId: 'batchProductLabel',
    listId: 'batchProductList',
    searchId: 'batchProductSearch',
    clearId: 'batchProductClear',
    getOptions: batchProductOptions,
    getLabel: function (item) { return item.name; },
    getValue: function (item) { return item.key; },
    getIconHtml: function (item) { return productIconHtml(item.type); },
    onChange: function (value) {
      if (value) clearBatchError('batchProductItem');
    }
  });

  var batchOptimizerApi = bindSearchSingle({
    wrapId: 'batchOptimizerWrap',
    triggerId: 'batchOptimizerTrigger',
    panelId: 'batchOptimizerPanel',
    labelId: 'batchOptimizerLabel',
    listId: 'batchOptimizerList',
    searchId: 'batchOptimizerSearch',
    clearId: 'batchOptimizerClear',
    getOptions: function () { return OPTIMIZERS; },
    getLabel: function (item) { return item; },
    getValue: function (item) { return item; },
    onChange: function (value) {
      if (value) clearBatchError('batchOptimizerItem');
    }
  });

  function openBatchProductModal() {
    batchPlatform = 'TikTok Minis';
    setSegValue('batchPlatformSeg', batchPlatform);
    batchProductApi.setValue('');
    batchProductApi.refresh();
    clearBatchError('batchProductItem');
    UI.closePanels();
    UI.openModal('batchProductModal');
  }

  function closeBatchProductModal() {
    UI.closePanels();
    UI.closeModal('batchProductModal');
  }

  function saveBatchProduct() {
    var platform = getSegValue('batchPlatformSeg') || 'TikTok Minis';
    var product = productByKey(batchProductApi.getValue());
    if (!product || product.type !== platform) {
      $('batchProductItem').classList.add('is-error');
      return;
    }
    clearBatchError('batchProductItem');
    ALL_ROWS.forEach(function (row) {
      if (!selected[row.id]) return;
      row.product_type = product.type;
      row.product_key = product.key;
      row.product_name = product.name;
      row.product_id = product.productId;
      row.client_key = product.clientKey || '';
      row.advertiser_name = accountName(product, row.optimizer_name || '用户A');
      row.updated_at = formatDateTime(new Date());
    });
    selected = {};
    closeBatchProductModal();
    renderTable();
    UI.showToast('提交成功');
  }

  function openBatchOptimizerModal() {
    batchOptimizerApi.setValue('');
    clearBatchError('batchOptimizerItem');
    UI.closePanels();
    UI.openModal('batchOptimizerModal');
  }

  function closeBatchOptimizerModal() {
    UI.closePanels();
    UI.closeModal('batchOptimizerModal');
  }

  function saveBatchOptimizer() {
    var optimizer = batchOptimizerApi.getValue();
    if (!optimizer) {
      $('batchOptimizerItem').classList.add('is-error');
      return;
    }
    clearBatchError('batchOptimizerItem');
    ALL_ROWS.forEach(function (row) {
      var product;
      if (!selected[row.id]) return;
      row.optimizer_name = optimizer;
      product = productByKey(row.product_key);
      if (product) row.advertiser_name = accountName(product, optimizer);
      row.updated_at = formatDateTime(new Date());
    });
    selected = {};
    closeBatchOptimizerModal();
    renderTable();
    UI.showToast('提交成功');
  }

  function openBatchStatusModal() {
    setSegValue('batchStatusSeg', '启用');
    UI.closePanels();
    UI.openModal('batchStatusModal');
  }

  function closeBatchStatusModal() {
    UI.closeModal('batchStatusModal');
  }

  function saveBatchStatus() {
    var status = getSegValue('batchStatusSeg') || '启用';
    ALL_ROWS.forEach(function (row) {
      if (!selected[row.id]) return;
      row.status = status;
      row.updated_at = formatDateTime(new Date());
    });
    selected = {};
    closeBatchStatusModal();
    renderTable();
    UI.showToast('提交成功');
  }

  $('batchPlatformSeg').addEventListener('click', function (e) {
    var btn = e.target.closest('.seg__item');
    var product;
    if (!btn) return;
    batchPlatform = btn.getAttribute('data-value') || 'TikTok Minis';
    setSegValue('batchPlatformSeg', batchPlatform);
    product = productByKey(batchProductApi.getValue());
    if (!product || product.type !== batchPlatform) batchProductApi.setValue('');
    batchProductApi.refresh();
  });
  $('batchStatusSeg').addEventListener('click', function (e) {
    var btn = e.target.closest('.seg__item');
    if (!btn) return;
    setSegValue('batchStatusSeg', btn.getAttribute('data-value'));
  });
  $('batchProductClose').addEventListener('click', closeBatchProductModal);
  $('batchProductCancel').addEventListener('click', closeBatchProductModal);
  $('batchProductSave').addEventListener('click', saveBatchProduct);
  $('batchOptimizerClose').addEventListener('click', closeBatchOptimizerModal);
  $('batchOptimizerCancel').addEventListener('click', closeBatchOptimizerModal);
  $('batchOptimizerSave').addEventListener('click', saveBatchOptimizer);
  $('batchStatusClose').addEventListener('click', closeBatchStatusModal);
  $('batchStatusCancel').addEventListener('click', closeBatchStatusModal);
  $('batchStatusSave').addEventListener('click', saveBatchStatus);

  $('importBtn').addEventListener('click', openImportModal);
  $('importClose').addEventListener('click', closeImportModal);
  $('importCancel').addEventListener('click', closeImportModal);
  $('uploadBtn').addEventListener('click', function () { $('importFile').click(); });
  $('importFile').addEventListener('change', function () {
    var file = this.files && this.files[0];
    handleImportFile(file);
    this.value = '';
  });
  $('downloadTemplateBtn').addEventListener('click', downloadTemplate);
  $('importSave').addEventListener('click', confirmImport);

  $('addAccountBtn').addEventListener('click', function () {
    waitingAuthReturn = true;
    openedAuthAt = Date.now();
    window.open(TIKTOK_AUTH_URL, '_blank', 'noopener,noreferrer');
  });
  document.addEventListener('visibilitychange', tryShowOAuthPick);
  window.addEventListener('focus', tryShowOAuthPick);
  $('oauthSearchBtn').addEventListener('click', applyOAuthFilter);
  $('oauthKw').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') applyOAuthFilter();
  });
  $('oauthCheckAll').addEventListener('change', function () {
    var checked = this.checked;
    oauthFilteredRows.forEach(function (row) {
      if (checked) oauthSelectedIds[row.accountId] = true;
      else delete oauthSelectedIds[row.accountId];
    });
    renderOAuthPickTable();
  });
  $('oauthPickBody').addEventListener('change', function (e) {
    var input = e.target.closest('[data-oauth-check]');
    if (!input) return;
    var id = input.getAttribute('data-oauth-check');
    if (input.checked) oauthSelectedIds[id] = true;
    else delete oauthSelectedIds[id];
    renderOAuthPickTable();
  });
  $('oauthPickClose').addEventListener('click', closeOAuthPickModal);
  $('oauthPickCancel').addEventListener('click', closeOAuthPickModal);
  $('oauthPickSave').addEventListener('click', saveOAuthPickModal);

  $('authDeleteOk').addEventListener('click', function () {
    if (!pendingAuthDeleteId) return;
    var id = pendingAuthDeleteId;
    var row = null;
    authRows.forEach(function (item) { if (item.id === id) row = item; });
    pendingAuthDeleteId = null;
    UI.closeModal('authDeleteModal');
    if (!row || row.accountCount > 0) return;
    authRows = authRows.filter(function (item) { return item.id !== id; });
    draft.authUsers = draft.authUsers.filter(function (name) { return name !== row.userName; });
    applied.authUsers = applied.authUsers.filter(function (name) { return name !== row.userName; });
    if (authUserMulti) authUserMulti.render();
    applyAuthFilter();
    UI.showToast('删除成功');
  });

  syncAuthUserPanel();
  syncFilterVisibility();
  renderAuthTable();
  applyQuery();
})();
