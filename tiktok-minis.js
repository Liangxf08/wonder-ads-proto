/* 投放系统 · 资产 / TikTok / Mini 列表
 * 账户与广告账户页示例对齐。Mini 由后台同步，本页只查询。
 */
(function () {
  'use strict';

  var UI = window.ProductUI;
  if (!UI) return;

  var escapeHtml = UI.escapeHtml;
  var COPY_ICON = UI.COPY_ICON;

  var ACCOUNTS = [
    { id: '7341008810000001', name: 'IQS_TT_BV_TM_YHA' },
    { id: '7341008810000002', name: 'LB_TT_BV_TM_YHB' },
    { id: '7341008810000003', name: 'MYL_TT_BV_TM_YHC' },
    { id: '7341008810000004', name: 'RM_TT_BV_TM_YHD' },
    { id: '7341008810000005', name: 'MDL_TT_BV_TM_YHE' },
    { id: '7341008810000006', name: 'EM_TT_BV_TM_YHF' },
    { id: '7341008810000007', name: 'PF_TT_BV_TM_YHG' },
    { id: '7341008810000008', name: 'CM_TT_BV_TM_YHH' },
    { id: '7341008810000009', name: 'ITQ_TT_BV_TM_YHI' },
    { id: '7341008810000010', name: 'LC_TT_BV_TM_YHJ' }
  ];

  /* accountIndex, minis_name, minis_type, minis_status, region_codes */
  var SEED = [
    [0, 'IQ Seek', '小游戏', '已激活', 'ID,US,JP'],
    [0, 'Moonlit Vow', '短剧', '已激活', 'US,JP'],
    [1, 'Life Builder', '小游戏', '已激活', 'ID,TH,VN'],
    [1, 'Heir of the North', '短剧', '未激活', 'ID'],
    [2, 'Master Your Life', '小游戏', '已激活', 'BR,MX,US'],
    [2, 'Second Chance', '短剧', '已激活', 'US'],
    [3, 'Relax Mind', '小游戏', '已激活', 'KR,JP'],
    [3, 'Hidden Crown', '短剧', '已激活', 'JP,KR,TW'],
    [4, 'My Dream Life', '小游戏', '未激活', 'GB,DE,FR'],
    [4, 'After Midnight', '短剧', '已激活', 'US,GB'],
    [5, 'Easy Mind', '小游戏', '已激活', 'PH,MY,SG'],
    [5, 'Paper Rings', '短剧', '已激活', 'ID,MY,SG'],
    [6, 'Parking Fever', '小游戏', '已激活', 'ID,US,JP'],
    [6, 'Winter Letter', '短剧', '未激活', 'JP'],
    [7, 'Car Match', '小游戏', '已激活', 'US,BR,MX'],
    [7, 'The Last Heir', '短剧', '已激活', 'ID,US'],
    [8, 'Ink Trace Quest', '小游戏', '已激活', 'TW,JP,KR'],
    [8, 'Golden Hour', '短剧', '已激活', 'US,JP,KR'],
    [9, 'Life Creator', '小游戏', '已激活', 'ID,PH,VN'],
    [9, 'City Lights', '短剧', '已激活', 'US,GB,DE'],
    [0, 'Fun Overload', '小游戏', '已激活', 'ID,US,JP'],
    [2, 'Food Sort', '小游戏', '未激活', 'TH,VN'],
    [5, 'Word Dig', '小游戏', '已激活', 'JP,KR'],
    [7, 'Tile Stack', '小游戏', '已激活', 'ID,US,JP']
  ];

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function formatStamp(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' +
      pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  }

  var ID_CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';

  function sampleMiniId(i) {
    if (i === 0) return 's49faavlks93a2nt';
    var n = (0x5a17c3 + i * 104729) >>> 0;
    var id = '';
    var k;
    for (k = 0; k < 16; k += 1) {
      n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
      id += ID_CHARS[n % ID_CHARS.length];
    }
    if (id.charAt(0) >= '0' && id.charAt(0) <= '9') id = 's' + id.slice(1);
    return id;
  }

  function buildRows() {
    return SEED.map(function (item, i) {
      var account = ACCOUNTS[item[0]];
      var updated = new Date(2026, 10, 16, 18, 20, 0);
      updated.setHours(updated.getHours() - i * 7);
      return {
        advertiser_id: account.id,
        advertiser_name: account.name,
        minis_icon_url: '',
        minis_name: item[1],
        minis_id: sampleMiniId(i),
        minis_type: item[2],
        minis_status: item[3],
        region_codes: item[4],
        updated_at: formatStamp(updated)
      };
    });
  }

  var rows = buildRows();

  var draft = { type: '', status: '' };
  var applied = { account: '', mini: '', type: '', status: '' };
  var page = 1;
  var pageSize = 20;

  function includesText(value, keyword) {
    return String(value || '').toLowerCase().indexOf(keyword) !== -1;
  }

  function getFiltered() {
    var accountKw = applied.account.trim().toLowerCase();
    var miniKw = applied.mini.trim().toLowerCase();
    var list = rows.filter(function (row) {
      if (accountKw && !includesText(row.advertiser_name, accountKw) && !includesText(row.advertiser_id, accountKw)) return false;
      if (miniKw && !includesText(row.minis_name, miniKw) && !includesText(row.minis_id, miniKw)) return false;
      if (applied.type && row.minis_type !== applied.type) return false;
      if (applied.status && row.minis_status !== applied.status) return false;
      return true;
    });
    return list;
  }

  function idCell(value, title) {
    return (
      '<span class="cell-id cell-id--trail">' +
        '<span class="cell-id__text" title="' + escapeHtml(value) + '">' + escapeHtml(value) + '</span>' +
        '<button class="copy-btn" type="button" data-copy="' + escapeHtml(value) + '" title="' + escapeHtml(title) + '" aria-label="复制">' + COPY_ICON + '</button>' +
      '</span>'
    );
  }

  function nameCell(row) {
    var icon = row.minis_icon_url
      ? '<img class="mini-icon" src="' + escapeHtml(row.minis_icon_url) + '" alt="" />'
      : '<span class="mini-icon" aria-hidden="true"></span>';
    return (
      '<span class="mini-name">' +
        icon +
        '<span class="mini-name__text" title="' + escapeHtml(row.minis_name) + '">' + escapeHtml(row.minis_name) + '</span>' +
      '</span>'
    );
  }

  function statusTag(status) {
    var cls = status === '已激活' ? 'tag--enabled' : 'tag--ignored';
    return '<span class="tag ' + cls + '">' + escapeHtml(status) + '</span>';
  }

  function renderTable() {
    var list = getFiltered();
    var total = list.length;
    var totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
    if (page > totalPages) page = totalPages;
    var start = (page - 1) * pageSize;
    var pageRows = list.slice(start, start + pageSize);
    var tbody = UI.$('tableBody');
    var emptyTip = UI.$('emptyTip');

    if (!pageRows.length) {
      tbody.innerHTML = '';
      emptyTip.hidden = false;
    } else {
      emptyTip.hidden = true;
      tbody.innerHTML = pageRows.map(function (row) {
        return (
          '<tr>' +
            '<td><span class="cell-ellipsis" title="' + escapeHtml(row.advertiser_name) + '">' + escapeHtml(row.advertiser_name) + '</span></td>' +
            '<td>' + idCell(row.advertiser_id, '复制账户ID') + '</td>' +
            '<td>' + nameCell(row) + '</td>' +
            '<td>' + idCell(row.minis_id, '复制 Mini ID') + '</td>' +
            '<td>' + escapeHtml(row.minis_type) + '</td>' +
            '<td><span class="cell-ellipsis" title="' + escapeHtml(row.region_codes) + '">' + escapeHtml(row.region_codes) + '</span></td>' +
            '<td>' + statusTag(row.minis_status) + '</td>' +
            '<td title="' + escapeHtml(row.updated_at) + '">' + escapeHtml(row.updated_at) + '</td>' +
          '</tr>'
        );
      }).join('');
    }

    UI.renderPagination({
      containerId: 'pagination',
      total: total,
      page: page,
      pageSize: pageSize
    });
    if (window.ColResize) ColResize.refresh(UI.$('miniTable'));
  }

  var typeSelect = UI.bindSingleSelect({
    wrapId: 'typeWrap',
    triggerId: 'typeTrigger',
    panelId: 'typePanel',
    labelId: 'typeLabel',
    clearId: 'typeClear',
    prefix: '类型：',
    getValue: function () { return draft.type; },
    onChange: function (value) { draft.type = value || ''; }
  });

  var statusSelect = UI.bindSingleSelect({
    wrapId: 'statusWrap',
    triggerId: 'statusTrigger',
    panelId: 'statusPanel',
    labelId: 'statusLabel',
    clearId: 'statusClear',
    prefix: '状态：',
    getValue: function () { return draft.status; },
    onChange: function (value) { draft.status = value || ''; }
  });

  var accountClear = UI.bindInputClearable({ wrapId: 'accountKeywordWrap' });
  var miniClear = UI.bindInputClearable({ wrapId: 'miniKeywordWrap' });

  UI.bindPagination({
    containerId: 'pagination',
    getTotal: function () { return getFiltered().length; },
    getPage: function () { return page; },
    getPageSize: function () { return pageSize; },
    onPageChange: function (next) { page = next; renderTable(); },
    onPageSizeChange: function (size) { pageSize = size; page = 1; renderTable(); }
  });

  function doQuery() {
    applied.account = UI.$('accountKeyword').value || '';
    applied.mini = UI.$('miniKeyword').value || '';
    applied.type = draft.type;
    applied.status = draft.status;
    page = 1;
    renderTable();
  }

  function doReset() {
    UI.$('accountKeyword').value = '';
    UI.$('miniKeyword').value = '';
    draft.type = '';
    draft.status = '';
    applied.account = '';
    applied.mini = '';
    applied.type = '';
    applied.status = '';
    page = 1;
    if (accountClear) accountClear.sync();
    if (miniClear) miniClear.sync();
    if (typeSelect) typeSelect.syncLabel('');
    if (statusSelect) statusSelect.syncLabel('');
    renderTable();
  }

  UI.$('queryBtn').addEventListener('click', doQuery);
  UI.$('resetBtn').addEventListener('click', doReset);
  UI.$('accountKeyword').addEventListener('keydown', function (e) { if (e.key === 'Enter') doQuery(); });
  UI.$('miniKeyword').addEventListener('keydown', function (e) { if (e.key === 'Enter') doQuery(); });

  UI.$('tableBody').addEventListener('click', function (e) {
    var copyBtn = e.target.closest('[data-copy]');
    if (!copyBtn) return;
    UI.copyText(copyBtn.getAttribute('data-copy'));
  });

  renderTable();
})();
