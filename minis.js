/* 投放系统 · 管理 / 产品列表 / 小游戏
 * 目录来自海外中台小游戏。本页只维护点击链接，同步时保留已填链接。
 */
(function () {
  'use strict';

  var UI = window.ProductUI;
  if (!UI) return;

  var escapeHtml = UI.escapeHtml;
  var COPY_ICON = UI.COPY_ICON;

  var GROUPS = ['奇异果', '苹果组', '无花果', '坚果组', '硕果组', '外部联运', '其他'];
  var TYPES = ['分类', '塔防', '益智', '逆袭', '难度', '消除', '找茬', '其他'];
  var SERIES = ['Jam系列', 'Sort系列', 'Match系列', 'ASMR系列', 'Word系列', 'unknown'];
  var CATEGORIES = ['动作', '匹配', '解谜', '竞速', '角色扮演', '射击', '模拟', '体育', '策略', '派对', '桌面', '其它'];
  var OWNERS = Array.from({ length: 8 }, function (_, i) { return '用户' + String.fromCharCode(65 + i); });

  /* 来自示例数据.xlsx · 小游戏 / TikTok 产品树 */
  var SEED = [
    ['44760363', 'Fun Overload', '奇异果'],
    ['44760156', 'Mind Block', '奇异果'],
    ['44760356', 'Brainy Find', '奇异果'],
    ['44760195', 'Life Story', '奇异果'],
    ['44760190', 'Brain Mix', '奇异果'],
    ['44758636', 'Flow Mix', '奇异果'],
    ['44759962', 'Life Choice', '奇异果'],
    ['44759891', 'Life Path', '奇异果'],
    ['44760174', 'Brainy Breakout', '奇异果'],
    ['44760164', 'Mind Escape', '奇异果'],
    ['44759426', 'Flow Master', '奇异果'],
    ['44759081', 'Brainy Win', '奇异果'],
    ['44758892', 'Path Flow', '奇异果'],
    ['44760064', 'Wukong Out', '奇异果'],
    ['44759538', 'Help Wukong', '奇异果'],
    ['44758558', 'Draw Rescue Wukong', '奇异果'],
    ['44759245', 'Save Wukong', '奇异果'],
    ['44760080', 'Tidy Hotpot', '奇异果'],
    ['44760005', 'Food Sort', '奇异果'],
    ['44759186', 'Hotpot Master', '奇异果'],
    ['44758887', 'Hyper Desh', '外部联运'],
    ['44760172', 'Sort Coin', '奇异果'],
    ['44759899', 'Sort Coin Master', '奇异果'],
    ['44758632', 'Piggy Coin Sort', '奇异果'],
    ['44759913', 'Sand Ball Drop', '奇异果'],
    ['44759682', 'Ball Sand', '奇异果'],
    ['44759628', 'Ball Run', '奇异果'],
    ['44759541', 'Brain Queen', '奇异果'],
    ['44758400', 'Brain Power Queen', '奇异果'],
    ['44758366', 'Eye Track', '奇异果'],
    ['44760215', '言葉を探す', '奇异果'],
    ['44759979', '文字の宝探し！', '奇异果'],
    ['44759157', '文字の奥に小文字', '奇异果'],
    ['44760160', '文字の中に文字!', '奇异果'],
    ['44760022', 'Count Sprint', '外部联运'],
    ['44759917', 'Digit Merge', '外部联运'],
    ['44759513', 'Diamond Match', '无花果'],
    ['44758889', 'Diamond ASMR', '无花果'],
    ['44758476', 'Gems Color Puzzle', '无花果'],
    ['44759278', 'Brain Power King', '奇异果'],
    ['44760120', 'Word Dig', '奇异果'],
    ['44759570', 'Cute Gun Bump', '外部联运'],
    ['44758408', 'Word Player', '奇异果'],
    ['44759961', 'Card Group', '奇异果'],
    ['44759636', 'Dual Gun Clash', '外部联运'],
    ['44758881', 'Card Assort', '奇异果'],
    ['44759773', 'Tile Stack!', '奇异果'],
    ['44758456', 'Sort Stack', '奇异果'],
    ['44760310', 'Mad Moto', '外部联运'],
    ['44760203', 'Color Tetris', '奇异果']
  ];

  function inferCategory(name) {
    var n = String(name).toLowerCase();
    if (/wukong|rescue|save|draw/.test(n)) return '动作';
    if (/gun|clash/.test(n)) return '射击';
    if (/match/.test(n)) return '匹配';
    if (/moto|sprint|run/.test(n)) return '竞速';
    if (/hotpot|food|tidy/.test(n)) return '模拟';
    if (/^life\b/.test(n)) return '角色扮演';
    if (/word|文字|言葉|dig|player/.test(n)) return '解谜';
    if (/card|tile|tetris|stack|coin|piggy/.test(n)) return '桌面';
    if (/ball|sand/.test(n)) return '体育';
    if (/fun|hyper|overload/.test(n)) return '派对';
    if (/diamond|gems|asmr|color/.test(n)) return '策略';
    if (/brain|mind|flow|path|escape|find|eye|queen|king|mix|block|merge|count/.test(n)) return '解谜';
    return '其它';
  }

  function inferSeries(name) {
    var n = String(name).toLowerCase();
    if (/sort|stack|tile|tetris/.test(n)) return 'Sort系列';
    if (/match/.test(n)) return 'Match系列';
    if (/word|文字|言葉|dig/.test(n)) return 'Word系列';
    if (/asmr/.test(n)) return 'ASMR系列';
    if (/jam/.test(n)) return 'Jam系列';
    return 'unknown';
  }

  function makeAppId(productId) {
    return ('74' + String(productId) + '000000000').slice(0, 19);
  }

  var SLUG_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
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

  function sampleSlug(productId) {
    var n = parseInt(productId, 10) || 1;
    var slug = '';
    var i;
    for (i = 0; i < 11; i += 1) {
      n = (Math.imul(n, 1103515245) + 12345 + i) >>> 0;
      slug += SLUG_CHARS[n % SLUG_CHARS.length];
    }
    return slug;
  }

  function sampleClickLink(productId) {
    return 'https://www.tiktok.com/minis/' + sampleSlug(productId);
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  function formatStamp(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' +
      pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }

  function buildCatalog() {
    var list = SEED.map(function (item, i) {
      var created = new Date(2026, 7, 28, 18, 40, 0);
      created.setDate(created.getDate() - i);
      created.setHours(9 + (i % 8), (i * 7) % 60, (i * 13) % 60, 0);
      var updated = new Date(created.getTime());
      if (i % 5 === 0) updated.setDate(updated.getDate() + 2);
      return {
        id: item[0],
        name: item[1],
        platform: 'TikTok',
        appId: makeAppId(item[0]),
        bizType: '小游戏',
        group: item[2],
        category: inferCategory(item[1]),
        type: TYPES[i % TYPES.length],
        series: inferSeries(item[1]),
        owner: OWNERS[i % OWNERS.length],
        status: i % 9 === 3 ? '禁用' : '启用',
        clientKey: sampleClientKey(item[0]),
        clientSecret: 'cs_' + item[0],
        icon: '',
        clickLink: i % 2 === 0 ? sampleClickLink(item[0]) : '',
        createdAt: formatStamp(created),
        updatedAt: formatStamp(updated)
      };
    });
    list.unshift({
      id: '44761001',
      name: 'Vivid Minis',
      platform: 'TikTok',
      appId: makeAppId('44761001'),
      bizType: '短剧',
      group: '其他',
      category: '',
      type: '其他',
      series: 'unknown',
      owner: OWNERS[0],
      status: '启用',
      clientKey: sampleClientKey('44761001'),
      clientSecret: 'cs_44761001',
      icon: '',
      clickLink: sampleClickLink('44761001'),
      createdAt: '2026-09-10 10:00:00',
      updatedAt: '2026-09-10 10:00:00'
    });
    return list;
  }

  var rows = buildCatalog();

  var state = {
    keyword: '',
    clientKey: '',
    categories: [],
    groups: [],
    types: [],
    owners: [],
    status: '',
    page: 1,
    pageSize: 20,
    editingId: null
  };
  var filterMultis = {};
  var filterSingles = {};

  function nowText() {
    return formatStamp(new Date());
  }

  function formatDisplayTime(str) {
    if (!str) return '-';
    return String(str).replace('T', ' ').slice(0, 19);
  }

  function getFiltered() {
    var kw = state.keyword.trim().toLowerCase();
    return rows
      .filter(function (r) {
        if (kw && String(r.name).toLowerCase().indexOf(kw) === -1 && String(r.id).toLowerCase().indexOf(kw) === -1) return false;
        if (state.clientKey && String(r.clientKey || '').toLowerCase().indexOf(state.clientKey.trim().toLowerCase()) === -1) return false;
        if (state.categories.length && state.categories.indexOf(r.category) === -1) return false;
        if (state.groups.length && state.groups.indexOf(r.group) === -1) return false;
        if (state.types.length && state.types.indexOf(r.type) === -1) return false;
        if (state.owners.length && state.owners.indexOf(r.owner) === -1) return false;
        if (state.status && r.status !== state.status) return false;
        return true;
      })
      .slice()
      .sort(function (a, b) { return String(b.createdAt).localeCompare(String(a.createdAt)); });
  }

  function platformCell(platform) {
    return escapeHtml(platform);
  }

  function clickLinkCell(value) {
    var link = String(value || '').trim();
    if (!link) return '<span class="col-link__text">-</span>';
    var href = /^https?:\/\//i.test(link) ? link : '';
    if (!href) return '<span class="col-link__text" title="' + escapeHtml(link) + '">' + escapeHtml(link) + '</span>';
    return '<a class="link col-link__text" href="' + escapeHtml(href) + '" target="_blank" rel="noopener noreferrer" title="' + escapeHtml(link) + '">' + escapeHtml(link) + '</a>';
  }

  function idCell(value, title) {
    return (
      '<span class="cell-id cell-id--trail">' +
        '<span class="cell-id__text" title="' + escapeHtml(value) + '">' + escapeHtml(value) + '</span>' +
        '<button class="copy-btn" type="button" data-copy="' + escapeHtml(value) + '" title="' + escapeHtml(title) + '" aria-label="复制">' + COPY_ICON + '</button>' +
      '</span>'
    );
  }

  function renderTable() {
    var list = getFiltered();
    var total = list.length;
    var totalPages = Math.max(1, Math.ceil(total / state.pageSize) || 1);
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * state.pageSize;
    var pageRows = list.slice(start, start + state.pageSize);
    var tbody = UI.$('tableBody');
    var emptyTip = UI.$('emptyTip');

    if (!pageRows.length) {
      tbody.innerHTML = '';
      emptyTip.hidden = false;
    } else {
      emptyTip.hidden = true;
      tbody.innerHTML = pageRows.map(function (r) {
        return (
          '<tr data-id="' + escapeHtml(r.id) + '">' +
            '<td class="col-name is-freeze" title="' + escapeHtml(r.name) + '">' +
              '<span class="product-cell">' +
                (r.icon
                  ? '<img class="product-cell__icon product-cell__icon--img" src="' + escapeHtml(r.icon) + '" alt="" />'
                  : '<span class="product-cell__icon" aria-hidden="true"></span>') +
                '<span class="product-cell__name">' + escapeHtml(r.name) + '</span>' +
              '</span>' +
            '</td>' +
            '<td class="col-platform">' + platformCell(r.platform) + '</td>' +
            '<td class="col-id">' + idCell(r.id, '复制产品ID') + '</td>' +
            '<td class="col-key">' + idCell(r.clientKey, '复制 Client key') + '</td>' +
            '<td class="col-link">' + clickLinkCell(r.clickLink) + '</td>' +
            '<td>' + escapeHtml(r.category || '-') + '</td>' +
            '<td>' + escapeHtml(r.type) + '</td>' +
            '<td>' + escapeHtml(r.group) + '</td>' +
            '<td>' + escapeHtml(r.owner) + '</td>' +
            '<td>' + UI.statusTag(r.status) + '</td>' +
            '<td title="' + escapeHtml(formatDisplayTime(r.createdAt)) + '">' + escapeHtml(formatDisplayTime(r.createdAt)) + '</td>' +
            '<td title="' + escapeHtml(formatDisplayTime(r.updatedAt || r.createdAt)) + '">' + escapeHtml(formatDisplayTime(r.updatedAt || r.createdAt)) + '</td>' +
            '<td class="col-action"><div class="action-links">' +
              '<button class="link" type="button" data-action="edit" data-id="' + escapeHtml(r.id) + '">编辑</button>' +
            '</div></td>' +
          '</tr>'
        );
      }).join('');
    }

    UI.renderPagination({
      containerId: 'pagination',
      total: total,
      page: state.page,
      pageSize: state.pageSize
    });
    if (window.ColResize) ColResize.refresh(UI.$('dataTable'));
  }

  function fillSinglePanel(panelId, options) {
    UI.$(panelId).innerHTML = options.map(function (opt) {
      return '<div class="single-option" data-value="' + escapeHtml(opt) + '">' + escapeHtml(opt) + '</div>';
    }).join('');
  }

  function bindMulti(cfg) {
    return UI.bindMultiSelect({
      wrapId: cfg.wrapId,
      triggerId: cfg.triggerId,
      panelId: cfg.panelId,
      labelId: cfg.labelId,
      listId: cfg.listId,
      selectedId: cfg.selectedId || null,
      searchId: cfg.searchId || null,
      countId: cfg.countId || null,
      selectAllId: cfg.selectAllId || null,
      clearId: cfg.clearId || null,
      prefix: cfg.prefix,
      getOptions: cfg.getOptions,
      getSelected: cfg.getSelected,
      setSelected: cfg.setSelected
    });
  }

  function refreshFilterSingleLabel(cfg, value) {
    var allToken = cfg.allToken || '';
    var v = value || allToken;
    var label = UI.$(cfg.labelId);
    var wrap = UI.$(cfg.wrapId);
    var panel = UI.$(cfg.panelId);
    if (label) {
      if (!v) label.innerHTML = cfg.prefix + '<span class="muted">请选择</span>';
      else label.innerHTML = cfg.prefix + escapeHtml(v);
    }
    if (wrap) wrap.classList.toggle('has-value', !!value && value !== allToken);
    if (panel) {
      panel.querySelectorAll('.single-option').forEach(function (opt) {
        opt.classList.toggle('is-active', (opt.getAttribute('data-value') || '') === String(value || ''));
      });
    }
  }

  function bindFilterSingle(cfg) {
    var allToken = cfg.allToken || '';
    var api = UI.bindSingleSelect({
      wrapId: cfg.wrapId,
      triggerId: cfg.triggerId,
      panelId: cfg.panelId,
      labelId: cfg.labelId,
      clearId: cfg.clearId,
      prefix: cfg.prefix,
      getValue: function () {
        var v = cfg.getValue() || '';
        return allToken && v === allToken ? '' : v;
      },
      onChange: function (v) {
        cfg.onChange(v || allToken || '');
      },
      formatValue: allToken ? function (v) { return v || allToken; } : undefined
    });
    if (allToken) refreshFilterSingleLabel(cfg, cfg.getValue());
    return {
      syncLabel: function (v) {
        if (allToken) refreshFilterSingleLabel(cfg, v || allToken);
        else if (api && api.syncLabel) api.syncLabel(v || '');
      }
    };
  }

  function openForm(row) {
    state.editingId = row.id;
    UI.$('formModalTitle').textContent = '编辑产品';
    UI.setSegValue('platformSeg', row.platform || 'TikTok');
    UI.$('formName').value = row.name || '';
    UI.$('formClickLink').value = row.clickLink || '';
    if (formLinkClear) formLinkClear.sync();
    UI.openModal('formModal');
  }

  function closeForm() {
    UI.closeModal('formModal');
    state.editingId = null;
    UI.closePanels();
  }

  function submitForm() {
    var link = UI.$('formClickLink').value.trim();
    var target = rows.find(function (r) { return r.id === state.editingId; });
    if (target) {
      target.clickLink = link;
      target.updatedAt = nowText();
    }
    UI.showToast('提交成功');
    closeForm();
    renderTable();
  }

  function syncCatalog() {
    var kept = {};
    rows.forEach(function (row) { kept[row.id] = row.clickLink || ''; });
    rows = buildCatalog().map(function (row) {
      if (Object.prototype.hasOwnProperty.call(kept, row.id)) row.clickLink = kept[row.id];
      return row;
    });
    state.page = 1;
    UI.showToast('同步成功');
    renderTable();
  }

  filterMultis = {
    category: bindMulti({
      wrapId: 'categoryWrap', triggerId: 'categoryTrigger', panelId: 'categoryPanel',
      labelId: 'categoryLabel', listId: 'categoryList', selectedId: 'categorySelected',
      searchId: 'categorySearch', countId: 'categoryCount', selectAllId: 'categorySelectAll', clearId: 'categoryClear',
      prefix: '类别：', getOptions: function () { return CATEGORIES; },
      getSelected: function () { return state.categories; },
      setSelected: function (arr) { state.categories = arr; }
    }),
    group: bindMulti({
      wrapId: 'groupWrap', triggerId: 'groupTrigger', panelId: 'groupPanel',
      labelId: 'groupLabel', listId: 'groupList', clearId: 'groupClear',
      prefix: '产品组：', getOptions: function () { return GROUPS; },
      getSelected: function () { return state.groups; },
      setSelected: function (arr) { state.groups = arr; }
    }),
    type: bindMulti({
      wrapId: 'typeWrap', triggerId: 'typeTrigger', panelId: 'typePanel',
      labelId: 'typeLabel', listId: 'typeList', selectedId: 'typeSelected',
      searchId: 'typeSearch', countId: 'typeCount', selectAllId: 'typeSelectAll', clearId: 'typeClear',
      prefix: '产品类型：', getOptions: function () { return TYPES; },
      getSelected: function () { return state.types; },
      setSelected: function (arr) { state.types = arr; }
    }),
    owner: bindMulti({
      wrapId: 'ownerWrap', triggerId: 'ownerTrigger', panelId: 'ownerPanel',
      labelId: 'ownerLabel', listId: 'ownerList', selectedId: 'ownerSelected',
      searchId: 'ownerSearch', countId: 'ownerCount', selectAllId: 'ownerSelectAll', clearId: 'ownerClear',
      prefix: '负责人：', getOptions: function () { return OWNERS; },
      getSelected: function () { return state.owners; },
      setSelected: function (arr) { state.owners = arr; }
    })
  };

  [
    { id: 'categoryPanelClear', key: 'category', field: 'categories' },
    { id: 'typePanelClear', key: 'type', field: 'types' },
    { id: 'ownerPanelClear', key: 'owner', field: 'owners' }
  ].forEach(function (item) {
    var btn = UI.$(item.id);
    if (!btn || !filterMultis[item.key]) return;
    btn.addEventListener('click', function () {
      state[item.field] = [];
      filterMultis[item.key].render();
    });
  });

  ['categoryClear', 'groupClear', 'typeClear', 'ownerClear'].forEach(function (id) {
    var el = UI.$(id);
    if (!el) return;
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      UI.closePanels();
    });
  });

  filterSingles = {
    status: bindFilterSingle({
      wrapId: 'statusWrap', triggerId: 'statusTrigger', panelId: 'statusPanel',
      labelId: 'statusLabel', clearId: 'statusClear',
      prefix: '状态：',
      getValue: function () { return state.status; },
      onChange: function (v) { state.status = v; }
    })
  };

  var formLinkClear = UI.bindInputClearable({ wrapId: 'formClickLinkWrap' });
  UI.bindSeg('platformSeg');

  UI.bindPagination({
    containerId: 'pagination',
    getTotal: function () { return getFiltered().length; },
    getPage: function () { return state.page; },
    getPageSize: function () { return state.pageSize; },
    onPageChange: function (page) { state.page = page; renderTable(); },
    onPageSizeChange: function (size) { state.pageSize = size; state.page = 1; renderTable(); }
  });

  function doSearch() {
    state.keyword = UI.$('filterKeyword').value || '';
    state.clientKey = UI.$('filterClientKey').value || '';
    state.page = 1;
    renderTable();
  }

  function doReset() {
    UI.$('filterKeyword').value = '';
    UI.$('filterClientKey').value = '';
    state.keyword = '';
    state.clientKey = '';
    state.categories = [];
    state.groups = [];
    state.types = [];
    state.owners = [];
    state.status = '';
    state.page = 1;
    ['category', 'group', 'type', 'owner'].forEach(function (key) {
      var api = filterMultis[key];
      if (api && api.render) api.render();
    });
    filterSingles.status.syncLabel('');
    renderTable();
  }

  UI.$('searchBtn').addEventListener('click', doSearch);
  UI.$('resetBtn').addEventListener('click', doReset);
  UI.$('syncBtn').addEventListener('click', syncCatalog);
  UI.$('filterKeyword').addEventListener('keydown', function (e) { if (e.key === 'Enter') doSearch(); });
  UI.$('filterClientKey').addEventListener('keydown', function (e) { if (e.key === 'Enter') doSearch(); });
  UI.$('formCancelBtn').addEventListener('click', closeForm);
  UI.$('formModalClose').addEventListener('click', closeForm);
  UI.$('formSubmitBtn').addEventListener('click', submitForm);

  UI.$('tableBody').addEventListener('click', function (e) {
    var copyBtn = e.target.closest('[data-copy]');
    if (copyBtn) {
      UI.copyText(copyBtn.getAttribute('data-copy'));
      return;
    }
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var id = btn.getAttribute('data-id');
    var row = rows.find(function (r) { return r.id === id; });
    if (row && btn.getAttribute('data-action') === 'edit') openForm(row);
  });

  UI.$('formModal').addEventListener('click', function (e) {
    if (e.target === UI.$('formModal')) e.stopPropagation();
  });

  var importRows = [];

  function findByClientKey(key) {
    var i;
    for (i = 0; i < rows.length; i += 1) {
      if (rows[i].clientKey === key) return rows[i];
    }
    return null;
  }

  function resetImportNotice() {
    UI.$('importAlert').classList.remove('is-show', 'is-success');
    UI.$('importAlertText').textContent = '';
  }

  function showImportAlert(text, type) {
    UI.$('importAlertText').textContent = text;
    UI.$('importAlert').classList.add('is-show');
    UI.$('importAlert').classList.toggle('is-success', type === 'success');
  }

  function renderImportTable() {
    var body = UI.$('importBody');
    var empty = UI.$('importEmpty');
    if (!importRows.length) {
      body.innerHTML = '';
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    body.innerHTML = importRows.map(function (row) {
      return '<tr>' +
        '<td title="' + escapeHtml(row.clientKey) + '">' + escapeHtml(row.clientKey || '-') + '</td>' +
        '<td title="' + escapeHtml(row.clickLink) + '">' + escapeHtml(row.clickLink || '-') + '</td>' +
        '<td class="col-error">' + escapeHtml(row.error || '') + '</td>' +
      '</tr>';
    }).join('');
    if (window.ColResize) ColResize.refresh(UI.$('importTable'));
  }

  function openImportModal() {
    importRows = [];
    resetImportNotice();
    renderImportTable();
    UI.$('importFile').value = '';
    UI.openModal('importModal');
    if (window.ColResize) ColResize.refresh(UI.$('importTable'));
  }

  function closeImportModal() {
    UI.closeModal('importModal');
  }

  function downloadTemplate() {
    var sampleKey = rows[0] ? rows[0].clientKey : sampleClientKey('44761001');
    var emptyRows = '';
    var i;
    for (i = 0; i < 20; i += 1) {
      emptyRows +=
        '<Row>' +
        '<Cell ss:StyleID="sText"><Data ss:Type="String"></Data></Cell>' +
        '<Cell ss:StyleID="sCell"><Data ss:Type="String"></Data></Cell>' +
        '</Row>';
    }
    var xml =
      '<?xml version="1.0"?>' +
      '<?mso-application progid="Excel.Sheet"?>' +
      '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ' +
      'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' +
      '<Styles>' +
      '<Style ss:ID="sCell"><Alignment ss:Vertical="Center"/><Font ss:FontName="微软雅黑" ss:Size="10"/></Style>' +
      '<Style ss:ID="sText"><Alignment ss:Vertical="Center"/><Font ss:FontName="微软雅黑" ss:Size="10"/><NumberFormat ss:Format="@"/></Style>' +
      '</Styles>' +
      '<Worksheet ss:Name="导入模板">' +
      '<Table>' +
      '<Column ss:StyleID="sText" ss:Width="180"/>' +
      '<Column ss:StyleID="sCell" ss:Width="320"/>' +
      '<Row>' +
      '<Cell ss:StyleID="sText"><Data ss:Type="String">Client key</Data></Cell>' +
      '<Cell ss:StyleID="sCell"><Data ss:Type="String">点击链接</Data></Cell>' +
      '</Row>' +
      '<Row>' +
      '<Cell ss:StyleID="sText"><Data ss:Type="String">' + sampleKey + '</Data></Cell>' +
      '<Cell ss:StyleID="sCell"><Data ss:Type="String">' + ((rows[0] && rows[0].clickLink) || sampleClickLink(rows[0] ? rows[0].id : '44761001')) + '</Data></Cell>' +
      '</Row>' +
      emptyRows +
      '</Table>' +
      '</Worksheet>' +
      '</Workbook>';
    var blob = new Blob(['\uFEFF' + xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '小游戏点击链接导入模板.xls';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    UI.showToast('模板已下载');
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
          if (line[i + 1] === '"') { cur += '"'; i += 1; }
          else inQuotes = false;
        } else cur += ch;
      } else if (ch === '"') inQuotes = true;
      else if (ch === ',' || ch === '\t') { result.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    result.push(cur.trim());
    return result;
  }

  function normalizeHeader(h) {
    return String(h || '').replace(/^\uFEFF/, '').trim().toLowerCase().replace(/\s+/g, '');
  }

  function validateImportRow(row, seen) {
    var errors = [];
    if (!row.clientKey) errors.push('Client key 不能为空');
    else if (seen[row.clientKey]) errors.push('Client key 重复');
    else if (!findByClientKey(row.clientKey)) errors.push('Client key 无法匹配');
    if (row.clientKey) seen[row.clientKey] = true;
    if (!row.clickLink) errors.push('点击链接不能为空');
    return errors.join('；');
  }

  function buildImportRows(headers, dataLines, splitLine) {
    var keyIndex = -1;
    var linkIndex = -1;
    var seen = {};
    var list = [];
    headers.forEach(function (h, i) {
      var key = normalizeHeader(h);
      if (key === 'clientkey' || key === 'client key') keyIndex = i;
      else if (key === '点击链接' || key === 'clicklink') linkIndex = i;
    });
    if (keyIndex < 0 || linkIndex < 0) return { error: '表头不正确，需包含：Client key、点击链接' };
    dataLines.forEach(function (line) {
      var cols = splitLine(line);
      var row = {
        clientKey: String(cols[keyIndex] == null ? '' : cols[keyIndex]).trim(),
        clickLink: String(cols[linkIndex] == null ? '' : cols[linkIndex]).trim(),
        error: ''
      };
      row.error = validateImportRow(row, seen);
      list.push(row);
    });
    if (!list.length) return { error: '未解析到有效数据行，请检查文件内容' };
    return { rows: list };
  }

  function parseImportHtml(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var table = doc.querySelector('table');
    var trs;
    if (!table) return { error: '无法解析模板表格，请使用下载的导入模板' };
    trs = Array.prototype.slice.call(table.querySelectorAll('tr'));
    if (!trs.length) return { error: '文件内容为空，请使用下载的模板填写后重新上传' };
    return buildImportRows(
      Array.prototype.map.call(trs[0].querySelectorAll('td,th'), function (cell) { return (cell.textContent || '').trim(); }),
      trs.slice(1).map(function (tr) {
        return Array.prototype.map.call(tr.querySelectorAll('td,th'), function (cell) { return (cell.textContent || '').trim(); });
      }).filter(function (line) { return line.some(function (c) { return String(c).trim() !== ''; }); }),
      function (line) { return line; }
    );
  }

  function parseSpreadsheetML(xmlText) {
    var doc = new DOMParser().parseFromString(xmlText, 'application/xml');
    var rowNodes;
    var lines;
    if (doc.querySelector('parsererror')) return { error: '无法解析模板表格，请使用下载的导入模板' };
    rowNodes = doc.getElementsByTagName('Row');
    if (!rowNodes.length) return { error: '文件内容为空，请使用下载的模板填写后重新上传' };
    lines = Array.prototype.map.call(rowNodes, function (row) {
      var cells = row.getElementsByTagName('Cell');
      var values = [];
      var cursor = 1;
      Array.prototype.forEach.call(cells, function (cell) {
        var index = Number(cell.getAttribute('ss:Index') || cell.getAttribute('Index') || cursor);
        var data = cell.getElementsByTagName('Data')[0];
        if (!(index > 0)) index = cursor;
        while (values.length < index - 1) values.push('');
        values.push(data ? (data.textContent || '').trim() : '');
        cursor = index + 1;
      });
      return values;
    }).filter(function (line) { return line.some(function (c) { return String(c).trim() !== ''; }); });
    if (!lines.length) return { error: '文件内容为空，请使用下载的模板填写后重新上传' };
    return buildImportRows(lines[0], lines.slice(1), function (line) { return line; });
  }

  function parseImportText(text) {
    var trimmed = String(text || '').replace(/^\uFEFF/, '');
    var lines;
    if (trimmed.indexOf('<Workbook') !== -1) return parseSpreadsheetML(trimmed);
    if (trimmed.indexOf('<html') !== -1 || trimmed.indexOf('<table') !== -1) return parseImportHtml(trimmed);
    lines = trimmed.split(/\r?\n/).filter(function (line) { return line.trim() !== ''; });
    if (!lines.length) return { error: '文件内容为空，请使用下载的模板填写后重新上传' };
    return buildImportRows(parseCsvLine(lines[0]), lines.slice(1), parseCsvLine);
  }

  function applyParsedImport(result) {
    var errCount;
    if (result.error) {
      importRows = [];
      renderImportTable();
      showImportAlert(result.error);
      UI.showToast(result.error, 'error');
      return;
    }
    importRows = result.rows;
    renderImportTable();
    errCount = importRows.filter(function (r) { return r.error; }).length;
    if (errCount) showImportAlert('共 ' + importRows.length + ' 行，其中 ' + errCount + ' 行校验失败；确认提交后将默认移除失败数据');
    else {
      showImportAlert('共 ' + importRows.length + ' 行，校验通过', 'success');
      UI.showToast('文件解析成功，共 ' + importRows.length + ' 行');
    }
  }

  function readImportFile(file) {
    var reader = new FileReader();
    var name = (file.name || '').toLowerCase();
    if (name.endsWith('.xlsx')) {
      importRows = [];
      renderImportTable();
      showImportAlert('暂不支持 .xlsx，请下载模板（.xls）填写后上传，或另存为 CSV');
      return;
    }
    reader.onload = function () { applyParsedImport(parseImportText(String(reader.result || ''))); };
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
    var ts = nowText();
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
      var target = findByClientKey(row.clientKey);
      if (!target) return;
      target.clickLink = row.clickLink;
      target.updatedAt = ts;
      updated += 1;
    });
    closeImportModal();
    renderTable();
    if (removedCount) UI.showToast('导入成功：已更新 ' + updated + ' 条，已移除失败数据 ' + removedCount + ' 条');
    else UI.showToast('导入成功：已更新 ' + updated + ' 条');
  }

  UI.$('importBtn').addEventListener('click', openImportModal);
  UI.$('importClose').addEventListener('click', closeImportModal);
  UI.$('importCancel').addEventListener('click', closeImportModal);
  UI.$('uploadBtn').addEventListener('click', function () { UI.$('importFile').click(); });
  UI.$('downloadTemplateBtn').addEventListener('click', downloadTemplate);
  UI.$('importFile').addEventListener('change', function () {
    var file = this.files && this.files[0];
    if (file) readImportFile(file);
    this.value = '';
  });
  UI.$('importSave').addEventListener('click', confirmImport);
  UI.$('importModal').addEventListener('click', function (e) {
    if (e.target === UI.$('importModal')) e.stopPropagation();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (UI.$('formModal').classList.contains('is-open')) closeForm();
    else if (UI.$('importModal').classList.contains('is-open')) closeImportModal();
  });

  renderTable();
})();
